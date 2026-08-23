import {
    COMPOSITE_BOSS_STAGE_SNAPSHOT_REVISION,
    CompositeBossEncounterRuntime,
    compositeInsideBounds,
    compositeLocalPoint,
    compositePoint,
    compositeWorldPoint,
    freezeComposite
} from "./CompositeBossEncounterRuntime.js";
import {
    BOSS05_CONTROL_ROLE,
    BOSS05_PULSE_REGION,
    BOSS05_RECOVERY_ROLE,
    BOSS_VULNERABILITY_TARGET_ID
} from "../boss-authoring/BossStageSpec.js";

export const CONTINUITY_CONTROL_STATE = Object.freeze({
    IDLE: "idle",
    WARNING: "warning",
    DESCENT: "descent",
    LOCKED: "locked",
    COUPLING_OPEN: "coupling-open",
    RISE: "rise",
    CORE_OPEN: "core-open",
    CONTROL_LOST: "control-lost"
});

const TARGET = Object.freeze({
    AUX_A: BOSS_VULNERABILITY_TARGET_ID.AUX_A_COUPLING,
    AUX_B: BOSS_VULNERABILITY_TARGET_ID.AUX_B_COUPLING,
    MAIN: BOSS_VULNERABILITY_TARGET_ID.MAIN_COUPLING,
    CORE: BOSS_VULNERABILITY_TARGET_ID.CONTINUITY_CORE
});
const TARGET_BY_PHASE = Object.freeze({ 1: TARGET.AUX_A, 2: TARGET.AUX_B, 3: TARGET.MAIN, 4: TARGET.CORE });
const WALL = Object.freeze({
    A: BOSS05_CONTROL_ROLE.AUX_A,
    B: BOSS05_CONTROL_ROLE.AUX_B,
    MAIN: BOSS05_CONTROL_ROLE.MAIN
});
const WALL_BY_PHASE = Object.freeze({ 1: WALL.A, 2: WALL.B, 3: WALL.MAIN });
const PULSE_VARIANTS = Object.freeze({
    2: Object.freeze([BOSS05_PULSE_REGION.INNER, BOSS05_PULSE_REGION.OUTER]),
    P3_A: Object.freeze([BOSS05_PULSE_REGION.LEFT, BOSS05_PULSE_REGION.RIGHT]),
    P3_B: Object.freeze([BOSS05_PULSE_REGION.UPPER, BOSS05_PULSE_REGION.LOWER])
});
const DEFAULT = Object.freeze({
    warningSeconds: 0.8,
    moveSeconds: 0.8,
    exposureSeconds: 4,
    pulseWarningSeconds: 0.55,
    pulseSeconds: 0.35,
    wallDamage: 20,
    pulseDamage: 25,
    targetRadius: 72
});
const OBJECT_KIND = Object.freeze({
    CORE: "boss-continuity-core",
    ACTUATOR: "boss-actuator",
    WALL: "boss-partition-wall",
    SHUTTER: "boss-slot-shutter",
    PULSE: "boss-control-pulse",
    COUPLING: "boss-weakpoint",
    EXIT: "boss-exit-hardpoint"
});

function positive(value, fallback) {
    return Number.isFinite(value) && value > 0 ? value : fallback;
}

function required(value, label) {
    if (!value) throw new Error(`Boss05 missing ${label}`);
    return value;
}

function boundsCenter(bounds) {
    return Object.freeze({ x: bounds.x + bounds.width * 0.5, y: bounds.y + bounds.height * 0.5 });
}

function freezeBounds(bounds) {
    return freezeComposite({ x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height });
}

export class ContinuityControlCoreRuntime extends CompositeBossEncounterRuntime {
    constructor(definition, snapshot = null) {
        super(definition);
        this.config = this.#configuration();
        this.scaledHealth = null;
        this.phase = 1;
        this.phaseHealth = [];
        this.walls = Object.create(null);
        this.state = CONTINUITY_CONTROL_STATE.IDLE;
        this.timer = 0;
        this.pulse = null;
        this.hazardSequence = 0;
        this.recoveries = Object.create(null);
        this.emergencyPending = false;
        this.activeWalls = Object.freeze([]);
        this.pendingPhase = null;
        this.resetAttempt({ preserveCompleted: false });
        if (snapshot) this.restore(snapshot);
    }

