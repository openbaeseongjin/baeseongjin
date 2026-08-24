import { ImageAsset } from "../assets/ImageAsset.js";

export class SpriteImageAsset extends ImageAsset {
    constructor({
        source,
        expectedSize = null,
        ImageClass = globalThis.Image,
        warn = console.warn,
        fallbackLabel = "polygon scene fallback",
        autoStart = true
    } = {}) {
        super({
            source,
            expectedSize,
            ImageClass,
            assetLabel: "Sprite",
            autoStart,
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
        fallbackLabel = "polygon scene fallback",
        autoStart = true
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
                        fallbackLabel,
                        autoStart
                    })
                ])
            )
        );
    }

    get status() {
        const assets = Object.values(this.assets);
        if (assets.some((asset) => asset.status === "failed")) return "failed";
        if (assets.every((asset) => asset.status === "ready")) return "ready";
        if (assets.some((asset) => asset.status === "pending")) return "pending";
        return "idle";
    }

    get error() {
        return Object.values(this.assets).find((asset) => asset.error)?.error ?? null;
    }

    statusFor(atlasIds = Object.keys(this.assets)) {
        const assets = atlasIds.map((atlasId) => this.assetFor(atlasId));
        if (assets.some((asset) => asset.status === "failed")) return "failed";
        if (assets.every((asset) => asset.status === "ready")) return "ready";
        if (assets.some((asset) => asset.status === "pending")) return "pending";
        return "idle";
    }

    async prepare(atlasIds = Object.keys(this.assets)) {
        await Promise.all(atlasIds.map((atlasId) => this.assetFor(atlasId).prepare()));
        return this.statusFor(atlasIds);
    }

    imageFor(atlasId) {
        const asset = this.assetFor(atlasId);
        if (asset.status !== "ready") throw new Error(`Sprite atlas '${atlasId}' is not ready`);
        return asset.image;
    }

    assetFor(atlasId) {
        if (!Object.hasOwn(this.assets, atlasId)) throw new Error(`Unknown sprite atlas '${atlasId}'`);
        return this.assets[atlasId];
    }
}
