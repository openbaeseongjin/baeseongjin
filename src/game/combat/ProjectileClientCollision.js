import { createSimulationCapabilityMixin } from "../simulation/SimulationCapability.js";
import { colliderSnapshotOverlapsCircle } from "../physics/colliders/Collider.js";

export const CLIENT_PROJECTILE_COLLISION_CAPABILITY = "client-projectile-collision";

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

export const withEnemyHitPrediction = createSimulationCapabilityMixin({
    id: CLIENT_PROJECTILE_COLLISION_CAPABILITY,
    order: 30,
    apply({ state, clientTick }) {
        const target = state?.enemies?.find(({ id }) => id === this.targetId);
        const isOverlapping = Boolean(
            target &&
            Math.hypot(this.position.x - target.position.x, this.position.y - target.position.y) <=
                this.radius + target.radius
        );
        if (!this.observeClientCollision(isOverlapping) || !target || !this.predictionId) return null;
        this.beginClientCollision();
        return Object.freeze({
            eventType: "predicted-resolve",
            predictionId: this.predictionId,
            sourcePlayerId: this.ownerId,
            targetId: this.targetId,
            clientTick,
            resolution: target.health <= this.damage ? "enemy-defeated" : "enemy-hit",
            position: { ...target.position },
            parameters: { damage: this.damage }
        });
    }
});

export const withPlayerImpactPrediction = createSimulationCapabilityMixin({
    id: CLIENT_PROJECTILE_COLLISION_CAPABILITY,
    order: 30,
    apply({ state, clientTick, impactBudget }) {
        const player = state?.localPlayer;
        const canHitPlayer = player?.lifeState === "active";
        const ropeHit = Boolean(
            canHitPlayer &&
            player.rope?.isAttached &&
            distancePointToSegment(this.position, player.position, player.rope.anchor) <= this.radius
        );
        const bodyHit = Boolean(
            canHitPlayer &&
            !ropeHit &&
            player.health > 0 &&
            (player.hitInvulnerabilityRemaining ?? 0) <= 0 &&
            colliderSnapshotOverlapsCircle(player.collider, player.position, this.position, this.radius)
        );
        const isOverlapping = ropeHit || bodyHit;
        if (!this.observeClientCollision(isOverlapping) || !player) return null;
        if (!impactBudget.tryClaim()) return null;
        this.beginClientCollision();
        return Object.freeze({
            eventType: "predicted-resolve",
            projectileId: this.id,
            targetId: player.id,
            clientTick,
            resolution: ropeHit ? "rope-cut" : "player-hit",
            position: ropeHit ? { ...this.position } : { ...player.position },
            velocity: { ...this.velocity },
            parameters: { damage: this.damage }
        });
    }
});
