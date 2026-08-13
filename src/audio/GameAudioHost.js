import { AudioMixer } from "./AudioMixer.js";
import { AudioVoiceManager } from "./AudioVoiceManager.js";

export class GameAudioHost {
    constructor({ adapter, settings, clock, random, onStatus = () => {} }) {
        this.adapter = adapter;
        this.settings = settings;
        this.onStatus = onStatus;
        this.status = "loading";
        this.definition = null;
        this.preparation = null;
        this.mixer = new AudioMixer({ adapter, settings });
        this.voices = new AudioVoiceManager({ adapter, mixer: this.mixer, clock, random });
    }

    async prepare(definition) {
        this.definition = definition;
        this.#setStatus("loading", { completed: 0, total: Object.keys(definition.clips).length });
        await this.adapter.activate();
        const preparation = await this.adapter.prepare(definition, {
            onProgress: (progress) => this.#setStatus("loading", progress)
        });
        this.preparation = preparation;
        const failedRequiredClips = preparation.failures.filter(({ required }) => required);
        if (failedRequiredClips.length > 0) {
            this.#setStatus("failed", { failures: failedRequiredClips });
            throw new Error(
                `필수 오디오 준비 실패: ${failedRequiredClips.map(({ clipKey, failureCode }) => `${clipKey} (${failureCode})`).join(", ")}`
            );
        }
        for (const cue of Object.values(definition.cues)) {
            const available = cue.variations.some(({ clipKey }) => preparation.availableClipKeys.has(clipKey));
            if (!available && cue.required) {
                this.#setStatus("failed", { cueId: cue.id });
                throw new Error(`필수 오디오 cue '${cue.id}'에 재생 가능한 source가 없습니다.`);
            }
        }
        this.voices.setDefinition(definition, preparation.availableClipKeys);
        this.#setStatus(preparation.failures.length > 0 ? "degraded" : "ready", preparation);
        return this.snapshot();
    }

    play(cueId, request) {
        if (!new Set(["ready", "degraded"]).has(this.status)) return false;
        return this.voices.play(cueId, request);
    }

    startLoop(cueId, lifecycleKey, request) {
        if (!new Set(["ready", "degraded"]).has(this.status)) return false;
        return this.voices.startLoop(cueId, lifecycleKey, request);
    }

    stopLoop(lifecycleKey, fadeMs) {
        return this.voices.stopLoop(lifecycleKey, fadeMs);
    }

    stopAll() {
        this.voices.stopAll();
    }

    suspend() {
        if (!new Set(["ready", "degraded"]).has(this.status)) return;
        this.voices.suspend();
        this.#setStatus("suspended", this.preparation);
    }

    async resume() {
        if (this.status !== "suspended") return true;
        try {
            await this.voices.resume();
            this.#setStatus(this.preparation?.failures.length ? "degraded" : "ready", this.preparation);
            return true;
        } catch {
            return false;
        }
    }

    release() {
        this.voices.release();
        this.mixer.release();
    }

    snapshot() {
        const preparation = this.preparation;
        return Object.freeze({
            status: this.status,
            packId: this.definition?.id ?? null,
            packages: Object.freeze(
                Object.fromEntries(
                    Object.entries(this.definition?.packages ?? {}).map(([category, definition]) => [
                        category,
                        definition.id
                    ])
                )
            ),
            contextState: this.adapter.contextState(),
            requiredReady: preparation?.requiredReady ?? 0,
            requiredTotal: preparation?.requiredTotal ?? 0,
            optionalReady: preparation?.optionalReady ?? 0,
            optionalTotal: preparation?.optionalTotal ?? 0,
            clips: preparation?.clips ?? Object.freeze([]),
            failures: preparation?.failures ?? Object.freeze([]),
            voices: this.definition ? this.voices.diagnostics() : null
        });
    }

    #setStatus(status, detail) {
        this.status = status;
        this.onStatus(Object.freeze({ status, detail }));
    }
}
