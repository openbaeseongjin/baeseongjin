import { selectNearestPlayer } from "../CombatTargeting.js";
import { segmentIntersectsSurface } from "../../world/PolygonGeometry.js";
import {
    ENEMY_COLLISION_SURFACE_KIND,
    ENEMY_RULE,
    ENEMY_TARGET_LIFE_STATE,
    ENEMY_WEAPON_CONFIG
} from "./EnemyWeaponDefinition.js";

function hasLineOfSight(enemy, target, surfaces) {
    if (!enemy.rules.includes(ENEMY_RULE.COVER_ENDS_LINE_OF_SIGHT)) return true;
    return !surfaces.some(
        (surface) =>
            surface.collision !== false &&
            surface.kind === ENEMY_COLLISION_SURFACE_KIND.COVER &&
            (enemy.areaId === null || surface.areaId === enemy.areaId) &&
            segmentIntersectsSurface(enemy.position, target.physics.position, surface)
    );
}

export function visibleEnemyTargets(enemy, targets, surfaces) {
    const eligibleTargets = enemy.activation
        ? targets.filter(
              ({ physics }) =>
                  physics.position.x >= enemy.activation.x &&
                  physics.position.x <= enemy.activation.x + enemy.activation.width &&
                  physics.position.y >= enemy.activation.y &&
                  physics.position.y <= enemy.activation.y + enemy.activation.height
          )
        : targets;
    return eligibleTargets.filter((target) => hasLineOfSight(enemy, target, surfaces));
}

export function selectEnemyWeaponTarget({ enemy, visibleTargets, range, lockedTargetId, canAcquireTarget }) {
    const lockedTarget =
        lockedTargetId === null
            ? null
            : (visibleTargets.find(
                  (target) =>
                      target.id === lockedTargetId &&
                      target.health > ENEMY_WEAPON_CONFIG.ZERO &&
                      target.lifeState === ENEMY_TARGET_LIFE_STATE.ACTIVE &&
                      enemy.position.distanceTo(target.physics.position) <= range
              ) ?? null);
    if (lockedTarget) return lockedTarget;
    if (!canAcquireTarget) return null;
    return selectNearestPlayer(enemy.position, visibleTargets, range);
}

export function directionFromEnemyToTarget(enemy, target) {
    const dx = target.physics.position.x - enemy.position.x;
    const dy = target.physics.position.y - enemy.position.y;
    const distance = Math.hypot(dx, dy);
    if (distance <= ENEMY_WEAPON_CONFIG.ZERO) return null;
    return Object.freeze({ x: dx / distance, y: dy / distance });
}
