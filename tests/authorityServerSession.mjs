import assert from "node:assert/strict";
import { createPlayerCommand } from "../src/game/commands/PlayerCommand.js";
import { createPlayerCommandBatch } from "../src/game/network/PlayerCommandBatch.js";
import { createProjectileHitClaim } from "../src/game/network/ProjectileHitClaim.js";
import { createPlayerImpactClaim } from "../src/game/network/PlayerImpactClaim.js";
import { Vector2 } from "../src/game-kit/index.js";
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

export function run() {
    const combatSimulation = new GameSimulation();
    const combatSession = new AuthorityServerSession({ simulation: combatSimulation });
    combatSimulation.playerEntity.weapon.cooldown = 0;
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
    const acceptedClaim = combatSession.submitHitClaim(combatSimulation.playerEntity.id, claim);
    assert.equal(acceptedClaim.accepted, true);
    assert.equal(
        target.health,
        healthBeforeClaim - projectile.damage,
        "the server must apply its own projectile damage"
    );
    assert.equal(combatSession.submitHitClaim(combatSimulation.playerEntity.id, claim), acceptedClaim);
    assert.equal(
        target.health,
        healthBeforeClaim - projectile.damage,
        "a duplicate claim must never deal damage twice"
    );
    const impactProjectile = {
        id: "enemy-impact-1",
        ownerId: "enemy-1",
        targetId: combatSimulation.playerEntity.id,
        position: combatSimulation.player.position.clone(),
        velocity: new Vector2(120, 0),
        radius: 7,
        damage: 20
    };
    combatSimulation.enemyProjectiles.push(impactProjectile);
    const playerHealthBeforeImpact = combatSimulation.playerEntity.health;
    const impactClaim = createPlayerImpactClaim({
        projectileId: impactProjectile.id,
        clientTick: combatSimulation.tick,
        impactType: "player-hit",
        position: combatSimulation.player.position
    });
    const acceptedImpact = combatSession.submitImpactClaim(combatSimulation.playerEntity.id, impactClaim);
    assert.equal(acceptedImpact.accepted, true, "the victim client may claim its own immediate impact");
    assert.equal(combatSimulation.playerEntity.health, playerHealthBeforeImpact - impactProjectile.damage);
    assert.equal(combatSession.submitImpactClaim(combatSimulation.playerEntity.id, impactClaim), acceptedImpact);
    assert.equal(
        combatSimulation.playerEntity.health,
        playerHealthBeforeImpact - impactProjectile.damage,
        "a duplicate victim impact claim must be idempotent"
    );
    const forgedSimulation = new GameSimulation();
    const forgedPartner = forgedSimulation.addPlayer({ x: 180, y: 500 });
    const forgedSession = new AuthorityServerSession({ simulation: forgedSimulation });
    forgedSimulation.playerEntity.weapon.cooldown = 0;
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
    lateSimulation.enemies = [];
    const lateSession = new AuthorityServerSession({ simulation: lateSimulation });
    lateSession.advance();
    const elapsed = lateSession.submit(
        lateSimulation.playerEntity.id,
        createPlayerCommandBatch(1, [{ playerId: lateSimulation.playerEntity.id, sequence: 99, command: command(1) }])
    );
    assert.equal(elapsed.rejected[0].reason, "elapsed-tick");
    assert.deepEqual(lateSession.inbox.acknowledgements(), {}, "an unapplied command must never be acknowledged");
    const next = lateSession.submit(
        lateSimulation.playerEntity.id,
        createPlayerCommandBatch(2, [{ playerId: lateSimulation.playerEntity.id, sequence: 0, command: command(1) }])
    );
    assert.equal(next.accepted.length, 1, "a rejected high sequence must not poison the next executable command");
    lateSession.advance();
    assert.ok(lateSimulation.player.velocity.x > 0);
    const velocityAfterCommand = lateSimulation.player.velocity.x;
    lateSession.advance();
    assert.ok(
        lateSimulation.player.velocity.x > velocityAfterCommand,
        "the latest input state must continue across an empty 120Hz authority tick"
    );

    const expiringSimulation = new GameSimulation();
    expiringSimulation.enemies = [];
    const expiringSession = new AuthorityServerSession({ simulation: expiringSimulation, inputHoldTicks: 2 });
    expiringSession.submit(
        expiringSimulation.playerEntity.id,
        createPlayerCommandBatch(1, [
            { playerId: expiringSimulation.playerEntity.id, sequence: 0, command: command(1) }
        ])
    );
    expiringSession.advance();
    expiringSession.advance();
    const velocityBeforeExpiry = expiringSimulation.player.velocity.x;
    expiringSession.advance();
    assert.ok(
        expiringSimulation.player.velocity.x <= velocityBeforeExpiry,
        "stale movement must stop accelerating after the bounded hold window"
    );

    const simulation = new GameSimulation();
    const partner = simulation.addPlayer({ x: 180, y: 500 });
    simulation.enemies = [];
    const session = new AuthorityServerSession({ simulation, snapshotIntervalTicks: 6 });
    simulation.metrics.activeSeconds = 42.5;
    simulation.metrics.enemyDefeats = 3;
    simulation.metrics.damageTaken = 20;

    const forged = session.submit(
        simulation.playerEntity.id,
        createPlayerCommandBatch(1, [{ playerId: partner.entity.id, sequence: 0, command: command(-1) }])
    );
    assert.equal(forged.accepted.length, 0);
    assert.equal(forged.rejected[0].reason, "player-ownership");
    assert.deepEqual(session.inbox.acknowledgements(), {});

    let snapshot = null;
    for (let tick = 1; tick <= 6; tick += 1) {
        const primaryResult = session.submit(
            simulation.playerEntity.id,
            createPlayerCommandBatch(tick, [
                { playerId: simulation.playerEntity.id, sequence: tick - 1, command: command(1) }
            ])
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

    assert.ok(simulation.player.velocity.x > 0);
    assert.ok(partner.physics.velocity.x < 0);
    assert.equal(snapshot.serverTick, 6);
    assert.equal(Object.hasOwn(snapshot.state, "combatEffects"), false, "server snapshots must not carry client VFX");
    assert.equal(Object.hasOwn(snapshot.state, "impact"), false, "server snapshots must not carry camera feedback");
    assert.deepEqual(snapshot.acknowledgements, {
        [simulation.playerEntity.id]: 5,
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
