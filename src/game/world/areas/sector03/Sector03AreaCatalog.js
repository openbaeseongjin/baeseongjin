import {
    cameraZone,
    defineArea,
    defineAreaCatalog,
    exitBlock,
    objectTriggerSpec,
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
        activationSpec: objectTriggerSpec("center", activation.width, activation.height, {
            x: activation.x + activation.width * 0.5 - x,
            y: activation.y + activation.height * 0.5 - y
        }),
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
        barrier: triggerBounds(x - 32, y - 64, 64, 96),
        ...(nextAreaId === null ? { completionMode: "content-boundary" } : {})
    });
}

const block01 = exitBlock({
    areaId: "sector-03-01",
    deckX: 336,
    deckTopY: -963,
    deckWidth: 288,
    nextAreaId: "sector-03-02",
    panelObjectiveId: "sector-03-01:exit-panel-engaged",
    panelProperties: { requiredObjectiveIds: ["sector-03-01:final-deck-reached"] }
});

const area01 = defineArea({
    id: "sector-03-01",
    sectorId: "sector-03",
    order: 1,
    name: "POWERED PROMENADE",
    subtitle: "COMMERCIAL THRESHOLD",
    bounds: { width: 1280, height: 1088 },
    entry: point("sector-03-01:entry", -432, -32),
    exit: block01.exit,
    nextAreaId: "sector-03-02",
    surfaces: [
        horizontalSurface("sector-03-01:p0", -432, 0, 224, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-03-01:p1", -320, -160, 320, 32, { kind: "safe-deck" }),

        horizontalSurface("sector-03-01:p2", -96, -352, 384, 32, { kind: "safe-deck" }),
        grappleTarget("sector-03-01:g2-surface", -32, -448),
        horizontalSurface("sector-03-01:p3", -80, -576, 288, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-03-01:r1", 288, -608, 256, 24, { kind: "recovery" }),

        horizontalSurface("sector-03-01:p4", -96, -864, 320, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-03-01:r2", 352, -864, 256, 24, { kind: "recovery" }),
        grappleTarget("sector-03-01:g5-surface", 128, -960),
        block01.deck
    ],
    routePoints: [
        point("sector-03-01:route-entry", -432, -32),

        point("sector-03-01:route-g2", -32, -448, { landmark: "G2" }),

        point("sector-03-01:route-g5", 128, -960, { landmark: "G5" }),
        block01.routeExit
    ],
    recoveryPoints: [point("sector-03-01:recovery-r1", 288, -632), point("sector-03-01:recovery-r2", 352, -888)],
    objects: [
        ...[
            ["g2", -32, -448, "G2"],

            ["g5", 128, -960, "G5"]
        ].map(([id, x, y, label]) => worldObject(`sector-03-01:${id}`, "grapple-landmark", x, y, { label })),
        worldObject("sector-03-01:district-sign", "story-display", -320, -184, {
            cueIds: ["sector-03-01:district-sign"]
        }),
        worldObject("sector-03-01:welcome-kiosk", "story-display", -416, -184, {
            cueIds: ["sector-03-01:welcome-kiosk"]
        }),
        block01.panel,
        block01.gateVisual
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
    gate: block01.gate,
    storyTriggers: ["district-sign", "powered-environment", "automated-welcome"],
    routes: ["safe", "flow", "recovery"],
    cueIds: ["powered-promenade", "commercial-threshold"]
});

const block02 = exitBlock({
    areaId: "sector-03-02",
    deckX: 368,
    deckTopY: -1059,
    deckWidth: 288,
    nextAreaId: "sector-03-03",
    panelObjectiveId: "sector-03-02:exit-panel-engaged",
    panelProperties: { requiredObjectiveIds: ["sector-03-02:final-deck-reached"] }
});

const area02 = defineArea({
    id: "sector-03-02",
    sectorId: "sector-03",
    order: 2,
    name: "SCANNER GALLERY",
    subtitle: "FIRST ACCESS SCAN",
    bounds: { width: 1280, height: 1184 },
    entry: point("sector-03-02:entry", -432, -32),
    exit: block02.exit,
    nextAreaId: "sector-03-03",
    surfaces: [
        horizontalSurface("sector-03-02:p0", -432, 0, 224, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-03-02:p1", -304, -160, 352, 32, { kind: "safe-deck" }),

        grappleTarget("sector-03-02:c1-surface", -64, -320),
        horizontalSurface("sector-03-02:p2", 64, -416, 320, 32, { kind: "safe-deck" }),
        grappleTarget("sector-03-02:c2-surface", 160, -544),
        horizontalSurface("sector-03-02:p3", 64, -640, 320, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-03-02:r1", 416, -672, 256, 24, { kind: "recovery" }),
        grappleTarget("sector-03-02:c3-surface", 96, -768),

        horizontalSurface("sector-03-02:p4", -96, -928, 320, 32, { kind: "safe-deck" }),

        block02.deck
    ],
    routePoints: [
        point("sector-03-02:route-entry", -432, -32),

        point("sector-03-02:route-c1", -64, -320, { landmark: "C1" }),
        point("sector-03-02:route-c2", 160, -544, { landmark: "C2" }),
        point("sector-03-02:route-c3", 96, -768, { landmark: "C3" }),

        block02.routeExit
    ],
    recoveryPoints: [point("sector-03-02:recovery-r1", 416, -696)],
    objects: [
        ...[
            ["c1", -64, -320, "C1"],
            ["c2", 160, -544, "C2"],
            ["c3", 96, -768, "C3"]
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
        block02.panel,
        block02.gateVisual
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
    gate: block02.gate,
    storyTriggers: ["scanner-gallery-entry", "access-denied", "scanner-learned"],
    routes: ["safe", "flow", "recovery"],
    cueIds: ["scanner-gallery", "access-scan-field"]
});

const block03 = exitBlock({
    areaId: "sector-03-03",
    deckX: 368,
    deckTopY: -1059,
    deckWidth: 288,
    nextAreaId: "sector-03-04",
    panelObjectiveId: "sector-03-03:exit-panel-engaged",
    panelProperties: { requiredObjectiveIds: ["sector-03-03:final-deck-reached"] }
});

const area03 = defineArea({
    id: "sector-03-03",
    sectorId: "sector-03",
    order: 3,
    name: "RETAIL SECURITY WALK",
    subtitle: "SCANNER + PATROL",
    bounds: { width: 1280, height: 1184 },
    entry: point("sector-03-03:entry", -432, -32),
    exit: block03.exit,
    nextAreaId: "sector-03-04",
    surfaces: [
        horizontalSurface("sector-03-03:p0", -432, 0, 224, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-03-03:p1", -320, -160, 320, 32, { kind: "safe-deck" }),
        grappleTarget("sector-03-03:c1-surface", -96, -288),
        horizontalSurface("sector-03-03:s2", -48, -416, 352, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-03-03:r1", 384, -416, 256, 24, { kind: "recovery" }),
        grappleTarget("sector-03-03:c2-surface", 128, -640),

        horizontalSurface("sector-03-03:p3", 0, -864, 320, 32, { kind: "safe-deck" }),

        horizontalSurface("sector-03-03:p4", 304, -1024, 288, 32, { kind: "safe-deck" }),

        block03.deck
    ],
    routePoints: [
        point("sector-03-03:route-entry", -432, -32),
        point("sector-03-03:route-c1", -96, -288, { landmark: "C1" }),
        point("sector-03-03:route-c2", 128, -640, { landmark: "C2" }),

        block03.routeExit
    ],
    recoveryPoints: [point("sector-03-03:recovery-r1", 384, -440)],
    objects: [
        ...[
            ["c1", -96, -288, "C1"],
            ["c2", 128, -640, "C2"]
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
        block03.panel,
        block03.gateVisual
    ],
    objectives: [
        { id: "sector-03-03:final-deck-reached", type: "reach", bounds: triggerBounds(224, -1152, 288, 96) },
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
    gate: block03.gate,
    storyTriggers: ["retail-security", "scanner-reminder", "patrol-reveal"],
    routes: ["safe", "flow", "recovery"],
    cueIds: ["retail-security-walk", "scanner-patrol-synthesis"]
});

const block04 = exitBlock({
    areaId: "sector-03-04",
    deckX: 384,
    deckTopY: -1091,
    deckWidth: 320,
    nextAreaId: "sector-03-05",
    panelObjectiveId: "sector-03-04:exit-panel-engaged",
    panelProperties: { requiredObjectiveIds: ["sector-03-04:final-deck-reached"] }
});

const area04 = defineArea({
    id: "sector-03-04",
    sectorId: "sector-03",
    order: 4,
    name: "SERVICE ARCADE",
    subtitle: "PUBLIC VS SERVICE",
    bounds: { width: 1280, height: 1216 },
    entry: point("sector-03-04:entry", -440, -32),
    exit: block04.exit,
    nextAreaId: "sector-03-05",
    surfaces: [
        horizontalSurface("sector-03-04:p0", -440, 0, 240, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-03-04:p1", -272, -160, 352, 32, { kind: "safe-deck" }),
        grappleTarget("sector-03-04:c1-surface", -288, -320),
        horizontalSurface("sector-03-04:pu1", -320, -448, 384, 32, { kind: "safe-deck" }),
        grappleTarget("sector-03-04:c2-surface", -160, -608),
        horizontalSurface("sector-03-04:pu2", -272, -736, 352, 32, { kind: "safe-deck" }),

        horizontalSurface("sector-03-04:sv1", 432, -512, 160, 24, { kind: "recovery" }),
        horizontalSurface("sector-03-04:x1", 96, -512, 128, 32, { kind: "safe-deck" }),

        horizontalSurface("sector-03-04:sv2", 432, -736, 160, 24, { kind: "recovery" }),
        horizontalSurface("sector-03-04:m1", 96, -832, 384, 32, { kind: "safe-deck" }),
        grappleTarget("sector-03-04:g5-surface", 64, -960),
        horizontalSurface("sector-03-04:p4", 32, -1024, 320, 32, { kind: "safe-deck" }),

        block04.deck
    ],
    routePoints: [
        point("sector-03-04:route-entry", -440, -32),
        point("sector-03-04:route-c1", -288, -320, { landmark: "C1" }),
        point("sector-03-04:route-c2", -160, -608, { landmark: "C2" }),

        point("sector-03-04:route-g5", 64, -960, { landmark: "G5" }),

        block04.routeExit
    ],
    recoveryPoints: [point("sector-03-04:recovery-sv1", 432, -536), point("sector-03-04:recovery-sv2", 432, -760)],
    objects: [
        ...[
            ["c1", -288, -320, "C1"],
            ["c2", -160, -608, "C2"],

            ["g5", 64, -960, "G5"]
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
        block04.panel,
        block04.gateVisual
    ],
    objectives: [
        { id: "sector-03-04:final-deck-reached", type: "reach", bounds: triggerBounds(224, -1184, 320, 96) },
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
    gate: block04.gate,
    storyTriggers: ["service-arcade", "public-vs-service", "maintenance-local-only"],
    routes: ["public", "service", "recovery"],
    cueIds: ["service-arcade", "route-identity"]
});

const block05 = exitBlock({
    areaId: "sector-03-05",
    deckX: 288,
    deckTopY: -563,
    deckWidth: 256,
    nextAreaId: "sector-03-06",
    panelObjectiveId: "sector-03-05:exit-panel-engaged",
    panelProperties: { requiredObjectiveIds: ["sector-03-05:final-deck-reached"] }
});

const area05 = defineArea({
    id: "sector-03-05",
    sectorId: "sector-03",
    order: 5,
    name: "COMMERCIAL SERVICE NODE",
    subtitle: "REST / DIAGNOSTIC",
    bounds: { width: 960, height: 688 },
    entry: point("sector-03-05:entry", -240, -32),
    exit: block05.exit,
    nextAreaId: "sector-03-06",
    surfaces: [
        horizontalSurface("sector-03-05:p0", -240, 0, 224, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-03-05:p1", -96, -128, 448, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-03-05:p2", 0, -288, 448, 32, { kind: "safe-deck" }),
        grappleTarget("sector-03-05:g1-surface", -32, -400),
        horizontalSurface("sector-03-05:r1", -48, -464, 288, 24, { kind: "recovery" }),

        horizontalSurface("sector-03-05:p3", 176, -576, 288, 32, { kind: "safe-deck" }),

        block05.deck
    ],
    routePoints: [
        point("sector-03-05:route-entry", -240, -32),
        point("sector-03-05:route-g1", -32, -400, { landmark: "G1" }),

        block05.routeExit
    ],
    recoveryPoints: [point("sector-03-05:recovery-r1", -48, -488)],
    objects: [
        ...[["g1", -32, -400, "G1"]].map(([id, x, y, label]) =>
            worldObject(`sector-03-05:${id}`, "grapple-landmark", x, y, { label })
        ),
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
        block05.panel,
        block05.gateVisual
    ],
    objectives: [
        { id: "sector-03-05:final-deck-reached", type: "reach", bounds: triggerBounds(160, -656, 256, 96) },
        {
            id: "sector-03-05:exit-panel-engaged",
            type: "interact",
            sourceObjectId: "sector-03-05:exit-panel",
            requiredObjectiveIds: ["sector-03-05:final-deck-reached"]
        }
    ],
    gate: block05.gate,
    storyTriggers: ["commercial-service-node", "authority-scope", "calibration"],
    routes: ["safe", "flow", "recovery"],
    cueIds: ["commercial-service-node", "rest"]
});

const block06 = exitBlock({
    areaId: "sector-03-06",
    deckX: 384,
    deckTopY: -1315,
    deckWidth: 320,
    nextAreaId: "sector-03-07",
    panelObjectiveId: "sector-03-06:exit-panel-engaged",
    panelProperties: { requiredObjectiveIds: ["sector-03-06:final-deck-reached"] }
});

const area06 = defineArea({
    id: "sector-03-06",
    sectorId: "sector-03",
    order: 6,
    name: "PREMIUM ATRIUM",
    subtitle: "LARGE MOVEMENT",
    bounds: { width: 1280, height: 1440 },
    entry: point("sector-03-06:entry", -512, -32),
    exit: block06.exit,
    nextAreaId: "sector-03-07",
    surfaces: [
        horizontalSurface("sector-03-06:p0", -512, 0, 256, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-03-06:p1", -384, -160, 384, 32, { kind: "safe-deck" }),

        grappleTarget("sector-03-06:c1-surface", -64, -384),
        horizontalSurface("sector-03-06:p2", -64, -480, 320, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-03-06:r1", 352, -512, 192, 24, { kind: "recovery" }),
        horizontalSurface("sector-03-06:m1", 0, -640, 384, 32, { kind: "safe-deck" }),
        grappleTarget("sector-03-06:c2-surface", 192, -768),

        horizontalSurface("sector-03-06:p3", -16, -992, 352, 32, { kind: "safe-deck" }),

        horizontalSurface("sector-03-06:p4", 416, -1184, 320, 32, { kind: "safe-deck" }),
        grappleTarget("sector-03-06:g5-surface", 128, -1312),
        block06.deck
    ],
    routePoints: [
        point("sector-03-06:route-entry", -512, -32),

        point("sector-03-06:route-c1", -64, -384, { landmark: "C1" }),
        point("sector-03-06:route-c2", 192, -768, { landmark: "C2" }),

        point("sector-03-06:route-g5", 128, -1312, { landmark: "G5" }),
        block06.routeExit
    ],
    recoveryPoints: [point("sector-03-06:recovery-r1", 352, -536)],
    objects: [
        ...[
            ["c1", -64, -384, "C1"],
            ["c2", 192, -768, "C2"],

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
        block06.panel,
        block06.gateVisual
    ],
    objectives: [
        { id: "sector-03-06:final-deck-reached", type: "reach", bounds: triggerBounds(224, -1408, 320, 96) },
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
    gate: block06.gate,
    storyTriggers: ["premium-atrium", "local-power", "security-timing"],
    routes: ["safe", "flow", "recovery"],
    cueIds: ["premium-atrium", "large-movement"]
});

const block07 = exitBlock({
    areaId: "sector-03-07",
    deckX: 384,
    deckTopY: -1219,
    deckWidth: 320,
    nextAreaId: "sector-03-08",
    panelObjectiveId: "sector-03-07:exit-panel-engaged",
    panelProperties: { requiredObjectiveIds: ["sector-03-07:final-deck-reached"] }
});

const area07 = defineArea({
    id: "sector-03-07",
    sectorId: "sector-03",
    order: 7,
    name: "PRIORITY CONCOURSE",
    subtitle: "ACCESS TIER REVEAL",
    bounds: { width: 1280, height: 1344 },
    entry: point("sector-03-07:entry", -512, -32),
    exit: block07.exit,
    nextAreaId: "sector-03-08",
    surfaces: [
        horizontalSurface("sector-03-07:p0", -512, 0, 256, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-03-07:p1", -352, -160, 384, 32, { kind: "safe-deck" }),
        grappleTarget("sector-03-07:c1-surface", -192, -320),
        horizontalSurface("sector-03-07:o1", -320, -416, 256, 32, { kind: "safe-deck" }),

        horizontalSurface("sector-03-07:m1", 0, -576, 384, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-03-07:o2", -384, -736, 256, 32, { kind: "safe-deck" }),
        grappleTarget("sector-03-07:c2-surface", -288, -864),
        grappleTarget("sector-03-07:c3-surface", 64, -736),

        horizontalSurface("sector-03-07:m2", 0, -1056, 384, 32, { kind: "safe-deck" }),
        grappleTarget("sector-03-07:g5-surface", 192, -1184),
        block07.deck
    ],
    routePoints: [
        point("sector-03-07:route-entry", -512, -32),
        point("sector-03-07:route-c1", -192, -320, { landmark: "C1" }),

        point("sector-03-07:route-c3", 64, -736, { landmark: "C3" }),
        point("sector-03-07:route-c2", -288, -864, { landmark: "C2" }),

        point("sector-03-07:route-g5", 192, -1184, { landmark: "G5" }),
        block07.routeExit
    ],
    recoveryPoints: [],
    objects: [
        ...[
            ["c1", -192, -320, "C1"],

            ["c2", -288, -864, "C2"],
            ["c3", 64, -736, "C3"],

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
        block07.panel,
        block07.gateVisual
    ],
    objectives: [
        { id: "sector-03-07:final-deck-reached", type: "reach", bounds: triggerBounds(224, -1312, 320, 96) },
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
    gate: block07.gate,
    storyTriggers: ["priority-concourse", "access-tier", "service-class"],
    routes: ["outer", "priority-spine", "service", "recovery"],
    cueIds: ["priority-concourse", "access-tier-reveal"]
});

const block08 = exitBlock({
    areaId: "sector-03-08",
    deckX: 416,
    deckTopY: -1539,
    deckWidth: 320,
    nextAreaId: null,
    panelObjectiveId: "sector-03-08:exit-panel-engaged",
    panelProperties: { requiredObjectiveIds: ["sector-03-08:final-deck-reached"] },
    completionMode: "content-boundary"
});

const area08 = defineArea({
    id: "sector-03-08",
    sectorId: "sector-03",
    order: 8,
    name: "UPPER MARKET GATE",
    subtitle: "FREE-WEAVE FINALE",
    bounds: { width: 1408, height: 1664 },
    entry: point("sector-03-08:entry", -544, -32),
    exit: block08.exit,
    nextAreaId: null,
    surfaces: [
        horizontalSurface("sector-03-08:p0", -544, 0, 256, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-03-08:p1", -416, -160, 320, 32, { kind: "safe-deck" }),

        grappleTarget("sector-03-08:c1-surface", -160, -384),
        horizontalSurface("sector-03-08:p2", -64, -480, 320, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-03-08:m0", 0, -608, 384, 32, { kind: "safe-deck" }),
        grappleTarget("sector-03-08:c2-surface", 0, -736),

        horizontalSurface("sector-03-08:mx", 0, -896, 384, 32, { kind: "safe-deck" }),
        grappleTarget("sector-03-08:c3-surface", 0, -1024),

        horizontalSurface("sector-03-08:m1", 0, -1184, 384, 32, { kind: "safe-deck" }),

        grappleTarget("sector-03-08:c4-surface", 0, -1344),
        horizontalSurface("sector-03-08:a1", 0, -1440, 512, 32, { kind: "safe-deck" }),

        block08.deck
    ],
    routePoints: [
        point("sector-03-08:route-entry", -544, -32),

        point("sector-03-08:route-c1", -160, -384, { landmark: "C1" }),
        point("sector-03-08:route-c2", 0, -736, { landmark: "C2" }),

        point("sector-03-08:route-c3", 0, -1024, { landmark: "C3" }),

        point("sector-03-08:route-c4", 0, -1344, { landmark: "C4" }),

        block08.routeExit
    ],
    recoveryPoints: [],
    objects: [
        ...[
            ["c1", -160, -384, "C1"],
            ["c2", 0, -736, "C2"],

            ["c3", 0, -1024, "C3"],

            ["c4", 0, -1344, "C4"]
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
        block08.panel,
        block08.gateVisual
    ],
    objectives: [
        { id: "sector-03-08:final-deck-reached", type: "reach", bounds: triggerBounds(256, -1632, 320, 96) },
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
    gate: block08.gate,
    storyTriggers: ["upper-market-gate", "evacuation-archive", "access-archive"],
    routes: ["safe", "flow", "recovery"],
    cueIds: ["upper-market-gate", "free-weave-finale"]
});

export const SECTOR_03_AREA_CATALOG = defineAreaCatalog({
    id: "sector-03-authored-mock",
    revision: "sector-03-scenarios-rev1-v1",
    areas: [area01, area02, area03, area04, area05, area06, area07, area08]
});
