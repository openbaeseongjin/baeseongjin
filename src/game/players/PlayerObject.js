import { withLocomotionInput } from "../input/LocomotionInput.js";
import { InputDrivenObject } from "../objects/InputDrivenObject.js";

export class PlayerObject extends withLocomotionInput(InputDrivenObject) {
    constructor({ id, physics, ropeObject, foundation, augmentCombat, weapon, ropeImpactAttack, combatConfig }) {
        super({ id, ownerId: id });
        this.physics = physics;
        this.ropeObject = ropeObject;
        this.foundation = foundation;
        this.augmentCombat = augmentCombat;
        this.weapon = weapon;
        this.ropeImpactAttack = ropeImpactAttack;
        this.health = combatConfig.playerMaxHealth;
        this.maxHealth = combatConfig.playerMaxHealth;
        this.hitInvulnerabilityRemaining = 0;
        this.ropeDisabledRemaining = 0;
        this.lifeState = "active";
    }
}
