import {
    augmentById,
    compatibleAugmentsForSelection,
    normalizeLegacyFoundationAugmentId,
    selectedBaseActionId,
    selectedSignatureId
} from "./FoundationAugmentCatalog.js";
import { ACTION_MODIFIER_ID } from "./actions/ActionAugmentDefinition.js";

function distinctIds(values, label) {
    const ids = [...values];
    if (ids.some((id) => typeof id !== "string" || id.length === 0) || new Set(ids).size !== ids.length) {
        throw new Error(`${label} must contain distinct non-empty IDs`);
    }
    return ids;
}

export class FoundationAugmentState {
    constructor() {
        this.selectedAugmentIds = Object.freeze([]);
        this.consumedSourceIds = Object.freeze([]);
    }

    select(id, { sourceId = null } = {}) {
        const normalizedId = normalizeLegacyFoundationAugmentId(id);
        if (!augmentById(normalizedId)) throw new Error(`unknown Augment: ${id}`);
        if (this.selectedAugmentIds.length >= 6 || this.selectedAugmentIds.includes(normalizedId)) return false;
        if (sourceId !== null && this.consumedSourceIds.includes(sourceId)) return false;
        if (
            !compatibleAugmentsForSelection(this.selectedAugmentIds).some(
                ({ id: candidate }) => candidate === normalizedId
            )
        ) {
            return false;
        }
        this.selectedAugmentIds = Object.freeze([...this.selectedAugmentIds, normalizedId]);
        if (sourceId !== null) this.consumedSourceIds = Object.freeze([...this.consumedSourceIds, sourceId]);
        return true;
    }

    deselect(id, { sourceId = null } = {}) {
        const normalizedId = normalizeLegacyFoundationAugmentId(id);
        if (this.selectedAugmentIds.at(-1) !== normalizedId) return false;
        this.selectedAugmentIds = Object.freeze(this.selectedAugmentIds.slice(0, -1));
        if (sourceId !== null && this.consumedSourceIds.at(-1) === sourceId) {
            this.consumedSourceIds = Object.freeze(this.consumedSourceIds.slice(0, -1));
        }
        return true;
    }

    clear() {
        this.selectedAugmentIds = Object.freeze([]);
        this.consumedSourceIds = Object.freeze([]);
    }

    resetRuntime() {}

    advance(dt) {
        if (!Number.isFinite(dt) || dt < 0) throw new Error("Augment dt must be non-negative");
    }

    has(id) {
        return this.selectedAugmentIds.includes(normalizeLegacyFoundationAugmentId(id));
    }

    hasAugment(id) {
        return this.has(id);
    }

    selectedBaseActionId() {
        return selectedBaseActionId(this.selectedAugmentIds);
    }

    selectedSignatureId() {
        return selectedSignatureId(this.selectedAugmentIds);
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

    consumeRelayAttach() {
        return false;
    }

    onRopeReleased() {
        return this.has(ACTION_MODIFIER_ID.ROPE_LINK);
    }

    snapshot() {
        return Object.freeze({
            selectedAugmentIds: this.selectedAugmentIds,
            consumedSourceIds: this.consumedSourceIds
        });
    }

    restore(selectedId, runtimeState = {}) {
        const selectedIds = distinctIds(
            Array.isArray(runtimeState.selectedAugmentIds)
                ? runtimeState.selectedAugmentIds.map(normalizeLegacyFoundationAugmentId)
                : selectedId === null || selectedId === undefined
                  ? []
                  : [normalizeLegacyFoundationAugmentId(selectedId)],
            "selectedAugmentIds"
        );
        if (selectedIds.length > 6) throw new Error("selectedAugmentIds must contain at most six cards");
        const restored = [];
        for (const id of selectedIds) {
            if (!augmentById(id)) throw new Error(`unknown Augment: ${id}`);
            if (!compatibleAugmentsForSelection(restored).some(({ id: candidate }) => candidate === id)) {
                throw new Error(`incompatible Augment selection: ${id}`);
            }
            restored.push(id);
        }
        this.selectedAugmentIds = Object.freeze(restored);
        this.consumedSourceIds = Object.freeze(distinctIds(runtimeState.consumedSourceIds ?? [], "consumedSourceIds"));
        return this.snapshot();
    }

    get selectedId() {
        return this.selectedAugmentIds[0] ?? null;
    }

    get selectedIds() {
        return this.selectedAugmentIds;
    }

    get baseActionId() {
        return this.selectedBaseActionId();
    }
}
