import assert from "node:assert/strict";
import { validateAreaCatalog } from "../src/game/world/AreaDefinitionValidator.js";
import { SECTOR_01_AREA_CATALOG } from "../src/game/world/areas/sector01/Sector01AreaCatalog.js";

function mutableCatalog() {
    return structuredClone(SECTOR_01_AREA_CATALOG);
}

export function run() {
    const valid = validateAreaCatalog(SECTOR_01_AREA_CATALOG);
    assert.deepEqual(valid, { valid: true, issues: [] });

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
}
