import assert from "node:assert/strict";
import { createServer } from "node:http";
import { WebSocket } from "ws";
import { RemoteGameAuthority } from "../src/game/runtime/RemoteGameAuthority.js";
import { RemoteWorldStateBuffer } from "../src/game/runtime/RemoteWorldStateBuffer.js";
import { MultiplayerGameServer } from "../src/server/MultiplayerGameServer.js";

const MOBILE_NETWORK_DELAY_MS = 100;

class DelayedWebSocket extends WebSocket {
    send(data) {
        setTimeout(() => super.send(data), MOBILE_NETWORK_DELAY_MS);
    }
}

function movementCommand(horizontal = 1) {
    return {
        horizontal,
        vertical: 0,
        interact: false,
        pointer: { x: 0, y: 0, down: false, pressed: false, released: false },
        viewport: { width: 844, height: 390 },
        aimWorld: { x: 100, y: 100 }
    };
}

function listen(server) {
    return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server.address().port)));
}

async function waitFor(predicate, message) {
    const deadline = Date.now() + 1500;
    while (Date.now() < deadline) {
        if (predicate()) return;
        await new Promise((resolve) => setTimeout(resolve, 10));
    }
    throw new Error(message);
}

export async function run() {
    const deadReckoning = new RemoteWorldStateBuffer({
        maxExtrapolationSeconds: 0.12,
        correctionSeconds: 0.1
    });
    const snapshot = (serverTick, remoteX) => ({
        serverTick,
        state: {
            players: [
                { id: "local", position: { x: 0, y: 0 }, velocity: { x: 100, y: 0 } },
                { id: "remote", position: { x: remoteX, y: 0 }, velocity: { x: 100, y: 0 } }
            ]
        },
        events: []
    });
    deadReckoning.push(snapshot(6, 0), 0);
    let projected = deadReckoning.sample({ elapsedSeconds: 0.05, localPlayerId: "local" });
    assert.equal(projected.players[0].position.x, 0, "the local player must use input prediction instead");
    assert.equal(projected.players[1].position.x, 5, "a remote player must advance with its latest velocity");
    projected = deadReckoning.sample({ elapsedSeconds: 1, localPlayerId: "local" });
    assert.equal(projected.players[1].position.x, 12, "dead reckoning must stop at its bounded horizon");

    deadReckoning.push(snapshot(12, 4), 50);
    projected = deadReckoning.sample({ elapsedSeconds: 0, localPlayerId: "local" });
    assert.equal(projected.players[1].position.x, 5, "a new snapshot must preserve the prior displayed position");
    projected = deadReckoning.sample({ elapsedSeconds: 0.1, localPlayerId: "local" });
    assert.equal(projected.players[1].position.x, 14, "the correction must converge to the new authority path");

    const httpServer = createServer();
    const gameServer = new MultiplayerGameServer(httpServer);
    let gameServerClosed = false;
    const port = await listen(httpServer);
    try {
        const authority = new RemoteGameAuthority({
            url: `ws://127.0.0.1:${port}/multiplayer?channel=new`,
            WebSocketImpl: WebSocket
        });
        await authority.connect();
        const initial = authority.snapshot();
        assert.equal(initial.state.players.length, 1);
        assert.equal(initial.predicted.position.x, initial.state.players[0].position.x);
        const predictedTick = initial.predicted.tick;
        const locallyAdvanced = authority.advance(movementCommand());
        assert.equal(locallyAdvanced.tick, predictedTick + 1);
        assert.ok(locallyAdvanced.velocity.x > initial.predicted.velocity.x, "local input must react before submit");
        assert.equal(authority.submit(movementCommand()), true);
        assert.equal(authority.stream.pendingBatches().length, 1);
        assert.equal(authority.stream.pendingBatches()[0].tick, locallyAdvanced.tick);
        const partner = new RemoteGameAuthority({
            url: `ws://127.0.0.1:${port}/multiplayer?channel=${authority.channelId}`,
            WebSocketImpl: WebSocket
        });
        await partner.connect();
        await waitFor(
            () => authority.snapshot().state.players.length === 2,
            "both clients should observe the shared open world"
        );
        assert.equal(partner.snapshot().state.players.length, 2);
        partner.close();

        const delayedAuthority = new RemoteGameAuthority({
            url: `ws://127.0.0.1:${port}/multiplayer?channel=new`,
            WebSocketImpl: DelayedWebSocket
        });
        await delayedAuthority.connect();
        const delayedStartX = delayedAuthority.snapshot().state.players[0].position.x;
        const delayedBeforeInput = delayedAuthority.snapshot().predicted;
        const delayedImmediate = delayedAuthority.advance(movementCommand());
        assert.equal(delayedImmediate.tick, delayedBeforeInput.tick + 1);
        assert.ok(
            delayedImmediate.velocity.x > delayedBeforeInput.velocity.x,
            "100ms transport delay must not delay local movement response"
        );
        for (let index = 0; index < 60; index += 1) {
            delayedAuthority.advance(movementCommand());
            delayedAuthority.advance(movementCommand());
            delayedAuthority.submit(movementCommand());
            await new Promise((resolve) => setTimeout(resolve, 16));
        }
        await waitFor(
            () =>
                delayedAuthority.snapshot().state.players.find(({ id }) => id === delayedAuthority.playerId).position
                    .x >
                delayedStartX + 40,
            "mobile-latency commands must move the authoritative player"
        );
        delayedAuthority.close();
        await gameServer.close();
        gameServerClosed = true;
        await waitFor(() => authority.closed, "client should observe authority shutdown");
        assert.match(authority.closeReason, /server shutdown|종료/);
    } finally {
        if (!gameServerClosed) await gameServer.close();
        await new Promise((resolve) => httpServer.close(resolve));
    }
}
