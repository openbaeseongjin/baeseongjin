import { bossPolygonObjectRenderer } from "./BossPolygonObjectRenderers.js";

export class BossStageSpriteObjectRendererCatalog {
    constructor({ catalogs }) {
        this.catalogs = Object.freeze([...catalogs]);
    }

    rendererFor(kind) {
        const catalog = this.catalogs.find((candidate) => candidate.supports(kind));
        return catalog?.rendererFor(kind) ?? bossPolygonObjectRenderer(kind);
    }
}
