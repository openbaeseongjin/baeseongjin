import assert from "node:assert/strict";
import { appendCombatFeedback, createImpactState, updateCombatFeedback } from "../src/game/combat/CombatFeedback.js";

export function run() {
    const effects = [];
    appendCombatFeedback(effects, { type: "enemy-hit", position: { x: 10, y: 20 }, damage: 10 });
    assert.equal(effects.filter((effect) => effect.type === "particle").length, 7);
    assert.equal(effects.find((effect) => effect.type === "text").text, "10");
    assert.deepEqual(createImpactState([{ type: "player-hit" }]), { age: 0, lifetime: 0.24, strength: 9 });
    updateCombatFeedback(effects, 0.8);
    assert.equal(effects.length, 0, "expired feedback must not remain in the simulation snapshot");

    const defeatedEffects = [];
    appendCombatFeedback(defeatedEffects, { type: "enemy-defeated", position: { x: 0, y: 0 }, damage: 10 });
    assert.equal(defeatedEffects.filter((effect) => effect.type === "particle").length, 12);
    assert.equal(defeatedEffects.find((effect) => effect.type === "text").emphasis, true);
}
