import { readFileSync, realpathSync, statSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createPlayerSpriteDefinitionFromManifest } from "../src/render/sprites/PlayerSpriteManifest.js";

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

export function readPngSize(path) {
    const data = readFileSync(path);
    if (
        data.length < 24 ||
        !data.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE) ||
        data.toString("ascii", 12, 16) !== "IHDR"
    ) {
        throw new Error(`Sprite atlas '${path}' is not a valid PNG`);
    }
    const width = data.readUInt32BE(16);
    const height = data.readUInt32BE(20);
    if (width <= 0 || height <= 0) throw new Error(`Sprite atlas '${path}' has invalid dimensions`);
    return Object.freeze({ width, height });
}

function assertInsideDirectory(root, path) {
    const child = relative(root, path);
    if (!child || child.startsWith("..") || isAbsolute(child)) {
        throw new Error(`Sprite atlas '${path}' must stay inside '${root}'`);
    }
}

export function validateSpriteAssetDirectory(directory) {
    const root = resolve(directory);
    if (!statSync(root).isDirectory()) throw new Error(`Sprite asset path '${root}' must be a directory`);
    const manifestPath = resolve(root, "sprite-manifest.json");
    let manifest;
    try {
        manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    } catch (error) {
        throw new Error(`Failed to read sprite manifest '${manifestPath}': ${error.message}`);
    }
    const definition = createPlayerSpriteDefinitionFromManifest(manifest, {
        baseUrl: pathToFileURL(manifestPath).href
    });
    const realRoot = realpathSync(root);
    for (const [atlasId, atlas] of Object.entries(manifest.atlases)) {
        const atlasPath = resolve(root, atlas.image);
        assertInsideDirectory(root, atlasPath);
        const realAtlasPath = realpathSync(atlasPath);
        assertInsideDirectory(realRoot, realAtlasPath);
        const actualSize = readPngSize(realAtlasPath);
        if (actualSize.width !== atlas.size.width || actualSize.height !== atlas.size.height) {
            throw new Error(
                `Sprite atlas '${atlasId}' is ${actualSize.width}x${actualSize.height}; expected ${atlas.size.width}x${atlas.size.height}`
            );
        }
    }
    return Object.freeze({
        id: definition.id,
        directory: root,
        atlasCount: Object.keys(definition.atlases).length,
        animationCount: Object.keys(definition.presentations).length
    });
}

function runCli() {
    const directories = process.argv.slice(2);
    if (directories.length !== 1) {
        throw new Error("Usage: npm run validate:sprite-assets -- <directory>");
    }
    const result = validateSpriteAssetDirectory(directories[0]);
    console.log(
        `Sprite assets valid: ${result.id} (${result.atlasCount} atlases, ${result.animationCount} animations)`
    );
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
    try {
        runCli();
    } catch (error) {
        console.error(`Sprite asset validation failed: ${error.message}`);
        process.exitCode = 1;
    }
}
