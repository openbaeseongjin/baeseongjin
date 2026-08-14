import {
    defineArea,
    defineAreaCatalog,
    grappleTarget,
    point,
    rectangle,
    triggerBounds,
    worldObject
} from "../AreaDefinition.js";

const interactionRadius = 72;

function middle(left, right) {
    return (left + right) * 0.5;
}

function platform(areaId, id, left, right, y, kind = "platform") {
    return rectangle(`${areaId}:${id}`, left, y, right - left, kind === "platform" ? 24 : 20, { kind });
}

function landmark(areaId, id, left, right, y) {
    const x = middle(left, right);
    const label = id.toUpperCase();
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
        trigger: triggerBounds(x - 48, y - 96, 96, 160),
        barrier: triggerBounds(x - 32, y - 96, 64, 128),
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

function exitPanel(areaId, exit, objective) {
    return worldObject(`${areaId}:exit-panel`, "gate-panel", exit.x - 112, exit.y + 32, {
        interactionRadius,
        objectiveId: objective.id,
        gateId: `${areaId}:gate`,
        requiredObjectiveIds: objective.requiredObjectiveIds
    });
}

function patrolDrone(areaId, id, x, y, activation, patrolPoints) {
    return worldObject(`${areaId}:${id}`, "patrol-drone", x, y, {
        enemyType: "patrol-drone-t1",
        activation,
        patrol: {
            points: patrolPoints,
            speed: 48,
            waitSeconds: 0.45,
            mode: "pingpong"
        },
        rules: ["kill-optional", "no-rope-cut", "target-lock-cycle", "activation-band-only"]
    });
}

const area01Id = "sector-02-01";
const area01Landmarks = [
    landmark(area01Id, "g1", -288, -160, -192),
    landmark(area01Id, "g2", 128, 256, -448),
    landmark(area01Id, "g3", 0, 128, -640),
    landmark(area01Id, "g4", -160, -32, -832)
];
const area01Exit = point(`${area01Id}:exit`, 416, -992);
const area01Objective = reachExitObjective(area01Id, area01Exit.x, area01Exit.y);
const area01PanelObjective = exitPanelObjective(area01Id, [area01Objective.id]);
const area01 = defineArea({
    id: area01Id,
    sectorId: "sector-02",
    order: 1,
    name: "WORKER BLOCK 12",
    subtitle: "RESIDENTIAL COURTYARD",
    bounds: { width: 1152, height: 1024 },
    entry: point(`${area01Id}:entry`, -304, -32),
    exit: area01Exit,
    nextAreaId: "sector-02-02",
    surfaces: [
        platform(area01Id, "p0", -416, -192, 0),
        platform(area01Id, "r1", -352, -128, -144, "recovery"),
        platform(area01Id, "p1", -192, 128, -288),
        platform(area01Id, "r2", 0, 224, -400, "recovery"),
        platform(area01Id, "p2", 192, 480, -544),
        platform(area01Id, "r3", -128, 96, -592, "recovery"),
        platform(area01Id, "p3", -448, -160, -736),
        platform(area01Id, "r4", -96, 128, -784, "recovery"),
        platform(area01Id, "p4", 32, 352, -928, "safe-deck"),
        platform(area01Id, "exit-deck", 288, 544, -992, "safe-deck"),
        ...area01Landmarks.map(({ surface }) => surface)
    ],
    routePoints: [
        point(`${area01Id}:route-entry`, -304, -32),
        area01Landmarks[0].route,
        point(`${area01Id}:route-p1`, -32, -288),
        area01Landmarks[1].route,
        point(`${area01Id}:route-p2`, 336, -544),
        area01Landmarks[2].route,
        point(`${area01Id}:route-p3`, -304, -736),
        area01Landmarks[3].route,
        point(`${area01Id}:route-p4`, 192, -928),
        point(`${area01Id}:route-exit`, area01Exit.x, area01Exit.y)
    ],
    recoveryPoints: [
        point(`${area01Id}:recovery-r1`, -240, -168),
        point(`${area01Id}:recovery-r2`, 112, -424),
        point(`${area01Id}:recovery-r3`, -16, -616),
        point(`${area01Id}:recovery-r4`, 16, -808)
    ],
    objects: [
        ...area01Landmarks.map(({ object }) => object),
        worldObject(`${area01Id}:community-notice`, "story-display", 160, -952, {
            cueIds: ["evacuation-group-c", "wait-for-further-instruction"]
        }),
        exitPanel(area01Id, area01Exit, area01PanelObjective),
        worldObject(`${area01Id}:exit-frame`, "gate", area01Exit.x, area01Exit.y, {
            gateId: `${area01Id}:gate`
        })
    ],
    objectives: [area01Objective, area01PanelObjective],
    gate: progressionGate(area01Id, area01Exit.x, area01Exit.y, "sector-02-02", [area01PanelObjective.id]),
    storyTriggers: ["block-12-entry", "lived-in-trace", "community-notice"],
    routes: ["safe", "flow", "recovery"],
    cueIds: ["worker-block-12", "residential-courtyard", "quiet-housing", "community-notice"]
});

const area02Id = "sector-02-02";
const area02Landmarks = [
    landmark(area02Id, "g1", -416, -288, -176),
    landmark(area02Id, "g2", 64, 192, -384),
    landmark(area02Id, "g3", 320, 448, -544),
    landmark(area02Id, "g4", -96, 32, -768),
    landmark(area02Id, "g5", -128, 0, -928)
];
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
    exit: area02Exit,
    nextAreaId: "sector-02-03",
    surfaces: [
        platform(area02Id, "p0", -544, -288, 0),
        platform(area02Id, "p1", -320, 32, -256),
        platform(area02Id, "cover-a", -32, 96, -320, "cover"),
        platform(area02Id, "p2", -64, 480, -480),
        platform(area02Id, "cover-b", 160, 288, -608, "cover"),
        platform(area02Id, "p3", 32, 320, -704, "recovery"),
        platform(area02Id, "exit-deck", 64, 384, -1024, "safe-deck"),
        ...area02Landmarks.map(({ surface }) => surface)
    ],
    routePoints: [
        point(`${area02Id}:route-entry`, -416, -32),
        area02Landmarks[0].route,
        point(`${area02Id}:route-p1`, -144, -256),
        area02Landmarks[1].route,
        point(`${area02Id}:route-p2`, 208, -480),
        area02Landmarks[2].route,
        point(`${area02Id}:route-p3`, 176, -704),
        area02Landmarks[3].route,
        area02Landmarks[4].route,
        point(`${area02Id}:route-exit`, area02Exit.x, area02Exit.y)
    ],
    recoveryPoints: [point(`${area02Id}:recovery-lower`, -144, -280), point(`${area02Id}:recovery-upper`, 176, -728)],
    objects: [
        ...area02Landmarks.map(({ object }) => object),
        patrolDrone(area02Id, "drone-1", -320, -416, triggerBounds(-576, -672, 1152, 512), [
            { x: -320, y: -416 },
            { x: 320, y: -416 }
        ]),
        exitPanel(area02Id, area02Exit, area02PanelObjective),
        worldObject(`${area02Id}:exit-frame`, "gate", area02Exit.x, area02Exit.y, {
            gateId: `${area02Id}:gate`
        })
    ],
    objectives: [area02Objective, area02PanelObjective],
    gate: progressionGate(area02Id, area02Exit.x, area02Exit.y, "sector-02-03", [area02PanelObjective.id]),
    storyTriggers: ["patrol-cycle-reveal", "security-still-active"],
    routes: ["safe", "flow", "pressure", "recovery"],
    cueIds: ["patrol-walkway", "patrol-drone-t1", "security-still-active"]
});

