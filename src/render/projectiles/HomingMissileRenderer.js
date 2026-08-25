import { circleBounds, isVisible } from "../RenderViewport.js";

const DEFAULT_PALETTE = Object.freeze({
    body: "#7dd3fc",
    edge: "#e0f2fe",
    core: "#fb7185",
    trail: "rgba(56, 189, 248, 0.62)"
});

export class HomingMissileRenderer {
    constructor({ selectProjectiles, category = "homingMissiles", palette = DEFAULT_PALETTE } = {}) {
        if (typeof selectProjectiles !== "function") {
            throw new Error("HomingMissileRenderer requires selectProjectiles");
        }
        this.selectProjectiles = selectProjectiles;
        this.category = category;
        this.palette = Object.freeze({ ...DEFAULT_PALETTE, ...palette });
    }

    draw({ context, scene, viewport, renderStats }) {
        const projectiles = this.selectProjectiles(scene);
        let drawn = 0;
        for (const projectile of projectiles) {
            if (!isVisible(viewport, circleBounds(projectile.position, projectile.radius + 18))) continue;
            drawn += 1;
            const angle = Math.atan2(projectile.velocity.y, projectile.velocity.x);
            const length = Math.max(24, projectile.radius * 1.4);
            const height = Math.max(10, projectile.radius * 0.55);
            context.save();
            context.translate(projectile.position.x, projectile.position.y);
            context.rotate(angle);
            context.strokeStyle = this.palette.trail;
            context.lineWidth = Math.max(3, height * 0.32);
            context.lineCap = "round";
            context.beginPath();
            context.moveTo(-length * 1.05, 0);
            context.lineTo(-length * 0.62, 0);
            context.stroke();
            context.lineCap = "butt";
            context.fillStyle = this.palette.body;
            context.strokeStyle = this.palette.edge;
            context.lineWidth = 2;
            context.beginPath();
            context.moveTo(length * 0.62, 0);
            context.lineTo(length * 0.18, -height * 0.5);
            context.lineTo(-length * 0.55, -height * 0.42);
            context.lineTo(-length * 0.35, 0);
            context.lineTo(-length * 0.55, height * 0.42);
            context.lineTo(length * 0.18, height * 0.5);
            context.closePath();
            context.fill();
            context.stroke();
            context.fillStyle = this.palette.core;
            context.fillRect(-length * 0.08, -height * 0.3, length * 0.22, height * 0.6);
            context.restore();
        }
        renderStats?.recordCollection(this.category, projectiles.length, drawn);
    }
}
