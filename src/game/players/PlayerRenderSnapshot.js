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
            ropeDisabledRemaining: this.ropeDisabledRemaining,
            lifeState: this.lifeState,
            ropeImpactState: this.ropeImpactState.snapshot(),
            weapon: {
                range: this.weapon.range,
                damage: this.weapon.damage,
                fireInterval: this.weapon.fireInterval,
                cooldown: this.weapon.cooldown
            },
            selectedAugmentIds: this.augmentLoadout.selectedAugmentIds,
            augmentRuntimeState: Object.freeze({
                ...this.augmentLoadout.snapshot(),
                experience: this.experience.snapshot(),
                combat: this.augmentCombat.snapshot()
            }),
            statusEffects: this.statusEffects.snapshot(),
            experience: this.experience.snapshot()
        };
    }
});
