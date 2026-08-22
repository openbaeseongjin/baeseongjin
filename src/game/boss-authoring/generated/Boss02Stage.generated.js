import { freezeBossStageValue } from "../BossStageSpec.js";

export const BOSS_02_STAGE_SPEC = freezeBossStageValue({
    schemaVersion: "boss-stage-spec-v2",
    specType: "boss-stage",
    id: "boss-02",
    name: "RESIDENTIAL SECURITY PURSUER",
    subtitle: "WORKER RESIDENTIAL DISTRICT / ROOFTOP BLOCKADE",
    sourceAreaId: "sector-02-08",
    nextAreaId: "sector-03-01",
    arena: {
        bounds: {
            x: 0,
            y: -2800,
            width: 5600,
            height: 2800
        },
        baseHookReach: 400,
        entry: {
            id: "boss-02:entry",
            x: 240,
            y: -360
        },
        exit: {
            id: "boss-02:exit",
            x: 5400,
            y: -2460
        },
        phaseZones: [
            {
                id: "boss-02:zone-alley",
                phaseId: "boss-02:phase-1",
                bounds: {
                    x: 120,
                    y: -1220,
                    width: 1600,
                    height: 1080
                }
            },
            {
                id: "boss-02:zone-courtyard",
                phaseId: "boss-02:phase-2",
                bounds: {
                    x: 1740,
                    y: -1940,
                    width: 1900,
                    height: 1460
                }
            },
            {
                id: "boss-02:zone-rooftop",
                phaseId: "boss-02:phase-3",
                bounds: {
                    x: 3820,
                    y: -2700,
                    width: 1660,
                    height: 1160
                }
            }
        ],
        surfaces: [
            {
                id: "boss-02:alley-floor",
                kind: "platform",
                bounds: {
                    x: 100,
                    y: -300,
                    width: 1620,
                    height: 120
                },
                oneWay: false,
                grappleable: true
            },
            {
                id: "boss-02:alley-upper-balcony",
                kind: "platform",
                bounds: {
                    x: 460,
                    y: -820,
                    width: 980,
                    height: 70
                },
                oneWay: true,
                grappleable: true
            },
            {
                id: "boss-02:wall-a",
                kind: "architecture",
                bounds: {
                    x: 140,
                    y: -1120,
                    width: 120,
                    height: 820
                },
                oneWay: false,
                grappleable: true,
                validArchitecture: true
            },
            {
                id: "boss-02:stairwell-wall-b",
                kind: "architecture",
                bounds: {
                    x: 1540,
                    y: -1220,
                    width: 140,
                    height: 920
                },
                oneWay: false,
                grappleable: true,
                validArchitecture: true
            },
            {
                id: "boss-02:fire-escape-a",
                kind: "platform",
                bounds: {
                    x: 1540,
                    y: -1180,
                    width: 260,
                    height: 55
                },
                oneWay: true,
                grappleable: true
            },
            {
                id: "boss-02:fire-escape-b",
                kind: "platform",
                bounds: {
                    x: 1710,
                    y: -1460,
                    width: 260,
                    height: 55
                },
                oneWay: true,
                grappleable: true
            },
            {
                id: "boss-02:courtyard-left-ring",
                kind: "platform",
                bounds: {
                    x: 1800,
                    y: -1720,
                    width: 500,
                    height: 70
                },
                oneWay: true,
                grappleable: true
            },
            {
                id: "boss-02:courtyard-lower-ring",
                kind: "platform",
                bounds: {
                    x: 2140,
                    y: -660,
                    width: 1120,
                    height: 80
                },
                oneWay: false,
                grappleable: true
            },
            {
                id: "boss-02:courtyard-right-ring",
                kind: "platform",
                bounds: {
                    x: 3200,
                    y: -1720,
                    width: 420,
                    height: 70
                },
                oneWay: true,
                grappleable: true
            },
            {
                id: "boss-02:central-service-slab",
                kind: "architecture",
                bounds: {
                    x: 2530,
                    y: -1390,
                    width: 360,
                    height: 160
                },
                oneWay: false,
                grappleable: true,
                validArchitecture: true
            },
            {
                id: "boss-02:spiral-c",
                kind: "platform",
                bounds: {
                    x: 3500,
                    y: -1900,
                    width: 340,
                    height: 60
                },
                oneWay: true,
                grappleable: true
            },
            {
                id: "boss-02:roof-a",
                kind: "platform",
                bounds: {
                    x: 3820,
                    y: -2020,
                    width: 620,
                    height: 90
                },
                oneWay: false,
                grappleable: true
            },
            {
                id: "boss-02:roof-b",
                kind: "platform",
                bounds: {
                    x: 4440,
                    y: -2190,
                    width: 500,
                    height: 90
                },
                oneWay: false,
                grappleable: true
            },
            {
                id: "boss-02:roof-c",
                kind: "platform",
                bounds: {
                    x: 4930,
                    y: -2370,
                    width: 550,
                    height: 90
                },
                oneWay: false,
                grappleable: true
            },
            {
                id: "boss-02:water-tank",
                kind: "architecture",
                bounds: {
                    x: 4040,
                    y: -2390,
                    width: 260,
                    height: 370
                },
                oneWay: false,
                grappleable: true,
                validArchitecture: true
            },
            {
                id: "boss-02:stairwell-head",
                kind: "architecture",
                bounds: {
                    x: 4540,
                    y: -2560,
                    width: 280,
                    height: 370
                },
                oneWay: false,
                grappleable: true,
                validArchitecture: true
            },
            {
                id: "boss-02:heavy-vent-housing",
                kind: "architecture",
                bounds: {
                    x: 5050,
                    y: -2650,
                    width: 300,
                    height: 280
                },
                oneWay: false,
                grappleable: true,
                validArchitecture: true
            }
        ],
        anchors: [
            {
                id: "boss-02:route-01",
                x: 300,
                y: -450
            },
            {
                id: "boss-02:route-02",
                x: 600,
                y: -500
            },
            {
                id: "boss-02:route-03",
                x: 900,
                y: -650
            },
            {
                id: "boss-02:route-04",
                x: 1200,
                y: -800
            },
            {
                id: "boss-02:route-05",
                x: 1500,
                y: -950
            },
            {
                id: "boss-02:route-06",
                x: 1650,
                y: -1250
            },
            {
                id: "boss-02:route-07",
                x: 1800,
                y: -1530
            },
            {
                id: "boss-02:route-08",
                x: 2050,
                y: -1600
            },
            {
                id: "boss-02:route-09",
                x: 2350,
                y: -1500
            },
            {
                id: "boss-02:route-10",
                x: 2650,
                y: -1350
            },
            {
                id: "boss-02:route-11",
                x: 2950,
                y: -1500
            },
            {
                id: "boss-02:route-12",
                x: 3250,
                y: -1650
            },
            {
                id: "boss-02:route-13",
                x: 3500,
                y: -1450
            },
            {
                id: "boss-02:route-14",
                x: 3700,
                y: -1750
            },
            {
                id: "boss-02:route-15",
                x: 3900,
                y: -2050
            },
            {
                id: "boss-02:route-16",
                x: 4200,
                y: -2150
            },
            {
                id: "boss-02:route-17",
                x: 4500,
                y: -2300
            },
            {
                id: "boss-02:route-18",
                x: 4800,
                y: -2150
            },
            {
                id: "boss-02:route-19",
                x: 5100,
                y: -2300
            },
            {
                id: "boss-02:route-20",
                x: 5350,
                y: -2450
            }
        ],
        routeEdges: [
            {
                id: "boss-02:edge-01",
                from: "boss-02:route-01",
                to: "boss-02:route-02"
            },
            {
                id: "boss-02:edge-02",
                from: "boss-02:route-02",
                to: "boss-02:route-03"
            },
            {
                id: "boss-02:edge-03",
                from: "boss-02:route-03",
                to: "boss-02:route-04"
            },
            {
                id: "boss-02:edge-04",
                from: "boss-02:route-04",
                to: "boss-02:route-05"
            },
            {
                id: "boss-02:edge-05",
                from: "boss-02:route-05",
                to: "boss-02:route-06"
            },
            {
                id: "boss-02:edge-06",
                from: "boss-02:route-06",
                to: "boss-02:route-07"
            },
            {
                id: "boss-02:edge-07",
                from: "boss-02:route-07",
                to: "boss-02:route-08"
            },
            {
                id: "boss-02:edge-08",
                from: "boss-02:route-08",
                to: "boss-02:route-09"
            },
            {
                id: "boss-02:edge-09",
                from: "boss-02:route-09",
                to: "boss-02:route-10"
            },
            {
                id: "boss-02:edge-10",
                from: "boss-02:route-10",
                to: "boss-02:route-11"
            },
            {
                id: "boss-02:edge-11",
                from: "boss-02:route-11",
                to: "boss-02:route-12"
            },
            {
                id: "boss-02:edge-12",
                from: "boss-02:route-12",
                to: "boss-02:route-13"
            },
            {
                id: "boss-02:edge-13",
                from: "boss-02:route-13",
                to: "boss-02:route-14"
            },
            {
                id: "boss-02:edge-14",
                from: "boss-02:route-14",
                to: "boss-02:route-15"
            },
            {
                id: "boss-02:edge-15",
                from: "boss-02:route-15",
                to: "boss-02:route-16"
            },
            {
                id: "boss-02:edge-16",
                from: "boss-02:route-16",
                to: "boss-02:route-17"
            },
            {
                id: "boss-02:edge-17",
                from: "boss-02:route-17",
                to: "boss-02:route-18"
            },
            {
                id: "boss-02:edge-18",
                from: "boss-02:route-18",
                to: "boss-02:route-19"
            },
            {
                id: "boss-02:edge-19",
                from: "boss-02:route-19",
                to: "boss-02:route-20"
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
                x: 1420,
                y: -390
            },
            {
                id: "boss-02:recovery-courtyard-a",
                x: 2050,
                y: -760
            },
            {
                id: "boss-02:recovery-courtyard-b",
                x: 3350,
                y: -760
            },
            {
                id: "boss-02:recovery-rooftop-a",
                x: 4000,
                y: -2100
            },
            {
                id: "boss-02:recovery-rooftop-b",
                x: 5260,
                y: -2450
            }
        ]
    },
    boss: {
        actorId: "boss-02:residential-security-pursuer",
        mechanicId: "residential-security-pursuit",
        visualPresetId: "residential-security-pursuer",
        position: {
            x: 900,
            y: -520
        },
        collider: {
            x: 690,
            y: -630,
            width: 420,
            height: 220
        }
    },
    combat: {
        additionalPlayerMultiplier: 0.5,
        closedBodyDamageMultiplier: 0.25,
        weakNormalDamageMultiplier: 1,
        weakFixedPercent: 0.25,
        architectureImpactBossDamage: 0,
        generalDamageMode: "standard-combat",
        participantCountSnapshot: "boss-stage-start",
        lateJoinPolicy: "join-current-attempt-without-rescale",
        phaseOverflowPolicy: "discard-at-floor"
    },
    mechanics: [
        {
            id: "boss-02:simple-lock-charge",
            type: "simple-lock-charge",
            position: {
                x: 900,
                y: -520
            },
            bounds: {
                x: 160,
                y: -1120,
                width: 1500,
                height: 900
            },
            parameters: {
                telegraphSeconds: 0.8,
                directionLockSeconds: 0.2,
                travelSpeed: 440,
                attackDistance: 2200,
                damage: 20,
                missRecoverySeconds: 0.8,
                validArchitectureSurfaceIds: ["boss-02:wall-a", "boss-02:stairwell-wall-b"],
                impactParticlePresetId: "boss-architecture-dust-spark"
            }
        },
        {
            id: "boss-02:reposition-courtyard",
            type: "phase-reposition",
            position: {
                x: 2050,
                y: -1150
            },
            parameters: {
                targetZoneId: "boss-02:zone-courtyard",
                attacksEnabled: false,
                contactDamageEnabled: false
            }
        },
        {
            id: "boss-02:rotating-ground-slam",
            type: "rotating-ground-slam",
            position: {
                x: 2710,
                y: -1060
            },
            bounds: {
                x: 1820,
                y: -1780,
                width: 1740,
                height: 1160
            },
            parameters: {
                telegraphSeconds: 0.9,
                directionLockSeconds: 0.25,
                rotationSpeed: 2.5,
                slamSpeed: 520,
                attackDistance: 1600,
                damage: 25,
                missRecoverySeconds: 0.7,
                validArchitectureSurfaceIds: ["boss-02:central-service-slab"],
                impactParticlePresetId: "boss-architecture-dust-spark"
            }
        },
        {
            id: "boss-02:reposition-rooftop",
            type: "phase-reposition",
            position: {
                x: 4200,
                y: -2100
            },
            parameters: {
                targetZoneId: "boss-02:zone-rooftop",
                attacksEnabled: false,
                contactDamageEnabled: false
            }
        },
        {
            id: "boss-02:diagonal-dive",
            type: "diagonal-dive",
            position: {
                x: 4680,
                y: -2280
            },
            bounds: {
                x: 3850,
                y: -2680,
                width: 1600,
                height: 1050
            },
            parameters: {
                riseSeconds: 0.35,
                riseDistance: 280,
                trackSeconds: 0.75,
                confirmSeconds: 0.25,
                diveSpeed: 620,
                attackDistance: 2100,
                damage: 30,
                missRecoverySeconds: 0.6,
                validArchitectureSurfaceIds: [
                    "boss-02:water-tank",
                    "boss-02:stairwell-head",
                    "boss-02:heavy-vent-housing"
                ],
                impactParticlePresetId: "boss-architecture-dust-spark"
            }
        }
    ],
    phases: [
        {
            id: "boss-02:phase-1",
            name: "LOWER ALLEY PURSUIT",
            order: 1,
            basePhaseHealth: 1000,
            startPosition: {
                x: 900,
                y: -520
            },
            mechanicIds: ["boss-02:simple-lock-charge", "boss-02:reposition-courtyard"],
            vulnerability: {
                targetId: "boss-02:rear-thruster",
                trigger: "valid-architecture-impact",
                durationSeconds: 6,
                offset: {
                    x: -150,
                    y: 0
                },
                radius: 45,
                visualPresetId: "rear-thruster"
            },
            hud: {
                objective: "돌진을 벽으로 유도한 뒤 후방 추진기를 공격"
            }
        },
        {
            id: "boss-02:phase-2",
            name: "CENTRAL COURTYARD",
            order: 2,
            basePhaseHealth: 1000,
            startPosition: {
                x: 2710,
                y: -1060
            },
            mechanicIds: ["boss-02:rotating-ground-slam", "boss-02:reposition-rooftop"],
            vulnerability: {
                targetId: "boss-02:lower-stabilizer",
                trigger: "valid-architecture-impact",
                durationSeconds: 5,
                offset: {
                    x: 0,
                    y: 150
                },
                radius: 45,
                visualPresetId: "lower-stabilizer"
            },
            hud: {
                objective: "회전 강타를 중앙 구조물로 유도한 뒤 하부 안정화 장치를 공격"
            }
        },
        {
            id: "boss-02:phase-3",
            name: "ROOFTOP BLOCKADE",
            order: 3,
            basePhaseHealth: 1000,
            startPosition: {
                x: 4680,
                y: -2280
            },
            mechanicIds: ["boss-02:diagonal-dive"],
            vulnerability: {
                targetId: "boss-02:central-sensor",
                trigger: "valid-architecture-impact",
                durationSeconds: 4,
                offset: {
                    x: 0,
                    y: -40
                },
                radius: 45,
                visualPresetId: "central-sensor"
            },
            hud: {
                objective: "급강하를 옥상 구조물로 유도한 뒤 중앙 센서를 공격"
            }
        }
    ],
    hud: {
        title: "RESIDENTIAL SECURITY PURSUER",
        healthBar: {
            style: "current-phase-progress",
            showNumbers: true,
            showPhaseBreaks: true,
            phaseMarkerCount: 3
        },
        objectivePlacement: "below-health",
        showVulnerabilityCountdown: true
    },
    transition: {
        sourceAreaId: "sector-02-08",
        nextAreaId: "sector-03-01",
        entryTrigger: "checkpoint-complete",
        victoryTrigger: "all-phases-depleted",
        victoryPresentationId: "boss-02:pursuer-shutdown",
        retainPlayerControl: true
    }
});
