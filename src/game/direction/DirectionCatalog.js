import { compileDirectionAuthoring } from "./DirectionDefinition.js";

export const DEFAULT_DIRECTION_AUTHORING_URLS = Object.freeze([
    new URL("../../../docs/bsh/scenario/1/1-1/DIRECTION-SPEC.json", import.meta.url),
    new URL("../../../docs/bsh/scenario/1/1-2/DIRECTION-SPEC.json", import.meta.url)
]);

export async function loadDirectionAuthoring(url, { fetcher = globalThis.fetch } = {}) {
    if (typeof fetcher !== "function") throw new Error("direction authoring fetcher is unavailable");
    const response = await fetcher.call(globalThis, url);
    if (!response?.ok) throw new Error(`direction authoring load failed: ${url} (HTTP ${response?.status})`);
    return response.json();
}

export async function loadDefaultDirectionDefinitions(options = {}) {
    const sources = await Promise.all(
        DEFAULT_DIRECTION_AUTHORING_URLS.map((url) => loadDirectionAuthoring(url, options))
    );
    return Object.freeze(sources.map((source) => compileDirectionAuthoring(source)));
}
