import { freezeBossStageValue } from "../BossStageSpec.js";

export const BOSS_03_STAGE_SPEC = freezeBossStageValue({
    arena: {
        anchors: [],
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
        routeEdges: [],
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
                    height: 680,
                    width: 240,
                    x: 680,
                    y: -1200
                },
                grappleable: true,
                id: "boss-03:crossbeam-left",
                kind: "commander-crossbeam"
            },
            {
                bounds: {
                    height: 680,
                    width: 240,
                    x: 1480,
                    y: -1200
                },
                grappleable: true,
                id: "boss-03:crossbeam-center",
                kind: "commander-crossbeam"
            },
            {
                bounds: {
                    height: 680,
                    width: 240,
                    x: 2280,
                    y: -1200
                },
                grappleable: true,
                id: "boss-03:crossbeam-right",
                kind: "commander-crossbeam"
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
                grabHoldSeconds: 2,
                grabLeadSeconds: 0.25,
                grabPullSeconds: 0.35,
                grabRange: 450,
                grabTelegraphSeconds: 1.5,
                grabTimeoutSeconds: 0.5,
                hammerActiveSeconds: 0.2,
                hammerDamage: 25,
                hammerHeight: 240,
                hammerRange: 260,
                hammerTelegraphSeconds: 0.8,
                intensityHealthRatios: [0.7, 0.35],
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
