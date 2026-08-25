export const MINIMUM_STARTUP_SPLASH_DURATION_MS = 1000;

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
