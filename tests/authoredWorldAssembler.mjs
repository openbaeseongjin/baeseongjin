import assert from "node:assert/strict";
import { Vector2 } from "../src/game-kit/index.js";
import { CircleCollider } from "../src/game/physics/colliders/CircleCollider.js";
import { assembleAuthoredWorld } from "../src/game/world/AuthoredWorldAssembler.js";
import { validateAreaCatalog } from "../src/game/world/AreaDefinitionValidator.js";
import { gatePortalBounds, resolveObjectTriggerBounds, worldObject } from "../src/game/world/areas/AreaDefinition.js";
import { CURRENT_AUTHORED_AREA_CATALOG } from "../src/game/world/areas/CurrentAuthoredAreaCatalog.js";
import { SECTOR_01_AREA_CATALOG } from "../src/game/world/areas/sector01/Sector01AreaCatalog.js";
import { SECTOR_02_AREA_CATALOG } from "../src/game/world/areas/sector02/Sector02AreaCatalog.js";
import { SECTOR_03_AREA_CATALOG } from "../src/game/world/areas/sector03/Sector03AreaCatalog.js";
import { SECTOR_04_AREA_CATALOG } from "../src/game/world/areas/sector04/Sector04AreaCatalog.js";
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

    for (const area of SECTOR_01_AREA_CATALOG.areas) {
        const grappleTargets = area.surfaces.filter(({ kind }) => kind === "grapple-target");
        const grappleLandmarks = area.objects.filter(({ kind }) => kind === "grapple-landmark");
        assert.equal(
            grappleLandmarks.length,
            grappleTargets.length,
            `${area.id} must render one landmark for every hidden grapple target`
        );
        for (const surface of grappleTargets) {
            const expectedLandmarkId = surface.id.replace(/-surface$/, "");
            const landmark = grappleLandmarks.find(({ id }) => id === expectedLandmarkId);
            assert.ok(landmark, `${surface.id} must expose ${expectedLandmarkId} as a visible landmark`);
            assert.deepEqual(
                landmark.position,
                surface.position,
                `${surface.id} and ${expectedLandmarkId} must share the same authored anchor point`
            );
            assert.equal(landmark.coordinateAnchor, "center");
        }
    }

    const approvedWindBounds = {
        "sector-01-06:fan-a-wind": { x: -320, y: -640, width: 672, height: 320 },
        "sector-01-06:fan-b-wind": { x: -352, y: -1280, width: 704, height: 384 },
        "sector-01-07:main-pressure-vent-wind": { x: -352, y: -1184, width: 704, height: 384 },
        "sector-01-08:final-pulsed-vent": { x: -384, y: -1504, width: 768, height: 448 }
    };
    for (const area of SECTOR_01_AREA_CATALOG.areas) {
        for (const source of area.objects.filter(({ kind, zone }) => kind === "wind-source" && zone)) {
            const approved = approvedWindBounds[source.windZoneId];
            assert.ok(approved, `${source.id} must reference an approved wind zone`);
            assert.deepEqual(
                resolveObjectTriggerBounds(source.position, source.zone),
                approved,
                `${source.id} derived wind zone bounds must stay on the approved blockout`
            );
        }
    }

    const missingLandmarkCatalog = structuredClone(SECTOR_01_AREA_CATALOG);
    missingLandmarkCatalog.areas[0].objects = missingLandmarkCatalog.areas[0].objects.filter(
        ({ id }) => id !== "sector-01-01:anchor-a"
    );
    assert.ok(
        validateAreaCatalog(missingLandmarkCatalog).issues.some(
            ({ areaId, code, id, landmarkId }) =>
                areaId === "sector-01-01" &&
                code === "grapple-landmark-missing" &&
                id === "sector-01-01:anchor-a-surface" &&
                landmarkId === "sector-01-01:anchor-a"
        ),
        "catalog validation must reject hidden grapple targets without a visible landmark"
    );

    const misplacedLandmarkCatalog = structuredClone(SECTOR_01_AREA_CATALOG);
    const misplacedLandmark = misplacedLandmarkCatalog.areas[0].objects.find(
        ({ id }) => id === "sector-01-01:anchor-a"
    );
    misplacedLandmark.position.x += 1;
    assert.ok(
        validateAreaCatalog(misplacedLandmarkCatalog).issues.some(
            ({ areaId, code, id, surfaceId }) =>
                areaId === "sector-01-01" &&
                code === "grapple-landmark-position" &&
                id === "sector-01-01:anchor-a" &&
                surfaceId === "sector-01-01:anchor-a-surface"
        ),
        "catalog validation must reject landmarks that do not cover their grapple target"
    );

    const missingTargetCatalog = structuredClone(SECTOR_01_AREA_CATALOG);
    missingTargetCatalog.areas[0].surfaces = missingTargetCatalog.areas[0].surfaces.filter(
        ({ id }) => id !== "sector-01-01:anchor-a-surface"
    );
    assert.ok(
        validateAreaCatalog(missingTargetCatalog).issues.some(
            ({ areaId, code, id, surfaceId }) =>
                areaId === "sector-01-01" &&
                code === "grapple-target-missing" &&
                id === "sector-01-01:anchor-a" &&
                surfaceId === "sector-01-01:anchor-a-surface"
        ),
        "catalog validation must reject visible grapple landmarks without a target surface"
    );

    assert.deepEqual(first, second, "the same catalog and composition options must produce the same world");
    assert.equal(JSON.stringify(SECTOR_01_AREA_CATALOG), before, "assembly must not mutate authored definitions");
    assert.equal(first.definitionId, "sector-01-authored-mock");
    assert.equal(first.areas.length, 8);
    assert.equal(first.gates.length, 8);
    assert.equal(first.checkpoints.length, 9);
    assert.ok(first.surfaces.length > first.route.length);
    assert.ok(first.surfaces.every((surface) => Object.isFrozen(surface)));
    assert.ok(first.objects.every((object) => first.areas.some(({ id }) => id === object.areaId)));
    assert.equal(
        first.surfaces.filter(({ kind }) => kind === "inter-floor-divider").length,
        first.areas.length,
        "each authored floor boundary must stay a fully sealed solid band so no hole opens to the previous floor"
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
    for (const catalog of [
        SECTOR_01_AREA_CATALOG,
        SECTOR_02_AREA_CATALOG,
        SECTOR_03_AREA_CATALOG,
        SECTOR_04_AREA_CATALOG,
        CURRENT_AUTHORED_AREA_CATALOG
    ]) {
        for (const area of catalog.areas.filter(({ gate }) => gate.nextAreaId !== null)) {
            const linked = area.objects.filter(({ gateId }) => gateId === area.gate.id);
            const portalObject =
                linked.find(({ kind }) => kind === "gate") ?? linked.find(({ kind }) => kind !== "gate-panel");
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
                    : surface.kind === "sealed-door" ||
                        ((surface.kind === "cover" || surface.kind === "solid") && height > width)
                      ? "bottom-center"
                      : "top-center";
            assert.equal(
                surface.coordinateAnchor,
                expectedAnchor,
                `${surface.id} must use the coordinate anchor that matches how the surface is mounted`
            );
        }
    }
    const firstPlatform = SECTOR_01_AREA_CATALOG.areas[0].surfaces.find(({ id }) => id.endsWith(":exit-deck"));
    assert.deepEqual(firstPlatform.position, { x: 128, y: -835 });
    assert.deepEqual(firstPlatform.vertices[0], { x: -32, y: -835 });
    assert.deepEqual(firstPlatform.vertices[1], { x: 288, y: -835 });
    assert.equal(
        first.surfaces.find(({ id }) => id === firstPlatform.id).position.y,
        firstPlatform.position.y + 320,
        "assembly must translate the authored platform anchor together with its vertices"
    );
    const secondAreaDefinition = SECTOR_01_AREA_CATALOG.areas.find(({ id }) => id === "sector-01-02");
    assert.deepEqual(
        Object.fromEntries(
            secondAreaDefinition.surfaces
                .filter(({ id }) => /:(p[0-3]|crossbeam-x1|exit-deck)$/.test(id))
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
            "exit-deck": { x: 64, y: -963, width: 288, height: 32, grappleable: true }
        },
        "1-2 gameplay surfaces must stay aligned with the REV 3.1 approved blockout"
    );
    assert.deepEqual(
        secondAreaDefinition.objects
            .filter(({ id }) => /:(maintenance-lift|anchor-[a-d]|exit-gate|exit-panel)$/.test(id))
            .map(({ id, position, coordinateAnchor }) => ({
                id: id.split(":").at(-1),
                position,
                coordinateAnchor
            })),
        [
            { id: "maintenance-lift", position: { x: 0, y: -544 }, coordinateAnchor: "center" },
            { id: "anchor-a", position: { x: -128, y: -192 }, coordinateAnchor: "center" },
            { id: "anchor-c", position: { x: -160, y: -640 }, coordinateAnchor: "center" },
            { id: "exit-gate", position: { x: 320, y: -963 }, coordinateAnchor: "bottom-center" },
            { id: "exit-panel", position: { x: 208, y: -963 }, coordinateAnchor: "bottom-center" }
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
    assert.deepEqual(thirdSentry.activationSpec, {
        anchor: "center",
        offset: { x: -416, y: -16 },
        size: { width: 960, height: 544 }
    });
    assert.deepEqual(thirdSentry.rules, ["standard-projectile", "no-rope-cut", "cover-ends-los"]);

    const movedCatalog = structuredClone(SECTOR_01_AREA_CATALOG);
    const movedSentry = movedCatalog.areas[2].objects.find(({ id }) => id === "sector-01-03:sentry-turret-01");
    const movedWorld = assembleAuthoredWorld(movedCatalog, { seed: 9182, floorY: 320 });
    const originalSpawn = movedWorld.enemySpawns.find(({ objectId }) => objectId === "sector-01-03:sentry-turret-01");
    movedSentry.position = Object.freeze({ x: movedSentry.position.x + 64, y: movedSentry.position.y - 32 });
    const shiftedWorld = assembleAuthoredWorld(movedCatalog, { seed: 9182, floorY: 320 });
    const shiftedSpawn = shiftedWorld.enemySpawns.find(({ objectId }) => objectId === "sector-01-03:sentry-turret-01");
    assert.deepEqual(
        shiftedSpawn.activation,
        { x: originalSpawn.activation.x + 64, y: originalSpawn.activation.y - 32, width: 960, height: 544 },
        "moving an authored object must move its derived activation trigger with it"
    );
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
            Math.abs(gatePanel.position.x - (gate.trigger.x + gate.trigger.width * 0.5)) <= 160,
            `${area.id} Gate panel must remain visibly adjacent to the door`
        );
        assert.equal(dividers.length, 1);
        assert.equal(sideWalls.length, 2);
        assert.equal(sideWalls[0].x, area.bounds.x);
        assert.equal(sideWalls[1].x + sideWalls[1].width, area.bounds.x + area.bounds.width);
        assert.equal(dividers[0].x, area.bounds.x);
        assert.equal(dividers[0].x + dividers[0].width, area.bounds.x + area.bounds.width);
        assert.ok(dividers.every(({ collision, grappleable, renderable }) => collision && !grappleable && !renderable));
    }

    const firstArea = first.areas[0];
    const firstGate = first.gates[0];
    const firstDivider = first.surfaces.find(
        ({ areaId, id }) => areaId === firstArea.id && id.endsWith("inter-floor-divider-full")
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
    const doorPosition = new Vector2(
        firstGate.trigger.x + firstGate.trigger.width * 0.5,
        firstDivider.y + firstDivider.height - 4
    );
    const doorVelocity = new Vector2(0, -4200);
    collider.resolveSurfaces({
        position: doorPosition,
        velocity: doorVelocity,
        surfaces: first.surfaces,
        previousPosition: new Vector2(doorPosition.x, firstDivider.y + firstDivider.height + 24)
    });
    assert.ok(
        doorPosition.y >= firstDivider.y + firstDivider.height + collider.radius - 0.001,
        "the fully sealed floor must block upward bodies above the Gate without any dynamic barrier"
    );
}
