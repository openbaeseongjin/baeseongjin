import { ropeHookFlightSeconds, ropeHookReach } from "../config.js";

export const LAUNCHER_NUMERIC_TOLERANCE = 1e-6;

export function hookFlightSeconds(ropeConfig) {
    return ropeHookFlightSeconds(ropeConfig);
}

export function hookReach(ropeConfig) {
    return ropeHookReach(ropeConfig);
}

function finiteVector(value, label) {
    if (!Number.isFinite(value?.x) || !Number.isFinite(value?.y)) {
        throw new Error(`${label} must contain finite x and y`);
    }
    return value;
}

export class RopeLauncher {
    constructor(ropeConfig) {
        if (!ropeConfig) throw new Error("RopeLauncher requires a rope config");
        this.ropeConfig = ropeConfig;
        this.shot = null;
        this.cooldownRemaining = 0;
    }

    get inFlight() {
        return this.shot !== null;
    }

    get reach() {
        return hookReach(this.ropeConfig);
    }

    get flightSeconds() {
        return hookFlightSeconds(this.ropeConfig);
    }

    launch(origin, direction, target = null) {
        if (this.inFlight || this.cooldownRemaining > 0) return false;
        finiteVector(origin, "launch origin");
        finiteVector(direction, "launch direction");
        if (target) {
            finiteVector(target, "launch target");
            if (Math.hypot(target.x - origin.x, target.y - origin.y) > this.reach + LAUNCHER_NUMERIC_TOLERANCE) {
                return false;
            }
        }
        const magnitude = Math.hypot(direction.x, direction.y);
        if (!Number.isFinite(magnitude) || magnitude <= 0) return false;
        this.shot = {
            origin: { x: origin.x, y: origin.y },
            direction: { x: direction.x / magnitude, y: direction.y / magnitude },
            target: target ? { x: target.x, y: target.y } : null,
            traveled: 0,
            elapsed: 0
        };
        return true;
    }

    tipPosition() {
        if (!this.shot) return null;
        const distance = Math.min(this.shot.traveled, this.reach);
        return {
            x: this.shot.origin.x + this.shot.direction.x * distance,
            y: this.shot.origin.y + this.shot.direction.y * distance
        };
    }

    advance(dt) {
        if (!this.shot) return null;
        if (!Number.isFinite(dt) || dt < 0) {
            throw new Error("launcher advance dt must be finite and non-negative");
        }
        this.shot.elapsed += dt;
        this.shot.traveled = Math.min(this.reach, this.shot.traveled + this.ropeConfig.hookSpeed * dt);
        if (this.shot.target) {
            const distance = Math.hypot(
                this.shot.target.x - this.shot.origin.x,
                this.shot.target.y - this.shot.origin.y
            );
            if (distance <= this.reach + LAUNCHER_NUMERIC_TOLERANCE && this.shot.traveled >= distance) {
                const target = this.shot.target;
                this.shot = null;
                return Object.freeze({ status: "hit", target: Object.freeze({ ...target }) });
            }
        }
        if (this.shot.elapsed >= this.flightSeconds) {
            this.shot = null;
            this.cooldownRemaining = this.ropeConfig.hookReloadSeconds;
            return Object.freeze({ status: "expired" });
        }
        return Object.freeze({ status: "flying" });
    }

    cancel() {
        if (!this.shot) return false;
        this.shot = null;
        this.cooldownRemaining = this.ropeConfig.hookReloadSeconds;
        return true;
    }

    clear() {
        this.shot = null;
        this.cooldownRemaining = 0;
    }

    startReload() {
        this.cooldownRemaining = this.ropeConfig.hookReloadSeconds;
    }

    update(dt) {
        if (this.cooldownRemaining > 0) {
            this.cooldownRemaining = Math.max(0, this.cooldownRemaining - dt);
        }
    }

    snapshot() {
        if (!this.shot) return Object.freeze({ shot: null, cooldownRemaining: this.cooldownRemaining });
        return Object.freeze({
            shot: Object.freeze({
                origin: Object.freeze({ ...this.shot.origin }),
                direction: Object.freeze({ ...this.shot.direction }),
                target: this.shot.target ? Object.freeze({ ...this.shot.target }) : null,
                traveled: this.shot.traveled,
                elapsed: this.shot.elapsed
            }),
            cooldownRemaining: this.cooldownRemaining
        });
    }

    restore(snapshot) {
        this.shot = null;
        this.cooldownRemaining = 0;
        if (!snapshot) return;
        const cooldownRemaining = snapshot.cooldownRemaining ?? 0;
        if (!Number.isFinite(cooldownRemaining) || cooldownRemaining < 0) {
            throw new Error("launcher cooldownRemaining must be non-negative");
        }
        this.cooldownRemaining = cooldownRemaining;
        if (!snapshot.shot) return;
        const shot = snapshot.shot;
        const origin = shot.origin;
        const direction = shot.direction;
        finiteVector(origin, "launcher shot origin");
        finiteVector(direction, "launcher shot direction");
        const magnitude = Math.hypot(direction.x, direction.y);
        if (magnitude <= 0 || Math.abs(magnitude - 1) > LAUNCHER_NUMERIC_TOLERANCE) {
            throw new Error("launcher shot direction must be approximately normalized");
        }
        if (shot.target !== null && shot.target !== undefined) {
            finiteVector(shot.target, "launcher shot target");
        }
        if (!Number.isFinite(shot.traveled) || shot.traveled < 0) {
            throw new Error("launcher shot traveled must be non-negative");
        }
        if (!Number.isFinite(shot.elapsed) || shot.elapsed < 0) {
            throw new Error("launcher shot elapsed must be non-negative");
        }
        if (shot.traveled > this.reach + LAUNCHER_NUMERIC_TOLERANCE) {
            throw new Error("launcher shot traveled must not exceed the hook reach");
        }
        if (shot.elapsed > this.flightSeconds + LAUNCHER_NUMERIC_TOLERANCE) {
            throw new Error("launcher shot elapsed must not exceed the hook flight lifetime");
        }
        this.shot = {
            origin: { x: origin.x, y: origin.y },
            direction: { x: direction.x, y: direction.y },
            target: shot.target ? { x: shot.target.x, y: shot.target.y } : null,
            traveled: shot.traveled,
            elapsed: shot.elapsed
        };
    }
}
