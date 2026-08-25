const ACTIVE_PARTICLE_CAP = 192;
const HIGH_PRIORITY_HEADROOM = 48;
const EMITTER_PARTICLE_BUDGET = 24;

const BOSS_WARDEN_ACTIVE_PRESET = Object.freeze({
    emission: "area",
    motion: "directional",
    shape: "streak",
    lifetime: 0.22,
    fadeStart: 0.04,
    blend: "additive"
});

const PARTICLE_PRESET_DEFINITIONS = {
    "player-dash": {
        emission: "stream",
        motion: "directional",
        shape: "streak",
        palette: ["#67e8f9", "#fef08a"],
        count: 6,
        size: 3,
        speed: 220,
        spread: 0.18,
        lifetime: 0.3,
        glow: 0.28
    },
    "player-shot": {
        emission: "stream",
        motion: "directional",
        shape: "streak",
        palette: ["#67e8f9", "#cffafe"],
        count: 5,
        size: 3,
        speed: 210,
        spread: 0.22,
        lifetime: 0.26,
        glow: 0.2
    },
    "player-guard": {
        emission: "attached",
        motion: "orbit",
        shape: "dot",
        palette: ["#fef08a", "#67e8f9"],
        count: 5,
        size: 3,
        speed: 26,
        spread: 3.14,
        lifetime: 0.42,
        glow: 0.2
    },
    "player-shot-impact": {
        emission: "burst",
        motion: "directional",
        shape: "streak",
        palette: ["#cffafe", "#67e8f9"],
        count: 6,
        size: 3,
        speed: 145,
        spread: 1.1,
        lifetime: 0.28,
        glow: 0.18
    },
    "enemy-aim": {
        emission: "stream",
        motion: "directional",
        shape: "dot",
        palette: ["#f87171", "#fb923c"],
        count: 3,
        size: 2,
        speed: 55,
        spread: 0.08,
        lifetime: 0.3,
        opacity: 0.65
    },
    "enemy-muzzle": {
        emission: "burst",
        motion: "directional",
        shape: "shard",
        palette: ["#fb923c", "#f87171"],
        count: 6,
        size: 4,
        speed: 155,
        spread: 0.45,
        lifetime: 0.25,
        glow: 0.2
    },
    "enemy-impact": {
        emission: "burst",
        motion: "ballistic",
        shape: "shard",
        palette: ["#fb923c", "#f87171"],
        count: 8,
        size: 4,
        speed: 150,
        spread: 1.4,
        lifetime: 0.38,
        gravity: 140,
        glow: 0.15
    },
    "enemy-defeat": {
        emission: "burst",
        motion: "ballistic",
        shape: "shard",
        palette: ["#fde68a", "#fef3c7", "#67e8f9"],
        count: 12,
        size: 5,
        speed: 195,
        spread: 2.8,
        lifetime: 0.45,
        gravity: 190,
        glow: 0.28
    },
    "enemy-death-explosion": {
        emission: "burst",
        motion: "ballistic",
        shape: "shard",
        palette: ["#fff7ed", "#fde68a", "#fb923c", "#67e8f9"],
        count: 22,
        size: 6,
        speed: 285,
        spread: Math.PI * 2,
        lifetime: 0.62,
        gravity: 160,
        drag: 3.2,
        glow: 0.52,
        blend: "additive"
    },
    "boss-warden-melee-active": {
        ...BOSS_WARDEN_ACTIVE_PRESET,
        palette: ["#fff7ed", "#fde68a", "#fb923c"],
        count: 8,
        size: 5,
        speed: 105,
        spread: 0.82,
        opacity: 0.82,
        glow: 0.32
    },
    "boss-warden-beam-active": {
        ...BOSS_WARDEN_ACTIVE_PRESET,
        palette: ["#fff1f2", "#f9a8d4", "#fb7185"],
        count: 12,
        size: 5.5,
        speed: 265,
        spread: 0.1,
        opacity: 0.88,
        glow: 0.48
    },
    "boss-warden-melee-impact": {
        emission: "burst",
        motion: "ballistic",
        shape: "shard",
        palette: ["#fff7ed", "#fde68a", "#fb923c"],
        count: 10,
        size: 5,
        speed: 190,
        spread: 2.1,
        lifetime: 0.32,
        gravity: 180,
        glow: 0.3,
        blend: "additive"
    },
    "boss-commander-hammer-ground-impact": {
        emission: "burst",
        motion: "ballistic",
        shape: "shard",
        palette: ["#fff7ed", "#d6c29a", "#8b7355", "#475569"],
        count: 18,
        size: 6,
        speed: 260,
        spread: 1.35,
        lifetime: 0.52,
        gravity: 420,
        drag: 2.8,
        glow: 0.18,
        blend: "additive"
    },
    "boss-warden-beam-impact": {
        emission: "burst",
        motion: "directional",
        shape: "streak",
        palette: ["#fff1f2", "#f9a8d4", "#fb7185"],
        count: 9,
        size: 4.5,
        speed: 235,
        spread: 0.9,
        lifetime: 0.28,
        glow: 0.42,
        blend: "additive"
    },
    "rope-cut": {
        emission: "burst",
        motion: "directional",
        shape: "streak",
        palette: ["#fb7185", "#fecdd3"],
        count: 8,
        size: 3,
        speed: 170,
        spread: 1.7,
        lifetime: 0.34,
        glow: 0.15
    },
    "player-motion": {
        emission: "stream",
        motion: "directional",
        shape: "streak",
        palette: ["#67e8f9", "#cffafe"],
        count: 4,
        size: 2.5,
        speed: 120,
        spread: 0.16,
        lifetime: 0.22,
        opacity: 0.48
    },
    "player-impulse": {
        emission: "burst",
        motion: "directional",
        shape: "streak",
        palette: ["#fef08a", "#67e8f9"],
        count: 7,
        size: 3,
        speed: 210,
        spread: 0.62,
        lifetime: 0.3,
        glow: 0.2
    },
    "rope-launch": {
        emission: "burst",
        motion: "directional",
        shape: "shard",
        palette: ["#67e8f9", "#fef08a"],
        count: 6,
        size: 3.5,
        speed: 185,
        spread: 0.45,
        lifetime: 0.26,
        glow: 0.18
    },
    "rope-flight": {
        emission: "stream",
        motion: "directional",
        shape: "streak",
        palette: ["#67e8f9", "#cffafe"],
        count: 3,
        size: 2,
        speed: 92,
        spread: 0.1,
        lifetime: 0.22,
        opacity: 0.5
    },
    "rope-attach": {
        emission: "burst",
        motion: "ballistic",
        shape: "shard",
        palette: ["#fef08a", "#67e8f9"],
        count: 9,
        size: 3.5,
        speed: 175,
        spread: 1.8,
        lifetime: 0.32,
        gravity: 90,
        glow: 0.2
    },
    "rope-pulse": {
        emission: "stream",
        motion: "directional",
        shape: "dot",
        palette: ["#fef08a", "#67e8f9"],
        count: 5,
        size: 2.5,
        speed: 110,
        spread: 0.08,
        lifetime: 0.28,
        glow: 0.12
    },
    "rope-tension": {
        emission: "stream",
        motion: "directional",
        shape: "dot",
        palette: ["#67e8f9", "#a5f3fc"],
        count: 4,
        size: 2,
        speed: 72,
        spread: 0.08,
        lifetime: 0.3,
        opacity: 0.48
    },
    "rope-tension-electric": {
        emission: "stream",
        motion: "directional",
        shape: "dot",
        palette: ["#22d3ee", "#60a5fa", "#e0f2fe"],
        count: 4,
        size: 2,
        speed: 76,
        spread: 0.1,
        lifetime: 0.3,
        glow: 0.18,
        opacity: 0.58
    },
    "rope-release": {
        emission: "burst",
        motion: "directional",
        shape: "streak",
        palette: ["#fef08a", "#67e8f9"],
        count: 7,
        size: 3,
        speed: 190,
        spread: 0.78,
        lifetime: 0.3,
        glow: 0.18
    },
    "rope-dissipate": {
        emission: "burst",
        motion: "ballistic",
        shape: "dot",
        palette: ["#67e8f9", "#cffafe"],
        count: 4,
        size: 2.5,
        speed: 82,
        spread: 2.1,
        lifetime: 0.24,
        opacity: 0.45
    },
    "rope-contact": {
        emission: "burst",
        motion: "directional",
        shape: "dot",
        palette: ["#e0f2fe", "#22d3ee", "#60a5fa"],
        count: 5,
        size: 3,
        speed: 125,
        spread: 1.4,
        lifetime: 0.24,
        glow: 0.22
    },
    "shield-block": {
        emission: "burst",
        motion: "directional",
        shape: "shard",
        palette: ["#60a5fa", "#dbeafe"],
        count: 7,
        size: 4,
        speed: 155,
        spread: 1.25,
        lifetime: 0.34,
        glow: 0.28
    },
    "pursuit-converge": {
        emission: "attached",
        motion: "converge",
        shape: "shard",
        palette: ["#fdba74", "#fb923c"],
        count: 4,
        size: 3,
        speed: 85,
        spread: 3.14,
        lifetime: 0.34
    },
    "shield-flow": {
        emission: "attached",
        motion: "orbit",
        shape: "dot",
        palette: ["#60a5fa", "#bfdbfe"],
        count: 3,
        size: 3,
        speed: 26,
        spread: 3.14,
        lifetime: 0.5
    },
    "support-link": {
        emission: "stream",
        motion: "directional",
        shape: "dot",
        palette: ["#4ade80", "#bbf7d0"],
        count: 4,
        size: 3,
        speed: 80,
        spread: 0.18,
        lifetime: 0.42
    },
    "swarm-chase": {
        emission: "attached",
        motion: "orbit",
        shape: "dot",
        palette: ["#c084fc", "#e9d5ff"],
        count: 1,
        size: 2,
        speed: 10,
        spread: 3.14,
        lifetime: 0.35
    },
    "swarm-recoil": {
        emission: "stream",
        motion: "directional",
        shape: "streak",
        palette: ["#c084fc", "#e879f9"],
        count: 4,
        size: 3,
        speed: 180,
        spread: 0.14,
        lifetime: 0.32,
        glow: 0.15
    },
    "artillery-warning": {
        emission: "area",
        motion: "converge",
        shape: "dot",
        palette: ["#fdba74", "#f97316"],
        count: 5,
        size: 2.5,
        speed: 40,
        spread: 3.14,
        lifetime: 0.38,
        opacity: 0.6
    },
    "artillery-strike": {
        emission: "area",
        motion: "ballistic",
        shape: "shard",
        palette: ["#fb923c", "#fde68a"],
        count: 11,
        size: 4,
        speed: 185,
        spread: 2.6,
        lifetime: 0.44,
        gravity: 230,
        glow: 0.2
    },
    "wind-flow": {
        emission: "area",
        motion: "drift",
        shape: "streak",
        palette: ["#67e8f9", "#bae6fd"],
        count: 5,
        size: 3,
        speed: 72,
        spread: 0.55,
        lifetime: 0.46,
        opacity: 0.55
    },
    impact: {
        emission: "burst",
        motion: "ballistic",
        shape: "shard",
        palette: ["#67e8f9", "#fef08a"],
        count: 9,
        size: 4,
        speed: 180,
        spread: 2.4,
        lifetime: 0.4,
        gravity: 210,
        glow: 0.25
    }
};

