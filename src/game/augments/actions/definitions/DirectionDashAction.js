import { BASE_ACTION_ID } from "../ActionAugmentDefinition.js";
import { ActionDefinition } from "./ActionDefinition.js";

export class DirectionDashAction extends ActionDefinition {
    constructor() {
        super({ id: BASE_ACTION_ID.DIRECTION_DASH, immediate: true });
    }

    activationPayload(effect) {
        return { distance: effect.distance };
    }

    execute(activation, context) {
        const start = { x: context.player.physics.position.x, y: context.player.physics.position.y };
        const intendedEnd = {
            x: start.x + activation.direction.x * activation.distance,
            y: start.y + activation.direction.y * activation.distance
        };
        const collisionSurfaces = context.collisionBroadPhase
            ? context.collisionBroadPhase.querySurfaces({
                  collider: context.player.physics.collider,
                  start,
                  end: intendedEnd
              })
            : context.surfaces;
        const destination = context.player.physics.collider.farthestSafePositionAlong({
            start,
            direction: activation.direction,
            distance: activation.distance,
            surfaces: collisionSurfaces
        });
        context.player.physics.setPhysicsPosition(destination.position);
        context.collisionBroadPhase?.updateActor(context.player);
        if (activation.trailEffect) {
            context.actionState.setExplosiveTrailPath(activation.activationId, start, destination.position);
        }
        return true;
    }
}
