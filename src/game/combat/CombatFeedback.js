import { appendParticlePreset, updateParticlePresentation } from "./ParticlePresentation.js";

const EFFECT_LIFETIME = Object.freeze({ ring: 0.3, text: 0.72 });

export function appendCombatFeedback(effects, event, { visibleWorldBounds = null } = {}) {
    const defeated = event.type === "enemy-defeated";
    const playerHit = event.type === "player-hit";
    const fallDamage = event.type === "fall-damage";
    const ropeCut = event.type === "rope-cut";
    const color = playerHit || fallDamage || ropeCut ? "#fb7185" : defeated ? "#fde68a" : "#67e8f9";
    const particlePresetId = ropeCut
        ? "rope-cut"
        : defeated
          ? "enemy-defeat"
          : playerHit || fallDamage
            ? "enemy-impact"
            : "impact";

    effects.push({
        type: "ring",
        position: { x: event.position.x, y: event.position.y },
        color,
        age: 0,
        lifetime: EFFECT_LIFETIME.ring,
        strength: defeated ? 1.45 : 1
    });
    appendParticlePreset(effects, {
        presetId: particlePresetId,
        position: event.position,
        direction: event.direction,
        identity: event.id ?? `${event.type}:${event.position.x}:${event.position.y}`,
        visibleWorldBounds
    });
    if (!ropeCut) {
        effects.push({
            type: "text",
            position: { x: event.position.x, y: event.position.y - 24 },
            velocity: { x: 0, y: -34 },
            color,
            text: playerHit || fallDamage ? `-${Math.round(event.damage)}` : `${Math.round(event.damage)}`,
            age: 0,
            lifetime: EFFECT_LIFETIME.text,
            emphasis: defeated
        });
    }
}

export function updateCombatFeedback(effects, dt) {
    for (const effect of effects) {
        if (effect.type === "particle") continue;
        effect.age += dt;
        if (!effect.velocity) continue;
        effect.position.x += effect.velocity.x * dt;
        effect.position.y += effect.velocity.y * dt;
    }
    updateParticlePresentation(effects, dt);
}

export function createImpactState(events) {
    if (events.some((event) => event.type === "player-hit" || event.type === "fall-damage")) {
        return { age: 0, lifetime: 0.24, strength: 9 };
    }
    if (events.some((event) => event.type === "enemy-defeated")) return { age: 0, lifetime: 0.2, strength: 6 };
    if (events.length > 0) return { age: 0, lifetime: 0.12, strength: 2.5 };
    return null;
}
