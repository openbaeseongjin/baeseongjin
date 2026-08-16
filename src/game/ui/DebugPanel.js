export const DEBUG_PANEL_LONG_PRESS_MS = 1000;

export class DebugPanel {
    constructor({
        root,
        trigger,
        settings,
        areaIds,
        documentTarget = globalThis.document,
        windowTarget = globalThis.window
    }) {
        if (!root || !trigger || !settings) throw new Error("DebugPanel requires root, trigger and settings");
        this.root = root;
        this.trigger = trigger;
        this.settings = settings;
        this.areaIds = Object.freeze([...areaIds]);
        this.documentTarget = documentTarget;
        this.windowTarget = windowTarget;
        this.closeButton = null;
        this.metricsInput = null;
        this.startAreaSelect = null;
        this.pressStartedAt = null;
        this.activePointerId = null;
        this.longPressFired = false;
        this.previouslyFocused = null;
        this.attached = false;
        this.onPointerDown = (event) => {
            if (this.activePointerId !== null || (event.button !== undefined && event.button !== 0)) return;
            this.activePointerId = event.pointerId;
            this.pressStartedAt = this.windowTarget.performance.now();
        };
        this.onDocumentPointerUp = (event) => {
            if (event.pointerId !== this.activePointerId) return;
            this.completeLongPress();
        };
        this.onPointerAbort = (event) => {
            if (event?.pointerId !== undefined && event.pointerId !== this.activePointerId) return;
            this.resetLongPress();
        };
        this.onWindowBlur = () => this.resetLongPress();
        this.onVisibilityChange = () => {
            if (this.documentTarget.hidden) this.resetLongPress();
        };
        this.onContextMenu = (event) => {
            if (this.longPressFired) event.preventDefault();
        };
        this.onClickCapture = (event) => {
            if (!this.longPressFired) return;
            event.preventDefault();
            event.stopPropagation();
            this.longPressFired = false;
        };
        this.onMetricsChange = () => this.settings.setMetrics(this.metricsInput.checked);
        this.onStartAreaChange = () =>
            this.settings.setStartAreaId(this.startAreaSelect.value.trim() ? this.startAreaSelect.value : null);
        this.onClose = () => this.hide();
        this.onBackdrop = (event) => {
            if (event.target === this.root) this.hide();
        };
        this.onKeyDown = (event) => {
            if (event.key !== "Escape" || this.root.hidden) return;
            event.preventDefault();
            this.hide();
        };
    }

    completeLongPress() {
        if (this.pressStartedAt === null) return;
        const heldMs = this.windowTarget.performance.now() - this.pressStartedAt;
        this.resetLongPress();
        if (heldMs < DEBUG_PANEL_LONG_PRESS_MS) return;
        this.longPressFired = true;
        this.show();
        this.windowTarget.setTimeout(() => {
            this.longPressFired = false;
        }, 0);
    }

    resetLongPress() {
        this.pressStartedAt = null;
        this.activePointerId = null;
    }

    attach() {
        if (this.attached) return false;
        this.closeButton = this.root.querySelector("[data-debug-close]");
        this.metricsInput = this.root.querySelector("[data-debug-metrics]");
        this.startAreaSelect = this.root.querySelector("[data-debug-start-area]");
        if (!this.closeButton || !this.metricsInput || !this.startAreaSelect) {
            throw new Error("DebugPanel is missing dialog controls");
        }
        for (const areaId of this.areaIds) {
            const option = this.documentTarget.createElement("option");
            option.value = areaId;
            option.textContent = areaId;
            this.startAreaSelect.append(option);
        }
        this.trigger.addEventListener("pointerdown", this.onPointerDown);
        this.documentTarget.addEventListener("pointerup", this.onDocumentPointerUp);
        this.documentTarget.addEventListener("pointercancel", this.onPointerAbort);
        this.trigger.addEventListener("pointerleave", this.onPointerAbort);
        this.windowTarget.addEventListener("blur", this.onWindowBlur);
        this.documentTarget.addEventListener("visibilitychange", this.onVisibilityChange);
        this.trigger.addEventListener("contextmenu", this.onContextMenu);
        this.trigger.addEventListener("click", this.onClickCapture, true);
        this.closeButton.addEventListener("click", this.onClose);
        this.root.addEventListener("pointerdown", this.onBackdrop);
        this.documentTarget.addEventListener("keydown", this.onKeyDown, true);
        this.metricsInput.addEventListener("change", this.onMetricsChange);
        this.startAreaSelect.addEventListener("change", this.onStartAreaChange);
        this.unsubscribe = this.settings.subscribe((value) => this.render(value));
        this.attached = true;
        return true;
    }

    render(value) {
        this.metricsInput.checked = value.metrics;
        this.startAreaSelect.value = value.startAreaId ?? "";
    }

    show() {
        this.previouslyFocused = this.documentTarget.activeElement;
        this.root.hidden = false;
        this.closeButton.focus();
    }

    hide() {
        if (this.root.hidden) return;
        this.root.hidden = true;
        this.previouslyFocused?.focus?.();
        this.previouslyFocused = null;
    }

    detach() {
        if (!this.attached) return false;
        this.resetLongPress();
        this.hide();
        this.trigger.removeEventListener("pointerdown", this.onPointerDown);
        this.documentTarget.removeEventListener("pointerup", this.onDocumentPointerUp);
        this.documentTarget.removeEventListener("pointercancel", this.onPointerAbort);
        this.trigger.removeEventListener("pointerleave", this.onPointerAbort);
        this.windowTarget.removeEventListener("blur", this.onWindowBlur);
        this.documentTarget.removeEventListener("visibilitychange", this.onVisibilityChange);
        this.trigger.removeEventListener("contextmenu", this.onContextMenu);
        this.trigger.removeEventListener("click", this.onClickCapture, true);
        this.closeButton.removeEventListener("click", this.onClose);
        this.root.removeEventListener("pointerdown", this.onBackdrop);
        this.documentTarget.removeEventListener("keydown", this.onKeyDown, true);
        this.metricsInput.removeEventListener("change", this.onMetricsChange);
        this.startAreaSelect.removeEventListener("change", this.onStartAreaChange);
        this.unsubscribe?.();
        this.attached = false;
        return true;
    }
}
