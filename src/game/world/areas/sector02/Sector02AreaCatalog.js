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

function pooledSentry(
    areaId,
    id,
    x,
    y,
    allowedEnemyTypes,
    {
        width = 640,
        height = 480,
        accessModuleId = null,
        rules = ["kill-optional", "no-rope-cut", "activation-band-only"]
    } = {}
) {
    return worldObject(`${areaId}:${id}`, "sentry", x, y, {
        enemyType: "sentry-t1",
        enemySelection: { allowedEnemyTypes },
        ...(accessModuleId ? { accessModuleId } : {}),
        activationSpec: objectTriggerSpec("center", width, height),
        rules
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
    deckX: 736,
    deckTopY: -800,
    deckWidth: 256,
    nextAreaId: "sector-02-03",
    panelObjectiveId: "sector-02-02:exit-panel-engaged",
    panelProperties: { requiredObjectiveIds: ["sector-02-02:exit-reached"] }
});

const area02Id = "sector-02-02";
// REV8.0: SAFE OBSERVE -> COVER A -> MOVING LOS -> COVER B -> DISENGAGE -> SHORT RISE -> EXIT.
// Player transits the same long horizontal axis the Patrol Drone patrols (observe-first rule).
const area02Landmarks = [
    landmark(area02Id, "g1", -560, -560, -160, "G1"),
    landmark(area02Id, "g2", -240, -240, -352, "G2"),
    landmark(area02Id, "g4", 368, 368, -448, "G4"),
    landmark(area02Id, "g5", 608, 608, -640, "G5")
];
const [g1, g2, g4, g5] = area02Landmarks;
const g3Grip = structuralGrip(area02Id, "g3-surface", 80, -352);
const accessAnchorGrip = structuralGrip(area02Id, "access-anchor-surface", 416, -752);
const area02Objective = reachExitObjective(area02Id, block02.exit.x, block02.exit.y);
const area02PanelObjective = exitPanelObjective(area02Id, [area02Objective.id]);
const area02 = defineArea({
    id: area02Id,
    sectorId: "sector-02",
    order: 2,
    name: "PATROL WALKWAY",
    subtitle: "FIRST MOVING SECURITY",
    bounds: { width: 1792, height: 896 },
    entry: point(`${area02Id}:entry`, -768, -32),
    exit: block02.exit,
    nextAreaId: "sector-02-03",
    surfaces: [
        horizontalSurface(area02Id, "p0", -720, 0, 352, 32, "platform"),
        horizontalSurface(area02Id, "observation-deck", -464, -224, 352, 24, "safe-deck"),
        horizontalSurface(area02Id, "recovery-lower", -320, -288, 224, 16, "recovery"),
        horizontalSurface(area02Id, "cover-a-deck", -176, -416, 256, 22, "platform"),
        horizontalSurface(area02Id, "recovery-middle", 64, -320, 224, 16, "recovery"),
        horizontalSurface(area02Id, "central-deck", 64, -416, 224, 22, "platform"),
        horizontalSurface(area02Id, "recovery-far", 400, -448, 224, 16, "recovery"),
        horizontalSurface(area02Id, "disengage-deck", 512, -512, 288, 24, "safe-deck"),
        horizontalSurface(area02Id, "upper-landing", 608, -704, 288, 24, "safe-deck"),
        horizontalSurface(area02Id, "access-carrier-balcony", 256, -800, 224, 24, "platform"),
        // Static, non-grappleable, non-damaging LOS blockers (RUNTIME-HANDOFF: "safe option, not
        // mandatory waiting") - tall (height>width) so AreaDefinitionValidator requires bottom-center;
        // AREA-SPEC's cover (x,y) is the shape's CENTER (71/74's confirmed center-point convention).
        rectangle(`${area02Id}:cover-a`, -112, -432 + 80, 80, 160, {
            kind: "cover",
            grappleable: false,
            oneWay: false,
            losBlocker: true,
            coordinateAnchor: "bottom-center"
        }),
        rectangle(`${area02Id}:cover-b`, 240, -432 + 80, 80, 160, {
            kind: "cover",
            grappleable: false,
            oneWay: false,
            losBlocker: true,
            coordinateAnchor: "bottom-center"
        }),
        block02.deck,
        g1.surface,
        g2.surface,
        g3Grip,
        g4.surface,
        g5.surface,
        accessAnchorGrip
    ],
    routePoints: [
        point(`${area02Id}:route-entry`, -768, -32),
        g1.route,
        point(`${area02Id}:route-observation`, -464, -224),
        g2.route,
        point(`${area02Id}:route-g3`, 80, -352),
        g4.route,
        point(`${area02Id}:route-disengage`, 512, -512),
        g5.route,
        point(`${area02Id}:route-upper-landing`, 608, -704),
        block02.routeExit
    ],
    recoveryPoints: [
        point(`${area02Id}:recovery-point-lower`, -320, -304),
        point(`${area02Id}:recovery-point-middle`, 64, -336),
        point(`${area02Id}:recovery-point-far`, 400, -464),
        point(`${area02Id}:recovery-point-access`, 416, -720)
    ],
    objects: [
        g1.object,
        g2.object,
        g4.object,
        g5.object,
        // Preserve exact Patrol contract (RUNTIME-HANDOFF: "do not rewrite AI") - only the local
        // Y/path staging moves to the new horizontal transit axis.
        patrolDrone(area02Id, "drone-1", -320, -384, triggerBounds(-640, -640, 1280, 512), [
            { x: -320, y: -384 },
            { x: 320, y: -384 }
        ]),
        // Access Carrier moved to the small post-lesson Access Alcove; activates only after the
        // Access branch is committed, so it cannot crossfire with the main Patrol lesson.
        pooledSentry(area02Id, "upper-walkway-guard", 256, -800, SECTOR_02_STANDARD_POOL, {
            width: 384,
            height: 192,
            accessModuleId: "sector-02:access-module:a"
        }),
        worldObject(`${area02Id}:security-status`, "story-display", 608, -704, {
            cueIds: ["security-patrol-active", "residential-transit-restricted"]
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
    deckX: 560,
    deckTopY: -288,
    deckWidth: 224,
    nextAreaId: "sector-02-04",
    panelObjectiveId: "sector-02-03:exit-panel-engaged",
    panelProperties: { requiredObjectiveIds: ["sector-02-03:specialization-selected"] }
});

const area03Id = "sector-02-03";
// REV8.0: ACTIVE APPROACH -> G1 OVER SERVICE CORE -> SAFE COMMUNAL HALL -> NODE -> FLAT EXIT.
// Second generic Augment offer (stable source ID/objective ID preserved) - no calibration route.
const g1Landmark = landmark(area03Id, "g1", -160, -160, -352, "G1");
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
    bounds: { width: 1344, height: 576 },
    entry: point(`${area03Id}:entry`, -576, -32),
    exit: block03.exit,
    nextAreaId: "sector-02-04",
    surfaces: [
        horizontalSurface(area03Id, "p0", -544, 0, 256, 32, "platform"),
        horizontalSurface(area03Id, "approach-deck", -416, -128, 256, 22, "platform"),
        // Service Core: static/non-grappleable/non-damaging LOS blocker between the approach Guard
        // and the chooser Hall (RUNTIME-HANDOFF: "Guard must not maintain direct authored LOS into
        // chooser Hall"). Tall (height>width) so bottom-center anchor is required; AREA-SPEC's (x,y)
        // is the shape's center (confirmed center-point convention).
        rectangle(`${area03Id}:service-core`, -64, -208 + 144, 64, 288, {
            kind: "solid",
            grappleable: false,
            oneWay: false,
            losBlocker: true,
            coordinateAnchor: "bottom-center"
        }),
        horizontalSurface(area03Id, "choice-floor", 288, -256, 640, 26, "safe-deck"),
        block03.deck,
        g1Landmark.surface
    ],
    routePoints: [
        point(`${area03Id}:route-entry`, -576, -32),
        point(`${area03Id}:route-approach`, -416, -128),
        g1Landmark.route,
        point(`${area03Id}:route-safe-hall-landing`, 96, -256),
        point(`${area03Id}:route-node`, 256, -256),
        block03.routeExit
    ],
    recoveryPoints: [point(`${area03Id}:recovery-threshold-fallback`, 96, -272)],
    objects: [
        g1Landmark.object,
        worldObject(`${area03Id}:specialization-node`, "augment-node", 256, -256, {
            interactionRadius,
            objectiveId: area03Objective.id,
            stableSourceId: `${area03Id}:specialization-node`,
            cueIds: ["grapple-device-detected", "emergency-configuration-active"]
        }),
        // Single preserved slot; approach-band-only activation, kill optional, Node access does
        // not require Guard death.
        pooledSentry(area03Id, "node-approach-guard", -384, -128, SECTOR_02_SUPPORT_POOL, {
            width: 320,
            height: 224
        }),
        block03.panel,
        block03.gateVisual
    ],
    objectives: [area03Objective, area03PanelObjective],
    gate: block03.gate,
    storyTriggers: ["augment-service-node", "grapple-device-detected", "emergency-configuration-active"],
    routes: ["safe", "recovery"],
    cueIds: ["residential-service-node", "second-generic-augment-source"]
});

const block04 = exitBlock({
    areaId: "sector-02-04",
    deckX: 720,
    deckTopY: -992,
    deckWidth: 320,
    nextAreaId: "sector-02-05",
    panelObjectiveId: "sector-02-04:exit-panel-engaged",
    panelProperties: { requiredObjectiveIds: ["sector-02-04:exit-reached"] }
});

const area04Id = "sector-02-04";
// REV8.0: ENTRY -> REVEAL -> FIRST BRAID (safe/flow/pressure) -> SWITCH -> SECOND BRAID -> MERGE
// -> EXIT. Safe/Flow/Pressure are risk STYLES, not permanent lanes - Switch Deck lets the player
// change style; recovery zones re-enter a different style. All 11 grip points are unlabeled
// "structural-grapple-target" grips (AREA-SPEC's own grappleTargets[] carries no matching visible
// landmark object for any of them).
const area04Grips = {
    gSafeA: structuralGrip(area04Id, "g-safe-a-surface", -560, -320),
    gSafeX: structuralGrip(area04Id, "g-safe-x-surface", -352, -480),
    gFlowA: structuralGrip(area04Id, "g-flow-a-surface", -336, -352),
    gPressA: structuralGrip(area04Id, "g-press-a-surface", -304, -256),
    gSafeB: structuralGrip(area04Id, "g-safe-b-surface", -352, -672),
    gSafeM1: structuralGrip(area04Id, "g-safe-m1-surface", -192, -848),
    gSafeM2: structuralGrip(area04Id, "g-safe-m2-surface", 96, -896),
    gFlowB1: structuralGrip(area04Id, "g-flow-b1-surface", 64, -672),
    gFlowB2: structuralGrip(area04Id, "g-flow-b2-surface", 320, -768),
    gPressB: structuralGrip(area04Id, "g-press-b-surface", 224, -608),
    gFinal: structuralGrip(area04Id, "g-final-surface", 560, -960)
};
const area04Objective = reachExitObjective(area04Id, block04.exit.x, block04.exit.y);
const area04PanelObjective = exitPanelObjective(area04Id, [area04Objective.id]);
const area04 = defineArea({
    id: area04Id,
    sectorId: "sector-02",
    order: 4,
    name: "RESIDENTIAL STACK",
    subtitle: "MULTI-ROUTE HOUSING",
    bounds: { width: 1984, height: 1088 },
    entry: point(`${area04Id}:entry`, -864, -32),
    exit: block04.exit,
    nextAreaId: "sector-02-05",
    surfaces: [
        horizontalSurface(area04Id, "p0", -816, 0, 320, 32, "platform"),
        horizontalSurface(area04Id, "reveal-deck", -672, -160, 384, 24, "safe-deck"),
        horizontalSurface(area04Id, "safe-a", -672, -384, 288, 22, "safe-deck"),
        horizontalSurface(area04Id, "flow-a", -176, -416, 256, 22, "platform"),
        horizontalSurface(area04Id, "pressure-a", 64, -352, 320, 22, "platform"),
        horizontalSurface(area04Id, "recovery-a", -224, -480, 352, 18, "recovery"),
        horizontalSurface(area04Id, "switch-deck", -64, -544, 448, 26, "safe-deck"),
        horizontalSurface(area04Id, "safe-b", -448, -768, 320, 22, "safe-deck"),
        horizontalSurface(area04Id, "flow-b", 176, -832, 256, 22, "platform"),
        horizontalSurface(area04Id, "pressure-b", 512, -672, 352, 22, "platform"),
        horizontalSurface(area04Id, "recovery-b", 64, -704, 352, 18, "recovery"),
        horizontalSurface(area04Id, "right-recovery", 416, -832, 288, 18, "recovery"),
        horizontalSurface(area04Id, "merge-deck", 288, -928, 512, 26, "safe-deck"),
        block04.deck,
        ...Object.values(area04Grips)
    ],
    routePoints: [
        point(`${area04Id}:route-entry`, -864, -32),
        point(`${area04Id}:route-reveal`, -672, -160),
        point(`${area04Id}:route-safe-a-grip`, -560, -320),
        point(`${area04Id}:route-safe-a`, -672, -384),
        point(`${area04Id}:route-safe-x-grip`, -352, -480),
        point(`${area04Id}:route-flow-a-grip`, -336, -352),
        point(`${area04Id}:route-flow-a`, -176, -416),
        point(`${area04Id}:route-press-a-grip`, -304, -256),
        point(`${area04Id}:route-pressure-a`, 64, -352),
        point(`${area04Id}:route-switch`, -64, -544),
        point(`${area04Id}:route-safe-b-grip`, -352, -672),
        point(`${area04Id}:route-safe-b`, -448, -768),
        point(`${area04Id}:route-safe-m1-grip`, -192, -848),
        point(`${area04Id}:route-safe-m2-grip`, 96, -896),
        point(`${area04Id}:route-flow-b1-grip`, 64, -672),
        point(`${area04Id}:route-flow-b2-grip`, 320, -768),
        point(`${area04Id}:route-flow-b`, 176, -832),
        point(`${area04Id}:route-press-b-grip`, 224, -608),
        point(`${area04Id}:route-pressure-b`, 512, -672),
        point(`${area04Id}:route-right-recovery`, 416, -832),
        point(`${area04Id}:route-merge`, 288, -928),
        point(`${area04Id}:route-final-grip`, 560, -960),
        block04.routeExit
    ],
    recoveryPoints: [
        point(`${area04Id}:recovery-point-a`, -224, -498),
        point(`${area04Id}:recovery-point-b`, 64, -722),
        point(`${area04Id}:recovery-point-right`, 416, -850)
    ],
    objects: [
        // Route Guard: first braid only, kill optional, no kill gate.
        pooledSentry(area04Id, "route-choice-guard", 96, -352, SECTOR_02_SUPPORT_POOL, {
            width: 384,
            height: 288
        }),
        patrolDrone(area04Id, "drone-1", -128, -736, triggerBounds(-448, -960, 1216, 448), [
            { x: -128, y: -736 },
            { x: 544, y: -736 }
        ]),
        block04.panel,
        block04.gateVisual
    ],
    objectives: [area04Objective, area04PanelObjective],
    gate: block04.gate,
    storyTriggers: ["housing-density", "route-choice", "residential-scale"],
    routes: ["safe", "flow", "pressure", "recovery"],
    cueIds: ["residential-stack", "multi-route", "patrol-drone-t1", "no-build-lock"]
});

const block05 = exitBlock({
    areaId: "sector-02-05",
    deckX: 80,
    deckTopY: -64,
    deckWidth: 256,
    nextAreaId: "sector-02-06",
    panelObjectiveId: "sector-02-05:exit-panel-engaged",
    panelProperties: { requiredObjectiveIds: ["sector-02-05:exit-reached"] }
});

const area05Id = "sector-02-05";
// REV8.0: PUBLIC FUNNEL -> G1/G2/G3/G4 PRESSURE NECK -> SAFE GATE STORY -> SERVICE HATCH ->
// DROP 1 -> MAINTENANCE SHELF -> DROP 2 -> LOW EXIT. The public Gate never opens in 2-5. All 7
// grips are unlabeled structural-grapple-target (no matching visible landmark object authored).
const area05Grips = {
    g1: structuralGrip(area05Id, "g1-surface", -560, -224),
    g2: structuralGrip(area05Id, "g2-surface", -192, -320),
    g3: structuralGrip(area05Id, "g3-surface", 160, -384),
    g4: structuralGrip(area05Id, "g4-surface", 512, -448),
    g5: structuralGrip(area05Id, "g5-surface", 464, -336),
    accessAnchor: structuralGrip(area05Id, "access-anchor-surface", 320, -320),
    g6: structuralGrip(area05Id, "g6-surface", 96, -96)
};
const area05Objective = reachExitObjective(area05Id, block05.exit.x, block05.exit.y);
const area05PanelObjective = exitPanelObjective(area05Id, [area05Objective.id]);
const area05 = defineArea({
    id: area05Id,
    sectorId: "sector-02",
    order: 5,
    name: "EVACUATION WALKWAY",
    subtitle: "UPPER TRANSIT RESTRICTED",
    bounds: { width: 1984, height: 704 },
    entry: point(`${area05Id}:entry`, -864, -32),
    exit: block05.exit,
    nextAreaId: "sector-02-06",
    surfaces: [
        horizontalSurface(area05Id, "p0", -832, 0, 320, 32, "platform"),
        horizontalSurface(area05Id, "assembly-concourse", -640, -128, 384, 24, "platform"),
        horizontalSurface(area05Id, "queue-shelf-a", -448, -256, 192, 20, "platform"),
        horizontalSurface(area05Id, "public-recovery", -96, -192, 256, 18, "recovery"),
        horizontalSurface(area05Id, "transit-neck", 160, -416, 128, 20, "platform"),
        horizontalSurface(area05Id, "story-forecourt", 576, -480, 256, 24, "safe-deck"),
        horizontalSurface(area05Id, "service-hatch-lip", 720, -576, 96, 18, "platform"),
        horizontalSurface(area05Id, "maintenance-shelf", 432, -272, 128, 20, "platform"),
        horizontalSurface(area05Id, "drop1-recovery", 688, -160, 192, 18, "recovery"),
        // Real gameplay dividers (not visual only) - mercy for a missed Drop, not a challenge
        // bypass: block walking from Recovery into the successful route. Tall (height>width) so
        // bottom-center anchor is required; AREA-SPEC's (x,y) is the shape's center.
        rectangle(`${area05Id}:drop1-divider`, 532, -200 + 136, 24, 272, {
            kind: "solid",
            grappleable: false,
            oneWay: false,
            coordinateAnchor: "bottom-center"
        }),
        horizontalSurface(area05Id, "carrier-alcove", 208, -272, 160, 20, "platform"),
        horizontalSurface(area05Id, "drop2-recovery", 384, -80, 160, 16, "recovery"),
        rectangle(`${area05Id}:drop2-divider`, 244, -88 + 88, 24, 176, {
            kind: "solid",
            grappleable: false,
            oneWay: false,
            coordinateAnchor: "bottom-center"
        }),
        block05.deck,
        ...Object.values(area05Grips)
    ],
    routePoints: [
        point(`${area05Id}:route-entry`, -864, -32),
        point(`${area05Id}:route-assembly`, -640, -128),
        point(`${area05Id}:route-g1`, -560, -224),
        point(`${area05Id}:route-queue-a`, -448, -256),
        point(`${area05Id}:route-g2`, -192, -320),
        point(`${area05Id}:route-g3`, 160, -384),
        point(`${area05Id}:route-g4`, 512, -448),
        point(`${area05Id}:route-story-forecourt`, 576, -480),
        point(`${area05Id}:route-service-hatch`, 720, -558),
        point(`${area05Id}:route-g5`, 464, -336),
        point(`${area05Id}:route-maintenance-shelf`, 432, -272),
        point(`${area05Id}:route-g6`, 96, -96),
        block05.routeExit
    ],
    recoveryPoints: [
        point(`${area05Id}:recovery-point-public`, -96, -210),
        point(`${area05Id}:recovery-point-drop1`, 688, -178),
        point(`${area05Id}:recovery-point-drop2`, 384, -96)
    ],
    objects: [
        // Preserve exact Patrol contract, reoriented to a vertical segment.
        patrolDrone(area05Id, "drone-1", -288, -264, triggerBounds(-448, -496, 320, 464), [
            { x: -288, y: -160 },
            { x: -288, y: -368 }
        ]),
        // Support Pool assembly guard, transit-neck phase only, kill optional, no Story pressure.
        pooledSentry(area05Id, "assembly-guard", 288, -416, SECTOR_02_SUPPORT_POOL, {
            width: 320,
            height: 320
        }),
        // Late Pool Access Carrier B: kill required for Module B, but never gates the local exit.
        pooledSentry(area05Id, "upper-transit-guard", 208, -272, SECTOR_02_LATE_POOL, {
            width: 320,
            height: 288,
            accessModuleId: "sector-02:access-module:b",
            rules: [
                "kill-optional-for-stage-exit",
                "kill-required-for-access-module",
                "no-rope-cut",
                "activation-band-only"
            ]
        }),
        // Sealed public Gate - never opens in 2-5, no override interaction.
        worldObject(`${area05Id}:upper-transit-gate`, "gate", 788, -480, {
            coordinateAnchor: "center",
            narrativeLock: true,
            grappleable: false,
            opensInStage: false,
            cueIds: ["upper-transit-restricted", "transfer-authorization-pending"]
        }),
        worldObject(`${area05Id}:evacuation-status`, "story-display", 608, -544, {
            cueIds: ["assembly-complete", "transfer-authorization-pending", "upper-transit-restricted"]
        }),
        block05.panel,
        block05.gateVisual
    ],
    objectives: [area05Objective, area05PanelObjective],
    gate: block05.gate,
    storyTriggers: ["assembly-complete", "upper-transit-restricted", "maintenance-bypass"],
    routes: ["main", "access", "recovery"],
    cueIds: ["evacuation-walkway", "assembly-complete", "upper-transit-restricted", "maintenance-bypass"]
});

const block06 = exitBlock({
    areaId: "sector-02-06",
    deckX: 800,
    deckTopY: -640,
    deckWidth: 256,
    nextAreaId: "sector-02-07",
    panelObjectiveId: "sector-02-06:exit-panel-engaged",
    panelProperties: { requiredObjectiveIds: ["sector-02-06:exit-reached"] }
});

const area06Id = "sector-02-06";
// REV8.0: SHORT RECOVERY LIFT -> SAFE REVEAL TURN -> QUIET UPPER RIM -> GAP A/GUARD A ->
// GAP B/GUARD B -> EXIT. Relief Stage - all Rope relations intentionally easy (<=273px).
const area06Landmarks = [
    landmark(area06Id, "g1", -704, -704, -224, "G1"),
    landmark(area06Id, "g2", -608, -608, -480, "G2"),
    landmark(area06Id, "g3", 192, 192, -576, "G3"),
    landmark(area06Id, "g4", 640, 640, -608, "G4")
];
const [area06G1, area06G2, area06G3, area06G4] = area06Landmarks;
const area06Objective = reachExitObjective(area06Id, block06.exit.x, block06.exit.y);
const area06PanelObjective = exitPanelObjective(area06Id, [area06Objective.id]);
const area06 = defineArea({
    id: area06Id,
    sectorId: "sector-02",
    order: 6,
    name: "QUIET RESIDENTIAL VOID",
    subtitle: "RESIDENTIAL SCALE REVEAL",
    bounds: { width: 1920, height: 832 },
    entry: point(`${area06Id}:entry`, -816, -32),
    exit: block06.exit,
    nextAreaId: "sector-02-07",
    surfaces: [
        horizontalSurface(area06Id, "p0", -800, 0, 320, 32, "platform"),
        horizontalSurface(area06Id, "lift-landing", -640, -288, 256, 22, "platform"),
        horizontalSurface(area06Id, "reveal-overlook", -448, -512, 384, 24, "safe-deck"),
        horizontalSurface(area06Id, "quiet-upper-rim", -128, -512, 320, 24, "safe-deck"),
        horizontalSurface(area06Id, "rim-landing-a", 320, -544, 256, 22, "platform"),
        horizontalSurface(area06Id, "recovery-a", 128, -384, 256, 18, "recovery"),
        horizontalSurface(area06Id, "rim-transfer", 480, -544, 224, 22, "platform"),
        horizontalSurface(area06Id, "recovery-b", 512, -448, 224, 18, "recovery"),
        horizontalSurface(area06Id, "final-residential-rim", 736, -576, 320, 22, "platform"),
        block06.deck,
        area06G1.surface,
        area06G2.surface,
        area06G3.surface,
        area06G4.surface
    ],
    routePoints: [
        point(`${area06Id}:route-entry`, -816, -32),
        area06G1.route,
        point(`${area06Id}:route-lift-landing`, -640, -288),
        area06G2.route,
        point(`${area06Id}:route-reveal-overlook`, -448, -512),
        point(`${area06Id}:route-quiet-upper-rim-edge`, 32, -512),
        area06G3.route,
        point(`${area06Id}:route-rim-landing-a`, 320, -544),
        point(`${area06Id}:route-rim-transfer`, 480, -544),
        area06G4.route,
        point(`${area06Id}:route-final-rim`, 736, -576),
        block06.routeExit
    ],
    recoveryPoints: [
        point(`${area06Id}:recovery-point-a`, 128, -402),
        point(`${area06Id}:recovery-point-b`, 512, -466)
    ],
    objects: [
        area06G1.object,
        area06G2.object,
        area06G3.object,
        area06G4.object,
        // Delayed security - activates only after Reveal/Quiet Rim, kill optional, no kill gate.
        // Representative bands approximated around each guard's own position (doc: "Suggested
        // band") - verified non-overlapping (left x:[192,512], right x:[528,880]).
        pooledSentry(area06Id, "courtyard-left-guard", 352, -544, SECTOR_02_SUPPORT_POOL, {
            width: 320,
            height: 160
        }),
        pooledSentry(area06Id, "courtyard-right-guard", 704, -576, SECTOR_02_LATE_POOL, {
            width: 352,
            height: 160
        }),
        // Story prop only - not collision, not a grapple field.
        worldObject(`${area06Id}:courtyard-void`, "background-prop", -160, -560, {
            cueIds: ["residential-scale", "quiet-void"],
            gameplayCollision: false
        }),
        block06.panel,
        block06.gateVisual
    ],
    objectives: [area06Objective, area06PanelObjective],
    gate: block06.gate,
    storyTriggers: ["quiet-courtyard", "residential-scale", "upper-route-preview"],
    routes: ["main", "recovery"],
    cueIds: ["quiet-residential-void", "residential-scale", "delayed-security", "visual-relief"]
});

const block07 = exitBlock({
    areaId: "sector-02-07",
    deckX: 640,
    deckTopY: -1248,
    deckWidth: 256,
    nextAreaId: "sector-02-08",
    panelObjectiveId: "sector-02-07:exit-panel-engaged",
    panelProperties: { requiredObjectiveIds: ["sector-02-07:exit-reached"] }
});

const area07Id = "sector-02-07";
// REV8.0: DIAGONAL SHELTER BUTTRESS -> SAFE SHELTER CORE -> VERTICAL TRANSFER MAST. All 7 grips
// are unlabeled structural-grapple-target (no matching visible landmark object authored).
const area07Grips = {
    g1: structuralGrip(area07Id, "g1-surface", -576, -240),
    g2: structuralGrip(area07Id, "g2-surface", -256, -416),
    g3: structuralGrip(area07Id, "g3-surface", 64, -592),
    accessAnchor: structuralGrip(area07Id, "access-anchor-surface", -64, -736),
    g4: structuralGrip(area07Id, "g4-surface", 416, -800),
    g5: structuralGrip(area07Id, "g5-surface", 128, -1056),
    g6: structuralGrip(area07Id, "g6-surface", 448, -1216)
};
const area07Objective = reachExitObjective(area07Id, block07.exit.x, block07.exit.y);
const area07PanelObjective = exitPanelObjective(area07Id, [area07Objective.id]);
const area07 = defineArea({
    id: area07Id,
    sectorId: "sector-02",
    order: 7,
    name: "SHELTER ACCESS",
    subtitle: "EVACUATION TRANSFER SUSPENDED",
    bounds: { width: 1792, height: 1312 },
    entry: point(`${area07Id}:entry`, -768, -32),
    exit: block07.exit,
    nextAreaId: "sector-02-08",
    surfaces: [
        horizontalSurface(area07Id, "p0", -736, 0, 320, 32, "platform"),
        horizontalSurface(area07Id, "buttress-a", -480, -320, 176, 22, "platform"),
        horizontalSurface(area07Id, "buttress-recovery", -128, -288, 256, 18, "recovery"),
        horizontalSurface(area07Id, "buttress-b", -144, -480, 160, 22, "platform"),
        horizontalSurface(area07Id, "shelter-core", 160, -672, 384, 26, "safe-deck"),
        horizontalSurface(area07Id, "carrier-alcove", -256, -768, 160, 20, "platform"),
        horizontalSurface(area07Id, "mast-landing-a", 448, -864, 144, 22, "platform"),
        horizontalSurface(area07Id, "low-mast-recovery", 512, -736, 160, 18, "recovery"),
        horizontalSurface(area07Id, "upper-mast-recovery", -32, -896, 160, 18, "recovery"),
        // Architectural stop that forces the diagonal-to-vertical axis turn (RUNTIME-HANDOFF /
        // AREA-SPEC's shelter-core-wall). The package omits explicit width/height for this solid -
        // sized as a judgment call (32 wide, tall enough to span from the Shelter Core deck up to
        // the Mast approach) and disclosed in PRODUCTION-ALIGNMENT.md.
        rectangle(`${area07Id}:shelter-core-wall`, 376, -688 + 128, 32, 256, {
            kind: "solid",
            grappleable: false,
            oneWay: false,
            coordinateAnchor: "bottom-center"
        }),
        block07.deck,
        ...Object.values(area07Grips)
    ],
    routePoints: [
        point(`${area07Id}:route-entry`, -768, -32),
        point(`${area07Id}:route-g1`, -576, -240),
        point(`${area07Id}:route-buttress-a`, -480, -320),
        point(`${area07Id}:route-g2`, -256, -416),
        point(`${area07Id}:route-buttress-b`, -144, -480),
        point(`${area07Id}:route-g3`, 64, -592),
        point(`${area07Id}:route-shelter-core`, 160, -672),
        point(`${area07Id}:route-story-core-right-edge`, 352, -672),
        point(`${area07Id}:route-g4`, 416, -800),
        point(`${area07Id}:route-mast-landing-a`, 448, -864),
        point(`${area07Id}:route-g5`, 128, -1056),
        point(`${area07Id}:route-g6`, 448, -1216),
        block07.routeExit
    ],
    recoveryPoints: [
        point(`${area07Id}:recovery-point-buttress`, -128, -306),
        point(`${area07Id}:recovery-point-low-mast`, 512, -754),
        point(`${area07Id}:recovery-point-upper-mast`, -32, -914)
    ],
    objects: [
        // Patrol A: diagonal same-axis synthesis, activation ends before Story Core.
        patrolDrone(area07Id, "drone-1", -320, -394, triggerBounds(-704, -656, 928, 448), [
            { x: -512, y: -304 },
            { x: 32, y: -560 }
        ]),
        // Patrol B: horizontal crossing while player climbs the vertical Mast. No overlap with A.
        patrolDrone(area07Id, "drone-2", 272, -992, triggerBounds(-64, -1136, 704, 288), [
            { x: 32, y: -992 },
            { x: 448, y: -992 }
        ]),
        // Access Carrier C: Late Pool, kill required for Module C only, never gates local exit.
        pooledSentry(area07Id, "shelter-centre-guard", -256, -768, SECTOR_02_LATE_POOL, {
            width: 320,
            height: 288,
            accessModuleId: "sector-02:access-module:c",
            rules: [
                "kill-optional-for-stage-exit",
                "kill-required-for-access-module",
                "no-rope-cut",
                "activation-band-only"
            ]
        }),
        worldObject(`${area07Id}:shelter-status`, "story-display", 96, -736, {
            cueIds: ["shelter-capacity-full", "evacuation-transfer-suspended", "remain-designated-area"]
        }),
        block07.panel,
        block07.gateVisual
    ],
    objectives: [area07Objective, area07PanelObjective],
    gate: block07.gate,
    storyTriggers: ["shelter-capacity-full", "transfer-suspended", "evacuation-platform-preview"],
    routes: ["main", "access", "recovery"],
    cueIds: ["shelter-access", "two-patrol-bands", "no-crossfire", "transfer-suspended"]
});

const block08 = exitBlock({
    areaId: "sector-02-08",
    deckX: 0,
    deckTopY: -1248,
    deckWidth: 448,
    nextAreaId: null,
    panelObjectiveId: "sector-02-08:transfer-control-read",
    completionMode: "content-boundary"
});

const area08Id = "sector-02-08";
// REV8.0 (SECTOR 02 FINALE): ARRIVAL FINGER -> CENTRAL HUB -> DEAD BOARDING LIP -> CONTROLLED
// DROP -> SAFE SUSPENDED RING -> RELAUNCH -> UPPER DEPARTURE ARM -> FINAL CONTROL. All 9 grips
// are unlabeled structural-grapple-target (no matching visible landmark object authored).
// AREA-SPEC's own objectives[] listed the sector-end checkpoint with an invalid "checkpoint" type
// (not in scripts/validateAreaSpecs.mjs's OBJECTIVE_TYPES) - removed from objectives (mechanical
// schema fix) since the actual Runtime checkpoint mechanism is the separate `checkpoints` area
// field + a kind:"checkpoint" world object, matching how 1-8's Sector-end checkpoint works.
const area08Grips = {
    g1: structuralGrip(area08Id, "g1-surface", -768, -224),
    g2: structuralGrip(area08Id, "g2-surface", -448, -384),
    g3: structuralGrip(area08Id, "g3-surface", -128, -544),
    g4: structuralGrip(area08Id, "g4-surface", 448, -736),
    g5: structuralGrip(area08Id, "g5-surface", 608, -512),
    g6: structuralGrip(area08Id, "g6-surface", 64, -704),
    g7: structuralGrip(area08Id, "g7-surface", -288, -832),
    g8: structuralGrip(area08Id, "g8-surface", -608, -992),
    g9: structuralGrip(area08Id, "g9-surface", -288, -1152)
};
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
    bounds: { width: 2304, height: 1408 },
    entry: point(`${area08Id}:entry`, -960, -32),
    exit: block08.exit,
    nextAreaId: null,
    surfaces: [
        horizontalSurface(area08Id, "p0", -928, 0, 320, 32, "platform"),
        horizontalSurface(area08Id, "arrival-a", -744, -288, 176, 22, "platform"),
        horizontalSurface(area08Id, "recovery-a", -320, -256, 288, 18, "recovery"),
        horizontalSurface(area08Id, "central-hub", 64, -608, 384, 26, "platform"),
        horizontalSurface(area08Id, "dead-boarding-lip", 576, -768, 256, 24, "platform"),
        horizontalSurface(area08Id, "transfer-ring", 544, -448, 384, 26, "safe-deck"),
        horizontalSurface(area08Id, "drop-recovery", 832, -320, 224, 18, "recovery"),
        // Real Ring Divider: miss-Recovery cannot walk directly onto the successful Ring route.
        rectangle(`${area08Id}:ring-divider`, 704, -405 + 115, 28, 230, {
            kind: "solid",
            grappleable: false,
            oneWay: false,
            coordinateAnchor: "bottom-center"
        }),
        horizontalSurface(area08Id, "recovery-c", -32, -640, 224, 18, "recovery"),
        horizontalSurface(area08Id, "recovery-d", -384, -768, 192, 18, "recovery"),
        horizontalSurface(area08Id, "upper-departure-arm", -608, -1024, 192, 22, "platform"),
        horizontalSurface(area08Id, "final-control-apron", 0, -1248, 448, 28, "safe-deck"),
        block08.deck,
        ...Object.values(area08Grips)
    ],
    routePoints: [
        point(`${area08Id}:route-entry`, -960, -32),
        point(`${area08Id}:route-g1`, -768, -224),
        point(`${area08Id}:route-g2`, -448, -384),
        point(`${area08Id}:route-g3`, -128, -544),
        point(`${area08Id}:route-central-hub`, 64, -608),
        point(`${area08Id}:route-g4`, 448, -736),
        point(`${area08Id}:route-dead-lip`, 576, -768),
        point(`${area08Id}:route-g5`, 608, -512),
        point(`${area08Id}:route-ring`, 544, -448),
        point(`${area08Id}:route-ring-left-edge`, 352, -448),
        point(`${area08Id}:route-g6`, 64, -704),
        point(`${area08Id}:route-g7`, -288, -832),
        point(`${area08Id}:route-g8`, -608, -992),
        point(`${area08Id}:route-g9`, -288, -1152),
        point(`${area08Id}:route-final-left-edge`, -224, -1248),
        block08.routeExit
    ],
    recoveryPoints: [
        point(`${area08Id}:recovery-point-a`, -320, -274),
        point(`${area08Id}:recovery-point-drop`, 832, -338),
        point(`${area08Id}:recovery-point-c`, -32, -658),
        point(`${area08Id}:recovery-point-d`, -384, -786)
    ],
    checkpoints: [
        point(`${area08Id}:sector-end-checkpoint`, 112, -1248, {
            sourceObjectId: `${area08Id}:sector-end-checkpoint-object`
        })
    ],
    objects: [
        // Patrol A: arrival-finger same-axis crossing. Band kept above -608 so it cannot
        // vertically overlap Patrol B's band (no representative crossfire between phases).
        patrolDrone(area08Id, "drone-1", -448, -392, triggerBounds(-864, -560, 800, 400), [
            { x: -704, y: -272 },
            { x: -160, y: -528 }
        ]),
        // Late Pool: Hub -> Dead Lip only, kill optional, no crossfire with other phases.
        pooledSentry(area08Id, "transfer-lower-guard", 288, -608, SECTOR_02_LATE_POOL, {
            width: 384,
            height: 288
        }),
        // Patrol B: central horizontal crossing during up-left relaunch, after Ring only.
        patrolDrone(area08Id, "drone-2", 0, -784, triggerBounds(-544, -960, 1088, 352), [
            { x: 320, y: -784 },
            { x: -320, y: -784 }
        ]),
        // Late Pool: Upper Departure Arm final pressure only.
        pooledSentry(area08Id, "transfer-upper-guard", -544, -992, SECTOR_02_LATE_POOL, {
            width: 384,
            height: 288
        }),
        block08.panel,
        worldObject(`${area08Id}:sector-end-checkpoint-object`, "checkpoint", 112, -1248, {
            checkpointId: `${area08Id}:sector-end-checkpoint`
        }),
        block08.gateVisual
    ],
    objectives: [area08Objective],
    gate: block08.gate,
    storyTriggers: ["evacuation-platform", "transfer-control", "priority-access-active"],
    routes: ["main", "recovery"],
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
