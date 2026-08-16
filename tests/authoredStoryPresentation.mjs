import assert from "node:assert/strict";
import { localTriggerObjects } from "../src/game/camera/AuthoredCameraDirector.js";
import { AuthoredStoryPresentation } from "../src/game/presentation/AuthoredStoryPresentation.js";
import { GameSimulation } from "../src/game/simulation/GameSimulation.js";
import { createCurrentGameSimulation } from "../src/game/simulation/GameSimulationFactory.js";
import { SECTOR_04_AREA_CATALOG } from "../src/game/world/areas/sector04/Sector04AreaCatalog.js";

function triggerWithCue(triggers, cueId) {
    return triggers.find(({ cueIds }) => cueIds.includes(cueId));
}

export function run() {
    const currentWorld = createCurrentGameSimulation({ worldSeed: 42 }).world;
    const sector04World = new GameSimulation({ worldSeed: 42, worldCatalog: SECTOR_04_AREA_CATALOG }).world;
    const presentation = new AuthoredStoryPresentation();
    assert.equal(presentation.update(0.1, { currentAreaId: "sector-01-01" }).title, "GROUND SERVICE ACCESS");
    assert.equal(presentation.snapshot().detail, "LOCKDOWN");
    assert.equal(presentation.update(1.7, { currentAreaId: "sector-01-01" }), null);

    const started = presentation.update(0, {
        currentAreaId: "sector-01-01",
        events: [
            {
                eventType: "objective-sequence-started",
                objectiveId: "sector-01-01:terminal-read"
            }
        ]
    });
    assert.deepEqual([started.title, started.detail], ["VERTICAL GRID", "CASCADE FAILURE"]);
    assert.equal(presentation.update(0.9, { currentAreaId: "sector-01-01" }).title, "LOWER TRANSIT");
    assert.equal(presentation.update(0.9, { currentAreaId: "sector-01-01" }).title, "ROOFTOP PAD 03");

    const gateQueued = presentation.update(0, {
        currentAreaId: "sector-01-01",
        events: [{ eventType: "gate-unlocked", gateId: "sector-01-01:gate" }]
    });
    assert.equal(gateQueued.title, "ROOFTOP PAD 03");
    assert.deepEqual(
        [presentation.update(0.9, { currentAreaId: "sector-01-01" }).title, presentation.snapshot().detail],
        ["SERVICE SHAFT 02", "ACCESS OPEN"]
    );
    assert.equal(presentation.update(1.2, { currentAreaId: "sector-01-01" }), null);

    presentation.update(0, {
        currentAreaId: "sector-01-01",
        events: [{ eventType: "gate-unlocked", gateId: "sector-01-01:gate" }]
    });
    assert.equal(presentation.snapshot(), null, "replayed network events must not repeat a story cue");

    const secondAreaPresentation = new AuthoredStoryPresentation();
    assert.deepEqual(
        [
            secondAreaPresentation.update(0, {
                currentAreaId: "sector-01-02",
                currentAreaLocalY: -32
            }).title,
            secondAreaPresentation.snapshot().detail
        ],
        ["LIFT CONTROL", "OFFLINE"]
    );
    const waitingAtEntry = new AuthoredStoryPresentation();
    waitingAtEntry.update(0, { currentAreaId: "sector-01-02", currentAreaLocalY: -32 });
    assert.equal(
        waitingAtEntry.update(1.6, { currentAreaId: "sector-01-02", currentAreaLocalY: -32 }),
        null,
        "manual access guidance must wait for the player's first ascent"
    );
    secondAreaPresentation.update(0, {
        currentAreaId: "sector-01-02",
        currentAreaLocalY: -96
    });
    assert.deepEqual(
        [
            secondAreaPresentation.update(1.6, {
                currentAreaId: "sector-01-02",
                currentAreaLocalY: -96
            }).title,
            secondAreaPresentation.snapshot().detail
        ],
        ["AUTOMATIC LIFT SERVICE", "SUSPENDED · MANUAL ACCESS ONLY"]
    );
    assert.equal(
        secondAreaPresentation.update(1.8, {
            currentAreaId: "sector-01-02",
            currentAreaLocalY: -300
        }),
        null
    );

    const finalDeckReached = {
        eventType: "objective-completed",
        objectiveId: "sector-01-02:final-deck-reached"
    };
    assert.deepEqual(
        [
            secondAreaPresentation.update(0, {
                currentAreaId: "sector-01-02",
                currentAreaLocalY: -960,
                events: [finalDeckReached]
            }).title,
            secondAreaPresentation.snapshot().detail
        ],
        ["POWER REDUCTION", "STAGE 2"]
    );
    assert.deepEqual(
        [
            secondAreaPresentation.update(1.2, {
                currentAreaId: "sector-01-02",
                currentAreaLocalY: -960
            }).title,
            secondAreaPresentation.snapshot().detail
        ],
        ["SECURITY ACCESS", "CHECK"]
    );
    assert.equal(
        secondAreaPresentation.update(1.2, {
            currentAreaId: "sector-01-02",
            currentAreaLocalY: -960,
            events: [finalDeckReached]
        }),
        null,
        "replayed final-deck events must not repeat either 1-2 story cue"
    );

    const securityCheck = new AuthoredStoryPresentation();
    const employeeScanner = Object.freeze({
        cueIds: Object.freeze(["sector-01-03:employee-verified"]),
        bounds: Object.freeze({ x: -144, y: -128, width: 96, height: 128 })
    });
    assert.equal(
        securityCheck.update(0, {
            currentAreaId: "sector-01-03",
            currentAreaLocalX: -320,
            currentAreaLocalY: -32,
            triggers: [employeeScanner]
        }),
        null,
        "employee verification must wait until the local player crosses the scanner"
    );
    assert.deepEqual(
        [
            securityCheck.update(0, {
                currentAreaId: "sector-01-03",
                currentAreaLocalX: -96,
                currentAreaLocalY: -32,
                triggers: [employeeScanner]
            }).title,
            securityCheck.snapshot().detail
        ],
        ["EMPLOYEE VERIFIED", "VERTICAL MAINTENANCE"]
    );
    assert.deepEqual(
        [
            securityCheck.update(1.1, {
                currentAreaId: "sector-01-03",
                currentAreaLocalX: -96,
                currentAreaLocalY: -32
            }).title,
            securityCheck.snapshot().detail
        ],
        ["ASSIGNED SECTOR", "LOWER MAINTENANCE"]
    );
    assert.deepEqual(
        [
            securityCheck.update(1.1, {
                currentAreaId: "sector-01-03",
                currentAreaLocalX: 240,
                currentAreaLocalY: -320
            }).title,
            securityCheck.snapshot().detail
        ],
        ["RETURN TO ASSIGNED SECTOR", "FINAL WARNING"]
    );
    assert.deepEqual(
        [
            securityCheck.update(1.4, {
                currentAreaId: "sector-01-03",
                currentAreaLocalX: 64,
                currentAreaLocalY: -384
            }).title,
            securityCheck.snapshot().detail
        ],
        ["ROUTE VIOLATION", "DETECTED"]
    );
    assert.deepEqual(
        [
            securityCheck.update(0.45, {
                currentAreaId: "sector-01-03",
                currentAreaLocalX: 64,
                currentAreaLocalY: -480
            }).title,
            securityCheck.snapshot().detail
        ],
        ["UNAUTHORIZED", "VERTICAL TRANSIT"]
    );
    assert.deepEqual(
        [
            securityCheck.update(1.2, {
                currentAreaId: "sector-01-03",
                currentAreaLocalX: 208,
                currentAreaLocalY: -1000
            }).title,
            securityCheck.snapshot().detail
        ],
        ["ACCESS DENIED", "RETURN TO ASSIGNED SECTOR"]
    );

    const maintenanceOverride = {
        eventType: "objective-completed",
        objectiveId: "sector-01-03:maintenance-override"
    };
    assert.deepEqual(
        [
            securityCheck.update(1.2, {
                currentAreaId: "sector-01-03",
                currentAreaLocalX: 208,
                currentAreaLocalY: -1000,
                events: [maintenanceOverride]
            }).title,
            securityCheck.snapshot().detail
        ],
        ["MAINTENANCE", "OVERRIDE"]
    );
    assert.deepEqual(
        [
            securityCheck.update(0.9, {
                currentAreaId: "sector-01-03",
                currentAreaLocalX: 208,
                currentAreaLocalY: -1000,
                events: [{ eventType: "gate-unlocked", gateId: "sector-01-03:gate" }]
            }).title,
            securityCheck.snapshot().detail
        ],
        ["VIOLATION", "LOGGED"]
    );

    const foundationStory = new AuthoredStoryPresentation();
    assert.deepEqual(
        [
            foundationStory.update(0, {
                currentAreaId: "sector-01-04",
                currentAreaLocalX: -288,
                currentAreaLocalY: -32
            }).title,
            foundationStory.snapshot().detail
        ],
        ["GRAPPLE DEVICE", "DETECTED"]
    );
    assert.deepEqual(
        [
            foundationStory.update(1.1, {
                currentAreaId: "sector-01-04",
                currentAreaLocalX: 0,
                currentAreaLocalY: -160
            }).title,
            foundationStory.snapshot().detail
        ],
        ["GRAPPLE TELEMETRY", "ANALYZED"]
    );
    assert.deepEqual(
        [
            foundationStory.update(0.9, {
                currentAreaId: "sector-01-04",
                currentAreaLocalX: 0,
                currentAreaLocalY: -160
            }).title,
            foundationStory.snapshot().detail
        ],
        ["SAFETY LIMIT OVERRIDE", "AVAILABLE"]
    );
    assert.deepEqual(
        [
            foundationStory.update(1.1, {
                currentAreaId: "sector-01-04",
                currentAreaLocalX: 0,
                currentAreaLocalY: -160,
                events: [
                    {
                        eventType: "predicted-foundation-selected",
                        ownerId: "player:1",
                        sourceId: "sector-01-04:maintenance-node",
                        foundationId: "relay-link"
                    }
                ]
            }).title,
            foundationStory.snapshot().detail
        ],
        ["AUGMENT PROTOCOL", "ACCEPTED"]
    );
    assert.deepEqual(
        [
            foundationStory.update(0.9, {
                currentAreaId: "sector-01-04",
                currentAreaLocalX: 0,
                currentAreaLocalY: -160
            }).title,
            foundationStory.snapshot().detail
        ],
        ["RELAY LINK", "ONLINE"]
    );

    const augmentTestBay = new AuthoredStoryPresentation();
    assert.deepEqual(
        [
            augmentTestBay.update(0, { currentAreaId: "sector-01-05", currentAreaLocalY: -32 }).title,
            augmentTestBay.snapshot().detail
        ],
        ["AUGMENT TEST BAY", "LIVE CALIBRATION"]
    );
    augmentTestBay.update(1.4, { currentAreaId: "sector-01-05", currentAreaLocalY: -32 });
    assert.deepEqual(
        [
            augmentTestBay.update(0, { currentAreaId: "sector-01-05", currentAreaLocalY: -700 }).title,
            augmentTestBay.snapshot().detail
        ],
        ["VERTICAL LOAD TEST", "IN PROGRESS"]
    );
    assert.deepEqual(
        [
            augmentTestBay.update(1.1, { currentAreaId: "sector-01-05", currentAreaLocalY: -700 }).title,
            augmentTestBay.snapshot().detail
        ],
        ["SECURITY RESPONSE TEST", "IN PROGRESS"]
    );

    const pressureBypass = new AuthoredStoryPresentation();
    pressureBypass.update(0, { currentAreaId: "sector-01-07", currentAreaLocalY: -32 });
    pressureBypass.update(1.4, { currentAreaId: "sector-01-07", currentAreaLocalY: -32 });
    assert.deepEqual(
        [
            pressureBypass.update(0, { currentAreaId: "sector-01-07", currentAreaLocalY: -700 }).title,
            pressureBypass.snapshot().detail
        ],
        ["PRESSURE LIMIT", "EXCEEDED"]
    );
    pressureBypass.update(1.1, { currentAreaId: "sector-01-07", currentAreaLocalY: -700 });
    assert.deepEqual(
        [
            pressureBypass.update(0, { currentAreaId: "sector-01-07", currentAreaLocalY: -800 }).title,
            pressureBypass.snapshot().detail
        ],
        ["CONTAINMENT VIOLATION", "ACTIVE"]
    );

    const containmentGate = new AuthoredStoryPresentation();
    containmentGate.update(0, { currentAreaId: "sector-01-08", currentAreaLocalY: -32 });
    containmentGate.update(1.4, { currentAreaId: "sector-01-08", currentAreaLocalY: -32 });
    assert.deepEqual(
        [
            containmentGate.update(0, { currentAreaId: "sector-01-08", currentAreaLocalY: -500 }).title,
            containmentGate.snapshot().detail
        ],
        ["FINAL WARNING", ""]
    );
    assert.deepEqual(
        [
            containmentGate.update(1.0, { currentAreaId: "sector-01-08", currentAreaLocalY: -500 }).title,
            containmentGate.snapshot().detail
        ],
        ["RETURN TO LOWER MAINTENANCE", ""]
    );
    assert.deepEqual(
        [
            containmentGate.update(1.1, { currentAreaId: "sector-01-08", currentAreaLocalY: -500 }).title,
            containmentGate.snapshot().detail
        ],
        ["CONTAINMENT GATE", "CLOSURE IN PROGRESS"]
    );
    containmentGate.update(1.3, { currentAreaId: "sector-01-08", currentAreaLocalY: -500 });
    assert.deepEqual(
        [
            containmentGate.update(0, { currentAreaId: "sector-01-08", currentAreaLocalY: -1000 }).title,
            containmentGate.snapshot().detail
        ],
        ["CONTAINMENT GATE", "LOCKDOWN · 87%"]
    );
    containmentGate.update(1.1, { currentAreaId: "sector-01-08", currentAreaLocalY: -1000 });
    assert.deepEqual(
        [
            containmentGate.update(0, { currentAreaId: "sector-01-08", currentAreaLocalY: -1720 }).title,
            containmentGate.snapshot().detail
        ],
        ["WORKER DISTRICT", "BLOCK 12"]
    );

    const patrolWalkway = new AuthoredStoryPresentation();
    patrolWalkway.update(0, { currentAreaId: "sector-02-02", currentAreaLocalX: -320, currentAreaLocalY: -32 });
    patrolWalkway.update(1.4, { currentAreaId: "sector-02-02", currentAreaLocalX: -320, currentAreaLocalY: -32 });
    assert.deepEqual(
        [
            patrolWalkway.update(0, {
                currentAreaId: "sector-02-02",
                currentAreaLocalX: 0,
                currentAreaLocalY: -256
            }).title,
            patrolWalkway.snapshot().detail
        ],
        ["SECURITY PATROL", "ACTIVE"]
    );
    assert.deepEqual(
        [
            patrolWalkway.update(1.1, {
                currentAreaId: "sector-02-02",
                currentAreaLocalX: 0,
                currentAreaLocalY: -256
            }).title,
            patrolWalkway.snapshot().detail
        ],
        ["RESIDENTIAL TRANSIT", "RESTRICTED"]
    );

    const serviceNode = new AuthoredStoryPresentation();
    serviceNode.update(0, { currentAreaId: "sector-02-03", currentAreaLocalX: 0, currentAreaLocalY: -32 });
    serviceNode.update(1.4, { currentAreaId: "sector-02-03", currentAreaLocalX: 0, currentAreaLocalY: -32 });
    assert.deepEqual(
        [
            serviceNode.update(0, { currentAreaId: "sector-02-03", currentAreaLocalX: 0, currentAreaLocalY: -384 })
                .title,
            serviceNode.snapshot().detail
        ],
        ["GRAPPLE DEVICE", "DETECTED"]
    );
    assert.deepEqual(
        [
            serviceNode.update(0.9, {
                currentAreaId: "sector-02-03",
                currentAreaLocalX: 0,
                currentAreaLocalY: -384
            }).title,
            serviceNode.snapshot().detail
        ],
        ["EMERGENCY CONFIGURATION", "ACTIVE"]
    );

    const quietResidential = new AuthoredStoryPresentation();
    assert.deepEqual(
        [
            quietResidential.update(0, { currentAreaId: "sector-02-06", currentAreaLocalY: -32 }).title,
            quietResidential.snapshot().detail
        ],
        ["RESIDENTIAL BLOCKS", "12–18"]
    );

    const scannerGallery = new AuthoredStoryPresentation();
    const scannerGalleryTriggers = localTriggerObjects(currentWorld, "sector-03-02");
    const accessControlPanel = triggerWithCue(scannerGalleryTriggers, "sector-03-02:access-control");
    assert.deepEqual(accessControlPanel?.bounds, { x: -400, y: -216, width: 192, height: 64 });
    scannerGallery.update(0, { currentAreaId: "sector-03-02", currentAreaLocalY: -32 });
    assert.deepEqual(
        [
            scannerGallery.update(0, {
                currentAreaId: "sector-03-02",
                currentAreaLocalX: -304,
                currentAreaLocalY: -184,
                triggers: [accessControlPanel]
            }).title,
            scannerGallery.snapshot().detail
        ],
        ["COMMERCIAL ACCESS CONTROL", "EMPLOYEE VERIFIED"]
    );
    assert.deepEqual(
        [
            scannerGallery.update(1.1, {
                currentAreaId: "sector-03-02",
                currentAreaLocalX: -304,
                currentAreaLocalY: -184
            }).title,
            scannerGallery.snapshot().detail
        ],
        ["ROUTE AUTHORIZATION", "INVALID"]
    );

    const priorityConcourse = new AuthoredStoryPresentation();
    const accessDirectory = triggerWithCue(
        localTriggerObjects(currentWorld, "sector-03-07"),
        "sector-03-07:access-directory"
    );
    assert.deepEqual(accessDirectory?.bounds, { x: -96, y: -1112, width: 192, height: 64 });
    priorityConcourse.update(0, { currentAreaId: "sector-03-07", currentAreaLocalY: -32 });
    assert.deepEqual(
        [
            priorityConcourse.update(0, {
                currentAreaId: "sector-03-07",
                currentAreaLocalX: 0,
                currentAreaLocalY: -1080,
                triggers: [accessDirectory]
            }).title,
            priorityConcourse.snapshot().detail
        ],
        ["UPPER CONCOURSE ACCESS CONTROL", "SERVICE CLASS CONTROL"]
    );
    assert.deepEqual(
        [
            priorityConcourse.update(1.1, {
                currentAreaId: "sector-03-07",
                currentAreaLocalX: 0,
                currentAreaLocalY: -1080
            }).title,
            priorityConcourse.snapshot().detail
        ],
        ["STANDARD / PREMIUM PROFILES", "ENABLED"]
    );

    const upperMarket = new AuthoredStoryPresentation();
    const upperMarketTriggers = localTriggerObjects(currentWorld, "sector-03-08");
    const evacuationArchive = triggerWithCue(upperMarketTriggers, "sector-03-08:evacuation-archive");
    const accessArchive = triggerWithCue(upperMarketTriggers, "sector-03-08:access-archive");
    assert.deepEqual(evacuationArchive?.bounds, { x: -224, y: -1496, width: 192, height: 64 });
    assert.deepEqual(accessArchive?.bounds, { x: 32, y: -1496, width: 192, height: 64 });
    upperMarket.update(0, { currentAreaId: "sector-03-08", currentAreaLocalY: -32 });
    assert.deepEqual(
        [
            upperMarket.update(0, {
                currentAreaId: "sector-03-08",
                currentAreaLocalX: -128,
                currentAreaLocalY: -1464,
                triggers: [evacuationArchive, accessArchive]
            }).title,
            upperMarket.snapshot().detail
        ],
        ["EVACUATION TRANSFER ARCHIVE", "GROUP A · TRANSFER COMPLETE"]
    );
    assert.deepEqual(
        [
            upperMarket.update(1.3, {
                currentAreaId: "sector-03-08",
                currentAreaLocalX: -128,
                currentAreaLocalY: -1464
            }).title,
            upperMarket.snapshot().detail
        ],
        ["GROUP B", "TRANSFER COMPLETE"]
    );
    assert.deepEqual(
        [
            upperMarket.update(1.1, {
                currentAreaId: "sector-03-08",
                currentAreaLocalX: -128,
                currentAreaLocalY: -1464
            }).title,
            upperMarket.snapshot().detail
        ],
        ["GROUP C", "TRANSFER SUSPENDED"]
    );
    assert.deepEqual(
        [
            upperMarket.update(1.2, {
                currentAreaId: "sector-03-08",
                currentAreaLocalX: 128,
                currentAreaLocalY: -1464,
                triggers: [evacuationArchive, accessArchive]
            }).title,
            upperMarket.snapshot().detail
        ],
        ["UPPER COMMERCIAL ACCESS ARCHIVE", "SERVICE CLASS CONTROL ENABLED"]
    );
    assert.deepEqual(
        [
            upperMarket.update(1.3, {
                currentAreaId: "sector-03-08",
                currentAreaLocalX: 128,
                currentAreaLocalY: -1464
            }).title,
            upperMarket.snapshot().detail
        ],
        ["ACCESS TIER CONTROL", "ENABLED"]
    );

    const transitIntake = new AuthoredStoryPresentation();
    assert.deepEqual(
        [
            transitIntake.update(0, { currentAreaId: "sector-04-01", currentAreaLocalY: -32 }).title,
            transitIntake.snapshot().detail
        ],
        ["TRANSIT BACKBONE", "SERVICE DEGRADED"]
    );
    transitIntake.update(1.4, { currentAreaId: "sector-04-01", currentAreaLocalY: -32 });
    assert.deepEqual(
        [
            transitIntake.update(0, { currentAreaId: "sector-04-01", currentAreaLocalX: 96, currentAreaLocalY: -704 })
                .title,
            transitIntake.snapshot().detail
        ],
        ["UPPER EXPRESS TRUNK", "LIMITED OPERATION"]
    );
    transitIntake.update(1.3, { currentAreaId: "sector-04-01", currentAreaLocalX: 96, currentAreaLocalY: -704 });
    assert.deepEqual(
        [
            transitIntake.update(0, { currentAreaId: "sector-04-01", currentAreaLocalX: 480, currentAreaLocalY: -1312 })
                .title,
            transitIntake.snapshot().detail
        ],
        ["INFRASTRUCTURE SECURITY", "ACTIVE"]
    );

    const serviceNodeStory = new AuthoredStoryPresentation();
    serviceNodeStory.update(0, { currentAreaId: "sector-04-04", currentAreaLocalY: -32 });
    serviceNodeStory.update(1.3, { currentAreaId: "sector-04-04", currentAreaLocalY: -32 });
    assert.deepEqual(
        [
            serviceNodeStory.update(0, { currentAreaId: "sector-04-04", currentAreaLocalX: 0, currentAreaLocalY: -384 })
                .title,
            serviceNodeStory.snapshot().detail
        ],
        ["LOWER ASCENT FEEDER", "STATUS: SEGMENTED"]
    );
    assert.deepEqual(
        [
            serviceNodeStory.update(1.3, {
                currentAreaId: "sector-04-04",
                currentAreaLocalX: 0,
                currentAreaLocalY: -384
            }).title,
            serviceNodeStory.snapshot().detail
        ],
        ["TELEMETRY", "PARTIAL"]
    );

    const isolationJunction = new AuthoredStoryPresentation();
    isolationJunction.update(0, { currentAreaId: "sector-04-07", currentAreaLocalY: -32 });
    isolationJunction.update(1.4, { currentAreaId: "sector-04-07", currentAreaLocalY: -32 });
    assert.deepEqual(
        [
            isolationJunction.update(0, {
                currentAreaId: "sector-04-07",
                currentAreaLocalX: -32,
                currentAreaLocalY: -1248
            }).title,
            isolationJunction.snapshot().detail
        ],
        ["LOWER ASCENT FEEDER", "ISOLATED"]
    );
    assert.deepEqual(
        [
            isolationJunction.update(1.3, {
                currentAreaId: "sector-04-07",
                currentAreaLocalX: -32,
                currentAreaLocalY: -1248
            }).title,
            isolationJunction.snapshot().detail
        ],
        ["ROUTE TELEMETRY", "OFFLINE"]
    );

    const controlTrunk = new AuthoredStoryPresentation();
    const finalStatusDisplay = triggerWithCue(
        localTriggerObjects(sector04World, "sector-04-08"),
        "sector-04-08:upper-trunk-limited"
    );
    assert.deepEqual(finalStatusDisplay?.bounds, { x: -32, y: -1792, width: 192, height: 64 });
    controlTrunk.update(0, { currentAreaId: "sector-04-08", currentAreaLocalY: -32 });
    controlTrunk.update(1.4, { currentAreaId: "sector-04-08", currentAreaLocalY: -32 });
    assert.deepEqual(
        [
            controlTrunk.update(0, {
                currentAreaId: "sector-04-08",
                currentAreaLocalX: 64,
                currentAreaLocalY: -1760,
                triggers: [finalStatusDisplay]
            }).title,
            controlTrunk.snapshot().detail
        ],
        ["UPPER EXPRESS TRUNK", "LIMITED OPERATION"]
    );
    assert.deepEqual(
        [
            controlTrunk.update(1.2, {
                currentAreaId: "sector-04-08",
                currentAreaLocalX: 64,
                currentAreaLocalY: -1760
            }).title,
            controlTrunk.snapshot().detail
        ],
        ["LOWER ASCENT FEEDER", "ISOLATED"]
    );
}
