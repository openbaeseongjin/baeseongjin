import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, relative, resolve, sep } from "node:path";
import { validateAreaCatalogManifest } from "../../src/game/world/area-authoring-v2/AreaCatalogManifest.js";
import {
    canonicalizeAreaSpecV2,
    createAreaDefinitionFromV2
} from "../../src/game/world/area-authoring-v2/AreaSpecV2.js";
import { collectGeneratedOutputs } from "../../src/game/world/area-authoring-v2/AreaSpecV2Generator.js";
import { authoredRuntimePromotionBlockers } from "../../src/game/world/area-authoring-v2/AreaRuntimePromotion.js";
import {
    validateAreaSpecEditorMutation,
    validateAreaSpecV2
} from "../../src/game/world/area-authoring-v2/AreaSpecV2Validator.js";
import { synchronizeExitEditorDefinition } from "../../src/game/world/area-authoring-v2/editor/AreaExitEditorComponent.js";
import { synchronizeEntryEditorDefinition } from "../../src/game/world/area-authoring-v2/editor/AreaEntryEditorComponent.js";
import { bossStageDerivedPreview, canonicalizeBossStageSpec } from "../../src/game/boss-authoring/BossStageSpec.js";
import { bossStageGeneratedModule } from "../../src/game/boss-authoring/BossStageSpecGenerator.js";
import {
    validateBossStageEditorMutation,
    validateBossStageSpec
} from "../../src/game/boss-authoring/BossStageSpecValidator.js";
import { createStaticRequestHandler } from "../staticHandler.mjs";

const MAX_BODY_BYTES = 2 * 1024 * 1024;

export class MapEditorAuthoringError extends Error {
    constructor(code, message, { issues = null, latest = null } = {}) {
        super(message);
        this.name = "MapEditorAuthoringError";
        this.code = code;
        if (issues) this.issues = issues;
        if (latest) this.latest = latest;
    }
}

function error(code, message, details) {
    return new MapEditorAuthoringError(code, message, details);
}

function safeProjectPath(projectRoot, relativePath) {
    if (typeof relativePath !== "string" || relativePath.length === 0) {
        throw error("path-invalid", "Map editor path must be a relative file path.");
    }
    const root = resolve(projectRoot);
    const target = resolve(root, relativePath);
    if (target === root || !target.startsWith(`${root}${sep}`)) {
        throw error("path-forbidden", "Map editor path is outside the project root.");
    }
    return target;
}

function stableJson(value, specType = "area") {
    const canonical = specType === "boss-stage" ? canonicalizeBossStageSpec(value) : canonicalizeAreaSpecV2(value);
    return `${JSON.stringify(canonical, null, 2)}\n`;
}

function revisionFor(content) {
    return createHash("sha256").update(content).digest("hex").slice(0, 16);
}

function containsExecutableValue(value) {
    if (typeof value === "function" || typeof value === "symbol" || typeof value === "bigint") return true;
    if (!value || typeof value !== "object") return false;
    return Object.values(value).some((entry) => containsExecutableValue(entry));
}

async function readJson(filePath, code) {
    try {
        return JSON.parse(await readFile(filePath, "utf8"));
    } catch (cause) {
        throw error(code, "Map editor JSON could not be parsed.");
    }
}

async function readText(filePath, code, message) {
    try {
        return await readFile(filePath, "utf8");
    } catch {
        throw error(code, message);
    }
}

function assertStageIdentity(entry, spec) {
    if (entry.specType === "boss-stage") {
        if (spec?.id !== entry.stageId || spec?.specType !== "boss-stage") {
            throw error("stage-identity-invalid", "Map editor Boss Stage identity does not match the catalog.");
        }
        return;
    }
    if (spec?.stage?.id !== entry.stageId || spec?.definition?.id !== entry.areaId) {
        throw error("stage-identity-invalid", "Map editor stage identity does not match the catalog manifest.");
    }
}

