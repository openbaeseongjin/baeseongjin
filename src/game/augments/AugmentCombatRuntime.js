import { distancePointToSegment } from "../combat/CombatSystems.js";
import { AUGMENT_IMPACT_CONFIG } from "../config.js";
import { ropeAttachmentPoint } from "../rope/RopeAttachment.js";
import { ActionAugmentState } from "./actions/ActionAugmentState.js";
import { actionAugmentById } from "./actions/ActionAugmentCatalog.js";
import {
    ACTION_AUGMENT_CATEGORY,
    ACTION_EVENT_TYPE,
    ACTION_KEY,
    ACTION_MODIFIER_ID,
    ACTION_PREDICTED_RESOLUTION,
    ACTION_SIGNATURE_ID,
    ACTION_SOURCE_KIND,
    ACTION_STATE_CONFIG,
    BASE_ACTION_ID
} from "./actions/ActionAugmentDefinition.js";
import { ACTION_RUNTIME_EVENT_HANDLER } from "./actions/ActionRuntimeEventDefinition.js";
import { directionBetween } from "./actions/ActionRuntimeSupport.js";
import { migrateLegacyActionStateSnapshot } from "./actions/ActionLegacySnapshotMigration.js";
import { ActionContactState } from "./actions/state/ActionContactState.js";
import { ActionProjectileState } from "./actions/state/ActionProjectileState.js";
import { ElectrifiedRopeContactState } from "./rope/ElectrifiedRopeContactState.js";
import { resolveCollisionExplosion } from "./rope/CollisionExplosionState.js";

const IMPACT_DAMAGE = AUGMENT_IMPACT_CONFIG.baseDamage;

function actionLoadout(foundation) {
    const baseActionId = foundation.selectedBaseActionId() ?? BASE_ACTION_ID.DEFAULT_PUNCH;
    return Object.freeze({
        baseActionId,
        signatureId: foundation.selectedSignatureId(),
        modifierIds: foundation.selectedIds.filter(
            (id) => actionAugmentById(id)?.category === ACTION_AUGMENT_CATEGORY.UNIVERSAL_MODIFIER
        )
    });
}

function loadoutKey(loadout) {
    return ACTION_KEY.loadout(loadout);
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
            ? ACTION_PREDICTED_RESOLUTION.SHIELD_BLOCKED
            : enemy.health <= damage
              ? ACTION_PREDICTED_RESOLUTION.ENEMY_DEFEATED
              : ACTION_PREDICTED_RESOLUTION.ENEMY_HIT
    });
}

export class AugmentCombatRuntime {
    constructor({ maxHealth = ACTION_STATE_CONFIG.DEFAULT_MAX_HEALTH } = {}) {
        this.actionState = null;
        this.actionLoadoutKey = ACTION_KEY.loadout(null);
        this.wasActionDown = false;
        this.electrified = new ElectrifiedRopeContactState({
            damagePerSecond: AUGMENT_IMPACT_CONFIG.electrifiedDamagePerSecond,
            pulseSeconds: AUGMENT_IMPACT_CONFIG.electrifiedPulseSeconds
        });
        this.projectileState = new ActionProjectileState();
        this.contactState = new ActionContactState();
        this.maxHealth = maxHealth;
        this.eventSequence = ACTION_STATE_CONFIG.ZERO;
        this.queuedImpactEvents = [];
    }

    syncLoadout(foundation, maxHealth = this.maxHealth) {
        const loadout = actionLoadout(foundation);
        const nextKey = loadoutKey(loadout);
        this.maxHealth = maxHealth;
        if (nextKey === this.actionLoadoutKey) return;
        const previous = this.actionState?.snapshot() ?? null;
        const previousModifiers = previous?.loadout?.modifierIds ?? [];
        this.actionLoadoutKey = nextKey;
        const next = new ActionAugmentState({ ...loadout, maxHealth });
        if (previous && previous.loadout.baseActionId === loadout.baseActionId) {
            next.restore({
                ...previous,
                loadout,
                maxHealth,
                ...(loadout.modifierIds.includes(ACTION_MODIFIER_ID.EXTRA_CHARGE) &&
                !previousModifiers.includes(ACTION_MODIFIER_ID.EXTRA_CHARGE)
                    ? {
                          chargesRemaining: ACTION_STATE_CONFIG.BASE_CHARGES + ACTION_STATE_CONFIG.EXTRA_CHARGES,
                          rechargeRemaining: ACTION_STATE_CONFIG.ZERO,
                          rechargeQueue: []
                      }
                    : {})
            });
        }
        this.actionState = next;
    }

    prepareCommand(player, foundation, command) {
        this.syncLoadout(foundation, player.maxHealth);
        const modifiers = this.actionState.commandModifiers(command.action);
        return Object.freeze({
            ...command,
            gravityScale: modifiers.gravityScale,
            preserveActionImpulse: modifiers.preserveActionImpulse
        });
    }

    onRopeReleased() {
        return this.actionState?.onRopeReleased() ?? false;
    }

    absorbPlayerDamage(details) {
        return (
            this.actionState?.absorbIncomingDamage(details) ?? {
                appliedDamage: details.amount,
                absorbedByShield: ACTION_STATE_CONFIG.ZERO,
                blockedByGuard: false,
                events: Object.freeze([])
            }
        );
    }

