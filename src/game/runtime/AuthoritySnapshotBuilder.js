import { createWorldSnapshotEnvelope } from "../network/WorldSnapshotEnvelope.js";
import { WORLD_GENERATION_REVISION } from "../world/WorldGenerator.js";

function vectorState(vector) {
    return vector ? { x: vector.x, y: vector.y } : null;
}

function swingDragState(swingDrag) {
    if (!swingDrag) return null;
    return {
        origin: vectorState(swingDrag.origin),
        direction: vectorState(swingDrag.direction),
        progress: swingDrag.progress,
        age: swingDrag.age,
        used: swingDrag.used
    };
}

function playerState(player, simulation) {
    return {
        id: player.id,
        position: vectorState(player.physics.position),
        velocity: vectorState(player.physics.velocity),
        isGrounded: player.physics.isGrounded,
        health: player.health,
        maxHealth: player.maxHealth,
        hitInvulnerabilityRemaining: player.hitInvulnerabilityRemaining,
        ropeDisabledRemaining: player.ropeDisabledRemaining,
        lifeState: player.lifeState,
        rope: {
            isAttached: player.rope.isAttached,
            anchor: vectorState(player.rope.anchor),
            length: player.rope.length,
            currentLength: player.rope.currentLength,
            tension: player.rope.tension
        },
        control: {
            aimWorld: vectorState(player.aimWorld),
            lastPointer: { ...player.lastPointer },
            lastViewport: { ...player.lastViewport },
            wasPointerDown: player.wasPointerDown,
            attachBufferRemaining: player.attachBufferRemaining,
            swingDrag: swingDragState(player.swingDrag)
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
            artifactRewards: Object.fromEntries(simulation.artifactRewards),
            runState: simulation.runState,
            metrics: simulation.metrics.snapshot(),
            completed: simulation.runState === "completed"
        },
        events: simulation.drainReplicationEvents()
    });
}
