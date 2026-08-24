import { bossPolygonObjectRenderer } from "./BossPolygonObjectRenderers.js";

export class BossStageWorldRenderer {
    constructor({ objectRenderer = bossPolygonObjectRenderer } = {}) {
        if (typeof objectRenderer !== "function") {
            throw new Error("BossStageWorldRenderer requires an object renderer resolver");
        }
        this.objectRenderer = objectRenderer;
    }

    draw({ context, scene, renderStats, presentationTimeSeconds = 0 }) {
        const presentation = scene.bossStagePresentation?.world;
        if (!presentation) return;
        let drawn = 0;
        for (const object of presentation.objects) {
            if (object.active === false) continue;
            this.objectRenderer(object.kind).draw(context, object, presentation, presentationTimeSeconds);
            drawn += 1;
        }
        renderStats?.recordCollection("bossStageObjects", presentation.objects.length, drawn);
    }
}
