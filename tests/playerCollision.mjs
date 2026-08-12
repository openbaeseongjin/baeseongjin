import assert from "node:assert/strict";
import { Vector2 } from "../src/game-kit/index.js";
import { resolvePlayerCollisions } from "../src/game/physics/PlayerCollision.js";
import { CircleCollider } from "../src/game/physics/colliders/CircleCollider.js";

export function run() {
    const player = {
        id: "player-a",
        physics: {
            position: new Vector2(0, 0),
            velocity: new Vector2(100, 40),
            isGrounded: false,
            collider: new CircleCollider({ radius: 15 })
        }
    };
    const collided = resolvePlayerCollisions(player, [
        { id: "player-b", position: { x: 20, y: 0 }, collider: { type: "circle", radius: 15 }, lifeState: "active" }
    ]);
    assert.equal(collided, true);
    assert.equal(player.physics.position.x, -5, "both owner clients must share overlap correction");
    assert.equal(player.physics.velocity.x, 0, "collision must remove velocity entering the other player");
    assert.equal(player.physics.velocity.y, 40, "collision must preserve tangential rope momentum");

    player.physics.position.set(0, 0);
    player.physics.velocity.set(0, 100);
    player.physics.isGrounded = false;
    resolvePlayerCollisions(player, [
        { id: "player-b", position: { x: 0, y: 20 }, collider: { type: "circle", radius: 15 }, lifeState: "active" }
    ]);
    assert.equal(player.physics.position.y, -5);
    assert.equal(player.physics.velocity.y, 0);
    assert.equal(player.physics.isGrounded, true, "a player may stand on another player");
    assert.deepEqual(player.physics.collider.snapshot(), { type: "circle", radius: 15 });
    assert.ok(Object.isFrozen(player.physics.collider.snapshot()));
}
