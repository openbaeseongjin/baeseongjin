# Map Editor UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (\`- [ ]\`) syntax for tracking.

**Goal:** Build a local visual editor for generated v2 map stages that validates and applies a Draft, then opens a new isolated single-player preview.

**Architecture:** Browser-only editor state is held by AreaEditorDraft; Canvas projection is a separate pure module and all persistent reads/writes are mediated by a loopback-only Node server. The preview derives a one-area catalog from the generated module and replaces only its own GameApp local authority, preserving the normal game entrypoint and authored runtime.

**Tech Stack:** Browser ES modules, Canvas 2D, DOM APIs, Node.js http/fs APIs, existing v2 validator/generator, Node assert tests, existing static request handler.

**Spec:** docs/superpowers/specs/2026-08-20-map-editor-ui-design.md

## Global Constraints

- Keep src/main.js, root index.html, Sector Catalog facades, legacy providers, seamless Runtime, root package.json scripts and shared test runner untouched; they are main-developer-owned integration boundaries.
- Serve only localhost and accept writes only for manifest entries declared as source: generated; reject legacy stage IDs, traversal, executable behavior data, bodies over 2 MiB and stale revisions.
- Draft mutations reject objectives, progression, story, scanner and behaviorRegistry. Validate never writes files; Apply writes v2 JSON and generated JS only after all validation succeeds.
- An Anchor landmark and its 24×24 grapple-target remain an indivisible pair with matching coordinates and stable derived target ID.
- Cyan is reserved for selection/Anchor/link state, Amber for dirty/error/wind state; background imagery is decorative and never a coordinate, collision or selection source.
- Preview creates a fresh local single-player run from exactly one generated Area. It never hot-swaps a run, touches multiplayer, or replaces the normal current authored catalog.
- Run focused tests and direct browser verification in this lane. The main developer owns the final integrated npm test, npm run check, npm run format:check ledger and scenario checkpoint marker after facade/cutover work.

---

## File Structure

| Path | Responsibility |
| --- | --- |
| src/game/world/area-authoring-v2/editor/AreaEditorDraft.js | Immutable Draft snapshots, selected stable entity, guarded mutations, bounded undo/redo, local validation and Apply acknowledgement. |
| src/game/world/area-authoring-v2/editor/AreaEditorProjection.js | Browser-safe entity enumeration, world/screen conversion, deterministic hit testing and geometry translations. |
| src/game/runtime/AreaPreviewGameApp.js | New local GameApp instance backed by a supplied one-Area catalog. |
| scripts/map-editor/MapEditorAuthoringServer.mjs | Manifest-derived allowlist, GET/validate/Apply API, staged file transaction and static page delegation. |
| scripts/map-editor/serveMapEditor.mjs | Explicit localhost-only executable server bootstrap. |
| tools/map-editor/index.html, main.js, editor.css | Editor shell, Canvas/Inspector interaction and reference-derived visual language. |
| tools/map-editor/preview.html, preview.js, preview.css | Fresh generated-area single-player preview bootstrap. |
| tests/areaEditorDraft.mjs | Draft public contract tests. |
| tests/mapEditorAuthoringServer.mjs | API allowlist, validation, revision and transaction tests. |
| tests/areaPreviewGameApp.mjs | Isolated catalog and preview authority tests. |

### Task 1: Establish the Draft state boundary

**Files:**
- Create: src/game/world/area-authoring-v2/editor/AreaEditorDraft.js
- Create: tests/areaEditorDraft.mjs

**Interfaces:**
- Consumes: validateAreaSpecV2(spec), EDITOR_EDITABLE_DOMAINS, EDITOR_READ_ONLY_DOMAINS and a parsed v2 spec.
- Produces: AreaEditorDraft({ spec, revision, validate }) with snapshot(), mutate(), moveAnchor(), undo(), redo(), validate(), markApplied().

- [x] **Step 1: Write the failing read-only and Anchor-pair test**

