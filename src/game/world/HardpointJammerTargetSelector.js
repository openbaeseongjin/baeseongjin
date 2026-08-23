import { ropeLaunchHandPoint } from "../rope/RopeAttachment.js";
import { hookReach } from "../rope/RopeLauncher.js";
import { isRopeableCollisionSurface } from "../rope/RopeableSurfaceMixin.js";
import { segmentIntersectsSurface } from "./PolygonGeometry.js";
import { closestPointOnSurface } from "./WorldGenerator.js";

export const HARDPOINT_JAMMER_TARGETING_CONFIG = Object.freeze({
    fieldRange: 760,
    minimumLaunchDistance: 48,
    movementDirectionThreshold: 30,
    directionWeight: 180
});

function normalizedDirection(from, to, fallback = { x: 0, y: -1 }) {
    const x = to.x - from.x;
    const y = to.y - from.y;
    const length = Math.hypot(x, y);
    return length > Number.EPSILON ? { x: x / length, y: y / length } : fallback;
}

function likelyTravelDirection(player, config) {
    const velocity = player.physics.physicsStepVelocity();
    const speed = Math.hypot(velocity.x, velocity.y);
    if (speed >= config.movementDirectionThreshold) return { x: velocity.x / speed, y: velocity.y / speed };
    return { x: 0, y: -1 };
}

function isOccluded(origin, target, targetSurfaceId, surfaces) {
    return surfaces.some(
        (surface) =>
            surface.id !== targetSurfaceId &&
            (surface.kind === "inter-floor-divider" || surface.ropeOccluder === true) &&
            segmentIntersectsSurface(origin, target, surface)
    );
}

function candidatesForPlayer({ player, source, querySurfaces, ropeConfig, excludedSurfaceIds, config }) {
    const effectiveRopeConfig = player.foundation.effectiveRopeConfig(ropeConfig);
    const reach = hookReach(effectiveRopeConfig);
    const direction = likelyTravelDirection(player, config);
    const origin = ropeLaunchHandPoint(player.physics, effectiveRopeConfig.handOffset, {
        x: player.position.x + direction.x,
        y: player.position.y + direction.y
    });
    const surfaces = querySurfaces({ x: origin.x - reach, y: origin.y - reach, width: reach * 2, height: reach * 2 });
    const candidates = [];
    for (const surface of surfaces) {
        if (!isRopeableCollisionSurface(surface) || excludedSurfaceIds.has(surface.id)) continue;
        const point = closestPointOnSurface(origin, surface);
        const launchDistance = Math.hypot(point.x - origin.x, point.y - origin.y);
        if (launchDistance < config.minimumLaunchDistance || launchDistance > reach) continue;
        if (Math.hypot(point.x - source.position.x, point.y - source.position.y) > config.fieldRange) continue;
        if (isOccluded(origin, point, surface.id, surfaces)) continue;
        const targetDirection = normalizedDirection(origin, point);
        const alignment = direction.x * targetDirection.x + direction.y * targetDirection.y;
        candidates.push(
            Object.freeze({
                surfaceId: surface.id,
                score: launchDistance + (1 - alignment) * config.directionWeight
            })
        );
    }
    return candidates.sort((left, right) => left.score - right.score || left.surfaceId.localeCompare(right.surfaceId));
}

export function resolveHardpointJammerCandidateSurfaceIds({
    source,
    players,
    querySurfaces,
    ropeConfig,
    excludedSurfaceIds = new Set(),
    config = HARDPOINT_JAMMER_TARGETING_CONFIG
}) {
    if (!source?.position || typeof querySurfaces !== "function") return Object.freeze([]);
    const candidateBySurfaceId = Object.create(null);
    for (const player of players) {
        if (player.lifeState !== "active" || player.health <= 0) continue;
        const candidates = candidatesForPlayer({
            player,
            source,
            querySurfaces,
            ropeConfig,
            excludedSurfaceIds,
            config
        });
        if (candidates.length < 2) continue;
        for (const candidate of candidates) {
            const current = candidateBySurfaceId[candidate.surfaceId];
            if (!current || candidate.score < current.score) candidateBySurfaceId[candidate.surfaceId] = candidate;
        }
    }
    return Object.freeze(
        Object.values(candidateBySurfaceId)
            .sort((left, right) => left.score - right.score || left.surfaceId.localeCompare(right.surfaceId))
            .map(({ surfaceId }) => surfaceId)
    );
}
