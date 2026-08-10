export const PREDICTABLE_OBJECT_EVENT_PROTOCOL_VERSION = 1;

function assertId(value, label) {
    if (typeof value !== "string" || value.length === 0) throw new Error(`${label} must be non-empty`);
    return value;
}

function assertTick(value, label) {
    if (!Number.isSafeInteger(value) || value < 0) throw new Error(`${label} must be a non-negative safe integer`);
    return value;
}

function normalizeVector(value, label) {
    if (!Number.isFinite(value?.x) || !Number.isFinite(value?.y)) {
        throw new Error(`${label} must contain finite x and y`);
    }
    return Object.freeze({ x: value.x, y: value.y });
}

function normalizeJsonValue(value, label, ancestors = new Set()) {
    if (value === null || typeof value === "string" || typeof value === "boolean") return value;
    if (typeof value === "number") {
        if (!Number.isFinite(value)) throw new Error(`${label} numbers must be finite`);
        return value;
    }
    if (typeof value !== "object") throw new Error(`${label} must be JSON-compatible`);
    if (ancestors.has(value)) throw new Error(`${label} must not contain cycles`);

    ancestors.add(value);
    let normalized;
    if (Array.isArray(value)) {
        normalized = value.map((item, index) => normalizeJsonValue(item, `${label}[${index}]`, ancestors));
    } else {
        normalized = {};
        for (const key of Object.keys(value).sort()) {
            normalized[key] = normalizeJsonValue(value[key], `${label}.${key}`, ancestors);
        }
    }
    ancestors.delete(value);
    return Object.freeze(normalized);
}

export function createPredictableSpawnEvent({
    eventId,
    objectId,
    objectType,
    spawnTick,
    position,
    velocity,
    parameters
}) {
    return Object.freeze({
        protocolVersion: PREDICTABLE_OBJECT_EVENT_PROTOCOL_VERSION,
        eventType: "spawn",
        eventId: assertId(eventId, "eventId"),
        objectId: assertId(objectId, "objectId"),
        objectType: assertId(objectType, "objectType"),
        tick: assertTick(spawnTick, "spawnTick"),
        position: normalizeVector(position, "position"),
        velocity: normalizeVector(velocity, "velocity"),
        parameters: normalizeJsonValue(parameters ?? {}, "parameters")
    });
}

export function createPredictableResolveEvent({ eventId, objectId, tick, resolution, position }) {
    return Object.freeze({
        protocolVersion: PREDICTABLE_OBJECT_EVENT_PROTOCOL_VERSION,
        eventType: "resolve",
        eventId: assertId(eventId, "eventId"),
        objectId: assertId(objectId, "objectId"),
        tick: assertTick(tick, "tick"),
        resolution: assertId(resolution, "resolution"),
        position: normalizeVector(position, "position")
    });
}

export function serializePredictableObjectEvent(event) {
    return JSON.stringify(event);
}

export function deserializePredictableObjectEvent(serialized) {
    const parsed = JSON.parse(serialized);
    if (parsed?.protocolVersion !== PREDICTABLE_OBJECT_EVENT_PROTOCOL_VERSION) {
        throw new Error(`unsupported predictable object event protocol: ${parsed?.protocolVersion}`);
    }
    if (parsed.eventType === "spawn") {
        return createPredictableSpawnEvent({
            eventId: parsed.eventId,
            objectId: parsed.objectId,
            objectType: parsed.objectType,
            spawnTick: parsed.tick,
            position: parsed.position,
            velocity: parsed.velocity,
            parameters: parsed.parameters
        });
    }
    if (parsed.eventType === "resolve") return createPredictableResolveEvent(parsed);
    throw new Error(`unsupported predictable object event type: ${parsed?.eventType}`);
}