function validateSpec(entry, spec) {
    if (containsExecutableValue(spec)) {
        throw error("spec-executable-value", "Map editor specs cannot contain executable values.");
    }
    assertStageIdentity(entry, spec);
    const result =
        entry.specType === "boss-stage"
            ? validateBossStageSpec(spec, { file: entry.sourcePath })
            : validateAreaSpecV2(spec, { file: entry.sourcePath });
    if (!result.valid) {
        throw error("spec-invalid", "Map editor spec validation failed.", { issues: result.issues });
    }
    return entry.specType === "boss-stage" ? canonicalizeBossStageSpec(spec) : canonicalizeAreaSpecV2(spec);
}

function runtimePromotionReadiness(entry, spec) {
    if (entry.specType === "boss-stage") {
        return Object.freeze({ status: "live", blockers: Object.freeze([]) });
    }
    if (entry.authoringMode !== "scenario-only") {
        return Object.freeze({ status: "live", blockers: Object.freeze([]) });
    }

    const blockers = [...authoredRuntimePromotionBlockers(spec)];

    const runtimeCandidate = { ...spec, authoringMode: "runtime" };
    const validation = validateAreaSpecV2(runtimeCandidate, { file: entry.sourcePath });
    for (const issue of validation.issues) {
        if (issue.code === "enemy-type-invalid") blockers.push("enemy-type-unmapped");
        if (issue.code === "runtime-area-build-invalid" && !blockers.includes("gate-not-authored")) {
            blockers.push("runtime-contract-invalid");
        }
    }

    return Object.freeze({
        status: validation.valid && blockers.length === 0 ? "ready" : "blocked",
        blockers: Object.freeze(Object.keys(Object.fromEntries(blockers.map((blocker) => [blocker, true]))))
    });
}

function assertEditableDraft(entry, baselineSpec, candidateSpec) {
    const mutation =
        entry.specType === "boss-stage"
            ? validateBossStageEditorMutation(baselineSpec, candidateSpec, { file: entry.sourcePath })
            : validateAreaSpecEditorMutation(baselineSpec, candidateSpec, { file: entry.sourcePath });
    if (!mutation.valid) {
        throw error("editor-read-only-changed", "Map editor draft modified a read-only stage subtree.", {
            issues: mutation.issues
        });
    }
}

function validateEditableSpec(entry, baselineSpec, candidateSpec) {
    if (entry.specType === "boss-stage") return validateSpec(entry, candidateSpec);
    if (containsExecutableValue(candidateSpec)) {
        throw error("spec-executable-value", "Map editor specs cannot contain executable values.");
    }
    assertStageIdentity(entry, candidateSpec);
    const synchronized = structuredClone(candidateSpec);
    const entrySynchronized = synchronizeEntryEditorDefinition(baselineSpec.definition, synchronized.definition);
    return validateSpec(entry, {
        ...synchronized,
        definition: synchronizeExitEditorDefinition(baselineSpec.definition, entrySynchronized)
    });
}

function json(response, status, payload) {
    response.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
    response.end(JSON.stringify(payload));
}

function html(response, status, content) {
    response.writeHead(status, {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
        "x-content-type-options": "nosniff"
    });
    response.end(content);
}

function errorPayload(cause) {
    if (cause instanceof MapEditorAuthoringError) {
        return {
            code: cause.code,
            message: cause.message,
            ...(cause.issues ? { issues: cause.issues } : {}),
            ...(cause.latest ? { latest: cause.latest } : {})
        };
    }
    return { code: "internal-error", message: "Map editor request failed." };
}

async function requestJson(request) {
    const chunks = [];
    let size = 0;
    for await (const chunk of request) {
        size += chunk.length;
        if (size > MAX_BODY_BYTES) throw error("body-too-large", "Map editor request exceeds 2 MiB.");
        chunks.push(chunk);
    }
    try {
        return JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
        throw error("body-invalid-json", "Map editor request body must be JSON.");
    }
}

