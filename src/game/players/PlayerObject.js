import { withLocomotionInput } from "../input/LocomotionInput.js";
import { InputDrivenObject } from "../objects/InputDrivenObject.js";
import { withPlayerRenderSnapshot } from "./PlayerRenderSnapshot.js";

export class PlayerObject extends withPlayerRenderSnapshot(withLocomotionInput(InputDrivenObject)) {
    constructor({
        id,
        physics,
        ropeObject,
        augmentLoadout,
        augmentCombat,
        statusEffects,
        experience,
        weapon,
        ropeImpactAttack,
        ropeImpactState,
        combatConfig,
        respawnAnchorId = null
    }) {
        super({ id, ownerId: id });
        this.physics = physics;
        this.ropeObject = ropeObject;
        this.augmentLoadout = augmentLoadout;
        this.augmentCombat = augmentCombat;
        this.statusEffects = statusEffects;
        this.experience = experience;
        this.weapon = weapon;
        this.ropeImpactAttack = ropeImpactAttack;
        this.ropeImpactState = ropeImpactState;
        this.health = combatConfig.playerMaxHealth;
        this.maxHealth = combatConfig.playerMaxHealth;
        this.hitInvulnerabilityRemaining = 0;
        this.ropeDisabledRemaining = 0;
        this.lifeState = "active";
        this.respawnAnchorId = respawnAnchorId;
    }

    get position() {
        return this.physics.position;
    }

    get velocity() {
        return this.physics.velocity;
    }

    get collider() {
        return this.physics.collider;
    }
}
