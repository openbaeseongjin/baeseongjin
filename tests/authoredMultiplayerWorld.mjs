import assert from "node:assert/strict";
import { createPlayerCommand } from "../src/game/commands/PlayerCommand.js";
import { createPlayerCommandBatch } from "../src/game/network/PlayerCommandBatch.js";
import { createOwnerMotionState } from "../src/game/network/OwnerMotionState.js";
import { AuthorityServerSession } from "../src/game/runtime/AuthorityServerSession.js";
import { buildAuthoritySnapshot } from "../src/game/runtime/AuthoritySnapshotBuilder.js";
import { OwnerPredictionRuntime } from "../src/game/runtime/OwnerPredictionRuntime.js";
import {
    createCurrentGameSimulation,
    createGameSimulationForWorldRevision
} from "../src/game/simulation/GameSimulationFactory.js";
import { authoredCatalogForRevision, DEFAULT_AUTHORED_AREA_CATALOG } from "../src/game/world/AuthoredWorldFactory.js";

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

const TERMINAL_SEQUENCE_STEPS = 325;

function completeTerminalSequence(simulation) {
    for (let step = 0; step < TERMINAL_SEQUENCE_STEPS; step += 1) {
        simulation.stepCommandBatch(1 / 120, createPlayerCommandBatch(simulation.tick + 1, []), {
            advanceInputDrivenObjects: false
        });
    }
}