    queueDamageReflection({ player, attacker, damage, tick, sourceKind = ACTION_SOURCE_KIND.PROJECTILE }) {
        if (!attacker || !Number.isFinite(damage) || damage <= ACTION_STATE_CONFIG.ZERO) return null;
        const event = impactEvent({
            eventId: this.#nextEventId(player.id, ACTION_SIGNATURE_ID.DAMAGE_REFLECT, tick, attacker.id),
            player,
            enemy: attacker,
            tick,
            effectId: ACTION_SIGNATURE_ID.DAMAGE_REFLECT,
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
        this.queuedImpactEvents.length = ACTION_STATE_CONFIG.ZERO;
        return events;
    }

    advance({ player, foundation, command, dt, enemies, surfaces, collisionBroadPhase = null, tick }) {
        this.syncLoadout(foundation, player.maxHealth);
        const impactEvents = [];
        const presentationEvents = [];
        const activeBefore = this.actionState?.activeAction ? { ...this.actionState.activeAction } : null;
        const executionContext = this.#actionExecutionContext({
            player,
            enemies,
            surfaces,
            collisionBroadPhase,
            tick,
            impactEvents,
            presentationEvents
        });

        this.actionState?.advanceActiveRuntime(activeBefore, executionContext);

        const stateEvents =
            this.actionState?.advance(dt, {
                isGrounded: player.physics.isGrounded,
                cancelSlowFall: !command.action
            }) ?? Object.freeze([]);
        this.#resolveActionStateEvents(stateEvents, executionContext);

        const pressed = command.action && !this.wasActionDown;
        if (pressed) this.#beginAction(executionContext);
        this.wasActionDown = command.action;
        this.projectileState.advance({
            enemies,
            surfaces,
            collisionBroadPhase,
            dt,
            distancePointToSegment,
            emitImpact: executionContext.emitImpact,
            presentationEvents
        });
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
            actionProjectiles: this.projectileState.snapshot(),
            eventSequence: this.eventSequence
        });
    }

    restore(snapshot = null, foundation = null, maxHealth = this.maxHealth) {
        this.wasActionDown = snapshot?.wasActionDown === true;
        this.electrified.restore(snapshot?.electrified ?? null);
        this.projectileState.restore(snapshot?.actionProjectiles ?? []);
        this.eventSequence = Math.max(ACTION_STATE_CONFIG.ZERO, snapshot?.eventSequence ?? ACTION_STATE_CONFIG.ZERO);
        if (foundation) {
            this.actionLoadoutKey = ACTION_KEY.loadout(null);
            this.syncLoadout(foundation, maxHealth);
            if (
                this.actionState &&
                snapshot?.actionState &&
                loadoutKey(snapshot.actionState.loadout) === this.actionLoadoutKey
            ) {
                this.actionState.restore(snapshot.actionState);
            } else {
                const migrated = migrateLegacyActionStateSnapshot(snapshot, this.actionState);
                if (migrated) this.actionState.restore(migrated);
            }
        }
        return this.snapshot();
    }

    resetForRespawn(foundation, maxHealth = this.maxHealth) {
        this.actionState = null;
        this.actionLoadoutKey = ACTION_KEY.loadout(null);
        this.wasActionDown = false;
        this.electrified.reset();
        this.projectileState.reset();
        this.contactState.clear();
        this.queuedImpactEvents.length = ACTION_STATE_CONFIG.ZERO;
        this.syncLoadout(foundation, maxHealth);
        return this.snapshot();
    }

    #nextEventId(playerId, effectId, tick, targetId) {
        const id = `${playerId}:${effectId}:${tick}:${targetId}:${this.eventSequence}`;
        this.eventSequence += ACTION_STATE_CONFIG.UNIT;
        return id;
    }

    #beginAction(context) {
        const direction = directionBetween(context.player.physics.position, context.player.ropeObject.aimWorld, {
            x: Math.sign(context.player.physics.velocity.x) || ACTION_STATE_CONFIG.UNIT,
            y: ACTION_STATE_CONFIG.ZERO
        });
        const result = this.actionState.beginAction({
            direction,
            airborne: !context.player.physics.isGrounded
        });
        if (!result.accepted) return;
        const activation = result.activation;
        context.presentationEvents.push({
            eventType: ACTION_EVENT_TYPE.STARTED,
            activationId: activation.activationId,
            actionId: activation.baseActionId,
            position: Object.freeze({
                x: context.player.physics.position.x,
                y: context.player.physics.position.y
            }),
            direction
        });
        this.actionState.executeActivation(activation, context);
        this.#resolveActionStateEvents(result.events, context);
    }

    #resolveActionStateEvents(events, context) {
        for (const event of events) {
            context.presentationEvents.push({
                ...event,
                position: { x: context.player.physics.position.x, y: context.player.physics.position.y }
            });
            ACTION_RUNTIME_EVENT_HANDLER[event.eventType]?.(event, context);
        }
    }

    #actionExecutionContext({
        player,
        enemies,
        surfaces,
        collisionBroadPhase,
        tick,
        impactEvents,
        presentationEvents
    }) {
        const emitImpact = ({ eventId = null, enemy, effectId, ...details }) =>
            impactEvents.push(
                impactEvent({
                    eventId: eventId ?? this.#nextEventId(player.id, effectId, tick, enemy.id),
                    player,
                    enemy,
                    tick,
                    effectId,
                    ...details
                })
            );
        return Object.freeze({
            player,
            enemies,
            surfaces,
            collisionBroadPhase,
            tick,
            impactDamage: IMPACT_DAMAGE,
            damageFromPercent: (percent) => IMPACT_DAMAGE * (percent / ACTION_STATE_CONFIG.DEFAULT_MAX_HEALTH),
            impactEvents,
            presentationEvents,
            actionState: this.actionState,
            projectileState: this.projectileState,
            contactState: this.contactState,
            distancePointToSegment,
            emitImpact,
            projectileId: () => ACTION_KEY.projectile(player.id, tick, this.eventSequence)
        });
    }
}
