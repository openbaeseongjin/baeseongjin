import {
    cameraZone,
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

function horizontalSurface(id, x, y, width, height = 32, properties = {}) {
    return rectangle(id, x, y, width, height, { ...properties, coordinateAnchor: "top-center" });
}

function groundedSurface(id, x, y, width, height, properties = {}) {
    return rectangle(id, x, y, width, height, { ...properties, coordinateAnchor: "bottom-center" });
}

function gate(id, x, y, nextAreaId, requiredObjectiveIds, { portalBottomY = y } = {}) {
    return Object.freeze({
        id,
        nextAreaId,
        requiredObjectiveIds: Object.freeze(requiredObjectiveIds),
        trigger: nextAreaId === null ? triggerBounds(x - 48, y - 96, 96, 160) : gatePortalBounds(x, portalBottomY),
        barrier: triggerBounds(x - 32, y - 64, 64, 96)
    });
}

const block01 = exitBlock({
    areaId: "sector-01-01",
    deckX: 128,
    deckTopY: -835,
    deckWidth: 320,
    nextAreaId: "sector-01-02",
    panelObjectiveId: "sector-01-01:terminal-read"
});

const area01 = defineArea({
    id: "sector-01-01",
    sectorId: "sector-01",
    order: 1,
    name: "SERVICE SHAFT",
    subtitle: "VERTICAL GRID CASCADE FAILURE",
    bounds: { width: 960, height: 960 },
    entry: point("sector-01-01:entry", -320, -32),
    exit: block01.exit,
    nextAreaId: "sector-01-02",
    surfaces: [
        horizontalSurface("sector-01-01:p0", 0, 0, 896, 32, {
            presentationId: "terrain:ground-foundation"
        }),
        horizontalSurface("sector-01-01:r1", -176, -224, 160, 16, { kind: "recovery" }),
        horizontalSurface("sector-01-01:p1", 160, -288, 192, 16),
        horizontalSurface("sector-01-01:r2", -192, -480, 192, 16, { kind: "recovery" }),
        horizontalSurface("sector-01-01:p2", -160, -544, 192, 16),
        horizontalSurface("sector-01-01:cable-overhang", 176, -608, 224, 32, {
            kind: "overhang",
            oneWay: false
        }),
        horizontalSurface("sector-01-01:r3", -144, -736, 160, 16, { kind: "recovery" }),
        horizontalSurface("sector-01-01:p3", 16, -800, 224, 16),
        block01.deck,
        groundedSurface("sector-01-01:ground-shutter", -384, 0, 128, 128, {
            kind: "sealed-door",
            oneWay: false
        }),
        grappleTarget("sector-01-01:anchor-a-surface", -96, -192),

        grappleTarget("sector-01-01:anchor-c-surface", -64, -704)
    ],
    routePoints: [
        point("sector-01-01:route-entry", -320, -32),
        point("sector-01-01:route-a", -96, -192, { landmark: "A" }),

        point("sector-01-01:route-c", -64, -704, { landmark: "C" }),
        block01.routeExit
    ],
    recoveryPoints: [
        point("sector-01-01:recovery-r1", -176, -248),
        point("sector-01-01:recovery-r2", -192, -504),
        point("sector-01-01:recovery-r3", -144, -760)
    ],
    objects: [
        worldObject("sector-01-01:anchor-a", "grapple-landmark", -96, -192, { label: "A" }),

        worldObject("sector-01-01:anchor-c", "grapple-landmark", -64, -704, { label: "C" }),
        worldObject("sector-01-01:cooling-fan", "background-prop", -288, -672, {
            gameplay: false,
            cueIds: ["sector-01-01:fan-inactive"]
        }),
        block01.panel,
        block01.gateVisual
    ],
    objectives: [
        {
            id: "sector-01-01:terminal-read",
            type: "interact",
            sourceObjectId: "sector-01-01:exit-panel",
            completionDelaySeconds: 2.7,
            storySequenceId: "sector-01-01:terminal-read"
        }
    ],
    gate: block01.gate,
    storyTriggers: ["lockdown", "terminal-read", "gate-open"],
    cameraZones: [
        cameraZone("intro", -176, 0, 1.25, 0.82, { verticalPlayerRatio: 0.46 }),
        cameraZone("first-hook", -352, -176, 1.2, 0.8),
        cameraZone("release-corridor", -608, -352, 1.1, 0.76),
        cameraZone("open-swing", -832, -608, 1, 0.72),
        cameraZone("terminal", -960, -832, 1.15, 0.78)
    ],
    cueIds: ["service-shaft", "sealed-ground-access", "cyan-grapple", "service-gate-02"]
});

const block02 = exitBlock({
    areaId: "sector-01-02",
    deckX: 208,
    deckTopY: -963,
    deckWidth: 288,
    nextAreaId: "sector-01-03",
    panelObjectiveId: "sector-01-02:exit-panel-engaged",
    panelProperties: { requiredObjectiveIds: ["sector-01-02:final-deck-reached"] }
});

const area02 = defineArea({
    id: "sector-01-02",
    sectorId: "sector-01",
    order: 2,
    name: "DOUBLE ANCHOR SHAFT",
    subtitle: "LIFT BYPASS",
    bounds: { width: 960, height: 1088 },
    entry: point("sector-01-02:entry", -320, -32),
    exit: block02.exit,
    nextAreaId: "sector-01-03",
    surfaces: [
        horizontalSurface("sector-01-02:p0", -288, 0, 256),
        horizontalSurface("sector-01-02:p1", 160, -288, 192, 16, { kind: "recovery" }),
        horizontalSurface("sector-01-02:crossbeam-x1", 0, -544, 128, 32, {
            kind: "overhang",
            oneWay: false,
            grappleable: false
        }),
        horizontalSurface("sector-01-02:p2", -192, -576, 192, 16, { kind: "recovery" }),
        horizontalSurface("sector-01-02:p3", 160, -800, 192, 16, { kind: "recovery" }),
        block02.deck,
        grappleTarget("sector-01-02:anchor-a-surface", -128, -192),

        grappleTarget("sector-01-02:anchor-c-surface", -160, -640)
    ],
    routePoints: [
        point("sector-01-02:route-entry", -320, -32),
        point("sector-01-02:route-a", -128, -192, { landmark: "A" }),

        point("sector-01-02:route-c", -160, -640, { landmark: "C" }),

        block02.routeExit
    ],
    recoveryPoints: [
        point("sector-01-02:recovery-p1", 160, -312),
        point("sector-01-02:recovery-p2", -192, -600),
        point("sector-01-02:recovery-p3", 160, -824)
    ],
    objects: [
        worldObject("sector-01-02:maintenance-lift", "background-prop", 0, -544, {
            gameplay: false,
            cueIds: ["sector-01-02:lift-offline"]
        }),
        ...[
            ["a", -128, -192, "A"],
            ["c", -160, -640, "C"]
        ].map(([id, x, y, label]) =>
            worldObject(`sector-01-02:anchor-${id}`, "grapple-landmark", x, y, {
                label
            })
        ),
        block02.gateVisual,
        block02.panel
    ],
    objectives: [
        {
            id: "sector-01-02:final-deck-reached",
            type: "reach",
            bounds: block02.reachBounds
        },
        {
            id: "sector-01-02:exit-panel-engaged",
            type: "interact",
            sourceObjectId: "sector-01-02:exit-panel",
            requiredObjectiveIds: ["sector-01-02:final-deck-reached"]
        }
    ],
    gate: block02.gate,
    storyTriggers: ["lift-offline", "manual-access-only", "power-reduction-stage-2", "security-access-check"],
    cameraZones: [
        cameraZone("lift-failure", -224, 0, 1.2, 0.8),
        cameraZone("first-handoff", -512, -224, 1, 0.72),
        cameraZone("direction-reversal", -736, -512, 0.95, 0.7),
        cameraZone("flow-test", -944, -736, 1, 0.72),
        cameraZone("exit", -1088, -944, 1.15, 0.78)
    ],
    cueIds: ["maintenance-lift", "airborne-handoff", "security-access-check"]
});

const block03 = exitBlock({
    areaId: "sector-01-03",
    deckX: 192,
    deckTopY: -1027,
    deckWidth: 320,
    nextAreaId: "sector-01-04",
    panelObjectiveId: "sector-01-03:maintenance-override"
});

const area03 = defineArea({
    id: "sector-01-03",
    sectorId: "sector-01",
    order: 3,
    name: "SECURITY CHECK",
    bounds: { width: 3840, height: 1152 },
    entry: point("sector-01-03:entry", -320, -32),
    exit: block03.exit,
    nextAreaId: "sector-01-04",
    surfaces: [
        horizontalSurface("sector-01-03:p0", -144, 0, 544),
        horizontalSurface("sector-01-03:p1", 240, -320, 224),
        horizontalSurface("sector-01-03:r1", 96, -576, 256, 16, { kind: "recovery" }),
        horizontalSurface("sector-01-03:safe-ledge", -240, -640, 224, 16, { kind: "safe-deck" }),
        horizontalSurface("sector-01-03:access-annex-bridge", 640, -576, 832, 16, { kind: "safe-deck" }),
        horizontalSurface("sector-01-03:access-annex-arena", 1320, -640, 960, 32, { kind: "safe-deck" }),
        groundedSurface("sector-01-03:safe-cover", -112, -640, 32, 128, { kind: "cover", oneWay: false }),
        groundedSurface("sector-01-03:upper-cover", -16, -832, 96, 128, { kind: "cover", oneWay: false }),
        block03.deck,
        grappleTarget("sector-01-03:anchor-a-surface", 64, -224),

        grappleTarget("sector-01-03:anchor-c-surface", -192, -736),
        grappleTarget("sector-01-03:access-anchor-a-surface", 448, -480),
        grappleTarget("sector-01-03:access-anchor-b-surface", 896, -544)
    ],
    routePoints: [
        point("sector-01-03:route-entry", -320, -32),
        point("sector-01-03:route-a", 64, -224, { landmark: "A" }),

        point("sector-01-03:route-c", -192, -736, { landmark: "C" }),

        block03.routeExit
    ],
    recoveryPoints: [
        point("sector-01-03:recovery-r1", 96, -600),
        point("sector-01-03:recovery-safe-ledge", -240, -664)
    ],
    objects: [
        ...[
            ["a", 64, -224, "A"],
            ["c", -192, -736, "C"]
        ].map(([id, x, y, label]) =>
            worldObject(`sector-01-03:anchor-${id}`, "grapple-landmark", x, y, {
                label
            })
        ),
        worldObject("sector-01-03:employee-scanner", "trigger", -96, -64, {
            trigger: objectTriggerSpec("center", 96, 128, { x: 0, y: 0 }),
            cueIds: ["sector-01-03:employee-verified"]
        }),
        worldObject("sector-01-03:access-anchor-a", "grapple-landmark", 448, -480, { label: "ACCESS A" }),
        worldObject("sector-01-03:access-anchor-b", "grapple-landmark", 896, -544, { label: "ACCESS B" }),
        worldObject("sector-01-03:sentry-turret-01", "sentry", 1500, -640, {
            enemyType: "sentry-t1",
            accessModuleId: "sector-01:access-module:a",
            accessHint: "RIGHT · LOWER SECURITY ANNEX",
            activationSpec: objectTriggerSpec("center", 1100, 544, { x: -300, y: -16 }),
            rules: ["standard-projectile", "no-rope-cut", "cover-ends-los"]
        }),
        block03.panel,
        block03.gateVisual
    ],
    objectives: [
        {
            id: "sector-01-03:maintenance-override",
            type: "interact",
            sourceObjectId: "sector-01-03:exit-panel"
        }
    ],
    gate: block03.gate,
    storyTriggers: [
        "employee-scan",
        "return-warning",
        "unauthorized-transit",
        "turret-activate",
        "access-denied",
        "maintenance-override",
        "violation-logged"
    ],
    routes: ["safe", "flow", "recovery"],
    cameraZones: [
        cameraZone("identification", -224, 0, 1.15, 0.78, { verticalPlayerRatio: 0.5 }),
        cameraZone("warning", -416, -224, 1, 0.72, { verticalPlayerRatio: 0.6 }),
        cameraZone("turret-reveal", -544, -416, 0.95, 0.7, { verticalPlayerRatio: 0.68 }),
        cameraZone("route-choice", -800, -544, 0.88, 0.66, { verticalPlayerRatio: 0.62 }),
        cameraZone("relief", -944, -800, 1, 0.72, { verticalPlayerRatio: 0.6 }),
        cameraZone("exit", -1152, -944, 1.15, 0.78, { verticalPlayerRatio: 0.68 })
    ],
    cueIds: ["security-scanner", "sentry-telegraph", "maintenance-override", "violation-logged"]
});

const block04 = exitBlock({
    areaId: "sector-01-04",
    deckX: 208,
    deckTopY: -515,
    deckWidth: 288,
    nextAreaId: "sector-01-05",
    panelObjectiveId: "sector-01-04:exit-panel-engaged",
    panelProperties: { requiredObjectiveIds: ["sector-01-04:augment-selected"] }
});

const area04 = defineArea({
    id: "sector-01-04",
    sectorId: "sector-01",
    order: 4,
    name: "MAINTENANCE NODE",
    subtitle: "EMERGENCY CALIBRATION",
    bounds: { width: 768, height: 640 },
    entry: point("sector-01-04:entry", -288, -32),
    exit: block04.exit,
    nextAreaId: "sector-01-05",
    surfaces: [
        horizontalSurface("sector-01-04:p0", -192, 0, 320),
        horizontalSurface("sector-01-04:node-deck", 0, -160, 320, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-01-04:p1", 160, -384, 192, 16, { kind: "recovery" }),
        horizontalSurface("sector-01-04:p2", -96, -512, 192, 16, { kind: "recovery" }),
        block04.deck
    ],
    routePoints: [
        point("sector-01-04:route-entry", -288, -32),
        point("sector-01-04:route-node", 0, -128),

        block04.routeExit
    ],
    recoveryPoints: [point("sector-01-04:recovery-p1", 160, -408), point("sector-01-04:recovery-p2", -96, -536)],
    objects: [
        ...[].map(([id, x, y, label]) =>
            worldObject(`sector-01-04:anchor-${id}`, "grapple-landmark", x, y, {
                label
            })
        ),
        worldObject("sector-01-04:maintenance-node", "augment-node", 0, -160, {
            coordinateAnchor: "bottom-center",
            interactionRadius: 80,
            objectiveId: "sector-01-04:augment-selected",
            choices: ["impulse-coil", "relay-link", "shear-current"]
        }),
        worldObject("sector-01-04:calibration-dummy", "test-target", 80, -448, {
            hostile: false,
            damage: false
        }),
        block04.panel,
        block04.gateVisual
    ],
    objectives: [
        {
            id: "sector-01-04:augment-selected",
            type: "interact-choice",
            sourceObjectId: "sector-01-04:maintenance-node"
        },
        {
            id: "sector-01-04:exit-panel-engaged",
            type: "interact",
            sourceObjectId: "sector-01-04:exit-panel",
            requiredObjectiveIds: ["sector-01-04:augment-selected"]
        }
    ],
    gate: block04.gate,
    storyTriggers: [
        "grapple-detected",
        "telemetry-analyzed",
        "override-available",
        "augment-selected",
        "firmware-applied"
    ],
    cameraZones: [
        cameraZone("entry", -160, 0, 1.15, 0.78, { verticalPlayerRatio: 0.55 }),
        cameraZone("node", -320, -160, 1.1, 0.76, { verticalPlayerRatio: 0.58 }),
        cameraZone("calibration", -576, -320, 0.95, 0.7, { verticalPlayerRatio: 0.62 }),
        cameraZone("exit", -640, -576, 1.15, 0.78, { verticalPlayerRatio: 0.68 })
    ],
    cueIds: ["maintenance-node", "foundation-augment-choice", "calibration-dummy", "test-bay-05"]
});

const block05 = exitBlock({
    areaId: "sector-01-05",
    deckX: 128,
    deckTopY: -1155,
    deckWidth: 320,
    nextAreaId: "sector-01-06",
    panelObjectiveId: "sector-01-05:exit-panel-engaged",
    panelProperties: { requiredObjectiveIds: ["sector-01-05:final-deck-reached"] }
});

const area05 = defineArea({
    id: "sector-01-05",
    sectorId: "sector-01",
    order: 5,
    name: "AUGMENT TEST BAY",
    subtitle: "LIVE CALIBRATION",
    bounds: { width: 960, height: 1280 },
    entry: point("sector-01-05:entry", -320, -32),
    exit: block05.exit,
    nextAreaId: "sector-01-06",
    surfaces: [
        horizontalSurface("sector-01-05:p0", -272, 0, 288),
        horizontalSurface("sector-01-05:r1", -176, -448, 224, 16, { kind: "recovery" }),
        horizontalSurface("sector-01-05:r2", 48, -768, 224, 16, { kind: "recovery" }),
        horizontalSurface("sector-01-05:safe-ledge", -256, -928, 192, 16, { kind: "safe-deck" }),
        groundedSurface("sector-01-05:safe-cover", -144, -928, 32, 96, { kind: "cover", oneWay: false }),
        horizontalSurface("sector-01-05:r3", 176, -1088, 224, 16, { kind: "recovery" }),
        block05.deck,
        ...[
            ["c", -160, -544],
            ["g", 32, -1040]
        ].map(([id, x, y]) => grappleTarget(`sector-01-05:anchor-${id}-surface`, x, y))
    ],
    routePoints: [
        point("sector-01-05:route-entry", -320, -32),
        ...[
            ["c", -160, -544, "C"],
            ["g", 32, -1040, "G"]
        ].map(([id, x, y, label]) => point(`sector-01-05:route-${id}`, x, y, { landmark: label })),
        block05.routeExit
    ],
    recoveryPoints: [
        point("sector-01-05:recovery-r1", -176, -472),
        point("sector-01-05:recovery-r2", 48, -792),
        point("sector-01-05:recovery-r3", 176, -1112)
    ],
    objects: [
        ...[
            ["c", -160, -544, "C"],
            ["g", 32, -1040, "G"]
        ].map(([id, x, y, label]) =>
            worldObject(`sector-01-05:anchor-${id}`, "grapple-landmark", x, y, {
                label
            })
        ),
        worldObject("sector-01-05:sentry-turret-01", "sentry", 384, -960, {
            activationSpec: objectTriggerSpec("center", 576, 448, { x: -288, y: 0 }),
            rules: ["standard-projectile", "no-rope-cut"]
        }),
        block05.panel,
        block05.gateVisual
    ],
    objectives: [
        {
            id: "sector-01-05:final-deck-reached",
            type: "reach",
            bounds: block05.reachBounds
        },
        {
            id: "sector-01-05:exit-panel-engaged",
            type: "interact",
            sourceObjectId: "sector-01-05:exit-panel",
            requiredObjectiveIds: ["sector-01-05:final-deck-reached"]
        }
    ],
    gate: block05.gate,
    routes: ["base-safe", "impulse-express", "relay-express", "shear-control", "recovery"],
    storyTriggers: ["active-augment-display", "live-calibration", "cooling-access-preview"],
    cameraZones: [
        cameraZone("load-gap", -544, 0, 1, 0.72),
        cameraZone("relay-spine", -768, -544, 1.05, 0.74),
        cameraZone("live-security", -1216, -768, 0.85, 0.66, { verticalPlayerRatio: 0.64 }),
        cameraZone("exit", -1280, -1216, 1.15, 0.78)
    ],
    cueIds: ["active-augment", "load-gap", "relay-spine", "live-sentry-geometry"]
});

const block06 = exitBlock({
    areaId: "sector-01-06",
    deckX: 112,
    deckTopY: -1283,
    deckWidth: 416,
    nextAreaId: "sector-01-07",
    panelObjectiveId: "sector-01-06:exit-panel-engaged",
    panelProperties: { requiredObjectiveIds: ["sector-01-06:final-deck-reached"] }
});

const area06 = defineArea({
    id: "sector-01-06",
    sectorId: "sector-01",
    order: 6,
    name: "COOLING SHAFT",
    subtitle: "AIRFLOW FAILURE",
    bounds: { width: 3840, height: 1408 },
    entry: point("sector-01-06:entry", -320, -32),
    exit: block06.exit,
    nextAreaId: "sector-01-07",
    surfaces: [
        horizontalSurface("sector-01-06:p0", -256, 0, 320),
        horizontalSurface("sector-01-06:r1", -144, -192, 224, 16, { kind: "recovery" }),
        horizontalSurface("sector-01-06:r2", 144, -544, 224, 16, { kind: "recovery" }),
        horizontalSurface("sector-01-06:r3", 0, -800, 256, 16, { kind: "recovery" }),
        horizontalSurface("sector-01-06:neutral-deck", -112, -832, 352, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-01-06:access-annex-bridge", -640, -832, 704, 16, { kind: "safe-deck" }),
        horizontalSurface("sector-01-06:access-annex-arena", -1320, -832, 704, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-01-06:r4", 160, -1120, 256, 16, { kind: "recovery" }),
        block06.deck,
        groundedSurface("sector-01-06:cooling-core-column", -304, -896, 64, 128, {
            kind: "solid",
            oneWay: false,
            grappleable: false,
            windOcclusion: true
        }),
        ...[
            ["b", 96, -416],
            ["d", -160, -896]
        ].map(([id, x, y]) => grappleTarget(`sector-01-06:anchor-${id}-surface`, x, y)),
        grappleTarget("sector-01-06:access-anchor-a-surface", -640, -704),
        grappleTarget("sector-01-06:access-anchor-b-surface", -1056, -768)
    ],
    routePoints: [
        point("sector-01-06:route-entry", -320, -32),
        ...[
            ["b", 96, -416, "B"],
            ["d", -160, -896, "D"]
        ].map(([id, x, y, label]) => point(`sector-01-06:route-${id}`, x, y, { landmark: label })),
        block06.routeExit
    ],
    recoveryPoints: [
        point("sector-01-06:recovery-r1", -144, -216),
        point("sector-01-06:recovery-r2", 144, -568),
        point("sector-01-06:recovery-r3", 0, -824),
        point("sector-01-06:recovery-r4", 160, -1144)
    ],
    objects: [
        ...[
            ["b", 96, -416, "B"],
            ["d", -160, -896, "D"]
        ].map(([id, x, y, label]) =>
            worldObject(`sector-01-06:anchor-${id}`, "grapple-landmark", x, y, {
                label
            })
        ),
        worldObject("sector-01-06:fan-a", "wind-source", 416, -480, {
            damage: false,
            windZoneId: "sector-01-06:fan-a-wind",
            zone: objectTriggerSpec("center", 672, 320, { x: -400, y: 0 })
        }),
        worldObject("sector-01-06:fan-b", "wind-source", -416, -1024, {
            damage: false,
            windZoneId: "sector-01-06:fan-b-wind",
            zone: objectTriggerSpec("center", 704, 384, { x: 416, y: -64 })
        }),
        worldObject("sector-01-06:central-cooling-core", "background-prop", 0, -800, { gameplay: false }),
        worldObject("sector-01-06:access-anchor-a", "grapple-landmark", -640, -704, { label: "ACCESS A" }),
        worldObject("sector-01-06:access-anchor-b", "grapple-landmark", -1056, -768, { label: "ACCESS B" }),
        worldObject("sector-01-06:access-carrier", "sentry", -1320, -832, {
            enemyType: "sentry-t1",
            accessModuleId: "sector-01:access-module:b",
            accessHint: "LEFT · MID COOLING INTAKE",
            activationSpec: objectTriggerSpec("center", 900, 512, { x: 0, y: -32 }),
            rules: ["standard-projectile", "no-rope-cut", "wind-pressure"]
        }),
        block06.panel,
        block06.gateVisual
    ],
    objectives: [
        {
            id: "sector-01-06:final-deck-reached",
            type: "reach",
            bounds: block06.reachBounds
        },
        {
            id: "sector-01-06:exit-panel-engaged",
            type: "interact",
            sourceObjectId: "sector-01-06:exit-panel",
            requiredObjectiveIds: ["sector-01-06:final-deck-reached"]
        }
    ],
    windZones: [
        {
            id: "sector-01-06:fan-a-wind",
            direction: { x: -1, y: 0 },
            mode: "continuous",
            strength: 500,
            falloff: 80
        },
        {
            id: "sector-01-06:fan-b-wind",
            direction: { x: 1, y: 0 },
            mode: "pulsed",
            strength: 800,
            falloff: 80,
            cycle: { lull: 1.75, warning: 0.7, active: 1.4, decay: 0.3 }
        }
    ],
    gate: block06.gate,
    storyTriggers: ["airflow-unstable", "cooling-pressure-critical", "bypass-required"],
    cameraZones: [
        cameraZone("airflow-preview", -320, 0, 1.15, 0.78),
        cameraZone("fan-a", -640, -320, 0.9, 0.68, { verticalPlayerRatio: 0.6 }),
        cameraZone("neutral-deck", -896, -640, 1.05, 0.74, { verticalPlayerRatio: 0.62 }),
        cameraZone("fan-b", -1344, -896, 0.85, 0.64, { verticalPlayerRatio: 0.62 }),
        cameraZone("exit", -1408, -1344, 1.15, 0.78)
    ],
    cueIds: ["wind-direction", "fan-a-continuous", "fan-b-lull-warning-active-decay", "bypass-required"]
});

const block07 = exitBlock({
    areaId: "sector-01-07",
    deckX: 224,
    deckTopY: -1411,
    deckWidth: 320,
    nextAreaId: "sector-01-08",
    panelObjectiveId: "sector-01-07:bypass-open"
});

const area07 = defineArea({
    id: "sector-01-07",
    sectorId: "sector-01",
    order: 7,
    name: "PRESSURE BYPASS",
    subtitle: "MANUAL PRESSURE CONTROL",
    bounds: { width: 3840, height: 1536 },
    entry: point("sector-01-07:entry", -320, -32),
    exit: block07.exit,
    nextAreaId: "sector-01-08",
    surfaces: [
        horizontalSurface("sector-01-07:p0", -256, 0, 320),
        horizontalSurface("sector-01-07:r1", -144, -192, 224, 16, { kind: "recovery" }),
        horizontalSurface("sector-01-07:r2", 144, -512, 224, 16, { kind: "recovery" }),
        horizontalSurface("sector-01-07:safe-shadow", -256, -864, 192, 16, { kind: "safe-deck" }),
        groundedSurface("sector-01-07:safe-shadow-cover", -128, -864, 64, 96, { kind: "cover", oneWay: false }),
        horizontalSurface("sector-01-07:r3", 64, -944, 256, 16, { kind: "recovery" }),
        horizontalSurface("sector-01-07:access-annex-bridge", 560, -944, 736, 16, { kind: "safe-deck" }),
        horizontalSurface("sector-01-07:access-annex-arena", 1320, -944, 800, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-01-07:upper-catch", -64, -1264, 256, 16, { kind: "recovery" }),
        block07.deck,
        ...[["a", -128, -224]].map(([id, x, y]) => grappleTarget(`sector-01-07:anchor-${id}-surface`, x, y)),
        grappleTarget("sector-01-07:access-anchor-a-surface", 480, -800),
        grappleTarget("sector-01-07:access-anchor-b-surface", 928, -864)
    ],
    routePoints: [
        point("sector-01-07:route-entry", -320, -32),
        point("sector-01-07:route-a", -128, -224, { landmark: "A" }),

        point("sector-01-07:route-security", 0, -736),

        point("sector-01-07:route-pressure-mid", 16, -944),

        block07.routeExit
    ],
    recoveryPoints: [
        point("sector-01-07:recovery-r1", -144, -216),
        point("sector-01-07:recovery-r2", 144, -536),
        point("sector-01-07:recovery-r3", 64, -968),
        point("sector-01-07:recovery-upper", -64, -1288)
    ],
    objects: [
        ...[["a", -128, -224, "A"]].map(([id, x, y, label]) =>
            worldObject(`sector-01-07:anchor-${id}`, "grapple-landmark", x, y, {
                label
            })
        ),
        worldObject("sector-01-07:pressure-valve-core", "background-prop", 0, -896, { gameplay: false }),
        worldObject("sector-01-07:access-anchor-a", "grapple-landmark", 480, -800, { label: "ACCESS A" }),
        worldObject("sector-01-07:access-anchor-b", "grapple-landmark", 928, -864, { label: "ACCESS B" }),
        worldObject("sector-01-07:sentry-turret-01", "sentry", 1320, -944, {
            accessModuleId: "sector-01:access-module:c",
            accessHint: "RIGHT · UPPER PRESSURE BYPASS",
            activationSpec: objectTriggerSpec("center", 900, 640, { x: 0, y: 0 }),
            rules: ["standard-projectile", "no-rope-cut"]
        }),
        worldObject("sector-01-07:main-pressure-vent", "wind-source", -416, -992, {
            damage: false,
            windZoneId: "sector-01-07:main-pressure-vent-wind",
            zone: objectTriggerSpec("center", 704, 384, { x: 416, y: 0 })
        }),
        block07.panel,
        block07.gateVisual
    ],
    objectives: [
        {
            id: "sector-01-07:bypass-open",
            type: "interact",
            sourceObjectId: "sector-01-07:exit-panel"
        }
    ],
    windZones: [
        {
            id: "sector-01-07:residual-airflow",
            bounds: triggerBounds(-320, -640, 672, 384),
            direction: { x: 1, y: 0 },
            mode: "continuous",
            strength: 220,
            falloff: 80
        },
        {
            id: "sector-01-07:main-pressure-vent-wind",
            direction: { x: 1, y: 0 },
            mode: "pulsed",
            strength: 800,
            falloff: 80,
            cycle: { lull: 1.75, warning: 0.7, active: 1.4, decay: 0.3 }
        }
    ],
    gate: block07.gate,
    storyTriggers: [
        "pressure-unstable",
        "containment-violation",
        "pressure-limit",
        "bypass-ready",
        "bypass-open",
        "service-route-available"
    ],
    routes: ["safe", "flow", "recovery", "impulse", "relay", "shear"],
    cameraZones: [
        cameraZone("approach", -416, 0, 1.1, 0.76),
        cameraZone("security-entry", -608, -416, 1, 0.74),
        cameraZone("decision-frame", -832, -608, 0.8, 0.62, { verticalPlayerRatio: 0.66 }),
        cameraZone("pressure-crossing", -1216, -832, 0.85, 0.64, { verticalPlayerRatio: 0.62 }),
        cameraZone("relief", -1376, -1216, 1.05, 0.74),
        cameraZone("bypass", -1536, -1376, 1.15, 0.78)
    ],
    cueIds: ["pressure-valve-core", "vent-cycle", "sentry-pressure-overlap", "manual-bypass", "service-route-available"]
});

const block08 = exitBlock({
    areaId: "sector-01-08",
    deckX: 0,
    deckTopY: -1667,
    deckWidth: 640,
    nextAreaId: "sector-02-01",
    panelObjectiveId: "sector-01-08:maintenance-override"
});

const area08 = defineArea({
    id: "sector-01-08",
    sectorId: "sector-01",
    order: 8,
    name: "CONTAINMENT GATE",
    subtitle: "FINAL MAINTENANCE ACCESS",
    bounds: { width: 1024, height: 1792 },
    entry: point("sector-01-08:entry", -352, -32),
    exit: block08.exit,
    nextAreaId: null,
    surfaces: [
        horizontalSurface("sector-01-08:p0", -288, 0, 320),
        horizontalSurface("sector-01-08:r1", -176, -288, 224, 16, { kind: "recovery" }),
        horizontalSurface("sector-01-08:r2", 144, -544, 224, 16, { kind: "recovery" }),
        horizontalSurface("sector-01-08:r3", -176, -832, 224, 16, { kind: "recovery" }),
        horizontalSurface("sector-01-08:mid-safe-deck", 0, -1024, 512, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-01-08:r4", 160, -1376, 256, 16, { kind: "recovery" }),
        horizontalSurface("sector-01-08:upper-catch", -112, -1504, 224, 16, { kind: "recovery" }),
        horizontalSurface("sector-01-08:p8", 48, -1584, 608, 32, { kind: "safe-deck" }),
        block08.deck,
        ...[
            ["a", -160, -224],
            ["d", -96, -768],
            ["f", -160, -1152]
        ].map(([id, x, y]) => grappleTarget(`sector-01-08:anchor-${id}-surface`, x, y))
    ],
    routePoints: [
        point("sector-01-08:route-entry", -352, -32),
        ...[
            ["a", -160, -224, "A"],
            ["d", -96, -768, "D"],
            ["f", -160, -1152, "F"]
        ].map(([id, x, y, label]) => point(`sector-01-08:route-${id}`, x, y, { landmark: label })),
        point("sector-01-08:route-override", 208, -1584),
        block08.routeExit
    ],
    recoveryPoints: [
        point("sector-01-08:recovery-r1", -176, -312),
        point("sector-01-08:recovery-r2", 144, -568),
        point("sector-01-08:recovery-r3", -176, -856),
        point("sector-01-08:recovery-r4", 160, -1400)
    ],
    checkpoints: [
        point("checkpoint:sector-01-08:end", 0, -1696, {
            radius: 38,
            sourceObjectId: "sector-01-08:sector-checkpoint"
        })
    ],
    objects: [
        ...[
            ["a", -160, -224, "A"],
            ["d", -96, -768, "D"],
            ["f", -160, -1152, "F"]
        ].map(([id, x, y, label]) =>
            worldObject(`sector-01-08:anchor-${id}`, "grapple-landmark", x, y, {
                label
            })
        ),
        worldObject("sector-01-08:sentry-turret-lower", "sentry", 384, -768, {
            activationSpec: objectTriggerSpec("center", 640, 384, { x: -320, y: -64 }),
            rules: ["sequential-activation", "no-crossfire", "standard-projectile", "no-rope-cut"]
        }),
        worldObject("sector-01-08:sentry-turret-upper", "sentry", 384, -1280, {
            activationSpec: objectTriggerSpec("center", 640, 416, { x: -320, y: -16 }),
            rules: ["sequential-activation", "no-crossfire", "standard-projectile", "no-rope-cut"]
        }),
        worldObject("sector-01-08:final-vent", "wind-source", -448, -1248, {
            damage: false,
            windZoneId: "sector-01-08:final-pulsed-vent",
            zone: objectTriggerSpec("center", 768, 448, { x: 448, y: -32 })
        }),
        block08.gateVisual,
        block08.panel,
        worldObject("sector-01-08:sector-checkpoint", "checkpoint", 0, -1696, {
            cueIds: ["sector-01-08:worker-district-reveal", "sector-01-08:sector-checkpoint"]
        })
    ],
    objectives: [
        {
            id: "sector-01-08:maintenance-override",
            type: "interact",
            sourceObjectId: "sector-01-08:exit-panel"
        }
    ],
    windZones: [
        {
            id: "sector-01-08:final-pulsed-vent",
            direction: { x: 1, y: 0 },
            mode: "pulsed",
            strength: 800,
            falloff: 80,
            cycle: { lull: 1.75, warning: 0.7, active: 1.4, decay: 0.3 }
        }
    ],
    gate: gate("sector-01-08:gate", 320, -1760, null, ["sector-01-08:maintenance-override"]),
    storyTriggers: [
        "final-warning",
        "closure-in-progress",
        "lower-grid-terminating",
        "access-denied",
        "maintenance-override",
        "violation-logged",
        "lower-grid-suspension",
        "worker-district-reveal",
        "evacuation-group-c",
        "sector-checkpoint"
    ],
    routes: ["safe", "flow", "recovery", "impulse", "relay", "shear"],
    cameraZones: [
        cameraZone("intro", -288, 0, 1.15, 0.78),
        cameraZone("chain-ascent", -640, -288, 1.05, 0.75),
        cameraZone("turret-one", -1024, -640, 0.85, 0.64, { verticalPlayerRatio: 0.64 }),
        cameraZone("mid-relief", -1088, -1024, 1.1, 0.76),
        cameraZone("final-preview", -1344, -1088, 0.9, 0.66, { verticalPlayerRatio: 0.6 }),
        cameraZone("final-crossing", -1504, -1344, 0.8, 0.6, { verticalPlayerRatio: 0.68 }),
        cameraZone("gate", -1584, -1504, 1, 0.72),
        cameraZone("shutdown", -1696, -1584, 0.95, 0.7),
        cameraZone("worker-reveal", -1792, -1696, 1.15, 0.8)
    ],
    cueIds: [
        "containment-gate",
        "no-crossfire",
        "final-vent",
        "lower-grid-shutdown",
        "worker-district-reveal",
        "sector-checkpoint"
    ]
});

export const SECTOR_01_AREA_CATALOG = defineAreaCatalog({
    id: "sector-01-authored-mock",
    revision: "sector-01-scenarios-rev3-v3",
    areas: [area01, area02, area03, area04, area05, area06, area07, area08]
});
