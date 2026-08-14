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

function gate(id, x, y, nextAreaId, requiredObjectiveIds) {
    return Object.freeze({
        id,
        nextAreaId,
        requiredObjectiveIds: Object.freeze(requiredObjectiveIds),
        trigger: triggerBounds(x - 48, y - 96, 96, 160),
        barrier: triggerBounds(x - 32, y - 96, 64, 128)
    });
}

const area01 = defineArea({
    id: "sector-01-01",
    sectorId: "sector-01",
    order: 1,
    name: "SERVICE SHAFT",
    subtitle: "VERTICAL GRID CASCADE FAILURE",
    bounds: { width: 960, height: 960 },
    entry: point("sector-01-01:entry", -320, -32),
    exit: point("sector-01-01:exit", 320, -928),
    nextAreaId: "sector-01-02",
    surfaces: [
        rectangle("sector-01-01:p0", -416, 0, 256),
        rectangle("sector-01-01:r1", -256, -224, 160, 16, { kind: "recovery" }),
        rectangle("sector-01-01:p1", 64, -288, 192, 16),
        rectangle("sector-01-01:r2", -288, -480, 192, 16, { kind: "recovery" }),
        rectangle("sector-01-01:p2", -256, -544, 192, 16),
        rectangle("sector-01-01:cable-overhang", 64, -608, 224, 32, {
            kind: "overhang",
            oneWay: false
        }),
        rectangle("sector-01-01:r3", -224, -736, 160, 16, { kind: "recovery" }),
        rectangle("sector-01-01:p3", -96, -800, 224, 16),
        rectangle("sector-01-01:p4", 32, -864, 320, 32, { kind: "safe-deck" }),
        rectangle("sector-01-01:ground-shutter", -448, -128, 128, 128, {
            kind: "sealed-door",
            oneWay: false
        }),
        grappleTarget("sector-01-01:anchor-a-surface", -96, -192),
        grappleTarget("sector-01-01:anchor-b-surface", 160, -448),
        grappleTarget("sector-01-01:anchor-c-surface", -64, -704)
    ],
    routePoints: [
        point("sector-01-01:route-entry", -320, -32),
        point("sector-01-01:route-a", -96, -192, { landmark: "A" }),
        point("sector-01-01:route-b", 160, -448, { landmark: "B" }),
        point("sector-01-01:route-c", -64, -704, { landmark: "C" }),
        point("sector-01-01:route-exit", 256, -896)
    ],
    recoveryPoints: [
        point("sector-01-01:recovery-r1", -176, -248),
        point("sector-01-01:recovery-r2", -192, -504),
        point("sector-01-01:recovery-r3", -144, -760)
    ],
    objects: [
        worldObject("sector-01-01:anchor-a", "grapple-landmark", -96, -192, { label: "A" }),
        worldObject("sector-01-01:anchor-b", "grapple-landmark", 160, -448, { label: "B" }),
        worldObject("sector-01-01:anchor-c", "grapple-landmark", -64, -704, { label: "C" }),
        worldObject("sector-01-01:cooling-fan", "background-prop", -288, -672, {
            gameplay: false,
            cueIds: ["sector-01-01:fan-inactive"]
        }),
        worldObject("sector-01-01:service-terminal", "gate-panel", 208, -896, {
            interactionRadius,
            objectiveId: "sector-01-01:terminal-read",
            gateId: "sector-01-01:gate",
            cueIds: ["sector-01-01:terminal-cascade", "sector-01-01:rooftop-pad-03"]
        }),
        worldObject("sector-01-01:service-gate", "gate", 320, -928, {
            gateId: "sector-01-01:gate"
        })
    ],
    objectives: [
        {
            id: "sector-01-01:terminal-read",
            type: "interact",
            sourceObjectId: "sector-01-01:service-terminal"
        }
    ],
    gate: gate("sector-01-01:gate", 320, -928, "sector-01-02", ["sector-01-01:terminal-read"]),
    storyTriggers: ["lockdown", "terminal-read", "gate-open"],
    cameraZones: ["intro", "first-hook", "release-corridor", "open-swing", "terminal"],
    cueIds: ["service-shaft", "sealed-ground-access", "cyan-grapple", "service-gate-02"]
});

