import { Vector2 } from "../../game-kit/index.js";
import { SimulationDrivenObject } from "../objects/SimulationDrivenObject.js";
import { defineObjectOwner } from "../objects/GameObject.js";
import { createSimulationCapabilityMixin } from "../simulation/SimulationCapability.js";
import { selectNearestEnemy } from "./CombatTargeting.js";
import { HomingProjectileObject } from "./ProjectileObject.js";

const withAutomaticWeaponSimulation = createSimulationCapabilityMixin({
    id: "automatic-weapon",
    order: 10,
    apply({ owner, enemies, projectiles, registry, config, dt, allowFire = true }) {
        this.cooldown = Math.max(0, this.cooldown - dt);
        if (owner.lifeState !== "active" || !allowFire || this.cooldown > 0) return null;
        const target = selectNearestEnemy(owner.physics.position, enemies, this.range);
        if (!target) return null;
        const projectile = new HomingProjectileObject({
            id: registry.createId("projectile"),
            ownerId: owner.id,
            targetId: target.id,
            position: owner.physics.position.clone(),
            velocity: new Vector2(),
            damage: this.damage,
            radius: config.projectileRadius
        });
        projectiles.push(projectile);
        this.cooldown = this.fireInterval;
        return projectile;
    }
});

export class AutomaticWeaponObject extends withAutomaticWeaponSimulation(SimulationDrivenObject) {
    constructor({ id, ownerId, config }) {
        super({ id });
        defineObjectOwner(this, ownerId);
        this.range = config.weaponRange;
        this.baseDamage = config.weaponDamage;
        this.damage = config.weaponDamage;
        this.baseFireInterval = config.fireInterval;
        this.fireInterval = config.fireInterval;
        this.cooldown = 0;
    }
}
