import { withPhysics } from "../physics/PhysicsMixin.js";
import { pointInPolygon } from "../world/PolygonGeometry.js";
import { SPELL_EVENT_TYPE, SPELL_KEY, SPELL_RUNTIME_SPEC, SPELL_SOURCE_KIND } from "./SpellRuntimeDefinition.js";
import { SPELL_ID } from "./SpellDefinition.js";
import { spellProjectileCollisionPolicy } from "./SpellProjectileCollisionPolicy.js";
import { SPELL_TARGET_POLICY_ID, spellTargetPolicy } from "./SpellTargetPolicy.js";
import { directionBetween } from "./SpellRuntimeSupport.js";

function segmentEdgeIntersectionRatio(start, end, edgeStart, edgeEnd) {
    const ray = { x: end.x - start.x, y: end.y - start.y };
    const edge = { x: edgeEnd.x - edgeStart.x, y: edgeEnd.y - edgeStart.y };
    const denominator = ray.x * edge.y - ray.y * edge.x;
    if (Math.abs(denominator) <= SPELL_RUNTIME_SPEC.GEOMETRY_EPSILON) return null;
    const offset = { x: edgeStart.x - start.x, y: edgeStart.y - start.y };
    const ratio = (offset.x * edge.y - offset.y * edge.x) / denominator;
    const edgeRatio = (offset.x * ray.y - offset.y * ray.x) / denominator;
    return ratio >= SPELL_RUNTIME_SPEC.ZERO &&
        ratio <= SPELL_RUNTIME_SPEC.UNIT &&
        edgeRatio >= SPELL_RUNTIME_SPEC.ZERO &&
        edgeRatio <= SPELL_RUNTIME_SPEC.UNIT
        ? ratio
        : null;
}

function firstSurfaceHitRatio(start, end, surfaces) {
    let first = null;
    for (const surface of surfaces) {
        if (
            surface.collision === false ||
            !Array.isArray(surface.vertices) ||
            surface.vertices.length < SPELL_RUNTIME_SPEC.MINIMUM_POLYGON_VERTICES
        ) {
            continue;
        }
        if (pointInPolygon(start, surface.vertices)) return SPELL_RUNTIME_SPEC.ZERO;
        for (let index = SPELL_RUNTIME_SPEC.ZERO; index < surface.vertices.length; index += SPELL_RUNTIME_SPEC.UNIT) {
            const ratio = segmentEdgeIntersectionRatio(
                start,
                end,
                surface.vertices[index],
                surface.vertices[(index + SPELL_RUNTIME_SPEC.UNIT) % surface.vertices.length]
            );
            if (ratio !== null && (first === null || ratio < first)) first = ratio;
        }
    }
    return first;
}

class SpellProjectile extends withPhysics(class {}) {
    constructor({
        id,
        ownerId = null,
        spellId = SPELL_ID.ENERGY_ORB,
        targetPolicyId = SPELL_TARGET_POLICY_ID.EXCLUDE_SOURCE,
        position,
        direction,
        traveled = SPELL_RUNTIME_SPEC.ZERO,
        range,
        speed,
        radius = SPELL_RUNTIME_SPEC.PROJECTILE_RADIUS,
        damage,
        piercing,
        explosionRadius = 0,
        splashDamage = 0,
        splashEffectId = null,
        knockbackDistance = 0,
        knockbackDurationSeconds = 0,
        statusEffectId = null,
        piercedTargetIds = []
    }) {
        super();
        this.id = id;
        this.ownerId = ownerId;
        this.spellId = spellId;
        this.targetPolicy = spellTargetPolicy(targetPolicyId);
        this.direction = Object.freeze({ x: direction.x, y: direction.y });
        this.traveled = traveled;
        this.range = range;
        this.speed = speed;
        this.radius = radius;
        this.damage = damage;
        this.piercing = piercing;
        this.explosionRadius = explosionRadius;
        this.splashDamage = splashDamage;
        this.splashEffectId = splashEffectId;
        this.knockbackDistance = knockbackDistance;
        this.knockbackDurationSeconds = knockbackDurationSeconds;
        this.statusEffectId = statusEffectId;
        this.collisionPolicy = spellProjectileCollisionPolicy(piercing);
        this.piercedTargetIds = new Set(piercedTargetIds);
        this.initializePhysics({
            position: { x: position.x, y: position.y },
            velocity: { x: direction.x * speed, y: direction.y * speed }
        });
    }

    snapshot() {
        return Object.freeze({
            id: this.id,
            ownerId: this.ownerId,
            spellId: this.spellId,
            targetPolicyId: this.targetPolicy.id,
            position: Object.freeze({ x: this.position.x, y: this.position.y }),
            direction: this.direction,
            traveled: this.traveled,
            range: this.range,
            speed: this.speed,
            radius: this.radius,
            damage: this.damage,
            piercing: this.piercing,
            explosionRadius: this.explosionRadius,
            splashDamage: this.splashDamage,
            splashEffectId: this.splashEffectId,
            knockbackDistance: this.knockbackDistance,
            knockbackDurationSeconds: this.knockbackDurationSeconds,
            statusEffectId: this.statusEffectId,
            piercedTargetIds: Object.freeze([...this.piercedTargetIds])
        });
    }
}

export class SpellProjectileState {
    constructor() {
        this.projectiles = [];
    }

    spawn(definition) {
        this.projectiles.push(new SpellProjectile(definition));
    }

