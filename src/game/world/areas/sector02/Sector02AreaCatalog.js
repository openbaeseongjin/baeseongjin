import {
    defineArea,
    defineAreaCatalog,
    exitBlock,
    grappleTarget,
    objectTriggerSpec,
    point,
    rectangle,
    triggerBounds,
    worldObject
} from "../AreaDefinition.js";

const interactionRadius = 72;

function middle(left, right) {
    return (left + right) * 0.5;
}

// AREA-SPEC's x,y for "platform"/"safe-deck"/"recovery" presets are already top-center
// (matches AreaDefinition.js's rectangle() coordinateAnchor:"top-center" 1:1, no conversion).
function horizontalSurface(areaId, id, x, y, width, height, kind, props = {}) {
    return rectangle(`${areaId}:${id}`, x, y, width, height, {
        kind,
        coordinateAnchor: "top-center",
        ...props
    });
}

// A grip point that is grappleable but intentionally has no visible landmark marker (AREA-SPEC's
// "structural-grapple-target" preset) - kind is overridden away from "grapple-target" so the
// validator's strict landmark-pairing rule (validateGrappleLandmarks) does not require a matching
// kind:"grapple-landmark" object for it. Hooking is driven by grappleable !== false, not by kind.
function structuralGrip(areaId, id, x, y) {
    return grappleTarget(`${areaId}:${id}`, x, y, { kind: "structural-grapple-target" });
}

function platform(areaId, id, left, right, y, kind = "platform") {
    return rectangle(`${areaId}:${id}`, middle(left, right), y, right - left, kind === "platform" ? 24 : 20, {
        kind,
        coordinateAnchor: "top-center"
    });
}

function landmark(areaId, id, left, right, y, label = id.toUpperCase()) {
    const x = middle(left, right);
    return Object.freeze({
        surface: grappleTarget(`${areaId}:${id}-surface`, x, y),
        route: point(`${areaId}:route-${id}`, x, y, { landmark: label }),
        object: worldObject(`${areaId}:${id}`, "grapple-landmark", x, y, { label })
    });
}

function progressionGate(areaId, x, y, nextAreaId, requiredObjectiveIds, properties = {}) {
    return Object.freeze({
        id: `${areaId}:gate`,
        nextAreaId,
        requiredObjectiveIds: Object.freeze(requiredObjectiveIds),
        trigger: nextAreaId === null ? triggerBounds(x - 48, y - 96, 96, 160) : gatePortalBounds(x, y),
        barrier: triggerBounds(x - 32, y - 96, 64, 96),
        ...properties
    });
}

function reachExitObjective(areaId, x, y) {
    return Object.freeze({
        id: `${areaId}:exit-reached`,
        type: "reach",
        bounds: triggerBounds(x - 64, y - 32, 128, 96)
    });
}

function exitPanelObjective(areaId, requiredObjectiveIds) {
    return Object.freeze({
        id: `${areaId}:exit-panel-engaged`,
        type: "interact",
        sourceObjectId: `${areaId}:exit-panel`,
        requiredObjectiveIds: Object.freeze(requiredObjectiveIds)
    });
}

function exitPanel(areaId, exit, objective, floorY = exit.y) {
    return worldObject(`${areaId}:exit-panel`, "gate-panel", exit.x - 112, floorY, {
        coordinateAnchor: "bottom-center",
        interactionRadius,
        objectiveId: objective.id,
        gateId: `${areaId}:gate`,
        requiredObjectiveIds: objective.requiredObjectiveIds
    });
}

function patrolDrone(areaId, id, x, y, activation, patrolPoints) {
    return worldObject(`${areaId}:${id}`, "patrol-drone", x, y, {
        enemyType: "patrol-drone-t1",
        activationSpec: objectTriggerSpec("center", activation.width, activation.height, {
            x: activation.x + activation.width * 0.5 - x,
            y: activation.y + activation.height * 0.5 - y
        }),
        patrol: {
            points: patrolPoints,
            speed: 48,
            waitSeconds: 0.45,
            mode: "pingpong"
        },
        rules: ["kill-optional", "no-rope-cut", "target-lock-cycle", "activation-band-only"]
    });
}

const SECTOR_02_STANDARD_POOL = Object.freeze(["patrol-drone-t1", "pursuit-drone-t1", "shield-drone-t1"]);
const SECTOR_02_SUPPORT_POOL = Object.freeze(["patrol-drone-t1", "shield-drone-t1", "support-drone-t1"]);
const SECTOR_02_LATE_POOL = Object.freeze([
    "pursuit-drone-t1",
    "shield-drone-t1",
    "support-drone-t1",
    "artillery-drone-t1"
]);

