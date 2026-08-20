import { Vector2 } from "../../game-kit/index.js";
import { distancePointToSegment } from "../combat/CombatSystems.js";
import { AUGMENT_IMPACT_CONFIG } from "../config.js";
import { ropeAttachmentPoint } from "../rope/RopeAttachment.js";
import { pointInPolygon } from "../world/PolygonGeometry.js";
import { ActionAugmentState } from "./actions/ActionAugmentState.js";
import { actionAugmentById } from "./actions/ActionAugmentCatalog.js";
import { selectNearestActionTarget } from "./actions/ActionTargeting.js";
import { ElectrifiedRopeContactState } from "./rope/ElectrifiedRopeContactState.js";
import { resolveCollisionExplosion } from "./rope/CollisionExplosionState.js";

const IMPACT_DAMAGE = AUGMENT_IMPACT_CONFIG.baseDamage;

function directionBetween(from, to, fallback = { x: 1, y: 0 }) {
    const x = to.x - from.x;
    const y = to.y - from.y;
    const magnitude = Math.hypot(x, y);
    return magnitude > 1e-6 ? Object.freeze({ x: x / magnitude, y: y / magnitude }) : Object.freeze({ ...fallback });
}

function actionLoadout(foundation) {
    const baseActionId = foundation.selectedBaseActionId() ?? "default-punch";
    return Object.freeze({
        baseActionId,
        signatureId: foundation.selectedSignatureId(),
        modifierIds: foundation.selectedIds.filter((id) => actionAugmentById(id)?.category === "universal-modifier")
    });
}

function loadoutKey(loadout) {
    return loadout ? `${loadout.baseActionId}|${loadout.signatureId ?? ""}|${loadout.modifierIds.join(",")}` : "";
}

function impactEvent({
    eventId,
    player,
    enemy,
    tick,
    effectId,
    sourceKind,
    damage,
    impactSpeed,
    sourcePosition = player.physics.position,
    contactPosition = enemy.position,
    knockback = null
}) {
    return Object.freeze({
        eventId,
        predictionId: eventId,
        sourcePlayerId: player.id,
        targetId: enemy.id,
        clientTick: tick,
        effectId,
        sourceKind,
        sourcePosition: Object.freeze({ x: sourcePosition.x, y: sourcePosition.y }),
        contactPosition: Object.freeze({ x: contactPosition.x, y: contactPosition.y }),
        position: Object.freeze({ x: contactPosition.x, y: contactPosition.y }),
        damage,
        ...(impactSpeed === undefined ? {} : { impactSpeed }),
        ...(knockback ? { knockback: Object.freeze(knockback) } : {}),
        predictedResolution: enemy.blocksImpactFrom?.(sourcePosition)
            ? "shield-blocked"
            : enemy.health <= damage
              ? "enemy-defeated"
              : "enemy-hit"
    });
}

function targetsInRadius(enemies, center, radius) {
    return enemies.filter(
        (enemy) => enemy.health > 0 && Math.hypot(enemy.position.x - center.x, enemy.position.y - center.y) <= radius
    );
}

function segmentEdgeIntersectionRatio(start, end, edgeStart, edgeEnd) {
    const ray = { x: end.x - start.x, y: end.y - start.y };
    const edge = { x: edgeEnd.x - edgeStart.x, y: edgeEnd.y - edgeStart.y };
    const denominator = ray.x * edge.y - ray.y * edge.x;
    if (Math.abs(denominator) <= 1e-9) return null;
    const offset = { x: edgeStart.x - start.x, y: edgeStart.y - start.y };
    const ratio = (offset.x * edge.y - offset.y * edge.x) / denominator;
    const edgeRatio = (offset.x * ray.y - offset.y * ray.x) / denominator;
    return ratio >= 0 && ratio <= 1 && edgeRatio >= 0 && edgeRatio <= 1 ? ratio : null;
}

