import assert from "node:assert/strict";
import { SECTOR_01_AREA_CATALOG } from "../src/game/world/areas/sector01/Sector01AreaCatalog.js";

// This test originally hardcoded the pre-REV8 43-anchor blockout's coordinates for all 8 Stages
// (PR #703/704). Stages 1-2 through 1-8 were subsequently rewritten against their approved REV8
// packages (see docs/scenario-development-integration.md entries #74-83), which redesigned each
// Stage's landmark set/positions/route shape - the old hardcoded table no longer describes the
// approved content for those Stages and duplicating REV8's coordinates here would just create a
// second copy to drift out of sync with Sector01AreaCatalog.js (the actual authority) and each
// Stage's own PRODUCTION-ALIGNMENT.md. Only 1-1 (never touched by the REV8 batch) still matches
// the original table, so it's kept as a real regression; the other Stages verify structural
// invariants instead of specific coordinates.

const AREA01_ANCHORS = Object.freeze([
    ["a", -96, -192],
    ["b", 160, -448],
    ["c", -64, -704]
]);

function anchorPosition(area, kind, anchorId) {
    const id = `${area.id}:anchor-${anchorId}${kind === "surface" ? "-surface" : ""}`;
    const source =
        kind === "surface"
            ? area.surfaces.find((surface) => surface.id === id)
            : area.objects.find((object) => object.id === id);
    return source?.position ?? null;
}

export function run() {
    const area01 = SECTOR_01_AREA_CATALOG.areas.find(({ id }) => id === "sector-01-01");
    const plannedRouteIds = AREA01_ANCHORS.map(([id]) => `${area01.id}:route-${id}`);
    const actualRouteIds = area01.routePoints.map(({ id }) => id).filter((id) => plannedRouteIds.includes(id));
    assert.deepEqual(actualRouteIds, plannedRouteIds, "1-1 must preserve the authored Anchor order");
    for (const [id, x, y] of AREA01_ANCHORS) {
        assert.deepEqual(anchorPosition(area01, "surface", id), { x, y }, `1-1 Anchor ${id} target drift`);
        assert.deepEqual(anchorPosition(area01, "object", id), { x, y }, `1-1 Anchor ${id} visual drift`);
        const routePoint = area01.routePoints.find((point) => point.id === `${area01.id}:route-${id}`);
        assert.deepEqual(
            routePoint && { x: routePoint.x, y: routePoint.y, landmark: routePoint.landmark },
            { x, y, landmark: id.toUpperCase() },
            `1-1 Anchor ${id} route drift`
        );
    }

    // Structural invariants that still apply to every Stage regardless of REV8 content: every
    // labeled landmark must have both a real (collidable/renderable) grapple target and a matching
    // visible grapple-landmark object at the same position as its route point, and route entries must
    // be uniquely ordered (no duplicate ids).
    for (const area of SECTOR_01_AREA_CATALOG.areas) {
        const landmarkPoints = area.routePoints.filter(({ landmark }) => landmark);
        for (const point of landmarkPoints) {
            const anchorId = point.id.split(":route-").at(-1);
            const surfacePosition = anchorPosition(area, "surface", anchorId);
            const objectPosition = anchorPosition(area, "object", anchorId);
            assert.ok(surfacePosition, `${area.id} labeled landmark ${anchorId} must have a real grapple target`);
            assert.ok(objectPosition, `${area.id} labeled landmark ${anchorId} must have a visible landmark object`);
            assert.deepEqual(
                surfacePosition,
                { x: point.x, y: point.y },
                `${area.id} landmark ${anchorId} target must match its route point`
            );
            assert.deepEqual(
                objectPosition,
                { x: point.x, y: point.y },
                `${area.id} landmark ${anchorId} visual must match its route point`
            );
        }
        const routeIds = area.routePoints.map(({ id }) => id);
        assert.equal(new Set(routeIds).size, routeIds.length, `${area.id} route points must have unique ids`);
    }
}
