import assert from "node:assert/strict";
import { InputDispatcher } from "../src/game/input/InputDispatcher.js";
import { createInputCapabilityMixin } from "../src/game/input/InputCapability.js";
import { InputDrivenObject } from "../src/game/objects/InputDrivenObject.js";
import { SimulationDrivenObject } from "../src/game/objects/SimulationDrivenObject.js";
import { createPlayerCommand } from "../src/game/commands/PlayerCommand.js";
import { GameSimulation } from "../src/game/simulation/GameSimulation.js";

const withCounterInput = createInputCapabilityMixin({
    id: "counter",
    order: 10,
    apply(input) {
        this.total += input.amount;
    }
});

class CounterInputObject extends withCounterInput(InputDrivenObject) {
    constructor({ id, ownerId }) {
        super({ id, ownerId });
        this.total = 0;
    }
}

export function run() {
    const dispatcher = new InputDispatcher();
    const owned = new CounterInputObject({ id: "owned", ownerId: "player-a" });
    const other = new CounterInputObject({ id: "other", ownerId: "player-b" });
    const simulated = new SimulationDrivenObject({ id: "enemy" });

    assert.equal(owned.driveKind, "input");
    assert.equal(simulated.driveKind, "simulation");
    assert.equal(owned.hasInputCapability("counter"), true);
    assert.equal(
        dispatcher.dispatch({
            objects: [simulated, other, owned],
            ownerId: "player-a",
            input: { amount: 3 },
            context: {}
        }),
        1,
        "input must reach only matching InputDrivenObject capabilities"
    );
    assert.equal(owned.total, 3);
    assert.equal(other.total, 0);

    const simulation = new GameSimulation();
    const player = simulation.players[0];
    assert.ok(player instanceof InputDrivenObject, "the player must be an InputDrivenObject");
    assert.ok(player.ropeObject instanceof InputDrivenObject, "the rope must be an independent InputDrivenObject");
    assert.equal(player.ownerId, player.id);
    assert.equal(player.ropeObject.ownerId, player.id);
    assert.equal(player.hasInputCapability("locomotion"), true);
    assert.equal(player.ropeObject.hasInputCapability("rope-pointer"), true);
    assert.deepEqual(
        simulation.inputDrivenObjects(player.id),
        [player, player.ropeObject],
        "the simulation must expose one owner-scoped input dispatch group"
    );
    assert.ok(player.weapon instanceof SimulationDrivenObject, "the automatic weapon must be simulation-driven");
    assert.ok(
        simulation.enemies.every((enemy) => enemy instanceof SimulationDrivenObject),
        "enemies must be SimulationDrivenObjects"
    );
    const target = simulation.enemies[0];
    target.position.set(player.physics.position.x + 20, player.physics.position.y);
    player.weapon.cooldown = 0;
    simulation.step(
        1 / 120,
        createPlayerCommand(
            {
                horizontal: 0,
                vertical: 0,
                interact: false,
                pointer: { x: 0, y: 0, down: false },
                viewport: { width: 844, height: 390 }
            },
            { x: 0, y: 0 }
        )
    );
    assert.ok(
        simulation.projectiles.every((projectile) => projectile instanceof SimulationDrivenObject),
        "directly uncontrolled projectiles must be SimulationDrivenObjects"
    );
    assert.throws(
        () => new CounterInputObject({ id: "broken", ownerId: "" }),
        /ownerId/,
        "invalid ownership must fail before input dispatch"
    );
}
