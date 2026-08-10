function collisionNormal(playerId, otherId, dx, dy, distance) {
    if (distance > 0.0001) return { x: dx / distance, y: dy / distance };
    return playerId.localeCompare(otherId) <= 0 ? { x: -1, y: 0 } : { x: 1, y: 0 };
}

export function resolvePlayerCollisions(player, otherPlayers, radius) {
    if (!player?.physics || !Number.isFinite(radius) || radius <= 0) return false;
    let collided = false;
    for (const other of otherPlayers) {
        if (!other?.position || other.id === player.id) continue;
        const otherRadius = Number.isFinite(other.radius) ? other.radius : radius;
        const dx = player.physics.position.x - other.position.x;
        const dy = player.physics.position.y - other.position.y;
        const distance = Math.hypot(dx, dy);
        const minimumDistance = radius + otherRadius;
        if (distance >= minimumDistance) continue;
        const normal = collisionNormal(player.id, other.id, dx, dy, distance);
        const penetration = (minimumDistance - distance) * (other.lifeState === "active" ? 0.5 : 1);
        player.physics.position.x += normal.x * penetration;
        player.physics.position.y += normal.y * penetration;
        const inwardSpeed = player.physics.velocity.x * normal.x + player.physics.velocity.y * normal.y;
        if (inwardSpeed < 0) {
            player.physics.velocity.x -= normal.x * inwardSpeed;
            player.physics.velocity.y -= normal.y * inwardSpeed;
        }
        if (normal.y < -0.55) player.physics.isGrounded = true;
        collided = true;
    }
    return collided;
}
