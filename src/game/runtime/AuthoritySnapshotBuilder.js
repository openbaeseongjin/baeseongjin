import { createWorldSnapshotEnvelope } from "../network/WorldSnapshotEnvelope.js";
import { WORLD_GENERATION_REVISION } from "../world/WorldGenerator.js";

export function buildAuthoritySnapshot({
    simulation,
    acknowledgements = {},
    ownerMotionTicks = {},
    includeActivePredictableObjects = false,
    snapshotSequence = simulation.getTick()
}) {
    const drainedEvents = simulation.drainReplicationEvents();
    const events = includeActivePredictableObjects
        ? [
              ...new Map(
                  [...drainedEvents, ...simulation.activePredictableSpawnEvents()].map((event) => [
                      event.eventId,
                      event
                  ])
              ).values()
          ]
        : drainedEvents;
    return createWorldSnapshotEnvelope({
        snapshotSequence,
        serverTick: simulation.getTick(),
        worldSeed: simulation.world.seed,
        worldRevision: simulation.world.definitionRevision ?? WORLD_GENERATION_REVISION,
        acknowledgements,
        state: {
            players: simulation.playerStates().map((player) => ({
                ...player,
                ownerMotionTick: ownerMotionTicks[player.id] ?? simulation.getTick()
            })),
            enemies: simulation.enemyNetworkStates(),
            ...(simulation.isSeamlessSectorWorld
                ? {
                      progressKind: "sector"
                  }
                : {
                      progressKind: "area",
                      activeCheckpointId: simulation.activeCheckpoint?.id ?? null
                  }),
            foundationRewards: Object.fromEntries(simulation.foundationRewards),
            runState: simulation.runState,
            metrics: simulation.metrics.snapshot(),
            worldProgress: simulation.worldProgress?.snapshot() ?? null,
            bossStage: simulation.bossStageSnapshot(),
            bossRuntime: simulation.bossStageSnapshot(),
            worldElapsedSeconds: simulation.elapsedSeconds,
            windStates: simulation.snapshot().windStates,
            completed: simulation.runState === "completed"
        },
        events
    });
}