function firstSurfaceHitRatio(start, end, surfaces) {
    let first = null;
    for (const surface of surfaces) {
        if (surface.collision === false || !Array.isArray(surface.vertices) || surface.vertices.length < 3) continue;
        if (pointInPolygon(start, surface.vertices)) return 0;
        for (let index = 0; index < surface.vertices.length; index += 1) {
            const ratio = segmentEdgeIntersectionRatio(
                start,
                end,
                surface.vertices[index],
                surface.vertices[(index + 1) % surface.vertices.length]
            );
            if (ratio !== null && (first === null || ratio < first)) first = ratio;
        }
    }
    return first;
}

export class AugmentCombatRuntime {
    constructor({ maxHealth = 100 } = {}) {
        this.actionState = null;
        this.actionLoadoutKey = "";
        this.wasActionDown = false;
        this.electrified = new ElectrifiedRopeContactState({
            damagePerSecond: AUGMENT_IMPACT_CONFIG.electrifiedDamagePerSecond,
            pulseSeconds: AUGMENT_IMPACT_CONFIG.electrifiedPulseSeconds
        });
        this.actionProjectiles = [];
        this.hitIdsByActivation = new Map();
        this.maxHealth = maxHealth;
        this.eventSequence = 0;
        this.queuedImpactEvents = [];
    }

    syncLoadout(foundation, maxHealth = this.maxHealth) {
        const loadout = actionLoadout(foundation);
        const nextKey = loadoutKey(loadout);
        this.maxHealth = maxHealth;
        if (nextKey === this.actionLoadoutKey) return;
        const previous = this.actionState?.snapshot() ?? null;
        const previousModifiers = new Set(previous?.loadout?.modifierIds ?? []);
        this.actionLoadoutKey = nextKey;
        const next = new ActionAugmentState({ ...loadout, maxHealth });
        if (previous && previous.loadout.baseActionId === loadout.baseActionId) {
            next.restore({
                ...previous,
                loadout,
                maxHealth,
                ...(loadout.modifierIds.includes("extra-charge") && !previousModifiers.has("extra-charge")
                    ? { chargesRemaining: 2, rechargeRemaining: 0, rechargeQueue: [] }
                    : {})
            });
        }
        this.actionState = next;
    }

    prepareCommand(player, foundation, command) {
        this.syncLoadout(foundation, player.maxHealth);
        const slowFallActive = this.actionState?.activeAction?.baseActionId === "slow-fall" && command.action;
        return Object.freeze({
            ...command,
            gravityScale: slowFallActive ? 0.25 : 1,
            preserveActionImpulse: this.actionState?.activeAction?.baseActionId === "dash-strike"
        });
    }

    onRopeReleased() {
        return this.actionState?.onRopeReleased() ?? false;
    }

    absorbPlayerDamage(details) {
        return (
            this.actionState?.absorbIncomingDamage(details) ?? {
                appliedDamage: details.amount,
                absorbedByShield: 0,
                blockedByGuard: false,
                events: Object.freeze([])
            }
        );
    }

    queueDamageReflection({ player, attacker, damage, tick, sourceKind = "projectile" }) {
        if (!attacker || !Number.isFinite(damage) || damage <= 0) return null;
        const event = impactEvent({
            eventId: this.#nextEventId(player.id, "damage-reflect", tick, attacker.id),
            player,
            enemy: attacker,
            tick,
            effectId: "damage-reflect",
            sourceKind,
            damage,
            sourcePosition: player.physics.position,
            contactPosition: attacker.position
        });
        this.queuedImpactEvents.push(event);
        return event;
    }

    drainQueuedImpactEvents() {
        const events = Object.freeze([...this.queuedImpactEvents]);
        this.queuedImpactEvents.length = 0;
        return events;
    }

