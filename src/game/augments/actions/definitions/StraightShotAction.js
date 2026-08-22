import { BASE_ACTION_ID } from "../ActionAugmentDefinition.js";
import { ActionDefinition } from "./ActionDefinition.js";

export class StraightShotAction extends ActionDefinition {
    constructor() {
        super({ id: BASE_ACTION_ID.STRAIGHT_SHOT, immediate: true });
    }

    activationPayload(effect) {
        return {
            speed: effect.speed,
            range: effect.range,
            lifetimeSeconds: effect.lifetimeSeconds,
            damage: effect.damage,
            knockbackDistance: effect.knockbackDistance
        };
    }

    execute(activation, context) {
        context.projectileState.spawn({
            id: context.projectileId(),
            position: context.player.physics.position,
            direction: activation.direction,
            range: activation.range,
            speed: activation.speed,
            damage: context.damageFromPercent(activation.damage),
            piercing: Boolean(activation.pierceEffect)
        });
        return true;
    }
}
