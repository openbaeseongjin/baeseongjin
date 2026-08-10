import { createWorldSnapshotEnvelope } from "../network/WorldSnapshotEnvelope.js";
import { WORLD_GENERATION_REVISION } from "../world/WorldGenerator.js";

export function buildAuthoritySnapshot({ simulation, acknowledgements = {} }) {
    return createWorldSnapshotEnvelope({
        serverTick: simulation.getTick(),
        worldSeed: simulation.world.seed,
        worldRevision: WORLD_GENERATION_REVISION,
        acknowledgements,
        state: {
            players: simulation.playerStates(),
            enemies: simulation.enemyStates(),
            activeCheckpointId: simulation.activeCheckpoint?.id ?? null,
            rewardedCheckpointIds: [...simulation.rewardedCheckpointIds],
            artifactReward: simulation.getArtifactReward(simulation.getPrimaryPlayerId()),
            artifactRewards: Object.fromEntries(simulation.artifactRewards),
            runState: simulation.runState,
            metrics: simulation.metrics.snapshot(),
            completed: simulation.runState === "completed"
        },
        events: simulation.drainReplicationEvents()
    });
}
