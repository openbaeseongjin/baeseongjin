import { withPhysics } from "../physics/PhysicsMixin.js";
import { pointInPolygon } from "../world/PolygonGeometry.js";
import {
    combatTargetOverlapsCircle,
    combatTargetOverlapsSweptCircle,
    combatTargetSweptCircleContact
} from "../combat/CombatTargetGeometry.js";
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
        piercing = false,
        explosionRadius = 0,
        splashDamage = 0,
        splashEffectId = null,
        knockbackDistance = 0,
        knockbackDurationSeconds = 0,
        knockbackImpulse = 0,
        knockbackMode = "outward",
        statusEffectId = null,
        piercedTargetIds = [],
        targetsBodyCollision = true,
        auraRadius = 0,
        auraDamage = 0,
        auraEffectId = null,
        auraStatusEffectId = null,
        auraTargetIds = []
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
        this.knockbackImpulse = knockbackImpulse;
        this.knockbackMode = knockbackMode;
        this.statusEffectId = statusEffectId;
        this.collisionPolicy = spellProjectileCollisionPolicy(piercing);
        this.piercedTargetIds = new Set(piercedTargetIds);
        this.targetsBodyCollision = targetsBodyCollision;
        this.auraRadius = auraRadius;
        this.auraDamage = auraDamage;
        this.auraEffectId = auraEffectId;
        this.auraStatusEffectId = auraStatusEffectId;
        this.auraTargetIds = new Set(auraTargetIds);
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
            knockbackImpulse: this.knockbackImpulse,
            knockbackMode: this.knockbackMode,
            statusEffectId: this.statusEffectId,
            piercedTargetIds: Object.freeze([...this.piercedTargetIds]),
            targetsBodyCollision: this.targetsBodyCollision,
            auraRadius: this.auraRadius,
            auraDamage: this.auraDamage,
            auraEffectId: this.auraEffectId,
            auraStatusEffectId: this.auraStatusEffectId,
            auraTargetIds: Object.freeze([...this.auraTargetIds])
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

    advance({ enemies, targets = enemies, surfaces, collisionBroadPhase, dt, emitImpact, presentationEvents }) {
        const survivors = [];
        for (const projectile of this.projectiles) {
            const start = { x: projectile.position.x, y: projectile.position.y };
            const travel = Math.min(projectile.speed * dt, projectile.range - projectile.traveled);
            const destination = projectile.physicsDestination(travel / projectile.speed);
            const end = { x: destination.x, y: destination.y };
            const delta = { x: end.x - start.x, y: end.y - start.y };
            const collisionSurfaces = collisionBroadPhase
                ? collisionBroadPhase.querySurfaces({
                      collider: { type: SPELL_RUNTIME_SPEC.FALLBACK_COLLIDER_TYPE, radius: projectile.radius },
                      start,
                      end
                  })
                : surfaces;
            const wallRatio = firstSurfaceHitRatio(start, end, collisionSurfaces);
            if (projectile.auraRadius > 0) {
                for (const target of targets) {
                    if (
                        projectile.auraTargetIds.has(target.id) ||
                        !projectile.targetPolicy.allows(projectile.ownerId, target.id) ||
                        target.health <= SPELL_RUNTIME_SPEC.ZERO ||
                        !combatTargetOverlapsSweptCircle(target, start, end, projectile.auraRadius)
                    )
                        continue;
                    projectile.auraTargetIds.add(target.id);
                    emitImpact({
                        eventId: SPELL_KEY.projectileImpact(projectile.id, target.id),
                        target,
                        effectId: projectile.auraEffectId ?? projectile.spellId,
                        sourceKind: SPELL_SOURCE_KIND.AREA,
                        damage: projectile.auraDamage,
                        sourcePosition: start,
                        contactPosition: target.position,
                        statusEffectId: projectile.auraStatusEffectId
                    });
                }
            }
            const contacts = (projectile.targetsBodyCollision ? targets : [])
                .filter(
                    (target) =>
                        projectile.targetPolicy.allows(projectile.ownerId, target.id) &&
                        target.health > SPELL_RUNTIME_SPEC.ZERO &&
                        !projectile.piercedTargetIds.has(target.id)
                )
                .map((target) => ({
                    target,
                    contact: combatTargetSweptCircleContact(target, start, end, projectile.radius)
                }))
                .filter(({ contact }) => contact !== null)
                .map(({ target, contact }) => ({ target, ratio: contact.ratio, contactPosition: contact.position }))
                .filter(({ ratio }) => wallRatio === null || ratio <= wallRatio + SPELL_RUNTIME_SPEC.GEOMETRY_EPSILON)
                .sort(({ target: left, ratio: leftRatio }, { target: right, ratio: rightRatio }) =>
                    leftRatio === rightRatio ? left.id.localeCompare(right.id) : leftRatio - rightRatio
                );
            const resolvedContacts = projectile.collisionPolicy.resolvedContacts(contacts);
            for (const { target, contactPosition } of resolvedContacts) {
                projectile.piercedTargetIds.add(target.id);
                emitImpact({
                    eventId: SPELL_KEY.projectileImpact(projectile.id, target.id),
                    target,
                    effectId: projectile.spellId,
                    sourceKind: SPELL_SOURCE_KIND.PROJECTILE,
                    damage: projectile.damage,
                    sourcePosition: start,
                    contactPosition,
                    statusEffectId: projectile.statusEffectId,
                    knockback:
                        projectile.knockbackMode === "inward"
                            ? null
                            : projectile.knockbackImpulse > 0
                              ? Object.freeze({ direction: projectile.direction, impulse: projectile.knockbackImpulse })
                              : projectile.knockbackDistance > 0
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
                        !combatTargetOverlapsCircle(target, impactPosition, projectile.explosionRadius)
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
                            projectile.knockbackImpulse > 0
                                ? Object.freeze({
                                      direction:
                                          projectile.knockbackMode === "inward"
                                              ? directionBetween(target.position, impactPosition, projectile.direction)
                                              : directionBetween(impactPosition, target.position, projectile.direction),
                                      impulse: projectile.knockbackImpulse
                                  })
                                : projectile.knockbackDistance > 0
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
