import { Vector2 } from "../../../game-kit/index.js";
import { ENEMY_BEHAVIOR_CONFIG, ENEMY_BEHAVIOR_KIND, SHIELD_BEHAVIOR_STATE } from "./EnemyBehaviorDefinition.js";
import { clamp, directionBetween, frozenDirection, nearestTarget, validateBehaviorDt } from "./EnemyBehaviorSupport.js";

export class ShieldEnemyBehavior {
    constructor({
        guardDirection = { x: 1, y: 0 },
        angularVelocity = 0,
        maximumAngularAcceleration = 0.6,
        maximumAngularSpeed = 0.55,
        angularDamping = 1.4,
        trackingResponse = 0.9,
        acquireRange = 1440,
        guardHalfAngle = Math.PI / 3
    } = {}) {
        this.kind = ENEMY_BEHAVIOR_KIND.SHIELD;
        this.guardDirection = new Vector2(guardDirection.x, guardDirection.y).normalize();
        if (this.guardDirection.length() === ENEMY_BEHAVIOR_CONFIG.ZERO) this.guardDirection.set(1, 0);
        this.angularVelocity = angularVelocity;
        this.maximumAngularAcceleration = maximumAngularAcceleration;
        this.maximumAngularSpeed = maximumAngularSpeed;
        this.angularDamping = angularDamping;
        this.trackingResponse = trackingResponse;
        this.acquireRange = acquireRange;
        this.guardHalfAngle = guardHalfAngle;
    }
    advance(enemy, { targets = [], dt = 0 } = {}) {
        validateBehaviorDt(dt);
        const currentAngle = Math.atan2(this.guardDirection.y, this.guardDirection.x);
        const target = nearestTarget(enemy, targets, this.acquireRange, { respectActivation: false });
        if (!target) {
            this.angularVelocity *= Math.exp(-this.angularDamping * dt);
            const coastAngle = currentAngle + this.angularVelocity * dt;
            this.guardDirection.set(Math.cos(coastAngle), Math.sin(coastAngle));
            return null;
        }
        const desired = directionBetween(enemy.position, target.physics.position);
        const desiredAngle = Math.atan2(desired.y, desired.x);
        const delta = Math.atan2(Math.sin(desiredAngle - currentAngle), Math.cos(desiredAngle - currentAngle));
        const angularAcceleration = clamp(
            delta * this.trackingResponse - this.angularVelocity * this.angularDamping,
            -this.maximumAngularAcceleration,
            this.maximumAngularAcceleration
        );
        this.angularVelocity = clamp(
            this.angularVelocity + angularAcceleration * dt,
            -this.maximumAngularSpeed,
            this.maximumAngularSpeed
        );
        let angularStep = this.angularVelocity * dt;
        if (Math.sign(angularStep) === Math.sign(delta) && Math.abs(angularStep) > Math.abs(delta)) {
            angularStep = delta;
            this.angularVelocity = 0;
        }
        const nextAngle = currentAngle + angularStep;
        this.guardDirection.set(Math.cos(nextAngle), Math.sin(nextAngle));
        return null;
    }
    blocksImpactFrom(enemy, sourcePosition) {
        if (!sourcePosition || !Number.isFinite(sourcePosition.x) || !Number.isFinite(sourcePosition.y)) return false;
        const sourceDirection = directionBetween(enemy.position, sourcePosition);
        if (sourceDirection.length() === ENEMY_BEHAVIOR_CONFIG.ZERO) return false;
        return this.guardDirection.dot(sourceDirection) >= Math.cos(this.guardHalfAngle);
    }
    snapshot() {
        return Object.freeze({
            kind: this.kind,
            state: SHIELD_BEHAVIOR_STATE.GUARD,
            guardDirection: frozenDirection(this.guardDirection),
            angularVelocity: this.angularVelocity,
            guardHalfAngle: this.guardHalfAngle
        });
    }
    restore(snapshot = {}) {
        this.guardDirection.set(snapshot.guardDirection?.x ?? 1, snapshot.guardDirection?.y ?? 0).normalize();
        if (this.guardDirection.length() === ENEMY_BEHAVIOR_CONFIG.ZERO) this.guardDirection.set(1, 0);
        this.angularVelocity = Number.isFinite(snapshot.angularVelocity) ? snapshot.angularVelocity : 0;
    }
}