function pooledSentry(areaId, id, x, y, allowedEnemyTypes, { width = 640, height = 480, accessModuleId = null } = {}) {
    return worldObject(`${areaId}:${id}`, "sentry", x, y, {
        enemyType: "sentry-t1",
        enemySelection: { allowedEnemyTypes },
        ...(accessModuleId ? { accessModuleId } : {}),
        activationSpec: objectTriggerSpec("center", width, height),
        rules: ["kill-optional", "no-rope-cut", "activation-band-only"]
    });
}

const block01 = exitBlock({
    areaId: "sector-02-01",
    deckX: 536,
    deckTopY: -768,
    deckWidth: 320,
    nextAreaId: "sector-02-02",
    panelObjectiveId: "sector-02-01:exit-panel-engaged",
    panelProperties: { requiredObjectiveIds: ["sector-02-01:exit-reached"] }
});

const area01Id = "sector-02-01";
// REV8.1 (supersedes REV8.0's 1-7-shaped S-curve route). Diagonal rowhouse cut-through:
// LOWER ALLEY -> SMALL COURT -> MID UTILITY -> LAUNDRY OFFSET -> UPPER GALLERY -> COMMUNITY TERRACE.
const area01Landmarks = [
    landmark(area01Id, "anchor-a", -384, -384, -176, "A"),
    landmark(area01Id, "anchor-c", 224, 224, -352, "C"),
    landmark(area01Id, "anchor-e", 160, 160, -576, "E"),
    landmark(area01Id, "anchor-g", 416, 416, -752, "G")
];
const [anchorA, anchorC, anchorE, anchorG] = area01Landmarks;
const gripB = structuralGrip(area01Id, "grip-b-surface", -96, -256);
const gripD = structuralGrip(area01Id, "grip-d-surface", 160, -464);
const gripF = structuralGrip(area01Id, "grip-f-surface", 416, -640);
const area01Objective = reachExitObjective(area01Id, block01.exit.x, block01.exit.y);
const area01PanelObjective = exitPanelObjective(area01Id, [area01Objective.id]);
const area01 = defineArea({
    id: area01Id,
    sectorId: "sector-02",
    order: 1,
    name: "WORKER BLOCK 12",
    subtitle: "RESIDENTIAL COURTYARD",
    bounds: { width: 1472, height: 832 },
    entry: point(`${area01Id}:entry`, -624, -32),
    exit: block01.exit,
    nextAreaId: "sector-02-02",
    surfaces: [
        horizontalSurface(area01Id, "entry-walk", -560, 0, 352, 32, "platform"),
        horizontalSurface(area01Id, "lower-alley", -448, -96, 288, 20, "platform"),
        horizontalSurface(area01Id, "r1", -192, -112, 224, 16, "recovery"),
        horizontalSurface(area01Id, "r2", 16, -208, 224, 16, "recovery"),
        horizontalSurface(area01Id, "small-court-landing", 96, -288, 256, 22, "platform"),
        horizontalSurface(area01Id, "r3", 160, -320, 224, 16, "recovery"),
        horizontalSurface(area01Id, "mid-utility-landing", 320, -384, 224, 22, "platform"),
        horizontalSurface(area01Id, "r4", -64, -416, 208, 16, "recovery"),
        horizontalSurface(area01Id, "laundry-landing", -32, -496, 256, 22, "platform"),
        horizontalSurface(area01Id, "upper-shared-gallery", 480, -672, 288, 22, "platform"),
        horizontalSurface(area01Id, "story-safe-landing", 288, -704, 256, 18, "safe-deck"),
        block01.deck,
        anchorA.surface,
        gripB,
        anchorC.surface,
        gripD,
        anchorE.surface,
        gripF,
        anchorG.surface
    ],
    routePoints: [
        point(`${area01Id}:route-entry`, -624, -32),
        point(`${area01Id}:route-lower-alley`, -448, -96),
        anchorA.route,
        point(`${area01Id}:route-b`, -96, -256),
        point(`${area01Id}:route-small-court`, 96, -288),
        anchorC.route,
        point(`${area01Id}:route-mid-utility`, 320, -384),
        point(`${area01Id}:route-d`, 160, -464),
        point(`${area01Id}:route-laundry-landing`, -32, -496),
        anchorE.route,
        point(`${area01Id}:route-f`, 416, -640),
        point(`${area01Id}:route-upper-gallery`, 480, -672),
        point(`${area01Id}:route-story-safe`, 288, -704),
        anchorG.route,
        block01.routeExit
    ],
    recoveryPoints: [
        point(`${area01Id}:recovery-r1`, -192, -128),
        point(`${area01Id}:recovery-r2`, 16, -224),
        point(`${area01Id}:recovery-r3`, 160, -336),
        point(`${area01Id}:recovery-r4`, -64, -432)
    ],
    objects: [
        anchorA.object,
        anchorC.object,
        anchorE.object,
        anchorG.object,
        // Legacy static Security residue (RUNTIME-HANDOFF: "Recommended: fixed sentry-t1" - the
        // Runtime pool default previously allowed patrol-drone-t1, but 2-2 owns "first moving
        // Patrol" as its reveal beat; a single-entry pool here makes Patrol structurally impossible).
        pooledSentry(area01Id, "courtyard-guard", 384, -384, ["sentry-t1"], {
            width: 384,
            height: 256
        }),
        worldObject(`${area01Id}:community-notice`, "story-display", 568, -768, {
            coordinateAnchor: "bottom-center",
            cueIds: ["evacuation-group-c", "wait-for-further-instruction"]
        }),
        block01.panel,
        block01.gateVisual
    ],
    objectives: [area01Objective, area01PanelObjective],
    gate: block01.gate,
    storyTriggers: ["block-12-entry", "lived-in-trace", "community-notice"],
    routes: ["safe", "flow", "recovery"],
    cueIds: ["worker-block-12", "residential-courtyard", "quiet-housing", "community-notice"]
});

