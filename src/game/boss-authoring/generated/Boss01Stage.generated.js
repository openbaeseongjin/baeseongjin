import { freezeBossStageValue } from "../BossStageSpec.js";

export const BOSS_01_STAGE_SPEC = freezeBossStageValue({
    arena: {
        anchors: [
            {
                id: "boss-01:strike-anchor-1",
                role: "swing-attack",
                surfaceId: "boss-01:strike-anchor-1:hardpoint",
                x: 880,
                y: -950
            },
            {
                id: "boss-01:strike-anchor-2",
                role: "swing-attack",
                surfaceId: "boss-01:strike-anchor-2:hardpoint",
                x: 1685,
                y: -970
            },
            {
                id: "boss-01:strike-anchor-3",
                role: "swing-attack",
                surfaceId: "boss-01:strike-anchor-3:hardpoint",
                x: 2595,
                y: -975
            },
            {
                id: "boss-01:strike-anchor-4",
                role: "swing-attack",
                surfaceId: "boss-01:strike-anchor-4:hardpoint",
                x: 3715,
                y: -1005
            },
            {
                id: "boss-01:strike-anchor-5",
                role: "swing-attack",
                surfaceId: "boss-01:strike-anchor-5:hardpoint",
                x: 4515,
                y: -1025
            }
        ],
        baseHookReach: 400,
        bounds: {
            height: 1450,
            width: 5200,
            x: 0,
            y: -1850
        },
        entry: {
            id: "boss-01:entry",
            x: 420,
            y: -670
        },
        exit: {
            id: "boss-01:exit",
            x: 4700,
            y: -540
        },
        recoveryPoints: [
            {
                id: "boss-01:recovery-left",
                x: 720,
                y: -670
            },
            {
                id: "boss-01:recovery-center",
                x: 2600,
                y: -670
            },
            {
                id: "boss-01:recovery-right",
                x: 4400,
                y: -670
            }
        ],
        surfaces: [
            {
                bounds: {
                    height: 300,
                    width: 4200,
                    x: 300,
                    y: -1750
                },
                grappleable: true,
                id: "boss-01:upper-maintenance-frame",
                kind: "platform",
                oneWay: false
            },
            {
                bounds: {
                    height: 100,
                    width: 4500,
                    x: 340,
                    y: -650
                },
                grappleable: true,
                id: "boss-01:lower-catwalk",
                kind: "platform",
                oneWay: true
            },
            {
                bounds: {
                    height: 24,
                    width: 24,
                    x: 868,
                    y: -962
                },
                grappleable: true,
                id: "boss-01:strike-anchor-1:hardpoint",
                kind: "service-hardpoint",
                oneWay: false
            },
            {
                bounds: {
                    height: 24,
                    width: 24,
                    x: 1673,
                    y: -982
                },
                grappleable: true,
                id: "boss-01:strike-anchor-2:hardpoint",
                kind: "service-hardpoint",
                oneWay: false
            },
            {
                bounds: {
                    height: 24,
                    width: 24,
                    x: 2583,
                    y: -987
                },
                grappleable: true,
                id: "boss-01:strike-anchor-3:hardpoint",
                kind: "service-hardpoint",
                oneWay: false
            },
            {
                bounds: {
                    height: 24,
                    width: 24,
                    x: 3703,
                    y: -1017
                },
                grappleable: true,
                id: "boss-01:strike-anchor-4:hardpoint",
                kind: "service-hardpoint",
                oneWay: false
            },
            {
                bounds: {
                    height: 24,
                    width: 24,
                    x: 4503,
                    y: -1037
                },
                grappleable: true,
                id: "boss-01:strike-anchor-5:hardpoint",
                kind: "service-hardpoint",
                oneWay: false
            }
        ]
    },
    boss: {
        actorId: "boss-01:gate-locking-carriage",
        collider: {
            height: 430,
            width: 980,
            x: 2110,
            y: -1465
        },
        mechanicId: "rail-carriage",
        position: {
            x: 2600,
            y: -1250
        },
        rail: {
            maxX: 4490,
            minX: 500,
            y: -1500
        },
        visualPresetId: "gate-locking-carriage"
    },
    combat: {
        additionalPlayerMultiplier: 0.5,
        closedBodyDamageMultiplier: 0.25,
        generalDamageMode: "standard-combat",
        lateJoinPolicy: "join-current-attempt-without-rescale",
        participantCountSnapshot: "boss-stage-start",
        phaseOverflowPolicy: "discard-at-floor",
        weakFixedPercent: 0.25
    },
    hud: {
        healthBar: {
            showNumbers: true,
            showPhaseBreaks: true,
            style: "segmented-total"
        },
        objectivePlacement: "below-health",
        showVulnerabilityCountdown: true,
        title: "GATE LOCKING CARRIAGE"
    },
    id: "boss-01",
    mechanics: [
        {
            bounds: {
                height: 120,
                width: 2190,
                x: 1510,
                y: -765
            },
            id: "boss-01:full-crossbeam-sweep",
            parameters: {
                damageIntervalSeconds: 0.1,
                damagePerPulse: 3,
                recoverySeconds: 2.5,
                telegraphSeconds: 0.8,
                travelSpeed: 240
            },
            position: {
                x: 2600,
                y: -705
            },
            type: "full-crossbeam-sweep"
        },
        {
            bounds: {
                height: 115,
                width: 1120,
                x: 2600,
                y: -762.5
            },
            id: "boss-01:directional-broken-beam-sweep",
            parameters: {
                damageIntervalSeconds: 0.1,
                damagePerPulse: 3,
                recoverySeconds: 2,
                telegraphSeconds: 0.65,
                travelSpeed: 300
            },
            position: {
                x: 3160,
                y: -705
            },
            type: "directional-broken-beam-sweep"
        },
        {
            id: "boss-01:beam-failure",
            parameters: {
                armorOpenSeconds: 0.6,
                failureProgress: 0.5,
                telegraphSeconds: 1,
                travelSpeed: 420
            },
            position: {
                x: 2600,
                y: -1250
            },
            type: "beam-failure"
        },
        {
            bounds: {
                height: 330,
                width: 2300,
                x: 1450,
                y: -1560
            },
            id: "boss-01:rail-ram",
            parameters: {
                recoverySeconds: 1.4,
                telegraphSeconds: 0.55,
                travelSpeed: 420
            },
            position: {
                x: 2600,
                y: -705
            },
            type: "rail-ram"
        }
    ],
    name: "GATE LOCKING CARRIAGE",
    nextAreaId: "sector-02-01",
    phases: [
        {
            basePhaseHealth: 120,
            hud: {
                objective: "SWEEP을 피해 후방 REAR DRIVE를 공략"
            },
            id: "boss-01:phase-1",
            mechanicIds: ["boss-01:full-crossbeam-sweep"],
            name: "FULL CROSSBEAM",
            order: 1,
            vulnerability: {
                durationSeconds: 3,
                targetId: "boss-01:rear-drive",
                trigger: "max-extension",
                visualPresetId: "rear-drive"
            }
        },
        {
            basePhaseHealth: 120,
            hud: {
                objective: "진행 방향 반대편 SIDE GEARBOX를 공략"
            },
            id: "boss-01:phase-2",
            mechanicIds: ["boss-01:directional-broken-beam-sweep"],
            name: "DIRECTIONAL BROKEN BEAM",
            order: 2,
            vulnerability: {
                durationSeconds: 3,
                targetId: "boss-01:side-gearbox",
                trigger: "sweep-complete",
                visualPresetId: "side-gearbox"
            }
        },
        {
            basePhaseHealth: 120,
            hud: {
                objective: "RAM을 피하며 CENTRAL LOCK CORE를 추적"
            },
            id: "boss-01:phase-3",
            mechanicIds: ["boss-01:beam-failure", "boss-01:rail-ram"],
            name: "CENTRAL LOCK CORE",
            order: 3,
            vulnerability: {
                durationSeconds: 4,
                targetId: "boss-01:central-lock-core",
                trigger: "beam-failure",
                visualPresetId: "central-lock-core"
            }
        }
    ],
    schemaVersion: "boss-stage-spec-v2",
    sourceAreaId: "sector-01-08",
    specType: "boss-stage",
    subtitle: "WORKER DISTRICT / BLOCK 12",
    transition: {
        entryTrigger: "checkpoint-complete",
        nextAreaId: "sector-02-01",
        retainPlayerControl: true,
        sourceAreaId: "sector-01-08",
        victoryPresentationId: "boss-01:power-loss-full-stop",
        victoryTrigger: "all-phases-depleted"
    }
});
