import assert from "node:assert/strict";
import { createPlayerCommand } from "../src/game/commands/PlayerCommand.js";
import { FALL_DAMAGE_CONFIG, ROPE_CONFIG, ROPE_IMPACT_CONFIG } from "../src/game/config.js";
import { createPlayerImpactClaim, createPlayerImpactStateDigest } from "../src/game/network/PlayerImpactClaim.js";
import { createPlayerProjectileSpawnClaim } from "../src/game/network/PlayerProjectileSpawnClaim.js";
import { createRopeImpactClaim } from "../src/game/network/RopeImpactClaim.js";
import { AuthorityServerSession } from "../src/game/runtime/AuthorityServerSession.js";
import { RemoteGameAuthority } from "../src/game/runtime/RemoteGameAuthority.js";
import { GameSimulation } from "../src/game/simulation/GameSimulation.js";

const neutralCommand = createPlayerCommand(
    {
        horizontal: 0,
        vertical: 0,
        interact: false,
        pointer: { x: 0, y: 0, down: false },
        viewport: { width: 1280, height: 720 }
    },
    { x: 0, y: 0 }
);

const landingPlatform = Object.freeze({
    id: "multiplayer-fall-damage-platform",
    x: 0,
    y: 200,
    width: 240,
    height: 20,
    topY: 200,
    oneWay: true,
    vertices: Object.freeze([
        Object.freeze({ x: 0, y: 200 }),
        Object.freeze({ x: 240, y: 200 }),
        Object.freeze({ x: 240, y: 220 }),
        Object.freeze({ x: 0, y: 220 })
    ])
});

function primaryPlayer(simulation) {
    return simulation.players.find(({ id }) => id === simulation.getPrimaryPlayerId());
}

