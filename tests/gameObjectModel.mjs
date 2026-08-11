import assert from "node:assert/strict";
import { InputDispatcher } from "../src/game/input/InputDispatcher.js";
import { createInputCapabilityMixin } from "../src/game/input/InputCapability.js";
import { InputDrivenObject } from "../src/game/objects/InputDrivenObject.js";
import { SimulationDrivenObject } from "../src/game/objects/SimulationDrivenObject.js";
import { BallisticProjectileObject, HomingProjectileObject } from "../src/game/combat/ProjectileObject.js";
import { createPlayerCommand } from "../src/game/commands/PlayerCommand.js";
import { createSimulationCapabilityMixin } from "../src/game/simulation/SimulationCapability.js";
import { SimulationDispatcher } from "../src/game/simulation/SimulationDispatcher.js";
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

const withCounterSimulation = createSimulationCapabilityMixin({
    id: "counter",
    order: 10,
    apply({ amount }) {
        this.total += amount;
        return this.total;
    }
});

const withUnrelatedSimulation = createSimulationCapabilityMixin({
    id: "unrelated",
    order: 20,
    apply() {
        this.unrelatedRuns += 1;
    }
});

class CounterSimulationObject extends withUnrelatedSimulation(withCounterSimulation(SimulationDrivenObject)) {
    constructor({ id }) {
        super({ id });
        this.total = 0;
        this.unrelatedRuns = 0;
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

    const simulationDispatcher = new SimulationDispatcher();
    const counterSimulation = new CounterSimulationObject({ id: "counter-simulation" });
    assert.equal(counterSimulation.hasSimulationCapability("counter"), true);
    assert.deepEqual(
        simulationDispatcher.dispatch({
            objects: [owned, counterSimulation],
            capabilityId: "counter",
            context: { amount: 4 }
        }),
        [
            {
                object: counterSimulation,
                capabilityId: "counter",
                result: 4
            }
        ],
        "simulation must reach only SimulationDrivenObject capabilities"
    );
    assert.equal(counterSimulation.total, 4);
    assert.equal(counterSimulation.unrelatedRuns, 0, "a simulation phase must not run unrelated capabilities");

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
    assert.equal(player.weapon.hasSimulationCapability("automatic-weapon"), true);
    assert.ok(
        simulation.enemies.every((enemy) => enemy instanceof SimulationDrivenObject),
        "enemies must be SimulationDrivenObjects"
    );
    assert.equal(
        simulation.enemies.every((enemy) => enemy.hasSimulationCapability("enemy-weapon")),
        true,
        "enemy behavior must be exposed as a simulation capability"
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
    const projectileKinds = [
        new HomingProjectileObject({
            id: "homing-capability-probe",
            ownerId: player.id,
            targetId: target.id,
            position: { x: 0, y: 0 },
            velocity: { x: 0, y: 0 },
            damage: 1,
            radius: 1
        }),
        new BallisticProjectileObject({
            id: "ballistic-capability-probe",
            ownerId: target.id,
            targetId: player.id,
            position: { x: 0, y: 0 },
            velocity: { x: 0, y: 0 },
            damage: 1,
            radius: 1
        })
    ];
    assert.ok(
        projectileKinds.every((projectile) => projectile instanceof SimulationDrivenObject),
        "directly uncontrolled projectiles must be SimulationDrivenObjects"
    );
    assert.equal(
        projectileKinds.every((projectile) => projectile.hasSimulationCapability("projectile-motion")),
        true,
        "projectiles must expose one polymorphic motion capability"
    );
    assert.equal(
        projectileKinds.every((projectile) => projectile.hasSimulationCapability("client-projectile-collision")),
        true,
        "projectiles must own client collision behavior instead of leaving type branches in the runtime store"
    );
    assert.equal(projectileKinds[0].replicationState(42).predictionId, `${player.id}:42`);
    assert.equal(projectileKinds[0].replicationState(42).objectType, "player-projectile");
    assert.equal(projectileKinds[1].replicationState(42).predictionId, null);
    assert.equal(projectileKinds[1].replicationState(42).objectType, "enemy-projectile");
    assert.throws(
        () => new CounterInputObject({ id: "broken", ownerId: "" }),
        /ownerId/,
        "invalid ownership must fail before input dispatch"
    );
}
