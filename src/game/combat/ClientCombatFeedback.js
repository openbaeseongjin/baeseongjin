import { appendCombatFeedback, createImpactState, updateCombatFeedback } from "./CombatFeedback.js";
import {
    createClientFeedbackEventObject,
    PERSONAL_CLIENT_FEEDBACK_CAPABILITY,
    SHARED_CLIENT_FEEDBACK_CAPABILITY
} from "./ClientFeedbackEventObject.js";
import { SimulationDispatcher } from "../simulation/SimulationDispatcher.js";

const COMBAT_RESOLUTIONS = new Set(["enemy-hit", "enemy-defeated", "player-hit", "rope-cut"]);

export class ClientCombatFeedback {
    constructor({ viewerId }) {
        if (typeof viewerId !== "string" || viewerId.length === 0) {
            throw new Error("ClientCombatFeedback requires a viewerId");
        }
        this.viewerId = viewerId;
        this.dispatcher = new SimulationDispatcher();
        this.effects = [];
        this.impact = null;
        this.ropeCutFeedback = null;
    }

    apply(events) {
        const feedbackEvents = events
            .filter(
                (event) =>
                    (event.eventType === "resolve" || event.eventType === "predicted-resolve") &&
                    COMBAT_RESOLUTIONS.has(event.resolution)
            )
            .map((event, index) => createClientFeedbackEventObject(event, index));
        this.dispatcher.dispatch({
            objects: feedbackEvents,
            capabilityId: SHARED_CLIENT_FEEDBACK_CAPABILITY,
            context: { appendShared: (event) => appendCombatFeedback(this.effects, event) }
        });
        this.dispatcher.dispatch({
            objects: feedbackEvents,
            capabilityId: PERSONAL_CLIENT_FEEDBACK_CAPABILITY,
            context: {
                viewerId: this.viewerId,
                appendPersonal: (event) => {
                    const impact = createImpactState([event]);
                    if (impact) this.impact = impact;
                    if (event.type === "rope-cut") {
                        this.ropeCutFeedback = { type: "rope-cut", position: event.position, age: 0 };
                    }
                }
            }
        });
    }

    update(dt) {
        updateCombatFeedback(this.effects, dt);
        if (this.impact) {
            this.impact.age += dt;
            if (this.impact.age >= this.impact.lifetime) this.impact = null;
        }
        if (this.ropeCutFeedback) {
            this.ropeCutFeedback.age += dt;
            if (this.ropeCutFeedback.age >= 0.8) this.ropeCutFeedback = null;
        }
    }

    snapshot() {
        return {
            combatEffects: this.effects,
            impact: this.impact,
            ...(this.ropeCutFeedback ? { eventFlash: this.ropeCutFeedback } : {})
        };
    }
}
