import assert from "node:assert/strict";
import { createCurrentGameSimulation } from "../src/game/simulation/GameSimulationFactory.js";
import { createPlayerCommand } from "../src/game/commands/PlayerCommand.js";
import { SEAMLESS_SECTOR_RUNTIME_REVISION } from "../src/game/world/sectors/LegacyAreaSeamlessSectorRuntime.js";

function completeLandmark(progress, world, landmarkId) {
    const landmark = world.landmarks.find(({ id }) => id === landmarkId);
    for (const objectiveId of landmark.objectiveIds) {
        const objective = world.objectives.find(({ id }) => id === objectiveId);
        for (const requiredId of objective.requiredObjectiveIds ?? []) {
            if (!progress.isObjectiveComplete(requiredId)) progress.completeObjective(requiredId);
        }
        progress.completeObjective(objectiveId);
    }
    const route = world.routeLocks.find(({ sourceLandmarkId }) => sourceLandmarkId === landmarkId);
    if (route) progress.visitLandmark(route.targetLandmarkId);
}

export function run() {
    const soloRespawn = createCurrentGameSimulation({
        worldSeed: 9182,
        playerId: "solo-respawn-player",
        startAreaId: "sector-01-02"
    });
    const soloProgressBeforeDeath = soloRespawn.worldProgress.snapshot();
    const soloAnchorBeforeDeath = soloRespawn.activeRespawnAnchor;
    soloRespawn.players[0].physics.position.set(900, -500);
    assert.equal(soloRespawn.respawnPlayerAtCheckpoint(soloRespawn.players[0], "health", "solo-regression"), true);
    assert.deepEqual(
        soloRespawn.worldProgress.snapshot(),
        soloProgressBeforeDeath,
        "a single-player death must not be promoted to a party wipe"
    );
    assert.equal(soloRespawn.activeRespawnAnchor.id, soloAnchorBeforeDeath.id);
    assert.deepEqual(
        { x: soloRespawn.players[0].physics.position.x, y: soloRespawn.players[0].physics.position.y },
        { x: soloAnchorBeforeDeath.position.x, y: soloAnchorBeforeDeath.position.y },
        "single-player death must respawn at the active Stage save point"
    );

    const debugStart = createCurrentGameSimulation({
        worldSeed: 9182,
        playerId: "debug-player",
        startAreaId: "sector-03-02"
    });
    assert.equal(debugStart.worldProgress.snapshot().currentLandmarkId, "sector-03:landmark:02");
    assert.equal(debugStart.activeRespawnAnchor.id, "sector-03:landmark:02:checkpoint");

    const debugAugmentIds = ["long-rope", "direction-dash", "explosive-trail", "fast-reuse"];
    const debugLoadout = createCurrentGameSimulation({
        worldSeed: 9182,
        playerId: "debug-loadout-player",
        startAreaId: "sector-01-04",
        debugAugmentIds
    });
    assert.deepEqual(debugLoadout.playerState("debug-loadout-player").selectedAugmentIds, debugAugmentIds);
    assert.deepEqual(debugLoadout.playerState("debug-loadout-player").augmentRuntimeState.consumedSourceIds, []);
    assert.equal(debugLoadout.snapshot().maxAttachDistance, 480, "debug Rope cards affect the new Run immediately");
    assert.equal(debugLoadout.playerState("debug-loadout-player").actionState.loadout.baseActionId, "direction-dash");
    assert.deepEqual(debugLoadout.playerState("debug-loadout-player").actionState.loadout.modifierIds, ["fast-reuse"]);
    const debugNode = debugLoadout.world.objects.find(({ id }) => id === "sector-01-04:maintenance-node");
    const debugPlayer = debugLoadout.players[0];
    debugPlayer.physics.position.set(debugNode.position.x, debugNode.position.y);
    debugLoadout.step(
        1 / 120,
        createPlayerCommand(
            {
                horizontal: 0,
                vertical: -1,
                interact: true,
                pointer: { x: 0, y: 0, down: false },
                viewport: { width: 1280, height: 720 }
            },
            debugNode.position
        )
    );
    assert.equal(debugLoadout.getFoundationReward(debugPlayer.id), null, "debug loadouts do not open a second offer");
    assert.deepEqual(debugLoadout.playerState(debugPlayer.id).selectedAugmentIds, debugAugmentIds);
    assert.deepEqual(debugLoadout.playerState(debugPlayer.id).augmentRuntimeState.consumedSourceIds, [debugNode.id]);
    assert.equal(
        debugLoadout.worldProgress.isObjectiveComplete(debugNode.objectiveId),
        true,
        "interacting with an authored Node consumes only that source and preserves route progression"
    );
    assert.throws(
        () => createCurrentGameSimulation({ debugAugmentIds: ["direction-dash", "dash-strike"] }),
        /incompatible Augment selection/
    );

    const simulation = createCurrentGameSimulation({ worldSeed: 9182, playerId: "player-1" });
    assert.deepEqual(simulation.playerState("player-1").selectedAugmentIds, []);
    assert.equal(simulation.world.definitionRevision, SEAMLESS_SECTOR_RUNTIME_REVISION);
    assert.equal(simulation.world.areas.length, 0);
    assert.equal(simulation.world.gates.length, 0);
    assert.equal(simulation.activeCheckpoint, null);
    assert.equal(simulation.activeRespawnAnchor.id, "sector-01:entry");
    assert.equal(simulation.world.accessModules.length, 3);
    assert.ok(simulation.world.enemySpawns.some(({ accessModuleId }) => accessModuleId));
    assert.equal(simulation.enemyStates().length, simulation.world.enemySpawns.length);
    assert.equal(simulation.snapshot().enemies.length, simulation.world.enemySpawns.length);
    const encounterCountByAlias = Object.fromEntries(
        simulation.world.landmarks.map((landmark) => [
            landmark.legacyStageAlias,
            simulation.world.enemySpawns.filter(({ landmarkId }) => landmarkId === landmark.id).length
        ])
    );
    assert.equal(encounterCountByAlias["1-1"], 0);
    assert.equal(encounterCountByAlias["1-2"], 0);
    for (const keyAlias of ["1-3", "1-6", "1-7"]) assert.equal(encounterCountByAlias[keyAlias], 3);
    const sectorEnemyCounts = simulation.world.sectors.map(
        (sector) => simulation.world.enemySpawns.filter(({ sectorId }) => sectorId === sector.id).length
    );
    assert.ok(
        sectorEnemyCounts[0] < sectorEnemyCounts[1] && sectorEnemyCounts[1] < sectorEnemyCounts[2],
        "coarse authored density must rise across the current Sector progression"
    );
    const resolvedFamilies = new Set(simulation.enemies.map(({ enemyType }) => enemyType));
    for (const family of [
        "pursuit-drone-t1",
        "shield-drone-t1",
        "artillery-drone-t1",
        "support-drone-t1",
        "swarm-drone-t1"
    ]) {
        assert.equal(resolvedFamilies.has(family), true, `${family} must reach the shipped seamless simulation`);
    }
    for (const spawn of simulation.world.enemySpawns) {
        const landmark = simulation.world.landmarks.find(({ id }) => id === spawn.landmarkId);
        assert.ok(
            spawn.position.x >= landmark.bounds.x && spawn.position.x <= landmark.bounds.x + landmark.bounds.width
        );
        assert.ok(
            spawn.position.y >= landmark.bounds.y && spawn.position.y <= landmark.bounds.y + landmark.bounds.height
        );
        if (!spawn.activation) continue;
        assert.ok(spawn.activation.x >= landmark.bounds.x);
        assert.ok(spawn.activation.x + spawn.activation.width <= landmark.bounds.x + landmark.bounds.width);
        assert.ok(spawn.activation.y >= landmark.bounds.y);
        assert.ok(spawn.activation.y + spawn.activation.height <= landmark.bounds.y + landmark.bounds.height);
    }
    for (const enemy of simulation.enemies.filter(({ enemyType }) =>
        ["sentry", "sentry-t1", "patrol-drone", "patrol-drone-t1"].includes(enemyType)
    )) {
        assert.equal(
            enemy.impactDisplacementEnabled,
            false,
            `${enemy.enemyType} must preserve its authored position/path`
        );
    }
    for (const module of simulation.world.accessModules) {
        const landmark = simulation.world.landmarks.find(({ id }) => id === module.landmarkId);
        const spawn = simulation.world.enemySpawns.find(({ encounterId }) => encounterId === module.encounterId);
        assert.ok(spawn, `missing access Carrier spawn ${module.encounterId}`);
        assert.ok(
            spawn.position.x >= landmark.bounds.x && spawn.position.x <= landmark.bounds.x + landmark.bounds.width
        );
        assert.ok(
            spawn.position.y >= landmark.bounds.y && spawn.position.y <= landmark.bounds.y + landmark.bounds.height
        );
        assert.ok(spawn.activation, `missing access Carrier activation ${module.encounterId}`);
        assert.ok(
            spawn.position.x >= spawn.activation.x &&
                spawn.position.x <= spawn.activation.x + spawn.activation.width &&
                spawn.position.y >= spawn.activation.y &&
                spawn.position.y <= spawn.activation.y + spawn.activation.height,
            `access Carrier must spawn inside its activation band ${module.encounterId}`
        );
        assert.ok(
            simulation.world.surfaces.some(
                (surface) =>
                    surface.landmarkId === module.landmarkId &&
                    surface.id.includes("access-annex-arena") &&
                    spawn.position.x >= surface.x &&
                    spawn.position.x <= surface.x + surface.width &&
                    spawn.position.y === surface.topY
            ),
            `access Carrier must stand on authored annex collision ${module.encounterId}`
        );
    }

    const carrier = simulation.enemies.find(({ objectId }) =>
        simulation.world.accessModules.some(({ encounterId }) => encounterId === objectId)
    );
    carrier.health = 0;
    simulation.step(
        0,
        createPlayerCommand(
            {
                horizontal: 0,
                vertical: 0,
                pointer: { x: 0, y: 0, down: false },
                viewport: { width: 1280, height: 720 }
            },
            { x: 0, y: 0 }
        )
    );
    assert.equal(simulation.worldProgress.snapshot().collectedAccessModuleIds.length, 1);
    assert.equal(simulation.snapshot().eventFlash.type, "access-module-collected");

    const owner = simulation.players[0];
    const teammate = simulation.addPlayer(
        { x: owner.physics.position.x + 80, y: owner.physics.position.y },
        "player-2"
    ).entity;
    const firstLandmark = simulation.world.landmarks.find(({ id }) => id === "sector-01:landmark:01");
    for (const objectiveId of firstLandmark.objectiveIds) simulation.worldProgress.completeObjective(objectiveId);
    simulation.restoreWorldProgress(simulation.worldProgress.snapshot());
    const secondLandmark = simulation.world.landmarks.find(({ id }) => id === "sector-01:landmark:02");
    owner.physics.position.set(secondLandmark.entry.x, secondLandmark.entry.y);
    simulation.step(
        1 / 120,
        createPlayerCommand(
            {
                horizontal: 0,
                vertical: 0,
                pointer: { x: 0, y: 0, down: false },
                viewport: { width: 1280, height: 720 }
            },
            secondLandmark.entry
        )
    );
    assert.equal(simulation.worldProgress.snapshot().currentLandmarkId, "sector-01:landmark:02");
    assert.equal(simulation.activeRespawnAnchor.id, "sector-01:landmark:02:checkpoint");
    assert.equal(simulation.playerState(owner.id).respawnAnchorId, "sector-01:landmark:02:checkpoint");
    assert.equal(simulation.playerState(teammate.id).respawnAnchorId, "sector-01:entry");
    assert.equal(simulation.metrics.snapshot().checkpointsReached, 1);
    assert.equal(simulation.snapshot().eventFlash.type, "stage-saved");
    assert.equal(simulation.snapshot().eventFlash.respawnAnchorId, "sector-01:landmark:02:checkpoint");
    const progressBeforeSoloDeath = simulation.worldProgress.snapshot();
    const teammateBefore = teammate.physics.position.clone();
    const removedEnemyId = simulation.enemies[0].objectId;
    simulation.enemies = simulation.enemies.slice(1);
    owner.physics.position.set(900, -500);
    assert.equal(simulation.respawnPlayerAtCheckpoint(owner, "health", "solo-death"), true);
    assert.deepEqual(simulation.worldProgress.snapshot(), progressBeforeSoloDeath);
    assert.equal(
        simulation.enemies.some(({ objectId }) => objectId === removedEnemyId),
        false
    );
    assert.deepEqual(teammate.physics.position, teammateBefore);
    assert.deepEqual(
        { x: owner.physics.position.x, y: owner.physics.position.y },
        {
            x: simulation.activeRespawnAnchor.position.x,
            y: simulation.activeRespawnAnchor.position.y
        }
    );
    assert.equal(simulation.snapshot().eventFlash.type, "sector-respawn");
    owner.physics.position.set(700, -700);
    assert.equal(simulation.respawnPlayerAtCheckpoint(owner, "fall", "solo-fall"), true);
    assert.deepEqual(simulation.worldProgress.snapshot(), progressBeforeSoloDeath);
    assert.deepEqual(
        { x: owner.physics.position.x, y: owner.physics.position.y },
        { x: simulation.activeRespawnAnchor.position.x, y: simulation.activeRespawnAnchor.position.y }
    );

    completeLandmark(simulation.worldProgress, simulation.world, "sector-01:landmark:02");
    const progressBeforeAllPlayersDie = simulation.worldProgress.snapshot();
    const currentSectorEnemyIds = new Set(
        simulation.world.enemySpawns
            .filter(({ sectorId }) => sectorId === "sector-01")
            .map(({ encounterId }) => encounterId)
    );
    simulation.enemies = simulation.enemies.filter(({ objectId }) => !currentSectorEnemyIds.has(objectId));
    simulation.respawnPlayerAtCheckpoint(owner, "health", "party-wipe");
    simulation.respawnPlayerAtCheckpoint(teammate, "health", "party-wipe");
    assert.deepEqual(simulation.worldProgress.snapshot(), progressBeforeAllPlayersDie);
    assert.equal(
        simulation.enemies.some(({ objectId }) => currentSectorEnemyIds.has(objectId)),
        false
    );
    assert.equal(simulation.snapshot().eventFlash.type, "sector-respawn");
    const ownerAnchor = simulation.respawnAnchorForPlayer(owner.id);
    const teammateAnchor = simulation.respawnAnchorForPlayer(teammate.id);
    assert.deepEqual(
        { x: owner.physics.position.x, y: owner.physics.position.y },
        { x: ownerAnchor.position.x, y: ownerAnchor.position.y }
    );
    assert.deepEqual(
        { x: teammate.physics.position.x, y: teammate.physics.position.y },
        { x: teammateAnchor.position.x, y: teammateAnchor.position.y }
    );
}
