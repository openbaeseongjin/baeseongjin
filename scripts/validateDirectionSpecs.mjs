import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { compileDirectionAuthoring } from "../src/game/direction/DirectionDefinition.js";
import {
    assertLocalDirectionReleaseReady,
    VERIFIED_LOCAL_DIRECTION_ACTIONS
} from "../src/game/direction/DirectionProductionAdapters.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const MIGRATED_DIRECTION_SPEC_PATHS = Object.freeze([
    "docs/bsh/scenario/1/1-1/DIRECTION-SPEC.json",
    "docs/bsh/scenario/1/1-2/DIRECTION-SPEC.json",
    "docs/bsh/scenario/4/4-1/DIRECTION-SPEC.json",
    "docs/bsh/scenario/4/4-2/DIRECTION-SPEC.json",
    "docs/bsh/scenario/4/4-3/DIRECTION-SPEC.json",
    "docs/bsh/scenario/4/4-4/DIRECTION-SPEC.json",
    "docs/bsh/scenario/4/4-5/DIRECTION-SPEC.json",
    "docs/bsh/scenario/4/4-6/DIRECTION-SPEC.json",
    "docs/bsh/scenario/4/4-7/DIRECTION-SPEC.json",
    "docs/bsh/scenario/4/4-8/DIRECTION-SPEC.json",
    "docs/bsh/scenario/5/5-1/DIRECTION-SPEC.json",
    "docs/bsh/scenario/5/5-2/DIRECTION-SPEC.json",
    "docs/bsh/scenario/5/5-3/DIRECTION-SPEC.json",
    "docs/bsh/scenario/5/5-4/DIRECTION-SPEC.json",
    "docs/bsh/scenario/5/5-5/DIRECTION-SPEC.json",
    "docs/bsh/scenario/5/5-6/DIRECTION-SPEC.json",
    "docs/bsh/scenario/5/5-7/DIRECTION-SPEC.json",
    "docs/bsh/scenario/5/5-8/DIRECTION-SPEC.json",
    "docs/bsh/scenario/6/6-1/DIRECTION-SPEC.json",
    "docs/bsh/scenario/6/6-2/DIRECTION-SPEC.json",
    "docs/bsh/scenario/6/6-3/DIRECTION-SPEC.json",
    "docs/bsh/scenario/6/6-4/DIRECTION-SPEC.json",
    "docs/bsh/scenario/6/6-5/DIRECTION-SPEC.json",
    "docs/bsh/scenario/6/6-6/DIRECTION-SPEC.json",
    "docs/bsh/scenario/6/6-7/DIRECTION-SPEC.json",
    "docs/bsh/scenario/6/6-8/DIRECTION-SPEC.json"
]);

function readJson(relativePath) {
    return JSON.parse(readFileSync(resolve(ROOT, relativePath), "utf8"));
}

export function validateDirectionSpecs() {
    const sources = MIGRATED_DIRECTION_SPEC_PATHS.map((path) => ({ path, source: readJson(path) }));
    for (const { path, source } of sources) {
        if (source.$schema !== "../../direction-spec.schema.json") {
            throw new Error(`${path} must reference the canonical direction schema`);
        }
        for (const beat of source.beats ?? []) {
            for (const track of beat.tracks ?? []) {
                if (Object.hasOwn(track, "status")) {
                    throw new Error(`${path} ${beat.beatId} track implementation status must be derived, not authored`);
                }
            }
        }
    }
    const definitions = sources.map(({ source }) => compileDirectionAuthoring(source));
    const coverage = assertLocalDirectionReleaseReady(definitions);
    return Object.freeze({
        definitions,
        coverage,
        supportedActions: Object.freeze([...VERIFIED_LOCAL_DIRECTION_ACTIONS].sort())
    });
}

function main() {
    const result = validateDirectionSpecs();
    if (process.argv.includes("--json")) {
        console.log(JSON.stringify(result.coverage, null, 2));
        return;
    }
    console.log(
        `Direction specs valid: ${result.definitions.length} definitions, ${result.coverage.tracks.length} tracks, release ready`
    );
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) main();
