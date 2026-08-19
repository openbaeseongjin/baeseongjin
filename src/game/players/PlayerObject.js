import { withLocomotionInput } from "../input/LocomotionInput.js";
import { InputDrivenObject } from "../objects/InputDrivenObject.js";
import { withPlayerRenderSnapshot } from "./PlayerRenderSnapshot.js";

export class PlayerObject extends withPlayerRenderSnapshot(withLocomotionInput(InputDrivenObject)) {
    constructor({
        id,
        physics,
        ropeObject,
        foundation,
        augmentCombat,
        weapon,
        ropeImpactAttack,
        combatConfig,
        respawnAnchorId = null
    }) {
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
        this.respawnAnchorId = respawnAnchorId;
    }
}
