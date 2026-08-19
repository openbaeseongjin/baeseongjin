export function selectNearestActionTarget({ playerPosition, enemies, range }) {
    if (!Number.isFinite(playerPosition?.x) || !Number.isFinite(playerPosition?.y)) {
        throw new Error("playerPosition must contain finite x and y");
    }
    if (!Number.isFinite(range) || range <= 0) throw new Error("action target range must be positive");
    const candidates = (enemies ?? [])
        .filter(
            (enemy) => enemy?.health > 0 && Number.isFinite(enemy?.position?.x) && Number.isFinite(enemy?.position?.y)
        )
        .map((enemy) => ({
            enemy,
            distance: Math.hypot(enemy.position.x - playerPosition.x, enemy.position.y - playerPosition.y)
        }))
        .filter(({ distance }) => distance <= range)
        .sort((left, right) => left.distance - right.distance || left.enemy.id.localeCompare(right.enemy.id));
    return candidates[0]?.enemy ?? null;
}