    #configuration() {
        const mechanicsByRole = Object.freeze(
            Object.fromEntries(
                (this.definition.arena.mechanics ?? [])
                    .filter(({ parameters }) => parameters?.role)
                    .map((mechanic) => [mechanic.parameters.role, mechanic])
            )
        );
        const wall = (role, targetId) => {
            const mechanic = required(mechanicsByRole[role], `wall mechanic ${role}`);
            const bounds = required(mechanic.bounds, `wall bounds ${role}`);
            return freezeComposite({
                id: role,
                targetId,
                actuatorPosition: freezeComposite(mechanic.position),
                bounds: freezeBounds(bounds),
                x: boundsCenter(bounds).x,
                width: bounds.width,
                ceilingY: bounds.y,
                lockY: bounds.y + bounds.height,
                warningSeconds: positive(mechanic.parameters.warningSeconds, DEFAULT.warningSeconds),
                moveSeconds: positive(mechanic.parameters.moveSeconds, DEFAULT.moveSeconds),
                exposureSeconds: positive(mechanic.parameters.exposureSeconds, DEFAULT.exposureSeconds),
                damage: positive(mechanic.parameters.damage, DEFAULT.wallDamage),
                slots: Object.freeze(
                    (mechanic.parameters.slots ?? []).map((slot) =>
                        freezeComposite({ id: slot.id, bounds: freezeBounds(slot.bounds) })
                    )
                )
            });
        };
        const wallById = Object.freeze({
            [WALL.A]: wall(WALL.A, TARGET.AUX_A),
            [WALL.B]: wall(WALL.B, TARGET.AUX_B),
            [WALL.MAIN]: wall(WALL.MAIN, TARGET.MAIN)
        });
        const coreMechanic = required(mechanicsByRole[BOSS05_CONTROL_ROLE.CORE], "core mechanic");
        const recoveryPointByRole = Object.freeze(
            Object.fromEntries(
                (this.definition.arena.recoveryPoints ?? [])
                    .filter(({ role }) => role)
                    .map((point) => [point.role, freezeComposite(point)])
            )
        );
        const pulseBounds = Object.freeze(
            Object.fromEntries(
                Object.entries(coreMechanic.parameters.pulseRegions ?? {}).map(([id, bounds]) => [
                    id,
                    freezeBounds(bounds)
                ])
            )
        );
        return freezeComposite({
            wallById,
            pulseBounds,
            recoveryPointByRole,
            corePosition: freezeComposite(this.definition.arena.boss.position),
            coreSize: freezeBounds(this.definition.arena.boss.collider),
            coreExposureSeconds: positive(coreMechanic.parameters.exposureSeconds, DEFAULT.exposureSeconds),
            pulseDamage: positive(wallById[WALL.MAIN].damage, DEFAULT.pulseDamage),
            targetPositionById: freezeComposite({
                [TARGET.AUX_A]: wallById[WALL.A].actuatorPosition,
                [TARGET.AUX_B]: wallById[WALL.B].actuatorPosition,
                [TARGET.MAIN]: wallById[WALL.MAIN].actuatorPosition,
                [TARGET.CORE]: this.definition.arena.boss.position
            })
        });
    }

    maximumHealth() {
        return this.scaledHealth?.maxHealth ?? 0;
    }
    totalHealth() {
        return this.phaseHealth.reduce((total, value) => total + value, 0);
    }

    resetAttempt({ preserveCompleted }) {
        const rosterCount = Math.max(1, this.scalingRoster.length || 1);
        this.scaledHealth = this.definition.scaledHealth(rosterCount);
        this.phaseHealth = this.scaledHealth.phaseHealths.map((health, index) =>
            preserveCompleted && index < this.phase - 1 ? 0 : health
        );
        this.phase = Math.max(
            1,
            this.phaseHealth.findIndex((health) => health > 0) + 1 || this.definition.phases.length
        );
        this.emergencyPending = this.phase === 3;
        this.activeWalls = Object.freeze([]);
        this.pendingPhase = null;
        this.state =
            this.phase >= 4 && this.phaseHealth[3] > 0
                ? CONTINUITY_CONTROL_STATE.CORE_OPEN
                : CONTINUITY_CONTROL_STATE.IDLE;
        this.timer = this.state === CONTINUITY_CONTROL_STATE.CORE_OPEN ? this.config.coreExposureSeconds : 0;
        this.pulse = null;
        this.hazardSequence = 0;
        this.walls = Object.create(null);
        for (const wall of Object.values(WALL)) {
            const configuration = this.config.wallById[wall];
            this.walls[wall] = { id: wall, state: "stored", y: configuration.ceilingY, shutter: "closed" };
        }
        for (const playerId of this.scalingRoster) {
            this.recoveries[playerId] = {
                active: false,
                reason: null,
                targetCell: this.phase <= 2 ? "entry" : "main",
                protection: false
            };
        }
    }

    #targetId() {
        return TARGET_BY_PHASE[this.phase] ?? TARGET.CORE;
    }
    #currentWall() {
        return WALL_BY_PHASE[this.phase] ?? null;
    }
    #activeWallMoveSeconds() {
        return Math.max(...this.activeWalls.map((id) => this.config.wallById[id].moveSeconds));
    }
    #zoneForPhase() {
        const phaseId = this.definition.phases[this.phase - 1]?.id;
        return this.definition.arena.phaseZones?.find(({ phaseId: value }) => value === phaseId)?.bounds ?? null;
    }
    #localPlayers(context) {
        const offset = context.worldOffset ?? { x: 0, y: 0 };
        return (context.players ?? [])
            .map((player) => ({
                id: player.id ?? player.playerId,
                position: compositeLocalPoint(player.physics?.position ?? player.position, offset)
            }))
            .filter(
                ({ id, position }) =>
                    typeof id === "string" && Number.isFinite(position.x) && Number.isFinite(position.y)
            );
    }
    #playersInPhase(players) {
        const zone = this.#zoneForPhase();
        return players.filter(({ position }) => compositeInsideBounds(position, zone));
    }
    #pulseBounds() {
        return this.config.pulseBounds[this.pulse?.variant] ?? null;
    }
    #startCycle() {
        const wall = this.#currentWall();
        if (!wall) return;
        this.activeWalls = Object.freeze(this.phase === 3 && this.emergencyPending ? [WALL.A, WALL.B] : [wall]);
        for (const activeWall of this.activeWalls) {
            this.walls[activeWall].state = "warning";
            this.walls[activeWall].shutter = "warning";
        }
        this.state = CONTINUITY_CONTROL_STATE.WARNING;
        this.timer = Math.max(...this.activeWalls.map((id) => this.config.wallById[id].warningSeconds));
        this.emit("boss-control-signal", { phase: this.phase, walls: this.activeWalls, targetId: this.#targetId() });
        this.emit("boss-attack-telegraphed", { phase: this.phase, kind: "partition-wall", walls: this.activeWalls });
    }
    #startPulse() {
        const variants =
            this.phase === 2
                ? PULSE_VARIANTS[2]
                : this.phase === 3
                  ? this.emergencyPending
                      ? PULSE_VARIANTS.P3_A
                      : PULSE_VARIANTS.P3_B
                  : Object.freeze([]);
        const variant = variants[this.hazardSequence % variants.length] ?? null;
        if (!variant) return;
        this.pulse = { state: "warning", variant };
        this.hazardSequence += 1;
        this.emit("boss-attack-telegraphed", { phase: this.phase, kind: "control-pulse", variant });
    }
    #advanceCore(dt, players) {
        if (this.state === CONTINUITY_CONTROL_STATE.CORE_OPEN) {
            this.timer -= dt;
            if (this.timer <= 0 && this.phaseHealth[3] > 0) this.timer = this.config.coreExposureSeconds;
            return;
        }
        if (this.state === CONTINUITY_CONTROL_STATE.IDLE) {
            if (this.#playersInPhase(players).length > 0) this.#startCycle();
            return;
        }
        this.timer -= dt;
        const wall = this.#currentWall();
        if (this.state === CONTINUITY_CONTROL_STATE.WARNING && this.timer <= 0) {
            this.state = CONTINUITY_CONTROL_STATE.DESCENT;
            this.timer = Math.max(...this.activeWalls.map((id) => this.config.wallById[id].moveSeconds));
            for (const activeWall of this.activeWalls) {
                this.walls[activeWall].state = "descending";
                this.walls[activeWall].shutter = "open";
            }
            this.#startPulse();
            return;
        }
        if (this.state === CONTINUITY_CONTROL_STATE.DESCENT) {
            const progress = Math.max(0, 1 - this.timer / this.#activeWallMoveSeconds());
            for (const activeWall of this.activeWalls) {
                const configuration = this.config.wallById[activeWall];
                this.walls[activeWall].y =
                    configuration.ceilingY + (configuration.lockY - configuration.ceilingY) * progress;
            }
            if (this.timer <= 0) {
                this.state = CONTINUITY_CONTROL_STATE.LOCKED;
                for (const activeWall of this.activeWalls) {
                    this.walls[activeWall].state = "locked";
                    this.walls[activeWall].y = this.config.wallById[activeWall].lockY;
                }
                if (this.pulse) {
                    this.timer = DEFAULT.pulseWarningSeconds + DEFAULT.pulseSeconds;
                    this.pulse.state = "active";
                    this.emit("boss-attack-started", {
                        phase: this.phase,
                        kind: "control-pulse",
                        sequence: this.hazardSequence
                    });
                } else {
                    this.state = CONTINUITY_CONTROL_STATE.COUPLING_OPEN;
                    this.timer = this.config.wallById[wall].exposureSeconds;
                    this.emit("boss-weakpoint-opened", { phase: this.phase, targetId: this.#targetId() });
                }
            }
            return;
        }
        if (this.state === CONTINUITY_CONTROL_STATE.LOCKED && this.timer <= 0) {
            this.pulse = null;
            if (this.phase === 3 && this.emergencyPending) {
                this.emergencyPending = false;
                this.state = CONTINUITY_CONTROL_STATE.RISE;
                this.timer = Math.max(...this.activeWalls.map((id) => this.config.wallById[id].moveSeconds));
                for (const activeWall of this.activeWalls) this.walls[activeWall].state = "rising";
            } else {
                this.state = CONTINUITY_CONTROL_STATE.COUPLING_OPEN;
                this.timer = this.config.wallById[wall].exposureSeconds;
                this.emit("boss-weakpoint-opened", { phase: this.phase, targetId: this.#targetId() });
            }
            return;
        }
        if (this.state === CONTINUITY_CONTROL_STATE.COUPLING_OPEN && this.timer <= 0) {
            this.state = CONTINUITY_CONTROL_STATE.RISE;
            this.timer = Math.max(...this.activeWalls.map((id) => this.config.wallById[id].moveSeconds));
            for (const activeWall of this.activeWalls) this.walls[activeWall].state = "rising";
            this.emit("boss-weakpoint-closed", { phase: this.phase, targetId: this.#targetId() });
            return;
        }
        if (this.state === CONTINUITY_CONTROL_STATE.RISE) {
            const progress = Math.max(0, 1 - this.timer / this.#activeWallMoveSeconds());
            for (const activeWall of this.activeWalls) {
                const configuration = this.config.wallById[activeWall];
                this.walls[activeWall].y =
                    configuration.lockY + (configuration.ceilingY - configuration.lockY) * progress;
            }
            if (this.timer <= 0) {
                for (const activeWall of this.activeWalls) {
                    this.walls[activeWall] = {
                        ...this.walls[activeWall],
                        state: "stored",
                        y: this.config.wallById[activeWall].ceilingY,
                        shutter: "closed"
                    };
                }
                this.activeWalls = Object.freeze([]);
                if (this.pendingPhase !== null) {
                    this.phase = this.pendingPhase;
                    this.pendingPhase = null;
                    this.emergencyPending = this.phase === 3;
                    this.state = this.phase === 4 ? CONTINUITY_CONTROL_STATE.CORE_OPEN : CONTINUITY_CONTROL_STATE.IDLE;
                    this.timer = this.phase === 4 ? this.config.coreExposureSeconds : 0;
                } else this.state = CONTINUITY_CONTROL_STATE.IDLE;
            }
        }
    }
    advance(dt, context = {}) {
        if (this.status !== "active" || !Number.isFinite(dt) || dt <= 0)
            return freezeComposite({ accepted: this.status === "active", changed: false });
        const players = this.#localPlayers(context);
        const zone = this.#zoneForPhase();
        for (const player of players) {
            const recovery = this.recoveries[player.id];
            if (!recovery?.active || !compositeInsideBounds(player.position, zone)) continue;
            this.recoveries[player.id] = { ...recovery, active: false, protection: false };
            this.emit("boss-player-recovery-completed", { playerId: player.id, targetCell: recovery.targetCell });
        }
        this.#advanceCore(dt, players);
        return freezeComposite({ accepted: true, changed: true });
    }
    #advancePhase() {
        this.phaseHealth[this.phase - 1] = 0;
        if (this.phase === 4) {
            this.status = "completed";
            this.state = CONTINUITY_CONTROL_STATE.CONTROL_LOST;
            this.emit("boss-encounter-completed", { phase: this.phase, targetId: TARGET.CORE });
            return true;
        }
        this.pendingPhase = this.phase + 1;
        this.pulse = null;
        this.state = CONTINUITY_CONTROL_STATE.RISE;
        this.timer = Math.max(...this.activeWalls.map((id) => this.config.wallById[id].moveSeconds));
        for (const activeWall of this.activeWalls) this.walls[activeWall].state = "rising";
        this.emit("boss-phase-completed", { completedPhase: this.phase, nextPhase: this.pendingPhase });
        return false;
    }
    applyImpact({ impactId, sourcePlayerId = null, baseDamage, targetId = null }) {
        if (this.status !== "active")
            return freezeComposite({
                accepted: false,
                changed: false,
                reason: "encounter-not-active",
                appliedDamage: 0
            });
        if (sourcePlayerId && this.participants.get(sourcePlayerId) !== "active")
            return freezeComposite({
                accepted: false,
                changed: false,
                reason: "participant-not-active",
                appliedDamage: 0
            });
        if (typeof impactId !== "string" || !Number.isFinite(baseDamage) || baseDamage < 0)
            throw new Error("Boss05 impact is invalid");
        if (this.processedImpactIds.has(impactId))
            return freezeComposite({
                accepted: true,
                changed: false,
                reason: "impact-already-processed",
                appliedDamage: 0
            });
        this.processedImpactIds.add(impactId);
        const currentTarget = this.#targetId();
        const exposed =
            this.phase === 4
                ? this.state === CONTINUITY_CONTROL_STATE.CORE_OPEN
                : this.state === CONTINUITY_CONTROL_STATE.COUPLING_OPEN;
        if (targetId !== currentTarget || !exposed)
            return freezeComposite({ accepted: true, changed: false, reason: "target-secured", appliedDamage: 0 });
        const index = this.phase - 1;
        const appliedDamage = Math.min(
            this.phaseHealth[index],
            baseDamage * this.definition.weakNormalDamageMultiplier
        );
        this.phaseHealth[index] -= appliedDamage;
        if (appliedDamage > 0)
            this.emit("boss-damaged", {
                impactId,
                sourcePlayerId,
                targetId,
                phase: this.phase,
                damage: appliedDamage,
                health: this.totalHealth()
            });
        const completed = this.phaseHealth[index] <= 0 ? this.#advancePhase() : false;
        return freezeComposite({
            accepted: true,
            changed: appliedDamage > 0,
            appliedDamage,
            normalDamage: appliedDamage,
            weakpointHit: true,
            completed
        });
    }
    applyDamage({ sourcePlayerId = null, damage, impactId = null, targetId = null }) {
        return this.applyImpact({
            impactId: impactId ?? `${this.definition.id}:impact:${this.eventSequence + 1}`,
            sourcePlayerId,
            baseDamage: damage,
            targetId: targetId ?? this.#targetId()
        });
    }
    impactTargetSnapshot(targetId, worldOffset) {
        const currentTarget = this.#targetId();
        const exposed =
            this.phase === 4
                ? this.state === CONTINUITY_CONTROL_STATE.CORE_OPEN
                : this.state === CONTINUITY_CONTROL_STATE.COUPLING_OPEN;
        const index = Object.values(TARGET).indexOf(targetId);
        const healthIndex = index < 0 ? 0 : index;
        return freezeComposite({
            id: targetId,
            impactTargetKind: "boss",
            active: this.status === "active" && targetId === currentTarget && exposed,
            position: compositeWorldPoint(
                this.config.targetPositionById[targetId] ?? this.config.corePosition,
                worldOffset
            ),
            radius: DEFAULT.targetRadius,
            health: this.phaseHealth[healthIndex] ?? 0,
            maxHealth: this.scaledHealth.phaseHealths[healthIndex] ?? 0,
            phase: this.phase,
            phaseCount: 4,
            weakpointExposed: targetId === currentTarget && exposed,
            normalDamageMultiplier: targetId === currentTarget ? this.definition.weakNormalDamageMultiplier : 0,
            weakpointDamageRatio: 0
        });
    }
    presentationObjects(worldOffset = { x: 0, y: 0 }) {
        const objects = [
            {
                id: "boss-05:continuity-core",
                kind: OBJECT_KIND.CORE,
                variant: "continuity-core",
                position: compositeWorldPoint(this.config.corePosition, worldOffset),
                size: { width: this.config.coreSize.width, height: this.config.coreSize.height },
                state:
                    this.state === CONTINUITY_CONTROL_STATE.CONTROL_LOST
                        ? "disabled"
                        : this.phase === 4
                          ? "open"
                          : `shell-${Math.max(0, this.phase - 1)}`,
                active: true,
                ropeAttachable: true
            }
        ];
        for (const wall of Object.values(WALL)) {
            const configuration = this.config.wallById[wall];
            const state = this.walls[wall];
            objects.push({
                id: `boss-05:${wall}:actuator`,
                kind: OBJECT_KIND.ACTUATOR,
                variant: wall,
                position: compositeWorldPoint(configuration.actuatorPosition, worldOffset),
                size: { width: 180, height: 180 },
                state: this.#currentWall() === wall ? this.state : "idle",
                active: true
            });
            objects.push({
                id: `boss-05:${wall}:wall`,
                kind: OBJECT_KIND.WALL,
                variant: wall,
                position: compositeWorldPoint({ x: configuration.x, y: state.y }, worldOffset),
                size: { width: configuration.width, height: Math.max(1, configuration.lockY - state.y) },
                state: state.state,
                active: state.state !== "stored",
                ropeAttachable: state.state !== "stored"
            });
            for (const slot of configuration.slots) {
                objects.push({
                    id: `boss-05:${wall}:shutter:${slot.id}`,
                    kind: OBJECT_KIND.SHUTTER,
                    variant: wall,
                    position: compositeWorldPoint(boundsCenter(slot.bounds), worldOffset),
                    size: { width: slot.bounds.width, height: slot.bounds.height },
                    state: state.shutter,
                    active: true
                });
            }
        }
        for (const targetId of Object.values(TARGET)) {
            const active =
                targetId === this.#targetId() &&
                (this.phase === 4
                    ? this.state === CONTINUITY_CONTROL_STATE.CORE_OPEN
                    : this.state === CONTINUITY_CONTROL_STATE.COUPLING_OPEN);
            objects.push({
                id: targetId,
                kind: OBJECT_KIND.COUPLING,
                variant:
                    targetId === TARGET.CORE
                        ? "continuity-core"
                        : targetId === TARGET.MAIN
                          ? "main-coupling"
                          : "aux-coupling",
                position: compositeWorldPoint(this.config.targetPositionById[targetId], worldOffset),
                size: { width: 112, height: 112 },
                state: active ? "exposed" : "secured",
                active: true
            });
        }
        if (this.pulse) {
            const bounds = this.#pulseBounds();
            if (!bounds) return Object.freeze(objects.map((object) => freezeComposite(object)));
            objects.push({
                id: "boss-05:control-pulse",
                kind: OBJECT_KIND.PULSE,
                variant: this.pulse.variant,
                position: compositeWorldPoint(
                    { x: bounds.x + bounds.width * 0.5, y: bounds.y + bounds.height * 0.5 },
                    worldOffset
                ),
                size: { width: bounds.width, height: bounds.height },
                state: this.pulse.state,
                active: true
            });
        }
        for (const [index, point] of [
            { x: 2600, y: -400 },
            { x: 2600, y: -180 }
        ].entries())
            objects.push({
                id: `boss-05:exit-${index + 1}`,
                kind: OBJECT_KIND.EXIT,
                variant: "exit",
                position: compositeWorldPoint(point, worldOffset),
                size: { width: 90, height: 90 },
                state: this.status === "completed" ? "active" : "inactive",
                active: true
            });
        return Object.freeze(objects.map((object) => freezeComposite(object)));
    }
    activeHazards(worldOffset = { x: 0, y: 0 }) {
        const hazards = [];
        if (this.pulse?.state === "active") {
            const bounds = this.#pulseBounds();
            if (!bounds) return Object.freeze([]);
            hazards.push({
                id: `${this.definition.id}:pulse:${this.hazardSequence}`,
                kind: "control-pulse",
                sequence: this.hazardSequence,
                bounds: freezeBounds({
                    x: bounds.x + worldOffset.x,
                    y: bounds.y + worldOffset.y,
                    width: bounds.width,
                    height: bounds.height
                }),
                damage: this.config.pulseDamage
            });
        }
        for (const wall of this.activeWalls) {
            if (this.walls[wall].state !== "descending") continue;
            hazards.push({
                id: `${this.definition.id}:wall:${wall}:${this.hazardSequence}`,
                kind: "partition-wall",
                sequence: this.hazardSequence,
                bounds: freezeBounds({
                    x: this.config.wallById[wall].x - this.config.wallById[wall].width * 0.5 + worldOffset.x,
                    y: this.walls[wall].y + worldOffset.y,
                    width: this.config.wallById[wall].width,
                    height: Math.max(1, this.config.wallById[wall].lockY - this.walls[wall].y)
                }),
                damage: this.config.wallById[wall].damage
            });
        }
        return Object.freeze(hazards.map((hazard) => freezeComposite(hazard)));
    }
    dynamicCollisionSurfaces(worldOffset = { x: 0, y: 0 }) {
        const surfaces = [];
        for (const [wall, state] of Object.entries(this.walls)) {
            const configuration = this.config.wallById[wall];
            if (state.state === "stored") {
                for (const slot of configuration.slots) {
                    const bounds = slot.bounds;
                    surfaces.push(
                        freezeComposite({
                            id: `${this.definition.id}:shutter:${wall}:${slot.id}`,
                            kind: "slot-shutter",
                            x: bounds.x + worldOffset.x,
                            y: bounds.y + worldOffset.y,
                            width: bounds.width,
                            height: bounds.height,
                            topY: bounds.y + worldOffset.y,
                            position: { x: bounds.x + bounds.width * 0.5 + worldOffset.x, y: bounds.y + worldOffset.y },
                            vertices: [
                                { x: bounds.x + worldOffset.x, y: bounds.y + worldOffset.y },
                                { x: bounds.x + bounds.width + worldOffset.x, y: bounds.y + worldOffset.y },
                                {
                                    x: bounds.x + bounds.width + worldOffset.x,
                                    y: bounds.y + bounds.height + worldOffset.y
                                },
                                { x: bounds.x + worldOffset.x, y: bounds.y + bounds.height + worldOffset.y }
                            ],
                            oneWay: true,
                            grappleable: true,
                            ropeOccluder: false,
                            projectileOccluder: false,
                            state: state.shutter
                        })
                    );
                }
                continue;
            }
            const bounds = {
                x: configuration.x - configuration.width * 0.5 + worldOffset.x,
                y: state.y + worldOffset.y,
                width: configuration.width,
                height: Math.max(1, configuration.lockY - state.y)
            };
            surfaces.push(
                freezeComposite({
                    id: `${this.definition.id}:partition:${wall}`,
                    kind: "partition-wall",
                    x: bounds.x,
                    y: bounds.y,
                    width: bounds.width,
                    height: bounds.height,
                    topY: bounds.y,
                    position: { x: bounds.x + bounds.width * 0.5, y: bounds.y },
                    vertices: [
                        { x: bounds.x, y: bounds.y },
                        { x: bounds.x + bounds.width, y: bounds.y },
                        { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
                        { x: bounds.x, y: bounds.y + bounds.height }
                    ],
                    oneWay: false,
                    grappleable: false,
                    ropeOccluder: true,
                    projectileOccluder: true,
                    state: state.state
                })
            );
        }
        return Object.freeze(surfaces);
    }
    ropeCutSurfaces(worldOffset = { x: 0, y: 0 }) {
        return Object.freeze(this.dynamicCollisionSurfaces(worldOffset).filter(({ state }) => state === "descending"));
    }
    ropeAttachmentActors() {
        return Object.freeze([]);
    }
    collisionActors() {
        return Object.freeze([]);
    }
    recoveryProtected(playerId) {
        return this.recoveries[playerId]?.protection === true;
    }
    recoverPlayer(playerId, worldOffset = { x: 0, y: 0 }, playerPosition = null) {
        if (this.status !== "active" || typeof playerId !== "string") return null;
        const localPosition = playerPosition ? compositeLocalPoint(playerPosition, worldOffset) : null;
        const targetCell =
            this.phase <= 2
                ? BOSS05_RECOVERY_ROLE.ENTRY
                : this.phase === 3 && !this.emergencyPending
                  ? localPosition?.x < this.config.wallById[WALL.MAIN].x
                      ? BOSS05_RECOVERY_ROLE.MAIN_LEFT
                      : BOSS05_RECOVERY_ROLE.MAIN_RIGHT
                  : BOSS05_RECOVERY_ROLE.MAIN;
        const point = required(this.config.recoveryPointByRole[targetCell], `recovery point ${targetCell}`);
        this.recoveries[playerId] = { active: true, reason: "void-fall", targetCell, protection: true };
        this.emit("boss-player-recovered", { playerId, reason: "void-fall", targetCell });
        return compositeWorldPoint(point, worldOffset);
    }
    respawnPosition(worldOffset = { x: 0, y: 0 }) {
        const role = this.phase <= 2 ? BOSS05_RECOVERY_ROLE.ENTRY : BOSS05_RECOVERY_ROLE.MAIN;
        return compositeWorldPoint(
            required(this.config.recoveryPointByRole[role], `recovery point ${role}`),
            worldOffset
        );
    }
    snapshot() {
        const targetId = this.#targetId();
        const exposed =
            this.phase === 4
                ? this.state === CONTINUITY_CONTROL_STATE.CORE_OPEN
                : this.state === CONTINUITY_CONTROL_STATE.COUPLING_OPEN;
        return this.baseSnapshot({
            phase: this.phase,
            phaseHealths: this.scaledHealth.phaseHealths,
            phaseFloors: [],
            currentTargetId: targetId,
            currentObjective: this.definition.phases[this.phase - 1]?.objective,
            vulnerability: { active: exposed, targetId, remainingSeconds: exposed ? this.timer : 0 },
            mechanism: { state: this.state, hazardSequence: this.hazardSequence, weakpointExposed: exposed },
            wallStates: freezeComposite(this.walls),
            pulse: freezeComposite(this.pulse),
            phaseHealth: Object.freeze([...this.phaseHealth]),
            recoveryStates: freezeComposite(this.recoveries),
            emergencyPending: this.emergencyPending,
            activeWalls: this.activeWalls,
            pendingPhase: this.pendingPhase
        });
    }
    restore(snapshot) {
        this.restoreBase(snapshot);
        if (snapshot.snapshotRevision !== COMPOSITE_BOSS_STAGE_SNAPSHOT_REVISION)
            throw new Error("Boss05 snapshot revision mismatch");
        this.scaledHealth = this.definition.scaledHealth(Math.max(1, this.scalingRoster.length || 1));
        this.phase = snapshot.phase;
        this.phaseHealth = [...snapshot.phaseHealth];
        this.walls = Object.assign(Object.create(null), snapshot.wallStates);
        this.state = snapshot.mechanism?.state ?? CONTINUITY_CONTROL_STATE.IDLE;
        this.timer = snapshot.vulnerability?.remainingSeconds ?? 0;
        this.pulse = snapshot.pulse ?? null;
        this.hazardSequence = snapshot.mechanism?.hazardSequence ?? 0;
        this.recoveries = Object.assign(Object.create(null), snapshot.recoveryStates);
        this.emergencyPending = snapshot.emergencyPending === true;
        this.activeWalls = Object.freeze([...(snapshot.activeWalls ?? [])]);
        this.pendingPhase = Number.isSafeInteger(snapshot.pendingPhase) ? snapshot.pendingPhase : null;
        return this;
    }
}
