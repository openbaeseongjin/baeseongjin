import { FOUNDATION_AUGMENT_CONFIG, foundationAugmentById } from "./FoundationAugmentCatalog.js";

export class FoundationAugmentState {
    constructor() {
        this.selectedId = null;
        this.relayWindowRemaining = 0;
    }

    select(id) {
        if (!foundationAugmentById(id)) throw new Error(`unknown Foundation Augment: ${id}`);
        if (this.selectedId !== null && this.selectedId !== id) return false;
        this.selectedId = id;
        return true;
    }

    clear() {
        this.selectedId = null;
        this.resetRuntime();
    }

    resetRuntime() {
        this.relayWindowRemaining = 0;
    }

    advance(dt) {
        if (!Number.isFinite(dt) || dt < 0) throw new Error("Foundation Augment dt must be non-negative");
        this.relayWindowRemaining = Math.max(0, this.relayWindowRemaining - dt);
    }

    onRopeReleased() {
        if (this.selectedId !== "relay-link") return false;
        this.relayWindowRemaining = FOUNDATION_AUGMENT_CONFIG.relayWindowSeconds;
        return true;
    }

    ropeInputModifiers(baseConfig) {
        const relayActive = this.selectedId === "relay-link" && this.relayWindowRemaining > 0;
        return Object.freeze({
            attachBufferSeconds: relayActive
                ? FOUNDATION_AUGMENT_CONFIG.relayAttachBufferSeconds
                : baseConfig.attachBufferSeconds,
            aimTolerance: relayActive ? FOUNDATION_AUGMENT_CONFIG.relayAimTolerance : 90,
            relayActive
        });
    }

    consumeRelayAttach() {
        if (this.selectedId !== "relay-link" || this.relayWindowRemaining <= 0) return false;
        this.relayWindowRemaining = 0;
        return true;
    }

    snapshot() {
        return Object.freeze({ relayWindowRemaining: this.relayWindowRemaining });
    }

    restore(selectedId, runtimeState = {}) {
        if (selectedId === null || selectedId === undefined) {
            this.clear();
            return this.snapshot();
        }
        if (!foundationAugmentById(selectedId)) throw new Error(`unknown Foundation Augment: ${selectedId}`);
        const relayWindowRemaining = runtimeState.relayWindowRemaining ?? 0;
        if (!Number.isFinite(relayWindowRemaining) || relayWindowRemaining < 0) {
            throw new Error("relayWindowRemaining must be non-negative");
        }
        this.selectedId = selectedId;
        this.relayWindowRemaining = selectedId === "relay-link" ? relayWindowRemaining : 0;
        return this.snapshot();
    }
}
