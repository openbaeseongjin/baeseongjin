import { withLocomotionInput } from "../input/LocomotionInput.js";
import { InputDrivenObject } from "../objects/InputDrivenObject.js";

export class PlayerObject extends withLocomotionInput(InputDrivenObject) {
    constructor({ id, physics, ropeObject, artifacts, weapon, combatConfig }) {
        super({ id, ownerId: id });
        this.physics = physics;
        this.ropeObject = ropeObject;
        this.artifacts = artifacts;
        this.lastCheckpointLoss = [];
        this.ropeDamageBoostRemaining = 0;
        this.weapon = weapon;
        this.health = combatConfig.playerMaxHealth;
        this.maxHealth = combatConfig.playerMaxHealth;
        this.hitInvulnerabilityRemaining = 0;
        this.ropeDisabledRemaining = 0;
        this.lifeState = "active";
    }
}
