import { CLIENT_FEEDBACK_EVENT_CONFIG } from "./ClientFeedbackEventDefinition.js";
import { ClientFeedbackEventInterpreter } from "./ClientFeedbackEventInterpreter.js";
import { createClientFeedbackObjects } from "./ClientFeedbackObjectFactory.js";
import { CombatEffectBuffer } from "./CombatEffectBuffer.js";
import { ContinuousFeedbackEmitter } from "./ContinuousFeedbackEmitter.js";

export class ClientCombatFeedback {
    constructor({ viewerId }) {
        if (typeof viewerId !== "string" || viewerId.length === CLIENT_FEEDBACK_EVENT_CONFIG.EMPTY_VIEWER_ID_LENGTH) {
            throw new Error("ClientCombatFeedback requires a viewerId");
        }
        const feedbackObjects = createClientFeedbackObjects();
        this.viewerId = viewerId;
        this.effectBuffer = new CombatEffectBuffer();
        this.continuousEmitter = new ContinuousFeedbackEmitter();
        this.feedbackObjects = feedbackObjects.all;
        this.playerRopeFeedback = feedbackObjects.playerRope;
        this.eventInterpreter = new ClientFeedbackEventInterpreter({ viewerId });
    }

    apply(events, { visibleWorldBounds = null } = {}) {
        this.eventInterpreter.apply(events, {
            effectBuffer: this.effectBuffer,
            visibleWorldBounds,
            suppressDetach: (playerId) => this.playerRopeFeedback.suppressDetach(playerId)
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
        const scene = { enemies, players, projectiles, enemyProjectiles, augmentProjectiles, windStates, world };
        this.continuousEmitter.beginFrame({ dt, visibleWorldBounds, effectBuffer: this.effectBuffer });
        const context = {
            viewerId: this.viewerId,
            dt,
            visibleWorldBounds,
            effectBuffer: this.effectBuffer,
            emit: (...args) => this.continuousEmitter.emit(...args)
        };
        for (const feedbackObject of this.feedbackObjects) feedbackObject.sync(scene, context);
        this.continuousEmitter.endFrame();
    }

    update(dt) {
        this.effectBuffer.update(dt);
        this.eventInterpreter.update(dt);
        this.playerRopeFeedback.update(dt);
    }

    snapshot() {
        return {
            combatEffects: this.effectBuffer.snapshot(),
            ...this.eventInterpreter.snapshot()
        };
    }
}
