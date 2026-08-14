import { anchoredRectangleBounds, assertAuthoredCoordinateAnchor } from "../AuthoredCoordinateAnchor.js";

function freezeValue(value) {
    if (Array.isArray(value)) return Object.freeze(value.map((entry) => freezeValue(entry)));
    if (!value || typeof value !== "object") return value;
    return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, freezeValue(entry)])));
}

export function point(id, x, y, properties = {}) {
    return freezeValue({ id, x, y, ...properties });
}

export function rectangle(id, x, y, width, height = 32, properties = {}) {
    const coordinateAnchor = assertAuthoredCoordinateAnchor(properties.coordinateAnchor ?? "top-left");
    const position = Object.freeze({ x, y });
    const bounds = anchoredRectangleBounds(position, { width, height }, coordinateAnchor);
    return freezeValue({
        id,
        kind: "platform",
        oneWay: true,
        grappleable: true,
        ...properties,
        coordinateAnchor,
        position,
        vertices: [
            { x: bounds.x, y: bounds.y },
            { x: bounds.x + bounds.width, y: bounds.y },
            { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
            { x: bounds.x, y: bounds.y + bounds.height }
        ]
    });
}

export function grappleTarget(id, x, y, properties = {}) {
    return rectangle(id, x, y, 24, 24, {
        kind: "grapple-target",
        oneWay: false,
        collision: false,
        renderable: false,
        coordinateAnchor: "center",
        ...properties
    });
}

export function worldObject(id, kind, x, y, properties = {}) {
    const coordinateAnchor = assertAuthoredCoordinateAnchor(properties.coordinateAnchor ?? "center");
    return freezeValue({
        id,
        kind,
        presentationId: `world-object:${kind}`,
        position: { x, y },
        ...properties,
        coordinateAnchor
    });
}

export function triggerBounds(x, y, width, height) {
    return freezeValue({ x, y, width, height });
}

export const GATE_PORTAL_APERTURE_SIZE = Object.freeze({ width: 52, height: 62 });

export function gatePortalBounds(x, bottomY) {
    return anchoredRectangleBounds({ x, y: bottomY }, GATE_PORTAL_APERTURE_SIZE, "bottom-center");
}

export function cameraZone(id, minY, maxY, desktopZoom, mobileZoom, properties = {}) {
    return freezeValue({ id, minY, maxY, desktopZoom, mobileZoom, ...properties });
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
