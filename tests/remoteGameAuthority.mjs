import assert from "node:assert/strict";
import { createServer } from "node:http";
import { WebSocket } from "ws";
import { Vector2 } from "../src/game-kit/index.js";
import { ARTIFACT_CATALOG } from "../src/game/artifacts/ArtifactCatalog.js";
import { MultiplayerGameApp } from "../src/game/MultiplayerGameApp.js";
import { ProjectileObject } from "../src/game/combat/ProjectileObject.js";
import { WORLD_CONFIG } from "../src/game/config.js";
import { createCheckpointClaim, serializeCheckpointClaim } from "../src/game/network/CheckpointClaim.js";
import { MULTIPLAYER_TIMING } from "../src/game/network/MultiplayerTiming.js";
import { RemoteCommandStream } from "../src/game/runtime/RemoteCommandStream.js";
import { RemoteGameAuthority } from "../src/game/runtime/RemoteGameAuthority.js";
import { RemoteWorldStateBuffer } from "../src/game/runtime/RemoteWorldStateBuffer.js";
import { PredictableProjectileStore } from "../src/game/runtime/PredictableProjectileStore.js";
import { GameSimulation } from "../src/game/simulation/GameSimulation.js";
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

function persistentPlayerState(player) {
    return {
        health: player.health,
        maxHealth: player.maxHealth,
        lifeState: player.lifeState,
        hitInvulnerabilityRemaining: player.hitInvulnerabilityRemaining,
        ropeDisabledRemaining: player.ropeDisabledRemaining,
        ropeDamageBoostRemaining: player.ropeDamageBoostRemaining,
        weapon: {
            range: player.weapon.range,
            damage: player.weapon.damage,
            fireInterval: player.weapon.fireInterval,
            cooldown: player.weapon.cooldown
        },
        artifacts: player.artifacts,
        lastCheckpointLoss: player.lastCheckpointLoss
    };
}