const area03Id = "sector-02-03";
const area03Landmarks = [landmark(area03Id, "g1", 128, 256, -512), landmark(area03Id, "g2", -96, 32, -608)];
const area03Exit = point(`${area03Id}:exit`, 304, -736);
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
    subtitle: "FIRST SPECIALIZATION",
    bounds: { width: 960, height: 768 },
    entry: point(`${area03Id}:entry`, -288, -32),
    exit: area03Exit,
    nextAreaId: "sector-02-04",
    surfaces: [
        platform(area03Id, "p0", -416, -160, 0),
        platform(area03Id, "p1", -352, 32, -160, "safe-deck"),
        platform(area03Id, "p2", -224, 224, -384, "safe-deck"),
        platform(area03Id, "r1", -32, 224, -576, "recovery"),
        platform(area03Id, "p3", 96, 384, -672),
        platform(area03Id, "exit-deck", 160, 448, -736, "safe-deck"),
        ...area03Landmarks.map(({ surface }) => surface)
    ],
    routePoints: [
        point(`${area03Id}:route-entry`, -288, -32),
        point(`${area03Id}:route-p1`, -160, -160),
        point(`${area03Id}:route-p2`, 0, -384),
        area03Landmarks[0].route,
        point(`${area03Id}:route-r1`, 96, -576),
        area03Landmarks[1].route,
        point(`${area03Id}:route-p3`, 240, -672),
        point(`${area03Id}:route-exit`, area03Exit.x, area03Exit.y)
    ],
    recoveryPoints: [point(`${area03Id}:recovery-r1`, 96, -600)],
    objects: [
        ...area03Landmarks.map(({ object }) => object),
        worldObject(`${area03Id}:specialization-node`, "augment-node", 0, -416, {
            interactionRadius,
            objectiveId: area03Objective.id,
            selectionPool: "TBD",
            requiresFoundation: true,
            perPlayerSelection: true,
            cueIds: ["foundation-detected", "specialization-available"]
        }),
        exitPanel(area03Id, area03Exit, area03PanelObjective),
        worldObject(`${area03Id}:exit-frame`, "gate", area03Exit.x, area03Exit.y, {
            gateId: `${area03Id}:gate`
        })
    ],
    objectives: [area03Objective, area03PanelObjective],
    gate: progressionGate(area03Id, area03Exit.x, area03Exit.y, "sector-02-04", [area03PanelObjective.id]),
    storyTriggers: ["residential-service", "foundation-detected", "specialization-available"],
    routes: ["calibration", "recovery"],
    cueIds: ["residential-service-node", "foundation-detected", "specialization-placeholder"]
});

