import assert from "node:assert/strict";
import { createPlayerCommand } from "../src/game/commands/PlayerCommand.js";
import { createFoundationSelectionClaim } from "../src/game/network/FoundationSelectionClaim.js";
import { createPlayerCommandBatch } from "../src/game/network/PlayerCommandBatch.js";
import { openFoundationChooserCandidate } from "../src/game/rewards/FoundationRewardSelection.js";
import { AuthorityServerSession } from "../src/game/runtime/AuthorityServerSession.js";
import { buildAuthoritySnapshot } from "../src/game/runtime/AuthoritySnapshotBuilder.js";
import { OwnerPredictionRuntime } from "../src/game/runtime/OwnerPredictionRuntime.js";
import {
    createCurrentGameSimulation,
    createGameSimulationForWorldRevision
} from "../src/game/simulation/GameSimulationFactory.js";

function command({ horizontal = 0, vertical = 0, interact = false } = {}) {
    return createPlayerCommand(
        {
            horizontal,
            vertical,
            interact,
            action: false,
            pointer: { x: 0, y: 0, down: false },
            viewport: { width: 1280, height: 720 }
        },
        { x: 0, y: 0 }
    );
}

function advanceToArea04(simulation) {
    assert.equal(simulation.advanceSectorProgressToLandmark("1-4"), true);
}

function predictorFor(snapshot, ownerId) {
    return new OwnerPredictionRuntime({
        ownerId,
        predictionLeadTicks: 0,
        simulation: createGameSimulationForWorldRevision({
            worldSeed: snapshot.worldSeed,
            playerId: ownerId,
            worldRevision: snapshot.worldRevision
        })
    });
}

export function run() {
    const simulation = createCurrentGameSimulation({ worldSeed: 1403 });
    advanceToArea04(simulation);
    simulation.enemies = [];
    const owner = simulation.players[0];
    const partner = simulation.addPlayer(owner.physics.position, "partner").entity;
    const node = simulation.world.objects.find(({ id }) => id === "sector-01-04:maintenance-node");
    owner.physics.position.set(node.position.x, node.position.y);
    partner.physics.position.set(node.position.x, node.position.y);

    assert.equal(simulation.beginFoundationReward(owner.id, node.id, node.objectiveId), true);
    assert.equal(simulation.beginFoundationReward(partner.id, node.id, node.objectiveId), true);
    const ownerOffer = simulation.getFoundationReward(owner.id);
    const partnerOffer = simulation.getFoundationReward(partner.id);
    assert.equal(ownerOffer.choices.length, 3);
    assert.equal(partnerOffer.choices.length, 3);
    assert.notDeepEqual(
        ownerOffer.choices.map(({ id }) => id),
        partnerOffer.choices.map(({ id }) => id),
        "stable Player ID participates in the deterministic offer"
    );

    const staleSnapshot = buildAuthoritySnapshot({ simulation });
    const predictor = predictorFor(staleSnapshot, owner.id);
    predictor.reconcile(staleSnapshot, []);
    const chosenId = ownerOffer.choices[0].id;
    assert.equal(
        predictor.applyPredictedFoundationSelection({ sourceId: node.id, foundationId: chosenId }),
        true,
        "owner selection must apply before a server receipt"
    );
    assert.ok(predictor.state().selectedAugmentIds.includes(chosenId));
    predictor.reconcile(staleSnapshot, []);
    assert.ok(
        predictor.state().selectedAugmentIds.includes(chosenId),
        "a stale snapshot must not rewind a pending local selection"
    );

    const session = new AuthorityServerSession({ simulation, snapshotIntervalTicks: 1 });
    const claim = createFoundationSelectionClaim({
        sourceId: node.id,
        foundationId: chosenId,
        clientTick: simulation.getTick()
    });
    const receipt = session.submitFoundationSelection(owner.id, claim);
    assert.equal(receipt.accepted, true);
    assert.equal(session.submitFoundationSelection(owner.id, claim), receipt, "selection retry is idempotent");
    assert.ok(simulation.playerState(owner.id).selectedAugmentIds.includes(chosenId));
    assert.equal(simulation.playerState(partner.id).selectedAugmentIds.length, 0);

    const partnerChoice = partnerOffer.choices[0].id;
    assert.equal(
        session.submitFoundationSelection(
            partner.id,
            createFoundationSelectionClaim({
                sourceId: node.id,
                foundationId: partnerChoice,
                clientTick: simulation.getTick()
            })
        ).accepted,
        true
    );
    assert.ok(simulation.playerState(partner.id).selectedAugmentIds.includes(partnerChoice));
    assert.equal(
        simulation.beginFoundationReward(owner.id, node.id, node.objectiveId),
        false,
        "source consumption is per Player"
    );

    const reconnectServer = createCurrentGameSimulation({ worldSeed: 1404 });
    advanceToArea04(reconnectServer);
    const reconnectOwner = reconnectServer.players[0];
    const reconnectNode = reconnectServer.world.objects.find(({ id }) => id === node.id);
    reconnectOwner.physics.position.set(reconnectNode.position.x, reconnectNode.position.y);
    assert.equal(
        reconnectServer.beginFoundationReward(reconnectOwner.id, reconnectNode.id, reconnectNode.objectiveId),
        true
    );
    const pendingChoices = reconnectServer.getFoundationReward(reconnectOwner.id).choices.map(({ id }) => id);
    reconnectServer.respawnPlayerAtCheckpoint(reconnectOwner, "fall");
    const reconnectSnapshot = buildAuthoritySnapshot({ simulation: reconnectServer });
    const reconnectPredictor = predictorFor(reconnectSnapshot, reconnectOwner.id);
    reconnectPredictor.reconcile(reconnectSnapshot, []);
    assert.deepEqual(
        reconnectPredictor.foundationReward().choices.map(({ id }) => id),
        pendingChoices
    );

    const candidate = openFoundationChooserCandidate({
        world: reconnectServer.world,
        position: reconnectNode.position,
        command: command({ interact: true }),
        playerId: reconnectOwner.id,
        runSeed: reconnectServer.world.seed,
        selectedAugmentIds: []
    });
    assert.deepEqual(
        candidate.choices.map(({ id }) => id),
        pendingChoices
    );
    assert.equal(
        openFoundationChooserCandidate({
            world: reconnectServer.world,
            position: reconnectNode.position,
            command: command({ interact: true }),
            playerId: reconnectOwner.id,
            runSeed: reconnectServer.world.seed,
            selectedAugmentIds: [],
            consumedSourceIds: [reconnectNode.id]
        }),
        null
    );

    const partnerVelocityBefore = partner.physics.velocity.x;
    session.submit(
        partner.id,
        createPlayerCommandBatch(simulation.getTick() + 1, [
            { playerId: partner.id, sequence: 0, command: command({ horizontal: 1 }) }
        ])
    );
    session.advance();
    assert.equal(partner.physics.velocity.x, partnerVelocityBefore, "neutral server does not replay owner input");
}
