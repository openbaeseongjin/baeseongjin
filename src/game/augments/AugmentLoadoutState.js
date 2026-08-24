import {
    MAX_AUGMENT_SELECTIONS,
    REWARDABLE_AUGMENT_IDS,
    augmentById,
    isRopeAugment,
    isSpellAugment
} from "./AugmentCatalog.js";

function requireSelectedAugmentIds(ids) {
    if (!Array.isArray(ids)) throw new Error("selectedAugmentIds must be an array");
    if (new Set(ids).size !== ids.length) throw new Error("selectedAugmentIds must not contain duplicates");
    if (ids.some((id) => !REWARDABLE_AUGMENT_IDS.includes(id))) {
        throw new Error("selectedAugmentIds contains an unknown Augment");
    }
    return Object.freeze([...ids]);
}

export class AugmentLoadoutState {
    constructor() {
        this.selectedAugmentIds = Object.freeze([]);
    }

    select(id) {
        if (!augmentById(id)) throw new Error(`unknown Augment: ${id}`);
        if (this.selectedAugmentIds.length >= MAX_AUGMENT_SELECTIONS || this.selectedAugmentIds.includes(id)) {
            return false;
        }
        this.selectedAugmentIds = Object.freeze([...this.selectedAugmentIds, id]);
        return true;
    }

    deselect(id) {
        if (this.selectedAugmentIds.at(-1) !== id) return false;
        this.selectedAugmentIds = Object.freeze(this.selectedAugmentIds.slice(0, -1));
        return true;
    }

    has(id) {
        return this.selectedAugmentIds.includes(id);
    }

    ropeAugmentIds() {
        return Object.freeze(this.selectedAugmentIds.filter((id) => isRopeAugment(id)));
    }

    selectedSpellIds() {
        return Object.freeze(this.selectedAugmentIds.filter((id) => isSpellAugment(id)));
    }

    effectiveRopeConfig(baseConfig) {
        const baseReach =
            (baseConfig.hookSpeed * baseConfig.hookFlightRatio.numerator) / baseConfig.hookFlightRatio.denominator;
        const hookSpeed = this.has("fast-launch") ? baseConfig.hookSpeed * 1.5 : baseConfig.hookSpeed;
        const reach = this.has("long-rope") ? baseReach * 1.2 : baseReach;
        return Object.freeze({
            ...baseConfig,
            hookSpeed,
            hookFlightRatio: Object.freeze({ numerator: reach, denominator: hookSpeed }),
            hookReloadSeconds: this.has("fast-recover")
                ? baseConfig.hookReloadSeconds * 0.5
                : baseConfig.hookReloadSeconds
        });
    }

    ropeInputModifiers(baseConfig) {
        const effectiveConfig = this.effectiveRopeConfig(baseConfig);
        return Object.freeze({
            attachBufferSeconds: effectiveConfig.attachBufferSeconds,
            aimTolerance: 90,
            relayActive: false
        });
    }

    advance(dt) {
        if (!Number.isFinite(dt) || dt < 0) throw new Error("Augment dt must be non-negative");
    }

    snapshot() {
        return Object.freeze({ selectedAugmentIds: this.selectedAugmentIds });
    }

    restore(snapshot = null) {
        if (!snapshot) return this.reset();
        const selectedAugmentIds = requireSelectedAugmentIds(snapshot.selectedAugmentIds);
        if (selectedAugmentIds.length > MAX_AUGMENT_SELECTIONS) {
            throw new Error(`selectedAugmentIds must contain at most ${MAX_AUGMENT_SELECTIONS} cards`);
        }
        this.selectedAugmentIds = Object.freeze(selectedAugmentIds);
        return this.snapshot();
    }

    reset() {
        this.selectedAugmentIds = Object.freeze([]);
        return this.snapshot();
    }
}
