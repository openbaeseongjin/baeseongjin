import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PixelBackdropRenderer } from "../src/render/environment/renderers/PixelBackdropRenderer.js";

const ROOT = resolve(fileURLToPath(import.meta.url), "../..");
const SECTOR_02_PACKAGE = resolve(ROOT, "assets/runtime/environments/sector-02-worker-district");
const SECTOR_03_PACKAGE = resolve(ROOT, "assets/runtime/environments/sector-03-central-exchange");
const SECTOR_04_PACKAGE = resolve(ROOT, "assets/runtime/environments/sector-04-upper-residential");

const APPROVED_SECTOR_02_HASHES = Object.freeze({
    "backdrop-fixed.png": "BE03573C6EC6CCCCEDBC6BA8F434CD05870B6CA0FF9B7F4DD16A8868074803BB",
    "parallax-island-left.png": "C443FE401498CA73C45136D7306ECAF8CF73471F6F5EC53CF605C9DEFA01C6FD",
    "parallax-island-right.png": "0C782C496CEAD7BF771AD8482A17BE661E810BB02E0003EA3358B6A1D2C2FC09"
});

const APPROVED_SECTOR_04_HASHES = Object.freeze({
    "backdrop-far.png": "5DC63879639D8F73D33A34E1ACFB53930AF711E05B6E5109CE0B4B4D575D83B9",
    "backdrop-mid.png": "F2E3715A64C6D7E60E9C5B5AFAD87127ADDB65E84361447323F44337A2B5D864",
    "backdrop-near.png": "6C35E0F6E1B0A8513F400112437C05670A48101E44469CE7D7902D704E6F2C6B"
});

const PALETTE = Object.freeze({
    skyTop: "#17162c",
    skyBottom: "#090a16",
    silhouetteFar: "#25284a",
    silhouetteMid: "#303252",
    silhouetteNear: "#0b0d18",
    terrainFill: "#282838",
    terrainEdge: "#5b5d78",
    oneWayEdge: "#82d7e8",
    accent: "#c084fc"
});

function fileHash(path) {
    return createHash("sha256").update(readFileSync(path)).digest("hex").toUpperCase();
}

function pngHeader(path) {
    const data = readFileSync(path);
    assert.deepEqual([...data.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], `${path} is not PNG`);
    return {
        width: data.readUInt32BE(16),
        height: data.readUInt32BE(20),
        bitDepth: data[24],
        colorType: data[25]
    };
}

function packageDefinition(prefix) {
    const layers = ["far", "mid", "near"].map((suffix, index) => ({
        id: `${prefix}-${suffix}`,
        depth: index,
        parallaxX: [0.018, 0.05, 0.08][index],
        parallaxY: [0.03, 0.065, 0.1][index],
        frames: [
            {
                atlasId: `${prefix}-${suffix}`,
                x: 0,
                y: 0,
                width: 1024,
                height: 1536
            }
        ]
    }));
    return Object.freeze({ backdrop: Object.freeze({ layers: Object.freeze(layers) }) });
}

function baseDefinition() {
    const zone = Object.freeze({ minAltitude: 0, palette: PALETTE });
    return Object.freeze({
        zones: Object.freeze([zone]),
        backdrop: Object.freeze({ layers: Object.freeze([]) }),
        zoneAt: () => zone
    });
}

function recordingContext() {
    const draws = [];
    const stack = [];
    return {
        draws,
        globalAlpha: 1,
        imageSmoothingEnabled: true,
        save() {
            stack.push({ globalAlpha: this.globalAlpha, imageSmoothingEnabled: this.imageSmoothingEnabled });
        },
        restore() {
            Object.assign(this, stack.pop());
        },
        createLinearGradient() {
            return { addColorStop() {} };
        },
        fillRect() {},
        drawImage(image) {
            draws.push({ image, alpha: this.globalAlpha, smoothing: this.imageSmoothingEnabled });
        }
    };
}

function sectorId(sectorNumber) {
    return `sector-${String(sectorNumber).padStart(2, "0")}`;
}

