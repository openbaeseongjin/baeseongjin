export function resolvePlayerCollisions(player, otherPlayers) {
    if (!player?.physics?.collider) return false;
    const result = player.physics.resolveSurfaceActors({
        actorId: player.id,
        actors: otherPlayers,
        isGrounded: player.physics.isGrounded
    });
    player.physics.isGrounded = result.isGrounded;
    return result.collidedActorIds.length > 0;
}
