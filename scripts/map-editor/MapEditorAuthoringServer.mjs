import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve, sep } from "node:path";
import { validateAreaCatalogManifest } from "../../src/game/world/area-authoring-v2/AreaCatalogManifest.js";
import { canonicalizeAreaSpecV2 } from "../../src/game/world/area-authoring-v2/AreaSpecV2.js";
import { collectGeneratedOutputs } from "../../src/game/world/area-authoring-v2/AreaSpecV2Generator.js";
import {
    validateAreaSpecEditorMutation,
    validateAreaSpecV2
} from "../../src/game/world/area-authoring-v2/AreaSpecV2Validator.js";
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

function stableJson(value) {
    return `${JSON.stringify(canonicalizeAreaSpecV2(value), null, 2)}\n`;
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
    if (spec?.stage?.legacyStageAlias !== entry.stageId || spec?.definition?.id !== entry.areaId) {
        throw error("stage-identity-invalid", "Map editor stage identity does not match the catalog manifest.");
    }
}

function validateSpec(entry, spec) {
    if (containsExecutableValue(spec)) {
        throw error("spec-executable-value", "Map editor specs cannot contain executable values.");
    }
    assertStageIdentity(entry, spec);
    const result = validateAreaSpecV2(spec, { file: entry.sourcePath });
    if (!result.valid) {
        throw error("spec-invalid", "Map editor spec validation failed.", { issues: result.issues });
    }
    return canonicalizeAreaSpecV2(spec);
}

function assertEditableDraft(entry, baselineSpec, candidateSpec) {
    const mutation = validateAreaSpecEditorMutation(baselineSpec, candidateSpec, { file: entry.sourcePath });
    if (!mutation.valid) {
        throw error("editor-read-only-changed", "Map editor draft modified a read-only stage subtree.", {
            issues: mutation.issues
        });
    }
}

function json(response, status, payload) {
    response.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
    response.end(JSON.stringify(payload));
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
    const match = /^\/api\/map-editor\/stages\/([^/]+)(?:\/(validate|preview))?$/.exec(url.pathname);
    return match ? { stageId: decodeURIComponent(match[1]), action: match[2] ?? "read" } : null;
}

export async function createMapEditorAuthoringServer({
    projectRoot,
    manifestPath = "docs/bsh/scenario/AREA-CATALOG.json"
} = {}) {
    const root = resolve(projectRoot ?? "");
    const manifestFile = safeProjectPath(root, manifestPath);
    const manifest = await readJson(manifestFile, "manifest-invalid-json");
    const manifestResult = validateAreaCatalogManifest(manifest, {
        expectedStageIds: manifest.expectedStageIds ?? manifest.stageSources?.map(({ stageId }) => stageId) ?? [],
        sourcePathExists: (relativePath) => existsSync(safeProjectPath(root, relativePath)),
        requireGeneratedOutputs: true
    });
    if (!manifestResult.valid) {
        throw error("manifest-invalid", "Map editor manifest validation failed.", { issues: manifestResult.issues });
    }
    const generatedCatalogPath = safeProjectPath(root, manifest.catalogOutputPath);
    await readText(generatedCatalogPath, "generated-output-missing", "Map editor generated output could not be read.");

    const stages = new Map();
    for (const entry of manifest.stageSources) {
        if (entry.source !== "generated") continue;
        const sourcePath = safeProjectPath(root, entry.sourcePath);
        const outputPath = safeProjectPath(root, entry.outputPath);
        const spec = validateSpec(entry, await readJson(sourcePath, "spec-invalid-json"));
        const sourceContent = await readText(
            sourcePath,
            "spec-invalid-json",
            "Map editor spec source could not be read."
        );
        await readText(outputPath, "generated-output-missing", "Map editor generated output could not be read.");
        stages.set(entry.stageId, {
            entry: Object.freeze({ ...entry }),
            sourcePath,
            outputPath,
            spec,
            sourceHash: revisionFor(sourceContent),
            revision: 0
        });
    }

    function currentStage(stageId) {
        const stage = stages.get(stageId);
        if (!stage) throw error("stage-not-generated", "Map editor can only open generated catalog stages.");
        return stage;
    }

    function stageValue(stage) {
        return Object.freeze({
            stageId: stage.entry.stageId,
            areaId: stage.entry.areaId,
            name: stage.spec.definition.name,
            revision: stage.revision,
            spec: structuredClone(stage.spec),
            moduleUrl: `/${stage.entry.outputPath.replaceAll("\\", "/")}`,
            outputRevision: revisionFor(stableJson(stage.spec))
        });
    }

    async function readStageSpecFromDisk(stage, code = "spec-invalid-json") {
        return validateSpec(stage.entry, await readJson(stage.sourcePath, code));
    }

    async function latestStageValue(stage) {
        const spec = await readStageSpecFromDisk(stage);
        return Object.freeze({
            stageId: stage.entry.stageId,
            areaId: stage.entry.areaId,
            name: spec.definition.name,
            revision: stage.revision,
            spec: structuredClone(spec),
            moduleUrl: `/${stage.entry.outputPath.replaceAll("\\", "/")}`,
            outputRevision: revisionFor(stableJson(spec))
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

    const server = {
        stageSummary() {
            return Object.freeze(
                [...stages.values()].map((stage) =>
                    Object.freeze({
                        stageId: stage.entry.stageId,
                        areaId: stage.entry.areaId,
                        name: stage.spec.definition.name,
                        revision: stage.revision
                    })
                )
            );
        },

        async readStage(stageId) {
            return stageValue(currentStage(stageId));
        },

        async validateStage({ stageId, spec } = {}) {
            const stage = currentStage(stageId);
            const baselineSpec = await readStageSpecFromDisk(stage);
            const canonical = validateSpec(stage.entry, spec);
            assertEditableDraft(stage.entry, baselineSpec, canonical);
            return Object.freeze({ valid: true, issues: [], spec: structuredClone(canonical) });
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
            const canonical = validateSpec(stage.entry, spec);
            assertEditableDraft(stage.entry, baselineSpec, canonical);
            const specsByStageId = new Map(
                [...stages.values()].map((candidate) => [
                    candidate.entry.stageId,
                    candidate.entry.stageId === stageId ? canonical : candidate.spec
                ])
            );
            const generated = collectGeneratedOutputs({ manifest, specsByStageId });
            const sourceContent = stableJson(canonical);
            const writes = [
                { path: stage.sourcePath, content: sourceContent },
                ...generated.map(({ outputPath, content }) => ({
                    path: safeProjectPath(root, outputPath),
                    content
                }))
            ];
            await assertSourceUnchanged(stage);
            for (const write of writes) await writeFile(write.path, write.content, "utf8");
            stage.spec = canonical;
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
                const stage = await server.readStage(route.stageId);
                return json(response, 200, {
                    stageId: stage.stageId,
                    areaId: stage.areaId,
                    revision: stage.revision,
                    moduleUrl: stage.moduleUrl,
                    outputRevision: stage.outputRevision
                });
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
