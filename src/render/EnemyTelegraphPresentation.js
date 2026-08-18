const AIM_LINE_LENGTH = 520;
const PURSUIT_LINE_LENGTH = 180;
const SWARM_LINE_LENGTH = 120;

function behaviorState(enemy) {
    return enemy?.behaviorState ?? enemy?.enemyBehaviorSnapshot?.() ?? null;
}

function lineTelegraph(enemy, direction, length, color, width = 2) {
    if (!direction || !Number.isFinite(direction.x) || !Number.isFinite(direction.y)) return null;
    return Object.freeze({
        kind: "line",
        start: Object.freeze({ x: enemy.position.x, y: enemy.position.y }),
        end: Object.freeze({
            x: enemy.position.x + direction.x * length,
            y: enemy.position.y + direction.y * length
        }),
        color,
        width
    });
}

export function isDroneEnemy(enemy) {
    return typeof enemy?.enemyType === "string" && enemy.enemyType.includes("drone");
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

export function enemyBehaviorTelegraph(enemy, enemies = []) {
    const state = behaviorState(enemy);
    if (!state) return null;
    if (state.kind === "pursuit" && (state.state === "windup" || state.state === "dash")) {
        return lineTelegraph(
            enemy,
            state.dashDirection,
            PURSUIT_LINE_LENGTH,
            state.state === "dash" ? "#fb923c" : "#fdba74",
            state.state === "dash" ? 4 : 2
        );
    }
    if (state.kind === "shield" && state.guardDirection) {
        const angle = Math.atan2(state.guardDirection.y, state.guardDirection.x);
        const halfAngle = Number.isFinite(state.guardHalfAngle) ? state.guardHalfAngle : Math.PI / 3;
        return Object.freeze({
            kind: "arc",
            center: Object.freeze({ x: enemy.position.x, y: enemy.position.y }),
            radius: (enemy.radius ?? 18) + 9,
            startAngle: angle - halfAngle,
            endAngle: angle + halfAngle,
            color: "#60a5fa",
            width: 4
        });
    }
    if (state.kind === "artillery" && state.state === "telegraph" && state.targetPosition) {
        return Object.freeze({
            kind: "area",
            center: Object.freeze({ ...state.targetPosition }),
            radius: state.strikeRadius ?? 72,
            color: "#f97316",
            width: 3
        });
    }
    if (state.kind === "support" && state.targetId) {
        const target = enemies.find(({ id }) => id === state.targetId);
        if (!target) return null;
        return Object.freeze({
            kind: "line",
            start: Object.freeze({ x: enemy.position.x, y: enemy.position.y }),
            end: Object.freeze({ x: target.position.x, y: target.position.y }),
            color: "#4ade80",
            width: 3
        });
    }
    if (state.kind === "swarm" && state.state === "dive") {
        return lineTelegraph(enemy, state.diveDirection, SWARM_LINE_LENGTH, "#e879f9", 2);
    }
    return null;
}

export function drawEnemyBehaviorTelegraph(context, enemy, enemies = []) {
    const telegraph = enemyBehaviorTelegraph(enemy, enemies);
    if (!telegraph) return false;
    context.save();
    context.strokeStyle = telegraph.color;
    context.lineWidth = telegraph.width;
    context.beginPath();
    if (telegraph.kind === "line") {
        context.moveTo(telegraph.start.x, telegraph.start.y);
        context.lineTo(telegraph.end.x, telegraph.end.y);
    } else if (telegraph.kind === "arc") {
        context.arc(telegraph.center.x, telegraph.center.y, telegraph.radius, telegraph.startAngle, telegraph.endAngle);
    } else {
        context.arc(telegraph.center.x, telegraph.center.y, telegraph.radius, 0, Math.PI * 2);
    }
    context.stroke();
    context.restore();
    return true;
}