~~~js
const draft = new AreaEditorDraft({ spec: createValidSpec(), revision: 4 });
assert.equal(draft.mutate({ domain: "story", label: "blocked", apply: () => {} }), false);
assert.equal(draft.moveAnchor("sector-01-01:anchor-a", { x: 16, y: -32 }), true);
assert.deepEqual(draft.snapshot().spec.anchors[0].target, {
    id: "sector-01-01:anchor-a-surface", x: 48, y: -160, properties: {}
});
assert.equal(draft.undo(), true);
assert.equal(draft.redo(), true);
~~~

- [x] **Step 2: Run the test and confirm it fails**

Run: node tests/areaEditorDraft.mjs

Expected: module-not-found for AreaEditorDraft.js.

- [x] **Step 3: Implement the Draft contract**

~~~js
export class AreaEditorDraft {
    constructor({ spec, revision = 0, validate = validateAreaSpecV2 }) { this.state = { spec: structuredClone(spec), revision, history: [], redo: [] }; this.validateFn = validate; }
    mutate({ domain, label, apply }) { if (!EDITOR_EDITABLE_DOMAINS.includes(domain)) return false; const before = structuredClone(this.state.spec); apply(this.state.spec); this.record({ domain, label, before, after: structuredClone(this.state.spec) }); return true; }
    moveAnchor(landmarkId, delta) { return this.mutate({ domain: "anchors", label: "Move anchor", apply: (spec) => moveAnchorPair(spec, landmarkId, delta) }); }
    undo() { return this.restoreHistory(this.state.history, this.state.redo); }
    redo() { return this.restoreHistory(this.state.redo, this.state.history); }
    validate() { return this.validateFn(this.spec); }
}
~~~

Store history entries as changed JSON-pointer values, cap each history stack at 80 entries, and leave Draft state unchanged after a rejected mutation or invalid Apply acknowledgement.

- [x] **Step 4: Run the passing Draft test**

Run: node tests/areaEditorDraft.mjs

Expected: PASS areaEditorDraft, including no-write validation, surface translation, history cap and Apply revision acknowledgement.

- [x] **Step 5: Commit the state boundary**

~~~powershell
git add src/game/world/area-authoring-v2/editor tests/areaEditorDraft.mjs
git commit -m "feat: add map editor draft state"
~~~

### Task 2: Add pure Canvas projection helpers

**Files:**
- Create: src/game/world/area-authoring-v2/editor/AreaEditorProjection.js
- Modify: tests/areaEditorDraft.mjs

**Interfaces:**
- Consumes: v2 definition and Anchor pairs.
- Produces: collectEditorEntities(spec), worldToScreen(point, view), screenToWorld(point, view), hitTestEditorEntity(entities, point, radius), translateEntity(spec, entity, delta).

- [x] **Step 1: Extend the failing test with projection round-trip and hit-test assertions**

~~~js
const point = worldToScreen({ x: -96, y: -736 }, { x: 400, y: 300, zoom: 1 });
assert.deepEqual(screenToWorld(point, { x: 400, y: 300, zoom: 1 }), { x: -96, y: -736 });
const anchor = hitTestEditorEntity(collectEditorEntities(createValidSpec()), { x: 32, y: -128 }, 32);
assert.deepEqual(anchor, { domain: "anchors", id: "sector-01-01:anchor-a", kind: "anchor" });
~~~

- [x] **Step 2: Run the focused test and confirm failure**

Run: node tests/areaEditorDraft.mjs

Expected: missing projection export.

- [x] **Step 3: Implement deterministic projection metadata**

Use stable object IDs and an entity path instead of array offsets. Represent surfaces as polygon entities, an Anchor as one landmark/target pair, entry/recovery/route as neutral point entities, Enemy/Wind as source entities and Camera as zone entities. Translation functions must call the Draft mutation path rather than mutate a renderer snapshot.

- [x] **Step 4: Run the passing test**

