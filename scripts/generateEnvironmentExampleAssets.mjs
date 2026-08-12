import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { deflateSync } from "node:zlib";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT_DIRECTORY = resolve(ROOT, "assets/environment/examples/default");

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

function shifted(color, amount) {
    return color.map((channel) => Math.max(0, Math.min(255, channel + amount)));
}

function backdropPixel(color, frameIndex, x, y) {
    const profiles = [
        [15, 15, 8, 8, 12, 12, 5, 5, 13, 13, 9, 9],
        [12, 12, 12, 5, 5, 10, 10, 7, 7, 7, 14, 14]
    ];
    const roof = profiles[frameIndex % profiles.length][Math.floor(x / 2)];
    const antennaX = frameIndex % 2 === 0 ? 7 : 17;
    if (x === antennaX && y >= roof - 4 && y < roof) return shifted(color, 12);
    if (y < roof || x % 6 === 5) return null;
    const sparseWindow = y > roof + 2 && (x + frameIndex * 2) % 6 === 2 && (y + frameIndex) % 7 === 0;
    return sparseWindow ? shifted(color, 24) : color;
}

function terrainPixel(color, frameIndex, x, y) {
    if ((x * 7 + y * 11 + frameIndex * 13) % 47 === 0) return shifted(color, 18);
    if ((x + frameIndex * 3) % 12 === 0 && y % 9 > 5) return shifted(color, -14);
    return color;
}

function edgePixel(color, frameIndex, x, y) {
    const seam = (x + frameIndex * 5) % 8 === 0;
    return shifted(color, seam || y < 3 ? 14 : -8);
}

function decorationPixel(color, frameIndex, x, y) {
    if (frameIndex === 0) {
        if ((x >= 8 && x <= 15 && y >= 5 && y <= 9) || (x >= 11 && x <= 12 && y >= 9 && y <= 22)) return color;
    } else if (frameIndex === 1) {
        if ((y >= 8 && y <= 15 && (x === 7 || x === 16)) || (x >= 8 && x <= 15 && (y === 7 || y === 16))) return color;
        if (x >= 10 && x <= 13 && y >= 10 && y <= 13) return shifted(color, 28);
    } else if (frameIndex === 2) {
        if ((x === 11 || x === 12) && y >= 5 && y <= 22) return color;
        if (y === 8 && x >= 7 && x <= 16) return color;
        if ((x === 8 || x === 15) && y >= 9 && y <= 12) return shifted(color, 22);
    } else if (frameIndex === 3) {
        if (x >= 7 && x <= 16 && y >= 12 && y <= 15) return color;
        if (x >= 10 && x <= 13 && y >= 7 && y <= 11) return shifted(color, 30);
        if ((x === 8 || x === 15) && y >= 16 && y <= 20) return color;
    }
    return null;
}

function pixelFor(kind, color, frameIndex, x, y) {
    if (kind === "backdrop") return backdropPixel(color, frameIndex, x, y);
    if (kind === "terrain") return terrainPixel(color, frameIndex, x, y);
    if (kind === "edge") return edgePixel(color, frameIndex, x, y);
    if (kind === "decoration") return decorationPixel(color, frameIndex, x, y);
    return color;
}

function envPng(columns, rows, colors, kind) {
    const width = columns * 24;
    const height = rows * 24;
    const raw = Buffer.alloc((width * 4 + 1) * height);
    for (let y = 0; y < height; y += 1) {
        const rowStart = y * (width * 4 + 1);
        for (let x = 0; x < width; x += 1) {
            const col = Math.floor(x / 24);
            const row = Math.floor(y / 24);
            const color = colors[row * columns + col];
            const localX = x % 24;
            const localY = y % 24;
            const pixelColor = color ? pixelFor(kind, color, row * columns + col, localX, localY) : null;
            const pixel = rowStart + 1 + x * 4;
            if (pixelColor) {
                raw[pixel] = pixelColor[0];
                raw[pixel + 1] = pixelColor[1];
                raw[pixel + 2] = pixelColor[2];
                raw[pixel + 3] = 255;
            }
        }
    }
    const header = Buffer.alloc(13);
    header.writeUInt32BE(width, 0);
    header.writeUInt32BE(height, 4);
    header[8] = 8;
    header[9] = 6;
    return Buffer.concat([
        Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
        chunk("IHDR", header),
        chunk("IDAT", deflateSync(raw)),
        chunk("IEND", Buffer.alloc(0))
    ]);
}

export function generateEnvironmentExampleAssets() {
    writeFileSync(
        resolve(OUTPUT_DIRECTORY, "backdrop-far.png"),
        envPng(
            2,
            1,
            [
                [30, 36, 48],
                [40, 48, 58]
            ],
            "backdrop"
        )
    );
    writeFileSync(
        resolve(OUTPUT_DIRECTORY, "backdrop-mid.png"),
        envPng(
            2,
            1,
            [
                [36, 42, 52],
                [46, 52, 62]
            ],
            "backdrop"
        )
    );
    writeFileSync(
        resolve(OUTPUT_DIRECTORY, "backdrop-near.png"),
        envPng(
            2,
            1,
            [
                [42, 46, 54],
                [52, 56, 64]
            ],
            "backdrop"
        )
    );
    writeFileSync(
        resolve(OUTPUT_DIRECTORY, "terrain-fill.png"),
        envPng(
            2,
            2,
            [
                [74, 69, 64],
                [80, 76, 68],
                [88, 80, 72],
                [96, 90, 80]
            ],
            "terrain"
        )
    );
    writeFileSync(
        resolve(OUTPUT_DIRECTORY, "terrain-edge.png"),
        envPng(
            2,
            1,
            [
                [110, 104, 96],
                [120, 112, 104]
            ],
            "edge"
        )
    );
    writeFileSync(
        resolve(OUTPUT_DIRECTORY, "decoration.png"),
        envPng(
            4,
            1,
            [
                [251, 146, 60],
                [96, 165, 250],
                [167, 139, 250],
                [52, 211, 153]
            ],
            "decoration"
        )
    );
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
    generateEnvironmentExampleAssets();
    console.log(`Generated environment example PNGs in ${OUTPUT_DIRECTORY}`);
}
