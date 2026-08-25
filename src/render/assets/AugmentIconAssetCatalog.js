import { AUGMENT_CATALOG } from "../../game/augments/AugmentCatalog.js";
import { SPELL_SPEC } from "../../game/spells/SpellDefinition.js";
import { ImageAsset } from "./ImageAsset.js";
import { runtimeAssetUrl } from "./RuntimeAssetCatalog.js";

export const AUGMENT_ICON_PACKAGE_ID = "augment-icons";
export const AUGMENT_ICON_SOURCE_SIZES = Object.freeze([32, 48]);

const AUGMENT_ICON_SOURCE_SIZE_LOOKUP = Object.freeze(
    Object.fromEntries(AUGMENT_ICON_SOURCE_SIZES.map((size) => [size, true]))
);

const AUGMENT_ICON_ID_LOOKUP = Object.freeze(
    Object.fromEntries(
        [...AUGMENT_CATALOG.map(({ id }) => id), ...Object.values(SPELL_SPEC).map(({ id }) => id)].map((id) => [
            id,
            true
        ])
    )
);

export const AUGMENT_ICON_IDS = Object.freeze(Object.keys(AUGMENT_ICON_ID_LOOKUP));
export const AUGMENT_ICON_DEFINITIONS = Object.freeze(
    Object.fromEntries(
        AUGMENT_ICON_IDS.map((id) => [
            id,
            Object.freeze({
                id,
                source: runtimeAssetUrl("ui", AUGMENT_ICON_PACKAGE_ID, `${id}.png`)
            })
        ])
    )
);

function requireDefinition(definitions, iconId) {
    const definition = definitions[iconId];
    if (!definition) throw new Error(`Unknown Augment icon '${iconId}'`);
    return definition;
}

class AugmentIconImageAsset extends ImageAsset {
    async complete(image) {
        const width = image.naturalWidth ?? image.width;
        const height = image.naturalHeight ?? image.height;
        if (width !== height || AUGMENT_ICON_SOURCE_SIZE_LOOKUP[width] !== true) {
            this.fail(
                `${this.assetLabel} '${this.source}' is ${width}x${height}; expected ${AUGMENT_ICON_SOURCE_SIZES.join("x, ")}x square PNG`
            );
            return this.status;
        }
        return super.complete(image);
    }
}

export class AugmentIconAssetCatalog {
    constructor({ definitions = AUGMENT_ICON_DEFINITIONS, ImageClass = globalThis.Image, autoStart = false } = {}) {
        if (!definitions || Array.isArray(definitions) || typeof definitions !== "object") {
            throw new Error("AugmentIconAssetCatalog requires icon definitions");
        }
        this.definitions = definitions;
        this.assets = Object.freeze(
            Object.fromEntries(
                Object.entries(definitions).map(([iconId, definition]) => [
                    iconId,
                    new AugmentIconImageAsset({
                        source: definition.source,
                        assetLabel: `Augment icon ${iconId}`,
                        ImageClass,
                        autoStart
                    })
                ])
            )
        );
    }

    assetFor(iconId) {
        requireDefinition(this.definitions, iconId);
        return this.assets[iconId];
    }

    imageFor(iconId) {
        const asset = this.assetFor(iconId);
        if (asset.status === "idle") void asset.prepare();
        return asset.status === "ready" ? asset.image : null;
    }

    prepare(iconIds = AUGMENT_ICON_IDS) {
        return Promise.all(iconIds.map((iconId) => this.assetFor(iconId).prepare())).then(() => this.snapshot());
    }

    snapshot() {
        return Object.freeze(
            Object.fromEntries(Object.entries(this.assets).map(([iconId, asset]) => [iconId, asset.status]))
        );
    }
}
