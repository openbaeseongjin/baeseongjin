export const ENEMY_LIFECYCLE_EVENT_TYPE = Object.freeze({
    DEFEATED: "enemy-defeated"
});

function assertId(value, label) {
    if (typeof value !== "string" || value.length === 0) {
        throw new Error(`${label} must be a non-empty string`);
    }
    return value;
}

function assertTick(value, label) {
    if (value === null || value === undefined) return null;
    if (!Number.isSafeInteger(value) || value < 0) {
        throw new Error(`${label} must be a non-negative safe integer`);
    }
    return value;
}

export function createEnemyImpactTombstone({
    targetId,
    defeatedAtTick = null,
    cause = ENEMY_LIFECYCLE_EVENT_TYPE.DEFEATED
}) {
    return Object.freeze({
        targetId: assertId(targetId, "targetId"),
        defeatedAtTick: assertTick(defeatedAtTick, "defeatedAtTick"),
        cause: typeof cause === "string" && cause.length > 0 ? cause : ENEMY_LIFECYCLE_EVENT_TYPE.DEFEATED
    });
}

export function recordEnemyImpactTombstone(tombstones, { targetId, defeatedAtTick = null, cause } = {}) {
    if (!(tombstones instanceof Map)) throw new Error("tombstones must be a Map");
    const tombstone = createEnemyImpactTombstone({ targetId, defeatedAtTick, cause });
    tombstones.set(tombstone.targetId, tombstone);
    return tombstone;
}

export function resolveEnemyImpactTombstone(tombstones, targetId) {
    if (tombstones === null || tombstones === undefined) return null;
    if (!(tombstones instanceof Map)) throw new Error("tombstones must be a Map");
    return tombstones.get(assertId(targetId, "targetId")) ?? null;
}
