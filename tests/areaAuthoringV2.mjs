import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
    AREA_SPEC_V2,
    EDITOR_EDITABLE_DOMAINS,
    EDITOR_READ_ONLY_DOMAINS,
    createAreaDefinitionFromV2
} from "../src/game/world/area-authoring-v2/AreaSpecV2.js";
import {
    EMPTY_AREA_BEHAVIOR_REGISTRY,
    createAreaBehaviorRegistry,
    validateBehaviorRefs
} from "../src/game/world/area-authoring-v2/AreaBehaviorRegistry.js";
import { validateAreaSpecV2 } from "../src/game/world/area-authoring-v2/AreaSpecV2Validator.js";
import {
    AREA_CATALOG_MANIFEST_V2,
    validateAreaCatalogManifest
} from "../src/game/world/area-authoring-v2/AreaCatalogManifest.js";
import { composeSectorCatalog } from "../src/game/world/area-authoring-v2/AreaCatalogComposer.js";
import {
    collectGeneratedOutputs,
    generatedModulePath,
    renderGeneratedAreaModule
} from "../src/game/world/area-authoring-v2/AreaSpecV2Generator.js";
import { SECTOR_01_AREA_CATALOG } from "../src/game/world/areas/sector01/Sector01AreaCatalog.js";
import { GENERATED_AREA as generatedStage01 } from "../src/game/world/areas/generated/sector01/Sector01Stage01.generated.js";
import { GENERATED_AREA as generatedStage07 } from "../src/game/world/areas/generated/sector01/Sector01Stage07.generated.js";

const projectRoot = resolve(import.meta.dirname, "..");
const sector01ExpectedStageIds = ["1-1", "1-2", "1-3", "1-4", "1-5", "1-6", "1-7", "1-8"];

function readJson(relativePath) {
    return JSON.parse(readFileSync(resolve(projectRoot, relativePath), "utf8"));
}

export function createValidSpec() {
    return {
        schemaVersion: AREA_SPEC_V2,
        stage: {
            sector: 1,
            stage: 1,
            legacyStageAlias: "1-1",
            sourceAreaId: "sector-01-01"
        },
        editor: {
            editableDomains: [...EDITOR_EDITABLE_DOMAINS],
            readOnlyDomains: [...EDITOR_READ_ONLY_DOMAINS]
        },
        definition: {
            id: "sector-01-01",
            sectorId: "sector-01",
            order: 1,
            name: "TEST SHAFT",
            subtitle: "V2 FIXTURE",
            bounds: { width: 960, height: 960 },
            entry: { id: "sector-01-01:entry", x: 0, y: -32 },
            exit: { id: "sector-01-01:exit", x: 160, y: -128 },
            nextAreaId: "sector-01-02",
            surfaces: [],
            routePoints: [],
            recoveryPoints: [],
            checkpoints: [],
            objects: [],
            objectives: [],
            windZones: [],
            scannerGroups: [],
            storyTriggers: [],
            routes: ["safe", "flow", "recovery"],
            cameraZones: [],
            cueIds: [],
            gate: {
                id: "sector-01-01:gate",
                nextAreaId: "sector-01-02",
                requiredObjectiveIds: [],
                trigger: { x: 112, y: -160, width: 96, height: 160 }
            }
        },
        anchors: [
            {
                target: { id: "sector-01-01:anchor-a-surface", x: 32, y: -128, properties: {} },
                landmark: { id: "sector-01-01:anchor-a", x: 32, y: -128, properties: { label: "A" } }
            }
        ],
        behaviorRefs: []
    };
}

