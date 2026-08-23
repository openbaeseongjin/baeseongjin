import { ElectrifiedStatusEffect } from "./ElectrifiedStatusEffect.js";

export class PlayerStatusEffects {
    constructor({ electrified = new ElectrifiedStatusEffect() } = {}) {
        this.electrified = electrified;
    }

    applyElectrified(source) {
        return this.electrified.apply(source);
    }

    advance(dt) {
        return Object.freeze({ electrified: this.electrified.advance(dt) });
    }

    snapshot() {
        return Object.freeze({ electrified: this.electrified.snapshot() });
    }

    restore(snapshot = null) {
        this.electrified.restore(snapshot?.electrified ?? null);
        return this.snapshot();
    }

    reset() {
        this.electrified.reset();
        return this.snapshot();
    }
}
