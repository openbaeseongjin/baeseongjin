export class SpriteImageAsset {
    constructor({ source, ImageClass = globalThis.Image, warn = console.warn } = {}) {
        if (typeof source !== "string" || !source) throw new Error("SpriteImageAsset requires source");
        this.source = source;
        this.status = "pending";
        this.image = null;
        this.error = null;
        if (typeof ImageClass !== "function") {
            this.status = "failed";
            this.error = new Error("Image constructor is unavailable");
            return;
        }
        const image = new ImageClass();
        image.addEventListener("load", () => {
            this.status = "ready";
            this.image = image;
        });
        image.addEventListener("error", () => {
            this.status = "failed";
            this.error = new Error(`Failed to load sprite '${source}'`);
            warn(`[renderer:sprite] ${this.error.message}; using polygon scene fallback`);
        });
        image.src = source;
    }
}
