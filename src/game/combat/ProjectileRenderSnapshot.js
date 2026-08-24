import { createRenderSnapshotCapabilityMixin, snapshotVector } from "../objects/RenderSnapshotCapability.js";

export const withProjectileRenderSnapshot = createRenderSnapshotCapabilityMixin({
    kind: "projectile",
    snapshot() {
        return {
            id: this.id,
            ownerId: this.ownerId,
            targetId: this.targetId ?? null,
            position: snapshotVector(this.position),
            velocity: snapshotVector(this.velocity),
            damage: this.damage,
            radius: this.radius,
            ageSeconds: this.ageSeconds,
            speed: this.speed,
            objectType: this.objectType,
            motionKind: this.motionKind,
            visualPresetId: this.visualPresetId,
            turnRateRadiansPerSecond: this.turnRateRadiansPerSecond,
            lifetimeSeconds: this.lifetimeSeconds,
            canCutRope: this.canCutRope,
            predictionId: this.predictionId ?? null
        };
    }
});
