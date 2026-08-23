import { freezeBossStageValue } from "../BossStageSpec.js";

export const BOSS_04_STAGE_SPEC = freezeBossStageValue({
    arena: {
        anchors: [
            {
                id: "boss-04:route-01",
                x: 300,
                y: -420
            },
            {
                id: "boss-04:route-02",
                x: 600,
                y: -560
            },
            {
                id: "boss-04:route-03",
                x: 900,
                y: -720
            },
            {
                id: "boss-04:route-04",
                x: 1220,
                y: -860
            },
            {
                id: "boss-04:route-05",
                x: 1520,
                y: -700
            },
            {
                id: "boss-04:route-06",
                x: 1780,
                y: -820
            },
            {
                id: "boss-04:route-07",
                x: 2050,
                y: -1040
            },
            {
                id: "boss-04:route-08",
                x: 2340,
                y: -1260
            },
            {
                id: "boss-04:route-09",
                x: 2640,
                y: -1460
            },
            {
                id: "boss-04:route-10",
                x: 2940,
                y: -1240
            },
            {
                id: "boss-04:route-11",
                x: 3200,
                y: -1060
            },
            {
                id: "boss-04:route-12",
                x: 3500,
                y: -1260
            },
            {
                id: "boss-04:route-13",
                x: 3800,
                y: -1500
            },
            {
                id: "boss-04:route-14",
                x: 4050,
                y: -1760
            },
            {
                id: "boss-04:route-15",
                x: 4350,
                y: -1990
            },
            {
                id: "boss-04:route-16",
                x: 4650,
                y: -1760
            },
            {
                id: "boss-04:route-17",
                x: 4920,
                y: -1510
            },
            {
                id: "boss-04:route-18",
                x: 5120,
                y: -1820
            },
            {
                id: "boss-04:route-19",
                x: 5000,
                y: -2120
            },
            {
                id: "boss-04:route-20",
                x: 5160,
                y: -2300
            }
        ],
        baseHookReach: 400,
        bounds: {
            height: 2500,
            width: 5400,
            x: 0,
            y: -2500
        },
        entry: {
            id: "boss-04:entry",
            x: 240,
            y: -332
        },
        exit: {
            id: "boss-04:exit",
            x: 5160,
            y: -2220
        },
        phaseZones: [
            {
                bounds: {
                    height: 980,
                    width: 1640,
                    x: 80,
                    y: -1180
                },
                id: "boss-04:zone-garden",
                phaseId: "boss-04:phase-1"
            },
            {
                bounds: {
                    height: 1500,
                    width: 1840,
                    x: 1700,
                    y: -1840
                },
                id: "boss-04:zone-skybridge",
                phaseId: "boss-04:phase-2"
            },
            {
                bounds: {
                    height: 1640,
                    width: 1760,
                    x: 3520,
                    y: -2420
                },
                id: "boss-04:zone-hub",
                phaseId: "boss-04:phase-3"
            }
        ],
        recoveryPoints: [
            {
                id: "boss-04:recovery-entry",
                x: 300,
                y: -350
            },
            {
                id: "boss-04:recovery-refuge",
                x: 1740,
                y: -700
            },
            {
                id: "boss-04:recovery-hub",
                x: 3700,
                y: -1600
            }
        ],
        routeEdges: [
            {
                from: "boss-04:route-01",
                id: "boss-04:edge-01",
                to: "boss-04:route-02"
            },
            {
                from: "boss-04:route-02",
                id: "boss-04:edge-02",
                to: "boss-04:route-03"
            },
            {
                from: "boss-04:route-03",
                id: "boss-04:edge-03",
                to: "boss-04:route-04"
            },
            {
                from: "boss-04:route-04",
                id: "boss-04:edge-04",
                to: "boss-04:route-05"
            },
            {
                from: "boss-04:route-05",
                id: "boss-04:edge-05",
                to: "boss-04:route-06"
            },
            {
                from: "boss-04:route-06",
                id: "boss-04:edge-06",
                to: "boss-04:route-07"
            },
            {
                from: "boss-04:route-07",
                id: "boss-04:edge-07",
                to: "boss-04:route-08"
            },
            {
                from: "boss-04:route-08",
                id: "boss-04:edge-08",
                to: "boss-04:route-09"
            },
            {
                from: "boss-04:route-09",
                id: "boss-04:edge-09",
                to: "boss-04:route-10"
            },
            {
                from: "boss-04:route-10",
                id: "boss-04:edge-10",
                to: "boss-04:route-11"
            },
            {
                from: "boss-04:route-11",
                id: "boss-04:edge-11",
                to: "boss-04:route-12"
            },
            {
                from: "boss-04:route-12",
                id: "boss-04:edge-12",
                to: "boss-04:route-13"
            },
            {
                from: "boss-04:route-13",
                id: "boss-04:edge-13",
                to: "boss-04:route-14"
            },
            {
                from: "boss-04:route-14",
                id: "boss-04:edge-14",
                to: "boss-04:route-15"
            },
            {
                from: "boss-04:route-15",
                id: "boss-04:edge-15",
                to: "boss-04:route-16"
            },
            {
                from: "boss-04:route-16",
                id: "boss-04:edge-16",
                to: "boss-04:route-17"
            },
            {
                from: "boss-04:route-17",
                id: "boss-04:edge-17",
                to: "boss-04:route-18"
            },
            {
                from: "boss-04:route-18",
                id: "boss-04:edge-18",
                to: "boss-04:route-19"
            },
            {
                from: "boss-04:route-19",
                id: "boss-04:edge-19",
                to: "boss-04:route-20"
            }
        ],
        surfaces: [
            {
                bounds: {
                    height: 100,
                    width: 1580,
                    x: 100,
                    y: -300
                },
                grappleable: true,
                id: "boss-04:garden-deck",
                kind: "platform",
                oneWay: false
            },
            {
                bounds: {
                    height: 690,
                    width: 180,
                    x: 610,
                    y: -990
                },
                grappleable: true,
                id: "boss-04:pergola",
                kind: "architecture",
                oneWay: false
            },
            {
                bounds: {
                    height: 70,
                    width: 480,
                    x: 1040,
                    y: -770
                },
                grappleable: true,
                id: "boss-04:garden-terrace",
                kind: "platform",
                oneWay: true
            },
            {
                bounds: {
                    height: 90,
                    width: 300,
                    x: 1640,
                    y: -640
                },
                grappleable: true,
                id: "boss-04:refuge-landing",
                kind: "platform",
                oneWay: false
            },
            {
                bounds: {
                    height: 80,
                    width: 1380,
                    x: 1920,
                    y: -720
                },
                grappleable: true,
                id: "boss-04:lower-skybridge",
                kind: "platform",
                oneWay: false
            },
            {
                bounds: {
                    height: 70,
                    width: 1180,
                    x: 2050,
                    y: -1480
                },
                grappleable: true,
                id: "boss-04:upper-skybridge",
                kind: "platform",
                oneWay: true
            },
            {
                bounds: {
                    height: 70,
                    width: 400,
                    x: 2740,
                    y: -1080
                },
                grappleable: true,
                id: "boss-04:refuge-balcony",
                kind: "platform",
                oneWay: true
            },
            {
                bounds: {
                    height: 90,
                    width: 580,
                    x: 3580,
                    y: -1550
                },
                grappleable: true,
                id: "boss-04:left-refuge-terrace",
                kind: "platform",
                oneWay: false
            },
            {
                bounds: {
                    height: 90,
                    width: 580,
                    x: 4620,
                    y: -1550
                },
                grappleable: true,
                id: "boss-04:right-refuge-terrace",
                kind: "platform",
                oneWay: false
            },
            {
                bounds: {
                    height: 70,
                    width: 680,
                    x: 4040,
                    y: -2050
                },
                grappleable: true,
                id: "boss-04:high-refuge-skybridge",
                kind: "platform",
                oneWay: true
            },
            {
                bounds: {
                    height: 280,
                    width: 300,
                    x: 4230,
                    y: -1830
                },
                grappleable: false,
                id: "boss-04:security-hub-deck",
                kind: "architecture",
                oneWay: false
            }
        ]
    },
    boss: {
        actorId: "boss-04:security-hub",
        collider: {
            height: 280,
            width: 300,
            x: 4230,
            y: -1880
        },
        impactTargetIds: [
            "boss-04:guard-a:body",
            "boss-04:guard-a:rear-thruster",
            "boss-04:guard-b:body",
            "boss-04:guard-b:side-controller",
            "boss-04:security-hub:core"
        ],
        mechanicId: "residential-security-system",
        position: {
            x: 4380,
            y: -1740
        },
        visualPresetId: "residential-security-hub"
    },
    combat: {
        additionalPlayerMultiplier: 0.5,
        closedBodyDamageMultiplier: 0.25,
        generalDamageMode: "standard-combat",
        lateJoinPolicy: "join-current-attempt-without-rescale",
        participantCountSnapshot: "boss-stage-start",
        phaseOverflowPolicy: "discard-at-floor",
        weakFixedPercent: 0.25,
        weakNormalDamageMultiplier: 1
    },
    hud: {
        healthBar: {
            phaseMarkerCount: 3,
            showNumbers: true,
            showPhaseBreaks: true,
            style: "segmented-total"
        },
        objectivePlacement: "below-health",
        showVulnerabilityCountdown: true,
        title: "UPPER RESIDENTIAL SECURITY SYSTEM"
    },
    id: "boss-04",
    mechanics: [
        {
            bounds: {
                height: 980,
                width: 1640,
                x: 80,
                y: -1180
            },
            id: "boss-04:guard-a",
            parameters: {
                burstIntervalSeconds: 0.25,
                damage: 20,
                recoverySeconds: 1.8,
                role: "guard-a",
                telegraphSeconds: 0.6
            },
            position: {
                x: 920,
                y: -980
            },
            type: "residential-security-system"
        },
        {
            bounds: {
                height: 1500,
                width: 1840,
                x: 1700,
                y: -1840
            },
            id: "boss-04:guard-b",
            parameters: {
                damage: 25,
                recoverySeconds: 1.5,
                role: "guard-b",
                telegraphSeconds: 0.55
            },
            position: {
                x: 2600,
                y: -1180
            },
            type: "residential-security-system"
        },
        {
            bounds: {
                height: 1640,
                width: 1760,
                x: 3520,
                y: -2420
            },
            id: "boss-04:security-hub",
            parameters: {
                beamSeconds: 0.6,
                beamWarningSeconds: 0.75,
                burstSeconds: 0.35,
                burstWarningSeconds: 0.55,
                coreSeconds: 2.2,
                damage: 25,
                role: "hub"
            },
            position: {
                x: 4380,
                y: -1740
            },
            type: "residential-security-system"
        }
    ],
    name: "UPPER RESIDENTIAL SECURITY SYSTEM",
    nextAreaId: "sector-05-01",
    phases: [
        {
            basePhaseHealth: 200,
            hud: {
                objective: "범위 폭발 뒤 후방 추진기를 Rope Impact"
            },
            id: "boss-04:phase-1",
            mechanicIds: ["boss-04:guard-a"],
            name: "GUARD A",
            order: 1,
            vulnerability: {
                durationSeconds: 1.8,
                targetId: "boss-04:guard-a:rear-thruster",
                trigger: "sweep-complete",
                visualPresetId: "rear-thruster"
            }
        },
        {
            basePhaseHealth: 200,
            hud: {
                objective: "돌진 뒤 측면 제어기를 Rope Impact"
            },
            id: "boss-04:phase-2",
            mechanicIds: ["boss-04:guard-b"],
            name: "GUARD B",
            order: 2,
            vulnerability: {
                durationSeconds: 1.5,
                targetId: "boss-04:guard-b:side-controller",
                trigger: "sweep-complete",
                visualPresetId: "side-controller"
            }
        },
        {
            basePhaseHealth: 300,
            hud: {
                objective: "두 보호 링크를 끊고 중앙 Core를 공격"
            },
            id: "boss-04:phase-3",
            mechanicIds: ["boss-04:security-hub"],
            name: "CENTRAL SECURITY HUB",
            order: 3,
            vulnerability: {
                durationSeconds: 2.2,
                targetId: "boss-04:security-hub:core",
                trigger: "sweep-complete",
                visualPresetId: "central-security-core"
            }
        }
    ],
    schemaVersion: "boss-stage-spec-v2",
    sourceAreaId: "sector-04-08",
    specType: "boss-stage",
    subtitle: "UPPER RESIDENCE / PROTECTED ASCENT",
    transition: {
        entryTrigger: "checkpoint-complete",
        nextAreaId: "sector-05-01",
        retainPlayerControl: true,
        sourceAreaId: "sector-04-08",
        victoryPresentationId: "boss-04:resident-security-offline",
        victoryTrigger: "all-phases-depleted"
    }
});
