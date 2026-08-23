import { FoundationAugmentState } from "../augments/FoundationAugmentState.js";
import { AugmentCombatRuntime } from "../augments/AugmentCombatRuntime.js";
import { AutomaticWeaponObject } from "../combat/AutomaticWeaponObject.js";
import { RopeImpactAttack } from "../combat/RopeImpactAttack.js";
import { RopeImpactState } from "../combat/RopeImpactState.js";
import { ROPE_IMPACT_CONFIG } from "../config.js";
import { PlayerPhysics } from "../physics/PlayerPhysics.js";
import { CircleCollider } from "../physics/colliders/CircleCollider.js";
import { FixedLengthRope } from "../rope/FixedLengthRope.js";
import { RopeObject } from "../rope/RopeObject.js";
import { PlayerObject } from "./PlayerObject.js";
import { PlayerStatusEffects } from "../status-effects/PlayerStatusEffects.js";

export function createPlayerRuntime({
    registry,
    playerConfig,
    ropeConfig,
    combatConfig,
    spawn,
    playerId = null,
    respawnAnchorId = null
}) {
    if (playerId !== null && (typeof playerId !== "string" || playerId.length === 0)) {
        throw new Error("playerId must be a non-empty string");
    }
    const id = playerId ?? registry.createId("player");
    const collider = new CircleCollider({ radius: playerConfig.radius });
    const physics = new PlayerPhysics(playerConfig, { collider });
    if (spawn) physics.reset(spawn);
    const rope = new FixedLengthRope(ropeConfig);
    const foundation = new FoundationAugmentState();
    const augmentCombat = new AugmentCombatRuntime({ maxHealth: combatConfig.playerMaxHealth });
    const statusEffects = new PlayerStatusEffects();
    const ropeObject = new RopeObject({ id: `${id}:rope`, ownerId: id, rope });
    const weapon = new AutomaticWeaponObject({ id: `${id}:weapon`, ownerId: id, config: combatConfig });
    const ropeImpactAttack = new RopeImpactAttack(ROPE_IMPACT_CONFIG);
    const ropeImpactState = new RopeImpactState(ROPE_IMPACT_CONFIG);
    const entity = new PlayerObject({
        id,
        physics,
        ropeObject,
        foundation,
        augmentCombat,
        statusEffects,
        weapon,
        ropeImpactAttack,
        ropeImpactState,
        combatConfig,
        respawnAnchorId
    });
    const inputDrivenObjects = Object.freeze([entity, ropeObject]);
    return Object.freeze({
        collider,
        physics,
        rope,
        ropeObject,
        foundation,
        augmentCombat,
        statusEffects,
        weapon,
        ropeImpactAttack,
        ropeImpactState,
        entity,
        inputDrivenObjects
    });
}
