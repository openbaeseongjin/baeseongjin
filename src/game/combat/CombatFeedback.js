import { appendParticlePreset, updateParticlePresentation } from "./ParticlePresentation.js";
import {
    COMBAT_EFFECT_LIFETIME,
    COMBAT_EFFECT_TYPE,
    COMBAT_FEEDBACK_KEY,
    COMBAT_FEEDBACK_LAYOUT,
    combatFeedbackDefinition
} from "./CombatFeedbackDefinition.js";

export function appendCombatFeedback(effects, event, { visibleWorldBounds = null } = {}) {
    const definition = combatFeedbackDefinition(event.type);

    effects.push({
        type: COMBAT_EFFECT_TYPE.RING,
        position: { x: event.position.x, y: event.position.y },
        color: definition.color,
        age: COMBAT_FEEDBACK_LAYOUT.INITIAL_AGE,
        lifetime: COMBAT_EFFECT_LIFETIME[COMBAT_EFFECT_TYPE.RING],
        strength: definition.strength
    });
    appendParticlePreset(effects, {
        presetId: definition.presetId,
        position: event.position,
        direction: event.direction,
        identity: COMBAT_FEEDBACK_KEY.effect(event),
        visibleWorldBounds
    });
    if (definition.showText) {
        effects.push({
            type: COMBAT_EFFECT_TYPE.TEXT,
            position: {
                x: event.position.x,
                y: event.position.y + COMBAT_FEEDBACK_LAYOUT.TEXT_OFFSET_Y
            },
            velocity: COMBAT_FEEDBACK_LAYOUT.TEXT_VELOCITY,
            color: definition.color,
            text: `${definition.textSign * Math.round(event.damage)}`,
            age: COMBAT_FEEDBACK_LAYOUT.INITIAL_AGE,
            lifetime: COMBAT_EFFECT_LIFETIME[COMBAT_EFFECT_TYPE.TEXT],
            emphasis: definition.emphasis
        });
    }
}

export function updateCombatFeedback(effects, dt) {
    for (const effect of effects) {
        if (effect.type === COMBAT_EFFECT_TYPE.PARTICLE) continue;
        effect.age += dt;
        if (!effect.velocity) continue;
        effect.position.x += effect.velocity.x * dt;
        effect.position.y += effect.velocity.y * dt;
    }
    updateParticlePresentation(effects, dt);
    const activeEffects = effects.filter(({ age, lifetime }) => age < lifetime);
    effects.splice(COMBAT_FEEDBACK_LAYOUT.FIRST_INDEX, effects.length, ...activeEffects);
}