const block02 = exitBlock({
    areaId: "sector-02-02",
    deckX: 160,
    deckTopY: -963,
    deckWidth: 320,
    nextAreaId: "sector-02-03",
    panelObjectiveId: "sector-02-02:exit-panel-engaged",
    panelProperties: { requiredObjectiveIds: ["sector-02-02:exit-reached"] }
});

const area02Id = "sector-02-02";
const area02Landmarks = [];
const area02Exit = point(`${area02Id}:exit`, 224, -1024);
const area02Objective = reachExitObjective(area02Id, area02Exit.x, area02Exit.y);
const area02PanelObjective = exitPanelObjective(area02Id, [area02Objective.id]);
const area02 = defineArea({
    id: area02Id,
    sectorId: "sector-02",
    order: 2,
    name: "PATROL WALKWAY",
    subtitle: "FIRST MOVING SECURITY",
    bounds: { width: 1280, height: 1088 },
    entry: point(`${area02Id}:entry`, -416, -32),
    exit: block02.exit,
    nextAreaId: "sector-02-03",
    surfaces: [
        platform(area02Id, "p0", -544, -288, 0),
        platform(area02Id, "p1", -320, 32, -256),
        platform(area02Id, "cover-a", -32, 96, -320, "cover"),
        platform(area02Id, "p2", -64, 480, -480),
        platform(area02Id, "cover-b", 160, 288, -608, "cover"),
        platform(area02Id, "p3", 32, 320, -704, "recovery"),
        block02.deck,
        ...area02Landmarks.map(({ surface }) => surface)
    ],
    routePoints: [
        point(`${area02Id}:route-entry`, -416, -32),
        point(`${area02Id}:route-p1`, -144, -256),
        point(`${area02Id}:route-p2`, 208, -480),
        point(`${area02Id}:route-p3`, 176, -704),
        block02.routeExit
    ],
    recoveryPoints: [point(`${area02Id}:recovery-lower`, -144, -280), point(`${area02Id}:recovery-upper`, 176, -728)],
    objects: [
        ...area02Landmarks.map(({ object }) => object),
        patrolDrone(area02Id, "drone-1", -320, -416, triggerBounds(-576, -672, 1152, 512), [
            { x: -320, y: -416 },
            { x: 320, y: -416 }
        ]),
        pooledSentry(area02Id, "upper-walkway-guard", 320, -704, SECTOR_02_STANDARD_POOL, {
            width: 512,
            height: 480,
            accessModuleId: "sector-02:access-module:a"
        }),
        block02.panel,
        block02.gateVisual
    ],
    objectives: [area02Objective, area02PanelObjective],
    gate: block02.gate,
    storyTriggers: ["patrol-cycle-reveal", "security-still-active"],
    routes: ["safe", "flow", "pressure", "recovery"],
    cueIds: ["patrol-walkway", "patrol-drone-t1", "security-still-active"]
});

const block03 = exitBlock({
    areaId: "sector-02-03",
    deckX: 304,
    deckTopY: -643,
    deckWidth: 288,
    nextAreaId: "sector-02-04",
    panelObjectiveId: "sector-02-03:exit-panel-engaged",
    panelProperties: { requiredObjectiveIds: ["sector-02-03:exit-reached"] }
});