Run: node tests/areaEditorDraft.mjs

Expected: PASS areaEditorDraft with projection reverse-transform and nearest stable-entity selection.

- [x] **Step 5: Amend the first commit only if it has not been shared; otherwise make a dedicated commit**

~~~powershell
git add src/game/world/area-authoring-v2/editor/AreaEditorProjection.js tests/areaEditorDraft.mjs
git commit -m "feat: project map editor entities for canvas"
~~~

### Task 3: Build the manifest-allowlisted authoring server

**Files:**
- Create: scripts/map-editor/MapEditorAuthoringServer.mjs
- Create: scripts/map-editor/serveMapEditor.mjs
- Create: tests/mapEditorAuthoringServer.mjs

**Interfaces:**
- Consumes: validateAreaCatalogManifest, validateAreaSpecV2, collectGeneratedOutputs and createStaticRequestHandler(root).
- Produces: createMapEditorAuthoringServer({ projectRoot, manifestPath, failureInjector }) with requestHandler, stageSummary(), readStage(stageId) and applyStage({ stageId, spec, baseRevision }).

- [x] **Step 1: Write failing server transaction tests**

~~~js
const server = await createFixtureServer();
assert.equal((await server.readStage("1-1")).stageId, "1-1");
await assert.rejects(() => server.readStage("1-2"), { code: "stage-not-generated" });
await assert.rejects(() => server.applyStage({ stageId: "1-1", spec: invalidSpec, baseRevision: 0 }), {
    code: "spec-invalid"
});
assert.equal((await server.applyStage({ stageId: "1-1", spec: validSpec, baseRevision: 0 })).revision, 1);
~~~

- [x] **Step 2: Run the server test and confirm failure**

Run: node tests/mapEditorAuthoringServer.mjs

Expected: module-not-found for MapEditorAuthoringServer.mjs.

- [x] **Step 3: Implement server API and staged transaction**

Create an immutable generated-stage allowlist from the manifest. Validate body size, Stage identity, editable policy, behavior reference safety and base revision before generating all outputs in memory. Stage temporary files in each target directory, rename backed-up targets only after all staging succeeds, and restore the pre-Apply JSON/generated bytes if an injected rename failure occurs.

Expose:
- GET /api/map-editor/stages
- GET /api/map-editor/stages/:id
- POST /api/map-editor/stages/:id/validate
- PUT /api/map-editor/stages/:id
- GET /api/map-editor/stages/:id/preview

Return errors as { code, message, issues? }. serveMapEditor.mjs binds only 127.0.0.1 and does not edit root scripts.

- [x] **Step 4: Run the passing server test**

Run: node tests/mapEditorAuthoringServer.mjs

Expected: PASS mapEditorAuthoringServer, proving generated-only allowlisting, invalid no-write, revision conflict, deterministic output and rollback restoration.

- [x] **Step 5: Commit the server boundary**

~~~powershell
git add scripts/map-editor tests/mapEditorAuthoringServer.mjs
git commit -m "feat: add local map editor authoring server"
~~~

### Task 4: Add isolated generated-Area preview runtime

**Files:**
- Create: src/game/runtime/AreaPreviewGameApp.js
- Create: tests/areaPreviewGameApp.mjs

**Interfaces:**
- Consumes: GameApp, LocalAuthority, GameSimulation and defineAreaCatalog({ id, revision, areas }).
- Produces: AreaPreviewGameApp({ canvas, generatedArea, revision, worldSeed }) with normal start()/stop() lifecycle.

- [x] **Step 1: Write a failing catalog-isolation test**

~~~js
const preview = new AreaPreviewGameApp({ canvas, generatedArea, revision: 9 });
assert.equal(preview.authority.snapshot().world.areas.length, 1);
assert.equal(preview.authority.snapshot().world.areas[0].id, generatedArea.id);
assert.equal(preview.authority.snapshot().worldProgress.currentAreaId, generatedArea.id);
~~~

