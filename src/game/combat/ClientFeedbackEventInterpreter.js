import {
    actionParticlePreset,
    augmentEffectLifetime,
    CLIENT_FEEDBACK_ACTION_ID,
    CLIENT_FEEDBACK_EVENT_CONFIG,
    CLIENT_FEEDBACK_KEY,
    createClientFeedbackEvent,
    eventEffectId,
    mergeImpactState,
    personalFeedbackVisible
} from "./ClientFeedbackEventDefinition.js";
import { createClientFeedbackEventRules } from "./ClientFeedbackEventRules.js";

function directionTo(from, to) {
    if (!from || !to) return null;
    return { x: to.x - from.x, y: to.y - from.y };
}

function rememberBounded(set, value, limit) {
    if (!value || set.has(value)) return false;
    set.add(value);
    if (set.size > limit) set.delete(set.values().next().value);
    return true;
}

function applyFirst(rules, event, context) {
    return rules.some((rule) => rule.apply(event, context));
}

export class ClientFeedbackEventInterpreter {
    constructor({ viewerId, rules = createClientFeedbackEventRules(), config = CLIENT_FEEDBACK_EVENT_CONFIG }) {
        this.viewerId = viewerId;
        this.rules = rules;
        this.config = config;
        this.impact = null;
        this.ropeCutFeedback = null;
        this.augmentEffects = [];
        this.actionAfterimages = [];
        this.seenActionActivationIds = new Set();
        this.seenParticleCausalIds = new Set();
    }

    apply(events, { effectBuffer, visibleWorldBounds, suppressDetach }) {
        const feedbackEvents = [];
        const context = {
            suppressDetach,
            appendActionAfterimage: (event) => this.appendActionAfterimage(event),
            appendAugmentEffect: (event) => this.appendAugmentEffect(event),
            appendParticle: (event, request) => this.appendParticle(event, request, effectBuffer, visibleWorldBounds),
            appendCombatEvent: (event, resolution) =>
                feedbackEvents.push(this.combatEvent(event, resolution, feedbackEvents.length))
        };
        for (const event of events) {
            for (const rule of this.rules.event) rule.apply(event, context);
            applyFirst(this.rules.particle, event, context);
            applyFirst(this.rules.combat, event, context);
        }
        this.appendSharedFeedback(feedbackEvents, effectBuffer, visibleWorldBounds);
        this.appendPersonalFeedback(feedbackEvents);
    }

    appendActionAfterimage(event) {
        const activationId = event.activationId ?? event.parameters?.activationId;
        const ownerId = event.playerId ?? event.ownerId ?? event.parameters?.playerId ?? this.viewerId;
        const id = activationId ? CLIENT_FEEDBACK_KEY.actionPresentation(ownerId, activationId) : null;
        if (!rememberBounded(this.seenActionActivationIds, id, this.config.CAUSAL_LIMIT)) return;
        this.actionAfterimages.push({
            id,
            actionId: event.actionId ?? event.parameters?.actionId ?? CLIENT_FEEDBACK_ACTION_ID.DEFAULT_PUNCH,
            playerId: event.playerId ?? event.ownerId ?? event.parameters?.playerId ?? null,
            position: event.position ?? event.parameters?.position,
            direction: event.direction ?? event.parameters?.direction ?? this.config.DEFAULT_DIRECTION,
            age: this.config.INITIAL_AGE,
            lifetime: this.config.ACTION_AFTERIMAGE_LIFETIME
        });
    }

    appendAugmentEffect(event) {
        const effectId = eventEffectId(event);
        this.augmentEffects.push({
            id: event.eventId ?? event.parameters?.eventId,
            type: effectId,
            resolution: event.resolution,
            position: event.position ?? event.parameters?.contactPosition,
            sourcePosition: event.sourcePosition ?? event.parameters?.sourcePosition ?? null,
            age: this.config.INITIAL_AGE,
            lifetime: augmentEffectLifetime(effectId)
        });
    }

    appendParticle(event, request, effectBuffer, visibleWorldBounds) {
        const causalId =
            event.eventId ??
            event.impactId ??
            event.predictionId ??
            event.activationId ??
            event.objectId ??
            event.projectileId;
        if (!causalId || this.seenParticleCausalIds.has(causalId)) return;
        const position = request.position ?? event.position ?? event.parameters?.position;
        if (!position) return;
        rememberBounded(this.seenParticleCausalIds, causalId, this.config.CAUSAL_LIMIT);
        const targetPosition = request.targetPosition ?? null;
        effectBuffer.appendParticle({
            presetId: request.presetId ?? actionParticlePreset(event.actionId ?? event.parameters?.actionId),
            position,
            direction:
                request.direction ??
                event.direction ??
                event.parameters?.direction ??
                event.velocity ??
                directionTo(position, targetPosition) ??
                this.config.DEFAULT_DIRECTION,
            targetPosition,
            bounds: request.bounds ?? event.bounds ?? null,
            identity: CLIENT_FEEDBACK_KEY.particle(
                event.playerId ?? event.ownerId ?? event.parameters?.sourcePlayerId,
                causalId
            ),
            visibleWorldBounds
        });
    }

    combatEvent(event, resolution, index) {
        return createClientFeedbackEvent(
            event.resolution === resolution ? event : { ...event, resolution, parameters: { damage: event.damage } },
            resolution,
            index
        );
    }

    appendSharedFeedback(feedbackEvents, effectBuffer, visibleWorldBounds) {
        for (const event of feedbackEvents) effectBuffer.appendCombat(event, { visibleWorldBounds });
    }

    appendPersonalFeedback(feedbackEvents) {
        const context = {
            setImpact: (impact) => {
                this.impact = mergeImpactState(this.impact, impact);
            },
            setRopeCut: (ropeCutEvent) => {
                this.ropeCutFeedback = {
                    type: ropeCutEvent.type,
                    position: ropeCutEvent.position,
                    age: this.config.INITIAL_AGE
                };
            }
        };
        for (const event of feedbackEvents.filter((event) => personalFeedbackVisible(event, this.viewerId)))
            for (const rule of this.rules.personal) rule.apply(event, context);
    }

    update(dt) {
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
            if (this.ropeCutFeedback.age >= this.config.ROPE_CUT_LIFETIME) this.ropeCutFeedback = null;
        }
    }

    snapshot() {
        return {
            impact: this.impact,
            augmentEffects: this.augmentEffects,
            actionAfterimages: this.actionAfterimages,
            ...(this.ropeCutFeedback ? { eventFlash: this.ropeCutFeedback } : {})
        };
    }
}
