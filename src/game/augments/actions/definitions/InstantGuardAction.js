import { ACTION_DAMAGE_TYPE, ACTION_STATE_CONFIG, BASE_ACTION_ID } from "../ActionAugmentDefinition.js";
import { ActionDefinition } from "./ActionDefinition.js";

export class InstantGuardAction extends ActionDefinition {
    constructor() {
        super({ id: BASE_ACTION_ID.INSTANT_GUARD, immediate: false });
    }

    activationPayload(effect) {
        return { durationSeconds: effect.durationSeconds };
    }

    execute() {
        return false;
    }

    absorbIncomingDamage(activeAction, details, signature) {
        if (
            details.remainingDamage <= ACTION_STATE_CONFIG.ZERO ||
            details.type !== ACTION_DAMAGE_TYPE.COMBAT_HP ||
            activeAction.guardConsumed ||
            activeAction.durationRemaining <= ACTION_STATE_CONFIG.ZERO
        ) {
            return null;
        }
        activeAction.guardConsumed = true;
        return Object.freeze({
            remainingDamage: ACTION_STATE_CONFIG.ZERO,
            blockedByGuard: true,
            events: signature?.reflectedDamageEvent?.(details) ?? Object.freeze([])
        });
    }
}
