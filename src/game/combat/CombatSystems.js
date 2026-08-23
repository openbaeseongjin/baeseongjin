import { SimulationDispatcher } from "../simulation/SimulationDispatcher.js";
import { PROJECTILE_MOTION_CAPABILITY } from "./ProjectileObject.js";
import { ENEMY_SIMULATION_CAPABILITY } from "./enemy-weapon/EnemyWeaponDefinition.js";

const simulationDispatcher = new SimulationDispatcher();
const EMPTY_COLLISION_ACTORS = Object.freeze([]);

function advanceSimulationObject(object, capabilityId, context) {
    const outcomes = simulationDispatcher.dispatch({ objects: [object], capabilityId, context });
    if (outcomes.length !== 1) {
        throw new Error(`simulation object ${object.id} must expose capability ${capabilityId}`);
    }
    return outcomes[0].result;
}

export function updateAutomaticWeapon({ owner, enemies, registerProjectile, registry, config, dt, allowFire = true }) {
    return advanceSimulationObject(owner.weapon, "automatic-weapon", {
        owner,
        enemies,
        registerProjectile,
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
    const enemyById = Object.freeze(Object.fromEntries(enemies.map((enemy) => [enemy.id, enemy])));
    const survivors = [];
    const hits = [];
    const resolutions = [];
    for (const projectile of projectiles) {
        const target = enemyById[projectile.targetId];
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
        const targetHit = target.collider
            ? target.collider.overlapsCircle(target.position, projectile.position, projectile.radius)
            : projectile.position.distanceTo(target.position) <= projectile.radius + target.radius;
        if (resolveHits && targetHit) {
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
    return Object.freeze({ survivors: Object.freeze(survivors), hits, resolutions: Object.freeze(resolutions) });
}

export function updateEnemyPresentationAim({ enemies, targets, range, surfaces = [] }) {
    for (const enemy of enemies) {
        advanceSimulationObject(enemy, ENEMY_SIMULATION_CAPABILITY.PRESENTATION_AIM, { targets, range, surfaces });
    }
}

export function updateEnemyWeapons({
    enemies,
    targets,
    registerProjectile,
    registry,
    config,
    surfaces = [],
    collisionBroadPhase = null,
    dt
}) {
    const liveEnemies = enemies.filter(({ health }) => health > 0);
    const collisionActors = collisionBroadPhase ? EMPTY_COLLISION_ACTORS : Object.freeze([...targets, ...liveEnemies]);
    return Object.freeze(
        liveEnemies
            .map((enemy) => {
                const spawnedProjectile = enemy.hasSimulationCapability(ENEMY_SIMULATION_CAPABILITY.WEAPON)
                    ? advanceSimulationObject(enemy, ENEMY_SIMULATION_CAPABILITY.WEAPON, {
                          targets,
                          registerProjectile,
                          registry,
                          config,
                          surfaces,
                          dt
                      })
                    : null;
                advanceSimulationObject(enemy, ENEMY_SIMULATION_CAPABILITY.PHYSICS, {
                    collisionActors,
                    collisionBroadPhase,
                    surfaces,
                    dt
                });
                return spawnedProjectile;
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
    return Object.freeze({ survivors: Object.freeze(survivors), expired: Object.freeze(expired) });
}
