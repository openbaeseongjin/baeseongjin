import assert from "node:assert/strict";
import { createPlayerCommand } from "../src/game/commands/PlayerCommand.js";
import { createFoundationSelectionClaim } from "../src/game/network/FoundationSelectionClaim.js";
import { createFoundationShearClaim } from "../src/game/network/FoundationShearClaim.js";
import { createPlayerCommandBatch } from "../src/game/network/PlayerCommandBatch.js";
import { AuthorityServerSession } from "../src/game/runtime/AuthorityServerSession.js";
import { buildAuthoritySnapshot } from "../src/game/runtime/AuthoritySnapshotBuilder.js";
import { OwnerPredictionRuntime } from "../src/game/runtime/OwnerPredictionRuntime.js";
import {
    advanceFoundationRewardSelection,
    openFoundationChooserCandidate
} from "../src/game/rewards/FoundationRewardSelection.js";
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
            pointer: { x: 0, y: 0, down: false },
            viewport: { width: 1280, height: 720 }
        },
        { x: 0, y: 0 }
    );
}

function advanceToArea04(simulation) {
    for (const area of simulation.world.areas.slice(0, 3)) {
        for (const objectiveId of area.objectiveIds) simulation.worldProgress.completeObjective(objectiveId);
        simulation.worldProgress.crossGate(area.gateId);
    }
    simulation.restoreWorldProgress(simulation.worldProgress.snapshot());
}

