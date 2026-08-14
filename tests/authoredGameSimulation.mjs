import assert from "node:assert/strict";
import { ARTIFACT_CATALOG } from "../src/game/artifacts/ArtifactCatalog.js";
import { createPlayerCommand } from "../src/game/commands/PlayerCommand.js";
import { GameSimulation } from "../src/game/simulation/GameSimulation.js";
import { SECTOR_01_AREA_CATALOG } from "../src/game/world/areas/sector01/Sector01AreaCatalog.js";

function command({ interact = false, jump = false } = {}) {
    return createPlayerCommand(
        {
            horizontal: 0,
            vertical: jump ? -1 : 0,
            interact,
            pointer: { x: 0, y: 0, down: false },
            viewport: { width: 1280, height: 720 }
        },
        { x: 0, y: 0 }
    );
}

export function run() {
    const simulation = new GameSimulation({ worldSeed: 1234, worldCatalog: SECTOR_01_AREA_CATALOG });
    const player = simulation.players[0];
    assert.equal(simulation.world.definitionId, "sector-01-authored-mock");
    assert.equal(simulation.snapshot().worldProgress.currentAreaId, "sector-01-01");
    assert.deepEqual(
        { x: player.physics.position.x, y: player.physics.position.y },
        { x: simulation.world.areas[0].entry.x, y: simulation.world.areas[0].entry.y }
    );
    assert.equal(simulation.activeCollisionSurfaces.filter(({ kind }) => kind === "gate-barrier").length, 8);
    assert.ok(
        simulation.world.surfaces.some(
            ({ kind, collision, renderable }) =>
                kind === "grapple-target" && collision === false && renderable === false
        )
    );

    const terminal = simulation.world.objects.find(({ id }) => id === "sector-01-01:service-terminal");
    player.physics.position.set(terminal.position.x, terminal.position.y);
    simulation.step(1 / 120, command({ interact: true }));
    assert.equal(simulation.snapshot().worldProgress.unlockedGateIds.includes("sector-01-01:gate"), false);
    assert.ok(simulation.snapshot().worldProgress.activeObjectiveSequences.length === 1);
    for (let step = 0; step < 325; step += 1) simulation.step(1 / 120, command());
    assert.equal(simulation.snapshot().worldProgress.unlockedGateIds.includes("sector-01-01:gate"), true);
    assert.equal(simulation.activeCollisionSurfaces.filter(({ kind }) => kind === "gate-barrier").length, 7);

    const gate = simulation.world.gates[0];
    const worldBeforePortal = simulation.world;
    player.health = 73;
    player.artifacts.add(ARTIFACT_CATALOG[0]);
    player.physics.velocity.set(180, -240);
    player.physics.setAngularState(0.8, 3.5);
    player.physics.isGrounded = true;
    player.physics.position.set(gate.trigger.x + gate.trigger.width * 0.5, gate.trigger.y + gate.trigger.height * 0.5);
    assert.equal(
        player.ropeObject.rope.attach(player.physics.position, {
            x: player.physics.position.x + 40,
            y: player.physics.position.y - 60
        }),
        true
    );
    player.ropeObject.attachmentCandidate = { x: player.physics.position.x + 20, y: player.physics.position.y - 30 };
    player.ropeObject.wasPointerDown = true;
    player.ropeObject.lastPointer = { x: 400, y: 300, down: true };
    player.ropeObject.lastViewport = { width: 1280, height: 720 };
    player.ropeObject.attachBufferRemaining = 0.1;
    player.ropeObject.swingDrag = {
        origin: { x: 400, y: 300 },
        direction: { x: 1, y: 0 },
        progress: 0.5,
        age: 0.1,
        used: false
    };
    player.weapon.cooldown = 0.4;
    player.hitInvulnerabilityRemaining = 0.3;
    player.ropeDisabledRemaining = 0.2;
    player.ropeDamageBoostRemaining = 1.5;
    simulation.step(1 / 120, command());
    assert.equal(simulation.snapshot().worldProgress.currentAreaId, "sector-01-02");
    assert.ok(
        simulation.snapshot().metrics.areaTiming.clearSeconds["sector-01-01"] >= 2.7,
        "the shared playtest metrics must retain the measured 1-1 clear time"
    );
    assert.equal(simulation.activeCheckpoint.areaId, "sector-01-02");
    assert.equal(simulation.artifactRewards.size, 0, "area Gate checkpoints must not grant artifact rewards");
    assert.equal(simulation.world, worldBeforePortal, "a Gate portal must keep the same assembled world");
    assert.deepEqual(
        { x: player.physics.position.x, y: player.physics.position.y },
        { x: simulation.world.areas[1].entry.x, y: simulation.world.areas[1].entry.y }
    );
    assert.deepEqual({ x: player.physics.velocity.x, y: player.physics.velocity.y }, { x: 0, y: 0 });
    assert.equal(player.physics.angle, 0);
    assert.equal(player.physics.angularVelocity, 0);
    assert.equal(player.physics.isGrounded, false);
    assert.equal(player.ropeObject.rope.isAttached, false);
    assert.equal(player.ropeObject.attachmentCandidate, null);
    assert.equal(player.ropeObject.wasPointerDown, false);
    assert.deepEqual(player.ropeObject.lastPointer, { x: 0, y: 0, down: false });
    assert.equal(player.ropeObject.attachBufferRemaining, 0);
    assert.equal(player.ropeObject.swingDrag, null);
    assert.equal(player.weapon.cooldown, 0);
    assert.equal(player.hitInvulnerabilityRemaining, 0);
    assert.equal(player.ropeDisabledRemaining, 0);
    assert.equal(player.ropeDamageBoostRemaining, 0);
    assert.equal(player.health, 73, "portal reset must not heal or damage the player");
    assert.deepEqual(player.artifacts.snapshot(), [ARTIFACT_CATALOG[0]], "portal reset must preserve artifacts");

    const secondPanel = simulation.world.objects.find(({ id }) => id === "sector-01-02:exit-panel");
    const secondDeck = simulation.world.surfaces.find(({ id }) => id === "sector-01-02:p4");
    player.physics.position.set(secondPanel.position.x, secondDeck.topY - player.physics.collider.radius);
    player.physics.velocity.set(0, 0);
    player.physics.isGrounded = true;
    simulation.step(1 / 120, command());
    assert.equal(
        simulation.snapshot().worldProgress.completedObjectiveIds.includes("sector-01-02:final-deck-reached"),
        true
    );
    assert.equal(simulation.snapshot().worldProgress.unlockedGateIds.includes("sector-01-02:gate"), false);
    simulation.step(1 / 120, command({ interact: true, jump: true }));
    assert.equal(
        simulation.snapshot().worldProgress.unlockedGateIds.includes("sector-01-02:gate"),
        true,
        "the shared jump and interaction command must open the ready 1-2 Gate panel"
    );
    assert.equal(simulation.activeCollisionSurfaces.filter(({ kind }) => kind === "gate-barrier").length, 6);

    const secondGate = simulation.world.gates.find(({ id }) => id === "sector-01-02:gate");
    player.physics.position.set(
        secondGate.trigger.x + secondGate.trigger.width * 0.5,
        secondGate.trigger.y + secondGate.trigger.height * 0.5
    );
    simulation.step(1 / 120, command());
    assert.equal(simulation.snapshot().worldProgress.currentAreaId, "sector-01-03");

    const thirdPanel = simulation.world.objects.find(({ id }) => id === "sector-01-03:service-panel");
    player.physics.position.set(thirdPanel.position.x, thirdPanel.position.y - player.physics.collider.radius);
    player.physics.velocity.set(0, 0);
    simulation.step(1 / 120, command({ interact: true, jump: true }));
    assert.equal(simulation.snapshot().worldProgress.unlockedGateIds.includes("sector-01-03:gate"), true);

    const thirdGate = simulation.world.gates.find(({ id }) => id === "sector-01-03:gate");
    const thirdDoor = simulation.world.objects.find(({ id }) => id === "sector-01-03:security-gate");
    player.physics.position.set(thirdDoor.position.x, thirdGate.trigger.y - 8);
    player.physics.velocity.set(0, 0);
    assert.equal(
        player.ropeObject.rope.attach(player.physics.position, {
            x: player.physics.position.x,
            y: player.physics.position.y - 48
        }),
        true
    );
    simulation.step(1 / 120, command());
    assert.equal(
        simulation.snapshot().worldProgress.currentAreaId,
        "sector-01-03",
        "rope movement above the 1-3 door must not enter or reset the portal"
    );
    assert.equal(player.ropeObject.rope.isAttached, true);

    player.physics.position.set(
        thirdGate.trigger.x + thirdGate.trigger.width * 0.5,
        thirdGate.trigger.y + thirdGate.trigger.height * 0.5
    );
    simulation.step(1 / 120, command());
    assert.equal(simulation.snapshot().worldProgress.currentAreaId, "sector-01-04");
    assert.equal(player.ropeObject.rope.isAttached, false, "entering the visible door must keep the portal reset");

    const replicationEvents = simulation.drainReplicationEvents();
    const eventTypes = replicationEvents.map(({ eventType }) => eventType);
    assert.ok(eventTypes.includes("objective-completed"));
    assert.ok(eventTypes.includes("objective-sequence-started"));
    assert.ok(eventTypes.includes("gate-unlocked"));
    assert.ok(eventTypes.includes("gate-crossed"));
    assert.ok(eventTypes.includes("gate-portal-entered"));
    const portalEvent = replicationEvents.find(({ eventType }) => eventType === "gate-portal-entered");
    assert.equal(portalEvent.gateId, "sector-01-01:gate");
    assert.equal(portalEvent.playerId, player.id);
    assert.deepEqual(portalEvent.position, {
        x: simulation.world.areas[1].entry.x,
        y: simulation.world.areas[1].entry.y
    });

    const standardSentry = simulation.enemies.find(({ areaId }) => areaId === "sector-01-03");
    player.physics.position.set(standardSentry.position.x - 100, standardSentry.position.y);
    standardSentry.fireCooldown = 0;
    simulation.step(1 / 120, command());
    const standardProjectile = simulation.enemyProjectiles.find(({ ownerId }) => ownerId === standardSentry.id);
    assert.equal(standardProjectile.canCutRope, false);
    assert.deepEqual(
        simulation.resolveEnemyProjectileClaim(player.id, {
            projectileId: standardProjectile.id,
            impactType: "rope-cut"
        }),
        { accepted: false, reason: "rope-cut-disallowed" }
    );
    assert.ok(
        simulation
            .drainReplicationEvents()
            .some(({ eventType, parameters }) => eventType === "spawn" && parameters.canCutRope === false),
        "standard authored Sentry projectile must publish the no-rope-cut rule"
    );
}
