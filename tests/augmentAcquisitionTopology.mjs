import assert from "node:assert/strict";
import { createPlayerCommand } from "../src/game/commands/PlayerCommand.js";
import { createAugmentOfferClaim } from "../src/game/network/AugmentOfferClaim.js";
import { openFoundationChooserCandidate } from "../src/game/rewards/FoundationRewardSelection.js";
import { AuthorityServerSession } from "../src/game/runtime/AuthorityServerSession.js";
import { createCurrentGameSimulation } from "../src/game/simulation/GameSimulationFactory.js";

const EXPECTED_SOURCES = Object.freeze([
    Object.freeze({ alias: "1-4", landmarkId: "sector-01:landmark:04", id: "sector-01-04:maintenance-node" }),
    Object.freeze({ alias: "2-3", landmarkId: "sector-02:landmark:03", id: "sector-02-03:specialization-node" }),
    Object.freeze({
        alias: "3-5",
        landmarkId: "sector-03:landmark:05",
        id: "sector-03-05:service-calibration-frame"
    })
]);

function interactCommand() {
    return createPlayerCommand(
        {
            horizontal: 0,
            vertical: 0,
            interact: true,
            action: false,
            pointer: { x: 0, y: 0, down: false },
            viewport: { width: 1280, height: 720 }
        },
        { x: 0, y: 0 }
    );
}

