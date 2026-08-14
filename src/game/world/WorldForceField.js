export function pointInsideBounds(point, bounds) {
    return (
        point.x >= bounds.x &&
        point.x <= bounds.x + bounds.width &&
        point.y >= bounds.y &&
        point.y <= bounds.y + bounds.height
    );
}

function pulsedWindState(zone, elapsedSeconds) {
    const { lull, warning, active, decay } = zone.cycle;
    const duration = lull + warning + active + decay;
    let phaseTime = ((elapsedSeconds % duration) + duration) % duration;
    if (phaseTime < lull) return Object.freeze({ phase: "lull", multiplier: 0, phaseTime });
    phaseTime -= lull;
    if (phaseTime < warning) return Object.freeze({ phase: "warning", multiplier: 0, phaseTime });
    phaseTime -= warning;
    if (phaseTime < active) return Object.freeze({ phase: "active", multiplier: 1, phaseTime });
    phaseTime -= active;
    return Object.freeze({ phase: "decay", multiplier: 1 - phaseTime / decay, phaseTime });
}

export function evaluateWindZone(zone, elapsedSeconds) {
    if (zone.mode === "continuous") return Object.freeze({ phase: "active", multiplier: 1, phaseTime: 0 });
    if (zone.mode === "pulsed") return pulsedWindState(zone, elapsedSeconds);
    throw new Error(`Unknown wind mode '${zone.mode}'`);
}

export function sampleWorldForce(windZones, point, elapsedSeconds) {
    let x = 0;
    let y = 0;
    const activeZones = [];
    for (const zone of windZones) {
        if (!pointInsideBounds(point, zone.bounds)) continue;
        const state = evaluateWindZone(zone, elapsedSeconds);
        const directionLength = Math.hypot(zone.direction.x, zone.direction.y);
        if (directionLength <= 0) continue;
        x += (zone.direction.x / directionLength) * zone.strength * state.multiplier;
        y += (zone.direction.y / directionLength) * zone.strength * state.multiplier;
        activeZones.push(Object.freeze({ id: zone.id, ...state }));
    }
    return Object.freeze({ x, y, activeZones: Object.freeze(activeZones) });
}

export function snapshotWindStates(windZones, elapsedSeconds) {
    return Object.freeze(
        windZones.map((zone) => Object.freeze({ id: zone.id, ...evaluateWindZone(zone, elapsedSeconds) }))
    );
}
