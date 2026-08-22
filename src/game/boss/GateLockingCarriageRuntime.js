const CARRIAGE_STATE = Object.freeze({
    TRAVEL: "travel",
    BEAM_TELEGRAPH: "beam-telegraph",
    BEAM_FAILURE_TELEGRAPH: "beam-failure-telegraph",
    SWEEP: "sweep",
    EXPOSED: "exposed",
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

const DEFAULT_CARRIAGE_CONFIG = Object.freeze({
    minX: -640,
    maxX: 640,
    travelSpeed: 180,
    sweepSeconds: 1.25,
    exposureSeconds: 4,
    ramTelegraphSeconds: 0.6,
    ramSpeed: 420
});

function freeze(value) {
    return Object.freeze(value);
}

function positive(value, fallback, label) {
    const resolved = value ?? fallback;
    if (!Number.isFinite(resolved) || resolved <= 0) throw new Error(`${label} must be positive`);
    return resolved;
}

export class GateLockingCarriageRuntime {
    constructor(definition, snapshot = null) {
        this.definition = definition;
        const boss = definition.arena?.boss ?? {};
        const mechanics = definition.arena?.mechanics ?? [];
        const railRam = mechanics.find(({ type }) => type === "rail-ram")?.parameters ?? {};
        const beamFailure = mechanics.find(({ type }) => type === "beam-failure")?.parameters ?? {};
        const fullSweep = mechanics.find(({ type }) => type === "full-crossbeam-sweep")?.parameters ?? {};
        const config = definition.arena?.carriage ?? definition.arena?.mechanism ?? {};
        this.config = freeze({
            minX: Number.isFinite(config.minX) ? config.minX : (boss.rail?.minX ?? DEFAULT_CARRIAGE_CONFIG.minX),
            maxX: Number.isFinite(config.maxX) ? config.maxX : (boss.rail?.maxX ?? DEFAULT_CARRIAGE_CONFIG.maxX),
            travelSpeed: positive(
                config.travelSpeed ?? fullSweep.travelSpeed,
                DEFAULT_CARRIAGE_CONFIG.travelSpeed,
                "Carriage travelSpeed"
            ),
            sweepSeconds: positive(
                config.sweepSeconds ?? fullSweep.recoverySeconds,
                DEFAULT_CARRIAGE_CONFIG.sweepSeconds,
                "Carriage sweepSeconds"
            ),
            exposureSeconds: positive(
                config.exposureSeconds,
                DEFAULT_CARRIAGE_CONFIG.exposureSeconds,
                "Carriage exposureSeconds"
            ),
            ramTelegraphSeconds: positive(
                config.ramTelegraphSeconds ?? railRam.telegraphSeconds,
                DEFAULT_CARRIAGE_CONFIG.ramTelegraphSeconds,
                "Carriage ramTelegraphSeconds"
            ),
            ramRecoverySeconds: positive(
                config.ramRecoverySeconds ?? railRam.recoverySeconds,
                DEFAULT_CARRIAGE_CONFIG.sweepSeconds,
                "Carriage ramRecoverySeconds"
            ),
            ramSpeed: positive(
                config.ramSpeed ?? railRam.travelSpeed,
                DEFAULT_CARRIAGE_CONFIG.ramSpeed,
                "Carriage ramSpeed"
            ),
            beamFailureTelegraphSeconds: positive(
                config.beamFailureTelegraphSeconds ?? beamFailure.telegraphSeconds,
                DEFAULT_CARRIAGE_CONFIG.ramTelegraphSeconds,
                "Carriage beamFailureTelegraphSeconds"
            )
        });
        this.phaseConfigs = freeze(
            definition.phases.map((phase) => {
                const mechanic = mechanics.find(
                    ({ id, type }) => phase.mechanicIds?.includes(id) && /sweep$/.test(type)
                );
                const parameters = mechanic?.parameters ?? fullSweep;
                return freeze({
                    travelSpeed: positive(parameters.travelSpeed, this.config.travelSpeed, `${phase.id} travelSpeed`),
                    telegraphSeconds: positive(
                        parameters.telegraphSeconds,
                        fullSweep.telegraphSeconds ?? DEFAULT_CARRIAGE_CONFIG.ramTelegraphSeconds,
                        `${phase.id} telegraphSeconds`
                    ),
                    recoverySeconds: positive(
                        parameters.recoverySeconds,
                        this.config.sweepSeconds,
                        `${phase.id} recoverySeconds`
                    )
                });
            })
        );
        if (this.config.minX >= this.config.maxX) throw new Error("Carriage rail bounds are invalid");
        this.reset(0);
        if (snapshot) this.restore(snapshot);
    }

    reset(phaseIndex) {
        this.phaseIndex = phaseIndex;
        this.state = phaseIndex === 2 ? CARRIAGE_STATE.BEAM_FAILURE_TELEGRAPH : CARRIAGE_STATE.TRAVEL;
        this.positionX = this.config.minX;
        this.direction = 1;
        this.remainingSeconds = phaseIndex === 2 ? this.config.beamFailureTelegraphSeconds : 0;
        this.weakpointExposed = false;
        this.beamFailed = false;
        this.hazardSequence = 0;
    }

    #phaseMode() {
        return MECHANIC_MODE[this.definition.phases[this.phaseIndex]?.mechanicId] ?? MECHANIC_MODE["full-crossbeam"];
    }

    #phaseConfig() {
        return this.phaseConfigs[this.phaseIndex] ?? this.phaseConfigs[0];
    }

    #beginEndpointAction() {
        const mode = this.#phaseMode();
        this.hazardSequence += 1;
        if (mode.ramOnly) {
            this.state = CARRIAGE_STATE.RAM_TELEGRAPH;
            this.remainingSeconds = this.config.ramTelegraphSeconds;
            return "boss-rail-ram-telegraphed";
        }
        this.state = CARRIAGE_STATE.BEAM_TELEGRAPH;
        this.remainingSeconds = this.#phaseConfig().telegraphSeconds;
        return this.phaseIndex === 0 ? "boss-full-beam-sweep-telegraphed" : "boss-directional-beam-sweep-telegraphed";
    }

    #advanceTravel(dt) {
        const boundary = this.direction > 0 ? this.config.maxX : this.config.minX;
        const mode = this.#phaseMode();
        const speed = mode.ramOnly ? this.config.ramSpeed : this.#phaseConfig().travelSpeed;
        const distance = boundary - this.positionX;
        const step = this.direction * speed * dt;
        if (Math.abs(step) < Math.abs(distance)) {
            this.positionX += step;
            return null;
        }
        this.positionX = boundary;
        if (this.state === CARRIAGE_STATE.RAM) {
            this.state = CARRIAGE_STATE.RAM_RECOVERY;
            this.remainingSeconds = this.config.ramRecoverySeconds;
            return "boss-rail-ram-recovering";
        }
        return this.#beginEndpointAction();
    }

    advance(dt) {
        if (!Number.isFinite(dt) || dt < 0) throw new Error("Carriage dt must be non-negative");
        if (dt === 0 || this.state === CARRIAGE_STATE.STOPPED) return freeze({ changed: false, eventType: null });
        if (this.state === CARRIAGE_STATE.TRAVEL || this.state === CARRIAGE_STATE.RAM) {
            const eventType = this.#advanceTravel(dt);
            return freeze({ changed: true, eventType });
        }
        this.remainingSeconds = Math.max(0, this.remainingSeconds - dt);
        if (this.remainingSeconds > 0) return freeze({ changed: true, eventType: null });
        if (this.state === CARRIAGE_STATE.RAM_TELEGRAPH) {
            this.state = CARRIAGE_STATE.RAM;
            this.direction *= -1;
            return freeze({ changed: true, eventType: "boss-rail-ram-started" });
        }
        if (this.state === CARRIAGE_STATE.RAM_RECOVERY)
            return freeze({ changed: true, eventType: this.#beginEndpointAction() });
        if (this.state === CARRIAGE_STATE.BEAM_FAILURE_TELEGRAPH) {
            this.state = CARRIAGE_STATE.TRAVEL;
            this.beamFailed = true;
            this.weakpointExposed = true;
            return freeze({ changed: true, eventType: "boss-beam-failed" });
        }
        if (this.state === CARRIAGE_STATE.BEAM_TELEGRAPH) {
            this.state = CARRIAGE_STATE.SWEEP;
            this.remainingSeconds = this.#phaseConfig().recoverySeconds;
            return freeze({
                changed: true,
                eventType:
                    this.phaseIndex === 0 ? "boss-full-beam-sweep-started" : "boss-directional-beam-sweep-started"
            });
        }
        if (this.state === CARRIAGE_STATE.SWEEP) {
            this.state = CARRIAGE_STATE.EXPOSED;
            this.weakpointExposed = true;
            this.remainingSeconds =
                this.definition.phases[this.phaseIndex].vulnerability?.durationSeconds ?? this.config.exposureSeconds;
            return freeze({ changed: true, eventType: "boss-weakpoint-exposed" });
        }
        if (this.state === CARRIAGE_STATE.EXPOSED) {
            this.weakpointExposed = false;
            this.state = CARRIAGE_STATE.TRAVEL;
            this.direction *= -1;
            return freeze({ changed: true, eventType: "boss-weakpoint-closed" });
        }
        return freeze({ changed: false, eventType: null });
    }

    completePhase(nextPhaseIndex) {
        this.reset(nextPhaseIndex);
        return freeze({ eventType: nextPhaseIndex === 2 ? "boss-beam-failure-telegraphed" : null });
    }

    stop() {
        this.state = CARRIAGE_STATE.STOPPED;
        this.remainingSeconds = 0;
        this.weakpointExposed = false;
    }

    isWeakpointActive(targetId) {
        return this.weakpointExposed && targetId === this.definition.phases[this.phaseIndex].weakTargetId;
    }

    snapshot() {
        const phase = this.definition.phases[this.phaseIndex];
        const mode = this.#phaseMode();
        return freeze({
            state: this.state,
            positionX: this.positionX,
            direction: this.direction,
            remainingSeconds: this.remainingSeconds,
            beamState: this.phaseIndex === 2 && !this.beamFailed ? "full" : mode.beam,
            beamDirection: mode.beam === "directional" ? (this.direction > 0 ? "right" : "left") : null,
            beamFailed: this.beamFailed,
            weakpointExposed: this.weakpointExposed,
            activeTargetId: this.weakpointExposed ? phase.weakTargetId : null,
            hazardSequence: this.hazardSequence
        });
    }

    restore(snapshot) {
        if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) {
            throw new Error("Carriage snapshot must be an object");
        }
        if (!Object.values(CARRIAGE_STATE).includes(snapshot.state)) throw new Error("invalid Carriage state");
        if (
            !Number.isFinite(snapshot.positionX) ||
            snapshot.positionX < this.config.minX ||
            snapshot.positionX > this.config.maxX
        ) {
            throw new Error("invalid Carriage position");
        }
        if (snapshot.direction !== -1 && snapshot.direction !== 1) throw new Error("invalid Carriage direction");
        if (!Number.isFinite(snapshot.remainingSeconds) || snapshot.remainingSeconds < 0) {
            throw new Error("invalid Carriage remainingSeconds");
        }
        if (!Number.isSafeInteger(snapshot.hazardSequence) || snapshot.hazardSequence < 0) {
            throw new Error("invalid Carriage hazardSequence");
        }
        this.state = snapshot.state;
        this.positionX = snapshot.positionX;
        this.direction = snapshot.direction;
        this.remainingSeconds = snapshot.remainingSeconds;
        this.beamFailed = snapshot.beamFailed === true;
        this.weakpointExposed = snapshot.weakpointExposed === true;
        this.hazardSequence = snapshot.hazardSequence;
        return this;
    }
}
