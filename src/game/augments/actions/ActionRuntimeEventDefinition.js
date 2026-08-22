import { ACTION_EVENT_TYPE } from "./ActionAugmentDefinition.js";
import { ACTION_SIGNATURE_BY_EVENT_TYPE } from "./signatures/ActionSignatureCatalog.js";

export const ACTION_RUNTIME_EVENT_HANDLER = Object.freeze({
    [ACTION_EVENT_TYPE.ENDED]: (event, context) => context.contactState.delete(event.activationId),
    [ACTION_EVENT_TYPE.EXPLOSIVE_TRAIL_DETONATED]: (event, context) =>
        ACTION_SIGNATURE_BY_EVENT_TYPE[event.eventType].resolveRuntimeEvent(event, context),
    [ACTION_EVENT_TYPE.SLOW_FALL_END_WAVE]: (event, context) =>
        ACTION_SIGNATURE_BY_EVENT_TYPE[event.eventType].resolveRuntimeEvent(event, context)
});
