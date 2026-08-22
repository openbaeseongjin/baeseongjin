import { withPhysics } from "../../../physics/PhysicsMixin.js";
import { pointInPolygon } from "../../../world/PolygonGeometry.js";
import {
    ACTION_EVENT_TYPE,
    ACTION_KEY,
    ACTION_RUNTIME_CONFIG,
    ACTION_SOURCE_KIND,
    ACTION_STATE_CONFIG,
    BASE_ACTION_ID
} from "../ActionAugmentDefinition.js";
import { actionProjectileCollisionPolicy } from "./ActionProjectileCollisionPolicy.js";

function segmentEdgeIntersectionRatio(start, end, edgeStart, edgeEnd) {
    const ray = { x: end.x - start.x, y: end.y - start.y };
    const edge = { x: edgeEnd.x - edgeStart.x, y: edgeEnd.y - edgeStart.y };
    const denominator = ray.x * edge.y - ray.y * edge.x;
    if (Math.abs(denominator) <= ACTION_RUNTIME_CONFIG.GEOMETRY_EPSILON) return null;
    const offset = { x: edgeStart.x - start.x, y: edgeStart.y - start.y };
    const ratio = (offset.x * edge.y - offset.y * edge.x) / denominator;
    const edgeRatio = (offset.x * ray.y - offset.y * ray.x) / denominator;
    return ratio >= ACTION_STATE_CONFIG.ZERO &&
        ratio <= ACTION_STATE_CONFIG.UNIT &&
        edgeRatio >= ACTION_STATE_CONFIG.ZERO &&
        edgeRatio <= ACTION_STATE_CONFIG.UNIT
        ? ratio
        : null;
}

function firstSurfaceHitRatio(start, end, surfaces) {
    let first = null;
    for (const surface of surfaces) {
        if (
            surface.collision === false ||
            !Array.isArray(surface.vertices) ||
            surface.vertices.length < ACTION_RUNTIME_CONFIG.MINIMUM_POLYGON_VERTICES
        ) {
            continue;
        }
        if (pointInPolygon(start, surface.vertices)) return ACTION_STATE_CONFIG.ZERO;
        for (let index = ACTION_STATE_CONFIG.ZERO; index < surface.vertices.length; index += ACTION_STATE_CONFIG.UNIT) {
            const ratio = segmentEdgeIntersectionRatio(
                start,
                end,
                surface.vertices[index],
                surface.vertices[(index + ACTION_STATE_CONFIG.UNIT) % surface.vertices.length]
            );
            if (ratio !== null && (first === null || ratio < first)) first = ratio;
        }
    }
    return first;
}

class ActionProjectile extends withPhysics(class {}) {
    constructor({
        id,
        position,
        direction,
        traveled = ACTION_STATE_CONFIG.ZERO,
        range,
        speed,
        radius = ACTION_RUNTIME_CONFIG.PROJECTILE_RADIUS,
        damage,
        piercing,
        piercedTargetIds = []
    }) {
        super();
        this.id = id;
        this.direction = Object.freeze({ x: direction.x, y: direction.y });
        this.traveled = traveled;
        this.range = range;
        this.speed = speed;
        this.radius = radius;
        this.damage = damage;
        this.piercing = piercing;
        this.collisionPolicy = actionProjectileCollisionPolicy(piercing);
        this.piercedTargetIds = new Set(piercedTargetIds);
        this.initializePhysics({
            position: { x: position.x, y: position.y },
            velocity: { x: direction.x * speed, y: direction.y * speed }
        });
    }

    snapshot() {
        return Object.freeze({
            id: this.id,
            position: Object.freeze({ x: this.position.x, y: this.position.y }),
            direction: this.direction,
            traveled: this.traveled,
            range: this.range,
            speed: this.speed,
            radius: this.radius,
            damage: this.damage,
            piercing: this.piercing,
            piercedTargetIds: Object.freeze([...this.piercedTargetIds])
        });
    }
}

export class ActionProjectileState {
    constructor() {
        this.projectiles = [];
    }

    spawn(definition) {
        this.projectiles.push(new ActionProjectile(definition));
    }

