export const BOSS_STAGE_SPEC_VERSION = "boss-stage-spec-v2";
export const BOSS_STAGE_SPEC_TYPE = "boss-stage";

export const BOSS_ANCHOR_ROLE = Object.freeze({
    ROUTE: "route",
    SWING_ATTACK: "swing-attack"
});

export const BOSS_MECHANIC_TYPE = Object.freeze({
    CONTINUITY_WARDEN: "continuity-warden",
    LOWER_SECTOR_COMMANDER: "lower-sector-commander"
});

export const BOSS_VISUAL_PRESET_ID = Object.freeze({
    CONTINUITY_WARDEN: "continuity-warden",
    LOWER_SECTOR_COMMANDER: "lower-sector-commander"
});

export const BOSS_VULNERABILITY_TARGET_ID = Object.freeze({
    CONTINUITY_WARDEN_BODY: "boss-06:continuity-warden:body",
    LOWER_SECTOR_COMMANDER_BODY: "boss-03:lower-sector-commander:body"
});

export const BOSS_VULNERABILITY_TRIGGER = Object.freeze({
    SWEEP_COMPLETE: "sweep-complete",
    ALWAYS_ACTIVE: "always-active"
});

export const BOSS_TRANSITION_TRIGGER = Object.freeze({
    CHECKPOINT_COMPLETE: "checkpoint-complete",
    ALL_PHASES_DEPLETED: "all-phases-depleted"
});

export const BOSS_TERMINAL_COMPLETION = Object.freeze({
    ALL_ACTIVE_BOARDING: "all-active-boarding"
});

export const BOSS_VICTORY_PRESENTATION_ID = Object.freeze({
    CONTINUITY_WARDEN_DEFEATED: "boss-06:continuity-warden-defeated",
    LOWER_SECTOR_COMMANDER_DEFEATED: "boss-03:return-protocol-offline"
});

export const BOSS_PARTICIPANT_DEFEAT_POLICY = Object.freeze({
    SHARED_WIPE: "shared-wipe",
    INDIVIDUAL_RESPAWN: "individual-respawn"
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