const area04Id = "sector-02-04";
const area04Landmarks = [
    landmark(area04Id, "g1", -512, -384, -288),
    landmark(area04Id, "g2", -96, 32, -288),
    landmark(area04Id, "g3", -544, -416, -480),
    landmark(area04Id, "g4", 96, 224, -512),
    landmark(area04Id, "g5", -64, 64, -672),
    landmark(area04Id, "g6", 224, 352, -672),
    landmark(area04Id, "g7", -416, -288, -896),
    landmark(area04Id, "g8", 64, 192, -928),
    landmark(area04Id, "g8a", -128, 0, -1024),
    landmark(area04Id, "g9", 224, 352, -1152)
];
const area04Exit = point(`${area04Id}:exit`, 496, -1248);
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
    exit: area04Exit,
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
        platform(area04Id, "exit-deck", 352, 640, -1248, "safe-deck"),
        ...area04Landmarks.map(({ surface }) => surface)
    ],
    routePoints: [
        point(`${area04Id}:route-entry`, -448, -32),
        point(`${area04Id}:route-p1`, -256, -192),
        area04Landmarks[1].route,
        point(`${area04Id}:route-c1`, 16, -416),
        area04Landmarks[3].route,
        point(`${area04Id}:route-r2`, 144, -640),
        point(`${area04Id}:route-p4`, 336, -704),
        area04Landmarks[5].route,
        point(`${area04Id}:route-r3`, 432, -864),
        area04Landmarks[7].route,
        point(`${area04Id}:route-m3`, 176, -1088),
        area04Landmarks[9].route,
        point(`${area04Id}:route-p7`, 448, -1216),
        point(`${area04Id}:route-exit`, area04Exit.x, area04Exit.y)
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
        exitPanel(area04Id, area04Exit, area04PanelObjective),
        worldObject(`${area04Id}:exit-frame`, "gate", area04Exit.x, area04Exit.y, {
            gateId: `${area04Id}:gate`
        })
    ],
    objectives: [area04Objective, area04PanelObjective],
    gate: progressionGate(area04Id, area04Exit.x, area04Exit.y, "sector-02-05", [area04PanelObjective.id]),
    storyTriggers: ["housing-density", "route-choice", "residential-scale"],
    routes: ["safe-left", "flow-centre", "pressure-right", "recovery"],
    cueIds: ["residential-stack", "multi-route", "patrol-drone-t1", "no-build-lock"]
});

