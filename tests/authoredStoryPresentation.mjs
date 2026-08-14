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
}
