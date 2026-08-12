import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { deflateSync } from "node:zlib";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_PATH = resolve(ROOT, "assets/sprites/player-action-mock.svg");
const OUTPUT_DIRECTORY = resolve(ROOT, "assets/sprites/player-production-template");
const FRAME_SIZE = 24;

const LOCOMOTION_FRAMES = Object.freeze(["idle-0", "idle-1", "run-0", "run-1", "jump", "fall", "rope-0", "rope-1"]);
const ACTION_FRAMES = Object.freeze(["hit-0", "hit-1", "respawn-0", "respawn-1", "respawn-2"]);

const FONT = Object.freeze({
    "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
    0: ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
    1: ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
    2: ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
    A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
    C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
    D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
    E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
    F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
    H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
    I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
    J: ["00111", "00010", "00010", "00010", "10010", "10010", "01100"],
    L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
    M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
    N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
    O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
    P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
    R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
    S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
    T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
    U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
    W: ["10001", "10001", "10001", "10101", "10101", "10101", "01010"]
});

function crc32(buffer) {
    let crc = 0xffffffff;
    for (const byte of buffer) {
        crc ^= byte;
        for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
    return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
    const typeBuffer = Buffer.from(type, "ascii");
    const result = Buffer.alloc(data.length + 12);
    result.writeUInt32BE(data.length, 0);
    typeBuffer.copy(result, 4);
    data.copy(result, 8);
    result.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), data.length + 8);
    return result;
}

function encodePng(image) {
    const stride = image.width * 4;
    const raw = Buffer.alloc((stride + 1) * image.height);
    for (let row = 0; row < image.height; row += 1) {
        image.pixels.copy(raw, row * (stride + 1) + 1, row * stride, (row + 1) * stride);
    }
    const header = Buffer.alloc(13);
    header.writeUInt32BE(image.width, 0);
    header.writeUInt32BE(image.height, 4);
    header[8] = 8;
    header[9] = 6;
    return Buffer.concat([
        Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
        chunk("IHDR", header),
        chunk("IDAT", deflateSync(raw)),
        chunk("IEND", Buffer.alloc(0))
    ]);
}

function createImage(width, height, color = [0, 0, 0, 0]) {
    const pixels = Buffer.alloc(width * height * 4);
    for (let pixel = 0; pixel < width * height; pixel += 1) pixels.set(color, pixel * 4);
    return { width, height, pixels };
}

function setPixel(image, x, y, color) {
    if (x < 0 || y < 0 || x >= image.width || y >= image.height) return;
    image.pixels.set(color, (y * image.width + x) * 4);
}

function fillRect(image, x, y, width, height, color) {
    for (let row = y; row < y + height; row += 1) {
        for (let column = x; column < x + width; column += 1) setPixel(image, column, row, color);
    }
}

function colorFromHex(value) {
    return [
        Number.parseInt(value.slice(1, 3), 16),
        Number.parseInt(value.slice(3, 5), 16),
        Number.parseInt(value.slice(5, 7), 16),
        255
    ];
}

function readSourceFrames() {
    const source = readFileSync(SOURCE_PATH, "utf8");
    const frames = new Map();
    const groupPattern = /<g id="([^"]+)"(?: transform="translate\(\d+ \d+\)")?>([\s\S]*?)<\/g>/g;
    for (const group of source.matchAll(groupPattern)) {
        const rectangles = [];
        const rectanglePattern = /<rect x="(\d+)" y="(\d+)" width="(\d+)" height="(\d+)" fill="(#[0-9a-fA-F]{6})"\/>/g;
        for (const rectangle of group[2].matchAll(rectanglePattern)) {
            rectangles.push({
                x: Number(rectangle[1]),
                y: Number(rectangle[2]),
                width: Number(rectangle[3]),
                height: Number(rectangle[4]),
                color: colorFromHex(rectangle[5])
            });
        }
        if (!rectangles.length) throw new Error(`Source frame '${group[1]}' has no rectangles`);
        frames.set(group[1], Object.freeze(rectangles));
    }
    const requiredFrames = [...LOCOMOTION_FRAMES, ...ACTION_FRAMES];
    const missingFrames = requiredFrames.filter((id) => !frames.has(id));
    if (missingFrames.length || frames.size !== requiredFrames.length) {
        throw new Error(`Source frame map changed; missing: ${missingFrames.join(", ") || "none"}`);
    }
    return frames;
}

