import { Vector2 } from "../game-kit/index.js";
import { InputSampler } from "../core/input/InputSampler.js";
import { FixedStepRunner } from "../core/sim/FixedStepRunner.js";
import { CanvasRenderer } from "../render/CanvasRenderer.js";

export class GameApp {
    constructor({ canvas }) {
        if (!canvas) throw new Error("GameApp requires a canvas element");
        this.renderer = new CanvasRenderer(canvas);
        this.input = new InputSampler();
        this.player = new Vector2(160, 160);
        this.velocity = new Vector2();
        this.stats = { totalSteps: 0, droppedSteps: 0 };
        this.frameId = null;
        this.runner = new FixedStepRunner({
            step: (dt, input) => this.update(dt, input),
            render: () => this.renderer.draw({ player: this.player, stats: this.stats })
        });
        this.tick = (time) => {
            this.stats = this.runner.frame(time, this.input.snapshot());
            this.frameId = requestAnimationFrame(this.tick);
        };
    }

    start() {
        if (this.frameId !== null) return;
        this.input.attach();
        this.frameId = requestAnimationFrame(this.tick);
    }

    stop() {
        if (this.frameId !== null) cancelAnimationFrame(this.frameId);
        this.input.detach();
        this.frameId = null;
    }

    update(dt, input) {
        const speed = 260;
        this.velocity.set(input.horizontal * speed, input.vertical * speed);
        this.player.add(this.velocity.clone().scale(dt));
        const margin = 36;
        this.player.x = Math.max(margin, Math.min(this.renderer.cssWidth - margin, this.player.x));
        this.player.y = Math.max(margin, Math.min(this.renderer.cssHeight - margin, this.player.y));
    }
}
