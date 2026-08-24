import { CLIENT_FEEDBACK_EVENT } from "./ClientFeedbackEventDefinition.js";
import { ClientFeedbackEventRule } from "./ClientFeedbackEventRule.js";

function rules(...definitions) {
    return Object.freeze(definitions.map((definition) => new ClientFeedbackEventRule(definition)));
}

export function createClientFeedbackEventRules() {
    return Object.freeze({
        event: rules(
            CLIENT_FEEDBACK_EVENT.RESPAWN_DETACH_SUPPRESSION,
            CLIENT_FEEDBACK_EVENT.ROPE_CUT_DETACH_SUPPRESSION,
            CLIENT_FEEDBACK_EVENT.ROPE_IMPACT_DETACH_SUPPRESSION,
            CLIENT_FEEDBACK_EVENT.AUGMENT_EFFECT
        ),
        particle: rules(
            CLIENT_FEEDBACK_EVENT.SPELL_PARTICLE,
            CLIENT_FEEDBACK_EVENT.SPAWN_PARTICLE,
            CLIENT_FEEDBACK_EVENT.SHOT_ENDED_PARTICLE,
            CLIENT_FEEDBACK_EVENT.SHIELD_BLOCK_PARTICLE,
            CLIENT_FEEDBACK_EVENT.ELECTRIFIED_ROPE_PARTICLE,
            CLIENT_FEEDBACK_EVENT.ELECTRIFIED_STATUS_PARTICLE,
            CLIENT_FEEDBACK_EVENT.BOSS_WARDEN_HIT_PARTICLE,
            CLIENT_FEEDBACK_EVENT.ARTILLERY_HIT_PARTICLE
        ),
        combat: rules(
            CLIENT_FEEDBACK_EVENT.FALL_DAMAGE_COMBAT,
            CLIENT_FEEDBACK_EVENT.RESOLVE_COMBAT,
            CLIENT_FEEDBACK_EVENT.DIRECT_PLAYER_HIT_COMBAT
        ),
        personal: rules(CLIENT_FEEDBACK_EVENT.PERSONAL_IMPACT, CLIENT_FEEDBACK_EVENT.PERSONAL_ROPE_CUT)
    });
}
