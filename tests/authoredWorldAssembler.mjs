import assert from "node:assert/strict";
import { Vector2 } from "../src/game-kit/index.js";
import { CircleCollider } from "../src/game/physics/colliders/CircleCollider.js";
import { assembleAuthoredWorld } from "../src/game/world/AuthoredWorldAssembler.js";
import { gatePortalBounds, worldObject } from "../src/game/world/areas/AreaDefinition.js";
import { CURRENT_AUTHORED_AREA_CATALOG } from "../src/game/world/areas/CurrentAuthoredAreaCatalog.js";
import { SECTOR_01_AREA_CATALOG } from "../src/game/world/areas/sector01/Sector01AreaCatalog.js";
import { SECTOR_02_AREA_CATALOG } from "../src/game/world/areas/sector02/Sector02AreaCatalog.js";
import {
    DEFAULT_WORLD_OBJECT_MOCK_CATALOG,
    worldObjectPresentation
} from "../src/render/assets/WorldObjectPresentationCatalog.js";

function authoredSurfaceBounds(surface) {
    const xs = surface.vertices.map(({ x }) => x);
    const ys = surface.vertices.map(({ y }) => y);
    return {
        x: Math.min(...xs),
        y: Math.min(...ys),
        width: Math.max(...xs) - Math.min(...xs),
        height: Math.max(...ys) - Math.min(...ys)
    };
}

