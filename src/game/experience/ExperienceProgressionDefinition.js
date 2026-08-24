import { MAX_AUGMENT_SELECTIONS } from "../augments/AugmentCatalog.js";

export const EXPERIENCE_PROGRESSION_SPEC = Object.freeze({
    baseRequirement: 50,
    growthMultiplier: 1.2,
    roundingStep: 5
});

function roundToStep(value, step) {
    return Math.round(value / step) * step;
}

export class ExperienceProgressionDefinition {
    constructor(spec = EXPERIENCE_PROGRESSION_SPEC) {
        this.spec = spec;
    }

    get maximumRewardLevel() {
        return MAX_AUGMENT_SELECTIONS;
    }

    requirementForLevel(level) {
        if (!Number.isSafeInteger(level) || level < 1) throw new Error("experience level must be a positive integer");
        return roundToStep(
            this.spec.baseRequirement * this.spec.growthMultiplier ** (level - 1),
            this.spec.roundingStep
        );
    }

    cumulativeRequirement(level) {
        if (!Number.isSafeInteger(level) || level < 0) throw new Error("experience level must be non-negative");
        if (level === 0) return 0;
        let total = 0;
        for (let current = 1; current <= level; current += 1) total += this.requirementForLevel(current);
        return total;
    }

    levelForExperience(totalExperience) {
        if (!Number.isFinite(totalExperience) || totalExperience < 0) {
            throw new Error("totalExperience must be non-negative");
        }
        let level = 0;
        while (level < this.maximumRewardLevel && totalExperience >= this.cumulativeRequirement(level + 1)) {
            level += 1;
        }
        return level;
    }

    deathPenaltyForLevel(level) {
        if (!Number.isSafeInteger(level) || level < 0) throw new Error("experience level must be non-negative");
        const requirementLevel = Math.max(1, Math.min(level + 1, this.maximumRewardLevel));
        return roundToStep(this.requirementForLevel(requirementLevel) * 0.5, this.spec.roundingStep);
    }
}

export const EXPERIENCE_PROGRESSION = Object.freeze(new ExperienceProgressionDefinition());