const area03Id = "sector-02-03";
const area03Landmarks = [];
const area03Exit = point(`${area03Id}:exit`, 304, -704);
const area03Objective = Object.freeze({
    id: `${area03Id}:specialization-selected`,
    type: "interact-choice",
    sourceObjectId: `${area03Id}:specialization-node`
});
const area03PanelObjective = exitPanelObjective(area03Id, [area03Objective.id]);
const area03 = defineArea({
    id: area03Id,
    sectorId: "sector-02",
    order: 3,
    name: "RESIDENTIAL SERVICE NODE",
    subtitle: "AUGMENT SERVICE",
    bounds: { width: 960, height: 768 },
    entry: point(`${area03Id}:entry`, -288, -32),
    exit: block03.exit,
    nextAreaId: "sector-02-04",
    surfaces: [
        platform(area03Id, "p0", -416, -160, 0),
        platform(area03Id, "p1", -352, 32, -160, "safe-deck"),
        platform(area03Id, "p2", -224, 224, -384, "safe-deck"),
        platform(area03Id, "r1", -32, 224, -576, "recovery"),
        platform(area03Id, "p3", 96, 384, -672),
        block03.deck,
        ...area03Landmarks.map(({ surface }) => surface)
    ],
    routePoints: [
        point(`${area03Id}:route-entry`, -288, -32),
        point(`${area03Id}:route-p1`, -160, -160),
        point(`${area03Id}:route-p2`, 0, -384),
        point(`${area03Id}:route-r1`, 96, -576),
        point(`${area03Id}:route-p3`, 240, -672),
        block03.routeExit
    ],
    recoveryPoints: [point(`${area03Id}:recovery-r1`, 96, -600)],
    objects: [
        ...area03Landmarks.map(({ object }) => object),
        worldObject(`${area03Id}:specialization-node`, "augment-node", 0, -416, {
            interactionRadius,
            objectiveId: area03Objective.id,
            cueIds: ["foundation-detected", "specialization-available"]
        }),
        pooledSentry(area03Id, "node-approach-guard", -280, -160, SECTOR_02_SUPPORT_POOL, {
            width: 320,
            height: 256
        }),
        block03.panel,
        block03.gateVisual
    ],
    objectives: [area03Objective, area03PanelObjective],
    gate: block03.gate,
    storyTriggers: ["residential-service", "foundation-detected", "specialization-available"],
    routes: ["calibration", "recovery"],
    cueIds: ["residential-service-node", "foundation-detected", "specialization-placeholder"]
});

const block04 = exitBlock({
    areaId: "sector-02-04",
    deckX: 496,
    deckTopY: -1155,
    deckWidth: 288,
    nextAreaId: "sector-02-05",
    panelObjectiveId: "sector-02-04:exit-panel-engaged",
    panelProperties: { requiredObjectiveIds: ["sector-02-04:exit-reached"] }
});

const area04Id = "sector-02-04";
const area04Landmarks = [
    landmark(area04Id, "g1", -512, -384, -288),
    landmark(area04Id, "g3", -544, -416, -480),
    landmark(area04Id, "g5", -64, 64, -672),
    landmark(area04Id, "g7", -416, -288, -896),
    landmark(area04Id, "g8a", -128, 0, -1024)
];
const area04Exit = point(`${area04Id}:exit`, 496, -1216);
const area04Objective = reachExitObjective(area04Id, area04Exit.x, area04Exit.y);
const area04PanelObjective = exitPanelObjective(area04Id, [area04Objective.id]);
const area04 = defineArea({
    id: area04Id,
    sectorId: "sector-02",
    order: 4,
    name: "RESIDENTIAL STACK",
    subtitle: "MULTI-ROUTE HOUSING",
    bounds: { width: 1408, height: 1280 },
    entry: point(`${area04Id}:entry`, -448, -32),
    exit: block04.exit,
    nextAreaId: "sector-02-05",
    surfaces: [
        platform(area04Id, "p0", -576, -320, 0),
        platform(area04Id, "p1", -448, -64, -192),
        platform(area04Id, "s1", -640, -352, -384, "safe-deck"),
        platform(area04Id, "c1", -128, 160, -416),
        platform(area04Id, "s2", -640, -320, -608, "recovery"),
        platform(area04Id, "r2", -64, 352, -640, "recovery"),
        platform(area04Id, "p4", 160, 512, -704),
        platform(area04Id, "s3", -608, -288, -832, "recovery"),
        platform(area04Id, "r3", 288, 576, -864, "recovery"),
        platform(area04Id, "s4", -512, -192, -1056, "safe-deck"),
        platform(area04Id, "m3", 0, 352, -1088, "safe-deck"),
        platform(area04Id, "p7", 288, 608, -1216),
        block04.deck,
        ...area04Landmarks.map(({ surface }) => surface)
    ],
    routePoints: [
        point(`${area04Id}:route-entry`, -448, -32),
        point(`${area04Id}:route-p1`, -256, -192),
        point(`${area04Id}:route-c1`, 16, -416),
        point(`${area04Id}:route-r2`, 144, -640),
        point(`${area04Id}:route-p4`, 336, -704),
        point(`${area04Id}:route-r3`, 432, -864),
        point(`${area04Id}:route-m3`, 176, -1088),
        point(`${area04Id}:route-p7`, 448, -1216),
        block04.routeExit
    ],
    recoveryPoints: [
        point(`${area04Id}:recovery-s2`, -480, -632),
        point(`${area04Id}:recovery-r2`, 144, -664),
        point(`${area04Id}:recovery-s3`, -448, -856),
        point(`${area04Id}:recovery-r3`, 432, -888)
    ],
    objects: [
        ...area04Landmarks.map(({ object }) => object),
        patrolDrone(area04Id, "drone-1", -416, -768, triggerBounds(-640, -1120, 1280, 800), [
            { x: -416, y: -768 },
            { x: 416, y: -768 }
        ]),
        pooledSentry(area04Id, "route-choice-guard", 336, -704, SECTOR_02_SUPPORT_POOL, {
            width: 576,
            height: 480
        }),
        block04.panel,
        block04.gateVisual
    ],
    objectives: [area04Objective, area04PanelObjective],
    gate: block04.gate,
    storyTriggers: ["housing-density", "route-choice", "residential-scale"],
    routes: ["safe-left", "flow-centre", "pressure-right", "recovery"],
    cueIds: ["residential-stack", "multi-route", "patrol-drone-t1", "no-build-lock"]
});