function persistentWorldState(state) {
    return {
        activeCheckpointId: state.activeCheckpointId,
        rewardedCheckpointIds: state.rewardedCheckpointIds,
        artifactRewards: state.artifactRewards,
        runState: state.runState,
        completed: state.completed
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

function armPredictedRopeSwing(authority) {
    const simulation = authority.ownerRuntime.simulation;
    const player = simulation.players.find(({ id }) => id === authority.playerId);
    const anchor = {
        x: player.physics.position.x,
        y: player.physics.position.y - 80
    };
    player.ropeObject.rope.attach(player.physics.position, anchor);
    player.ropeObject.aimWorld = { ...anchor };
    player.ropeObject.lastPointer = { x: 400, y: 300, down: true };
    player.ropeObject.lastViewport = { width: 1280, height: 720 };
    player.ropeObject.wasPointerDown = true;
    player.ropeObject.swingDrag = {
        origin: { x: 400, y: 300 },
        direction: null,
        progress: 0,
        age: 0.1,
        used: false
    };
    return {
        ...movementCommand(0),
        pointer: { x: 300, y: 300, down: true, pressed: false, released: false },
        viewport: { width: 1280, height: 720 },
        aimWorld: { ...anchor }
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
    const snapshot = (
        serverTick,
        remoteX,
        health = 100,
        snapshotSequence = serverTick,
        ownerMotionTick = serverTick + MULTIPLAYER_TIMING.inputLeadTicks
    ) => ({
        snapshotSequence,
        serverTick,
        state: {
            players: [
                {
                    id: "local",
                    position: { x: remoteX, y: 0 },
                    velocity: { x: 100, y: 0 },
                    ownerMotionTick
                },
                {
                    id: "remote",
                    position: { x: remoteX, y: 0 },
                    velocity: { x: 100, y: 0 },
                    ownerMotionTick,
                    health
                }
            ],
            enemies: [{ id: "enemy", position: { x: remoteX * 2, y: 0 }, health }]
        },
        events: []
    });
    const sameTickBuffer = new RemoteWorldStateBuffer({ interpolationSeconds: 0, maxSnapshots: 3 });
    assert.equal(sameTickBuffer.push(snapshot(12, 6, 80, 1), 0), true);
    const sameTickUpdate = {
        ...snapshot(12, 9, 70, 2),
        events: [{ eventId: "same-tick-event", eventType: "test", tick: 12 }]
    };
    assert.equal(sameTickBuffer.push(sameTickUpdate, 1), true, "a newer same-tick snapshot must be accepted");
    assert.equal(sameTickBuffer.history.length, 1, "same-tick state must replace rather than duplicate history");
    assert.equal(sameTickBuffer.sample({ now: 1, localPlayerId: "local" }).players[0].position.x, 9);
    assert.equal(sameTickBuffer.sample({ now: 1 }).players[1].health, 70);
    assert.equal(sameTickBuffer.drainEvents()[0].eventId, "same-tick-event");
    assert.equal(sameTickBuffer.push(snapshot(12, 10, 60, 2), 2), false, "duplicate sequence must be rejected");
    assert.equal(sameTickBuffer.push(snapshot(11, 10, 60, 3), 3), false, "server tick must not regress");
    const sameTickStream = new RemoteCommandStream({ playerId: "local" });
    assert.equal(sameTickStream.acceptSnapshot(snapshot(12, 6, 80, 1)), true);
    assert.equal(sameTickStream.acceptSnapshot(sameTickUpdate), true, "stream ordering must use snapshot sequence");
    assert.equal(sameTickStream.acceptSnapshot(snapshot(12, 10, 60, 2)), false);
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

    const irregularOwnerMotion = new RemoteWorldStateBuffer({
        interpolationSeconds: 0.1,
        maxExtrapolationSeconds: 0.12,
        maxSnapshots: 4
    });
    irregularOwnerMotion.push(snapshot(100, 0, 100, 100, 130), 0);
    irregularOwnerMotion.push(snapshot(106, 0, 100, 106, 130), 50);
    irregularOwnerMotion.push(snapshot(112, 12, 100, 112, 142), 100);
    const irregularProjection = irregularOwnerMotion.sample({ now: 150, localPlayerId: "local" });
    assert.equal(
        irregularProjection.players[1].position.x,
        6,
        "remote players must interpolate on ownerMotionTick instead of repeated server snapshot ticks"
    );
    assert.equal(
        irregularProjection.enemies[0].position.x,
        0,
        "server-driven enemies must remain on the server tick interpolation timeline"
    );

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
        }),
        applyPredictedCheckpoint: () => true,
        recordCheckpointReceipt: () => true
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
        const invalidAuthority = new RemoteGameAuthority({
            url: `ws://127.0.0.1:${port}/multiplayer?channel=new`,
            WebSocketImpl: WebSocket
        });
        await invalidAuthority.connect();
        const invalidRoom = gameServer.rooms.get(invalidAuthority.channelId);
        const invalidServerSocket = [...invalidRoom.sockets.keys()][0];
        invalidServerSocket.send(JSON.stringify({ type: "snapshot", payload: '{"protocolVersion":1}' }));
        await waitFor(() => invalidAuthority.closed, "an invalid follow-up snapshot must close the stale session");
        assert.match(invalidAuthority.closeReason, /서버 메시지를 처리하지 못했습니다.*unsupported world snapshot/);
        assert.equal(
            invalidAuthority.closeReason.includes("invalid server message"),
            false,
            "the socket close reason must not overwrite the actionable protocol error"
        );
        await waitFor(() => !gameServer.rooms.has(invalidAuthority.channelId), "the failed session room must close");

        const lethalOwner = new RemoteGameAuthority({
            url: `ws://127.0.0.1:${port}/multiplayer?channel=new`,
            WebSocketImpl: WebSocket
        });
        await lethalOwner.connect();
        const lethalObserver = new RemoteGameAuthority({
            url: `ws://127.0.0.1:${port}/multiplayer?channel=${lethalOwner.channelId}`,
            WebSocketImpl: WebSocket
        });
        await lethalObserver.connect();
        const lethalRoom = gameServer.rooms.get(lethalOwner.channelId);
        const lethalPlayer = lethalRoom.simulation.players.find(({ id }) => id === lethalOwner.playerId);
        const lethalCheckpoint = lethalRoom.simulation.activeCheckpoint;
        lethalPlayer.physics.position.set(lethalCheckpoint.x + 80, lethalCheckpoint.y);
        lethalPlayer.physics.velocity.set(0, 0);
        lethalPlayer.health = 20;
        lethalOwner.ownerRuntime.simulation.restoreOwnerPrediction(
            lethalOwner.playerId,
            lethalRoom.simulation.playerState(lethalOwner.playerId),
            lethalOwner.snapshot().owner.tick
        );
        const lethalProjectile = new ProjectileObject({
            id: "lethal-order-projectile",
            ownerId: "lethal-order-enemy",
            targetId: lethalOwner.playerId,
            position: lethalPlayer.physics.position.clone(),
            velocity: new Vector2(120, 0),
            damage: 20,
            radius: 7
        });
        lethalRoom.simulation.enemyProjectiles.push(lethalProjectile);
        assert.equal(
            lethalOwner.resolvePredictedImpact({
                projectileId: lethalProjectile.id,
                targetId: lethalOwner.playerId,
                clientTick: lethalOwner.snapshot().owner.tick,
                resolution: "player-hit",
                position: { x: lethalPlayer.physics.position.x, y: lethalPlayer.physics.position.y },
                velocity: { x: lethalProjectile.velocity.x, y: lethalProjectile.velocity.y },
                parameters: { damage: lethalProjectile.damage }
            }),
            true
        );
        await waitFor(
            () =>
                lethalRoom.simulation.playerState(lethalOwner.playerId).health === lethalPlayer.maxHealth &&
                distance(lethalRoom.simulation.playerState(lethalOwner.playerId).position, lethalCheckpoint) < 10,
            "a lethal claim must remain at the checkpoint after the pre-impact owner motion"
        );
        await waitFor(
            () =>
                distance(lethalOwner.snapshot().owner.position, lethalCheckpoint) < 10 &&
                distance(
                    lethalObserver.snapshot().state.players.find(({ id }) => id === lethalOwner.playerId).position,
                    lethalCheckpoint
                ) < 10,
            "owner and observer must converge on the lethal checkpoint respawn"
        );
        lethalObserver.close();
        lethalOwner.close();
        await waitFor(() => !gameServer.rooms.has(lethalOwner.channelId), "the lethal test room must close");

        const spawnOwner = new RemoteGameAuthority({
            url: `ws://127.0.0.1:${port}/multiplayer?channel=new`,
            WebSocketImpl: WebSocket
        });
        await spawnOwner.connect();
        const spawnObserver = new RemoteGameAuthority({
            url: `ws://127.0.0.1:${port}/multiplayer?channel=${spawnOwner.channelId}`,
            WebSocketImpl: WebSocket
        });
        await spawnObserver.connect();
        const spawnRoom = gameServer.rooms.get(spawnOwner.channelId);
        const spawnPlayer = spawnRoom.simulation.players.find(({ id }) => id === spawnOwner.playerId);
        const spawnTarget = spawnRoom.simulation.enemies[0];
        spawnTarget.position.set(spawnPlayer.physics.position.x + 120, spawnPlayer.physics.position.y);
        spawnRoom.simulation.enemies = [spawnTarget];
        spawnPlayer.weapon.cooldown = 0;
        gameServer.broadcast(spawnRoom, { type: "snapshot", payload: spawnRoom.adapter.snapshot() });
        await waitFor(
            () =>
                spawnOwner.snapshot().state.enemies.length === 1 &&
                distance(spawnOwner.snapshot().state.enemies[0].position, spawnTarget.position) < 1,
            "the firing owner must receive the deterministic target state"
        );
        const spawnStore = new PredictableProjectileStore();
        spawnOwner.advance(movementCommand(0));
        const predictedSpawns = spawnOwner.drainPredictedEvents();
        assert.equal(predictedSpawns.length, 1, "the owner must predict one automatic shot immediately");
        spawnStore.predict(predictedSpawns);
        assert.equal(spawnStore.snapshot().projectiles.length, 1, "the local shot must exist before its receipt");
        assert.equal(spawnRoom.simulation.projectiles.length, 0, "the server tick must not duplicate owner firing");
        assert.equal(spawnOwner.submitProjectileSpawnClaim(predictedSpawns[0]), true);
        await waitFor(
            () => spawnOwner.projectileSpawnClaimReceipts.length > 0,
            "the owner must receive its projectile spawn receipt"
        );
        const firstSpawnReceipt = spawnOwner.drainProjectileSpawnClaimReceipts()[0];
        assert.equal(firstSpawnReceipt.accepted, true);
        assert.equal(spawnRoom.simulation.projectiles.length, 1, "one owner claim must create one server projectile");
        const ownerSpawnEvents = [];
        const observerSpawnEvents = [];
        await waitFor(() => {
            ownerSpawnEvents.push(...spawnOwner.drainEvents());
            observerSpawnEvents.push(...spawnObserver.drainEvents());
            const predictionId = predictedSpawns[0].predictionId;
            return (
                ownerSpawnEvents.some((event) => event.parameters?.predictionId === predictionId) &&
                observerSpawnEvents.some((event) => event.parameters?.predictionId === predictionId)
            );
        }, "the accepted spawn must converge to the owner and observer");
        spawnStore.apply(ownerSpawnEvents, spawnOwner.snapshot().serverTick, spawnOwner.snapshot().state);
        assert.equal(spawnStore.snapshot().projectiles.length, 1, "authority confirmation must adopt the prediction");
        assert.equal(
            observerSpawnEvents.filter((event) => event.parameters?.predictionId === predictedSpawns[0].predictionId)
                .length,
            1,
            "the peer must receive one shared spawn event"
        );
        assert.equal(spawnOwner.submitProjectileSpawnClaim(predictedSpawns[0]), true);
        await waitFor(
            () => spawnOwner.projectileSpawnClaimReceipts.length > 0,
            "a duplicate spawn claim must receive its cached receipt"
        );
        const duplicateSpawnReceipt = spawnOwner.drainProjectileSpawnClaimReceipts()[0];
        assert.equal(duplicateSpawnReceipt.projectileId, firstSpawnReceipt.projectileId);
        assert.equal(
            spawnRoom.simulation.projectiles.length,
            1,
            "a duplicate claim must not create another projectile"
        );
        spawnRoom.simulation.projectiles.length = 0;
        spawnPlayer.weapon.cooldown = 0;
        const localSpawnPlayer = spawnOwner.ownerRuntime.simulation.players.find(
            ({ id }) => id === spawnOwner.playerId
        );
        localSpawnPlayer.weapon.cooldown = 0;
        spawnOwner.advance(movementCommand(0));
        const rejectedSpawn = spawnOwner
            .drainPredictedEvents()
            .find(({ eventType }) => eventType === "predicted-spawn");
        assert.ok(rejectedSpawn, "the owner must start a second predicted shot before its receipt");
        assert.ok(spawnOwner.snapshot().owner.weaponCooldown > 0);
        const rejectedSpawnStore = new PredictableProjectileStore();
        rejectedSpawnStore.predict([rejectedSpawn]);
        const preRejectedSpawnSequence = spawnOwner.latestSnapshot.snapshotSequence;
        gameServer.broadcast(spawnRoom, { type: "snapshot", payload: spawnRoom.adapter.snapshot() });
        await waitFor(
            () => spawnOwner.latestSnapshot.snapshotSequence > preRejectedSpawnSequence,
            "the owner must receive a pre-claim weapon snapshot"
        );
        assert.ok(
            spawnOwner.snapshot().owner.weaponCooldown > 0,
            "an in-flight pre-claim snapshot must not erase the immediate fire cooldown"
        );
        assert.equal(spawnOwner.submitProjectileSpawnClaim({ ...rejectedSpawn, targetId: "forged-target" }), true);
        await waitFor(
            () => spawnOwner.projectileSpawnClaimReceipts.length > 0,
            "the invalid projectile spawn must return a rejection receipt"
        );
        const rejectedSpawnReceipt = spawnOwner.drainProjectileSpawnClaimReceipts()[0];
        assert.equal(rejectedSpawnReceipt.accepted, false);
        assert.equal(rejectedSpawnReceipt.reason, "target-mismatch");
        rejectedSpawnStore.applySpawnClaimReceipts([rejectedSpawnReceipt]);
        assert.equal(rejectedSpawnStore.snapshot().projectiles.length, 0);
        assert.equal(
            spawnOwner.snapshot().owner.weaponCooldown,
            0,
            "a rejected predicted shot must restore its previous local cooldown"
        );
        assert.equal(spawnPlayer.weapon.cooldown, 0, "a rejected claim must not start the server cooldown");
        spawnRoom.simulation.enemies = [];
        const resonance = ARTIFACT_CATALOG.find(({ id }) => id === "rope-resonance");
        spawnPlayer.artifacts.add(resonance);
        spawnRoom.simulation.applyArtifactEffects(spawnPlayer);
        gameServer.broadcast(spawnRoom, { type: "snapshot", payload: spawnRoom.adapter.snapshot() });
        await waitFor(
            () =>
                spawnOwner
                    .snapshot()
                    .state.players.find(({ id }) => id === spawnOwner.playerId)
                    ?.artifacts.some(({ id }) => id === resonance.id) &&
                spawnOwner.ownerRuntime.simulation.players
                    .find(({ id }) => id === spawnOwner.playerId)
                    ?.artifacts.snapshot()
                    .some(({ id }) => id === resonance.id),
            "the owner prediction must receive the rope resonance artifact"
        );
        const swingCommand = armPredictedRopeSwing(spawnOwner);
        spawnOwner.advance(swingCommand);
        const swingEvents = spawnOwner.drainPredictedEvents();
        const predictedSwing = swingEvents.find(({ eventType }) => eventType === "predicted-rope-swing");
        assert.ok(
            predictedSwing,
            `the owner must emit the swing transition before its receipt: ${JSON.stringify({
                swingEvents,
                state: spawnOwner.snapshot().owner,
                artifacts: spawnOwner.ownerRuntime.simulation.players
                    .find(({ id }) => id === spawnOwner.playerId)
                    .artifacts.snapshot()
            })}`
        );
        assert.ok(spawnOwner.snapshot().owner.ropeDamageBoostRemaining > 0);
        const preClaimSequence = spawnOwner.latestSnapshot.snapshotSequence;
        gameServer.broadcast(spawnRoom, { type: "snapshot", payload: spawnRoom.adapter.snapshot() });
        await waitFor(
            () => spawnOwner.latestSnapshot.snapshotSequence > preClaimSequence,
            "the owner must receive a pre-claim authority snapshot"
        );
        assert.ok(
            spawnOwner.snapshot().owner.ropeDamageBoostRemaining > 0,
            "an in-flight pre-claim snapshot must not erase immediate swing feedback"
        );
        assert.equal(spawnOwner.submitRopeSwingClaim(predictedSwing), true);
        await waitFor(
            () => spawnOwner.ropeSwingClaimReceipts.length > 0,
            "the owner must receive its rope swing receipt"
        );
        const firstSwingReceipt = spawnOwner.drainRopeSwingClaimReceipts()[0];
        assert.equal(firstSwingReceipt.accepted, true);
        const observerSwingEvents = [];
        await waitFor(() => {
            observerSwingEvents.push(...spawnObserver.drainEvents());
            const observerPlayer = spawnObserver.snapshot().state.players.find(({ id }) => id === spawnOwner.playerId);
            return (
                observerPlayer?.ropeDamageBoostRemaining > 0 &&
                observerSwingEvents.some(({ predictionId }) => predictionId === predictedSwing.predictionId)
            );
        }, "the accepted swing state and event must converge to the observer");
        assert.ok(spawnRoom.simulation.playerState(spawnOwner.playerId).ropeDamageBoostRemaining > 0);
        assert.equal(spawnOwner.submitRopeSwingClaim(predictedSwing), true);
        await waitFor(() => spawnOwner.ropeSwingClaimReceipts.length > 0, "a duplicate swing must return its receipt");
        assert.equal(spawnOwner.drainRopeSwingClaimReceipts()[0].duration, firstSwingReceipt.duration);
        await new Promise((resolve) => setTimeout(resolve, 80));
        observerSwingEvents.push(...spawnObserver.drainEvents());
        assert.equal(
            observerSwingEvents.filter(({ predictionId }) => predictionId === predictedSwing.predictionId).length,
            1,
            "a duplicate swing claim must not create a second shared event"
        );

        spawnPlayer.ropeDamageBoostRemaining = 0;
        spawnRoom.simulation.applyArtifactEffects(spawnPlayer);
        const localSwingPlayer = spawnOwner.ownerRuntime.simulation.players.find(
            ({ id }) => id === spawnOwner.playerId
        );
        localSwingPlayer.ropeDamageBoostRemaining = 0;
        spawnOwner.ownerRuntime.simulation.applyArtifactEffects(localSwingPlayer);
        const rejectedSwingCommand = armPredictedRopeSwing(spawnOwner);
        spawnOwner.advance(rejectedSwingCommand);
        const rejectedSwing = spawnOwner
            .drainPredictedEvents()
            .find(({ eventType }) => eventType === "predicted-rope-swing");
        assert.ok(rejectedSwing);
        assert.equal(
            spawnOwner.submitRopeSwingClaim({
                ...rejectedSwing,
                anchor: { x: rejectedSwing.anchor.x + 1000, y: rejectedSwing.anchor.y }
            }),
            true
        );
        await waitFor(
            () => spawnOwner.ropeSwingClaimReceipts.length > 0,
            "the invalid swing must return a rejection receipt"
        );
        const rejectedSwingReceipt = spawnOwner.drainRopeSwingClaimReceipts()[0];
        assert.equal(rejectedSwingReceipt.accepted, false);
        assert.equal(rejectedSwingReceipt.reason, "anchor-mismatch");
        assert.equal(
            spawnOwner.snapshot().owner.ropeDamageBoostRemaining,
            0,
            "a rejected swing must roll back the predicted boost"
        );
        spawnObserver.close();
        spawnOwner.close();
        await waitFor(() => !gameServer.rooms.has(spawnOwner.channelId), "the projectile spawn room must close");

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
        const ownerBeforeAcceptedImpact = authority.snapshot().owner;
        const receiptProjectile = new ProjectileObject({
            id: "impact-receipt-projectile",
            ownerId: "impact-receipt-enemy",
            targetId: authority.playerId,
            position: new Vector2(ownerBeforeAcceptedImpact.position.x, ownerBeforeAcceptedImpact.position.y),
            velocity: new Vector2(0, 0),
            damage: 20,
            radius: 7
        });
        room.simulation.enemyProjectiles.push(receiptProjectile);
        assert.equal(
            authority.resolvePredictedImpact({
                projectileId: receiptProjectile.id,
                clientTick: authority.snapshot().owner.tick,
                resolution: "player-hit",
                position: ownerBeforeAcceptedImpact.position,
                velocity: { x: receiptProjectile.velocity.x, y: receiptProjectile.velocity.y },
                parameters: { damage: receiptProjectile.damage }
            }),
            true
        );
        assert.equal(
            authority.snapshot().owner.health,
            ownerBeforeAcceptedImpact.health - receiptProjectile.damage,
            "victim HP must change before the accepted impact receipt"
        );
        const impactApp = new MultiplayerGameApp({ canvas: fakeCanvas(), authority });
        let predictedImpactRender = null;
        impactApp.renderer.draw = (state) => {
            predictedImpactRender = state;
        };
        impactApp.render();
        assert.equal(
            predictedImpactRender.playerHealth,
            authority.snapshot().owner.health,
            "the multiplayer HUD must render predicted owner HP instead of the stale server snapshot"
        );
        await waitFor(
            () => authority.impactClaimReceipts.length > 0,
            "impact claim receipts must reach the client authority"
        );
        const impactReceipt = authority.drainImpactClaimReceipts()[0];
        assert.equal(impactReceipt.projectileId, receiptProjectile.id);
        assert.equal(impactReceipt.accepted, true);
        await waitFor(
            () =>
                authority.latestSnapshot.state.players.find(({ id }) => id === authority.playerId)?.health ===
                authority.snapshot().owner.health,
            "accepted predicted HP must converge through the authority snapshot"
        );

        authorityPlayer.hitInvulnerabilityRemaining = 0;
        authorityPlayer.ropeDisabledRemaining = 0;
        const localImpactPlayer = authority.ownerRuntime.simulation.players.find(({ id }) => id === authority.playerId);
        localImpactPlayer.hitInvulnerabilityRemaining = 0;
        localImpactPlayer.ropeDisabledRemaining = 0;
        gameServer.broadcast(room, { type: "snapshot", payload: room.adapter.snapshot() });
        await waitFor(
            () =>
                authority.latestSnapshot.state.players.find(({ id }) => id === authority.playerId)
                    ?.hitInvulnerabilityRemaining === 0,
            "the rejection test must begin from a shared vulnerable state"
        );
        const beforeRejectedBody = authority.ownerRuntime.simulation.playerState(authority.playerId);
        const beforeRejectedBodyTick = authority.snapshot().owner.tick;
        const expectedAfterRejectedBody = new GameSimulation({
            worldSeed: room.simulation.world.seed,
            playerId: authority.playerId
        });
        expectedAfterRejectedBody.enemies = [];
        expectedAfterRejectedBody.restoreOwnerPrediction(
            authority.playerId,
            beforeRejectedBody,
            beforeRejectedBodyTick
        );
        const rejectedBodyProjectile = new ProjectileObject({
            id: "rejected-body-impact-projectile",
            ownerId: "rejected-body-impact-enemy",
            targetId: authority.playerId,
            position: authorityPlayer.physics.position.clone(),
            velocity: new Vector2(120, 0),
            damage: 20,
            radius: 7
        });
        room.simulation.enemyProjectiles.push(rejectedBodyProjectile);
        assert.equal(
            authority.resolvePredictedImpact({
                projectileId: rejectedBodyProjectile.id,
                targetId: authority.playerId,
                clientTick: beforeRejectedBodyTick,
                resolution: "player-hit",
                position: { x: authorityPlayer.physics.position.x + 1000, y: authorityPlayer.physics.position.y },
                velocity: { x: rejectedBodyProjectile.velocity.x, y: rejectedBodyProjectile.velocity.y },
                parameters: { damage: rejectedBodyProjectile.damage }
            }),
            true
        );
        assert.ok(
            authority.snapshot().owner.hitInvulnerabilityRemaining > 0,
            "the victim must feel the predicted hit before its receipt"
        );
        assert.equal(
            authority.snapshot().owner.health,
            beforeRejectedBody.health - rejectedBodyProjectile.damage,
            "rejected victim HP must still react before its receipt"
        );
        const replayedCommands = [movementCommand(1), movementCommand(-1)];
        for (const command of replayedCommands) {
            authority.advance(command);
            const nextTick = expectedAfterRejectedBody.getTick() + 1;
            expectedAfterRejectedBody.advanceOwnerPrediction(authority.playerId, command, 1 / 120, nextTick);
        }
        await waitFor(
            () => authority.impactClaimReceipts.length > 0,
            "the invalid body impact must return a rejection receipt"
        );
        const rejectedBodyReceipt = authority.drainImpactClaimReceipts()[0];
        assert.equal(rejectedBodyReceipt.accepted, false);
        assert.equal(rejectedBodyReceipt.reason, "trajectory-mismatch");
        const rolledBackBody = authority.snapshot().owner;
        while (expectedAfterRejectedBody.getTick() < rolledBackBody.tick) {
            const nextTick = expectedAfterRejectedBody.getTick() + 1;
            expectedAfterRejectedBody.advanceOwnerPrediction(
                authority.playerId,
                replayedCommands.at(-1),
                1 / 120,
                nextTick
            );
        }
        const expectedBody = expectedAfterRejectedBody.ownerPredictionState(authority.playerId);
        assert.ok(
            distance(rolledBackBody.position, expectedBody.position) < 1e-9,
            `rejected impact position replay mismatch: ${JSON.stringify({ rolledBackBody, expectedBody })}`
        );
        assert.ok(
            distance(rolledBackBody.velocity, expectedBody.velocity) < 1e-9,
            `rejected impact velocity replay mismatch: ${JSON.stringify({ rolledBackBody, expectedBody })}`
        );
        assert.equal(rolledBackBody.hitInvulnerabilityRemaining, expectedBody.hitInvulnerabilityRemaining);
        assert.equal(rolledBackBody.health, expectedBody.health);

        const ropeAnchor = {
            x: rolledBackBody.position.x,
            y: rolledBackBody.position.y - 80
        };
        localImpactPlayer.ropeObject.rope.attach(localImpactPlayer.physics.position, ropeAnchor);
        localImpactPlayer.ropeDisabledRemaining = 0;
        authorityPlayer.ropeDisabledRemaining = 0;
        const rejectedRopeProjectile = new ProjectileObject({
            id: "rejected-rope-impact-projectile",
            ownerId: "rejected-rope-impact-enemy",
            targetId: authority.playerId,
            position: authorityPlayer.physics.position.clone(),
            velocity: new Vector2(0, -120),
            damage: 0,
            radius: 7
        });
        room.simulation.enemyProjectiles.push(rejectedRopeProjectile);
        assert.equal(
            authority.resolvePredictedImpact({
                projectileId: rejectedRopeProjectile.id,
                targetId: authority.playerId,
                clientTick: authority.snapshot().owner.tick,
                resolution: "rope-cut",
                position: { x: authorityPlayer.physics.position.x + 1000, y: authorityPlayer.physics.position.y },
                velocity: { x: rejectedRopeProjectile.velocity.x, y: rejectedRopeProjectile.velocity.y },
                parameters: { damage: 0 }
            }),
            true
        );
        assert.equal(authority.snapshot().owner.rope.isAttached, false);
        await waitFor(
            () => authority.impactClaimReceipts.length > 0,
            "the invalid rope impact must return a rejection receipt"
        );
        const rejectedRopeReceipt = authority.drainImpactClaimReceipts()[0];
        assert.equal(rejectedRopeReceipt.accepted, false);
        assert.equal(rejectedRopeReceipt.reason, "trajectory-mismatch");
        assert.equal(authority.snapshot().owner.rope.isAttached, true);
        assert.equal(authority.snapshot().owner.ropeDisabledRemaining, 0);
        authority.ownerRuntime.simulation.releasePlayerRope(authority.playerId);
        room.simulation.releasePlayerRope(authority.playerId);
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
        assert.equal(
            authority.renderSnapshot().activeCheckpoint.id,
            rewardCheckpoint.id,
            "the owner simulation must use the reached checkpoint before the server snapshot"
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
        authority.drainCheckpointClaimReceipts();
        const rejectedCheckpoint = room.simulation.world.checkpoints[2];
        const beforeRejectedCheckpoint = authority.ownerRuntime.simulation.playerState(authority.playerId);
        authority.ownerRuntime.simulation.restoreOwnerPrediction(
            authority.playerId,
            {
                ...beforeRejectedCheckpoint,
                position: { x: rejectedCheckpoint.x, y: rejectedCheckpoint.y },
                velocity: { x: 0, y: 0 }
            },
            authority.snapshot().owner.tick
        );
        const rejectedCheckpointCandidate = authority.ownerRuntime.checkpointClaimCandidate();
        assert.equal(rejectedCheckpointCandidate.checkpointId, rejectedCheckpoint.id);
        assert.equal(authority.ownerRuntime.applyPredictedCheckpoint(rejectedCheckpointCandidate), true);
        authority.pendingCheckpointId = rejectedCheckpoint.id;
        authority.socket.send(
            JSON.stringify({
                type: "checkpoint-claim",
                payload: serializeCheckpointClaim(
                    createCheckpointClaim({
                        ...rejectedCheckpointCandidate,
                        clientTick: rejectedCheckpointCandidate.clientTick + 1000
                    })
                )
            })
        );
        assert.equal(authority.renderSnapshot().activeCheckpoint.id, rejectedCheckpoint.id);
        await waitFor(
            () => authority.checkpointClaimReceipts.length > 0,
            "the server must reject a checkpoint without matching owner motion"
        );
        const rejectedCheckpointReceipt = authority.drainCheckpointClaimReceipts()[0];
        assert.equal(rejectedCheckpointReceipt.accepted, false);
        assert.equal(rejectedCheckpointReceipt.reason, "tick-window");
        assert.equal(
            authority.renderSnapshot().activeCheckpoint.id,
            rewardCheckpoint.id,
            "a rejected checkpoint must restore the shared progress origin"
        );
        authority.ownerRuntime.simulation.restoreOwnerPrediction(
            authority.playerId,
            room.simulation.playerState(authority.playerId),
            authority.snapshot().owner.tick
        );
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
                const ObserverWebSocket = createImpairedWebSocket({ roundTripDelayMs, commandLossRate });
                const impaired = new RemoteGameAuthority({
                    url: `ws://127.0.0.1:${port}/multiplayer?channel=new`,
                    WebSocketImpl: ProfileWebSocket
                });
                await impaired.connect();
                const observer = new RemoteGameAuthority({
                    url: `ws://127.0.0.1:${port}/multiplayer?channel=${impaired.channelId}`,
                    WebSocketImpl: ObserverWebSocket
                });
                await observer.connect();
                const profileRoom = gameServer.rooms.get(impaired.channelId);
                profileRoom.simulation.enemies = [];
                gameServer.broadcast(profileRoom, { type: "snapshot", payload: profileRoom.adapter.snapshot() });
                await waitFor(
                    () =>
                        impaired.snapshot().state.players.length === 2 &&
                        observer.snapshot().state.players.length === 2 &&
                        impaired.snapshot().state.enemies.length === 0 &&
                        observer.snapshot().state.enemies.length === 0,
                    `${roundTripDelayMs}ms RTT/${commandLossRate * 100}% peers must share the profile world`
                );
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
                    observer.advance(movementCommand(0));
                    observer.submit(movementCommand(0));
                    await new Promise((resolve) => setTimeout(resolve, 8));
                }
                assert.equal(ProfileWebSocket.sentCommands, 60);
                assert.equal(
                    ProfileWebSocket.droppedCommands,
                    Math.floor(ProfileWebSocket.sentCommands * commandLossRate)
                );
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
                if (roundTripDelayMs > 0) assert.ok(impaired.metrics().roundTripMs >= roundTripDelayMs * 0.75);
                let profileConvergence = null;
                for (let index = 0; index < 180; index += 1) {
                    impaired.advance(movementCommand(0));
                    impaired.submit(movementCommand(0));
                    observer.advance(movementCommand(0));
                    observer.submit(movementCommand(0));
                    await new Promise((resolve) => setTimeout(resolve, 8));
                    if (index < 60) continue;
                    const ownerState = impaired.snapshot().owner;
                    const serverState = profileRoom.simulation.playerState(impaired.playerId);
                    const observerState = observer.snapshot().state.players.find(({ id }) => id === impaired.playerId);
                    profileConvergence = {
                        ownerServerPosition: distance(ownerState.position, serverState.position),
                        observerServerPosition: distance(observerState.position, serverState.position),
                        ownerServerVelocity: distance(ownerState.velocity, serverState.velocity),
                        observerServerVelocity: distance(observerState.velocity, serverState.velocity),
                        ropeMatches:
                            ownerState.rope.isAttached === serverState.rope.isAttached &&
                            observerState.rope.isAttached === serverState.rope.isAttached
                    };
                    if (
                        profileConvergence.ownerServerPosition <= 4 &&
                        profileConvergence.observerServerPosition <= 4 &&
                        profileConvergence.ownerServerVelocity <= 20 &&
                        profileConvergence.observerServerVelocity <= 20 &&
                        profileConvergence.ropeMatches
                    ) {
                        break;
                    }
                }
                const profileLabel = `${roundTripDelayMs}ms RTT/${commandLossRate * 100}%`;
                assert.ok(
                    profileConvergence?.ownerServerPosition <= 4 && profileConvergence?.observerServerPosition <= 4,
                    `${profileLabel} positions must converge: ${JSON.stringify(profileConvergence)}`
                );
                assert.ok(
                    profileConvergence.ownerServerVelocity <= 20 && profileConvergence.observerServerVelocity <= 20,
                    `${profileLabel} velocities must converge: ${JSON.stringify(profileConvergence)}`
                );
                assert.equal(profileConvergence.ropeMatches, true, `${profileLabel} rope state must converge`);
                const ownerAuthorityState = impaired.latestSnapshot.state;
                const observerAuthorityState = observer.latestSnapshot.state;
                const serverPlayerState = profileRoom.simulation.playerState(impaired.playerId);
                assert.deepEqual(
                    persistentPlayerState(ownerAuthorityState.players.find(({ id }) => id === impaired.playerId)),
                    persistentPlayerState(serverPlayerState),
                    `${profileLabel} owner persistent state must equal the server`
                );
                assert.deepEqual(
                    persistentPlayerState(observerAuthorityState.players.find(({ id }) => id === impaired.playerId)),
                    persistentPlayerState(serverPlayerState),
                    `${profileLabel} observer persistent state must equal the server`
                );
                assert.deepEqual(
                    persistentWorldState(ownerAuthorityState),
                    persistentWorldState(observerAuthorityState),
                    `${profileLabel} peers must share one persistent world state`
                );
                observer.close();
                impaired.close();
                await waitFor(
                    () => !gameServer.rooms.has(impaired.channelId),
                    `${profileLabel} empty profile room must close`
                );
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
