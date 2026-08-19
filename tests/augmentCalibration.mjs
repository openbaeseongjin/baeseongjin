import assert from "node:assert/strict";
import { createCurrentGameSimulation } from "../src/game/simulation/GameSimulationFactory.js";
import { createPlayerCommand } from "../src/game/commands/PlayerCommand.js";
import { foundationAugmentById } from "../src/game/augments/FoundationAugmentCatalog.js";

// The 12 valid empty-build first-choice candidates listed in
// docs/bsh/scenario/1/1-4/CALIBRATION-PROFILES.json.
const FIRST_CHOICE_IDS = Object.freeze([
    "fast-launch",
    "long-rope",
    "fast-recover",
    "release-propulsion",
    "electrified-rope",
    "collision-explosion",
    "direction-dash",
    "dash-strike",
    "instant-guard",
    "push-away",
    "straight-shot",
    "slow-fall"
]);

const OBJECTIVE_ID = "sector-01:landmark:04:objective:augment-calibrated";
const idleCommand = (aim = { x: 1, y: 0 }) =>
    createPlayerCommand(
        { horizontal: 0, vertical: 0, pointer: { x: 0, y: 0, down: false }, viewport: { width: 1280, height: 720 } },
        aim
    );

function selectAt(sim, player, node, foundationId) {
    player.physics.position.set(node.position.x, node.position.y);
    if (!foundationId) {
        sim.step(
            0,
            createPlayerCommand(
                {
                    horizontal: 0,
                    vertical: 0,
                    pointer: { x: 0, y: 0, down: false },
                    interact: true,
                    viewport: { width: 1280, height: 720 }
                },
                { x: 0, y: 0 }
            )
        );
        const offer = sim.foundationRewards.get(player.id);
        const result = sim.resolveFoundationSelection(player.id, {
            sourceId: node.id,
            foundationId: offer.choices[0].id
        });
        assert.equal(result.accepted, true, "selection must be accepted");
        return offer.choices[0].id;
    }
    // Deterministic offers depend on seed/player/selectionIndex - for a fixed card under test, select
    // directly rather than fighting the RNG for a specific offer, matching what the chooser itself
    // does once a card is confirmed (select() + syncLoadout()), then advance a tick so the shared
    // objective-progress loop observes and completes sector-01-04:augment-selected.
    assert.ok(player.foundation.select(foundationId, { sourceId: node.id }), `${foundationId} must select`);
    player.augmentCombat.syncLoadout(player.foundation, player.maxHealth);
    sim.step(1 / 60, idleCommand());
    return foundationId;
}

