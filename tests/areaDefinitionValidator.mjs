import assert from "node:assert/strict";
import { validateAreaCatalog } from "../src/game/world/AreaDefinitionValidator.js";
import { SECTOR_01_AREA_CATALOG } from "../src/game/world/areas/sector01/Sector01AreaCatalog.js";

function mutableCatalog() {
    return structuredClone(SECTOR_01_AREA_CATALOG);
}

export function run() {
    const valid = validateAreaCatalog(SECTOR_01_AREA_CATALOG);
    assert.deepEqual(valid, { valid: true, issues: [] });
    const startFloor = SECTOR_01_AREA_CATALOG.areas[0].surfaces.find(({ id }) => id === "sector-01-01:p0");
    // REV8.0 package geometry (docs/bsh/scenario/1/1-1/AREA-SPEC.json): P0 is 1184 wide, but the
    // shaft-shell-left/right casing walls sit at +-624 (inner face +-608) - a 16px gap the package
    // itself leaves unwalled on each side. This assertion reflects the package's authored P0 exactly;
    // it does NOT confirm the "no gap" invariant its own name implies. See
    // docs/bsh/scenario/1/1-1/PRODUCTION-ALIGNMENT.md for the flagged package inconsistency.
    assert.deepEqual(
        startFloor.vertices,
        [
            { x: -592, y: 0 },
            { x: 592, y: 0 },
            { x: 592, y: 32 },
            { x: -592, y: 32 }
        ],
        "1-1 P0 must match the REV8.0 authored width (does not fully reach the shaft-shell inner face - known package gap)"
    );
    assert.equal(startFloor.presentationId, "terrain:ground-foundation");

    const tightIsolation = validateAreaCatalog(SECTOR_01_AREA_CATALOG, { maxAttachDistance: 300 });
    assert.ok(
        tightIsolation.issues.some(({ code }) => code === "grapple-surface-isolated"),
        "the grapple connectivity check must reject surfaces outside the hook-reach graph"
    );

    const disconnectedClusters = mutableCatalog();
    const disconnectedArea = disconnectedClusters.areas[0];
    for (const surface of disconnectedArea.surfaces) surface.grappleable = false;
    const surfacesById = new Map(disconnectedArea.surfaces.map((surface) => [surface.id, surface]));
    const landmarksById = new Map(disconnectedArea.objects.map((object) => [object.id, object]));
    for (const [id, position] of [
        ["sector-01-01:anchor-a-surface", { x: -384, y: -864 }],
        ["sector-01-01:anchor-c-surface", { x: 320, y: -96 }]
    ]) {
        surfacesById.get(id).grappleable = true;
        surfacesById.get(id).position = position;
        landmarksById.get(id.slice(0, -"-surface".length)).position = position;
    }
    const pairedSurface = surfacesById.get("sector-01-01:p0");
    pairedSurface.grappleable = true;
    pairedSurface.position = { x: 384, y: -96 };
    pairedSurface.vertices = [
        { x: 352, y: -112 },
        { x: 416, y: -112 },
        { x: 416, y: -80 },
        { x: 352, y: -80 }
    ];
    const disconnectedIssues = validateAreaCatalog(disconnectedClusters, { maxAttachDistance: 100 }).issues;
    assert.ok(
        disconnectedIssues.some(
            ({ code, areaId, id, limit }) =>
                code === "grapple-surface-isolated" &&
                areaId === "sector-01-01" &&
                id === "sector-01-01:anchor-a-surface" &&
                limit === 100
        ),
        "two separated pairs of otherwise reachable surfaces must fail the connectivity check"
    );

    const missingNext = mutableCatalog();
    missingNext.areas[0].nextAreaId = "sector-99-99";
    assert.ok(validateAreaCatalog(missingNext).issues.some(({ code }) => code === "area-next-missing"));

    const missingObjectiveSource = mutableCatalog();
    missingObjectiveSource.areas[0].objectives[0].sourceObjectId = "sector-01-01:missing-terminal";
    assert.ok(
        validateAreaCatalog(missingObjectiveSource).issues.some(({ code }) => code === "objective-source-missing")
    );

    const missingObjectiveRequirement = mutableCatalog();
    missingObjectiveRequirement.areas[1].objectives[1].requiredObjectiveIds = ["sector-01-02:missing-ready"];
    assert.ok(
        validateAreaCatalog(missingObjectiveRequirement).issues.some(
            ({ code }) => code === "objective-requirement-missing"
        )
    );

    const embeddedImage = mutableCatalog();
    embeddedImage.areas[0].objects[0].image = "assets/runtime/objects/service-terminal.png";
    assert.ok(
        validateAreaCatalog(embeddedImage).issues.some(
            ({ code, path }) => code === "presentation-path-embedded" && path.endsWith(".image")
        ),
        "authored map data must not embed graphic asset paths"
    );

    const embeddedAudio = mutableCatalog();
    embeddedAudio.areas[0].cueIds.push("terminal-open.wav");
    assert.ok(
        validateAreaCatalog(embeddedAudio).issues.some(({ code }) => code === "presentation-path-embedded"),
        "authored map data must not embed audio asset paths"
    );

    const invalidPatrol = structuredClone(SECTOR_01_AREA_CATALOG);
    invalidPatrol.areas[0].objects[0].patrol = {
        speed: 40,
        points: [
            { x: 0, y: -100 },
            { x: 2000, y: -100 }
        ]
    };
    assert.ok(validateAreaCatalog(invalidPatrol).issues.some(({ code }) => code === "patrol-activation-missing"));
    assert.ok(validateAreaCatalog(invalidPatrol).issues.some(({ code }) => code === "patrol-point-bounds"));

    const invalidCameraZone = mutableCatalog();
    invalidCameraZone.areas[0].cameraZones[0].desktopZoom = 0;
    assert.ok(validateAreaCatalog(invalidCameraZone).issues.some(({ code }) => code === "camera-zone"));

    const invalidObjectiveDelay = mutableCatalog();
    invalidObjectiveDelay.areas[0].objectives[0].completionDelaySeconds = -1;
    assert.ok(
        validateAreaCatalog(invalidObjectiveDelay).issues.some(({ code }) => code === "objective-completion-delay")
    );
}
