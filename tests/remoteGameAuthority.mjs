import assert from "node:assert/strict";
import { createServer } from "node:http";
import { WebSocket } from "ws";
import { MultiplayerGameApp } from "../src/game/MultiplayerGameApp.js";
import { RemoteGameAuthority } from "../src/game/runtime/RemoteGameAuthority.js";
import { RemoteWorldStateBuffer } from "../src/game/runtime/RemoteWorldStateBuffer.js";
import { MultiplayerGameServer } from "../src/server/MultiplayerGameServer.js";

function createImpairedWebSocket({ roundTripDelayMs, commandLossRate }) {
    const oneWayDelayMs = roundTripDelayMs / 2;
    return class ImpairedWebSocket extends WebSocket {
        static sentCommands = 0;
        static droppedCommands = 0;

        constructor(...args) {
            super(...args);
            this.lossAccumulator = 0;
        }

        addEventListener(type, listener, options) {
            if (type !== "message" || oneWayDelayMs === 0) return super.addEventListener(type, listener, options);
            return super.addEventListener(
                type,
                (event) => setTimeout(() => listener.call(this, event), oneWayDelayMs),
                options
            );
        }

        send(data) {
            const message = JSON.parse(data.toString());
            if (message.type === "command") {
                ImpairedWebSocket.sentCommands += 1;
                this.lossAccumulator += commandLossRate;
                if (this.lossAccumulator >= 1) {
                    this.lossAccumulator -= 1;
                    ImpairedWebSocket.droppedCommands += 1;
                    return;
                }
            }
            if (oneWayDelayMs === 0) {
                super.send(data);
                return;
            }
            setTimeout(() => {
                if (this.readyState === WebSocket.OPEN) super.send(data);
            }, oneWayDelayMs);
        }
    };
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

function fakeCanvas() {
    return {
        clientWidth: 844,
        clientHeight: 390,
        getContext: () => ({}),
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 844, height: 390 })
    };
}

function listen(server) {
    return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server.address().port)));
}

async function waitFor(predicate, message, timeoutMs = 1500) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        if (predicate()) return;
        await new Promise((resolve) => setTimeout(resolve, 10));
    }
    throw new Error(message);
}