export function run() {
    // All 12 valid first-choice IDs must resolve to a real FoundationAugmentCatalog entry - the
    // calibration adapter has no fallback for an unsupported id.
    for (const id of FIRST_CHOICE_IDS) assert.ok(foundationAugmentById(id), `${id} must resolve in the catalog`);

    // Exercise one representative card from each family (action / rope) - the calibration adapter's
    // verification signal is generic across all 12 (see GameSimulation.js's
    // #advanceCalibrationVerification), so this is not a per-profile exhaustive check.
    const sim = createCurrentGameSimulation({ worldSeed: 9182, playerId: "calib-solo" });
    const player = sim.players[0];
    const node = sim.world.objects.find(({ id }) => id === "sector-01-04:maintenance-node");
    const frame = sim.world.objects.find(({ id }) => id === "sector-01-04:universal-calibration-frame");
    assert.ok(node && frame);

    const selectedId = selectAt(sim, player, node, "instant-guard");
    for (let i = 0; i < 30; i += 1) sim.step(1 / 60, idleCommand());
    assert.equal(
        sim.worldProgress.isObjectiveComplete(OBJECTIVE_ID),
        false,
        "card ownership alone must never complete calibration"
    );

    const definition = foundationAugmentById(selectedId);
    assert.ok(definition.actionId, "instant-guard must be an action-family Augment");
    player.physics.position.set(frame.position.x, frame.position.y - 20);
    player.physics.velocity.set(0, 0);
    for (let i = 0; i < 30 && !sim.worldProgress.isObjectiveComplete(OBJECTIVE_ID); i += 1) {
        sim.step(
            1 / 60,
            createPlayerCommand(
                {
                    horizontal: 0,
                    vertical: 0,
                    pointer: { x: 1, y: 0, down: false },
                    action: i < 3,
                    viewport: { width: 1280, height: 720 }
                },
                { x: 1, y: 0 }
            )
        );
    }
    assert.equal(
        sim.worldProgress.isObjectiveComplete(OBJECTIVE_ID),
        true,
        `selected action-family Augment ${selectedId}'s canonical activation near the frame must complete calibration`
    );

    const ropeSim = createCurrentGameSimulation({ worldSeed: 9182, playerId: "calib-rope" });
    const ropePlayer = ropeSim.players[0];
    const ropeNode = ropeSim.world.objects.find(({ id }) => id === "sector-01-04:maintenance-node");
    const ropeFrame = ropeSim.world.objects.find(({ id }) => id === "sector-01-04:universal-calibration-frame");
    const ropeSelectedId = selectAt(ropeSim, ropePlayer, ropeNode, "electrified-rope");
    assert.equal(foundationAugmentById(ropeSelectedId).actionId, undefined, "electrified-rope must be rope-family");
    ropePlayer.physics.position.set(ropeFrame.position.x, ropeFrame.position.y - 20);
    ropePlayer.physics.velocity.set(0, 0);
    const upperLip = ropeSim.world.surfaces.find(({ id }) => id === "sector-01-04:calibration-upper-lip");
    const aim = { x: upperLip.position.x, y: upperLip.position.y };
    for (let i = 0; i < 90 && !ropeSim.worldProgress.isObjectiveComplete(OBJECTIVE_ID); i += 1) {
        ropeSim.step(
            1 / 60,
            createPlayerCommand(
                {
                    horizontal: 0,
                    vertical: 0,
                    pointer: { x: 1, y: 0, down: i > 2 },
                    viewport: { width: 1280, height: 720 }
                },
                aim
            )
        );
    }
    assert.equal(
        ropeSim.worldProgress.isObjectiveComplete(OBJECTIVE_ID),
        true,
        "selected rope-family Augment's canonical rope attach near the frame must complete calibration"
    );

    // Proximity gating: an Augment fired far from the frame must never verify.
    const farSim = createCurrentGameSimulation({ worldSeed: 9182, playerId: "calib-far" });
    const farPlayer = farSim.players[0];
    const farNode = farSim.world.objects.find(({ id }) => id === "sector-01-04:maintenance-node");
    const farFrame = farSim.world.objects.find(({ id }) => id === "sector-01-04:universal-calibration-frame");
    selectAt(farSim, farPlayer, farNode, "instant-guard");
    farPlayer.physics.position.set(farFrame.position.x - 2000, farFrame.position.y);
    for (let i = 0; i < 10; i += 1) {
        farSim.step(
            1 / 60,
            createPlayerCommand(
                {
                    horizontal: 0,
                    vertical: 0,
                    pointer: { x: 1, y: 0, down: false },
                    action: i < 3,
                    viewport: { width: 1280, height: 720 }
                },
                { x: 1, y: 0 }
            )
        );
    }
    assert.equal(
        farSim.worldProgress.isObjectiveComplete(OBJECTIVE_ID),
        false,
        "firing the Augment far from the calibration frame must not verify"
    );

    // Multiplayer: two Players with different cards calibrate independently; neither can complete
    // the other's personal verification, and the shared objective only flips once both have passed.
    const mpSim = createCurrentGameSimulation({ worldSeed: 9182, playerId: "calib-mp-a" });
    const playerA = mpSim.players.find(({ id }) => id === "calib-mp-a");
    const playerB = mpSim.addPlayer(playerA.physics.position, "calib-mp-b").entity;
    const mpNode = mpSim.world.objects.find(({ id }) => id === "sector-01-04:maintenance-node");
    const mpFrame = mpSim.world.objects.find(({ id }) => id === "sector-01-04:universal-calibration-frame");
    selectAt(mpSim, playerA, mpNode, "electrified-rope");
    selectAt(mpSim, playerB, mpNode, "instant-guard");

    playerA.physics.position.set(mpFrame.position.x, mpFrame.position.y - 20);
    playerA.physics.velocity.set(0, 0);
    const mpUpperLip = mpSim.world.surfaces.find(({ id }) => id === "sector-01-04:calibration-upper-lip");
    for (let i = 0; i < 90; i += 1) {
        mpSim.step(
            1 / 60,
            createPlayerCommand(
                {
                    horizontal: 0,
                    vertical: 0,
                    pointer: { x: 1, y: 0, down: i > 2 },
                    viewport: { width: 1280, height: 720 }
                },
                { x: mpUpperLip.position.x, y: mpUpperLip.position.y }
            )
        );
    }
    assert.equal(
        playerA.calibrationVerifiedSourceIds.includes(mpFrame.id),
        true,
        "Player A must verify from their own rope attach"
    );
    assert.equal(
        playerB.calibrationVerifiedSourceIds.includes(mpFrame.id),
        false,
        "Player B must not be cross-completed by Player A's calibration"
    );
    assert.equal(
        mpSim.worldProgress.isObjectiveComplete(OBJECTIVE_ID),
        false,
        "the shared objective must wait for every currently active, card-selected Player"
    );

    // Leaver: once the only unverified Player leaves, the shared objective must complete on the
    // remaining roster instead of deadlocking forever.
    mpSim.removePlayer(playerB.id);
    mpSim.step(1 / 60, idleCommand());
    assert.equal(
        mpSim.worldProgress.isObjectiveComplete(OBJECTIVE_ID),
        true,
        "a leaver must not deadlock the remaining Players' already-verified calibration"
    );
}