export function run() {
    const predictionServer = createCurrentGameSimulation({ worldSeed: 1403 });
    advanceToArea04(predictionServer);
    predictionServer.enemies = [];
    const predictionOwner = predictionServer.players[0];
    const predictionNode = predictionServer.world.objects.find(({ id }) => id === "sector-01-04:maintenance-node");
    predictionOwner.physics.position.set(predictionNode.position.x, predictionNode.position.y);
    predictionServer.beginFoundationReward(predictionOwner.id, predictionNode.id, predictionNode.objectiveId);
    const staleSnapshot = buildAuthoritySnapshot({ simulation: predictionServer });
    const predictor = new OwnerPredictionRuntime({
        ownerId: predictionOwner.id,
        predictionLeadTicks: 0,
        simulation: createGameSimulationForWorldRevision({
            worldSeed: staleSnapshot.worldSeed,
            playerId: predictionOwner.id,
            worldRevision: staleSnapshot.worldRevision
        })
    });
    predictor.reconcile(staleSnapshot, []);
    assert.equal(
        predictor.applyPredictedFoundationSelection({
            sourceId: predictionNode.id,
            foundationId: "relay-link"
        }),
        true
    );
    assert.equal(predictor.state().foundationAugment, "relay-link");
    predictor.reconcile(staleSnapshot, []);
    assert.equal(
        predictor.state().foundationAugment,
        "relay-link",
        "a stale server snapshot must not undo a pending local Foundation selection"
    );

    const choiceServer = createCurrentGameSimulation({ worldSeed: 1403 });
    advanceToArea04(choiceServer);
    choiceServer.enemies = [];
    const choiceOwner = choiceServer.players[0];
    const choiceNode = choiceServer.world.objects.find(({ id }) => id === "sector-01-04:maintenance-node");
    choiceOwner.physics.position.set(choiceNode.position.x, choiceNode.position.y);
    const choiceSnapshot = buildAuthoritySnapshot({ simulation: choiceServer });
    const choicePredictor = new OwnerPredictionRuntime({
        ownerId: choiceOwner.id,
        predictionLeadTicks: 0,
        simulation: createGameSimulationForWorldRevision({
            worldSeed: choiceSnapshot.worldSeed,
            playerId: choiceOwner.id,
            worldRevision: choiceSnapshot.worldRevision
        })
    });
    choicePredictor.reconcile(choiceSnapshot, []);
    choicePredictor.advance(command({ interact: true }));
    assert.equal(
        choicePredictor.foundationReward(),
        null,
        "the Foundation chooser must open only from the authority snapshot"
    );

    const detachServer = createCurrentGameSimulation({ worldSeed: 1403 });
    advanceToArea04(detachServer);
    detachServer.enemies = [];
    const detachOwner = detachServer.players[0];
    const detachNode = detachServer.world.objects.find(({ id }) => id === "sector-01-04:maintenance-node");
    detachOwner.physics.position.set(detachNode.position.x, detachNode.position.y);
    detachOwner.ropeObject.rope.attach(detachOwner.physics.position, {
        x: detachOwner.physics.position.x + 30,
        y: detachOwner.physics.position.y - 60
    });
    detachServer.beginFoundationReward(detachOwner.id, detachNode.id, detachNode.objectiveId);
    const detachSnapshot = buildAuthoritySnapshot({ simulation: detachServer });
    const detachPredictor = new OwnerPredictionRuntime({
        ownerId: detachOwner.id,
        predictionLeadTicks: 0,
        simulation: createGameSimulationForWorldRevision({
            worldSeed: detachSnapshot.worldSeed,
            playerId: detachOwner.id,
            worldRevision: detachSnapshot.worldRevision
        })
    });
    detachPredictor.reconcile(detachSnapshot, []);
    assert.equal(
        detachPredictor.state().rope.isAttached,
        false,
        "an authority-opened chooser must detach the predicted rope"
    );

    const simulation = createCurrentGameSimulation({ worldSeed: 1404 });
    advanceToArea04(simulation);
    simulation.enemies = [];
    const owner = simulation.players[0];
    const partner = simulation.addPlayer(
        { x: owner.physics.position.x + 40, y: owner.physics.position.y },
        "partner"
    ).entity;
    const node = simulation.world.objects.find(({ id }) => id === "sector-01-04:maintenance-node");
    owner.physics.position.set(node.position.x, node.position.y);
    partner.physics.position.set(node.position.x + 24, node.position.y);
    assert.equal(
        simulation.beginFoundationReward(owner.id, node.id, node.objectiveId),
        true,
        "the owner must be able to open a personal Foundation chooser"
    );
    const partnerVelocityBefore = partner.physics.velocity.x;
    simulation.stepPlayers(
        1 / 120,
        new Map([
            [owner.id, command({ horizontal: 1 })],
            [partner.id, command({ horizontal: 1 })]
        ])
    );
    assert.equal(owner.physics.velocity.x, 0, "choice input must remain local to the choosing owner");
    assert.ok(
        partner.physics.velocity.x > partnerVelocityBefore,
        "one player's chooser must not pause another player's movement"
    );

    assert.equal(simulation.beginFoundationReward(partner.id, node.id, node.objectiveId), true);
    const session = new AuthorityServerSession({ simulation, snapshotIntervalTicks: 1 });
    const ownerClaim = createFoundationSelectionClaim({
        sourceId: node.id,
        foundationId: "impulse-coil",
        clientTick: simulation.getTick()
    });
    const ownerReceipt = session.submitFoundationSelection(owner.id, ownerClaim);
    assert.equal(ownerReceipt.accepted, true);
    assert.equal(
        session.submitFoundationSelection(owner.id, ownerClaim),
        ownerReceipt,
        "selection retry must be idempotent"
    );
    assert.equal(simulation.playerState(owner.id).foundationAugment, "impulse-coil");
    assert.equal(simulation.playerState(partner.id).foundationAugment, null);
    assert.equal(
        simulation.worldProgress.isObjectiveComplete("sector-01-04:augment-selected"),
        true,
        "the first personal selection must complete the shared progress objective"
    );
    assert.equal(
        simulation.worldProgress.isGateUnlocked("sector-01-04:gate"),
        false,
        "Foundation selection alone must enable the panel rather than bypass it"
    );

    const conflictingOwnerReceipt = session.submitFoundationSelection(
        owner.id,
        createFoundationSelectionClaim({ ...ownerClaim, foundationId: "relay-link" })
    );
    assert.equal(conflictingOwnerReceipt.accepted, false);
    assert.equal(conflictingOwnerReceipt.reason, "selection-conflict");

    const partnerReceipt = session.submitFoundationSelection(
        partner.id,
        createFoundationSelectionClaim({
            sourceId: node.id,
            foundationId: "shear-current",
            clientTick: simulation.getTick()
        })
    );
    assert.equal(partnerReceipt.accepted, true, "a later teammate must keep an independent Foundation choice");
    const snapshot = session.snapshot();
    assert.deepEqual(
        Object.fromEntries(snapshot.state.players.map(({ id, foundationAugment }) => [id, foundationAugment])),
        { [owner.id]: "impulse-coil", [partner.id]: "shear-current" }
    );
    assert.deepEqual(snapshot.state.foundationRewards, {});

    const dummy = simulation.world.objects.find(({ id }) => id === "sector-01-04:calibration-dummy");
    partner.physics.position.set(dummy.position.x + 50, dummy.position.y);
    const shearClaim = createFoundationShearClaim({
        predictionId: `${partner.id}:foundation-shear:${simulation.getTick()}:0`,
        targetId: dummy.id,
        targetKind: "calibration-dummy",
        clientTick: simulation.getTick(),
        anchor: { x: dummy.position.x - 50, y: dummy.position.y },
        playerPosition: { x: partner.physics.position.x, y: partner.physics.position.y }
    });
    const shearReceipt = session.submitFoundationShear(partner.id, shearClaim);
    assert.equal(shearReceipt.accepted, true);
    assert.equal(shearReceipt.resolution, "contact-registered");
    assert.equal(session.submitFoundationShear(partner.id, shearClaim), shearReceipt);
    assert.equal(
        simulation
            .drainReplicationEvents()
            .filter(({ eventType, targetId }) => eventType === "foundation-shear-hit" && targetId === dummy.id).length,
        1,
        "a duplicate Shear claim must produce one shared calibration event"
    );

    const chooserWorld = createCurrentGameSimulation({ worldSeed: 1404 });
    const chooserNode = chooserWorld.world.objects.find(({ id }) => id === "sector-01-04:maintenance-node");
    const interactCommand = command({ interact: true });
    const idleCommand = command();

    const chooserPress = command({ vertical: -1, interact: true });
    const chooserRelease = command({ vertical: 0, interact: false });
    const chooserRight = command({ horizontal: 1 });
    const openedChooser = openFoundationChooserCandidate({
        world: chooserWorld.world,
        position: { x: chooserNode.position.x, y: chooserNode.position.y },
        command: chooserPress
    });
    assert.ok(openedChooser, "an interact press at the node must open the chooser client-side");
    let chooserStep = advanceFoundationRewardSelection(openedChooser, chooserPress);
    assert.equal(chooserStep.confirmedFoundationId, null, "the opening press must not confirm the default choice");
    chooserStep = advanceFoundationRewardSelection(chooserStep.selection, chooserPress);
    assert.equal(chooserStep.confirmedFoundationId, null, "holding the open input must not confirm");
    chooserStep = advanceFoundationRewardSelection(chooserStep.selection, chooserRelease);
    assert.equal(chooserStep.confirmedFoundationId, null, "releasing must only arm the confirm input");
    chooserStep = advanceFoundationRewardSelection(chooserStep.selection, chooserRight);
    assert.equal(chooserStep.selection.selectedIndex, 1, "left/right must navigate the chooser");
    chooserStep = advanceFoundationRewardSelection(chooserStep.selection, chooserPress);
    assert.equal(
        chooserStep.confirmedFoundationId,
        "relay-link",
        "the confirm press must send exactly the selected UI choice"
    );

    assert.equal(
        openFoundationChooserCandidate({
            world: chooserWorld.world,
            position: { x: chooserNode.position.x, y: chooserNode.position.y },
            command: interactCommand
        })?.sourceId,
        chooserNode.id,
        "an interact press at the node must open the chooser client-side"
    );
    assert.equal(
        openFoundationChooserCandidate({
            world: chooserWorld.world,
            position: { x: chooserNode.position.x, y: chooserNode.position.y },
            command: idleCommand
        }),
        null,
        "the chooser must not open without an interact press"
    );
    assert.equal(
        openFoundationChooserCandidate({
            world: chooserWorld.world,
            position: { x: chooserNode.position.x + 300, y: chooserNode.position.y },
            command: interactCommand
        }),
        null,
        "the chooser must not open outside the interaction radius"
    );
    assert.equal(
        openFoundationChooserCandidate({ world: null, position: null, command: interactCommand }),
        null,
        "a missing world or position must never open the chooser"
    );

    const clientDrivenServer = createCurrentGameSimulation({ worldSeed: 1404 });
    advanceToArea04(clientDrivenServer);
    const clientDrivenOwner = clientDrivenServer.players[0];
    const clientDrivenNode = clientDrivenServer.world.objects.find(({ id }) => id === "sector-01-04:maintenance-node");
    clientDrivenOwner.physics.position.set(clientDrivenNode.position.x, clientDrivenNode.position.y);
    const clientDrivenSnapshot = buildAuthoritySnapshot({ simulation: clientDrivenServer });
    const clientDrivenPredictor = new OwnerPredictionRuntime({
        ownerId: clientDrivenOwner.id,
        predictionLeadTicks: 0,
        simulation: createGameSimulationForWorldRevision({
            worldSeed: clientDrivenSnapshot.worldSeed,
            playerId: clientDrivenOwner.id,
            worldRevision: clientDrivenSnapshot.worldRevision
        })
    });
    clientDrivenPredictor.reconcile(clientDrivenSnapshot, []);
    assert.equal(clientDrivenPredictor.foundationReward(), null);
    assert.equal(
        clientDrivenPredictor.applyPredictedFoundationSelection({
            sourceId: clientDrivenNode.id,
            foundationId: "relay-link"
        }),
        true,
        "a client-driven selection must apply before the authority reward exists"
    );
    assert.equal(clientDrivenPredictor.state().foundationAugment, "relay-link");

    const clientDrivenSession = new AuthorityServerSession({
        simulation: clientDrivenServer,
        snapshotIntervalTicks: 1
    });
    clientDrivenSession.submit(
        clientDrivenOwner.id,
        createPlayerCommandBatch(clientDrivenServer.getTick() + 1, [
            { playerId: clientDrivenOwner.id, sequence: 0, command: command({ interact: true }) }
        ])
    );
    clientDrivenSession.advance();
    assert.equal(
        clientDrivenServer.foundationRewards.has(clientDrivenOwner.id),
        false,
        "the authority session must not open the chooser from raw interact input"
    );
    const singlePlayerServer = createCurrentGameSimulation({ worldSeed: 1404 });
    advanceToArea04(singlePlayerServer);
    singlePlayerServer.enemies = [];
    const singlePlayerOwner = singlePlayerServer.players[0];
    const singlePlayerNode = singlePlayerServer.world.objects.find(({ id }) => id === "sector-01-04:maintenance-node");
    singlePlayerOwner.physics.position.set(singlePlayerNode.position.x, singlePlayerNode.position.y);
    singlePlayerServer.stepCommandBatch(
        1 / 120,
        createPlayerCommandBatch(singlePlayerServer.tick + 1, [
            { playerId: singlePlayerOwner.id, sequence: 0, command: command({ interact: true }) }
        ])
    );
    assert.equal(
        singlePlayerServer.foundationRewards.has(singlePlayerOwner.id),
        true,
        "single player must keep the interact-driven chooser open"
    );
    const outOfRangeClaim = createFoundationSelectionClaim({
        sourceId: clientDrivenNode.id,
        foundationId: "impulse-coil",
        clientTick: clientDrivenServer.getTick()
    });
    clientDrivenOwner.physics.position.set(clientDrivenNode.position.x + 300, clientDrivenNode.position.y);
    const outOfRangeReceipt = clientDrivenSession.submitFoundationSelection(clientDrivenOwner.id, outOfRangeClaim);
    assert.equal(outOfRangeReceipt.accepted, false);
    assert.equal(outOfRangeReceipt.reason, "source-out-of-range");
    clientDrivenOwner.physics.position.set(clientDrivenNode.position.x, clientDrivenNode.position.y);
    const inRangeReceipt = clientDrivenSession.submitFoundationSelection(
        clientDrivenOwner.id,
        createFoundationSelectionClaim({
            sourceId: clientDrivenNode.id,
            foundationId: "impulse-coil",
            clientTick: clientDrivenServer.getTick()
        })
    );
    assert.equal(
        inRangeReceipt.accepted,
        true,
        "the authority must answer a client-driven selection from a nearby player without a pre-opened reward"
    );

    const releaseServer = createCurrentGameSimulation({ worldSeed: 1404 });
    const releaseOwner = releaseServer.players[0];
    releaseOwner.ropeObject.rope.attach(releaseOwner.physics.position, {
        x: releaseOwner.physics.position.x + 30,
        y: releaseOwner.physics.position.y - 60
    });
    const releaseSnapshot = buildAuthoritySnapshot({ simulation: releaseServer });
    const releasePredictor = new OwnerPredictionRuntime({
        ownerId: releaseOwner.id,
        predictionLeadTicks: 0,
        simulation: createGameSimulationForWorldRevision({
            worldSeed: releaseSnapshot.worldSeed,
            playerId: releaseOwner.id,
            worldRevision: releaseSnapshot.worldRevision
        })
    });
    releasePredictor.reconcile(releaseSnapshot, []);
    assert.equal(releasePredictor.state().rope.isAttached, true);
    assert.equal(releasePredictor.releaseRope(), true);
    assert.equal(
        releasePredictor.state().rope.isAttached,
        false,
        "opening the chooser client-side must release the predicted rope immediately"
    );
}
