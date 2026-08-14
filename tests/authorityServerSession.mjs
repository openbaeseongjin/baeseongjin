import assert from "node:assert/strict";
import { ARTIFACT_CATALOG } from "../src/game/artifacts/ArtifactCatalog.js";
import { createPlayerCommand } from "../src/game/commands/PlayerCommand.js";
import { BallisticProjectileObject } from "../src/game/combat/ProjectileObject.js";
import { createArtifactSelectionClaim } from "../src/game/network/ArtifactSelectionClaim.js";
import { createCheckpointClaim } from "../src/game/network/CheckpointClaim.js";
import { createPlayerCommandBatch } from "../src/game/network/PlayerCommandBatch.js";
import { createProjectileHitClaim } from "../src/game/network/ProjectileHitClaim.js";
import { createPlayerImpactClaim, createPlayerImpactStateDigest } from "../src/game/network/PlayerImpactClaim.js";
import { createPlayerProjectileSpawnClaim } from "../src/game/network/PlayerProjectileSpawnClaim.js";
import { createOwnerMotionState } from "../src/game/network/OwnerMotionState.js";
import { createRopeSwingClaim } from "../src/game/network/RopeSwingClaim.js";
import { Vector2 } from "../src/game-kit/index.js";
import { COMBAT_CONFIG, PLAYER_CONFIG, ROPE_CONFIG, WORLD_CONFIG } from "../src/game/config.js";
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
    const forgedRewardCommand = {
        ...command(0),
        vertical: -1,
        interact: true
    };
    const forgedRewardBatch = createPlayerCommandBatch(rewardSimulation.tick + 1, [
        { playerId: rewardPlayer.id, sequence: 1, command: forgedRewardCommand }
    ]);
    assert.equal(rewardSession.submit(rewardPlayer.id, forgedRewardBatch).accepted.length, 1);
    rewardSession.advance();
    assert.equal(
        rewardSimulation.artifactRewards.has(rewardPlayer.id),
        true,
        "scheduled gameplay input must not bypass the artifact selection claim"
    );
    assert.equal(rewardPlayer.artifacts.snapshot().length, 0);
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

    const deathSimulation = new GameSimulation();
    const deathPlayer = primaryPlayer(deathSimulation);
    deathSimulation.enemies = [];
    const deathSession = new AuthorityServerSession({ simulation: deathSimulation });
    deathPlayer.health = 0;
    deathSession.advance();
    assert.equal(deathPlayer.health, 0, "the server fixed tick must not initiate a victim-owned death transition");
    assert.equal(
        deathSimulation.drainReplicationEvents().filter(({ eventType }) => eventType === "player-respawned").length,
        0
    );

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

    const timeSkewSimulation = new GameSimulation();
    const timeSkewPlayer = primaryPlayer(timeSkewSimulation);
    const timeSkewSession = new AuthorityServerSession({ simulation: timeSkewSimulation });
    const farFutureMotion = createOwnerMotionState({
        clientTick: 10000,
        position: { x: timeSkewPlayer.physics.position.x + 12, y: timeSkewPlayer.physics.position.y },
        velocity: { x: 120, y: 0 },
        isGrounded: false,
        rope: { isAttached: false, anchor: null }
    });
    const farFutureReceipt = timeSkewSession.submitOwnerMotion(timeSkewPlayer.id, farFutureMotion);
    assert.equal(farFutureReceipt.accepted, true, "an out-of-window owner state must not produce a rejection");
    assert.equal(farFutureReceipt.resolution, "ignored-tick-window");
    assert.equal(
        timeSkewSession.lastOwnerMotionTicks.has(timeSkewPlayer.id),
        false,
        "an ignored future tick must not poison the monotonic owner timeline"
    );

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
    assert.equal(combatPlayer.physics.velocity.x, 700, "server world must accept owner motion");
    const duplicateMotion = combatSession.submitOwnerMotion(combatPlayer.id, ownerMotion);
    assert.equal(duplicateMotion.accepted, true);
    assert.equal(duplicateMotion.resolution, "ignored-stale");
    assert.equal(combatPlayer.physics.velocity.x, 700, "duplicate owner motion must be an accepted no-op");

    const largeMotion = createOwnerMotionState({
        ...ownerMotion,
        clientTick: ownerMotion.clientTick + 1,
        position: { x: ownerMotion.position.x + 5000, y: ownerMotion.position.y - 4000 },
        velocity: { x: 9999, y: -7777 },
        angle: Math.PI,
        angularVelocity: 999,
        rope: {
            isAttached: true,
            anchor: { x: ownerMotion.position.x + 5000, y: ownerMotion.position.y - 4080 },
            attachmentOffset: { x: ROPE_CONFIG.handOffset.x * 3, y: ROPE_CONFIG.handOffset.y + 12 }
        }
    });
    const largeMotionReceipt = combatSession.submitOwnerMotion(combatPlayer.id, largeMotion);
    assert.equal(
        largeMotionReceipt.accepted,
        true,
        "finite owner motion must not be rejected by speed, angular, distance, or rope envelopes"
    );
    assert.deepEqual({ x: combatPlayer.physics.position.x, y: combatPlayer.physics.position.y }, largeMotion.position);
    assert.deepEqual({ x: combatPlayer.physics.velocity.x, y: combatPlayer.physics.velocity.y }, largeMotion.velocity);
    assert.equal(
        combatPlayer.physics.angularVelocity,
        PLAYER_CONFIG.maxAngularSpeed,
        "the domain physics may clamp angular speed without rejecting the owner state"
    );
    assert.deepEqual(
        {
            x: combatPlayer.ropeObject.rope.attachmentOffset.x,
            y: combatPlayer.ropeObject.rope.attachmentOffset.y
        },
        largeMotion.rope.attachmentOffset
    );

    const acceptedRelease = combatSession.submitOwnerMotion(
        combatPlayer.id,
        createOwnerMotionState({
            ...ownerMotion,
            clientTick: ownerMotion.clientTick + 2,
            rope: { isAttached: false, anchor: null }
        })
    );
    assert.equal(acceptedRelease.accepted, true);
    assert.equal(
        combatPlayer.ropeObject.rope.isAttached,
        false,
        "the latest owner state must release the rope atomically with continuous motion"
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
                anchor: { x: combatPlayer.physics.position.x, y: combatPlayer.physics.position.y - 80 },
                attachmentOffset: ROPE_CONFIG.handOffset
            }
        })
    );
    assert.equal(delayedAttach.accepted, true, "late continuous motion must be an accepted no-op");
    assert.equal(delayedAttach.resolution, "ignored-stale");
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
            velocity: { x: 0, y: 5000 },
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
    assert.equal(
        combatSimulation.projectiles.length,
        0,
        "the multiplayer server fixed tick must not initiate a player projectile"
    );
    combatPlayer.artifacts.add(ARTIFACT_CATALOG.find(({ id }) => id === "rope-resonance"));
    const swingAnchor = {
        x: combatPlayer.physics.position.x,
        y: combatPlayer.physics.position.y - 80
    };
    combatPlayer.ropeObject.rope.attach(combatPlayer.physics.position, swingAnchor);
    const swingClaim = createRopeSwingClaim({
        predictionId: `${combatPlayer.id}:swing:${combatSimulation.tick}`,
        clientTick: combatSimulation.tick,
        position: combatPlayer.physics.position,
        anchor: swingAnchor
    });
    const swingReceipt = combatSession.submitRopeSwingClaim(combatPlayer.id, swingClaim);
    assert.equal(swingReceipt.accepted, true);
    assert.equal(combatSession.submitRopeSwingClaim(combatPlayer.id, swingClaim), swingReceipt);
    assert.equal(combatPlayer.ropeDamageBoostRemaining, swingReceipt.duration);
    assert.equal(
        combatSimulation.drainReplicationEvents().filter(({ eventType }) => eventType === "rope-swing").length,
        1,
        "a duplicate swing claim must produce one shared transition"
    );
    const spawnTarget = combatSimulation.enemies
        .filter((enemy) => combatPlayer.physics.position.distanceTo(enemy.position) <= combatPlayer.weapon.range)
        .sort((left, right) => {
            const distanceDifference =
                combatPlayer.physics.position.distanceTo(left.position) -
                combatPlayer.physics.position.distanceTo(right.position);
            return distanceDifference || left.id.localeCompare(right.id);
        })[0];
    const predictedOwnerPosition = combatPlayer.physics.position
        .clone()
        .add(spawnTarget.position.clone().subtract(combatPlayer.physics.position).normalize().scale(20));
    const predictedSpawnPosition = combatPlayer.physics.collider.outsidePointToward(
        predictedOwnerPosition,
        spawnTarget.position,
        combatPlayer.weapon.projectileRadius + combatPlayer.weapon.projectileSpawnClearance
    );
    const forgedSpawnReceipt = combatSession.submitProjectileSpawnClaim(
        combatPlayer.id,
        createPlayerProjectileSpawnClaim({
            predictionId: `${combatPlayer.id}:${combatSimulation.tick}`,
            clientTick: combatSimulation.tick,
            targetId: spawnTarget.id,
            position: { x: predictedSpawnPosition.x + 1000, y: predictedSpawnPosition.y }
        })
    );
    assert.equal(forgedSpawnReceipt.accepted, false);
    assert.equal(forgedSpawnReceipt.reason, "position-mismatch");
    const spawnClaim = createPlayerProjectileSpawnClaim({
        predictionId: `${combatPlayer.id}:${combatSimulation.tick}`,
        clientTick: combatSimulation.tick,
        targetId: spawnTarget.id,
        position: predictedSpawnPosition
    });
    const spawnReceipt = combatSession.submitProjectileSpawnClaim(combatPlayer.id, spawnClaim);
    assert.equal(spawnReceipt.accepted, true);
    assert.equal(combatSession.submitProjectileSpawnClaim(combatPlayer.id, spawnClaim), spawnReceipt);
    assert.equal(combatSimulation.projectiles.length, 1, "a duplicate spawn claim must not create two bullets");
    const projectile = combatSimulation.projectiles[0];
    assert.equal(
        combatPlayer.physics.collider.overlapsCircle(
            combatPlayer.physics.position,
            projectile.position,
            projectile.radius
        ),
        false,
        "the server-confirmed shot must start outside the owner collider"
    );
    assert.equal(projectile.damage, combatPlayer.weapon.damage);
    assert.deepEqual(projectile.position, new Vector2(predictedSpawnPosition.x, predictedSpawnPosition.y));
    assert.ok(
        projectile.damage > combatPlayer.weapon.baseDamage,
        "a same-tick projectile claim must use the preceding swing claim boost"
    );
    const target = combatSimulation.enemies.find(({ id }) => id === projectile.targetId);
    projectile.position = target.position.clone();
    const healthBeforeClaim = target.health;
    combatSession.advance();
    assert.equal(
        target.health,
        healthBeforeClaim,
        "the server fixed tick must not hit a simulation-driven enemy before the attacker claim"
    );
    assert.ok(combatSimulation.projectiles.includes(projectile));
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
    const impactProjectile = new BallisticProjectileObject({
        id: "enemy-impact-1",
        ownerId: "enemy-1",
        targetId: combatPlayer.id,
        position: combatPlayer.physics.position.clone(),
        velocity: new Vector2(120, 0),
        radius: 7,
        damage: 20
    });
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
    const acceptedImpactState = combatSimulation.playerState(combatPlayer.id);
    acceptedImpactState.health = playerHealthBeforeImpact - impactProjectile.damage;
    acceptedImpactState.velocity.x += COMBAT_CONFIG.playerHitKnockback;
    acceptedImpactState.hitInvulnerabilityRemaining = COMBAT_CONFIG.playerHitInvulnerability;
    const impactClaim = createPlayerImpactClaim({
        projectileId: impactProjectile.id,
        clientTick: victimClaimTick,
        impactType: "player-hit",
        position: victimClaimPosition,
        velocity: impactProjectile.velocity,
        damage: impactProjectile.damage,
        outcome: {
            respawned: false,
            digest: createPlayerImpactStateDigest(acceptedImpactState, {
                impactType: "player-hit",
                respawned: false
            })
        }
    });
    assert.equal(impactClaim.outcome.state, undefined, "the normal impact path must not send owner state");
    assert.throws(
        () =>
            createPlayerImpactClaim({
                ...impactClaim,
                impactType: "rope-cut",
                outcome: { ...impactClaim.outcome, respawned: true }
            }),
        /only player-hit/
    );
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
    const divergentProjectile = new BallisticProjectileObject({
        id: "enemy-impact-divergent",
        ownerId: "enemy-1",
        targetId: "stale-server-target",
        position: combatPlayer.physics.position.clone(),
        velocity: new Vector2(120, 0),
        radius: 7,
        damage: 20
    });
    combatSimulation.enemyProjectiles.push(divergentProjectile);
    combatPlayer.health = 99;
    combatPlayer.hitInvulnerabilityRemaining = 0.4;
    const victimState = combatSimulation.playerState(combatPlayer.id);
    victimState.health = 37;
    victimState.hitInvulnerabilityRemaining = 0.2;
    const divergentClaim = createPlayerImpactClaim({
        projectileId: divergentProjectile.id,
        clientTick: combatSimulation.tick + 1000,
        impactType: "player-hit",
        position: divergentProjectile.position,
        velocity: divergentProjectile.velocity,
        damage: divergentProjectile.damage,
        outcome: {
            respawned: false,
            digest: createPlayerImpactStateDigest(victimState, { impactType: "player-hit", respawned: false })
        }
    });
    const unrequestedRecovery = createPlayerImpactClaim({
        ...divergentClaim,
        outcome: {
            ...divergentClaim.outcome,
            recoveryId: "recovery-not-issued-by-server",
            stateTick: combatSimulation.tick,
            state: victimState
        }
    });
    const unrequestedRecoveryReceipt = combatSession.submitImpactClaim(combatPlayer.id, unrequestedRecovery);
    assert.equal(unrequestedRecoveryReceipt.accepted, false);
    assert.equal(
        unrequestedRecoveryReceipt.reason,
        "recovery-not-requested",
        "a full owner state must not bypass the compact impact probe without a server challenge"
    );
    assert.equal(combatPlayer.health, 99, "an unrequested recovery must not mutate the server player");
    assert.throws(
        () =>
            createPlayerImpactClaim({
                ...divergentClaim,
                outcome: {
                    ...divergentClaim.outcome,
                    recoveryId: "invalid-recovery-state",
                    stateTick: combatSimulation.tick,
                    state: { ...victimState, health: -1 }
                }
            }),
        /outcome\.state\.health/,
        "every field restored by impact recovery must pass the wire schema"
    );
    const divergentReceipt = combatSession.submitImpactClaim(combatPlayer.id, divergentClaim);
    assert.equal(
        divergentReceipt.accepted,
        false,
        "a mismatched compact impact must request state recovery instead of pretending to converge"
    );
    assert.equal(divergentReceipt.reason, "state-diverged");
    assert.match(divergentReceipt.recoveryId, /^impact-recovery:/);
    assert.equal(combatPlayer.health, 99, "a digest probe must not leave its provisional transition on the server");
    assert.equal(
        combatPlayer.hitInvulnerabilityRemaining,
        0.4,
        "a digest probe must preserve the pre-recovery server timer"
    );
    const divergentRecoveryClaim = createPlayerImpactClaim({
        ...divergentClaim,
        outcome: {
            ...divergentClaim.outcome,
            recoveryId: divergentReceipt.recoveryId,
            stateTick: combatSimulation.tick,
            state: victimState
        }
    });
    assert.ok(divergentRecoveryClaim.outcome.state, "only the divergence recovery path must carry owner state");
    const divergentRecoveryReceipt = combatSession.submitImpactClaim(combatPlayer.id, divergentRecoveryClaim);
    assert.equal(divergentRecoveryReceipt.accepted, true);
    assert.equal(combatPlayer.health, victimState.health, "server HP must converge to the victim client's final value");
    assert.equal(
        combatPlayer.hitInvulnerabilityRemaining,
        victimState.hitInvulnerabilityRemaining,
        "server impact timers must converge to the victim client"
    );
    assert.equal(
        combatSession.lastOwnerMotionTicks.get(combatPlayer.id),
        divergentRecoveryClaim.outcome.stateTick,
        "the recovered owner state and its interpolation tick must advance atomically"
    );
    assert.equal(
        combatSimulation.enemyProjectiles.some(({ id }) => id === divergentProjectile.id),
        false,
        "the converged impact must consume the shared projectile"
    );
    const missingProjectileState = combatSimulation.playerState(combatPlayer.id);
    missingProjectileState.health = 19;
    const missingProjectileClaim = createPlayerImpactClaim({
        projectileId: "expired-before-impact-arrived",
        clientTick: combatSimulation.tick + 2000,
        impactType: "player-hit",
        position: combatPlayer.physics.position,
        velocity: { x: 120, y: 0 },
        damage: 18,
        outcome: {
            respawned: false,
            digest: createPlayerImpactStateDigest(missingProjectileState, {
                impactType: "player-hit",
                respawned: false
            })
        }
    });
    const missingProjectileReceipt = combatSession.submitImpactClaim(combatPlayer.id, missingProjectileClaim);
    assert.equal(
        missingProjectileReceipt.accepted,
        false,
        "an expired projectile may request recovery but must not discard the victim result"
    );
    assert.equal(missingProjectileReceipt.reason, "state-diverged");
    const missingProjectileRecovery = createPlayerImpactClaim({
        ...missingProjectileClaim,
        outcome: {
            ...missingProjectileClaim.outcome,
            recoveryId: missingProjectileReceipt.recoveryId,
            stateTick: combatSimulation.tick,
            state: missingProjectileState
        }
    });
    assert.equal(combatSession.submitImpactClaim(combatPlayer.id, missingProjectileRecovery).accepted, true);
    assert.equal(combatPlayer.health, missingProjectileState.health);
    const lethalCheckpoint = combatSimulation.world.checkpoints[1];
    combatSimulation.activeCheckpoint = lethalCheckpoint;
    combatPlayer.health = 5;
    combatPlayer.hitInvulnerabilityRemaining = 0;
    const lethalProjectile = new BallisticProjectileObject({
        id: "enemy-impact-lethal",
        ownerId: "enemy-1",
        targetId: combatPlayer.id,
        position: combatPlayer.physics.position.clone(),
        velocity: new Vector2(120, 0),
        radius: 7,
        damage: 20
    });
    combatSimulation.enemyProjectiles.push(lethalProjectile);
    const lethalVictimSimulation = new GameSimulation({
        worldSeed: combatSimulation.world.seed,
        playerId: combatPlayer.id
    });
    lethalVictimSimulation.preparePrediction([], lethalCheckpoint.id);
    lethalVictimSimulation.restoreOwnerPrediction(
        combatPlayer.id,
        combatSimulation.playerState(combatPlayer.id),
        combatSimulation.tick
    );
    lethalVictimSimulation.applyPredictedOwnerImpact(combatPlayer.id, {
        resolution: "player-hit",
        velocity: lethalProjectile.velocity,
        parameters: { damage: lethalProjectile.damage }
    });
    const lethalOutcomeState = lethalVictimSimulation.playerState(combatPlayer.id);
    const lethalClaim = createPlayerImpactClaim({
        projectileId: lethalProjectile.id,
        clientTick: combatSimulation.tick,
        impactType: "player-hit",
        position: combatPlayer.physics.position,
        velocity: lethalProjectile.velocity,
        damage: lethalProjectile.damage,
        outcome: {
            respawned: true,
            digest: createPlayerImpactStateDigest(lethalOutcomeState, {
                impactType: "player-hit",
                respawned: true
            })
        }
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
    const forgedTarget = forgedSimulation.enemies
        .filter((enemy) => forgedPlayer.physics.position.distanceTo(enemy.position) <= forgedPlayer.weapon.range)
        .sort((left, right) => {
            const distanceDifference =
                forgedPlayer.physics.position.distanceTo(left.position) -
                forgedPlayer.physics.position.distanceTo(right.position);
            return distanceDifference || left.id.localeCompare(right.id);
        })[0];
    const foreignSpawn = forgedSession.submitProjectileSpawnClaim(
        forgedPlayer.id,
        createPlayerProjectileSpawnClaim({
            predictionId: `${forgedPlayer.id}:${forgedSimulation.tick}`,
            clientTick: forgedSimulation.tick,
            targetId: forgedTarget.id,
            position: forgedPlayer.physics.position
        })
    );
    assert.equal(foreignSpawn.accepted, true);
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
    assert.equal(
        latePlayer.physics.velocity.x,
        0,
        "accepted commands must not make the multiplayer server re-integrate client-owned motion"
    );
    const acceptedOwnerMotion = lateSession.submitOwnerMotion(
        latePlayer.id,
        createOwnerMotionState({
            clientTick: 3,
            position: { x: latePlayer.physics.position.x + 12, y: latePlayer.physics.position.y },
            velocity: { x: 120, y: 0 },
            isGrounded: latePlayer.physics.isGrounded,
            rope: { isAttached: false, anchor: null }
        })
    );
    assert.equal(acceptedOwnerMotion.accepted, true);
    assert.equal(latePlayer.physics.velocity.x, 120, "owner-motion must be the multiplayer motion source");
    const positionAfterOwnerMotion = latePlayer.physics.position.x;
    lateSession.advance();
    assert.equal(
        latePlayer.physics.position.x,
        positionAfterOwnerMotion,
        "server fixed ticks must preserve the last accepted owner position"
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
        const primaryState = simulation.playerState(primary.id);
        const partnerState = simulation.playerState(partner.entity.id);
        assert.equal(
            session.submitOwnerMotion(
                primary.id,
                createOwnerMotionState({
                    clientTick: tick,
                    position: { x: primaryState.position.x + 4, y: primaryState.position.y },
                    velocity: { x: 240, y: 0 },
                    isGrounded: primaryState.isGrounded,
                    rope: { isAttached: false, anchor: null }
                })
            ).accepted,
            true
        );
        assert.equal(
            session.submitOwnerMotion(
                partner.entity.id,
                createOwnerMotionState({
                    clientTick: tick,
                    position: { x: partnerState.position.x - 4, y: partnerState.position.y },
                    velocity: { x: -240, y: 0 },
                    isGrounded: partnerState.isGrounded,
                    rope: { isAttached: false, anchor: null }
                })
            ).accepted,
            true
        );
        snapshot = session.advance();
        if (tick < 6) assert.equal(snapshot, null);
    }

    assert.ok(primary.physics.velocity.x > 0);
    assert.ok(partner.physics.velocity.x < 0);
    assert.equal(snapshot.serverTick, 6);
    simulation.recordReplicationEvent("same-tick-test", { playerId: primary.id });
    const nextSameTickSnapshot = session.snapshot();
    assert.equal(nextSameTickSnapshot.serverTick, snapshot.serverTick);
    assert.equal(
        nextSameTickSnapshot.snapshotSequence,
        snapshot.snapshotSequence + 1,
        "every emitted snapshot needs an order independent from the simulation tick"
    );
    assert.equal(
        nextSameTickSnapshot.events[0].eventType,
        "same-tick-test",
        "an event emitted without advancing simulation time must still receive a newer snapshot"
    );
    assert.equal(Object.hasOwn(snapshot.state, "combatEffects"), false, "server snapshots must not carry client VFX");
    assert.equal(Object.hasOwn(snapshot.state, "impact"), false, "server snapshots must not carry camera feedback");
    assert.deepEqual(snapshot.acknowledgements, {
        [primary.id]: 5,
        [partner.entity.id]: 5
    });
    assert.equal(snapshot.state.players.length, 2);
    assert.deepEqual(
        Object.fromEntries(snapshot.state.players.map(({ id, ownerMotionTick }) => [id, ownerMotionTick])),
        { [primary.id]: 6, [partner.entity.id]: 6 },
        "each player state must expose the client tick that produced its motion"
    );
    assert.ok(Math.abs(snapshot.state.metrics.activeSeconds - 42.55) < 1e-9);
    assert.equal(snapshot.state.metrics.enemyDefeats, 3);
    assert.equal(snapshot.state.metrics.damageTaken, 20);
    assert.deepEqual(JSON.parse(JSON.stringify(snapshot)).state.metrics, snapshot.state.metrics);
    assert.deepEqual(session.snapshot().events, [], "events must drain after their scheduled snapshot");
    assert.throws(() => session.submit("missing-player", createPlayerCommandBatch(7, [])), /unknown authenticated/);
}