function requestRoute(url) {
    const match = /^\/api\/map-editor\/stages\/([^/]+)(?:\/(validate|preview|reference))?$/.exec(url.pathname);
    return match ? { stageId: decodeURIComponent(match[1]), action: match[2] ?? "read" } : null;
}

function scenarioMapPreviewPath(stageId, specType = "area") {
    if (specType === "boss-stage") {
        throw error("scenario-map-preview-unavailable", "Boss Stage legacy map previews are not active references.");
    }
    const match = /^(\d+)-(\d+)$/.exec(stageId ?? "");
    if (!match) throw error("stage-identity-invalid", "Map editor stage identity is invalid.");
    return `docs/bsh/scenario/${match[1]}/${stageId}/MAP-PREVIEW.html`;
}

function mapPreviewReferenceDocument(source) {
    const override = `<style id="map-editor-reference-style">
html, body, .layout, main { width: 100%; height: 100%; overflow: hidden; }
body { background: #061019; }
body > header, .layout > aside { display: none !important; }
.layout { display: block !important; }
main { display: grid; place-items: stretch; padding: 0 !important; }
svg { width: 100% !important; height: 100% !important; min-height: 0 !important; border: 0 !important; border-radius: 0 !important; }
</style>`;
    return source.includes("</head>") ? source.replace("</head>", `${override}</head>`) : `${override}${source}`;
}

