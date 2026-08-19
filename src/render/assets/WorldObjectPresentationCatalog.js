import { anchoredRectangleBounds } from "../../game/world/AuthoredCoordinateAnchor.js";

const DEFAULT_DEFINITIONS = {
    "world-object:grapple-landmark": { renderMode: "mock-shape", color: "#22d3ee", radius: 15 },
    "world-object:structural-grapple-joint": { renderMode: "mock-shape", color: "#64748b", radius: 10 },
    "world-object:terminal": { renderMode: "mock-shape", color: "#fbbf24", radius: 20 },
    "world-object:gate-panel": {
        renderMode: "mock-shape",
        color: "#fbbf24",
        radius: 18,
        size: { width: 44, height: 45 }
    },
    "world-object:augment-node": {
        renderMode: "mock-shape",
        color: "#c084fc",
        radius: 36,
        size: { width: 168, height: 120 }
    },
    "world-object:gate": {
        renderMode: "mock-shape",
        color: "#fb7185",
        radius: 28,
        size: { width: 52, height: 62 }
    },
    "world-object:wind-source": { renderMode: "mock-shape", color: "#67e8f9", radius: 64 },
    "world-object:test-target": {
        renderMode: "mock-shape",
        color: "#a3e635",
        radius: 28,
        size: { width: 58, height: 94 }
    },
    "world-object:background-prop": { renderMode: "environment-decoration" },
    "world-object:checkpoint": { renderMode: "checkpoint" },
    "world-object:sentry": { renderMode: "combat-entity" },
    "world-object:patrol-drone": { renderMode: "combat-entity" },
    "world-object:story-display": { renderMode: "mock-shape", color: "#f59e0b", radius: 20 },
    "world-object:maintenance-frame": { renderMode: "mock-shape", color: "#94a3b8", radius: 26 },
    "world-object:calibration-frame": { renderMode: "mock-shape", color: "#38bdf8", radius: 32 },
    "world-object:access-transit-lock": { renderMode: "mock-shape", color: "#fbbf24", radius: 30 },
    "world-object:trigger": { renderMode: "hidden" }
};

export const DEFAULT_WORLD_OBJECT_MOCK_CATALOG = Object.freeze(
    Object.fromEntries(
        Object.entries(DEFAULT_DEFINITIONS).map(([id, definition]) => [id, Object.freeze({ id, ...definition })])
    )
);

export function worldObjectPresentation(catalog, presentationId) {
    return catalog[presentationId] ?? null;
}

function presentationSize(presentation) {
    const width = presentation?.size?.width ?? presentation?.radius * 2;
    const height = presentation?.size?.height ?? presentation?.radius * 2;
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
        throw new Error("world object presentation must define a positive size or radius");
    }
    return { width, height };
}

export function worldObjectLocalBounds(object, presentation) {
    const { width, height } = presentationSize(presentation);
    return anchoredRectangleBounds({ x: 0, y: 0 }, { width, height }, object.coordinateAnchor ?? "center");
}

export function worldObjectWorldBounds(object, presentation) {
    if (object.presentationBounds) return Object.freeze({ ...object.presentationBounds });
    const local = worldObjectLocalBounds(object, presentation);
    return Object.freeze({
        x: object.position.x + local.x,
        y: object.position.y + local.y,
        width: local.width,
        height: local.height
    });
}
