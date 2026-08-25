import { CONTINUITY_WARDEN_SURFACE_KIND } from "./ContinuityWardenDefinition.js";

export const CONTINUITY_WARDEN_SUPPORT_KIND = Object.freeze({
    GROUND: "ground",
    PLATFORM: "platform"
});

const SUPPORT_KIND_BY_SURFACE_KIND = Object.freeze({
    [CONTINUITY_WARDEN_SURFACE_KIND.MAIN]: CONTINUITY_WARDEN_SUPPORT_KIND.GROUND,
    [CONTINUITY_WARDEN_SURFACE_KIND.LEDGE]: CONTINUITY_WARDEN_SUPPORT_KIND.PLATFORM
});

const DEFAULT_FOOT_TOLERANCE = 0.5;
const MINIMUM_CROSSING_DISTANCE = 1e-6;

function requireFinitePoint(point, label) {
    if (!Number.isFinite(point?.x) || !Number.isFinite(point?.y)) {
        throw new Error(`${label} must contain finite x and y coordinates`);
    }
    return point;
}

function requireNonNegativeFinite(value, label) {
    if (!Number.isFinite(value) || value < 0) {
        throw new Error(`${label} must be a non-negative finite number`);
    }
    return value;
}

function requireDistance(value, label) {
    if ((value !== Number.POSITIVE_INFINITY && !Number.isFinite(value)) || value < 0) {
        throw new Error(`${label} must be a non-negative finite number or positive infinity`);
    }
    return value;
}

function normalizeSupportSurface(surface) {
    const supportKind = SUPPORT_KIND_BY_SURFACE_KIND[surface?.kind] ?? null;
    if (supportKind === null) return null;
    if (typeof surface.id !== "string" || surface.id.length === 0) {
        throw new Error("Continuity Warden support surface requires a non-empty id");
    }
    const bounds = surface.bounds;
    if (
        !Number.isFinite(bounds?.x) ||
        !Number.isFinite(bounds?.y) ||
        !Number.isFinite(bounds?.width) ||
        !Number.isFinite(bounds?.height) ||
        bounds.width <= 0 ||
        bounds.height <= 0
    ) {
        throw new Error(`Continuity Warden support surface ${surface.id} requires positive rectangular bounds`);
    }
    return Object.freeze({
        id: surface.id,
        surfaceKind: surface.kind,
        supportKind,
        bounds: Object.freeze({ x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height }),
        topY: bounds.y,
        minX: bounds.x,
        maxX: bounds.x + bounds.width
    });
}

function orderedSupports(surfaces) {
    if (!Array.isArray(surfaces)) throw new Error("ContinuityWardenSpatialQuery requires authored surfaces");
    return Object.freeze(
        surfaces
            .map(normalizeSupportSurface)
            .filter((surface) => surface !== null)
            .sort((left, right) => left.topY - right.topY || left.minX - right.minX || left.id.localeCompare(right.id))
    );
}

function containsHorizontalPoint(surface, x, tolerance) {
    return x >= surface.minX - tolerance && x <= surface.maxX + tolerance;
}

function immutableLanding(surface, x, travelFraction) {
    return Object.freeze({
        support: surface,
        foot: Object.freeze({ x, y: surface.topY }),
        travelFraction
    });
}

export function continuityWardenSupportKind(surface) {
    return SUPPORT_KIND_BY_SURFACE_KIND[surface?.kind ?? surface?.surfaceKind] ?? null;
}

export class ContinuityWardenSpatialQuery {
    constructor({ surfaces, footTolerance = DEFAULT_FOOT_TOLERANCE }) {
        this.footTolerance = requireNonNegativeFinite(footTolerance, "Continuity Warden footTolerance");
        this.supports = orderedSupports(surfaces);
        Object.freeze(this);
    }

    currentSupport(foot, { tolerance = this.footTolerance } = {}) {
        requireFinitePoint(foot, "Continuity Warden foot");
        requireNonNegativeFinite(tolerance, "Continuity Warden support tolerance");
        let nearest = null;
        let nearestDistance = Number.POSITIVE_INFINITY;
        for (const support of this.supports) {
            if (!containsHorizontalPoint(support, foot.x, tolerance)) continue;
            const distance = Math.abs(foot.y - support.topY);
            if (distance > tolerance || distance >= nearestDistance) continue;
            nearest = support;
            nearestDistance = distance;
        }
        return nearest;
    }

    supportBelow(foot, { minimumDrop = 0, maxDistance = Number.POSITIVE_INFINITY } = {}) {
        requireFinitePoint(foot, "Continuity Warden foot");
        requireNonNegativeFinite(minimumDrop, "Continuity Warden minimumDrop");
        requireDistance(maxDistance, "Continuity Warden maxDistance");
        let nearest = null;
        let nearestDrop = Number.POSITIVE_INFINITY;
        for (const support of this.supports) {
            if (!containsHorizontalPoint(support, foot.x, this.footTolerance)) continue;
            const drop = support.topY - foot.y;
            if (drop <= minimumDrop || drop > maxDistance || drop >= nearestDrop) continue;
            nearest = support;
            nearestDrop = drop;
        }
        return nearest;
    }

    landingCrossing(previousFoot, foot, { tolerance = this.footTolerance } = {}) {
        requireFinitePoint(previousFoot, "Continuity Warden previous foot");
        requireFinitePoint(foot, "Continuity Warden foot");
        requireNonNegativeFinite(tolerance, "Continuity Warden landing tolerance");
        const verticalTravel = foot.y - previousFoot.y;
        if (verticalTravel <= MINIMUM_CROSSING_DISTANCE) return null;

        let landing = null;
        let earliestFraction = Number.POSITIVE_INFINITY;
        for (const support of this.supports) {
            if (previousFoot.y >= support.topY - MINIMUM_CROSSING_DISTANCE) continue;
            if (foot.y < support.topY - tolerance) continue;
            const travelFraction = (support.topY - previousFoot.y) / verticalTravel;
            if (travelFraction < 0 || travelFraction > 1 || travelFraction >= earliestFraction) continue;
            const crossingX = previousFoot.x + (foot.x - previousFoot.x) * travelFraction;
            if (!containsHorizontalPoint(support, crossingX, tolerance)) continue;
            landing = immutableLanding(support, crossingX, travelFraction);
            earliestFraction = travelFraction;
        }
        return landing;
    }

    inspect(foot, { previousFoot = null } = {}) {
        const current = this.currentSupport(foot);
        return Object.freeze({
            current,
            below: this.supportBelow(foot),
            landing: previousFoot === null ? null : this.landingCrossing(previousFoot, foot)
        });
    }
}
