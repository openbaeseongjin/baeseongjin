import assert from "node:assert/strict";
import { createPlayerCommand } from "../src/game/commands/PlayerCommand.js";
import { createArtifactSelectionClaim } from "../src/game/network/ArtifactSelectionClaim.js";
import { createCheckpointClaim } from "../src/game/network/CheckpointClaim.js";
import { createPlayerCommandBatch } from "../src/game/network/PlayerCommandBatch.js";
import { createProjectileHitClaim } from "../src/game/network/ProjectileHitClaim.js";
import { createPlayerImpactClaim } from "../src/game/network/PlayerImpactClaim.js";
import { createSummitClaim } from "../src/game/network/SummitClaim.js";
import { createOwnerMotionState } from "../src/game/network/OwnerMotionState.js";
import { Vector2 } from "../src/game-kit/index.js";
import { WORLD_CONFIG } from "../src/game/config.js";
import { AuthorityServerSession } from "../src/game/runtime/AuthorityServerSession.js";
import { GameSimulation } from "../src/game/simulation/GameSimulation.js";

function command(horizontal) {
    return createPlayerCommand(
        {
            horizontal,
            vertical: 0,
            interact: false,
            pointer: { x: 0, y: 0, down: false },
            viewport: { width: 1280, height: 720 }
        },
        { x: 0, y: 0 }
    );
}

function primaryPlayer(simulation) {
    return simulation.players.find(({ id }) => id === simulation.getPrimaryPlayerId());
}

