import { Vector2 } from "../../game-kit/index.js";
import { SimulationDrivenObject } from "../objects/SimulationDrivenObject.js";
import { defineObjectOwner } from "../objects/GameObject.js";
import { createSimulationCapabilityMixin } from "../simulation/SimulationCapability.js";
import { selectNearestEnemy } from "./CombatTargeting.js";
import { HomingProjectileObject } from "./ProjectileObject.js";

const withAutomaticWeaponSimulation = createSimulationCapabilityMixin({
    id: "automatic-weapon",
    order: 10,
    apply({ owner, enemies, registerProjectile, registry, config, dt, allowFire = true }) {
        this.cooldown = Math.max(0, this.cooldown - dt);
        if (!this.isEnabled || owner.lifeState !== "active" || !allowFire || this.cooldown > 0) return null;
        const target = selectNearestEnemy(owner.physics.position, enemies, this.range);
        if (!target) return null;
        const spawnPosition = this.projectileSpawnPosition(owner, target);
        const projectile = new HomingProjectileObject({
            id: registry.createId("projectile"),
            ownerId: owner.id,
            targetId: target.id,
            position: new Vector2(spawnPosition.x, spawnPosition.y),
            velocity: new Vector2(),
            speed: config.projectileSpeed,
            damage: this.damage,
            radius: this.projectileRadius
        });
        registerProjectile(projectile);
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
        this.projectileRadius = config.projectileRadius;
        this.projectileSpawnClearance = config.projectileSpawnClearance;
        this.isEnabled = config.automaticWeaponEnabled === true;
        this.cooldown = 0;
    }

    projectileSpawnPosition(owner, target) {
        if (!owner?.physics?.position || !owner.physics.collider) {
            throw new Error("automatic weapon requires owner physics and collider");
        }
        if (!target?.position) throw new Error("automatic weapon requires a target position");
        return owner.physics.collider.outsidePointToward(
            owner.physics.position,
            target.position,
            this.projectileRadius + this.projectileSpawnClearance
        );
    }
}
