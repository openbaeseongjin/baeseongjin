import { Vector2 } from "../../game-kit/index.js";
import { ENEMY_TYPE } from "../EnemyType.js";

const ARRIVAL_EPSILON = 0.5;
const DEFAULT_PATROL_POLICY = Object.freeze({ mode: null, waitSeconds: null, speed: null, radius: null });
const PATROL_POLICY_BY_ENEMY_TYPE = Object.freeze({
    [ENEMY_TYPE.PATROL_DRONE]: Object.freeze({ mode: "pingpong", waitSeconds: 0.45, speed: 48, radius: 96 }),
    [ENEMY_TYPE.PATROL_DRONE_T1]: Object.freeze({ mode: "pingpong", waitSeconds: 0.45, speed: 48, radius: 96 })
});

function patrolPolicy(enemyType) {
    return PATROL_POLICY_BY_ENEMY_TYPE[enemyType] ?? DEFAULT_PATROL_POLICY;
}

function clamp(value, minimum, maximum) {
    return Math.max(minimum, Math.min(maximum, value));
}

function normalizePoint(point, activation = null) {
    if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) return null;
    if (!activation) return Object.freeze({ x: point.x, y: point.y });
    return Object.freeze({
        x: clamp(point.x, activation.x, activation.x + activation.width),
        y: clamp(point.y, activation.y, activation.y + activation.height)
    });
}

function defaultPatrolPoints(origin, activation, radius) {
    if (!Number.isFinite(radius) || radius <= 0) return [];
    if (!activation) {
        return [
            Object.freeze({ x: origin.x - radius, y: origin.y }),
            Object.freeze({ x: origin.x + radius, y: origin.y })
        ];
    }
    const horizontalRadius = Math.min(radius, activation.width / 4);
    const verticalRadius = Math.min(radius, activation.height / 4);
    return activation.width >= activation.height
        ? [
              normalizePoint({ x: origin.x - horizontalRadius, y: origin.y }, activation),
              normalizePoint({ x: origin.x + horizontalRadius, y: origin.y }, activation)
          ]
        : [
              normalizePoint({ x: origin.x, y: origin.y - verticalRadius }, activation),
              normalizePoint({ x: origin.x, y: origin.y + verticalRadius }, activation)
          ];
}

function normalizePatrolPoints(patrol, activation, origin, policy) {
    if (Array.isArray(patrol?.points)) return patrol.points.map((point) => normalizePoint(point, activation));
    if (Array.isArray(patrol?.route)) return patrol.route.map((point) => normalizePoint(point, activation));
    if (patrol?.corridor) {
        return [normalizePoint(patrol.corridor.start, activation), normalizePoint(patrol.corridor.end, activation)];
    }
    return defaultPatrolPoints(origin, activation, policy.radius);
}

function dedupePoints(points) {
    const result = [];
    for (const point of points) {
        if (!point) continue;
        const previous = result.at(-1);
        if (previous && Math.hypot(point.x - previous.x, point.y - previous.y) <= ARRIVAL_EPSILON) continue;
        result.push(point);
    }
    return result;
}

function nearestPointIndex(points, origin) {
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;
    for (const [index, point] of points.entries()) {
        const distance = Math.hypot(point.x - origin.x, point.y - origin.y);
        if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestIndex = index;
        }
    }
    return nearestIndex;
}

function nextPatrolTarget({ points, targetIndex, direction, mode }) {
    if (points.length < 2) return null;
    if (mode === "loop") {
        return Object.freeze({
            targetIndex: (targetIndex + 1) % points.length,
            direction
        });
    }
    let nextDirection = direction;
    let nextIndex = targetIndex + nextDirection;
    if (nextIndex >= points.length || nextIndex < 0) {
        nextDirection *= -1;
        nextIndex = targetIndex + nextDirection;
    }
    return Object.freeze({
        targetIndex: clamp(nextIndex, 0, points.length - 1),
        direction: nextDirection
    });
}

function clampToActivation(position, activation) {
    if (!activation) return;
    position.set(
        clamp(position.x, activation.x, activation.x + activation.width),
        clamp(position.y, activation.y, activation.y + activation.height)
    );
}

