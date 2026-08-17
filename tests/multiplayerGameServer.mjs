import assert from "node:assert/strict";
import { createServer } from "node:http";
import { WebSocket } from "ws";
import { Vector2 } from "../src/game-kit/index.js";
import { createPlayerCommand } from "../src/game/commands/PlayerCommand.js";
import { BallisticProjectileObject } from "../src/game/combat/ProjectileObject.js";
import { deserializeCommandReceipt } from "../src/game/network/CommandReceipt.js";
import {
    createFoundationSelectionClaim,
    serializeFoundationSelectionClaim
} from "../src/game/network/FoundationSelectionClaim.js";
import { serializePlayerCommandBatch } from "../src/game/network/PlayerCommandBatch.js";
import { deserializeWorldSnapshotEnvelope } from "../src/game/network/WorldSnapshotEnvelope.js";
import { RemoteCommandStream } from "../src/game/runtime/RemoteCommandStream.js";
import { MultiplayerGameServer } from "../src/server/MultiplayerGameServer.js";
import { createGameSimulationForWorldRevision } from "../src/game/simulation/GameSimulationFactory.js";
import { DEFAULT_AUTHORED_AREA_CATALOG } from "../src/game/world/AuthoredWorldFactory.js";

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
    const worldSeeds = [111, 222, 333];
    const multiplayer = new MultiplayerGameServer(httpServer, {
        channelNumber: () => channelNumbers.shift(),
        worldSeed: () => worldSeeds.shift(),
        createSimulation: (options) =>
            createGameSimulationForWorldRevision({
                ...options,
                worldRevision: DEFAULT_AUTHORED_AREA_CATALOG.revision
            })
    });
    await new Promise((resolve) => httpServer.listen(0, "127.0.0.1", resolve));
    const { port } = httpServer.address();
    const baseUrl = `ws://127.0.0.1:${port}/multiplayer`;
    const { socket: first, message: firstWelcome } = await connectFor(`${baseUrl}?channel=new`, "welcome");
    const url = `${baseUrl}?channel=${firstWelcome.channelId}`;
    const sharedRoom = multiplayer.rooms.get(firstWelcome.channelId);
    const activeEnemyProjectile = new BallisticProjectileObject({
        id: "mid-join-enemy-projectile",
        ownerId: "enemy-mid-join",
        targetId: firstWelcome.playerId,
        position: new Vector2(-500, -500),
        velocity: new Vector2(0, 0),
        damage: 20,
        radius: 7
    });
    sharedRoom.simulation.enemyProjectiles.push(activeEnemyProjectile);
    sharedRoom.simulation.recordProjectileSpawn(activeEnemyProjectile, "enemy-projectile");
    sharedRoom.adapter.snapshot();
    const { socket: second, message: secondWelcome } = await connectFor(url, "welcome");
    assert.equal(firstWelcome.channelId, "1234");
    assert.equal(deserializeWorldSnapshotEnvelope(firstWelcome.snapshot).worldSeed, 111);
    assert.notEqual(firstWelcome.playerId, secondWelcome.playerId);
    const secondSnapshot = deserializeWorldSnapshotEnvelope(secondWelcome.snapshot);
    assert.equal(secondSnapshot.worldSeed, 111);
    assert.equal(secondSnapshot.state.players.length, 2);
    assert.equal(
        secondSnapshot.events.find(({ objectId }) => objectId === activeEnemyProjectile.id)?.eventType,
        "spawn",
        "a later joiner must receive the original spawn event for each active predictable object"
    );
    assert.equal(Object.hasOwn(secondSnapshot.state, "enemyProjectiles"), false);

    const { socket: isolated, message: isolatedWelcome } = await connectFor(`${baseUrl}?channel=new`, "welcome");
    assert.equal(isolatedWelcome.channelId, "5678");
    assert.equal(deserializeWorldSnapshotEnvelope(isolatedWelcome.snapshot).worldSeed, 222);
    assert.equal(
        deserializeWorldSnapshotEnvelope(isolatedWelcome.snapshot).state.players.length,
        1,
        "different channels must own independent worlds"
    );
    isolated.close();
    await closed(isolated);

    const stream = new RemoteCommandStream({ playerId: firstWelcome.playerId, inputLeadTicks: 30 });
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
    const batch = stream.createBatch(sharedRoom.simulation.getTick(), command);
    first.send(JSON.stringify({ type: "command", payload: serializePlayerCommandBatch(batch) }));
    const receipt = deserializeCommandReceipt((await nextMessage(first, "receipt")).payload);
    assert.equal(receipt.accepted[0].playerId, firstWelcome.playerId);
    const snapshot = deserializeWorldSnapshotEnvelope((await nextMessage(first, "snapshot")).payload);
    assert.ok(snapshot.serverTick > initial.serverTick);

    multiplayer.stopClock(sharedRoom);
    for (const area of sharedRoom.simulation.world.areas.slice(0, 3)) {
        for (const objectiveId of area.objectiveIds) sharedRoom.simulation.worldProgress.completeObjective(objectiveId);
        sharedRoom.simulation.worldProgress.crossGate(area.gateId);
    }
    sharedRoom.simulation.restoreWorldProgress(sharedRoom.simulation.worldProgress.snapshot());
    const foundationPlayer = sharedRoom.simulation.players.find(({ id }) => id === firstWelcome.playerId);
    const foundationNode = sharedRoom.simulation.world.objects.find(({ id }) => id === "sector-01-04:maintenance-node");
    foundationPlayer.physics.position.set(foundationNode.position.x, foundationNode.position.y);
    sharedRoom.simulation.beginFoundationReward(foundationPlayer.id, foundationNode.id, foundationNode.objectiveId);
    first.send(
        JSON.stringify({
            type: "foundation-selection",
            payload: serializeFoundationSelectionClaim(
                createFoundationSelectionClaim({
                    sourceId: foundationNode.id,
                    foundationId: "impulse-coil",
                    clientTick: sharedRoom.simulation.getTick()
                })
            )
        })
    );
    const foundationReceipt = (await nextMessage(first, "foundation-selection-receipt")).payload;
    assert.equal(foundationReceipt.accepted, true);
    assert.equal(sharedRoom.simulation.playerState(firstWelcome.playerId).foundationAugment, "impulse-coil");
    multiplayer.startClock(sharedRoom);

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

    const { socket: fresh, message: freshWelcome } = await connectFor(
        `${baseUrl}?channel=new&snapshotAck=1`,
        "welcome"
    );
    const freshSnapshot = deserializeWorldSnapshotEnvelope(freshWelcome.snapshot);
    assert.equal(freshSnapshot.worldSeed, 333, "a newly created room must receive a new world seed");
    assert.equal(freshSnapshot.state.players.length, 1);
    assert.ok(freshSnapshot.serverTick <= 1, "an empty room must be discarded before the next first player joins");
    assert.equal(freshWelcome.snapshotFlowControl, true, "new clients must negotiate bounded snapshot delivery");

    const freshRoom = multiplayer.rooms.get(freshWelcome.channelId);
    multiplayer.stopClock(freshRoom);
    const serverSocket = [...freshRoom.sockets.keys()][0];
    const delivery = multiplayer.snapshotDeliveryBySocket.get(serverSocket);
    assert.equal(delivery.flowControlled, true);
    await waitFor(() => {
        if (delivery.unacknowledgedSequences.length === 0 && delivery.pendingSnapshot === null) return true;
        fresh.send(
            JSON.stringify({
                type: "snapshot-ack",
                snapshotSequence: delivery.highestSentSequence
            })
        );
        return false;
    }, "the negotiated client must be able to clear its initial snapshot window");

    const receivedSnapshots = [];
    fresh.on("message", (data) => {
        const message = JSON.parse(data.toString());
        if (message.type === "snapshot") {
            receivedSnapshots.push(deserializeWorldSnapshotEnvelope(message.payload));
        }
    });
    let latestFlowSnapshot = null;
    for (let index = 0; index < 10; index += 1) {
        freshRoom.simulation.recordReplicationEvent("flow-control-probe", { marker: index });
        if (index === 9) freshRoom.simulation.enemies[0].health = 17;
        const payload = freshRoom.adapter.snapshot();
        latestFlowSnapshot = deserializeWorldSnapshotEnvelope(payload);
        multiplayer.broadcast(freshRoom, { type: "snapshot", payload });
    }
    assert.equal(
        delivery.unacknowledgedSequences.length,
        multiplayer.maxUnacknowledgedSnapshots,
        "a stalled receiver must keep a fixed snapshot window"
    );
    assert.equal(
        delivery.pendingSnapshot.snapshot.snapshotSequence,
        latestFlowSnapshot.snapshotSequence,
        "backpressure must retain only the newest unsent state"
    );
    assert.deepEqual(
        delivery.pendingSnapshot.snapshot.events.map(({ marker }) => marker),
        [4, 5, 6, 7, 8, 9],
        "coalescing must preserve every unsent gameplay event"
    );

    fresh.send(
        JSON.stringify({
            type: "snapshot-ack",
            snapshotSequence: delivery.unacknowledgedSequences[0]
        })
    );
    await waitFor(
        () =>
            delivery.pendingSnapshot === null &&
            delivery.unacknowledgedSequences.includes(latestFlowSnapshot.snapshotSequence),
        "one acknowledgement must release the newest coalesced snapshot"
    );
    await waitFor(
        () =>
            receivedSnapshots.some(({ snapshotSequence }) => snapshotSequence === latestFlowSnapshot.snapshotSequence),
        "the receiver must get the newest state instead of replaying every stale snapshot"
    );
    const receivedLatest = receivedSnapshots.find(
        ({ snapshotSequence }) => snapshotSequence === latestFlowSnapshot.snapshotSequence
    );
    assert.equal(receivedLatest.state.enemies[0].health, 17, "the newest enemy health must cross the bounded window");
    assert.deepEqual(
        receivedLatest.events.map(({ marker }) => marker),
        [4, 5, 6, 7, 8, 9],
        "the newest snapshot must carry events accumulated while it was pending"
    );
    fresh.send(
        JSON.stringify({
            type: "snapshot-ack",
            snapshotSequence: latestFlowSnapshot.snapshotSequence
        })
    );
    await waitFor(
        () => delivery.unacknowledgedSequences.length === 0,
        "a cumulative acknowledgement must release the whole delivered window"
    );
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
