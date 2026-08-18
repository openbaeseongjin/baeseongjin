import assert from "node:assert/strict";
import { COMBAT_CONFIG, ROPE_CONFIG, ropeHookFlightSeconds, ropeHookReach } from "../src/game/config.js";
import { createPlayerCommand } from "../src/game/commands/PlayerCommand.js";
import { findRopeAttachment } from "../src/game/input/RopePointerInput.js";
import { RopeLauncher } from "../src/game/rope/RopeLauncher.js";
import { GameSimulation } from "../src/game/simulation/GameSimulation.js";

function primaryPlayer(simulation) {
    return simulation.players.find(({ id }) => id === simulation.getPrimaryPlayerId());
}

function command({ pointerDown = false, aimWorld = { x: 0, y: 0 } } = {}) {
    return createPlayerCommand(
        {
            horizontal: 0,
            vertical: 0,
            interact: false,
            pointer: { x: aimWorld.x, y: aimWorld.y, down: pointerDown },
            viewport: { width: 1280, height: 720 }
        },
        aimWorld
    );
}

function grappleSurfaceAt(position, size = 24) {
    const half = size / 2;
    return {
        id: "target-surface",
        grappleable: true,
        vertices: [
            { x: position.x - half, y: position.y - half },
            { x: position.x + half, y: position.y - half },
            { x: position.x + half, y: position.y + half },
            { x: position.x - half, y: position.y + half }
        ]
    };
}

function sealedDividerAt({ x, y, width, height }) {
    return {
        id: "sealed-divider",
        kind: "inter-floor-divider",
        collision: true,
        grappleable: false,
        vertices: [
            { x, y },
            { x: x + width, y },
            { x: x + width, y: y + height },
            { x, y: y + height }
        ]
    };
}

