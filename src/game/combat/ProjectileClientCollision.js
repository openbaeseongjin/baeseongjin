import { createSimulationCapabilityMixin } from "../simulation/SimulationCapability.js";
import { colliderSnapshotBoundingRadius, colliderSnapshotsOverlap } from "../physics/colliders/Collider.js";
import { ropeAttachmentPoint } from "../rope/RopeAttachment.js";
import { combatTargetBlocksImpactFrom, combatTargetColliderSnapshot } from "./CombatTargetGeometry.js";
import { IMPACT_TARGET_KIND } from "./ImpactTarget.js";

export const CLIENT_PROJECTILE_COLLISION_CAPABILITY = "client-projectile-collision";

function targetResolution(target, damage, contactPosition) {
    if (combatTargetBlocksImpactFrom(target, contactPosition)) return "shield-blocked";
    if (target.impactTargetKind === IMPACT_TARGET_KIND.BOSS) {
        return target.health <= damage ? "boss-defeated" : "boss-hit";
    }
    return target.health <= damage ? "enemy-defeated" : "enemy-hit";
}

function distancePointToSegment(point, start, end) {
    const segmentX = end.x - start.x;
    const segmentY = end.y - start.y;
    const lengthSquared = segmentX * segmentX + segmentY * segmentY;
    if (lengthSquared === 0) return Math.hypot(point.x - start.x, point.y - start.y);
    const projection = Math.max(
        0,
        Math.min(1, ((point.x - start.x) * segmentX + (point.y - start.y) * segmentY) / lengthSquared)
    );
    return Math.hypot(point.x - (start.x + segmentX * projection), point.y - (start.y + segmentY * projection));
}

function pointAlongSegment(start, end, ratio) {
    return Object.freeze({
        x: start.x + (end.x - start.x) * ratio,
        y: start.y + (end.y - start.y) * ratio
    });
}

function projectileOverlapsTarget(projectile, target, position, collider = projectile.colliderSnapshot()) {
    return colliderSnapshotsOverlap(combatTargetColliderSnapshot(target), target.position, collider, position);
}

function projectileSweptTargetContact(projectile, target, { start, end, collider }) {
    if (projectileOverlapsTarget(projectile, target, start, collider)) {
        return Object.freeze({ ratio: 0, position: start });
    }
    const travel = Math.hypot(end.x - start.x, end.y - start.y);
    const stepDistance = Math.max(1, colliderSnapshotBoundingRadius(collider) * 0.25);
    const sampleCount = Math.min(128, Math.max(1, Math.ceil(travel / stepDistance)));
    let previousRatio = 0;
    for (let sample = 1; sample <= sampleCount; sample += 1) {
        const ratio = sample / sampleCount;
        const position = pointAlongSegment(start, end, ratio);
        if (!projectileOverlapsTarget(projectile, target, position, collider)) {
            previousRatio = ratio;
            continue;
        }
        let low = previousRatio;
        let high = ratio;
        for (let iteration = 0; iteration < 10; iteration += 1) {
            const middle = (low + high) * 0.5;
            if (projectileOverlapsTarget(projectile, target, pointAlongSegment(start, end, middle), collider)) {
                high = middle;
            } else {
                low = middle;
            }
        }
        return Object.freeze({ ratio: high, position: pointAlongSegment(start, end, high) });
    }
    return null;
}

export const withEnemyHitPrediction = createSimulationCapabilityMixin({
    id: CLIENT_PROJECTILE_COLLISION_CAPABILITY,
    order: 30,
    apply({ state, clientTick }) {
        const target = state?.combatTargets?.find(({ id }) => id === this.targetId);
        const segments = this.consumeClientCollisionSegments();
        const currentOverlap = Boolean(target && projectileOverlapsTarget(this, target, this.position));
        const hitContact = target
            ? segments
                  .map((segment) => projectileSweptTargetContact(this, target, segment))
                  .find((contact) => contact !== null)
            : null;
        if (
            !this.observeClientCollision(Boolean(hitContact) || currentOverlap, currentOverlap) ||
            !target ||
            !this.predictionId
        ) {
            return null;
        }
        this.beginClientCollision();
        return Object.freeze({
            eventType: "predicted-resolve",
            predictionId: this.predictionId,
            sourcePlayerId: this.ownerId,
            targetId: this.targetId,
            clientTick,
            resolution: targetResolution(target, this.damage, hitContact?.position ?? this.position),
            position: { ...(hitContact?.position ?? this.position) },
            parameters: { damage: this.damage, ownerId: this.ownerId, sourceKind: "projectile" }
        });
    }
});

export const withPlayerImpactPrediction = createSimulationCapabilityMixin({
    id: CLIENT_PROJECTILE_COLLISION_CAPABILITY,
    order: 30,
    apply({ state, clientTick }) {
        const player = state?.localPlayer;
        const canHitPlayer = player?.lifeState === "active";
        const segments = this.consumeClientCollisionSegments();
        const currentRopeHit = Boolean(
            this.canCutRope &&
            canHitPlayer &&
            player.rope?.isAttached &&
            distancePointToSegment(this.position, ropeAttachmentPoint(player, player.rope), player.rope.anchor) <=
                this.radius
        );
        const sweptRopeHit = Boolean(
            this.canCutRope &&
            canHitPlayer &&
            player.rope?.isAttached &&
            segments.some(
                ({ start, end }) =>
                    distancePointToSegment(start, ropeAttachmentPoint(player, player.rope), player.rope.anchor) <=
                        this.radius ||
                    distancePointToSegment(end, ropeAttachmentPoint(player, player.rope), player.rope.anchor) <=
                        this.radius
            )
        );
        const currentBodyHit = Boolean(
            canHitPlayer &&
            !currentRopeHit &&
            player.health > 0 &&
            projectileOverlapsTarget(this, player, this.position)
        );
        const bodyHitContact =
            canHitPlayer && !currentRopeHit && player.health > 0
                ? segments
                      .map((segment) => projectileSweptTargetContact(this, player, segment))
                      .find((contact) => contact !== null)
                : null;
        const ropeHit = currentRopeHit || sweptRopeHit;
        const bodyHit = !ropeHit && (currentBodyHit || Boolean(bodyHitContact));
        const isOverlapping = ropeHit || bodyHit;
        if (!this.observeClientCollision(isOverlapping, currentRopeHit || currentBodyHit) || !player) return null;
        this.beginClientCollision();
        return Object.freeze({
            eventType: "predicted-resolve",
            projectileId: this.id,
            targetId: player.id,
            clientTick,
            resolution: ropeHit ? "rope-cut" : "player-hit",
            position: { ...(bodyHitContact?.position ?? this.position) },
            velocity: { ...this.velocity },
            parameters: { damage: this.damage, ownerId: this.ownerId, sourceKind: "projectile" }
        });
    }
});
