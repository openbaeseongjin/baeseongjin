import { ImageAsset } from "../assets/ImageAsset.js";

export class EnvironmentImageAsset extends ImageAsset {
    constructor({ source, expectedSize = null, ImageClass = globalThis.Image } = {}) {
        super({ source, expectedSize, ImageClass, assetLabel: "Environment" });
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

    async prepare() {
        await Promise.all(Object.values(this.assets).map((asset) => asset.prepare()));
        return this.status;
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
