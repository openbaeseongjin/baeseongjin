import { ArtifactInventory } from "../artifacts/ArtifactInventory.js";
import { FoundationAugmentState } from "../augments/FoundationAugmentState.js";
import { AutomaticWeaponObject } from "../combat/AutomaticWeaponObject.js";
import { PlayerPhysics } from "../physics/PlayerPhysics.js";
import { CircleCollider } from "../physics/colliders/CircleCollider.js";
import { FixedLengthRope } from "../rope/FixedLengthRope.js";
import { RopeObject } from "../rope/RopeObject.js";
import { PlayerObject } from "./PlayerObject.js";

export function createPlayerRuntime({
    registry,
    playerConfig,
    ropeConfig,
    combatConfig,
    artifactConfig,
    spawn,
    playerId = null
}) {
    if (playerId !== null && (typeof playerId !== "string" || playerId.length === 0)) {
        throw new Error("playerId must be a non-empty string");
    }
    const id = playerId ?? registry.createId("player");
    const collider = new CircleCollider({ radius: playerConfig.radius });
    const physics = new PlayerPhysics(playerConfig, { collider });
    if (spawn) physics.reset(spawn);
    const rope = new FixedLengthRope(ropeConfig);
    const artifacts = new ArtifactInventory(artifactConfig);
    const foundation = new FoundationAugmentState();
    const ropeObject = new RopeObject({ id: `${id}:rope`, ownerId: id, rope });
    const weapon = new AutomaticWeaponObject({ id: `${id}:weapon`, ownerId: id, config: combatConfig });
    const entity = new PlayerObject({
        id,
        physics,
        ropeObject,
        artifacts,
        foundation,
        weapon,
        combatConfig
    });
    const inputDrivenObjects = Object.freeze([entity, ropeObject]);
    return Object.freeze({
        collider,
        physics,
        rope,
        ropeObject,
        artifacts,
        foundation,
        weapon,
        entity,
        inputDrivenObjects
    });
}
