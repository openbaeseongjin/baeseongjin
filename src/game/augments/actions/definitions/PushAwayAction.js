import { ACTION_RUNTIME_CONFIG, ACTION_SOURCE_KIND, BASE_ACTION_ID } from "../ActionAugmentDefinition.js";
import { directionBetween, targetsInRadius } from "../ActionRuntimeSupport.js";
import { ActionDefinition } from "./ActionDefinition.js";

export class PushAwayAction extends ActionDefinition {
    constructor() {
        super({ id: BASE_ACTION_ID.PUSH_AWAY, immediate: true });
    }

    activationPayload(effect) {
        return {
            radius: effect.radius,
            damage: effect.damage,
            knockbackDistance: effect.knockbackDistance,
            bossKnockback: effect.bossKnockback
        };
    }

    execute(activation, context) {
        for (const enemy of targetsInRadius(context.enemies, context.player.physics.position, activation.radius)) {
            context.emitImpact({
                enemy,
                effectId: this.id,
                sourceKind: ACTION_SOURCE_KIND.ACTION_AREA,
                damage: context.damageFromPercent(activation.damage),
                knockback: {
                    direction: directionBetween(context.player.physics.position, enemy.position),
                    distance: activation.knockbackDistance,
                    durationSeconds: ACTION_RUNTIME_CONFIG.CONTACT_KNOCKBACK_SECONDS
                }
            });
        }
        return true;
    }
}