export const PARTICLE_PRESETS = Object.freeze(
    Object.fromEntries(
        Object.entries(PARTICLE_PRESET_DEFINITIONS).map(([id, definition]) => [
            id,
            Object.freeze({
                ...definition,
                palette: Object.freeze([...definition.palette]),
                drag:
                    definition.drag ??
                    (definition.motion === "directional" ? 2.2 : definition.motion === "drift" ? 0.8 : 4.5),
                fadeStart: definition.fadeStart ?? 0,
                blend: definition.blend ?? (definition.glow ? "additive" : "normal")
            })
        ])
    )
);

function unit(direction) {
    if (!direction || !Number.isFinite(direction.x) || !Number.isFinite(direction.y)) return null;
    const length = Math.hypot(direction.x, direction.y);
    return length > 0 ? { x: direction.x / length, y: direction.y / length } : null;
}
function seedFor(identity) {
    let hash = 2166136261;
    for (const character of String(identity)) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
    return (hash >>> 0) / 4294967296;
}
function heading(seed, index, direction, spread) {
    const angle =
        (direction ? Math.atan2(direction.y, direction.x) : 0) + (((seed * 0.618 + index / 7) % 1) - 0.5) * spread;
    return { x: Math.cos(angle), y: Math.sin(angle) };
}
function particleCount(effects) {
    return effects.reduce((count, effect) => count + (effect.type === "particle" ? 1 : 0), 0);
}
function visible(bounds, point) {
    return (
        !bounds ||
        (point.x >= bounds.minX && point.x <= bounds.maxX && point.y >= bounds.minY && point.y <= bounds.maxY)
    );
}
function intersects(bounds, area) {
    return (
        !bounds ||
        !area ||
        !(area.maxX < bounds.minX || area.minX > bounds.maxX || area.maxY < bounds.minY || area.minY > bounds.maxY)
    );
}

