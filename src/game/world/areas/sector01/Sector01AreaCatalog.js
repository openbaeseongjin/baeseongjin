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

const SECTOR_01_EARLY_POOL = Object.freeze(["sentry-t1", "pursuit-drone-t1"]);
const SECTOR_01_GUARD_POOL = Object.freeze(["sentry-t1", "pursuit-drone-t1", "shield-drone-t1"]);
const SECTOR_01_LATE_POOL = Object.freeze(["pursuit-drone-t1", "shield-drone-t1", "artillery-drone-t1"]);

function pooledSentry(id, x, y, allowedEnemyTypes, { width = 640, height = 480, rules = [] } = {}) {
    return worldObject(id, "sentry", x, y, {
        enemyType: "sentry-t1",
        enemySelection: { allowedEnemyTypes },
        activationSpec: objectTriggerSpec("center", width, height),
        rules: ["standard-projectile", "no-rope-cut", ...rules]
    });
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
    deckX: -352,
    deckTopY: -832,
    deckWidth: 384,
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
    bounds: { width: 1664, height: 960 },
    entry: point("sector-01-02:entry", 448, -32),
    exit: block02.exit,
    nextAreaId: "sector-01-03",
    surfaces: [
        horizontalSurface("sector-01-02:p0", 416, 0, 448, 32),
        horizontalSurface("sector-01-02:p1", -416, -320, 224, 16, { kind: "recovery" }),
        horizontalSurface("sector-01-02:r2", 64, -656, 224, 16, { kind: "recovery" }),
        horizontalSurface("sector-01-02:p2", 64, -704, 256, 16),
        horizontalSurface("sector-01-02:p3", -160, -768, 320, 24, { kind: "safe-deck" }),
        horizontalSurface("sector-01-02:dead-lift-cage", 128, -608, 448, 320, {
            kind: "dead-lift-cage",
            oneWay: false,
            grappleable: false
        }),
        horizontalSurface("sector-01-02:counterweight-tower", -544, -704, 96, 448, {
            kind: "counterweight-tower",
            oneWay: false,
            grappleable: false
        }),
        horizontalSurface("sector-01-02:hoist-casing-left", -816, -960, 32, 960, {
            kind: "hoist-casing",
            oneWay: false,
            grappleable: false
        }),
        horizontalSurface("sector-01-02:hoist-casing-right", 816, -960, 32, 960, {
            kind: "hoist-casing",
            oneWay: false,
            grappleable: false
        }),
        block02.deck,
        grappleTarget("sector-01-02:anchor-a-surface", 224, -192),

        grappleTarget("sector-01-02:anchor-c-surface", -320, -560)
    ],
    routePoints: [
        point("sector-01-02:route-entry", 448, -32),
        point("sector-01-02:route-a", 224, -192, { landmark: "A" }),

        point("sector-01-02:route-c", -320, -560, { landmark: "C" }),

        block02.routeExit
    ],
    recoveryPoints: [
        point("sector-01-02:recovery-p1", -416, -344),
        point("sector-01-02:recovery-r2", 64, -680)
    ],
    objects: [
        worldObject("sector-01-02:maintenance-lift", "background-prop", 128, -448, {
            gameplay: false,
            cueIds: ["sector-01-02:lift-offline"]
        }),
        worldObject("sector-01-02:counterweight-visual", "background-prop", -544, -480, {
            gameplay: false,
            cueIds: ["sector-01-02:counterweight-stalled"]
        }),
        ...[
            ["a", 224, -192, "A"],
            ["c", -320, -560, "C"]
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
        cameraZone("lift-failure", -224, 0, 1.15, 0.79),
        cameraZone("left-cross", -448, -224, 0.94, 0.7),
        cameraZone("airborne-reattach", -640, -448, 0.9, 0.68),
        cameraZone("roof-wrap", -800, -640, 0.96, 0.71),
        cameraZone("exit", -960, -800, 1.1, 0.76)
    ],
    cueIds: ["maintenance-lift", "airborne-handoff", "security-access-check", "counterweight-stalled"]
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
        horizontalSurface("sector-01-03:p1-warning", 256, -320, 256, 16),
        horizontalSurface("sector-01-03:security-junction", 288, -480, 256, 20, { kind: "safe-deck" }),
        horizontalSurface("sector-01-03:r1", 80, -592, 256, 16, { kind: "recovery" }),
        horizontalSurface("sector-01-03:safe-ledge", -240, -656, 240, 16, { kind: "safe-deck" }),
        groundedSurface("sector-01-03:upper-cover", -32, -688, 64, 160, {
            kind: "cover",
            oneWay: false,
            grappleable: false
        }),
        horizontalSurface("sector-01-03:upper-relief", 64, -896, 320, 20, { kind: "safe-deck" }),
        horizontalSurface("sector-01-03:annex-mid-gantry", 736, -560, 192, 16),
        horizontalSurface("sector-01-03:annex-entry", 1168, -640, 224, 18),
        horizontalSurface("sector-01-03:annex-arena", 1536, -640, 736, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-01-03:annex-upper-balcony", 1512, -768, 320, 20),
        groundedSurface("sector-01-03:annex-cover-security-console", 1328, -528, 72, 112, {
            kind: "cover",
            oneWay: false,
            grappleable: false
        }),
        groundedSurface("sector-01-03:annex-cover-power-rack", 1600, -480, 88, 160, {
            kind: "cover",
            oneWay: false,
            grappleable: false
        }),
        block03.deck,
        grappleTarget("sector-01-03:anchor-a-surface", 64, -224),

        grappleTarget("sector-01-03:anchor-c-surface", -192, -752),
        grappleTarget("sector-01-03:access-anchor-a-surface", 512, -496),
        grappleTarget("sector-01-03:access-anchor-b-surface", 960, -608)
    ],
    routePoints: [
        point("sector-01-03:route-entry", -320, -32),
        point("sector-01-03:route-a", 64, -224, { landmark: "A" }),

        point("sector-01-03:route-c", -192, -752, { landmark: "C" }),

        block03.routeExit
    ],
    recoveryPoints: [
        point("sector-01-03:recovery-r1", 80, -616),
        point("sector-01-03:recovery-safe-ledge", -240, -680)
    ],
    objects: [
        ...[
            ["a", 64, -224, "A"],
            ["c", -192, -752, "C"]
        ].map(([id, x, y, label]) =>
            worldObject(`sector-01-03:anchor-${id}`, "grapple-landmark", x, y, {
                label
            })
        ),
        worldObject("sector-01-03:employee-scanner", "trigger", -96, -64, {
            trigger: objectTriggerSpec("center", 96, 128, { x: 0, y: 0 }),
            cueIds: ["sector-01-03:employee-verified"]
        }),
        worldObject("sector-01-03:access-anchor-a", "grapple-landmark", 512, -496, { label: "ACCESS A" }),
        worldObject("sector-01-03:access-anchor-b", "grapple-landmark", 960, -608, { label: "ACCESS B" }),
        worldObject("sector-01-03:annex-cover-security-console-visual", "background-prop", 1328, -584, {
            gameplay: false,
            cueIds: []
        }),
        worldObject("sector-01-03:annex-cover-power-rack-visual", "background-prop", 1600, -560, {
            gameplay: false,
            cueIds: []
        }),
        pooledSentry("sector-01-03:access-guard-approach", 960, -576, SECTOR_01_GUARD_POOL, {
            width: 1100,
            height: 544,
            rules: ["cover-ends-los"]
        }),
        pooledSentry("sector-01-03:access-guard-upper", 1512, -768, SECTOR_01_GUARD_POOL, {
            width: 480,
            height: 384,
            rules: ["cover-ends-los"]
        }),
        worldObject("sector-01-03:access-carrier-a", "sentry", 1760, -640, {
            enemyType: "sentry-t1",
            accessModuleId: "sector-01:access-module:a",
            accessHint: "RIGHT · SECURITY ANNEX",
            activationSpec: objectTriggerSpec("center", 720, 384, { x: -240, y: -16 }),
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
        cameraZone("turret-reveal", -544, -416, 0.94, 0.7, { verticalPlayerRatio: 0.68 }),
        cameraZone("annex-combat", -800, -544, 0.86, 0.66, { verticalPlayerRatio: 0.62 }),
        cameraZone("relief", -944, -800, 1, 0.72, { verticalPlayerRatio: 0.6 }),
        cameraZone("exit", -1152, -944, 1.15, 0.78, { verticalPlayerRatio: 0.68 })
    ],
    cueIds: ["security-scanner", "sentry-telegraph", "maintenance-override", "violation-logged"]
});

const block04 = exitBlock({
    areaId: "sector-01-04",
    deckX: -256,
    deckTopY: -768,
    deckWidth: 320,
    nextAreaId: "sector-01-05",
    panelObjectiveId: "sector-01-04:exit-panel-engaged",
    panelProperties: { requiredObjectiveIds: ["sector-01-04:augment-selected", "sector-01-04:augment-calibrated"] }
});

const area04 = defineArea({
    id: "sector-01-04",
    sectorId: "sector-01",
    order: 4,
    name: "MAINTENANCE NODE",
    subtitle: "EMERGENCY CALIBRATION",
    bounds: { width: 1152, height: 832 },
    entry: point("sector-01-04:entry", 224, -32),
    exit: block04.exit,
    nextAreaId: "sector-01-05",
    surfaces: [
        horizontalSurface("sector-01-04:p0", 256, 0, 512),
        horizontalSurface("sector-01-04:vestibule-deck", 320, -160, 320, 16),
        groundedSurface("sector-01-04:service-baffle", 96, -160, 64, 256, {
            kind: "solid",
            oneWay: false,
            grappleable: false
        }),
        horizontalSurface("sector-01-04:node-deck", -96, -288, 448, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-01-04:calibration-floor", 32, -512, 704, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-01-04:calibration-upper-lip", -256, -640, 256, 16),
        horizontalSurface("sector-01-04:exit-transfer", -256, -704, 320, 24, { kind: "safe-deck" }),
        horizontalSurface("sector-01-04:room-casing-left", -560, -832, 32, 832, {
            kind: "room-casing",
            oneWay: false,
            grappleable: false
        }),
        horizontalSurface("sector-01-04:room-casing-right", 560, -832, 32, 832, {
            kind: "room-casing",
            oneWay: false,
            grappleable: false
        }),
        block04.deck
    ],
    routePoints: [
        point("sector-01-04:route-entry", 224, -32),
        point("sector-01-04:route-node", -96, -288),

        block04.routeExit
    ],
    recoveryPoints: [],
    objects: [
        worldObject("sector-01-04:maintenance-node", "augment-node", -96, -288, {
            coordinateAnchor: "bottom-center",
            interactionRadius: 80,
            objectiveId: "sector-01-04:augment-selected"
        }),
        worldObject("sector-01-04:universal-calibration-frame", "calibration-frame", 32, -512, {
            interactionRadius: 400,
            objectiveId: "sector-01-04:augment-calibrated"
        }),
        worldObject("sector-01-04:calibration-far-sensor", "background-prop", 264, -608, {
            gameplay: false,
            cueIds: []
        }),
        worldObject("sector-01-04:calibration-receiver", "background-prop", 224, -512, {
            gameplay: false,
            cueIds: []
        }),
        worldObject("sector-01-04:calibration-pulse-emitter", "background-prop", -208, -576, {
            gameplay: false,
            cueIds: []
        }),
        worldObject("sector-01-04:calibration-scan-field", "background-prop", -256, -608, {
            gameplay: false,
            cueIds: []
        }),
        pooledSentry("sector-01-04:node-approach-guard", 432, -160, SECTOR_01_EARLY_POOL, {
            width: 224,
            height: 320
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
            id: "sector-01-04:augment-calibrated",
            type: "augment-calibration",
            sourceObjectId: "sector-01-04:universal-calibration-frame",
            requiredObjectiveIds: ["sector-01-04:augment-selected"]
        },
        {
            id: "sector-01-04:exit-panel-engaged",
            type: "interact",
            sourceObjectId: "sector-01-04:exit-panel",
            requiredObjectiveIds: ["sector-01-04:augment-selected", "sector-01-04:augment-calibrated"]
        }
    ],
    gate: block04.gate,
    storyTriggers: [
        "grapple-detected",
        "telemetry-analyzed",
        "override-available",
        "augment-selected",
        "calibration-profile-loaded",
        "calibration-verified",
        "firmware-applied"
    ],
    cameraZones: [
        cameraZone("vestibule", -192, 0, 1.1, 0.76, { verticalPlayerRatio: 0.55 }),
        cameraZone("node", -384, -192, 1.12, 0.77, { verticalPlayerRatio: 0.58 }),
        cameraZone("calibration", -672, -384, 0.98, 0.7, { verticalPlayerRatio: 0.62 }),
        cameraZone("exit", -832, -672, 1.12, 0.77, { verticalPlayerRatio: 0.68 })
    ],
    cueIds: ["maintenance-node", "foundation-augment-choice", "calibration-frame", "calibration-verified"]
});

const block05 = exitBlock({
    areaId: "sector-01-05",
    deckX: -768,
    deckTopY: -1024,
    deckWidth: 384,
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
    bounds: { width: 2304, height: 1152 },
    entry: point("sector-01-05:entry", -896, -32),
    exit: block05.exit,
    nextAreaId: "sector-01-06",
    surfaces: [
        horizontalSurface("sector-01-05:p0", -832, 0, 512),
        horizontalSurface("sector-01-05:launch-deck", -560, -320, 288, 24),
        horizontalSurface("sector-01-05:r1", 64, -256, 320, 18, { kind: "recovery" }),
        horizontalSurface("sector-01-05:far-right-landing", 736, -448, 320, 24, { kind: "safe-deck" }),
        horizontalSurface("sector-01-05:low-test-slot", 736, -160, 448, 32, { kind: "safe-deck" }),
        groundedSurface("sector-01-05:low-cover", 608, -160, 72, 112, {
            kind: "cover",
            oneWay: false,
            grappleable: false
        }),
        horizontalSurface("sector-01-05:upper-return-deck", -416, -832, 288, 20, { kind: "safe-deck" }),
        groundedSurface("sector-01-05:upper-cover", -224, -832, 64, 112, {
            kind: "cover",
            oneWay: false,
            grappleable: false
        }),
        block05.deck,
        grappleTarget("sector-01-05:anchor-c-surface", -704, -224),
        grappleTarget("sector-01-05:anchor-g-surface", -160, -768),
        ...[
            ["f1", -176, -384],
            ["f2", 224, -416],
            ["relaunch", 544, -352],
            ["mid-grip", 352, -512],
            ["high-capture", 192, -672],
            ["final-grip", -576, -928]
        ].map(([id, x, y]) => grappleTarget(`sector-01-05:${id}-surface`, x, y))
    ],
    routePoints: [
        point("sector-01-05:route-entry", -896, -32),
        point("sector-01-05:route-c", -704, -224, { landmark: "C" }),
        point("sector-01-05:route-launch", -560, -320),
        point("sector-01-05:route-f1", -176, -384),
        point("sector-01-05:route-f2", 224, -416),
        point("sector-01-05:route-far-right", 736, -448),
        point("sector-01-05:route-controlled-drop", 736, -180),
        point("sector-01-05:route-low-slot", 620, -160),
        point("sector-01-05:route-relaunch", 544, -352),
        point("sector-01-05:route-mid-grip", 352, -512),
        point("sector-01-05:route-high-capture", 192, -672),
        point("sector-01-05:route-g", -160, -768, { landmark: "G" }),
        point("sector-01-05:route-upper-return", -416, -832),
        point("sector-01-05:route-final-grip", -576, -928),
        block05.routeExit
    ],
    recoveryPoints: [
        point("sector-01-05:recovery-r1", 64, -280),
        point("sector-01-05:recovery-low-slot", 620, -192),
        point("sector-01-05:recovery-upper-return", -416, -856)
    ],
    objects: [
        worldObject("sector-01-05:anchor-c", "grapple-landmark", -704, -224, { label: "C" }),
        worldObject("sector-01-05:anchor-g", "grapple-landmark", -160, -768, { label: "G" }),
        worldObject("sector-01-05:relaunch", "grapple-landmark", 544, -352, { label: "RE-LAUNCH" }),
        ...[
            ["f1", -176, -384],
            ["f2", 224, -416],
            ["mid-grip", 352, -512],
            ["high-capture", 192, -672],
            ["final-grip", -576, -928]
        ].map(([id, x, y]) =>
            worldObject(`sector-01-05:${id}`, "grapple-landmark", x, y, {
                presentationId: "world-object:structural-grapple-joint"
            })
        ),
        pooledSentry("sector-01-05:low-guard", 864, -160, SECTOR_01_EARLY_POOL, {
            width: 320,
            height: 320
        }),
        pooledSentry("sector-01-05:upper-guard", 96, -832, SECTOR_01_EARLY_POOL, {
            width: 320,
            height: 320
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
    routes: ["base-safe", "recovery"],
    storyTriggers: ["vertical-load-test", "security-response-test", "cooling-distribution-service-access"],
    cameraZones: [
        cameraZone("launch-span", -192, 0, 0.88, 0.66),
        cameraZone("drop-slot", -448, -192, 0.96, 0.7),
        cameraZone("relaunch", -704, -448, 0.92, 0.68),
        cameraZone("upper-return", -928, -704, 0.9, 0.67),
        cameraZone("exit", -1152, -928, 1.1, 0.76)
    ],
    cueIds: ["vertical-load-test", "security-response-test", "cooling-distribution-service-access"]
});

const block06 = exitBlock({
    areaId: "sector-01-06",
    deckX: 1392,
    deckTopY: -1088,
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
    bounds: { width: 3840, height: 1280 },
    entry: point("sector-01-06:entry", 1408, -32),
    exit: block06.exit,
    nextAreaId: "sector-01-07",
    surfaces: [
        horizontalSurface("sector-01-06:p0", 1408, 0, 512),
        horizontalSurface("sector-01-06:fan-a-recovery", 544, -128, 320, 18, { kind: "recovery" }),
        horizontalSurface("sector-01-06:neutral-landing", -128, -416, 416, 28, { kind: "safe-deck" }),
        groundedSurface("sector-01-06:wind-baffle", -224, -400, 96, 288, {
            kind: "solid",
            oneWay: false,
            grappleable: false,
            windOcclusion: true
        }),
        horizontalSurface("sector-01-06:neutral-shadow-deck", -160, -576, 512, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-01-06:pulse-setup", -704, -704, 288, 22),
        horizontalSurface("sector-01-06:fan-b-recovery", 320, -736, 320, 18, { kind: "recovery" }),
        horizontalSurface("sector-01-06:exit-approach", 1184, -992, 352, 28),
        horizontalSurface("sector-01-06:final-deck", 1392, -1088, 416, 32, { kind: "safe-deck" }),
        horizontalSurface("sector-01-06:access-intake-deck", -1456, -672, 704, 32, { kind: "safe-deck" }),
        block06.deck,
        grappleTarget("sector-01-06:anchor-a-surface", 1120, -192),
        grappleTarget("sector-01-06:anchor-d-surface", -448, -768),
        grappleTarget("sector-01-06:access-anchor-a-surface", -672, -576),
        grappleTarget("sector-01-06:access-anchor-b-surface", -1056, -640),
        ...[
            ["grip-b", 736, -288],
            ["grip-c", 320, -352],
            ["grip-e", 64, -832],
            ["grip-f", 704, -896]
        ].map(([id, x, y]) => grappleTarget(`sector-01-06:${id}-surface`, x, y))
    ],
    routePoints: [
        point("sector-01-06:route-entry", 1408, -32),
        point("sector-01-06:route-a", 1120, -192, { landmark: "A" }),
        point("sector-01-06:route-b", 736, -288),
        point("sector-01-06:route-c", 320, -352),
        point("sector-01-06:route-neutral-landing", -128, -416),
        point("sector-01-06:route-neutral-shadow", -160, -576),
        point("sector-01-06:route-pulse-setup", -704, -704),
        point("sector-01-06:route-d", -448, -768, { landmark: "D" }),
        point("sector-01-06:route-e", 64, -832),
        point("sector-01-06:route-f", 704, -896),
        point("sector-01-06:route-exit-approach", 1184, -992),
        block06.routeExit
    ],
    recoveryPoints: [
        point("sector-01-06:recovery-fan-a-miss", 544, -152),
        point("sector-01-06:recovery-fan-b-miss", 320, -760),
        point("sector-01-06:recovery-access-local-reset", -1184, -704)
    ],
    objects: [
        worldObject("sector-01-06:anchor-a", "grapple-landmark", 1120, -192, { label: "A" }),
        worldObject("sector-01-06:anchor-d", "grapple-landmark", -448, -768, { label: "D" }),
        ...[
            ["grip-b", 736, -288],
            ["grip-c", 320, -352],
            ["grip-e", 64, -832],
            ["grip-f", 704, -896]
        ].map(([id, x, y]) =>
            worldObject(`sector-01-06:${id}`, "grapple-landmark", x, y, {
                presentationId: "world-object:structural-grapple-joint"
            })
        ),
        worldObject("sector-01-06:fan-a", "wind-source", 1664, -352, {
            damage: false,
            windZoneId: "sector-01-06:fan-a-wind"
        }),
        worldObject("sector-01-06:fan-b", "wind-source", -1664, -800, {
            damage: false,
            windZoneId: "sector-01-06:fan-b-wind"
        }),
        worldObject("sector-01-06:access-anchor-a", "grapple-landmark", -672, -576, { label: "ACCESS A" }),
        worldObject("sector-01-06:access-anchor-b", "grapple-landmark", -1056, -640, { label: "ACCESS B" }),
        worldObject("sector-01-06:access-carrier", "sentry", -1456, -672, {
            enemyType: "sentry-t1",
            accessModuleId: "sector-01:access-module:b",
            accessHint: "LEFT · COOLING INTAKE",
            activationSpec: objectTriggerSpec("center", 900, 480, { x: 0, y: -16 }),
            rules: ["standard-projectile", "no-rope-cut"]
        }),
        pooledSentry("sector-01-06:access-guard-left", -1728, -672, SECTOR_01_GUARD_POOL, {
            width: 320,
            height: 320
        }),
        pooledSentry("sector-01-06:access-guard-right", -1184, -672, SECTOR_01_GUARD_POOL, {
            width: 320,
            height: 320
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
            bounds: triggerBounds(-480, -480, 2016, 320),
            direction: { x: -1, y: 0 },
            mode: "continuous",
            strength: 500,
            falloff: 80
        },
        {
            id: "sector-01-06:fan-b-wind",
            bounds: triggerBounds(-1408, -992, 2688, 288),
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
        cameraZone("airflow-preview", -288, 0, 1.05, 0.74),
        cameraZone("fan-a-crossflow", -544, -288, 0.81, 0.62, { verticalPlayerRatio: 0.6 }),
        cameraZone("neutral-shadow", -672, -544, 1.02, 0.72, { verticalPlayerRatio: 0.62 }),
        cameraZone("fan-b-crossflow", -928, -672, 0.79, 0.61, { verticalPlayerRatio: 0.62 }),
        cameraZone("access-intake", -1024, -928, 0.86, 0.65, { verticalPlayerRatio: 0.62 }),
        cameraZone("exit", -1280, -1024, 1.1, 0.76)
    ],
    cueIds: ["airflow-unstable", "fan-a-continuous", "fan-b-lull-warning-active-decay", "cooling-pressure-critical"]
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
        pooledSentry("sector-01-07:access-guard-left", 960, -944, SECTOR_01_GUARD_POOL, {
            width: 400,
            height: 560,
            rules: ["wind-pressure"]
        }),
        pooledSentry("sector-01-07:access-guard-right", 1680, -944, SECTOR_01_GUARD_POOL, {
            width: 400,
            height: 560,
            rules: ["wind-pressure"]
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
            enemySelection: { allowedEnemyTypes: SECTOR_01_LATE_POOL },
            activationSpec: objectTriggerSpec("center", 640, 384, { x: -320, y: -64 }),
            rules: ["sequential-activation", "no-crossfire", "standard-projectile", "no-rope-cut"]
        }),
        worldObject("sector-01-08:sentry-turret-upper", "sentry", 384, -1280, {
            enemySelection: { allowedEnemyTypes: SECTOR_01_LATE_POOL },
            activationSpec: objectTriggerSpec("center", 640, 416, { x: -320, y: -16 }),
            rules: ["sequential-activation", "no-crossfire", "standard-projectile", "no-rope-cut"]
        }),
        pooledSentry("sector-01-08:lower-grid-guard", -240, -544, SECTOR_01_LATE_POOL, {
            width: 480,
            height: 416,
            rules: ["sequential-activation", "no-crossfire"]
        }),
        pooledSentry("sector-01-08:upper-grid-guard", -240, -1376, SECTOR_01_LATE_POOL, {
            width: 480,
            height: 416,
            rules: ["sequential-activation", "no-crossfire"]
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
