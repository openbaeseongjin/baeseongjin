import { appendCombatFeedback, createImpactState, updateCombatFeedback } from "./CombatFeedback.js";

const COMBAT_RESOLUTIONS = new Set(["enemy-hit", "enemy-defeated", "player-hit"]);

export class ClientCombatFeedback {
    constructor() {
        this.effects = [];
        this.impact = null;
    }

    apply(events) {
        const combatEvents = events
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
        for (const event of combatEvents) appendCombatFeedback(this.effects, event);
        const impact = createImpactState(combatEvents);
        if (impact) this.impact = impact;
    }

    update(dt) {
        updateCombatFeedback(this.effects, dt);
        if (!this.impact) return;
        this.impact.age += dt;
        if (this.impact.age >= this.impact.lifetime) this.impact = null;
    }

    snapshot() {
        return { combatEffects: this.effects, impact: this.impact };
    }
}
