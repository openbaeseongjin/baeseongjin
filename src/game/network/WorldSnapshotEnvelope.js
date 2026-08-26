import { normalizeNetworkJson } from "./NetworkJson.js";
import {
    createBaselineSnapshotReplication,
    normalizeSnapshotReplication,
    WORLD_SNAPSHOT_REPLICATION_KIND
} from "./WorldSnapshotReplication.js";

export const WORLD_SNAPSHOT_PROTOCOL_VERSION = 23;
const LEGACY_WORLD_SNAPSHOT_PROTOCOL_VERSION = 22;

function assertTick(value, label) {
    if (!Number.isSafeInteger(value) || value < 0) throw new Error(`${label} must be a non-negative safe integer`);
    return value;
}

function assertId(value, label) {
    if (typeof value !== "string" || value.length === 0) throw new Error(`${label} must be non-empty`);
    return value;
}

function normalizeAcknowledgements(acknowledgements) {
    if (!acknowledgements || Array.isArray(acknowledgements) || typeof acknowledgements !== "object") {
        throw new Error("acknowledgements must be an object");
    }
    return Object.freeze(
        Object.fromEntries(
            Object.keys(acknowledgements)
                .sort()
                .map((playerId) => [assertId(playerId, "playerId"), assertTick(acknowledgements[playerId], "sequence")])
        )
    );
}

function normalizeEvents(events) {
    if (!Array.isArray(events)) throw new Error("events must be an array");
    const eventIds = new Set();
    return Object.freeze(
        events
            .map((event) => {
                const normalized = normalizeNetworkJson(event, "event");
                assertId(normalized.eventId, "eventId");
                assertTick(normalized.tick, "event.tick");
                if (eventIds.has(normalized.eventId)) throw new Error(`duplicate eventId: ${normalized.eventId}`);
                eventIds.add(normalized.eventId);
                return normalized;
            })
            .sort((left, right) => left.tick - right.tick || left.eventId.localeCompare(right.eventId))
    );
}

export function normalizeWorldSnapshotState(state, { allowLegacyBossAliases = false } = {}) {
    if (!state || Array.isArray(state) || typeof state !== "object") throw new Error("state must be an object");
    for (const key of ["projectiles", "enemyProjectiles", "predictableObjects"]) {
        if (Object.hasOwn(state, key)) throw new Error(`${key} must be synchronized as spawn and resolve events`);
    }
    const normalizedInput = normalizeNetworkJson(state, "state");
    if (
        !allowLegacyBossAliases &&
        (Object.hasOwn(normalizedInput, "bossRuntime") || Object.hasOwn(normalizedInput, "bossStageRuntime"))
    ) {
        throw new Error("legacy Boss aliases are input-only protocol v22 fields");
    }
    const bossStage = normalizedInput.bossStage ?? normalizedInput.bossStageRuntime ?? normalizedInput.bossRuntime;
    const {
        bossRuntime: _bossRuntime,
        bossStageRuntime: _bossStageRuntime,
        ...withoutLegacyBossAliases
    } = normalizedInput;
    if (!Array.isArray(normalizedInput.enemies)) throw new Error("state.enemies must be an array");
    const enemyIdentities = new Set();
    const enemies = normalizedInput.enemies.map((enemy) => {
        const id = assertId(enemy?.id, "state.enemies[].id");
        const objectId = assertId(enemy?.objectId ?? id, "state.enemies[].objectId");
        if (enemyIdentities.has(objectId)) throw new Error(`duplicate state.enemies[].objectId: ${objectId}`);
        enemyIdentities.add(objectId);
        return Object.freeze({ ...enemy, objectId });
    });
    const normalized = Object.freeze({
        ...withoutLegacyBossAliases,
        enemies: Object.freeze(enemies),
        ...(bossStage === undefined ? {} : { bossStage })
    });
    if (!Array.isArray(normalized.players)) throw new Error("state.players must be an array");
    const playerIds = new Set();
    for (const player of normalized.players) {
        const playerId = assertId(player?.id, "state.players[].id");
        if (playerIds.has(playerId)) throw new Error(`duplicate state.players[].id: ${playerId}`);
        playerIds.add(playerId);
        assertTick(player?.ownerMotionTick, "state.players[].ownerMotionTick");
    }
    if (normalized.progressKind === "sector") {
        for (const player of normalized.players) {
            assertId(player.respawnAnchorId, "state.players[].respawnAnchorId");
        }
        for (const key of ["respawnAnchorId", "partyWipeBaseline", "activeCheckpointId"]) {
            if (Object.hasOwn(normalized, key)) throw new Error(`sector progress must not include ${key}`);
        }
    } else if (normalized.progressKind === "area") {
        if (normalized.activeCheckpointId !== null) {
            assertId(normalized.activeCheckpointId, "state.activeCheckpointId");
        }
    } else {
        throw new Error("state.progressKind must be sector or area");
    }
    return normalized;
}

export function createWorldSnapshotEnvelope(
    { snapshotSequence, serverTick, worldSeed, worldRevision, acknowledgements, replication, events = [] },
    { allowLegacyBossAliases = false } = {}
) {
    const normalizedReplication = normalizeSnapshotReplication(replication);
    const normalizedSnapshotSequence = assertTick(snapshotSequence, "snapshotSequence");
    if (
        normalizedReplication.kind === WORLD_SNAPSHOT_REPLICATION_KIND.DELTA &&
        normalizedReplication.baseSequence >= normalizedSnapshotSequence
    ) {
        throw new Error("delta baseSequence must precede snapshotSequence");
    }
    const validatedReplication =
        normalizedReplication.kind === WORLD_SNAPSHOT_REPLICATION_KIND.BASELINE
            ? createBaselineSnapshotReplication(
                  normalizeWorldSnapshotState(normalizedReplication.state, { allowLegacyBossAliases })
              )
            : normalizedReplication;
    return Object.freeze({
        protocolVersion: WORLD_SNAPSHOT_PROTOCOL_VERSION,
        snapshotSequence: normalizedSnapshotSequence,
        serverTick: assertTick(serverTick, "serverTick"),
        worldSeed: assertTick(worldSeed, "worldSeed"),
        worldRevision: assertId(worldRevision, "worldRevision"),
        acknowledgements: normalizeAcknowledgements(acknowledgements),
        replication: validatedReplication,
        events: normalizeEvents(events)
    });
}

export function serializeWorldSnapshotEnvelope(envelope) {
    return JSON.stringify(envelope);
}

export function deserializeWorldSnapshotEnvelope(serialized) {
    const parsed = JSON.parse(serialized);
    if (
        parsed?.protocolVersion !== WORLD_SNAPSHOT_PROTOCOL_VERSION &&
        parsed?.protocolVersion !== LEGACY_WORLD_SNAPSHOT_PROTOCOL_VERSION
    ) {
        throw new Error(`unsupported world snapshot protocol: ${parsed?.protocolVersion}`);
    }
    if (parsed.protocolVersion === LEGACY_WORLD_SNAPSHOT_PROTOCOL_VERSION) {
        return createWorldSnapshotEnvelope(
            {
                ...parsed,
                replication: createBaselineSnapshotReplication(parsed.state)
            },
            { allowLegacyBossAliases: true }
        );
    }
    return createWorldSnapshotEnvelope(parsed);
}
