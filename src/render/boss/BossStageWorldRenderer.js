import { bossPolygonObjectRenderer } from "./BossPolygonObjectRenderers.js";

export class BossStageWorldRenderer {
    draw({ context, scene, renderStats }) {
        const presentation = scene.bossStagePresentation?.world;
        if (!presentation) return;
        let drawn = 0;
        for (const object of presentation.objects) {
            if (object.active === false) continue;
            bossPolygonObjectRenderer(object.kind).draw(context, object);
            drawn += 1;
        }
        renderStats?.recordCollection("bossStageObjects", presentation.objects.length, drawn);
    }
}
