import { createRenderSnapshotCapabilityMixin, snapshotVector } from "../objects/RenderSnapshotCapability.js";

function patrolState(patrol) {
    if (!patrol) return null;
    return {
        ...patrol,
        points: patrol.points.map((point) => ({ ...point }))
    };
}

export const withEnemyRenderSnapshot = createRenderSnapshotCapabilityMixin({
    kind: "enemy",
    snapshot() {
        return {
            id: this.id,
            position: snapshotVector(this.position),
            level: this.level,
            areaId: this.areaId,
            objectId: this.objectId,
            enemyType: this.enemyType,
            displayName: this.displayName,
            activation: this.activation ? { ...this.activation } : null,
            patrol: patrolState(this.patrol),
            swarmGroupId: this.swarmGroupId,
            behaviorState: this.enemyBehaviorSnapshot(),
            impactDisplacementEnabled: this.impactDisplacementEnabled,
            knockbackState: this.knockbackSnapshot(),
            lockedTargetId: this.lockedTargetId,
            attackState: this.attackState,
            attackStateRemaining: this.attackStateRemaining,
            aimDirection: snapshotVector(this.aimDirection),
            rules: [...this.rules],
            radius: this.radius,
            health: this.health,
            maxHealth: this.maxHealth,
            fireCooldown: this.fireCooldown
        };
    }
});
