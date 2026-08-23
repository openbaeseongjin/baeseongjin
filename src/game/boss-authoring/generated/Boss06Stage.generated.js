import { freezeBossStageValue } from "../BossStageSpec.js";

export const BOSS_06_STAGE_SPEC = freezeBossStageValue({
    arena: {
        anchors: [
            {
                id: "boss-06:anchor:u1",
                role: "swing-attack",
                surfaceId: "boss-06:surface:u1",
                x: 1300,
                y: -1460
            },
            {
                id: "boss-06:anchor:u2",
                role: "swing-attack",
                surfaceId: "boss-06:surface:u2",
                x: 1660,
                y: -1490
            },
            {
                id: "boss-06:anchor:u3",
                role: "swing-attack",
                surfaceId: "boss-06:surface:u3",
                x: 2020,
                y: -1510
            },
            {
                id: "boss-06:anchor:u4",
                role: "swing-attack",
                surfaceId: "boss-06:surface:u4",
                x: 2380,
                y: -1490
            },
            {
                id: "boss-06:anchor:u5",
                role: "swing-attack",
                surfaceId: "boss-06:surface:u5",
                x: 2740,
                y: -1460
            },
            {
                id: "boss-06:anchor:u6",
                role: "swing-attack",
                surfaceId: "boss-06:surface:u6",
                x: 3100,
                y: -1490
            },
            {
                id: "boss-06:anchor:u7",
                role: "swing-attack",
                surfaceId: "boss-06:surface:u7",
                x: 3460,
                y: -1510
            },
            {
                id: "boss-06:anchor:u8",
                role: "swing-attack",
                surfaceId: "boss-06:surface:u8",
                x: 3820,
                y: -1460
            },
            {
                id: "boss-06:anchor:rr1",
                role: "swing-attack",
                surfaceId: "boss-06:surface:rr1",
                x: 770,
                y: -1000
            },
            {
                id: "boss-06:anchor:rr3",
                role: "swing-attack",
                surfaceId: "boss-06:surface:rr3",
                x: 4240,
                y: -1000
            }
        ],
        baseHookReach: 400,
        bounds: {
            height: 3000,
            width: 5400,
            x: 0,
            y: -3000
        },
        entry: {
            id: "boss-06:entry",
            x: 1120,
            y: -1115
        },
        exit: {
            id: "boss-06:boarding",
            x: 5150,
            y: -1147
        },
        phaseZones: [
            {
                bounds: {
                    height: 1118,
                    width: 3820,
                    x: 540,
                    y: -1750
                },
                id: "boss-06:zone:security-court",
                phaseId: "boss-06:combat"
            }
        ],
        recoveryPoints: [
            {
                id: "boss-06:recovery-point:left",
                x: 770,
                y: -722
            },
            {
                id: "boss-06:recovery-point:right",
                x: 4240,
                y: -722
            }
        ],
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
            }
        ],
        surfaces: [
            {
                bounds: {
                    height: 115,
                    width: 3120,
                    x: 1000,
                    y: -1100
                },
                grappleable: false,
                id: "boss-06:main-runway",
                kind: "main-security-runway"
            },
            {
                bounds: {
                    height: 46,
                    width: 280,
                    x: 1790,
                    y: -1380
                },
                grappleable: false,
                id: "boss-06:ledge-left",
                kind: "raised-ledge"
            },
            {
                bounds: {
                    height: 46,
                    width: 280,
                    x: 3100,
                    y: -1380
                },
                grappleable: false,
                id: "boss-06:ledge-right",
                kind: "raised-ledge"
            },
            {
                bounds: {
                    height: 58,
                    width: 460,
                    x: 540,
                    y: -690
                },
                grappleable: false,
                id: "boss-06:recovery-left",
                kind: "recovery-deck"
            },
            {
                bounds: {
                    height: 58,
                    width: 240,
                    x: 4120,
                    y: -690
                },
                grappleable: false,
                id: "boss-06:recovery-right",
                kind: "recovery-deck"
            },
            {
                bounds: {
                    height: 130,
                    width: 990,
                    x: 4360,
                    y: -1115
                },
                grappleable: false,
                id: "boss-06:departure-deck",
                kind: "departure-deck"
            },
            {
                bounds: {
                    height: 24,
                    width: 24,
                    x: 1288,
                    y: -1472
                },
                grappleable: true,
                id: "boss-06:surface:u1",
                kind: "grapple-target"
            },
            {
                bounds: {
                    height: 24,
                    width: 24,
                    x: 1648,
                    y: -1502
                },
                grappleable: true,
                id: "boss-06:surface:u2",
                kind: "grapple-target"
            },
            {
                bounds: {
                    height: 24,
                    width: 24,
                    x: 2008,
                    y: -1522
                },
                grappleable: true,
                id: "boss-06:surface:u3",
                kind: "grapple-target"
            },
            {
                bounds: {
                    height: 24,
                    width: 24,
                    x: 2368,
                    y: -1502
                },
                grappleable: true,
                id: "boss-06:surface:u4",
                kind: "grapple-target"
            },
            {
                bounds: {
                    height: 24,
                    width: 24,
                    x: 2728,
                    y: -1472
                },
                grappleable: true,
                id: "boss-06:surface:u5",
                kind: "grapple-target"
            },
            {
                bounds: {
                    height: 24,
                    width: 24,
                    x: 3088,
                    y: -1502
                },
                grappleable: true,
                id: "boss-06:surface:u6",
                kind: "grapple-target"
            },
            {
                bounds: {
                    height: 24,
                    width: 24,
                    x: 3448,
                    y: -1522
                },
                grappleable: true,
                id: "boss-06:surface:u7",
                kind: "grapple-target"
            },
            {
                bounds: {
                    height: 24,
                    width: 24,
                    x: 3808,
                    y: -1472
                },
                grappleable: true,
                id: "boss-06:surface:u8",
                kind: "grapple-target"
            },
            {
                bounds: {
                    height: 24,
                    width: 24,
                    x: 758,
                    y: -1012
                },
                grappleable: true,
                id: "boss-06:surface:rr1",
                kind: "grapple-target"
            },
            {
                bounds: {
                    height: 24,
                    width: 24,
                    x: 4228,
                    y: -1012
                },
                grappleable: true,
                id: "boss-06:surface:rr3",
                kind: "grapple-target"
            }
        ]
    },
    boss: {
        actorId: "boss-06:continuity-warden:body",
        collider: {
            height: 150,
            width: 96,
            x: 3492,
            y: -1250
        },
        impactTargetIds: ["boss-06:continuity-warden:body"],
        mechanicId: "continuity-warden",
        position: {
            x: 3540,
            y: -1175
        },
        visualPresetId: "continuity-warden"
    },
    combat: {
        additionalPlayerMultiplier: 0.5,
        closedBodyDamageMultiplier: 1,
        generalDamageMode: "standard-combat",
        lateJoinPolicy: "join-current-attempt-without-rescale",
        participantCountSnapshot: "boss-stage-start",
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
                height: 765,
                width: 3840,
                x: 1000,
                y: -1750
            },
            id: "boss-06:warden-combat",
            parameters: {
                beamGapSeconds: 0.3,
                beamSeconds: 0.8,
                boardingBounds: {
                    height: 235,
                    width: 360,
                    x: 4920,
                    y: -1220
                },
                bridgeBounds: {
                    height: 130,
                    width: 240,
                    x: 4120,
                    y: -1115
                },
                chargeRecoverySeconds: 1.8,
                chargeSpeed: 900,
                chargeTelegraphSeconds: 0.9,
                combatMaxX: 4072,
                combatMinX: 1048,
                counterSeconds: 1.2,
                damage: 25,
                gateBounds: {
                    height: 760,
                    width: 480,
                    x: 4360,
                    y: -1750
                },
                groundCenterY: -1175,
                guardMaxX: 3870,
                guardMinX: 1250,
                guardSeconds: 1.5,
                highBeamBounds: {
                    height: 270,
                    width: 3160,
                    x: 980,
                    y: -1485
                },
                ledgeLeft: {
                    x: 1930,
                    y: -1455
                },
                ledgeRight: {
                    x: 3240,
                    y: -1455
                },
                lowBeamBounds: {
                    height: 130,
                    width: 3160,
                    x: 980,
                    y: -1200
                },
                mainBounds: {
                    height: 115,
                    width: 3120,
                    x: 1000,
                    y: -1100
                },
                meleeActiveSeconds: 0.35,
                meleeRecoverySeconds: 0.9,
                meleeTelegraphSeconds: 0.6,
                securityRecoverySeconds: 0.8,
                securityTelegraphSeconds: 1,
                shuttlePosition: {
                    x: 5150,
                    y: -1345
                },
                victoryCameraSeconds: 2
            },
            position: {
                x: 3540,
                y: -1175
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
                objective: "Rope로 정면 통제를 우회해 Warden을 제압"
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
