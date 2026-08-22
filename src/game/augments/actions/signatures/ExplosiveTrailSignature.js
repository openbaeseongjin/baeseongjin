import {
    ACTION_EVENT_TYPE,
    ACTION_PENDING_EFFECT_TYPE,
    ACTION_REJECTION_REASON,
    ACTION_RUNTIME_CONFIG,
    ACTION_SIGNATURE_ID,
    ACTION_SOURCE_KIND,
    ACTION_STATE_CONFIG
} from "../ActionAugmentDefinition.js";
import { ActionSignatureDefinition } from "./ActionSignatureDefinition.js";

export class ExplosiveTrailSignature extends ActionSignatureDefinition {
    constructor(effect) {
        super(ACTION_SIGNATURE_ID.EXPLOSIVE_TRAIL);
        this.effect = effect;
    }

    decorateActivation(activation) {
        return {
            ...activation,
            trailEffect: Object.freeze({
                width: this.effect.width,
                delaySeconds: this.effect.delaySeconds,
                damage: this.effect.damage
            })
        };
    }

    onActionEnd({ activation, pendingEffects }) {
        if (!activation.trailEffect) return Object.freeze([]);
        pendingEffects.add({
            effectType: ACTION_PENDING_EFFECT_TYPE.EXPLOSIVE_TRAIL,
            activationId: activation.activationId,
            remainingSeconds: activation.trailEffect.delaySeconds,
            width: activation.trailEffect.width,
            damage: activation.trailEffect.damage,
            start: null,
            end: null
        });
        return Object.freeze([]);
    }

    completePendingEffect(effect) {
        return Object.freeze({
            eventType: ACTION_EVENT_TYPE.EXPLOSIVE_TRAIL_DETONATED,
            activationId: effect.activationId,
            width: effect.width,
            damage: effect.damage,
            start: effect.start ? Object.freeze({ ...effect.start }) : null,
            end: effect.end ? Object.freeze({ ...effect.end }) : null
        });
    }

    createResolutionTracker() {
        const targetIds = new Set();
        return Object.freeze({
            observeExplosiveTrailHit: ({ targetId }) => {
                if (!targetId) throw new Error("trail hit requires a targetId");
                if (targetIds.has(targetId)) {
                    return Object.freeze({ accepted: false, reason: ACTION_REJECTION_REASON.DUPLICATE_TARGET });
                }
                targetIds.add(targetId);
                return Object.freeze({ accepted: true, damage: this.effect.damage });
            }
        });
    }

    resolveRuntimeEvent(event, context) {
        if (!event.start || !event.end) return;
        for (const enemy of context.enemies) {
            if (
                enemy.health <= ACTION_STATE_CONFIG.ZERO ||
                context.distancePointToSegment(enemy.position, event.start, event.end) >
                    enemy.radius + event.width * ACTION_RUNTIME_CONFIG.HALF
            ) {
                continue;
            }
            context.emitImpact({
                enemy,
                effectId: this.id,
                sourceKind: ACTION_SOURCE_KIND.ACTION_TRAIL,
                damage: context.damageFromPercent(event.damage),
                sourcePosition: event.start,
                contactPosition: enemy.position
            });
        }
    }
}
