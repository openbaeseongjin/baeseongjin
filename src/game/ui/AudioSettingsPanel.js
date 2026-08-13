import { AUDIO_GAIN_KEYS, DEFAULT_AUDIO_SETTINGS } from "../../audio/AudioSettings.js";

const MUTED_SLIDER_VALUE = -60;

function displayGain(gainDb) {
    return gainDb === null ? "음소거" : `${gainDb} dB`;
}

export class AudioSettingsPanel {
    constructor({ root, settings } = {}) {
        if (!root || !settings) throw new Error("AudioSettingsPanel requires root and settings");
        this.root = root;
        this.settings = settings;
        this.mute = null;
        this.reset = null;
        this.status = null;
        this.rows = new Map();
        this.unsubscribe = null;
        this.attached = false;
        this.onMute = () => settings.setMuted(this.mute.checked);
        this.onReset = () => settings.reset();
    }

    attach() {
        if (this.attached) return false;
        this.mute = this.root.querySelector("[data-audio-muted]");
        this.reset = this.root.querySelector("[data-audio-reset]");
        this.status = this.root.querySelector("[data-audio-status]");
        if (!this.mute || !this.reset) throw new Error("AudioSettingsPanel is missing master controls");
        const rows = new Map(
            AUDIO_GAIN_KEYS.map((key) => {
                const input = this.root.querySelector(`[data-audio-gain="${key}"]`);
                const output = this.root.querySelector(`[data-audio-gain-output="${key}"]`);
                if (!input || !output) throw new Error(`AudioSettingsPanel is missing '${key}' controls`);
                const onInput = () => {
                    const value = Number(input.value);
                    this.settings.setGainDb(key, value <= MUTED_SLIDER_VALUE ? null : value);
                };
                return [key, { input, output, onInput }];
            })
        );
        this.rows = rows;
        for (const { input, onInput } of this.rows.values()) input.addEventListener("input", onInput);
        this.mute.addEventListener("change", this.onMute);
        this.reset.addEventListener("click", this.onReset);
        this.unsubscribe = this.settings.subscribe((value) => this.render(value));
        this.attached = true;
        return true;
    }

    render(value) {
        this.mute.checked = value.muted;
        for (const [key, { input, output }] of this.rows) {
            const gainDb = value.gainsDb[key];
            input.value = String(gainDb ?? MUTED_SLIDER_VALUE);
            output.value = displayGain(gainDb);
            output.textContent = displayGain(gainDb);
        }
        this.reset.disabled =
            value.muted === DEFAULT_AUDIO_SETTINGS.muted &&
            AUDIO_GAIN_KEYS.every((key) => value.gainsDb[key] === DEFAULT_AUDIO_SETTINGS.gainsDb[key]);
    }

    setRuntimeStatus(status, snapshot = null) {
        if (!this.status) return;
        this.status.hidden = status !== "degraded" && status !== "failed";
        this.status.textContent =
            status === "failed"
                ? "필수 음원을 준비하지 못했습니다. 시작 화면에서 다시 시도해 주세요."
                : snapshot?.failures?.length
                  ? `일부 음원 사용 불가 (${snapshot.failures.length})`
                  : "";
    }

    detach() {
        if (!this.attached) return false;
        this.unsubscribe?.();
        this.unsubscribe = null;
        this.mute.removeEventListener("change", this.onMute);
        this.reset.removeEventListener("click", this.onReset);
        for (const { input, onInput } of this.rows.values()) input.removeEventListener("input", onInput);
        this.rows.clear();
        this.attached = false;
        return true;
    }

    release() {
        this.detach();
    }
}
