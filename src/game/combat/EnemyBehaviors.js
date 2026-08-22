import { SimulationDispatcher } from "../simulation/SimulationDispatcher.js";
import { ENEMY_BEHAVIOR_KIND } from "./enemy-behavior/EnemyBehaviorDefinition.js";
import { ENEMY_SIMULATION_CAPABILITY } from "./enemy-weapon/EnemyWeaponDefinition.js";

export { ArtilleryEnemyBehavior } from "./enemy-behavior/ArtilleryEnemyBehavior.js";
export { PursuitEnemyBehavior } from "./enemy-behavior/PursuitEnemyBehavior.js";
export { ShieldEnemyBehavior } from "./enemy-behavior/ShieldEnemyBehavior.js";
export { SupportEnemyBehavior } from "./enemy-behavior/SupportEnemyBehavior.js";
export { SwarmEnemyBehavior } from "./enemy-behavior/SwarmEnemyBehavior.js";

export const ENEMY_BEHAVIOR_CAPABILITY = ENEMY_SIMULATION_CAPABILITY.BEHAVIOR;

const simulationDispatcher = new SimulationDispatcher();

export function advanceEnemyBehaviors({ enemies, targets, dt }) {
    if (!Array.isArray(enemies)) throw new Error("enemies must be an array");
    if (!Array.isArray(targets)) throw new Error("targets must be an array");
    return Object.freeze(
        simulationDispatcher
            .dispatch({
                objects: enemies,
                capabilityId: ENEMY_BEHAVIOR_CAPABILITY,
                context: { enemies, targets, dt }
            })
            .map(({ object, result }) => Object.freeze({ enemyId: object.id, result }))
            .filter(({ result }) => result !== null)
    );
}

export { ENEMY_BEHAVIOR_KIND };