    advance({ enemies, surfaces, collisionBroadPhase, dt, distancePointToSegment, emitImpact, presentationEvents }) {
        const survivors = [];
        for (const projectile of this.projectiles) {
            const start = { x: projectile.position.x, y: projectile.position.y };
            const travel = Math.min(projectile.speed * dt, projectile.range - projectile.traveled);
            const destination = projectile.physicsDestination(travel / projectile.speed);
            const end = { x: destination.x, y: destination.y };
            const delta = { x: end.x - start.x, y: end.y - start.y };
            const lengthSquared = delta.x * delta.x + delta.y * delta.y;
            const collisionSurfaces = collisionBroadPhase
                ? collisionBroadPhase.querySurfaces({
                      collider: { type: ACTION_RUNTIME_CONFIG.FALLBACK_COLLIDER_TYPE, radius: projectile.radius },
                      start,
                      end
                  })
                : surfaces;
            const wallRatio = firstSurfaceHitRatio(start, end, collisionSurfaces);
            const contacts = enemies
                .filter(
                    (enemy) =>
                        enemy.health > ACTION_STATE_CONFIG.ZERO &&
                        !projectile.piercedTargetIds.has(enemy.id) &&
                        distancePointToSegment(enemy.position, start, end) <= enemy.radius + projectile.radius
                )
                .map((enemy) => ({
                    enemy,
                    ratio:
                        lengthSquared <= ACTION_RUNTIME_CONFIG.GEOMETRY_EPSILON
                            ? ACTION_STATE_CONFIG.ZERO
                            : Math.max(
                                  ACTION_STATE_CONFIG.ZERO,
                                  Math.min(
                                      ACTION_STATE_CONFIG.UNIT,
                                      ((enemy.position.x - start.x) * delta.x +
                                          (enemy.position.y - start.y) * delta.y) /
                                          lengthSquared
                                  )
                              )
                }))
                .filter(
                    ({ ratio }) => wallRatio === null || ratio <= wallRatio + ACTION_RUNTIME_CONFIG.GEOMETRY_EPSILON
                )
                .sort(({ enemy: left, ratio: leftRatio }, { enemy: right, ratio: rightRatio }) =>
                    leftRatio === rightRatio ? left.id.localeCompare(right.id) : leftRatio - rightRatio
                );
            const resolvedContacts = projectile.collisionPolicy.resolvedContacts(contacts);
            for (const { enemy } of resolvedContacts) {
                projectile.piercedTargetIds.add(enemy.id);
                emitImpact({
                    eventId: ACTION_KEY.projectileImpact(projectile.id, enemy.id),
                    enemy,
                    effectId: BASE_ACTION_ID.STRAIGHT_SHOT,
                    sourceKind: ACTION_SOURCE_KIND.ACTION_PROJECTILE,
                    damage: projectile.damage,
                    sourcePosition: start,
                    contactPosition: enemy.position
                });
            }
            const hitEnemy = projectile.collisionPolicy.terminatesAfterContacts(resolvedContacts);
            const hitSolid = wallRatio !== null;
            const terminationRatio = hitEnemy
                ? resolvedContacts[ACTION_STATE_CONFIG.ZERO].ratio
                : hitSolid
                  ? wallRatio
                  : ACTION_STATE_CONFIG.UNIT;
            projectile.setPhysicsPosition({
                x: start.x + delta.x * terminationRatio,
                y: start.y + delta.y * terminationRatio
            });
            projectile.traveled += travel * terminationRatio;
            if (!hitEnemy && !hitSolid && projectile.traveled < projectile.range) survivors.push(projectile);
            else {
                presentationEvents.push({
                    eventType: ACTION_EVENT_TYPE.SHOT_ENDED,
                    projectileId: projectile.id,
                    position: projectile.position
                });
            }
        }
        this.projectiles = survivors;
    }

    snapshot() {
        return Object.freeze(this.projectiles.map((projectile) => projectile.snapshot()));
    }

    restore(projectiles) {
        this.projectiles = projectiles.map((projectile) => new ActionProjectile(projectile));
    }

    reset() {
        this.projectiles = [];
    }
}