const block05 = exitBlock({
    areaId: "sector-02-05",
    deckX: 464,
    deckTopY: -1027,
    deckWidth: 288,
    nextAreaId: "sector-02-06",
    panelObjectiveId: "sector-02-05:exit-panel-engaged",
    panelProperties: { requiredObjectiveIds: ["sector-02-05:exit-reached"] }
});

const area05Id = "sector-02-05";
const area05Landmarks = [landmark(area05Id, "g4", 256, 384, -576)];
const area05Exit = point(`${area05Id}:exit`, 464, -1088);
const area05Objective = reachExitObjective(area05Id, area05Exit.x, area05Exit.y);
const area05PanelObjective = exitPanelObjective(area05Id, [area05Objective.id]);
const area05 = defineArea({
    id: area05Id,
    sectorId: "sector-02",
    order: 5,
    name: "EVACUATION WALKWAY",
    subtitle: "UPPER TRANSIT RESTRICTED",
    bounds: { width: 1280, height: 1152 },
    entry: point(`${area05Id}:entry`, -480, -32),
    exit: block05.exit,
    nextAreaId: "sector-02-06",
    surfaces: [
        platform(area05Id, "p0", -608, -352, 0),
        platform(area05Id, "p1", -512, -192, -160),
        platform(area05Id, "s1", -512, -192, -352, "safe-deck"),
        platform(area05Id, "p2", -256, 448, -448),
        platform(area05Id, "p3", 224, 512, -672),
        rectangle(`${area05Id}:upper-transit-blockade`, 544, -416, 64, 320, {
            kind: "sealed-door",
            oneWay: false,
            grappleable: false,
            coordinateAnchor: "bottom-center"
        }),
        platform(area05Id, "r1", 64, 320, -832, "recovery"),
        platform(area05Id, "p4", 32, 320, -1024),
        block05.deck,
        ...area05Landmarks.map(({ surface }) => surface)
    ],
    routePoints: [
        point(`${area05Id}:route-entry`, -480, -32),
        point(`${area05Id}:route-p1`, -352, -160),
        point(`${area05Id}:route-s1`, -352, -352),
        point(`${area05Id}:route-p2`, 96, -448),
        point(`${area05Id}:route-p3`, 368, -672),
        point(`${area05Id}:route-r1`, 192, -832),
        point(`${area05Id}:route-p4`, 176, -1024),
        block05.routeExit
    ],
    recoveryPoints: [point(`${area05Id}:recovery-s1`, -352, -376), point(`${area05Id}:recovery-r1`, 192, -856)],
    objects: [
        ...area05Landmarks.map(({ object }) => object),
        patrolDrone(area05Id, "drone-1", -320, -512, triggerBounds(-576, -720, 1056, 480), [
            { x: -320, y: -512 },
            { x: 352, y: -512 }
        ]),
        pooledSentry(area05Id, "assembly-guard", 96, -448, SECTOR_02_SUPPORT_POOL, {
            width: 512,
            height: 384
        }),
        pooledSentry(area05Id, "upper-transit-guard", 368, -832, SECTOR_02_LATE_POOL, {
            width: 480,
            height: 448,
            accessModuleId: "sector-02:access-module:b"
        }),
        worldObject(`${area05Id}:upper-transit-gate`, "gate", 544, -576, {
            coordinateAnchor: "center",
            narrativeLock: true,
            cueIds: ["upper-transit-restricted", "transfer-authorization-pending"]
        }),
        worldObject(`${area05Id}:evacuation-status`, "story-display", 352, -704, {
            cueIds: ["assembly-complete", "transfer-authorization-pending", "upper-transit-restricted"]
        }),
        block05.panel,
        block05.gateVisual
    ],
    objectives: [area05Objective, area05PanelObjective],
    gate: block05.gate,
    storyTriggers: ["assembly-complete", "upper-transit-restricted", "maintenance-bypass"],
    routes: ["safe", "flow", "pressure", "maintenance-bypass", "recovery"],
    cueIds: ["evacuation-walkway", "assembly-complete", "upper-transit-restricted", "maintenance-bypass"]
});

