import { freezeBossStageValue } from "../BossStageSpec.js";

export const BOSS_02_STAGE_SPEC = freezeBossStageValue({
    arena: {
        anchors: [
            {
                id: "boss-02:p1-a0",
                x: 260,
                y: -300
            },
            {
                id: "boss-02:p1-a1",
                x: 520,
                y: -430
            },
            {
                id: "boss-02:p1-a2",
                x: 820,
                y: -570
            },
            {
                id: "boss-02:p1-a3",
                x: 1120,
                y: -720
            },
            {
                id: "boss-02:p1-a4",
                x: 1420,
                y: -850
            },
            {
                id: "boss-02:p1-a5",
                x: 1720,
                y: -720
            },
            {
                id: "boss-02:p1-a6",
                x: 1950,
                y: -800
            },
            {
                id: "boss-02:p1-l-bait",
                x: 620,
                y: -900
            },
            {
                id: "boss-02:p1-l-evade",
                x: 500,
                y: -1190
            },
            {
                id: "boss-02:p1-l-counter",
                x: 840,
                y: -1040
            },
            {
                id: "boss-02:p1-l-return",
                x: 1160,
                y: -980
            },
            {
                id: "boss-02:p1-r-bait",
                x: 1800,
                y: -930
            },
            {
                id: "boss-02:p1-r-evade",
                x: 1960,
                y: -1190
            },
            {
                id: "boss-02:p1-r-counter",
                x: 1600,
                y: -1050
            },
            {
                id: "boss-02:t12-0",
                x: 1980,
                y: -1050
            },
            {
                id: "boss-02:t12-1",
                x: 2080,
                y: -1270
            },
            {
                id: "boss-02:t12-2",
                x: 2400,
                y: -1270
            },
            {
                id: "boss-02:p2-b1",
                x: 2600,
                y: -1000
            },
            {
                id: "boss-02:p2-b2",
                x: 2860,
                y: -1080
            },
            {
                id: "boss-02:p2-b3",
                x: 3060,
                y: -1390
            },
            {
                id: "boss-02:p2-b4",
                x: 3300,
                y: -1690
            },
            {
                id: "boss-02:p2-b5",
                x: 3600,
                y: -1880
            },
            {
                id: "boss-02:p2-b6",
                x: 3940,
                y: -1840
            },
            {
                id: "boss-02:p2-b7",
                x: 4210,
                y: -1620
            },
            {
                id: "boss-02:p2-b8",
                x: 4440,
                y: -1330
            },
            {
                id: "boss-02:p2-b9",
                x: 4660,
                y: -1040
            },
            {
                id: "boss-02:p2-b10",
                x: 4900,
                y: -820
            },
            {
                id: "boss-02:p2-c1",
                x: 3400,
                y: -1250
            },
            {
                id: "boss-02:p2-c2",
                x: 3650,
                y: -1050
            },
            {
                id: "boss-02:p2-c3",
                x: 3950,
                y: -1250
            },
            {
                id: "boss-02:p2-c4",
                x: 3850,
                y: -1570
            },
            {
                id: "boss-02:t23-0",
                x: 5000,
                y: -1050
            },
            {
                id: "boss-02:t23-1",
                x: 5060,
                y: -1250
            },
            {
                id: "boss-02:t23-2",
                x: 5300,
                y: -1250
            },
            {
                id: "boss-02:t23-3",
                x: 5420,
                y: -1580
            },
            {
                id: "boss-02:p3-a0",
                x: 5500,
                y: -1900
            },
            {
                id: "boss-02:p3-a1",
                x: 5700,
                y: -2200
            },
            {
                id: "boss-02:p3-t-bait",
                x: 5750,
                y: -2460
            },
            {
                id: "boss-02:p3-t-evade",
                x: 5950,
                y: -2750
            },
            {
                id: "boss-02:p3-t-counter",
                x: 6200,
                y: -2500
            },
            {
                id: "boss-02:p3-s-pre",
                x: 6450,
                y: -2550
            },
            {
                id: "boss-02:p3-s-bait",
                x: 6500,
                y: -2850
            },
            {
                id: "boss-02:p3-s-evade",
                x: 6700,
                y: -3180
            },
            {
                id: "boss-02:p3-s-counter",
                x: 7000,
                y: -3000
            },
            {
                id: "boss-02:p3-v-pre",
                x: 7250,
                y: -3000
            },
            {
                id: "boss-02:p3-v-bait",
                x: 7400,
                y: -3200
            },
            {
                id: "boss-02:p3-v-evade",
                x: 7650,
                y: -3500
            },
            {
                id: "boss-02:p3-v-counter",
                x: 7900,
                y: -3250
            },
            {
                id: "boss-02:p3-exit",
                x: 8200,
                y: -3250
            }
        ],
        baseHookReach: 400,
        bounds: {
            height: 3700,
            width: 8600,
            x: 0,
            y: -3700
        },
        entry: {
            id: "boss-02:entry",
            x: 240,
            y: -356
        },
        exit: {
            id: "boss-02:exit",
            x: 8320,
            y: -3250
        },
        phaseZones: [
            {
                bounds: {
                    height: 1500,
                    width: 2200,
                    x: 120,
                    y: -1600
                },
                id: "boss-02:zone-alley",
                phaseId: "boss-02:phase-1"
            },
            {
                bounds: {
                    height: 2100,
                    width: 2700,
                    x: 2500,
                    y: -2500
                },
                id: "boss-02:zone-courtyard",
                phaseId: "boss-02:phase-2"
            },
            {
                bounds: {
                    height: 2400,
                    width: 3100,
                    x: 5350,
                    y: -3550
                },
                id: "boss-02:zone-rooftop",
                phaseId: "boss-02:phase-3"
            }
        ],
        recoveryPoints: [
            {
                id: "boss-02:recovery-alley-a",
                x: 420,
                y: -390
            },
            {
                id: "boss-02:recovery-alley-b",
                x: 1900,
                y: -390
            },
            {
                id: "boss-02:recovery-courtyard-a",
                x: 2800,
                y: -700
            },
            {
                id: "boss-02:recovery-courtyard-b",
                x: 4800,
                y: -700
            },
            {
                id: "boss-02:recovery-rooftop-a",
                x: 5550,
                y: -2140
            },
            {
                id: "boss-02:recovery-rooftop-b",
                x: 8100,
                y: -2940
            }
        ],
        routeEdges: [
            {
                from: "boss-02:p1-a0",
                id: "boss-02:rev3-edge-01",
                to: "boss-02:p1-a1"
            },
            {
                from: "boss-02:p1-a1",
                id: "boss-02:rev3-edge-02",
                to: "boss-02:p1-a2"
            },
            {
                from: "boss-02:p1-a2",
                id: "boss-02:rev3-edge-03",
                to: "boss-02:p1-a3"
            },
            {
                from: "boss-02:p1-a3",
                id: "boss-02:rev3-edge-04",
                to: "boss-02:p1-a4"
            },
            {
                from: "boss-02:p1-a4",
                id: "boss-02:rev3-edge-05",
                to: "boss-02:p1-a5"
            },
            {
                from: "boss-02:p1-a5",
                id: "boss-02:rev3-edge-06",
                to: "boss-02:p1-a6"
            },
            {
                from: "boss-02:p1-a2",
                id: "boss-02:rev3-edge-07",
                to: "boss-02:p1-l-bait"
            },
            {
                from: "boss-02:p1-l-bait",
                id: "boss-02:rev3-edge-08",
                to: "boss-02:p1-l-evade"
            },
            {
                from: "boss-02:p1-l-evade",
                id: "boss-02:rev3-edge-09",
                to: "boss-02:p1-l-counter"
            },
            {
                from: "boss-02:p1-l-counter",
                id: "boss-02:rev3-edge-10",
                to: "boss-02:p1-l-return"
            },
            {
                from: "boss-02:p1-l-return",
                id: "boss-02:rev3-edge-11",
                to: "boss-02:p1-a4"
            },
            {
                from: "boss-02:p1-a5",
                id: "boss-02:rev3-edge-12",
                to: "boss-02:p1-r-bait"
            },
            {
                from: "boss-02:p1-r-bait",
                id: "boss-02:rev3-edge-13",
                to: "boss-02:p1-r-evade"
            },
            {
                from: "boss-02:p1-r-evade",
                id: "boss-02:rev3-edge-14",
                to: "boss-02:p1-r-counter"
            },
            {
                from: "boss-02:p1-r-counter",
                id: "boss-02:rev3-edge-15",
                to: "boss-02:p1-a4"
            },
            {
                from: "boss-02:p1-a6",
                id: "boss-02:rev3-edge-16",
                to: "boss-02:t12-0"
            },
            {
                from: "boss-02:t12-0",
                id: "boss-02:rev3-edge-17",
                to: "boss-02:t12-1"
            },
            {
                from: "boss-02:t12-1",
                id: "boss-02:rev3-edge-18",
                to: "boss-02:t12-2"
            },
            {
                from: "boss-02:t12-2",
                id: "boss-02:rev3-edge-19",
                to: "boss-02:p2-b1"
            },
            {
                from: "boss-02:p2-b1",
                id: "boss-02:rev3-edge-20",
                to: "boss-02:p2-b2"
            },
            {
                from: "boss-02:p2-b2",
                id: "boss-02:rev3-edge-21",
                to: "boss-02:p2-b3"
            },
            {
                from: "boss-02:p2-b3",
                id: "boss-02:rev3-edge-22",
                to: "boss-02:p2-b4"
            },
            {
                from: "boss-02:p2-b4",
                id: "boss-02:rev3-edge-23",
                to: "boss-02:p2-b5"
            },
            {
                from: "boss-02:p2-b5",
                id: "boss-02:rev3-edge-24",
                to: "boss-02:p2-b6"
            },
            {
                from: "boss-02:p2-b6",
                id: "boss-02:rev3-edge-25",
                to: "boss-02:p2-b7"
            },
            {
                from: "boss-02:p2-b7",
                id: "boss-02:rev3-edge-26",
                to: "boss-02:p2-b8"
            },
            {
                from: "boss-02:p2-b8",
                id: "boss-02:rev3-edge-27",
                to: "boss-02:p2-b9"
            },
            {
                from: "boss-02:p2-b9",
                id: "boss-02:rev3-edge-28",
                to: "boss-02:p2-b10"
            },
            {
                from: "boss-02:p2-b3",
                id: "boss-02:rev3-edge-29",
                to: "boss-02:p2-c1"
            },
            {
                from: "boss-02:p2-c1",
                id: "boss-02:rev3-edge-30",
                to: "boss-02:p2-c2"
            },
            {
                from: "boss-02:p2-c2",
                id: "boss-02:rev3-edge-31",
                to: "boss-02:p2-c3"
            },
            {
                from: "boss-02:p2-c3",
                id: "boss-02:rev3-edge-32",
                to: "boss-02:p2-c4"
            },
            {
                from: "boss-02:p2-c4",
                id: "boss-02:rev3-edge-33",
                to: "boss-02:p2-b5"
            },
            {
                from: "boss-02:p2-b10",
                id: "boss-02:rev3-edge-34",
                to: "boss-02:t23-0"
            },
            {
                from: "boss-02:t23-0",
                id: "boss-02:rev3-edge-35",
                to: "boss-02:t23-1"
            },
            {
                from: "boss-02:t23-1",
                id: "boss-02:rev3-edge-36",
                to: "boss-02:t23-2"
            },
            {
                from: "boss-02:t23-2",
                id: "boss-02:rev3-edge-37",
                to: "boss-02:t23-3"
            },
            {
                from: "boss-02:t23-3",
                id: "boss-02:rev3-edge-38",
                to: "boss-02:p3-a0"
            },
            {
                from: "boss-02:p3-a0",
                id: "boss-02:rev3-edge-39",
                to: "boss-02:p3-a1"
            },
            {
                from: "boss-02:p3-a1",
                id: "boss-02:rev3-edge-40",
                to: "boss-02:p3-t-bait"
            },
            {
                from: "boss-02:p3-t-bait",
                id: "boss-02:rev3-edge-41",
                to: "boss-02:p3-t-evade"
            },
            {
                from: "boss-02:p3-t-evade",
                id: "boss-02:rev3-edge-42",
                to: "boss-02:p3-t-counter"
            },
            {
                from: "boss-02:p3-t-counter",
                id: "boss-02:rev3-edge-43",
                to: "boss-02:p3-s-pre"
            },
            {
                from: "boss-02:p3-s-pre",
                id: "boss-02:rev3-edge-44",
                to: "boss-02:p3-s-bait"
            },
            {
                from: "boss-02:p3-s-bait",
                id: "boss-02:rev3-edge-45",
                to: "boss-02:p3-s-evade"
            },
            {
                from: "boss-02:p3-s-evade",
                id: "boss-02:rev3-edge-46",
                to: "boss-02:p3-s-counter"
            },
            {
                from: "boss-02:p3-s-counter",
                id: "boss-02:rev3-edge-47",
                to: "boss-02:p3-v-pre"
            },
            {
                from: "boss-02:p3-v-pre",
                id: "boss-02:rev3-edge-48",
                to: "boss-02:p3-v-bait"
            },
            {
                from: "boss-02:p3-v-bait",
                id: "boss-02:rev3-edge-49",
                to: "boss-02:p3-v-evade"
            },
            {
                from: "boss-02:p3-v-evade",
                id: "boss-02:rev3-edge-50",
                to: "boss-02:p3-v-counter"
            },
            {
                from: "boss-02:p3-v-counter",
                id: "boss-02:rev3-edge-51",
                to: "boss-02:p3-exit"
            }
        ],
        surfaces: [
            {
                bounds: {
                    height: 120,
                    width: 2200,
                    x: 120,
                    y: -260
                },
                grappleable: true,
                id: "boss-02:alley-floor",
                kind: "platform",
                oneWay: false
            },
            {
                bounds: {
                    height: 450,
                    width: 120,
                    x: 120,
                    y: -1600
                },
                grappleable: true,
                id: "boss-02:wall-a-upper",
                kind: "architecture",
                oneWay: false,
                validArchitecture: false
            },
            {
                bounds: {
                    height: 500,
                    width: 120,
                    x: 120,
                    y: -1150
                },
                grappleable: true,
                id: "boss-02:wall-a",
                kind: "architecture",
                oneWay: false,
                validArchitecture: true
            },
            {
                bounds: {
                    height: 390,
                    width: 120,
                    x: 120,
                    y: -650
                },
                grappleable: true,
                id: "boss-02:wall-a-lower",
                kind: "architecture",
                oneWay: false,
                validArchitecture: false
            },
            {
                bounds: {
                    height: 250,
                    width: 120,
                    x: 2200,
                    y: -1600
                },
                grappleable: true,
                id: "boss-02:stairwell-wall-b-upper",
                kind: "architecture",
                oneWay: false,
                validArchitecture: false
            },
            {
                bounds: {
                    height: 500,
                    width: 120,
                    x: 2200,
                    y: -1150
                },
                grappleable: true,
                id: "boss-02:stairwell-wall-b",
                kind: "architecture",
                oneWay: false,
                validArchitecture: true
            },
            {
                bounds: {
                    height: 390,
                    width: 120,
                    x: 2200,
                    y: -650
                },
                grappleable: true,
                id: "boss-02:stairwell-wall-b-lower",
                kind: "architecture",
                oneWay: false,
                validArchitecture: false
            },
            {
                bounds: {
                    height: 55,
                    width: 560,
                    x: 340,
                    y: -880
                },
                grappleable: true,
                id: "boss-02:alley-upper-balcony",
                kind: "platform",
                oneWay: true
            },
            {
                bounds: {
                    height: 55,
                    width: 560,
                    x: 1420,
                    y: -900
                },
                grappleable: true,
                id: "boss-02:fire-escape-a",
                kind: "platform",
                oneWay: true
            },
            {
                bounds: {
                    height: 45,
                    width: 360,
                    x: 1660,
                    y: -1260
                },
                grappleable: true,
                id: "boss-02:fire-escape-b",
                kind: "platform",
                oneWay: true
            },
            {
                bounds: {
                    height: 1980,
                    width: 120,
                    x: 2500,
                    y: -2500
                },
                grappleable: true,
                id: "boss-02:courtyard-left-wall",
                kind: "architecture",
                oneWay: false,
                validArchitecture: false
            },
            {
                bounds: {
                    height: 120,
                    width: 2460,
                    x: 2620,
                    y: -2500
                },
                grappleable: true,
                id: "boss-02:courtyard-back-wall",
                kind: "architecture",
                oneWay: false,
                validArchitecture: false
            },
            {
                bounds: {
                    height: 1000,
                    width: 120,
                    x: 5080,
                    y: -2500
                },
                grappleable: true,
                id: "boss-02:courtyard-right-wall-upper",
                kind: "architecture",
                oneWay: false,
                validArchitecture: false
            },
            {
                bounds: {
                    height: 630,
                    width: 120,
                    x: 5080,
                    y: -1150
                },
                grappleable: true,
                id: "boss-02:courtyard-right-wall-lower",
                kind: "architecture",
                oneWay: false,
                validArchitecture: false
            },
            {
                bounds: {
                    height: 120,
                    width: 2460,
                    x: 2620,
                    y: -520
                },
                grappleable: true,
                id: "boss-02:courtyard-lower-ring",
                kind: "platform",
                oneWay: false
            },
            {
                bounds: {
                    height: 55,
                    width: 620,
                    x: 2720,
                    y: -1510
                },
                grappleable: true,
                id: "boss-02:courtyard-left-ring",
                kind: "platform",
                oneWay: true
            },
            {
                bounds: {
                    height: 55,
                    width: 720,
                    x: 2980,
                    y: -1900
                },
                grappleable: true,
                id: "boss-02:courtyard-upper-left-ring",
                kind: "platform",
                oneWay: true
            },
            {
                bounds: {
                    height: 55,
                    width: 760,
                    x: 3850,
                    y: -1900
                },
                grappleable: true,
                id: "boss-02:courtyard-upper-right-ring",
                kind: "platform",
                oneWay: true
            },
            {
                bounds: {
                    height: 55,
                    width: 620,
                    x: 4380,
                    y: -1510
                },
                grappleable: true,
                id: "boss-02:courtyard-right-ring",
                kind: "platform",
                oneWay: true
            },
            {
                bounds: {
                    height: 50,
                    width: 330,
                    x: 4720,
                    y: -1080
                },
                grappleable: true,
                id: "boss-02:spiral-c",
                kind: "platform",
                oneWay: true
            },
            {
                bounds: {
                    height: 520,
                    width: 320,
                    x: 3500,
                    y: -1660
                },
                grappleable: true,
                id: "boss-02:central-service-slab",
                kind: "architecture",
                oneWay: false,
                validArchitecture: true
            },
            {
                bounds: {
                    height: 100,
                    width: 950,
                    x: 5450,
                    y: -2200
                },
                grappleable: true,
                id: "boss-02:roof-a",
                kind: "platform",
                oneWay: false
            },
            {
                bounds: {
                    height: 320,
                    width: 260,
                    x: 5900,
                    y: -2520
                },
                grappleable: true,
                id: "boss-02:water-tank",
                kind: "architecture",
                oneWay: false,
                validArchitecture: true
            },
            {
                bounds: {
                    height: 100,
                    width: 1100,
                    x: 6350,
                    y: -2700
                },
                grappleable: true,
                id: "boss-02:roof-b",
                kind: "platform",
                oneWay: false
            },
            {
                bounds: {
                    height: 370,
                    width: 300,
                    x: 6650,
                    y: -3070
                },
                grappleable: true,
                id: "boss-02:stairwell-head",
                kind: "architecture",
                oneWay: false,
                validArchitecture: true
            },
            {
                bounds: {
                    height: 100,
                    width: 1000,
                    x: 7350,
                    y: -3000
                },
                grappleable: true,
                id: "boss-02:roof-c",
                kind: "platform",
                oneWay: false
            },
            {
                bounds: {
                    height: 340,
                    width: 320,
                    x: 7550,
                    y: -3340
                },
                grappleable: true,
                id: "boss-02:heavy-vent-housing",
                kind: "architecture",
                oneWay: false,
                validArchitecture: true
            }
        ]
    },
    boss: {
        actorId: "boss-02:residential-security-pursuer",
        collider: {
            height: 220,
            width: 420,
            x: 690,
            y: -630
        },
        mechanicId: "residential-security-pursuit",
        position: {
            x: 1180,
            y: -520
        },
        visualPresetId: "residential-security-pursuer"
    },
    combat: {
        additionalPlayerMultiplier: 0.5,
        architectureImpactBossDamage: 0,
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
            style: "current-phase-progress"
        },
        objectivePlacement: "below-health",
        showVulnerabilityCountdown: true,
        title: "RESIDENTIAL SECURITY PURSUER"
    },
    id: "boss-02",
    mechanics: [
        {
            bounds: {
                height: 1500,
                width: 2200,
                x: 120,
                y: -1600
            },
            id: "boss-02:simple-lock-charge",
            parameters: {
                attackDistance: 2200,
                damage: 20,
                directionLockSeconds: 0.2,
                impactParticlePresetId: "boss-architecture-dust-spark",
                missRecoverySeconds: 0.8,
                telegraphSeconds: 0.8,
                travelSpeed: 440,
                validArchitectureSurfaceIds: ["boss-02:wall-a", "boss-02:stairwell-wall-b"]
            },
            position: {
                x: 1180,
                y: -520
            },
            type: "simple-lock-charge"
        },
        {
            id: "boss-02:reposition-courtyard",
            parameters: {
                attacksEnabled: false,
                contactDamageEnabled: false,
                repositionTarget: {
                    x: 3800,
                    y: -900
                },
                targetZoneId: "boss-02:zone-courtyard"
            },
            position: {
                x: 3800,
                y: -900
            },
            type: "phase-reposition"
        },
        {
            bounds: {
                height: 2100,
                width: 2700,
                x: 2500,
                y: -2500
            },
            id: "boss-02:rotating-ground-slam",
            parameters: {
                attackDistance: 1600,
                damage: 25,
                directionLockSeconds: 0.25,
                impactParticlePresetId: "boss-architecture-dust-spark",
                missRecoverySeconds: 0.7,
                rotationSpeed: 2.5,
                slamSpeed: 520,
                telegraphSeconds: 0.9,
                validArchitectureSurfaceIds: ["boss-02:central-service-slab"]
            },
            position: {
                x: 3800,
                y: -900
            },
            type: "rotating-ground-slam"
        },
        {
            id: "boss-02:reposition-rooftop",
            parameters: {
                attacksEnabled: false,
                contactDamageEnabled: false,
                repositionTarget: {
                    x: 6200,
                    y: -1900
                },
                targetZoneId: "boss-02:zone-rooftop"
            },
            position: {
                x: 6200,
                y: -1900
            },
            type: "phase-reposition"
        },
        {
            bounds: {
                height: 2400,
                width: 3100,
                x: 5350,
                y: -3550
            },
            id: "boss-02:diagonal-dive",
            parameters: {
                attackDistance: 2100,
                confirmSeconds: 0.25,
                damage: 30,
                diveSpeed: 620,
                impactParticlePresetId: "boss-architecture-dust-spark",
                missRecoverySeconds: 0.6,
                riseDistance: 280,
                riseSeconds: 0.35,
                trackSeconds: 0.75,
                validArchitectureSurfaceIds: [
                    "boss-02:water-tank",
                    "boss-02:stairwell-head",
                    "boss-02:heavy-vent-housing"
                ]
            },
            position: {
                x: 6200,
                y: -1900
            },
            type: "diagonal-dive"
        }
    ],
    name: "RESIDENTIAL SECURITY PURSUER",
    nextAreaId: "sector-03-01",
    phases: [
        {
            basePhaseHealth: 1000,
            hud: {
                objective: "돌진을 벽으로 유도한 뒤 후방 추진기를 공격"
            },
            id: "boss-02:phase-1",
            mechanicIds: ["boss-02:simple-lock-charge", "boss-02:reposition-courtyard"],
            name: "LOWER ALLEY PURSUIT",
            order: 1,
            startPosition: {
                x: 1180,
                y: -520
            },
            vulnerability: {
                durationSeconds: 6,
                offset: {
                    x: -280,
                    y: 0
                },
                radius: 50,
                targetId: "boss-02:rear-thruster",
                trigger: "valid-architecture-impact",
                validSurfaceIds: ["boss-02:wall-a", "boss-02:stairwell-wall-b"],
                visualPresetId: "rear-thruster"
            }
        },
        {
            basePhaseHealth: 1000,
            hud: {
                objective: "회전 강타를 중앙 구조물로 유도한 뒤 하부 안정화 장치를 공격"
            },
            id: "boss-02:phase-2",
            mechanicIds: ["boss-02:rotating-ground-slam", "boss-02:reposition-rooftop"],
            name: "CENTRAL COURTYARD",
            order: 2,
            startPosition: {
                x: 3800,
                y: -900
            },
            vulnerability: {
                durationSeconds: 5,
                offset: {
                    x: 0,
                    y: 180
                },
                radius: 50,
                targetId: "boss-02:lower-stabilizer",
                trigger: "valid-architecture-impact",
                validSurfaceIds: ["boss-02:central-service-slab"],
                visualPresetId: "lower-stabilizer"
            }
        },
        {
            basePhaseHealth: 1000,
            hud: {
                objective: "급강하를 옥상 구조물로 유도한 뒤 중앙 센서를 공격"
            },
            id: "boss-02:phase-3",
            mechanicIds: ["boss-02:diagonal-dive"],
            name: "ROOFTOP BLOCKADE",
            order: 3,
            startPosition: {
                x: 6200,
                y: -1900
            },
            vulnerability: {
                durationSeconds: 4,
                offset: {
                    x: 0,
                    y: -180
                },
                radius: 50,
                targetId: "boss-02:central-sensor",
                trigger: "valid-architecture-impact",
                validSurfaceIds: ["boss-02:water-tank", "boss-02:stairwell-head", "boss-02:heavy-vent-housing"],
                visualPresetId: "central-sensor"
            }
        }
    ],
    schemaVersion: "boss-stage-spec-v2",
    sourceAreaId: "sector-02-08",
    specType: "boss-stage",
    subtitle: "WORKER RESIDENTIAL DISTRICT / ROOFTOP BLOCKADE",
    transition: {
        entryTrigger: "checkpoint-complete",
        nextAreaId: "sector-03-01",
        retainPlayerControl: true,
        sourceAreaId: "sector-02-08",
        victoryPresentationId: "boss-02:pursuer-shutdown",
        victoryTrigger: "all-phases-depleted"
    }
});
