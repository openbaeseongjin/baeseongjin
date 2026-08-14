import assert from "node:assert/strict";
import { AuthoredStoryPresentation } from "../src/game/presentation/AuthoredStoryPresentation.js";

export function run() {
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
    assert.equal(
        securityCheck.update(0, {
            currentAreaId: "sector-01-03",
            currentAreaLocalX: -320,
            currentAreaLocalY: -32
        }),
        null,
        "employee verification must wait until the local player crosses the scanner"
    );
    assert.deepEqual(
        [
            securityCheck.update(0, {
                currentAreaId: "sector-01-03",
                currentAreaLocalX: -96,
                currentAreaLocalY: -32
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
}
