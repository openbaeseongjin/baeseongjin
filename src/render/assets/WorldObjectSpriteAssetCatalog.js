import { ImageAsset } from "./ImageAsset.js";

function spriteEntries(presentations, { ImageClass, autoStart }) {
    return Object.entries(presentations)
        .filter(([, presentation]) => Boolean(presentation.sprite))
        .map(([presentationId, presentation]) => [
            presentationId,
            new ImageAsset({
                source: presentation.sprite.source,
                expectedSize: presentation.sprite.size,
                assetLabel: `World object ${presentationId}`,
                ImageClass,
                autoStart
            })
        ]);
}

export class WorldObjectSpriteAssetCatalog {
    constructor({ presentations, ImageClass = globalThis.Image, autoStart = true } = {}) {
        if (!presentations || Array.isArray(presentations) || typeof presentations !== "object") {
            throw new Error("WorldObjectSpriteAssetCatalog requires presentation definitions");
        }
        this.assets = Object.freeze(Object.fromEntries(spriteEntries(presentations, { ImageClass, autoStart })));
    }

    assetFor(presentationId) {
        return this.assets[presentationId] ?? null;
    }

    imageFor(presentationId) {
        const asset = this.assetFor(presentationId);
        return asset?.status === "ready" ? asset.image : null;
    }
}
