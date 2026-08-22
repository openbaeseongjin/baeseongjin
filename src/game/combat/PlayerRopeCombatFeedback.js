import { actionParticlePreset } from "./ClientFeedbackEventDefinition.js";
import { ClientFeedbackObject } from "./ClientFeedbackObject.js";
import { PlayerCombatFeedback } from "./PlayerCombatFeedback.js";
import { PlayerRopeFeedbackLifecycle } from "./PlayerRopeFeedbackLifecycle.js";
import { RopeCombatFeedback } from "./RopeCombatFeedback.js";

export class PlayerRopeCombatFeedback extends ClientFeedbackObject {
    constructor({
        lifecycle = new PlayerRopeFeedbackLifecycle(),
        player = new PlayerCombatFeedback(),
        rope = new RopeCombatFeedback()
    } = {}) {
        super();
        this.lifecycle = lifecycle;
        this.player = player;
        this.rope = rope;
        this.states = Object.freeze(
            [...player.feedbackStates(), ...rope.feedbackStates()].sort((left, right) => left.order - right.order)
        );
    }

    sync({ players = [] }, context) {
        const ruleContext = {
            ...context,
            lifecycle: this.lifecycle,
            actionParticlePreset,
            appendParticle: (request) =>
                context.effectBuffer.appendParticle({ ...request, visibleWorldBounds: context.visibleWorldBounds })
        };
        for (const player of players) {
            const frame = this.lifecycle.sample(player, context.dt);
            if (!frame) continue;
            frame.actionSequence = this.lifecycle.actionSequence(player);
            for (const state of this.states) state.apply(frame, ruleContext);
        }
        this.lifecycle.removeMissing(players);
    }

    suppressDetach(playerId) {
        this.lifecycle.suppressDetach(playerId);
    }

    update(dt) {
        this.lifecycle.update(dt);
    }
}
