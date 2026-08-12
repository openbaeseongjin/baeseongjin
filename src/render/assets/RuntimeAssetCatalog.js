const RUNTIME_ASSET_ROOT = new URL("../../../assets/runtime/", import.meta.url);

export const RUNTIME_ASSET_CATEGORIES = Object.freeze(["characters", "environments", "objects", "effects", "ui"]);

const CATEGORY_SET = new Set(RUNTIME_ASSET_CATEGORIES);
const STABLE_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function assertAssetId(assetId) {
    if (typeof assetId !== "string" || !STABLE_ID.test(assetId)) {
        throw new Error(`Runtime asset id '${assetId}' must use lowercase kebab-case`);
    }
}

function assertFilePath(filePath) {
    if (
        typeof filePath !== "string" ||
        !filePath ||
        filePath.startsWith("/") ||
        filePath.includes("\\") ||
        filePath.includes("?") ||
        filePath.includes("#") ||
        /^[a-z][a-z\d+.-]*:/i.test(filePath)
    ) {
        throw new Error(`Runtime asset file '${filePath}' must be a relative path`);
    }
    let segments;
    try {
        segments = filePath.split("/").map((segment) => decodeURIComponent(segment));
    } catch {
        throw new Error(`Runtime asset file '${filePath}' contains invalid URL encoding`);
    }
    if (segments.some((segment) => !segment || segment === "." || segment === "..")) {
        throw new Error(`Runtime asset file '${filePath}' cannot leave its asset package`);
    }
}

export function runtimeAssetUrl(category, assetId, filePath) {
    if (!CATEGORY_SET.has(category)) throw new Error(`Unknown runtime asset category '${category}'`);
    assertAssetId(assetId);
    assertFilePath(filePath);
    return new URL(`${category}/${assetId}/${filePath}`, RUNTIME_ASSET_ROOT).href;
}
