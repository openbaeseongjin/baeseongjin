import { createRenderSnapshotCapabilityMixin, snapshotVector } from "../objects/RenderSnapshotCapability.js";

export const withPlayerRenderSnapshot = createRenderSnapshotCapabilityMixin({
    kind: "player",
    snapshot() {
        const velocity = this.physics.physicsStepVelocity();
        return {
            id: this.id,
            position: snapshotVector(this.physics.position),
            velocity: snapshotVector(velocity),
            angle: this.physics.angle,
            angularVelocity: this.physics.angularStepVelocity(),
            isGrounded: this.physics.isGrounded,
            collider: this.physics.collider.snapshot(),
            health: this.health,
            maxHealth: this.maxHealth,
            hitInvulnerabilityRemaining: this.hitInvulnerabilityRemaining,
            ropeDisabledRemaining: this.ropeDisabledRemaining,
            lifeState: this.lifeState,
            ropeImpactState: this.ropeImpactState.snapshot(),
            weapon: {
                range: this.weapon.range,
                damage: this.weapon.damage,
                fireInterval: this.weapon.fireInterval,
                cooldown: this.weapon.cooldown
            },
            foundationAugment: this.foundation.selectedId,
            selectedAugmentIds: this.foundation.selectedIds,
            calibrationVerifiedSourceIds: Object.freeze([...this.calibrationVerifiedSourceIds]),
            augmentRuntimeState: Object.freeze({
                ...this.foundation.snapshot(),
                combat: this.augmentCombat.snapshot()
            }),
            actionState: this.augmentCombat.actionState?.snapshot() ?? null
        };
    }
});
