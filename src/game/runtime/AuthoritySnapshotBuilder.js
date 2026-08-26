import { createWorldSnapshotEnvelope } from "../network/WorldSnapshotEnvelope.js";
import { createBaselineSnapshotReplication } from "../network/WorldSnapshotReplication.js";
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
    const bossStage = simulation.bossStageNetworkSnapshot();
    return createWorldSnapshotEnvelope({
        snapshotSequence,
        serverTick: simulation.getTick(),
        worldSeed: simulation.world.seed,
        worldRevision: simulation.world.definitionRevision ?? WORLD_GENERATION_REVISION,
        acknowledgements,
        replication: createBaselineSnapshotReplication({
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
            augmentRewards: Object.fromEntries(simulation.augmentRewards),
            runState: simulation.runState,
            metrics: simulation.metrics.snapshot(),
            worldProgress: simulation.worldProgress?.snapshot() ?? null,
            bossStage,
            combatInteractions: simulation.combatInteractions.snapshot(),
            worldElapsedSeconds: simulation.elapsedSeconds,
            windStates: simulation.windStateSnapshots(),
            hardpointJammerStates: simulation.hardpointJammers.snapshot(),
            completed: simulation.runState === "completed"
        }),
        events
    });
}
