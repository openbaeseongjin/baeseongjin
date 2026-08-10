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
    if (owner.lifeState === "downed") return;
    if (owner.weapon.cooldown > 0) return;
    const target = selectNearestEnemy(owner.physics.position, enemies, owner.weapon.range);
    if (!target) return;
    projectiles.push({
        id: registry.createId("projectile"),
        ownerId: owner.id,
        targetId: target.id,
        position: owner.physics.position.clone(),
        velocity: new Vector2(),
        damage: owner.weapon.damage,
        radius: config.projectileRadius
    });
    owner.weapon.cooldown = owner.weapon.fireInterval;
}

export function updatePlayerProjectiles({ projectiles, enemies, config, dt }) {
    const enemyById = new Map(enemies.map((enemy) => [enemy.id, enemy]));
    const survivors = [];
    for (const projectile of projectiles) {
        const target = enemyById.get(projectile.targetId);
        if (!target || target.health <= 0) continue;
        const direction = target.position.clone().subtract(projectile.position);
        const distance = direction.length();
        if (distance > 0) direction.scale(1 / distance);
        projectile.velocity = direction.scale(config.projectileSpeed);
        projectile.position.add(projectile.velocity.clone().scale(dt));
        const hitDistance = projectile.position.distanceTo(target.position);
        if (hitDistance <= projectile.radius + target.radius) {
            target.health -= projectile.damage;
            continue;
        }
        survivors.push(projectile);
    }
    projectiles.splice(0, projectiles.length, ...survivors);
}

export function updateEnemyWeapons({ enemies, target, projectiles, registry, config, dt }) {
    for (const enemy of enemies) {
        enemy.fireCooldown = Math.max(0, (enemy.fireCooldown ?? 0) - dt);
        if (enemy.fireCooldown > 0 || target.health <= 0) continue;
        const direction = target.physics.position.clone().subtract(enemy.position);
        const distance = direction.length();
        if (distance <= 0 || distance > config.enemyAttackRange) continue;
        direction.scale(config.enemyProjectileSpeed / distance);
        projectiles.push({
            id: registry.createId("enemy-projectile"),
            ownerId: enemy.id,
            position: enemy.position.clone(),
            velocity: direction,
            radius: config.enemyProjectileRadius,
            damage: config.enemyProjectileDamage
        });
        enemy.fireCooldown = config.enemyFireInterval;
    }
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

export function updateEnemyProjectiles({ projectiles, target, rope, config, dt }) {
    const survivors = [];
    let ropeCutAt = null;
    for (const projectile of projectiles) {
        projectile.position.add(projectile.velocity.clone().scale(dt));
        if (
            rope.isAttached &&
            distancePointToSegment(projectile.position, target.physics.position, rope.anchor) <= projectile.radius
        ) {
            rope.detach();
            target.ropeDisabledRemaining = config.ropeDisabledSeconds;
            ropeCutAt = projectile.position.clone();
            continue;
        }
        if (
            target.hitInvulnerabilityRemaining <= 0 &&
            projectile.position.distanceTo(target.physics.position) <= projectile.radius + target.physics.config.radius
        ) {
            target.health = Math.max(0, target.health - projectile.damage);
            const knockback = projectile.velocity.clone();
            const speed = knockback.length();
            if (speed > 0) target.physics.addImpulse(knockback.scale(1 / speed), config.playerHitKnockback);
            target.hitInvulnerabilityRemaining = config.playerHitInvulnerability;
            continue;
        }
        survivors.push(projectile);
    }
    projectiles.splice(0, projectiles.length, ...survivors);
    return Object.freeze({ ropeCutAt });
}
