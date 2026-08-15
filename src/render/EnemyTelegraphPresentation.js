const AIM_LINE_LENGTH = 520;

export function isPatrolDrone(enemy) {
    return enemy?.enemyType === "patrol-drone-t1";
}

export function isCutter(enemy) {
    return enemy?.rules?.includes("cutter-fire") === true;
}

export function enemyAimLine(enemy) {
    if ((enemy.attackState !== "track" && enemy.attackState !== "lock") || !enemy.aimDirection) return null;
    const locked = enemy.attackState === "lock";
    const cutter = isCutter(enemy);
    return Object.freeze({
        end: Object.freeze({
            x: enemy.position.x + enemy.aimDirection.x * AIM_LINE_LENGTH,
            y: enemy.position.y + enemy.aimDirection.y * AIM_LINE_LENGTH
        }),
        color: cutter ? (locked ? "#ff8c1a" : "#b45309") : locked ? "#ff5a36" : "#8f2738",
        width: locked ? 3 : 1.5
    });
}

export function enemySensorColor(enemy) {
    const cutter = isCutter(enemy);
    if (!enemy.attackState || enemy.attackState === "idle") return cutter ? "#4a2a08" : "#3f1d2b";
    if (enemy.attackState === "cooldown") return cutter ? "#7c4a12" : "#7f1d1d";
    if (enemy.attackState === "fire") return cutter ? "#ffb347" : "#ffb347";
    if (enemy.attackState === "lock") return cutter ? "#ff7a00" : "#ff5a36";
    return cutter ? "#e8590c" : "#dc263f";
}