const area02 = defineArea({
    id: "sector-01-02",
    sectorId: "sector-01",
    order: 2,
    name: "DOUBLE ANCHOR SHAFT",
    subtitle: "LIFT BYPASS",
    bounds: { width: 960, height: 1088 },
    entry: point("sector-01-02:entry", -320, -32),
    exit: point("sector-01-02:exit", 320, -1056),
    nextAreaId: "sector-01-03",
    surfaces: [
        rectangle("sector-01-02:p0", -416, 0, 256),
        rectangle("sector-01-02:p1", 64, -288, 192, 16, { kind: "recovery" }),
        rectangle("sector-01-02:crossbeam-x1", -64, -544, 128, 32, {
            kind: "overhang",
            oneWay: false,
            grappleable: false
        }),
        rectangle("sector-01-02:p2", -288, -576, 192, 16, { kind: "recovery" }),
        rectangle("sector-01-02:p3", 64, -800, 192, 16, { kind: "recovery" }),
        rectangle("sector-01-02:p4", 64, -960, 288, 32, { kind: "safe-deck" }),
        grappleTarget("sector-01-02:anchor-a-surface", -128, -192),
        grappleTarget("sector-01-02:anchor-b-surface", 160, -416),
        grappleTarget("sector-01-02:anchor-c-surface", -160, -640),
        grappleTarget("sector-01-02:anchor-d-surface", 128, -864)
    ],
    routePoints: [
        point("sector-01-02:route-entry", -320, -32),
        point("sector-01-02:route-a", -128, -192, { landmark: "A" }),
        point("sector-01-02:route-b", 160, -416, { landmark: "B" }),
        point("sector-01-02:route-c", -160, -640, { landmark: "C" }),
        point("sector-01-02:route-d", 128, -864, { landmark: "D" }),
        point("sector-01-02:route-exit", 288, -1024)
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
            [-128, -192],
            [160, -416],
            [-160, -640],
            [128, -864]
        ].map(([x, y], index) =>
            worldObject(`sector-01-02:anchor-${"abcd"[index]}`, "grapple-landmark", x, y, {
                label: "ABCD"[index]
            })
        ),
        worldObject("sector-01-02:security-access-gate", "gate", 320, -1056, {
            gateId: "sector-01-02:gate"
        }),
        worldObject("sector-01-02:exit-panel", "gate-panel", 208, -1024, {
            interactionRadius,
            objectiveId: "sector-01-02:exit-panel-engaged",
            gateId: "sector-01-02:gate",
            requiredObjectiveIds: ["sector-01-02:final-deck-reached"]
        })
    ],
    objectives: [
        {
            id: "sector-01-02:final-deck-reached",
            type: "reach",
            bounds: triggerBounds(64, -1024, 288, 96)
        },
        {
            id: "sector-01-02:exit-panel-engaged",
            type: "interact",
            sourceObjectId: "sector-01-02:exit-panel",
            requiredObjectiveIds: ["sector-01-02:final-deck-reached"]
        }
    ],
    gate: gate("sector-01-02:gate", 320, -1056, "sector-01-03", ["sector-01-02:exit-panel-engaged"]),
    storyTriggers: ["lift-offline", "manual-access-only", "power-reduction-stage-2", "security-access-check"],
    cameraZones: ["intro", "first-handoff", "direction-reversal", "flow-test", "exit"],
    cueIds: ["maintenance-lift", "airborne-handoff", "security-access-check"]
});

