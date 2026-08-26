import { normalizeNetworkJson } from "./NetworkJson.js";

export const WORLD_SNAPSHOT_REPLICATION_KIND = Object.freeze({
    BASELINE: "baseline",
    DELTA: "delta"
});

const COLLECTION_KEY = Object.freeze({
    PLAYERS: "players",
    ENEMIES: "enemies"
});

function isRecord(value) {
    return value !== null && !Array.isArray(value) && typeof value === "object";
}

function clone(value) {
    if (Array.isArray(value)) return value.map(clone);
    if (!isRecord(value)) return value;
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, clone(child)]));
}

function equal(left, right) {
    if (Object.is(left, right)) return true;
    if (Array.isArray(left) || Array.isArray(right)) {
        return (
            Array.isArray(left) &&
            Array.isArray(right) &&
            left.length === right.length &&
            left.every((value, index) => equal(value, right[index]))
        );
    }
    if (!isRecord(left) || !isRecord(right)) return false;
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);
    return (
        leftKeys.length === rightKeys.length &&
        leftKeys.every((key) => Object.hasOwn(right, key) && equal(left[key], right[key]))
    );
}

function diffValue(previous, current, path, changes, removals) {
    if (equal(previous, current)) return;
    if (isRecord(previous) && isRecord(current)) {
        for (const key of Object.keys(previous)) {
            if (!Object.hasOwn(current, key)) removals.push([...path, key]);
        }
        for (const [key, value] of Object.entries(current)) {
            diffValue(previous[key], value, [...path, key], changes, removals);
        }
        return;
    }
    changes.push(Object.freeze({ path: Object.freeze(path), value: clone(current) }));
}

function createFieldDelta(previous, current) {
    const changes = [];
    const removals = [];
    diffValue(previous, current, [], changes, removals);
    return Object.freeze({
        changes: Object.freeze(changes),
        removals: Object.freeze(removals.map((path) => Object.freeze(path)))
    });
}

function setPath(target, path, value) {
    if (path.length === 0) return clone(value);
    let cursor = target;
    for (let index = 0; index < path.length - 1; index += 1) {
        const key = path[index];
        if (!isRecord(cursor[key])) cursor[key] = {};
        cursor = cursor[key];
    }
    cursor[path.at(-1)] = clone(value);
    return target;
}

function removePath(target, path) {
    if (path.length === 0) return {};
    let cursor = target;
    for (let index = 0; index < path.length - 1; index += 1) {
        cursor = cursor?.[path[index]];
        if (!isRecord(cursor)) return target;
    }
    delete cursor[path.at(-1)];
    return target;
}

function applyFieldDelta(previous, delta) {
    let next = clone(previous);
    for (const path of delta.removals) next = removePath(next, path);
    for (const change of delta.changes) next = setPath(next, change.path, change.value);
    return next;
}

function identityFor(collection, entity) {
    const identity = collection === COLLECTION_KEY.ENEMIES ? entity?.objectId : entity?.id;
    if (typeof identity !== "string" || identity.length === 0) {
        throw new Error(`${collection} entity identity must be non-empty`);
    }
    return identity;
}

function entityIndex(collection, entities) {
    if (!Array.isArray(entities)) throw new Error(`${collection} must be an array`);
    const indexed = new Map();
    for (const entity of entities) {
        const identity = identityFor(collection, entity);
        if (indexed.has(identity)) throw new Error(`duplicate ${collection} identity: ${identity}`);
        indexed.set(identity, entity);
    }
    return indexed;
}

function createCollectionDelta(
    collection,
    previousEntities,
    currentEntities,
    { relevantIds = null, previouslyRelevantIds = null } = {}
) {
    const previous = entityIndex(collection, previousEntities);
    const current = entityIndex(collection, currentEntities);
    const upserts = [];
    const removals = [...previous.keys()].filter((identity) => !current.has(identity));
    for (const [identity, entity] of current) {
        if (relevantIds && !relevantIds.has(identity)) continue;
        const previousEntity = previous.get(identity);
        if (!previousEntity || (previouslyRelevantIds && !previouslyRelevantIds.has(identity))) {
            upserts.push(Object.freeze({ identity, state: clone(entity) }));
            continue;
        }
        const fields = createFieldDelta(previousEntity, entity);
        if (fields.changes.length > 0 || fields.removals.length > 0) {
            upserts.push(Object.freeze({ identity, fields }));
        }
    }
    return Object.freeze({ upserts: Object.freeze(upserts), removals: Object.freeze(removals) });
}

function applyCollectionDelta(collection, previousEntities, delta) {
    const entities = entityIndex(collection, previousEntities);
    for (const identity of delta.removals) entities.delete(identity);
    for (const upsert of delta.upserts) {
        const previous = entities.get(upsert.identity);
        if (!upsert.state && !previous) throw new Error(`${collection} field delta requires an existing entity`);
        const next = upsert.state ?? applyFieldDelta(previous, upsert.fields);
        if (identityFor(collection, next) !== upsert.identity) {
            throw new Error(`${collection} delta changed entity identity`);
        }
        entities.set(upsert.identity, next);
    }
    return [...entities.values()];
}

function stateWithoutCollections(state) {
    const { players: _players, enemies: _enemies, ...rest } = state;
    return rest;
}

function normalizePath(path, label) {
    if (!Array.isArray(path) || path.some((part) => typeof part !== "string" || part.length === 0)) {
        throw new Error(`${label} must be an array of non-empty strings`);
    }
    return Object.freeze([...path]);
}

