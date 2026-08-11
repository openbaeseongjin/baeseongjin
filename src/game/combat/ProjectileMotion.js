export function steerProjectileToward(projectile, targetPosition, speed) {
    const dx = targetPosition.x - projectile.position.x;
    const dy = targetPosition.y - projectile.position.y;
    const distance = Math.hypot(dx, dy);
    if (distance <= 0) return;
    projectile.velocity.x = (dx / distance) * speed;
    projectile.velocity.y = (dy / distance) * speed;
}

export function advanceProjectileMotion(projectile, dt) {
    projectile.position.x += projectile.velocity.x * dt;
    projectile.position.y += projectile.velocity.y * dt;
    projectile.ageSeconds = (projectile.ageSeconds ?? 0) + dt;
}

export function advanceHomingProjectileMotion(projectile, targetPosition, speed, dt) {
    steerProjectileToward(projectile, targetPosition, speed);
    advanceProjectileMotion(projectile, dt);
}
