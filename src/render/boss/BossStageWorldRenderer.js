const OBJECT_STYLE = Object.freeze({
    carriage: Object.freeze({ fill: "#273442", stroke: "#a9bed0" }),
    beam: Object.freeze({ fill: "#532d2d", stroke: "#fb7185" }),
    ram: Object.freeze({ fill: "#512e16", stroke: "#fbbf24" }),
    weakpoint: Object.freeze({ fill: "#164e63", stroke: "#67e8f9" }),
    rail: Object.freeze({ fill: "#26323a", stroke: "#64748b" })
});
const DEFAULT_STYLE = Object.freeze({ fill: "#303b45", stroke: "#94a3b8" });

export class BossStageWorldRenderer {
    draw({ context, scene, renderStats }) {
        const presentation = scene.bossStagePresentation?.world;
        if (!presentation) return;
        let drawn = 0;
        for (const object of presentation.objects) {
            if (object.active === false) continue;
            const style = OBJECT_STYLE[object.kind] ?? DEFAULT_STYLE;
            const width = object.size?.width ?? 56;
            const height = object.size?.height ?? 32;
            const x = object.position.x - width * 0.5;
            const y = object.position.y - height * 0.5;
            context.save();
            context.fillStyle = style.fill;
            context.strokeStyle = object.state === "exposed" ? "#fef08a" : style.stroke;
            context.lineWidth = object.state === "exposed" ? 4 : 2;
            context.fillRect(x, y, width, height);
            context.strokeRect(x, y, width, height);
            if (object.direction === "left" || object.direction === "right") {
                const sign = object.direction === "right" ? 1 : -1;
                context.beginPath();
                context.moveTo(object.position.x - sign * 8, object.position.y - 7);
                context.lineTo(object.position.x + sign * 9, object.position.y);
                context.lineTo(object.position.x - sign * 8, object.position.y + 7);
                context.stroke();
            }
            context.restore();
            drawn += 1;
        }
        renderStats?.recordCollection("bossStageObjects", presentation.objects.length, drawn);
    }
}
