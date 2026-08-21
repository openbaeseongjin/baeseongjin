import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { validateAreaSpecV2 } from "../../src/game/world/area-authoring-v2/AreaSpecV2Validator.js";

const projectRoot = resolve(import.meta.dirname, "../..");
const writeCandidates = process.argv.includes("--write");
const EDITABLE_DOMAINS = ["bounds", "entry", "surfaces", "anchors", "recoveryRoute", "enemySlots", "wind", "camera"];
const READ_ONLY_DOMAINS = ["objectives", "progression", "story", "scanner", "behaviorRegistry"];
const DESIGN_SOURCE_BY_SECTOR = new Map([
    [3, "AREA-SPEC-REV8-DESIGN.json"],
    [4, "AREA-SPEC-REV1-DESIGN.json"],
    [5, "AREA-SPEC-REV4-DESIGN.json"],
    [6, "AREA-SPEC-REV3-DESIGN.json"]
]);

function readJson(path) {
    return JSON.parse(readFileSync(resolve(projectRoot, path), "utf8"));
}

function writeJson(path, value) {
    const target = resolve(projectRoot, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function finitePoint(value) {
    return Number.isFinite(value?.x) && Number.isFinite(value?.y);
}

function asPoint(value) {
    if (finitePoint(value)) return { x: value.x, y: value.y };
    if (Number.isFinite(value?.x) && Number.isFinite(value?.topY)) return { x: value.x, y: value.topY };
    if (Number.isFinite(value?.cx) && Number.isFinite(value?.topY)) return { x: value.cx, y: value.topY };
    if (finitePoint(value?.position)) return { x: value.position.x, y: value.position.y };
    if (finitePoint(value?.center)) return { x: value.center.x, y: value.center.y };
    return null;
}

function collectPoints(value, result = []) {
    if (Array.isArray(value)) {
        for (const entry of value) collectPoints(entry, result);
        return result;
    }
    if (!value || typeof value !== "object") return result;
    const point = asPoint(value);
    if (point) result.push(point);
    for (const [key, entry] of Object.entries(value)) {
        if (["x", "y", "position", "center"].includes(key)) continue;
        collectPoints(entry, result);
    }
    return result;
}

function inferredBounds(raw) {
    const explicit = raw.bounds ?? raw.stage?.bounds;
    const points = collectPoints({
        entry: raw.entry,
        targets: raw.grappleTargets,
        route: raw.route,
        mainRoute: raw.mainRoute,
        mandatoryRoute: raw.mandatoryRoute,
        surfaces: raw.surfaces,
        recovery: raw.recovery,
        enemies: raw.enemies,
        enemySlots: raw.enemySlots,
        enemy: raw.enemy
    });
    const maxX = Math.max(128, ...points.map(({ x }) => Math.abs(x)));
    const maxY = Math.max(128, ...points.map(({ y }) => Math.abs(y)));
    const inferred = {
        width: Math.ceil((maxX * 2 + 256) / 32) * 32,
        height: Math.ceil((maxY + 256) / 32) * 32
    };
    if (!Number.isFinite(explicit?.width) || !Number.isFinite(explicit?.height)) {
        return { ...inferred, provenance: "inferred-editor-viewport" };
    }
    const width = Math.max(explicit.width, inferred.width);
    const height = Math.max(explicit.height, inferred.height);
    return {
        width,
        height,
        provenance: width === explicit.width && height === explicit.height ? "authored" : "expanded-for-authored-points"
    };
}

function sourceStage(raw, sector, stage) {
    const source = raw.stage ?? {};
    const sourceAreaId =
        source.sourceAreaId ??
        raw.areaId ??
        `sector-${String(sector).padStart(2, "0")}-${String(stage).padStart(2, "0")}`;
    const stageId = `${sector}-${stage}`;
    return {
        stageId,
        stage: {
            sector,
            stage,
            legacyStageAlias: source.legacyStageAlias ?? stageId,
            sourceAreaId
        },
        name: source.name ?? source.canonicalName ?? raw.name ?? `STAGE ${stageId}`,
        subtitle: source.subtitle ?? source.signature ?? raw.subtitle ?? "SCENARIO MAP DESIGN"
    };
}

function sourceTargetPoints(raw) {
    const map = new Map();
    for (const target of raw.grappleTargets ?? []) {
        const point = asPoint(target);
        if (typeof target?.id === "string" && point) map.set(target.id, point);
    }
    for (const routePoint of raw.mandatoryRoute ?? []) {
        const point = asPoint(routePoint);
        if (typeof routePoint?.id === "string" && point) map.set(routePoint.id, point);
    }
    const entry = asPoint(raw.entry);
    if (entry) map.set(raw.entry?.id ?? "entry", entry);
    return map;
}

function routePointEntries(raw, sourceAreaId) {
    const pointsById = sourceTargetPoints(raw);
    const rawRoutes = [raw.mandatoryRoute, raw.mainRoute, raw.route].filter(Boolean);
    const candidates = [];
    for (const route of rawRoutes) {
        if (Array.isArray(route)) candidates.push(...route);
        else if (route && typeof route === "object")
            candidates.push(...Object.values(route).flatMap((value) => (Array.isArray(value) ? value : [])));
    }
    const result = [];
    for (const candidate of candidates) {
        const point =
            typeof candidate === "string"
                ? pointsById.get(candidate)
                : (asPoint(candidate) ?? pointsById.get(candidate?.id));
        if (!point) continue;
        const id = typeof candidate === "string" ? candidate : (candidate.id ?? `point-${result.length + 1}`);
        result.push({ id: `${sourceAreaId}:route-${id}`, x: point.x, y: point.y, sourceId: id });
    }
    if (result.length > 0) return result;
    return [...pointsById.entries()].map(([id, point]) => ({
        id: `${sourceAreaId}:route-${id}`,
        ...point,
        sourceId: id
    }));
}

function surfaceEntries(raw, sourceAreaId) {
    return (raw.surfaces ?? [])
        .map((surface, index) => {
            const point = asPoint(surface);
            if (!point) return null;
            const width = Number.isFinite(surface.width) && surface.width > 0 ? surface.width : 128;
            const height = Number.isFinite(surface.height) && surface.height > 0 ? surface.height : 32;
            const id = surface.id ?? `${sourceAreaId}:surface-${index + 1}`;
            return {
                id,
                kind: surface.kind ?? "scenario-surface",
                oneWay: surface.oneWay ?? true,
                grappleable: surface.grappleable ?? surface.properties?.grappleable ?? true,
                coordinateAnchor: "top-center",
                position: point,
                vertices: [
                    { x: point.x - width * 0.5, y: point.y },
                    { x: point.x + width * 0.5, y: point.y },
                    { x: point.x + width * 0.5, y: point.y + height },
                    { x: point.x - width * 0.5, y: point.y + height }
                ],
                ...Object.fromEntries(
                    Object.entries(surface.properties ?? {}).filter(
                        ([key]) => !["id", "kind", "position", "vertices"].includes(key)
                    )
                ),
                sourceId: surface.id ?? null
            };
        })
        .filter(Boolean);
}

function anchorEntries(raw) {
    const seen = new Set();
    return (raw.grappleTargets ?? [])
        .map((target, index) => {
            const point = asPoint(target);
            const id = target?.id ?? `anchor-${index + 1}`;
            if (!point || seen.has(id)) return null;
            seen.add(id);
            return {
                target: { id: `${id}-surface`, ...point, properties: { sourceId: id } },
                landmark: {
                    id,
                    ...point,
                    properties: { label: target.label ?? id, coordinateAnchor: "center", sourceId: id }
                }
            };
        })
        .filter(Boolean);
}

function recoveryEntries(raw, sourceAreaId) {
    const recovery = [
        ...(raw.recoveryPoints ?? raw.recovery ?? []),
        ...(raw.surfaces ?? []).filter((surface) => surface?.kind === "recovery")
    ];
    const seen = new Set();
    return recovery
        .map((entry, index) => {
            const point = asPoint(entry);
            if (!point) return null;
            const id = entry.id ?? `recovery-${index + 1}`;
            if (seen.has(id)) return null;
            seen.add(id);
            return { id: `${sourceAreaId}:recovery-${id}`, ...point, sourceId: id };
        })
        .filter(Boolean);
}

function enemyEntries(raw, sourceAreaId) {
    const source = raw.enemies ?? raw.enemySlots ?? (raw.enemy ? [raw.enemy] : []);
    return source
        .map((entry, index) => {
            const point = asPoint(entry) ?? asPoint(entry?.patrol?.points?.[0]);
            if (!point || typeof entry?.enemyType !== "string") return null;
            return {
                id: entry.id ?? entry.designId ?? `${sourceAreaId}:enemy-${index + 1}`,
                kind: "scenario-enemy-slot",
                enemyType: entry.enemyType,
                position: point,
                coordinateAnchor: "center",
                sourceId: entry.id ?? entry.designId ?? null
            };
        })
        .filter(Boolean);
}

function windEntries(raw) {
    return (raw.windZones ?? []).filter(
        (zone) =>
            Number.isFinite(zone?.strength) &&
            finitePoint(zone?.direction) &&
            zone?.bounds &&
            Number.isFinite(zone.bounds.x) &&
            Number.isFinite(zone.bounds.y) &&
            Number.isFinite(zone.bounds.width) &&
            Number.isFinite(zone.bounds.height)
    );
}

function cameraEntries(raw) {
    return (raw.camera?.zones ?? []).filter(
        (zone) => Number.isFinite(zone?.minY) && Number.isFinite(zone?.maxY) && Number.isFinite(zone?.desktopZoom)
    );
}

function scenarioSpec({ raw, sourcePath, sector, stage }) {
    const identity = sourceStage(raw, sector, stage);
    const bounds = inferredBounds(raw);
    const entryPoint = asPoint(raw.entry) ?? { x: 0, y: -32 };
    const routePoints = routePointEntries(raw, identity.stage.sourceAreaId);
    const exitPoint = routePoints.at(-1) ?? entryPoint;
    const definition = {
        id: identity.stage.sourceAreaId,
        sectorId: `sector-${String(sector).padStart(2, "0")}`,
        order: stage,
        name: identity.name,
        subtitle: identity.subtitle,
        bounds: { width: bounds.width, height: bounds.height },
        entry: { id: `${identity.stage.sourceAreaId}:entry`, ...entryPoint },
        exit: { id: `${identity.stage.sourceAreaId}:scenario-exit`, x: exitPoint.x, y: exitPoint.y },
        nextAreaId: null,
        surfaces: surfaceEntries(raw, identity.stage.sourceAreaId),
        routePoints,
        recoveryPoints: recoveryEntries(raw, identity.stage.sourceAreaId),
        checkpoints: [],
        objects: enemyEntries(raw, identity.stage.sourceAreaId),
        objectives: Array.isArray(raw.objectives) ? raw.objectives : [],
        windZones: windEntries(raw),
        scannerGroups: Array.isArray(raw.scannerGroups) ? raw.scannerGroups : [],
        storyTriggers: Array.isArray(raw.story?.planningTriggers) ? raw.story.planningTriggers : [],
        routes: [],
        cameraZones: cameraEntries(raw),
        cueIds: []
    };
    return {
        schemaVersion: "area-spec-v2",
        authoringMode: "scenario",
        stage: identity.stage,
        editor: { editableDomains: EDITABLE_DOMAINS, readOnlyDomains: READ_ONLY_DOMAINS },
        definition,
        anchors: anchorEntries(raw),
        behaviorRefs: [],
        scenario: {
            status: "scenario-only",
            sourcePath,
            sourceSchemaVersion: raw.schemaVersion,
            boundsProvenance: bounds.provenance,
            sourceSnapshot: raw
        }
    };
}

function stageEntries() {
    return [...DESIGN_SOURCE_BY_SECTOR.entries()].flatMap(([sector, fileName]) =>
        Array.from({ length: 8 }, (_, stage) => {
            const stageId = `${sector}-${stage + 1}`;
            const sourcePath = `docs/bsh/scenario/${sector}/${stageId}/${fileName}`;
            const outputPath = `docs/bsh/scenario/${sector}/${stageId}/AREA-SPEC.v2.json`;
            return { sector, stage: stage + 1, stageId, sourcePath, outputPath };
        })
    );
}

function sourceHash(raw) {
    return createHash("sha256").update(JSON.stringify(raw)).digest("hex");
}

const editorCatalog = {
    schemaVersion: "area-editor-catalog-v2",
    stages: [
        ...Array.from({ length: 8 }, (_, index) => ({
            stageId: `1-${index + 1}`,
            areaId: `sector-01-${String(index + 1).padStart(2, "0")}`,
            authoringMode: "runtime-generated",
            sourcePath: `docs/bsh/scenario/1/1-${index + 1}/AREA-SPEC.v2.json`,
            manifestPath: "docs/bsh/scenario/AREA-CATALOG.json"
        })),
        ...Array.from({ length: 8 }, (_, index) => ({
            stageId: `2-${index + 1}`,
            areaId: `sector-02-${String(index + 1).padStart(2, "0")}`,
            authoringMode: "runtime-staged",
            sourcePath: `docs/bsh/scenario/2/2-${index + 1}/AREA-SPEC.v2.json`,
            manifestPath: "docs/bsh/scenario/AREA-CATALOG.sector02.json"
        }))
    ]
};

for (const entry of stageEntries()) {
    if (!existsSync(resolve(projectRoot, entry.sourcePath))) {
        throw new Error(`scenario-source-missing:${entry.sourcePath}`);
    }
    const raw = readJson(entry.sourcePath);
    const spec = scenarioSpec({ raw, ...entry });
    const validation = validateAreaSpecV2(spec, { file: entry.outputPath });
    if (!validation.valid) {
        throw new Error(`scenario-v2-invalid:${entry.stageId}:${validation.issues.map(({ code }) => code).join(",")}`);
    }
    if (writeCandidates) writeJson(entry.outputPath, spec);
    editorCatalog.stages.push({
        stageId: entry.stageId,
        areaId: spec.definition.id,
        authoringMode: "scenario-only",
        sourcePath: entry.outputPath,
        sourcePathHash: sourceHash(raw),
        designSourcePath: entry.sourcePath
    });
}

if (writeCandidates) {
    writeJson("docs/bsh/scenario/AREA-EDITOR-CATALOG.json", editorCatalog);
    console.log(`Wrote ${stageEntries().length} scenario v2 sources and AREA-EDITOR-CATALOG.json`);
}
