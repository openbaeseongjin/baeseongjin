import { readFileSync, realpathSync, statSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createEnemySpriteDefinitionFromManifest } from "../src/render/sprites/EnemySpriteManifest.js";

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function readPngHeader(path) {
    const data = readFileSync(path);
    if (
        data.length < 26 ||
        !data.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE) ||
        data.toString("ascii", 12, 16) !== "IHDR"
    ) {
        throw new Error(`Enemy sprite atlas '${path}' is not a valid PNG`);
    }
    const width = data.readUInt32BE(16);
    const height = data.readUInt32BE(20);
    if (width <= 0 || height <= 0) throw new Error(`Enemy sprite atlas '${path}' has invalid dimensions`);
    return Object.freeze({ width, height, colorType: data[25] });
}

function assertInsideDirectory(root, path) {
    const child = relative(root, path);
    if (!child || child.startsWith("..") || isAbsolute(child)) {
        throw new Error(`Enemy sprite atlas '${path}' must stay inside '${root}'`);
    }
}

export function validateEnemySpriteAssetDirectory(directory) {
    const root = resolve(directory);
    if (!statSync(root).isDirectory()) throw new Error(`Enemy sprite asset path '${root}' must be a directory`);
    const manifestPath = resolve(root, "enemy-sprite-manifest.json");
    let manifest;
    try {
        manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    } catch (error) {
        throw new Error(`Failed to read enemy sprite manifest '${manifestPath}': ${error.message}`);
    }
    const definition = createEnemySpriteDefinitionFromManifest(manifest, {
        baseUrl: pathToFileURL(manifestPath).href
    });
    const realRoot = realpathSync(root);
    for (const [atlasId, atlas] of Object.entries(manifest.atlases)) {
        const atlasPath = resolve(root, atlas.image);
        assertInsideDirectory(root, atlasPath);
        const realAtlasPath = realpathSync(atlasPath);
        assertInsideDirectory(realRoot, realAtlasPath);
        const actual = readPngHeader(realAtlasPath);
        if (actual.width !== atlas.size.width || actual.height !== atlas.size.height) {
            throw new Error(
                `Enemy sprite atlas '${atlasId}' is ${actual.width}x${actual.height}; expected ${atlas.size.width}x${atlas.size.height}`
            );
        }
        if (actual.colorType !== 6) {
            throw new Error(`Enemy sprite atlas '${atlasId}' must be an RGBA PNG with transparency support`);
        }
    }
    return Object.freeze({
        id: definition.id,
        directory: root,
        atlasCount: Object.keys(definition.atlases).length,
        enemyCount: Object.keys(definition.enemies).length,
        stateCount: Object.values(definition.enemies).reduce(
            (total, enemy) => total + Object.keys(enemy.states).length,
            0
        )
    });
}

function runCli() {
    const directories = process.argv.slice(2);
    if (directories.length !== 1) {
        throw new Error("Usage: npm run validate:enemy-sprite-assets -- <directory>");
    }
    const result = validateEnemySpriteAssetDirectory(directories[0]);
    console.log(
        `Enemy sprite assets valid: ${result.id} (${result.atlasCount} atlas, ${result.enemyCount} enemies, ${result.stateCount} states)`
    );
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
    try {
        runCli();
    } catch (error) {
        console.error(`Enemy sprite asset validation failed: ${error.message}`);
        process.exitCode = 1;
    }
}