const area05Id = "sector-02-05";
const area05Landmarks = [
    landmark(area05Id, "g1", -448, -320, -256),
    landmark(area05Id, "g2", -224, -96, -288),
    landmark(area05Id, "g3", 32, 160, -560),
    landmark(area05Id, "g4", 256, 384, -576),
    landmark(area05Id, "g5", 256, 384, -768),
    landmark(area05Id, "g6", -64, 64, -928),
    landmark(area05Id, "g7", 224, 352, -1088)
];
const area05Exit = point(`${area05Id}:exit`, 464, -1120);
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
    exit: area05Exit,
    nextAreaId: "sector-02-06",
    surfaces: [
        platform(area05Id, "p0", -608, -352, 0),
        platform(area05Id, "p1", -512, -192, -160),
        platform(area05Id, "s1", -512, -192, -352, "safe-deck"),
        platform(area05Id, "p2", -256, 448, -448),
        platform(area05Id, "p3", 224, 512, -672),
        rectangle(`${area05Id}:upper-transit-blockade`, 512, -736, 64, 320, {
            kind: "sealed-door",
            oneWay: false,
            grappleable: false
        }),
        platform(area05Id, "r1", 64, 320, -832, "recovery"),
        platform(area05Id, "p4", 32, 320, -1024),
        platform(area05Id, "exit-deck", 320, 608, -1120, "safe-deck"),
        ...area05Landmarks.map(({ surface }) => surface)
    ],
    routePoints: [
        point(`${area05Id}:route-entry`, -480, -32),
        point(`${area05Id}:route-p1`, -352, -160),
        area05Landmarks[0].route,
        point(`${area05Id}:route-s1`, -352, -352),
        area05Landmarks[1].route,
        point(`${area05Id}:route-p2`, 96, -448),
        area05Landmarks[2].route,
        point(`${area05Id}:route-p3`, 368, -672),
        area05Landmarks[4].route,
        point(`${area05Id}:route-r1`, 192, -832),
        area05Landmarks[5].route,
        point(`${area05Id}:route-p4`, 176, -1024),
        area05Landmarks[6].route,
        point(`${area05Id}:route-exit`, area05Exit.x, area05Exit.y)
    ],
    recoveryPoints: [point(`${area05Id}:recovery-s1`, -352, -376), point(`${area05Id}:recovery-r1`, 192, -856)],
    objects: [
        ...area05Landmarks.map(({ object }) => object),
        patrolDrone(area05Id, "drone-1", -320, -512, triggerBounds(-576, -720, 1056, 480), [
            { x: -320, y: -512 },
            { x: 352, y: -512 }
        ]),
        worldObject(`${area05Id}:upper-transit-gate`, "gate", 544, -576, {
            narrativeLock: true,
            cueIds: ["upper-transit-restricted", "transfer-authorization-pending"]
        }),
        worldObject(`${area05Id}:evacuation-status`, "story-display", 352, -704, {
            cueIds: ["assembly-complete", "transfer-authorization-pending", "upper-transit-restricted"]
        }),
        exitPanel(area05Id, area05Exit, area05PanelObjective),
        worldObject(`${area05Id}:maintenance-frame`, "maintenance-frame", area05Exit.x, area05Exit.y, {
            gateId: `${area05Id}:gate`
        })
    ],
    objectives: [area05Objective, area05PanelObjective],
    gate: progressionGate(area05Id, area05Exit.x, area05Exit.y, "sector-02-06", [area05PanelObjective.id]),
    storyTriggers: ["assembly-complete", "upper-transit-restricted", "maintenance-bypass"],
    routes: ["safe", "flow", "pressure", "maintenance-bypass", "recovery"],
    cueIds: ["evacuation-walkway", "assembly-complete", "upper-transit-restricted", "maintenance-bypass"]
});

