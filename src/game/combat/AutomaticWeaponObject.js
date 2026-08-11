import { SimulationDrivenObject } from "../objects/SimulationDrivenObject.js";
import { defineObjectOwner } from "../objects/GameObject.js";

export class AutomaticWeaponObject extends SimulationDrivenObject {
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
