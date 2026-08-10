import { ArtifactInventory } from "../artifacts/ArtifactInventory.js";
import { PlayerPhysics } from "../physics/PlayerPhysics.js";
import { FixedLengthRope } from "../rope/FixedLengthRope.js";

export function createPlayerRuntime({ registry, playerConfig, ropeConfig, combatConfig, artifactConfig, spawn }) {
    const physics = new PlayerPhysics(playerConfig);
    if (spawn) physics.reset(spawn);
    const rope = new FixedLengthRope(ropeConfig);
    const artifacts = new ArtifactInventory(artifactConfig);
    const entity = {
        id: registry.createId("player"),
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
        lifeState: "active",
        downedRemaining: 0,
        reviveProgress: 0
    };
    return Object.freeze({ physics, rope, artifacts, entity });
}
