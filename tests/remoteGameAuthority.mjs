import assert from "node:assert/strict";
import { createServer } from "node:http";
import { WebSocket } from "ws";
import { Vector2 } from "../src/game-kit/index.js";
import { MultiplayerGameApp } from "../src/game/MultiplayerGameApp.js";
import { ProjectileObject } from "../src/game/combat/ProjectileObject.js";
import { WORLD_CONFIG } from "../src/game/config.js";
import { RemoteGameAuthority } from "../src/game/runtime/RemoteGameAuthority.js";
import { RemoteWorldStateBuffer } from "../src/game/runtime/RemoteWorldStateBuffer.js";
import { closestPointOnSurface } from "../src/game/world/WorldGenerator.js";
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
        aimWorld: { x: 100, y: 100 },
        mobileControls: { left: false, right: false, jump: false, visible: false }
    };
}

function distance(left, right) {
    return Math.hypot(left.x - right.x, left.y - right.y);
}

function fakeCanvas() {
    return {
        clientWidth: 844,
        clientHeight: 390,
        getContext: () => ({}),
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 844, height: 390 })
    };
}

function nearestRopeAnchor(world, position) {
    return world.surfaces
        .map((surface) => closestPointOnSurface(position, surface))
        .reduce((nearest, point) =>
            Math.hypot(point.x - position.x, point.y - position.y) <
            Math.hypot(nearest.x - position.x, nearest.y - position.y)
                ? point
                : nearest
        );
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
    assert.ok(
        Math.abs(projected.players[1].position.x - 3) <= 0.5,
        "remote players must interpolate between known snapshots"
    );
    assert.ok(
        Math.abs(projected.enemies[0].position.x - 6) <= 1,
        "enemies must share the delayed interpolation timeline"
    );
    assert.equal(projected.players[1].health, 80, "non-position state must use the latest authority value");
    projected = interpolation.sample({ now: 170, localPlayerId: "local" });
    assert.ok(
        Math.abs(projected.players[1].position.x - 13) <= 0.5,
        "missing future samples may use bounded extrapolation"
    );
    assert.ok(interpolation.metrics().extrapolationMs > 0);
    projected = interpolation.sample({ now: 1000, localPlayerId: "local" });
    assert.equal(projected.players[1].position.x, 18, "extrapolation must stop at its bounded horizon");
    assert.equal(interpolation.metrics().extrapolationMs, 120);
    assert.equal(interpolation.metrics().maxExtrapolationMs, 120);

    const driftingClock = new RemoteWorldStateBuffer({
        interpolationSeconds: 0.1,
        maxExtrapolationSeconds: 0.12,
        maxSnapshots: 8
    });
    for (let index = 0; index < 200; index += 1) {
        driftingClock.push(snapshot(6 + index * 6, index * 6), index * 60);
    }
    driftingClock.sample({ now: 199 * 60, localPlayerId: "local" });
    assert.equal(
        driftingClock.metrics().extrapolationMs,
        0,
        "fresh snapshots must keep a drifting local clock on the interpolation timeline"
    );
    assert.ok(
        driftingClock.metrics().maxClockCorrectionMs <= 50,
        "one snapshot must not shift the estimated server clock by more than one snapshot interval"
    );

    const fallMessages = [];
    const fallenState = {
        tick: 42,
        position: { x: 300, y: WORLD_CONFIG.floorY + 781 },
        velocity: { x: 0, y: 900 },
        isGrounded: false,
        rope: { isAttached: false, anchor: null }
    };
    const locallyRespawnedState = {
        ...fallenState,
        position: { x: 120, y: 500 },
        velocity: { x: 0, y: 0 }
    };
    const fallAuthority = new RemoteGameAuthority({
        url: "ws://fall.test/multiplayer",
        WebSocketImpl: { OPEN: 1 }
    });
    fallAuthority.socket = {
        readyState: 1,
        send: (serialized) => fallMessages.push(JSON.parse(serialized))
    };
    fallAuthority.ownerRuntime = {
        advance: () => fallenState,
        state: () => fallenState,
        reconcile: () => locallyRespawnedState,
        metrics: () => ({}),
        predictFall: () => {
            assert.equal(fallMessages[0]?.type, "owner-motion", "the fall claim must precede prediction reset");
            return locallyRespawnedState;
        }
    };
    assert.equal(fallAuthority.advance(movementCommand()), locallyRespawnedState);
    assert.equal(fallMessages[0].type, "owner-motion", "the fallen position must be claimed before local respawn");
    fallAuthority.latestSnapshot = { serverTick: 42 };
    fallAuthority.stream = { pendingBatches: () => [] };
    let rejectedMotionReconciliations = 0;
    fallAuthority.ownerRuntime.reconcile = (_snapshot, _pending, options) => {
        rejectedMotionReconciliations += 1;
        assert.equal(options.rebaseMotion, true);
        return locallyRespawnedState;
    };
    assert.equal(fallAuthority.recordOwnerMotionReceipt({ clientTick: 42, accepted: true }), true);
    assert.equal(fallAuthority.recordOwnerMotionReceipt({ clientTick: 43, accepted: false, reason: "test" }), true);
    assert.equal(rejectedMotionReconciliations, 1, "a rejected owner state must rebase from the latest snapshot");
    assert.equal(fallAuthority.metrics().acceptedOwnerMotions, 1);
    assert.equal(fallAuthority.metrics().rejectedOwnerMotions, 1);
    assert.equal(
        fallAuthority.recordOwnerMotionReceipt({ clientTick: 43, accepted: false, reason: "duplicate" }),
        false,
        "duplicate owner receipts must not trigger another correction"
    );
    fallAuthority.recordHitClaimReceipt({ predictionId: "player-1:42", accepted: false, reason: "test" });
    assert.equal(fallAuthority.drainHitClaimReceipts()[0].predictionId, "player-1:42");

    const checkpointMessages = [];
    const checkpointAuthority = new RemoteGameAuthority({
        url: "ws://checkpoint.test/multiplayer",
        WebSocketImpl: { OPEN: 1 }
    });
    checkpointAuthority.socket = {
        readyState: 1,
        send: (serialized) => checkpointMessages.push(JSON.parse(serialized))
    };
    checkpointAuthority.ownerRuntime = {
        state: () => ({
            tick: 50,
            position: { x: 240, y: 320 },
            velocity: { x: 10, y: 0 },
            isGrounded: true,
            rope: { isAttached: false, anchor: null }
        }),
        checkpointClaimCandidate: () => ({
            checkpointId: "checkpoint-test",
            clientTick: 50,
            position: { x: 240, y: 320 },
            feedbackPosition: { x: 240, y: 320 }
        })
    };
    const predictedCheckpoint = checkpointAuthority.submitReachedCheckpoint();
    assert.equal(predictedCheckpoint.checkpointId, "checkpoint-test");
    assert.deepEqual(
        checkpointMessages.map(({ type }) => type),
        ["owner-motion", "checkpoint-claim"],
        "the latest owner state must precede its checkpoint claim"
    );
    assert.equal(checkpointAuthority.submitReachedCheckpoint(), null, "one checkpoint claim may be pending at a time");
    checkpointAuthority.recordCheckpointClaimReceipt({
        checkpointId: "checkpoint-test",
        accepted: false,
        reason: "test-rejection"
    });
    assert.equal(checkpointAuthority.pendingCheckpointId, null);
    assert.equal(checkpointAuthority.drainCheckpointClaimReceipts().length, 1);

    const summitMessages = [];
    const summitAuthority = new RemoteGameAuthority({
        url: "ws://summit.test/multiplayer",
        WebSocketImpl: { OPEN: 1 }
    });
    summitAuthority.socket = {
        readyState: 1,
        send: (serialized) => summitMessages.push(JSON.parse(serialized))
    };
    summitAuthority.ownerRuntime = {
        state: () => ({
            tick: 60,
            position: { x: 480, y: 80 },
            velocity: { x: 0, y: 0 },
            isGrounded: true,
            rope: { isAttached: false, anchor: null }
        }),
        summitClaimCandidate: () => ({
            clientTick: 60,
            position: { x: 480, y: 80 },
            feedbackPosition: { x: 480, y: 80 }
        })
    };
    const predictedSummit = summitAuthority.submitReachedSummit();
    assert.deepEqual(predictedSummit.feedbackPosition, { x: 480, y: 80 });
    assert.deepEqual(
        summitMessages.map(({ type }) => type),
        ["owner-motion", "summit-claim"],
        "the latest owner state must precede its summit claim"
    );
    assert.equal(summitAuthority.submitReachedSummit(), null, "only one summit claim may be pending");
    summitAuthority.recordSummitClaimReceipt({ accepted: false, reason: "test-rejection" });
    assert.equal(summitAuthority.pendingSummitClaim, false);
    assert.equal(summitAuthority.drainSummitClaimReceipts().length, 1);

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
        const predictedTick = authority.snapshot().owner.tick;
        assert.ok(Number.isSafeInteger(authority.renderSnapshot().world.seed));
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
        const authorityPlayer = room.simulation.players.find(({ id }) => id === authority.playerId);
        const receiptProjectile = new ProjectileObject({
            id: "impact-receipt-projectile",
            ownerId: "impact-receipt-enemy",
            targetId: authority.playerId,
            position: authorityPlayer.physics.position.clone(),
            velocity: new Vector2(0, 0),
            damage: 20,
            radius: 7
        });
        room.simulation.enemyProjectiles.push(receiptProjectile);
        assert.equal(
            authority.submitImpactClaim({
                projectileId: receiptProjectile.id,
                clientTick: authority.snapshot().owner.tick,
                resolution: "player-hit",
                position: authorityPlayer.physics.position
            }),
            true
        );
        await waitFor(
            () => authority.impactClaimReceipts.length > 0,
            "impact claim receipts must reach the client authority"
        );
        const impactReceipt = authority.drainImpactClaimReceipts()[0];
        assert.equal(impactReceipt.projectileId, receiptProjectile.id);
        assert.equal(impactReceipt.accepted, true);
        const hitTarget = room.simulation.enemies[0];
        const playerProjectile = new ProjectileObject({
            id: "player-hit-receipt-projectile",
            ownerId: authority.playerId,
            targetId: hitTarget.id,
            predictionId: `${authority.playerId}:hit-receipt`,
            position: hitTarget.position.clone(),
            velocity: new Vector2(0, 0),
            damage: 10,
            radius: 5
        });
        room.simulation.projectiles.push(playerProjectile);
        const hitTargetHealthBeforeClaim = hitTarget.health;
        assert.equal(
            authority.submitHitClaim({
                predictionId: playerProjectile.predictionId,
                targetId: hitTarget.id,
                clientTick: authority.snapshot().owner.tick,
                position: hitTarget.position
            }),
            true
        );
        await waitFor(() => authority.hitClaimReceipts.length > 0, "hit claim receipts must reach the attacker");
        const hitReceipt = authority.drainHitClaimReceipts()[0];
        assert.equal(hitReceipt.predictionId, playerProjectile.predictionId);
        assert.equal(hitReceipt.accepted, true);
        const expectedHitTargetHealth = hitTargetHealthBeforeClaim - playerProjectile.damage;
        assert.equal(hitTarget.health, expectedHitTargetHealth);
        await waitFor(
            () =>
                authority.snapshot().state.enemies.find(({ id }) => id === hitTarget.id)?.health ===
                expectedHitTargetHealth,
            "the attacker must converge on the server enemy health"
        );
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
        const checkpointObserver = new RemoteGameAuthority({
            url: `ws://127.0.0.1:${port}/multiplayer?channel=${authority.channelId}`,
            WebSocketImpl: WebSocket
        });
        await checkpointObserver.connect();
        assert.equal(
            checkpointObserver.snapshot().state.enemies.find(({ id }) => id === hitTarget.id)?.health,
            expectedHitTargetHealth,
            "a later peer must join with the same confirmed enemy health"
        );
        authorityPlayer.physics.position.set(rewardCheckpoint.x, rewardCheckpoint.y);
        authorityPlayer.physics.velocity.set(0, 0);
        authority.ownerRuntime.simulation.restoreOwnerPrediction(
            authority.playerId,
            room.simulation.playerState(authority.playerId),
            authority.snapshot().owner.tick
        );
        app.update(1 / 120, movementCommand(0));
        assert.equal(
            app.checkpointFeedback?.checkpointId,
            rewardCheckpoint.id,
            "the owner must show checkpoint feedback before the server snapshot"
        );
        await waitFor(
            () => room.simulation.activeCheckpoint.id === rewardCheckpoint.id,
            "the checkpoint claim must advance the shared server world"
        );
        await waitFor(
            () => authority.snapshot().state.activeCheckpointId === rewardCheckpoint.id,
            "the accepted checkpoint must converge back through the shared snapshot"
        );
        const observedCheckpointEvents = [];
        await waitFor(() => {
            observedCheckpointEvents.push(...checkpointObserver.drainEvents());
            return observedCheckpointEvents.some(
                ({ eventType, checkpointId }) =>
                    eventType === "checkpoint-reached" && checkpointId === rewardCheckpoint.id
            );
        }, "the other client must receive the shared checkpoint event");
        checkpointObserver.close();
        const ownerBeforeAttach = authority.snapshot().owner;
        const anchor = nearestRopeAnchor(authority.renderSnapshot().world, ownerBeforeAttach.position);
        const attachCommand = {
            ...movementCommand(0),
            pointer: { x: 420, y: 120, down: true, pressed: true, released: false },
            aimWorld: { x: anchor.x, y: anchor.y }
        };
        authority.advance(attachCommand);
        assert.equal(
            authority.snapshot().owner.rope.isAttached,
            true,
            "the owner must attach through prediction input"
        );
        assert.equal(authority.submit(attachCommand), true);
        await waitFor(
            () => authorityPlayer.ropeObject.rope.isAttached,
            "the server must receive the predicted rope attachment"
        );
        const releaseTickBefore = authority.snapshot().owner.tick;
        const pendingCommandsBefore = authority.stream.pendingBatches().length;
        const authorityRopeTickBefore = room.session.lastOwnerRopeTicks.get(authority.playerId) ?? -1;
        app.input.onPointerDown({ pointerType: "mouse", pointerId: 91, clientX: 420, clientY: 120 });
        app.input.onPointerLeave({ pointerType: "mouse", pointerId: 91, relatedTarget: null });
        assert.equal(
            authority.snapshot().owner.rope.isAttached,
            false,
            "leaving for browser chrome must release owner prediction without waiting for another frame"
        );
        assert.equal(authority.snapshot().owner.tick, releaseTickBefore + 1);
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
        assert.equal(authorityPlayer.ropeObject.rope.isAttached, false);
        let renderedState = null;
        app.renderer.draw = (state) => {
            renderedState = state;
        };
        app.render();
        assert.equal(
            renderedState.world.seed,
            authority.renderSnapshot().world.seed,
            "the multiplayer renderer must receive its local world through the authority contract"
        );
        assert.deepEqual(renderedState.attachmentCandidate, authority.renderSnapshot().attachmentCandidate);
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
        await new Promise((resolve) => setTimeout(resolve, 700));
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
        const authorityStartX = room.simulation.playerState(authority.playerId).position.x;
        const partnerStartX = room.simulation.playerState(partner.playerId).position.x;
        for (let index = 0; index < 36; index += 1) {
            authority.advance(movementCommand(1));
            authority.submit(movementCommand(1));
            partner.advance(movementCommand(1));
            partner.submit(movementCommand(1));
            await new Promise((resolve) => setTimeout(resolve, 8));
        }
        await waitFor(
            () => room.simulation.playerState(authority.playerId).position.x > authorityStartX + 0.1,
            "the first client must keep moving after a later client joins"
        );
        await waitFor(
            () => room.simulation.playerState(partner.playerId).position.x > partnerStartX + 0.1,
            "the later client must move in the same authority world"
        );
        await waitFor(
            () =>
                authority.snapshot().state.players.find(({ id }) => id === partner.playerId).position.x >
                    partnerStartX + 0.1 &&
                partner.snapshot().state.players.find(({ id }) => id === authority.playerId).position.x >
                    authorityStartX + 0.1,
            "both clients must observe each other's movement"
        );
        let convergence = null;
        for (let index = 0; index < 180; index += 1) {
            authority.advance(movementCommand(0));
            authority.submit(movementCommand(0));
            partner.advance(movementCommand(0));
            partner.submit(movementCommand(0));
            await new Promise((resolve) => setTimeout(resolve, 8));
            if (index < 60) continue;
            const ownerState = authority.snapshot().owner;
            const serverState = room.simulation.playerState(authority.playerId);
            const partnerView = partner.snapshot().state.players.find(({ id }) => id === authority.playerId);
            convergence = {
                ownerServerPosition: distance(ownerState.position, serverState.position),
                partnerServerPosition: distance(partnerView.position, serverState.position),
                ownerServerVelocity: distance(ownerState.velocity, serverState.velocity),
                partnerServerVelocity: distance(partnerView.velocity, serverState.velocity),
                ropeMatches:
                    ownerState.rope.isAttached === serverState.rope.isAttached &&
                    partnerView.rope.isAttached === serverState.rope.isAttached
            };
            if (
                convergence.ownerServerPosition <= 4 &&
                convergence.partnerServerPosition <= 4 &&
                convergence.ownerServerVelocity <= 20 &&
                convergence.partnerServerVelocity <= 20 &&
                convergence.ropeMatches
            ) {
                break;
            }
        }
        assert.ok(
            convergence.ownerServerPosition <= 4,
            `owner and server must converge after neutral input: ${JSON.stringify(convergence)}`
        );
        assert.ok(
            convergence.partnerServerPosition <= 4,
            `partner and server must converge after neutral input: ${JSON.stringify(convergence)}`
        );
        assert.ok(
            convergence.ownerServerVelocity <= 20 && convergence.partnerServerVelocity <= 20,
            `all player velocities must converge after neutral input: ${JSON.stringify(convergence)}`
        );
        assert.equal(convergence.ropeMatches, true, "owner, server, and partner must share rope attachment state");

        const summit = room.simulation.world.summit;
        authorityPlayer.physics.position.set(summit.x, summit.y);
        authorityPlayer.physics.velocity.set(0, 0);
        authority.ownerRuntime.simulation.restoreOwnerPrediction(
            authority.playerId,
            room.simulation.playerState(authority.playerId),
            authority.snapshot().owner.tick
        );
        app.update(1 / 120, movementCommand(0));
        assert.equal(app.localRunCompleted, true, "the owner must complete locally before the server snapshot");
        app.render();
        assert.equal(renderedState.runState, "completed", "the local completion overlay must not wait for a receipt");
        await waitFor(
            () => room.simulation.runState === "completed",
            "the summit claim must complete the shared world"
        );
        await waitFor(
            () =>
                authority.snapshot().state.runState === "completed" &&
                partner.snapshot().state.runState === "completed",
            "both clients must converge on the completed run state"
        );
        const observedSummitEvents = [];
        await waitFor(() => {
            observedSummitEvents.push(...partner.drainEvents());
            return observedSummitEvents.some(
                ({ eventType, playerId }) => eventType === "run-completed" && playerId === authority.playerId
            );
        }, "the other client must receive the shared run completion event");
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
