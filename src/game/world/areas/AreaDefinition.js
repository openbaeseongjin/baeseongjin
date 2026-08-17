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

export function objectTriggerSpec(anchor, width, height, offset = { x: 0, y: 0 }) {
    return freezeValue({
        anchor: anchor ?? "center",
        offset: Object.freeze({ x: offset.x ?? 0, y: offset.y ?? 0 }),
        size: Object.freeze({ width, height })
    });
}

export function resolveObjectTriggerBounds(position, spec) {
    const anchor = spec.anchor ?? "center";
    const { width, height } = spec.size;
    const base = anchoredRectangleBounds(position, spec.size, anchor);
    return triggerBounds(base.x + spec.offset.x, base.y + spec.offset.y, width, height);
}

export const GATE_PORTAL_APERTURE_SIZE = Object.freeze({ width: 52, height: 62 });

export function gatePortalBounds(x, bottomY) {
    return anchoredRectangleBounds({ x, y: bottomY }, GATE_PORTAL_APERTURE_SIZE, "bottom-center");
}

export function cameraZone(id, minY, maxY, desktopZoom, mobileZoom, properties = {}) {
    return freezeValue({ id, minY, maxY, desktopZoom, mobileZoom, ...properties });
}

export const EXIT_BLOCK_SPEC = Object.freeze({
    deckWidth: 320,
    deckHeight: 32,
    doorInsetFromDeckEnd: 32,
    panelInsetFromDoor: 112,
    routeExitInsetFromDoor: 64,
    exitHeightAboveDeck: 32,
    doorWidth: 64,
    doorHeight: 96,
    reachWidth: 320,
    reachHeight: 96,
    interactionRadius: 72
});

export function exitBlock({
    areaId,
    deckX,
    deckTopY,
    deckWidth = EXIT_BLOCK_SPEC.deckWidth,
    nextAreaId,
    panelObjectiveId,
    gateId = `${areaId}:gate`,
    completionMode,
    panelProperties = {},
    gateProperties = {}
}) {
    const spec = EXIT_BLOCK_SPEC;
    const rightEnd = deckX + deckWidth * 0.5;
    const doorX = rightEnd - spec.doorInsetFromDeckEnd;
    const deck = rectangle(`${areaId}:exit-deck`, deckX, deckTopY, deckWidth, spec.deckHeight, {
        kind: "safe-deck",
        coordinateAnchor: "top-center"
    });
    const exit = point(`${areaId}:exit`, doorX, deckTopY - spec.exitHeightAboveDeck);
    const gate = freezeValue({
        id: gateId,
        nextAreaId,
        requiredObjectiveIds: Object.freeze([panelObjectiveId]),
        trigger:
            nextAreaId === null
                ? triggerBounds(doorX - 48, deckTopY - 128, 96, 160)
                : gatePortalBounds(doorX, deckTopY),
        ...(completionMode !== undefined ? { completionMode } : {}),
        ...gateProperties
    });
    return freezeValue({
        deck,
        exit,
        routeExit: point(
            `${areaId}:route-exit`,
            doorX - spec.routeExitInsetFromDoor,
            deckTopY - spec.exitHeightAboveDeck
        ),
        panel: worldObject(`${areaId}:exit-panel`, "gate-panel", doorX - spec.panelInsetFromDoor, deckTopY, {
            coordinateAnchor: "bottom-center",
            interactionRadius: spec.interactionRadius,
            objectiveId: panelObjectiveId,
            gateId,
            ...panelProperties
        }),
        gateVisual: worldObject(`${areaId}:exit-gate`, "gate", doorX, deckTopY, {
            coordinateAnchor: "bottom-center",
            gateId,
            ...gateProperties
        }),
        reachBounds: triggerBounds(
            deckX - spec.reachWidth * 0.5,
            deckTopY - spec.exitHeightAboveDeck,
            spec.reachWidth,
            spec.reachHeight
        ),
        gate
    });
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
        scannerGroups: [],
        // Scenario-planning inventory only. The assembler intentionally does not expose this as runtime state.
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