export async function createMapEditorAuthoringServer({
    projectRoot,
    editorCatalogPath = "docs/bsh/scenario/AREA-EDITOR-CATALOG.json"
} = {}) {
    const root = resolve(projectRoot ?? "");
    const editorCatalog = await readJson(safeProjectPath(root, editorCatalogPath), "editor-catalog-invalid-json");
    if (editorCatalog?.schemaVersion !== "area-editor-catalog-v2" || !Array.isArray(editorCatalog.stages)) {
        throw error("editor-catalog-invalid", "Map editor stage catalog is invalid.");
    }
    const manifests = new Map();
    async function manifestFor(entry) {
        if (!entry.manifestPath) return null;
        if (manifests.has(entry.manifestPath)) return manifests.get(entry.manifestPath);
        const manifest = await readJson(safeProjectPath(root, entry.manifestPath), "manifest-invalid-json");
        const validation = validateAreaCatalogManifest(manifest, {
            expectedStageIds: manifest.expectedStageIds ?? manifest.stageSources?.map(({ stageId }) => stageId) ?? [],
            sourcePathExists: (relativePath) => existsSync(safeProjectPath(root, relativePath)),
            requireGeneratedOutputs: true
        });
        if (!validation.valid) {
            throw error("manifest-invalid", "Map editor manifest validation failed.", { issues: validation.issues });
        }
        await readText(
            safeProjectPath(root, manifest.catalogOutputPath),
            "generated-output-missing",
            "Map editor generated catalog could not be read."
        );
        manifests.set(entry.manifestPath, manifest);
        return manifest;
    }
    const stages = new Map();
    for (const entry of editorCatalog.stages) {
        const specType = entry?.specType ?? "area";
        const validIdentity =
            specType === "boss-stage"
                ? /^boss-\d+$/.test(entry?.stageId ?? "") && typeof entry?.bossStageId === "string"
                : /^\d+-\d+$/.test(entry?.stageId ?? "") && typeof entry?.areaId === "string";
        if (!validIdentity || !["area", "boss-stage"].includes(specType)) {
            throw error("editor-catalog-stage-invalid", "Map editor stage catalog contains an invalid identity.");
        }
        if (stages.has(entry.stageId))
            throw error("editor-catalog-stage-duplicate", "Map editor stage catalog has duplicates.");
        if (!["runtime-generated", "runtime-staged", "scenario-only"].includes(entry.authoringMode)) {
            throw error("editor-catalog-mode-invalid", "Map editor stage catalog contains an unknown authoring mode.");
        }
        const sourcePath = safeProjectPath(root, entry.sourcePath);
        const spec = validateSpec(entry, await readJson(sourcePath, "spec-invalid-json"));
        const expectedSpecMode = entry.authoringMode === "scenario-only" ? "scenario" : "runtime";
        if (specType === "area" && (spec.authoringMode ?? "runtime") !== expectedSpecMode) {
            throw error("stage-mode-invalid", "Map editor stage source does not match its authoring mode.");
        }
        const manifest = specType === "area" ? await manifestFor(entry) : null;
        const manifestEntry = manifest?.stageSources?.find(({ stageId }) => stageId === entry.stageId) ?? null;
        if (
            manifest &&
            (!manifestEntry || manifestEntry.source !== "generated" || manifestEntry.areaId !== entry.areaId)
        ) {
            throw error(
                "stage-manifest-selection-invalid",
                "Map editor generated stage is not selected by its manifest."
            );
        }
        const outputPath = manifestEntry
            ? safeProjectPath(root, manifestEntry.outputPath)
            : entry.outputPath
              ? safeProjectPath(root, entry.outputPath)
              : null;
        const sourceContent = await readText(
            sourcePath,
            "spec-invalid-json",
            "Map editor spec source could not be read."
        );
        if (outputPath)
            await readText(outputPath, "generated-output-missing", "Map editor generated output could not be read.");
        stages.set(entry.stageId, {
            entry: Object.freeze({ ...entry }),
            manifest,
            sourcePath,
            outputPath,
            spec,
            memorySpec: null,
            memoryRevision: 0,
            runtimePromotion: runtimePromotionReadiness(entry, spec),
            sourceHash: revisionFor(sourceContent),
            revision: 0
        });
    }

    function currentStage(stageId) {
        const stage = stages.get(stageId);
        if (!stage) throw error("stage-not-found", "Map editor stage was not found.");
        return stage;
    }

    function previewAvailable(stage) {
        return Boolean(stage.outputPath);
    }

    function stageValue(stage) {
        const activeSpec = stage.memorySpec ?? stage.spec;
        return Object.freeze({
            stageId: stage.entry.stageId,
            specType: stage.entry.specType ?? "area",
            areaId: stage.entry.areaId ?? null,
            bossStageId: stage.entry.bossStageId ?? null,
            name: stage.entry.specType === "boss-stage" ? activeSpec.name : activeSpec.definition.name,
            authoringMode: stage.entry.authoringMode,
            runtimePromotion: stage.runtimePromotion,
            revision: stage.revision,
            spec: structuredClone(activeSpec),
            ...(stage.memorySpec ? { sourceSpec: structuredClone(stage.spec) } : {}),
            memoryStored: Boolean(stage.memorySpec),
            memoryRevision: stage.memoryRevision,
            previewAvailable: previewAvailable(stage),
            ...(stage.entry.specType === "boss-stage" ? { derivedPreview: bossStageDerivedPreview(activeSpec) } : {}),
            ...(stage.outputPath
                ? {
                      moduleUrl: `/${relative(root, stage.outputPath).replaceAll("\\", "/")}`,
                      outputRevision: revisionFor(stableJson(stage.spec, stage.entry.specType))
                  }
                : {})
        });
    }

    async function readStageSpecFromDisk(stage, code = "spec-invalid-json") {
        return validateSpec(stage.entry, await readJson(stage.sourcePath, code));
    }

    async function latestStageValue(stage) {
        const spec = await readStageSpecFromDisk(stage);
        return Object.freeze({
            stageId: stage.entry.stageId,
            specType: stage.entry.specType ?? "area",
            areaId: stage.entry.areaId ?? null,
            bossStageId: stage.entry.bossStageId ?? null,
            name: stage.entry.specType === "boss-stage" ? spec.name : spec.definition.name,
            authoringMode: stage.entry.authoringMode,
            runtimePromotion: runtimePromotionReadiness(stage.entry, spec),
            revision: stage.revision,
            spec: structuredClone(spec),
            previewAvailable: previewAvailable(stage),
            ...(stage.entry.specType === "boss-stage" ? { derivedPreview: bossStageDerivedPreview(spec) } : {}),
            ...(stage.outputPath
                ? {
                      moduleUrl: `/${relative(root, stage.outputPath).replaceAll("\\", "/")}`,
                      outputRevision: revisionFor(stableJson(spec, stage.entry.specType))
                  }
                : {})
        });
    }

    async function assertSourceUnchanged(stage) {
        const sourceContent = await readText(
            stage.sourcePath,
            "spec-invalid-json",
            "Map editor spec source could not be read."
        );
        if (revisionFor(sourceContent) === stage.sourceHash) return;
        throw error("filesystem-drift", "Map editor source changed on disk after this Draft was loaded.", {
            issues: [
                {
                    stageId: stage.entry.stageId,
                    kind: "source",
                    path: stage.entry.sourcePath
                }
            ],
            latest: await latestStageValue(stage).catch(() => null)
        });
    }

    async function generatedWrites(stage, replacement) {
        if (stage.entry.specType === "boss-stage") {
            return [{ path: stage.outputPath, content: await bossStageGeneratedModule(replacement) }];
        }
        if (!stage.manifest) return [];
        const specsByStageId = new Map();
        for (const entry of stage.manifest.stageSources) {
            if (entry.source !== "generated") continue;
            const candidate = stages.get(entry.stageId);
            if (!candidate) throw error("stage-generated-source-missing", "Map editor generated source is missing.");
            specsByStageId.set(
                entry.stageId,
                entry.stageId === stage.entry.stageId ? replacement : await readStageSpecFromDisk(candidate)
            );
        }
        return collectGeneratedOutputs({ manifest: stage.manifest, specsByStageId }).map(({ outputPath, content }) => ({
            path: safeProjectPath(root, outputPath),
            content
        }));
    }

    const server = {
        stageSummary() {
            return Object.freeze(
                [...stages.values()].map((stage) =>
                    Object.freeze({
                        stageId: stage.entry.stageId,
                        specType: stage.entry.specType ?? "area",
                        areaId: stage.entry.areaId ?? null,
                        bossStageId: stage.entry.bossStageId ?? null,
                        name: stage.entry.specType === "boss-stage" ? stage.spec.name : stage.spec.definition.name,
                        authoringMode: stage.entry.authoringMode,
                        runtimePromotion: stage.runtimePromotion,
                        revision: stage.revision
                    })
                )
            );
        },

        async readStage(stageId) {
            return stageValue(currentStage(stageId));
        },

        async readScenarioMapPreview(stageId) {
            const stage = currentStage(stageId);
            const source = await readText(
                safeProjectPath(root, scenarioMapPreviewPath(stage.entry.stageId, stage.entry.specType)),
                "scenario-map-preview-missing",
                "Map editor scenario map preview could not be read."
            );
            return mapPreviewReferenceDocument(source);
        },

        async validateStage({ stageId, spec } = {}) {
            const stage = currentStage(stageId);
            const baselineSpec = await readStageSpecFromDisk(stage);
            const canonical = validateEditableSpec(stage.entry, baselineSpec, spec);
            assertEditableDraft(stage.entry, baselineSpec, canonical);
            stage.memorySpec = canonical;
            stage.memoryRevision += 1;
            return Object.freeze({
                valid: true,
                issues: [],
                spec: structuredClone(canonical),
                memoryStored: true,
                memoryRevision: stage.memoryRevision
            });
        },

        async applyStage({ stageId, spec, baseRevision } = {}) {
            const stage = currentStage(stageId);
            if (!Number.isInteger(baseRevision)) {
                throw error("revision-invalid", "Map editor Apply requires an integer base revision.");
            }
            if (baseRevision !== stage.revision) {
                throw error("revision-conflict", "Map editor stage changed since this Draft was loaded.", {
                    latest: stageValue(stage)
                });
            }
            const baselineSpec = stage.spec;
            const canonical = validateEditableSpec(stage.entry, baselineSpec, spec);
            assertEditableDraft(stage.entry, baselineSpec, canonical);
            const sourceContent = stableJson(canonical, stage.entry.specType);
            const writes = [
                { path: stage.sourcePath, content: sourceContent },
                ...(await generatedWrites(stage, canonical))
            ];
            await assertSourceUnchanged(stage);
            for (const write of writes) await writeFile(write.path, write.content, "utf8");
            stage.spec = canonical;
            stage.memorySpec = null;
            stage.runtimePromotion = runtimePromotionReadiness(stage.entry, canonical);
            stage.sourceHash = revisionFor(sourceContent);
            stage.revision += 1;
            return stageValue(stage);
        }
    };

    const staticHandler = createStaticRequestHandler(root);
    const editorStaticHandler = createStaticRequestHandler(resolve(root, "tools"));
    server.requestHandler = async (request, response) => {
        const url = new URL(request.url ?? "/", "http://127.0.0.1");
        if (url.pathname === "/map-editor" || url.pathname.startsWith("/map-editor/")) {
            const originalUrl = request.url;
            if (url.pathname === "/map-editor" || url.pathname === "/map-editor/") {
                request.url = `/map-editor/index.html${url.search}`;
            }
            try {
                return await editorStaticHandler(request, response);
            } finally {
                request.url = originalUrl;
            }
        }
        if (!url.pathname.startsWith("/api/map-editor/")) return staticHandler(request, response);
        try {
            if (url.pathname === "/api/map-editor/stages" && request.method === "GET") {
                return json(response, 200, { stages: server.stageSummary() });
            }
            const route = requestRoute(url);
            if (!route)
                return json(response, 404, { code: "route-not-found", message: "Map editor API route was not found." });
            if (route.action === "read" && request.method === "GET")
                return json(response, 200, await server.readStage(route.stageId));
            if (route.action === "preview" && request.method === "GET") {
                const stageRecord = currentStage(route.stageId);
                const stage = await server.readStage(route.stageId);
                if (!previewAvailable(stageRecord)) {
                    throw error("preview-unavailable", "This stage does not have authored terrain for a game preview.");
                }
                const previewSpec = stageRecord.memorySpec ?? stageRecord.spec;
                return json(response, 200, {
                    stageId: stage.stageId,
                    areaId: stage.areaId,
                    specType: stage.specType,
                    bossStageId: stage.bossStageId,
                    revision: stageRecord.memorySpec ? `memory-${stageRecord.memoryRevision}` : String(stage.revision),
                    memoryStored: Boolean(stageRecord.memorySpec),
                    ...(stage.specType === "boss-stage"
                        ? { spec: stage.spec, derivedPreview: stage.derivedPreview }
                        : {
                              previewArea: createAreaDefinitionFromV2(previewSpec)
                          })
                });
            }
            if (route.action === "reference" && request.method === "GET") {
                return html(response, 200, await server.readScenarioMapPreview(route.stageId));
            }
            if (route.action === "validate" && request.method === "POST") {
                const body = await requestJson(request);
                return json(response, 200, await server.validateStage({ stageId: route.stageId, spec: body.spec }));
            }
            if (route.action === "read" && request.method === "PUT") {
                const body = await requestJson(request);
                return json(
                    response,
                    200,
                    await server.applyStage({
                        stageId: route.stageId,
                        spec: body.spec,
                        baseRevision: body.baseRevision
                    })
                );
            }
            return json(response, 405, {
                code: "method-not-allowed",
                message: "Map editor API method is not allowed."
            });
        } catch (cause) {
            const payload = errorPayload(cause);
            const status = payload.code === "internal-error" ? 500 : payload.code === "revision-conflict" ? 409 : 400;
            return json(response, status, payload);
        }
    };
    return Object.freeze(server);
}