function spawnPosition(preset, position, targetPosition, areaBounds, seed, index, count, vector, speed) {
    if (preset.emission === "area" && areaBounds)
        return {
            x: areaBounds.minX + ((seed + index * 0.618) % 1) * (areaBounds.maxX - areaBounds.minX),
            y: areaBounds.minY + ((seed * 0.37 + index * 0.414) % 1) * (areaBounds.maxY - areaBounds.minY)
        };
    if (preset.emission === "stream") {
        const progress = (index + 0.5) / count;
        return targetPosition
            ? {
                  x: position.x + (targetPosition.x - position.x) * progress,
                  y: position.y + (targetPosition.y - position.y) * progress
              }
            : {
                  x: position.x - vector.x * speed * progress * 0.09,
                  y: position.y - vector.y * speed * progress * 0.09
              };
    }
    if (preset.emission === "attached") {
        const angle = Math.atan2(vector.y, vector.x) + (Math.PI * 2 * index) / count;
        return { x: position.x + Math.cos(angle) * 13, y: position.y + Math.sin(angle) * 13 };
    }
    return { ...position };
}

export function appendParticlePreset(
    effects,
    {
        presetId,
        position,
        direction,
        identity,
        density = 1,
        priority = 1,
        targetPosition = null,
        bounds = null,
        visibleWorldBounds = null
    }
) {
    const preset = PARTICLE_PRESETS[presetId];
    if (
        !preset ||
        !position ||
        (preset.emission === "area" ? !intersects(visibleWorldBounds, bounds) : !visible(visibleWorldBounds, position))
    )
        return 0;
    const capacity = priority > 0 ? ACTIVE_PARTICLE_CAP : ACTIVE_PARTICLE_CAP - HIGH_PRIORITY_HEADROOM;
    const count = Math.min(
        EMITTER_PARTICLE_BUDGET,
        capacity - particleCount(effects),
        Math.max(0, Math.floor(preset.count * density))
    );
    if (count <= 0) return 0;
    const seed = seedFor(identity ?? `${presetId}:${position.x}:${position.y}`);
    const directionUnit = unit(direction);
    let emitted = 0;
    for (let index = 0; index < count; index += 1) {
        const vector = heading(seed, index, directionUnit, preset.spread);
        const speed = preset.speed * (0.72 + ((index + Math.floor(seed * 13)) % 4) * 0.1);
        const spawn = spawnPosition(preset, position, targetPosition, bounds, seed, index, count, vector, speed);
        if (!visible(visibleWorldBounds, spawn)) continue;
        effects.push({
            type: "particle",
            presetId,
            shape: preset.shape,
            material: {
                color: preset.palette[index % preset.palette.length],
                glow: preset.glow ?? 0,
                opacity: preset.opacity ?? 1,
                blend: preset.blend
            },
            position: spawn,
            velocity: { x: vector.x * speed, y: vector.y * speed },
            origin: { ...position },
            targetPosition,
            motion: preset.motion,
            emission: preset.emission,
            age: 0,
            lifetime: preset.lifetime,
            fadeStart: preset.fadeStart,
            size: preset.size,
            gravity: preset.gravity ?? 0,
            drag: preset.drag,
            priority,
            orbitPhase: seed * Math.PI * 2 + index
        });
        emitted += 1;
    }
    return emitted;
}

