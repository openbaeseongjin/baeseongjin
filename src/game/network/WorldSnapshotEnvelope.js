import { normalizeNetworkJson } from "./NetworkJson.js";

export const WORLD_SNAPSHOT_PROTOCOL_VERSION = 8;

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

function normalizeState(state) {
    if (!state || Array.isArray(state) || typeof state !== "object") throw new Error("state must be an object");
    for (const key of ["projectiles", "enemyProjectiles", "predictableObjects"]) {
        if (Object.hasOwn(state, key)) throw new Error(`${key} must be synchronized as spawn and resolve events`);
    }
    const normalized = normalizeNetworkJson(state, "state");
    if (!Array.isArray(normalized.players)) throw new Error("state.players must be an array");
    for (const player of normalized.players) {
        assertId(player?.id, "state.players[].id");
        assertTick(player?.ownerMotionTick, "state.players[].ownerMotionTick");
    }
    if (normalized.progressKind === "sector") {
        assertId(normalized.respawnAnchorId, "state.respawnAnchorId");
        if (Object.hasOwn(normalized, "activeCheckpointId")) {
            throw new Error("sector progress must not include activeCheckpointId");
        }
        const baseline = normalized.partyWipeBaseline;
        if (!baseline || Array.isArray(baseline) || typeof baseline !== "object") {
            throw new Error("state.partyWipeBaseline must be an object");
        }
        assertId(baseline.sectorId, "state.partyWipeBaseline.sectorId");
        assertTick(baseline.revision, "state.partyWipeBaseline.revision");
        assertId(baseline.respawnAnchorId, "state.partyWipeBaseline.respawnAnchorId");
        assertId(baseline.entryLandmarkId, "state.partyWipeBaseline.entryLandmarkId");
        if (normalized.worldProgress?.respawnAnchorId !== normalized.respawnAnchorId) {
            throw new Error("state.worldProgress.respawnAnchorId must match state.respawnAnchorId");
        }
        if (baseline.sectorId !== normalized.worldProgress?.currentSectorId) {
            throw new Error("state.partyWipeBaseline.sectorId must match state.worldProgress.currentSectorId");
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

export function createWorldSnapshotEnvelope({
    snapshotSequence,
    serverTick,
    worldSeed,
    worldRevision,
    acknowledgements,
    state,
    events = []
}) {
    return Object.freeze({
        protocolVersion: WORLD_SNAPSHOT_PROTOCOL_VERSION,
        snapshotSequence: assertTick(snapshotSequence, "snapshotSequence"),
        serverTick: assertTick(serverTick, "serverTick"),
        worldSeed: assertTick(worldSeed, "worldSeed"),
        worldRevision: assertId(worldRevision, "worldRevision"),
        acknowledgements: normalizeAcknowledgements(acknowledgements),
        state: normalizeState(state),
        events: normalizeEvents(events)
    });
}

export function serializeWorldSnapshotEnvelope(envelope) {
    return JSON.stringify(envelope);
}

export function deserializeWorldSnapshotEnvelope(serialized) {
    const parsed = JSON.parse(serialized);
    if (parsed?.protocolVersion !== WORLD_SNAPSHOT_PROTOCOL_VERSION) {
        throw new Error(`unsupported world snapshot protocol: ${parsed?.protocolVersion}`);
    }
    return createWorldSnapshotEnvelope(parsed);
}
