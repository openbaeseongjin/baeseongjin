import {
    COMPOSITE_BOSS_STAGE_SNAPSHOT_REVISION,
    CompositeBossEncounterRuntime,
    compositeWorldPoint,
    freezeComposite
} from "./CompositeBossEncounterRuntime.js";
import { KinematicPhysicsBody } from "../physics/KinematicPhysicsBody.js";
import { PHYSICS_ACTOR_KIND } from "../physics/PlayerPhysicsDefinition.js";
import { PolygonCollider } from "../physics/colliders/PolygonCollider.js";
import { bossBodyPolygonVertices } from "./BossBodyPolygon.js";

export const CENTRAL_EXCHANGE_MAINTENANCE_STATE = Object.freeze({
    SAFE: "safe",
    TELEGRAPH: "telegraph",
    SWEEP: "sweep",
    EXPOSED: "exposed",
    TRANSITION: "transition",
    SHUTDOWN: "shutdown"
});

const TARGET = Object.freeze({
    BODY: "boss-03:maintenance-body",
    LEFT_MODULE: "boss-03:left-inspection-module",
    RIGHT_MODULE: "boss-03:right-inspection-module",
    CENTRAL_CORE: "boss-03:central-core"
});
const TARGET_BY_PHASE = Object.freeze({
    1: TARGET.LEFT_MODULE,
    2: TARGET.RIGHT_MODULE,
    3: TARGET.CENTRAL_CORE
});
const TARGET_POSITION = Object.freeze({
    [TARGET.LEFT_MODULE]: Object.freeze({ x: 970, y: -985 }),
    [TARGET.RIGHT_MODULE]: Object.freeze({ x: 3830, y: -1455 }),
    [TARGET.CENTRAL_CORE]: Object.freeze({ x: 2400, y: -2025 })
});
const TARGET_SIZE = Object.freeze({
    [TARGET.LEFT_MODULE]: 48,
    [TARGET.RIGHT_MODULE]: 48,
    [TARGET.CENTRAL_CORE]: 56
});
const OBJECT_KIND = Object.freeze({
    BODY: "boss-exchange-maintenance-body",
    RAIL: "boss-exchange-rail",
    ARCHITECTURE: "boss-exchange-architecture",
    ARM: "boss-exchange-arm",
    END_STOP: "boss-exchange-end-stop",
    MODULE: "boss-exchange-module"
});
const PRESENTED_SURFACE_KIND = Object.freeze({
    "entry-deck": true,
    gallery: true,
    "media-frame": true,
    "safe-landing": true
});
const ARM_BOUNDS = Object.freeze({
    LOW: Object.freeze({ x: 860, y: -1170, width: 3080, height: 260 }),
    HIGH: Object.freeze({ x: 1020, y: -1700, width: 2760, height: 240 })
});
const DEFAULT = Object.freeze({
    telegraphSeconds: 0.8,
    sweepSeconds: 1.2,
    exposureSeconds: 4,
    safeSeconds: 0.8,
    transitionSeconds: 1,
    highArmDelaySeconds: 0.3,
    damage: 25,
    bodyWidth: 360,
    bodyHeight: 150,
    bodySpeed: 120,
    railMinX: 1800,
    railMaxX: 3000,
    bodyY: -2075
});

function positive(value, fallback) {
    return Number.isFinite(value) && value > 0 ? value : fallback;
}

function freezeBounds(bounds, offset = { x: 0, y: 0 }) {
    return freezeComposite({
        x: bounds.x + offset.x,
        y: bounds.y + offset.y,
        width: bounds.width,
        height: bounds.height
    });
}

export class CentralExchangeMaintenanceRuntime extends CompositeBossEncounterRuntime {
    constructor(definition, snapshot = null) {
        super(definition);
        this.configByPhase = this.#configuration();
        this.scaledHealth = null;
        this.phaseHealth = [];
        this.phase = 1;
        this.state = CENTRAL_EXCHANGE_MAINTENANCE_STATE.SAFE;
        this.timer = 0;
        this.sweepElapsed = 0;
        this.hazardSequence = 0;
        this.railDirection = 1;
        this.bodyPosition = { ...definition.arena.boss.position };
        this.resetAttempt({ preserveCompleted: false });
        this.body = new KinematicPhysicsBody({
            id: TARGET.BODY,
            actorKind: PHYSICS_ACTOR_KIND.BOSS,
            position: this.bodyPosition,
            collider: new PolygonCollider({
                vertices: bossBodyPolygonVertices(definition.arena.boss.visualPresetId, {
                    width: DEFAULT.bodyWidth,
                    height: DEFAULT.bodyHeight
                })
            }),
            canGroundActors: false,
            ropeAttachment: false
        });
        if (snapshot) this.restore(snapshot);
    }

