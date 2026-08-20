import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { SECTOR_01_AREA_CATALOG } from "../../src/game/world/areas/sector01/Sector01AreaCatalog.js";
import { validateAreaSpecV2 } from "../../src/game/world/area-authoring-v2/AreaSpecV2Validator.js";

const projectRoot = resolve(import.meta.dirname, "../..");
const writeCandidates = process.argv.includes("--write");
const editableDomains = ["bounds", "entry", "surfaces", "anchors", "recoveryRoute", "enemySlots", "wind", "camera"];
const readOnlyDomains = ["objectives", "progression", "story", "scanner", "behaviorRegistry"];
const selectedStages = [
    { stageId: "1-1", areaId: "sector-01-01", outputPath: "docs/bsh/scenario/1/1-1/AREA-SPEC.v2.json" },
    { stageId: "1-7", areaId: "sector-01-07", outputPath: "docs/bsh/scenario/1/1-7/AREA-SPEC.v2.json" }
];

function toAnchor(area, landmark) {
    const { id, kind, position, coordinateAnchor, ...properties } = landmark;
    const target = area.surfaces.find(
        (surface) =>
            surface.kind === "grapple-target" && surface.position.x === position.x && surface.position.y === position.y
    );

    if (!target) {
        throw new Error(`anchor-target-missing:${area.id}:${landmark.id}`);
    }

    return {
        surfaceIndex: area.surfaces.indexOf(target),
        objectIndex: area.objects.indexOf(landmark),
        target: {
            id: target.id,
            x: target.position.x,
            y: target.position.y,
            properties: {}
        },
        landmark: {
            id,
            x: position.x,
            y: position.y,
            properties: {
                ...properties,
                ...(coordinateAnchor ? { coordinateAnchor } : {})
            }
        }
    };
}

function extractAreaSpec(area, stageId) {
    const [sector, stage] = stageId.split("-").map(Number);
    const anchors = area.objects
        .filter((object) => object.kind === "grapple-landmark")
        .map((landmark) => toAnchor(area, landmark));
    const spec = {
        schemaVersion: "area-spec-v2",
        stage: {
            sector,
            stage,
            legacyStageAlias: stageId,
            sourceAreaId: area.id
        },
        editor: { editableDomains, readOnlyDomains },
        definition: {
            ...area,
            surfaces: area.surfaces.filter((surface) => surface.kind !== "grapple-target"),
            objects: area.objects.filter((object) => object.kind !== "grapple-landmark")
        },
        anchors,
        behaviorRefs: []
    };
    const validation = validateAreaSpecV2(spec, { file: `${stageId}:legacy-extract` });
    if (!validation.valid) {
        throw new Error(`area-spec-v2-invalid:${stageId}:${validation.issues.map((issue) => issue.code).join(",")}`);
    }
    return spec;
}

for (const candidate of selectedStages) {
    const area = SECTOR_01_AREA_CATALOG.areas.find((entry) => entry.id === candidate.areaId);
    if (!area) {
        throw new Error(`legacy-area-missing:${candidate.areaId}`);
    }
    const outputFile = resolve(projectRoot, candidate.outputPath);
    if (existsSync(outputFile) && !writeCandidates) {
        throw new Error(`candidate-exists:${candidate.outputPath}:pass---write-to-replace`);
    }
    if (!writeCandidates) {
        continue;
    }
    mkdirSync(dirname(outputFile), { recursive: true });
    writeFileSync(outputFile, `${JSON.stringify(extractAreaSpec(area, candidate.stageId), null, 2)}\n`, "utf8");
    console.log(`Wrote ${candidate.outputPath}`);
}
