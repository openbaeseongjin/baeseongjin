import { SimulationDispatcher } from "../simulation/SimulationDispatcher.js";
import { ENEMY_BEHAVIOR_KIND } from "./enemy-behavior/EnemyBehaviorDefinition.js";
import { ENEMY_SIMULATION_CAPABILITY } from "./enemy-weapon/EnemyWeaponDefinition.js";
import { SwarmFlockRegistry } from "./enemy-behavior/SwarmFlock.js";

export { ArtilleryEnemyBehavior } from "./enemy-behavior/ArtilleryEnemyBehavior.js";
export { JammerEnemyBehavior } from "./enemy-behavior/JammerEnemyBehavior.js";
export { PursuitEnemyBehavior } from "./enemy-behavior/PursuitEnemyBehavior.js";
export { ShieldEnemyBehavior } from "./enemy-behavior/ShieldEnemyBehavior.js";
export { SupportEnemyBehavior } from "./enemy-behavior/SupportEnemyBehavior.js";
export { SwarmEnemyBehavior } from "./enemy-behavior/SwarmEnemyBehavior.js";

export const ENEMY_BEHAVIOR_CAPABILITY = ENEMY_SIMULATION_CAPABILITY.BEHAVIOR;

const simulationDispatcher = new SimulationDispatcher();

export function advanceEnemyBehaviors({ enemies, targets, dt }) {
    if (!Array.isArray(enemies)) throw new Error("enemies must be an array");
    if (!Array.isArray(targets)) throw new Error("targets must be an array");
    const swarmFlocks = new SwarmFlockRegistry(enemies, targets);
    return Object.freeze(
        simulationDispatcher
            .dispatch({
                objects: enemies,
                capabilityId: ENEMY_BEHAVIOR_CAPABILITY,
                context: { enemies, targets, swarmFlocks, dt }
            })
            .map(({ object, result }) => Object.freeze({ enemyId: object.id, result }))
            .filter(({ result }) => result !== null)
    );
}

export { ENEMY_BEHAVIOR_KIND };