export function run() {
    const simulation = createCurrentGameSimulation({ worldSeed: 633, playerId: "topology-owner" });
    simulation.enemies = [];
    const player = simulation.players[0];
    const sources = simulation.world.objects.filter(({ kind }) => kind === "augment-node");
    assert.deepEqual(
        sources.map(({ id, landmarkId }) => ({ id, landmarkId })),
        EXPECTED_SOURCES.map(({ id, landmarkId }) => ({ id, landmarkId })),
        "only the three explicitly authored service Nodes may grant current Runtime offers"
    );

    const selectedAugmentIds = [];
    const consumedSourceIds = [];
    for (const [selectionIndex, expected] of EXPECTED_SOURCES.entries()) {
        assert.equal(simulation.advanceSectorProgressToLandmark(expected.alias), true);
        const source = sources.find(({ id }) => id === expected.id);
        player.physics.position.set(source.position.x, source.position.y);

        const route = simulation.world.routeLocks.find(
            ({ sourceLandmarkId }) => sourceLandmarkId === source.landmarkId
        );
        const outboundObjectives = route.requiredObjectiveIds.map((objectiveId) =>
            simulation.world.objectives.find(({ id }) => id === objectiveId)
        );
        const requiresSelection = outboundObjectives.some(({ requiredObjectiveIds = [] }) =>
            requiredObjectiveIds.includes(source.objectiveId)
        );
        assert.ok(
            requiresSelection,
            `${source.id} outbound panel objective must require ${source.objectiveId}: ${JSON.stringify(outboundObjectives)}`
        );
        const predicted = openFoundationChooserCandidate({
            world: simulation.world,
            position: player.physics.position,
            command: interactCommand(),
            playerId: player.id,
            runSeed: simulation.world.seed,
            selectedAugmentIds,
            consumedSourceIds
        });
        assert.equal(predicted.selectionIndex, selectionIndex);

        assert.equal(simulation.getFoundationReward(player.id), null);
        simulation.step(1 / 120, interactCommand());
        const reward = simulation.getFoundationReward(player.id);
        assert.ok(reward, `${source.id} must open the single-player chooser from interact-choice progression`);
        assert.equal(reward.selectionIndex, selectionIndex);
        assert.deepEqual(
            reward.choices.map(({ id }) => id),
            predicted.choices.map(({ id }) => id)
        );

        const foundationId = reward.choices[0].id;
        const outcome = simulation.resolveFoundationSelection(player.id, { sourceId: source.id, foundationId });
        assert.equal(outcome.accepted, true);
        selectedAugmentIds.push(foundationId);
        consumedSourceIds.push(source.id);
        const state = simulation.playerState(player.id);
        assert.deepEqual(state.selectedAugmentIds, selectedAugmentIds);
        assert.deepEqual(state.augmentRuntimeState.consumedSourceIds, consumedSourceIds);
        assert.equal(simulation.worldProgress.isObjectiveComplete(source.objectiveId), true);
    }

    const serverSimulation = createCurrentGameSimulation({ worldSeed: 633, playerId: "topology-remote-owner" });
    serverSimulation.enemies = [];
    const serverPlayer = serverSimulation.players[0];
    const session = new AuthorityServerSession({ simulation: serverSimulation, snapshotIntervalTicks: 1 });
    for (const [selectionIndex, expected] of EXPECTED_SOURCES.entries()) {
        assert.equal(serverSimulation.advanceSectorProgressToLandmark(expected.alias), true);
        const source = serverSimulation.world.objects.find(({ id }) => id === expected.id);
        serverPlayer.physics.position.set(source.position.x, source.position.y);
        const predicted = openFoundationChooserCandidate({
            world: serverSimulation.world,
            position: serverPlayer.physics.position,
            command: interactCommand(),
            playerId: serverPlayer.id,
            runSeed: serverSimulation.world.seed,
            selectedAugmentIds: serverPlayer.foundation.selectedAugmentIds,
            consumedSourceIds: serverPlayer.foundation.consumedSourceIds
        });
        const receipt = session.submitAugmentOffer(
            serverPlayer.id,
            createAugmentOfferClaim({ sourceId: source.id, clientTick: serverSimulation.getTick() })
        );
        assert.deepEqual(receipt, { sourceId: source.id, accepted: true });
        const reward = serverSimulation.getFoundationReward(serverPlayer.id);
        assert.equal(reward.selectionIndex, selectionIndex);
        assert.deepEqual(
            reward.choices.map(({ id }) => id),
            predicted.choices.map(({ id }) => id)
        );
        assert.equal(
            serverSimulation.resolveFoundationSelection(serverPlayer.id, {
                sourceId: source.id,
                foundationId: reward.choices[0].id
            }).accepted,
            true
        );
    }

    const wipeSimulation = createCurrentGameSimulation({ worldSeed: 635, playerId: "wipe-owner" });
    wipeSimulation.enemies = [];
    assert.equal(wipeSimulation.advanceSectorProgressToLandmark("1-4"), true);
    const wipeOwner = wipeSimulation.players[0];
    const wipePartner = wipeSimulation.addPlayer(wipeOwner.physics.position, "wipe-partner").entity;
    const wipeSource = wipeSimulation.world.objects.find(({ id }) => id === "sector-01-04:maintenance-node");
    for (const current of [wipeOwner, wipePartner]) {
        current.physics.position.set(wipeSource.position.x, wipeSource.position.y);
        assert.equal(wipeSimulation.beginFoundationReward(current.id, wipeSource.id, wipeSource.objectiveId), true);
        const reward = wipeSimulation.getFoundationReward(current.id);
        assert.equal(
            wipeSimulation.resolveFoundationSelection(current.id, {
                sourceId: wipeSource.id,
                foundationId: reward.choices[0].id
            }).accepted,
            true
        );
    }
    assert.equal(wipeSimulation.worldProgress.isObjectiveComplete(wipeSource.objectiveId), true);
    wipeSimulation.respawnPlayerAtCheckpoint(wipeOwner, "health", "augment-topology-party-wipe");
    wipeSimulation.respawnPlayerAtCheckpoint(wipePartner, "health", "augment-topology-party-wipe");
    for (const current of [wipeOwner, wipePartner]) {
        const state = wipeSimulation.playerState(current.id);
        assert.equal(state.selectedAugmentIds.length, 1);
        assert.deepEqual(state.augmentRuntimeState.consumedSourceIds, [wipeSource.id]);
    }
    assert.equal(wipeSimulation.worldProgress.isObjectiveComplete(wipeSource.objectiveId), false);
    assert.equal(wipeSimulation.advanceSectorProgressToLandmark("1-4"), true);
    wipeSimulation.step(1 / 120, interactCommand());
    assert.equal(
        wipeSimulation.worldProgress.isObjectiveComplete(wipeSource.objectiveId),
        true,
        "revisiting a consumed Node after party wipe must restore its shared objective without a second offer"
    );

    const departureSimulation = createCurrentGameSimulation({ worldSeed: 634, playerId: "departure-owner" });
    departureSimulation.enemies = [];
    assert.equal(departureSimulation.advanceSectorProgressToLandmark("1-4"), true);
    const departureOwner = departureSimulation.players[0];
    const departurePartner = departureSimulation.addPlayer(departureOwner.physics.position, "departure-partner").entity;
    const departureSource = departureSimulation.world.objects.find(({ id }) => id === "sector-01-04:maintenance-node");
    departureOwner.physics.position.set(departureSource.position.x, departureSource.position.y);
    departurePartner.physics.position.set(departureSource.position.x, departureSource.position.y);
    assert.equal(
        departureSimulation.beginFoundationReward(departureOwner.id, departureSource.id, departureSource.objectiveId),
        true
    );
    const departureReward = departureSimulation.getFoundationReward(departureOwner.id);
    assert.equal(
        departureSimulation.resolveFoundationSelection(departureOwner.id, {
            sourceId: departureSource.id,
            foundationId: departureReward.choices[0].id
        }).accepted,
        true
    );
    assert.equal(departureSimulation.worldProgress.isObjectiveComplete(departureSource.objectiveId), false);
    assert.equal(departureSimulation.removePlayer(departurePartner.id), true);
    assert.equal(
        departureSimulation.worldProgress.isObjectiveComplete(departureSource.objectiveId),
        true,
        "a departed Player must not permanently deadlock the shared route"
    );

    const latePlayer = departureSimulation.addPlayer(departureSource.position, "late-player").entity;
    const lateCandidate = openFoundationChooserCandidate({
        world: departureSimulation.world,
        position: latePlayer.physics.position,
        command: interactCommand(),
        playerId: latePlayer.id,
        runSeed: departureSimulation.world.seed,
        selectedAugmentIds: [],
        consumedSourceIds: []
    });
    assert.equal(lateCandidate.selectionIndex, 0);
    assert.equal(
        departureSimulation.beginFoundationReward(latePlayer.id, departureSource.id, departureSource.objectiveId),
        true,
        "a late Player keeps an independent chooser even after the shared route is open"
    );
    assert.equal(departureSimulation.worldProgress.isObjectiveComplete(departureSource.objectiveId), true);
}
