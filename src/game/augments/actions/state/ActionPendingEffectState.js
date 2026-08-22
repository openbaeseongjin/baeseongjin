import { ACTION_PENDING_EFFECT_TYPE, ACTION_STATE_CONFIG } from "../ActionAugmentDefinition.js";
import { actionSignatureById } from "../signatures/ActionSignatureCatalog.js";

function cloneEffect(effect) {
    return {
        ...effect,
        start: effect.start ? Object.freeze({ ...effect.start }) : null,
        end: effect.end ? Object.freeze({ ...effect.end }) : null
    };
}

export class ActionPendingEffectState {
    constructor() {
        this.effects = [];
    }

    add(effect) {
        this.effects.push(effect);
    }

    setPath(activationId, start, end) {
        const effect = this.effects.find(
            (candidate) =>
                candidate.effectType === ACTION_PENDING_EFFECT_TYPE.EXPLOSIVE_TRAIL &&
                candidate.activationId === activationId
        );
        if (!effect) return false;
        effect.start = Object.freeze({ x: start.x, y: start.y });
        effect.end = Object.freeze({ x: end.x, y: end.y });
        return true;
    }

    advance(dt) {
        const events = [];
        for (
            let index = this.effects.length - ACTION_STATE_CONFIG.UNIT;
            index >= ACTION_STATE_CONFIG.ZERO;
            index -= ACTION_STATE_CONFIG.UNIT
        ) {
            const effect = this.effects[index];
            effect.remainingSeconds = Math.max(ACTION_STATE_CONFIG.ZERO, effect.remainingSeconds - dt);
            if (effect.remainingSeconds !== ACTION_STATE_CONFIG.ZERO) continue;
            this.effects.splice(index, ACTION_STATE_CONFIG.UNIT);
            const signature = actionSignatureById(effect.effectType);
            if (signature?.completePendingEffect) events.push(signature.completePendingEffect(effect));
        }
        return Object.freeze(events);
    }

    snapshot() {
        return Object.freeze(this.effects.map((effect) => Object.freeze(cloneEffect(effect))));
    }

    restore(effects, validateRemainingSeconds) {
        this.effects = [...effects].map((effect, index) => {
            validateRemainingSeconds(effect.remainingSeconds, `pendingEffects[${index}].remainingSeconds`);
            return cloneEffect(effect);
        });
    }
}
