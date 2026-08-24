import {
    ROPE_TUNING_FIELDS,
    resolveEffectiveRopeConfig,
    resolveEffectiveRopeDisabledSeconds,
    ropeHookFlightSeconds,
    ropeHookReach
} from "../config.js";
import { AUGMENT_CATALOG, isAugmentCompatibleWithSelection } from "../augments/AugmentCatalog.js";
import { MAX_DEBUG_AUGMENT_COUNT } from "../metrics/DebugSettings.js";

export const DEBUG_PANEL_HOLD_MS = 1000;

function valueAtPath(value, path) {
    return path.split(".").reduce((current, key) => current?.[key], value);
}

function setPath(target, path, value) {
    const [group, key] = path.split(".");
    if (!key) {
        target[group] = value;
        return;
    }
    target[group] ??= {};
    target[group][key] = value;
}

function inputNumber(input) {
    if (typeof input.value === "string" && input.value.trim() === "") return Number.NaN;
    return Number.isFinite(input.valueAsNumber) ? input.valueAsNumber : Number(input.value);
}

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
        this.ropeFieldset = null;
        this.ropeInputs = [];
        this.ropeResetButton = null;
        this.ropeReachOutput = null;
        this.ropeFlightOutput = null;
        this.ropeModeOutput = null;
        this.augmentFieldset = null;
        this.augmentSelects = [];
        this.augmentResetButton = null;
        this.augmentModeOutput = null;
        this.ropeTuningEnabled = true;
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
        this.onApplyClick = () => {
            if (!this.ropeTuningEnabled) return;
            if (this.ropeTuningEnabled) this.settings.setRopeTuning(this.ropeTuningFromInputs());
            this.onApply?.();
        };
        this.onRopeInput = () => this.renderRopeDerived(this.ropeTuningFromInputs());
        this.onRopeChange = () => this.settings.setRopeTuning(this.ropeTuningFromInputs());
        this.onRopeReset = () => this.settings.setRopeTuning(null);
        this.onAugmentReset = () => this.settings.setDebugAugmentIds([]);
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
        this.ropeFieldset = this.documentTarget.querySelector("[data-debug-rope-tuning]");
        this.ropeInputs = [...this.documentTarget.querySelectorAll("[data-debug-rope-field]")];
        this.ropeResetButton = this.documentTarget.querySelector("[data-debug-rope-reset]");
        this.ropeReachOutput = this.documentTarget.querySelector("[data-debug-rope-reach]");
        this.ropeFlightOutput = this.documentTarget.querySelector("[data-debug-rope-flight]");
        this.ropeModeOutput = this.documentTarget.querySelector("[data-debug-rope-mode]");
        this.augmentFieldset = this.documentTarget.querySelector("[data-debug-augment-loadout]");
        this.augmentSelects = [...this.documentTarget.querySelectorAll("[data-debug-augment-slot]")];
        this.augmentResetButton = this.documentTarget.querySelector("[data-debug-augment-reset]");
        this.augmentModeOutput = this.documentTarget.querySelector("[data-debug-augment-mode]");
        if (
            !this.metricsInput ||
            !this.startAreaSelect ||
            !this.applyButton ||
            !this.ropeFieldset ||
            this.ropeInputs.length !== ROPE_TUNING_FIELDS.length ||
            !this.ropeResetButton ||
            !this.ropeReachOutput ||
            !this.ropeFlightOutput ||
            !this.ropeModeOutput ||
            !this.augmentFieldset ||
            this.augmentSelects.length !== MAX_DEBUG_AUGMENT_COUNT ||
            !this.augmentResetButton ||
            !this.augmentModeOutput
        ) {
            throw new Error("DebugPanel is missing panel controls");
        }
        for (const input of this.ropeInputs) {
            const field = ROPE_TUNING_FIELDS.find(({ path }) => path === input.dataset.debugRopeField);
            if (!field) throw new Error(`unknown debug Rope field '${input.dataset.debugRopeField}'`);
            input.min = String(field.min);
            input.max = String(field.max);
            input.step = String(field.step);
        }
        const existingAreaIds = new Set([...this.startAreaSelect.options].map(({ value }) => value));
        for (const areaId of this.areaIds) {
            if (existingAreaIds.has(areaId)) continue;
            const option = this.documentTarget.createElement("option");
            option.value = areaId;
            option.textContent = areaId;
            this.startAreaSelect.append(option);
        }
        for (const select of this.augmentSelects) {
            const existingAugmentIds = new Set([...select.options].map(({ value }) => value));
            for (const augment of AUGMENT_CATALOG) {
                if (augment.category !== "rope" && augment.category !== "spell") continue;
                if (existingAugmentIds.has(augment.id)) continue;
                const option = this.documentTarget.createElement("option");
                option.value = augment.id;
                option.textContent = `[${augment.family}] ${augment.name}`;
                select.append(option);
            }
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
        for (const input of this.ropeInputs) {
            input.addEventListener("input", this.onRopeInput);
            input.addEventListener("change", this.onRopeChange);
        }
        this.ropeResetButton.addEventListener("click", this.onRopeReset);
        for (const [index, select] of this.augmentSelects.entries()) {
            select.addEventListener(
                "change",
                ((this.augmentChangeHandlers ??= [])[index] ??= () => this.changeAugmentSlot(index))
            );
        }
        this.augmentResetButton.addEventListener("click", this.onAugmentReset);
        this.unsubscribe = this.settings.subscribe((value) => this.render(value));
        this.renderRopeTuningAvailability();
        this.attached = true;
        return true;
    }

    render(value) {
        this.metricsInput.checked = value.metrics;
        this.startAreaSelect.value = value.startAreaId ?? "";
        const effective = resolveEffectiveRopeConfig(value.ropeTuning);
        for (const input of this.ropeInputs) {
            const path = input.dataset.debugRopeField;
            input.value = String(
                path === "ropeDisabledSeconds"
                    ? resolveEffectiveRopeDisabledSeconds(value.ropeTuning)
                    : valueAtPath(effective, path)
            );
        }
        this.renderRopeDerived(value.ropeTuning);
        this.renderAugmentLoadout(value.debugAugmentIds);
    }

    ropeTuningFromInputs() {
        const tuning = {};
        for (const input of this.ropeInputs) {
            const value = inputNumber(input);
            if (Number.isFinite(value)) setPath(tuning, input.dataset.debugRopeField, value);
        }
        return tuning;
    }

    renderRopeDerived(override) {
        const effective = resolveEffectiveRopeConfig(override);
        this.ropeFlightOutput.textContent = `${ropeHookFlightSeconds(effective).toFixed(3)}초`;
        this.ropeReachOutput.textContent = `${ropeHookReach(effective).toFixed(1)}px`;
    }

    changeAugmentSlot(index) {
        if (!this.ropeTuningEnabled) return;
        const current = [...this.settings.snapshot().debugAugmentIds];
        const next = current.slice(0, index);
        const selectedId = this.augmentSelects[index].value;
        if (selectedId) next.push(selectedId);
        for (const laterId of current.slice(index + 1)) {
            if (!isAugmentCompatibleWithSelection(laterId, next)) break;
            next.push(laterId);
        }
        this.settings.setDebugAugmentIds(next);
    }

    renderAugmentLoadout(debugAugmentIds) {
        const selected = [...debugAugmentIds];
        for (const [index, select] of this.augmentSelects.entries()) {
            const prefix = selected.slice(0, index);
            select.value = selected[index] ?? "";
            select.disabled = !this.ropeTuningEnabled || index > selected.length;
            for (const option of select.options) {
                if (!option.value) {
                    option.disabled = false;
                    continue;
                }
                option.disabled =
                    option.value !== selected[index] && !isAugmentCompatibleWithSelection(option.value, prefix);
            }
        }
        this.augmentModeOutput.textContent = this.ropeTuningEnabled
            ? `선택 ${selected.length}/${MAX_DEBUG_AUGMENT_COUNT} · 로프 패시브와 마법 슬롯 교체 카드만 선택할 수 있습니다.`
            : "멀티 세션에서는 비활성 · 공유 증강 loadout 프로토콜 미구현";
    }

    setRopeTuningEnabled(enabled) {
        this.ropeTuningEnabled = Boolean(enabled);
        if (this.attached) this.renderRopeTuningAvailability();
    }

    renderRopeTuningAvailability() {
        this.ropeFieldset.disabled = !this.ropeTuningEnabled;
        this.augmentFieldset.disabled = !this.ropeTuningEnabled;
        this.applyButton.disabled = !this.ropeTuningEnabled;
        this.ropeModeOutput.textContent = this.ropeTuningEnabled
            ? "싱글 전용 · 적용 버튼을 누르면 새 Run으로 즉시 재시작"
            : "멀티 세션에서는 비활성 · 공유 Rope 설정 프로토콜 미구현";
        this.renderAugmentLoadout(this.settings.snapshot().debugAugmentIds);
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
        for (const input of this.ropeInputs) {
            input.removeEventListener("input", this.onRopeInput);
            input.removeEventListener("change", this.onRopeChange);
        }
        this.ropeResetButton.removeEventListener("click", this.onRopeReset);
        for (const [index, select] of this.augmentSelects.entries()) {
            select.removeEventListener("change", this.augmentChangeHandlers[index]);
        }
        this.augmentResetButton.removeEventListener("click", this.onAugmentReset);
        this.unsubscribe?.();
        this.attached = false;
        return true;
    }
}
