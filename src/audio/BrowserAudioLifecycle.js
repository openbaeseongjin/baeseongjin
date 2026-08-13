export class BrowserAudioLifecycle {
    constructor({ host, bindings, windowTarget, documentTarget, onResumeRequired = () => {} }) {
        this.host = host;
        this.bindings = bindings;
        this.windowTarget = windowTarget;
        this.documentTarget = documentTarget;
        this.onResumeRequired = onResumeRequired;
        this.pendingResume = false;
        this.onVisibilityChange = () => this.#handleVisibility();
        this.onUserActivation = () => this.#retryResume();
    }

    attach() {
        this.documentTarget.addEventListener("visibilitychange", this.onVisibilityChange);
        this.windowTarget.addEventListener("pointerdown", this.onUserActivation);
        this.windowTarget.addEventListener("keydown", this.onUserActivation);
    }

    release() {
        this.documentTarget.removeEventListener("visibilitychange", this.onVisibilityChange);
        this.windowTarget.removeEventListener("pointerdown", this.onUserActivation);
        this.windowTarget.removeEventListener("keydown", this.onUserActivation);
    }

    async #handleVisibility() {
        if (this.documentTarget.hidden) {
            this.host.suspend();
            return;
        }
        const resumed = await this.host.resume();
        this.pendingResume = !resumed;
        this.onResumeRequired(this.pendingResume);
        if (resumed) this.bindings.resync();
    }

    async #retryResume() {
        if (!this.pendingResume && this.host.status !== "suspended") return;
        const resumed = await this.host.resume();
        this.pendingResume = !resumed;
        this.onResumeRequired(this.pendingResume);
        if (resumed) this.bindings.resync();
    }
}
