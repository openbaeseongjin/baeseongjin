import { createWorldSnapshotEnvelope } from "../network/WorldSnapshotEnvelope.js";
import { WORLD_GENERATION_REVISION } from "../world/WorldGenerator.js";

function vectorState(vector) {
    return vector ? { x: vector.x, y: vector.y } : null;
}

function playerState(player, simulation) {
    return {
        id: player.id,
        position: vectorState(player.physics.position),
        velocity: vectorState(player.physics.velocity),
        health: player.health,
        maxHealth: player.maxHealth,
        hitInvulnerabilityRemaining: player.hitInvulnerabilityRemaining,
        ropeDisabledRemaining: player.ropeDisabledRemaining,
        lifeState: player.lifeState,
        downedRemaining: player.downedRemaining,
        reviveProgress: player.reviveProgress,
        rope: {
            isAttached: player.rope.isAttached,
            anchor: vectorState(player.rope.anchor),
            length: player.rope.length,
            tension: player.rope.tension
        },
        weapon: {
            range: player.weapon.range,
            damage: player.weapon.damage,
            fireInterval: player.weapon.fireInterval,
            cooldown: player.weapon.cooldown
        },
        artifacts: player.artifacts.snapshot(),
        ropeDamageBoostRemaining: player.ropeDamageBoostRemaining,
        lastCheckpointLoss: player.lastCheckpointLoss
    };
}

function enemyState(enemy) {
    return {
        id: enemy.id,
        position: vectorState(enemy.position),
        level: enemy.level,
        radius: enemy.radius,
        health: enemy.health,
        maxHealth: enemy.maxHealth,
        fireCooldown: enemy.fireCooldown
    };
}

export function buildAuthoritySnapshot({ simulation, acknowledgements = {} }) {
    return createWorldSnapshotEnvelope({
        serverTick: simulation.tick,
        worldSeed: simulation.world.seed,
        worldRevision: WORLD_GENERATION_REVISION,
        acknowledgements,
        state: {
            players: simulation.players.map((player) => playerState(player, simulation)),
            enemies: simulation.enemies.map(enemyState),
            activeCheckpointId: simulation.activeCheckpoint?.id ?? null,
            rewardedCheckpointIds: [...simulation.rewardedCheckpointIds],
            artifactReward: simulation.artifactReward,
            runState: simulation.runState,
            defeatReason: simulation.defeatReason,
            restartRemaining: simulation.restartRemaining,
            completed: simulation.runState === "completed"
        },
        events: simulation.drainReplicationEvents()
    });
}
