const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");

const WIDTH = 64;
const HEIGHT = 64;
const PREVIEW_SCALE = 8;
const root = path.resolve(__dirname, "..");
const spritePath = path.join(root, "export", "exit-gate-universal-64x64.png");
const previewPath = path.join(root, "preview", "exit-gate-universal-64x64-review.png");
const openedSpritePath = path.join(root, "export", "exit-gate-universal-opened-64x64.png");
const openedPreviewPath = path.join(root, "preview", "exit-gate-universal-opened-64x64-review.png");
const statePreviewPath = path.join(root, "preview", "exit-gate-universal-states-review.png");

const COLOR = Object.freeze({
    outline: [9, 14, 20, 255],
    recess: [15, 23, 31, 255],
    frameDark: [28, 38, 48, 255],
    frame: [47, 60, 72, 255],
    frameLight: [74, 88, 101, 255],
    door: [42, 55, 68, 255],
    doorLight: [65, 80, 94, 255],
    steel: [119, 128, 137, 255],
    amber: [231, 145, 29, 255],
    amberLight: [255, 190, 43, 255],
    cyan: [34, 210, 220, 255]
});

const rgba = Buffer.alloc(WIDTH * HEIGHT * 4);

function rect(x, y, width, height, color) {
    for (let py = y; py < y + height; py += 1) {
        for (let px = x; px < x + width; px += 1) {
            const offset = (py * WIDTH + px) * 4;
            rgba.set(color, offset);
        }
    }
}

// 52×62 bottom-standing silhouette. Large masses are authored directly at 1×.
rect(14, 2, 36, 2, COLOR.outline);
rect(11, 4, 42, 2, COLOR.outline);
rect(9, 6, 46, 3, COLOR.outline);
rect(7, 9, 50, 49, COLOR.outline);
rect(6, 57, 52, 7, COLOR.outline);

// Broad neutral frame and flat base.
rect(14, 4, 36, 2, COLOR.frameLight);
rect(11, 6, 42, 3, COLOR.frame);
rect(9, 9, 46, 48, COLOR.frameDark);
rect(8, 59, 48, 4, COLOR.frameDark);
rect(10, 59, 44, 1, COLOR.frameLight);

// Top service header.
rect(11, 9, 42, 7, COLOR.recess);
rect(13, 10, 38, 2, COLOR.frame);
rect(24, 11, 16, 4, COLOR.outline);
rect(26, 12, 12, 2, COLOR.amber);
rect(28, 12, 8, 1, COLOR.amberLight);
rect(17, 11, 3, 3, COLOR.outline);
rect(18, 12, 1, 1, COLOR.cyan);
rect(44, 11, 3, 3, COLOR.outline);
rect(45, 12, 1, 1, COLOR.cyan);

// Side columns keep the door readable against every Sector backdrop.
rect(9, 16, 7, 39, COLOR.frame);
rect(11, 18, 2, 35, COLOR.frameLight);
rect(14, 18, 2, 35, COLOR.frameDark);
rect(48, 16, 7, 39, COLOR.frame);
rect(48, 18, 2, 35, COLOR.frameDark);
rect(52, 18, 2, 35, COLOR.frameLight);

// Two closed leaves and a bold central seam.
rect(16, 16, 32, 40, COLOR.recess);
rect(18, 18, 12, 36, COLOR.door);
rect(20, 20, 2, 30, COLOR.doorLight);
rect(22, 20, 8, 2, COLOR.doorLight);
rect(34, 18, 12, 36, COLOR.door);
rect(34, 20, 8, 2, COLOR.doorLight);
rect(42, 20, 2, 30, COLOR.doorLight);
rect(30, 16, 4, 40, COLOR.outline);
rect(31, 18, 2, 36, COLOR.steel);

// Physical lock bar communicates locked state without relying on color.
rect(13, 29, 38, 11, COLOR.outline);
rect(15, 31, 34, 7, COLOR.frame);
rect(16, 32, 32, 2, COLOR.steel);
rect(16, 36, 32, 2, COLOR.frameDark);
rect(27, 27, 10, 15, COLOR.outline);
rect(29, 29, 6, 11, COLOR.frameDark);
rect(30, 33, 4, 4, COLOR.amber);
rect(31, 33, 2, 2, COLOR.amberLight);

// Stable floor contact and lower door guides.
rect(16, 55, 32, 4, COLOR.outline);
rect(18, 56, 12, 2, COLOR.steel);
rect(34, 56, 12, 2, COLOR.steel);
rect(28, 60, 8, 3, COLOR.recess);

const opened = Buffer.alloc(WIDTH * HEIGHT * 4);

function openedRect(x, y, width, height, color) {
    for (let py = y; py < y + height; py += 1) {
        for (let px = x; px < x + width; px += 1) {
            const offset = (py * WIDTH + px) * 4;
            opened.set(color, offset);
        }
    }
}

// The opened frame keeps the same 52×62 bounds and bottom-center contact.
openedRect(14, 2, 36, 2, COLOR.outline);
openedRect(11, 4, 42, 2, COLOR.outline);
openedRect(9, 6, 46, 3, COLOR.outline);
openedRect(7, 9, 50, 49, COLOR.outline);
openedRect(6, 57, 52, 7, COLOR.outline);
openedRect(14, 4, 36, 2, COLOR.frameLight);
openedRect(11, 6, 42, 3, COLOR.frame);
openedRect(9, 9, 46, 48, COLOR.frameDark);
openedRect(8, 59, 48, 4, COLOR.frameDark);
openedRect(10, 59, 44, 1, COLOR.frameLight);