export function run() {
    const rewardSimulation = new GameSimulation();
    const rewardPlayer = primaryPlayer(rewardSimulation);
    rewardSimulation.enemies = [];
    const rewardSession = new AuthorityServerSession({ simulation: rewardSimulation });
    const rewardCheckpoint = rewardSimulation.world.checkpoints[1];
    rewardSimulation.beginArtifactReward(rewardCheckpoint);
    const artifactClaim = createArtifactSelectionClaim({
        checkpointId: rewardCheckpoint.id,
        artifactId: "rapid-gear",
        clientTick: rewardSimulation.tick
    });
    const artifactReceipt = rewardSession.submitArtifactSelection(rewardPlayer.id, artifactClaim);
    assert.equal(
        artifactReceipt.accepted,
        true,
        "artifact claims must resolve without waiting for a future input tick"
    );
    assert.equal(rewardSimulation.artifactRewards.size, 0);
    assert.equal(rewardPlayer.artifacts.snapshot()[0].id, "rapid-gear");
    assert.equal(
        rewardSession.submitArtifactSelection(rewardPlayer.id, artifactClaim),
        artifactReceipt,
        "retrying the same client selection must be idempotent"
    );
    const conflictingArtifact = rewardSession.submitArtifactSelection(
        rewardPlayer.id,
        createArtifactSelectionClaim({ ...artifactClaim, artifactId: "power-core" })
    );
    assert.equal(conflictingArtifact.accepted, false);
    assert.equal(conflictingArtifact.reason, "selection-conflict");

    const checkpointSimulation = new GameSimulation();
    const checkpointPlayer = primaryPlayer(checkpointSimulation);
    checkpointSimulation.enemies = [];
    const checkpointSession = new AuthorityServerSession({ simulation: checkpointSimulation });
    const claimedCheckpoint = checkpointSimulation.world.checkpoints[1];
    checkpointPlayer.physics.position.set(claimedCheckpoint.x, claimedCheckpoint.y);
    checkpointSession.advance();
    assert.notEqual(
        checkpointSimulation.activeCheckpoint.id,
        claimedCheckpoint.id,
        "the server fixed tick must not initiate a client-owned checkpoint arrival"
    );
    assert.equal(
        checkpointSimulation.drainReplicationEvents().filter(({ eventType }) => eventType === "checkpoint-reached")
            .length,
        0
    );
    const checkpointClaim = createCheckpointClaim({
        checkpointId: claimedCheckpoint.id,
        clientTick: checkpointSimulation.getTick() + 1,
        position: checkpointPlayer.physics.position
    });
    const checkpointReceipt = checkpointSession.submitCheckpointClaim(checkpointPlayer.id, checkpointClaim);
    assert.equal(checkpointReceipt.accepted, true);
    assert.equal(checkpointReceipt.resolution, "checkpoint-reached");
    assert.equal(checkpointSimulation.activeCheckpoint.id, claimedCheckpoint.id);
    assert.equal(checkpointSimulation.artifactRewards.size, checkpointSimulation.players.length);
    assert.equal(checkpointSimulation.metrics.snapshot().checkpointsReached, 1);
    assert.equal(
        checkpointSimulation.drainReplicationEvents().filter(({ eventType }) => eventType === "checkpoint-reached")
            .length,
        1
    );
    assert.equal(
        checkpointSession.submitCheckpointClaim(checkpointPlayer.id, checkpointClaim),
        checkpointReceipt,
        "duplicate checkpoint claims must reuse the first receipt"
    );
    assert.equal(checkpointSimulation.metrics.snapshot().checkpointsReached, 1);
    assert.equal(checkpointSimulation.drainReplicationEvents().length, 0);

    const summitSimulation = new GameSimulation();
    const summitPlayer = primaryPlayer(summitSimulation);
    summitSimulation.enemies = [];
    const summitSession = new AuthorityServerSession({ simulation: summitSimulation });
    summitPlayer.physics.position.set(summitSimulation.world.summit.x, summitSimulation.world.summit.y);
    summitSession.advance();
    assert.equal(
        summitSimulation.runState,
        "playing",
        "the server fixed tick must not initiate a client-owned summit arrival"
    );
    const summitClaim = createSummitClaim({
        clientTick: summitSimulation.getTick() + 1,
        position: summitPlayer.physics.position
    });
    const summitReceipt = summitSession.submitSummitClaim(summitPlayer.id, summitClaim);
    assert.equal(summitReceipt.accepted, true);
    assert.equal(summitReceipt.resolution, "run-completed");
    assert.equal(summitSimulation.runState, "completed");
    assert.equal(
        summitSimulation.drainReplicationEvents().filter(({ eventType }) => eventType === "run-completed").length,
        1
    );
    assert.equal(
        summitSession.submitSummitClaim(summitPlayer.id, summitClaim),
        summitReceipt,
        "duplicate summit claims must reuse the first receipt"
    );
    assert.equal(summitSimulation.drainReplicationEvents().length, 0);
    const completedPosition = { ...summitSimulation.playerState(summitPlayer.id).position };
    const postCompletionMotion = summitSession.submitOwnerMotion(
        summitPlayer.id,
        createOwnerMotionState({
            clientTick: summitSimulation.getTick() + 2,
            position: { x: completedPosition.x + 10, y: completedPosition.y },
            velocity: { x: 100, y: 0 },
            isGrounded: false,
            rope: { isAttached: false, anchor: null }
        })
    );
    assert.equal(postCompletionMotion.accepted, false);
    assert.equal(postCompletionMotion.reason, "run-inactive");
    assert.deepEqual(summitSimulation.playerState(summitPlayer.id).position, completedPosition);

    const combatSimulation = new GameSimulation();
    const combatPlayer = primaryPlayer(combatSimulation);
    const combatSession = new AuthorityServerSession({ simulation: combatSimulation });
    const ownerMotion = createOwnerMotionState({
        clientTick: combatSimulation.tick + 1,
        position: { x: combatPlayer.physics.position.x + 20, y: combatPlayer.physics.position.y - 10 },
        velocity: { x: 700, y: -240 },
        isGrounded: false,
        rope: { isAttached: false, anchor: null }
    });
    assert.equal(combatSession.submitOwnerMotion(combatPlayer.id, ownerMotion).accepted, true);
    assert.equal(combatPlayer.physics.velocity.x, 700, "server world must accept plausible owner motion");
    assert.equal(
        combatSession.submitOwnerMotion(combatPlayer.id, ownerMotion).reason,
        "stale-tick",
        "owner motion must be monotonic"
    );
    assert.equal(
        combatSession.submitOwnerMotion(
            combatPlayer.id,
            createOwnerMotionState({
                ...ownerMotion,
                clientTick: ownerMotion.clientTick + 1,
                velocity: { x: 9999, y: 0 }
            })
        ).reason,
        "speed-envelope",
        "client authority must remain inside the server movement envelope"
    );

    combatPlayer.ropeObject.rope.attach(combatPlayer.physics.position, {
        x: combatPlayer.physics.position.x,
        y: combatPlayer.physics.position.y - 80
    });
    const rejectedRelease = combatSession.submitOwnerMotion(
        combatPlayer.id,
        createOwnerMotionState({
            ...ownerMotion,
            clientTick: ownerMotion.clientTick + 2,
            velocity: { x: 9999, y: 0 },
            rope: { isAttached: false, anchor: null }
        })
    );
    assert.equal(rejectedRelease.reason, "speed-envelope");
    assert.equal(rejectedRelease.ropeReleased, true, "a newer rope release must survive rejected continuous motion");
    assert.equal(
        combatPlayer.ropeObject.rope.isAttached,
        false,
        "rejected movement must not leave a released rope attached"
    );
    const delayedAttach = combatSession.submitOwnerMotion(
        combatPlayer.id,
        createOwnerMotionState({
            ...ownerMotion,
            clientTick: ownerMotion.clientTick + 1,
            position: { x: combatPlayer.physics.position.x, y: combatPlayer.physics.position.y },
            velocity: { x: 0, y: 0 },
            rope: {
                isAttached: true,
                anchor: { x: combatPlayer.physics.position.x, y: combatPlayer.physics.position.y - 80 }
            }
        })
    );
    assert.equal(delayedAttach.accepted, true, "late continuous motion may still be usable");
    assert.equal(combatPlayer.ropeObject.rope.isAttached, false, "an older rope state must not undo a newer release");

    const fallSimulation = new GameSimulation();
    const fallPlayer = primaryPlayer(fallSimulation);
    fallSimulation.enemies = [];
    fallSimulation.addPlayer({ x: 180, y: 500 });
    fallSimulation.activeCheckpoint = fallSimulation.world.checkpoints[1];
    fallPlayer.physics.position.set(-10000, WORLD_CONFIG.floorY + 781);
    fallPlayer.ropeObject.rope.attach(fallPlayer.physics.position, {
        x: fallPlayer.physics.position.x,
        y: fallPlayer.physics.position.y - 80
    });
    const fallSession = new AuthorityServerSession({ simulation: fallSimulation });
    fallSession.advance();
    assert.ok(
        fallPlayer.physics.position.y > WORLD_CONFIG.floorY + 780,
        "the server fixed tick must not initiate a client-owned fall"
    );
    assert.equal(
        fallSimulation.drainReplicationEvents().filter(({ eventType }) => eventType === "player-respawned").length,
        0,
        "fall replication must wait for the owner claim"
    );
    const fallReceipt = fallSession.submitOwnerMotion(
        fallPlayer.id,
        createOwnerMotionState({
            clientTick: fallSimulation.getTick() + 1,
            position: { x: fallPlayer.physics.position.x, y: WORLD_CONFIG.floorY + 781 },
            velocity: { x: 0, y: 900 },
            isGrounded: false,
            rope: { isAttached: false, anchor: null }
        })
    );
    assert.equal(fallReceipt.accepted, true);
    assert.equal(fallReceipt.resolution, "player-fell");
    assert.equal(fallPlayer.lifeState, "active");
    assert.equal(fallPlayer.health, fallPlayer.maxHealth);
    assert.equal(fallPlayer.physics.position.x, fallSimulation.activeCheckpoint.x);
    assert.equal(fallPlayer.physics.position.y, fallSimulation.activeCheckpoint.y);
    assert.equal(fallPlayer.ropeObject.rope.isAttached, false);
    assert.equal(
        fallSimulation.drainReplicationEvents().filter(({ eventType }) => eventType === "player-respawned").length,
        1,
        "the owner fall claim must produce one shared respawn"
    );
    assert.equal(fallSimulation.runState, "playing", "one fallen player must not stop a cooperative world");

    combatPlayer.weapon.cooldown = 0;
    combatSession.advance();
    const projectile = combatSimulation.projectiles[0];
    const target = combatSimulation.enemies.find(({ id }) => id === projectile.targetId);
    projectile.position = target.position.clone();
    const healthBeforeClaim = target.health;
    const claim = createProjectileHitClaim({
        predictionId: projectile.predictionId,
        targetId: target.id,
        clientTick: combatSimulation.tick,
        position: target.position
    });
    const acceptedClaim = combatSession.submitHitClaim(combatPlayer.id, claim);
    assert.equal(acceptedClaim.accepted, true);
    assert.equal(
        target.health,
        healthBeforeClaim - projectile.damage,
        "the server must apply its own projectile damage"
    );
    assert.equal(combatSession.submitHitClaim(combatPlayer.id, claim), acceptedClaim);
    assert.equal(
        target.health,
        healthBeforeClaim - projectile.damage,
        "a duplicate claim must never deal damage twice"
    );
    const impactProjectile = {
        id: "enemy-impact-1",
        ownerId: "enemy-1",
        targetId: combatPlayer.id,
        position: combatPlayer.physics.position.clone(),
        velocity: new Vector2(120, 0),
        radius: 7,
        damage: 20
    };
    combatSimulation.enemyProjectiles.push(impactProjectile);
    const playerHealthBeforeImpact = combatPlayer.health;
    combatPlayer.hitInvulnerabilityRemaining = 0;
    combatSession.advance();
    assert.equal(
        combatPlayer.health,
        playerHealthBeforeImpact,
        "the server step must not hit an input-driven player before the victim claim"
    );
    assert.ok(
        combatSimulation.enemyProjectiles.some(({ id }) => id === impactProjectile.id),
        "the server must keep an unclaimed enemy projectile available for validation"
    );
    const victimClaimPosition = impactProjectile.position.clone();
    const victimClaimTick = combatSimulation.tick;
    impactProjectile.velocity.x = 1200;
    for (let tick = 0; tick < 6; tick += 1) combatSession.advance();
    combatPlayer.physics.position.x += 200;
    const impactClaim = createPlayerImpactClaim({
        projectileId: impactProjectile.id,
        clientTick: victimClaimTick,
        impactType: "player-hit",
        position: victimClaimPosition
    });
    const acceptedImpact = combatSession.submitImpactClaim(combatPlayer.id, impactClaim);
    assert.equal(
        acceptedImpact.accepted,
        true,
        "a victim claim must use its own tick and impact instead of later server projectile/player positions"
    );
    assert.equal(combatPlayer.health, playerHealthBeforeImpact - impactProjectile.damage);
    assert.equal(combatSimulation.metrics.damageTaken, impactProjectile.damage);
    assert.equal(combatSession.submitImpactClaim(combatPlayer.id, impactClaim), acceptedImpact);
    assert.equal(
        combatPlayer.health,
        playerHealthBeforeImpact - impactProjectile.damage,
        "a duplicate victim impact claim must be idempotent"
    );
    const lethalCheckpoint = combatSimulation.world.checkpoints[1];
    combatSimulation.activeCheckpoint = lethalCheckpoint;
    combatPlayer.health = 5;
    combatPlayer.hitInvulnerabilityRemaining = 0;
    const lethalProjectile = {
        id: "enemy-impact-lethal",
        ownerId: "enemy-1",
        targetId: combatPlayer.id,
        position: combatPlayer.physics.position.clone(),
        velocity: new Vector2(120, 0),
        radius: 7,
        damage: 20
    };
    combatSimulation.enemyProjectiles.push(lethalProjectile);
    const lethalClaim = createPlayerImpactClaim({
        projectileId: lethalProjectile.id,
        clientTick: combatSimulation.tick,
        impactType: "player-hit",
        position: combatPlayer.physics.position
    });
    const lethalReceipt = combatSession.submitImpactClaim(combatPlayer.id, lethalClaim);
    assert.equal(lethalReceipt.accepted, true);
    assert.equal(combatPlayer.health, combatPlayer.maxHealth);
    assert.equal(combatPlayer.physics.position.x, lethalCheckpoint.x);
    assert.equal(combatPlayer.physics.position.y, lethalCheckpoint.y);
    assert.equal(combatSimulation.runState, "playing");
    assert.equal(combatSession.submitImpactClaim(combatPlayer.id, lethalClaim), lethalReceipt);
    assert.equal(combatSimulation.metrics.defeats, 1, "duplicate lethal claims must not respawn twice");
    const forgedSimulation = new GameSimulation();
    const forgedPlayer = primaryPlayer(forgedSimulation);
    const forgedPartner = forgedSimulation.addPlayer({ x: 180, y: 500 });
    const forgedSession = new AuthorityServerSession({ simulation: forgedSimulation });
    forgedPlayer.weapon.cooldown = 0;
    forgedSession.advance();
    const foreignProjectile = forgedSimulation.projectiles[0];
    const foreignTarget = forgedSimulation.enemies.find(({ id }) => id === foreignProjectile.targetId);
    assert.equal(
        forgedSession.submitHitClaim(
            forgedPartner.entity.id,
            createProjectileHitClaim({
                predictionId: foreignProjectile.predictionId,
                targetId: foreignTarget.id,
                clientTick: forgedSimulation.tick,
                position: foreignTarget.position
            })
        ).reason,
        "projectile-ownership"
    );

    const lateSimulation = new GameSimulation();
    const latePlayer = primaryPlayer(lateSimulation);
    lateSimulation.enemies = [];
    const lateSession = new AuthorityServerSession({ simulation: lateSimulation });
    lateSession.advance();
    const elapsed = lateSession.submit(
        latePlayer.id,
        createPlayerCommandBatch(1, [{ playerId: latePlayer.id, sequence: 99, command: command(1) }])
    );
    assert.equal(elapsed.rejected[0].reason, "elapsed-tick");
    assert.deepEqual(lateSession.inbox.acknowledgements(), {}, "an unapplied command must never be acknowledged");
    const next = lateSession.submit(
        latePlayer.id,
        createPlayerCommandBatch(2, [{ playerId: latePlayer.id, sequence: 0, command: command(1) }])
    );
    assert.equal(next.accepted.length, 1, "a rejected high sequence must not poison the next executable command");
    lateSession.advance();
    assert.ok(latePlayer.physics.velocity.x > 0);
    const velocityAfterCommand = latePlayer.physics.velocity.x;
    lateSession.advance();
    assert.ok(
        latePlayer.physics.velocity.x > velocityAfterCommand,
        "the latest input state must continue across an empty 120Hz authority tick"
    );

    const expiringSimulation = new GameSimulation();
    const expiringPlayer = primaryPlayer(expiringSimulation);
    expiringSimulation.enemies = [];
    const expiringSession = new AuthorityServerSession({ simulation: expiringSimulation, inputHoldTicks: 2 });
    expiringSession.submit(
        expiringPlayer.id,
        createPlayerCommandBatch(1, [{ playerId: expiringPlayer.id, sequence: 0, command: command(1) }])
    );
    expiringSession.advance();
    expiringSession.advance();
    const velocityBeforeExpiry = expiringPlayer.physics.velocity.x;
    expiringSession.advance();
    assert.ok(
        expiringPlayer.physics.velocity.x <= velocityBeforeExpiry,
        "stale movement must stop accelerating after the bounded hold window"
    );

    const simulation = new GameSimulation();
    const primary = primaryPlayer(simulation);
    const partner = simulation.addPlayer({ x: 180, y: 500 });
    simulation.enemies = [];
    const session = new AuthorityServerSession({ simulation, snapshotIntervalTicks: 6 });
    simulation.metrics.activeSeconds = 42.5;
    simulation.metrics.enemyDefeats = 3;
    simulation.metrics.damageTaken = 20;

    const forged = session.submit(
        primary.id,
        createPlayerCommandBatch(1, [{ playerId: partner.entity.id, sequence: 0, command: command(-1) }])
    );
    assert.equal(forged.accepted.length, 0);
    assert.equal(forged.rejected[0].reason, "player-ownership");
    assert.deepEqual(session.inbox.acknowledgements(), {});

    let snapshot = null;
    for (let tick = 1; tick <= 6; tick += 1) {
        const primaryResult = session.submit(
            primary.id,
            createPlayerCommandBatch(tick, [{ playerId: primary.id, sequence: tick - 1, command: command(1) }])
        );
        const partnerResult = session.submit(
            partner.entity.id,
            createPlayerCommandBatch(tick, [{ playerId: partner.entity.id, sequence: tick - 1, command: command(-1) }])
        );
        assert.equal(primaryResult.accepted.length, 1);
        assert.equal(partnerResult.accepted.length, 1);
        snapshot = session.advance();
        if (tick < 6) assert.equal(snapshot, null);
    }

    assert.ok(primary.physics.velocity.x > 0);
    assert.ok(partner.physics.velocity.x < 0);
    assert.equal(snapshot.serverTick, 6);
    assert.equal(Object.hasOwn(snapshot.state, "combatEffects"), false, "server snapshots must not carry client VFX");
    assert.equal(Object.hasOwn(snapshot.state, "impact"), false, "server snapshots must not carry camera feedback");
    assert.deepEqual(snapshot.acknowledgements, {
        [primary.id]: 5,
        [partner.entity.id]: 5
    });
    assert.equal(snapshot.state.players.length, 2);
    assert.ok(Math.abs(snapshot.state.metrics.activeSeconds - 42.55) < 1e-9);
    assert.equal(snapshot.state.metrics.enemyDefeats, 3);
    assert.equal(snapshot.state.metrics.damageTaken, 20);
    assert.deepEqual(JSON.parse(JSON.stringify(snapshot)).state.metrics, snapshot.state.metrics);
    assert.deepEqual(session.snapshot().events, [], "events must drain after their scheduled snapshot");
    assert.throws(() => session.submit("missing-player", createPlayerCommandBatch(7, [])), /unknown authenticated/);
}