export function createEnemyPatrolState({ patrol = null, activation = null, origin, enemyType = null }) {
    const policy = patrolPolicy(enemyType);
    const speed = Number.isFinite(patrol?.speed) && patrol.speed > 0 ? patrol.speed : policy.speed;
    if (!Number.isFinite(speed) || speed <= 0) return null;
    const points = dedupePoints(normalizePatrolPoints(patrol, activation, origin, policy));
    if (points.length < 2) return null;
    let mode = policy.mode ?? "pingpong";
    if (patrol?.mode === "loop" || patrol?.mode === "pingpong") mode = patrol.mode;
    let waitSeconds = policy.waitSeconds ?? 0;
    if (Number.isFinite(patrol?.waitSeconds)) waitSeconds = Math.max(0, patrol.waitSeconds);
    const originPoint = normalizePoint(origin, activation) ?? points[0];
    let targetIndex = nearestPointIndex(points, originPoint);
    let direction = mode === "pingpong" && targetIndex === points.length - 1 ? -1 : 1;
    if (Math.hypot(points[targetIndex].x - originPoint.x, points[targetIndex].y - originPoint.y) <= ARRIVAL_EPSILON) {
        const next = nextPatrolTarget({ points, targetIndex, direction, mode });
        if (next) {
            targetIndex = next.targetIndex;
            direction = next.direction;
        }
    }
    return {
        speed,
        mode,
        points: Object.freeze(points),
        waitSeconds,
        waitRemaining: 0,
        targetIndex,
        direction
    };
}

export function restoreEnemyPatrolState(target, snapshot) {
    if (target === null || snapshot === null) return target === snapshot;
    if (!target || !snapshot || target.mode !== snapshot.mode || target.points.length !== snapshot.points?.length) {
        return false;
    }
    const targetIndex = snapshot.targetIndex;
    if (!Number.isSafeInteger(targetIndex) || targetIndex < 0 || targetIndex >= target.points.length) return false;
    if (!Number.isFinite(snapshot.waitRemaining) || snapshot.waitRemaining < 0) return false;
    target.targetIndex = targetIndex;
    target.direction = snapshot.direction === -1 ? -1 : 1;
    target.waitRemaining = snapshot.waitRemaining;
    return true;
}

export function advanceEnemyPatrol(enemy, dt) {
    if (!enemy.patrol || !Number.isFinite(dt) || dt <= 0) return false;
    const origin = enemy.predictedSurfacePosition(dt);
    const position = origin.clone();
    let remainingTime = dt;
    let moved = false;
    let stepsRemaining = enemy.patrol.points.length * 4;

    while (remainingTime > 0 && stepsRemaining > 0) {
        stepsRemaining -= 1;
        if (enemy.patrol.waitRemaining > 0) {
            const waited = Math.min(enemy.patrol.waitRemaining, remainingTime);
            enemy.patrol.waitRemaining -= waited;
            remainingTime -= waited;
            continue;
        }
        const target = enemy.patrol.points[enemy.patrol.targetIndex];
        const delta = new Vector2(target.x - position.x, target.y - position.y);
        const distance = delta.length();
        if (distance <= ARRIVAL_EPSILON) {
            position.set(target.x, target.y);
            const next = nextPatrolTarget(enemy.patrol);
            if (!next) break;
            enemy.patrol.targetIndex = next.targetIndex;
            enemy.patrol.direction = next.direction;
            enemy.patrol.waitRemaining = enemy.patrol.waitSeconds;
            continue;
        }
        moved = true;
        const travelTime = distance / enemy.patrol.speed;
        if (travelTime <= remainingTime) {
            position.set(target.x, target.y);
            remainingTime -= travelTime;
            const next = nextPatrolTarget(enemy.patrol);
            if (!next) break;
            enemy.patrol.targetIndex = next.targetIndex;
            enemy.patrol.direction = next.direction;
            enemy.patrol.waitRemaining = enemy.patrol.waitSeconds;
            continue;
        }
        position.add(delta.scale((enemy.patrol.speed * remainingTime) / distance));
        remainingTime = 0;
    }

    clampToActivation(position, enemy.activation);
    enemy.queueSurfaceDisplacement(position.subtract(origin), dt);
    return moved;
}
