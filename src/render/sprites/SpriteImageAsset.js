export class SpriteImageAsset {
    constructor({ source, expectedSize = null, ImageClass = globalThis.Image, warn = console.warn } = {}) {
        if (typeof source !== "string" || !source) throw new Error("SpriteImageAsset requires source");
        if (
            expectedSize !== null &&
            (!Number.isInteger(expectedSize?.width) ||
                !Number.isInteger(expectedSize?.height) ||
                expectedSize.width <= 0 ||
                expectedSize.height <= 0)
        ) {
            throw new Error("SpriteImageAsset expectedSize requires positive integer width and height");
        }
        this.source = source;
        this.expectedSize = expectedSize ? Object.freeze({ ...expectedSize }) : null;
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
            const actualSize = {
                width: image.naturalWidth ?? image.width,
                height: image.naturalHeight ?? image.height
            };
            if (
                this.expectedSize &&
                (actualSize.width !== this.expectedSize.width || actualSize.height !== this.expectedSize.height)
            ) {
                this.fail(
                    `Sprite '${source}' is ${actualSize.width}x${actualSize.height}; expected ${this.expectedSize.width}x${this.expectedSize.height}`,
                    warn
                );
                return;
            }
            this.status = "ready";
            this.image = image;
        });
        image.addEventListener("error", () => {
            this.fail(`Failed to load sprite '${source}'`, warn);
        });
        image.src = source;
    }

    fail(message, warn) {
        this.status = "failed";
        this.image = null;
        this.error = new Error(message);
        warn(`[renderer:sprite] ${message}; using polygon scene fallback`);
    }
}
