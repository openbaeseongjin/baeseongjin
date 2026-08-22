export const BOSS_STAGE_SPEC_VERSION = "boss-stage-spec-v2";
export const BOSS_STAGE_SPEC_TYPE = "boss-stage";

export const BOSS_MECHANIC_TYPE = Object.freeze({
    FULL_CROSSBEAM_SWEEP: "full-crossbeam-sweep",
    DIRECTIONAL_BROKEN_BEAM_SWEEP: "directional-broken-beam-sweep",
    BEAM_FAILURE: "beam-failure",
    RAIL_RAM: "rail-ram",
    SIMPLE_LOCK_CHARGE: "simple-lock-charge",
    ROTATING_GROUND_SLAM: "rotating-ground-slam",
    DIAGONAL_DIVE: "diagonal-dive",
    PHASE_REPOSITION: "phase-reposition"
});

export const BOSS_VISUAL_PRESET_ID = Object.freeze({
    GATE_LOCKING_CARRIAGE: "gate-locking-carriage",
    RESIDENTIAL_SECURITY_PURSUER: "residential-security-pursuer"
});

export const BOSS_VULNERABILITY_TARGET_ID = Object.freeze({
    REAR_DRIVE: "boss-01:rear-drive",
    SIDE_GEARBOX: "boss-01:side-gearbox",
    CENTRAL_LOCK_CORE: "boss-01:central-lock-core",
    REAR_THRUSTER: "boss-02:rear-thruster",
    LOWER_STABILIZER: "boss-02:lower-stabilizer",
    CENTRAL_SENSOR: "boss-02:central-sensor"
});

export const BOSS_VULNERABILITY_TRIGGER = Object.freeze({
    MAX_EXTENSION: "max-extension",
    SWEEP_COMPLETE: "sweep-complete",
    BEAM_FAILURE: "beam-failure",
    VALID_ARCHITECTURE_IMPACT: "valid-architecture-impact"
});

export const BOSS_TRANSITION_TRIGGER = Object.freeze({
    CHECKPOINT_COMPLETE: "checkpoint-complete",
    ALL_PHASES_DEPLETED: "all-phases-depleted"
});

export const BOSS_VICTORY_PRESENTATION_ID = Object.freeze({
    POWER_LOSS_FULL_STOP: "boss-01:power-loss-full-stop",
    PURSUER_SHUTDOWN: "boss-02:pursuer-shutdown"
});

export const BOSS_HEALTH_BAR_STYLE = Object.freeze({
    SEGMENTED_TOTAL: "segmented-total",
    CURRENT_PHASE_PROGRESS: "current-phase-progress"
});

export const BOSS_DAMAGE_MODE = Object.freeze({
    STANDARD_COMBAT: "standard-combat"
});

function stableValue(value) {
    if (Array.isArray(value)) return value.map((entry) => stableValue(entry));
    if (!value || typeof value !== "object") return value;
    return Object.fromEntries(
        Object.keys(value)
            .sort((left, right) => left.localeCompare(right, "en"))
            .map((key) => [key, stableValue(value[key])])
    );
}

export function canonicalizeBossStageSpec(spec) {
    return stableValue(spec);
}

export function freezeBossStageValue(value) {
    if (Array.isArray(value)) return Object.freeze(value.map((entry) => freezeBossStageValue(entry)));
    if (!value || typeof value !== "object") return value;
    return Object.freeze(
        Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, freezeBossStageValue(entry)]))
    );
}

export function scaledBossPhaseHealth(health, participantCount) {
    if (!Number.isInteger(participantCount) || participantCount < 1 || participantCount > 4) {
        throw new RangeError("boss-stage-participant-count-invalid");
    }
    return scaledRuntimeBossPhaseHealth(health.base, participantCount, health.additionalPlayerMultiplier);
}

export function bossStageDerivedPreview(spec, participantCounts = [1, 2, 3, 4]) {
    const participants = participantCounts.map((participantCount) => {
        const phaseHealth = spec.phases.map((phase) =>
            scaledBossPhaseHealth(
                {
                    base: phase.basePhaseHealth,
                    additionalPlayerMultiplier: spec.combat.additionalPlayerMultiplier
                },
                participantCount
            )
        );
        const totalHealth = phaseHealth.reduce((sum, value) => sum + value, 0);
        let remaining = totalHealth;
        const phases = spec.phases.map((phase, index) => {
            const maxHealth = phaseHealth[index];
            remaining -= maxHealth;
            return {
                phaseId: phase.id,
                maxHealth,
                healthFloor: remaining,
                weakFixedDamage: maxHealth * spec.combat.weakFixedPercent
            };
        });
        return { participantCount, totalHealth, phases };
    });
    return freezeBossStageValue({
        closedBodyDamageMultiplier: spec.combat.closedBodyDamageMultiplier,
        participants
    });
}
import { scaledBossPhaseHealth as scaledRuntimeBossPhaseHealth } from "../boss/BossStageDefinition.js";
