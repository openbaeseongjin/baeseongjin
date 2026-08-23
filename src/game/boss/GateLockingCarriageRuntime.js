import { KinematicPhysicsBody } from "../physics/KinematicPhysicsBody.js";
import { PHYSICS_ACTOR_KIND } from "../physics/PlayerPhysicsDefinition.js";
import { PolygonCollider } from "../physics/colliders/PolygonCollider.js";
import { bossBodyPolygonVertices } from "./BossBodyPolygon.js";

const CARRIAGE_STATE = Object.freeze({
    TRAVEL: "travel",
    BEAM_TELEGRAPH: "beam-telegraph",
    SWEEP: "sweep",
    EXPOSED: "exposed",
    BEAM_FAILURE_TELEGRAPH: "beam-failure-telegraph",
    BEAM_FAILURE: "beam-failure",
    RAM_TELEGRAPH: "ram-telegraph",
    RAM: "ram",
    RAM_RECOVERY: "ram-recovery",
    STOPPED: "stopped"
});

const MECHANIC_MODE = Object.freeze({
    "full-crossbeam": Object.freeze({ beam: "full", ramOnly: false }),
    "boss-01:full-crossbeam-sweep": Object.freeze({ beam: "full", ramOnly: false }),
    "directional-broken-beam": Object.freeze({ beam: "directional", ramOnly: false }),
    "boss-01:directional-broken-beam-sweep": Object.freeze({ beam: "directional", ramOnly: false }),
    "central-lock-core": Object.freeze({ beam: "broken", ramOnly: true }),
    "boss-01:beam-failure": Object.freeze({ beam: "broken", ramOnly: true })
});

const DEFAULT_CONFIG = Object.freeze({
    minX: -640,
    maxX: 640,
    railY: 0,
    sweepSpeed: 180,
    safeWaitSeconds: 1.25,
    exposureSeconds: 4,
    telegraphSeconds: 0.6,
    ramRecoverySeconds: 1.25,
    ramSpeed: 420,
    failureProgress: 0.5,
    failureSweepSpeed: 420,
    armorOpenSeconds: 0.6
});

function freeze(value) {
    if (Array.isArray(value)) return Object.freeze(value.map((entry) => freeze(entry)));
    if (!value || typeof value !== "object") return value;
    return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, freeze(entry)])));
}

function positive(value, fallback, label) {
    const resolved = value ?? fallback;
    if (!Number.isFinite(resolved) || resolved <= 0) throw new Error(`${label} must be positive`);
    return resolved;
}

function unitInterval(value, fallback, label) {
    const resolved = value ?? fallback;
    if (!Number.isFinite(resolved) || resolved <= 0 || resolved >= 1) {
        throw new Error(`${label} must be between 0 and 1`);
    }
    return resolved;
}

function mechanicForPhase(definition, phaseIndex) {
    const phase = definition.phases[phaseIndex];
    return definition.arena.mechanics.find(({ id, type }) => phase.mechanicIds?.includes(id) && /sweep$/.test(type));
}

