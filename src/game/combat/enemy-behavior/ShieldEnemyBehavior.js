import { Vector2 } from "../../../game-kit/index.js";
import { ENEMY_BEHAVIOR_CONFIG, ENEMY_BEHAVIOR_KIND, SHIELD_BEHAVIOR_STATE } from "./EnemyBehaviorDefinition.js";
import { clamp, directionBetween, frozenDirection, nearestTarget, validateBehaviorDt } from "./EnemyBehaviorSupport.js";

export class ShieldEnemyBehavior {
    constructor({ guardDirection = { x: 1, y: 0 }, turnSpeed = Math.PI * 1.5, guardHalfAngle = Math.PI / 3 } = {}) {
        this.kind = ENEMY_BEHAVIOR_KIND.SHIELD;
        this.guardDirection = new Vector2(guardDirection.x, guardDirection.y).normalize();
        if (this.guardDirection.length() === ENEMY_BEHAVIOR_CONFIG.ZERO) this.guardDirection.set(1, 0);
        this.turnSpeed = turnSpeed;
        this.guardHalfAngle = guardHalfAngle;
    }
    advance(enemy, { targets = [], dt = 0 } = {}) {
        validateBehaviorDt(dt);
        const target = nearestTarget(enemy, targets, Number.POSITIVE_INFINITY);
        if (!target) return null;
        const desired = directionBetween(enemy.position, target.physics.position);
        const currentAngle = Math.atan2(this.guardDirection.y, this.guardDirection.x);
        const desiredAngle = Math.atan2(desired.y, desired.x);
        const delta = Math.atan2(Math.sin(desiredAngle - currentAngle), Math.cos(desiredAngle - currentAngle));
        const nextAngle = currentAngle + clamp(delta, -this.turnSpeed * dt, this.turnSpeed * dt);
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
            guardHalfAngle: this.guardHalfAngle
        });
    }
    restore(snapshot = {}) {
        this.guardDirection.set(snapshot.guardDirection?.x ?? 1, snapshot.guardDirection?.y ?? 0).normalize();
        if (this.guardDirection.length() === ENEMY_BEHAVIOR_CONFIG.ZERO) this.guardDirection.set(1, 0);
    }
}
