const FIXED_DT = 1 / 120;

function length(vector) {
    return Math.hypot(vector.x, vector.y);
}

function advanceProjectile(projectile, dt, state) {
    if (projectile.objectType === "player-projectile") {
        const target = state?.enemies?.find(({ id }) => id === projectile.targetId);
        if (target) {
            const dx = target.position.x - projectile.position.x;
            const dy = target.position.y - projectile.position.y;
            const distance = Math.hypot(dx, dy);
            if (distance > 0) {
                projectile.velocity.x = (dx / distance) * projectile.speed;
                projectile.velocity.y = (dy / distance) * projectile.speed;
            }
        }
    }
    projectile.position.x += projectile.velocity.x * dt;
    projectile.position.y += projectile.velocity.y * dt;
}

export class PredictableProjectileStore {
    constructor({ fixedDt = FIXED_DT } = {}) {
        this.fixedDt = fixedDt;
        this.objects = new Map();
        this.objectIdByPredictionId = new Map();
        this.predictionIdByAuthorityId = new Map();
        this.locallyResolvedPredictionIds = new Set();
    }

    apply(events, serverTick, state) {
        const feedbackEvents = [];
        for (const event of events) {
            if (event.protocolVersion !== 1) {
                feedbackEvents.push(event);
                continue;
            }
            if (event.eventType === "resolve") {
                this.objects.delete(event.objectId);
                const predictionId = this.predictionIdByAuthorityId.get(event.objectId);
                if (predictionId) {
                    this.predictionIdByAuthorityId.delete(event.objectId);
                    this.objectIdByPredictionId.delete(predictionId);
                    if (this.locallyResolvedPredictionIds.delete(predictionId)) continue;
                }
                feedbackEvents.push(event);
                continue;
            }
            if (event.eventType !== "spawn") continue;
            const predictionId = event.parameters.predictionId;
            const predictedObjectId = predictionId ? this.objectIdByPredictionId.get(predictionId) : null;
            const predicted = predictedObjectId ? this.objects.get(predictedObjectId) : null;
            if (predictedObjectId) this.objects.delete(predictedObjectId);
            if (predictionId) {
                this.objectIdByPredictionId.set(predictionId, event.objectId);
                this.predictionIdByAuthorityId.set(event.objectId, predictionId);
            }
            if (predictionId && this.locallyResolvedPredictionIds.has(predictionId)) continue;
            const projectile = {
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
                predictCollision: Boolean(predictionId && predicted)
            };
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
            this.objects.set(objectId, {
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
            });
        }
    }

    update(dt, state, clientTick = 0) {
        const resolutions = [];
        for (const projectile of [...this.objects.values()]) {
            advanceProjectile(projectile, dt, state);
            if (!projectile.predictCollision || projectile.objectType !== "player-projectile") continue;
            const target = state?.enemies?.find(({ id }) => id === projectile.targetId);
            if (!target) continue;
            const hitDistance = Math.hypot(
                projectile.position.x - target.position.x,
                projectile.position.y - target.position.y
            );
            if (hitDistance > projectile.radius + target.radius) continue;
            this.objects.delete(projectile.id);
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

    snapshot() {
        const projectiles = [];
        const enemyProjectiles = [];
        for (const projectile of this.objects.values()) {
            const target = projectile.objectType === "enemy-projectile" ? enemyProjectiles : projectiles;
            target.push({ ...projectile, position: { ...projectile.position }, velocity: { ...projectile.velocity } });
        }
        return { projectiles, enemyProjectiles };
    }
}
