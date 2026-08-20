import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { AREA_CATALOG_MANIFEST_V2 } from "../src/game/world/area-authoring-v2/AreaCatalogManifest.js";
import { createValidSpec } from "./areaAuthoringV2.mjs";
import { createMapEditorAuthoringServer } from "../scripts/map-editor/MapEditorAuthoringServer.mjs";

async function writeFixture(root, relativePath, content) {
    const path = resolve(root, relativePath);
    await import("node:fs/promises").then(({ mkdir }) => mkdir(dirname(path), { recursive: true }));
    await writeFile(path, content, "utf8");
    return path;
}

async function createFixtureServer(options = {}) {
    const projectRoot = await mkdtemp(resolve(tmpdir(), "map-editor-server-"));
    const spec = createValidSpec();
    const manifest = {
        schemaVersion: AREA_CATALOG_MANIFEST_V2,
        catalogId: "sector-01",
        stageSources: [
            {
                stageId: "1-1",
                areaId: "sector-01-01",
                sectorId: "sector-01",
                source: "generated",
                sourcePath: "docs/bsh/scenario/1/1-1/AREA-SPEC.v2.json",
                outputPath: "src/game/world/areas/generated/sector01/Sector01Stage01.generated.js"
            },
            {
                stageId: "1-2",
                areaId: "sector-01-02",
                sectorId: "sector-01",
                source: "legacy",
                sourcePath: "src/game/world/areas/sector01/Sector01AreaCatalog.js"
            }
        ]
    };
    await writeFixture(projectRoot, "docs/bsh/scenario/AREA-CATALOG.json", JSON.stringify(manifest));
    await writeFixture(projectRoot, "tools/map-editor/index.html", '<main id="editor-canvas">fixture editor</main>');
    await writeFixture(
        projectRoot,
        "src/game/world/areas/sector01/Sector01AreaCatalog.js",
        "export const legacy = true;\n"
    );
    const sourcePath = await writeFixture(
        projectRoot,
        "docs/bsh/scenario/1/1-1/AREA-SPEC.v2.json",
        JSON.stringify(spec, null, 2)
    );
    const outputPath = await writeFixture(
        projectRoot,
        "src/game/world/areas/generated/sector01/Sector01Stage01.generated.js",
        "// original generated file\n"
    );
    return {
        projectRoot,
        sourcePath,
        outputPath,
        server: await createMapEditorAuthoringServer({
            projectRoot,
            manifestPath: "docs/bsh/scenario/AREA-CATALOG.json",
            ...options
        })
    };
}

async function withRequestServer(handler, run) {
    const httpServer = createServer(handler);
    await new Promise((resolve) => httpServer.listen(0, "127.0.0.1", resolve));
    const address = httpServer.address();
    try {
        await run(`http://127.0.0.1:${address.port}`);
    } finally {
        await new Promise((resolve, reject) => httpServer.close((cause) => (cause ? reject(cause) : resolve())));
    }
}

export async function run() {
    const fixture = await createFixtureServer();
    try {
        assert.deepEqual(fixture.server.stageSummary(), [
            { stageId: "1-1", areaId: "sector-01-01", name: "TEST SHAFT", revision: 0 }
        ]);
        await withRequestServer(fixture.server.requestHandler, async (origin) => {
            const editor = await fetch(`${origin}/map-editor/`);
            assert.equal(editor.status, 200);
            assert.match(await editor.text(), /fixture editor/);
            const stages = await fetch(`${origin}/api/map-editor/stages`);
            assert.deepEqual((await stages.json()).stages, fixture.server.stageSummary());
        });
        assert.equal((await fixture.server.readStage("1-1")).stageId, "1-1");
        await assert.rejects(() => fixture.server.readStage("1-2"), { code: "stage-not-generated" });
        await assert.rejects(() => fixture.server.readStage("../1-1"), { code: "stage-not-generated" });

        const originalSource = await readFile(fixture.sourcePath, "utf8");
        const invalidSpec = createValidSpec();
        invalidSpec.anchors[0].target.id = "invalid";
        await assert.rejects(() => fixture.server.applyStage({ stageId: "1-1", spec: invalidSpec, baseRevision: 0 }), {
            code: "spec-invalid"
        });
        assert.equal(await readFile(fixture.sourcePath, "utf8"), originalSource);

        const validSpec = createValidSpec();
        validSpec.definition.name = "APPLIED SHAFT";
        const applied = await fixture.server.applyStage({ stageId: "1-1", spec: validSpec, baseRevision: 0 });
        assert.equal(applied.revision, 1);
        assert.equal(applied.moduleUrl, "/src/game/world/areas/generated/sector01/Sector01Stage01.generated.js");
        assert.equal(JSON.parse(await readFile(fixture.sourcePath, "utf8")).definition.name, "APPLIED SHAFT");
        assert.match(await readFile(fixture.outputPath, "utf8"), /APPLIED SHAFT/);
        await assert.rejects(() => fixture.server.applyStage({ stageId: "1-1", spec: validSpec, baseRevision: 0 }), {
            code: "revision-conflict"
        });
    } finally {
        await rm(fixture.projectRoot, { recursive: true, force: true });
    }

    const rollbackFixture = await createFixtureServer({
        failureInjector: ({ phase, index }) => {
            if (phase === "commit" && index === 1) throw new Error("injected-rename-failure");
        }
    });
    try {
        const originalSource = await readFile(rollbackFixture.sourcePath, "utf8");
        const originalOutput = await readFile(rollbackFixture.outputPath, "utf8");
        const validSpec = createValidSpec();
        validSpec.definition.name = "ROLLBACK SHAFT";
        await assert.rejects(
            () => rollbackFixture.server.applyStage({ stageId: "1-1", spec: validSpec, baseRevision: 0 }),
            { code: "apply-rolled-back" }
        );
        assert.equal(await readFile(rollbackFixture.sourcePath, "utf8"), originalSource);
        assert.equal(await readFile(rollbackFixture.outputPath, "utf8"), originalOutput);
    } finally {
        await rm(rollbackFixture.projectRoot, { recursive: true, force: true });
    }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    await run();
    console.log("PASS mapEditorAuthoringServer");
}
