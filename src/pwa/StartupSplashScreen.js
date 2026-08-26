export const MINIMUM_STARTUP_SPLASH_DURATION_MS = 1000;
export const STARTUP_SPLASH_PERCENT = Object.freeze({
    MINIMUM: 0,
    MAXIMUM: 100
});

export class StartupSplashScreen {
    constructor(
        root,
        {
            minimumDurationMs = MINIMUM_STARTUP_SPLASH_DURATION_MS,
            now = () => globalThis.performance.now(),
            schedule = (callback, delayMs) => globalThis.setTimeout(callback, delayMs)
        } = {}
    ) {
        if (!root) throw new Error("StartupSplashScreen requires a root element");
        if (!Number.isFinite(minimumDurationMs) || minimumDurationMs < 0) {
            throw new Error("StartupSplashScreen minimumDurationMs must be non-negative");
        }
        if (typeof now !== "function" || typeof schedule !== "function") {
            throw new Error("StartupSplashScreen requires timing functions");
        }
        this.root = root;
        this.minimumDurationMs = minimumDurationMs;
        this.now = now;
        this.schedule = schedule;
        this.visibleSinceMs = null;
        this.progressOutput = root.querySelector("[data-startup-progress]");
        this.progressBar = root.querySelector("[data-startup-progress-bar]");
        this.progressFill = root.querySelector("[data-startup-progress-fill]");
        if (!this.progressOutput || !this.progressBar || !this.progressFill) {
            throw new Error("StartupSplashScreen requires progress elements");
        }
        this.stepIds = Object.freeze([]);
        this.completedStepIds = new Set();
        this.renderProgress();
    }

    begin(stepIds) {
        if (!Array.isArray(stepIds) || stepIds.length === 0) {
            throw new Error("StartupSplashScreen requires at least one progress step");
        }
        const uniqueStepIds = new Set(stepIds);
        if (uniqueStepIds.size !== stepIds.length || stepIds.some((stepId) => typeof stepId !== "string" || !stepId)) {
            throw new Error("StartupSplashScreen progress steps must be unique non-empty strings");
        }
        this.stepIds = Object.freeze([...stepIds]);
        this.completedStepIds.clear();
        this.renderProgress();
    }

    completeStep(stepId) {
        if (!this.stepIds.includes(stepId)) throw new Error(`Unknown startup splash step: ${stepId}`);
        this.completedStepIds.add(stepId);
        this.renderProgress();
    }

    async track(stepId, pending) {
        const result = await pending;
        this.completeStep(stepId);
        return result;
    }

    percentage() {
        if (this.stepIds.length === 0) return STARTUP_SPLASH_PERCENT.MINIMUM;
        return Math.round((this.completedStepIds.size / this.stepIds.length) * STARTUP_SPLASH_PERCENT.MAXIMUM);
    }

    renderProgress() {
        const percentage = this.percentage();
        const label = `${percentage}%`;
        this.progressOutput.textContent = label;
        this.progressBar.setAttribute("aria-valuenow", String(percentage));
        this.progressBar.setAttribute("aria-valuetext", label);
        this.progressFill.style.width = label;
    }

    show() {
        if (this.visibleSinceMs === null) this.visibleSinceMs = this.now();
        this.root.hidden = false;
        this.root.setAttribute("aria-busy", "true");
    }

    async waitForMinimumDuration() {
        if (this.visibleSinceMs === null) this.show();
        const remainingMs = Math.max(0, this.minimumDurationMs - (this.now() - this.visibleSinceMs));
        if (remainingMs > 0) await new Promise((resolve) => this.schedule(resolve, remainingMs));
    }

    hide() {
        this.root.hidden = true;
        this.root.setAttribute("aria-busy", "false");
    }
}