export class GateLockingCarriageRuntime {
    constructor(definition, snapshot = null) {
        this.definition = definition;
        this.bossSpec = definition.arena?.boss ?? {};
        this.mechanics = definition.arena?.mechanics ?? [];
        this.fullSweep = this.mechanics.find(({ type }) => type === "full-crossbeam-sweep");
        this.railRam = this.mechanics.find(({ type }) => type === "rail-ram");
        this.beamFailure = this.mechanics.find(({ type }) => type === "beam-failure");
        const rail = this.bossSpec.rail ?? {};
        this.config = freeze({
            minX: Number.isFinite(rail.minX) ? rail.minX : DEFAULT_CONFIG.minX,
            maxX: Number.isFinite(rail.maxX) ? rail.maxX : DEFAULT_CONFIG.maxX,
            railY: Number.isFinite(rail.y) ? rail.y : (this.bossSpec.position?.y ?? DEFAULT_CONFIG.railY),
            carriageY: Number.isFinite(this.bossSpec.position?.y)
                ? this.bossSpec.position.y
                : Number.isFinite(rail.y)
                  ? rail.y
                  : DEFAULT_CONFIG.railY,
            ramTelegraphSeconds: positive(
                this.railRam?.parameters?.telegraphSeconds,
                DEFAULT_CONFIG.telegraphSeconds,
                "Carriage ram telegraph"
            ),
            ramRecoverySeconds: positive(
                this.railRam?.parameters?.recoverySeconds,
                DEFAULT_CONFIG.ramRecoverySeconds,
                "Carriage ram recovery"
            ),
            ramSpeed: positive(this.railRam?.parameters?.travelSpeed, DEFAULT_CONFIG.ramSpeed, "Carriage ram speed"),
            failureTelegraphSeconds: positive(
                this.beamFailure?.parameters?.telegraphSeconds,
                DEFAULT_CONFIG.telegraphSeconds,
                "Carriage failure telegraph"
            ),
            failureProgress: unitInterval(
                this.beamFailure?.parameters?.failureProgress,
                DEFAULT_CONFIG.failureProgress,
                "Carriage failure progress"
            ),
            failureSweepSpeed: positive(
                this.beamFailure?.parameters?.travelSpeed,
                DEFAULT_CONFIG.failureSweepSpeed,
                "Carriage failure sweep speed"
            ),
            armorOpenSeconds: positive(
                this.beamFailure?.parameters?.armorOpenSeconds,
                DEFAULT_CONFIG.armorOpenSeconds,
                "Carriage armor open time"
            )
        });
        if (this.config.minX >= this.config.maxX) throw new Error("Carriage rail bounds are invalid");
        this.phaseConfigs = freeze(
            definition.phases.map((phase, phaseIndex) => {
                const mechanic = mechanicForPhase(definition, phaseIndex) ?? this.fullSweep;
                return {
                    sweepSpeed: positive(
                        mechanic?.parameters?.travelSpeed,
                        DEFAULT_CONFIG.sweepSpeed,
                        `${phase.id} sweep speed`
                    ),
                    telegraphSeconds: positive(
                        mechanic?.parameters?.telegraphSeconds,
                        DEFAULT_CONFIG.telegraphSeconds,
                        `${phase.id} telegraph`
                    ),
                    safeWaitSeconds: positive(
                        mechanic?.parameters?.recoverySeconds,
                        DEFAULT_CONFIG.safeWaitSeconds,
                        `${phase.id} safe wait`
                    )
                };
            })
        );
        const bodyBounds = this.bossSpec.collider ?? { width: 980, height: 430 };
        this.body = new KinematicPhysicsBody({
            id: this.bossSpec.actorId ?? `${definition.id}:carriage`,
            actorKind: PHYSICS_ACTOR_KIND.BOSS,
            position: { x: this.config.minX, y: this.config.carriageY },
            collider: new PolygonCollider({
                vertices: bossBodyPolygonVertices(this.bossSpec.visualPresetId, bodyBounds)
            }),
            canGroundActors: true,
            ropeable: true
        });
        this.beamBody = new KinematicPhysicsBody({
            id: `${definition.id}:beam`,
            actorKind: PHYSICS_ACTOR_KIND.BOSS_HAZARD,
            position: { x: this.config.minX, y: this.config.railY },
            collider: this.#beamCollider(0)
        });
        this.reset(0);
        if (snapshot) this.restore(snapshot);
    }

    get positionX() {
        return this.body.position.x;
    }

