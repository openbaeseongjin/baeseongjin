import { Vector2 } from "../../game-kit/index.js";
import { ProjectileObject } from "./ProjectileObject.js";

export function selectNearestEnemy(position, enemies, range) {
    return (
        enemies
            .filter((enemy) => enemy.health > 0 && position.distanceTo(enemy.position) <= range)
            .sort((left, right) => {
                const distanceDifference = position.distanceTo(left.position) - position.distanceTo(right.position);
                return distanceDifference || left.id.localeCompare(right.id);
            })[0] ?? null
    );
}

export function updateAutomaticWeapon({ owner, enemies, projectiles, registry, config, dt }) {
    owner.weapon.cooldown = Math.max(0, owner.weapon.cooldown - dt);
    if (owner.lifeState !== "active") return null;
    if (owner.weapon.cooldown > 0) return null;
    const target = selectNearestEnemy(owner.physics.position, enemies, owner.weapon.range);
    if (!target) return null;
    const projectile = new ProjectileObject({
        id: registry.createId("projectile"),
        ownerId: owner.id,
        targetId: target.id,
        position: owner.physics.position.clone(),
        velocity: new Vector2(),
        damage: owner.weapon.damage,
        radius: config.projectileRadius
    });
    projectiles.push(projectile);
    owner.weapon.cooldown = owner.weapon.fireInterval;
    return projectile;
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
        const direction = target.position.clone().subtract(projectile.position);
        const distance = direction.length();
        if (distance > 0) direction.scale(1 / distance);
        projectile.velocity = direction.scale(config.projectileSpeed);
        projectile.position.add(projectile.velocity.clone().scale(dt));
        projectile.ageSeconds = (projectile.ageSeconds ?? 0) + dt;
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

function selectNearestPlayer(position, targets, range) {
    return (
        targets
            .filter(
                (target) =>
                    target.health > 0 &&
                    target.lifeState === "active" &&
                    position.distanceTo(target.physics.position) <= range
            )
            .sort((left, right) => {
                const distanceDifference =
                    position.distanceTo(left.physics.position) - position.distanceTo(right.physics.position);
                return distanceDifference || left.id.localeCompare(right.id);
            })[0] ?? null
    );
}

export function updateEnemyWeapons({ enemies, targets, projectiles, registry, config, dt }) {
    const spawned = [];
    for (const enemy of enemies) {
        enemy.fireCooldown = Math.max(0, (enemy.fireCooldown ?? 0) - dt);
        if (enemy.fireCooldown > 0) continue;
        const target = selectNearestPlayer(enemy.position, targets, config.enemyAttackRange);
        if (!target) continue;
        const direction = target.physics.position.clone().subtract(enemy.position);
        const distance = direction.length();
        if (distance <= 0) continue;
        direction.scale(config.enemyProjectileSpeed / distance);
        const projectile = new ProjectileObject({
            id: registry.createId("enemy-projectile"),
            ownerId: enemy.id,
            targetId: target.id,
            position: enemy.position.clone(),
            velocity: direction,
            radius: config.enemyProjectileRadius,
            damage: config.enemyProjectileDamage
        });
        projectiles.push(projectile);
        spawned.push(projectile);
        enemy.fireCooldown = config.enemyFireInterval;
    }
    return Object.freeze(spawned);
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
        projectile.position.add(projectile.velocity.clone().scale(dt));
        projectile.ageSeconds = (projectile.ageSeconds ?? 0) + dt;
        if (projectile.ageSeconds >= maxLifetimeSeconds) expired.push(projectile);
        else survivors.push(projectile);
    }
    projectiles.splice(0, projectiles.length, ...survivors);
    return Object.freeze({ expired: Object.freeze(expired) });
}
