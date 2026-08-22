import { appendCombatFeedback, createImpactState, updateCombatFeedback } from "./CombatFeedback.js";
import {
    createClientFeedbackEventObject,
    PERSONAL_CLIENT_FEEDBACK_CAPABILITY,
    SHARED_CLIENT_FEEDBACK_CAPABILITY
} from "./ClientFeedbackEventObject.js";
import { SimulationDispatcher } from "../simulation/SimulationDispatcher.js";
import { appendParticlePreset } from "./ParticlePresentation.js";

const COMBAT_RESOLUTIONS = new Set(["enemy-hit", "enemy-defeated", "player-hit", "rope-cut", "fall-damage"]);
const ACTION_FEEDBACK_CAUSAL_LIMIT = 128;

function directionTo(from, to) {
    if (!from || !to) return null;
    return { x: to.x - from.x, y: to.y - from.y };
}

function particlePresetForAction(actionId) {
    if (actionId === "default-punch") return "player-punch";
    if (actionId === "straight-shot") return "player-shot";
    if (actionId === "instant-guard") return "player-guard";
    if (actionId === "direction-dash" || actionId === "dash-strike") return "player-dash";
    return "impact";
}

function eventResolution(event) {
    if (event.eventType === "player-fall-damaged" || event.eventType === "predicted-player-fall-damaged") {
        return "fall-damage";
    }
    return event.resolution;
}

function isCombatFeedbackEvent(event) {
    if (event.eventType === "player-fall-damaged" || event.eventType === "predicted-player-fall-damaged") {
        return true;
    }
    return (
        (event.eventType === "resolve" || event.eventType === "predicted-resolve") &&
        COMBAT_RESOLUTIONS.has(event.resolution)
    );
}

export class ClientCombatFeedback {
    constructor({ viewerId }) {
        if (typeof viewerId !== "string" || viewerId.length === 0) {
            throw new Error("ClientCombatFeedback requires a viewerId");
        }
        this.viewerId = viewerId;
        this.dispatcher = new SimulationDispatcher();
        this.effects = [];
        this.impact = null;
        this.ropeCutFeedback = null;
        this.augmentEffects = [];
        this.actionAfterimages = [];
        this.seenActionActivationIds = new Set();
        this.seenParticleCausalIds = new Set();
        this.continuousEmitterElapsed = new Map();
        this.continuousEmitterSequence = new Map();
        this.lastActionSequenceByPlayerId = new Map();
        this.visibleWorldBounds = null;
    }

