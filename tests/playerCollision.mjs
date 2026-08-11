import assert from "node:assert/strict";
import { Vector2 } from "../src/game-kit/index.js";
import { resolvePlayerCollisions } from "../src/game/physics/PlayerCollision.js";

export function run() {
    const player = {
        id: "player-a",
        physics: {
            position: new Vector2(0, 0),
            velocity: new Vector2(100, 40),
            isGrounded: false
        }
    };
    const collided = resolvePlayerCollisions(
        player,
        [{ id: "player-b", position: { x: 20, y: 0 }, radius: 15, lifeState: "active" }],
        15
    );
    assert.equal(collided, true);
    assert.equal(player.physics.position.x, -5, "both owner clients must share overlap correction");
    assert.equal(player.physics.velocity.x, 0, "collision must remove velocity entering the other player");
    assert.equal(player.physics.velocity.y, 40, "collision must preserve tangential rope momentum");

    player.physics.position.set(0, 0);
    player.physics.velocity.set(0, 100);
    player.physics.isGrounded = false;
    resolvePlayerCollisions(
        player,
        [{ id: "player-b", position: { x: 0, y: 20 }, radius: 15, lifeState: "active" }],
        15
    );
    assert.equal(player.physics.position.y, -5);
    assert.equal(player.physics.velocity.y, 0);
    assert.equal(player.physics.isGrounded, true, "a player may stand on another player");
}
