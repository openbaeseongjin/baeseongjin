function finitePoint(point, label) {
    if (!Number.isFinite(point?.x) || !Number.isFinite(point?.y)) {
        throw new Error(`${label} requires finite x and y`);
    }
    return point;
}

function positive(value, label) {
    if (!Number.isFinite(value) || value <= 0) throw new Error(`${label} must be positive and finite`);
    return value;
}

export class CommanderGrabHookFlight {
    constructor({ speed, radius }) {
        this.speed = positive(speed, "Commander grab hook speed");
        this.radius = positive(radius, "Commander grab hook radius");
        this.reset();
    }

    begin({ start, target }) {
        const origin = finitePoint(start, "Commander grab hook start");
        const destination = finitePoint(target, "Commander grab hook target");
        this.position = { x: origin.x, y: origin.y };
        this.traveled = 0;
        this.remainingDistance = Math.hypot(destination.x - origin.x, destination.y - origin.y);
        this.active = true;
        return this.snapshot();
    }

    advance(dt, target) {
        if (!this.active) return this.snapshot();
        if (!Number.isFinite(dt) || dt < 0) throw new Error("Commander grab hook dt must be non-negative");
        const destination = finitePoint(target, "Commander grab hook target");
        const dx = destination.x - this.position.x;
        const dy = destination.y - this.position.y;
        const distance = Math.hypot(dx, dy);
        const step = Math.min(distance, this.speed * dt);
        if (distance > 0) {
            this.position.x += (dx / distance) * step;
            this.position.y += (dy / distance) * step;
        }
        this.traveled += step;
        this.remainingDistance = Math.max(0, distance - step);
        return this.snapshot();
    }

    reset() {
        this.active = false;
        this.position = { x: 0, y: 0 };
        this.traveled = 0;
        this.remainingDistance = 0;
        return this.snapshot();
    }

    snapshot() {
        const totalDistance = this.traveled + this.remainingDistance;
        return Object.freeze({
            active: this.active,
            position: Object.freeze({ x: this.position.x, y: this.position.y }),
            traveled: this.traveled,
            remainingDistance: this.remainingDistance,
            progress: totalDistance > 0 ? Math.min(1, this.traveled / totalDistance) : 0
        });
    }

    restore(snapshot = null) {
        this.reset();
        if (!snapshot?.active) return this.snapshot();
        const position = finitePoint(snapshot.position, "Commander grab hook snapshot position");
        this.active = true;
        this.position = { x: position.x, y: position.y };
        this.traveled = Math.max(0, snapshot.traveled ?? 0);
        this.remainingDistance = Math.max(0, snapshot.remainingDistance ?? 0);
        return this.snapshot();
    }
}
