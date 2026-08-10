import assert from "node:assert/strict";
import { LIFE_CONFIG } from "../src/game/config.js";
import { enterDowned, isTeamDefeated, revivePlayer, updateDownedPlayer } from "../src/game/life/PlayerLifeCycle.js";

export function run() {
    const player = { health: 100, maxHealth: 100, lifeState: "active", downedRemaining: 0, reviveProgress: 0 };
    assert.equal(enterDowned(player, LIFE_CONFIG), true);
    assert.equal(player.health, 0);
    assert.equal(player.lifeState, "downed");
    assert.equal(isTeamDefeated([player]), true);

    updateDownedPlayer(player, 1.5);
    assert.equal(player.downedRemaining, LIFE_CONFIG.downedDuration - 1.5);
    assert.equal(revivePlayer(player, LIFE_CONFIG), true);
    assert.equal(player.lifeState, "active");
    assert.equal(player.health, 40);
    assert.equal(isTeamDefeated([player]), false);

    enterDowned(player, LIFE_CONFIG);
    updateDownedPlayer(player, LIFE_CONFIG.downedDuration);
    assert.equal(player.lifeState, "eliminated");
    assert.equal(revivePlayer(player, LIFE_CONFIG), false);
}
