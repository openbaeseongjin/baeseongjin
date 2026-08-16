import { run as playerCommandBatch } from "./playerCommandBatch.mjs";
import { run as authorityServerSession } from "./authorityServerSession.mjs";
import { run as ownerPredictionRuntime } from "./ownerPredictionRuntime.mjs";
import { run as multiplayerGameServer } from "./multiplayerGameServer.mjs";
import { run as remoteGameAuthority } from "./remoteGameAuthority.mjs";
import { run as predictableProjectileStore } from "./predictableProjectileStore.mjs";
import { run as multiplayerServerEndpoint } from "./multiplayerServerEndpoint.mjs";
import { run as gameServerHandler } from "./gameServerHandler.mjs";
import { run as staticHandler } from "./staticHandler.mjs";
import { run as playerWeaponMultiplayer } from "./playerWeaponMultiplayer.mjs";
import { run as foundationSelectionClaim } from "./foundationSelectionClaim.mjs";
import { run as authoredFoundationMultiplayer } from "./authoredFoundationMultiplayer.mjs";
import { run as checkpointClaim } from "./checkpointClaim.mjs";
import { run as projectileHitClaim } from "./projectileHitClaim.mjs";
import { run as playerProjectileSpawnClaim } from "./playerProjectileSpawnClaim.mjs";
import { run as worldSnapshotEnvelope } from "./worldSnapshotEnvelope.mjs";
import { run as ownerMotionState } from "./ownerMotionState.mjs";
import { run as authoredMultiplayerWorld } from "./authoredMultiplayerWorld.mjs";

const steps = {
    foundationSelectionClaim,
    authoredFoundationMultiplayer,
    checkpointClaim,
    projectileHitClaim,
    playerProjectileSpawnClaim,
    worldSnapshotEnvelope,
    ownerMotionState,
    authoredMultiplayerWorld,
    playerCommandBatch,
    authorityServerSession,
    ownerPredictionRuntime,
    multiplayerGameServer,
    remoteGameAuthority,
    predictableProjectileStore,
    multiplayerServerEndpoint,
    gameServerHandler,
    staticHandler,
    playerWeaponMultiplayer
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
