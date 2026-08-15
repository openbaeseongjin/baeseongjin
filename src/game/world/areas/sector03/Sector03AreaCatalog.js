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

const SCANNER_CYCLE = Object.freeze({ available: 1.5, warning: 0.6, locked: 1.1, reset: 0.3 });
const DRONE_RULES = Object.freeze(["kill-optional", "no-rope-cut", "target-lock-cycle", "activation-band-only"]);

function horizontalSurface(id, x, y, width, height = 32, properties = {}) {
    return rectangle(id, x, y, width, height, { ...properties, coordinateAnchor: "top-center" });
}

function scannerGroup(id, controlledSurfaceIds) {
    return Object.freeze({ id, cycle: SCANNER_CYCLE, phaseOffsetSeconds: 0, controlledSurfaceIds });
}

function patrolDrone(id, x, y, start, end, activation, rules = DRONE_RULES) {
    return worldObject(id, "patrol-drone", x, y, {
        enemyType: "patrol-drone-t1",
        activation: triggerBounds(activation.x, activation.y, activation.width, activation.height),
        patrol: { points: [start, end], speed: 48, waitSeconds: 0.45, mode: "pingpong" },
        rules
    });
}

function gate(id, x, y, nextAreaId, requiredObjectiveIds, { portalBottomY = y } = {}) {
    return Object.freeze({
        id,
        nextAreaId,
        requiredObjectiveIds: Object.freeze(requiredObjectiveIds),
        trigger: nextAreaId === null ? triggerBounds(x - 48, y - 96, 96, 160) : gatePortalBounds(x, portalBottomY),
        barrier: triggerBounds(x - 32, y - 96, 64, 128),
        ...(nextAreaId === null ? { completionMode: "content-boundary" } : {})
    });
}

