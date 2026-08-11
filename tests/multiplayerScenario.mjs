import { run as playerCommandBatch } from "./playerCommandBatch.mjs";
import { run as authorityServerSession } from "./authorityServerSession.mjs";
import { run as ownerPredictionRuntime } from "./ownerPredictionRuntime.mjs";
import { run as multiplayerGameServer } from "./multiplayerGameServer.mjs";
import { run as remoteGameAuthority } from "./remoteGameAuthority.mjs";
import { run as predictableProjectileStore } from "./predictableProjectileStore.mjs";
import { run as multiplayerServerEndpoint } from "./multiplayerServerEndpoint.mjs";
import { run as gameServerHandler } from "./gameServerHandler.mjs";
import { run as artifactSelectionClaim } from "./artifactSelectionClaim.mjs";
import { run as checkpointClaim } from "./checkpointClaim.mjs";
import { run as summitClaim } from "./summitClaim.mjs";
import { run as projectileHitClaim } from "./projectileHitClaim.mjs";
import { run as playerProjectileSpawnClaim } from "./playerProjectileSpawnClaim.mjs";

const steps = {
    artifactSelectionClaim,
    checkpointClaim,
    summitClaim,
    projectileHitClaim,
    playerProjectileSpawnClaim,
    playerCommandBatch,
    authorityServerSession,
    ownerPredictionRuntime,
    multiplayerGameServer,
    remoteGameAuthority,
    predictableProjectileStore,
    multiplayerServerEndpoint,
    gameServerHandler
};

export async function run() {
    for (const [name, step] of Object.entries(steps)) {
        try {
            await step();
        } catch (error) {
            error.message = `multiplayer/${name}: ${error.message}`;
            throw error;
        }
    }
}
