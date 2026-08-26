import { AugmentLoadoutState } from "../augments/AugmentLoadoutState.js";
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
import { CombatStatusEffectPool } from "../status-effects/CombatStatusEffectPool.js";
import { PlayerExperienceState } from "../experience/PlayerExperienceState.js";
import { CapturedSlamMotionState } from "../interactions/CapturedSlamMotionState.js";

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
    const augmentLoadout = new AugmentLoadoutState();
    const augmentCombat = new AugmentCombatRuntime({ maxHealth: combatConfig.playerMaxHealth });
    const statusEffects = new CombatStatusEffectPool();
    const experience = new PlayerExperienceState();
    const ropeObject = new RopeObject({ id: `${id}:rope`, ownerId: id, rope });
    const weapon = new AutomaticWeaponObject({ id: `${id}:weapon`, ownerId: id, config: combatConfig });
    const ropeImpactAttack = new RopeImpactAttack(ROPE_IMPACT_CONFIG);
    const ropeImpactState = new RopeImpactState(ROPE_IMPACT_CONFIG);
    const capturedSlamMotion = new CapturedSlamMotionState();
    const entity = new PlayerObject({
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
        capturedSlamMotion,
        combatConfig,
        respawnAnchorId
    });
    const inputDrivenObjects = Object.freeze([entity, ropeObject]);
    return Object.freeze({
        collider,
        physics,
        rope,
        ropeObject,
        augmentLoadout,
        augmentCombat,
        statusEffects,
        experience,
        weapon,
        ropeImpactAttack,
        ropeImpactState,
        capturedSlamMotion,
        entity,
        inputDrivenObjects
    });
}
