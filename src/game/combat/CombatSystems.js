import { SimulationDispatcher } from "../simulation/SimulationDispatcher.js";
import { PROJECTILE_MOTION_CAPABILITY } from "./ProjectileObject.js";

const simulationDispatcher = new SimulationDispatcher();

function advanceSimulationObject(object, capabilityId, context) {
    const outcomes = simulationDispatcher.dispatch({ objects: [object], capabilityId, context });
    if (outcomes.length !== 1) {
        throw new Error(`simulation object ${object.id} must expose capability ${capabilityId}`);
    }
    return outcomes[0].result;
}

export function updateAutomaticWeapon({ owner, enemies, projectiles, registry, config, dt, allowFire = true }) {
    return advanceSimulationObject(owner.weapon, "automatic-weapon", {
        owner,
        enemies,
        projectiles,
        registry,
        config,
        dt,
        allowFire
    });
}

export function updatePlayerProjectiles({
    projectiles,
    enemies,
    config,
    dt,
    resolveHits = true,
    maxLifetimeSeconds = Number.POSITIVE_INFINITY
}) {
    const enemyById = new Map(enemies.map((enemy) => [enemy.id, enemy]));
    const survivors = [];
    const hits = [];
    const resolutions = [];
    for (const projectile of projectiles) {
        const target = enemyById.get(projectile.targetId);
        if (!target || target.health <= 0) {
            resolutions.push(
                Object.freeze({
                    projectileId: projectile.id,
                    resolution: "target-missing",
                    position: projectile.position.clone()
                })
            );
            continue;
        }
        advanceSimulationObject(projectile, PROJECTILE_MOTION_CAPABILITY, {
            dt,
            targetPosition: target.position,
            speed: config.projectileSpeed
        });
        if (projectile.ageSeconds >= maxLifetimeSeconds) {
            resolutions.push(
                Object.freeze({
                    projectileId: projectile.id,
                    resolution: "expired",
                    position: projectile.position.clone()
                })
            );
            continue;
        }
        const hitDistance = projectile.position.distanceTo(target.position);
        if (resolveHits && hitDistance <= projectile.radius + target.radius) {
            target.health -= projectile.damage;
            hits.push(
                Object.freeze({
                    type: target.health <= 0 ? "enemy-defeated" : "enemy-hit",
                    position: target.position.clone(),
                    damage: projectile.damage,
                    sourcePlayerId: projectile.ownerId,
                    targetId: target.id,
                    projectileId: projectile.id
                })
            );
            resolutions.push(
                Object.freeze({
                    projectileId: projectile.id,
                    resolution: target.health <= 0 ? "enemy-defeated" : "enemy-hit",
                    position: target.position.clone()
                })
            );
            continue;
        }
        survivors.push(projectile);
    }
    projectiles.splice(0, projectiles.length, ...survivors);
    return Object.freeze({ hits, resolutions: Object.freeze(resolutions) });
}

export function updateEnemyWeapons({ enemies, targets, projectiles, registry, config, surfaces = [], dt }) {
    return Object.freeze(
        enemies
            .map((enemy) => {
                const eligibleTargets = enemy.activation
                    ? targets.filter(
                          ({ physics }) =>
                              physics.position.x >= enemy.activation.x &&
                              physics.position.x <= enemy.activation.x + enemy.activation.width &&
                              physics.position.y >= enemy.activation.y &&
                              physics.position.y <= enemy.activation.y + enemy.activation.height
                      )
                    : targets;
                return advanceSimulationObject(enemy, "enemy-weapon", {
                    targets: eligibleTargets,
                    projectiles,
                    registry,
                    config,
                    surfaces,
                    dt
                });
            })
            .filter((projectile) => projectile !== null)
    );
}

export function distancePointToSegment(point, start, end) {
    const segmentX = end.x - start.x;
    const segmentY = end.y - start.y;
    const lengthSquared = segmentX * segmentX + segmentY * segmentY;
    if (lengthSquared === 0) return Math.hypot(point.x - start.x, point.y - start.y);
    const projection = Math.max(
        0,
        Math.min(1, ((point.x - start.x) * segmentX + (point.y - start.y) * segmentY) / lengthSquared)
    );
    return Math.hypot(point.x - (start.x + segmentX * projection), point.y - (start.y + segmentY * projection));
}

export function advanceEnemyProjectiles({ projectiles, dt, maxLifetimeSeconds = Number.POSITIVE_INFINITY }) {
    const survivors = [];
    const expired = [];
    for (const projectile of projectiles) {
        advanceSimulationObject(projectile, PROJECTILE_MOTION_CAPABILITY, { dt });
        if (projectile.ageSeconds >= maxLifetimeSeconds) expired.push(projectile);
        else survivors.push(projectile);
    }
    projectiles.splice(0, projectiles.length, ...survivors);
    return Object.freeze({ expired: Object.freeze(expired) });
}
