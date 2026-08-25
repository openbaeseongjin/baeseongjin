import {
    CONTINUITY_WARDEN_GATE_SIZE,
    CONTINUITY_WARDEN_GATE_STATE,
    CONTINUITY_WARDEN_OBJECT_KIND,
    CONTINUITY_WARDEN_SHUTTLE_SIZE
} from "../../game/boss/ContinuityWardenDefinition.js";
import { WorldObjectSpriteAssetCatalog } from "../assets/WorldObjectSpriteAssetCatalog.js";
import { runtimeAssetUrl } from "../assets/RuntimeAssetCatalog.js";

const GATE_PACKAGE_ID = "boss-06-departure-gate";
const GATE_OPENING_FRAME_COUNT = 8;
const GATE_OPENING_SPRITE_STATE = Object.freeze(
    Array.from({ length: GATE_OPENING_FRAME_COUNT }, (_, index) => `opening-${String(index).padStart(2, "0")}`)
);

function sprite(packageId, filename, size) {
    return Object.freeze({
        source: runtimeAssetUrl("objects", packageId, filename),
        size
    });
}

const GATE_SPRITE = Object.freeze({
    [CONTINUITY_WARDEN_GATE_STATE.LOCKED]: sprite(
        GATE_PACKAGE_ID,
        "departure-gate-locked.png",
        CONTINUITY_WARDEN_GATE_SIZE
    ),
    [CONTINUITY_WARDEN_GATE_STATE.LIGHT]: sprite(
        GATE_PACKAGE_ID,
        "departure-gate-light.png",
        CONTINUITY_WARDEN_GATE_SIZE
    ),
    [CONTINUITY_WARDEN_GATE_STATE.OPEN]: sprite(
        GATE_PACKAGE_ID,
        "departure-gate-open.png",
        CONTINUITY_WARDEN_GATE_SIZE
    ),
    ...Object.fromEntries(
        GATE_OPENING_SPRITE_STATE.map((state) => [
            state,
            sprite(GATE_PACKAGE_ID, `opening/${state}.png`, CONTINUITY_WARDEN_GATE_SIZE)
        ])
    )
});

const CONTINUITY_WARDEN_OBJECT_PRESENTATION = Object.freeze({
    [CONTINUITY_WARDEN_OBJECT_KIND.GATE]: Object.freeze({
        id: CONTINUITY_WARDEN_OBJECT_KIND.GATE,
        size: CONTINUITY_WARDEN_GATE_SIZE,
        sprites: GATE_SPRITE
    }),
    [CONTINUITY_WARDEN_OBJECT_KIND.SHUTTLE]: Object.freeze({
        id: CONTINUITY_WARDEN_OBJECT_KIND.SHUTTLE,
        size: CONTINUITY_WARDEN_SHUTTLE_SIZE,
        sprite: sprite(
            "boss-06-maintenance-shuttle",
            "maintenance-shuttle-boarding.png",
            CONTINUITY_WARDEN_SHUTTLE_SIZE
        )
    })
});

function catalogStatus(assets) {
    if (assets.some((asset) => asset.status === "failed")) return "failed";
    if (assets.every((asset) => asset.status === "ready")) return "ready";
    if (assets.some((asset) => asset.status === "pending")) return "pending";
    return "idle";
}

export class ContinuityWardenObjectSpriteAssetCatalog {
    constructor({ ImageClass = globalThis.Image, autoStart = false } = {}) {
        this.catalog = new WorldObjectSpriteAssetCatalog({
            presentations: CONTINUITY_WARDEN_OBJECT_PRESENTATION,
            ImageClass,
            autoStart
        });
        this.assets = Object.freeze([
            this.catalog.assetFor(CONTINUITY_WARDEN_OBJECT_KIND.SHUTTLE),
            ...Object.keys(GATE_SPRITE).map((state) => this.catalog.assetFor(CONTINUITY_WARDEN_OBJECT_KIND.GATE, state))
        ]);
    }

    get status() {
        return catalogStatus(this.assets);
    }

    prepare() {
        return Promise.all(this.assets.map((asset) => asset.prepare()));
    }

    imageFor(kind, state) {
        return this.catalog.imageFor(kind, state);
    }

    gateImageFor(state, progress = 0) {
        if (state !== CONTINUITY_WARDEN_GATE_STATE.LIGHT) {
            return this.imageFor(CONTINUITY_WARDEN_OBJECT_KIND.GATE, state);
        }
        const frameIndex = Math.min(
            GATE_OPENING_SPRITE_STATE.length - 1,
            Math.max(0, Math.floor(progress * GATE_OPENING_SPRITE_STATE.length))
        );
        return this.imageFor(CONTINUITY_WARDEN_OBJECT_KIND.GATE, GATE_OPENING_SPRITE_STATE[frameIndex]);
    }
}
