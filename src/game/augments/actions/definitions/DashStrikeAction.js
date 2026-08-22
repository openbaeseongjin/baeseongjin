import {
    ACTION_RUNTIME_CONFIG,
    ACTION_SOURCE_KIND,
    ACTION_STATE_CONFIG,
    BASE_ACTION_ID
} from "../ActionAugmentDefinition.js";
import { directionBetween } from "../ActionRuntimeSupport.js";
import { ActionDefinition } from "./ActionDefinition.js";

export class DashStrikeAction extends ActionDefinition {
    constructor() {
        super({ id: BASE_ACTION_ID.DASH_STRIKE, immediate: false });
    }

    activationPayload(effect) {
        return {
            durationSeconds: effect.hitWindowSeconds,
            impulse: effect.impulse,
            damage: effect.damage,
            knockbackDistance: effect.knockbackDistance
        };
    }

    commandModifiers({ activeAction }) {
        return Object.freeze({
            gravityScale: ACTION_STATE_CONFIG.UNIT,
            preserveActionImpulse: Boolean(activeAction)
        });
    }

    execute(activation, context) {
        context.player.physics.applyImpulse(activation.direction, activation.impulse);
        context.contactState.begin(activation.activationId);
        return true;
    }

    advanceRuntime(active, context) {
        const currentContacts = new Set();
        for (const enemy of context.enemies) {
            if (enemy.health <= ACTION_STATE_CONFIG.ZERO) continue;
            if (
                !context.player.physics.collider.overlapsCollider(
                    context.player.physics.position,
                    enemy.position,
                    enemy.collider ?? { type: ACTION_RUNTIME_CONFIG.FALLBACK_COLLIDER_TYPE, radius: enemy.radius }
                )
            ) {
                continue;
            }
            currentContacts.add(enemy.id);
            if (context.contactState.hasContact(active.activationId, enemy.id)) continue;
            const mayDamage =
                !context.contactState.hasDamaged(active.activationId, enemy.id) &&
                (context.signature?.allowsDistinctEnemyDamage ||
                    context.contactState.damagedCount(active.activationId) === ACTION_STATE_CONFIG.ZERO);
            if (mayDamage) {
                context.contactState.markDamaged(active.activationId, enemy.id);
                context.emitImpact({
                    enemy,
                    effectId: this.id,
                    sourceKind: ACTION_SOURCE_KIND.ACTION_CONTACT,
                    damage: context.damageFromPercent(context.effect.damage),
                    knockback: {
                        direction: directionBetween(context.player.physics.position, enemy.position, active.direction),
                        distance: context.effect.knockbackDistance,
                        durationSeconds: ACTION_RUNTIME_CONFIG.CONTACT_KNOCKBACK_SECONDS
                    }
                });
            }
            context.signature?.reflectFromEnemy?.({ player: context.player, enemy });
        }
        context.contactState.replaceContacts(active.activationId, currentContacts);
        context.signature?.reflectFromSurfaces?.({ player: context.player });
    }
}
