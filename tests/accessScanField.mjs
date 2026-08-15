import assert from "node:assert/strict";
import {
    accessScanStateMap,
    evaluateAccessScanGroup,
    isSurfaceAccessAllowed,
    snapshotAccessScanStates
} from "../src/game/world/AccessScanField.js";
import { findRopeAttachment } from "../src/game/input/RopePointerInput.js";
import { assembleAuthoredWorld } from "../src/game/world/AuthoredWorldAssembler.js";
import {
    defineArea,
    defineAreaCatalog,
    grappleTarget,
    point,
    rectangle,
    triggerBounds,
    worldObject
} from "../src/game/world/areas/AreaDefinition.js";
import { GameSimulation } from "../src/game/simulation/GameSimulation.js";
import { createPlayerCommand } from "../src/game/commands/PlayerCommand.js";
import { createPlayerCommandBatch } from "../src/game/network/PlayerCommandBatch.js";
import { buildAuthoritySnapshot } from "../src/game/runtime/AuthoritySnapshotBuilder.js";
import { OwnerPredictionRuntime } from "../src/game/runtime/OwnerPredictionRuntime.js";
import {
    createCurrentGameSimulation,
    createGameSimulationForWorldRevision
} from "../src/game/simulation/GameSimulationFactory.js";

const GROUP = Object.freeze({
    id: "sector-03-02:scanner-A",
    cycle: Object.freeze({ available: 1.5, warning: 0.6, locked: 1.1, reset: 0.3 }),
    phaseOffsetSeconds: 0
});

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

function scannerCatalog() {
    return defineAreaCatalog({
        id: "scanner-test-mock",
        revision: "scanner-test-rev1",
        areas: [
            defineArea({
                id: "scanner-test-01",
                sectorId: "scanner-test",
                order: 1,
                name: "SCANNER TEST",
                bounds: { width: 960, height: 960 },
                entry: point("scanner-test-01:entry", -320, -32),
                exit: point("scanner-test-01:exit", 320, -928),
                nextAreaId: null,
                surfaces: [
                    rectangle("scanner-test-01:p0", -320, 0, 320, 32, { coordinateAnchor: "top-center" }),
                    grappleTarget("scanner-test-01:c1", 80, -320),
                    grappleTarget("scanner-test-01:p1", -80, -320),
                    grappleTarget("scanner-test-01:c2", 80, -640),
                    rectangle("scanner-test-01:final-deck", 0, -928, 320, 32, { coordinateAnchor: "top-center" })
                ],
                routePoints: [
                    point("scanner-test-01:route-entry", -320, -32),
                    point("scanner-test-01:route-c1", 80, -320),
                    point("scanner-test-01:route-c2", 80, -640),
                    point("scanner-test-01:route-exit", 320, -928)
                ],
                objects: [
                    worldObject("scanner-test-01:c1", "grapple-landmark", 80, -320, { label: "C1" }),
                    worldObject("scanner-test-01:p1", "grapple-landmark", -80, -320, { label: "P1" }),
                    worldObject("scanner-test-01:c2", "grapple-landmark", 80, -640, { label: "C2" }),
                    worldObject("scanner-test-01:exit-panel", "gate-panel", 208, -928, {
                        coordinateAnchor: "bottom-center",
                        interactionRadius: 72,
                        objectiveId: "scanner-test-01:exit-panel-engaged",
                        gateId: "scanner-test-01:gate",
                        requiredObjectiveIds: ["scanner-test-01:final-deck-reached"]
                    }),
                    worldObject("scanner-test-01:service-gate", "gate", 320, -928, {
                        coordinateAnchor: "bottom-center",
                        gateId: "scanner-test-01:gate"
                    })
                ],
                objectives: [
                    {
                        id: "scanner-test-01:final-deck-reached",
                        type: "reach",
                        bounds: triggerBounds(-160, -960, 480, 96)
                    },
                    {
                        id: "scanner-test-01:exit-panel-engaged",
                        type: "interact",
                        sourceObjectId: "scanner-test-01:exit-panel",
                        requiredObjectiveIds: ["scanner-test-01:final-deck-reached"]
                    }
                ],
                scannerGroups: [
                    {
                        id: "scanner-test-01:scanner-A",
                        cycle: { available: 1.5, warning: 0.6, locked: 1.1, reset: 0.3 },
                        phaseOffsetSeconds: 0,
                        controlledSurfaceIds: ["scanner-test-01:c1", "scanner-test-01:c2"]
                    }
                ],
                gate: {
                    id: "scanner-test-01:gate",
                    nextAreaId: null,
                    requiredObjectiveIds: ["scanner-test-01:exit-panel-engaged"],
                    trigger: triggerBounds(272, -1024, 96, 160),
                    barrier: triggerBounds(288, -1024, 64, 128),
                    completionMode: "content-boundary"
                }
            })
        ]
    });
}

