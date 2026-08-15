import {
    cameraZone,
    defineArea,
    defineAreaCatalog,
    gatePortalBounds,
    grappleTarget,
    point,
    rectangle,
    triggerBounds,
    worldObject
} from "../AreaDefinition.js";

const interactionRadius = 72;

function horizontalSurface(id, x, y, width, height = 32, properties = {}) {
    return rectangle(id, x, y, width, height, { ...properties, coordinateAnchor: "top-center" });
}

function gate(id, x, y, nextAreaId, requiredObjectiveIds, { portalBottomY = y, ...properties } = {}) {
    return Object.freeze({
        id,
        nextAreaId,
        requiredObjectiveIds: Object.freeze(requiredObjectiveIds),
        trigger: nextAreaId === null ? triggerBounds(x - 48, y - 96, 96, 160) : gatePortalBounds(x, portalBottomY),
        barrier: triggerBounds(x - 32, y - 96, 64, 128),
        ...properties
    });
}

const area01 = defineArea({
    id: "sector-04-01",
    sectorId: "sector-04",
    order: 1,
    name: "TRANSIT INTAKE",
    subtitle: "SPEED SPACE REVEAL",
    bounds: { width: 1600, height: 1376 },
    entry: point("sector-04-01:entry", -640, -32),
    exit: point("sector-04-01:exit", 672, -1344),
    nextAreaId: null,
    surfaces: [
        horizontalSurface("sector-04-01:p0", -560, 0, 352, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-04-01:r1", -192, -320, 192, 16, { kind: "recovery" }),
        horizontalSurface("sector-04-01:r2", 160, -512, 192, 16, { kind: "recovery" }),
        horizontalSurface("sector-04-01:m1", 96, -704, 256, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-04-01:r3", -160, -928, 192, 16, { kind: "recovery" }),
        horizontalSurface("sector-04-01:p4", 320, -1120, 288, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-04-01:p5", 480, -1312, 416, 32, { kind: "safe-deck" }),
        grappleTarget("sector-04-01:anchor-a1-surface", -352, -192),
        grappleTarget("sector-04-01:anchor-a2-surface", 0, -352),
        grappleTarget("sector-04-01:anchor-a3-surface", 288, -592),
        grappleTarget("sector-04-01:anchor-a4-surface", -64, -800),
        grappleTarget("sector-04-01:anchor-a5-surface", 192, -1056),
        grappleTarget("sector-04-01:anchor-a6-surface", 448, -1248)
    ],
    routePoints: [
        point("sector-04-01:route-entry", -640, -32),
        point("sector-04-01:route-a1", -352, -192, { landmark: "A1" }),
        point("sector-04-01:route-a2", 0, -352, { landmark: "A2" }),
        point("sector-04-01:route-a3", 288, -592, { landmark: "A3" }),
        point("sector-04-01:route-a4", -64, -800, { landmark: "A4" }),
        point("sector-04-01:route-a5", 192, -1056, { landmark: "A5" }),
        point("sector-04-01:route-a6", 448, -1248, { landmark: "A6" }),
        point("sector-04-01:route-exit", 672, -1344)
    ],
    recoveryPoints: [
        point("sector-04-01:recovery-r1", -192, -344),
        point("sector-04-01:recovery-r2", 160, -536),
        point("sector-04-01:recovery-r3", -160, -952)
    ],
    objects: [
        ...[
            [-352, -192],
            [0, -352],
            [288, -592],
            [-64, -800],
            [192, -1056],
            [448, -1248]
        ].map(([x, y], index) =>
            worldObject(`sector-04-01:anchor-a${index + 1}`, "grapple-landmark", x, y, {
                label: `A${index + 1}`
            })
        ),
        worldObject("sector-04-01:exit-panel", "gate-panel", 560, -1312, {
            coordinateAnchor: "bottom-center",
            interactionRadius,
            objectiveId: "sector-04-01:exit-panel-engaged",
            gateId: "sector-04-01:gate",
            requiredObjectiveIds: ["sector-04-01:final-deck-reached"]
        }),
        worldObject("sector-04-01:service-gate", "gate", 672, -1312, {
            coordinateAnchor: "bottom-center",
            gateId: "sector-04-01:gate"
        })
    ],
    objectives: [
        {
            id: "sector-04-01:final-deck-reached",
            type: "reach",
            bounds: triggerBounds(272, -1344, 416, 96)
        },
        {
            id: "sector-04-01:exit-panel-engaged",
            type: "interact",
            sourceObjectId: "sector-04-01:exit-panel",
            requiredObjectiveIds: ["sector-04-01:final-deck-reached"]
        }
    ],
    gate: gate("sector-04-01:gate", 672, -1344, null, ["sector-04-01:exit-panel-engaged"], {
        portalBottomY: -1312,
        completionMode: "content-boundary"
    }),
    storyTriggers: ["transit-backbone-status", "upper-express-status", "security-line-preview"],
    routes: ["safe", "flow", "recovery"],
    cameraZones: [
        cameraZone("intake-reveal", -224, 0, 0.95, 0.72),
        cameraZone("lower-long-span", -560, -224, 0.9, 0.7),
        cameraZone("cross-trunk", -864, -560, 0.88, 0.7),
        cameraZone("upper-relay", -1184, -864, 0.9, 0.7),
        cameraZone("exit", -1376, -1184, 1, 0.72)
    ],
    cueIds: ["transit-backbone", "speed-space", "upper-express-limited"]
});

export const SECTOR_04_AREA_CATALOG = defineAreaCatalog({
    id: "sector-04-authored-mock",
    revision: "sector-04-scenarios-rev1-v1",
    areas: [area01]
});
