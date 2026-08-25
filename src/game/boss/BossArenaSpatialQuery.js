export const BOSS_ARENA_SUPPORT_KIND = Object.freeze({
    GROUND: "ground",
    PLATFORM: "platform"
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

function normalizeSupportSurface(surface, supportKindBySurfaceKind, label) {
    const supportKind = supportKindBySurfaceKind[surface?.kind] ?? null;
    if (supportKind === null) return null;
    if (typeof surface.id !== "string" || surface.id.length === 0) {
        throw new Error(`${label} support surface requires a non-empty id`);
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
        throw new Error(`${label} support surface ${surface.id} requires positive rectangular bounds`);
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

function orderedSupports(surfaces, supportKindBySurfaceKind, label) {
    if (!Array.isArray(surfaces)) throw new Error(`${label} requires authored surfaces`);
    return Object.freeze(
        surfaces
            .map((surface) => normalizeSupportSurface(surface, supportKindBySurfaceKind, label))
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

export class BossArenaSpatialQuery {
    constructor({ surfaces, supportKindBySurfaceKind, footTolerance = DEFAULT_FOOT_TOLERANCE, label = "Boss arena" }) {
        if (!supportKindBySurfaceKind || typeof supportKindBySurfaceKind !== "object") {
            throw new Error(`${label} requires a support kind lookup`);
        }
        this.footTolerance = requireNonNegativeFinite(footTolerance, `${label} footTolerance`);
        this.supports = orderedSupports(surfaces, supportKindBySurfaceKind, label);
        Object.freeze(this);
    }

    currentSupport(foot, { tolerance = this.footTolerance } = {}) {
        requireFinitePoint(foot, "Boss arena foot");
        requireNonNegativeFinite(tolerance, "Boss arena support tolerance");
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
        requireFinitePoint(foot, "Boss arena foot");
        requireNonNegativeFinite(minimumDrop, "Boss arena minimumDrop");
        requireDistance(maxDistance, "Boss arena maxDistance");
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
        requireFinitePoint(previousFoot, "Boss arena previous foot");
        requireFinitePoint(foot, "Boss arena foot");
        requireNonNegativeFinite(tolerance, "Boss arena landing tolerance");
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
