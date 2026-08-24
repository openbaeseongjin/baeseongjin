import { ENEMY_TYPE } from "../EnemyType.js";
import { SURFACE_MOTION_TYPE } from "../physics/SurfacePhysicsDefinition.js";

export const ENEMY_MOBILITY_KIND = Object.freeze({
    DIRECT_PLAYER_PURSUIT: "direct-player-pursuit",
    AUTHORED_POSITION: "authored-position"
});

const DIRECT_PLAYER_PURSUIT_TYPE = Object.freeze({
    [ENEMY_TYPE.PURSUIT_DRONE_T1]: true,
    [ENEMY_TYPE.SWARM_DRONE_T1]: true
});
const FIXED_TURRET_TYPE = Object.freeze({
    [ENEMY_TYPE.SENTRY]: true,
    [ENEMY_TYPE.SENTRY_T1]: true
});

export function enemyImpactDisplacementEnabled(enemyType) {
    return FIXED_TURRET_TYPE[enemyType] !== true;
}

export function enemyMobilityKind(enemyType) {
    return DIRECT_PLAYER_PURSUIT_TYPE[enemyType] === true
        ? ENEMY_MOBILITY_KIND.DIRECT_PLAYER_PURSUIT
        : ENEMY_MOBILITY_KIND.AUTHORED_POSITION;
}

export function enemyCollisionMotionType(enemyType) {
    return FIXED_TURRET_TYPE[enemyType] === true ? SURFACE_MOTION_TYPE.STATIC : SURFACE_MOTION_TYPE.DYNAMIC;
}