// Cyan header and retracted side leaves replace the amber lock and center bar.
openedRect(11, 9, 42, 7, COLOR.recess);
openedRect(13, 10, 38, 2, COLOR.frame);
openedRect(24, 11, 16, 4, COLOR.outline);
openedRect(26, 12, 12, 2, COLOR.cyan);
openedRect(17, 11, 3, 3, COLOR.outline);
openedRect(18, 12, 1, 1, COLOR.cyan);
openedRect(44, 11, 3, 3, COLOR.outline);
openedRect(45, 12, 1, 1, COLOR.cyan);
openedRect(9, 16, 11, 39, COLOR.frame);
openedRect(11, 18, 2, 35, COLOR.frameLight);
openedRect(16, 18, 3, 35, COLOR.door);
openedRect(44, 16, 11, 39, COLOR.frame);
openedRect(45, 18, 3, 35, COLOR.door);
openedRect(52, 18, 2, 35, COLOR.frameLight);

// A transparent central aperture makes the passable state unmistakable.
openedRect(20, 16, 24, 39, [0, 0, 0, 0]);
openedRect(19, 16, 2, 40, COLOR.outline);
openedRect(43, 16, 2, 40, COLOR.outline);
openedRect(20, 16, 1, 38, COLOR.frameLight);
openedRect(43, 16, 1, 38, COLOR.frameLight);
openedRect(16, 55, 32, 4, COLOR.outline);
openedRect(18, 56, 8, 2, COLOR.steel);
openedRect(38, 56, 8, 2, COLOR.steel);
openedRect(28, 60, 8, 3, COLOR.recess);

const CRC_TABLE = Array.from({ length: 256 }, (_, value) => {
    let crc = value;
    for (let bit = 0; bit < 8; bit += 1) crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    return crc >>> 0;
});

function crc32(buffer) {
    let crc = 0xffffffff;
    for (const value of buffer) crc = CRC_TABLE[(crc ^ value) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
    const typeBuffer = Buffer.from(type, "ascii");
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    const checksum = Buffer.alloc(4);
    checksum.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
    return Buffer.concat([length, typeBuffer, data, checksum]);
}

function pngBuffer(width, height, pixels) {
    const header = Buffer.alloc(13);
    header.writeUInt32BE(width, 0);
    header.writeUInt32BE(height, 4);
    header.set([8, 6, 0, 0, 0], 8);
    const scanlines = Buffer.alloc(height * (width * 4 + 1));
    for (let y = 0; y < height; y += 1) pixels.copy(scanlines, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
    return Buffer.concat([
        Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
        chunk("IHDR", header),
        chunk("IDAT", zlib.deflateSync(scanlines, { level: 9 })),
        chunk("IEND", Buffer.alloc(0))
    ]);
}

function nearestPreview(pixels, width, height, scale) {
    const preview = Buffer.alloc(width * scale * height * scale * 4);
    const previewWidth = width * scale;
    for (let y = 0; y < height * scale; y += 1) {
        for (let x = 0; x < previewWidth; x += 1) {
            const source = (Math.floor(y / scale) * width + Math.floor(x / scale)) * 4;
            pixels.copy(preview, (y * previewWidth + x) * 4, source, source + 4);
        }
    }
    return preview;
}

function sideBySide(left, right, width, height, gap = 4) {
    const combinedWidth = width * 2 + gap;
    const combined = Buffer.alloc(combinedWidth * height * 4);
    for (let y = 0; y < height; y += 1) {
        left.copy(combined, y * combinedWidth * 4, y * width * 4, (y + 1) * width * 4);
        right.copy(combined, (y * combinedWidth + width + gap) * 4, y * width * 4, (y + 1) * width * 4);
    }
    return { combined, combinedWidth };
}

fs.writeFileSync(spritePath, pngBuffer(WIDTH, HEIGHT, rgba));
const preview = nearestPreview(rgba, WIDTH, HEIGHT, PREVIEW_SCALE);
fs.writeFileSync(previewPath, pngBuffer(WIDTH * PREVIEW_SCALE, HEIGHT * PREVIEW_SCALE, preview));
fs.writeFileSync(openedSpritePath, pngBuffer(WIDTH, HEIGHT, opened));
const openedPreview = nearestPreview(opened, WIDTH, HEIGHT, PREVIEW_SCALE);
fs.writeFileSync(openedPreviewPath, pngBuffer(WIDTH * PREVIEW_SCALE, HEIGHT * PREVIEW_SCALE, openedPreview));
const { combined, combinedWidth } = sideBySide(rgba, opened, WIDTH, HEIGHT);
const statePreview = nearestPreview(combined, combinedWidth, HEIGHT, PREVIEW_SCALE);
fs.writeFileSync(
    statePreviewPath,
    pngBuffer(combinedWidth * PREVIEW_SCALE, HEIGHT * PREVIEW_SCALE, statePreview)
);
