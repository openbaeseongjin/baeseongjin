export function resolvePlayerCollisions(player, otherPlayers) {
    if (!player?.physics?.collider) return false;
    let collided = false;
    for (const other of otherPlayers) {
        const result = player.physics.collider.resolveActor({
            actorId: player.id,
            position: player.physics.position,
            velocity: player.physics.velocity,
            other,
            isGrounded: player.physics.isGrounded
        });
        player.physics.isGrounded = result.isGrounded;
        collided ||= result.collided;
    }
    return collided;
}