function drawFrame(image, frame, x, y, scale = 1) {
    for (const rectangle of frame) {
        fillRect(
            image,
            x + rectangle.x * scale,
            y + rectangle.y * scale,
            rectangle.width * scale,
            rectangle.height * scale,
            rectangle.color
        );
    }
}

function atlasFor(frameIds, columns, rows, frames) {
    const image = createImage(columns * FRAME_SIZE, rows * FRAME_SIZE);
    frameIds.forEach((id, index) => {
        drawFrame(image, frames.get(id), (index % columns) * FRAME_SIZE, Math.floor(index / columns) * FRAME_SIZE);
    });
    return image;
}

function drawText(image, value, x, y, color, scale = 2) {
    let cursor = x;
    for (const character of value.toUpperCase()) {
        if (character === " ") {
            cursor += 4 * scale;
            continue;
        }
        const glyph = FONT[character];
        if (!glyph) throw new Error(`Frame-map font does not support '${character}'`);
        glyph.forEach((row, rowIndex) => {
            [...row].forEach((pixel, columnIndex) => {
                if (pixel === "1")
                    fillRect(image, cursor + columnIndex * scale, y + rowIndex * scale, scale, scale, color);
            });
        });
        cursor += 6 * scale;
    }
}

function textWidth(value, scale = 2) {
    return Math.max(0, value.length * 6 * scale - scale);
}

function drawFrameMapSection(image, { title, frameIds, columns, top, frames }) {
    const tileWidth = 112;
    const previewSize = 72;
    const previewOffset = 20;
    drawText(image, title, 8, top, [165, 243, 252, 255], 2);
    const tilesTop = top + 22;
    frameIds.forEach((id, index) => {
        const tileX = (index % columns) * tileWidth;
        const tileY = tilesTop + Math.floor(index / columns) * 98;
        fillRect(image, tileX + 4, tileY, 104, 92, [30, 41, 59, 255]);
        for (let y = 0; y < previewSize; y += 6) {
            for (let x = 0; x < previewSize; x += 6) {
                const checker = (x / 6 + y / 6) % 2 ? [71, 85, 105, 255] : [100, 116, 139, 255];
                fillRect(image, tileX + previewOffset + x, tileY + 4 + y, 6, 6, checker);
            }
        }
        drawFrame(image, frames.get(id), tileX + previewOffset, tileY + 4, 3);
        const labelX = tileX + Math.floor((tileWidth - textWidth(id, 2)) / 2);
        drawText(image, id, labelX, tileY + 78, [241, 245, 249, 255], 2);
    });
}

function createFrameMap(frames) {
    const image = createImage(560, 346, [15, 23, 42, 255]);
    drawFrameMapSection(image, {
        title: "LOCOMOTION",
        frameIds: LOCOMOTION_FRAMES,
        columns: 4,
        top: 8,
        frames
    });
    drawFrameMapSection(image, {
        title: "ACTIONS",
        frameIds: ACTION_FRAMES,
        columns: 5,
        top: 226,
        frames
    });
    return image;
}

export function generatePlayerProductionTemplate() {
    const frames = readSourceFrames();
    mkdirSync(OUTPUT_DIRECTORY, { recursive: true });
    writeFileSync(resolve(OUTPUT_DIRECTORY, "locomotion.png"), encodePng(atlasFor(LOCOMOTION_FRAMES, 4, 2, frames)));
    writeFileSync(resolve(OUTPUT_DIRECTORY, "actions.png"), encodePng(atlasFor(ACTION_FRAMES, 5, 1, frames)));
    writeFileSync(resolve(OUTPUT_DIRECTORY, "frame-map.png"), encodePng(createFrameMap(frames)));
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
    generatePlayerProductionTemplate();
    console.log(`Generated player production template PNGs in ${OUTPUT_DIRECTORY}`);
}
