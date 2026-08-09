export class CanvasRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.cssWidth = 1;
        this.cssHeight = 1;
    }

    resize() {
        const rect = this.canvas.getBoundingClientRect();
        const ratio = Math.max(1, globalThis.devicePixelRatio || 1);
        this.cssWidth = Math.max(1, rect.width);
        this.cssHeight = Math.max(1, rect.height);
        const width = Math.round(this.cssWidth * ratio);
        const height = Math.round(this.cssHeight * ratio);
        if (this.canvas.width !== width || this.canvas.height !== height) {
            this.canvas.width = width;
            this.canvas.height = height;
        }
        this.context.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    draw({ player, stats }) {
        this.resize();
        const ctx = this.context;
        const gradient = ctx.createLinearGradient(0, 0, 0, this.cssHeight);
        gradient.addColorStop(0, "#111a33");
        gradient.addColorStop(1, "#090d18");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.cssWidth, this.cssHeight);

        ctx.strokeStyle = "#263555";
        ctx.lineWidth = 2;
        ctx.strokeRect(20, 20, this.cssWidth - 40, this.cssHeight - 40);

        ctx.beginPath();
        ctx.arc(player.x, player.y, 14, 0, Math.PI * 2);
        ctx.fillStyle = "#67e8f9";
        ctx.fill();
        ctx.strokeStyle = "#cffafe";
        ctx.stroke();

        ctx.fillStyle = "#94a3b8";
        ctx.font = "12px ui-monospace, monospace";
        ctx.fillText(`fixed steps: ${stats.totalSteps}`, 30, 42);
        ctx.fillText(`dropped: ${stats.droppedSteps}`, 30, 60);
    }
}
