import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import { createValidSpec } from "./areaAuthoringV2.mjs";
import { AreaEditorDraft } from "../src/game/world/area-authoring-v2/editor/AreaEditorDraft.js";
import {
    collectEditorEntities,
    hitTestEditorEntity,
    screenToWorld,
    translateEditorEntity,
    worldToScreen
} from "../src/game/world/area-authoring-v2/editor/AreaEditorProjection.js";

export function run() {
    const draft = new AreaEditorDraft({ spec: createValidSpec(), revision: 4 });
    assert.equal(draft.mutate({ domain: "story", label: "blocked", apply: () => {} }), false);
    assert.equal(draft.moveAnchor("sector-01-01:anchor-a", { x: 16, y: -32 }), true);
    assert.deepEqual(draft.snapshot().spec.anchors[0].target, {
        id: "sector-01-01:anchor-a-surface",
        x: 48,
        y: -160,
        properties: {}
    });
    assert.equal(draft.undo(), true);
    assert.equal(draft.redo(), true);

    assert.equal(draft.validate().valid, true);
    assert.equal(draft.markApplied(5), true);
    assert.equal(draft.snapshot().dirty, false);
    for (let index = 0; index < 82; index += 1) {
        assert.equal(
            draft.replaceAtPointer({
                domain: "entry",
                label: `Entry ${index}`,
                pointer: "/definition/entry/x",
                value: index + 1
            }),
            true
        );
    }
    let undoCount = 0;
    while (draft.undo()) undoCount += 1;
    assert.equal(undoCount, 80);

    const view = { x: 400, y: 300, zoom: 1 };
    const point = worldToScreen({ x: -96, y: -736 }, view);
    assert.deepEqual(screenToWorld(point, view), { x: -96, y: -736 });
    const entities = collectEditorEntities(createValidSpec());
    const anchor = hitTestEditorEntity(entities, { x: 32, y: -128 }, 32);
    assert.deepEqual(
        { domain: anchor.domain, id: anchor.id, kind: anchor.kind },
        { domain: "anchors", id: "sector-01-01:anchor-a", kind: "anchor" }
    );
    const translated = translateEditorEntity(createValidSpec(), anchor, { x: 16, y: -32 });
    assert.deepEqual(translated.anchors[0].landmark, {
        id: "sector-01-01:anchor-a",
        x: 48,
        y: -160,
        properties: { label: "A" }
    });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    run();
    console.log("PASS areaEditorDraft");
}
