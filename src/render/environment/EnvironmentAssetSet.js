export class EnvironmentImageAsset {
    constructor({ source, expectedSize = null, ImageClass = globalThis.Image } = {}) {
        if (typeof source !== "string" || !source) throw new Error("EnvironmentImageAsset requires source");
        if (
            expectedSize !== null &&
            (!Number.isInteger(expectedSize?.width) ||
                !Number.isInteger(expectedSize?.height) ||
                expectedSize.width <= 0 ||
                expectedSize.height <= 0)
        ) {
            throw new Error("EnvironmentImageAsset expectedSize requires positive integer width and height");
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
                    `Environment '${source}' is ${actualSize.width}x${actualSize.height}; expected ${this.expectedSize.width}x${this.expectedSize.height}`
                );
                return;
            }
            this.status = "ready";
            this.image = image;
        });
        image.addEventListener("error", () => {
            this.fail(`Failed to load environment '${source}'`);
        });
        image.src = source;
    }

    fail(message) {
        this.status = "failed";
        this.image = null;
        this.error = new Error(message);
    }
}

export class EnvironmentAssetSet {
    constructor({ atlases, ImageClass = globalThis.Image } = {}) {
        if (!atlases || Array.isArray(atlases) || typeof atlases !== "object" || !Object.keys(atlases).length) {
            throw new Error("EnvironmentAssetSet requires atlas definitions");
        }
        this.assets = Object.freeze(
            Object.fromEntries(
                Object.entries(atlases).map(([atlasId, atlas]) => [
                    atlasId,
                    new EnvironmentImageAsset({
                        source: atlas.source,
                        expectedSize: atlas.size,
                        ImageClass
                    })
                ])
            )
        );
    }

    get status() {
        const assets = Object.values(this.assets);
        if (assets.some((asset) => asset.status === "failed")) return "failed";
        if (assets.every((asset) => asset.status === "ready")) return "ready";
        return "pending";
    }

    get error() {
        return Object.values(this.assets).find((asset) => asset.error)?.error ?? null;
    }

    imageFor(atlasId) {
        if (!Object.hasOwn(this.assets, atlasId)) throw new Error(`Unknown environment atlas '${atlasId}'`);
        const asset = this.assets[atlasId];
        if (asset.status !== "ready") throw new Error(`Environment atlas '${atlasId}' is not ready`);
        return asset.image;
    }

    isReady(atlasId) {
        if (!Object.hasOwn(this.assets, atlasId)) return false;
        return this.assets[atlasId].status === "ready";
    }
}