const area03 = defineArea({
    id: "sector-01-03",
    sectorId: "sector-01",
    order: 3,
    name: "SECURITY CHECK",
    bounds: { width: 960, height: 1152 },
    entry: point("sector-01-03:entry", -320, -32),
    exit: point("sector-01-03:exit", 320, -1120),
    nextAreaId: "sector-01-04",
    surfaces: [
        rectangle("sector-01-03:p0", -416, 0, 544),
        rectangle("sector-01-03:p1", 128, -320, 224),
        rectangle("sector-01-03:r1", -288, -512, 192, 16, { kind: "recovery" }),
        rectangle("sector-01-03:safe-ledge", -352, -640, 224, 16, { kind: "safe-deck" }),
        rectangle("sector-01-03:safe-cover", -128, -768, 32, 128, { kind: "cover", oneWay: false }),
        rectangle("sector-01-03:upper-cover", -64, -960, 96, 128, { kind: "cover", oneWay: false }),
        rectangle("sector-01-03:p4", 32, -1056, 320, 32, { kind: "safe-deck" }),
        grappleTarget("sector-01-03:anchor-a-surface", 64, -224),
        grappleTarget("sector-01-03:anchor-b-surface", 64, -480),
        grappleTarget("sector-01-03:anchor-c-surface", -192, -736),
        grappleTarget("sector-01-03:anchor-d-surface", 96, -960)
    ],
    routePoints: [
        point("sector-01-03:route-entry", -320, -32),
        point("sector-01-03:route-a", 64, -224, { landmark: "A" }),
        point("sector-01-03:route-b", 64, -480, { landmark: "B" }),
        point("sector-01-03:route-c", -192, -736, { landmark: "C" }),
        point("sector-01-03:route-d", 96, -960, { landmark: "D" }),
        point("sector-01-03:route-exit", 288, -1088)
    ],
    recoveryPoints: [
        point("sector-01-03:recovery-r1", -192, -536),
        point("sector-01-03:recovery-safe-ledge", -240, -664)
    ],
    objects: [
        worldObject("sector-01-03:employee-scanner", "trigger", -96, -64, {
            bounds: triggerBounds(-144, -128, 96, 128),
            cueIds: ["sector-01-03:employee-verified"]
        }),
        worldObject("sector-01-03:sentry-turret-01", "sentry", 416, -640, {
            activation: triggerBounds(-32, -736, 448, 512),
            rules: ["standard-projectile", "no-rope-cut", "cover-ends-los"]
        }),
        worldObject("sector-01-03:service-panel", "gate-panel", 208, -1088, {
            interactionRadius,
            objectiveId: "sector-01-03:maintenance-override",
            gateId: "sector-01-03:gate"
        }),
        worldObject("sector-01-03:security-gate", "gate", 320, -1088, { gateId: "sector-01-03:gate" })
    ],
    objectives: [
        {
            id: "sector-01-03:maintenance-override",
            type: "interact",
            sourceObjectId: "sector-01-03:service-panel"
        }
    ],
    gate: gate("sector-01-03:gate", 320, -1088, "sector-01-04", ["sector-01-03:maintenance-override"]),
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
    cameraZones: ["identification", "warning", "turret-reveal", "route-choice", "relief", "exit"],
    cueIds: ["security-scanner", "sentry-telegraph", "maintenance-override", "violation-logged"]
});

