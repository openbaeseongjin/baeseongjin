import { ACTION_DAMAGE_TYPE, ACTION_STATE_CONFIG } from "../ActionAugmentDefinition.js";

export class ActionShieldState {
    constructor(maxHealth) {
        this.maxHealth = maxHealth;
        this.value = ACTION_STATE_CONFIG.ZERO;
        this.remaining = ACTION_STATE_CONFIG.ZERO;
    }

    setMaxHealth(maxHealth) {
        this.maxHealth = maxHealth;
    }

    apply() {
        this.value = this.maxHealth * ACTION_STATE_CONFIG.POST_ACTION_SHIELD_RATIO;
        this.remaining = ACTION_STATE_CONFIG.POST_ACTION_SHIELD_SECONDS;
        return Object.freeze({ shieldValue: this.value, durationSeconds: this.remaining });
    }

    absorb(remainingDamage, type) {
        if (
            remainingDamage <= ACTION_STATE_CONFIG.ZERO ||
            type !== ACTION_DAMAGE_TYPE.COMBAT_HP ||
            this.remaining <= ACTION_STATE_CONFIG.ZERO ||
            this.value <= ACTION_STATE_CONFIG.ZERO
        ) {
            return Object.freeze({ remainingDamage, absorbedDamage: ACTION_STATE_CONFIG.ZERO });
        }
        const absorbedDamage = Math.min(this.value, remainingDamage);
        this.value -= absorbedDamage;
        const nextDamage = remainingDamage - absorbedDamage;
        if (this.value <= ACTION_STATE_CONFIG.ZERO) this.reset();
        return Object.freeze({ remainingDamage: nextDamage, absorbedDamage });
    }

    advance(dt) {
        if (this.remaining <= ACTION_STATE_CONFIG.ZERO) return;
        this.remaining = Math.max(ACTION_STATE_CONFIG.ZERO, this.remaining - dt);
        if (this.remaining === ACTION_STATE_CONFIG.ZERO) this.value = ACTION_STATE_CONFIG.ZERO;
    }

    restore({ value, remaining }) {
        this.value = value;
        this.remaining = remaining;
    }

    snapshot() {
        return Object.freeze({ value: this.value, remaining: this.remaining });
    }

    reset() {
        this.value = ACTION_STATE_CONFIG.ZERO;
        this.remaining = ACTION_STATE_CONFIG.ZERO;
    }
}
