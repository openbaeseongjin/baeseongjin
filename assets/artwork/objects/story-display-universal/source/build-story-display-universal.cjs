const path = require("node:path");
const { PNG } = require("pngjs");
const sharp = require("sharp");

const WIDTH = 64;
const HEIGHT = 48;
const root = path.resolve(__dirname, "..");
const spritePath = path.join(root, "export", "story-display-universal-64x48.png");
const previewPath = path.join(root, "preview", "story-display-universal-64x48-review.png");

const COLOR = Object.freeze({
    transparent: [0, 0, 0, 0],
    outline: [14, 19, 25, 255],
    shadow: [24, 30, 38, 255],
    ironDark: [45, 53, 63, 255],
    iron: [67, 77, 89, 255],
    ironLight: [91, 103, 116, 255],
    screenDark: [14, 31, 43, 255],
    screen: [24, 48, 65, 255],
    infoDim: [71, 94, 113, 255],
    info: [91, 119, 142, 255],
    cyan: [39, 214, 220, 255],
    amber: [238, 173, 45, 255]
});

const png = new PNG({ width: WIDTH, height: HEIGHT, colorType: 6 });
png.data.fill(0);

function rect(x, y, width, height, color) {
    for (let py = y; py < y + height; py += 1) {
        for (let px = x; px < x + width; px += 1) {
            const offset = (py * WIDTH + px) * 4;
            png.data.set(color, offset);
        }
    }
}

function horizontalChamfer(y, x, width, color) {
    rect(x, y, width, 1, color);
}

// Outer body: broad, neutral silhouette with two-pixel chamfers.
horizontalChamfer(4, 8, 48, COLOR.outline);
horizontalChamfer(5, 6, 52, COLOR.outline);
rect(4, 6, 56, 29, COLOR.outline);
horizontalChamfer(35, 6, 52, COLOR.outline);
horizontalChamfer(36, 8, 48, COLOR.outline);

horizontalChamfer(6, 8, 48, COLOR.iron);
horizontalChamfer(7, 6, 52, COLOR.iron);
rect(6, 8, 52, 25, COLOR.iron);
horizontalChamfer(33, 6, 52, COLOR.ironDark);
horizontalChamfer(34, 8, 48, COLOR.ironDark);
rect(8, 8, 48, 2, COLOR.ironLight);

// Screen and bezel. Two large blocks replace the concept's small UI details.
rect(9, 10, 46, 21, COLOR.shadow);
rect(11, 11, 42, 18, COLOR.screenDark);
rect(12, 12, 40, 16, COLOR.screen);
rect(16, 15, 32, 3, COLOR.info);
rect(18, 21, 28, 4, COLOR.infoDim);

// Side service clamps and two low-priority status lights.
rect(1, 13, 3, 16, COLOR.outline);
rect(2, 15, 2, 12, COLOR.ironDark);
rect(2, 16, 2, 4, COLOR.ironLight);
rect(2, 22, 2, 2, COLOR.cyan);
rect(60, 13, 3, 16, COLOR.outline);
rect(60, 15, 2, 12, COLOR.ironDark);
rect(60, 16, 2, 4, COLOR.ironLight);
rect(60, 22, 2, 2, COLOR.amber);

// Centered underside bracket supports wall-rail and pedestal presentations.
rect(25, 37, 14, 2, COLOR.outline);
rect(27, 39, 10, 6, COLOR.iron);
rect(25, 39, 2, 7, COLOR.outline);
rect(37, 39, 2, 7, COLOR.outline);
rect(22, 45, 20, 3, COLOR.outline);
rect(24, 45, 16, 2, COLOR.ironDark);

async function build() {
    const sprite = PNG.sync.write(png, { colorType: 6 });
    await sharp(sprite).png().toFile(spritePath);
    await sharp(sprite).resize(WIDTH * 8, HEIGHT * 8, { kernel: "nearest" }).png().toFile(previewPath);
}

build().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
