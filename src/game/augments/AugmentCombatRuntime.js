import { distancePointToSegment } from "../combat/CombatSystems.js";
import { AUGMENT_IMPACT_CONFIG } from "../config.js";
import { ropeAttachmentPoint } from "../rope/RopeAttachment.js";
import { SpellRuntimeState } from "../spells/SpellRuntimeState.js";
import {
    SPELL_EVENT_TYPE,
    SPELL_IMPACT_RESOLUTION,
    SPELL_KEY,
    SPELL_RUNTIME_SPEC
} from "../spells/SpellRuntimeDefinition.js";
import { directionBetween } from "../spells/SpellRuntimeSupport.js";
import { SpellProjectileState } from "../spells/SpellProjectileState.js";
import { ElectrifiedRopeContactState } from "./rope/ElectrifiedRopeContactState.js";
import { resolveCollisionExplosion } from "./rope/CollisionExplosionState.js";

function impactEvent({
    eventId,
    player,
    enemy = null,
    target = enemy,
    tick,
    effectId,
    sourceKind,
    damage,
    impactSpeed,
    sourcePosition = player.physics.position,
    contactPosition = target?.position,
    knockback = null,
    statusEffectId = null
}) {
    if (!target) throw new Error("impact event requires a target");
    return Object.freeze({
        eventId,
        predictionId: eventId,
        sourcePlayerId: player.id,
        targetId: target.id,
        targetKind: target.impactTargetKind ?? (target.ropeObject ? "player" : "enemy"),
        clientTick: tick,
        effectId,
        sourceKind,
        sourcePosition: Object.freeze({ x: sourcePosition.x, y: sourcePosition.y }),
        contactPosition: Object.freeze({ x: contactPosition.x, y: contactPosition.y }),
        position: Object.freeze({ x: contactPosition.x, y: contactPosition.y }),
        damage,
        ...(statusEffectId ? { statusEffectId } : {}),
        ...(impactSpeed === undefined ? {} : { impactSpeed }),
        ...(knockback ? { knockback: Object.freeze(knockback) } : {}),
        predictedResolution: target.blocksImpactFrom?.(sourcePosition)
            ? SPELL_IMPACT_RESOLUTION.SHIELD_BLOCKED
            : target.health <= damage
              ? SPELL_IMPACT_RESOLUTION.ENEMY_DEFEATED
              : SPELL_IMPACT_RESOLUTION.ENEMY_HIT
    });
}

export class AugmentCombatRuntime {
    constructor() {
        this.electrified = new ElectrifiedRopeContactState({
            damagePerSecond: AUGMENT_IMPACT_CONFIG.electrifiedDamagePerSecond,
            pulseSeconds: AUGMENT_IMPACT_CONFIG.electrifiedPulseSeconds
        });
        this.projectileState = new SpellProjectileState();
        this.spellState = new SpellRuntimeState();
        this.eventSequence = 0;
    }

    syncLoadout(loadout) {
        for (const spellId of loadout.selectedSpellIds()) this.spellState.equip(spellId);
    }

    prepareCommand(player, loadout, command) {
        this.syncLoadout(loadout);
        return Object.freeze({
            ...command,
            gravityScale: 1,
            preserveMovementImpulse: this.spellState.consumeMovementImpulsePreservation(),
            movementMultiplier: this.spellState.movementMultiplier()
        });
    }

    onRopeReleased() {
        return false;
    }

    absorbPlayerDamage(details) {
        return Object.freeze({
            appliedDamage: details.amount,
            absorbedByShield: 0,
            blockedByGuard: false,
            events: Object.freeze([])
        });
    }

    queueDamageReflection() {
        return null;
    }

    drainQueuedImpactEvents() {
        return Object.freeze([]);
    }

    advance({ player, loadout, command, dt, enemies, targets = enemies, surfaces, collisionBroadPhase = null, tick }) {
        this.syncLoadout(loadout);
        const impactEvents = [];
        const presentationEvents = [];
        const emitImpact = ({ eventId = null, enemy = null, target = enemy, effectId, ...details }) =>
            impactEvents.push(
                impactEvent({
                    eventId: eventId ?? this.#nextEventId(player.id, effectId, tick, target.id),
                    player,
                    target,
                    tick,
                    effectId,
                    ...details
                })
            );

        this.spellState.advance(dt);
        const direction = directionBetween(player.physics.position, player.ropeObject.aimWorld, {
            x: Math.sign(player.physics.velocity.x) || 1,
            y: 0
        });
        const cast = this.spellState.cast(command.spellCommand, {
            player,
            direction,
            spawnProjectile: (definition) =>
                this.projectileState.spawn({
                    id: SPELL_KEY.projectile(player.id, tick, this.eventSequence++),
                    ownerId: player.id,
                    ...definition
                })
        });
        if (cast) {
            presentationEvents.push(
                Object.freeze({
                    eventType: SPELL_EVENT_TYPE.CAST_STARTED,
                    activationId: `${player.id}:${cast.spellId}:${tick}:${command.spellCommand.commandSequence}`,
                    spellId: cast.spellId,
                    slotId: cast.slotId,
                    position: Object.freeze({ x: player.physics.position.x, y: player.physics.position.y }),
                    direction
                })
            );
        }
        this.projectileState.advance({
            enemies,
            targets,
            surfaces,
            collisionBroadPhase,
            dt,
            distancePointToSegment,
            emitImpact,
            presentationEvents
        });
        return Object.freeze({
            impactEvents: Object.freeze(impactEvents),
            presentationEvents: Object.freeze(presentationEvents)
        });
    }

    observeAttachedRope({ player, loadout, enemies, dt, tick }) {
        if (!loadout.has("electrified-rope") || !player.ropeObject.rope.isAttached) return Object.freeze([]);
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

    collisionExplosionEvents({ player, loadout, baseImpactEvents, enemies, tick }) {
        if (!loadout.has("collision-explosion")) return null;
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
            electrified: this.electrified.snapshot(),
            spellProjectiles: this.projectileState.snapshot(),
            spellState: this.spellState.snapshot(),
            eventSequence: this.eventSequence
        });
    }

    restore(snapshot = null, loadout = null) {
        if (!snapshot) {
            this.electrified.reset();
            this.projectileState.reset();
            this.spellState.reset();
            this.eventSequence = 0;
            if (loadout) this.syncLoadout(loadout);
            return this.snapshot();
        }
        this.electrified.restore(snapshot?.electrified ?? null);
        this.projectileState.restore(snapshot?.spellProjectiles ?? []);
        this.spellState.restore(snapshot?.spellState ?? null);
        if (!Number.isSafeInteger(snapshot.eventSequence) || snapshot.eventSequence < 0) {
            throw new Error("spell eventSequence must be a non-negative integer");
        }
        this.eventSequence = snapshot.eventSequence;
        if (loadout) this.syncLoadout(loadout);
        return this.snapshot();
    }

    resetForRespawn(loadout) {
        this.electrified.reset();
        this.projectileState.reset();
        this.spellState.reset();
        this.syncLoadout(loadout);
        return this.snapshot();
    }

    #nextEventId(playerId, effectId, tick, targetId) {
        const id = `${playerId}:${effectId}:${tick}:${targetId}:${this.eventSequence}`;
        this.eventSequence += SPELL_RUNTIME_SPEC.UNIT;
        return id;
    }
}
