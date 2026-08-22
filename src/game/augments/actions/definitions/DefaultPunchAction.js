import { selectNearestActionTarget } from "../ActionTargeting.js";
import { ACTION_SOURCE_KIND, ACTION_STATE_CONFIG, BASE_ACTION_ID } from "../ActionAugmentDefinition.js";
import { directionBetween } from "../ActionRuntimeSupport.js";
import { ActionDefinition } from "./ActionDefinition.js";

export class DefaultPunchAction extends ActionDefinition {
    constructor() {
        super({ id: BASE_ACTION_ID.DEFAULT_PUNCH, immediate: true });
    }

    activationPayload(effect) {
        return {
            range: effect.range,
            damageMultiplier: effect.damageMultiplier,
            knockbackDistance: effect.knockbackDistance,
            knockbackSeconds: effect.knockbackSeconds
        };
    }

    execute(activation, context) {
        const forwardEnemies = context.enemies.filter((enemy) => {
            const targetDirection = directionBetween(context.player.physics.position, enemy.position);
            return (
                targetDirection.x * activation.direction.x + targetDirection.y * activation.direction.y >=
                ACTION_STATE_CONFIG.ZERO
            );
        });
        const target = selectNearestActionTarget({
            playerPosition: context.player.physics.position,
            enemies: forwardEnemies,
            range: activation.range
        });
        if (!target) return false;
        context.emitImpact({
            enemy: target,
            effectId: this.id,
            sourceKind: ACTION_SOURCE_KIND.DEFAULT_PUNCH,
            damage: context.impactDamage * activation.damageMultiplier,
            knockback: {
                direction: directionBetween(context.player.physics.position, target.position),
                distance: activation.knockbackDistance,
                durationSeconds: activation.knockbackSeconds
            }
        });
        return true;
    }
}
