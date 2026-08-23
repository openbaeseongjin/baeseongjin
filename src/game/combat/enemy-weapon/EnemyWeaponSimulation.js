import { createSimulationCapabilityMixin } from "../../simulation/SimulationCapability.js";
import { advanceEnemyPatrol } from "../EnemyPatrol.js";
import { ENEMY_SIMULATION_CAPABILITY, ENEMY_WEAPON_CONFIG } from "./EnemyWeaponDefinition.js";
import { EnemyWeaponState } from "./EnemyWeaponState.js";
import { visibleEnemyTargets } from "./EnemyWeaponTargeting.js";

const withWeaponCapability = createSimulationCapabilityMixin({
    id: ENEMY_SIMULATION_CAPABILITY.WEAPON,
    order: ENEMY_WEAPON_CONFIG.WEAPON_ORDER,
    apply({ targets, registerProjectile, registry, config, surfaces = [], dt }) {
        const result = this.weaponState.advance(this, {
            visibleTargets: visibleEnemyTargets(this, targets, surfaces),
            range: this.weaponRange ?? config.enemyAttackRange,
            registerProjectile,
            registry,
            config,
            dt
        });
        if (result.shouldAdvancePatrol) advanceEnemyPatrol(this, dt);
        return result.spawnedProjectile;
    }
});

export function withEnemyWeaponSimulation(Base) {
    return class extends withWeaponCapability(Base) {
        constructor(options = {}) {
            super(options);
            Object.defineProperty(this, "weaponState", {
                value: new EnemyWeaponState(options),
                enumerable: false,
                writable: false
            });
        }
    };
}

export const withEnemyPhysicsSimulation = createSimulationCapabilityMixin({
    id: ENEMY_SIMULATION_CAPABILITY.PHYSICS,
    order: ENEMY_WEAPON_CONFIG.PHYSICS_ORDER,
    apply({ dt, surfaces = [], collisionActors = [], collisionBroadPhase = null }) {
        this.beginSurfacePhysicsStep();
        return this.advanceEnemyPhysicsStep(dt, surfaces, collisionActors, collisionBroadPhase);
    }
});