- [x] **Step 2: Run the test and confirm failure**

Run: node tests/areaPreviewGameApp.mjs

Expected: module-not-found for AreaPreviewGameApp.js.

- [x] **Step 3: Implement the adapter without modifying GameApp**

~~~js
export class AreaPreviewGameApp extends GameApp {
    constructor({ generatedArea, revision, ...options }) {
        super({ ...options, startAreaId: generatedArea.id });
        const catalog = defineAreaCatalog({ id: "map-editor-preview", revision, areas: [generatedArea] });
        this.authority = new LocalAuthority(new GameSimulation({ worldCatalog: catalog, startAreaId: generatedArea.id }));
        this.camera = this.createCamera();
    }
}
~~~

Validate area identity before construction, recreate any player-ID-bound feedback state after replacement, and limit debug start selection to the preview Area.

- [x] **Step 4: Run the passing adapter test**

Run: node tests/areaPreviewGameApp.mjs

Expected: PASS areaPreviewGameApp, proving the normal authored catalog remains unchanged.

- [x] **Step 5: Commit preview isolation**

~~~powershell
git add src/game/runtime/AreaPreviewGameApp.js tests/areaPreviewGameApp.mjs
git commit -m "feat: preview generated map areas in isolation"
~~~

### Task 5: Implement the local Canvas editor page

**Files:**
- Create: tools/map-editor/index.html
- Create: tools/map-editor/main.js
- Create: tools/map-editor/editor.css

**Interfaces:**
- Consumes: server endpoints, AreaEditorDraft and projection helpers.
- Produces: /map-editor/ with stage/layer panel, Canvas interaction, Inspector, Undo/Redo, Validate, Apply and Preview.

- [x] **Step 1: Build an accessible DOM shell with stable control IDs**

~~~html
<main class="editor-shell" aria-label="Map editor">
  <nav aria-label="Stage and layer selection"></nav>
  <section class="canvas-workspace"><canvas id="editor-canvas"></canvas></section>
  <aside aria-label="Selected object inspector"></aside>
  <footer aria-live="polite"><button id="validate-draft">Validate</button></footer>
</main>
~~~

Create repeated controls through DOM APIs, not string innerHTML. Controls have labels, focus order and disabled state from the current Draft.

- [x] **Step 2: Implement the one shared mutation entrypoint**

~~~js
function applyMutation({ domain, label, apply }) {
    if (!draft.mutate({ domain, label, apply })) return render();
    appliedRevision = null;
    render();
}
~~~

Canvas drag and Inspector field edits must call this same function. Add presets only for surface, Anchor, recovery point, route point, Wind zone and Camera zone. Existing Enemy slots are editable but cannot be created or deleted. Render read-only summaries with disabled controls.

- [x] **Step 3: Implement reference-derived Canvas drawing**

