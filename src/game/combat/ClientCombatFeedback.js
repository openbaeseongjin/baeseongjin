import { appendCombatFeedback, createImpactState, updateCombatFeedback } from "./CombatFeedback.js";

const COMBAT_RESOLUTIONS = new Set(["enemy-hit", "enemy-defeated", "player-hit", "rope-cut"]);

export class ClientCombatFeedback {
    constructor() {
        this.effects = [];
        this.impact = null;
        this.ropeCutFeedback = null;
    }

    apply(events) {
        const resolvedEvents = events
            .filter(
                (event) =>
                    (event.eventType === "resolve" || event.eventType === "predicted-resolve") &&
                    COMBAT_RESOLUTIONS.has(event.resolution)
            )
            .map((event) => ({
                type: event.resolution,
                position: event.position,
                damage: event.parameters?.damage ?? 0
            }));
        const combatEvents = resolvedEvents.filter(({ type }) => type !== "rope-cut");
        for (const event of combatEvents) appendCombatFeedback(this.effects, event);
        const impact = createImpactState(combatEvents);
        if (impact) this.impact = impact;
        const ropeCut = [...resolvedEvents].reverse().find(({ type }) => type === "rope-cut");
        if (ropeCut) this.ropeCutFeedback = { type: "rope-cut", position: ropeCut.position, age: 0 };
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
