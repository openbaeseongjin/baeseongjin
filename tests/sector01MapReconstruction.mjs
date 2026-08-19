import assert from "node:assert/strict";
import { SECTOR_01_AREA_CATALOG } from "../src/game/world/areas/sector01/Sector01AreaCatalog.js";

const EXPECTED_ANCHORS = Object.freeze({
    "sector-01-01": Object.freeze([
        ["a", -96, -192],
        ["b", 160, -448],
        ["c", -64, -704]
    ]),
    "sector-01-02": Object.freeze([
        ["a", -128, -192],
        ["b", 160, -416],
        ["c", -160, -640],
        ["d", 128, -864]
    ]),
    "sector-01-03": Object.freeze([
        ["a", 64, -224],
        ["b", 64, -480],
        ["c", -192, -736],
        ["d", 96, -960]
    ]),
    "sector-01-04": Object.freeze([
        ["a", 192, -320],
        ["b", -96, -448],
        ["c", 160, -560]
    ]),
    "sector-01-05": Object.freeze([
        ["a", -160, -224],
        ["b", 224, -384],
        ["c", -160, -544],
        ["d", 64, -640],
        ["e", 224, -752],
        ["f", -128, -896],
        ["g", 32, -1040],
        ["h", -128, -1168]
    ]),
    "sector-01-06": Object.freeze([
        ["a", -128, -224],
        ["b", 96, -416],
        ["c", -224, -640],
        ["d", -160, -896],
        ["e", 192, -1088],
        ["f", -32, -1280]
    ]),
    "sector-01-07": Object.freeze([
        ["a", -128, -224],
        ["b", 160, -416],
        ["c", 224, -608],
        ["d", -192, -832],
        ["e", 224, -1056],
        ["f", -32, -1216],
        ["g", 128, -1376]
    ]),
    "sector-01-08": Object.freeze([
        ["a", -160, -224],
        ["b", 192, -416],
        ["c", -192, -608],
        ["d", -96, -768],
        ["e", 128, -944],
        ["f", -160, -1152],
        ["g", 224, -1344],
        ["h", -32, -1504]
    ])
});

function anchorPosition(area, kind, anchorId) {
    const id = `${area.id}:anchor-${anchorId}${kind === "surface" ? "-surface" : ""}`;
    const source =
        kind === "surface"
            ? area.surfaces.find((surface) => surface.id === id)
            : area.objects.find((object) => object.id === id);
    return source?.position ?? null;
}

export function run() {
    let gameplayAnchorCount = 0;
    for (const area of SECTOR_01_AREA_CATALOG.areas) {
        const expected = EXPECTED_ANCHORS[area.id];
        assert.ok(expected, `missing planned anchor contract for ${area.id}`);
        gameplayAnchorCount += expected.length;
        const plannedRouteIds = expected.map(([id]) => `${area.id}:route-${id}`);
        const actualRouteIds = area.routePoints.map(({ id }) => id).filter((id) => plannedRouteIds.includes(id));
        assert.deepEqual(actualRouteIds, plannedRouteIds, `${area.id} must preserve the authored Anchor order`);

        for (const [id, x, y] of expected) {
            assert.deepEqual(anchorPosition(area, "surface", id), { x, y }, `${area.id} Anchor ${id} target drift`);
            assert.deepEqual(anchorPosition(area, "object", id), { x, y }, `${area.id} Anchor ${id} visual drift`);
            const routePoint = area.routePoints.find((point) => point.id === `${area.id}:route-${id}`);
            assert.deepEqual(
                routePoint && { x: routePoint.x, y: routePoint.y, landmark: routePoint.landmark },
                { x, y, landmark: id.toUpperCase() },
                `${area.id} Anchor ${id} route drift`
            );
        }

        for (let index = 1; index < area.routePoints.length; index += 1) {
            const previous = area.routePoints[index - 1];
            const current = area.routePoints[index];
            assert.ok(
                Math.hypot(current.x - previous.x, current.y - previous.y) <= 600,
                `${area.id} route ${previous.id} → ${current.id} exceeds the approved traversal budget`
            );
        }
    }
    assert.equal(gameplayAnchorCount, 43);
}