export function updateParticlePresentation(effects, dt) {
    for (const effect of effects) {
        if (effect.type !== "particle") continue;
        effect.age += dt;
        if (effect.motion === "orbit") {
            const angle = effect.orbitPhase + effect.age * 7;
            effect.position.x = effect.origin.x + Math.cos(angle) * (10 + effect.size);
            effect.position.y = effect.origin.y + Math.sin(angle) * (10 + effect.size);
            continue;
        }
        if (effect.motion === "converge" && effect.targetPosition) {
            effect.position.x += (effect.targetPosition.x - effect.position.x) * Math.min(1, dt * 8);
            effect.position.y += (effect.targetPosition.y - effect.position.y) * Math.min(1, dt * 8);
            continue;
        }
        effect.position.x += effect.velocity.x * dt;
        effect.position.y += effect.velocity.y * dt;
        const drag = effect.drag;
        effect.velocity.x *= Math.max(0, 1 - dt * drag);
        effect.velocity.y = effect.velocity.y * Math.max(0, 1 - dt * drag) + effect.gravity * dt;
        if (effect.motion === "drift")
            effect.position.y += Math.sin(effect.orbitPhase + effect.age * 10) * effect.size * dt * 3;
    }
    for (let index = effects.length - 1; index >= 0; index -= 1)
        if (effects[index].type === "particle" && effects[index].age >= effects[index].lifetime)
            effects.splice(index, 1);
}