const area04 = defineArea({
    id: "sector-01-04",
    sectorId: "sector-01",
    order: 4,
    name: "MAINTENANCE NODE",
    subtitle: "EMERGENCY CALIBRATION",
    bounds: { width: 768, height: 640 },
    entry: point("sector-01-04:entry", -288, -32),
    exit: point("sector-01-04:exit", 288, -608),
    nextAreaId: "sector-01-05",
    surfaces: [
        rectangle("sector-01-04:p0", -352, 0, 320),
        rectangle("sector-01-04:node-deck", -160, -160, 320, 32, { kind: "safe-deck" }),
        rectangle("sector-01-04:p1", 64, -384, 192, 16, { kind: "recovery" }),
        rectangle("sector-01-04:p2", -192, -512, 192, 16, { kind: "recovery" }),
        rectangle("sector-01-04:final-deck", 64, -576, 288, 32, { kind: "safe-deck" }),
        grappleTarget("sector-01-04:anchor-a-surface", 192, -320),
        grappleTarget("sector-01-04:anchor-b-surface", -96, -448),
        grappleTarget("sector-01-04:anchor-c-surface", 160, -560)
    ],
    routePoints: [
        point("sector-01-04:route-entry", -288, -32),
        point("sector-01-04:route-node", 0, -128),
        point("sector-01-04:route-a", 192, -320, { landmark: "A" }),
        point("sector-01-04:route-b", -96, -448, { landmark: "B" }),
        point("sector-01-04:route-c", 160, -560, { landmark: "C" }),
        point("sector-01-04:route-exit", 288, -608)
    ],
    recoveryPoints: [point("sector-01-04:recovery-p1", 160, -408), point("sector-01-04:recovery-p2", -96, -536)],
    objects: [
        worldObject("sector-01-04:maintenance-node", "augment-node", 0, -128, {
            interactionRadius: 80,
            objectiveId: "sector-01-04:augment-selected",
            choices: ["impulse-coil", "relay-link", "shear-current"]
        }),
        worldObject("sector-01-04:calibration-dummy", "test-target", 80, -448, {
            hostile: false,
            damage: false
        }),
        worldObject("sector-01-04:exit-panel", "gate-panel", 176, -576, {
            interactionRadius,
            objectiveId: "sector-01-04:exit-panel-engaged",
            gateId: "sector-01-04:gate",
            requiredObjectiveIds: ["sector-01-04:augment-selected"]
        }),
        worldObject("sector-01-04:test-bay-gate", "gate", 288, -608, { gateId: "sector-01-04:gate" })
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
    gate: gate("sector-01-04:gate", 288, -608, "sector-01-05", ["sector-01-04:exit-panel-engaged"]),
    storyTriggers: [
        "grapple-detected",
        "telemetry-analyzed",
        "override-available",
        "augment-selected",
        "firmware-applied"
    ],
    cameraZones: ["entry", "node", "calibration", "exit"],
    cueIds: ["maintenance-node", "foundation-augment-choice", "calibration-dummy", "test-bay-05"]
});

const area05 = defineArea({
    id: "sector-01-05",
    sectorId: "sector-01",
    order: 5,
    name: "AUGMENT TEST BAY",
    subtitle: "LIVE CALIBRATION",
    bounds: { width: 960, height: 1280 },
    entry: point("sector-01-05:entry", -320, -32),
    exit: point("sector-01-05:exit", 288, -1248),
    nextAreaId: "sector-01-06",
    surfaces: [
        rectangle("sector-01-05:p0", -416, 0, 288),
        rectangle("sector-01-05:r1", -288, -448, 224, 16, { kind: "recovery" }),
        rectangle("sector-01-05:r2", -64, -768, 224, 16, { kind: "recovery" }),
        rectangle("sector-01-05:safe-ledge", -352, -928, 192, 16, { kind: "safe-deck" }),
        rectangle("sector-01-05:safe-cover", -160, -1024, 32, 96, { kind: "cover", oneWay: false }),
        rectangle("sector-01-05:r3", 64, -1088, 224, 16, { kind: "recovery" }),
        rectangle("sector-01-05:final-deck", -32, -1216, 320, 32, { kind: "safe-deck" }),
        ...[
            [-160, -224],
            [224, -384],
            [-160, -544],
            [64, -640],
            [224, -752],
            [-128, -896],
            [32, -1040],
            [-128, -1168]
        ].map(([x, y], index) => grappleTarget(`sector-01-05:anchor-${"abcdefgh"[index]}-surface`, x, y))
    ],
    routePoints: [
        point("sector-01-05:route-entry", -320, -32),
        ...[
            [-160, -224],
            [224, -384],
            [-160, -544],
            [64, -640],
            [224, -752],
            [-128, -896],
            [32, -1040],
            [-128, -1168]
        ].map(([x, y], index) =>
            point(`sector-01-05:route-${"abcdefgh"[index]}`, x, y, { landmark: "ABCDEFGH"[index] })
        ),
        point("sector-01-05:route-exit", 256, -1248)
    ],
    recoveryPoints: [
        point("sector-01-05:recovery-r1", -176, -472),
        point("sector-01-05:recovery-r2", 48, -792),
        point("sector-01-05:recovery-r3", 176, -1112)
    ],
    objects: [
        ...[
            [-160, -224],
            [224, -384],
            [-160, -544],
            [64, -640],
            [224, -752],
            [-128, -896],
            [32, -1040],
            [-128, -1168]
        ].map(([x, y], index) =>
            worldObject(`sector-01-05:anchor-${"abcdefgh"[index]}`, "grapple-landmark", x, y, {
                label: "ABCDEFGH"[index]
            })
        ),
        worldObject("sector-01-05:sentry-turret-01", "sentry", 384, -960, {
            activation: triggerBounds(-192, -1184, 576, 448),
            rules: ["standard-projectile", "no-rope-cut"]
        }),
        worldObject("sector-01-05:exit-panel", "gate-panel", 176, -1216, {
            interactionRadius,
            objectiveId: "sector-01-05:exit-panel-engaged",
            gateId: "sector-01-05:gate",
            requiredObjectiveIds: ["sector-01-05:final-deck-reached"]
        }),
        worldObject("sector-01-05:cooling-access-gate", "gate", 288, -1248, { gateId: "sector-01-05:gate" })
    ],
    objectives: [
        {
            id: "sector-01-05:final-deck-reached",
            type: "reach",
            bounds: triggerBounds(-32, -1280, 320, 96)
        },
        {
            id: "sector-01-05:exit-panel-engaged",
            type: "interact",
            sourceObjectId: "sector-01-05:exit-panel",
            requiredObjectiveIds: ["sector-01-05:final-deck-reached"]
        }
    ],
    gate: gate("sector-01-05:gate", 288, -1248, "sector-01-06", ["sector-01-05:exit-panel-engaged"]),
    routes: ["base-safe", "impulse-express", "relay-express", "shear-control", "recovery"],
    storyTriggers: ["active-augment-display", "live-calibration", "cooling-access-preview"],
    cameraZones: ["load-gap", "relay-spine", "live-security", "exit"],
    cueIds: ["active-augment", "load-gap", "relay-spine", "live-sentry-geometry"]
});

const area06 = defineArea({
    id: "sector-01-06",
    sectorId: "sector-01",
    order: 6,
    name: "COOLING SHAFT",
    subtitle: "AIRFLOW FAILURE",
    bounds: { width: 960, height: 1408 },
    entry: point("sector-01-06:entry", -320, -32),
    exit: point("sector-01-06:exit", 288, -1376),
    nextAreaId: "sector-01-07",
    surfaces: [
        rectangle("sector-01-06:p0", -416, 0, 320),
        rectangle("sector-01-06:r1", -256, -192, 224, 16, { kind: "recovery" }),
        rectangle("sector-01-06:r2", 32, -544, 224, 16, { kind: "recovery" }),
        rectangle("sector-01-06:r3", -128, -800, 256, 16, { kind: "recovery" }),
        rectangle("sector-01-06:neutral-deck", -288, -832, 352, 32, { kind: "safe-deck" }),
        rectangle("sector-01-06:r4", 32, -1120, 256, 16, { kind: "recovery" }),
        rectangle("sector-01-06:final-deck", -96, -1344, 416, 32, { kind: "safe-deck" }),
        ...[
            [-128, -224],
            [96, -416],
            [-224, -640],
            [-160, -896],
            [192, -1088],
            [-32, -1280]
        ].map(([x, y], index) => grappleTarget(`sector-01-06:anchor-${"abcdef"[index]}-surface`, x, y))
    ],
    routePoints: [
        point("sector-01-06:route-entry", -320, -32),
        ...[
            [-128, -224],
            [96, -416],
            [-224, -640],
            [-160, -896],
            [192, -1088],
            [-32, -1280]
        ].map(([x, y], index) => point(`sector-01-06:route-${"abcdef"[index]}`, x, y, { landmark: "ABCDEF"[index] })),
        point("sector-01-06:route-exit", 288, -1376)
    ],
    recoveryPoints: [
        point("sector-01-06:recovery-r1", -144, -216),
        point("sector-01-06:recovery-r2", 144, -568),
        point("sector-01-06:recovery-r3", 0, -824),
        point("sector-01-06:recovery-r4", 160, -1144)
    ],
    objects: [
        worldObject("sector-01-06:fan-a", "wind-source", 416, -480, {
            damage: false,
            windZoneId: "sector-01-06:fan-a-wind"
        }),
        worldObject("sector-01-06:fan-b", "wind-source", -416, -1024, {
            damage: false,
            windZoneId: "sector-01-06:fan-b-wind"
        }),
        worldObject("sector-01-06:central-cooling-core", "background-prop", 0, -800, { gameplay: false }),
        worldObject("sector-01-06:exit-panel", "gate-panel", 176, -1344, {
            interactionRadius,
            objectiveId: "sector-01-06:exit-panel-engaged",
            gateId: "sector-01-06:gate",
            requiredObjectiveIds: ["sector-01-06:final-deck-reached"]
        }),
        worldObject("sector-01-06:pressure-bypass-gate", "gate", 288, -1376, { gateId: "sector-01-06:gate" })
    ],
    objectives: [
        {
            id: "sector-01-06:final-deck-reached",
            type: "reach",
            bounds: triggerBounds(-96, -1408, 416, 96)
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
            bounds: triggerBounds(-320, -640, 672, 320),
            direction: { x: -1, y: 0 },
            mode: "continuous",
            strength: 220
        },
        {
            id: "sector-01-06:fan-b-wind",
            bounds: triggerBounds(-352, -1280, 704, 384),
            direction: { x: 1, y: 0 },
            mode: "pulsed",
            strength: 360,
            cycle: { lull: 1.75, warning: 0.7, active: 1.4, decay: 0.3 }
        }
    ],
    gate: gate("sector-01-06:gate", 288, -1376, "sector-01-07", ["sector-01-06:exit-panel-engaged"]),
    storyTriggers: ["airflow-unstable", "cooling-pressure-critical", "bypass-required"],
    cameraZones: ["airflow-preview", "fan-a", "neutral-deck", "fan-b", "exit"],
    cueIds: ["wind-direction", "fan-a-continuous", "fan-b-lull-warning-active-decay", "bypass-required"]
});

const area07 = defineArea({
    id: "sector-01-07",
    sectorId: "sector-01",
    order: 7,
    name: "PRESSURE BYPASS",
    subtitle: "MANUAL PRESSURE CONTROL",
    bounds: { width: 960, height: 1536 },
    entry: point("sector-01-07:entry", -320, -32),
    exit: point("sector-01-07:exit", 320, -1504),
    nextAreaId: "sector-01-08",
    surfaces: [
        rectangle("sector-01-07:p0", -416, 0, 320),
        rectangle("sector-01-07:r1", -256, -192, 224, 16, { kind: "recovery" }),
        rectangle("sector-01-07:r2", 32, -512, 224, 16, { kind: "recovery" }),
        rectangle("sector-01-07:safe-shadow", -352, -864, 192, 16, { kind: "safe-deck" }),
        rectangle("sector-01-07:safe-shadow-cover", -160, -960, 64, 96, { kind: "cover", oneWay: false }),
        rectangle("sector-01-07:r3", -64, -944, 256, 16, { kind: "recovery" }),
        rectangle("sector-01-07:upper-catch", -192, -1264, 256, 16, { kind: "recovery" }),
        rectangle("sector-01-07:final-deck", 64, -1472, 320, 32, { kind: "safe-deck" }),
        ...[
            [-128, -224],
            [160, -416],
            [224, -608],
            [-192, -832],
            [224, -1056],
            [-32, -1216],
            [128, -1376]
        ].map(([x, y], index) => grappleTarget(`sector-01-07:anchor-${"abcdefg"[index]}-surface`, x, y))
    ],
    routePoints: [
        point("sector-01-07:route-entry", -320, -32),
        point("sector-01-07:route-a", -128, -224, { landmark: "A" }),
        point("sector-01-07:route-b", 160, -416, { landmark: "B" }),
        point("sector-01-07:route-c", 224, -608, { landmark: "C" }),
        point("sector-01-07:route-security", 0, -736),
        point("sector-01-07:route-d", -192, -832, { landmark: "D" }),
        point("sector-01-07:route-pressure-mid", 16, -944),
        point("sector-01-07:route-e", 224, -1056, { landmark: "E" }),
        point("sector-01-07:route-f", -32, -1216, { landmark: "F" }),
        point("sector-01-07:route-g", 128, -1376, { landmark: "G" }),
        point("sector-01-07:route-exit", 288, -1504)
    ],
    recoveryPoints: [
        point("sector-01-07:recovery-r1", -144, -216),
        point("sector-01-07:recovery-r2", 144, -536),
        point("sector-01-07:recovery-r3", 64, -968),
        point("sector-01-07:recovery-upper", -64, -1288)
    ],
    objects: [
        worldObject("sector-01-07:pressure-valve-core", "background-prop", 0, -896, { gameplay: false }),
        worldObject("sector-01-07:sentry-turret-01", "sentry", 64, -864, {
            activation: triggerBounds(-320, -1184, 640, 640),
            rules: ["standard-projectile", "no-rope-cut"]
        }),
        worldObject("sector-01-07:main-pressure-vent", "wind-source", -416, -992, {
            damage: false,
            windZoneId: "sector-01-07:main-pressure-vent-wind"
        }),
        worldObject("sector-01-07:manual-bypass-control", "gate-panel", 256, -1440, {
            interactionRadius,
            objectiveId: "sector-01-07:bypass-open",
            gateId: "sector-01-07:gate"
        }),
        worldObject("sector-01-07:containment-route-gate", "gate", 320, -1504, { gateId: "sector-01-07:gate" })
    ],
    objectives: [
        {
            id: "sector-01-07:bypass-open",
            type: "interact",
            sourceObjectId: "sector-01-07:manual-bypass-control"
        }
    ],
    windZones: [
        {
            id: "sector-01-07:residual-airflow",
            bounds: triggerBounds(-320, -640, 672, 384),
            direction: { x: 1, y: 0 },
            mode: "continuous",
            strength: 90
        },
        {
            id: "sector-01-07:main-pressure-vent-wind",
            bounds: triggerBounds(-352, -1184, 704, 384),
            direction: { x: 1, y: 0 },
            mode: "pulsed",
            strength: 360,
            cycle: { lull: 1.75, warning: 0.7, active: 1.4, decay: 0.3 }
        }
    ],
    gate: gate("sector-01-07:gate", 320, -1504, "sector-01-08", ["sector-01-07:bypass-open"]),
    storyTriggers: [
        "pressure-unstable",
        "containment-violation",
        "pressure-limit",
        "bypass-ready",
        "bypass-open",
        "service-route-available"
    ],
    routes: ["safe", "flow", "recovery", "impulse", "relay", "shear"],
    cameraZones: ["approach", "security-entry", "decision-frame", "pressure-crossing", "relief", "bypass"],
    cueIds: ["pressure-valve-core", "vent-cycle", "sentry-pressure-overlap", "manual-bypass", "service-route-available"]
});

const area08 = defineArea({
    id: "sector-01-08",
    sectorId: "sector-01",
    order: 8,
    name: "CONTAINMENT GATE",
    subtitle: "FINAL MAINTENANCE ACCESS",
    bounds: { width: 1024, height: 1792 },
    entry: point("sector-01-08:entry", -352, -32),
    exit: point("sector-01-08:exit", 320, -1760),
    nextAreaId: null,
    surfaces: [
        rectangle("sector-01-08:p0", -448, 0, 320),
        rectangle("sector-01-08:r1", -288, -288, 224, 16, { kind: "recovery" }),
        rectangle("sector-01-08:r2", 32, -544, 224, 16, { kind: "recovery" }),
        rectangle("sector-01-08:r3", -288, -832, 224, 16, { kind: "recovery" }),
        rectangle("sector-01-08:mid-safe-deck", -256, -1024, 512, 32, { kind: "safe-deck" }),
        rectangle("sector-01-08:r4", 32, -1376, 256, 16, { kind: "recovery" }),
        rectangle("sector-01-08:upper-catch", -224, -1504, 224, 16, { kind: "recovery" }),
        rectangle("sector-01-08:p8", -256, -1584, 608, 32, { kind: "safe-deck" }),
        rectangle("sector-01-08:worker-transition-floor", -320, -1728, 640, 32, { kind: "safe-deck" }),
        ...[
            [-160, -224],
            [192, -416],
            [-192, -608],
            [-96, -768],
            [128, -944],
            [-160, -1152],
            [224, -1344],
            [-32, -1504]
        ].map(([x, y], index) => grappleTarget(`sector-01-08:anchor-${"abcdefgh"[index]}-surface`, x, y))
    ],
    routePoints: [
        point("sector-01-08:route-entry", -352, -32),
        ...[
            [-160, -224],
            [192, -416],
            [-192, -608],
            [-96, -768],
            [128, -944],
            [-160, -1152],
            [224, -1344],
            [-32, -1504]
        ].map(([x, y], index) =>
            point(`sector-01-08:route-${"abcdefgh"[index]}`, x, y, { landmark: "ABCDEFGH"[index] })
        ),
        point("sector-01-08:route-override", 208, -1584),
        point("sector-01-08:route-exit", 288, -1760)
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
            reward: true,
            sourceObjectId: "sector-01-08:sector-checkpoint"
        })
    ],
    objects: [
        worldObject("sector-01-08:sentry-turret-lower", "sentry", 384, -768, {
            activation: triggerBounds(-256, -1024, 640, 384),
            rules: ["sequential-activation", "no-crossfire", "standard-projectile", "no-rope-cut"]
        }),
        worldObject("sector-01-08:sentry-turret-upper", "sentry", 384, -1280, {
            activation: triggerBounds(-256, -1504, 640, 416),
            rules: ["sequential-activation", "no-crossfire", "standard-projectile", "no-rope-cut"]
        }),
        worldObject("sector-01-08:final-vent", "wind-source", -448, -1248, {
            damage: false,
            windZoneId: "sector-01-08:final-pulsed-vent"
        }),
        worldObject("sector-01-08:containment-gate", "gate", 256, -1600, {
            gateId: "sector-01-08:gate",
            cueIds: ["sector-01-08:final-warning", "sector-01-08:locked"]
        }),
        worldObject("sector-01-08:maintenance-override-panel", "gate-panel", 208, -1584, {
            interactionRadius,
            objectiveId: "sector-01-08:maintenance-override",
            gateId: "sector-01-08:gate"
        }),
        worldObject("sector-01-08:sector-checkpoint", "checkpoint", 0, -1696, {
            cueIds: ["sector-01-08:worker-district-reveal", "sector-01-08:sector-checkpoint"]
        })
    ],
    objectives: [
        {
            id: "sector-01-08:maintenance-override",
            type: "interact",
            sourceObjectId: "sector-01-08:maintenance-override-panel"
        }
    ],
    windZones: [
        {
            id: "sector-01-08:final-pulsed-vent",
            bounds: triggerBounds(-384, -1504, 768, 448),
            direction: { x: 1, y: 0 },
            mode: "pulsed",
            strength: 360,
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
        "intro",
        "chain-ascent",
        "turret-one",
        "mid-relief",
        "final-preview",
        "final-crossing",
        "gate",
        "shutdown",
        "worker-reveal"
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
    revision: "sector-01-scenarios-rev3-v2",
    areas: [area01, area02, area03, area04, area05, area06, area07, area08]
});
