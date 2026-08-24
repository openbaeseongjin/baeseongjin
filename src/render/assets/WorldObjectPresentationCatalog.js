import { anchoredRectangleBounds } from "../../game/world/AuthoredCoordinateAnchor.js";
import { runtimeAssetUrl } from "./RuntimeAssetCatalog.js";

const STORY_DISPLAY_SIZE = Object.freeze({ width: 64, height: 48 });
const STORY_DISPLAY_SPRITE = Object.freeze({
    source: runtimeAssetUrl("objects", "story-display-universal", "story-display.png"),
    size: STORY_DISPLAY_SIZE
});
const EXIT_GATE_SIZE = Object.freeze({ width: 64, height: 64 });
const GATE_CONTROL_PANEL_SIZE = Object.freeze({ width: 48, height: 48 });

export const WORLD_OBJECT_SPRITE_STATE = Object.freeze({
    CLOSED: "closed",
    OPENED: "opened"
});

function statefulObjectSprites(assetId, fileByState, size) {
    return Object.freeze(
        Object.fromEntries(
            Object.entries(fileByState).map(([state, filePath]) => [
                state,
                Object.freeze({ source: runtimeAssetUrl("objects", assetId, filePath), size })
            ])
        )
    );
}

const EXIT_GATE_SPRITES = statefulObjectSprites(
    "exit-gate-universal",
    Object.freeze({
        [WORLD_OBJECT_SPRITE_STATE.CLOSED]: "gate-closed.png",
        [WORLD_OBJECT_SPRITE_STATE.OPENED]: "gate-opened.png"
    }),
    EXIT_GATE_SIZE
);
const GATE_CONTROL_PANEL_SPRITES = statefulObjectSprites(
    "gate-control-panel-universal",
    Object.freeze({
        [WORLD_OBJECT_SPRITE_STATE.CLOSED]: "panel-closed.png",
        [WORLD_OBJECT_SPRITE_STATE.OPENED]: "panel-opened.png"
    }),
    GATE_CONTROL_PANEL_SIZE
);

const DEFAULT_DEFINITIONS = {
    "world-object:grapple-landmark": { renderMode: "mock-shape", color: "#22d3ee", radius: 15 },
    "world-object:structural-grapple-joint": { renderMode: "mock-shape", color: "#64748b", radius: 10 },
    "world-object:terminal": { renderMode: "mock-shape", color: "#fbbf24", radius: 20 },
    "world-object:gate-panel": {
        renderMode: "mock-shape",
        color: "#fbbf24",
        radius: 18,
        size: GATE_CONTROL_PANEL_SIZE,
        sprites: GATE_CONTROL_PANEL_SPRITES
    },
    "world-object:gate": {
        renderMode: "mock-shape",
        color: "#fb7185",
        radius: 28,
        size: EXIT_GATE_SIZE,
        sprites: EXIT_GATE_SPRITES
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
    "world-object:story-display": {
        renderMode: "mock-shape",
        color: "#f59e0b",
        radius: 20,
        size: STORY_DISPLAY_SIZE,
        sprite: STORY_DISPLAY_SPRITE
    },
    "world-object:maintenance-frame": { renderMode: "mock-shape", color: "#94a3b8", radius: 26 },
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