function sceneAt(playerY, fromSectorNumber = 2, toSectorNumber = 3, bossStage = null) {
    const fromSectorId = sectorId(fromSectorNumber);
    const toSectorId = sectorId(toSectorNumber);
    const fromSector = Object.freeze({
        id: `${fromSectorId}:landmark:08`,
        areaId: `${fromSectorId}-08`,
        legacyAreaId: `${fromSectorId}-08`,
        sectorId: fromSectorId,
        order: 8,
        bounds: Object.freeze({ x: -500, y: 0, width: 1000, height: 1000 }),
        entry: Object.freeze({ x: 0, y: 1000 }),
        exit: Object.freeze({ x: 0, y: 0 })
    });
    const toSector = Object.freeze({
        id: `${toSectorId}:landmark:01`,
        areaId: `${toSectorId}-01`,
        legacyAreaId: `${toSectorId}-01`,
        sectorId: toSectorId,
        order: 1,
        bounds: Object.freeze({ x: -500, y: -1000, width: 1000, height: 1000 }),
        entry: Object.freeze({ x: 0, y: 0 }),
        exit: Object.freeze({ x: 0, y: -1000 })
    });
    return Object.freeze({
        camera: Object.freeze({ x: 0, y: playerY }),
        player: Object.freeze({ position: Object.freeze({ x: 0, y: playerY }) }),
        world: Object.freeze({ landmarks: Object.freeze([fromSector, toSector]) }),
        ...(bossStage ? { bossStage: Object.freeze(bossStage) } : {})
    });
}

function drawAt(playerY, fromSectorNumber = 2, toSectorNumber = 3, bossStage = null) {
    const context = recordingContext();
    const fromSectorId = sectorId(fromSectorNumber);
    const toSectorId = sectorId(toSectorNumber);
    const definitions = Object.freeze({
        [`${fromSectorId}-08`]: packageDefinition(fromSectorId),
        [`${toSectorId}-01`]: packageDefinition(toSectorId)
    });
    const renderer = new PixelBackdropRenderer({
        definition: baseDefinition(),
        assets: Object.freeze({ imageFor: (atlasId) => atlasId }),
        authoredAreaEnvironmentDefinitions: definitions
    });
    renderer.draw({
        context,
        scene: sceneAt(playerY, fromSectorNumber, toSectorNumber, bossStage),
        viewport: Object.freeze({ cssWidth: 1280, cssHeight: 720 })
    });
    return context.draws;
}

function packageAlphas(draws, prefix) {
    return draws.filter(({ image }) => image.startsWith(prefix)).map(({ alpha }) => alpha);
}

for (const [name, expectedHash] of Object.entries(APPROVED_SECTOR_02_HASHES)) {
    assert.equal(fileHash(resolve(SECTOR_02_PACKAGE, name)), expectedHash, `Sector 02 changed: ${name}`);
}

for (const [name, expectedHash] of Object.entries(APPROVED_SECTOR_04_HASHES)) {
    assert.equal(fileHash(resolve(SECTOR_04_PACKAGE, name)), expectedHash, `Sector 04 changed: ${name}`);
}

const sector03Manifest = JSON.parse(readFileSync(resolve(SECTOR_03_PACKAGE, "sprite-manifest.json"), "utf8"));
assert.equal(sector03Manifest.generator.exportVersion, "2026-08-22-v8-depth-fmn");
assert.deepEqual(
    sector03Manifest.backdrop.layers.map(({ id }) => id),
    ["far-background", "mid-structure", "near-frame"]
);
assert.equal(
    JSON.stringify(sector03Manifest).includes("depth-map"),
    false,
    "runtime manifest must not load depth data"
);

assert.deepEqual(pngHeader(resolve(SECTOR_03_PACKAGE, "backdrop-v8-far.png")), {
    width: 1024,
    height: 1536,
    bitDepth: 8,
    colorType: 2
});
for (const name of ["backdrop-v8-mid.png", "backdrop-v8-near.png"]) {
    assert.deepEqual(pngHeader(resolve(SECTOR_03_PACKAGE, name)), {
        width: 1024,
        height: 1536,
        bitDepth: 8,
        colorType: 6
    });
}

