import { ACTION_EVENT_TYPE, ACTION_SIGNATURE_ID, ACTION_SOURCE_KIND } from "../ActionAugmentDefinition.js";
import { targetsInRadius } from "../ActionRuntimeSupport.js";
import { ActionSignatureDefinition } from "./ActionSignatureDefinition.js";

export class EndWaveSignature extends ActionSignatureDefinition {
    constructor(effect) {
        super(ACTION_SIGNATURE_ID.END_WAVE);
        this.effect = effect;
    }

    decorateActivation(activation) {
        return { ...activation, endWaveEffect: Object.freeze({ ...this.effect }) };
    }

    onActionEnd({ activation, reason }) {
        if (!activation.endWaveEffect) return Object.freeze([]);
        return Object.freeze([
            Object.freeze({
                eventType: ACTION_EVENT_TYPE.SLOW_FALL_END_WAVE,
                activationId: activation.activationId,
                radius: activation.endWaveEffect.radius,
                damage: activation.endWaveEffect.damage,
                reason
            })
        ]);
    }

    resolveRuntimeEvent(event, context) {
        for (const enemy of targetsInRadius(context.enemies, context.player.physics.position, event.radius)) {
            context.emitImpact({
                enemy,
                effectId: this.id,
                sourceKind: ACTION_SOURCE_KIND.ACTION_AREA,
                damage: context.damageFromPercent(event.damage)
            });
        }
    }
}
