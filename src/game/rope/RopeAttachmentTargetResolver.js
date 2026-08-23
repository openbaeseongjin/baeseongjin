import { rotateVector } from "../physics/AngularMotion.js";
import { firstSegmentSurfaceIntersection, segmentIntersectsSurface } from "../world/PolygonGeometry.js";
import { closestPointOnSurface } from "../world/WorldGenerator.js";
import { isRopeableCollisionSurface } from "./RopeableSurfaceMixin.js";
import { ropeAnchorState } from "./RopeAttachment.js";

const TARGET_KIND = Object.freeze({ DIRECT: 0, ASSISTED: 1 });
const TARGET_EPSILON = 1e-6;

function distance(left, right) {
    return Math.hypot(left.x - right.x, left.y - right.y);
}

function rayEnd(origin, aimPoint, length) {
    const dx = aimPoint.x - origin.x;
    const dy = aimPoint.y - origin.y;
    const magnitude = Math.hypot(dx, dy);
    if (magnitude <= TARGET_EPSILON) return null;
    return Object.freeze({ x: origin.x + (dx / magnitude) * length, y: origin.y + (dy / magnitude) * length });
}

function candidateOrder(left, right) {
    if (left.kind !== right.kind) return left.kind - right.kind;
    if (left.kind === TARGET_KIND.DIRECT && left.launchDistance !== right.launchDistance) {
        return left.launchDistance - right.launchDistance;
    }
    if (left.aimDistance !== right.aimDistance) return left.aimDistance - right.aimDistance;
    if (left.launchDistance !== right.launchDistance) return left.launchDistance - right.launchDistance;
    return left.stableId.localeCompare(right.stableId, "en");
}

export class RopeAttachmentTargetResolver {
    constructor({
        aimPoint,
        origin,
        surfaces,
        attachmentTargets,
        maxAttachDistance,
        aimTolerance,
        canAttachToSurface
    }) {
        this.aimPoint = aimPoint;
        this.origin = origin;
        this.surfaces = surfaces;
        this.attachmentTargets = attachmentTargets;
        this.maxAttachDistance = maxAttachDistance;
        this.aimTolerance = aimTolerance;
        this.canAttachToSurface = canAttachToSurface;
        this.rayEnd = rayEnd(origin, aimPoint, maxAttachDistance);
        this.occluders = Object.freeze([
            ...surfaces.filter((surface) => surface.kind === "inter-floor-divider" || surface.ropeOccluder === true),
            ...attachmentTargets
                .map(({ ropeableSurface }) => ropeableSurface)
                .filter((surface) => surface?.ropeOccluder !== false)
        ]);
    }

    resolve() {
        if (!this.rayEnd) return null;
        const candidates = [];
        for (const surface of this.surfaces) {
            const candidate = this.#surfaceCandidate(surface, surface.id);
            if (candidate) candidates.push(candidate);
        }
        for (const target of this.attachmentTargets) {
            const candidate = target.ropeableSurface
                ? this.#actorSurfaceCandidate(target)
                : this.#pointActorCandidate(target);
            if (candidate) candidates.push(candidate);
        }
        const best = candidates.sort(candidateOrder)[0];
        if (!best) return null;
        return Object.freeze({
            x: best.point.x,
            y: best.point.y,
            surfaceId: best.surfaceId,
            anchorVelocity: best.anchorVelocity,
            ropeAttachment: best.ropeAttachment
        });
    }

    #actorSurfaceCandidate(target) {
        const surface = target.ropeableSurface;
        if (!isRopeableCollisionSurface(surface)) return null;
        const candidate = this.#surfaceCandidate(surface, target.id);
        if (!candidate) return null;
        const localAnchor = rotateVector(
            { x: candidate.point.x - target.position.x, y: candidate.point.y - target.position.y },
            -(target.angle ?? 0)
        );
        const anchor = ropeAnchorState(target, localAnchor);
        return {
            ...candidate,
            surfaceId: surface.id,
            anchorVelocity: anchor.velocity,
            ropeAttachment: Object.freeze({ ownerId: target.id, localAnchor: Object.freeze(localAnchor) })
        };
    }

    #surfaceCandidate(surface, stableId) {
        if (!isRopeableCollisionSurface(surface)) return null;
        if (this.canAttachToSurface && this.canAttachToSurface(surface) === false) return null;
        const directHit = firstSegmentSurfaceIntersection(this.origin, this.rayEnd, surface);
        let point = directHit?.point ?? closestPointOnSurface(this.aimPoint, surface);
        const kind = directHit ? TARGET_KIND.DIRECT : TARGET_KIND.ASSISTED;
        const aimDistance = directHit ? 0 : distance(point, this.aimPoint);
        if (!directHit) {
            if (aimDistance > this.aimTolerance) return null;
            point = firstSegmentSurfaceIntersection(this.origin, point, surface)?.point ?? point;
        }
        const launchDistance = distance(point, this.origin);
        if (launchDistance > this.maxAttachDistance) return null;
        if (this.#occluded(point, stableId)) return null;
        return {
            kind,
            stableId,
            surfaceId: surface.id,
            point,
            aimDistance,
            launchDistance,
            anchorVelocity: Object.freeze({ x: 0, y: 0 }),
            ropeAttachment: null
        };
    }

    #pointActorCandidate(target) {
        const attachment = target?.ropeAttachment;
        if (!target?.position || !attachment || typeof attachment.ownerId !== "string") return null;
        const anchor = ropeAnchorState(target, attachment.localAnchor);
        const point = anchor.position;
        const launchDistance = distance(point, this.origin);
        const aimDistance = distance(point, this.aimPoint);
        if (
            launchDistance > this.maxAttachDistance ||
            aimDistance > this.aimTolerance ||
            this.#occluded(point, attachment.ownerId)
        ) {
            return null;
        }
        return {
            kind: TARGET_KIND.ASSISTED,
            stableId: attachment.ownerId,
            surfaceId: null,
            point: anchor.position,
            aimDistance,
            launchDistance,
            anchorVelocity: anchor.velocity,
            ropeAttachment: Object.freeze({
                ownerId: attachment.ownerId,
                localAnchor: Object.freeze({ ...attachment.localAnchor })
            })
        };
    }

    #occluded(point, targetId) {
        return this.occluders.some(
            (surface) => surface.id !== targetId && segmentIntersectsSurface(this.origin, point, surface)
        );
    }
}