const sector04Manifest = JSON.parse(readFileSync(resolve(SECTOR_04_PACKAGE, "sprite-manifest.json"), "utf8"));
assert.equal(sector04Manifest.generator.exportVersion, "2026-08-23-v3-open-ascent-fmn");
assert.deepEqual(
    sector04Manifest.backdrop.layers.map(({ id }) => id),
    ["far-background", "mid-structure", "near-frame"]
);
assert.equal(
    JSON.stringify(sector04Manifest).includes("depth-map"),
    false,
    "runtime manifest must not load depth data"
);
assert.deepEqual(pngHeader(resolve(SECTOR_04_PACKAGE, "backdrop-far.png")), {
    width: 1024,
    height: 1536,
    bitDepth: 8,
    colorType: 2
});
for (const name of ["backdrop-mid.png", "backdrop-near.png"]) {
    assert.deepEqual(pngHeader(resolve(SECTOR_04_PACKAGE, name)), {
        width: 1024,
        height: 1536,
        bitDepth: 8,
        colorType: 6
    });
}

const center = drawAt(0);
assert.deepEqual(packageAlphas(center, "sector-02"), [0.5, 0.5, 0.5]);
assert.deepEqual(packageAlphas(center, "sector-03"), [0.5, 0.5, 0.5]);
assert.ok(
    center.every(({ smoothing }) => smoothing === false),
    "all backdrop layers use nearest sampling"
);

const sector02Side = drawAt(512);
assert.deepEqual(packageAlphas(sector02Side, "sector-02"), [1, 1, 1]);
assert.deepEqual(packageAlphas(sector02Side, "sector-03"), []);

const sector03Side = drawAt(-512);
assert.deepEqual(packageAlphas(sector03Side, "sector-02"), []);
assert.deepEqual(packageAlphas(sector03Side, "sector-03"), [1, 1, 1]);

const below = drawAt(256);
const above = drawAt(-256);
assert.deepEqual(packageAlphas(below, "sector-02"), [0.84375, 0.84375, 0.84375]);
assert.deepEqual(packageAlphas(below, "sector-03"), [0.15625, 0.15625, 0.15625]);
assert.deepEqual(packageAlphas(above, "sector-02"), [0.15625, 0.15625, 0.15625]);
assert.deepEqual(packageAlphas(above, "sector-03"), [0.84375, 0.84375, 0.84375]);

const sector04Center = drawAt(0, 3, 4);
assert.deepEqual(packageAlphas(sector04Center, "sector-03"), [0.5, 0.5, 0.5]);
assert.deepEqual(packageAlphas(sector04Center, "sector-04"), [0.5, 0.5, 0.5]);
assert.ok(sector04Center.every(({ smoothing }) => smoothing === false));

const sector03BoundarySide = drawAt(512, 3, 4);
assert.deepEqual(packageAlphas(sector03BoundarySide, "sector-03"), [1, 1, 1]);
assert.deepEqual(packageAlphas(sector03BoundarySide, "sector-04"), []);

const sector04BoundarySide = drawAt(-512, 3, 4);
assert.deepEqual(packageAlphas(sector04BoundarySide, "sector-03"), []);
assert.deepEqual(packageAlphas(sector04BoundarySide, "sector-04"), [1, 1, 1]);

const inactiveBossDoesNotOverrideSector04 = drawAt(-512, 3, 4, {
    status: "inactive",
    environmentAreaId: "sector-03-08"
});
assert.deepEqual(packageAlphas(inactiveBossDoesNotOverrideSector04, "sector-03"), []);
assert.deepEqual(packageAlphas(inactiveBossDoesNotOverrideSector04, "sector-04"), [1, 1, 1]);

const activeBossKeepsItsAuthoredEnvironment = drawAt(-512, 3, 4, {
    status: "active",
    environmentAreaId: "sector-03-08"
});
assert.deepEqual(packageAlphas(activeBossKeepsItsAuthoredEnvironment, "sector-03"), [1, 1, 1]);
assert.deepEqual(packageAlphas(activeBossKeepsItsAuthoredEnvironment, "sector-04"), []);

const sector03Quarter = drawAt(256, 3, 4);
const sector04Quarter = drawAt(-256, 3, 4);
assert.deepEqual(packageAlphas(sector03Quarter, "sector-03"), [0.84375, 0.84375, 0.84375]);
assert.deepEqual(packageAlphas(sector03Quarter, "sector-04"), [0.15625, 0.15625, 0.15625]);
assert.deepEqual(packageAlphas(sector04Quarter, "sector-03"), [0.15625, 0.15625, 0.15625]);
assert.deepEqual(packageAlphas(sector04Quarter, "sector-04"), [0.84375, 0.84375, 0.84375]);

console.log("Sector 03 and Sector 04 far/mid/near Runtime transition focused test passed");
