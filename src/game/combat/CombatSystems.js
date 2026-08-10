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
