import { BallisticProjectileObject, HomingProjectileObject } from "../combat/ProjectileObject.js";
import { SimulationDispatcher } from "../simulation/SimulationDispatcher.js";

const FIXED_DT = 1 / 120;
const simulationDispatcher = new SimulationDispatcher();

function createReplicatedProjectile({ objectType, speed, predictCollision, ...state }) {
    const ProjectileClass = objectType === "player-projectile" ? HomingProjectileObject : BallisticProjectileObject;
    const projectile = new ProjectileClass(state);
    projectile.objectType = objectType;
    projectile.speed = speed;
    projectile.predictCollision = predictCollision;
    return projectile;
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

function length(vector) {
    return Math.hypot(vector.x, vector.y);
}

function advanceProjectile(projectile, dt, state) {
    let targetPosition = null;
    let capabilityId = "ballistic-projectile-motion";
    if (projectile.objectType === "player-projectile") {
        const target = state?.enemies?.find(({ id }) => id === projectile.targetId);
        targetPosition = target?.position ?? null;
        capabilityId = "homing-projectile-motion";
    }
    const outcomes = simulationDispatcher.dispatch({
        objects: [projectile],
        capabilityId,
        context: { dt, targetPosition, speed: projectile.speed }
    });
    if (outcomes.length !== 1) {
        throw new Error(`replicated projectile ${projectile.id} has no ${capabilityId} capability`);
    }
}

function findPendingPrediction(objects, event) {
    if (event.objectType !== "player-projectile") return null;
    for (const projectile of objects.values()) {
        if (
            projectile.id.startsWith("predicted:") &&
            projectile.objectType === event.objectType &&
            projectile.ownerId === event.parameters.ownerId &&
            projectile.targetId === event.parameters.targetId
        ) {
            return projectile;
        }
    }
    return null;
}

export class PredictableProjectileStore {
    constructor({ fixedDt = FIXED_DT } = {}) {
        this.fixedDt = fixedDt;
        this.objects = new Map();
        this.objectIdByPredictionId = new Map();
        this.predictionIdByAuthorityId = new Map();
        this.locallyResolvedPredictionIds = new Set();
        this.locallyResolvedObjectIds = new Set();
        this.predictionCancellations = 0;
    }

    apply(events, serverTick, state) {
        const feedbackEvents = [];
        for (const event of events) {
            if (event.protocolVersion !== 1) {
                feedbackEvents.push(event);
                continue;
            }
            if (event.eventType === "resolve") {
                const existingProjectile = this.objects.get(event.objectId);
                this.objects.delete(event.objectId);
                const predictionId = this.predictionIdByAuthorityId.get(event.objectId);
                if (predictionId) {
                    this.predictionIdByAuthorityId.delete(event.objectId);
                    this.objectIdByPredictionId.delete(predictionId);
                    if (this.locallyResolvedPredictionIds.delete(predictionId)) continue;
                    if (existingProjectile?.predictCollision) this.predictionCancellations += 1;
                }
                if (this.locallyResolvedObjectIds.delete(event.objectId)) continue;
                feedbackEvents.push(event);
                continue;
            }
            if (event.eventType !== "spawn") continue;
            const authorityPredictionId = event.parameters.predictionId;
            let predictedObjectId = authorityPredictionId
                ? this.objectIdByPredictionId.get(authorityPredictionId)
                : null;
            let predicted = predictedObjectId ? this.objects.get(predictedObjectId) : null;
            predicted ??= findPendingPrediction(this.objects, event);
            predictedObjectId ??= predicted?.id ?? null;
            const predictionId = predicted?.predictionId ?? authorityPredictionId;
            if (predictedObjectId) this.objects.delete(predictedObjectId);
            if (predictionId) {
                this.objectIdByPredictionId.set(predictionId, event.objectId);
                this.predictionIdByAuthorityId.set(event.objectId, predictionId);
            }
            if (predictionId && this.locallyResolvedPredictionIds.has(predictionId)) continue;
            const projectile = createReplicatedProjectile({
                id: event.objectId,
                objectType: event.objectType,
                ownerId: event.parameters.ownerId,
                targetId: event.parameters.targetId,
                radius: event.parameters.radius,
                damage: event.parameters.damage,
                position: predicted ? { ...predicted.position } : { ...event.position },
                velocity: predicted ? { ...predicted.velocity } : { ...event.velocity },
                speed: event.parameters.speed ?? length(event.velocity),
                predictionId,
                predictCollision: event.objectType === "enemy-projectile" || Boolean(predictionId && predicted)
            });
            if (!predicted) {
                const delayedTicks = Math.max(0, serverTick - event.tick);
                for (let tick = 0; tick < delayedTicks; tick += 1) advanceProjectile(projectile, this.fixedDt, state);
            }
            this.objects.set(projectile.id, projectile);
        }
        return Object.freeze(feedbackEvents);
    }

    predict(events) {
        for (const event of events) {
            if (event.eventType !== "predicted-spawn") continue;
            if (
                this.objectIdByPredictionId.has(event.predictionId) ||
                this.locallyResolvedPredictionIds.has(event.predictionId)
            ) {
                continue;
            }
            const objectId = `predicted:${event.predictionId}`;
            this.objectIdByPredictionId.set(event.predictionId, objectId);
            this.objects.set(
                objectId,
                createReplicatedProjectile({
                    id: objectId,
                    objectType: event.objectType,
                    ownerId: event.ownerId,
                    targetId: event.targetId,
                    radius: event.radius,
                    damage: event.damage,
                    position: { ...event.position },
                    velocity: { ...event.velocity },
                    speed: event.speed,
                    predictionId: event.predictionId,
                    predictCollision: true
                })
            );
        }
    }

    update(dt, state, clientTick = 0) {
        const resolutions = [];
        let localPlayerImpactClaimed = false;
        for (const projectile of [...this.objects.values()]) {
            advanceProjectile(projectile, dt, state);
            if (projectile.pendingImpactClaim || projectile.pendingHitClaim) continue;
            if (!projectile.predictCollision) continue;
            if (projectile.objectType === "enemy-projectile") {
                if (localPlayerImpactClaimed) continue;
                const player = state?.localPlayer;
                if (!player || player.lifeState !== "active") continue;
                const ropeHit =
                    player.rope?.isAttached &&
                    distancePointToSegment(projectile.position, player.position, player.rope.anchor) <=
                        projectile.radius;
                const bodyHit =
                    !ropeHit &&
                    player.health > 0 &&
                    (player.hitInvulnerabilityRemaining ?? 0) <= 0 &&
                    Math.hypot(projectile.position.x - player.position.x, projectile.position.y - player.position.y) <=
                        projectile.radius + player.radius;
                if (!ropeHit && !bodyHit) continue;
                localPlayerImpactClaimed = true;
                projectile.pendingImpactClaim = true;
                this.locallyResolvedObjectIds.add(projectile.id);
                resolutions.push(
                    Object.freeze({
                        eventType: "predicted-resolve",
                        projectileId: projectile.id,
                        targetId: player.id,
                        clientTick,
                        resolution: ropeHit ? "rope-cut" : "player-hit",
                        position: ropeHit ? { ...projectile.position } : { ...player.position },
                        velocity: { ...projectile.velocity },
                        parameters: { damage: projectile.damage }
                    })
                );
                continue;
            }
            if (projectile.objectType !== "player-projectile") continue;
            const target = state?.enemies?.find(({ id }) => id === projectile.targetId);
            if (!target) continue;
            const hitDistance = Math.hypot(
                projectile.position.x - target.position.x,
                projectile.position.y - target.position.y
            );
            if (hitDistance > projectile.radius + target.radius) continue;
            projectile.pendingHitClaim = true;
            this.locallyResolvedPredictionIds.add(projectile.predictionId);
            resolutions.push(
                Object.freeze({
                    eventType: "predicted-resolve",
                    predictionId: projectile.predictionId,
                    targetId: projectile.targetId,
                    clientTick,
                    resolution: target.health <= projectile.damage ? "enemy-defeated" : "enemy-hit",
                    position: { ...target.position },
                    parameters: { damage: projectile.damage }
                })
            );
        }
        return Object.freeze(resolutions);
    }

    applyImpactReceipts(receipts) {
        for (const receipt of receipts) {
            const projectile = this.objects.get(receipt.projectileId);
            if (!projectile?.pendingImpactClaim || receipt.accepted) continue;
            projectile.pendingImpactClaim = false;
            this.locallyResolvedObjectIds.delete(receipt.projectileId);
            this.predictionCancellations += 1;
        }
    }

    applyHitClaimReceipts(receipts) {
        for (const receipt of receipts) {
            if (receipt.accepted) continue;
            const objectId = this.objectIdByPredictionId.get(receipt.predictionId);
            const projectile = objectId ? this.objects.get(objectId) : null;
            if (!projectile?.pendingHitClaim) continue;
            projectile.pendingHitClaim = false;
            this.locallyResolvedPredictionIds.delete(receipt.predictionId);
            this.predictionCancellations += 1;
        }
    }

    applySpawnClaimReceipts(receipts) {
        for (const receipt of receipts) {
            if (receipt.accepted) continue;
            const objectId = this.objectIdByPredictionId.get(receipt.predictionId);
            if (!objectId) continue;
            this.objects.delete(objectId);
            this.objectIdByPredictionId.delete(receipt.predictionId);
            this.predictionIdByAuthorityId.delete(objectId);
            this.locallyResolvedPredictionIds.delete(receipt.predictionId);
            this.predictionCancellations += 1;
        }
    }

    snapshot() {
        const projectiles = [];
        const enemyProjectiles = [];
        for (const projectile of this.objects.values()) {
            if (projectile.pendingImpactClaim || projectile.pendingHitClaim) continue;
            const target = projectile.objectType === "enemy-projectile" ? enemyProjectiles : projectiles;
            target.push({ ...projectile, position: { ...projectile.position }, velocity: { ...projectile.velocity } });
        }
        return { projectiles, enemyProjectiles };
    }

    metrics() {
        return Object.freeze({ predictionCancellations: this.predictionCancellations });
    }
}