const area01 = defineArea({
    id: "sector-03-01",
    sectorId: "sector-03",
    order: 1,
    name: "POWERED PROMENADE",
    subtitle: "COMMERCIAL THRESHOLD",
    bounds: { width: 1280, height: 1088 },
    entry: point("sector-03-01:entry", -432, -32),
    exit: point("sector-03-01:exit", 400, -1056),
    nextAreaId: "sector-03-02",
    surfaces: [
        horizontalSurface("sector-03-01:p0", -432, 0, 224, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-03-01:p1", -320, -160, 320, 32, { kind: "safe-deck" }),
        grappleTarget("sector-03-01:g1-surface", -320, -256),
        horizontalSurface("sector-03-01:p2", -96, -352, 384, 32, { kind: "safe-deck" }),
        grappleTarget("sector-03-01:g2-surface", -32, -448),
        horizontalSurface("sector-03-01:p3", -80, -576, 288, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-03-01:r1", 288, -608, 256, 24, { kind: "recovery" }),
        grappleTarget("sector-03-01:g3-surface", 96, -672),
        grappleTarget("sector-03-01:g4-surface", -96, -800),
        horizontalSurface("sector-03-01:p4", -96, -864, 320, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-03-01:r2", 352, -864, 256, 24, { kind: "recovery" }),
        grappleTarget("sector-03-01:g5-surface", 128, -960),
        horizontalSurface("sector-03-01:p5", 336, -1024, 288, 32, { kind: "safe-deck" })
    ],
    routePoints: [
        point("sector-03-01:route-entry", -432, -32),
        point("sector-03-01:route-g1", -320, -256, { landmark: "G1" }),
        point("sector-03-01:route-g2", -32, -448, { landmark: "G2" }),
        point("sector-03-01:route-g3", 96, -672, { landmark: "G3" }),
        point("sector-03-01:route-g4", -96, -800, { landmark: "G4" }),
        point("sector-03-01:route-g5", 128, -960, { landmark: "G5" }),
        point("sector-03-01:route-exit", 480, -1088)
    ],
    recoveryPoints: [point("sector-03-01:recovery-r1", 288, -632), point("sector-03-01:recovery-r2", 352, -888)],
    objects: [
        ...[
            ["g1", -320, -256, "G1"],
            ["g2", -32, -448, "G2"],
            ["g3", 96, -672, "G3"],
            ["g4", -96, -800, "G4"],
            ["g5", 128, -960, "G5"]
        ].map(([id, x, y, label]) => worldObject(`sector-03-01:${id}`, "grapple-landmark", x, y, { label })),
        worldObject("sector-03-01:district-sign", "story-display", -320, -184, {
            cueIds: ["sector-03-01:district-sign"]
        }),
        worldObject("sector-03-01:welcome-kiosk", "story-display", -416, -184, {
            cueIds: ["sector-03-01:welcome-kiosk"]
        }),
        worldObject("sector-03-01:exit-panel", "gate-panel", 272, -1024, {
            coordinateAnchor: "bottom-center",
            interactionRadius,
            objectiveId: "sector-03-01:exit-panel-engaged",
            gateId: "sector-03-01:gate",
            requiredObjectiveIds: ["sector-03-01:final-deck-reached"]
        }),
        worldObject("sector-03-01:service-gate", "gate", 400, -1024, {
            coordinateAnchor: "bottom-center",
            gateId: "sector-03-01:gate"
        })
    ],
    objectives: [
        { id: "sector-03-01:final-deck-reached", type: "reach", bounds: triggerBounds(192, -1056, 288, 96) },
        {
            id: "sector-03-01:exit-panel-engaged",
            type: "interact",
            sourceObjectId: "sector-03-01:exit-panel",
            requiredObjectiveIds: ["sector-03-01:final-deck-reached"]
        }
    ],
    gate: gate("sector-03-01:gate", 400, -1056, "sector-03-02", ["sector-03-01:exit-panel-engaged"], {
        portalBottomY: -1024
    }),
    storyTriggers: ["district-sign", "powered-environment", "automated-welcome"],
    routes: ["safe", "flow", "recovery"],
    cueIds: ["powered-promenade", "commercial-threshold"]
});

const area02 = defineArea({
    id: "sector-03-02",
    sectorId: "sector-03",
    order: 2,
    name: "SCANNER GALLERY",
    subtitle: "FIRST ACCESS SCAN",
    bounds: { width: 1280, height: 1184 },
    entry: point("sector-03-02:entry", -432, -32),
    exit: point("sector-03-02:exit", 432, -1152),
    nextAreaId: "sector-03-03",
    surfaces: [
        horizontalSurface("sector-03-02:p0", -432, 0, 224, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-03-02:p1", -304, -160, 352, 32, { kind: "safe-deck" }),
        grappleTarget("sector-03-02:g1-surface", -320, -256),
        grappleTarget("sector-03-02:c1-surface", -64, -320),
        horizontalSurface("sector-03-02:p2", 64, -416, 320, 32, { kind: "safe-deck" }),
        grappleTarget("sector-03-02:c2-surface", 160, -544),
        horizontalSurface("sector-03-02:p3", 64, -640, 320, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-03-02:r1", 416, -672, 256, 24, { kind: "recovery" }),
        grappleTarget("sector-03-02:c3-surface", 96, -768),
        grappleTarget("sector-03-02:g4-surface", -128, -864),
        horizontalSurface("sector-03-02:p4", -96, -928, 320, 32, { kind: "safe-deck" }),
        grappleTarget("sector-03-02:g5-surface", 128, -1024),
        horizontalSurface("sector-03-02:p5", 368, -1120, 288, 32, { kind: "safe-deck" })
    ],
    routePoints: [
        point("sector-03-02:route-entry", -432, -32),
        point("sector-03-02:route-g1", -320, -256, { landmark: "G1" }),
        point("sector-03-02:route-c1", -64, -320, { landmark: "C1" }),
        point("sector-03-02:route-c2", 160, -544, { landmark: "C2" }),
        point("sector-03-02:route-c3", 96, -768, { landmark: "C3" }),
        point("sector-03-02:route-g4", -128, -864, { landmark: "G4" }),
        point("sector-03-02:route-g5", 128, -1024, { landmark: "G5" }),
        point("sector-03-02:route-exit", 480, -1184)
    ],
    recoveryPoints: [point("sector-03-02:recovery-r1", 416, -696)],
    objects: [
        ...[
            ["g1", -320, -256, "G1"],
            ["c1", -64, -320, "C1"],
            ["c2", 160, -544, "C2"],
            ["c3", 96, -768, "C3"],
            ["g4", -128, -864, "G4"],
            ["g5", 128, -1024, "G5"]
        ].map(([id, x, y, label]) => worldObject(`sector-03-02:${id}`, "grapple-landmark", x, y, { label })),
        worldObject("sector-03-02:scanner-housing-h1", "background-prop", 480, -624, { gameplay: false }),
        worldObject("sector-03-02:access-control", "story-display", -304, -184, {
            cueIds: ["sector-03-02:access-control"]
        }),
        worldObject("sector-03-02:service-mount", "story-display", 64, -440, {
            cueIds: ["sector-03-02:service-mount"]
        }),
        worldObject("sector-03-02:retail-security-ahead", "story-display", 368, -1144, {
            cueIds: ["sector-03-02:retail-security-ahead"]
        }),
        worldObject("sector-03-02:exit-panel", "gate-panel", 304, -1120, {
            coordinateAnchor: "bottom-center",
            interactionRadius,
            objectiveId: "sector-03-02:exit-panel-engaged",
            gateId: "sector-03-02:gate",
            requiredObjectiveIds: ["sector-03-02:final-deck-reached"]
        }),
        worldObject("sector-03-02:service-gate", "gate", 432, -1120, {
            coordinateAnchor: "bottom-center",
            gateId: "sector-03-02:gate"
        })
    ],
    objectives: [
        { id: "sector-03-02:final-deck-reached", type: "reach", bounds: triggerBounds(224, -1152, 288, 96) },
        {
            id: "sector-03-02:exit-panel-engaged",
            type: "interact",
            sourceObjectId: "sector-03-02:exit-panel",
            requiredObjectiveIds: ["sector-03-02:final-deck-reached"]
        }
    ],
    scannerGroups: [
        scannerGroup("sector-03-02:scanner-A", [
            "sector-03-02:c1-surface",
            "sector-03-02:c2-surface",
            "sector-03-02:c3-surface"
        ])
    ],
    gate: gate("sector-03-02:gate", 432, -1152, "sector-03-03", ["sector-03-02:exit-panel-engaged"], {
        portalBottomY: -1120
    }),
    storyTriggers: ["scanner-gallery-entry", "access-denied", "scanner-learned"],
    routes: ["safe", "flow", "recovery"],
    cueIds: ["scanner-gallery", "access-scan-field"]
});

const area03 = defineArea({
    id: "sector-03-03",
    sectorId: "sector-03",
    order: 3,
    name: "RETAIL SECURITY WALK",
    subtitle: "SCANNER + PATROL",
    bounds: { width: 1280, height: 1184 },
    entry: point("sector-03-03:entry", -432, -32),
    exit: point("sector-03-03:exit", 432, -1184),
    nextAreaId: "sector-03-04",
    surfaces: [
        horizontalSurface("sector-03-03:p0", -432, 0, 224, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-03-03:p1", -320, -160, 320, 32, { kind: "safe-deck" }),
        grappleTarget("sector-03-03:c1-surface", -96, -288),
        horizontalSurface("sector-03-03:s2", -48, -416, 352, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-03-03:r1", 384, -416, 256, 24, { kind: "recovery" }),
        grappleTarget("sector-03-03:c2-surface", 128, -640),
        grappleTarget("sector-03-03:g3-surface", 0, -800),
        horizontalSurface("sector-03-03:p3", 0, -864, 320, 32, { kind: "safe-deck" }),
        grappleTarget("sector-03-03:g4-surface", 192, -960),
        horizontalSurface("sector-03-03:p4", 304, -1024, 288, 32, { kind: "safe-deck" }),
        grappleTarget("sector-03-03:g5-surface", 96, -1104),
        horizontalSurface("sector-03-03:p5", 368, -1152, 288, 32, { kind: "safe-deck" })
    ],
    routePoints: [
        point("sector-03-03:route-entry", -432, -32),
        point("sector-03-03:route-c1", -96, -288, { landmark: "C1" }),
        point("sector-03-03:route-c2", 128, -640, { landmark: "C2" }),
        point("sector-03-03:route-g3", 0, -800, { landmark: "G3" }),
        point("sector-03-03:route-g4", 192, -960, { landmark: "G4" }),
        point("sector-03-03:route-g5", 96, -1104, { landmark: "G5" }),
        point("sector-03-03:route-exit", 544, -1184)
    ],
    recoveryPoints: [point("sector-03-03:recovery-r1", 384, -440)],
    objects: [
        ...[
            ["c1", -96, -288, "C1"],
            ["c2", 128, -640, "C2"],
            ["g3", 0, -800, "G3"],
            ["g4", 192, -960, "G4"],
            ["g5", 96, -1104, "G5"]
        ].map(([id, x, y, label]) => worldObject(`sector-03-03:${id}`, "grapple-landmark", x, y, { label })),
        patrolDrone(
            "sector-03-03:drone-1",
            -256,
            -560,
            { x: -256, y: -560 },
            { x: 256, y: -560 },
            { x: -512, y: -768, width: 1024, height: 320 }
        ),
        worldObject("sector-03-03:retail-security", "story-display", -320, -184, {
            cueIds: ["sector-03-03:retail-security"]
        }),
        worldObject("sector-03-03:route-state", "story-display", -48, -440, {
            cueIds: ["sector-03-03:route-state"]
        }),
        worldObject("sector-03-03:patrol-status", "story-display", 48, -440, {
            cueIds: ["sector-03-03:patrol-status"]
        }),
        worldObject("sector-03-03:service-arcade-next", "story-display", 368, -1176, {
            cueIds: ["sector-03-03:service-arcade-next"]
        }),
        worldObject("sector-03-03:exit-panel", "gate-panel", 304, -1152, {
            coordinateAnchor: "bottom-center",
            interactionRadius,
            objectiveId: "sector-03-03:exit-panel-engaged",
            gateId: "sector-03-03:gate",
            requiredObjectiveIds: ["sector-03-03:final-deck-reached"]
        }),
        worldObject("sector-03-03:service-gate", "gate", 432, -1152, {
            coordinateAnchor: "bottom-center",
            gateId: "sector-03-03:gate"
        })
    ],
    objectives: [
        { id: "sector-03-03:final-deck-reached", type: "reach", bounds: triggerBounds(224, -1184, 288, 96) },
        {
            id: "sector-03-03:exit-panel-engaged",
            type: "interact",
            sourceObjectId: "sector-03-03:exit-panel",
            requiredObjectiveIds: ["sector-03-03:final-deck-reached"]
        }
    ],
    scannerGroups: [
        scannerGroup("sector-03-03:scanner-retail-A", ["sector-03-03:c1-surface", "sector-03-03:c2-surface"])
    ],
    gate: gate("sector-03-03:gate", 432, -1184, "sector-03-04", ["sector-03-03:exit-panel-engaged"], {
        portalBottomY: -1152
    }),
    storyTriggers: ["retail-security", "scanner-reminder", "patrol-reveal"],
    routes: ["safe", "flow", "recovery"],
    cueIds: ["retail-security-walk", "scanner-patrol-synthesis"]
});

const area04 = defineArea({
    id: "sector-03-04",
    sectorId: "sector-03",
    order: 4,
    name: "SERVICE ARCADE",
    subtitle: "PUBLIC VS SERVICE",
    bounds: { width: 1280, height: 1216 },
    entry: point("sector-03-04:entry", -440, -32),
    exit: point("sector-03-04:exit", 448, -1216),
    nextAreaId: "sector-03-05",
    surfaces: [
        horizontalSurface("sector-03-04:p0", -440, 0, 240, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-03-04:p1", -272, -160, 352, 32, { kind: "safe-deck" }),
        grappleTarget("sector-03-04:c1-surface", -288, -320),
        horizontalSurface("sector-03-04:pu1", -320, -448, 384, 32, { kind: "safe-deck" }),
        grappleTarget("sector-03-04:c2-surface", -160, -608),
        horizontalSurface("sector-03-04:pu2", -272, -736, 352, 32, { kind: "safe-deck" }),
        grappleTarget("sector-03-04:s0-surface", 32, -256),
        grappleTarget("sector-03-04:gs1-surface", 320, -384),
        horizontalSurface("sector-03-04:sv1", 432, -512, 160, 24, { kind: "recovery" }),
        horizontalSurface("sector-03-04:x1", 96, -512, 128, 32, { kind: "safe-deck" }),
        grappleTarget("sector-03-04:gs2-surface", 320, -640),
        horizontalSurface("sector-03-04:sv2", 432, -736, 160, 24, { kind: "recovery" }),
        horizontalSurface("sector-03-04:m1", 96, -832, 384, 32, { kind: "safe-deck" }),
        grappleTarget("sector-03-04:g5-surface", 64, -960),
        horizontalSurface("sector-03-04:p4", 32, -1024, 320, 32, { kind: "safe-deck" }),
        grappleTarget("sector-03-04:g6-surface", 256, -1120),
        horizontalSurface("sector-03-04:p5", 384, -1184, 320, 32, { kind: "safe-deck" })
    ],
    routePoints: [
        point("sector-03-04:route-entry", -440, -32),
        point("sector-03-04:route-c1", -288, -320, { landmark: "C1" }),
        point("sector-03-04:route-c2", -160, -608, { landmark: "C2" }),
        point("sector-03-04:route-s0", 32, -256, { landmark: "S0" }),
        point("sector-03-04:route-gs1", 320, -384, { landmark: "GS1" }),
        point("sector-03-04:route-gs2", 320, -640, { landmark: "GS2" }),
        point("sector-03-04:route-g5", 64, -960, { landmark: "G5" }),
        point("sector-03-04:route-g6", 256, -1120, { landmark: "G6" }),
        point("sector-03-04:route-exit", 576, -1216)
    ],
    recoveryPoints: [point("sector-03-04:recovery-sv1", 432, -536), point("sector-03-04:recovery-sv2", 432, -760)],
    objects: [
        ...[
            ["c1", -288, -320, "C1"],
            ["c2", -160, -608, "C2"],
            ["s0", 32, -256, "S0"],
            ["gs1", 320, -384, "GS1"],
            ["gs2", 320, -640, "GS2"],
            ["g5", 64, -960, "G5"],
            ["g6", 256, -1120, "G6"]
        ].map(([id, x, y, label]) => worldObject(`sector-03-04:${id}`, "grapple-landmark", x, y, { label })),
        patrolDrone(
            "sector-03-04:drone-1",
            -384,
            -576,
            { x: -384, y: -576 },
            { x: -64, y: -576 },
            { x: -608, y: -704, width: 624, height: 224 }
        ),
        worldObject("sector-03-04:route-split", "story-display", -272, -184, {
            cueIds: ["sector-03-04:route-split"]
        }),
        worldObject("sector-03-04:public-route", "story-display", -320, -472, {
            cueIds: ["sector-03-04:public-route"]
        }),
        worldObject("sector-03-04:service-route", "story-display", 432, -536, {
            cueIds: ["sector-03-04:service-route"]
        }),
        worldObject("sector-03-04:service-node-upper", "story-display", 96, -856, {
            cueIds: ["sector-03-04:service-node-upper"]
        }),
        worldObject("sector-03-04:exit-panel", "gate-panel", 320, -1184, {
            coordinateAnchor: "bottom-center",
            interactionRadius,
            objectiveId: "sector-03-04:exit-panel-engaged",
            gateId: "sector-03-04:gate",
            requiredObjectiveIds: ["sector-03-04:final-deck-reached"]
        }),
        worldObject("sector-03-04:service-gate", "gate", 448, -1184, {
            coordinateAnchor: "bottom-center",
            gateId: "sector-03-04:gate"
        })
    ],
    objectives: [
        { id: "sector-03-04:final-deck-reached", type: "reach", bounds: triggerBounds(224, -1216, 320, 96) },
        {
            id: "sector-03-04:exit-panel-engaged",
            type: "interact",
            sourceObjectId: "sector-03-04:exit-panel",
            requiredObjectiveIds: ["sector-03-04:final-deck-reached"]
        }
    ],
    scannerGroups: [
        scannerGroup("sector-03-04:scanner-service-arcade-public", [
            "sector-03-04:c1-surface",
            "sector-03-04:c2-surface"
        ])
    ],
    gate: gate("sector-03-04:gate", 448, -1216, "sector-03-05", ["sector-03-04:exit-panel-engaged"], {
        portalBottomY: -1184
    }),
    storyTriggers: ["service-arcade", "public-vs-service", "maintenance-local-only"],
    routes: ["public", "service", "recovery"],
    cueIds: ["service-arcade", "route-identity"]
});

const area05 = defineArea({
    id: "sector-03-05",
    sectorId: "sector-03",
    order: 5,
    name: "COMMERCIAL SERVICE NODE",
    subtitle: "REST / DIAGNOSTIC",
    bounds: { width: 960, height: 688 },
    entry: point("sector-03-05:entry", -240, -32),
    exit: point("sector-03-05:exit", 352, -688),
    nextAreaId: "sector-03-06",
    surfaces: [
        horizontalSurface("sector-03-05:p0", -240, 0, 224, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-03-05:p1", -96, -128, 448, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-03-05:p2", 0, -288, 448, 32, { kind: "safe-deck" }),
        grappleTarget("sector-03-05:g1-surface", -32, -400),
        horizontalSurface("sector-03-05:r1", -48, -464, 288, 24, { kind: "recovery" }),
        grappleTarget("sector-03-05:g2-surface", 192, -512),
        horizontalSurface("sector-03-05:p3", 176, -576, 288, 32, { kind: "safe-deck" }),
        grappleTarget("sector-03-05:g3-surface", 32, -624),
        horizontalSurface("sector-03-05:p4", 288, -656, 256, 32, { kind: "safe-deck" })
    ],
    routePoints: [
        point("sector-03-05:route-entry", -240, -32),
        point("sector-03-05:route-g1", -32, -400, { landmark: "G1" }),
        point("sector-03-05:route-g2", 192, -512, { landmark: "G2" }),
        point("sector-03-05:route-g3", 32, -624, { landmark: "G3" }),
        point("sector-03-05:route-exit", 416, -688)
    ],
    recoveryPoints: [point("sector-03-05:recovery-r1", -48, -488)],
    objects: [
        ...[
            ["g1", -32, -400, "G1"],
            ["g2", 192, -512, "G2"],
            ["g3", 32, -624, "G3"]
        ].map(([id, x, y, label]) => worldObject(`sector-03-05:${id}`, "grapple-landmark", x, y, { label })),
        worldObject("sector-03-05:service-calibration-frame", "maintenance-frame", 240, -288, {
            coordinateAnchor: "bottom-center",
            gateId: "sector-03-05:gate"
        }),
        worldObject("sector-03-05:node-id", "story-display", 0, -312, {
            cueIds: ["sector-03-05:node-id"]
        }),
        worldObject("sector-03-05:access-summary", "story-display", 240, -312, {
            cueIds: ["sector-03-05:access-summary"]
        }),
        worldObject("sector-03-05:premium-atrium-ahead", "story-display", 288, -680, {
            cueIds: ["sector-03-05:premium-atrium-ahead"]
        }),
        worldObject("sector-03-05:exit-panel", "gate-panel", 224, -656, {
            coordinateAnchor: "bottom-center",
            interactionRadius,
            objectiveId: "sector-03-05:exit-panel-engaged",
            gateId: "sector-03-05:gate",
            requiredObjectiveIds: ["sector-03-05:final-deck-reached"]
        }),
        worldObject("sector-03-05:service-gate", "gate", 352, -656, {
            coordinateAnchor: "bottom-center",
            gateId: "sector-03-05:gate"
        })
    ],
    objectives: [
        { id: "sector-03-05:final-deck-reached", type: "reach", bounds: triggerBounds(160, -688, 256, 96) },
        {
            id: "sector-03-05:exit-panel-engaged",
            type: "interact",
            sourceObjectId: "sector-03-05:exit-panel",
            requiredObjectiveIds: ["sector-03-05:final-deck-reached"]
        }
    ],
    gate: gate("sector-03-05:gate", 352, -688, "sector-03-06", ["sector-03-05:exit-panel-engaged"], {
        portalBottomY: -656
    }),
    storyTriggers: ["commercial-service-node", "authority-scope", "calibration"],
    routes: ["safe", "flow", "recovery"],
    cueIds: ["commercial-service-node", "rest"]
});

const area06 = defineArea({
    id: "sector-03-06",
    sectorId: "sector-03",
    order: 6,
    name: "PREMIUM ATRIUM",
    subtitle: "LARGE MOVEMENT",
    bounds: { width: 1280, height: 1440 },
    entry: point("sector-03-06:entry", -512, -32),
    exit: point("sector-03-06:exit", 448, -1440),
    nextAreaId: "sector-03-07",
    surfaces: [
        horizontalSurface("sector-03-06:p0", -512, 0, 256, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-03-06:p1", -384, -160, 384, 32, { kind: "safe-deck" }),
        grappleTarget("sector-03-06:g1-surface", -416, -288),
        grappleTarget("sector-03-06:c1-surface", -64, -384),
        horizontalSurface("sector-03-06:p2", -64, -480, 320, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-03-06:r1", 352, -512, 192, 24, { kind: "recovery" }),
        horizontalSurface("sector-03-06:m1", 0, -640, 384, 32, { kind: "safe-deck" }),
        grappleTarget("sector-03-06:c2-surface", 192, -768),
        grappleTarget("sector-03-06:g3-surface", 0, -928),
        horizontalSurface("sector-03-06:p3", -16, -992, 352, 32, { kind: "safe-deck" }),
        grappleTarget("sector-03-06:g4-surface", 256, -1088),
        horizontalSurface("sector-03-06:p4", 416, -1184, 320, 32, { kind: "safe-deck" }),
        grappleTarget("sector-03-06:g5-surface", 128, -1312),
        horizontalSurface("sector-03-06:p5", 384, -1408, 320, 32, { kind: "safe-deck" })
    ],
    routePoints: [
        point("sector-03-06:route-entry", -512, -32),
        point("sector-03-06:route-g1", -416, -288, { landmark: "G1" }),
        point("sector-03-06:route-c1", -64, -384, { landmark: "C1" }),
        point("sector-03-06:route-c2", 192, -768, { landmark: "C2" }),
        point("sector-03-06:route-g3", 0, -928, { landmark: "G3" }),
        point("sector-03-06:route-g4", 256, -1088, { landmark: "G4" }),
        point("sector-03-06:route-g5", 128, -1312, { landmark: "G5" }),
        point("sector-03-06:route-exit", 576, -1440)
    ],
    recoveryPoints: [point("sector-03-06:recovery-r1", 352, -536)],
    objects: [
        ...[
            ["g1", -416, -288, "G1"],
            ["c1", -64, -384, "C1"],
            ["c2", 192, -768, "C2"],
            ["g3", 0, -928, "G3"],
            ["g4", 256, -1088, "G4"],
            ["g5", 128, -1312, "G5"]
        ].map(([id, x, y, label]) => worldObject(`sector-03-06:${id}`, "grapple-landmark", x, y, { label })),
        patrolDrone(
            "sector-03-06:drone-1",
            -128,
            -736,
            { x: -128, y: -736 },
            { x: 320, y: -736 },
            { x: -384, y: -896, width: 832, height: 224 }
        ),
        worldObject("sector-03-06:atrium-id", "story-display", -384, -184, {
            cueIds: ["sector-03-06:atrium-id"]
        }),
        worldObject("sector-03-06:power-state", "story-display", -64, -504, {
            cueIds: ["sector-03-06:power-state"]
        }),
        worldObject("sector-03-06:upper-concourse", "story-display", 416, -1208, {
            cueIds: ["sector-03-06:upper-concourse"]
        }),
        worldObject("sector-03-06:access-control-ahead", "story-display", 384, -1432, {
            cueIds: ["sector-03-06:access-control-ahead"]
        }),
        worldObject("sector-03-06:exit-panel", "gate-panel", 320, -1408, {
            coordinateAnchor: "bottom-center",
            interactionRadius,
            objectiveId: "sector-03-06:exit-panel-engaged",
            gateId: "sector-03-06:gate",
            requiredObjectiveIds: ["sector-03-06:final-deck-reached"]
        }),
        worldObject("sector-03-06:service-gate", "gate", 448, -1408, {
            coordinateAnchor: "bottom-center",
            gateId: "sector-03-06:gate"
        })
    ],
    objectives: [
        { id: "sector-03-06:final-deck-reached", type: "reach", bounds: triggerBounds(224, -1440, 320, 96) },
        {
            id: "sector-03-06:exit-panel-engaged",
            type: "interact",
            sourceObjectId: "sector-03-06:exit-panel",
            requiredObjectiveIds: ["sector-03-06:final-deck-reached"]
        }
    ],
    scannerGroups: [
        scannerGroup("sector-03-06:scanner-premium-atrium-A", ["sector-03-06:c1-surface", "sector-03-06:c2-surface"])
    ],
    gate: gate("sector-03-06:gate", 448, -1440, "sector-03-07", ["sector-03-06:exit-panel-engaged"], {
        portalBottomY: -1408
    }),
    storyTriggers: ["premium-atrium", "local-power", "security-timing"],
    routes: ["safe", "flow", "recovery"],
    cueIds: ["premium-atrium", "large-movement"]
});

const area07 = defineArea({
    id: "sector-03-07",
    sectorId: "sector-03",
    order: 7,
    name: "PRIORITY CONCOURSE",
    subtitle: "ACCESS TIER REVEAL",
    bounds: { width: 1280, height: 1344 },
    entry: point("sector-03-07:entry", -512, -32),
    exit: point("sector-03-07:exit", 448, -1344),
    nextAreaId: "sector-03-08",
    surfaces: [
        horizontalSurface("sector-03-07:p0", -512, 0, 256, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-03-07:p1", -352, -160, 384, 32, { kind: "safe-deck" }),
        grappleTarget("sector-03-07:c1-surface", -192, -320),
        horizontalSurface("sector-03-07:o1", -320, -416, 256, 32, { kind: "safe-deck" }),
        grappleTarget("sector-03-07:s1-surface", -32, -288),
        grappleTarget("sector-03-07:s2-surface", 288, -416),
        horizontalSurface("sector-03-07:m1", 0, -576, 384, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-03-07:o2", -384, -736, 256, 32, { kind: "safe-deck" }),
        grappleTarget("sector-03-07:c2-surface", -288, -864),
        grappleTarget("sector-03-07:c3-surface", 64, -736),
        grappleTarget("sector-03-07:g4-surface", 128, -896),
        grappleTarget("sector-03-07:s3-surface", 352, -736),
        grappleTarget("sector-03-07:s4-surface", 384, -896),
        horizontalSurface("sector-03-07:m2", 0, -1056, 384, 32, { kind: "safe-deck" }),
        grappleTarget("sector-03-07:g5-surface", 192, -1184),
        horizontalSurface("sector-03-07:p5", 384, -1312, 320, 32, { kind: "safe-deck" })
    ],
    routePoints: [
        point("sector-03-07:route-entry", -512, -32),
        point("sector-03-07:route-c1", -192, -320, { landmark: "C1" }),
        point("sector-03-07:route-s1", -32, -288, { landmark: "S1" }),
        point("sector-03-07:route-s2", 288, -416, { landmark: "S2" }),
        point("sector-03-07:route-c2", -288, -864, { landmark: "C2" }),
        point("sector-03-07:route-c3", 64, -736, { landmark: "C3" }),
        point("sector-03-07:route-g4", 128, -896, { landmark: "G4" }),
        point("sector-03-07:route-s3", 352, -736, { landmark: "S3" }),
        point("sector-03-07:route-s4", 384, -896, { landmark: "S4" }),
        point("sector-03-07:route-g5", 192, -1184, { landmark: "G5" }),
        point("sector-03-07:route-exit", 576, -1344)
    ],
    recoveryPoints: [],
    objects: [
        ...[
            ["c1", -192, -320, "C1"],
            ["s1", -32, -288, "S1"],
            ["s2", 288, -416, "S2"],
            ["c2", -288, -864, "C2"],
            ["c3", 64, -736, "C3"],
            ["g4", 128, -896, "G4"],
            ["s3", 352, -736, "S3"],
            ["s4", 384, -896, "S4"],
            ["g5", 192, -1184, "G5"]
        ].map(([id, x, y, label]) => worldObject(`sector-03-07:${id}`, "grapple-landmark", x, y, { label })),
        patrolDrone(
            "sector-03-07:drone-1",
            -64,
            -800,
            { x: -64, y: -800 },
            { x: 416, y: -800 },
            { x: -160, y: -976, width: 704, height: 336 }
        ),
        worldObject("sector-03-07:concourse-sign", "story-display", -352, -184, {
            cueIds: ["sector-03-07:concourse-sign"]
        }),
        worldObject("sector-03-07:access-directory", "story-display", 0, -1080, {
            cueIds: ["sector-03-07:access-directory"]
        }),
        worldObject("sector-03-07:upper-market-gate-ahead", "story-display", 384, -1336, {
            cueIds: ["sector-03-07:upper-market-gate-ahead"]
        }),
        worldObject("sector-03-07:exit-panel", "gate-panel", 320, -1312, {
            coordinateAnchor: "bottom-center",
            interactionRadius,
            objectiveId: "sector-03-07:exit-panel-engaged",
            gateId: "sector-03-07:gate",
            requiredObjectiveIds: ["sector-03-07:final-deck-reached"]
        }),
        worldObject("sector-03-07:service-gate", "gate", 448, -1312, {
            coordinateAnchor: "bottom-center",
            gateId: "sector-03-07:gate"
        })
    ],
    objectives: [
        { id: "sector-03-07:final-deck-reached", type: "reach", bounds: triggerBounds(224, -1344, 320, 96) },
        {
            id: "sector-03-07:exit-panel-engaged",
            type: "interact",
            sourceObjectId: "sector-03-07:exit-panel",
            requiredObjectiveIds: ["sector-03-07:final-deck-reached"]
        }
    ],
    scannerGroups: [
        scannerGroup("sector-03-07:scanner-priority-concourse-A", [
            "sector-03-07:c1-surface",
            "sector-03-07:c2-surface",
            "sector-03-07:c3-surface"
        ])
    ],
    gate: gate("sector-03-07:gate", 448, -1344, "sector-03-08", ["sector-03-07:exit-panel-engaged"], {
        portalBottomY: -1312
    }),
    storyTriggers: ["priority-concourse", "access-tier", "service-class"],
    routes: ["outer", "priority-spine", "service", "recovery"],
    cueIds: ["priority-concourse", "access-tier-reveal"]
});

const area08 = defineArea({
    id: "sector-03-08",
    sectorId: "sector-03",
    order: 8,
    name: "UPPER MARKET GATE",
    subtitle: "FREE-WEAVE FINALE",
    bounds: { width: 1408, height: 1664 },
    entry: point("sector-03-08:entry", -544, -32),
    exit: point("sector-03-08:exit", 480, -1664),
    nextAreaId: null,
    surfaces: [
        horizontalSurface("sector-03-08:p0", -544, 0, 256, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-03-08:p1", -416, -160, 320, 32, { kind: "safe-deck" }),
        grappleTarget("sector-03-08:g1-surface", -448, -288),
        grappleTarget("sector-03-08:c1-surface", -160, -384),
        horizontalSurface("sector-03-08:p2", -64, -480, 320, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-03-08:m0", 0, -608, 384, 32, { kind: "safe-deck" }),
        grappleTarget("sector-03-08:c2-surface", 0, -736),
        grappleTarget("sector-03-08:w1-surface", -352, -800),
        grappleTarget("sector-03-08:e1-surface", 352, -800),
        horizontalSurface("sector-03-08:mx", 0, -896, 384, 32, { kind: "safe-deck" }),
        grappleTarget("sector-03-08:c3-surface", 0, -1024),
        grappleTarget("sector-03-08:w2-surface", -320, -1088),
        grappleTarget("sector-03-08:e2-surface", 320, -1088),
        horizontalSurface("sector-03-08:m1", 0, -1184, 384, 32, { kind: "safe-deck" }),
        grappleTarget("sector-03-08:g4-surface", 224, -1280),
        grappleTarget("sector-03-08:c4-surface", 0, -1344),
        horizontalSurface("sector-03-08:a1", 0, -1440, 512, 32, { kind: "safe-deck" }),
        grappleTarget("sector-03-08:g6-surface", 256, -1536),
        horizontalSurface("sector-03-08:p6", 416, -1632, 320, 32, { kind: "safe-deck" })
    ],
    routePoints: [
        point("sector-03-08:route-entry", -544, -32),
        point("sector-03-08:route-g1", -448, -288, { landmark: "G1" }),
        point("sector-03-08:route-c1", -160, -384, { landmark: "C1" }),
        point("sector-03-08:route-c2", 0, -736, { landmark: "C2" }),
        point("sector-03-08:route-w1", -352, -800, { landmark: "W1" }),
        point("sector-03-08:route-e1", 352, -800, { landmark: "E1" }),
        point("sector-03-08:route-c3", 0, -1024, { landmark: "C3" }),
        point("sector-03-08:route-w2", -320, -1088, { landmark: "W2" }),
        point("sector-03-08:route-e2", 320, -1088, { landmark: "E2" }),
        point("sector-03-08:route-g4", 224, -1280, { landmark: "G4" }),
        point("sector-03-08:route-c4", 0, -1344, { landmark: "C4" }),
        point("sector-03-08:route-g6", 256, -1536, { landmark: "G6" }),
        point("sector-03-08:route-exit", 608, -1664)
    ],
    recoveryPoints: [],
    objects: [
        ...[
            ["g1", -448, -288, "G1"],
            ["c1", -160, -384, "C1"],
            ["c2", 0, -736, "C2"],
            ["w1", -352, -800, "W1"],
            ["e1", 352, -800, "E1"],
            ["c3", 0, -1024, "C3"],
            ["w2", -320, -1088, "W2"],
            ["e2", 320, -1088, "E2"],
            ["g4", 224, -1280, "G4"],
            ["c4", 0, -1344, "C4"],
            ["g6", 256, -1536, "G6"]
        ].map(([id, x, y, label]) => worldObject(`sector-03-08:${id}`, "grapple-landmark", x, y, { label })),
        patrolDrone(
            "sector-03-08:drone-1",
            -512,
            -944,
            { x: -512, y: -944 },
            { x: -192, y: -944 },
            { x: -640, y: -1120, width: 480, height: 416 }
        ),
        patrolDrone(
            "sector-03-08:drone-2",
            192,
            -944,
            { x: 192, y: -944 },
            { x: 512, y: -944 },
            { x: 160, y: -1120, width: 480, height: 416 }
        ),
        worldObject("sector-03-08:market-gate", "story-display", -416, -184, {
            cueIds: ["sector-03-08:market-gate"]
        }),
        worldObject("sector-03-08:market-directory", "story-display", 0, -632, {
            cueIds: ["sector-03-08:market-directory"]
        }),
        worldObject("sector-03-08:evacuation-archive", "story-display", -128, -1464, {
            cueIds: ["sector-03-08:evacuation-archive"]
        }),
        worldObject("sector-03-08:access-archive", "story-display", 128, -1464, {
            cueIds: ["sector-03-08:access-archive"]
        }),
        worldObject("sector-03-08:final-control", "story-display", 416, -1656, {
            cueIds: ["sector-03-08:final-control"]
        }),
        worldObject("sector-03-08:exit-panel", "gate-panel", 352, -1632, {
            coordinateAnchor: "bottom-center",
            interactionRadius,
            objectiveId: "sector-03-08:exit-panel-engaged",
            gateId: "sector-03-08:gate",
            requiredObjectiveIds: ["sector-03-08:final-deck-reached"]
        }),
        worldObject("sector-03-08:final-gate", "gate", 480, -1632, {
            coordinateAnchor: "bottom-center",
            gateId: "sector-03-08:gate"
        })
    ],
    objectives: [
        { id: "sector-03-08:final-deck-reached", type: "reach", bounds: triggerBounds(256, -1664, 320, 96) },
        {
            id: "sector-03-08:exit-panel-engaged",
            type: "interact",
            sourceObjectId: "sector-03-08:exit-panel",
            requiredObjectiveIds: ["sector-03-08:final-deck-reached"]
        }
    ],
    scannerGroups: [
        scannerGroup("sector-03-08:scanner-upper-market-A", [
            "sector-03-08:c1-surface",
            "sector-03-08:c2-surface",
            "sector-03-08:c3-surface",
            "sector-03-08:c4-surface"
        ])
    ],
    gate: gate("sector-03-08:gate", 480, -1664, null, ["sector-03-08:exit-panel-engaged"], {
        portalBottomY: -1632
    }),
    storyTriggers: ["upper-market-gate", "evacuation-archive", "access-archive"],
    routes: ["safe", "flow", "recovery"],
    cueIds: ["upper-market-gate", "free-weave-finale"]
});

export const SECTOR_03_AREA_CATALOG = defineAreaCatalog({
    id: "sector-03-authored-mock",
    revision: "sector-03-scenarios-rev1-v1",
    areas: [area01, area02, area03, area04, area05, area06, area07, area08]
});
