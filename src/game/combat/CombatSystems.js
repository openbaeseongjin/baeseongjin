import { Vector2 } from "../../game-kit/index.js";

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
    const projectile = {
        id: registry.createId("projectile"),
        ownerId: owner.id,
        targetId: target.id,
        position: owner.physics.position.clone(),
        velocity: new Vector2(),
        damage: owner.weapon.damage,
        radius: config.projectileRadius
    };
    projectiles.push(projectile);
    owner.weapon.cooldown = owner.weapon.fireInterval;
    return projectile;
}

export function updatePlayerProjectiles({ projectiles, enemies, config, dt }) {
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
        const hitDistance = projectile.position.distanceTo(target.position);
        if (hitDistance <= projectile.radius + target.radius) {
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
        const projectile = {
            id: registry.createId("enemy-projectile"),
            ownerId: enemy.id,
            targetId: target.id,
            position: enemy.position.clone(),
            velocity: direction,
            radius: config.enemyProjectileRadius,
            damage: config.enemyProjectileDamage
        };
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

export function updateEnemyProjectiles({ projectiles, targets, config, dt }) {
    const survivors = [];
    let ropeCutAt = null;
    const ropeCuts = [];
    const hits = [];
    const resolutions = [];
    const orderedTargets = [...targets].sort((left, right) => left.id.localeCompare(right.id));
    for (const projectile of projectiles) {
        projectile.position.add(projectile.velocity.clone().scale(dt));
        const ropeTarget = orderedTargets.find(
            (target) =>
                target.rope.isAttached &&
                distancePointToSegment(projectile.position, target.physics.position, target.rope.anchor) <=
                    projectile.radius
        );
        if (ropeTarget) {
            ropeTarget.rope.detach();
            ropeTarget.ropeDisabledRemaining = config.ropeDisabledSeconds;
            const position = projectile.position.clone();
            ropeCutAt ??= position;
            ropeCuts.push(Object.freeze({ playerId: ropeTarget.id, position }));
            resolutions.push(
                Object.freeze({
                    projectileId: projectile.id,
                    resolution: "rope-cut",
                    position
                })
            );
            continue;
        }
        const bodyTarget = orderedTargets.find(
            (target) =>
                target.health > 0 &&
                target.hitInvulnerabilityRemaining <= 0 &&
                projectile.position.distanceTo(target.physics.position) <=
                    projectile.radius + target.physics.config.radius
        );
        if (bodyTarget) {
            bodyTarget.health = Math.max(0, bodyTarget.health - projectile.damage);
            const knockback = projectile.velocity.clone();
            const speed = knockback.length();
            if (speed > 0) bodyTarget.physics.addImpulse(knockback.scale(1 / speed), config.playerHitKnockback);
            bodyTarget.hitInvulnerabilityRemaining = config.playerHitInvulnerability;
            hits.push(
                Object.freeze({
                    type: "player-hit",
                    position: bodyTarget.physics.position.clone(),
                    damage: projectile.damage,
                    projectileId: projectile.id,
                    playerId: bodyTarget.id
                })
            );
            resolutions.push(
                Object.freeze({
                    projectileId: projectile.id,
                    resolution: "player-hit",
                    position: bodyTarget.physics.position.clone()
                })
            );
            continue;
        }
        survivors.push(projectile);
    }
    projectiles.splice(0, projectiles.length, ...survivors);
    return Object.freeze({
        ropeCutAt,
        ropeCuts: Object.freeze(ropeCuts),
        hits: Object.freeze(hits),
        resolutions: Object.freeze(resolutions)
    });
}
