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
        barrier: triggerBounds(x - 32, y - 64, 64, 96),
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
    exit: point("sector-04-02:exit", 464, -1280),
    nextAreaId: "sector-04-03",
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
        point("sector-04-02:route-exit", 464, -1280)
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
        worldObject("sector-04-02:exit-panel", "gate-panel", 352, -1248, {
            coordinateAnchor: "bottom-center",
            interactionRadius,
            objectiveId: "sector-04-02:exit-panel-engaged",
            gateId: "sector-04-02:gate",
            requiredObjectiveIds: ["sector-04-02:final-deck-reached"]
        }),
        worldObject("sector-04-02:service-gate", "gate", 464, -1248, {
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
    gate: gate("sector-04-02:gate", 464, -1280, "sector-04-03", ["sector-04-02:exit-panel-engaged"], {
        portalBottomY: -1248
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

const area03 = defineArea({
    id: "sector-04-03",
    sectorId: "sector-04",
    order: 3,
    name: "FREIGHT BYPASS",
    subtitle: "CUTTER + TRANSIT WAKE",
    bounds: { width: 1472, height: 1472 },
    entry: point("sector-04-03:entry", -560, -32),
    exit: point("sector-04-03:exit", -80, -1440),
    nextAreaId: "sector-04-04",
    surfaces: [
        horizontalSurface("sector-04-03:p0", -560, 0, 320, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-04-03:p1", -336, -224, 288, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-04-03:r1", -240, -640, 256, 24, { kind: "recovery" }),
        horizontalSurface("sector-04-03:p2", 320, -864, 288, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-04-03:r2", 64, -1088, 224, 16, { kind: "recovery" }),
        horizontalSurface("sector-04-03:p4", -288, -1408, 416, 32, { kind: "safe-deck" }),
        grappleTarget("sector-04-03:a0-surface", -432, -128),
        grappleTarget("sector-04-03:w1-surface", -176, -384),
        grappleTarget("sector-04-03:w2-surface", 96, -544),
        grappleTarget("sector-04-03:w3-surface", 256, -736),
        grappleTarget("sector-04-03:a4-surface", 96, -992),
        grappleTarget("sector-04-03:a5-surface", -160, -1184),
        grappleTarget("sector-04-03:a6-surface", -320, -1312)
    ],
    routePoints: [
        point("sector-04-03:route-entry", -560, -32),
        point("sector-04-03:route-a0", -432, -128, { landmark: "A0" }),
        point("sector-04-03:route-w1", -176, -384, { landmark: "W1" }),
        point("sector-04-03:route-w2", 96, -544, { landmark: "W2" }),
        point("sector-04-03:route-w3", 256, -736, { landmark: "W3" }),
        point("sector-04-03:route-a4", 96, -992, { landmark: "A4" }),
        point("sector-04-03:route-a5", -160, -1184, { landmark: "A5" }),
        point("sector-04-03:route-a6", -320, -1312, { landmark: "A6" }),
        point("sector-04-03:route-exit", -80, -1440)
    ],
    recoveryPoints: [point("sector-04-03:recovery-r1", -240, -664), point("sector-04-03:recovery-r2", 64, -1112)],
    objects: [
        worldObject("sector-04-03:a0", "grapple-landmark", -432, -128, { label: "A0" }),
        worldObject("sector-04-03:w1", "grapple-landmark", -176, -384, { label: "W1" }),
        worldObject("sector-04-03:w2", "grapple-landmark", 96, -544, { label: "W2" }),
        worldObject("sector-04-03:w3", "grapple-landmark", 256, -736, { label: "W3" }),
        worldObject("sector-04-03:a4", "grapple-landmark", 96, -992, { label: "A4" }),
        worldObject("sector-04-03:a5", "grapple-landmark", -160, -1184, { label: "A5" }),
        worldObject("sector-04-03:a6", "grapple-landmark", -320, -1312, { label: "A6" }),
        worldObject("sector-04-03:cutter-sentry-01", "sentry", 448, -640, {
            enemyType: "sentry-t1",
            activation: triggerBounds(-128, -832, 704, 480),
            rules: ["cutter-fire", "target-lock-cycle", "activation-band-only"]
        }),
        worldObject("sector-04-03:exit-panel", "gate-panel", -208, -1408, {
            coordinateAnchor: "bottom-center",
            interactionRadius,
            objectiveId: "sector-04-03:exit-panel-engaged",
            gateId: "sector-04-03:gate",
            requiredObjectiveIds: ["sector-04-03:final-deck-reached"]
        }),
        worldObject("sector-04-03:service-gate", "gate", -80, -1408, {
            coordinateAnchor: "bottom-center",
            gateId: "sector-04-03:gate"
        })
    ],
    objectives: [
        {
            id: "sector-04-03:final-deck-reached",
            type: "reach",
            bounds: triggerBounds(-496, -1440, 416, 96)
        },
        {
            id: "sector-04-03:exit-panel-engaged",
            type: "interact",
            sourceObjectId: "sector-04-03:exit-panel",
            requiredObjectiveIds: ["sector-04-03:final-deck-reached"]
        }
    ],
    windZones: [
        {
            id: "sector-04-03:freight-wake",
            bounds: triggerBounds(-208, -832, 560, 544),
            direction: { x: 1, y: 0 },
            mode: "pulsed",
            strength: 360,
            cycle: { lull: 1.75, warning: 0.7, active: 1.4, decay: 0.3 }
        }
    ],
    gate: gate("sector-04-03:gate", -80, -1440, "sector-04-04", ["sector-04-03:exit-panel-engaged"], {
        portalBottomY: -1408
    }),
    storyTriggers: ["freight-entry", "wake-warning", "combined-commit", "decompression"],
    routes: ["safe", "flow", "recovery"],
    cameraZones: [
        cameraZone("entry-wake-read", -352, 0, 0.95, 0.72),
        cameraZone("combined-freight", -736, -352, 0.88, 0.7),
        cameraZone("cutter-exit", -992, -736, 0.9, 0.7),
        cameraZone("upper-decompression", -1184, -992, 0.95, 0.72),
        cameraZone("gate", -1472, -1184, 1, 0.72)
    ],
    cueIds: ["freight-bypass", "transit-wake", "cutter-fire"]
});

const area04 = defineArea({
    id: "sector-04-04",
    sectorId: "sector-04",
    order: 4,
    name: "INFRASTRUCTURE SERVICE NODE",
    subtitle: "REST / ROUTING PREVIEW",
    bounds: { width: 1152, height: 896 },
    entry: point("sector-04-04:entry", -352, -32),
    exit: point("sector-04-04:exit", 512, -864),
    nextAreaId: "sector-04-05",
    surfaces: [
        horizontalSurface("sector-04-04:p0", -352, 0, 320, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-04-04:p1", -160, -192, 320, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-04-04:p2", 0, -384, 448, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-04-04:r1", 192, -608, 256, 24, { kind: "recovery" }),
        horizontalSurface("sector-04-04:p3", -96, -736, 288, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-04-04:p4", 320, -832, 384, 32, { kind: "safe-deck" }),
        grappleTarget("sector-04-04:a1-surface", -256, -128),
        grappleTarget("sector-04-04:a2-surface", 128, -320),
        grappleTarget("sector-04-04:a3-surface", 224, -512),
        grappleTarget("sector-04-04:a4-surface", -32, -672),
        grappleTarget("sector-04-04:a5-surface", 160, -800)
    ],
    routePoints: [
        point("sector-04-04:route-entry", -352, -32),
        point("sector-04-04:route-a1", -256, -128, { landmark: "A1" }),
        point("sector-04-04:route-a2", 128, -320, { landmark: "A2" }),
        point("sector-04-04:route-a3", 224, -512, { landmark: "A3" }),
        point("sector-04-04:route-a4", -32, -672, { landmark: "A4" }),
        point("sector-04-04:route-a5", 160, -800, { landmark: "A5" }),
        point("sector-04-04:route-exit", 512, -864)
    ],
    recoveryPoints: [point("sector-04-04:recovery-r1", 192, -632)],
    objects: [
        worldObject("sector-04-04:a1", "grapple-landmark", -256, -128, { label: "A1" }),
        worldObject("sector-04-04:a2", "grapple-landmark", 128, -320, { label: "A2" }),
        worldObject("sector-04-04:a3", "grapple-landmark", 224, -512, { label: "A3" }),
        worldObject("sector-04-04:a4", "grapple-landmark", -32, -672, { label: "A4" }),
        worldObject("sector-04-04:a5", "grapple-landmark", 160, -800, { label: "A5" }),
        worldObject("sector-04-04:routing-status-display", "story-display", 176, -384, {
            cueIds: ["sector-04-04:service-node-online", "sector-04-04:lower-feeder-segmented"]
        }),
        worldObject("sector-04-04:exit-panel", "gate-panel", 400, -832, {
            coordinateAnchor: "bottom-center",
            interactionRadius,
            objectiveId: "sector-04-04:exit-panel-engaged",
            gateId: "sector-04-04:gate",
            requiredObjectiveIds: ["sector-04-04:final-deck-reached"]
        }),
        worldObject("sector-04-04:service-gate", "gate", 512, -832, {
            coordinateAnchor: "bottom-center",
            gateId: "sector-04-04:gate"
        })
    ],
    objectives: [
        {
            id: "sector-04-04:final-deck-reached",
            type: "reach",
            bounds: triggerBounds(128, -864, 384, 96)
        },
        {
            id: "sector-04-04:exit-panel-engaged",
            type: "interact",
            sourceObjectId: "sector-04-04:exit-panel",
            requiredObjectiveIds: ["sector-04-04:final-deck-reached"]
        }
    ],
    gate: gate("sector-04-04:gate", 512, -864, "sector-04-05", ["sector-04-04:exit-panel-engaged"], {
        portalBottomY: -832
    }),
    storyTriggers: ["service-node-online", "lower-feeder-segmented", "express-shaft-open"],
    routes: ["safe", "flow", "recovery"],
    cameraZones: [
        cameraZone("decompression", -224, 0, 1, 0.72),
        cameraZone("routing-overview", -512, -224, 0.95, 0.72),
        cameraZone("upper-service-spine", -800, -512, 0.95, 0.72),
        cameraZone("express-preview", -896, -800, 0.92, 0.7)
    ],
    cueIds: ["service-node-online", "lower-feeder-segmented", "express-shaft-open"]
});

const area05 = defineArea({
    id: "sector-04-05",
    sectorId: "sector-04",
    order: 5,
    name: "EXPRESS SHAFT",
    subtitle: "PURE MOVEMENT JOY",
    bounds: { width: 1216, height: 1536 },
    entry: point("sector-04-05:entry", -448, -32),
    exit: point("sector-04-05:exit", 528, -1504),
    nextAreaId: "sector-04-06",
    surfaces: [
        horizontalSurface("sector-04-05:p0", -448, 0, 320, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-04-05:p1", -288, -256, 320, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-04-05:r1", -256, -544, 224, 24, { kind: "recovery" }),
        horizontalSurface("sector-04-05:r2", 256, -768, 224, 24, { kind: "recovery" }),
        horizontalSurface("sector-04-05:r3", -256, -1024, 224, 24, { kind: "recovery" }),
        horizontalSurface("sector-04-05:r4", 256, -1280, 224, 24, { kind: "recovery" }),
        horizontalSurface("sector-04-05:p5", 320, -1472, 416, 32, { kind: "safe-deck" }),
        grappleTarget("sector-04-05:a0-surface", -320, -160),
        grappleTarget("sector-04-05:w1-surface", -96, -416),
        grappleTarget("sector-04-05:w2-surface", 96, -640),
        grappleTarget("sector-04-05:w3-surface", 96, -896),
        grappleTarget("sector-04-05:w4-surface", -96, -1152),
        grappleTarget("sector-04-05:w5-surface", 96, -1376)
    ],
    routePoints: [
        point("sector-04-05:route-entry", -448, -32),
        point("sector-04-05:route-a0", -320, -160, { landmark: "A0" }),
        point("sector-04-05:route-w1", -96, -416, { landmark: "W1" }),
        point("sector-04-05:route-w2", 96, -640, { landmark: "W2" }),
        point("sector-04-05:route-w3", 96, -896, { landmark: "W3" }),
        point("sector-04-05:route-w4", -96, -1152, { landmark: "W4" }),
        point("sector-04-05:route-w5", 96, -1376, { landmark: "W5" }),
        point("sector-04-05:route-exit", 528, -1504)
    ],
    recoveryPoints: [
        point("sector-04-05:recovery-r1", -256, -568),
        point("sector-04-05:recovery-r2", 256, -792),
        point("sector-04-05:recovery-r3", -256, -1048),
        point("sector-04-05:recovery-r4", 256, -1304)
    ],
    objects: [
        worldObject("sector-04-05:a0", "grapple-landmark", -320, -160, { label: "A0" }),
        worldObject("sector-04-05:w1", "grapple-landmark", -96, -416, { label: "W1" }),
        worldObject("sector-04-05:w2", "grapple-landmark", 96, -640, { label: "W2" }),
        worldObject("sector-04-05:w3", "grapple-landmark", 96, -896, { label: "W3" }),
        worldObject("sector-04-05:w4", "grapple-landmark", -96, -1152, { label: "W4" }),
        worldObject("sector-04-05:w5", "grapple-landmark", 96, -1376, { label: "W5" }),
        worldObject("sector-04-05:exit-panel", "gate-panel", 432, -1472, {
            coordinateAnchor: "bottom-center",
            interactionRadius,
            objectiveId: "sector-04-05:exit-panel-engaged",
            gateId: "sector-04-05:gate",
            requiredObjectiveIds: ["sector-04-05:final-deck-reached"]
        }),
        worldObject("sector-04-05:service-gate", "gate", 528, -1472, {
            coordinateAnchor: "bottom-center",
            gateId: "sector-04-05:gate"
        })
    ],
    objectives: [
        {
            id: "sector-04-05:final-deck-reached",
            type: "reach",
            bounds: triggerBounds(112, -1504, 416, 96)
        },
        {
            id: "sector-04-05:exit-panel-engaged",
            type: "interact",
            sourceObjectId: "sector-04-05:exit-panel",
            requiredObjectiveIds: ["sector-04-05:final-deck-reached"]
        }
    ],
    windZones: [
        {
            id: "sector-04-05:express-wake",
            bounds: triggerBounds(-192, -1408, 384, 1088),
            direction: { x: 0, y: -1 },
            mode: "pulsed",
            strength: 360,
            cycle: { lull: 1.75, warning: 0.7, active: 1.4, decay: 0.3 }
        }
    ],
    gate: gate("sector-04-05:gate", 528, -1504, "sector-04-06", ["sector-04-05:exit-panel-engaged"], {
        portalBottomY: -1472
    }),
    storyTriggers: ["express-shaft-entry", "pressure-assist-cycling", "upper-express-limited"],
    routes: ["safe", "flow", "recovery"],
    cameraZones: [
        cameraZone("shaft-reveal", -288, 0, 0.94, 0.7),
        cameraZone("lower-express", -544, -288, 0.88, 0.68),
        cameraZone("mid-express", -1056, -544, 0.86, 0.68),
        cameraZone("upper-express", -1408, -1056, 0.86, 0.68),
        cameraZone("exit", -1536, -1408, 0.96, 0.72)
    ],
    cueIds: ["express-shaft", "pressure-assist", "upper-express-limited"]
});

const area06 = defineArea({
    id: "sector-04-06",
    sectorId: "sector-04",
    order: 6,
    name: "POWER RELAY SPAN",
    subtitle: "ROPE LINE GEOMETRY COMBAT",
    bounds: { width: 1536, height: 1568 },
    entry: point("sector-04-06:entry", -480, -32),
    exit: point("sector-04-06:exit", -48, -1536),
    nextAreaId: "sector-04-07",
    surfaces: [
        horizontalSurface("sector-04-06:p0", -480, 0, 320, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-04-06:p1", -288, -256, 320, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-04-06:m0", 160, -768, 448, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-04-06:p3", 352, -1024, 288, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-04-06:r2", -320, -1312, 256, 24, { kind: "recovery" }),
        horizontalSurface("sector-04-06:p4", -256, -1504, 416, 32, { kind: "safe-deck" }),
        grappleTarget("sector-04-06:a0-surface", -352, -128),
        grappleTarget("sector-04-06:c1-surface", -96, -416),
        grappleTarget("sector-04-06:c2-surface", 256, -576),
        grappleTarget("sector-04-06:a3-surface", 320, -928),
        grappleTarget("sector-04-06:a4-surface", 160, -1120),
        grappleTarget("sector-04-06:a5-surface", -192, -1248)
    ],
    routePoints: [
        point("sector-04-06:route-entry", -480, -32),
        point("sector-04-06:route-a0", -352, -128, { landmark: "A0" }),
        point("sector-04-06:route-c1", -96, -416, { landmark: "C1" }),
        point("sector-04-06:route-c2", 256, -576, { landmark: "C2" }),
        point("sector-04-06:route-a3", 320, -928, { landmark: "A3" }),
        point("sector-04-06:route-a4", 160, -1120, { landmark: "A4" }),
        point("sector-04-06:route-a5", -192, -1248, { landmark: "A5" }),
        point("sector-04-06:route-exit", -48, -1536)
    ],
    recoveryPoints: [point("sector-04-06:recovery-r2", -320, -1336)],
    objects: [
        worldObject("sector-04-06:a0", "grapple-landmark", -352, -128, { label: "A0" }),
        worldObject("sector-04-06:c1", "grapple-landmark", -96, -416, { label: "C1" }),
        worldObject("sector-04-06:c2", "grapple-landmark", 256, -576, { label: "C2" }),
        worldObject("sector-04-06:a3", "grapple-landmark", 320, -928, { label: "A3" }),
        worldObject("sector-04-06:a4", "grapple-landmark", 160, -1120, { label: "A4" }),
        worldObject("sector-04-06:a5", "grapple-landmark", -192, -1248, { label: "A5" }),
        worldObject("sector-04-06:cutter-sentry-01", "sentry", 80, -496, {
            enemyType: "sentry-t1",
            activation: triggerBounds(-160, -704, 512, 352),
            rules: ["cutter-fire", "kill-optional", "target-lock-cycle", "activation-band-only"]
        }),
        worldObject("sector-04-06:patrol-drone-01", "patrol-drone", 208, -1184, {
            enemyType: "patrol-drone-t1",
            activation: triggerBounds(-448, -1280, 896, 224),
            patrol: {
                points: [
                    { x: -240, y: -1184 },
                    { x: 208, y: -1184 }
                ],
                speed: 48,
                waitSeconds: 0.45,
                mode: "pingpong"
            },
            rules: ["kill-optional", "no-rope-cut", "target-lock-cycle", "activation-band-only"]
        }),
        worldObject("sector-04-06:exit-panel", "gate-panel", -80, -1504, {
            coordinateAnchor: "bottom-center",
            interactionRadius,
            objectiveId: "sector-04-06:exit-panel-engaged",
            gateId: "sector-04-06:gate",
            requiredObjectiveIds: ["sector-04-06:final-deck-reached"]
        }),
        worldObject("sector-04-06:service-gate", "gate", -48, -1504, {
            coordinateAnchor: "bottom-center",
            gateId: "sector-04-06:gate"
        })
    ],
    objectives: [
        {
            id: "sector-04-06:final-deck-reached",
            type: "reach",
            bounds: triggerBounds(-464, -1536, 416, 96)
        },
        {
            id: "sector-04-06:exit-panel-engaged",
            type: "interact",
            sourceObjectId: "sector-04-06:exit-panel",
            requiredObjectiveIds: ["sector-04-06:final-deck-reached"]
        }
    ],
    gate: gate("sector-04-06:gate", -48, -1536, "sector-04-07", ["sector-04-06:exit-panel-engaged"], {
        portalBottomY: -1504
    }),
    storyTriggers: ["relay-entry", "redundant-channel-online", "junction-security-ahead"],
    routes: ["safe", "flow", "recovery"],
    cameraZones: [
        cameraZone("entry-cutter-read", -352, 0, 0.94, 0.7),
        cameraZone("lower-cutter-span", -704, -352, 0.9, 0.68),
        cameraZone("mid-reset", -1056, -704, 0.94, 0.7),
        cameraZone("patrol-span", -1280, -1056, 0.88, 0.68),
        cameraZone("exit", -1568, -1280, 1, 0.72)
    ],
    cueIds: ["power-relay-span", "redundant-channel", "routing-security-ahead"]
});

const area07 = defineArea({
    id: "sector-04-07",
    sectorId: "sector-04",
    order: 7,
    name: "ISOLATION JUNCTION",
    subtitle: "CUTTER + WAKE SYNTHESIS",
    bounds: { width: 1472, height: 1536 },
    entry: point("sector-04-07:entry", -480, -32),
    exit: point("sector-04-07:exit", 544, -1504),
    nextAreaId: "sector-04-08",
    surfaces: [
        horizontalSurface("sector-04-07:p0", -480, 0, 320, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-04-07:p1", -320, -256, 320, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-04-07:r1", 320, -512, 256, 24, { kind: "recovery" }),
        horizontalSurface("sector-04-07:r2", -320, -896, 256, 24, { kind: "recovery" }),
        horizontalSurface("sector-04-07:p3", -32, -1248, 512, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-04-07:p4", 352, -1472, 416, 32, { kind: "safe-deck" }),
        grappleTarget("sector-04-07:a0-surface", -352, -128),
        grappleTarget("sector-04-07:w1-surface", -160, -416),
        grappleTarget("sector-04-07:w2-surface", 160, -576),
        grappleTarget("sector-04-07:w3-surface", 160, -800),
        grappleTarget("sector-04-07:w4-surface", -160, -960),
        grappleTarget("sector-04-07:a5-surface", -96, -1152),
        grappleTarget("sector-04-07:a6-surface", 224, -1344)
    ],
    routePoints: [
        point("sector-04-07:route-entry", -480, -32),
        point("sector-04-07:route-a0", -352, -128, { landmark: "A0" }),
        point("sector-04-07:route-w1", -160, -416, { landmark: "W1" }),
        point("sector-04-07:route-w2", 160, -576, { landmark: "W2" }),
        point("sector-04-07:route-w3", 160, -800, { landmark: "W3" }),
        point("sector-04-07:route-w4", -160, -960, { landmark: "W4" }),
        point("sector-04-07:route-a5", -96, -1152, { landmark: "A5" }),
        point("sector-04-07:route-a6", 224, -1344, { landmark: "A6" }),
        point("sector-04-07:route-exit", 544, -1504)
    ],
    recoveryPoints: [point("sector-04-07:recovery-r1", 320, -536), point("sector-04-07:recovery-r2", -320, -920)],
    objects: [
        worldObject("sector-04-07:a0", "grapple-landmark", -352, -128, { label: "A0" }),
        worldObject("sector-04-07:w1", "grapple-landmark", -160, -416, { label: "W1" }),
        worldObject("sector-04-07:w2", "grapple-landmark", 160, -576, { label: "W2" }),
        worldObject("sector-04-07:w3", "grapple-landmark", 160, -800, { label: "W3" }),
        worldObject("sector-04-07:w4", "grapple-landmark", -160, -960, { label: "W4" }),
        worldObject("sector-04-07:a5", "grapple-landmark", -96, -1152, { label: "A5" }),
        worldObject("sector-04-07:a6", "grapple-landmark", 224, -1344, { label: "A6" }),
        worldObject("sector-04-07:cutter-sentry-01", "sentry", 480, -640, {
            enemyType: "sentry-t1",
            activation: triggerBounds(-240, -1008, 480, 624),
            rules: ["cutter-fire", "kill-optional", "target-lock-cycle", "activation-band-only"]
        }),
        worldObject("sector-04-07:routing-status-display", "story-display", -128, -256, {
            cueIds: ["sector-04-07:containment-routing-active"]
        }),
        worldObject("sector-04-07:feeder-status-display", "story-display", 96, -1248, {
            cueIds: ["sector-04-07:lower-feeder-isolated", "sector-04-07:route-telemetry-offline"]
        }),
        worldObject("sector-04-07:exit-panel", "gate-panel", 432, -1472, {
            coordinateAnchor: "bottom-center",
            interactionRadius,
            objectiveId: "sector-04-07:exit-panel-engaged",
            gateId: "sector-04-07:gate",
            requiredObjectiveIds: ["sector-04-07:final-deck-reached"]
        }),
        worldObject("sector-04-07:service-gate", "gate", 544, -1472, {
            coordinateAnchor: "bottom-center",
            gateId: "sector-04-07:gate"
        })
    ],
    objectives: [
        {
            id: "sector-04-07:final-deck-reached",
            type: "reach",
            bounds: triggerBounds(144, -1504, 416, 96)
        },
        {
            id: "sector-04-07:exit-panel-engaged",
            type: "interact",
            sourceObjectId: "sector-04-07:exit-panel",
            requiredObjectiveIds: ["sector-04-07:final-deck-reached"]
        }
    ],
    windZones: [
        {
            id: "sector-04-07:junction-wake",
            bounds: triggerBounds(-224, -1008, 448, 688),
            direction: { x: 1, y: 0 },
            mode: "pulsed",
            strength: 360,
            cycle: { lull: 1.75, warning: 0.7, active: 1.4, decay: 0.3 }
        }
    ],
    gate: gate("sector-04-07:gate", 544, -1504, "sector-04-08", ["sector-04-07:exit-panel-engaged"], {
        portalBottomY: -1472
    }),
    storyTriggers: ["junction-entry", "feeder-isolated", "trunk-access-ahead"],
    routes: ["safe", "flow", "recovery"],
    cameraZones: [
        cameraZone("junction-read", -320, 0, 0.96, 0.72),
        cameraZone("lower-assist", -704, -320, 0.89, 0.68),
        cameraZone("center-turn", -928, -704, 0.9, 0.68),
        cameraZone("upper-opposed-return", -1248, -928, 0.87, 0.68),
        cameraZone("story-deck", -1408, -1248, 1, 0.72),
        cameraZone("exit", -1536, -1408, 0.96, 0.72)
    ],
    cueIds: ["containment-routing", "lower-feeder-isolated", "route-telemetry-offline"]
});

const area08 = defineArea({
    id: "sector-04-08",
    sectorId: "sector-04",
    order: 8,
    name: "TRANSIT CONTROL TRUNK",
    subtitle: "GENERAL FINALE",
    bounds: { width: 1536, height: 1856 },
    entry: point("sector-04-08:entry", -448, -32),
    exit: point("sector-04-08:exit", 560, -1824),
    nextAreaId: null,
    surfaces: [
        horizontalSurface("sector-04-08:p0", -448, 0, 320, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-04-08:p1", -288, -288, 320, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-04-08:r1", -256, -832, 288, 24, { kind: "recovery" }),
        horizontalSurface("sector-04-08:p3", 320, -1088, 288, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-04-08:r2", -320, -1408, 288, 24, { kind: "recovery" }),
        horizontalSurface("sector-04-08:p6", 352, -1792, 544, 32, { kind: "safe-deck" }),
        grappleTarget("sector-04-08:a0-surface", -320, -160),
        grappleTarget("sector-04-08:c1-surface", -96, -448),
        grappleTarget("sector-04-08:c2-surface", 96, -736),
        grappleTarget("sector-04-08:w3-surface", -96, -960),
        grappleTarget("sector-04-08:a3-surface", 96, -1024),
        grappleTarget("sector-04-08:a4-surface", 96, -1216),
        grappleTarget("sector-04-08:a5-surface", -160, -1344),
        grappleTarget("sector-04-08:w6-surface", -96, -1536),
        grappleTarget("sector-04-08:a6-surface", 128, -1640)
    ],
    routePoints: [
        point("sector-04-08:route-entry", -448, -32),
        point("sector-04-08:route-a0", -320, -160, { landmark: "A0" }),
        point("sector-04-08:route-c1", -96, -448, { landmark: "C1" }),
        point("sector-04-08:route-c2", 96, -736, { landmark: "C2" }),
        point("sector-04-08:route-w3", -96, -960, { landmark: "W3" }),
        point("sector-04-08:route-a3", 96, -1024, { landmark: "A3" }),
        point("sector-04-08:route-a4", 96, -1216, { landmark: "A4" }),
        point("sector-04-08:route-a5", -160, -1344, { landmark: "A5" }),
        point("sector-04-08:route-w6", -96, -1536, { landmark: "W6" }),
        point("sector-04-08:route-a6", 128, -1640, { landmark: "A6" }),
        point("sector-04-08:route-exit", 560, -1824)
    ],
    recoveryPoints: [point("sector-04-08:recovery-r1", -256, -856), point("sector-04-08:recovery-r2", -320, -1432)],
    objects: [
        worldObject("sector-04-08:a0", "grapple-landmark", -320, -160, { label: "A0" }),
        worldObject("sector-04-08:c1", "grapple-landmark", -96, -448, { label: "C1" }),
        worldObject("sector-04-08:c2", "grapple-landmark", 96, -736, { label: "C2" }),
        worldObject("sector-04-08:w3", "grapple-landmark", -96, -960, { label: "W3" }),
        worldObject("sector-04-08:a3", "grapple-landmark", 96, -1024, { label: "A3" }),
        worldObject("sector-04-08:a4", "grapple-landmark", 96, -1216, { label: "A4" }),
        worldObject("sector-04-08:a5", "grapple-landmark", -160, -1344, { label: "A5" }),
        worldObject("sector-04-08:w6", "grapple-landmark", -96, -1536, { label: "W6" }),
        worldObject("sector-04-08:a6", "grapple-landmark", 128, -1640, { label: "A6" }),
        worldObject("sector-04-08:cutter-sentry-01", "sentry", 448, -640, {
            enemyType: "sentry-t1",
            activation: triggerBounds(-192, -800, 384, 400),
            rules: ["cutter-fire", "kill-optional", "target-lock-cycle", "activation-band-only"]
        }),
        worldObject("sector-04-08:patrol-drone-01", "patrol-drone", 176, -1280, {
            enemyType: "patrol-drone-t1",
            activation: triggerBounds(-208, -1392, 416, 240),
            patrol: {
                points: [
                    { x: -208, y: -1280 },
                    { x: 208, y: -1280 }
                ],
                speed: 48,
                waitSeconds: 0.45,
                mode: "pingpong"
            },
            rules: ["kill-optional", "no-rope-cut", "target-lock-cycle", "activation-band-only"]
        }),
        worldObject("sector-04-08:final-status-display", "story-display", 64, -1792, {
            cueIds: ["sector-04-08:upper-trunk-limited", "sector-04-08:lower-feeder-isolated"]
        }),
        worldObject("sector-04-08:post-sector-access", "story-display", 352, -1728, {
            cueIds: ["sector-04-08:transit-core-access-pending"]
        }),
        worldObject("sector-04-08:exit-panel", "gate-panel", 432, -1792, {
            coordinateAnchor: "bottom-center",
            interactionRadius,
            objectiveId: "sector-04-08:exit-panel-engaged",
            gateId: "sector-04-08:gate",
            requiredObjectiveIds: ["sector-04-08:final-deck-reached"]
        }),
        worldObject("sector-04-08:service-gate", "gate", 560, -1792, {
            coordinateAnchor: "bottom-center",
            gateId: "sector-04-08:gate"
        })
    ],
    objectives: [
        {
            id: "sector-04-08:final-deck-reached",
            type: "reach",
            bounds: triggerBounds(80, -1824, 544, 96)
        },
        {
            id: "sector-04-08:exit-panel-engaged",
            type: "interact",
            sourceObjectId: "sector-04-08:exit-panel",
            requiredObjectiveIds: ["sector-04-08:final-deck-reached"]
        }
    ],
    windZones: [
        {
            id: "sector-04-08:control-trunk-wake",
            bounds: triggerBounds(-192, -1664, 384, 1264),
            direction: { x: 0, y: -1 },
            mode: "pulsed",
            strength: 360,
            cycle: { lull: 1.75, warning: 0.7, active: 1.4, decay: 0.3 }
        }
    ],
    gate: gate("sector-04-08:gate", 560, -1824, null, ["sector-04-08:exit-panel-engaged"], {
        portalBottomY: -1792,
        completionMode: "content-boundary"
    }),
    storyTriggers: ["trunk-entry", "upper-trunk-limited", "final-status-juxtaposition"],
    routes: ["safe", "flow", "recovery"],
    cameraZones: [
        cameraZone("entry-scale", -384, 0, 0.93, 0.7),
        cameraZone("cutter-band", -800, -384, 0.88, 0.68),
        cameraZone("re-acceleration", -1152, -800, 0.9, 0.68),
        cameraZone("patrol-band", -1408, -1152, 0.87, 0.68),
        cameraZone("final-flow", -1664, -1408, 0.9, 0.7),
        cameraZone("final-deck", -1856, -1664, 1, 0.72)
    ],
    cueIds: ["control-trunk", "upper-trunk-limited", "lower-feeder-isolated", "transit-core-pending"]
});

export const SECTOR_04_AREA_CATALOG = defineAreaCatalog({
    id: "sector-04-authored-mock",
    revision: "sector-04-scenarios-rev1-v2",
    areas: [area01, area02, area03, area04, area05, area06, area07, area08]
});