function normalizeFieldDelta(delta, label) {
    if (!isRecord(delta) || !Array.isArray(delta.changes) || !Array.isArray(delta.removals)) {
        throw new Error(`${label} must contain changes and removals arrays`);
    }
    return Object.freeze({
        changes: Object.freeze(
            delta.changes.map((change, index) => {
                if (!isRecord(change) || !Object.hasOwn(change, "value")) {
                    throw new Error(`${label}.changes[${index}] must contain value`);
                }
                return Object.freeze({
                    path: normalizePath(change.path, `${label}.changes[${index}].path`),
                    value: normalizeNetworkJson(change.value, `${label}.changes[${index}].value`)
                });
            })
        ),
        removals: Object.freeze(delta.removals.map((path, index) => normalizePath(path, `${label}.removals[${index}]`)))
    });
}

function normalizeCollectionDelta(delta, label) {
    if (!isRecord(delta) || !Array.isArray(delta.upserts) || !Array.isArray(delta.removals)) {
        throw new Error(`${label} must contain upserts and removals arrays`);
    }
    const identities = new Set();
    const upserts = delta.upserts.map((upsert, index) => {
        if (!isRecord(upsert) || typeof upsert.identity !== "string" || upsert.identity.length === 0) {
            throw new Error(`${label}.upserts[${index}] requires identity`);
        }
        if (identities.has(upsert.identity)) throw new Error(`duplicate ${label} identity: ${upsert.identity}`);
        identities.add(upsert.identity);
        if (Object.hasOwn(upsert, "state") === Object.hasOwn(upsert, "fields")) {
            throw new Error(`${label}.upserts[${index}] must contain exactly one of state or fields`);
        }
        return Object.freeze({
            identity: upsert.identity,
            ...(Object.hasOwn(upsert, "state")
                ? { state: normalizeNetworkJson(upsert.state, `${label}.upserts[${index}].state`) }
                : { fields: normalizeFieldDelta(upsert.fields, `${label}.upserts[${index}].fields`) })
        });
    });
    const removedIdentities = new Set();
    const removals = delta.removals.map((identity, index) => {
        if (typeof identity !== "string" || identity.length === 0) {
            throw new Error(`${label}.removals[${index}] must be non-empty`);
        }
        if (identities.has(identity)) throw new Error(`${label} identity cannot be upserted and removed: ${identity}`);
        if (removedIdentities.has(identity)) throw new Error(`duplicate ${label} removal: ${identity}`);
        removedIdentities.add(identity);
        return identity;
    });
    return Object.freeze({
        upserts: Object.freeze(upserts),
        removals: Object.freeze(removals)
    });
}

export function createBaselineSnapshotReplication(state) {
    return Object.freeze({ kind: WORLD_SNAPSHOT_REPLICATION_KIND.BASELINE, state });
}

export function createDeltaSnapshotReplication({
    baseSequence,
    previousState,
    currentState,
    relevantEnemyIds = null,
    previouslyRelevantEnemyIds = null
}) {
    if (!Number.isSafeInteger(baseSequence) || baseSequence < 0) {
        throw new Error("baseSequence must be a non-negative safe integer");
    }
    return Object.freeze({
        kind: WORLD_SNAPSHOT_REPLICATION_KIND.DELTA,
        baseSequence,
        state: createFieldDelta(stateWithoutCollections(previousState), stateWithoutCollections(currentState)),
        players: createCollectionDelta(COLLECTION_KEY.PLAYERS, previousState.players, currentState.players),
        enemies: createCollectionDelta(COLLECTION_KEY.ENEMIES, previousState.enemies, currentState.enemies, {
            relevantIds: relevantEnemyIds,
            previouslyRelevantIds: previouslyRelevantEnemyIds
        })
    });
}

export function normalizeSnapshotReplication(replication) {
    if (!isRecord(replication)) throw new Error("replication must be an object");
    if (replication.kind === WORLD_SNAPSHOT_REPLICATION_KIND.BASELINE) {
        return Object.freeze({
            kind: replication.kind,
            state: normalizeNetworkJson(replication.state, "replication.state")
        });
    }
    if (replication.kind !== WORLD_SNAPSHOT_REPLICATION_KIND.DELTA) {
        throw new Error("replication.kind must be baseline or delta");
    }
    if (!Number.isSafeInteger(replication.baseSequence) || replication.baseSequence < 0) {
        throw new Error("replication.baseSequence must be a non-negative safe integer");
    }
    const state = normalizeFieldDelta(replication.state, "replication.state");
    for (const path of [...state.changes.map((change) => change.path), ...state.removals]) {
        if (path[0] === "bossRuntime" || path[0] === "bossStageRuntime") {
            throw new Error("legacy Boss aliases are input-only baseline fields");
        }
    }
    return Object.freeze({
        kind: replication.kind,
        baseSequence: replication.baseSequence,
        state,
        players: normalizeCollectionDelta(replication.players, "replication.players"),
        enemies: normalizeCollectionDelta(replication.enemies, "replication.enemies")
    });
}

export function materializeSnapshotReplication(replication, baselineState = null) {
    if (replication.kind === WORLD_SNAPSHOT_REPLICATION_KIND.BASELINE) return clone(replication.state);
    if (!baselineState) throw new Error(`missing snapshot baseline: ${replication.baseSequence}`);
    const next = applyFieldDelta(stateWithoutCollections(baselineState), replication.state);
    next.players = applyCollectionDelta(COLLECTION_KEY.PLAYERS, baselineState.players, replication.players);
    next.enemies = applyCollectionDelta(COLLECTION_KEY.ENEMIES, baselineState.enemies, replication.enemies);
    return next;
}
