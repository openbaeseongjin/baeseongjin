import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { EnvironmentDefinition } from "../src/render/environment/EnvironmentDefinition.js";
import {
    assertEnvironmentAtlasImagePath,
    createEnvironmentDefinitionFromManifest
} from "../src/render/environment/EnvironmentManifest.js";
import {
    DEFAULT_ENVIRONMENT_DEFINITION,
    ENVIRONMENT_MAX_ALTITUDE,
    ENVIRONMENT_ZONE_STEP
} from "../src/render/environment/EnvironmentCatalog.js";
import { EnvironmentAssetSet } from "../src/render/environment/EnvironmentAssetSet.js";
import { AltitudeZoneResolver, AltitudeSunrise } from "../src/render/environment/AltitudeZoneResolver.js";
import { validateEnvironmentAssetDirectory } from "../scripts/validateEnvironmentAssets.mjs";
import { runtimeAssetUrl } from "../src/render/assets/RuntimeAssetCatalog.js";

const ROOT = resolve(fileURLToPath(import.meta.url), "../..");

export function run() {
    // Definition validation
    const def = DEFAULT_ENVIRONMENT_DEFINITION;
    assert.equal(def.id, "environment-default-mock");
    assert.ok(Object.keys(def.atlases).length >= 4, "atlases must exist");
    assert.equal(
        def.atlases["backdrop-far"].source,
        runtimeAssetUrl("environments", "default-mock", "backdrop-far.png")
    );
    assert.equal(def.zones.length, 5);
    assert.equal(def.zones[0].id, "waste");
    assert.equal(def.zones[4].id, "landing-pad");
    assert.equal(def.backdrop.layers.length, 3);
    assert.ok(Object.keys(def.terrain.materials).length >= 5);
    assert.ok(Object.keys(def.decoration.groups).length >= 5);
    // Zone resolution
    assert.equal(def.zoneAt(0).id, "waste");
    assert.equal(def.zoneAt(1000).id, "waste");
    assert.equal(def.zoneAt(1800).id, "industrial-maintenance");
    assert.equal(def.zoneAt(3600).id, "residential-commercial");
    assert.equal(def.zoneAt(5400).id, "corporate-security");
    assert.equal(def.zoneAt(7200).id, "landing-pad");
    assert.deepEqual(
        def.zones.map(({ minAltitude }) => minAltitude),
        [0, 1, 2, 3, 4].map((index) => index * ENVIRONMENT_ZONE_STEP)
    );
    assert.equal(def.zoneAt(99999).id, "landing-pad");
    assert.equal(def.zoneAt(-1).id, "waste");

    // Material lookup
    const wasteMat = def.materialFor(def.zones[0]);
    assert.ok(wasteMat.fill.atlasId);
    assert.ok(wasteMat.edge.atlasId);

    // Decoration group lookup
    const wasteDeco = def.decorationGroupFor(def.zones[0]);
    assert.ok(wasteDeco.items.length >= 1);

    // Invalid zone throws
    const badZone = { ...def.zones[0], terrainMaterial: "nonexistent" };
    assert.throws(() => def.materialFor(badZone), /Unknown terrain material/);

    // Zone ordering
    for (let i = 1; i < def.zones.length; i += 1) {
        assert.ok(def.zones[i].minAltitude > def.zones[i - 1].minAltitude, `zones must be sorted by minAltitude`);
    }

    // AltitudeZoneResolver
    const resolver = new AltitudeZoneResolver(def);
    assert.equal(resolver.resolve(0).id, "waste");
    assert.equal(resolver.resolve(30000).id, "landing-pad");

    // AltitudeSunrise
    const sunrise = new AltitudeSunrise({ definition: def });
    const p0 = sunrise.progress(0);
    const pMid = sunrise.progress(3600);
    const pTop = sunrise.progress(ENVIRONMENT_MAX_ALTITUDE);
    assert.ok(p0 >= 0 && p0 <= 1, "progress 0-1");
    assert.ok(pMid > p0, "progress increases");
    assert.ok(pTop >= pMid, "progress monotonic");
    assert.equal(sunrise.progress(ENVIRONMENT_MAX_ALTITUDE), 1);
    const b0 = sunrise.brightness(0);
    const bTop = sunrise.brightness(ENVIRONMENT_MAX_ALTITUDE);
    assert.ok(bTop > b0, "brightness increases");

    // Manifest roundtrip
    const manifestPath = resolve(ROOT, "assets/runtime/environments/default-mock/sprite-manifest.json");
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    const fromManifest = createEnvironmentDefinitionFromManifest(manifest);
    assert.equal(fromManifest.id, "environment-default-mock");
    assert.equal(fromManifest.zones.length, 5);
    assert.deepEqual(
        fromManifest.zones.map(({ minAltitude }) => minAltitude),
        def.zones.map(({ minAltitude }) => minAltitude),
        "example zone ranges stay aligned with the runtime catalog"
    );
    assert.equal(fromManifest.backdrop.layers.length, 3);
    assert.equal(fromManifest.backdrop.layers[0].frames[0].x, 0, "manifest cell column zero is valid");
    assert.equal(fromManifest.backdrop.layers[0].frames[0].y, 0, "manifest cell row zero is valid");

    // Manifest rejects bad formatVersion
    assert.throws(() => createEnvironmentDefinitionFromManifest({ ...manifest, formatVersion: 99 }), /formatVersion/);

    // Manifest rejects missing id
    assert.throws(() => createEnvironmentDefinitionFromManifest({ ...manifest, id: "" }), /non-empty id/);

    // Invalid zone id
    const badManifest = JSON.parse(JSON.stringify(manifest));
    badManifest.zones[0].id = "invalid-zone";
    assert.throws(() => createEnvironmentDefinitionFromManifest(badManifest), /invalid id/);

    const duplicateZoneManifest = JSON.parse(JSON.stringify(manifest));
    duplicateZoneManifest.zones[1].id = duplicateZoneManifest.zones[0].id;
    assert.throws(() => createEnvironmentDefinitionFromManifest(duplicateZoneManifest), /stable id exactly once/);

    const missingMaterialManifest = JSON.parse(JSON.stringify(manifest));
    missingMaterialManifest.zones[0].terrainMaterial = "missing-material";
    assert.throws(() => createEnvironmentDefinitionFromManifest(missingMaterialManifest), /unknown terrain material/);

    const unknownAtlasManifest = JSON.parse(JSON.stringify(manifest));
    unknownAtlasManifest.backdrop.layers[0].frames[0].atlas = "missing-atlas";
    assert.throws(() => createEnvironmentDefinitionFromManifest(unknownAtlasManifest), /unknown atlas/);

    const outOfGridManifest = JSON.parse(JSON.stringify(manifest));
    outOfGridManifest.backdrop.layers[0].frames[0].cell.column = 99;
    assert.throws(() => createEnvironmentDefinitionFromManifest(outOfGridManifest), /exceeds atlas/);

    assert.throws(() => assertEnvironmentAtlasImagePath("../outside.png"), /cannot leave/);
    assert.throws(() => assertEnvironmentAtlasImagePath("C:\\outside.png"), /relative path/);

    const invalidGeneratorManifest = JSON.parse(JSON.stringify(manifest));
    invalidGeneratorManifest.generator.unexpected = true;
    assert.throws(() => createEnvironmentDefinitionFromManifest(invalidGeneratorManifest), /unknown fields/);

    // AssetSet
    const mockImages = [];
    class MockImage {
        constructor() {
            this.listeners = {};
            mockImages.push(this);
        }
        addEventListener(type, listener) {
            this.listeners[type] = listener;
        }
    }
    const assetSet = new EnvironmentAssetSet({
        atlases: {
            "backdrop-far": { source: "/backdrop-far.png", size: { width: 48, height: 24 } },
            "backdrop-mid": { source: "/backdrop-mid.png", size: { width: 48, height: 24 } }
        },
        ImageClass: MockImage
    });
    assert.equal(assetSet.status, "pending");
    mockImages[0].naturalWidth = 48;
    mockImages[0].naturalHeight = 24;
    mockImages[0].listeners.load();
    assert.equal(assetSet.status, "pending");
    mockImages[1].naturalWidth = 48;
    mockImages[1].naturalHeight = 24;
    mockImages[1].listeners.load();
    assert.equal(assetSet.status, "ready");
    assert.ok(assetSet.isReady("backdrop-far"));
    assert.ok(assetSet.isReady("backdrop-mid"));
    assert.equal(assetSet.imageFor("backdrop-far"), mockImages[0]);

    // Asset failure
    const failedSet = new EnvironmentAssetSet({
        atlases: {
            bad: { source: "/bad.png", size: { width: 48, height: 24 } }
        },
        ImageClass: MockImage
    });
    mockImages[2].listeners.error();
    assert.equal(failedSet.status, "failed");
    assert.match(failedSet.error.message, /Failed to load environment/);

    // Unknown atlas
    assert.throws(() => assetSet.imageFor("nonexistent"), /Unknown environment atlas/);
    assert.equal(assetSet.isReady("nonexistent"), false);

    const temporaryRoot = mkdtempSync(join(tmpdir(), "baeseongjin-env-"));
    const temporaryPack = join(temporaryRoot, "pack");
    try {
        cpSync(resolve(ROOT, "assets/runtime/environments/default-mock"), temporaryPack, { recursive: true });
        const wrongSizeManifest = JSON.parse(readFileSync(resolve(temporaryPack, "sprite-manifest.json"), "utf8"));
        wrongSizeManifest.atlases["backdrop-far"].size.width = 72;
        writeFileSync(
            resolve(temporaryPack, "sprite-manifest.json"),
            `${JSON.stringify(wrongSizeManifest, null, 2)}\n`,
            "utf8"
        );
        assert.throws(() => validateEnvironmentAssetDirectory(temporaryPack), /is 48x24; expected 72x24/);
    } finally {
        const safePrefix = `${resolve(tmpdir())}${sep}`;
        if (!resolve(temporaryRoot).startsWith(safePrefix)) throw new Error("Refusing to remove unsafe temporary path");
        rmSync(temporaryRoot, { recursive: true, force: true });
    }

    // Definition rejects invalid atlas sizes
    assert.throws(
        () =>
            new EnvironmentDefinition({
                id: "test",
                atlases: {
                    bad: {
                        id: "bad",
                        source: "/bad.png",
                        size: { width: 48, height: 24 },
                        frameSize: { width: 10, height: 10 }
                    }
                },
                zones: [DEFAULT_ENVIRONMENT_DEFINITION.zones[0]],
                backdrop: DEFAULT_ENVIRONMENT_DEFINITION.backdrop,
                terrain: DEFAULT_ENVIRONMENT_DEFINITION.terrain,
                decoration: DEFAULT_ENVIRONMENT_DEFINITION.decoration
            }),
        /divisible by frameSize/
    );
}
