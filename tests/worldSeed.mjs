import assert from "node:assert/strict";
import { parseWorldSeed, randomWorldSeed, selectWorldSeed } from "../src/game/world/WorldSeed.js";

export function run() {
    assert.equal(parseWorldSeed("?seed=1"), 1);
    assert.equal(parseWorldSeed("?unrelated=1&seed=4294967295"), 0xffffffff);
    assert.equal(parseWorldSeed("?seed=0"), null);
    assert.equal(parseWorldSeed("?seed=-1"), null);
    assert.equal(parseWorldSeed("?seed=4294967296"), null);
    assert.equal(parseWorldSeed("?seed=abc"), null);
    assert.equal(
        randomWorldSeed(() => 0),
        1
    );
    assert.equal(
        randomWorldSeed(() => 0.999999999999),
        0xffffffff
    );
    assert.equal(
        selectWorldSeed("?seed=42", () => 0.5),
        42
    );
    assert.equal(
        selectWorldSeed("", () => 0),
        1
    );
}
