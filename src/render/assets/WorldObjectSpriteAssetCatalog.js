import { ImageAsset } from "./ImageAsset.js";

const DEFAULT_SPRITE_STATE = "default";

function spriteDefinitions(presentation) {
    if (presentation.sprites) return presentation.sprites;
    return presentation.sprite ? Object.freeze({ [DEFAULT_SPRITE_STATE]: presentation.sprite }) : null;
}

function stateAssets(presentationId, presentation, { ImageClass, autoStart }) {
    const definitions = spriteDefinitions(presentation);
    if (!definitions) return null;
    return Object.freeze(
        Object.fromEntries(
            Object.entries(definitions).map(([state, sprite]) => [
                state,
                new ImageAsset({
                    source: sprite.source,
                    expectedSize: sprite.size,
                    assetLabel: `World object ${presentationId} (${state})`,
                    ImageClass,
                    autoStart
                })
            ])
        )
    );
}

function spriteEntries(presentations, options) {
    return Object.entries(presentations).flatMap(([presentationId, presentation]) => {
        const assets = stateAssets(presentationId, presentation, options);
        return assets ? [[presentationId, assets]] : [];
    });
}

export class WorldObjectSpriteAssetCatalog {
    constructor({ presentations, ImageClass = globalThis.Image, autoStart = true } = {}) {
        if (!presentations || Array.isArray(presentations) || typeof presentations !== "object") {
            throw new Error("WorldObjectSpriteAssetCatalog requires presentation definitions");
        }
        this.assets = Object.freeze(Object.fromEntries(spriteEntries(presentations, { ImageClass, autoStart })));
    }

    assetFor(presentationId, state = DEFAULT_SPRITE_STATE) {
        return this.assets[presentationId]?.[state] ?? null;
    }

    imageFor(presentationId, state = DEFAULT_SPRITE_STATE) {
        const asset = this.assetFor(presentationId, state);
        return asset?.status === "ready" ? asset.image : null;
    }
}
