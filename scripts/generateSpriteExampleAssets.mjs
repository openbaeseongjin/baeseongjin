import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { deflateSync } from "node:zlib";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT_DIRECTORY = resolve(ROOT, "assets/runtime/characters/fixtures/player-multi-atlas");

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

function spritePng(columns, rows, colors) {
    const width = columns * 24;
    const height = rows * 24;
    const raw = Buffer.alloc((width * 4 + 1) * height);
    for (let y = 0; y < height; y += 1) {
        const rowStart = y * (width * 4 + 1);
        for (let x = 0; x < width; x += 1) {
            const column = Math.floor(x / 24);
            const row = Math.floor(y / 24);
            const color = colors[row * columns + column];
            const localX = x % 24;
            const localY = y % 24;
            const visible = localX >= 6 && localX < 18 && localY >= 3 && localY < 21;
            const pixel = rowStart + 1 + x * 4;
            if (visible && color) {
                raw[pixel] = color[0];
                raw[pixel + 1] = color[1];
                raw[pixel + 2] = color[2];
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

export function generateSpriteExampleAssets() {
    writeFileSync(
        resolve(OUTPUT_DIRECTORY, "locomotion.png"),
        spritePng(4, 2, [
            [34, 211, 238],
            [103, 232, 249],
            [14, 165, 233],
            [56, 189, 248],
            [167, 139, 250],
            [196, 181, 253],
            [45, 212, 191],
            [94, 234, 212]
        ])
    );
    writeFileSync(
        resolve(OUTPUT_DIRECTORY, "actions.png"),
        spritePng(4, 1, [
            [251, 113, 133],
            [253, 164, 175],
            [250, 204, 21],
            [254, 240, 138]
        ])
    );
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
    generateSpriteExampleAssets();
    console.log(`Generated sprite example PNGs in ${OUTPUT_DIRECTORY}`);
}
