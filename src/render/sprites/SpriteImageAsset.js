import { ImageAsset } from "../assets/ImageAsset.js";

export class SpriteImageAsset extends ImageAsset {
    constructor({
        source,
        expectedSize = null,
        ImageClass = globalThis.Image,
        warn = console.warn,
        fallbackLabel = "polygon scene fallback"
    } = {}) {
        super({
            source,
            expectedSize,
            ImageClass,
            assetLabel: "Sprite",
            onFailure: (error) => {
                warn(`[renderer:sprite] ${error.message}; using ${fallbackLabel}`);
            }
        });
        this.fallbackLabel = fallbackLabel;
    }
}

export class SpriteImageAssetSet {
    constructor({
        atlases,
        ImageClass = globalThis.Image,
        warn = console.warn,
        fallbackLabel = "polygon scene fallback"
    } = {}) {
        if (!atlases || Array.isArray(atlases) || typeof atlases !== "object" || !Object.keys(atlases).length) {
            throw new Error("SpriteImageAssetSet requires atlas definitions");
        }
        this.assets = Object.freeze(
            Object.fromEntries(
                Object.entries(atlases).map(([atlasId, atlas]) => [
                    atlasId,
                    new SpriteImageAsset({
                        source: atlas.source,
                        expectedSize: atlas.size,
                        ImageClass,
                        warn,
                        fallbackLabel
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

    async prepare() {
        await Promise.all(Object.values(this.assets).map((asset) => asset.prepare()));
        return this.status;
    }

    imageFor(atlasId) {
        if (!Object.hasOwn(this.assets, atlasId)) throw new Error(`Unknown sprite atlas '${atlasId}'`);
        const asset = this.assets[atlasId];
        if (asset.status !== "ready") throw new Error(`Sprite atlas '${atlasId}' is not ready`);
        return asset.image;
    }
}
