import { freezeBossStageValue } from "../BossStageSpec.js";

export const BOSS_06_STAGE_SPEC = freezeBossStageValue({
    arena: {
        anchors: [
            {
                id: "boss-06:anchor:u1",
                role: "swing-attack",
                surfaceId: "boss-06:surface:u1",
                x: 780,
                y: -1320
            },
            {
                id: "boss-06:anchor:u2",
                role: "swing-attack",
                surfaceId: "boss-06:surface:u2",
                x: 1100,
                y: -1430
            },
            {
                id: "boss-06:anchor:u3",
                role: "swing-attack",
                surfaceId: "boss-06:surface:u3",
                x: 1420,
                y: -1530
            },
            {
                id: "boss-06:anchor:u4",
                role: "swing-attack",
                surfaceId: "boss-06:surface:u4",
                x: 1740,
                y: -1620
            },
            {
                id: "boss-06:anchor:u5",
                role: "swing-attack",
                surfaceId: "boss-06:surface:u5",
                x: 2060,
                y: -1680
            },
            {
                id: "boss-06:anchor:u6",
                role: "swing-attack",
                surfaceId: "boss-06:surface:u6",
                x: 2380,
                y: -1680
            },
            {
                id: "boss-06:anchor:u7",
                role: "swing-attack",
                surfaceId: "boss-06:surface:u7",
                x: 2700,
                y: -1620
            },
            {
                id: "boss-06:anchor:u8",
                role: "swing-attack",
                surfaceId: "boss-06:surface:u8",
                x: 3020,
                y: -1530
            },
            {
                id: "boss-06:anchor:u9",
                role: "swing-attack",
                surfaceId: "boss-06:surface:u9",
                x: 3340,
                y: -1430
            },
            {
                id: "boss-06:anchor:u10",
                role: "swing-attack",
                surfaceId: "boss-06:surface:u10",
                x: 3660,
                y: -1320
            }
        ],
        baseHookReach: 400,
        bounds: {
            height: 2400,
            width: 4720,
            x: 0,
            y: -2400
        },
        entry: {
            id: "boss-06:entry",
            x: 800,
            y: -1055
        },
        exit: {
            id: "boss-06:boarding",
            x: 4460,
            y: -1070
        },
        phaseZones: [
            {
                bounds: {
                    height: 1320,
                    width: 3200,
                    x: 640,
                    y: -1950
                },
                id: "boss-06:zone:security-court",
                phaseId: "boss-06:combat"
            }
        ],
        recoveryPoints: [],
        routeEdges: [
            {
                from: "boss-06:anchor:u1",
                id: "boss-06:route:01",
                to: "boss-06:anchor:u2"
            },
            {
                from: "boss-06:anchor:u2",
                id: "boss-06:route:02",
                to: "boss-06:anchor:u3"
            },
            {
                from: "boss-06:anchor:u3",
                id: "boss-06:route:03",
                to: "boss-06:anchor:u4"
            },
            {
                from: "boss-06:anchor:u4",
                id: "boss-06:route:04",
                to: "boss-06:anchor:u5"
            },
            {
                from: "boss-06:anchor:u5",
                id: "boss-06:route:05",
                to: "boss-06:anchor:u6"
            },
            {
                from: "boss-06:anchor:u6",
                id: "boss-06:route:06",
                to: "boss-06:anchor:u7"
            },
            {
                from: "boss-06:anchor:u7",
                id: "boss-06:route:07",
                to: "boss-06:anchor:u8"
            },
            {
                from: "boss-06:anchor:u8",
                id: "boss-06:route:08",
                to: "boss-06:anchor:u9"
            },
            {
                from: "boss-06:anchor:u9",
                id: "boss-06:route:09",
                to: "boss-06:anchor:u10"
            }
        ],
        surfaces: [
            {
                bounds: {
                    height: 120,
                    width: 3200,
                    x: 640,
                    y: -1040
                },
                grappleable: true,
                id: "boss-06:main-runway",
                kind: "main-security-runway"
            },
            {
                bounds: {
                    height: 48,
                    width: 560,
                    x: 1040,
                    y: -1360
                },
                grappleable: true,
                id: "boss-06:ledge-left",
                kind: "raised-ledge",
                oneWay: true
            },
            {
                bounds: {
                    height: 48,
                    width: 720,
                    x: 1880,
                    y: -1480
                },
                grappleable: true,
                id: "boss-06:ledge-center",
                kind: "raised-ledge",
                oneWay: true
            },
            {
                bounds: {
                    height: 48,
                    width: 560,
                    x: 3000,
                    y: -1360
                },
                grappleable: true,
                id: "boss-06:ledge-right",
                kind: "raised-ledge",
                oneWay: true
            },
            {
                bounds: {
                    height: 135,
                    width: 600,
                    x: 4060,
                    y: -1055
                },
                grappleable: true,
                id: "boss-06:departure-deck",
                kind: "departure-deck"
            },
            {
                bounds: {
                    height: 24,
                    width: 24,
                    x: 768,
                    y: -1332
                },
                grappleable: true,
                id: "boss-06:surface:u1",
                kind: "grapple-target"
            },
            {
                bounds: {
                    height: 24,
                    width: 24,
                    x: 1088,
                    y: -1442
                },
                grappleable: true,
                id: "boss-06:surface:u2",
                kind: "grapple-target"
            },
            {
                bounds: {
                    height: 24,
                    width: 24,
                    x: 1408,
                    y: -1542
                },
                grappleable: true,
                id: "boss-06:surface:u3",
                kind: "grapple-target"
            },
            {
                bounds: {
                    height: 24,
                    width: 24,
                    x: 1728,
                    y: -1632
                },
                grappleable: true,
                id: "boss-06:surface:u4",
                kind: "grapple-target"
            },
            {
                bounds: {
                    height: 24,
                    width: 24,
                    x: 2048,
                    y: -1692
                },
                grappleable: true,
                id: "boss-06:surface:u5",
                kind: "grapple-target"
            },
            {
                bounds: {
                    height: 24,
                    width: 24,
                    x: 2368,
                    y: -1692
                },
                grappleable: true,
                id: "boss-06:surface:u6",
                kind: "grapple-target"
            },
            {
                bounds: {
                    height: 24,
                    width: 24,
                    x: 2688,
                    y: -1632
                },
                grappleable: true,
                id: "boss-06:surface:u7",
                kind: "grapple-target"
            },
            {
                bounds: {
                    height: 24,
                    width: 24,
                    x: 3008,
                    y: -1542
                },
                grappleable: true,
                id: "boss-06:surface:u8",
                kind: "grapple-target"
            },
            {
                bounds: {
                    height: 24,
                    width: 24,
                    x: 3328,
                    y: -1442
                },
                grappleable: true,
                id: "boss-06:surface:u9",
                kind: "grapple-target"
            },
            {
                bounds: {
                    height: 24,
                    width: 24,
                    x: 3648,
                    y: -1332
                },
                grappleable: true,
                id: "boss-06:surface:u10",
                kind: "grapple-target"
            }
        ]
    },
    boss: {
        actorId: "boss-06:continuity-warden:body",
        collider: {
            height: 150,
            width: 120,
            x: 3300,
            y: -1190
        },
        impactTargetIds: ["boss-06:continuity-warden:body"],
        mechanicId: "continuity-warden",
        position: {
            x: 3360,
            y: -1115
        },
        visualPresetId: "continuity-warden"
    },
    combat: {
        additionalPlayerMultiplier: 0.5,
        closedBodyDamageMultiplier: 1,
        generalDamageMode: "standard-combat",
        lateJoinPolicy: "join-current-attempt-without-rescale",
        participantCountSnapshot: "boss-stage-start",
        participantDefeatPolicy: "shared-wipe",
        phaseOverflowPolicy: "discard-at-floor",
        weakFixedPercent: 0,
        weakNormalDamageMultiplier: 1
    },
    hud: {
        healthBar: {
            phaseMarkerCount: 0,
            showNumbers: true,
            showPhaseBreaks: false,
            style: "segmented-total"
        },
        objectivePlacement: "below-health",
        phaseLabel: "",
        showVulnerabilityCountdown: false,
        title: "CONTINUITY WARDEN",
        vulnerabilityLabel: ""
    },
    id: "boss-06",
    mechanics: [
        {
            bounds: {
                height: 980,
                width: 3200,
                x: 640,
                y: -1900
            },
            id: "boss-06:warden-combat",
            parameters: {
                beamGapSeconds: 0.3,
                beamSeconds: 0.8,
                boardingBounds: {
                    height: 280,
                    width: 430,
                    x: 4230,
                    y: -1200
                },
                bridgeBounds: {
                    height: 135,
                    width: 220,
                    x: 3840,
                    y: -1055
                },
                chargeRecoverySeconds: 1.8,
                chargeSpeed: 900,
                chargeTelegraphSeconds: 0.9,
                counterSeconds: 1.2,
                damage: 25,
                emitterLeft: {
                    x: 688,
                    y: -1088
                },
                emitterRight: {
                    x: 3792,
                    y: -1088
                },
                gateBounds: {
                    height: 705,
                    width: 220,
                    x: 4060,
                    y: -1760
                },
                guardEdgeInset: 240,
                guardSeconds: 1.5,
                highBeamBounds: {
                    height: 360,
                    width: 3240,
                    x: 620,
                    y: -1540
                },
                jumpDurationSeconds: 0.95,
                jumpGravity: 1500,
                jumpTelegraphSeconds: 0.4,
                landingActiveSeconds: 0.3,
                landingBurstRadius: 150,
                landingRecoverySeconds: 0.45,
                lowBeamBounds: {
                    height: 140,
                    width: 3240,
                    x: 620,
                    y: -1160
                },
                meleeActiveSeconds: 0.35,
                meleeRecoverySeconds: 0.9,
                meleeTelegraphSeconds: 0.6,
                minionSummonCooldownSeconds: 15,
                minionSummonCount: 2,
                minionSummonRecoverySeconds: 0.9,
                minionSummonSkipAliveCount: 6,
                minionSummonTelegraphSeconds: 1,
                minionSummonWarningSize: 110,
                missileDamage: 20,
                missileFanAnglesDegrees: [-50, -25, 0, 25, 50],
                missileLifetimeSeconds: 5,
                missileRadius: 26,
                missileSpeed: 480,
                missileTurnRateRadiansPerSecond: 1.75,
                securityRecoverySeconds: 0.8,
                securityTelegraphSeconds: 1,
                shuttlePosition: {
                    x: 4630,
                    y: -1055
                },
                summonLeft: {
                    x: 1280,
                    y: -1240
                },
                summonRight: {
                    x: 3200,
                    y: -1240
                },
                trackingStopDistance: 220,
                victoryCameraSeconds: 2,
                walkSpeed: 240
            },
            position: {
                x: 3360,
                y: -1115
            },
            type: "continuity-warden"
        }
    ],
    name: "CONTINUITY WARDEN",
    nextAreaId: null,
    phases: [
        {
            basePhaseHealth: 1000,
            hud: {
                objective: "점프 미사일의 부채꼴을 읽고 Rope로 Warden의 통제를 돌파"
            },
            id: "boss-06:combat",
            mechanicIds: ["boss-06:warden-combat"],
            order: 1,
            vulnerability: {
                targetId: "boss-06:continuity-warden:body",
                trigger: "always-active",
                visualPresetId: "continuity-warden-body"
            }
        }
    ],
    schemaVersion: "boss-stage-spec-v2",
    sourceAreaId: "sector-06-08",
    specType: "boss-stage",
    subtitle: "PAD 03 FINAL SECURITY",
    transition: {
        entryTrigger: "checkpoint-complete",
        nextAreaId: null,
        retainPlayerControl: true,
        sourceAreaId: "sector-06-08",
        terminalCompletion: "all-active-boarding",
        victoryPresentationId: "boss-06:continuity-warden-defeated",
        victoryTrigger: "all-phases-depleted"
    }
});
