export class FixedStepRunner {
    constructor({ stepHz = 120, maxCatchUpSteps = 8, step, render }) {
        if (!(stepHz > 0) || !(maxCatchUpSteps > 0) || typeof step !== "function" || typeof render !== "function") {
            throw new TypeError("FixedStepRunner requires valid timing and callbacks");
        }
        this.dt = 1 / stepHz;
        this.maxCatchUpSteps = maxCatchUpSteps;
        this.step = step;
        this.render = render;
        this.accumulator = 0;
        this.lastTimeSeconds = null;
        this.totalSteps = 0;
        this.droppedSteps = 0;
    }

    reset(timeMs = 0) {
        this.accumulator = 0;
        this.lastTimeSeconds = timeMs / 1000;
    }

    frame(timeMs, inputSnapshot = Object.freeze({})) {
        const now = timeMs / 1000;
        if (this.lastTimeSeconds === null) this.lastTimeSeconds = now;
        this.accumulator += Math.max(0, now - this.lastTimeSeconds);
        this.lastTimeSeconds = now;

        let steps = 0;
        while (this.accumulator + Number.EPSILON >= this.dt && steps < this.maxCatchUpSteps) {
            this.step(this.dt, inputSnapshot);
            this.accumulator -= this.dt;
            this.totalSteps += 1;
            steps += 1;
        }
        if (this.accumulator >= this.dt) {
            const dropped = Math.floor(this.accumulator / this.dt);
            this.droppedSteps += dropped;
            this.accumulator -= dropped * this.dt;
        }
        const alpha = Math.max(0, Math.min(1, this.accumulator / this.dt));
        this.render(alpha);
        return { steps, alpha, totalSteps: this.totalSteps, droppedSteps: this.droppedSteps };
    }
}
