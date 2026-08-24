import { EXPERIENCE_PROGRESSION } from "./ExperienceProgressionDefinition.js";

export class PlayerExperienceState {
    constructor(progression = EXPERIENCE_PROGRESSION) {
        this.progression = progression;
        this.totalExperience = 0;
        this.resolvedRewardLevel = 0;
    }

    get level() {
        return this.progression.levelForExperience(this.totalExperience);
    }

    get pendingRewardCount() {
        return Math.max(0, this.level - this.resolvedRewardLevel);
    }

    get experienceIntoLevel() {
        return this.totalExperience - this.progression.cumulativeRequirement(this.level);
    }

    get nextLevelRequirement() {
        return this.level >= this.progression.maximumRewardLevel
            ? 0
            : this.progression.requirementForLevel(this.level + 1);
    }

    add(amount) {
        if (!Number.isFinite(amount) || amount < 0) throw new Error("experience reward must be non-negative");
        const previousLevel = this.level;
        this.totalExperience = Math.min(
            this.progression.cumulativeRequirement(this.progression.maximumRewardLevel),
            this.totalExperience + amount
        );
        return Object.freeze({
            amount,
            previousLevel,
            level: this.level,
            gainedLevels: this.level - previousLevel,
            pendingRewardCount: this.pendingRewardCount
        });
    }

    loseForDeath() {
        const previousLevel = this.level;
        const requestedLoss = this.progression.deathPenaltyForLevel(previousLevel);
        const amount = Math.min(this.totalExperience, requestedLoss);
        this.totalExperience -= amount;
        return Object.freeze({ amount, previousLevel, level: this.level, totalExperience: this.totalExperience });
    }

    resolveNextReward() {
        if (this.pendingRewardCount <= 0) return false;
        this.resolvedRewardLevel += 1;
        return true;
    }

    rejectLatestReward() {
        if (this.resolvedRewardLevel <= 0) return false;
        this.resolvedRewardLevel -= 1;
        return true;
    }

    snapshot() {
        return Object.freeze({
            totalExperience: this.totalExperience,
            level: this.level,
            resolvedRewardLevel: this.resolvedRewardLevel,
            pendingRewardCount: this.pendingRewardCount,
            experienceIntoLevel: this.experienceIntoLevel,
            nextLevelRequirement: this.nextLevelRequirement,
            maximumRewardLevel: this.progression.maximumRewardLevel
        });
    }

    restore(snapshot = null) {
        if (!snapshot) return this.reset();
        if (!Number.isFinite(snapshot.totalExperience) || snapshot.totalExperience < 0) {
            throw new Error("totalExperience must be non-negative");
        }
        if (!Number.isSafeInteger(snapshot.resolvedRewardLevel) || snapshot.resolvedRewardLevel < 0) {
            throw new Error("resolvedRewardLevel must be a non-negative integer");
        }
        this.totalExperience = snapshot.totalExperience;
        this.resolvedRewardLevel = snapshot.resolvedRewardLevel;
        if (this.resolvedRewardLevel > this.progression.maximumRewardLevel)
            throw new Error("resolved reward level cannot exceed maximum reward level");
        return this.snapshot();
    }

    reset() {
        this.totalExperience = 0;
        this.resolvedRewardLevel = 0;
        return this.snapshot();
    }
}
