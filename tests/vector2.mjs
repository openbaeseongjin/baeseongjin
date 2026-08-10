import assert from "node:assert/strict";
import { Vector2 } from "../src/game-kit/index.js";

export function run() {
    const value = new Vector2(3, 4);
    assert.equal(value.length(), 5);
    assert.deepEqual(value.clone().add(new Vector2(1, -1)).scale(2), new Vector2(8, 6));
    assert.equal(value.clone().subtract(new Vector2(1, 2)).dot(new Vector2(2, 1)), 6);
    assert.equal(new Vector2(0, 0).distanceTo(new Vector2(3, 4)), 5);
    assert.equal(Math.round(new Vector2(10, 0).normalize().length()), 1);
    assert.equal(value.isFinite(), true);
    assert.equal(new Vector2(Infinity, 0).isFinite(), false);
}
