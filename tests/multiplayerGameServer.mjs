import assert from "node:assert/strict";
import { createServer } from "node:http";
import { WebSocket } from "ws";
import { createPlayerCommand } from "../src/game/commands/PlayerCommand.js";
import { deserializeCommandReceipt } from "../src/game/network/CommandReceipt.js";
import { serializePlayerCommandBatch } from "../src/game/network/PlayerCommandBatch.js";
import { deserializeWorldSnapshotEnvelope } from "../src/game/network/WorldSnapshotEnvelope.js";
import { RemoteCommandStream } from "../src/game/runtime/RemoteCommandStream.js";
import { MultiplayerGameServer } from "../src/server/MultiplayerGameServer.js";

function nextMessage(socket, type, timeoutMs = 2000) {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error(`timed out waiting for ${type}`)), timeoutMs);
        const onMessage = (data) => {
            const message = JSON.parse(data.toString());
            if (message.type !== type) return;
            clearTimeout(timeout);
            socket.off("message", onMessage);
            resolve(message);
        };
        socket.on("message", onMessage);
    });
}

function connectFor(url, type, timeoutMs = 2000, options = {}) {
    return new Promise((resolve, reject) => {
        const socket = new WebSocket(url, options);
        const timeout = setTimeout(() => reject(new Error(`timed out connecting for ${type}`)), timeoutMs);
        socket.on("message", (data) => {
            const message = JSON.parse(data.toString());
            if (message.type !== type) return;
            clearTimeout(timeout);
            resolve({ socket, message });
        });
        socket.once("error", (error) => {
            clearTimeout(timeout);
            reject(error);
        });
    });
}

function closed(socket) {
    if (socket.readyState === WebSocket.CLOSED) return Promise.resolve();
    return new Promise((resolve) => socket.once("close", resolve));
}

async function waitFor(predicate, message) {
    const deadline = Date.now() + 1000;
    while (Date.now() < deadline) {
        if (predicate()) return;
        await new Promise((resolve) => setTimeout(resolve, 5));
    }
    throw new Error(message);
}

export async function run() {
    const httpServer = createServer((_request, response) => response.end("ok"));
    const channelNumbers = [1234, 5678, 9012];
    const multiplayer = new MultiplayerGameServer(httpServer, { channelNumber: () => channelNumbers.shift() });
    await new Promise((resolve) => httpServer.listen(0, "127.0.0.1", resolve));
    const { port } = httpServer.address();
    const baseUrl = `ws://127.0.0.1:${port}/multiplayer`;
    const { socket: first, message: firstWelcome } = await connectFor(`${baseUrl}?channel=new`, "welcome");
    const url = `${baseUrl}?channel=${firstWelcome.channelId}`;
    const { socket: second, message: secondWelcome } = await connectFor(url, "welcome");
    assert.equal(firstWelcome.channelId, "1234");
    assert.notEqual(firstWelcome.playerId, secondWelcome.playerId);
    assert.equal(deserializeWorldSnapshotEnvelope(secondWelcome.snapshot).state.players.length, 2);

    const { socket: isolated, message: isolatedWelcome } = await connectFor(`${baseUrl}?channel=new`, "welcome");
    assert.equal(isolatedWelcome.channelId, "5678");
    assert.equal(
        deserializeWorldSnapshotEnvelope(isolatedWelcome.snapshot).state.players.length,
        1,
        "different channels must own independent worlds"
    );
    isolated.close();
    await closed(isolated);

    const stream = new RemoteCommandStream({ playerId: firstWelcome.playerId, inputLeadTicks: 6 });
    const initial = deserializeWorldSnapshotEnvelope(firstWelcome.snapshot);
    const command = createPlayerCommand(
        {
            horizontal: 1,
            vertical: 0,
            pointer: { x: 0, y: 0, down: false },
            viewport: { width: 1280, height: 720 }
        },
        { x: 0, y: 0 }
    );
    const batch = stream.createBatch(initial.serverTick, command);
    first.send(JSON.stringify({ type: "command", payload: serializePlayerCommandBatch(batch) }));
    const receipt = deserializeCommandReceipt((await nextMessage(first, "receipt")).payload);
    assert.equal(receipt.accepted[0].playerId, firstWelcome.playerId);
    const snapshot = deserializeWorldSnapshotEnvelope((await nextMessage(first, "snapshot")).payload);
    assert.ok(snapshot.serverTick > initial.serverTick);

    const { socket: third, message: roomFull } = await connectFor(url, "error");
    assert.equal(roomFull.code, "channel-full");
    await closed(third);

    const tickBeforeLeave = snapshot.serverTick;
    const playerLeft = nextMessage(second, "player-left");
    first.close();
    assert.equal((await playerLeft).playerId, firstWelcome.playerId);
    assert.equal(second.readyState, WebSocket.OPEN, "the remaining player must keep the open world alive");

    const { socket: replacement, message: replacementWelcome } = await connectFor(url, "welcome");
    const continued = deserializeWorldSnapshotEnvelope(replacementWelcome.snapshot);
    assert.equal(continued.state.players.length, 2);
    assert.ok(continued.serverTick >= tickBeforeLeave, "a replacement player must join the existing world");
    replacement.close();
    await closed(replacement);
    second.close();
    await closed(second);
    await waitFor(() => !multiplayer.rooms.has("1234"), "an empty channel must delete its world");

    const { socket: missing, message: missingChannel } = await connectFor(url, "error");
    assert.equal(missingChannel.code, "channel-not-found");
    missing.close();
    await closed(missing);

    const { socket: fresh, message: freshWelcome } = await connectFor(`${baseUrl}?channel=new`, "welcome");
    const freshSnapshot = deserializeWorldSnapshotEnvelope(freshWelcome.snapshot);
    assert.equal(freshSnapshot.state.players.length, 1);
    assert.ok(freshSnapshot.serverTick <= 1, "an empty room must be discarded before the next first player joins");
    fresh.close();
    await closed(fresh);

    await multiplayer.close();
    await new Promise((resolve) => httpServer.close(resolve));

    const securedHttpServer = createServer((_request, response) => response.end("ok"));
    const secured = new MultiplayerGameServer(securedHttpServer, {
        allowedOrigins: ["https://openbaeseongjin.github.io"]
    });
    await new Promise((resolve) => securedHttpServer.listen(0, "127.0.0.1", resolve));
    const securedUrl = `ws://127.0.0.1:${securedHttpServer.address().port}/multiplayer?channel=new`;
    await assert.rejects(connectFor(securedUrl, "welcome"), /403/);
    await assert.rejects(
        connectFor(securedUrl, "welcome", 2000, {
            origin: "https://untrusted.example"
        }),
        /403/
    );
    const { socket: authorized } = await connectFor(securedUrl, "welcome", 2000, {
        origin: "https://openbaeseongjin.github.io"
    });
    authorized.close();
    await closed(authorized);
    await secured.close();
    await new Promise((resolve) => securedHttpServer.close(resolve));
}
