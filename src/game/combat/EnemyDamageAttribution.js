function requireDamage(value) {
    if (!Number.isFinite(value) || value < 0) throw new Error("enemy Player damage must be non-negative");
    return value;
}

function requireHealth(value, label, { positive = false } = {}) {
    if (!Number.isFinite(value) || (positive ? value <= 0 : value < 0)) {
        throw new Error(`${label} must be ${positive ? "positive" : "non-negative"}`);
    }
    return value;
}

export class EnemyDamageAttribution {
    #lastDamagedByPlayerId;

    constructor() {
        this.#lastDamagedByPlayerId = null;
    }

    get lastDamagedByPlayerId() {
        return this.#lastDamagedByPlayerId;
    }

    recordPlayerDamage(sourcePlayerId, damage) {
        if (requireDamage(damage) === 0) return false;
        if (typeof sourcePlayerId !== "string" || sourcePlayerId.length === 0) {
            throw new Error("enemy Player damage requires sourcePlayerId");
        }
        this.#lastDamagedByPlayerId = sourcePlayerId;
        return true;
    }

    clearIfFullyHealed(health, maxHealth) {
        const resolvedHealth = requireHealth(health, "enemy health");
        const resolvedMaxHealth = requireHealth(maxHealth, "enemy maxHealth", { positive: true });
        if (resolvedHealth < resolvedMaxHealth) return false;
        return this.reset();
    }

    reset() {
        if (this.#lastDamagedByPlayerId === null) return false;
        this.#lastDamagedByPlayerId = null;
        return true;
    }
}