function controlledSurface(surfaceId) {
    return { id: surfaceId, grappleable: true, grappleAccessGroup: GROUP.id };
}

export function run() {
    assert.equal(evaluateAccessScanGroup(GROUP, 0).phase, "AVAILABLE");
    assert.equal(evaluateAccessScanGroup(GROUP, 1.0).phase, "AVAILABLE");
    assert.equal(evaluateAccessScanGroup(GROUP, 1.5).phase, "WARNING");
    assert.equal(evaluateAccessScanGroup(GROUP, 2.1).phase, "LOCKED");
    assert.equal(evaluateAccessScanGroup(GROUP, 3.2).phase, "RESET");
    assert.equal(evaluateAccessScanGroup(GROUP, 3.5).phase, "AVAILABLE");

    const available = evaluateAccessScanGroup(GROUP, 0);
    assert.equal(available.attachAllowed, true);
    assert.equal(available.secondsRemaining, 1.5);
    assert.equal(evaluateAccessScanGroup(GROUP, 2.1).attachAllowed, false);
    assert.equal(evaluateAccessScanGroup(GROUP, 3.2).attachAllowed, false);

    const stateMap = accessScanStateMap([GROUP], 0);
    assert.equal(isSurfaceAccessAllowed({}, stateMap), true);
    assert.equal(isSurfaceAccessAllowed(controlledSurface("sector-03-02:c1"), stateMap), true);
    const lockedMap = accessScanStateMap([GROUP], 2.1);
    assert.equal(isSurfaceAccessAllowed(controlledSurface("sector-03-02:c1"), lockedMap), false);
    assert.throws(
        () => isSurfaceAccessAllowed({ grappleAccessGroup: "missing:group" }, stateMap),
        /Unknown access scan group/
    );
    assert.equal(snapshotAccessScanStates([GROUP], 2.1)[0].phase, "LOCKED");

    const world = assembleAuthoredWorld(scannerCatalog(), { seed: 1, floorY: 560 });
    assert.equal(world.scannerGroups.length, 1);
    assert.equal(world.scannerGroups[0].id, "scanner-test-01:scanner-A");
    assert.equal(world.areas[0].scannerGroupIds.includes("scanner-test-01:scanner-A"), true);
    assert.equal(
        world.surfaces.find(({ id }) => id === "scanner-test-01:c1").grappleAccessGroup,
        "scanner-test-01:scanner-A"
    );
    assert.equal(world.surfaces.find(({ id }) => id === "scanner-test-01:p0").grappleAccessGroup, undefined);

    const badCatalog = defineAreaCatalog({
        id: "bad-scanner",
        revision: "bad-rev1",
        areas: [
            defineArea({
                ...scannerCatalog().areas[0],
                scannerGroups: [
                    { ...GROUP, id: "scanner-test-01:scanner-A", controlledSurfaceIds: ["scanner-test-01:missing"] }
                ]
            })
        ]
    });
    assert.throws(() => assembleAuthoredWorld(badCatalog, { seed: 1, floorY: 560 }), /unknown surface/);

    const c1Surface = {
        id: "sector-03-02:c1",
        grappleable: true,
        vertices: [
            { x: 68, y: -332 },
            { x: 92, y: -332 },
            { x: 92, y: -308 },
            { x: 68, y: -308 }
        ]
    };
    const p1Surface = {
        id: "sector-03-02:p1",
        grappleable: true,
        vertices: [
            { x: -12, y: -332 },
            { x: 12, y: -332 },
            { x: 12, y: -308 },
            { x: -12, y: -308 }
        ]
    };
    const nearest = findRopeAttachment({
        aimPoint: { x: 80, y: -320 },
        origin: { x: 0, y: 0 },
        surfaces: [c1Surface, p1Surface],
        maxAttachDistance: 400
    });
    assert.ok(
        nearest && nearest.x >= 68 && nearest.x <= 92,
        "the nearest surface must be selected without a dynamic filter"
    );

    const fallback = findRopeAttachment({
        aimPoint: { x: 80, y: -320 },
        origin: { x: 0, y: 0 },
        surfaces: [c1Surface, p1Surface],
        maxAttachDistance: 400,
        canAttachToSurface: (surface) => surface.id !== "sector-03-02:c1"
    });
    assert.deepEqual(
        fallback,
        { x: 12, y: -320 },
        "a filtered controlled surface must fall back to the nearest eligible surface"
    );

    assert.equal(
        findRopeAttachment({
            aimPoint: { x: 80, y: -320 },
            origin: { x: 0, y: 0 },
            surfaces: [c1Surface],
            maxAttachDistance: 400,
            canAttachToSurface: () => false
        }),
        null,
        "a fully filtered surface set must not produce a candidate"
    );

    const simulation = new GameSimulation({ worldSeed: 1, worldCatalog: scannerCatalog() });
    const player = simulation.players[0];
    const c1 = simulation.world.surfaces.find(({ id }) => id === "scanner-test-01:c1");
    const aimAtC1 = { x: c1.position.x, y: c1.position.y };
    player.physics.position.set(c1.position.x - 85, c1.position.y);
    player.physics.velocity.set(0, 0);
    simulation.dispatchOwnerInput(player.id, command({ pointerDown: true, aimWorld: aimAtC1 }), 1 / 120);
    assert.equal(player.ropeObject.rope.isAttached, false, "press must not attach on the same frame");
    for (let tick = 0; tick < 120 && !player.ropeObject.rope.isAttached; tick += 1) {
        simulation.dispatchOwnerInput(player.id, command({ pointerDown: true, aimWorld: aimAtC1 }), 1 / 120);
    }
    assert.equal(player.ropeObject.rope.isAttached, true, "AVAILABLE must allow attaching to a controlled surface");

    simulation.restoreWorldProgress(null, 2.1);
    assert.equal(player.ropeObject.rope.isAttached, true, "an already-attached Rope must survive LOCKED");
    const healthBefore = player.health;
    const velocityBefore = { x: player.physics.velocity.x, y: player.physics.velocity.y };
    assert.equal(player.health, healthBefore);
    assert.equal(player.physics.velocity.x, velocityBefore.x);
    assert.equal(player.ropeDisabledRemaining, 0);

    simulation.dispatchOwnerInput(player.id, command({ pointerDown: false, aimWorld: aimAtC1 }), 1 / 120);
    assert.equal(player.ropeObject.rope.isAttached, false, "releasing during LOCKED must detach the Rope");
    for (let tick = 0; tick < 60; tick += 1) {
        simulation.dispatchOwnerInput(player.id, command({ pointerDown: true, aimWorld: aimAtC1 }), 1 / 120);
    }
    assert.equal(player.ropeObject.rope.isAttached, false, "LOCKED must deny a new attach");

    player.ropeObject.launcher.clear();
    simulation.dispatchOwnerInput(player.id, command({ pointerDown: false, aimWorld: aimAtC1 }), 1 / 120);
    simulation.restoreWorldProgress(null, 3.6);
    simulation.dispatchOwnerInput(player.id, command({ pointerDown: true, aimWorld: aimAtC1 }), 1 / 120);
    for (let tick = 0; tick < 120 && !player.ropeObject.rope.isAttached; tick += 1) {
        simulation.dispatchOwnerInput(player.id, command({ pointerDown: true, aimWorld: aimAtC1 }), 1 / 120);
    }
    assert.equal(player.ropeObject.rope.isAttached, true, "the next AVAILABLE must allow attaching again");

    const server = createCurrentGameSimulation({ worldSeed: 2718 });
    const ownerId = server.getPrimaryPlayerId();
    for (let tick = 0; tick < 120; tick += 1) {
        server.stepCommandBatch(1 / 120, createPlayerCommandBatch(server.tick + 1, []), {
            advanceInputDrivenObjects: false
        });
    }
    const snapshot = buildAuthoritySnapshot({ simulation: server, ownerMotionTicks: { [ownerId]: server.tick - 30 } });
    const predictor = new OwnerPredictionRuntime({
        ownerId,
        predictionLeadTicks: 0,
        simulation: createGameSimulationForWorldRevision({
            worldSeed: snapshot.worldSeed,
            playerId: ownerId,
            worldRevision: snapshot.worldRevision
        })
    });
    predictor.reconcile(snapshot, []);
    assert.ok(
        Math.abs(predictor.simulation.elapsedSeconds - server.elapsedSeconds) < 1e-9,
        "a delayed owner-motion reconcile must rebase elapsedSeconds to the server clock"
    );
    assert.equal(
        predictor
            .renderSnapshot()
            .windStates.map(({ phase }) => phase)
            .join(","),
        server
            .snapshot()
            .windStates.map(({ phase }) => phase)
            .join(","),
        "authority and delayed owner prediction must agree on time-derived Wind phase"
    );
}
