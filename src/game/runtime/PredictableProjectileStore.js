import { CLIENT_PROJECTILE_COLLISION_CAPABILITY } from "../combat/ProjectileClientCollision.js";
import { createProjectileObject, PROJECTILE_MOTION_CAPABILITY } from "../combat/ProjectileObject.js";
import { SimulationDispatcher } from "../simulation/SimulationDispatcher.js";

const FIXED_DT = 1 / 120;
const simulationDispatcher = new SimulationDispatcher();

function createReplicatedProjectile({ objectType, speed, hadLocalPrediction, ...state }) {
    return createProjectileObject({ objectType, speed, hadLocalPrediction, ...state });
}

function length(vector) {
    return Math.hypot(vector.x, vector.y);
}

function advanceProjectile(projectile, dt, state) {
    const outcomes = simulationDispatcher.dispatch({
        objects: [projectile],
        capabilityId: PROJECTILE_MOTION_CAPABILITY,
        context: { dt, state }
    });
    if (outcomes.length !== 1) {
        throw new Error(`replicated projectile ${projectile.id} has no ${PROJECTILE_MOTION_CAPABILITY} capability`);
    }
}

function createImpactBudget() {
    let claimed = false;
    return Object.freeze({
        tryClaim() {
            if (claimed) return false;
            claimed = true;
            return true;
        }
    });
}

function findPendingPrediction(objects, event) {
    if (!event.parameters?.predictionId) return null;
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
                    if (existingProjectile?.isClientCollisionPredictionEnabled()) this.predictionCancellations += 1;
                }
                if (this.locallyResolvedObjectIds.delete(event.objectId)) continue;
                feedbackEvents.push(event);
                continue;
            }
            if (event.eventType !== "spawn") {
                feedbackEvents.push(event);
                continue;
            }
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
                canCutRope: event.parameters.canCutRope ?? false,
                position: predicted ? { ...predicted.position } : { ...event.position },
                velocity: predicted ? { ...predicted.velocity } : { ...event.velocity },
                speed: event.parameters.speed ?? length(event.velocity),
                predictionId,
                hadLocalPrediction: Boolean(predictionId && predicted)
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
                    hadLocalPrediction: true
                })
            );
        }
    }

    update(dt, state, clientTick = 0) {
        const resolutions = [];
        const projectiles = [...this.objects.values()];
        for (const projectile of projectiles) advanceProjectile(projectile, dt, state);
        const outcomes = simulationDispatcher.dispatch({
            objects: projectiles,
            capabilityId: CLIENT_PROJECTILE_COLLISION_CAPABILITY,
            context: { state, clientTick, impactBudget: createImpactBudget() }
        });
        if (outcomes.length !== projectiles.length) {
            throw new Error("every replicated projectile must expose client collision capability");
        }
        for (const { result } of outcomes) {
            if (!result) continue;
            if (result.predictionId) this.locallyResolvedPredictionIds.add(result.predictionId);
            if (result.projectileId) this.locallyResolvedObjectIds.add(result.projectileId);
            resolutions.push(result);
        }
        return Object.freeze(resolutions);
    }

    applyImpactReceipts(receipts) {
        for (const receipt of receipts) {
            const impactId = receipt.impactId ?? receipt.projectileId;
            if (receipt.accepted || !this.objects.has(impactId)) continue;
            this.objects.delete(impactId);
        }
    }

    applyHitClaimReceipts(receipts) {
        for (const receipt of receipts) {
            if (receipt.accepted) continue;
            const objectId = this.objectIdByPredictionId.get(receipt.predictionId);
            const projectile = objectId ? this.objects.get(objectId) : null;
            if (!projectile || !projectile.rejectClientCollision()) continue;
            if (!projectile.isClientVisible()) this.objects.delete(objectId);
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
        const collections = { projectiles, enemyProjectiles };
        for (const projectile of this.objects.values()) {
            if (!projectile.isClientVisible()) continue;
            collections[projectile.renderCollection].push(projectile.renderSnapshot());
        }
        return { projectiles, enemyProjectiles };
    }

    metrics() {
        return Object.freeze({ predictionCancellations: this.predictionCancellations });
    }
}