const block06 = exitBlock({
    areaId: "sector-02-06",
    deckX: 544,
    deckTopY: -1091,
    deckWidth: 256,
    nextAreaId: "sector-02-07",
    panelObjectiveId: "sector-02-06:exit-panel-engaged",
    panelProperties: { requiredObjectiveIds: ["sector-02-06:exit-reached"] }
});

const area06Id = "sector-02-06";
const area06Landmarks = [landmark(area06Id, "g3", 192, 320, -544), landmark(area06Id, "g5", 288, 416, -736)];
const area06Exit = point(`${area06Id}:exit`, 544, -1152);
const area06Objective = reachExitObjective(area06Id, area06Exit.x, area06Exit.y);
const area06PanelObjective = exitPanelObjective(area06Id, [area06Objective.id]);
const area06 = defineArea({
    id: area06Id,
    sectorId: "sector-02",
    order: 6,
    name: "QUIET RESIDENTIAL VOID",
    subtitle: "RESIDENTIAL SCALE REVEAL",
    bounds: { width: 1472, height: 1216 },
    entry: point(`${area06Id}:entry`, -512, -32),
    exit: block06.exit,
    nextAreaId: "sector-02-07",
    surfaces: [
        platform(area06Id, "p0", -640, -384, 0),
        platform(area06Id, "p1", -576, -224, -160),
        platform(area06Id, "p2", -256, 96, -384),
        platform(area06Id, "r1", -96, 192, -640, "recovery"),
        platform(area06Id, "p4", -448, -160, -832, "recovery"),
        platform(area06Id, "r3", 224, 512, -832, "recovery"),
        platform(area06Id, "p5", -64, 320, -992),
        platform(area06Id, "p6", 320, 608, -1152),
        block06.deck,
        ...area06Landmarks.map(({ surface }) => surface)
    ],
    routePoints: [
        point(`${area06Id}:route-entry`, -512, -32),
        point(`${area06Id}:route-p1`, -400, -160),
        point(`${area06Id}:route-p2`, -80, -384),
        point(`${area06Id}:route-r1`, 48, -640),
        point(`${area06Id}:route-p4`, -304, -832),
        point(`${area06Id}:route-p5`, 128, -992),
        point(`${area06Id}:route-p6`, 464, -1152),
        block06.routeExit
    ],
    recoveryPoints: [
        point(`${area06Id}:recovery-r1`, 48, -664),
        point(`${area06Id}:recovery-p4`, -304, -856),
        point(`${area06Id}:recovery-r3`, 368, -856)
    ],
    objects: [
        ...area06Landmarks.map(({ object }) => object),
        pooledSentry(area06Id, "courtyard-left-guard", -304, -832, SECTOR_02_SUPPORT_POOL, {
            width: 576,
            height: 480
        }),
        pooledSentry(area06Id, "courtyard-right-guard", 368, -832, SECTOR_02_LATE_POOL, {
            width: 576,
            height: 480
        }),
        worldObject(`${area06Id}:courtyard-void`, "background-prop", 0, -608, {
            cueIds: ["residential-scale", "quiet-void"]
        }),
        block06.panel,
        block06.gateVisual
    ],
    objectives: [area06Objective, area06PanelObjective],
    gate: block06.gate,
    storyTriggers: ["quiet-courtyard", "residential-scale", "upper-route-preview"],
    routes: ["safe", "flow", "recovery"],
    cueIds: ["quiet-residential-void", "residential-scale", "no-enemy", "visual-relief"]
});

