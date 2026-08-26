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
            velocity: snapshotVector(this.velocity),
            collider: this.collider.snapshot(),
            level: this.level,
            sectorId: this.sectorId,
            areaId: this.areaId,
            objectId: this.objectId,
            enemyType: this.enemyType,
            displayName: this.displayName,
            activation: this.activation ? { ...this.activation } : null,
            awakened: this.awakened,
            patrol: patrolState(this.patrol),
            swarmGroupId: this.swarmGroupId,
            behaviorState: this.enemyBehaviorSnapshot(),
            impactDisplacementEnabled: this.impactDisplacementEnabled,
            motionType: this.motionType,
            knockbackState: this.knockbackSnapshot(),
            lockedTargetId: this.lockedTargetId,
            attackState: this.attackState,
            attackStateRemaining: this.attackStateRemaining,
            aimDirection: snapshotVector(this.aimDirection),
            presentationAimDirection: snapshotVector(this.presentationAimDirection),
            rules: [...this.rules],
            radius: this.radius,
            health: this.health,
            maxHealth: this.maxHealth,
            experienceReward: this.experienceReward,
            fireCooldown: this.fireCooldown,
            statusEffects: this.statusEffects.snapshot()
        };
    }
});
