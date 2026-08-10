import { run as playerCommandBatch } from "./playerCommandBatch.mjs";
import { run as authorityServerSession } from "./authorityServerSession.mjs";
import { run as localPlayerPredictor } from "./localPlayerPredictor.mjs";
import { run as multiplayerGameServer } from "./multiplayerGameServer.mjs";
import { run as remoteGameAuthority } from "./remoteGameAuthority.mjs";
import { run as predictableProjectileStore } from "./predictableProjectileStore.mjs";
import { run as multiplayerServerEndpoint } from "./multiplayerServerEndpoint.mjs";
import { run as gameServerHandler } from "./gameServerHandler.mjs";
import { run as artifactSelectionClaim } from "./artifactSelectionClaim.mjs";

const steps = {
    artifactSelectionClaim,
    playerCommandBatch,
    authorityServerSession,
    localPlayerPredictor,
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
