export const DEBUG_PANEL_HOLD_MS = 1000;

export class DebugPanel {
    constructor({
        trigger,
        settings,
        areaIds,
        documentTarget = globalThis.document,
        windowTarget = globalThis.window,
        onActivate = null
    }) {
        if (!trigger || !settings) throw new Error("DebugPanel requires trigger and settings");
        this.trigger = trigger;
        this.settings = settings;
        this.areaIds = Object.freeze([...areaIds]);
        this.documentTarget = documentTarget;
        this.windowTarget = windowTarget;
        this.onActivate = onActivate;
        this.metricsInput = null;
        this.startAreaSelect = null;
        this.applyButton = null;
        this.holdTimerId = null;
        this.lastActivatedAt = 0;
        this.attached = false;
        this.onPointerDown = (event) => {
            if (event.pointerType === "mouse" && event.button !== 0) return;
            this.beginHold();
        };
        this.onPointerEnd = () => this.cancelHold();
        this.onContextMenu = (event) => {
            if (this.windowTarget.performance.now() - this.lastActivatedAt <= 400) event.preventDefault();
        };
        this.onClickCapture = (event) => {
            if (this.windowTarget.performance.now() - this.lastActivatedAt > 400) return;
            event.preventDefault();
            event.stopPropagation();
            this.lastActivatedAt = 0;
        };
        this.onMetricsChange = () => this.settings.setMetrics(this.metricsInput.checked);
        this.onStartAreaChange = () =>
            this.settings.setStartAreaId(this.startAreaSelect.value.trim() ? this.startAreaSelect.value : null);
        this.onApplyClick = () => this.onApply?.();
    }

    beginHold() {
        this.cancelHold();
        this.trigger.classList.add("settings-trigger--holding");
        this.holdTimerId = this.windowTarget.setTimeout(() => {
            this.holdTimerId = null;
            this.trigger.classList.remove("settings-trigger--holding");
            this.lastActivatedAt = this.windowTarget.performance.now();
            this.onActivate?.();
        }, DEBUG_PANEL_HOLD_MS);
    }

    cancelHold() {
        if (this.holdTimerId !== null) {
            this.windowTarget.clearTimeout(this.holdTimerId);
            this.holdTimerId = null;
        }
        this.trigger.classList.remove("settings-trigger--holding");
    }

    attach() {
        if (this.attached) return false;
        this.metricsInput = this.documentTarget.querySelector("[data-debug-metrics]");
        this.startAreaSelect = this.documentTarget.querySelector("[data-debug-start-area]");
        this.applyButton = this.documentTarget.querySelector("[data-debug-apply]");
        if (!this.metricsInput || !this.startAreaSelect || !this.applyButton) {
            throw new Error("DebugPanel is missing panel controls");
        }
        const existingAreaIds = new Set([...this.startAreaSelect.options].map(({ value }) => value));
        for (const areaId of this.areaIds) {
            if (existingAreaIds.has(areaId)) continue;
            const option = this.documentTarget.createElement("option");
            option.value = areaId;
            option.textContent = areaId;
            this.startAreaSelect.append(option);
        }
        this.trigger.addEventListener("pointerdown", this.onPointerDown);
        this.trigger.addEventListener("pointerup", this.onPointerEnd);
        this.trigger.addEventListener("pointercancel", this.onPointerEnd);
        this.trigger.addEventListener("pointerleave", this.onPointerEnd);
        this.trigger.addEventListener("contextmenu", this.onContextMenu);
        this.trigger.addEventListener("click", this.onClickCapture, true);
        this.metricsInput.addEventListener("change", this.onMetricsChange);
        this.startAreaSelect.addEventListener("change", this.onStartAreaChange);
        this.applyButton.addEventListener("click", this.onApplyClick);
        this.unsubscribe = this.settings.subscribe((value) => this.render(value));
        this.attached = true;
        return true;
    }

    render(value) {
        this.metricsInput.checked = value.metrics;
        this.startAreaSelect.value = value.startAreaId ?? "";
    }

    detach() {
        if (!this.attached) return false;
        this.cancelHold();
        this.trigger.removeEventListener("pointerdown", this.onPointerDown);
        this.trigger.removeEventListener("pointerup", this.onPointerEnd);
        this.trigger.removeEventListener("pointercancel", this.onPointerEnd);
        this.trigger.removeEventListener("pointerleave", this.onPointerEnd);
        this.trigger.removeEventListener("contextmenu", this.onContextMenu);
        this.trigger.removeEventListener("click", this.onClickCapture, true);
        this.metricsInput.removeEventListener("change", this.onMetricsChange);
        this.startAreaSelect.removeEventListener("change", this.onStartAreaChange);
        this.applyButton.removeEventListener("click", this.onApplyClick);
        this.unsubscribe?.();
        this.attached = false;
        return true;
    }
}