~~~css
:root { --ink: #09131d; --panel: #12212d; --cyan: #66e6ff; --amber: #f4ae4b; }
.entity-anchor.is-selected { stroke: var(--cyan); }
.entity-wind, .draft-state.is-dirty { color: var(--amber); }
~~~

Draw only current Draft geometry: surface polygons, landmark-circle/target-square Anchor pairs, neutral Entry/Recovery/Route markers, Amber Enemy/Wind markers and transparent Camera bands. Background reference art is not hit-testable and never denotes collision.

- [x] **Step 4: Wire server outcomes**

~~~js
const result = await api.apply({ stageId, spec: draft.specification(), baseRevision: draft.revision() });
draft.markApplied(result.revision);
previewButton.disabled = false;
~~~

On validation error or revision conflict, preserve Draft and show issue codes. Only explicit user reload discards a Draft. Preview opens a new window only after successful Apply.

- [x] **Step 5: Commit the editor workspace**

~~~powershell
git add tools/map-editor/index.html tools/map-editor/main.js tools/map-editor/editor.css
git commit -m "feat: add visual map editor workspace"
~~~

### Task 6: Implement the page-owned game preview and verify

**Files:**
- Create: tools/map-editor/preview.html
- Create: tools/map-editor/preview.js
- Create: tools/map-editor/preview.css
- Modify: SESSION-HANDOFF.md
- Modify: docs/superpowers/plans/2026-08-20-map-editor-ui-implementation.md

**Interfaces:**
- Consumes: GET /api/map-editor/stages/:id/preview and AreaPreviewGameApp.
- Produces: an explicit fresh-run Preview page and an accurate lane handoff.

- [x] **Step 1: Build the preview shell**

~~~html
<main class="preview-shell">
  <header><a href="./">Back to editor</a><button id="reload-preview">Reload fresh run</button></header>
  <canvas id="preview-canvas" aria-label="Single player map preview"></canvas>
  <output id="preview-status" aria-live="polite"></output>
</main>
~~~

- [x] **Step 2: Create a new preview authority on every load**

~~~js
async function createPreview() {
    currentApp?.stop();
    const { moduleUrl, revision } = await api.preview(stageId);
    const { GENERATED_AREA } = await import(moduleUrl + "?revision=" + encodeURIComponent(revision));
    currentApp = new AreaPreviewGameApp({ canvas, generatedArea: GENERATED_AREA, revision });
    currentApp.start();
}
~~~

Reject missing and legacy stages. Reload stops the old instance before constructing another; it never replaces a running simulation.

- [x] **Step 3: Run focused checks**

~~~powershell
node tests/areaAuthoringV2.mjs
node tests/areaEditorDraft.mjs
node tests/mapEditorAuthoringServer.mjs
node tests/areaPreviewGameApp.mjs
node scripts/area-authoring-v2/generateAreaCatalogs.mjs --check
npm run format:check
git diff --check
~~~

Expected: every focused test prints PASS, generator is current, formatter and whitespace checks pass.

- [x] **Step 4: Perform direct browser verification**

Run: node scripts/map-editor/serveMapEditor.mjs --port=4178. Open http://127.0.0.1:4178/map-editor/, select 1-7, move an Anchor through the Canvas or Inspector, Validate, Apply, then Preview. Reload Preview twice and close it.

Expected: selection/Anchor are Cyan, dirty/wind/errors are Amber, Apply persists only the generated v2 stage, Preview starts a new one-Area single-player run, and the normal game/multiplayer remain unchanged.

> **Verification note (2026-08-20):** A direct browser pass loaded `1-7`, selected `anchor-a`, changed and validated its Inspector position, applied the generated-only transaction, and opened a fresh one-Area single-player Preview. The original coordinate was then restored and applied, leaving no semantic source change. The Canvas selection state was Cyan (`#66e6ff`) and the Draft/Wind palette reserved Amber (`#f4ae4b`).

- [x] **Step 5: Update the handoff and make the final lane commit**

Record the browser result, server command and remaining main-owned facade/cutover/final-ledger responsibilities. Do not change the scenario checkpoint marker because this lane does not change Stage content, sector facade or live runtime connection.

~~~powershell
git add SESSION-HANDOFF.md docs/superpowers tools/map-editor/preview.*
git commit -m "docs: record map editor UI verification"
~~~

## Self-Review

**Spec coverage:** Tasks 1 and 5 implement Draft editing/read-only policy; Task 2 protects server allowlisting, validation, conflicts and rollback; Task 4 and Task 6 create a fresh isolated preview; Task 5 applies the Canvas hierarchy and palette; Task 6 records actual browser evidence and preserves source separation.

**Placeholder scan:** No task uses deferred placeholders or unspecified tests. Each identifies exact files, interfaces, commands and observable output.

**Type consistency:** AreaEditorDraft is the only browser-side mutable source; the server receives { stageId, spec, baseRevision }; preview receives { generatedArea, revision }; both Canvas and Inspector use mutate({ domain, label, apply }); server, preview and UI accept only generated manifest stages.