export function run() {
    const weaponSimulation = new GameSimulation({ playerId: "weapon-owner" });
    const weaponSession = new AuthorityServerSession({ simulation: weaponSimulation });
    const weaponPlayer = primaryPlayer(weaponSimulation);
    const weaponTarget = weaponSimulation.enemies[0];
    const disabledWeaponReceipt = weaponSession.submitProjectileSpawnClaim(
        weaponPlayer.id,
        createPlayerProjectileSpawnClaim({
            predictionId: `${weaponPlayer.id}:0`,
            clientTick: 0,
            targetId: weaponTarget.id,
            position: weaponPlayer.physics.position
        })
    );
    assert.deepEqual(
        disabledWeaponReceipt,
        { predictionId: `${weaponPlayer.id}:0`, accepted: false, reason: "weapon-disabled" },
        "the server must reject legacy automatic-fire claims while the retained system is disabled"
    );

    const predictedRopeSimulation = new GameSimulation({ playerId: "rope-owner" });
    const predictedRopePlayer = primaryPlayer(predictedRopeSimulation);
    const predictedRopeEnemy = predictedRopeSimulation.enemies[0];
    predictedRopeSimulation.enemies = [predictedRopeEnemy];
    predictedRopeSimulation.activeCollisionSurfaces = [];
    predictedRopePlayer.physics.position.set(0, 0);
    predictedRopePlayer.physics.velocity.set(ROPE_IMPACT_CONFIG.minimumSpeed + 100, 0);
    predictedRopePlayer.ropeObject.rope.attach(predictedRopePlayer.physics.position, { x: 0, y: -80 });
    predictedRopeEnemy.position.set(20, 0);
    const predictedRopeHealth = predictedRopeEnemy.health;
    const ropePrediction = predictedRopeSimulation.advanceOwnerPrediction(predictedRopePlayer.id, neutralCommand, 0, 1)
        .ropeImpactEvents[0];
    assert.ok(ropePrediction, "the owner must emit a rope impact before any server receipt");
    assert.equal(
        predictedRopeEnemy.health,
        predictedRopeHealth,
        "client prediction must not write server-owned enemy health"
    );

    const ropeServerSimulation = new GameSimulation({ playerId: predictedRopePlayer.id });
    const ropeServerEnemy = ropeServerSimulation.enemies[0];
    ropeServerSimulation.enemies = [ropeServerEnemy];
    ropeServerEnemy.position.set(20, 0);
    ropeServerSimulation.applyOwnerMotion(predictedRopePlayer.id, {
        ...predictedRopeSimulation.ownerPredictionState(predictedRopePlayer.id),
        clientTick: ropePrediction.clientTick
    });
    const ropeSession = new AuthorityServerSession({ simulation: ropeServerSimulation });
    const ropeClaim = createRopeImpactClaim({
        predictionId: ropePrediction.predictionId,
        targetId: ropePrediction.targetId,
        clientTick: ropePrediction.clientTick,
        position: ropePrediction.position,
        velocity: ropePrediction.velocity
    });
    ropeServerEnemy.position.set(240, 0);
    assert.deepEqual(Object.keys(ropeClaim).sort(), [
        "clientTick",
        "position",
        "predictionId",
        "protocolVersion",
        "targetId",
        "velocity"
    ]);
    const ropeReceipt = ropeSession.submitRopeImpact(predictedRopePlayer.id, ropeClaim);
    assert.equal(ropeReceipt.accepted, true);
    assert.equal(
        ropeReceipt.reason,
        undefined,
        "server target movement after owner observation must not reject the owner's collision"
    );
    assert.equal(ropeServerEnemy.health, predictedRopeHealth - ROPE_IMPACT_CONFIG.damage);
    assert.equal(ropeSession.submitRopeImpact(predictedRopePlayer.id, ropeClaim), ropeReceipt);
    assert.equal(
        ropeServerSimulation
            .drainReplicationEvents()
            .filter(({ parameters }) => parameters?.predictionId === ropePrediction.predictionId).length,
        1,
        "a duplicate rope impact claim must damage and replicate exactly once"
    );
    const repeatedContactClaim = createRopeImpactClaim({
        ...ropeClaim,
        predictionId: `${predictedRopePlayer.id}:rope-impact:2:${ropeServerEnemy.id}`,
        clientTick: 2
    });
    assert.equal(ropeSession.submitRopeImpact(predictedRopePlayer.id, repeatedContactClaim).accepted, true);
    assert.equal(
        ropeServerEnemy.health,
        predictedRopeHealth - ROPE_IMPACT_CONFIG.damage * 2,
        "the server must trust each unique owner collision instead of rebuilding the contact gate"
    );

    ropeServerSimulation.applyOwnerMotion(predictedRopePlayer.id, {
        clientTick: 2,
        position: { x: 200, y: 0 },
        velocity: { x: 0, y: 0 },
        angle: 0,
        angularVelocity: 0,
        isGrounded: false,
        rope: {
            isAttached: true,
            anchor: { x: 200, y: -80 },
            attachmentOffset: ROPE_CONFIG.handOffset
        },
        launcher: null
    });
    ropeServerSimulation.applyOwnerMotion(predictedRopePlayer.id, {
        clientTick: 3,
        position: { x: 0, y: 0 },
        velocity: { x: 100, y: 0 },
        angle: 0,
        angularVelocity: 0,
        isGrounded: false,
        rope: {
            isAttached: true,
            anchor: { x: 0, y: -80 },
            attachmentOffset: ROPE_CONFIG.handOffset
        },
        launcher: null
    });
    const forgedVelocityClaim = createRopeImpactClaim({
        predictionId: `${predictedRopePlayer.id}:rope-impact:3:${ropeServerEnemy.id}`,
        targetId: ropeServerEnemy.id,
        clientTick: 3,
        position: ropeServerEnemy.position,
        velocity: { x: 5000, y: 0 }
    });
    const velocityReceipt = ropeSession.submitRopeImpact(predictedRopePlayer.id, forgedVelocityClaim);
    assert.equal(velocityReceipt.accepted, true);
    assert.equal(velocityReceipt.damage, ROPE_IMPACT_CONFIG.damage, "claimed velocity must not change official damage");

    const predictedFallSimulation = new GameSimulation({ playerId: "fall-owner" });
    predictedFallSimulation.enemies = [];
    predictedFallSimulation.activeCollisionSurfaces = [landingPlatform];
    const predictedFallPlayer = primaryPlayer(predictedFallSimulation);
    predictedFallPlayer.physics.position.set(120, 180);
    predictedFallPlayer.physics.velocity.set(0, 1100);
    const fallPrediction = predictedFallSimulation.advanceOwnerPrediction(
        predictedFallPlayer.id,
        neutralCommand,
        1 / 120,
        1
    ).fallImpactEvents[0];
    assert.ok(fallPrediction, "landing damage must change owner HP before any server receipt");
    assert.ok(fallPrediction.impactSpeed > FALL_DAMAGE_CONFIG.safeImpactSpeed);
    assert.equal(predictedFallPlayer.health, predictedFallPlayer.maxHealth - fallPrediction.damage);

    const fallServerSimulation = new GameSimulation({ playerId: predictedFallPlayer.id });
    fallServerSimulation.enemies = [];
    fallServerSimulation.applyOwnerMotion(
        predictedFallPlayer.id,
        predictedFallSimulation.ownerPredictionState(predictedFallPlayer.id)
    );
    const fallSession = new AuthorityServerSession({ simulation: fallServerSimulation });
    const finalFallState = predictedFallSimulation.playerState(predictedFallPlayer.id);
    const fallClaim = createPlayerImpactClaim({
        impactId: fallPrediction.impactId,
        clientTick: fallPrediction.clientTick,
        impactType: "fall-damage",
        position: fallPrediction.position,
        velocity: fallPrediction.velocity,
        damage: fallPrediction.damage,
        outcome: {
            respawned: fallPrediction.respawned,
            digest: createPlayerImpactStateDigest(finalFallState, {
                impactType: "fall-damage",
                respawned: fallPrediction.respawned
            })
        }
    });
    assert.throws(
        () => createPlayerImpactClaim({ ...fallClaim, projectileId: "different-impact" }),
        /must match/,
        "the compatibility alias must not identify a different impact"
    );
    assert.equal(fallClaim.outcome.state, undefined, "a normal fall claim must carry no recovery state");
    const fallReceipt = fallSession.submitImpactClaim(predictedFallPlayer.id, fallClaim);
    assert.equal(fallReceipt.accepted, true);
    assert.equal(fallServerSimulation.playerState(predictedFallPlayer.id).health, finalFallState.health);
    assert.equal(fallSession.submitImpactClaim(predictedFallPlayer.id, fallClaim), fallReceipt);
    assert.equal(
        fallServerSimulation.drainReplicationEvents().filter(({ impactId }) => impactId === fallPrediction.impactId)
            .length,
        1,
        "a duplicate fall impact claim must converge and replicate exactly once"
    );

    const authorityEvent = {
        eventType: "resolve",
        resolution: "enemy-hit",
        parameters: { sourceKind: "rope-impact", predictionId: "rope-impact-same" }
    };
    const feedbackAuthority = new RemoteGameAuthority({
        url: "ws://rope-impact.test/multiplayer",
        WebSocketImpl: { OPEN: 1 }
    });
    feedbackAuthority.buffer = { drainEvents: () => [authorityEvent] };
    feedbackAuthority.locallyPredictedRopeImpactIds.add("rope-impact-same");
    feedbackAuthority.predictedRopeImpactResolutions.set("rope-impact-same", "enemy-hit");
    assert.deepEqual(feedbackAuthority.drainEvents(), [], "matching authority feedback must be deduplicated");
    feedbackAuthority.buffer = {
        drainEvents: () => [
            {
                ...authorityEvent,
                resolution: "enemy-defeated",
                parameters: { ...authorityEvent.parameters, predictionId: "rope-impact-corrected" }
            }
        ]
    };
    feedbackAuthority.locallyPredictedRopeImpactIds.add("rope-impact-corrected");
    feedbackAuthority.predictedRopeImpactResolutions.set("rope-impact-corrected", "enemy-hit");
    assert.equal(
        feedbackAuthority.drainEvents()[0].resolution,
        "enemy-defeated",
        "a differing authority resolution must pass through as correction feedback"
    );
}
