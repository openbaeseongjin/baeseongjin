import assert from "node:assert/strict";
import { createServer } from "node:http";
import { WebSocket } from "ws";
import { RemoteGameAuthority, multiplayerUrl } from "../src/game/runtime/RemoteGameAuthority.js";
import { MultiplayerGameServer } from "../src/server/MultiplayerGameServer.js";

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
    const httpServer = createServer();
    const gameServer = new MultiplayerGameServer(httpServer);
    const port = await listen(httpServer);
    try {
        assert.equal(multiplayerUrl({ protocol: "https:", host: "example.test" }), "wss://example.test/multiplayer");
        const authority = new RemoteGameAuthority({
            url: `ws://127.0.0.1:${port}/multiplayer`,
            WebSocketImpl: WebSocket
        });
        await authority.connect();
        const initial = authority.snapshot();
        assert.equal(initial.state.players.length, 1);
        assert.equal(initial.predicted.position.x, initial.state.players[0].position.x);
        assert.equal(
            authority.submit({
                horizontal: 1,
                vertical: 0,
                interact: false,
                pointer: { x: 0, y: 0, down: false, pressed: false, released: false },
                viewport: { width: 800, height: 600 },
                aimWorld: { x: 100, y: 100 }
            }),
            true
        );
        assert.equal(authority.stream.pendingBatches().length, 1);
        const partner = new RemoteGameAuthority({
            url: `ws://127.0.0.1:${port}/multiplayer`,
            WebSocketImpl: WebSocket
        });
        await partner.connect();
        await waitFor(
            () => authority.snapshot().state.players.length === 2,
            "both clients should observe the shared open world"
        );
        assert.equal(partner.snapshot().state.players.length, 2);
        partner.close();
        authority.close();
    } finally {
        await gameServer.close();
        await new Promise((resolve) => httpServer.close(resolve));
    }
}