function createManifest() {
    return {
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
}

export function run() {
    const validSpec = createValidSpec();
    assert.deepEqual(validateAreaSpecV2(validSpec, { file: "fixture" }), { valid: true, issues: [] });

    const area = createAreaDefinitionFromV2(validSpec);
    const target = area.surfaces.find(({ id }) => id === "sector-01-01:anchor-a-surface");
    const landmark = area.objects.find(({ id }) => id === "sector-01-01:anchor-a");
    assert.equal(target.kind, "grapple-target");
    assert.deepEqual(target.position, { x: 32, y: -128 });
    assert.equal(landmark.kind, "grapple-landmark");
    assert.deepEqual(landmark.position, target.position);

    const brokenAnchor = structuredClone(validSpec);
    brokenAnchor.anchors[0].target.id = "broken-target";
    const brokenAnchorResult = validateAreaSpecV2(brokenAnchor, { file: "fixture" });
    assert.equal(brokenAnchorResult.valid, false);
    assert.ok(brokenAnchorResult.issues.some(({ code }) => code === "anchor-target-id"));

    const mutableReadOnlyPolicy = structuredClone(validSpec);
    mutableReadOnlyPolicy.editor.editableDomains.push("objectives");
    const policyResult = validateAreaSpecV2(mutableReadOnlyPolicy, { file: "fixture" });
    assert.equal(policyResult.valid, false);
    assert.ok(policyResult.issues.some(({ code }) => code === "editor-domain-not-editable"));

    const unknownReference = { id: "unknown-behavior", arguments: {} };
    assert.throws(
        () => validateBehaviorRefs([unknownReference], EMPTY_AREA_BEHAVIOR_REGISTRY),
        ({ code, details }) => code === "behavior-reference-unknown" && details.id === "unknown-behavior"
    );

    const registry = createAreaBehaviorRegistry([
        {
            id: "behavior:fixture",
            factory: ({ enabled }) => ({ enabled })
        }
    ]);
    assert.deepEqual(validateBehaviorRefs([{ id: "behavior:fixture", arguments: { enabled: true } }], registry), [
        { id: "behavior:fixture", arguments: { enabled: true } }
    ]);

    const executableReference = structuredClone(validSpec);
    executableReference.behaviorRefs = [{ id: "behavior:fixture", arguments: { callback: () => {} } }];
    const executableResult = validateAreaSpecV2(executableReference, { file: "fixture", registry });
    assert.equal(executableResult.valid, false);
    assert.ok(executableResult.issues.some(({ code }) => code === "behavior-reference-executable-value"));

    const manifest = createManifest();
    assert.deepEqual(validateAreaCatalogManifest(manifest, { expectedStageIds: ["1-1", "1-2"] }), {
        valid: true,
        issues: []
    });

    const generatedArea01 = createAreaDefinitionFromV2(validSpec);
    const legacyArea02 = structuredClone(generatedArea01);
    legacyArea02.id = "sector-01-02";
    legacyArea02.order = 2;
    legacyArea02.name = "LEGACY AREA 02";
    legacyArea02.entry.id = "sector-01-02:entry";
    legacyArea02.exit.id = "sector-01-02:exit";
    legacyArea02.gate.id = "sector-01-02:gate";
    const composed = composeSectorCatalog({
        id: "sector-01",
        revision: "test",
        manifest,
        legacyAreas: [legacyArea02],
        generatedAreas: [generatedArea01],
        expectedStageIds: ["1-1", "1-2"]
    });
    assert.equal(composed.areas[0].id, "sector-01-01");
    assert.equal(composed.areas[1].name, "LEGACY AREA 02");

    assert.throws(
        () =>
            composeSectorCatalog({
                id: "sector-01",
                revision: "test",
                manifest,
                legacyAreas: [legacyArea02],
                generatedAreas: [generatedArea01, generatedArea01],
                expectedStageIds: ["1-1", "1-2"]
            }),
        /generated-area-duplicate/
    );

    const missingStageManifest = structuredClone(manifest);
    missingStageManifest.stageSources.pop();
    assert.ok(
        validateAreaCatalogManifest(missingStageManifest, { expectedStageIds: ["1-1", "1-2"] }).issues.some(
            ({ code }) => code === "manifest-stage-missing"
        )
    );

    const overlayManifest = structuredClone(manifest);
    overlayManifest.stageSources[0].overlay = { objectives: "legacy" };
    assert.ok(
        validateAreaCatalogManifest(overlayManifest, { expectedStageIds: ["1-1", "1-2"] }).issues.some(
            ({ code }) => code === "manifest-overlay-forbidden"
        )
    );

    const firstOutput = renderGeneratedAreaModule(validSpec);
    const secondOutput = renderGeneratedAreaModule(structuredClone(validSpec));
    assert.equal(firstOutput, secondOutput);
    assert.match(firstOutput, /^\/\/ GENERATED FILE - DO NOT EDIT\r?\n/);
    assert.match(firstOutput, /export const GENERATED_STAGE_ID = "1-1"/);
    assert.equal(generatedModulePath(manifest.stageSources[0]), manifest.stageSources[0].outputPath);
    assert.deepEqual(collectGeneratedOutputs({ manifest, specsByStageId: new Map([["1-1", validSpec]]) }), [
        { outputPath: manifest.stageSources[0].outputPath, content: firstOutput }
    ]);

    const sector01Manifest = readJson("docs/bsh/scenario/AREA-CATALOG.json");
    const sector01Stage01Spec = readJson("docs/bsh/scenario/1/1-1/AREA-SPEC.v2.json");
    const sector01Stage07Spec = readJson("docs/bsh/scenario/1/1-7/AREA-SPEC.v2.json");
    assert.deepEqual(
        validateAreaCatalogManifest(sector01Manifest, {
            expectedStageIds: sector01ExpectedStageIds,
            sourcePathExists: (sourcePath) => existsSync(resolve(projectRoot, sourcePath)),
            requireGeneratedOutputs: true
        }),
        { valid: true, issues: [] }
    );
    assert.deepEqual(validateAreaSpecV2(sector01Stage01Spec, { file: "1-1 AREA-SPEC.v2.json" }), {
        valid: true,
        issues: []
    });
    assert.deepEqual(validateAreaSpecV2(sector01Stage07Spec, { file: "1-7 AREA-SPEC.v2.json" }), {
        valid: true,
        issues: []
    });

    const legacyStage01 = SECTOR_01_AREA_CATALOG.areas.find(({ id }) => id === "sector-01-01");
    const legacyStage07 = SECTOR_01_AREA_CATALOG.areas.find(({ id }) => id === "sector-01-07");
    assert.deepEqual(createAreaDefinitionFromV2(sector01Stage01Spec), legacyStage01);
    assert.deepEqual(createAreaDefinitionFromV2(sector01Stage07Spec), legacyStage07);
    assert.deepEqual(generatedStage01, legacyStage01);
    assert.deepEqual(generatedStage07, legacyStage07);

    const sector01GeneratedOutputs = collectGeneratedOutputs({
        manifest: sector01Manifest,
        specsByStageId: new Map([
            ["1-1", sector01Stage01Spec],
            ["1-7", sector01Stage07Spec]
        ])
    });
    assert.equal(sector01GeneratedOutputs.length, 2);
    for (const output of sector01GeneratedOutputs) {
        assert.equal(readFileSync(resolve(projectRoot, output.outputPath), "utf8"), output.content);
    }

    const generatedAreaIds = new Set([generatedStage01.id, generatedStage07.id]);
    const composedSector01 = composeSectorCatalog({
        id: SECTOR_01_AREA_CATALOG.id,
        revision: SECTOR_01_AREA_CATALOG.revision,
        manifest: sector01Manifest,
        legacyAreas: SECTOR_01_AREA_CATALOG.areas.filter((area) => !generatedAreaIds.has(area.id)),
        generatedAreas: [generatedStage01, generatedStage07],
        expectedStageIds: sector01ExpectedStageIds
    });
    assert.deepEqual(composedSector01.areas, SECTOR_01_AREA_CATALOG.areas);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
    run();
    console.log("PASS areaAuthoringV2");
}