export function run() {
    assert.equal(authoredCatalogForRevision(DEFAULT_AUTHORED_AREA_CATALOG.revision), DEFAULT_AUTHORED_AREA_CATALOG);
    assert.equal(authoredCatalogForRevision("unknown-world-revision"), null);

    const server = createCurrentGameSimulation({ worldSeed: 2718 });
    const ownerId = server.getPrimaryPlayerId();
    const owner = server.players[0];
    const partner = server.addPlayer(
        { x: server.world.areas[0].entry.x + 40, y: server.world.areas[0].entry.y },
        "portal-partner"
    ).entity;
    const firstSnapshot = buildAuthoritySnapshot({ simulation: server });
    assert.equal(firstSnapshot.worldRevision, DEFAULT_AUTHORED_AREA_CATALOG.revision);
    assert.equal(firstSnapshot.state.worldProgress.currentAreaId, "sector-01-01");
    assert.equal(firstSnapshot.state.windStates.length, server.world.windZones.length);

    const predictor = new OwnerPredictionRuntime({
        ownerId,
        predictionLeadTicks: 0,
        simulation: createGameSimulationForWorldRevision({
            worldSeed: firstSnapshot.worldSeed,
            playerId: ownerId,
            worldRevision: firstSnapshot.worldRevision
        })
    });
    predictor.reconcile(firstSnapshot, []);
    assert.equal(predictor.renderSnapshot().world.definitionRevision, firstSnapshot.worldRevision);
    const partnerPredictor = new OwnerPredictionRuntime({
        ownerId: partner.id,
        predictionLeadTicks: 0,
        simulation: createGameSimulationForWorldRevision({
            worldSeed: firstSnapshot.worldSeed,
            playerId: partner.id,
            worldRevision: firstSnapshot.worldRevision
        })
    });
    partnerPredictor.reconcile(firstSnapshot, []);

    const terminal = server.world.objects.find(({ id }) => id === "sector-01-01:exit-panel");
    owner.physics.position.set(terminal.position.x, terminal.position.y);
    server.stepCommandBatch(
        1 / 120,
        createPlayerCommandBatch(1, [{ playerId: ownerId, sequence: 0, command: command({ interact: true }) }]),
        { advanceInputDrivenObjects: false }
    );
    assert.equal(server.worldProgress.isGateUnlocked("sector-01-01:gate"), false);
    completeTerminalSequence(server);
    const progressedSnapshot = buildAuthoritySnapshot({ simulation: server });
    predictor.reconcile(progressedSnapshot, []);
    partnerPredictor.reconcile(progressedSnapshot, []);
    assert.equal(
        predictor.renderSnapshot().worldProgress.unlockedGateIds.includes("sector-01-01:gate"),
        true,
        "shared authored progress must open the same Gate collision on the predicting client"
    );
    assert.equal(predictor.simulation.activeCollisionSurfaces.filter(({ kind }) => kind === "gate-barrier").length, 0);

    const gate = server.world.gates[0];
    owner.physics.position.set(gate.trigger.x + gate.trigger.width * 0.5, gate.trigger.y + gate.trigger.height * 0.5);
    partner.physics.velocity.set(-120, 80);
    partner.physics.setAngularState(-0.6, 2.5);
    partner.ropeObject.rope.attach(partner.physics.position, {
        x: partner.physics.position.x + 30,
        y: partner.physics.position.y - 60
    });
    const predictedPartnerEntity = partnerPredictor.simulation.players[0];
    predictedPartnerEntity.ropeObject.rope.attach(predictedPartnerEntity.physics.position, {
        x: predictedPartnerEntity.physics.position.x + 30,
        y: predictedPartnerEntity.physics.position.y - 60
    });
    partner.ropeObject.wasPointerDown = true;
    partner.ropeObject.attachBufferRemaining = 0.1;
    const partnerDeparture = {
        x: partner.physics.position.x,
        y: partner.physics.position.y
    };
    server.stepCommandBatch(
        1 / 120,
        createPlayerCommandBatch(327, [{ playerId: ownerId, sequence: 1, command: command() }]),
        { advanceInputDrivenObjects: false }
    );

    const nextEntry = server.world.areas[1].entry;
    assert.deepEqual(
        { x: owner.physics.position.x, y: owner.physics.position.y },
        { x: nextEntry.x - 20, y: nextEntry.y },
        "the player entering an open Gate must move to its assigned next-area entry"
    );
    assert.deepEqual(
        { x: partner.physics.position.x, y: partner.physics.position.y },
        partnerDeparture,
        "a teammate must remain in the previous room until entering the persistent portal"
    );
    assert.equal(partner.ropeObject.rope.isAttached, true);
    assert.deepEqual({ x: partner.physics.velocity.x, y: partner.physics.velocity.y }, { x: -120, y: 80 });
    assert.ok(Math.abs(partner.physics.angle + 0.6) < 1e-9);
    assert.equal(partner.physics.angularVelocity, 2.5);

    const portalSnapshot = buildAuthoritySnapshot({ simulation: server });
    assert.equal(
        portalSnapshot.events.filter(({ eventType }) => eventType === "gate-crossed").length,
        1,
        "shared authored progress must advance only on the first Gate entry"
    );
    const ownerPortalEvent = portalSnapshot.events.find(({ eventType }) => eventType === "gate-portal-entered");
    assert.deepEqual(
        { playerId: ownerPortalEvent.playerId, position: ownerPortalEvent.position },
        { playerId: owner.id, position: { x: nextEntry.x - 20, y: nextEntry.y } }
    );
    const predictedOwnerEntity = predictor.simulation.players[0];
    predictedOwnerEntity.physics.position.set(
        gate.trigger.x + gate.trigger.width * 0.5,
        gate.trigger.y + gate.trigger.height * 0.5
    );
    predictedOwnerEntity.physics.velocity.set(55, -25);
    predictedOwnerEntity.ropeObject.rope.attach(predictedOwnerEntity.physics.position, {
        x: predictedOwnerEntity.physics.position.x + 30,
        y: predictedOwnerEntity.physics.position.y - 60
    });
    predictedOwnerEntity.weapon.cooldown = 0.25;
    predictor.advance(command());
    const confirmedOwner = predictor.reconcile(portalSnapshot, []);
    assert.deepEqual(confirmedOwner.position, { x: nextEntry.x - 20, y: nextEntry.y });
    assert.deepEqual(
        confirmedOwner.velocity,
        { x: 0, y: 0 },
        "the server-confirmed portal transition must reset the owner's pre-portal movement state"
    );
    assert.equal(confirmedOwner.rope.isAttached, false, "the confirmed portal transition must reset the owner rope");
    assert.equal(confirmedOwner.weaponCooldown, 0, "the confirmed portal transition must reset the weapon cooldown");
    const waitingPartner = partnerPredictor.reconcile(portalSnapshot, []);
    assert.deepEqual(waitingPartner.position, partnerDeparture);
    assert.equal(
        waitingPartner.rope.isAttached,
        true,
        "a teammate's portal event must not reset the waiting owner's rope"
    );

    partner.physics.position.set(gate.trigger.x + gate.trigger.width * 0.5, gate.trigger.y + gate.trigger.height * 0.5);
    server.stepCommandBatch(
        1 / 120,
        createPlayerCommandBatch(328, [{ playerId: partner.id, sequence: 0, command: command() }]),
        { advanceInputDrivenObjects: false }
    );
    assert.deepEqual(
        { x: partner.physics.position.x, y: partner.physics.position.y },
        { x: nextEntry.x + 20, y: nextEntry.y },
        "the crossed Gate must remain a one-way portal for a later entrant"
    );
    assert.equal(partner.ropeObject.rope.isAttached, false);
    assert.deepEqual({ x: partner.physics.velocity.x, y: partner.physics.velocity.y }, { x: 0, y: 0 });
    assert.equal(partner.physics.angle, 0);
    assert.equal(partner.physics.angularVelocity, 0);

    const partnerPortalSnapshot = buildAuthoritySnapshot({ simulation: server });
    assert.equal(
        partnerPortalSnapshot.events.some(({ eventType }) => eventType === "gate-crossed"),
        false,
        "a later entrant must not advance shared authored progress again"
    );
    const partnerPortalEvent = partnerPortalSnapshot.events.find(
        ({ eventType }) => eventType === "gate-portal-entered"
    );
    assert.deepEqual(
        { playerId: partnerPortalEvent.playerId, position: partnerPortalEvent.position },
        { playerId: partner.id, position: { x: nextEntry.x + 20, y: nextEntry.y } }
    );
    const predictedPartner = partnerPredictor.reconcile(partnerPortalSnapshot, []);
    assert.deepEqual(predictedPartner.position, { x: nextEntry.x + 20, y: nextEntry.y });
    assert.deepEqual(predictedPartner.velocity, { x: 0, y: 0 });
    assert.equal(predictedPartner.rope.isAttached, false, "the owner's own portal entry must reset the owner rope");

    const predictionGuardServer = createCurrentGameSimulation({ worldSeed: 2718 });
    const guardOwner = predictionGuardServer.players[0];
    const guardTerminal = predictionGuardServer.world.objects.find(({ id }) => id === "sector-01-01:exit-panel");
    guardOwner.physics.position.set(guardTerminal.position.x, guardTerminal.position.y);
    const guardSnapshot = buildAuthoritySnapshot({ simulation: predictionGuardServer });
    const guardPredictor = new OwnerPredictionRuntime({
        ownerId: guardOwner.id,
        predictionLeadTicks: 0,
        simulation: createGameSimulationForWorldRevision({
            worldSeed: guardSnapshot.worldSeed,
            playerId: guardOwner.id,
            worldRevision: guardSnapshot.worldRevision
        })
    });
    guardPredictor.reconcile(guardSnapshot, []);
    guardPredictor.advance(command({ interact: true }));
    const guardProgress = guardPredictor.simulation.worldProgress.snapshot();
    assert.deepEqual(
        guardProgress.completedObjectiveIds,
        [],
        "owner prediction must not start shared authored progress"
    );
    assert.equal(
        guardPredictor.simulation.worldProgress.objectiveSequence("sector-01-01:terminal-read"),
        null,
        "owner prediction must not start a shared objective sequence"
    );
    assert.deepEqual(guardProgress.unlockedGateIds, [], "owner prediction must not unlock shared Gates");
    assert.equal(
        guardPredictor.simulation.activeCollisionSurfaces.filter(({ kind }) => kind === "gate-barrier").length,
        0,
        "no dynamic Gate barrier must exist; the lock is enforced by shared progress alone"
    );

    const floodServer = createCurrentGameSimulation({ worldSeed: 3141 });
    const floodOwner = floodServer.players[0];
    const floodSession = new AuthorityServerSession({ simulation: floodServer, snapshotIntervalTicks: 1 });
    const floodTerminal = floodServer.world.objects.find(({ id }) => id === "sector-01-01:exit-panel");
    floodOwner.physics.position.set(floodTerminal.position.x, floodTerminal.position.y);
    floodSession.submit(
        floodOwner.id,
        createPlayerCommandBatch(1, [{ playerId: floodOwner.id, sequence: 0, command: command({ interact: true }) }])
    );
    floodSession.advance();
    for (let step = 0; step < TERMINAL_SEQUENCE_STEPS; step += 1) floodSession.advance();
    const floodGate = floodServer.world.gates[0];
    const floodTrigger = {
        x: floodGate.trigger.x + floodGate.trigger.width * 0.5,
        y: floodGate.trigger.y + floodGate.trigger.height * 0.5
    };
    const firstMotionTick = floodServer.tick + 1;
    floodSession.submitOwnerMotion(
        floodOwner.id,
        createOwnerMotionState({
            clientTick: firstMotionTick,
            position: floodTrigger,
            velocity: { x: 0, y: 0 },
            angle: 0,
            angularVelocity: 0,
            isGrounded: false,
            rope: { isAttached: false, anchor: null }
        })
    );
    for (let extra = 1; extra <= 5; extra += 1) {
        floodSession.submitOwnerMotion(
            floodOwner.id,
            createOwnerMotionState({
                clientTick: firstMotionTick + extra,
                position: floodTrigger,
                velocity: { x: 0, y: 0 },
                angle: 0,
                angularVelocity: 0,
                isGrounded: false,
                rope: { isAttached: false, anchor: null }
            })
        );
    }
    const floodSnapshot = floodSession.advance();
    assert.equal(
        floodSnapshot.events.filter(
            ({ eventType, playerId }) => eventType === "gate-portal-entered" && playerId === floodOwner.id
        ).length,
        1,
        "stale owner motion in the trigger must not re-emit the portal transition"
    );

    const debugTeleportServer = createCurrentGameSimulation({ worldSeed: 2718 });
    const debugTeleportOwner = debugTeleportServer.players[0];
    const debugTeleportSession = new AuthorityServerSession({
        simulation: debugTeleportServer,
        snapshotIntervalTicks: 1
    });
    const debugTeleportArea = debugTeleportServer.world.areas.find(({ id }) => id === "sector-03-02");
    const debugTeleportReceipt = debugTeleportSession.debugTeleport(debugTeleportOwner.id, "sector-03-02");
    assert.equal(debugTeleportReceipt.accepted, true);
    assert.deepEqual(debugTeleportReceipt.position, { x: debugTeleportArea.entry.x, y: debugTeleportArea.entry.y });
    const debugTeleportSnapshot = debugTeleportSession.advance();
    assert.equal(
        debugTeleportSnapshot.events.some(
            ({ eventType, playerId, areaId }) =>
                eventType === "debug-teleported" && playerId === debugTeleportOwner.id && areaId === "sector-03-02"
        ),
        true,
        "the authority must replicate the debug teleport as a shared event"
    );
    assert.equal(debugTeleportSession.debugTeleport(debugTeleportOwner.id, "missing-area").accepted, false);

    const teleportedPredictor = new OwnerPredictionRuntime({
        ownerId: debugTeleportOwner.id,
        predictionLeadTicks: 0,
        simulation: createGameSimulationForWorldRevision({
            worldSeed: debugTeleportSnapshot.worldSeed,
            playerId: debugTeleportOwner.id,
            worldRevision: debugTeleportSnapshot.worldRevision
        })
    });
    teleportedPredictor.reconcile(debugTeleportSnapshot, []);
    const teleportedState = teleportedPredictor.state();
    assert.equal(
        teleportedState.position.x,
        debugTeleportArea.entry.x,
        "the owner client must apply the replicated debug teleport transition"
    );
    assert.ok(
        Math.abs(teleportedState.position.y - debugTeleportArea.entry.y) <= 40,
        "the teleported owner may settle onto the deck below the entry point"
    );
    assert.equal(teleportedState.rope.isAttached, false);

    const delayedServer = createCurrentGameSimulation({ worldSeed: 1618 });
    const delayedOwner = delayedServer.players[0];
    const delayedPartner = delayedServer.addPlayer(
        { x: delayedServer.world.areas[0].entry.x + 40, y: delayedServer.world.areas[0].entry.y },
        "delayed-portal-partner"
    ).entity;
    const delayedSession = new AuthorityServerSession({ simulation: delayedServer, snapshotIntervalTicks: 1 });
    const delayedTerminal = delayedServer.world.objects.find(({ id }) => id === "sector-01-01:exit-panel");
    delayedOwner.physics.position.set(delayedTerminal.position.x, delayedTerminal.position.y);
    delayedSession.submit(
        delayedOwner.id,
        createPlayerCommandBatch(1, [{ playerId: delayedOwner.id, sequence: 0, command: command({ interact: true }) }])
    );
    delayedSession.advance();
    for (let step = 0; step < TERMINAL_SEQUENCE_STEPS; step += 1) delayedSession.advance();
    const delayedGate = delayedServer.world.gates[0];
    const delayedGatePosition = {
        x: delayedGate.trigger.x + delayedGate.trigger.width * 0.5,
        y: delayedGate.trigger.y + 8
    };
    delayedOwner.physics.position.set(delayedGatePosition.x, delayedGatePosition.y);
    delayedSession.advance();
    assert.equal(delayedServer.worldProgress.currentAreaId, "sector-01-02");
    assert.deepEqual(
        { x: delayedPartner.physics.position.x, y: delayedPartner.physics.position.y },
        { x: delayedServer.world.areas[0].entry.x + 40, y: delayedServer.world.areas[0].entry.y }
    );
    const delayedClientTick = delayedServer.tick + 1;
    const delayedMotionReceipt = delayedSession.submitOwnerMotion(
        delayedPartner.id,
        createOwnerMotionState({
            clientTick: delayedClientTick,
            position: delayedGatePosition,
            velocity: { x: 0, y: 0 },
            angle: 0,
            angularVelocity: 0,
            isGrounded: false,
            rope: { isAttached: false, anchor: null }
        })
    );
    assert.deepEqual(delayedMotionReceipt, { clientTick: delayedClientTick, accepted: true });
    const delayedPortalSnapshot = delayedSession.advance();
    assert.deepEqual(
        { x: delayedPartner.physics.position.x, y: delayedPartner.physics.position.y },
        { x: delayedServer.world.areas[1].entry.x + 20, y: delayedServer.world.areas[1].entry.y },
        "the server must accept old-room owner motion until that player enters the persistent portal"
    );
    assert.equal(
        delayedPortalSnapshot.events.some(
            ({ eventType, playerId }) => eventType === "gate-portal-entered" && playerId === delayedPartner.id
        ),
        true
    );

    const guardedServer = createCurrentGameSimulation({ worldSeed: 3141 });
    const guardedOwner = guardedServer.players[0];
    const guardedSession = new AuthorityServerSession({ simulation: guardedServer, snapshotIntervalTicks: 1 });
    const guardedTerminal = guardedServer.world.objects.find(({ id }) => id === "sector-01-01:exit-panel");
    guardedOwner.physics.position.set(guardedTerminal.position.x, guardedTerminal.position.y);
    guardedSession.submit(
        guardedOwner.id,
        createPlayerCommandBatch(1, [{ playerId: guardedOwner.id, sequence: 0, command: command({ interact: true }) }])
    );
    guardedSession.advance();
    for (let step = 0; step < TERMINAL_SEQUENCE_STEPS; step += 1) guardedSession.advance();
    const guardedGate = guardedServer.world.gates[0];
    const stalePosition = {
        x: guardedGate.trigger.x + guardedGate.trigger.width * 0.5,
        y: guardedGate.trigger.y + guardedGate.trigger.height * 0.5
    };
    const guardedClientTick = guardedServer.tick + 1;
    const gateMotionReceipt = guardedSession.submitOwnerMotion(
        guardedOwner.id,
        createOwnerMotionState({
            clientTick: guardedClientTick,
            position: stalePosition,
            velocity: { x: 0, y: 0 },
            angle: 0,
            angularVelocity: 0,
            isGrounded: false,
            rope: { isAttached: false, anchor: null }
        })
    );
    assert.deepEqual(gateMotionReceipt, { clientTick: guardedClientTick, accepted: true });
    const guardedPortalSnapshot = guardedSession.advance();
    assert.equal(guardedPortalSnapshot.state.players[0].ownerMotionTick, guardedClientTick);
    const guardedArrival = { x: guardedOwner.physics.position.x, y: guardedOwner.physics.position.y };
    const staleMotionReceipt = guardedSession.submitOwnerMotion(
        guardedOwner.id,
        createOwnerMotionState({
            clientTick: guardedClientTick,
            position: stalePosition,
            velocity: { x: 0, y: 0 },
            angle: 0,
            angularVelocity: 0,
            isGrounded: false,
            rope: { isAttached: false, anchor: null }
        })
    );
    assert.equal(staleMotionReceipt.resolution, "ignored-stale");
    assert.deepEqual(
        { x: guardedOwner.physics.position.x, y: guardedOwner.physics.position.y },
        guardedArrival,
        "pre-portal owner motion must not move the authority player back into the previous room"
    );

    const sweptServer = createCurrentGameSimulation({ worldSeed: 1414 });
    const sweptOwner = sweptServer.players[0];
    const sweptSession = new AuthorityServerSession({ simulation: sweptServer, snapshotIntervalTicks: 1 });
    sweptServer.worldProgress.completeObjective("sector-01-01:terminal-read");
    const sweptGate = sweptServer.world.gates[0];
    const sweptNextArea = sweptServer.world.areas[1];
    sweptOwner.physics.position.set(sweptGate.trigger.x - 180, sweptGate.trigger.y + sweptGate.trigger.height + 1);
    const sweptClientTick = sweptServer.tick + 1;
    const sweptArrival = {
        x: sweptNextArea.entry.x - 20,
        y: sweptNextArea.entry.y
    };
    assert.ok(
        sweptOwner.physics.position.x < sweptGate.trigger.x && sweptArrival.x < sweptGate.trigger.x,
        "the sampled owner-motion chord must miss the narrow Gate trigger after a locally curved portal entry"
    );
    const sweptReceipt = sweptSession.submitOwnerMotion(
        sweptOwner.id,
        createOwnerMotionState({
            clientTick: sweptClientTick,
            position: sweptArrival,
            velocity: { x: 0, y: 0 },
            angle: 0,
            angularVelocity: 0,
            isGrounded: false,
            rope: { isAttached: false, anchor: null }
        })
    );
    assert.deepEqual(sweptReceipt, { clientTick: sweptClientTick, accepted: true });
    assert.equal(
        sweptServer.worldProgress.currentAreaId,
        "sector-01-02",
        "post-portal owner motion inside the next area must recover authority progress even when its chord misses the Gate"
    );
    assert.equal(sweptServer.worldProgress.isGateCrossed(sweptGate.id), true);
    assert.deepEqual(
        { x: sweptOwner.physics.position.x, y: sweptOwner.physics.position.y },
        sweptArrival,
        "authority convergence must keep the owner's locally predicted portal arrival"
    );
    const sweptPanel = sweptServer.world.objects.find(({ id }) => id === "sector-01-02:exit-panel");
    const sweptFinalDeck = sweptServer.world.surfaces.find(({ id }) => id === "sector-01-02:exit-deck");
    sweptSession.submitOwnerMotion(
        sweptOwner.id,
        createOwnerMotionState({
            clientTick: sweptClientTick + 1,
            position: { x: sweptPanel.position.x, y: sweptFinalDeck.topY - 24 },
            velocity: { x: 0, y: 0 },
            angle: 0,
            angularVelocity: 0,
            isGrounded: true,
            rope: { isAttached: false, anchor: null }
        })
    );
    const sweptSnapshot = sweptSession.advance();
    assert.equal(
        sweptServer.worldProgress.isObjectiveComplete("sector-01-02:final-deck-reached"),
        true,
        "the authority server must activate the 1-2 panel prerequisite after the swept Gate transition"
    );
    assert.equal(
        sweptSnapshot.events.some(({ eventType, gateId }) => eventType === "gate-crossed" && gateId === sweptGate.id),
        true
    );
    assert.equal(
        sweptSnapshot.events.some(
            ({ eventType, objectiveId }) =>
                eventType === "objective-completed" && objectiveId === "sector-01-02:final-deck-reached"
        ),
        true
    );
}
