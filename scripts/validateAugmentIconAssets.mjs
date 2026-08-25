import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { AUGMENT_ICON_IDS, AUGMENT_ICON_SOURCE_SIZES } from "../src/render/assets/AugmentIconAssetCatalog.js";

const PNG_SIGNATURE = Object.freeze([137, 80, 78, 71, 13, 10, 26, 10]);
const ALLOWED_SIZE_LOOKUP = Object.freeze(Object.fromEntries(AUGMENT_ICON_SOURCE_SIZES.map((size) => [size, true])));

function pngSize(buffer, fileName) {
    if (buffer.length < 24 || PNG_SIGNATURE.some((byte, index) => buffer[index] !== byte)) {
        throw new Error(`${fileName}: transparent PNG export가 아닙니다.`);
    }
    return Object.freeze({ width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) });
}

const input = process.argv[2];
if (!input) throw new Error("Usage: npm run validate:augment-icons -- <export-or-runtime-directory>");

const directory = resolve(input);
const entries = await readdir(directory, { withFileTypes: true });
const fileLookup = Object.freeze(
    Object.fromEntries(entries.filter(({ isFile }) => isFile()).map(({ name }) => [name, true]))
);
const expectedFileLookup = Object.freeze(Object.fromEntries(AUGMENT_ICON_IDS.map((id) => [`${id}.png`, true])));
const missing = Object.keys(expectedFileLookup).filter((fileName) => !fileLookup[fileName]);
const extraPng = Object.keys(fileLookup).filter(
    (fileName) => fileName.toLowerCase().endsWith(".png") && !expectedFileLookup[fileName]
);

if (missing.length > 0) throw new Error(`증강 아이콘 누락: ${missing.join(", ")}`);
if (extraPng.length > 0) throw new Error(`알 수 없는 증강 아이콘: ${extraPng.join(", ")}`);

for (const fileName of Object.keys(expectedFileLookup)) {
    const size = pngSize(await readFile(resolve(directory, fileName)), fileName);
    if (size.width !== size.height || ALLOWED_SIZE_LOOKUP[size.width] !== true) {
        throw new Error(
            `${fileName}: ${size.width}x${size.height}; ${AUGMENT_ICON_SOURCE_SIZES.join("x 또는 ")}x 정사각 PNG가 필요합니다.`
        );
    }
}

console.log(
    `Augment icon assets passed: ${AUGMENT_ICON_IDS.length} PNG files (${AUGMENT_ICON_SOURCE_SIZES.join("x or ")}x square)`
);
