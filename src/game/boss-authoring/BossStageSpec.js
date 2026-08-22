export const BOSS_STAGE_SPEC_VERSION = "boss-stage-spec-v1";
export const BOSS_STAGE_SPEC_TYPE = "boss-stage";

export const BOSS_MECHANIC_TYPE = Object.freeze({
    FULL_CROSSBEAM_SWEEP: "full-crossbeam-sweep",
    DIRECTIONAL_BROKEN_BEAM_SWEEP: "directional-broken-beam-sweep",
    BEAM_FAILURE: "beam-failure",
    RAIL_RAM: "rail-ram"
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
    return freezeBossStageValue({ participants });
}
import { scaledBossPhaseHealth as scaledRuntimeBossPhaseHealth } from "../boss/BossStageDefinition.js";
