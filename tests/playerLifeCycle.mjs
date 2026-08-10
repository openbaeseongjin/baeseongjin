import assert from "node:assert/strict";
import { Vector2 } from "../src/game-kit/index.js";
import { LIFE_CONFIG } from "../src/game/config.js";
import {
    enterDowned,
    isTeamDefeated,
    revivePlayer,
    updateDownedPlayer,
    updateReviveInteraction,
    updateTeamRevives
} from "../src/game/life/PlayerLifeCycle.js";

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

    const reviver = {
        health: 100,
        maxHealth: 100,
        lifeState: "active",
        physics: { position: { x: 0, y: 0 } }
    };
    const teammate = {
        health: 100,
        maxHealth: 100,
        lifeState: "active",
        downedRemaining: 0,
        reviveProgress: 0,
        physics: { position: { x: 60, y: 0 } }
    };
    enterDowned(teammate, LIFE_CONFIG);
    assert.equal(isTeamDefeated([reviver, teammate]), false, "one active teammate keeps the team alive");
    assert.equal(updateReviveInteraction(reviver, teammate, 1, LIFE_CONFIG).status, "progress");
    assert.equal(teammate.reviveProgress, 1);
    reviver.physics.position.x = 200;
    assert.equal(updateReviveInteraction(reviver, teammate, 0.1, LIFE_CONFIG).status, "interrupted");
    assert.equal(teammate.reviveProgress, 0, "leaving revive range must reset hold progress");
    reviver.physics.position.x = 0;
    assert.equal(updateReviveInteraction(reviver, teammate, LIFE_CONFIG.reviveDuration, LIFE_CONFIG).status, "revived");
    assert.equal(teammate.lifeState, "active");
    assert.equal(teammate.health, 40);

    enterDowned(reviver, LIFE_CONFIG);
    enterDowned(teammate, LIFE_CONFIG);
    assert.equal(isTeamDefeated([reviver, teammate]), true, "two downed players defeat the team");

    const teamReviver = {
        id: "player-a",
        health: 100,
        lifeState: "active",
        physics: { position: new Vector2(0, 0) }
    };
    const firstDowned = {
        id: "player-b",
        health: 0,
        maxHealth: 100,
        lifeState: "downed",
        downedRemaining: 8,
        reviveProgress: 0,
        physics: { position: new Vector2(40, 0) }
    };
    const secondDowned = {
        ...firstDowned,
        id: "player-c",
        physics: { position: new Vector2(50, 0) }
    };
    const teamUpdate = updateTeamRevives(
        [teamReviver, firstDowned, secondDowned],
        new Map([[teamReviver.id, { interact: true }]]),
        1,
        LIFE_CONFIG
    );
    assert.deepEqual(teamUpdate.reviverIds, ["player-a"]);
    assert.equal(firstDowned.reviveProgress, 1, "stable target order must assign one reviver to one teammate");
    assert.equal(secondDowned.reviveProgress, 0);
    updateTeamRevives([teamReviver, firstDowned], new Map([[teamReviver.id, { interact: false }]]), 0.1, LIFE_CONFIG);
    assert.equal(firstDowned.reviveProgress, 0, "releasing interact must reset revive progress");
}
