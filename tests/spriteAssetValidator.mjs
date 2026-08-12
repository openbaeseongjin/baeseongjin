import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { validateSpriteAssetDirectory } from "../scripts/validateSpriteAssets.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const EXAMPLE_DIRECTORY = resolve(ROOT, "assets/sprites/examples/player-multi-atlas");

export function run() {
    const valid = validateSpriteAssetDirectory(EXAMPLE_DIRECTORY);
    assert.equal(valid.id, "player-multi-atlas-example");
    assert.equal(valid.atlasCount, 2);
    assert.equal(valid.animationCount, 7);

    const schema = JSON.parse(readFileSync(resolve(ROOT, "assets/sprites/sprite-manifest.schema.json"), "utf8"));
    assert.equal(schema.$schema, "https://json-schema.org/draft/2020-12/schema");
    assert.deepEqual(schema.properties.formatVersion, { const: 1 });
    assert.deepEqual(schema.properties.animations.required, ["idle", "run", "jump", "fall", "rope", "hit", "respawn"]);

    const temporaryRoot = mkdtempSync(join(tmpdir(), "baeseongjin-sprite-assets-"));
    const fixture = join(temporaryRoot, "fixture");
    try {
        cpSync(EXAMPLE_DIRECTORY, fixture, { recursive: true });
        const manifestPath = join(fixture, "sprite-manifest.json");
        const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
        manifest.atlases.actions.size.width = 120;
        writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
        assert.throws(() => validateSpriteAssetDirectory(fixture), /is 96x24; expected 120x24/);

        manifest.atlases.actions.size.width = 96;
        writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
        writeFileSync(join(fixture, "actions.png"), "not a png");
        assert.throws(() => validateSpriteAssetDirectory(fixture), /is not a valid PNG/);
    } finally {
        assert.ok(temporaryRoot.startsWith(resolve(tmpdir())), "temporary cleanup must stay inside the OS temp path");
        rmSync(temporaryRoot, { recursive: true, force: true });
    }
}
