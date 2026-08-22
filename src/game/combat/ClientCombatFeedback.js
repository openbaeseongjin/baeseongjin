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

function finiteVector(value) {
    return Number.isFinite(value?.x) && Number.isFinite(value?.y) ? value : null;
}

function ropeAttachmentPosition(player, rope) {
    if (!finiteVector(player?.position) || !finiteVector(rope?.attachmentOffset)) return player?.position ?? null;
    const angle = Number.isFinite(player.angle) ? player.angle : 0;
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);
    const offset = rope.attachmentOffset;
    return {
        x: player.position.x + offset.x * cosine - offset.y * sine,
        y: player.position.y + offset.x * sine + offset.y * cosine
    };
}

function hookTip(shot) {
    if (!finiteVector(shot?.origin) || !finiteVector(shot?.direction) || !Number.isFinite(shot.traveled)) return null;
    return {
        x: shot.origin.x + shot.direction.x * shot.traveled,
        y: shot.origin.y + shot.direction.y * shot.traveled
    };
}

function playerSampleId(player) {
    if (Number.isSafeInteger(player.ownerMotionTick)) return `motion:${player.ownerMotionTick}`;
    const position = player.position ?? {};
    const velocity = player.velocity ?? {};
    return `frame:${position.x}:${position.y}:${velocity.x}:${velocity.y}:${player.rope?.isAttached}:${player.launcher?.shot?.elapsed ?? "-"}`;
}