const area06Id = "sector-02-06";
const area06Landmarks = [
    landmark(area06Id, "g1", -416, -288, -256),
    landmark(area06Id, "g2", -128, 0, -512),
    landmark(area06Id, "g3", 192, 320, -544),
    landmark(area06Id, "g4", -288, -160, -704),
    landmark(area06Id, "g5", 288, 416, -736),
    landmark(area06Id, "g6", 32, 160, -896),
    landmark(area06Id, "g7", 192, 320, -1088)
];
const area06Exit = point(`${area06Id}:exit`, 544, -1184);
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
    exit: area06Exit,
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
        platform(area06Id, "exit-deck", 416, 672, -1184, "safe-deck"),
        ...area06Landmarks.map(({ surface }) => surface)
    ],
    routePoints: [
        point(`${area06Id}:route-entry`, -512, -32),
        point(`${area06Id}:route-p1`, -400, -160),
        area06Landmarks[0].route,
        point(`${area06Id}:route-p2`, -80, -384),
        area06Landmarks[1].route,
        point(`${area06Id}:route-r1`, 48, -640),
        area06Landmarks[3].route,
        point(`${area06Id}:route-p4`, -304, -832),
        area06Landmarks[5].route,
        point(`${area06Id}:route-p5`, 128, -992),
        area06Landmarks[6].route,
        point(`${area06Id}:route-p6`, 464, -1152),
        point(`${area06Id}:route-exit`, area06Exit.x, area06Exit.y)
    ],
    recoveryPoints: [
        point(`${area06Id}:recovery-r1`, 48, -664),
        point(`${area06Id}:recovery-p4`, -304, -856),
        point(`${area06Id}:recovery-r3`, 368, -856)
    ],
    objects: [
        ...area06Landmarks.map(({ object }) => object),
        worldObject(`${area06Id}:courtyard-void`, "background-prop", 0, -608, {
            cueIds: ["residential-scale", "quiet-void"]
        }),
        exitPanel(area06Id, area06Exit, area06PanelObjective),
        worldObject(`${area06Id}:exit-frame`, "gate", area06Exit.x, area06Exit.y, {
            gateId: `${area06Id}:gate`
        })
    ],
    objectives: [area06Objective, area06PanelObjective],
    gate: progressionGate(area06Id, area06Exit.x, area06Exit.y, "sector-02-07", [area06PanelObjective.id]),
    storyTriggers: ["quiet-courtyard", "residential-scale", "upper-route-preview"],
    routes: ["safe", "flow", "recovery"],
    cueIds: ["quiet-residential-void", "residential-scale", "no-enemy", "visual-relief"]
});

const area07Id = "sector-02-07";
const area07Landmarks = [
    landmark(area07Id, "g1", -416, -288, -256),
    landmark(area07Id, "g2", -544, -416, -352),
    landmark(area07Id, "g3", -96, 32, -352),
    landmark(area07Id, "g4", -352, -224, -544),
    landmark(area07Id, "g5", 192, 320, -544),
    landmark(area07Id, "g6", 32, 160, -736),
    landmark(area07Id, "g7", -352, -224, -928),
    landmark(area07Id, "g8", 64, 192, -928),
    landmark(area07Id, "g8s", -224, -96, -1120),
    landmark(area07Id, "g9", 160, 288, -1120),
    landmark(area07Id, "g10", 224, 352, -1312)
];
const area07Exit = point(`${area07Id}:exit`, 544, -1408);
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
    exit: area07Exit,
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
        platform(area07Id, "exit-deck", 416, 672, -1408, "safe-deck"),
        ...area07Landmarks.map(({ surface }) => surface)
    ],
    routePoints: [
        point(`${area07Id}:route-entry`, -480, -32),
        point(`${area07Id}:route-p1`, -336, -160),
        area07Landmarks[0].route,
        area07Landmarks[2].route,
        point(`${area07Id}:route-p3`, 0, -480),
        area07Landmarks[4].route,
        point(`${area07Id}:route-p4`, 64, -640),
        area07Landmarks[5].route,
        point(`${area07Id}:route-p5`, 0, -800),
        area07Landmarks[7].route,
        point(`${area07Id}:route-r4`, 416, -1024),
        area07Landmarks[9].route,
        point(`${area07Id}:route-p7`, 144, -1216),
        area07Landmarks[10].route,
        point(`${area07Id}:route-p8`, 464, -1376),
        point(`${area07Id}:route-exit`, area07Exit.x, area07Exit.y)
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
        worldObject(`${area07Id}:shelter-status`, "story-display", 0, -824, {
            cueIds: ["shelter-capacity-full", "evacuation-transfer-suspended", "remain-designated-area"]
        }),
        exitPanel(area07Id, area07Exit, area07PanelObjective),
        worldObject(`${area07Id}:exit-frame`, "gate", area07Exit.x, area07Exit.y, {
            gateId: `${area07Id}:gate`
        })
    ],
    objectives: [area07Objective, area07PanelObjective],
    gate: progressionGate(area07Id, area07Exit.x, area07Exit.y, "sector-02-08", [area07PanelObjective.id]),
    storyTriggers: ["shelter-capacity-full", "transfer-suspended", "evacuation-platform-preview"],
    routes: ["safe", "flow", "pressure", "recovery"],
    cueIds: ["shelter-access", "two-patrol-bands", "no-crossfire", "transfer-suspended"]
});