export function run() {
    const before = JSON.stringify(SECTOR_01_AREA_CATALOG);
    const first = assembleAuthoredWorld(SECTOR_01_AREA_CATALOG, { seed: 9182, floorY: 320 });
    const second = assembleAuthoredWorld(SECTOR_01_AREA_CATALOG, { seed: 9182, floorY: 320 });
    const currentWorld = assembleAuthoredWorld(CURRENT_AUTHORED_AREA_CATALOG, { seed: 9182, floorY: 320 });

    assert.deepEqual(first, second, "the same catalog and composition options must produce the same world");
    assert.equal(JSON.stringify(SECTOR_01_AREA_CATALOG), before, "assembly must not mutate authored definitions");
    assert.equal(first.definitionId, "sector-01-authored-mock");
    assert.equal(first.areas.length, 8);
    assert.equal(first.gates.length, 8);
    assert.equal(first.checkpoints.length, 9);
    assert.equal(first.checkpoints.filter(({ reward }) => reward).length, 1);
    assert.ok(first.surfaces.length > first.route.length);
    assert.ok(first.surfaces.every((surface) => Object.isFrozen(surface)));
    assert.ok(first.objects.every((object) => first.areas.some(({ id }) => id === object.areaId)));
    assert.equal(
        first.surfaces.filter(({ kind }) => kind === "inter-floor-divider").length,
        first.areas.length * 2,
        "each authored floor boundary must stay physically sealed outside its Gate opening"
    );
    assert.equal(
        first.surfaces.filter(({ kind }) => kind === "area-boundary-wall").length,
        first.areas.length * 2,
        "the visible room walls must also be physical so a player cannot route around a divider"
    );
    assert.ok(
        first.objects
            .filter(({ presentationId }) => presentationId)
            .every((object) => worldObjectPresentation(DEFAULT_WORLD_OBJECT_MOCK_CATALOG, object.presentationId)),
        "each rendered authored object must resolve through the replaceable mock presentation catalog"
    );
    assert.throws(
        () => worldObject("invalid-anchor", "gate", 0, 0, { coordinateAnchor: "floor" }),
        /coordinateAnchor/,
        "authored objects must reject unknown coordinate anchor names before assembly"
    );
    for (const catalog of [SECTOR_01_AREA_CATALOG, SECTOR_02_AREA_CATALOG]) {
        for (const area of catalog.areas.filter(({ gate }) => gate.nextAreaId !== null)) {
            const portalObject = area.objects.find(
                ({ gateId, kind }) => gateId === area.gate.id && kind !== "gate-panel"
            );
            assert.ok(portalObject, `${area.id} must expose one visible object for its progression portal`);
            assert.deepEqual(
                area.gate.trigger,
                gatePortalBounds(portalObject.position.x, portalObject.position.y),
                `${area.id} progression trigger must match its bottom-centred door aperture`
            );
        }
        for (const surface of catalog.areas.flatMap(({ surfaces }) => surfaces)) {
            const width =
                Math.max(...surface.vertices.map(({ x }) => x)) - Math.min(...surface.vertices.map(({ x }) => x));
            const height =
                Math.max(...surface.vertices.map(({ y }) => y)) - Math.min(...surface.vertices.map(({ y }) => y));
            const expectedAnchor =
                surface.kind === "grapple-target"
                    ? "center"
                    : surface.kind === "sealed-door" || (surface.kind === "cover" && height > width)
                      ? "bottom-center"
                      : "top-center";
            assert.equal(
                surface.coordinateAnchor,
                expectedAnchor,
                `${surface.id} must use the coordinate anchor that matches how the surface is mounted`
            );
        }
    }
    const firstPlatform = SECTOR_01_AREA_CATALOG.areas[0].surfaces.find(({ id }) => id.endsWith(":p4"));
    assert.deepEqual(firstPlatform.position, { x: 192, y: -864 });
    assert.deepEqual(firstPlatform.vertices[0], { x: 32, y: -864 });
    assert.deepEqual(firstPlatform.vertices[1], { x: 352, y: -864 });
    assert.equal(
        first.surfaces.find(({ id }) => id === firstPlatform.id).position.y,
        firstPlatform.position.y + 320,
        "assembly must translate the authored platform anchor together with its vertices"
    );
    const secondAreaDefinition = SECTOR_01_AREA_CATALOG.areas.find(({ id }) => id === "sector-01-02");
    assert.deepEqual(
        Object.fromEntries(
            secondAreaDefinition.surfaces
                .filter(({ id }) => /:(p[0-4]|crossbeam-x1)$/.test(id))
                .map((surface) => [
                    surface.id.split(":").at(-1),
                    { ...authoredSurfaceBounds(surface), grappleable: surface.grappleable }
                ])
        ),
        {
            p0: { x: -416, y: 0, width: 256, height: 32, grappleable: true },
            p1: { x: 64, y: -288, width: 192, height: 16, grappleable: true },
            "crossbeam-x1": { x: -64, y: -544, width: 128, height: 32, grappleable: false },
            p2: { x: -288, y: -576, width: 192, height: 16, grappleable: true },
            p3: { x: 64, y: -800, width: 192, height: 16, grappleable: true },
            p4: { x: 64, y: -960, width: 288, height: 32, grappleable: true }
        },
        "1-2 gameplay surfaces must stay aligned with the REV 3.1 approved blockout"
    );
    assert.deepEqual(
        secondAreaDefinition.objects
            .filter(({ id }) => /:(maintenance-lift|anchor-[a-d]|security-access-gate|exit-panel)$/.test(id))
            .map(({ id, position, coordinateAnchor }) => ({
                id: id.split(":").at(-1),
                position,
                coordinateAnchor
            })),
        [
            { id: "maintenance-lift", position: { x: 0, y: -544 }, coordinateAnchor: "center" },
            { id: "anchor-a", position: { x: -128, y: -192 }, coordinateAnchor: "center" },
            { id: "anchor-b", position: { x: 160, y: -416 }, coordinateAnchor: "center" },
            { id: "anchor-c", position: { x: -160, y: -640 }, coordinateAnchor: "center" },
            { id: "anchor-d", position: { x: 128, y: -864 }, coordinateAnchor: "center" },
            { id: "security-access-gate", position: { x: 320, y: -960 }, coordinateAnchor: "bottom-center" },
            { id: "exit-panel", position: { x: 208, y: -960 }, coordinateAnchor: "bottom-center" }
        ],
        "1-2 landmarks and floor-mounted exit objects must use the approved anchors"
    );
    const thirdAreaDefinition = SECTOR_01_AREA_CATALOG.areas.find(({ id }) => id === "sector-01-03");
    const thirdRecovery = thirdAreaDefinition.surfaces.find(({ id }) => id === "sector-01-03:r1");
    assert.deepEqual(authoredSurfaceBounds(thirdRecovery), {
        x: -32,
        y: -576,
        width: 256,
        height: 16
    });
    assert.deepEqual(
        thirdAreaDefinition.recoveryPoints.find(({ id }) => id === "sector-01-03:recovery-r1"),
        { id: "sector-01-03:recovery-r1", x: 96, y: -600 },
        "1-3 R1 must match the documented B handoff recovery deck"
    );
    const thirdSentry = thirdAreaDefinition.objects.find(({ id }) => id === "sector-01-03:sentry-turret-01");
    assert.deepEqual(thirdSentry.activation, { x: -480, y: -928, width: 960, height: 544 });
    assert.deepEqual(thirdSentry.rules, ["standard-projectile", "no-rope-cut", "cover-ends-los"]);
    for (const object of currentWorld.objects.filter(
        ({ kind, gateId }) => gateId && (kind === "gate" || kind === "gate-panel")
    )) {
        assert.equal(object.coordinateAnchor, "bottom-center");
        assert.ok(
            currentWorld.surfaces.some(
                (surface) =>
                    surface.areaId === object.areaId &&
                    surface.renderable !== false &&
                    object.position.x >= surface.x &&
                    object.position.x <= surface.x + surface.width &&
                    object.position.y === surface.topY
            ),
            `${object.id} must mount its bottom-center coordinate on a visible floor top`
        );
    }

    for (let index = 1; index < first.areas.length; index += 1) {
        const previous = first.areas[index - 1];
        const current = first.areas[index];
        assert.equal(current.bounds.y, previous.bounds.y - current.bounds.height);
        assert.ok(current.entry.y < previous.entry.y, "authored areas must remain in one upward world");
    }

    for (const area of first.areas) {
        const gate = first.gates.find(({ id }) => id === area.gateId);
        const gatePanel = first.objects.find(
            ({ areaId, kind, gateId }) => areaId === area.id && kind === "gate-panel" && gateId === gate.id
        );
        const dividers = first.surfaces.filter(
            ({ areaId, kind }) => areaId === area.id && kind === "inter-floor-divider"
        );
        const sideWalls = first.surfaces.filter(
            ({ areaId, kind }) => areaId === area.id && kind === "area-boundary-wall"
        );
        assert.ok(gatePanel, `${area.id} must expose one visible control panel beside its Gate`);
        const floorMountedObjects = first.objects.filter(
            ({ areaId, kind }) => areaId === area.id && (kind === "gate" || kind === "gate-panel")
        );
        for (const object of floorMountedObjects) {
            assert.equal(
                object.coordinateAnchor,
                "bottom-center",
                `${object.id} must declare its authored coordinate as the floor contact point`
            );
            assert.ok(
                first.surfaces.some(
                    (surface) =>
                        surface.areaId === area.id &&
                        surface.renderable !== false &&
                        object.position.x >= surface.x &&
                        object.position.x <= surface.x + surface.width &&
                        object.position.y === surface.topY
                ),
                `${object.id} bottom-center coordinate must touch a visible authored floor top`
            );
        }
        assert.ok(
            Math.abs(gatePanel.position.x - (gate.barrier.x + gate.barrier.width * 0.5)) <= 160,
            `${area.id} Gate panel must remain visibly adjacent to the door`
        );
        assert.equal(dividers.length, 2);
        assert.equal(sideWalls.length, 2);
        assert.equal(sideWalls[0].x, area.bounds.x);
        assert.equal(sideWalls[1].x + sideWalls[1].width, area.bounds.x + area.bounds.width);
        assert.equal(dividers[0].x, area.bounds.x);
        assert.equal(dividers[1].x + dividers[1].width, area.bounds.x + area.bounds.width);
        assert.ok(dividers.every(({ collision, grappleable, renderable }) => collision && !grappleable && !renderable));
        assert.ok(dividers[0].x + dividers[0].width <= gate.barrier.x);
        assert.ok(dividers[1].x >= gate.barrier.x + gate.barrier.width);
    }

    const firstArea = first.areas[0];
    const firstGate = first.gates[0];
    const firstDivider = first.surfaces.find(
        ({ areaId, id }) => areaId === firstArea.id && id.endsWith("inter-floor-divider-left")
    );
    const collider = new CircleCollider({ radius: 18 });
    const blockedPosition = new Vector2(firstDivider.x + 120, firstDivider.y + firstDivider.height - 4);
    const blockedVelocity = new Vector2(0, -4200);
    collider.resolveSurfaces({
        position: blockedPosition,
        velocity: blockedVelocity,
        surfaces: first.surfaces,
        previousPosition: new Vector2(blockedPosition.x, firstDivider.y + firstDivider.height + 24)
    });
    assert.ok(
        blockedPosition.y >= firstDivider.y + firstDivider.height + collider.radius - 0.001,
        "a fast upward body must be pushed back below the inter-floor divider"
    );
    const gateGapPosition = new Vector2(
        firstGate.barrier.x + firstGate.barrier.width * 0.5,
        firstDivider.y + firstDivider.height - 4
    );
    const gateGapVelocity = new Vector2(0, -4200);
    collider.resolveSurfaces({
        position: gateGapPosition,
        velocity: gateGapVelocity,
        surfaces: first.surfaces,
        previousPosition: new Vector2(gateGapPosition.x, firstDivider.y + firstDivider.height + 24)
    });
    assert.ok(
        gateGapPosition.y < firstDivider.y + firstDivider.height,
        "the authored Gate opening stays the only gap once its dynamic barrier is removed"
    );
}
