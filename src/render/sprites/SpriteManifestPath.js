export function assertSpriteAtlasImagePath(image) {
    if (typeof image !== "string" || !image) throw new Error("sprite atlas image must be a non-empty string");
    if (!image.toLowerCase().endsWith(".png")) throw new Error(`sprite atlas image '${image}' must be a PNG file`);
    if (/^[a-z][a-z\d+.-]*:/i.test(image) || image.startsWith("/") || image.includes("\\")) {
        throw new Error(`sprite atlas image '${image}' must be a relative path`);
    }
    let segments;
    try {
        segments = image.split("/").map((segment) => decodeURIComponent(segment));
    } catch {
        throw new Error(`sprite atlas image '${image}' contains invalid URL encoding`);
    }
    if (segments.includes("..")) {
        throw new Error(`sprite atlas image '${image}' cannot leave the sprite asset directory`);
    }
    return image;
}

export function spriteAtlasSource(image, baseUrl) {
    if (baseUrl === undefined || baseUrl === null) return image;
    try {
        return new URL(image, baseUrl).href;
    } catch (error) {
        throw new Error(`sprite manifest base URL is invalid: ${error.message}`);
    }
}
