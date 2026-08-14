function freezeValue(value) {
    if (Array.isArray(value)) return Object.freeze(value.map((entry) => freezeValue(entry)));
    if (!value || typeof value !== "object") return value;
    return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, freezeValue(entry)])));
}

export function point(id, x, y, properties = {}) {
    return freezeValue({ id, x, y, ...properties });
}

export function rectangle(id, x, y, width, height = 32, properties = {}) {
    return freezeValue({
        id,
        kind: "platform",
        oneWay: true,
        grappleable: true,
        ...properties,
        vertices: [
            { x, y },
            { x: x + width, y },
            { x: x + width, y: y + height },
            { x, y: y + height }
        ]
    });
}

export function grappleTarget(id, x, y, properties = {}) {
    return rectangle(id, x - 12, y - 12, 24, 24, {
        kind: "grapple-target",
        oneWay: false,
        collision: false,
        renderable: false,
        ...properties
    });
}

export function worldObject(id, kind, x, y, properties = {}) {
    return freezeValue({ id, kind, presentationId: `world-object:${kind}`, position: { x, y }, ...properties });
}

export function triggerBounds(x, y, width, height) {
    return freezeValue({ x, y, width, height });
}

export function defineArea(definition) {
    return freezeValue({
        subtitle: "",
        surfaces: [],
        routePoints: [],
        recoveryPoints: [],
        checkpoints: [],
        objects: [],
        objectives: [],
        windZones: [],
        storyTriggers: [],
        routes: ["safe", "flow", "recovery"],
        cameraZones: [],
        cueIds: [],
        ...definition
    });
}

export function defineAreaCatalog({ id, revision, areas }) {
    return freezeValue({ id, revision, areas });
}
