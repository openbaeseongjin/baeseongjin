function contains(bounds, position) {
    return (
        position.x >= bounds.x &&
        position.x <= bounds.x + bounds.width &&
        position.y >= bounds.y &&
        position.y <= bounds.y + bounds.height
    );
}

export class EnemyActivationState {
    constructor(bounds = null, awakened = false) {
        this.bounds = bounds ? Object.freeze({ ...bounds }) : null;
        this.awakened = this.bounds === null || awakened === true;
    }

    observe(targets) {
        if (!this.awakened && targets.some(({ physics }) => contains(this.bounds, physics.position))) {
            this.awakened = true;
        }
        return this.awakened;
    }

    restore(awakened) {
        if (typeof awakened !== "boolean") return false;
        this.awakened = this.bounds === null || awakened;
        return true;
    }
}
