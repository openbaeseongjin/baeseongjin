import {
    COMPOSITE_BOSS_STAGE_SNAPSHOT_REVISION,
    CompositeBossEncounterRuntime,
    compositeInsideBounds,
    compositeLocalPoint,
    compositePoint,
    compositeWorldPoint,
    freezeComposite
} from "./CompositeBossEncounterRuntime.js";
import { ropeAttachmentSnapshot } from "../rope/RopeAttachableMixin.js";

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
    AUX_A: "boss-05:aux-a:coupling",
    AUX_B: "boss-05:aux-b:coupling",
    MAIN: "boss-05:main:coupling",
    CORE: "boss-05:continuity-core"
});
const TARGET_BY_PHASE = Object.freeze({ 1: TARGET.AUX_A, 2: TARGET.AUX_B, 3: TARGET.MAIN, 4: TARGET.CORE });
const WALL = Object.freeze({ A: "a", B: "b", MAIN: "main" });
const WALL_BY_PHASE = Object.freeze({ 1: WALL.A, 2: WALL.B, 3: WALL.MAIN });
const WALL_X = Object.freeze({ [WALL.A]: 2110, [WALL.B]: 3160, [WALL.MAIN]: 2600 });
const WALL_WIDTH = 180;
const WALL_CEILING_Y = -2460;
const WALL_LOCK_Y = -1280;
const CORE_POSITION = Object.freeze({ x: 2600, y: -450 });
const COUPLING_POSITION = Object.freeze({
    [TARGET.AUX_A]: Object.freeze({ x: 1800, y: -1180 }),
    [TARGET.AUX_B]: Object.freeze({ x: 3400, y: -1180 }),
    [TARGET.MAIN]: Object.freeze({ x: 2600, y: -980 }),
    [TARGET.CORE]: CORE_POSITION
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
        const parameters = (this.definition.arena.mechanics ?? []).map(({ parameters: value }) => value ?? {});
        const wallParameters = parameters.find(({ role }) => role === "aux-a") ?? {};
        const mainParameters = parameters.find(({ role }) => role === "main") ?? {};
        const coreParameters = parameters.find(({ role }) => role === "core") ?? {};
        return freezeComposite({
            warningSeconds: positive(wallParameters.warningSeconds, DEFAULT.warningSeconds),
            moveSeconds: positive(wallParameters.moveSeconds, DEFAULT.moveSeconds),
            exposureSeconds: positive(wallParameters.exposureSeconds, DEFAULT.exposureSeconds),
            mainExposureSeconds: positive(mainParameters.exposureSeconds, DEFAULT.exposureSeconds),
            coreExposureSeconds: positive(coreParameters.exposureSeconds, DEFAULT.exposureSeconds),
            wallDamage: positive(wallParameters.damage, DEFAULT.wallDamage),
            pulseDamage: positive(mainParameters.damage, DEFAULT.pulseDamage)
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
        for (const wall of Object.values(WALL))
            this.walls[wall] = { id: wall, state: "stored", y: WALL_CEILING_Y, shutter: "closed" };
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
        if (this.phase === 2)
            return this.pulse?.variant === "inner"
                ? { x: 2200, y: -2000, width: 800, height: 1450 }
                : { x: 900, y: -2440, width: 3400, height: 500 };
        if (this.phase === 3)
            return this.pulse?.variant === "left"
                ? { x: 2100, y: -2100, width: 500, height: 1400 }
                : { x: 2600, y: -2100, width: 500, height: 1400 };
        return { x: 2100, y: -1700, width: 1000, height: 420 };
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
        this.timer = this.config.warningSeconds;
        this.emit("boss-control-signal", { phase: this.phase, walls: this.activeWalls, targetId: this.#targetId() });
        this.emit("boss-attack-telegraphed", { phase: this.phase, kind: "partition-wall", walls: this.activeWalls });
    }
    #startPulse() {
        const variant =
            this.phase === 2
                ? this.hazardSequence % 2 === 0
                    ? "inner"
                    : "outer"
                : this.phase === 3
                  ? this.hazardSequence % 2 === 0
                      ? "left"
                      : "right"
                  : "none";
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
            this.timer = this.config.moveSeconds;
            for (const activeWall of this.activeWalls) {
                this.walls[activeWall].state = "descending";
                this.walls[activeWall].shutter = "open";
            }
            this.#startPulse();
            return;
        }
        if (this.state === CONTINUITY_CONTROL_STATE.DESCENT) {
            const progress = Math.max(0, 1 - this.timer / this.config.moveSeconds);
            for (const activeWall of this.activeWalls) {
                this.walls[activeWall].y = WALL_CEILING_Y + (WALL_LOCK_Y - WALL_CEILING_Y) * progress;
            }
            if (this.timer <= 0) {
                this.state = CONTINUITY_CONTROL_STATE.LOCKED;
                for (const activeWall of this.activeWalls) {
                    this.walls[activeWall].state = "locked";
                    this.walls[activeWall].y = WALL_LOCK_Y;
                }
                this.timer = DEFAULT.pulseWarningSeconds + DEFAULT.pulseSeconds;
                this.pulse.state = "active";
                this.emit("boss-attack-started", {
                    phase: this.phase,
                    kind: "control-pulse",
                    sequence: this.hazardSequence
                });
            }
            return;
        }
        if (this.state === CONTINUITY_CONTROL_STATE.LOCKED && this.timer <= 0) {
            this.pulse = null;
            if (this.phase === 3 && this.emergencyPending) {
                this.emergencyPending = false;
                this.state = CONTINUITY_CONTROL_STATE.RISE;
                this.timer = this.config.moveSeconds;
                for (const activeWall of this.activeWalls) this.walls[activeWall].state = "rising";
            } else {
                this.state = CONTINUITY_CONTROL_STATE.COUPLING_OPEN;
                this.timer = this.phase === 3 ? this.config.mainExposureSeconds : this.config.exposureSeconds;
                this.emit("boss-weakpoint-opened", { phase: this.phase, targetId: this.#targetId() });
            }
            return;
        }
        if (this.state === CONTINUITY_CONTROL_STATE.COUPLING_OPEN && this.timer <= 0) {
            this.state = CONTINUITY_CONTROL_STATE.RISE;
            this.timer = this.config.moveSeconds;
            for (const activeWall of this.activeWalls) this.walls[activeWall].state = "rising";
            this.emit("boss-weakpoint-closed", { phase: this.phase, targetId: this.#targetId() });
            return;
        }
        if (this.state === CONTINUITY_CONTROL_STATE.RISE) {
            const progress = Math.max(0, 1 - this.timer / this.config.moveSeconds);
            for (const activeWall of this.activeWalls) {
                this.walls[activeWall].y = WALL_LOCK_Y + (WALL_CEILING_Y - WALL_LOCK_Y) * progress;
            }
            if (this.timer <= 0) {
                for (const activeWall of this.activeWalls) {
                    this.walls[activeWall] = {
                        ...this.walls[activeWall],
                        state: "stored",
                        y: WALL_CEILING_Y,
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
        this.#advanceCore(dt, this.#localPlayers(context));
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
        this.timer = this.config.moveSeconds;
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
            position: compositeWorldPoint(COUPLING_POSITION[targetId] ?? CORE_POSITION, worldOffset),
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
                position: compositeWorldPoint(CORE_POSITION, worldOffset),
                size: { width: 320, height: 300 },
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
        for (const [wall, x] of Object.entries(WALL_X)) {
            const state = this.walls[wall];
            objects.push({
                id: `boss-05:${wall}:actuator`,
                kind: OBJECT_KIND.ACTUATOR,
                variant: wall,
                position: compositeWorldPoint({ x, y: -1180 }, worldOffset),
                size: { width: 180, height: 180 },
                state: this.#currentWall() === wall ? this.state : "idle",
                active: true
            });
            objects.push({
                id: `boss-05:${wall}:wall`,
                kind: OBJECT_KIND.WALL,
                variant: wall,
                position: compositeWorldPoint({ x, y: state.y }, worldOffset),
                size: { width: WALL_WIDTH, height: Math.max(1, WALL_LOCK_Y - state.y) },
                state: state.state,
                active: state.state !== "stored",
                ropeAttachable: state.state !== "stored"
            });
            objects.push({
                id: `boss-05:${wall}:shutter`,
                kind: OBJECT_KIND.SHUTTER,
                variant: wall,
                position: compositeWorldPoint({ x, y: -1240 }, worldOffset),
                size: { width: 220, height: 80 },
                state: state.shutter,
                active: true
            });
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
                position: compositeWorldPoint(COUPLING_POSITION[targetId], worldOffset),
                size: { width: 112, height: 112 },
                state: active ? "exposed" : "secured",
                active: true
            });
        }
        if (this.pulse) {
            const bounds = this.#pulseBounds();
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
                    x: WALL_X[wall] - WALL_WIDTH * 0.5 + worldOffset.x,
                    y: this.walls[wall].y + worldOffset.y,
                    width: WALL_WIDTH,
                    height: Math.max(1, WALL_LOCK_Y - this.walls[wall].y)
                }),
                damage: this.config.wallDamage
            });
        }
        return Object.freeze(hazards.map((hazard) => freezeComposite(hazard)));
    }
    dynamicCollisionSurfaces(worldOffset = { x: 0, y: 0 }) {
        const surfaces = [];
        for (const [wall, state] of Object.entries(this.walls)) {
            if (state.state === "stored") continue;
            const bounds = {
                x: WALL_X[wall] - WALL_WIDTH * 0.5 + worldOffset.x,
                y: state.y + worldOffset.y,
                width: WALL_WIDTH,
                height: Math.max(1, WALL_LOCK_Y - state.y)
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
    ropeAttachmentActors(worldOffset = { x: 0, y: 0 }) {
        const actors = [
            Object.freeze({
                id: "boss-05:continuity-core",
                ropeAttachment: ropeAttachmentSnapshot({
                    ownerId: "boss-05:continuity-core",
                    position: CORE_POSITION,
                    worldOffset
                })
            })
        ];
        for (const [wall, state] of Object.entries(this.walls)) {
            if (state.state === "stored") continue;
            const ownerId = `${this.definition.id}:partition:${wall}`;
            actors.push(
                Object.freeze({
                    id: ownerId,
                    ropeAttachment: ropeAttachmentSnapshot({
                        ownerId,
                        position: { x: WALL_X[wall], y: state.y + (WALL_LOCK_Y - state.y) * 0.5 },
                        worldOffset
                    })
                })
            );
        }
        return Object.freeze(actors);
    }
    collisionActors() {
        return Object.freeze([]);
    }
    recoverPlayer(playerId, worldOffset = { x: 0, y: 0 }) {
        if (this.status !== "active" || typeof playerId !== "string") return null;
        const targetCell = this.phase <= 2 ? "entry" : "main";
        this.recoveries[playerId] = { active: true, reason: "void-fall", targetCell, protection: true };
        const local = targetCell === "entry" ? { x: 2600, y: -220 } : { x: 2600, y: -1080 };
        this.emit("boss-player-recovered", { playerId, reason: "void-fall", targetCell });
        return compositeWorldPoint(local, worldOffset);
    }
    respawnPosition(worldOffset = { x: 0, y: 0 }) {
        return compositeWorldPoint(
            this.phase <= 1 ? { x: 2600, y: -220 } : this.phase <= 2 ? { x: 2600, y: -820 } : { x: 2600, y: -1080 },
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
