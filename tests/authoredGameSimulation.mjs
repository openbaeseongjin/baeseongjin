import assert from "node:assert/strict";
import { createPlayerCommand } from "../src/game/commands/PlayerCommand.js";
import { GameSimulation } from "../src/game/simulation/GameSimulation.js";
import { SECTOR_01_AREA_CATALOG } from "../src/game/world/areas/sector01/Sector01AreaCatalog.js";

function command({ interact = false } = {}) {
    return createPlayerCommand(
        {
            horizontal: 0,
            vertical: 0,
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
    assert.equal(simulation.snapshot().worldProgress.unlockedGateIds.includes("sector-01-01:gate"), true);
    assert.equal(simulation.activeCollisionSurfaces.filter(({ kind }) => kind === "gate-barrier").length, 7);

    const gate = simulation.world.gates[0];
    player.physics.position.set(gate.trigger.x + gate.trigger.width * 0.5, gate.trigger.y + gate.trigger.height * 0.5);
    simulation.step(1 / 120, command());
    assert.equal(simulation.snapshot().worldProgress.currentAreaId, "sector-01-02");
    assert.equal(simulation.activeCheckpoint.areaId, "sector-01-02");
    assert.equal(simulation.artifactRewards.size, 0, "area Gate checkpoints must not grant artifact rewards");

    const eventTypes = simulation.drainReplicationEvents().map(({ eventType }) => eventType);
    assert.ok(eventTypes.includes("objective-completed"));
    assert.ok(eventTypes.includes("gate-unlocked"));
    assert.ok(eventTypes.includes("gate-crossed"));

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