function hasAugment(player, id) {
    return (player.selectedAugmentIds ?? player.augmentRuntimeState?.selectedAugmentIds ?? []).includes(id);
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
        this.previousPlayerPresentation = new Map();
        this.suppressedRopeDetaches = new Map();
        this.visibleWorldBounds = null;
    }

    apply(events, { visibleWorldBounds = null } = {}) {
        this.visibleWorldBounds = visibleWorldBounds;
        for (const event of events) {
            if (
                event.eventType === "player-respawned" ||
                ((event.eventType === "resolve" || event.eventType === "predicted-resolve") &&
                    (event.resolution === "rope-cut" || event.parameters?.sourceKind === "rope-impact"))
            ) {
                const playerId = event.targetId ?? event.playerId ?? event.parameters?.targetId;
                if (playerId) this.suppressedRopeDetaches.set(playerId, 0.8);
            }
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
        } else if ((event.effectId ?? event.parameters?.effectId) === "electrified-rope") {
            presetId = "rope-contact";
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
            this.syncPlayerRopeAndMotion(player, dt, emit, visibleWorldBounds);
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
        for (const playerId of this.previousPlayerPresentation.keys())
            if (!activePlayerIds.has(playerId)) this.previousPlayerPresentation.delete(playerId);
    }

    syncPlayerRopeAndMotion(player, dt, emit, visibleWorldBounds) {
        if (!player?.id || !finiteVector(player.position)) return;
        const rope = player.rope ?? {};
        const shot = player.launcher?.shot ?? null;
        const swing = player.control?.swingDrag ?? player.swingDrag ?? null;
        const sampleId = playerSampleId(player);
        const previous = this.previousPlayerPresentation.get(player.id);
        const velocity = finiteVector(player.velocity) ?? { x: 0, y: 0 };
        const current = {
            sampleId,
            velocity: { ...velocity },
            position: { ...player.position },
            lifeState: player.lifeState,
            attached: rope.isAttached === true,
            shot: shot ? { ...shot, origin: { ...shot.origin }, direction: { ...shot.direction } } : null,
            swingUsed: swing?.used === true,
            pointerKnown: typeof player.control?.lastPointer?.down === "boolean",
            pointerDown: player.control?.lastPointer?.down === true,
            transition: (previous?.transition ?? 0) + 1
        };
        if (!previous) {
            this.previousPlayerPresentation.set(player.id, current);
            return;
        }
        const transitionIdentity = `${player.id}:${current.transition}`;
        const attachment = ropeAttachmentPosition(player, rope);
        const anchor = finiteVector(rope.anchor);
        const direction = directionTo(attachment, anchor) ?? velocity;
        const positionJump =
            Math.hypot(player.position.x - previous.position.x, player.position.y - previous.position.y) > 160;
        const suppressDetach =
            this.suppressedRopeDetaches.has(player.id) ||
            player.lifeState !== "active" ||
            previous.lifeState !== "active" ||
            positionJump;
        if (!previous.shot && shot) {
            appendParticlePreset(this.effects, {
                presetId: "rope-launch",
                position: shot.origin,
                direction: shot.direction,
                identity: `${transitionIdentity}:launch`,
                visibleWorldBounds
            });
        }
        if (shot) {
            const tip = hookTip(shot);
            if (tip) emit(`rope-flight:${player.id}`, "rope-flight", tip, shot.direction, { density: 0.42 });
        }
        if (previous.shot && !shot && !previous.attached && current.attached && anchor) {
            appendParticlePreset(this.effects, {
                presetId: "rope-attach",
                position: anchor,
                direction: directionTo(anchor, attachment),
                identity: `${transitionIdentity}:attach`,
                visibleWorldBounds
            });
            appendParticlePreset(this.effects, {
                presetId: "rope-pulse",
                position: anchor,
                targetPosition: attachment,
                direction: directionTo(anchor, attachment),
                identity: `${transitionIdentity}:pulse`,
                visibleWorldBounds
            });
        } else if (previous.shot && !shot && !current.attached && !suppressDetach) {
            const tip = hookTip(previous.shot);
            if (tip)
                appendParticlePreset(this.effects, {
                    presetId: "rope-dissipate",
                    position: tip,
                    direction: previous.shot.direction,
                    identity: `${transitionIdentity}:dissipate`,
                    visibleWorldBounds
                });
        }
        const releaseTransition =
            previous.pointerKnown && current.pointerKnown ? previous.pointerDown && !current.pointerDown : true;
        if (previous.attached && !current.attached && releaseTransition && !suppressDetach) {
            const releaseDensity = hasAugment(player, "release-propulsion") ? 1.45 : 1;
            appendParticlePreset(this.effects, {
                presetId: "rope-release",
                position: player.position,
                direction: velocity,
                identity: `${transitionIdentity}:release`,
                density: releaseDensity,
                visibleWorldBounds
            });
            appendParticlePreset(this.effects, {
                presetId: "player-impulse",
                position: player.position,
                direction: velocity,
                identity: `${transitionIdentity}:release-impulse`,
                density: releaseDensity,
                visibleWorldBounds
            });
            if (hasAugment(player, "rope-link") && (player.actionState?.ropeLinkWindowRemaining ?? 0) > 0) {
                appendParticlePreset(this.effects, {
                    presetId: "rope-link",
                    position: player.position,
                    direction: previous.shot?.direction ?? velocity,
                    identity: `${transitionIdentity}:link`,
                    visibleWorldBounds
                });
            }
        }
        if (!previous.swingUsed && current.swingUsed) {
            appendParticlePreset(this.effects, {
                presetId: "player-impulse",
                position: player.position,
                direction: swing?.direction ?? velocity,
                identity: `${transitionIdentity}:swing`,
                visibleWorldBounds
            });
        }
        if (current.attached && anchor && attachment) {
            const tension = Number.isFinite(rope.tension) ? rope.tension : 0;
            const tensionDensity = Math.max(0, Math.min(0.8, (tension - 180) / 820));
            if (tensionDensity > 0)
                emit(
                    `rope-tension:${player.id}`,
                    hasAugment(player, "electrified-rope") ? "rope-tension-electric" : "rope-tension",
                    anchor,
                    directionTo(anchor, attachment),
                    { targetPosition: attachment, density: tensionDensity }
                );
        }
        const speed = Math.hypot(velocity.x, velocity.y);
        if (speed > 350)
            emit(
                `player-motion:${player.id}`,
                "player-motion",
                player.position,
                { x: -velocity.x, y: -velocity.y },
                { density: Math.min(0.85, 0.3 + (speed - 350) / 900) }
            );
        if (previous.sampleId !== sampleId) {
            const safeDt = Math.max(1 / 120, Math.min(0.12, Number.isFinite(dt) ? dt : 1 / 60));
            const acceleration = {
                x: (velocity.x - previous.velocity.x) / safeDt,
                y: (velocity.y - previous.velocity.y) / safeDt
            };
            const accelerationMagnitude = Math.min(4200, Math.hypot(acceleration.x, acceleration.y));
            const speedGain = speed - Math.hypot(previous.velocity.x, previous.velocity.y);
            const attachedImpulse = previous.attached && current.attached;
            const accelerationThreshold = attachedImpulse ? 2600 : 1800;
            const speedGainThreshold = attachedImpulse ? 100 : 55;
            if (accelerationMagnitude > accelerationThreshold && speedGain > speedGainThreshold && !current.swingUsed) {
                appendParticlePreset(this.effects, {
                    presetId: "player-impulse",
                    position: player.position,
                    direction: acceleration,
                    identity: `${transitionIdentity}:acceleration:${sampleId}`,
                    visibleWorldBounds
                });
            }
        }
        this.previousPlayerPresentation.set(player.id, current);
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
        for (const [playerId, remaining] of this.suppressedRopeDetaches) {
            const next = remaining - dt;
            if (next <= 0) this.suppressedRopeDetaches.delete(playerId);
            else this.suppressedRopeDetaches.set(playerId, next);
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
