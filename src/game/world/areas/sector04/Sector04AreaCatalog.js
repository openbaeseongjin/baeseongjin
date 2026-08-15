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
    nextAreaId: "sector-04-02",
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
    gate: gate("sector-04-01:gate", 672, -1344, "sector-04-02", ["sector-04-01:exit-panel-engaged"], {
        portalBottomY: -1312
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

const area02 = defineArea({
    id: "sector-04-02",
    sectorId: "sector-04",
    order: 2,
    name: "CUTTER LINE",
    subtitle: "FIRST ROPE INTERRUPTION",
    bounds: { width: 1280, height: 1312 },
    entry: point("sector-04-02:entry", -480, -32),
    exit: point("sector-04-02:exit", 576, -1280),
    nextAreaId: null,
    surfaces: [
        horizontalSurface("sector-04-02:p0", -480, 0, 320, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-04-02:p1", -256, -192, 320, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-04-02:r1", -288, -576, 256, 24, { kind: "recovery" }),
        horizontalSurface("sector-04-02:p2", -224, -800, 288, 24, { kind: "recovery" }),
        horizontalSurface("sector-04-02:p3", 224, -1056, 224, 16, { kind: "recovery" }),
        horizontalSurface("sector-04-02:p4", 256, -1248, 416, 32, { kind: "safe-deck" }),
        grappleTarget("sector-04-02:a0-surface", -352, -128),
        grappleTarget("sector-04-02:c1-surface", 32, -448),
        grappleTarget("sector-04-02:c2-surface", -32, -621),
        grappleTarget("sector-04-02:a3-surface", 64, -992),
        grappleTarget("sector-04-02:a4-surface", 64, -1168)
    ],
    routePoints: [
        point("sector-04-02:route-entry", -480, -32),
        point("sector-04-02:route-a0", -352, -128, { landmark: "A0" }),
        point("sector-04-02:route-c1", 32, -448, { landmark: "C1" }),
        point("sector-04-02:route-c2", -32, -621, { landmark: "C2" }),
        point("sector-04-02:route-a3", 64, -992, { landmark: "A3" }),
        point("sector-04-02:route-a4", 64, -1168, { landmark: "A4" }),
        point("sector-04-02:route-exit", 576, -1280)
    ],
    recoveryPoints: [point("sector-04-02:recovery-r1", -288, -600), point("sector-04-02:recovery-p2", -224, -824)],
    objects: [
        worldObject("sector-04-02:a0", "grapple-landmark", -352, -128, { label: "A0" }),
        worldObject("sector-04-02:c1", "grapple-landmark", 32, -448, { label: "C1" }),
        worldObject("sector-04-02:c2", "grapple-landmark", -32, -621, { label: "C2" }),
        worldObject("sector-04-02:a3", "grapple-landmark", 64, -992, { label: "A3" }),
        worldObject("sector-04-02:a4", "grapple-landmark", 64, -1168, { label: "A4" }),
        worldObject("sector-04-02:cutter-sentry-01", "sentry", 92, -501, {
            enemyType: "sentry-t1",
            activation: triggerBounds(-96, -880, 352, 640),
            rules: ["cutter-fire", "target-lock-cycle", "activation-band-only"]
        }),
        worldObject("sector-04-02:exit-panel", "gate-panel", 448, -1248, {
            coordinateAnchor: "bottom-center",
            interactionRadius,
            objectiveId: "sector-04-02:exit-panel-engaged",
            gateId: "sector-04-02:gate",
            requiredObjectiveIds: ["sector-04-02:final-deck-reached"]
        }),
        worldObject("sector-04-02:service-gate", "gate", 576, -1248, {
            coordinateAnchor: "bottom-center",
            gateId: "sector-04-02:gate"
        })
    ],
    objectives: [
        {
            id: "sector-04-02:final-deck-reached",
            type: "reach",
            bounds: triggerBounds(48, -1280, 416, 96)
        },
        {
            id: "sector-04-02:exit-panel-engaged",
            type: "interact",
            sourceObjectId: "sector-04-02:exit-panel",
            requiredObjectiveIds: ["sector-04-02:final-deck-reached"]
        }
    ],
    gate: gate("sector-04-02:gate", 576, -1280, null, ["sector-04-02:exit-panel-engaged"], {
        portalBottomY: -1248,
        completionMode: "content-boundary"
    }),
    storyTriggers: ["cutter-line-entry", "cutter-read", "cutter-recovery"],
    routes: ["safe", "flow", "recovery"],
    cameraZones: [
        cameraZone("entry", -224, 0, 1, 0.72),
        cameraZone("cutter-read", -608, -224, 0.92, 0.7),
        cameraZone("second-cutter", -864, -608, 0.92, 0.7),
        cameraZone("exit-flow", -1184, -864, 0.95, 0.72),
        cameraZone("gate", -1312, -1184, 1, 0.72)
    ],
    cueIds: ["cutter-line", "cutter-fire", "first-rope-interruption"]
});

export const SECTOR_04_AREA_CATALOG = defineAreaCatalog({
    id: "sector-04-authored-mock",
    revision: "sector-04-scenarios-rev1-v1",
    areas: [area01, area02]
});
