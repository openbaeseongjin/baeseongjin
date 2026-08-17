const EFFECT_LIFETIME = Object.freeze({ particle: 0.42, ring: 0.3, text: 0.72 });

function particleVelocity(index, count, speed, phase = 0) {
    const angle = phase + (Math.PI * 2 * index) / count;
    return { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed };
}

export function appendCombatFeedback(effects, event) {
    const defeated = event.type === "enemy-defeated";
    const playerHit = event.type === "player-hit";
    const fallDamage = event.type === "fall-damage";
    const ropeCut = event.type === "rope-cut";
    const color = playerHit || fallDamage || ropeCut ? "#fb7185" : defeated ? "#fde68a" : "#67e8f9";
    const count = defeated ? 12 : playerHit || fallDamage ? 9 : ropeCut ? 8 : 7;
    const speed = defeated ? 190 : 130;

    effects.push({
        type: "ring",
        position: { x: event.position.x, y: event.position.y },
        color,
        age: 0,
        lifetime: EFFECT_LIFETIME.ring,
        strength: defeated ? 1.45 : 1
    });
    for (let index = 0; index < count; index += 1) {
        effects.push({
            type: "particle",
            position: { x: event.position.x, y: event.position.y },
            velocity: particleVelocity(index, count, speed * (0.72 + (index % 3) * 0.14), playerHit ? 0.2 : 0),
            color,
            age: 0,
            lifetime: EFFECT_LIFETIME.particle,
            size: defeated ? 5 : 3.5
        });
    }
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
        effect.age += dt;
        if (!effect.velocity) continue;
        effect.position.x += effect.velocity.x * dt;
        effect.position.y += effect.velocity.y * dt;
        if (effect.type === "particle") {
            effect.velocity.x *= Math.max(0, 1 - dt * 4.5);
            effect.velocity.y = effect.velocity.y * Math.max(0, 1 - dt * 4.5) + 210 * dt;
        }
    }
    effects.splice(0, effects.length, ...effects.filter((effect) => effect.age < effect.lifetime).slice(-96));
}

export function createImpactState(events) {
    if (events.some((event) => event.type === "player-hit" || event.type === "fall-damage")) {
        return { age: 0, lifetime: 0.24, strength: 9 };
    }
    if (events.some((event) => event.type === "enemy-defeated")) return { age: 0, lifetime: 0.2, strength: 6 };
    if (events.length > 0) return { age: 0, lifetime: 0.12, strength: 2.5 };
    return null;
}
