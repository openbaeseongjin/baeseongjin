import { actionAugmentById } from "./ActionAugmentCatalog.js";
import { ACTION_STATE_CONFIG, BASE_ACTION_ID } from "./ActionAugmentDefinition.js";

export function migrateLegacyActionStateSnapshot(snapshot, actionState) {
    if (
        actionState?.loadout.baseActionId !== BASE_ACTION_ID.DEFAULT_PUNCH ||
        (snapshot?.punchCooldownRemaining ?? ACTION_STATE_CONFIG.ZERO) <= ACTION_STATE_CONFIG.ZERO
    ) {
        return null;
    }
    return {
        ...actionState.snapshot(),
        chargesRemaining: ACTION_STATE_CONFIG.ZERO,
        rechargeRemaining: snapshot.punchCooldownRemaining,
        rechargeDuration: actionAugmentById(BASE_ACTION_ID.DEFAULT_PUNCH).cooldownSeconds,
        rechargeQueue: []
    };
}