    apply(events, { visibleWorldBounds = null } = {}) {
        this.visibleWorldBounds = visibleWorldBounds;
        for (const event of events) {
            this.appendEventParticles(event);
            if (
                event.eventType === "augment-action-started" ||
                event.eventType === "predicted-augment-action-started"
            ) {
                const activationId = event.activationId ?? event.parameters?.activationId;
                const actionOwnerId = event.playerId ?? event.ownerId ?? event.parameters?.playerId ?? this.viewerId;
                const presentationId = activationId ? `${actionOwnerId}:${activationId}` : null;
                if (presentationId && !this.seenActionActivationIds.has(presentationId)) {
                    this.seenActionActivationIds.add(presentationId);
                    if (this.seenActionActivationIds.size > ACTION_FEEDBACK_CAUSAL_LIMIT) {
                        this.seenActionActivationIds.delete(this.seenActionActivationIds.values().next().value);
                    }
                    this.actionAfterimages.push({
                        id: presentationId,
                        actionId: event.actionId ?? event.parameters?.actionId ?? "default-punch",
                        playerId: event.playerId ?? event.ownerId ?? event.parameters?.playerId ?? null,
                        position: event.position ?? event.parameters?.position,
                        direction: event.direction ?? event.parameters?.direction ?? { x: 1, y: 0 },
                        age: 0,
                        lifetime: 0.42
                    });
                }
            }
            if (event.parameters?.sourceKind !== "augment-impact") continue;
            const effectId = event.effectId ?? event.parameters.effectId;
            if (!effectId || event.resolution === "target-already-dead") continue;
            this.augmentEffects.push({
                id: event.eventId ?? event.parameters.eventId,
                type: effectId,
                resolution: event.resolution,
                position: event.position ?? event.parameters.contactPosition,
                sourcePosition: event.sourcePosition ?? event.parameters.sourcePosition ?? null,
                age: 0,
                lifetime: effectId === "damage-reflect" ? 0.28 : 0.45
            });
        }
        const feedbackEvents = events
            .filter(isCombatFeedbackEvent)
            .map((event, index) =>
                createClientFeedbackEventObject(
                    event.resolution === eventResolution(event)
                        ? event
                        : { ...event, resolution: eventResolution(event), parameters: { damage: event.damage } },
                    index
                )
            );
        this.dispatcher.dispatch({
            objects: feedbackEvents,
            capabilityId: SHARED_CLIENT_FEEDBACK_CAPABILITY,
            context: {
                appendShared: (event) =>
                    appendCombatFeedback(this.effects, event, { visibleWorldBounds: this.visibleWorldBounds })
            }
        });
        this.dispatcher.dispatch({
            objects: feedbackEvents,
            capabilityId: PERSONAL_CLIENT_FEEDBACK_CAPABILITY,
            context: {
                viewerId: this.viewerId,
                appendPersonal: (event) => {
                    const impact = createImpactState([event]);
                    if (impact) this.impact = impact;
                    if (event.type === "rope-cut") {
                        this.ropeCutFeedback = { type: "rope-cut", position: event.position, age: 0 };
                    }
                }
            }
        });
    }

    appendEventParticles(event) {
        const causalId =
            event.eventId ?? event.predictionId ?? event.activationId ?? event.objectId ?? event.projectileId;
        if (!causalId || this.seenParticleCausalIds.has(causalId)) return;
        const position = event.position ?? event.parameters?.position;
        if (!position) return;
        let presetId = null;
        let sourcePosition = position;
        let targetPosition = null;
        if (event.eventType === "augment-action-started" || event.eventType === "predicted-augment-action-started") {
            const actionId = event.actionId ?? event.parameters?.actionId;
            presetId = particlePresetForAction(actionId);
        } else if (event.eventType === "spawn" || event.eventType === "predicted-spawn") {
            const stationary = Math.hypot(event.velocity?.x ?? 0, event.velocity?.y ?? 0) < 1;
            presetId =
                event.objectType === "enemy-projectile"
                    ? stationary
                        ? "artillery-strike"
                        : "enemy-muzzle"
                    : "player-shot";
        } else if (event.eventType === "augment-shot-ended" || event.eventType === "predicted-augment-shot-ended") {
            presetId = "player-shot-impact";
        } else if (
            (event.eventType === "resolve" || event.eventType === "predicted-resolve") &&
            event.resolution === "shield-blocked"
        ) {
            presetId = "shield-block";
        } else if (
            (event.eventType === "resolve" || event.eventType === "predicted-resolve") &&
            (event.effectId ?? event.parameters?.effectId) === "damage-reflect"
        ) {
            presetId = "damage-reflect";
            sourcePosition = event.sourcePosition ?? event.parameters?.sourcePosition ?? position;
            targetPosition = position;
        }
        if (!presetId) return;
        this.seenParticleCausalIds.add(causalId);
        if (this.seenParticleCausalIds.size > ACTION_FEEDBACK_CAUSAL_LIMIT) {
            this.seenParticleCausalIds.delete(this.seenParticleCausalIds.values().next().value);
        }
        appendParticlePreset(this.effects, {
            presetId,
            position: sourcePosition,
            direction: event.direction ??
                event.parameters?.direction ??
                event.velocity ??
                directionTo(sourcePosition, targetPosition) ?? { x: 1, y: 0 },
            targetPosition,
            identity: `${event.playerId ?? event.ownerId ?? event.parameters?.sourcePlayerId ?? "world"}:${causalId}`,
            visibleWorldBounds: this.visibleWorldBounds
        });
    }

