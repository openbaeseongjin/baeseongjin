import { spellTargetPolicy } from "./SpellTargetPolicy.js";
import {
    combatTargetBoundingRadius,
    combatTargetColliderSnapshot,
    combatTargetOverlapsCircle,
    combatTargetOverlapsSweptCircle
} from "../combat/CombatTargetGeometry.js";
import { colliderSnapshotWorldVertices } from "../physics/colliders/Collider.js";
import { closestPointOnPolygon, pointInPolygon } from "../world/PolygonGeometry.js";
import { directionBetween } from "./SpellRuntimeSupport.js";
import { SPELL_KEY, SPELL_SOURCE_KIND } from "./SpellRuntimeDefinition.js";

const GEOMETRY_EPSILON = 0.0000001;

function pointInsideCone(area, point) {
    const dx = point.x - area.position.x;
    const dy = point.y - area.position.y;
    const distance = Math.hypot(dx, dy);
    if (distance > area.range || distance <= GEOMETRY_EPSILON) return distance <= GEOMETRY_EPSILON;
    const projection = dx * area.direction.x + dy * area.direction.y;
    return projection / distance >= Math.cos((area.halfAngleDegrees * Math.PI) / 180);
}

function segmentsIntersect(startA, endA, startB, endB) {
    const cross = (a, b, c) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
    const aStart = cross(startA, endA, startB);
    const aEnd = cross(startA, endA, endB);
    const bStart = cross(startB, endB, startA);
    const bEnd = cross(startB, endB, endA);
    const onSegment = (start, point, end) =>
        point.x >= Math.min(start.x, end.x) - GEOMETRY_EPSILON &&
        point.x <= Math.max(start.x, end.x) + GEOMETRY_EPSILON &&
        point.y >= Math.min(start.y, end.y) - GEOMETRY_EPSILON &&
        point.y <= Math.max(start.y, end.y) + GEOMETRY_EPSILON;
    if (Math.abs(aStart) <= GEOMETRY_EPSILON && onSegment(startA, startB, endA)) return true;
    if (Math.abs(aEnd) <= GEOMETRY_EPSILON && onSegment(startA, endB, endA)) return true;
    if (Math.abs(bStart) <= GEOMETRY_EPSILON && onSegment(startB, startA, endB)) return true;
    if (Math.abs(bEnd) <= GEOMETRY_EPSILON && onSegment(startB, endA, endB)) return true;
    return Math.sign(aStart) !== Math.sign(aEnd) && Math.sign(bStart) !== Math.sign(bEnd);
}

function coneOverlapsPolygon(area, target, snapshot) {
    const vertices = colliderSnapshotWorldVertices(snapshot, target.position);
    if (pointInPolygon(area.position, vertices) || vertices.some((vertex) => pointInsideCone(area, vertex)))
        return true;
    if (pointInsideCone(area, closestPointOnPolygon(area.position, vertices))) return true;
    const heading = Math.atan2(area.direction.y, area.direction.x);
    const halfAngle = (area.halfAngleDegrees * Math.PI) / 180;
    const boundaryEnds = [heading - halfAngle, heading + halfAngle].map((angle) => ({
        x: area.position.x + Math.cos(angle) * area.range,
        y: area.position.y + Math.sin(angle) * area.range
    }));
    return vertices.some((start, index) => {
        const end = vertices[(index + 1) % vertices.length];
        return boundaryEnds.some((boundaryEnd) => segmentsIntersect(area.position, boundaryEnd, start, end));
    });
}

export function spellAreaContainsTarget(area, target) {
    const dx = target.position.x - area.position.x;
    const dy = target.position.y - area.position.y;
    const radius = combatTargetBoundingRadius(target);
    if (area.shape === "circle") return combatTargetOverlapsCircle(target, area.position, area.radius);
    if (area.shape === "line") {
        return combatTargetOverlapsSweptCircle(
            target,
            area.position,
            {
                x: area.position.x + area.direction.x * area.range,
                y: area.position.y + area.direction.y * area.range
            },
            area.radius
        );
    }
    const projection = dx * area.direction.x + dy * area.direction.y;
    if (projection < -radius || projection > area.range + radius) return false;
    if (area.shape === "cone") {
        const snapshot = combatTargetColliderSnapshot(target);
        if (snapshot.type === "polygon") return coneOverlapsPolygon(area, target, snapshot);
        const distance = Math.hypot(dx, dy);
        if (distance > area.range + radius) return false;
        if (distance <= radius) return true;
        return projection / distance >= Math.cos((area.halfAngleDegrees * Math.PI) / 180);
    }
    return false;
}

function knockback(area, target) {
    if (!(area.knockbackImpulse > 0)) return null;
    const fallback = area.direction;
    const direction =
        area.knockbackMode === "inward"
            ? directionBetween(target.position, area.position, fallback)
            : directionBetween(area.position, target.position, fallback);
    return Object.freeze({ direction, impulse: area.knockbackImpulse });
}

export class SpellAreaState {
    constructor() {
        this.areas = [];
    }

    spawn(definition) {
        this.areas.push({ ...definition, affectedTargetIds: new Set(definition.affectedTargetIds ?? []) });
    }

    advance({ targets, dt, emitImpact }) {
        const survivors = [];
        for (const area of this.areas) {
            const policy = spellTargetPolicy(area.targetPolicyId);
            for (const target of targets) {
                if (
                    target.health <= 0 ||
                    area.affectedTargetIds.has(target.id) ||
                    !policy.allows(area.ownerId, target.id) ||
                    !spellAreaContainsTarget(area, target)
                )
                    continue;
                area.affectedTargetIds.add(target.id);
                emitImpact({
                    eventId: SPELL_KEY.projectileImpact(area.id, target.id),
                    target,
                    effectId: area.spellId,
                    sourceKind: SPELL_SOURCE_KIND.AREA,
                    damage: area.damage,
                    sourcePosition: area.position,
                    contactPosition: target.position,
                    statusEffectId: area.statusEffectId ?? null,
                    knockback: knockback(area, target)
                });
            }
            area.remainingSeconds -= dt;
            if (area.remainingSeconds > 0) survivors.push(area);
        }
        this.areas = survivors;
    }

    snapshot() {
        return Object.freeze(
            this.areas.map((area) =>
                Object.freeze({ ...area, affectedTargetIds: Object.freeze([...area.affectedTargetIds]) })
            )
        );
    }

    restore(areas = []) {
        this.areas = areas.map((area) => ({ ...area, affectedTargetIds: new Set(area.affectedTargetIds ?? []) }));
    }
    reset() {
        this.areas = [];
    }
}