    #phaseMode() {
        return MECHANIC_MODE[this.definition.phases[this.phaseIndex]?.mechanicId] ?? MECHANIC_MODE["full-crossbeam"];
    }

    #phaseConfig() {
        return this.phaseConfigs[this.phaseIndex] ?? this.phaseConfigs[0];
    }

    #beamMechanic(phaseIndex = this.phaseIndex) {
        return phaseIndex === 2 ? this.fullSweep : (mechanicForPhase(this.definition, phaseIndex) ?? this.fullSweep);
    }

    #beamSize(phaseIndex = this.phaseIndex) {
        const bounds = this.#beamMechanic(phaseIndex)?.bounds;
        return freeze({ width: bounds?.width ?? 1200, height: bounds?.height ?? 120 });
    }

    #beamCollider(phaseIndex = this.phaseIndex) {
        const size = this.#beamSize(phaseIndex);
        return PolygonCollider.box(size);
    }

    #beamLocalPosition(phaseIndex = this.phaseIndex) {
        const mechanic = this.#beamMechanic(phaseIndex);
        const authoredBoss = this.bossSpec.position ?? { x: 0, y: this.config.railY };
        const offsetX = (mechanic?.position?.x ?? authoredBoss.x) - authoredBoss.x;
        const offsetY = (mechanic?.position?.y ?? authoredBoss.y) - authoredBoss.y;
        const directional = this.#phaseMode().beam === "directional";
        return {
            x: this.body.position.x + (directional ? this.direction * Math.abs(offsetX) : offsetX),
            y: this.body.position.y + offsetY
        };
    }

    #syncBeamBody(dt = 0) {
        this.beamBody.replaceCollider(this.#beamCollider());
        this.beamBody.setKinematicPosition(this.#beamLocalPosition(), dt);
    }

    #targetBoundary() {
        return this.direction > 0 ? this.config.maxX : this.config.minX;
    }

    #setMotionStart() {
        this.motionStartX = this.positionX;
        this.motionTargetX = this.#targetBoundary();
        this.movementProgress = 0;
    }

    #moveTowardTarget(dt, speed) {
        const distance = this.motionTargetX - this.positionX;
        const step = this.direction * speed * dt;
        const reached = Math.abs(step) >= Math.abs(distance);
        const x = reached ? this.motionTargetX : this.positionX + step;
        this.body.setKinematicPosition({ x, y: this.config.carriageY }, dt);
        const total = Math.abs(this.motionTargetX - this.motionStartX);
        this.movementProgress = total > 0 ? Math.min(1, Math.abs(x - this.motionStartX) / total) : 1;
        this.#syncBeamBody(dt);
        return reached;
    }

    #holdBodies() {
        this.body.holdKinematicPosition();
        this.beamBody.holdKinematicPosition();
    }

    #beginSafeWait() {
        this.state = CARRIAGE_STATE.TRAVEL;
        this.remainingSeconds = this.#phaseConfig().safeWaitSeconds;
        this.movementProgress = 0;
        this.#holdBodies();
        return null;
    }

    #beginBeamTelegraph() {
        this.state = CARRIAGE_STATE.BEAM_TELEGRAPH;
        this.remainingSeconds = this.#phaseConfig().telegraphSeconds;
        this.#setMotionStart();
        this.#holdBodies();
        return this.phaseIndex === 0 ? "boss-full-beam-sweep-telegraphed" : "boss-directional-beam-sweep-telegraphed";
    }

    #beginBeamSweep() {
        this.state = CARRIAGE_STATE.SWEEP;
        this.hazardSequence += 1;
        return this.phaseIndex === 0 ? "boss-full-beam-sweep-started" : "boss-directional-beam-sweep-started";
    }

    #beginExposure() {
        this.state = CARRIAGE_STATE.EXPOSED;
        this.weakpointExposed = true;
        this.remainingSeconds =
            this.definition.phases[this.phaseIndex].vulnerability?.durationSeconds ?? DEFAULT_CONFIG.exposureSeconds;
        this.#holdBodies();
        return "boss-weakpoint-exposed";
    }

    #beginFailureTelegraph() {
        this.state = CARRIAGE_STATE.BEAM_FAILURE_TELEGRAPH;
        this.remainingSeconds = this.config.failureTelegraphSeconds;
        this.beamFailed = false;
        this.weakpointExposed = false;
        this.#setMotionStart();
        this.#holdBodies();
        return "boss-beam-failure-telegraphed";
    }

    #beginFailureSweep() {
        this.state = CARRIAGE_STATE.SWEEP;
        this.hazardSequence += 1;
        return "boss-beam-failure-sweep-started";
    }

    #breakBeamAtAuthoredProgress(dt) {
        const x = this.motionStartX + (this.motionTargetX - this.motionStartX) * this.config.failureProgress;
        this.body.setKinematicPosition({ x, y: this.config.carriageY }, dt);
        this.movementProgress = this.config.failureProgress;
        this.beamFailed = true;
        this.weakpointExposed = true;
        this.state = CARRIAGE_STATE.BEAM_FAILURE;
        this.remainingSeconds = this.config.armorOpenSeconds;
        this.beamBody.holdKinematicPosition();
        return "boss-beam-failed";
    }

    #beginRamTelegraph() {
        this.state = CARRIAGE_STATE.RAM_TELEGRAPH;
        this.remainingSeconds = this.config.ramTelegraphSeconds;
        this.#setMotionStart();
        this.#holdBodies();
        return "boss-rail-ram-telegraphed";
    }

    #beginRam() {
        this.state = CARRIAGE_STATE.RAM;
        this.hazardSequence += 1;
        return "boss-rail-ram-started";
    }

    reset(phaseIndex) {
        this.phaseIndex = phaseIndex;
        this.direction = 1;
        this.body.setKinematicPosition({ x: this.config.minX, y: this.config.carriageY }, 0);
        this.beamFailed = phaseIndex === 2;
        this.weakpointExposed = phaseIndex === 2;
        this.hazardSequence = 0;
        this.motionStartX = this.positionX;
        this.motionTargetX = this.config.maxX;
        this.movementProgress = 0;
        this.#syncBeamBody(0);
        if (phaseIndex === 2) this.#beginFailureTelegraph();
        else this.#beginSafeWait();
    }

    advance(dt) {
        if (!Number.isFinite(dt) || dt < 0) throw new Error("Carriage dt must be non-negative");
        if (dt === 0 || this.state === CARRIAGE_STATE.STOPPED) return freeze({ changed: false, eventType: null });

        if (this.state === CARRIAGE_STATE.SWEEP) {
            if (this.phaseIndex === 2 && !this.beamFailed) {
                const previousProgress = this.movementProgress;
                this.#moveTowardTarget(dt, this.config.failureSweepSpeed);
                if (
                    previousProgress < this.config.failureProgress &&
                    this.movementProgress >= this.config.failureProgress
                ) {
                    return freeze({ changed: true, eventType: this.#breakBeamAtAuthoredProgress(dt) });
                }
                return freeze({ changed: true, eventType: null });
            }
            const reached = this.#moveTowardTarget(dt, this.#phaseConfig().sweepSpeed);
            return freeze({ changed: true, eventType: reached ? this.#beginExposure() : null });
        }

        if (this.state === CARRIAGE_STATE.RAM) {
            const reached = this.#moveTowardTarget(dt, this.config.ramSpeed);
            if (!reached) return freeze({ changed: true, eventType: null });
            this.state = CARRIAGE_STATE.RAM_RECOVERY;
            this.remainingSeconds = this.config.ramRecoverySeconds;
            this.#holdBodies();
            return freeze({ changed: true, eventType: "boss-rail-ram-recovering" });
        }

        this.#holdBodies();
        this.remainingSeconds = Math.max(0, this.remainingSeconds - dt);
        if (this.remainingSeconds > 0) return freeze({ changed: true, eventType: null });

        if (this.state === CARRIAGE_STATE.TRAVEL) {
            return freeze({ changed: true, eventType: this.#beginBeamTelegraph() });
        }
        if (this.state === CARRIAGE_STATE.BEAM_TELEGRAPH) {
            return freeze({ changed: true, eventType: this.#beginBeamSweep() });
        }
        if (this.state === CARRIAGE_STATE.EXPOSED) {
            this.weakpointExposed = false;
            this.direction *= -1;
            this.#beginSafeWait();
            return freeze({ changed: true, eventType: "boss-weakpoint-closed" });
        }
        if (this.state === CARRIAGE_STATE.BEAM_FAILURE_TELEGRAPH) {
            return freeze({ changed: true, eventType: this.#beginFailureSweep() });
        }
        if (this.state === CARRIAGE_STATE.BEAM_FAILURE) {
            return freeze({ changed: true, eventType: this.#beginRamTelegraph() });
        }
        if (this.state === CARRIAGE_STATE.RAM_TELEGRAPH) {
            return freeze({ changed: true, eventType: this.#beginRam() });
        }
        if (this.state === CARRIAGE_STATE.RAM_RECOVERY) {
            this.direction *= -1;
            return freeze({ changed: true, eventType: this.#beginRamTelegraph() });
        }
        return freeze({ changed: false, eventType: null });
    }

    completePhase(nextPhaseIndex) {
        this.phaseIndex = nextPhaseIndex;
        this.direction *= -1;
        this.weakpointExposed = false;
        this.movementProgress = 0;
        this.#syncBeamBody(0);
        const eventType = nextPhaseIndex === 2 ? this.#beginFailureTelegraph() : this.#beginSafeWait();
        return freeze({ eventType });
    }

    stop() {
        this.state = CARRIAGE_STATE.STOPPED;
        this.remainingSeconds = 0;
        this.weakpointExposed = false;
        this.#holdBodies();
    }

    isWeakpointActive(targetId) {
        return this.weakpointExposed && targetId === this.definition.phases[this.phaseIndex].weakTargetId;
    }

    collisionActors(offset = { x: 0, y: 0 }) {
        return Object.freeze([this.body.collisionActor(offset)]);
    }

    beamGeometry(offset = { x: 0, y: 0 }) {
        const size = this.#beamSize();
        return freeze({
            id: this.beamBody.id,
            position: {
                x: this.beamBody.position.x + offset.x,
                y: this.beamBody.position.y + offset.y
            },
            velocity: { x: this.beamBody.velocity.x, y: this.beamBody.velocity.y },
            size,
            active:
                !this.beamFailed &&
                [CARRIAGE_STATE.BEAM_TELEGRAPH, CARRIAGE_STATE.BEAM_FAILURE_TELEGRAPH, CARRIAGE_STATE.SWEEP].includes(
                    this.state
                ),
            damaging: !this.beamFailed && this.state === CARRIAGE_STATE.SWEEP
        });
    }

    snapshot() {
        const phase = this.definition.phases[this.phaseIndex];
        const mode = this.#phaseMode();
        return freeze({
            state: this.state,
            positionX: this.positionX,
            velocity: { x: this.body.velocity.x, y: this.body.velocity.y },
            direction: this.direction,
            remainingSeconds: this.remainingSeconds,
            movementProgress: this.movementProgress,
            motionStartX: this.motionStartX,
            motionTargetX: this.motionTargetX,
            failureProgress: this.config.failureProgress,
            beamState: this.phaseIndex === 2 && !this.beamFailed ? "full" : mode.beam,
            beamDirection: mode.beam === "directional" ? (this.direction > 0 ? "right" : "left") : null,
            beamFailed: this.beamFailed,
            weakpointExposed: this.weakpointExposed,
            activeTargetId: this.weakpointExposed ? phase.weakTargetId : null,
            hazardSequence: this.hazardSequence,
            body: this.body.snapshot(),
            beam: this.beamBody.snapshot()
        });
    }

    restore(snapshot) {
        if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) {
            throw new Error("Carriage snapshot must be an object");
        }
        if (!Object.values(CARRIAGE_STATE).includes(snapshot.state)) throw new Error("invalid Carriage state");
        if (snapshot.direction !== -1 && snapshot.direction !== 1) throw new Error("invalid Carriage direction");
        for (const [label, value] of Object.entries({
            remainingSeconds: snapshot.remainingSeconds,
            movementProgress: snapshot.movementProgress,
            motionStartX: snapshot.motionStartX,
            motionTargetX: snapshot.motionTargetX
        })) {
            if (!Number.isFinite(value) || (label.includes("Progress") && (value < 0 || value > 1))) {
                throw new Error(`invalid Carriage ${label}`);
            }
        }
        if (!Number.isSafeInteger(snapshot.hazardSequence) || snapshot.hazardSequence < 0) {
            throw new Error("invalid Carriage hazardSequence");
        }
        this.state = snapshot.state;
        this.direction = snapshot.direction;
        this.remainingSeconds = snapshot.remainingSeconds;
        this.movementProgress = snapshot.movementProgress;
        this.motionStartX = snapshot.motionStartX;
        this.motionTargetX = snapshot.motionTargetX;
        this.beamFailed = snapshot.beamFailed === true;
        this.weakpointExposed = snapshot.weakpointExposed === true;
        this.hazardSequence = snapshot.hazardSequence;
        this.body.restore(snapshot.body);
        this.beamBody.replaceCollider(this.#beamCollider());
        this.beamBody.restore(snapshot.beam);
        return this;
    }
}