    advance({
        enemies,
        targets = enemies,
        surfaces,
        collisionBroadPhase,
        dt,
        distancePointToSegment,
        emitImpact,
        presentationEvents
    }) {
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
                      collider: { type: SPELL_RUNTIME_SPEC.FALLBACK_COLLIDER_TYPE, radius: projectile.radius },
                      start,
                      end
                  })
                : surfaces;
            const wallRatio = firstSurfaceHitRatio(start, end, collisionSurfaces);
            const contacts = targets
                .filter(
                    (target) =>
                        projectile.targetPolicy.allows(projectile.ownerId, target.id) &&
                        target.health > SPELL_RUNTIME_SPEC.ZERO &&
                        !projectile.piercedTargetIds.has(target.id) &&
                        distancePointToSegment(target.position, start, end) <=
                            (target.radius ?? target.collider?.radius ?? 0) + projectile.radius
                )
                .map((target) => ({
                    target,
                    ratio:
                        lengthSquared <= SPELL_RUNTIME_SPEC.GEOMETRY_EPSILON
                            ? SPELL_RUNTIME_SPEC.ZERO
                            : Math.max(
                                  SPELL_RUNTIME_SPEC.ZERO,
                                  Math.min(
                                      SPELL_RUNTIME_SPEC.UNIT,
                                      ((target.position.x - start.x) * delta.x +
                                          (target.position.y - start.y) * delta.y) /
                                          lengthSquared
                                  )
                              )
                }))
                .filter(({ ratio }) => wallRatio === null || ratio <= wallRatio + SPELL_RUNTIME_SPEC.GEOMETRY_EPSILON)
                .sort(({ target: left, ratio: leftRatio }, { target: right, ratio: rightRatio }) =>
                    leftRatio === rightRatio ? left.id.localeCompare(right.id) : leftRatio - rightRatio
                );
            const resolvedContacts = projectile.collisionPolicy.resolvedContacts(contacts);
            for (const { target } of resolvedContacts) {
                projectile.piercedTargetIds.add(target.id);
                emitImpact({
                    eventId: SPELL_KEY.projectileImpact(projectile.id, target.id),
                    target,
                    effectId: projectile.spellId,
                    sourceKind: SPELL_SOURCE_KIND.PROJECTILE,
                    damage: projectile.damage,
                    sourcePosition: start,
                    contactPosition: target.position,
                    statusEffectId: projectile.statusEffectId,
                    knockback:
                        projectile.knockbackDistance > 0
                            ? Object.freeze({
                                  direction: projectile.direction,
                                  distance: projectile.knockbackDistance,
                                  durationSeconds: projectile.knockbackDurationSeconds
                              })
                            : null
                });
            }
            const hitEnemy = projectile.collisionPolicy.terminatesAfterContacts(resolvedContacts);
            const hitSolid = wallRatio !== null;
            const terminationRatio = hitEnemy
                ? resolvedContacts[SPELL_RUNTIME_SPEC.ZERO].ratio
                : hitSolid
                  ? wallRatio
                  : SPELL_RUNTIME_SPEC.UNIT;
            projectile.setPhysicsPosition({
                x: start.x + delta.x * terminationRatio,
                y: start.y + delta.y * terminationRatio
            });
            projectile.traveled += travel * terminationRatio;
            const impactPosition = { x: projectile.position.x, y: projectile.position.y };
            if ((hitEnemy || hitSolid) && projectile.explosionRadius > 0) {
                for (const target of targets) {
                    if (
                        !projectile.targetPolicy.allows(projectile.ownerId, target.id) ||
                        resolvedContacts.some((contact) => contact.target.id === target.id) ||
                        target.health <= SPELL_RUNTIME_SPEC.ZERO ||
                        Math.hypot(target.position.x - impactPosition.x, target.position.y - impactPosition.y) >
                            projectile.explosionRadius + (target.radius ?? target.collider?.radius ?? 0)
                    ) {
                        continue;
                    }
                    emitImpact({
                        eventId: SPELL_KEY.projectileImpact(projectile.id, target.id),
                        target,
                        effectId: projectile.splashEffectId ?? projectile.spellId,
                        sourceKind: SPELL_SOURCE_KIND.AREA,
                        damage: projectile.splashDamage,
                        sourcePosition: impactPosition,
                        contactPosition: target.position,
                        statusEffectId: projectile.statusEffectId,
                        knockback:
                            projectile.knockbackDistance > 0
                                ? Object.freeze({
                                      direction: directionBetween(
                                          impactPosition,
                                          target.position,
                                          projectile.direction
                                      ),
                                      distance: projectile.knockbackDistance,
                                      durationSeconds: projectile.knockbackDurationSeconds
                                  })
                                : null
                    });
                }
            }
            if (!hitEnemy && !hitSolid && projectile.traveled < projectile.range) survivors.push(projectile);
            else {
                presentationEvents.push({
                    eventType: SPELL_EVENT_TYPE.PROJECTILE_ENDED,
                    projectileId: projectile.id,
                    position: projectile.position,
                    spellId: projectile.spellId
                });
            }
        }
        this.projectiles = survivors;
    }

    snapshot() {
        return Object.freeze(this.projectiles.map((projectile) => projectile.snapshot()));
    }

    restore(projectiles) {
        this.projectiles = projectiles.map((projectile) => new SpellProjectile(projectile));
    }

    reset() {
        this.projectiles = [];
    }
}