    syncContinuous(
        {
            enemies = [],
            players = [],
            projectiles = [],
            enemyProjectiles = [],
            augmentProjectiles = [],
            windStates = [],
            world = {}
        },
        dt,
        visibleWorldBounds
    ) {
        this.visibleWorldBounds = visibleWorldBounds;
        const active = new Set();
        const emit = (id, presetId, position, direction, options = {}) => {
            if (!position) return;
            active.add(id);
            const elapsed = (this.continuousEmitterElapsed.get(id) ?? 0) + dt;
            if (elapsed < 0.16) {
                this.continuousEmitterElapsed.set(id, elapsed);
                return;
            }
            this.continuousEmitterElapsed.set(id, 0);
            const sequence = (this.continuousEmitterSequence.get(id) ?? 0) + 1;
            this.continuousEmitterSequence.set(id, sequence);
            appendParticlePreset(this.effects, {
                presetId,
                position,
                direction,
                identity: `${id}:${sequence}`,
                density: 0.6,
                priority: 0,
                visibleWorldBounds,
                ...options
            });
        };
        const byId = new Map([...players, ...enemies].map((object) => [object.id, object]));
        for (const enemy of enemies) {
            const behavior = enemy.behaviorState ?? {};
            const state = behavior.state ?? enemy.attackState;
            if (enemy.attackState === "track" || enemy.attackState === "lock") {
                const aimDirection = enemy.aimDirection ?? enemy.presentationAimDirection;
                if (aimDirection)
                    emit(`aim:${enemy.id}:${enemy.attackState}`, "enemy-aim", enemy.position, aimDirection, {
                        density: enemy.attackState === "lock" ? 0.75 : 0.45
                    });
            }
            if (enemy.enemyType?.startsWith("shield") && state === "guard")
                emit(`shield:${enemy.id}`, "shield-flow", enemy.position, behavior.guardDirection);
            if (enemy.enemyType?.startsWith("support") && state === "link") {
                const supportTarget = byId.get(behavior.targetId)?.position;
                if (supportTarget)
                    emit(
                        `support:${enemy.id}`,
                        "support-link",
                        enemy.position,
                        directionTo(enemy.position, supportTarget),
                        { targetPosition: supportTarget }
                    );
            }
            if (enemy.enemyType?.startsWith("swarm") && (state === "orbit" || state === "dive"))
                emit(
                    `swarm:${enemy.id}:${state}`,
                    state === "dive" ? "swarm-dive" : "swarm-orbit",
                    enemy.position,
                    behavior.diveDirection
                );
            if (enemy.enemyType?.startsWith("pursuit") && (state === "windup" || state === "dash"))
                emit(
                    `pursuit:${enemy.id}`,
                    state === "windup" ? "pursuit-converge" : "enemy-muzzle",
                    enemy.position,
                    behavior.dashDirection,
                    { targetPosition: state === "windup" ? enemy.position : null }
                );
            if (enemy.enemyType?.startsWith("artillery") && state === "telegraph")
                emit(
                    `artillery:${enemy.id}`,
                    "artillery-warning",
                    behavior.targetPosition,
                    directionTo(enemy.position, behavior.targetPosition),
                    {
                        bounds: behavior.targetPosition && {
                            minX: behavior.targetPosition.x - (behavior.strikeRadius ?? 72),
                            minY: behavior.targetPosition.y - (behavior.strikeRadius ?? 72),
                            maxX: behavior.targetPosition.x + (behavior.strikeRadius ?? 72),
                            maxY: behavior.targetPosition.y + (behavior.strikeRadius ?? 72)
                        },
                        targetPosition: behavior.targetPosition
                    }
                );
        }
        const zones = world.windZones ?? [];
        const stateById = new Map(windStates.map((state) => [state.id, state]));
        for (const zone of zones) {
            const windState = stateById.get(zone.id);
            if (!windState || windState.phase === "lull") continue;
            const density =
                windState.phase === "warning"
                    ? 0.25
                    : windState.phase === "decay"
                      ? windState.multiplier
                      : Math.max(0.35, windState.multiplier);
            emit(
                `wind:${zone.id}`,
                "wind-flow",
                { x: zone.bounds.x + zone.bounds.width / 2, y: zone.bounds.y + zone.bounds.height / 2 },
                zone.direction,
                {
                    bounds: {
                        minX: zone.bounds.x,
                        minY: zone.bounds.y,
                        maxX: zone.bounds.x + zone.bounds.width,
                        maxY: zone.bounds.y + zone.bounds.height
                    },
                    density
                }
            );
        }
        for (const projectile of [...projectiles, ...enemyProjectiles, ...augmentProjectiles]) {
            if (Math.hypot(projectile.velocity?.x ?? 0, projectile.velocity?.y ?? 0) < 1) continue;
            emit(
                `trail:${projectile.id}`,
                projectile.ownerId?.startsWith("enemy") ? "enemy-muzzle" : "player-shot",
                projectile.position,
                projectile.velocity
            );
        }
        for (const player of players) {
            const activeAction = player.actionState?.activeAction;
            if (activeAction) {
                emit(
                    `player-action:${player.id}:${activeAction.activationId}`,
                    particlePresetForAction(activeAction.baseActionId),
                    player.position,
                    activeAction.direction ?? directionTo(player.position, player.control?.aimWorld)
                );
            }
            const sequence = player.actionState?.actionSequence;
            if (!Number.isSafeInteger(sequence)) continue;
            const key = `${player.id}:${sequence}`;
            const previous = this.lastActionSequenceByPlayerId.get(player.id);
            this.lastActionSequenceByPlayerId.set(player.id, sequence);
            if (previous === undefined || previous >= sequence || player.id === this.viewerId) continue;
            appendParticlePreset(this.effects, {
                presetId: particlePresetForAction(player.actionState?.loadout?.baseActionId),
                position: player.position,
                direction: player.control?.aimWorld ? directionTo(player.position, player.control.aimWorld) : null,
                identity: key,
                visibleWorldBounds
            });
        }
        for (const id of this.continuousEmitterElapsed.keys())
            if (!active.has(id)) {
                this.continuousEmitterElapsed.delete(id);
                this.continuousEmitterSequence.delete(id);
            }
        const activePlayerIds = new Set(players.map(({ id }) => id));
        for (const playerId of this.lastActionSequenceByPlayerId.keys())
            if (!activePlayerIds.has(playerId)) this.lastActionSequenceByPlayerId.delete(playerId);
    }

    update(dt) {
        updateCombatFeedback(this.effects, dt);
        for (const effect of this.augmentEffects) effect.age += dt;
        this.augmentEffects = this.augmentEffects.filter(({ age, lifetime }) => age < lifetime);
        for (const effect of this.actionAfterimages) effect.age += dt;
        this.actionAfterimages = this.actionAfterimages.filter(({ age, lifetime }) => age < lifetime);
        if (this.impact) {
            this.impact.age += dt;
            if (this.impact.age >= this.impact.lifetime) this.impact = null;
        }
        if (this.ropeCutFeedback) {
            this.ropeCutFeedback.age += dt;
            if (this.ropeCutFeedback.age >= 0.8) this.ropeCutFeedback = null;
        }
    }

    snapshot() {
        return {
            combatEffects: this.effects,
            impact: this.impact,
            augmentEffects: this.augmentEffects,
            actionAfterimages: this.actionAfterimages,
            ...(this.ropeCutFeedback ? { eventFlash: this.ropeCutFeedback } : {})
        };
    }
}
