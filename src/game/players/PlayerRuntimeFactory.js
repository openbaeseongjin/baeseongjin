import { ArtifactInventory } from "../artifacts/ArtifactInventory.js";
import { PlayerPhysics } from "../physics/PlayerPhysics.js";
import { FixedLengthRope } from "../rope/FixedLengthRope.js";

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
    const physics = new PlayerPhysics(playerConfig);
    if (spawn) physics.reset(spawn);
    const rope = new FixedLengthRope(ropeConfig);
    const artifacts = new ArtifactInventory(artifactConfig);
    const entity = {
        id: playerId ?? registry.createId("player"),
        physics,
        rope,
        artifacts,
        lastCheckpointLoss: [],
        aimWorld: Object.freeze({ x: 0, y: 0 }),
        attachmentCandidate: null,
        wasPointerDown: false,
        lastPointer: Object.freeze({ x: 0, y: 0, down: false }),
        lastViewport: Object.freeze({ width: 1, height: 1 }),
        attachBufferRemaining: 0,
        swingDrag: null,
        ropeDamageBoostRemaining: 0,
        weapon: {
            range: combatConfig.weaponRange,
            baseDamage: combatConfig.weaponDamage,
            damage: combatConfig.weaponDamage,
            baseFireInterval: combatConfig.fireInterval,
            fireInterval: combatConfig.fireInterval,
            cooldown: 0
        },
        health: combatConfig.playerMaxHealth,
        maxHealth: combatConfig.playerMaxHealth,
        hitInvulnerabilityRemaining: 0,
        ropeDisabledRemaining: 0,
        lifeState: "active"
    };
    return Object.freeze({ physics, rope, artifacts, entity });
}