const area08Id = "sector-02-08";
const area08Landmarks = [
    landmark(area08Id, "g1", -544, -416, -288),
    landmark(area08Id, "g2a", 0, 128, -256),
    landmark(area08Id, "g2", 224, 352, -288),
    landmark(area08Id, "g3", -160, -32, -480),
    landmark(area08Id, "g4", 160, 288, -480),
    landmark(area08Id, "g5", -320, -192, -608),
    landmark(area08Id, "g6", 256, 384, -608),
    landmark(area08Id, "g7", -64, 64, -832),
    landmark(area08Id, "g8", -352, -224, -960),
    landmark(area08Id, "g9", 128, 256, -960),
    landmark(area08Id, "g8s", -224, -96, -1184),
    landmark(area08Id, "g10", -32, 96, -1184),
    landmark(area08Id, "g11", 160, 288, -1376)
];
const area08Exit = point(`${area08Id}:exit`, 576, -1440);
const area08Objective = Object.freeze({
    id: `${area08Id}:transfer-control-read`,
    type: "interact",
    sourceObjectId: `${area08Id}:transfer-control`
});
const area08 = defineArea({
    id: area08Id,
    sectorId: "sector-02",
    order: 8,
    name: "EVACUATION PLATFORM",
    subtitle: "GROUP C TRANSFER SUSPENDED",
    bounds: { width: 1536, height: 1536 },
    entry: point(`${area08Id}:entry`, -512, -32),
    exit: area08Exit,
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
        platform(area08Id, "p10", 256, 608, -1440, "safe-deck"),
        ...area08Landmarks.map(({ surface }) => surface)
    ],
    routePoints: [
        point(`${area08Id}:route-entry`, -512, -32),
        point(`${area08Id}:route-p1`, -320, -160),
        area08Landmarks[1].route,
        point(`${area08Id}:route-p2`, 0, -320),
        area08Landmarks[3].route,
        area08Landmarks[5].route,
        point(`${area08Id}:route-m2`, 0, -736),
        area08Landmarks[7].route,
        area08Landmarks[9].route,
        point(`${area08Id}:route-b5`, 432, -1088),
        area08Landmarks[11].route,
        point(`${area08Id}:route-p9`, 32, -1280),
        area08Landmarks[12].route,
        point(`${area08Id}:route-p10`, 432, -1440),
        point(`${area08Id}:route-exit`, area08Exit.x, area08Exit.y)
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
        point(`${area08Id}:sector-end-checkpoint`, 576, -1440, {
            sourceObjectId: `${area08Id}:sector-end-checkpoint-object`,
            reward: false
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
        worldObject(`${area08Id}:transfer-control`, "gate-panel", 448, -1472, {
            interactionRadius,
            objectiveId: area08Objective.id,
            gateId: `${area08Id}:gate`,
            cueIds: ["group-a-complete", "group-b-complete", "group-c-suspended", "priority-access-active"]
        }),
        worldObject(`${area08Id}:sector-end-checkpoint-object`, "checkpoint", 576, -1440, {
            checkpointId: `${area08Id}:sector-end-checkpoint`
        }),
        worldObject(`${area08Id}:content-boundary`, "gate", area08Exit.x, area08Exit.y, {
            gateId: `${area08Id}:gate`,
            cueIds: ["post-sector-transition-tbd"]
        })
    ],
    objectives: [area08Objective],
    gate: progressionGate(area08Id, area08Exit.x, area08Exit.y, null, [area08Objective.id], {
        completionMode: "content-boundary"
    }),
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