const block07 = exitBlock({
    areaId: "sector-02-07",
    deckX: 544,
    deckTopY: -1315,
    deckWidth: 256,
    nextAreaId: "sector-02-08",
    panelObjectiveId: "sector-02-07:exit-panel-engaged",
    panelProperties: { requiredObjectiveIds: ["sector-02-07:exit-reached"] }
});

const area07Id = "sector-02-07";
const area07Landmarks = [
    landmark(area07Id, "g2", -544, -416, -352),
    landmark(area07Id, "g4", -352, -224, -544),
    landmark(area07Id, "g7", -352, -224, -928),
    landmark(area07Id, "g8s", -224, -96, -1120)
];
const area07Exit = point(`${area07Id}:exit`, 544, -1376);
const area07Objective = reachExitObjective(area07Id, area07Exit.x, area07Exit.y);
const area07PanelObjective = exitPanelObjective(area07Id, [area07Objective.id]);
const area07 = defineArea({
    id: area07Id,
    sectorId: "sector-02",
    order: 7,
    name: "SHELTER ACCESS",
    subtitle: "EVACUATION TRANSFER SUSPENDED",
    bounds: { width: 1408, height: 1440 },
    entry: point(`${area07Id}:entry`, -480, -32),
    exit: block07.exit,
    nextAreaId: "sector-02-08",
    surfaces: [
        platform(area07Id, "p0", -608, -352, 0),
        platform(area07Id, "p1", -512, -160, -160),
        platform(area07Id, "s2", -608, -320, -448, "recovery"),
        platform(area07Id, "p3", -160, 160, -480),
        platform(area07Id, "r2", 288, 544, -480, "recovery"),
        platform(area07Id, "p4", -96, 224, -640),
        platform(area07Id, "p5", -320, 320, -800, "safe-deck"),
        platform(area07Id, "s4", -576, -288, -1024, "recovery"),
        platform(area07Id, "r4", 288, 544, -1024, "recovery"),
        platform(area07Id, "p7", -32, 320, -1216),
        platform(area07Id, "p8", 320, 608, -1376),
        block07.deck,
        ...area07Landmarks.map(({ surface }) => surface)
    ],
    routePoints: [
        point(`${area07Id}:route-entry`, -480, -32),
        point(`${area07Id}:route-p1`, -336, -160),
        point(`${area07Id}:route-p3`, 0, -480),
        point(`${area07Id}:route-p4`, 64, -640),
        point(`${area07Id}:route-p5`, 0, -800),
        point(`${area07Id}:route-r4`, 416, -1024),
        point(`${area07Id}:route-p7`, 144, -1216),
        point(`${area07Id}:route-p8`, 464, -1376),
        block07.routeExit
    ],
    recoveryPoints: [
        point(`${area07Id}:recovery-s2`, -464, -472),
        point(`${area07Id}:recovery-r2`, 416, -504),
        point(`${area07Id}:recovery-p5`, 0, -824),
        point(`${area07Id}:recovery-s4`, -432, -1048),
        point(`${area07Id}:recovery-r4`, 416, -1048)
    ],
    objects: [
        ...area07Landmarks.map(({ object }) => object),
        patrolDrone(area07Id, "drone-1", -416, -400, triggerBounds(-640, -640, 1280, 480), [
            { x: -416, y: -400 },
            { x: 256, y: -400 }
        ]),
        patrolDrone(area07Id, "drone-2", -320, -1080, triggerBounds(-640, -1320, 1280, 488), [
            { x: -320, y: -1080 },
            { x: 480, y: -1080 }
        ]),
        pooledSentry(area07Id, "shelter-centre-guard", 64, -640, SECTOR_02_LATE_POOL, {
            width: 640,
            height: 480,
            accessModuleId: "sector-02:access-module:c"
        }),
        worldObject(`${area07Id}:shelter-status`, "story-display", 0, -824, {
            cueIds: ["shelter-capacity-full", "evacuation-transfer-suspended", "remain-designated-area"]
        }),
        block07.panel,
        block07.gateVisual
    ],
    objectives: [area07Objective, area07PanelObjective],
    gate: block07.gate,
    storyTriggers: ["shelter-capacity-full", "transfer-suspended", "evacuation-platform-preview"],
    routes: ["safe", "flow", "pressure", "recovery"],
    cueIds: ["shelter-access", "two-patrol-bands", "no-crossfire", "transfer-suspended"]
});

const block08 = exitBlock({
    areaId: "sector-02-08",
    deckX: 432,
    deckTopY: -1411,
    deckWidth: 352,
    nextAreaId: null,
    panelObjectiveId: "sector-02-08:transfer-control-read",
    completionMode: "content-boundary"
});

