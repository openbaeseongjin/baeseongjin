const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");

const WIDTH = 48;
const HEIGHT = 48;
const PREVIEW_SCALE = 8;
const root = path.resolve(__dirname, "..");
const spritePath = path.join(root, "export", "gate-control-panel-universal-48x48.png");
const previewPath = path.join(root, "preview", "gate-control-panel-universal-48x48-review.png");
const openedSpritePath = path.join(root, "export", "gate-control-panel-universal-opened-48x48.png");
const openedPreviewPath = path.join(root, "preview", "gate-control-panel-universal-opened-48x48-review.png");
const statePreviewPath = path.join(root, "preview", "gate-control-panel-universal-states-review.png");

const COLOR = Object.freeze({
    outline: [9, 14, 20, 255],
    recess: [15, 23, 31, 255],
    frameDark: [28, 38, 48, 255],
    frame: [47, 60, 72, 255],
    frameLight: [74, 88, 101, 255],
    screen: [20, 37, 48, 255],
    coverDark: [53, 58, 63, 255],
    cover: [81, 86, 90, 255],
    steel: [126, 134, 141, 255],
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

// 34×45 bottom-standing silhouette: narrower and visually smaller than the player.
rect(13, 3, 22, 2, COLOR.outline);
rect(11, 5, 26, 24, COLOR.outline);
rect(18, 28, 12, 15, COLOR.outline);
rect(7, 41, 34, 7, COLOR.outline);

// Main housing and compact pedestal.
rect(13, 5, 22, 22, COLOR.frameDark);
rect(14, 6, 20, 2, COLOR.frameLight);
rect(19, 29, 10, 13, COLOR.frameDark);
rect(21, 30, 6, 11, COLOR.frame);
rect(9, 43, 30, 4, COLOR.frameDark);
rect(11, 42, 8, 1, COLOR.frameLight);
rect(29, 42, 8, 1, COLOR.frameLight);

// Large recessed display and a single status bar.
rect(14, 8, 20, 10, COLOR.outline);
rect(16, 10, 16, 6, COLOR.screen);
rect(18, 6, 12, 3, COLOR.outline);
rect(20, 7, 8, 1, COLOR.amber);
rect(22, 7, 4, 1, COLOR.amberLight);

// Closed mechanical actuator cover communicates blocked/idle by shape.
rect(14, 19, 20, 8, COLOR.outline);
rect(16, 20, 16, 6, COLOR.coverDark);
rect(17, 21, 14, 4, COLOR.cover);
rect(20, 20, 8, 2, COLOR.recess);
rect(17, 24, 14, 1, COLOR.steel);

// One low-priority service indicator and a stable bottom-center contact.
rect(31, 25, 3, 3, COLOR.outline);
rect(32, 26, 1, 1, COLOR.cyan);
rect(22, 44, 4, 3, COLOR.recess);

const opened = Buffer.alloc(WIDTH * HEIGHT * 4);

function openedRect(x, y, width, height, color) {
    for (let py = y; py < y + height; py += 1) {
        for (let px = x; px < x + width; px += 1) {
            const offset = (py * WIDTH + px) * 4;
            opened.set(color, offset);
        }
    }
}

// The opened panel preserves the exact canvas, silhouette bounds and floor contact.
openedRect(13, 3, 22, 2, COLOR.outline);
openedRect(11, 5, 26, 24, COLOR.outline);
openedRect(18, 28, 12, 15, COLOR.outline);
openedRect(7, 41, 34, 7, COLOR.outline);
openedRect(13, 5, 22, 22, COLOR.frameDark);
openedRect(14, 6, 20, 2, COLOR.frameLight);
openedRect(19, 29, 10, 13, COLOR.frameDark);
openedRect(21, 30, 6, 11, COLOR.frame);
openedRect(9, 43, 30, 4, COLOR.frameDark);
openedRect(11, 42, 8, 1, COLOR.frameLight);
openedRect(29, 42, 8, 1, COLOR.frameLight);

// Active display becomes a broad cyan block while the actuator opens physically.
openedRect(14, 8, 20, 10, COLOR.outline);
openedRect(16, 10, 16, 6, COLOR.screen);
openedRect(18, 12, 12, 2, COLOR.cyan);
openedRect(18, 6, 12, 3, COLOR.outline);
openedRect(20, 7, 8, 1, COLOR.cyan);
openedRect(8, 19, 9, 8, COLOR.outline);
openedRect(10, 20, 6, 6, COLOR.cover);
openedRect(31, 19, 9, 8, COLOR.outline);
openedRect(32, 20, 6, 6, COLOR.cover);
openedRect(17, 19, 14, 8, COLOR.recess);
openedRect(22, 20, 4, 6, COLOR.cyan);
openedRect(31, 25, 3, 3, COLOR.outline);
openedRect(32, 26, 1, 1, COLOR.cyan);
openedRect(22, 44, 4, 3, COLOR.recess);

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
