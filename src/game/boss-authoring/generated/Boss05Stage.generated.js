import { freezeBossStageValue } from "../BossStageSpec.js";

export const BOSS_05_STAGE_SPEC = freezeBossStageValue({
    arena: {
        anchors: [
            {
                id: "boss-05:entry",
                x: 2600,
                y: -160
            },
            {
                id: "boss-05:left-1",
                x: 2300,
                y: -420
            },
            {
                id: "boss-05:left-2",
                x: 1980,
                y: -610
            },
            {
                id: "boss-05:a-bridge-1",
                x: 1800,
                y: -900
            },
            {
                id: "boss-05:a-bridge-2",
                x: 1650,
                y: -1080
            },
            {
                id: "boss-05:a-strike",
                x: 1500,
                y: -1230
            },
            {
                id: "boss-05:left-3",
                x: 1750,
                y: -1420
            },
            {
                id: "boss-05:a-cross-1",
                x: 2050,
                y: -1200
            },
            {
                id: "boss-05:a-cross-2",
                x: 2300,
                y: -950
            },
            {
                id: "boss-05:cross",
                x: 2600,
                y: -760
            },
            {
                id: "boss-05:right-1",
                x: 2900,
                y: -420
            },
            {
                id: "boss-05:right-2",
                x: 3220,
                y: -610
            },
            {
                id: "boss-05:b-bridge-1",
                x: 3400,
                y: -900
            },
            {
                id: "boss-05:b-bridge-2",
                x: 3550,
                y: -1080
            },
            {
                id: "boss-05:b-strike",
                x: 3700,
                y: -1230
            },
            {
                id: "boss-05:right-3",
                x: 3450,
                y: -1420
            },
            {
                id: "boss-05:b-cross-1",
                x: 3150,
                y: -1200
            },
            {
                id: "boss-05:b-cross-2",
                x: 2900,
                y: -950
            },
            {
                id: "boss-05:p3-bridge",
                x: 2600,
                y: -900
            },
            {
                id: "boss-05:p3-low-l",
                x: 2380,
                y: -1030
            },
            {
                id: "boss-05:p3-low-r",
                x: 2820,
                y: -1030
            },
            {
                id: "boss-05:main",
                x: 2600,
                y: -980
            },
            {
                id: "boss-05:top-l",
                x: 2380,
                y: -650
            },
            {
                id: "boss-05:top-r",
                x: 2820,
                y: -650
            },
            {
                id: "boss-05:core",
                x: 2600,
                y: -450
            },
            {
                id: "boss-05:exit-1",
                x: 2600,
                y: -400
            },
            {
                id: "boss-05:exit-2",
                x: 2600,
                y: -180
            }
        ],
        baseHookReach: 400,
        bounds: {
            height: 2600,
            width: 5200,
            x: 0,
            y: -2600
        },
        entry: {
            id: "boss-05:entry",
            x: 2600,
            y: -212
        },
        exit: {
            id: "boss-05:exit",
            x: 2600,
            y: -2420
        },
        phaseZones: [
            {
                bounds: {
                    height: 2240,
                    width: 1700,
                    x: 900,
                    y: -2440
                },
                id: "boss-05:zone-a",
                phaseId: "boss-05:phase-1"
            },
            {
                bounds: {
                    height: 2200,
                    width: 1500,
                    x: 2800,
                    y: -2440
                },
                id: "boss-05:zone-b",
                phaseId: "boss-05:phase-2"
            },
            {
                bounds: {
                    height: 2200,
                    width: 1000,
                    x: 2100,
                    y: -2440
                },
                id: "boss-05:zone-main",
                phaseId: "boss-05:phase-3"
            },
            {
                bounds: {
                    height: 2200,
                    width: 1100,
                    x: 2050,
                    y: -2440
                },
                id: "boss-05:zone-core",
                phaseId: "boss-05:phase-4"
            }
        ],
        recoveryPoints: [
            {
                id: "boss-05:recovery-entry",
                x: 2600,
                y: -220
            },
            {
                id: "boss-05:recovery-cross",
                x: 2600,
                y: -820
            },
            {
                id: "boss-05:recovery-main",
                x: 2600,
                y: -1080
            }
        ],
        routeEdges: [
            {
                from: "boss-05:entry",
                id: "boss-05:edge-01",
                to: "boss-05:left-1"
            },
            {
                from: "boss-05:left-1",
                id: "boss-05:edge-02",
                to: "boss-05:left-2"
            },
            {
                from: "boss-05:left-2",
                id: "boss-05:edge-03",
                to: "boss-05:a-bridge-1"
            },
            {
                from: "boss-05:a-bridge-1",
                id: "boss-05:edge-04",
                to: "boss-05:a-bridge-2"
            },
            {
                from: "boss-05:a-bridge-2",
                id: "boss-05:edge-05",
                to: "boss-05:a-strike"
            },
            {
                from: "boss-05:a-strike",
                id: "boss-05:edge-06",
                to: "boss-05:left-3"
            },
            {
                from: "boss-05:left-3",
                id: "boss-05:edge-07",
                to: "boss-05:a-cross-1"
            },
            {
                from: "boss-05:a-cross-1",
                id: "boss-05:edge-08",
                to: "boss-05:a-cross-2"
            },
            {
                from: "boss-05:a-cross-2",
                id: "boss-05:edge-09",
                to: "boss-05:cross"
            },
            {
                from: "boss-05:entry",
                id: "boss-05:edge-10",
                to: "boss-05:right-1"
            },
            {
                from: "boss-05:right-1",
                id: "boss-05:edge-11",
                to: "boss-05:right-2"
            },
            {
                from: "boss-05:right-2",
                id: "boss-05:edge-12",
                to: "boss-05:b-bridge-1"
            },
            {
                from: "boss-05:b-bridge-1",
                id: "boss-05:edge-13",
                to: "boss-05:b-bridge-2"
            },
            {
                from: "boss-05:b-bridge-2",
                id: "boss-05:edge-14",
                to: "boss-05:b-strike"
            },
            {
                from: "boss-05:b-strike",
                id: "boss-05:edge-15",
                to: "boss-05:right-3"
            },
            {
                from: "boss-05:right-3",
                id: "boss-05:edge-16",
                to: "boss-05:b-cross-1"
            },
            {
                from: "boss-05:b-cross-1",
                id: "boss-05:edge-17",
                to: "boss-05:b-cross-2"
            },
            {
                from: "boss-05:b-cross-2",
                id: "boss-05:edge-18",
                to: "boss-05:cross"
            },
            {
                from: "boss-05:cross",
                id: "boss-05:edge-19",
                to: "boss-05:p3-bridge"
            },
            {
                from: "boss-05:p3-bridge",
                id: "boss-05:edge-20",
                to: "boss-05:p3-low-l"
            },
            {
                from: "boss-05:p3-bridge",
                id: "boss-05:edge-21",
                to: "boss-05:p3-low-r"
            },
            {
                from: "boss-05:p3-low-l",
                id: "boss-05:edge-22",
                to: "boss-05:main"
            },
            {
                from: "boss-05:p3-low-r",
                id: "boss-05:edge-23",
                to: "boss-05:main"
            },
            {
                from: "boss-05:main",
                id: "boss-05:edge-24",
                to: "boss-05:top-l"
            },
            {
                from: "boss-05:main",
                id: "boss-05:edge-25",
                to: "boss-05:top-r"
            },
            {
                from: "boss-05:top-l",
                id: "boss-05:edge-26",
                to: "boss-05:core"
            },
            {
                from: "boss-05:top-r",
                id: "boss-05:edge-27",
                to: "boss-05:core"
            },
            {
                from: "boss-05:core",
                id: "boss-05:edge-28",
                to: "boss-05:exit-1"
            },
            {
                from: "boss-05:exit-1",
                id: "boss-05:edge-29",
                to: "boss-05:exit-2"
            }
        ],
        surfaces: [
            {
                bounds: {
                    height: 100,
                    width: 800,
                    x: 2200,
                    y: -180
                },
                grappleable: true,
                id: "boss-05:entry-deck",
                kind: "platform",
                oneWay: false
            },
            {
                bounds: {
                    height: 90,
                    width: 850,
                    x: 1050,
                    y: -1240
                },
                grappleable: true,
                id: "boss-05:left-service-platform",
                kind: "platform",
                oneWay: false
            },
            {
                bounds: {
                    height: 90,
                    width: 850,
                    x: 3300,
                    y: -1240
                },
                grappleable: true,
                id: "boss-05:right-service-platform",
                kind: "platform",
                oneWay: false
            },
            {
                bounds: {
                    height: 80,
                    width: 720,
                    x: 2240,
                    y: -760
                },
                grappleable: true,
                id: "boss-05:cross-platform",
                kind: "platform",
                oneWay: true
            },
            {
                bounds: {
                    height: 70,
                    width: 420,
                    x: 2100,
                    y: -600
                },
                grappleable: true,
                id: "boss-05:top-left",
                kind: "platform",
                oneWay: true
            },
            {
                bounds: {
                    height: 70,
                    width: 420,
                    x: 2680,
                    y: -600
                },
                grappleable: true,
                id: "boss-05:top-right",
                kind: "platform",
                oneWay: true
            },
            {
                bounds: {
                    height: 300,
                    width: 320,
                    x: 2440,
                    y: -2480
                },
                grappleable: false,
                id: "boss-05:rooftop-gate",
                kind: "architecture",
                oneWay: false
            }
        ]
    },
    boss: {
        actorId: "boss-05:continuity-core",
        collider: {
            height: 300,
            width: 320,
            x: 2440,
            y: -600
        },
        impactTargetIds: [
            "boss-05:aux-a:coupling",
            "boss-05:aux-b:coupling",
            "boss-05:main:coupling",
            "boss-05:continuity-core"
        ],
        mechanicId: "continuity-control-core",
        position: {
            x: 2600,
            y: -450
        },
        visualPresetId: "continuity-control-core"
    },
    combat: {
        additionalPlayerMultiplier: 0.5,
        closedBodyDamageMultiplier: 0,
        generalDamageMode: "standard-combat",
        lateJoinPolicy: "join-current-attempt-without-rescale",
        participantCountSnapshot: "boss-stage-start",
        phaseOverflowPolicy: "discard-at-floor",
        weakFixedPercent: 0,
        weakNormalDamageMultiplier: 1
    },
    hud: {
        healthBar: {
            phaseMarkerCount: 4,
            showNumbers: true,
            showPhaseBreaks: true,
            style: "segmented-total"
        },
        objectivePlacement: "below-health",
        showVulnerabilityCountdown: true,
        title: "CONTINUITY CONTROL CORE"
    },
    id: "boss-05",
    mechanics: [
        {
            bounds: {
                height: 2360,
                width: 180,
                x: 2020,
                y: -2460
            },
            id: "boss-05:aux-a-control",
            parameters: {
                damage: 20,
                exposureSeconds: 4,
                moveSeconds: 0.8,
                role: "aux-a",
                warningSeconds: 0.8
            },
            position: {
                x: 1800,
                y: -1180
            },
            type: "continuity-control-core"
        },
        {
            bounds: {
                height: 2360,
                width: 180,
                x: 3070,
                y: -2460
            },
            id: "boss-05:aux-b-control",
            parameters: {
                damage: 20,
                exposureSeconds: 4,
                moveSeconds: 0.8,
                role: "aux-b",
                warningSeconds: 0.8
            },
            position: {
                x: 3400,
                y: -1180
            },
            type: "continuity-control-core"
        },
        {
            bounds: {
                height: 2360,
                width: 180,
                x: 2510,
                y: -2460
            },
            id: "boss-05:main-control",
            parameters: {
                damage: 25,
                exposureSeconds: 4,
                moveSeconds: 0.8,
                role: "main",
                warningSeconds: 0.8
            },
            position: {
                x: 2600,
                y: -980
            },
            type: "continuity-control-core"
        },
        {
            bounds: {
                height: 650,
                width: 800,
                x: 2200,
                y: -850
            },
            id: "boss-05:core-control",
            parameters: {
                exposureSeconds: 4,
                role: "core"
            },
            position: {
                x: 2600,
                y: -450
            },
            type: "continuity-control-core"
        }
    ],
    name: "CONTINUITY CONTROL CORE",
    nextAreaId: "sector-06-01",
    phases: [
        {
            basePhaseHealth: 200,
            hud: {
                objective: "A Wall을 피하고 AUX A Coupling을 공격"
            },
            id: "boss-05:phase-1",
            mechanicIds: ["boss-05:aux-a-control"],
            name: "AUXILIARY A",
            order: 1,
            vulnerability: {
                durationSeconds: 4,
                targetId: "boss-05:aux-a:coupling",
                trigger: "sweep-complete",
                visualPresetId: "aux-coupling"
            }
        },
        {
            basePhaseHealth: 200,
            hud: {
                objective: "Control Pulse를 피하고 AUX B Coupling을 공격"
            },
            id: "boss-05:phase-2",
            mechanicIds: ["boss-05:aux-b-control"],
            name: "AUXILIARY B",
            order: 2,
            vulnerability: {
                durationSeconds: 4,
                targetId: "boss-05:aux-b:coupling",
                trigger: "sweep-complete",
                visualPresetId: "aux-coupling"
            }
        },
        {
            basePhaseHealth: 260,
            hud: {
                objective: "Emergency Wall 이후 MAIN Coupling을 공격"
            },
            id: "boss-05:phase-3",
            mechanicIds: ["boss-05:main-control"],
            name: "MAIN DRIVE",
            order: 3,
            vulnerability: {
                durationSeconds: 4,
                targetId: "boss-05:main:coupling",
                trigger: "sweep-complete",
                visualPresetId: "main-coupling"
            }
        },
        {
            basePhaseHealth: 320,
            hud: {
                objective: "완전히 열린 Continuity Core를 정지"
            },
            id: "boss-05:phase-4",
            mechanicIds: ["boss-05:core-control"],
            name: "CONTINUITY CORE",
            order: 4,
            vulnerability: {
                durationSeconds: 4,
                targetId: "boss-05:continuity-core",
                trigger: "sweep-complete",
                visualPresetId: "continuity-core"
            }
        }
    ],
    schemaVersion: "boss-stage-spec-v2",
    sourceAreaId: "sector-05-08",
    specType: "boss-stage",
    subtitle: "CONTINUITY COMMAND CHAMBER / ROOFTOP ACCESS",
    transition: {
        entryTrigger: "checkpoint-complete",
        nextAreaId: "sector-06-01",
        retainPlayerControl: true,
        sourceAreaId: "sector-05-08",
        victoryPresentationId: "boss-05:control-lost",
        victoryTrigger: "all-phases-depleted"
    }
});
