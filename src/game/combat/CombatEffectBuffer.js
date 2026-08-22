import { appendCombatFeedback, updateCombatFeedback } from "./CombatFeedback.js";
import { appendParticlePreset } from "./ParticlePresentation.js";

export class CombatEffectBuffer {
    constructor({ effects = [] } = {}) {
        this.effects = effects;
    }

    appendCombat(event, options) {
        return appendCombatFeedback(this.effects, event, options);
    }

    appendParticle(request) {
        return appendParticlePreset(this.effects, request);
    }

    update(dt) {
        updateCombatFeedback(this.effects, dt);
    }

    snapshot() {
        return this.effects;
    }
}