    advance({ player, foundation, command, dt, enemies, surfaces, tick }) {
        this.syncLoadout(foundation, player.maxHealth);
        const impactEvents = [];
        const presentationEvents = [];
        const activeBefore = this.actionState?.activeAction ? { ...this.actionState.activeAction } : null;

        if (activeBefore?.baseActionId === "dash-strike") {
            this.#resolveDashStrikeContacts({ player, active: activeBefore, enemies, tick, impactEvents });
            if (
                activeBefore.signatureId === "collision-rebound" &&
                player.physics.lastSurfaceCollisionNormals.length > 0
            ) {
                const incoming = player.physics.lastSurfaceCollisionIncomingVelocity;
                let reflectedX = incoming.x;
                let reflectedY = incoming.y;
                for (const normal of player.physics.lastSurfaceCollisionNormals) {
                    const dot = reflectedX * normal.x + reflectedY * normal.y;
                    if (dot >= 0) continue;
                    reflectedX -= 2 * dot * normal.x;
                    reflectedY -= 2 * dot * normal.y;
                }
                player.physics.velocity.set(reflectedX, reflectedY);
            }
        }

        const stateEvents =
            this.actionState?.advance(dt, {
                isGrounded: player.physics.isGrounded,
                cancelSlowFall: activeBefore?.baseActionId === "slow-fall" && !command.action
            }) ?? Object.freeze([]);
        this.#resolveActionStateEvents({
            player,
            events: stateEvents,
            enemies,
            tick,
            impactEvents,
            presentationEvents
        });

        const pressed = command.action && !this.wasActionDown;
        if (pressed) this.#beginAction({ player, enemies, surfaces, tick, impactEvents, presentationEvents });
        this.wasActionDown = command.action;
        this.#advanceActionProjectiles({ player, enemies, surfaces, dt, tick, impactEvents, presentationEvents });
        return Object.freeze({
            impactEvents: Object.freeze(impactEvents),
            presentationEvents: Object.freeze(presentationEvents)
        });
    }

    observeAttachedRope({ player, foundation, enemies, dt, tick }) {
        if (!foundation.has("electrified-rope") || !player.ropeObject.rope.isAttached) return Object.freeze([]);
        const rope = player.ropeObject.rope;
        const attachment = ropeAttachmentPoint(player.physics, rope);
        return this.electrified
            .observe({
                dt,
                segments: [{ start: rope.anchor, end: attachment }],
                enemies,
                sourcePlayerId: player.id,
                clientTick: tick
            })
            .map((pulse) =>
                impactEvent({
                    ...pulse,
                    player,
                    enemy: enemies.find(({ id }) => id === pulse.targetId),
                    tick,
                    effectId: "electrified-rope",
                    sourceKind: "rope-contact",
                    damage: pulse.damage,
                    sourcePosition: player.physics.position,
                    contactPosition: pulse.position
                })
            );
    }

    collisionExplosionEvents({ player, foundation, baseImpactEvents, enemies, tick }) {
        if (!foundation.has("collision-explosion")) return null;
        const events = [];
        for (const baseImpact of baseImpactEvents) {
            const primaryTarget = enemies.find(({ id }) => id === baseImpact.targetId);
            if (!primaryTarget) continue;
            for (const outcome of resolveCollisionExplosion({
                sourcePlayerId: player.id,
                clientTick: tick,
                primaryTarget,
                playerPosition: player.physics.position,
                enemies,
                impactDamage: baseImpact.damage
            })) {
                const enemy = enemies.find(({ id }) => id === outcome.targetId);
                if (!enemy) continue;
                events.push(
                    impactEvent({
                        eventId: outcome.eventId,
                        player,
                        enemy,
                        tick,
                        effectId:
                            outcome.targetId === primaryTarget.id
                                ? "collision-explosion-direct"
                                : "collision-explosion-splash",
                        sourceKind: "rope-collision-explosion",
                        damage: outcome.damage,
                        impactSpeed: baseImpact.impactSpeed,
                        sourcePosition:
                            outcome.targetId === primaryTarget.id ? player.physics.position : primaryTarget.position,
                        contactPosition: outcome.position,
                        knockback: outcome.knockback
                    })
                );
            }
        }
        return Object.freeze(events);
    }

    snapshot() {
        return Object.freeze({
            actionLoadoutKey: this.actionLoadoutKey,
            actionState: this.actionState?.snapshot() ?? null,
            wasActionDown: this.wasActionDown,
            electrified: this.electrified.snapshot(),
            actionProjectiles: Object.freeze(
                this.actionProjectiles.map((projectile) =>
                    Object.freeze({ ...projectile, piercedTargetIds: Object.freeze([...projectile.piercedTargetIds]) })
                )
            ),
            eventSequence: this.eventSequence
        });
    }

    restore(snapshot = null, foundation = null, maxHealth = this.maxHealth) {
        this.wasActionDown = snapshot?.wasActionDown === true;
        this.electrified.restore(snapshot?.electrified ?? null);
        this.actionProjectiles = (snapshot?.actionProjectiles ?? []).map((projectile) => ({
            ...projectile,
            piercedTargetIds: new Set(projectile.piercedTargetIds ?? [])
        }));
        this.eventSequence = Math.max(0, snapshot?.eventSequence ?? 0);
        if (foundation) {
            this.actionLoadoutKey = "";
            this.syncLoadout(foundation, maxHealth);
            if (
                this.actionState &&
                snapshot?.actionState &&
                loadoutKey(snapshot.actionState.loadout) === this.actionLoadoutKey
            ) {
                this.actionState.restore(snapshot.actionState);
            } else if (
                this.actionState?.loadout.baseActionId === "default-punch" &&
                (snapshot?.punchCooldownRemaining ?? 0) > 0
            ) {
                this.actionState.restore({
                    ...this.actionState.snapshot(),
                    chargesRemaining: 0,
                    rechargeRemaining: snapshot.punchCooldownRemaining,
                    rechargeDuration: actionAugmentById("default-punch").cooldownSeconds,
                    rechargeQueue: []
                });
            }
        }
        return this.snapshot();
    }

    resetForRespawn(foundation, maxHealth = this.maxHealth) {
        this.actionState = null;
        this.actionLoadoutKey = "";
        this.wasActionDown = false;
        this.electrified.reset();
        this.actionProjectiles = [];
        this.hitIdsByActivation.clear();
        this.queuedImpactEvents.length = 0;
        this.syncLoadout(foundation, maxHealth);
        return this.snapshot();
    }

    #nextEventId(playerId, effectId, tick, targetId) {
        const id = `${playerId}:${effectId}:${tick}:${targetId}:${this.eventSequence}`;
        this.eventSequence += 1;
        return id;
    }

    #beginAction({ player, enemies, surfaces, tick, impactEvents, presentationEvents }) {
        const direction = directionBetween(player.physics.position, player.ropeObject.aimWorld, {
            x: Math.sign(player.physics.velocity.x) || 1,
            y: 0
        });
        const result = this.actionState.beginAction({ direction, airborne: !player.physics.isGrounded });
        if (!result.accepted) return;
        const activation = result.activation;
        presentationEvents.push({
            eventType: "augment-action-started",
            activationId: activation.activationId,
            actionId: activation.baseActionId,
            position: Object.freeze({ x: player.physics.position.x, y: player.physics.position.y }),
            direction
        });
        if (activation.baseActionId === "default-punch") {
            const forwardEnemies = enemies.filter((enemy) => {
                const targetDirection = directionBetween(player.physics.position, enemy.position);
                return targetDirection.x * direction.x + targetDirection.y * direction.y >= 0;
            });
            const target = selectNearestActionTarget({
                playerPosition: player.physics.position,
                enemies: forwardEnemies,
                range: activation.range
            });
            if (target) {
                impactEvents.push(
                    impactEvent({
                        eventId: this.#nextEventId(player.id, "default-punch", tick, target.id),
                        player,
                        enemy: target,
                        tick,
                        effectId: "default-punch",
                        sourceKind: "default-punch",
                        damage: IMPACT_DAMAGE * activation.damageMultiplier,
                        knockback: {
                            direction: directionBetween(player.physics.position, target.position),
                            distance: activation.knockbackDistance,
                            durationSeconds: activation.knockbackSeconds
                        }
                    })
                );
            }
        } else if (activation.baseActionId === "direction-dash") {
            const start = { x: player.physics.position.x, y: player.physics.position.y };
            const destination = player.physics.collider.farthestSafePositionAlong({
                start,
                direction,
                distance: activation.distance,
                surfaces
            });
            player.physics.position.set(destination.position.x, destination.position.y);
            if (activation.trailEffect) {
                this.actionState.setExplosiveTrailPath(activation.activationId, start, destination.position);
            }
        } else if (activation.baseActionId === "dash-strike") {
            player.physics.addImpulse(direction, activation.impulse);
            this.hitIdsByActivation.set(activation.activationId, { damaged: new Set(), contacts: new Set() });
        } else if (activation.baseActionId === "push-away") {
            for (const enemy of targetsInRadius(enemies, player.physics.position, activation.radius)) {
                impactEvents.push(
                    impactEvent({
                        eventId: this.#nextEventId(player.id, "push-away", tick, enemy.id),
                        player,
                        enemy,
                        tick,
                        effectId: "push-away",
                        sourceKind: "action-area",
                        damage: IMPACT_DAMAGE * 0.2,
                        knockback: {
                            direction: directionBetween(player.physics.position, enemy.position),
                            distance: 175,
                            durationSeconds: 0.25
                        }
                    })
                );
            }
        } else if (activation.baseActionId === "straight-shot") {
            this.actionProjectiles.push({
                id: `${player.id}:straight-shot:${tick}:${this.eventSequence}`,
                position: { x: player.physics.position.x, y: player.physics.position.y },
                direction,
                traveled: 0,
                range: activation.range,
                speed: activation.speed,
                radius: 5,
                damage: IMPACT_DAMAGE * 0.8,
                piercing: activation.signatureId === "piercing-shot",
                piercedTargetIds: new Set()
            });
        }
        this.#resolveActionStateEvents({
            player,
            events: result.events,
            enemies,
            tick,
            impactEvents,
            presentationEvents
        });
    }

    #resolveDashStrikeContacts({ player, active, enemies, tick, impactEvents }) {
        const tracker = this.hitIdsByActivation.get(active.activationId) ?? {
            damaged: new Set(),
            contacts: new Set()
        };
        this.hitIdsByActivation.set(active.activationId, tracker);
        const currentContacts = new Set();
        for (const enemy of enemies) {
            if (enemy.health <= 0) continue;
            if (!player.physics.collider.overlapsCircle(player.physics.position, enemy.position, enemy.radius))
                continue;
            currentContacts.add(enemy.id);
            if (tracker.contacts.has(enemy.id)) continue;
            const mayDamage =
                !tracker.damaged.has(enemy.id) &&
                (active.signatureId === "collision-rebound" || tracker.damaged.size === 0);
            if (mayDamage) {
                tracker.damaged.add(enemy.id);
                impactEvents.push(
                    impactEvent({
                        eventId: this.#nextEventId(player.id, "dash-strike", tick, enemy.id),
                        player,
                        enemy,
                        tick,
                        effectId: "dash-strike",
                        sourceKind: "action-contact",
                        damage: IMPACT_DAMAGE,
                        knockback: {
                            direction: directionBetween(player.physics.position, enemy.position, active.direction),
                            distance: 75,
                            durationSeconds: 0.25
                        }
                    })
                );
            }
            if (active.signatureId !== "collision-rebound") continue;
            const normal = directionBetween(enemy.position, player.physics.position);
            const velocity = player.physics.velocity;
            const dot = velocity.x * normal.x + velocity.y * normal.y;
            const speed = velocity.length();
            velocity.set(velocity.x - 2 * dot * normal.x, velocity.y - 2 * dot * normal.y);
            const reflectedSpeed = velocity.length();
            if (speed > 0 && reflectedSpeed > 0) velocity.scale(speed / reflectedSpeed);
        }
        tracker.contacts = currentContacts;
    }

    #resolveActionStateEvents({ player, events, enemies, tick, impactEvents, presentationEvents }) {
        for (const event of events) {
            presentationEvents.push({
                ...event,
                position: { x: player.physics.position.x, y: player.physics.position.y }
            });
            if (event.eventType === "slow-fall-end-wave") {
                for (const enemy of targetsInRadius(enemies, player.physics.position, event.radius)) {
                    impactEvents.push(
                        impactEvent({
                            eventId: this.#nextEventId(player.id, "end-wave", tick, enemy.id),
                            player,
                            enemy,
                            tick,
                            effectId: "end-wave",
                            sourceKind: "action-area",
                            damage: IMPACT_DAMAGE * 0.8
                        })
                    );
                }
            }
            if (event.eventType === "explosive-trail-detonated") {
                if (!event.start || !event.end) continue;
                for (const enemy of enemies) {
                    if (
                        enemy.health <= 0 ||
                        distancePointToSegment(enemy.position, event.start, event.end) > enemy.radius + 30
                    ) {
                        continue;
                    }
                    impactEvents.push(
                        impactEvent({
                            eventId: this.#nextEventId(player.id, "explosive-trail", tick, enemy.id),
                            player,
                            enemy,
                            tick,
                            effectId: "explosive-trail",
                            sourceKind: "action-trail",
                            damage: IMPACT_DAMAGE * 0.8,
                            sourcePosition: event.start,
                            contactPosition: enemy.position
                        })
                    );
                }
            }
            if (event.eventType === "action-ended") this.hitIdsByActivation.delete(event.activationId);
        }
    }

    #advanceActionProjectiles({ player, enemies, surfaces, dt, tick, impactEvents, presentationEvents }) {
        const survivors = [];
        for (const projectile of this.actionProjectiles) {
            const start = { ...projectile.position };
            const travel = Math.min(projectile.speed * dt, projectile.range - projectile.traveled);
            const end = {
                x: start.x + projectile.direction.x * travel,
                y: start.y + projectile.direction.y * travel
            };
            const delta = { x: end.x - start.x, y: end.y - start.y };
            const lengthSquared = delta.x * delta.x + delta.y * delta.y;
            const wallRatio = firstSurfaceHitRatio(start, end, surfaces);
            const contacts = enemies
                .filter(
                    (enemy) =>
                        enemy.health > 0 &&
                        !projectile.piercedTargetIds.has(enemy.id) &&
                        distancePointToSegment(enemy.position, start, end) <= enemy.radius + 5
                )
                .map((enemy) => ({
                    enemy,
                    ratio:
                        lengthSquared <= 1e-9
                            ? 0
                            : Math.max(
                                  0,
                                  Math.min(
                                      1,
                                      ((enemy.position.x - start.x) * delta.x +
                                          (enemy.position.y - start.y) * delta.y) /
                                          lengthSquared
                                  )
                              )
                }))
                .filter(({ ratio }) => wallRatio === null || ratio <= wallRatio + 1e-9)
                .sort(({ enemy: left, ratio: leftRatio }, { enemy: right, ratio: rightRatio }) =>
                    leftRatio === rightRatio ? left.id.localeCompare(right.id) : leftRatio - rightRatio
                );
            const resolvedContacts = projectile.piercing ? contacts : contacts.slice(0, 1);
            for (const { enemy } of resolvedContacts) {
                projectile.piercedTargetIds.add(enemy.id);
                impactEvents.push(
                    impactEvent({
                        eventId: `${projectile.id}:${enemy.id}`,
                        player,
                        enemy,
                        tick,
                        effectId: "straight-shot",
                        sourceKind: "action-projectile",
                        damage: projectile.damage,
                        sourcePosition: start,
                        contactPosition: enemy.position
                    })
                );
                if (!projectile.piercing) break;
            }
            const hitEnemy = resolvedContacts.length > 0 && !projectile.piercing;
            const hitSolid = wallRatio !== null;
            const terminationRatio = hitEnemy ? resolvedContacts[0].ratio : hitSolid ? wallRatio : 1;
            projectile.position = {
                x: start.x + delta.x * terminationRatio,
                y: start.y + delta.y * terminationRatio
            };
            projectile.traveled += travel * terminationRatio;
            if (!hitEnemy && !hitSolid && projectile.traveled < projectile.range) survivors.push(projectile);
            else {
                presentationEvents.push({
                    eventType: "augment-shot-ended",
                    projectileId: projectile.id,
                    position: projectile.position
                });
            }
        }
        this.actionProjectiles = survivors;
    }
}
