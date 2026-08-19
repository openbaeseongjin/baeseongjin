import { createRenderSnapshotCapabilityMixin, snapshotVector } from "../objects/RenderSnapshotCapability.js";

export const withPlayerRenderSnapshot = createRenderSnapshotCapabilityMixin({
    kind: "player",
    snapshot() {
        return {
            id: this.id,
            position: snapshotVector(this.physics.position),
            velocity: snapshotVector(this.physics.velocity),
            angle: this.physics.angle,
            angularVelocity: this.physics.angularVelocity,
            isGrounded: this.physics.isGrounded,
            collider: this.physics.collider.snapshot(),
            health: this.health,
            maxHealth: this.maxHealth,
            hitInvulnerabilityRemaining: this.hitInvulnerabilityRemaining,
            ropeDisabledRemaining: this.ropeDisabledRemaining,
            lifeState: this.lifeState,
            weapon: {
                range: this.weapon.range,
                damage: this.weapon.damage,
                fireInterval: this.weapon.fireInterval,
                cooldown: this.weapon.cooldown
            },
            foundationAugment: this.foundation.selectedId,
            selectedAugmentIds: this.foundation.selectedIds,
            augmentRuntimeState: Object.freeze({
                ...this.foundation.snapshot(),
                combat: this.augmentCombat.snapshot()
            }),
            actionState: this.augmentCombat.actionState?.snapshot() ?? null
        };
    }
});