export function run() {
    assert.equal(ropeHookReach(), 400, "hook reach must be exactly 400px");
    assert.equal(ropeHookFlightSeconds() * ROPE_CONFIG.hookSpeed, 400, "speed x flight lifetime must equal the reach");

    const unit = new RopeLauncher(ROPE_CONFIG);
    assert.equal(unit.launch({ x: 0, y: 0 }, { x: 1, y: 0 }, null), true);
    assert.equal(unit.inFlight, true);
    assert.equal(unit.advance(ropeHookFlightSeconds()).status, "expired");
    assert.equal(unit.cooldownRemaining, ROPE_CONFIG.hookReloadSeconds);
    unit.update(ROPE_CONFIG.hookReloadSeconds);
    assert.equal(unit.cooldownRemaining, 0);
    assert.equal(unit.launch({ x: 0, y: 0 }, { x: 0, y: 0 }, null), false, "a zero direction must not launch");

    const targeted = new RopeLauncher(ROPE_CONFIG);
    assert.equal(targeted.launch({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 400, y: 0 }), true);
    let outcome = null;
    for (let tick = 0; tick < 60 && (!outcome || outcome.status === "flying"); tick += 1) {
        outcome = targeted.advance(1 / 120);
    }
    assert.equal(outcome.status, "hit");
    assert.deepEqual(outcome.target, { x: 400, y: 0 });
    assert.equal(targeted.cooldownRemaining, 0, "a hit must not start the reload cooldown");

    const cancelled = new RopeLauncher(ROPE_CONFIG);
    cancelled.launch({ x: 0, y: 0 }, { x: 1, y: 0 }, null);
    assert.equal(cancelled.cancel(), true);
    assert.equal(cancelled.inFlight, false);
    assert.equal(cancelled.cooldownRemaining, ROPE_CONFIG.hookReloadSeconds);

    const reachBoundary = new RopeLauncher(ROPE_CONFIG);
    assert.equal(reachBoundary.launch({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 399, y: 0 }), true);
    reachBoundary.clear();
    assert.equal(reachBoundary.launch({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 400, y: 0 }), true);
    reachBoundary.clear();
    assert.equal(
        reachBoundary.launch({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 401, y: 0 }),
        false,
        "a target beyond the derived 400px reach must not launch"
    );

    const overshoot = new RopeLauncher(ROPE_CONFIG);
    overshoot.restore({
        cooldownRemaining: 0,
        shot: {
            origin: { x: 0, y: 0 },
            direction: { x: 1, y: 0 },
            target: { x: 500, y: 0 },
            traveled: 0,
            elapsed: 0
        }
    });
    assert.equal(overshoot.advance(10).status, "expired", "a large-dt advance must not hit a target beyond 400px");
    assert.equal(overshoot.inFlight, false);
    const invalidDt = new RopeLauncher(ROPE_CONFIG);
    invalidDt.launch({ x: 0, y: 0 }, { x: 1, y: 0 }, null);
    assert.throws(() => invalidDt.advance(-1), /non-negative/, "advance must reject negative dt");
    assert.throws(() => invalidDt.advance(Infinity), /finite/, "advance must reject non-finite dt");

    const simulation = new GameSimulation();
    const player = primaryPlayer(simulation);
    simulation.enemies = [];
    const targetPosition = { x: player.physics.position.x + 85, y: player.physics.position.y };
    simulation.activeCollisionSurfaces = [grappleSurfaceAt(targetPosition)];
    const aimWorld = { ...targetPosition };

    const farSurface = [grappleSurfaceAt({ x: player.physics.position.x + 500, y: player.physics.position.y })];
    assert.equal(
        findRopeAttachment({
            aimPoint: { x: player.physics.position.x + 500, y: player.physics.position.y },
            origin: { x: player.physics.position.x, y: player.physics.position.y },
            surfaces: farSurface,
            maxAttachDistance: ropeHookReach(),
            aimTolerance: 90
        }),
        null,
        "a 400px reach must not select a candidate beyond its bound"
    );

    const targetBehindGate = grappleSurfaceAt({ x: 200, y: 0 });
    assert.equal(
        findRopeAttachment({
            aimPoint: { x: 200, y: 0 },
            origin: { x: 0, y: 0 },
            surfaces: [targetBehindGate, sealedDividerAt({ x: 80, y: -64, width: 64, height: 128 })],
            maxAttachDistance: ropeHookReach(),
            aimTolerance: 90
        }),
        null,
        "a sealed inter-floor divider must occlude grapple targets in the next area"
    );
    assert.equal(
        findRopeAttachment({
            aimPoint: { x: 200, y: 0 },
            origin: { x: 0, y: 0 },
            surfaces: [targetBehindGate, sealedDividerAt({ x: 80, y: -64, width: 64, height: 128 })],
            maxAttachDistance: ropeHookReach(),
            aimTolerance: 90
        }),
        null,
        "the sealed floor keeps occluding the next area even after the Gate unlock"
    );

    simulation.dispatchOwnerInput(player.id, command({ pointerDown: true, aimWorld }), 1 / 120);
    assert.equal(player.ropeObject.rope.isAttached, false, "press must not attach on the same frame");
    assert.equal(player.ropeObject.launcher.inFlight, true, "press must launch a hook");
    for (let tick = 0; tick < 60 && !player.ropeObject.rope.isAttached; tick += 1) {
        simulation.dispatchOwnerInput(player.id, command({ pointerDown: true, aimWorld }), 1 / 120);
    }
    assert.equal(player.ropeObject.rope.isAttached, true, "the hook must attach after fixed ticks");

    const missSimulation = new GameSimulation();
    const missPlayer = primaryPlayer(missSimulation);
    missSimulation.enemies = [];
    missSimulation.activeCollisionSurfaces = [];
    const missAim = { x: missPlayer.physics.position.x + 300, y: missPlayer.physics.position.y };
    missSimulation.dispatchOwnerInput(missPlayer.id, command({ pointerDown: true, aimWorld: missAim }), 1 / 120);
    assert.equal(missPlayer.ropeObject.launcher.inFlight, true, "a miss must still launch a visible hook");
    for (let tick = 0; tick < 60 && missPlayer.ropeObject.launcher.inFlight; tick += 1) {
        missSimulation.dispatchOwnerInput(missPlayer.id, command({ pointerDown: true, aimWorld: missAim }), 1 / 120);
    }
    assert.equal(missPlayer.ropeObject.launcher.inFlight, false, "a miss shot must expire after its lifetime");
    assert.equal(missPlayer.ropeObject.rope.isAttached, false);
    assert.ok(missPlayer.ropeObject.launcher.cooldownRemaining > 0, "a miss must start the reload cooldown");
    for (let tick = 0; tick < 60 && missPlayer.ropeObject.launcher.cooldownRemaining > 0; tick += 1) {
        missSimulation.dispatchOwnerInput(missPlayer.id, command({ pointerDown: true, aimWorld: missAim }), 1 / 120);
    }
    assert.equal(missPlayer.ropeObject.rope.isAttached, false, "a held pointer must not auto-repeat a missed launch");

    const ropeDisabledSimulation = new GameSimulation();
    const ropeDisabledPlayer = primaryPlayer(ropeDisabledSimulation);
    ropeDisabledSimulation.enemies = [];
    const disabledAim = { x: ropeDisabledPlayer.physics.position.x + 85, y: ropeDisabledPlayer.physics.position.y };
    ropeDisabledSimulation.activeCollisionSurfaces = [grappleSurfaceAt(disabledAim)];
    ropeDisabledPlayer.ropeDisabledRemaining = COMBAT_CONFIG.ropeDisabledSeconds;
    ropeDisabledSimulation.dispatchOwnerInput(
        ropeDisabledPlayer.id,
        command({ pointerDown: true, aimWorld: disabledAim }),
        1 / 120
    );
    assert.equal(
        ropeDisabledPlayer.ropeObject.attachmentCandidate,
        null,
        "a rope-cut cooldown must suppress the grapple preview"
    );
    assert.equal(
        ropeDisabledPlayer.ropeObject.launcher.inFlight,
        false,
        "a rope-cut cooldown must prevent a hook launch from starting"
    );

    const directionSimulation = new GameSimulation();
    const directionPlayer = primaryPlayer(directionSimulation);
    directionSimulation.enemies = [];
    directionPlayer.physics.position.set(0, 0);
    directionPlayer.physics.setAngularState(0, 0);
    directionSimulation.activeCollisionSurfaces = [grappleSurfaceAt({ x: 200, y: 0 })];
    const offCandidateAim = { x: 200, y: 30 };
    directionSimulation.dispatchOwnerInput(
        directionPlayer.id,
        command({ pointerDown: true, aimWorld: offCandidateAim }),
        1 / 120
    );
    const candidate = directionPlayer.ropeObject.attachmentCandidate;
    assert.ok(candidate, "an off-candidate aim must still find an attachment candidate");
    assert.notDeepEqual(candidate, offCandidateAim, "the candidate must differ from the raw aim point");
    const shot = directionPlayer.ropeObject.launcher.shot;
    const directionToCandidate = { x: candidate.x - shot.origin.x, y: candidate.y - shot.origin.y };
    const candidateMagnitude = Math.hypot(directionToCandidate.x, directionToCandidate.y);
    assert.ok(
        Math.abs(shot.direction.x - directionToCandidate.x / candidateMagnitude) < 1e-9 &&
            Math.abs(shot.direction.y - directionToCandidate.y / candidateMagnitude) < 1e-9,
        "the launched hook must fly toward the fixed candidate instead of the off-candidate aim"
    );

    const buffered = new GameSimulation();
    const bufferedPlayer = primaryPlayer(buffered);
    buffered.enemies = [];
    buffered.activeCollisionSurfaces = [];
    const bufferedAim = { x: bufferedPlayer.physics.position.x + 200, y: bufferedPlayer.physics.position.y };
    buffered.dispatchOwnerInput(bufferedPlayer.id, command({ pointerDown: true, aimWorld: bufferedAim }), 1 / 120);
    buffered.dispatchOwnerInput(bufferedPlayer.id, command({ pointerDown: false, aimWorld: bufferedAim }), 1 / 120);
    assert.ok(
        bufferedPlayer.ropeObject.launcher.cooldownRemaining > 0,
        "releasing an in-flight shot must start the reload cooldown"
    );
    buffered.dispatchOwnerInput(bufferedPlayer.id, command({ pointerDown: true, aimWorld: bufferedAim }), 1 / 120);
    assert.equal(bufferedPlayer.ropeObject.launcher.inFlight, false, "a press during reload must not fire immediately");
    assert.ok(
        bufferedPlayer.ropeObject.attachBufferRemaining > 0,
        "a press during reload must buffer the launch intent"
    );
    for (let tick = 0; tick < 130 && !bufferedPlayer.ropeObject.launcher.inFlight; tick += 1) {
        buffered.dispatchOwnerInput(bufferedPlayer.id, command({ pointerDown: true, aimWorld: bufferedAim }), 1 / 120);
    }
    assert.equal(bufferedPlayer.ropeObject.launcher.inFlight, true, "the buffered press must launch once reload ends");
}