export async function run() {
    const interpolation = new RemoteWorldStateBuffer({
        interpolationSeconds: 0.05,
        maxExtrapolationSeconds: 0.12,
        maxSnapshots: 3
    });
    const snapshot = (serverTick, remoteX, health = 100) => ({
        serverTick,
        state: {
            players: [
                { id: "local", position: { x: remoteX, y: 0 }, velocity: { x: 100, y: 0 } },
                { id: "remote", position: { x: remoteX, y: 0 }, velocity: { x: 100, y: 0 }, health }
            ],
            enemies: [{ id: "enemy", position: { x: remoteX * 2, y: 0 }, health }]
        },
        events: []
    });
    interpolation.push(snapshot(6, 0), 0);
    interpolation.push(snapshot(12, 6, 80), 70);
    let projected = interpolation.sample({ now: 75, localPlayerId: "local" });
    assert.equal(projected.players[0].position.x, 6, "the local player must use owner prediction instead");
    assert.equal(projected.players[1].position.x, 3, "remote players must interpolate between known snapshots");
    assert.equal(projected.enemies[0].position.x, 6, "enemies must share the delayed interpolation timeline");
    assert.equal(projected.players[1].health, 80, "non-position state must use the latest authority value");
    projected = interpolation.sample({ now: 170, localPlayerId: "local" });
    assert.ok(
        Math.abs(projected.players[1].position.x - 13) < 1e-9,
        "missing future samples may use bounded extrapolation"
    );
    assert.ok(interpolation.metrics().extrapolationMs > 0);
    projected = interpolation.sample({ now: 1000, localPlayerId: "local" });
    assert.equal(projected.players[1].position.x, 18, "extrapolation must stop at its bounded horizon");
    assert.equal(interpolation.metrics().extrapolationMs, 120);
    assert.equal(interpolation.metrics().maxExtrapolationMs, 120);

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
        await waitFor(() => authority.metrics().acceptedCommands > 0, "command receipts must update network metrics");
        assert.ok(authority.metrics().roundTripMs >= 0);
        await waitFor(() => authority.metrics().snapshotIntervalMs > 0, "snapshot cadence must be measured");
        assert.equal(authority.metrics().rejectedCommands, 0);
        assert.equal(authority.metrics().rejectionRate, 0);
        const room = gameServer.rooms.get(authority.channelId);
        const rewardCheckpoint = room.simulation.world.checkpoints[1];
        room.simulation.beginArtifactReward(rewardCheckpoint);
        await waitFor(
            () => authority.snapshot().state.artifactRewards?.[authority.playerId],
            "the client must receive its checkpoint reward"
        );
        const app = new MultiplayerGameApp({ canvas: fakeCanvas(), authority });
        app.update(1 / 120, movementCommand(0));
        app.update(1 / 120, movementCommand(1));
        assert.equal(app.localArtifactReward.selectedIndex, 1, "the selected card must move before server receipt");
        assert.equal(
            room.simulation.artifactRewards.get(authority.playerId).selectedIndex,
            0,
            "local card feedback must not wait for the authority input lead"
        );
        app.update(1 / 120, movementCommand(0));
        app.update(1 / 120, { ...movementCommand(0), vertical: -1, interact: true });
        assert.equal(app.localArtifactReward, null, "confirmation must close the local chooser immediately");
        await waitFor(
            () => !room.simulation.artifactRewards.has(authority.playerId),
            "artifact selection must resolve without waiting for a scheduled movement command"
        );
        assert.equal(
            room.simulation.players.find(({ id }) => id === authority.playerId).artifacts.snapshot()[0].id,
            "rapid-gear"
        );
        await waitFor(
            () => authority.artifactSelectionReceipts.some(({ accepted }) => accepted),
            "the selecting client must receive an artifact receipt"
        );
        const predictedPlayer = authority.predictor.simulation.playerEntity;
        const authorityPlayer = room.simulation.players.find(({ id }) => id === authority.playerId);
        assert.equal(
            predictedPlayer.rope.attach(predictedPlayer.physics.position, {
                x: predictedPlayer.physics.position.x + 40,
                y: predictedPlayer.physics.position.y - 40
            }),
            true
        );
        assert.equal(
            authorityPlayer.rope.attach(authorityPlayer.physics.position, {
                x: authorityPlayer.physics.position.x + 40,
                y: authorityPlayer.physics.position.y - 40
            }),
            true
        );
        predictedPlayer.wasPointerDown = true;
        authorityPlayer.wasPointerDown = true;
        const releaseTickBefore = authority.predictor.state().tick;
        const pendingCommandsBefore = authority.stream.pendingBatches().length;
        const authorityRopeTickBefore = room.session.lastOwnerRopeTicks.get(authority.playerId) ?? -1;
        app.input.onPointerDown({ pointerType: "mouse", pointerId: 91, clientX: 420, clientY: 120 });
        app.input.onPointerLeave({ pointerType: "mouse", pointerId: 91, relatedTarget: null });
        assert.equal(
            authority.predictor.state().rope.isAttached,
            false,
            "leaving for browser chrome must release owner prediction without waiting for another frame"
        );
        assert.equal(authority.predictor.state().tick, releaseTickBefore + 1);
        assert.equal(
            authority.stream.pendingBatches().length,
            pendingCommandsBefore + 1,
            "the release transition must bypass the normal half-rate command gate"
        );
        assert.equal(authority.stream.pendingBatches().at(-1).commands[0].command.pointer.down, false);
        await waitFor(
            () => (room.session.lastOwnerRopeTicks.get(authority.playerId) ?? -1) > authorityRopeTickBefore,
            "the server must receive the immediate owner rope release"
        );
        assert.equal(authorityPlayer.rope.isAttached, false);
        const acceptedBeforeDuplicate = authority.metrics().acceptedCommands;
        authority.sentAtBySequence.set(999, authority.now() - 20);
        authority.recordReceipt({
            accepted: [],
            rejected: [{ playerId: authority.playerId, sequence: 999, reason: "test-rejection" }]
        });
        assert.equal(authority.metrics().rejectedCommands, 1);
        assert.ok(authority.metrics().rejectionRate > 0);
        authority.recordReceipt({
            accepted: [],
            rejected: [{ playerId: authority.playerId, sequence: 999, reason: "test-rejection" }]
        });
        assert.equal(authority.metrics().acceptedCommands, acceptedBeforeDuplicate);
        assert.equal(authority.metrics().rejectedCommands, 1, "duplicate receipts must not skew diagnostics");
        for (let sequence = 2000; sequence < 5000; sequence += 1) {
            authority.trackSentCommand(sequence, authority.now());
        }
        assert.equal(authority.metrics().trackedCommands, 2048, "lost commands must keep a fixed tracking bound");
        authority.pruneSentCommands(4500);
        assert.ok(authority.metrics().trackedCommands < 500, "later authority ACKs must prune lost command timings");
        authority.trackSentCommand(6000, authority.now() - 25);
        authority.recordReceipt({ accepted: [{ playerId: authority.playerId, sequence: 6000 }], rejected: [] });
        assert.ok(authority.metrics().roundTripMs > 0, "bounded tracking must preserve recent RTT samples");
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

        for (const roundTripDelayMs of [0, 50, 100, 200]) {
            for (const commandLossRate of [0, 0.02, 0.05]) {
                const ProfileWebSocket = createImpairedWebSocket({ roundTripDelayMs, commandLossRate });
                const impaired = new RemoteGameAuthority({
                    url: `ws://127.0.0.1:${port}/multiplayer?channel=new`,
                    WebSocketImpl: ProfileWebSocket
                });
                await impaired.connect();
                const authoritativeStartX = impaired.snapshot().state.players[0].position.x;
                const beforeInput = impaired.snapshot().predicted;
                const immediate = impaired.advance(movementCommand());
                assert.equal(immediate.tick, beforeInput.tick + 1);
                assert.ok(
                    immediate.velocity.x > beforeInput.velocity.x,
                    `${roundTripDelayMs}ms RTT/${commandLossRate * 100}% must not delay local input`
                );
                for (let index = 0; index < 60; index += 1) {
                    impaired.advance(movementCommand());
                    impaired.submit(movementCommand());
                    await new Promise((resolve) => setTimeout(resolve, 8));
                }
                try {
                    await waitFor(
                        () =>
                            impaired.snapshot().state.players.find(({ id }) => id === impaired.playerId).position.x >
                            authoritativeStartX + 0.1,
                        `${roundTripDelayMs}ms RTT/${commandLossRate * 100}% must keep authority moving`,
                        3000
                    );
                } catch (error) {
                    const authorityX = impaired.snapshot().state.players.find(({ id }) => id === impaired.playerId)
                        .position.x;
                    throw new Error(
                        `${error.message}; start=${authoritativeStartX}, authority=${authorityX}, metrics=${JSON.stringify(impaired.metrics())}`
                    );
                }
                await waitFor(() => impaired.metrics().roundTripMs !== null, "the profile must produce RTT metrics");
                assert.ok(Number.isFinite(impaired.metrics().snapshotIntervalMs));
                assert.ok(Number.isFinite(impaired.metrics().correctionP95));
                assert.equal(ProfileWebSocket.sentCommands, 60);
                assert.equal(
                    ProfileWebSocket.droppedCommands,
                    Math.floor(ProfileWebSocket.sentCommands * commandLossRate)
                );
                if (roundTripDelayMs > 0) assert.ok(impaired.metrics().roundTripMs >= roundTripDelayMs * 0.75);
                impaired.close();
            }
        }
        await gameServer.close();
        gameServerClosed = true;
        await waitFor(() => authority.closed, "client should observe authority shutdown");
        assert.match(authority.closeReason, /server shutdown|종료/);
    } finally {
        if (!gameServerClosed) await gameServer.close();
        await new Promise((resolve) => httpServer.close(resolve));
    }
}
