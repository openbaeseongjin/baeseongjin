import assert from "node:assert/strict";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { validateSpriteAssetDirectory } from "../scripts/validateSpriteAssets.mjs";
import { DEFAULT_PLAYER_SPRITE_DEFINITION } from "../src/render/sprites/PlayerSpriteCatalog.js";
import { createPlayerSpriteDefinitionFromManifest } from "../src/render/sprites/PlayerSpriteManifest.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const EXAMPLE_DIRECTORY = resolve(ROOT, "assets/runtime/characters/fixtures/player-multi-atlas");
const PRODUCTION_TEMPLATE_DIRECTORY = resolve(ROOT, "assets/runtime/characters/player-production-template");

export function run() {
    const valid = validateSpriteAssetDirectory(EXAMPLE_DIRECTORY);
    assert.equal(valid.id, "player-multi-atlas-example");
    assert.equal(valid.atlasCount, 2);
    assert.equal(valid.animationCount, 7);

    const productionTemplate = validateSpriteAssetDirectory(PRODUCTION_TEMPLATE_DIRECTORY);
    assert.equal(productionTemplate.id, "player-production-template");
    assert.equal(productionTemplate.atlasCount, 2);
    assert.equal(productionTemplate.animationCount, 7);
    const templateManifest = JSON.parse(
        readFileSync(resolve(PRODUCTION_TEMPLATE_DIRECTORY, "sprite-manifest.json"), "utf8")
    );
    assert.equal(templateManifest.$schema, "../sprite-manifest.schema.json");
    assert.ok(existsSync(resolve(PRODUCTION_TEMPLATE_DIRECTORY, templateManifest.$schema)));
    assert.equal(templateManifest.atlases.actions.size.width, 120);
    assert.equal(templateManifest.atlases.actions.size.height, 24);
    const templateFrames = Object.values(templateManifest.animations).flatMap((animation) => animation.frames ?? []);
    assert.equal(templateFrames.length, 13);
    assert.equal(
        new Set(templateFrames.map(({ atlas, cell }) => `${atlas}:${cell.column}:${cell.row}`)).size,
        13,
        "the production starter must preserve all 13 distinct source poses"
    );
    assert.deepEqual(
        templateManifest.animations.respawn.frames.map(({ atlas, cell }) => ({ atlas, cell })),
        [
            { atlas: "actions", cell: { column: 2, row: 0 } },
            { atlas: "actions", cell: { column: 3, row: 0 } },
            { atlas: "actions", cell: { column: 4, row: 0 } }
        ]
    );
    const templateDefinition = createPlayerSpriteDefinitionFromManifest(templateManifest);
    assert.deepEqual(templateDefinition.destinationSize, DEFAULT_PLAYER_SPRITE_DEFINITION.destinationSize);
    assert.deepEqual(templateDefinition.anchor, DEFAULT_PLAYER_SPRITE_DEFINITION.anchor);
    assert.deepEqual(templateDefinition.offset, DEFAULT_PLAYER_SPRITE_DEFINITION.offset);
    for (const state of Object.keys(DEFAULT_PLAYER_SPRITE_DEFINITION.presentations)) {
        const expected = DEFAULT_PLAYER_SPRITE_DEFINITION.presentationFor(state);
        const actual = templateDefinition.presentationFor(state);
        assert.equal(actual.clip.loop, expected.clip.loop, `${state} loop must match the runtime mock`);
        assert.deepEqual(
            actual.clip.frames.map(({ durationSeconds }) => durationSeconds),
            expected.clip.frames.map(({ durationSeconds }) => durationSeconds),
            `${state} timing must match the runtime mock`
        );
        assert.deepEqual(actual.size, expected.size, `${state} cue scale must match the runtime mock`);
        assert.deepEqual(actual.offset, expected.offset, `${state} cue offset must match the runtime mock`);
        assert.equal(actual.opacity, expected.opacity, `${state} cue opacity must match the runtime mock`);
        assert.equal(actual.pixelSnap, expected.pixelSnap, `${state} pixel snap must match the runtime mock`);
    }

    const schema = JSON.parse(
        readFileSync(resolve(ROOT, "assets/runtime/characters/sprite-manifest.schema.json"), "utf8")
    );
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
