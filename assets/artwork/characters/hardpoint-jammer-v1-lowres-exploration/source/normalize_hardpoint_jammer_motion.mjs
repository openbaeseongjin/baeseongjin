import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const SOURCE_COLUMNS = 4;
const SOURCE_ROWS = 4;
const FRAME_SIZE = 32;
const RUNTIME_ROWS = 5;
const PREVIEW_SCALE = 8;
const DISABLED_BRIGHTNESS = 0.42;
const DISABLED_SATURATION = 0.3;
const FRAME_TOP_BY_SOURCE_ROW = Object.freeze([
    Object.freeze([1, 0, 1, 2]),
    Object.freeze([1, 1, 1, 1]),
    Object.freeze([1, 1, 1, 1]),
    Object.freeze([1, 1, 1, 1])
]);

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const sourcePath = path.join(scriptDirectory, "hardpoint-jammer-motion-imagegen.png");
const authoringRoot = path.dirname(scriptDirectory);
const exportDirectory = path.join(authoringRoot, "export");
const previewDirectory = path.join(authoringRoot, "preview");
const atlasPath = path.join(exportDirectory, "hardpoint-jammer-motion.png");
const previewPath = path.join(previewDirectory, "hardpoint-jammer-motion-atlas-8x.png");

await Promise.all([mkdir(exportDirectory, { recursive: true }), mkdir(previewDirectory, { recursive: true })]);

const metadata = await sharp(sourcePath).metadata();
if (!metadata.width || !metadata.height) throw new Error("Hardpoint Jammer source dimensions are unavailable");
if (metadata.width % SOURCE_COLUMNS !== 0 || metadata.height % SOURCE_ROWS !== 0)
    throw new Error(`Hardpoint Jammer source must be a ${SOURCE_COLUMNS}x${SOURCE_ROWS} uniform sheet`);

const sourceCellWidth = metadata.width / SOURCE_COLUMNS;
const sourceCellHeight = metadata.height / SOURCE_ROWS;

async function normalizedSourceFrame(column, row) {
    const top = FRAME_TOP_BY_SOURCE_ROW[row][column];
    const extractedFrame = await sharp(sourcePath)
        .extract({
            left: column * sourceCellWidth,
            top: row * sourceCellHeight,
            width: sourceCellWidth,
            height: sourceCellHeight
        })
        .png()
        .toBuffer();
    return sharp(extractedFrame)
        .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .resize(FRAME_SIZE - 2, FRAME_SIZE - 4, {
            fit: "contain",
            background: { r: 0, g: 0, b: 0, alpha: 0 },
            kernel: sharp.kernel.nearest
        })
        .extend({
            top,
            bottom: FRAME_SIZE - (FRAME_SIZE - 4) - top,
            left: 1,
            right: 1,
            background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .ensureAlpha()
        .png()
        .toBuffer();
}

async function disabledFrame(column) {
    const normalFrame = await normalizedSourceFrame(column, 0);
    return sharp(normalFrame)
        .modulate({ brightness: DISABLED_BRIGHTNESS, saturation: DISABLED_SATURATION })
        .png()
        .toBuffer();
}

const frames = [];
for (let row = 0; row < SOURCE_ROWS; row += 1) {
    for (let column = 0; column < SOURCE_COLUMNS; column += 1) {
        frames.push({
            input: await normalizedSourceFrame(column, row),
            left: column * FRAME_SIZE,
            top: row * FRAME_SIZE
        });
    }
}
for (let column = 0; column < SOURCE_COLUMNS; column += 1) {
    frames.push({
        input: await disabledFrame(column),
        left: column * FRAME_SIZE,
        top: (RUNTIME_ROWS - 1) * FRAME_SIZE
    });
}

await sharp({
    create: {
        width: SOURCE_COLUMNS * FRAME_SIZE,
        height: RUNTIME_ROWS * FRAME_SIZE,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
})
    .composite(frames)
    .png()
    .toFile(atlasPath);

await sharp(atlasPath)
    .resize(SOURCE_COLUMNS * FRAME_SIZE * PREVIEW_SCALE, RUNTIME_ROWS * FRAME_SIZE * PREVIEW_SCALE, {
        kernel: sharp.kernel.nearest
    })
    .png()
    .toFile(previewPath);

console.log(`Wrote ${atlasPath}`);
console.log(`Wrote ${previewPath}`);
