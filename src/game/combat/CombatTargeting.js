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

export function selectNearestPlayer(position, targets, range) {
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
