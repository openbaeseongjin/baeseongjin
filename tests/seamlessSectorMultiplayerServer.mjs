import assert from "node:assert/strict";
import { createServer } from "node:http";
import { WebSocket } from "ws";
import { deserializeWorldSnapshotEnvelope } from "../src/game/network/WorldSnapshotEnvelope.js";
import { MultiplayerGameServer } from "../src/server/MultiplayerGameServer.js";

function connectFor(url, type, timeoutMs = 2000) {
    return new Promise((resolve, reject) => {
        const socket = new WebSocket(url);
        const timeout = setTimeout(() => reject(new Error(`timed out connecting for ${type}`)), timeoutMs);
        socket.on("message", (data) => {
            const message = JSON.parse(data.toString());
            if (message.type !== type) return;
            clearTimeout(timeout);
            resolve({ socket, message });
        });
        socket.once("error", reject);
    });
}

function closed(socket) {
    if (socket.readyState === WebSocket.CLOSED) return Promise.resolve();
    return new Promise((resolve) => socket.once("close", resolve));
}

export async function run() {
    const httpServer = createServer((_request, response) => response.end("ok"));
    const multiplayer = new MultiplayerGameServer(httpServer, {
        channelNumber: () => 4321,
        worldSeed: () => 9182
    });
    await new Promise((resolve) => httpServer.listen(0, "127.0.0.1", resolve));
    const { port } = httpServer.address();
    const baseUrl = `ws://127.0.0.1:${port}/multiplayer`;
    const { socket: first, message: firstWelcome } = await connectFor(`${baseUrl}?channel=new`, "welcome");
    const room = multiplayer.rooms.get(firstWelcome.channelId);
    multiplayer.stopClock(room);
    const firstLandmark = room.simulation.world.landmarks[0];
    for (const objectiveId of firstLandmark.objectiveIds) room.simulation.worldProgress.completeObjective(objectiveId);
    room.simulation.worldProgress.visitLandmark(firstLandmark.outboundRouteId.split(":route:")[1]);
    room.simulation.restoreWorldProgress(room.simulation.worldProgress.snapshot());
    room.simulation.players[0].physics.position.set(1200, -900);

    const { socket: second, message: secondWelcome } = await connectFor(
        `${baseUrl}?channel=${firstWelcome.channelId}`,
        "welcome"
    );
    const snapshot = deserializeWorldSnapshotEnvelope(secondWelcome.snapshot);
    const joined = snapshot.state.players.find(({ id }) => id === secondWelcome.playerId);
    const anchor = room.simulation.activeRespawnAnchor.position;
    assert.equal(snapshot.state.progressKind, "sector");
    assert.equal(snapshot.state.respawnAnchorId, "sector-01:landmark:02:checkpoint");
    assert.equal(snapshot.state.partyWipeBaseline.respawnAnchorId, "sector-01:entry");
    assert.equal(snapshot.state.worldProgress.currentLandmarkId, "sector-01:landmark:02");
    assert.equal(joined.position.x, anchor.x);
    assert.equal(joined.position.y, anchor.y);
    assert.equal("activeCheckpointId" in snapshot.state, false);

    first.close();
    second.close();
    await Promise.all([closed(first), closed(second)]);
    await multiplayer.close();
    await new Promise((resolve) => httpServer.close(resolve));
}
