function expectedImageSize(value, label) {
    if (
        value !== null &&
        (!Number.isInteger(value?.width) || !Number.isInteger(value?.height) || value.width <= 0 || value.height <= 0)
    ) {
        throw new Error(`${label} expectedSize requires positive integer width and height`);
    }
    return value ? Object.freeze({ ...value }) : null;
}

export const IMAGE_ASSET_LOAD_TIMEOUT_MS = 15000;

export class ImageAsset {
    #resolveSettled = null;

    constructor({
        source,
        expectedSize = null,
        ImageClass = globalThis.Image,
        assetLabel,
        onFailure = () => {},
        timeoutMs = IMAGE_ASSET_LOAD_TIMEOUT_MS
    } = {}) {
        if (typeof assetLabel !== "string" || !assetLabel) throw new Error("ImageAsset requires assetLabel");
        if (typeof source !== "string" || !source) throw new Error(`${assetLabel}ImageAsset requires source`);
        if (typeof onFailure !== "function") throw new Error("ImageAsset onFailure must be a function");
        if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) throw new Error("ImageAsset timeoutMs must be positive");
        this.source = source;
        this.assetLabel = assetLabel;
        this.expectedSize = expectedImageSize(expectedSize, `${assetLabel}ImageAsset`);
        this.onFailure = onFailure;
        this.status = "pending";
        this.image = null;
        this.error = null;
        this.settledPromise = new Promise((resolve) => {
            this.#resolveSettled = resolve;
        });
        this.timeoutId = globalThis.setTimeout?.(
            () => this.fail(`Timed out loading ${assetLabel.toLowerCase()} '${source}' after ${timeoutMs}ms`),
            timeoutMs
        );
        if (typeof ImageClass !== "function") {
            this.fail("Image constructor is unavailable");
            return;
        }
        const image = new ImageClass();
        image.addEventListener("load", () => void this.complete(image));
        image.addEventListener("error", () => this.fail(`Failed to load ${assetLabel.toLowerCase()} '${source}'`));
        image.src = source;
    }

    async complete(image) {
        if (this.status !== "pending") return this.status;
        try {
            if (typeof image.decode === "function") await image.decode();
        } catch (error) {
            this.fail(`Failed to decode ${this.assetLabel.toLowerCase()} '${this.source}': ${error.message}`);
            return this.status;
        }
        if (this.status !== "pending") return this.status;
        const actualSize = {
            width: image.naturalWidth ?? image.width,
            height: image.naturalHeight ?? image.height
        };
        if (
            this.expectedSize &&
            (actualSize.width !== this.expectedSize.width || actualSize.height !== this.expectedSize.height)
        ) {
            this.fail(
                `${this.assetLabel} '${this.source}' is ${actualSize.width}x${actualSize.height}; expected ${this.expectedSize.width}x${this.expectedSize.height}`
            );
            return this.status;
        }
        this.status = "ready";
        this.image = image;
        this.settle();
        return this.status;
    }

    fail(message) {
        if (this.status !== "pending") return this.status;
        this.status = "failed";
        this.image = null;
        this.error = new Error(message);
        try {
            this.onFailure(this.error);
        } finally {
            this.settle();
        }
        return this.status;
    }

    settle() {
        if (this.timeoutId !== undefined && this.timeoutId !== null) globalThis.clearTimeout?.(this.timeoutId);
        this.timeoutId = null;
        this.#resolveSettled?.(this.status);
        this.#resolveSettled = null;
    }

    prepare() {
        return this.settledPromise;
    }
}
