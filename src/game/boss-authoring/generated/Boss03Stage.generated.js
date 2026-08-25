import { freezeBossStageValue } from "../BossStageSpec.js";

export const BOSS_03_STAGE_SPEC = freezeBossStageValue({
    arena: {
        anchors: [
            {
                id: "boss-03:anchor:a1",
                role: "swing-attack",
                surfaceId: "boss-03:surface:a1",
                x: 400,
                y: -360
            },
            {
                id: "boss-03:anchor:a2",
                role: "swing-attack",
                surfaceId: "boss-03:surface:a2",
                x: 700,
                y: -470
            },
            {
                id: "boss-03:anchor:a3",
                role: "swing-attack",
                surfaceId: "boss-03:surface:a3",
                x: 1000,
                y: -580
            },
            {
                id: "boss-03:anchor:a4",
                role: "swing-attack",
                surfaceId: "boss-03:surface:a4",
                x: 1300,
                y: -690
            },
            {
                id: "boss-03:anchor:a5",
                role: "swing-attack",
                surfaceId: "boss-03:surface:a5",
                x: 1600,
                y: -760
            },
            {
                id: "boss-03:anchor:a6",
                role: "swing-attack",
                surfaceId: "boss-03:surface:a6",
                x: 1900,
                y: -690
            },
            {
                id: "boss-03:anchor:a7",
                role: "swing-attack",
                surfaceId: "boss-03:surface:a7",
                x: 2200,
                y: -580
            },
            {
                id: "boss-03:anchor:a8",
                role: "swing-attack",
                surfaceId: "boss-03:surface:a8",
                x: 2500,
                y: -470
            },
            {
                id: "boss-03:anchor:a9",
                role: "swing-attack",
                surfaceId: "boss-03:surface:a9",
                x: 2800,
                y: -360
            }
        ],
        baseHookReach: 400,
        bounds: {
            height: 1200,
            width: 3200,
            x: 0,
            y: -1200
        },
        entry: {
            id: "boss-03:entry",
            x: 320,
            y: -160
        },
        exit: {
            id: "boss-03:exit",
            x: 2880,
            y: -160
        },
        phaseZones: [
            {
                bounds: {
                    height: 500,
                    width: 2800,
                    x: 200,
                    y: -620
                },
                id: "boss-03:zone:commander-floor",
                phaseId: "boss-03:combat"
            }
        ],
        recoveryPoints: [],
        routeEdges: [
            {
                from: "boss-03:anchor:a1",
                id: "boss-03:route:01",
                to: "boss-03:anchor:a2"
            },
            {
                from: "boss-03:anchor:a2",
                id: "boss-03:route:02",
                to: "boss-03:anchor:a3"
            },
            {
                from: "boss-03:anchor:a3",
                id: "boss-03:route:03",
                to: "boss-03:anchor:a4"
            },
            {
                from: "boss-03:anchor:a4",
                id: "boss-03:route:04",
                to: "boss-03:anchor:a5"
            },
            {
                from: "boss-03:anchor:a5",
                id: "boss-03:route:05",
                to: "boss-03:anchor:a6"
            },
            {
                from: "boss-03:anchor:a6",
                id: "boss-03:route:06",
                to: "boss-03:anchor:a7"
            },
            {
                from: "boss-03:anchor:a7",
                id: "boss-03:route:07",
                to: "boss-03:anchor:a8"
            },
            {
                from: "boss-03:anchor:a8",
                id: "boss-03:route:08",
                to: "boss-03:anchor:a9"
            }
        ],
        surfaces: [
            {
                bounds: {
                    height: 120,
                    width: 2800,
                    x: 200,
                    y: -120
                },
                grappleable: true,
                id: "boss-03:main-exchange-runway",
                kind: "commander-main-runway"
            },
            {
                bounds: {
                    height: 48,
                    width: 600,
                    x: 520,
                    y: -400
                },
                grappleable: true,
                id: "boss-03:ledge-left",
                kind: "commander-raised-ledge",
                oneWay: true
            },
            {
                bounds: {
                    height: 48,
                    width: 720,
                    x: 1240,
                    y: -520
                },
                grappleable: true,
                id: "boss-03:ledge-center",
                kind: "commander-raised-ledge",
                oneWay: true
            },
            {
                bounds: {
                    height: 48,
                    width: 600,
                    x: 2080,
                    y: -400
                },
                grappleable: true,
                id: "boss-03:ledge-right",
                kind: "commander-raised-ledge",
                oneWay: true
            },
            {
                bounds: {
                    height: 24,
                    width: 24,
                    x: 388,
                    y: -372
                },
                grappleable: true,
                id: "boss-03:surface:a1",
                kind: "grapple-target"
            },
            {
                bounds: {
                    height: 24,
                    width: 24,
                    x: 688,
                    y: -482
                },
                grappleable: true,
                id: "boss-03:surface:a2",
                kind: "grapple-target"
            },
            {
                bounds: {
                    height: 24,
                    width: 24,
                    x: 988,
                    y: -592
                },
                grappleable: true,
                id: "boss-03:surface:a3",
                kind: "grapple-target"
            },
            {
                bounds: {
                    height: 24,
                    width: 24,
                    x: 1288,
                    y: -702
                },
                grappleable: true,
                id: "boss-03:surface:a4",
                kind: "grapple-target"
            },
            {
                bounds: {
                    height: 24,
                    width: 24,
                    x: 1588,
                    y: -772
                },
                grappleable: true,
                id: "boss-03:surface:a5",
                kind: "grapple-target"
            },
            {
                bounds: {
                    height: 24,
                    width: 24,
                    x: 1888,
                    y: -702
                },
                grappleable: true,
                id: "boss-03:surface:a6",
                kind: "grapple-target"
            },
            {
                bounds: {
                    height: 24,
                    width: 24,
                    x: 2188,
                    y: -592
                },
                grappleable: true,
                id: "boss-03:surface:a7",
                kind: "grapple-target"
            },
            {
                bounds: {
                    height: 24,
                    width: 24,
                    x: 2488,
                    y: -482
                },
                grappleable: true,
                id: "boss-03:surface:a8",
                kind: "grapple-target"
            },
            {
                bounds: {
                    height: 24,
                    width: 24,
                    x: 2788,
                    y: -372
                },
                grappleable: true,
                id: "boss-03:surface:a9",
                kind: "grapple-target"
            }
        ]
    },
    boss: {
        actorId: "boss-03:lower-sector-commander:body",
        collider: {
            height: 192,
            width: 128,
            x: 1536,
            y: -312
        },
        impactTargetIds: ["boss-03:lower-sector-commander:body"],
        mechanicId: "lower-sector-commander",
        position: {
            x: 1600,
            y: -216
        },
        visualPresetId: "lower-sector-commander"
    },
    combat: {
        additionalPlayerMultiplier: 0.5,
        closedBodyDamageMultiplier: 1,
        generalDamageMode: "standard-combat",
        lateJoinPolicy: "join-current-attempt-without-rescale",
        participantCountSnapshot: "boss-stage-start",
        participantDefeatPolicy: "individual-respawn",
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
        title: "LOWER SECTOR COMMANDER",
        vulnerabilityLabel: ""
    },
    id: "boss-03",
    mechanics: [
        {
            bounds: {
                height: 500,
                width: 2800,
                x: 200,
                y: -620
            },
            id: "boss-03:commander-combat",
            parameters: {
                acceleration: 600,
                captureCliffMargin: 120,
                captureFrontGap: 50,
                chargeActiveSeconds: 0.6,
                chargeDamage: 20,
                chargeDistance: 420,
                chargeKnockback: 260,
                chargeSpeed: 700,
                chargeTelegraphSeconds: 0.8,
                deceleration: 900,
                grabCooldownSeconds: 15,
                grabDamage: 20,
                grabHammerDamage: 40,
                grabLeadSeconds: 0.25,
                grabRange: 800,
                grabTelegraphSeconds: 1.5,
                grabTimeoutSeconds: 0.5,
                hammerActiveSeconds: 0.2,
                hammerDamage: 25,
                hammerHeight: 240,
                hammerRange: 260,
                hammerTelegraphSeconds: 0.8,
                intensityHealthRatios: [0.7, 0.35],
                jumpDurationSeconds: 0.95,
                jumpGravity: 1500,
                jumpRecoverySeconds: 0.3,
                recoverySeconds: [1, 0.8, 0.6],
                walkSpeeds: [180, 220, 260]
            },
            position: {
                x: 1600,
                y: -216
            },
            type: "lower-sector-commander"
        }
    ],
    name: "LOWER SECTOR COMMANDER",
    nextAreaId: "sector-04-01",
    phases: [
        {
            basePhaseHealth: 750,
            hud: {
                objective: "RETURN PROTOCOL을 돌파하고 상층 Gate를 개방"
            },
            id: "boss-03:combat",
            mechanicIds: ["boss-03:commander-combat"],
            order: 1,
            vulnerability: {
                targetId: "boss-03:lower-sector-commander:body",
                trigger: "always-active",
                visualPresetId: "lower-sector-commander-body"
            }
        }
    ],
    schemaVersion: "boss-stage-spec-v2",
    sourceAreaId: "sector-03-08",
    specType: "boss-stage",
    subtitle: "LOWER-SECTOR TRANSFER / RETURN PROTOCOL",
    transition: {
        entryTrigger: "checkpoint-complete",
        nextAreaId: "sector-04-01",
        retainPlayerControl: true,
        sourceAreaId: "sector-03-08",
        victoryPresentationId: "boss-03:return-protocol-offline",
        victoryTrigger: "all-phases-depleted"
    }
});
