import { WIND_CONFIG } from "../config.js";
import { segmentIntersectsSurface } from "./PolygonGeometry.js";

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

function zoneFalloffFactor(zone, point) {
    const falloff = zone.falloff ?? WIND_CONFIG.defaultFalloff;
    if (falloff <= 0) return 1;
    const distanceToEdge = Math.min(
        point.x - zone.bounds.x,
        zone.bounds.x + zone.bounds.width - point.x,
        point.y - zone.bounds.y,
        zone.bounds.y + zone.bounds.height - point.y
    );
    if (distanceToEdge <= 0) return 0;
    return Math.min(1, distanceToEdge / falloff);
}

function windOrigin(zone) {
    const { bounds, direction } = zone;
    const centerX = bounds.x + bounds.width * 0.5;
    const centerY = bounds.y + bounds.height * 0.5;
    if (direction.x < 0) return { x: bounds.x + bounds.width, y: centerY };
    if (direction.x > 0) return { x: bounds.x, y: centerY };
    if (direction.y < 0) return { x: centerX, y: bounds.y + bounds.height };
    if (direction.y > 0) return { x: centerX, y: bounds.y };
    return { x: centerX, y: centerY };
}

export function sampleWorldForce(windZones, point, elapsedSeconds, options = {}) {
    const { occluders = [], shadowFactor = WIND_CONFIG.shadowFactor } = options;
    let x = 0;
    let y = 0;
    const activeZones = [];
    for (const zone of windZones) {
        if (!pointInsideBounds(point, zone.bounds)) continue;
        const state = evaluateWindZone(zone, elapsedSeconds);
        const directionLength = Math.hypot(zone.direction.x, zone.direction.y);
        if (directionLength <= 0) continue;
        let factor = state.multiplier * zoneFalloffFactor(zone, point);
        if (factor > 0 && occluders.length > 0) {
            const occluded = occluders.some((surface) => segmentIntersectsSurface(windOrigin(zone), point, surface));
            if (occluded) factor *= shadowFactor;
        }
        x += (zone.direction.x / directionLength) * zone.strength * factor;
        y += (zone.direction.y / directionLength) * zone.strength * factor;
        activeZones.push(Object.freeze({ id: zone.id, ...state }));
    }
    return Object.freeze({ x, y, activeZones: Object.freeze(activeZones) });
}

export function snapshotWindStates(windZones, elapsedSeconds) {
    return Object.freeze(
        windZones.map((zone) => Object.freeze({ id: zone.id, ...evaluateWindZone(zone, elapsedSeconds) }))
    );
}

const BLADE_LULL_SPIN = 0.15;
const BLADE_REST_SPIN = 0.15;

export function windBladePhase(zone, elapsedSeconds) {
    if (zone.mode === "continuous") return elapsedSeconds;
    const { lull, warning, active, decay } = zone.cycle;
    const duration = lull + warning + active + decay;
    const cycles = Math.floor(elapsedSeconds / duration);
    let phaseTime = elapsedSeconds - cycles * duration;
    let spin = 0;
    const lullTime = Math.min(phaseTime, lull);
    spin += lullTime * BLADE_LULL_SPIN;
    phaseTime -= lullTime;
    if (phaseTime > 0) {
        const warningTime = Math.min(phaseTime, warning);
        spin += warningTime * BLADE_LULL_SPIN + (warningTime * warningTime * (1 - BLADE_LULL_SPIN)) / (2 * warning);
        phaseTime -= warningTime;
    }
    if (phaseTime > 0) {
        const activeTime = Math.min(phaseTime, active);
        spin += activeTime;
        phaseTime -= activeTime;
    }
    if (phaseTime > 0) {
        const decayTime = Math.min(phaseTime, decay);
        spin += decayTime - (decayTime * decayTime * (1 - BLADE_REST_SPIN)) / (2 * decay);
    }
    const cycleSpin =
        lull * BLADE_LULL_SPIN +
        warning * (BLADE_LULL_SPIN + (1 - BLADE_LULL_SPIN) / 2) +
        active +
        decay * (1 - (1 - BLADE_REST_SPIN) / 2);
    return cycles * cycleSpin + spin;
}

export function windOccludingSurfaces(surfaces) {
    return Object.freeze(
        (surfaces ?? []).filter(
            (surface) => surface.windOcclusion === true || (surface.collision !== false && surface.oneWay !== true)
        )
    );
}
