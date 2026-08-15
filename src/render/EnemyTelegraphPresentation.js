const AIM_LINE_LENGTH = 520;

export function isPatrolDrone(enemy) {
    return enemy?.enemyType === "patrol-drone-t1";
}

export function enemyAimLine(enemy) {
    if ((enemy.attackState !== "track" && enemy.attackState !== "lock") || !enemy.aimDirection) return null;
    const locked = enemy.attackState === "lock";
    return Object.freeze({
        end: Object.freeze({
            x: enemy.position.x + enemy.aimDirection.x * AIM_LINE_LENGTH,
            y: enemy.position.y + enemy.aimDirection.y * AIM_LINE_LENGTH
        }),
        color: locked ? "#ff5a36" : "#8f2738",
        width: locked ? 3 : 1.5
    });
}

export function enemySensorColor(enemy) {
    if (!enemy.attackState || enemy.attackState === "idle") return "#3f1d2b";
    if (enemy.attackState === "cooldown") return "#7f1d1d";
    if (enemy.attackState === "fire") return "#ffb347";
    if (enemy.attackState === "lock") return "#ff5a36";
    return "#dc263f";
}
