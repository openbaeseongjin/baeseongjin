import {
    ROPE_TUNING_FIELDS,
    resolveEffectiveRopeConfig,
    resolveEffectiveRopeDisabledSeconds
} from "../src/game/config.js";
import { DebugSettings } from "../src/game/metrics/DebugSettings.js";
import { restartSingleGameForDebugSettings } from "../src/game/runtime/SingleGameDebugRestart.js";
import { DebugPanel } from "../src/game/ui/DebugPanel.js";
import { createCurrentGameSimulation } from "../src/game/simulation/GameSimulationFactory.js";

const labels = new Map([
    ["hookSpeed", "훅 속도"],
    ["hookFlightRatio.numerator", "비행 수명 분자"],
    ["hookFlightRatio.denominator", "비행 수명 분모"],
    ["hookReloadSeconds", "재발사 대기"],
    ["attachBufferSeconds", "부착 버퍼"],
    ["swingDragThresholdViewportRatio", "드래그 임계 비율"],
    ["swingDragMinHoldSeconds", "최소 홀드"],
    ["swingImpulse", "스윙 임펄스"],
    ["handOffset.x", "손 오프셋 X"],
    ["handOffset.y", "손 오프셋 Y"],
    ["releaseAngularTransfer", "해제 접선 전달"],
    ["ropeDisabledSeconds", "절단 후 차단 시간"]
]);

const fieldset = document.querySelector("[data-debug-rope-tuning]");
const derived = fieldset.querySelector(".derived");
for (const { path } of ROPE_TUNING_FIELDS) {
    const label = document.createElement("label");
    const text = document.createElement("span");
    const input = document.createElement("input");
    text.textContent = labels.get(path);
    input.type = "number";
    input.dataset.debugRopeField = path;
    label.append(text, input);
    fieldset.insertBefore(label, derived);
}

const settings = new DebugSettings();
const panel = new DebugPanel({
    trigger: document.querySelector("[data-debug-trigger]"),
    settings,
    areaIds: ["sector-01-01"]
});
panel.attach();
const runOutput = document.querySelector("[data-harness-run]");
let generation = 1;
let currentApp = { stop() {} };
panel.onApply = () => {
    currentApp = restartSingleGameForDebugSettings({
        currentApp,
        debugSettings: settings.snapshot(),
        createApp: (debug) => {
            generation += 1;
            return {
                stop() {},
                start() {
                    const simulation = createCurrentGameSimulation({
                        worldSeed: 9182,
                        playerId: "visual-debug-player",
                        debugAugmentIds: debug.debugAugmentIds,
                        ropeConfig: resolveEffectiveRopeConfig(debug.ropeTuning),
                        ropeDisabledSeconds: resolveEffectiveRopeDisabledSeconds(debug.ropeTuning)
                    });
                    const selected = simulation.playerState("visual-debug-player").selectedAugmentIds;
                    const reach = simulation.snapshot().maxAttachDistance;
                    runOutput.textContent = `Run ${generation} · 적용 사거리 ${reach.toFixed(1)}px · ${selected.join(", ") || "증강 없음"}`;
                }
            };
        }
    });
};
let singleMode = true;
document.querySelector("[data-harness-mode]").addEventListener("click", () => {
    singleMode = !singleMode;
    panel.setRopeTuningEnabled(singleMode);
});
globalThis.debugRopeTuningHarness = Object.freeze({ panel, settings });
document.body.dataset.ready = "true";
