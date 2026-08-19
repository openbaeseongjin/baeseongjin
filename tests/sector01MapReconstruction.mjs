import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { SECTOR_01_AREA_CATALOG } from "../src/game/world/areas/sector01/Sector01AreaCatalog.js";
import { createLegacyAreaSeamlessSectorRuntimeWorld } from "../src/game/world/sectors/LegacyAreaSeamlessSectorRuntime.js";

const ROOT = resolve(fileURLToPath(import.meta.url), "../..");

function previewRoute(stageAlias) {
    const html = readFileSync(resolve(ROOT, `docs/bsh/scenario/1/${stageAlias}/MAP-PREVIEW.html`), "utf8");
    const path = html.match(/<path\b[^>]*class="(?:route|flow)"[^>]*d="([^"]+)"/)?.[1];
    assert.ok(path, `${stageAlias} MAP-PREVIEW must declare its primary route path`);
    const points = [];
    const commands = /([MQL])\s*(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)(?:\s+(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?))?/g;
    for (const match of path.matchAll(commands)) {
        points.push(
            match[1] === "Q"
                ? { x: Number(match[4]), y: Number(match[5]) }
                : { x: Number(match[2]), y: Number(match[3]) }
        );
    }
    return points;
}

const AREA01_ANCHORS = Object.freeze([
    ["a", -128, -192],
    ["c", -96, -736]
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
    const seamlessWorld = createLegacyAreaSeamlessSectorRuntimeWorld({ seed: 9182, floorY: 560 });
    for (const area of SECTOR_01_AREA_CATALOG.areas) {
        const stageAlias = area.id.replace("sector-01-0", "1-");
        assert.deepEqual(
            area.routePoints.map(({ x, y }) => ({ x, y })),
            previewRoute(stageAlias),
            `${stageAlias} Runtime route must follow MAP-PREVIEW.html instead of a reduced legacy path`
        );
        const landmark = seamlessWorld.landmarks.find(({ legacyAreaId }) => legacyAreaId === area.id);
        assert.ok(landmark, `${stageAlias} must be compiled into the seamless Runtime`);
        assert.deepEqual(
            seamlessWorld.route
                .filter(({ landmarkId }) => landmarkId === landmark.id)
                .map(({ x, width, topY }) => ({
                    x: x + width * 0.5 - landmark.origin.x,
                    y: topY - landmark.origin.y
                })),
            previewRoute(stageAlias),
            `${stageAlias} seamless Runtime must preserve the MAP-PREVIEW core flow`
        );
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
