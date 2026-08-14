const DEFAULT_DEFINITIONS = {
    "world-object:grapple-landmark": { renderMode: "mock-shape", color: "#22d3ee", radius: 15 },
    "world-object:terminal": { renderMode: "mock-shape", color: "#fbbf24", radius: 20 },
    "world-object:augment-node": { renderMode: "mock-shape", color: "#c084fc", radius: 24 },
    "world-object:gate": { renderMode: "mock-shape", color: "#fb7185", radius: 28 },
    "world-object:wind-source": { renderMode: "mock-shape", color: "#67e8f9", radius: 24 },
    "world-object:test-target": { renderMode: "mock-shape", color: "#a3e635", radius: 18 },
    "world-object:background-prop": { renderMode: "environment-decoration" },
    "world-object:checkpoint": { renderMode: "checkpoint" },
    "world-object:sentry": { renderMode: "combat-entity" },
    "world-object:patrol-drone": { renderMode: "combat-entity" },
    "world-object:story-display": { renderMode: "mock-shape", color: "#f59e0b", radius: 20 },
    "world-object:maintenance-frame": { renderMode: "mock-shape", color: "#94a3b8", radius: 26 },
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