const area08Id = "sector-02-08";
const area08Landmarks = [
    landmark(area08Id, "g1", -544, -416, -288),
    landmark(area08Id, "g2", 224, 352, -288),
    landmark(area08Id, "g4", 160, 288, -480),
    landmark(area08Id, "g6", 256, 384, -608),
    landmark(area08Id, "g8", -352, -224, -960),
    landmark(area08Id, "g8s", -224, -96, -1184)
];
const area08Exit = point(`${area08Id}:exit`, 576, -1472);
const area08Objective = Object.freeze({
    id: `${area08Id}:transfer-control-read`,
    type: "interact",
    sourceObjectId: `${area08Id}:exit-panel`
});
const area08 = defineArea({
    id: area08Id,
    sectorId: "sector-02",
    order: 8,
    name: "EVACUATION PLATFORM",
    subtitle: "GROUP C TRANSFER SUSPENDED",
    bounds: { width: 1536, height: 1536 },
    entry: point(`${area08Id}:entry`, -512, -32),
    exit: block08.exit,
    nextAreaId: null,
    surfaces: [
        platform(area08Id, "p0", -640, -384, 0),
        platform(area08Id, "p1", -512, -128, -160),
        platform(area08Id, "p2", -160, 160, -320),
        platform(area08Id, "s2", -672, -352, -448, "recovery"),
        platform(area08Id, "b2", 288, 608, -448, "recovery"),
        platform(area08Id, "m2", -224, 224, -736, "safe-deck"),
        platform(area08Id, "s5", -576, -288, -1088, "recovery"),
        platform(area08Id, "b5", 288, 576, -1088, "recovery"),
        platform(area08Id, "p9", -160, 224, -1280, "safe-deck"),
        block08.deck,
        ...area08Landmarks.map(({ surface }) => surface)
    ],
    routePoints: [
        point(`${area08Id}:route-entry`, -512, -32),
        point(`${area08Id}:route-p1`, -320, -160),
        point(`${area08Id}:route-p2`, 0, -320),
        point(`${area08Id}:route-m2`, 0, -736),
        point(`${area08Id}:route-b5`, 432, -1088),
        point(`${area08Id}:route-p9`, 32, -1280),
        point(`${area08Id}:route-p10`, 432, -1472),
        block08.routeExit
    ],
    recoveryPoints: [
        point(`${area08Id}:recovery-s2`, -512, -472),
        point(`${area08Id}:recovery-b2`, 448, -472),
        point(`${area08Id}:recovery-m2`, 0, -760),
        point(`${area08Id}:recovery-s5`, -432, -1112),
        point(`${area08Id}:recovery-b5`, 432, -1112),
        point(`${area08Id}:recovery-p9`, 32, -1304)
    ],
    checkpoints: [
        point(`${area08Id}:sector-end-checkpoint`, 576, -1472, {
            sourceObjectId: `${area08Id}:sector-end-checkpoint-object`
        })
    ],
    objects: [
        ...area08Landmarks.map(({ object }) => object),
        patrolDrone(area08Id, "drone-1", -448, -544, triggerBounds(-704, -768, 1408, 608), [
            { x: -448, y: -544 },
            { x: 448, y: -544 }
        ]),
        patrolDrone(area08Id, "drone-2", -384, -1088, triggerBounds(-704, -1376, 1408, 576), [
            { x: -384, y: -1088 },
            { x: 480, y: -1088 }
        ]),
        pooledSentry(area08Id, "transfer-lower-guard", 448, -448, SECTOR_02_LATE_POOL, {
            width: 512,
            height: 480
        }),
        pooledSentry(area08Id, "transfer-upper-guard", 432, -1088, SECTOR_02_LATE_POOL, {
            width: 512,
            height: 480
        }),
        block08.panel,
        worldObject(`${area08Id}:sector-end-checkpoint-object`, "checkpoint", 576, -1472, {
            checkpointId: `${area08Id}:sector-end-checkpoint`
        }),
        block08.gateVisual
    ],
    objectives: [area08Objective],
    gate: block08.gate,
    storyTriggers: ["evacuation-platform", "transfer-control", "priority-access-active"],
    routes: ["safe-outer", "flow-centre", "pressure-right", "recovery"],
    cueIds: [
        "evacuation-platform",
        "two-patrol-bands",
        "group-a-b-complete",
        "group-c-suspended",
        "priority-access-active",
        "sector-end-checkpoint"
    ]
});

export const SECTOR_02_AREA_CATALOG = defineAreaCatalog({
    id: "sector-02-authored-mock",
    revision: "sector-02-scenarios-rev1-v2",
    areas: [area01, area02, area03, area04, area05, area06, area07, area08]
});