    #configuration() {
        const byPhase = Object.create(null);
        for (const mechanic of this.definition.arena.mechanics ?? []) {
            const phase = mechanic.parameters?.phase;
            if (!Number.isInteger(phase)) continue;
            byPhase[phase] = freezeComposite({
                telegraphSeconds: positive(mechanic.parameters.telegraphSeconds, DEFAULT.telegraphSeconds),
                sweepSeconds: positive(mechanic.parameters.sweepSeconds, DEFAULT.sweepSeconds),
                exposureSeconds: positive(mechanic.parameters.exposureSeconds, DEFAULT.exposureSeconds),
                safeSeconds: positive(mechanic.parameters.safeSeconds, DEFAULT.safeSeconds),
                highArmDelaySeconds: positive(mechanic.parameters.highArmDelaySeconds, DEFAULT.highArmDelaySeconds),
                damage: positive(mechanic.parameters.damage, DEFAULT.damage)
            });
        }
        return freezeComposite(byPhase);
    }

    #config() {
        return this.configByPhase[this.phase] ?? this.configByPhase[1];
    }

    maximumHealth() {
        return this.scaledHealth?.maxHealth ?? 0;
    }

    totalHealth() {
        return this.phaseHealth.reduce((sum, health) => sum + health, 0);
    }

    resetAttempt({ preserveCompleted }) {
        const rosterCount = Math.max(1, this.scalingRoster.length || 1);
        this.scaledHealth = this.definition.scaledHealth(rosterCount);
        const completed = preserveCompleted && this.status === "completed";
        this.phaseHealth = completed
            ? this.scaledHealth.phaseHealths.map(() => 0)
            : [...this.scaledHealth.phaseHealths];
        this.phase = completed ? this.definition.phases.length : 1;
        this.state = completed ? CENTRAL_EXCHANGE_MAINTENANCE_STATE.SHUTDOWN : CENTRAL_EXCHANGE_MAINTENANCE_STATE.SAFE;
        this.timer = completed ? 0 : this.#config().safeSeconds;
        this.sweepElapsed = 0;
        this.hazardSequence = 0;
        this.railDirection = 1;
        this.bodyPosition = { ...this.definition.arena.boss.position };
        this.body?.setKinematicPosition(this.bodyPosition, 0);
        this.body?.holdKinematicPosition();
    }

    #advanceRail(dt) {
        if (this.state === CENTRAL_EXCHANGE_MAINTENANCE_STATE.SHUTDOWN) {
            this.body.holdKinematicPosition();
            return;
        }
        let x = this.bodyPosition.x + this.railDirection * DEFAULT.bodySpeed * dt;
        if (x >= DEFAULT.railMaxX) {
            x = DEFAULT.railMaxX;
            this.railDirection = -1;
        } else if (x <= DEFAULT.railMinX) {
            x = DEFAULT.railMinX;
            this.railDirection = 1;
        }
        this.bodyPosition = { x, y: DEFAULT.bodyY };
        this.body.setKinematicPosition(this.bodyPosition, dt);
    }

    #beginTelegraph() {
        this.state = CENTRAL_EXCHANGE_MAINTENANCE_STATE.TELEGRAPH;
        this.timer = this.#config().telegraphSeconds;
        this.sweepElapsed = 0;
        this.emit("boss-attack-telegraphed", {
            phase: this.phase,
            kind: this.phase === 1 ? "low-arm-sweep" : "cross-arm-sweep"
        });
    }

    #beginSweep() {
        this.state = CENTRAL_EXCHANGE_MAINTENANCE_STATE.SWEEP;
        this.timer = this.#config().sweepSeconds;
        this.sweepElapsed = 0;
        this.hazardSequence += 1;
        this.emit("boss-attack-started", {
            phase: this.phase,
            kind: this.phase === 1 ? "low-arm-sweep" : "cross-arm-sweep",
            sequence: this.hazardSequence
        });
    }

    #beginExposure() {
        this.state = CENTRAL_EXCHANGE_MAINTENANCE_STATE.EXPOSED;
        this.timer = this.#config().exposureSeconds;
        this.emit("boss-weakpoint-opened", { phase: this.phase, targetId: TARGET_BY_PHASE[this.phase] });
    }

    #beginSafe() {
        if (this.state === CENTRAL_EXCHANGE_MAINTENANCE_STATE.EXPOSED) {
            this.emit("boss-weakpoint-closed", { phase: this.phase, targetId: TARGET_BY_PHASE[this.phase] });
        }
        this.state = CENTRAL_EXCHANGE_MAINTENANCE_STATE.SAFE;
        this.timer = this.#config().safeSeconds;
        this.sweepElapsed = 0;
    }

    advance(dt) {
        if (!Number.isFinite(dt) || dt <= 0) {
            return freezeComposite({ accepted: this.status === "active", changed: false });
        }
        if (this.status !== "active") {
            this.body?.holdKinematicPosition();
            return freezeComposite({ accepted: false, changed: false });
        }
        this.#advanceRail(dt);
        this.timer = Math.max(0, this.timer - dt);
        if (this.state === CENTRAL_EXCHANGE_MAINTENANCE_STATE.SWEEP) this.sweepElapsed += dt;
        if (this.timer > 0) return freezeComposite({ accepted: true, changed: true });
        if (this.state === CENTRAL_EXCHANGE_MAINTENANCE_STATE.SAFE) this.#beginTelegraph();
        else if (this.state === CENTRAL_EXCHANGE_MAINTENANCE_STATE.TELEGRAPH) this.#beginSweep();
        else if (this.state === CENTRAL_EXCHANGE_MAINTENANCE_STATE.SWEEP) this.#beginExposure();
        else if (this.state === CENTRAL_EXCHANGE_MAINTENANCE_STATE.EXPOSED) this.#beginSafe();
        else if (this.state === CENTRAL_EXCHANGE_MAINTENANCE_STATE.TRANSITION) this.#beginSafe();
        return freezeComposite({ accepted: true, changed: true });
    }

    #phaseFloor() {
        return this.phaseHealth.slice(this.phase).reduce((sum, health) => sum + health, 0);
    }

    #completePhase() {
        this.phaseHealth[this.phase - 1] = 0;
        if (this.phase >= this.definition.phases.length) {
            this.status = "completed";
            this.state = CENTRAL_EXCHANGE_MAINTENANCE_STATE.SHUTDOWN;
            this.timer = 0;
            this.body.holdKinematicPosition();
            this.emit("boss-encounter-completed", { phase: this.phase, targetId: TARGET.CENTRAL_CORE });
            return true;
        }
        const completedPhase = this.phase;
        this.phase += 1;
        this.state = CENTRAL_EXCHANGE_MAINTENANCE_STATE.TRANSITION;
        this.timer = DEFAULT.transitionSeconds;
        this.sweepElapsed = 0;
        this.emit("boss-phase-completed", { completedPhase, nextPhase: this.phase });
        return false;
    }

    applyImpact({ impactId, sourcePlayerId = null, baseDamage, targetId = null }) {
        if (this.status !== "active") {
            return freezeComposite({
                accepted: false,
                changed: false,
                reason: "encounter-not-active",
                appliedDamage: 0
            });
        }
        if (sourcePlayerId && this.participants.get(sourcePlayerId) !== "active") {
            return freezeComposite({
                accepted: false,
                changed: false,
                reason: "participant-not-active",
                appliedDamage: 0
            });
        }
        if (typeof impactId !== "string" || !Number.isFinite(baseDamage) || baseDamage < 0) {
            throw new Error("Boss03 impact is invalid");
        }
        if (this.processedImpactIds.has(impactId)) {
            return freezeComposite({
                accepted: true,
                changed: false,
                reason: "impact-already-processed",
                appliedDamage: 0
            });
        }
        this.processedImpactIds.add(impactId);
        const weakTarget = TARGET_BY_PHASE[this.phase];
        const exposed = this.state === CENTRAL_EXCHANGE_MAINTENANCE_STATE.EXPOSED;
        const bodyHit = targetId === TARGET.BODY;
        const weakHit = targetId === weakTarget && exposed;
        if (!bodyHit && !weakHit) {
            return freezeComposite({ accepted: true, changed: false, reason: "target-secured", appliedDamage: 0 });
        }
        const index = this.phase - 1;
        const normalDamage = bodyHit
            ? baseDamage * this.definition.closedBodyDamageMultiplier
            : baseDamage * this.definition.weakNormalDamageMultiplier;
        const weakpointDamage = weakHit ? this.scaledHealth.phaseHealths[index] * this.definition.weakFixedPercent : 0;
        const appliedDamage = Math.min(this.phaseHealth[index], normalDamage + weakpointDamage);
        this.phaseHealth[index] -= appliedDamage;
        if (appliedDamage > 0) {
            this.emit("boss-damaged", {
                impactId,
                sourcePlayerId,
                targetId,
                phase: this.phase,
                damage: appliedDamage,
                health: this.totalHealth()
            });
        }
        const completed = this.phaseHealth[index] <= 0 ? this.#completePhase() : false;
        return freezeComposite({
            accepted: true,
            changed: appliedDamage > 0,
            appliedDamage,
            normalDamage: Math.min(appliedDamage, normalDamage),
            weakpointHit: weakHit,
            completedPhase: !completed && this.phaseHealth[index] <= 0,
            completed
        });
    }

    applyDamage({ sourcePlayerId = null, damage, impactId = null, targetId = null }) {
        return this.applyImpact({
            impactId: impactId ?? `${this.definition.id}:impact:${this.eventSequence + 1}`,
            sourcePlayerId,
            baseDamage: damage,
            targetId: targetId ?? TARGET.BODY
        });
    }

    impactTargetSnapshot(targetId, worldOffset = { x: 0, y: 0 }) {
        const weakTarget = TARGET_BY_PHASE[this.phase];
        const weakpoint = targetId !== TARGET.BODY;
        const active =
            this.status === "active" &&
            (targetId === TARGET.BODY ||
                (targetId === weakTarget && this.state === CENTRAL_EXCHANGE_MAINTENANCE_STATE.EXPOSED));
        const position =
            targetId === TARGET.BODY
                ? compositeWorldPoint(this.bodyPosition, worldOffset)
                : compositeWorldPoint(TARGET_POSITION[targetId] ?? TARGET_POSITION[weakTarget], worldOffset);
        const snapshot = freezeComposite({
            id: targetId,
            impactTargetKind: "boss",
            active,
            position,
            ...(targetId === TARGET.BODY ? {} : { radius: TARGET_SIZE[targetId] ?? 48 }),
            health: this.totalHealth(),
            maxHealth: this.maximumHealth(),
            phase: this.phase,
            phaseCount: this.definition.phases.length,
            phaseFloor: this.#phaseFloor(),
            phaseMaxHealth: this.scaledHealth.phaseHealths[this.phase - 1],
            weakpointExposed: weakpoint && active,
            normalDamageMultiplier: weakpoint
                ? this.definition.weakNormalDamageMultiplier
                : this.definition.closedBodyDamageMultiplier,
            weakpointDamageRatio: weakpoint ? this.definition.weakFixedPercent : 0
        });
        return targetId === TARGET.BODY ? Object.freeze({ ...snapshot, collider: this.body.collider }) : snapshot;
    }

    activeHazards(worldOffset = { x: 0, y: 0 }) {
        if (this.status !== "active" || this.state !== CENTRAL_EXCHANGE_MAINTENANCE_STATE.SWEEP) {
            return Object.freeze([]);
        }
        const hazards = [
            {
                id: `${this.definition.id}:low-arm:${this.hazardSequence}`,
                kind: "maintenance-arm-low",
                sequence: this.hazardSequence,
                bounds: freezeBounds(ARM_BOUNDS.LOW, worldOffset),
                damage: this.#config().damage
            }
        ];
        if (this.phase >= 2 && this.sweepElapsed >= this.#config().highArmDelaySeconds) {
            hazards.push({
                id: `${this.definition.id}:high-arm:${this.hazardSequence}`,
                kind: "maintenance-arm-high",
                sequence: this.hazardSequence,
                bounds: freezeBounds(ARM_BOUNDS.HIGH, worldOffset),
                damage: this.#config().damage
            });
        }
        return Object.freeze(hazards.map((hazard) => freezeComposite(hazard)));
    }

    collisionActors(worldOffset = { x: 0, y: 0 }) {
        return Object.freeze([this.body.collisionActor(worldOffset)]);
    }

    ropeAttachmentActors() {
        return Object.freeze([]);
    }

    respawnPosition(worldOffset = { x: 0, y: 0 }) {
        return compositeWorldPoint(this.definition.arena.entry, worldOffset);
    }

    presentationObjects(worldOffset = { x: 0, y: 0 }) {
        const exposedTarget =
            this.state === CENTRAL_EXCHANGE_MAINTENANCE_STATE.EXPOSED ? TARGET_BY_PHASE[this.phase] : null;
        const actionState = this.state;
        const objects = [
            {
                id: "boss-03:maintenance-rail",
                kind: OBJECT_KIND.RAIL,
                position: compositeWorldPoint({ x: 2400, y: -2160 }, worldOffset),
                size: { width: 1800, height: 24 },
                state: this.state === CENTRAL_EXCHANGE_MAINTENANCE_STATE.SHUTDOWN ? "disabled" : "active",
                active: true
            },
            {
                id: TARGET.BODY,
                kind: OBJECT_KIND.BODY,
                variant: this.definition.arena.boss.visualPresetId,
                position: compositeWorldPoint(this.bodyPosition, worldOffset),
                size: { width: DEFAULT.bodyWidth, height: DEFAULT.bodyHeight },
                state: this.state === CENTRAL_EXCHANGE_MAINTENANCE_STATE.SHUTDOWN ? "disabled" : actionState,
                direction: this.railDirection,
                physicsBody: true,
                active: true
            },
            {
                id: "boss-03:left-end-stop",
                kind: OBJECT_KIND.END_STOP,
                variant: "left",
                position: compositeWorldPoint({ x: 970, y: -985 }, worldOffset),
                size: { width: 120, height: 90 },
                state: this.phase > 1 ? "damaged" : "active",
                active: true
            },
            {
                id: "boss-03:right-end-stop",
                kind: OBJECT_KIND.END_STOP,
                variant: "right",
                position: compositeWorldPoint({ x: 3830, y: -1455 }, worldOffset),
                size: { width: 120, height: 90 },
                state: this.phase > 2 ? "damaged" : "active",
                active: true
            }
        ];
        for (const targetId of [TARGET.LEFT_MODULE, TARGET.RIGHT_MODULE, TARGET.CENTRAL_CORE]) {
            const broken =
                (targetId === TARGET.LEFT_MODULE && this.phase > 1) ||
                (targetId === TARGET.RIGHT_MODULE && this.phase > 2) ||
                (targetId === TARGET.CENTRAL_CORE && this.status === "completed");
            objects.push({
                id: targetId,
                kind: OBJECT_KIND.MODULE,
                variant:
                    targetId === TARGET.CENTRAL_CORE
                        ? "central-core"
                        : targetId === TARGET.LEFT_MODULE
                          ? "left-module"
                          : "right-module",
                position: compositeWorldPoint(TARGET_POSITION[targetId], worldOffset),
                size: { width: TARGET_SIZE[targetId] * 2, height: TARGET_SIZE[targetId] * 2 },
                state: broken ? "broken" : exposedTarget === targetId ? "exposed" : "secured",
                active: true
            });
        }
        for (const band of ["low", "high"]) {
            const high = band === "high";
            const visible = !high || this.phase >= 2;
            const active =
                visible &&
                this.state === CENTRAL_EXCHANGE_MAINTENANCE_STATE.SWEEP &&
                (!high || this.sweepElapsed >= this.#config().highArmDelaySeconds);
            const bounds = high ? ARM_BOUNDS.HIGH : ARM_BOUNDS.LOW;
            objects.push({
                id: `boss-03:${band}-arm`,
                kind: OBJECT_KIND.ARM,
                variant: band,
                position: compositeWorldPoint(
                    { x: bounds.x + bounds.width * 0.5, y: bounds.y + bounds.height * 0.5 },
                    worldOffset
                ),
                size: { width: bounds.width, height: bounds.height },
                state: active
                    ? "sweep"
                    : visible && this.state === CENTRAL_EXCHANGE_MAINTENANCE_STATE.TELEGRAPH
                      ? "telegraph"
                      : "idle",
                damaging: active,
                movementProgress: this.#config().sweepSeconds > 0 ? this.sweepElapsed / this.#config().sweepSeconds : 0,
                active: visible && this.status !== "completed"
            });
        }
        const architectureObjects = [];
        for (const surface of this.definition.arena.surfaces) {
            if (PRESENTED_SURFACE_KIND[surface.kind] !== true) continue;
            architectureObjects.push({
                id: `${surface.id}:presentation`,
                kind: OBJECT_KIND.ARCHITECTURE,
                variant: surface.kind,
                position: compositeWorldPoint(
                    {
                        x: surface.bounds.x + surface.bounds.width * 0.5,
                        y: surface.bounds.y + surface.bounds.height * 0.5
                    },
                    worldOffset
                ),
                size: { width: surface.bounds.width, height: surface.bounds.height },
                state: "active",
                active: true
            });
        }
        return Object.freeze([...architectureObjects, ...objects].map((object) => freezeComposite(object)));
    }

    snapshot() {
        const phaseFloor = this.#phaseFloor();
        const targetId = TARGET_BY_PHASE[this.phase];
        return this.baseSnapshot({
            phase: this.phase,
            phaseHealths: this.scaledHealth.phaseHealths,
            phaseFloors: this.scaledHealth.phaseFloors,
            currentPhase: this.definition.phases[this.phase - 1],
            currentTargetId: targetId,
            objectiveLabel: this.definition.phases[this.phase - 1]?.hud?.objective ?? "",
            health: this.totalHealth(),
            currentHealth: this.totalHealth(),
            phaseFloor,
            vulnerability: freezeComposite({
                active: this.state === CENTRAL_EXCHANGE_MAINTENANCE_STATE.EXPOSED,
                targetId,
                remainingSeconds: this.state === CENTRAL_EXCHANGE_MAINTENANCE_STATE.EXPOSED ? this.timer : 0
            }),
            mechanism: freezeComposite({
                state: this.state,
                hazardSequence: this.hazardSequence,
                positionX: this.bodyPosition.x,
                direction: this.railDirection,
                movementProgress:
                    this.state === CENTRAL_EXCHANGE_MAINTENANCE_STATE.SWEEP
                        ? this.sweepElapsed / this.#config().sweepSeconds
                        : 0
            }),
            phaseHealth: Object.freeze([...this.phaseHealth]),
            timer: this.timer,
            sweepElapsed: this.sweepElapsed,
            hazardSequence: this.hazardSequence,
            railDirection: this.railDirection,
            body: this.body.snapshot()
        });
    }

    restore(snapshot) {
        if (snapshot?.snapshotRevision !== COMPOSITE_BOSS_STAGE_SNAPSHOT_REVISION) {
            throw new Error("Boss03 snapshot revision mismatch");
        }
        this.restoreBase(snapshot);
        this.scaledHealth = this.definition.scaledHealth(Math.max(1, this.scalingRoster.length || 1));
        this.phase = snapshot.phase;
        this.phaseHealth = [...snapshot.phaseHealth];
        this.state = snapshot.mechanism?.state ?? snapshot.state;
        this.timer = snapshot.timer;
        this.sweepElapsed = snapshot.sweepElapsed ?? 0;
        this.hazardSequence = snapshot.hazardSequence ?? snapshot.mechanism?.hazardSequence ?? 0;
        this.railDirection = snapshot.railDirection ?? snapshot.mechanism?.direction ?? 1;
        this.body.restore(snapshot.body);
        this.bodyPosition = { x: this.body.position.x, y: this.body.position.y };
        return this;
    }
}
