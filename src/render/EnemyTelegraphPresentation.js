import { resolveEnemyPresentationState } from "./EnemyPresentationState.js";

export function isDroneEnemy(enemy) {
    return resolveEnemyPresentationState(enemy).drone;
}
export function isCutter(enemy) {
    return resolveEnemyPresentationState(enemy).cutter;
}
export function enemyAimLine(enemy) {
    return resolveEnemyPresentationState(enemy).aimLine;
}
export function enemySensorColor(enemy) {
    return resolveEnemyPresentationState(enemy).sensorColor;
}
export function enemyBehaviorTelegraph(enemy, enemies = []) {
    return resolveEnemyPresentationState(enemy, enemies).telegraph;
}

const TELEGRAPH_DRAWER = Object.freeze({
    line: (context, telegraph) => {
        context.moveTo(telegraph.start.x, telegraph.start.y);
        context.lineTo(telegraph.end.x, telegraph.end.y);
    },
    arc: (context, telegraph) =>
        context.arc(telegraph.center.x, telegraph.center.y, telegraph.radius, telegraph.startAngle, telegraph.endAngle),
    area: (context, telegraph) => context.arc(telegraph.center.x, telegraph.center.y, telegraph.radius, 0, Math.PI * 2)
});

export function drawEnemyBehaviorTelegraph(context, enemy, enemies = [], presentation = null) {
    const telegraph = presentation?.telegraph ?? enemyBehaviorTelegraph(enemy, enemies);
    if (!telegraph) return false;
    context.save();
    context.strokeStyle = telegraph.color;
    context.lineWidth = telegraph.width;
    context.beginPath();
    TELEGRAPH_DRAWER[telegraph.kind](context, telegraph);
    context.stroke();
    context.restore();
    return true;
}
