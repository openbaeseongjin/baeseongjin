import { distancePointToSegment } from "../combat/CombatSystems.js";
import { IMPACT_TARGET_KIND } from "../combat/ImpactTarget.js";
import { SPELL_KEY, SPELL_SOURCE_KIND } from "./SpellRuntimeDefinition.js";
import { spellTargetPolicy } from "./SpellTargetPolicy.js";
import { SpellProjectileState } from "./SpellProjectileState.js";
import { spellAreaContainsTarget } from "./SpellAreaState.js";

export const INCOMING_SPELL_IMPACT_SPEC = Object.freeze({
    initialSweepSeconds: 0.075,
    resolvedImpactLimit: 256
});

function targetRadius(target) {
    return target.radius ?? target.collider?.radius ?? 0;
}

function sweepStart(projectile, previous, spec) {
    if (previous) return previous.position;
    const backtrack = Math.min(projectile.traveled, projectile.speed * spec.initialSweepSeconds);
    return Object.freeze({
        x: projectile.position.x - projectile.direction.x * backtrack,
        y: projectile.position.y - projectile.direction.y * backtrack
    });
}

function knockback(projectile) {
    if (projectile.knockbackImpulse > 0)
        return Object.freeze({ direction: projectile.direction, impulse: projectile.knockbackImpulse });
    if (!(projectile.knockbackDistance > 0)) return null;
    return Object.freeze({
        direction: projectile.direction,
        distance: projectile.knockbackDistance,
        durationSeconds: projectile.knockbackDurationSeconds
    });
}

function incomingImpact({ target, projectile, tick, details }) {
    return Object.freeze({
        eventId: details.eventId,
        predictionId: details.eventId,
        projectileId: projectile.id,
        sourcePlayerId: projectile.ownerId,
        targetId: target.id,
        targetKind: IMPACT_TARGET_KIND.PLAYER,
        clientTick: tick,
        effectId: details.effectId,
        sourceKind: details.sourceKind,
        sourcePosition: Object.freeze({ ...details.sourcePosition }),
        contactPosition: Object.freeze({ ...details.contactPosition }),
        position: Object.freeze({ ...details.contactPosition }),
        damage: details.damage,
        ...(details.statusEffectId ? { statusEffectId: details.statusEffectId } : {}),
        knockback: details.knockback ?? null,
        predictedResolution: "player-hit"
    });
}

export class IncomingSpellImpactDetector {
    constructor(spec = INCOMING_SPELL_IMPACT_SPEC) {
        this.spec = spec;
        this.previousProjectiles = new Map();
        this.resolvedImpactIds = new Set();
        this.resolvedImpactOrder = [];
    }

    observe(target, remotePlayers, { targets = [target], surfaces = [] } = {}) {
        const impacts = [];
        const observedProjectileIds = new Set();
        for (const remotePlayer of remotePlayers) {
            const areas = remotePlayer.augmentRuntimeState?.combat?.spellAreas ?? [];
            for (const area of areas) {
                const impactId = SPELL_KEY.projectileImpact(area.id, target.id);
                if (
                    this.resolvedImpactIds.has(impactId) ||
                    !spellTargetPolicy(area.targetPolicyId).allows(area.ownerId, target.id) ||
                    !spellAreaContainsTarget(area, target)
                )
                    continue;
                this.#rememberResolved(impactId);
                impacts.push(
                    Object.freeze({
                        eventId: impactId,
                        predictionId: impactId,
                        sourcePlayerId: area.ownerId ?? remotePlayer.id,
                        targetId: target.id,
                        targetKind: IMPACT_TARGET_KIND.PLAYER,
                        clientTick: target.tick,
                        effectId: area.spellId,
                        sourceKind: SPELL_SOURCE_KIND.AREA,
                        sourcePosition: Object.freeze({ ...area.position }),
                        contactPosition: Object.freeze({ ...target.position }),
                        position: Object.freeze({ ...target.position }),
                        damage: area.damage,
                        ...(area.statusEffectId ? { statusEffectId: area.statusEffectId } : {}),
                        knockback: null,
                        predictedResolution: "player-hit"
                    })
                );
            }
            const projectiles = remotePlayer.augmentRuntimeState?.combat?.spellProjectiles ?? [];
            for (const projectile of projectiles) {
                observedProjectileIds.add(projectile.id);
                const impactId = SPELL_KEY.projectileImpact(projectile.id, target.id);
                const previous = this.previousProjectiles.get(projectile.id) ?? null;
                this.previousProjectiles.set(projectile.id, projectile);
                if (this.resolvedImpactIds.has(impactId)) continue;
                if (!spellTargetPolicy(projectile.targetPolicyId).allows(projectile.ownerId, target.id)) continue;
                const start = sweepStart(projectile, previous, this.spec);
                const aura = projectile.auraRadius > 0;
                if (
                    distancePointToSegment(target.position, start, projectile.position) >
                    targetRadius(target) + (aura ? projectile.auraRadius : projectile.radius)
                ) {
                    continue;
                }
                this.#rememberResolved(impactId);
                impacts.push(
                    Object.freeze({
                        eventId: impactId,
                        predictionId: impactId,
                        projectileId: projectile.id,
                        sourcePlayerId: projectile.ownerId ?? remotePlayer.id,
                        targetId: target.id,
                        targetKind: IMPACT_TARGET_KIND.PLAYER,
                        clientTick: target.tick,
                        effectId: aura ? projectile.auraEffectId : projectile.spellId,
                        sourceKind: aura ? SPELL_SOURCE_KIND.AREA : SPELL_SOURCE_KIND.PROJECTILE,
                        sourcePosition: Object.freeze({ x: start.x, y: start.y }),
                        contactPosition: Object.freeze({ x: target.position.x, y: target.position.y }),
                        position: Object.freeze({ x: target.position.x, y: target.position.y }),
                        damage: aura ? projectile.auraDamage : projectile.damage,
                        ...(aura && projectile.auraStatusEffectId
                            ? { statusEffectId: projectile.auraStatusEffectId }
                            : projectile.statusEffectId
                              ? { statusEffectId: projectile.statusEffectId }
                              : {}),
                        knockback: aura ? null : knockback(projectile),
                        predictedResolution: "player-hit"
                    })
                );
            }
        }
        for (const [projectileId, projectile] of this.previousProjectiles) {
            if (observedProjectileIds.has(projectileId)) continue;
            const impactId = SPELL_KEY.projectileImpact(projectile.id, target.id);
            if (!this.resolvedImpactIds.has(impactId)) {
                const replica = new SpellProjectileState();
                replica.restore([projectile]);
                replica.advance({
                    enemies: targets,
                    targets,
                    surfaces,
                    collisionBroadPhase: null,
                    dt: this.spec.initialSweepSeconds,
                    distancePointToSegment,
                    emitImpact: (details) => {
                        if (details.target.id !== target.id) return;
                        this.#rememberResolved(details.eventId);
                        impacts.push(incomingImpact({ target, projectile, tick: target.tick, details }));
                    },
                    presentationEvents: []
                });
            }
            this.previousProjectiles.delete(projectileId);
        }
        return Object.freeze(impacts);
    }

    #rememberResolved(impactId) {
        this.resolvedImpactIds.add(impactId);
        this.resolvedImpactOrder.push(impactId);
        while (this.resolvedImpactOrder.length > this.spec.resolvedImpactLimit) {
            this.resolvedImpactIds.delete(this.resolvedImpactOrder.shift());
        }
    }
}
