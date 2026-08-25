import {
    CONTINUITY_WARDEN_OBJECT_KIND,
    CONTINUITY_WARDEN_SHUTTLE_SIZE
} from "../../game/boss/ContinuityWardenDefinition.js";
import { WorldObjectSpriteAssetCatalog } from "../assets/WorldObjectSpriteAssetCatalog.js";
import { runtimeAssetUrl } from "../assets/RuntimeAssetCatalog.js";

const CONTINUITY_WARDEN_OBJECT_PRESENTATION = Object.freeze({
    [CONTINUITY_WARDEN_OBJECT_KIND.SHUTTLE]: Object.freeze({
        id: CONTINUITY_WARDEN_OBJECT_KIND.SHUTTLE,
        size: CONTINUITY_WARDEN_SHUTTLE_SIZE,
        sprite: Object.freeze({
            source: runtimeAssetUrl("objects", "boss-06-maintenance-shuttle", "maintenance-shuttle-boarding.png"),
            size: CONTINUITY_WARDEN_SHUTTLE_SIZE
        })
    })
});

export class ContinuityWardenObjectSpriteAssetCatalog {
    constructor({ ImageClass = globalThis.Image, autoStart = false } = {}) {
        this.catalog = new WorldObjectSpriteAssetCatalog({
            presentations: CONTINUITY_WARDEN_OBJECT_PRESENTATION,
            ImageClass,
            autoStart
        });
        this.shuttleAsset = this.catalog.assetFor(CONTINUITY_WARDEN_OBJECT_KIND.SHUTTLE);
    }

    get status() {
        return this.shuttleAsset.status;
    }

    prepare() {
        return this.shuttleAsset.prepare();
    }

    imageFor(kind) {
        return this.catalog.imageFor(kind);
    }
}
