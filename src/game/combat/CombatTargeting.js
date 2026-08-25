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

export function selectNearestPositionTarget(position, targets, range = Number.POSITIVE_INFINITY) {
    let nearest = null;
    let nearestDistance = Number.POSITIVE_INFINITY;
    for (const target of targets) {
        const distance = Math.hypot(position.x - target.position.x, position.y - target.position.y);
        if (distance > range) continue;
        if (
            nearest === null ||
            distance < nearestDistance ||
            (distance === nearestDistance && target.id.localeCompare(nearest.id) < 0)
        ) {
            nearest = target;
            nearestDistance = distance;
        }
    }
    return nearest;
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
