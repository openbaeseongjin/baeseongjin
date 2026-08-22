import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PixelBackdropRenderer } from "../src/render/environment/renderers/PixelBackdropRenderer.js";

const ROOT = resolve(fileURLToPath(import.meta.url), "../..");
const SECTOR_02_PACKAGE = resolve(ROOT, "assets/runtime/environments/sector-02-worker-district");
const SECTOR_03_PACKAGE = resolve(ROOT, "assets/runtime/environments/sector-03-central-exchange");

const APPROVED_SECTOR_02_HASHES = Object.freeze({
    "backdrop-fixed.png": "BE03573C6EC6CCCCEDBC6BA8F434CD05870B6CA0FF9B7F4DD16A8868074803BB",
    "parallax-island-left.png": "C443FE401498CA73C45136D7306ECAF8CF73471F6F5EC53CF605C9DEFA01C6FD",
    "parallax-island-right.png": "0C782C496CEAD7BF771AD8482A17BE661E810BB02E0003EA3358B6A1D2C2FC09"
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
    const layers = ["fixed", "left", "right"].map((suffix, index) => ({
        id: `${prefix}-${suffix}`,
        depth: index,
        parallaxX: index === 0 ? 0.018 : 0.08,
        parallaxY: index === 0 ? 0.03 : 0.1,
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

function sceneAt(playerY) {
    const sector02 = Object.freeze({
        id: "sector-02:landmark:08",
        legacyAreaId: "sector-02-08",
        sectorId: "sector-02",
        order: 8,
        bounds: Object.freeze({ x: -500, y: 0, width: 1000, height: 1000 }),
        entry: Object.freeze({ x: 0, y: 1000 }),
        exit: Object.freeze({ x: 0, y: 0 })
    });
    const sector03 = Object.freeze({
        id: "sector-03:landmark:01",
        legacyAreaId: "sector-03-01",
        sectorId: "sector-03",
        order: 1,
        bounds: Object.freeze({ x: -500, y: -1000, width: 1000, height: 1000 }),
        entry: Object.freeze({ x: 0, y: 0 }),
        exit: Object.freeze({ x: 0, y: -1000 })
    });
    return Object.freeze({
        camera: Object.freeze({ x: 0, y: playerY }),
        player: Object.freeze({ position: Object.freeze({ x: 0, y: playerY }) }),
        world: Object.freeze({ landmarks: Object.freeze([sector02, sector03]) })
    });
}

function drawAt(playerY) {
    const context = recordingContext();
    const definitions = Object.freeze({
        "sector-02-08": packageDefinition("sector02"),
        "sector-03-01": packageDefinition("sector03")
    });
    const renderer = new PixelBackdropRenderer({
        definition: baseDefinition(),
        assets: Object.freeze({ imageFor: (atlasId) => atlasId }),
        authoredAreaEnvironmentDefinitions: definitions
    });
    renderer.draw({
        context,
        scene: sceneAt(playerY),
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

const sector03Manifest = JSON.parse(readFileSync(resolve(SECTOR_03_PACKAGE, "sprite-manifest.json"), "utf8"));
assert.equal(sector03Manifest.generator.exportVersion, "2026-08-22-v4");
assert.deepEqual(
    sector03Manifest.backdrop.layers.map(({ id }) => id),
    ["fixed-background", "near-island-left", "near-island-right"]
);
assert.equal(JSON.stringify(sector03Manifest).includes("depth-map"), false, "runtime manifest must not load depth data");

assert.deepEqual(pngHeader(resolve(SECTOR_03_PACKAGE, "backdrop-fixed.png")), {
    width: 1024,
    height: 1536,
    bitDepth: 8,
    colorType: 2
});
for (const name of ["parallax-island-left.png", "parallax-island-right.png"]) {
    assert.deepEqual(pngHeader(resolve(SECTOR_03_PACKAGE, name)), {
        width: 1024,
        height: 1536,
        bitDepth: 8,
        colorType: 6
    });
}

const center = drawAt(0);
assert.deepEqual(packageAlphas(center, "sector02"), [0.5, 0.5, 0.5]);
assert.deepEqual(packageAlphas(center, "sector03"), [0.5, 0.5, 0.5]);
assert.ok(center.every(({ smoothing }) => smoothing === false), "all backdrop layers use nearest sampling");

const sector02Side = drawAt(512);
assert.deepEqual(packageAlphas(sector02Side, "sector02"), [1, 1, 1]);
assert.deepEqual(packageAlphas(sector02Side, "sector03"), []);

const sector03Side = drawAt(-512);
assert.deepEqual(packageAlphas(sector03Side, "sector02"), []);
assert.deepEqual(packageAlphas(sector03Side, "sector03"), [1, 1, 1]);

const below = drawAt(256);
const above = drawAt(-256);
assert.deepEqual(packageAlphas(below, "sector02"), [0.84375, 0.84375, 0.84375]);
assert.deepEqual(packageAlphas(below, "sector03"), [0.15625, 0.15625, 0.15625]);
assert.deepEqual(packageAlphas(above, "sector02"), [0.15625, 0.15625, 0.15625]);
assert.deepEqual(packageAlphas(above, "sector03"), [0.84375, 0.84375, 0.84375]);

console.log("Sector 03 V4 Runtime transition focused test passed");
