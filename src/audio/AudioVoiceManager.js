import { calculateSpatialAudio, dbToLinearGain, neutralSpatialAudio } from "./AudioSpatializer.js";

function oldestLowestPriority(records) {
    return records.reduce((selected, record) => {
        if (!selected || record.priority < selected.priority) return record;
        if (record.priority === selected.priority && record.startedAt < selected.startedAt) return record;
        return selected;
    }, null);
}

export class AudioVoiceManager {
    constructor({ adapter, mixer, maxVoices = 32, clock = () => performance.now(), random = Math.random } = {}) {
        this.adapter = adapter;
        this.mixer = mixer;
        this.maxVoices = maxVoices;
        this.clock = clock;
        this.random = random;
        this.definition = null;
        this.availableClipKeys = new Set();
        this.voices = [];
        this.loops = new Map();
        this.lastTriggerAt = new Map();
        this.lastVariation = new Map();
        this.causalIds = new Map();
        this.counters = { cooldownDrops: 0, priorityDrops: 0, voiceSteals: 0, deduplicated: 0, invalidRequests: 0 };
    }

    setDefinition(definition, availableClipKeys) {
        this.definition = definition;
        this.availableClipKeys = new Set(availableClipKeys);
    }

    play(cueId, request = {}) {
        const cue = this.#cue(cueId, "one-shot");
        if (!cue) return false;
        const now = this.clock();
        if (request.causalId && this.causalIds.has(request.causalId)) {
            this.counters.deduplicated += 1;
            return false;
        }
        const cooldownKey = `${cueId}:${request.emitterId ?? "global"}`;
        const lastTriggerAt = this.lastTriggerAt.get(cooldownKey) ?? Number.NEGATIVE_INFINITY;
        if (now - lastTriggerAt < cue.retriggerCooldownMs) {
            this.counters.cooldownDrops += 1;
            return false;
        }
        const variation = this.#selectVariation(cue);
        if (!variation) return false;
        const spatial = this.#spatial(cue, request);
        if (!spatial) return false;
        if (!this.#reserveVoice(cue)) return false;
        const pitchOffset = (this.random() * 2 - 1) * cue.pitchRandomizationPercent;
        const gainOffsetDb = (this.random() * 2 - 1) * cue.gainRandomizationDb;
        const duckingId = this.mixer.beginDucking(cue.ducking);
        const record = {
            kind: "one-shot",
            cueId,
            priority: cue.priority,
            startedAt: now,
            handle: null,
            duckingId
        };
        const onEnded = () => this.#removeVoice(record);
        try {
            record.handle = this.adapter.playOneShot({
                clipKey: variation.clipKey,
                group: cue.group,
                gain: dbToLinearGain(cue.gainDb + gainOffsetDb) * spatial.gain,
                pitchRatio: 1 + pitchOffset / 100,
                pan: spatial.pan,
                onEnded
            });
        } catch {
            this.mixer.endDucking(duckingId);
            this.counters.invalidRequests += 1;
            return false;
        }
        this.voices.push(record);
        this.lastTriggerAt.set(cooldownKey, now);
        if (request.causalId) this.#rememberCausalId(request.causalId, now);
        return true;
    }

    startLoop(cueId, lifecycleKey, request = {}) {
        const cue = this.#cue(cueId, "loop");
        if (!cue || typeof lifecycleKey !== "string" || !lifecycleKey) return false;
        const existing = this.loops.get(lifecycleKey);
        const spatial = this.#spatial(cue, request);
        if (!spatial) return false;
        if (existing?.cueId === cueId) {
            existing.handle.setSpatial?.({ pan: spatial.pan, gain: dbToLinearGain(cue.gainDb) * spatial.gain });
            return true;
        }
        const variation = this.#selectVariation(cue);
        if (!variation) return false;
        if (!existing && !this.#reserveGlobal(cue.priority)) return false;
        let handle;
        try {
            handle = this.adapter.playLoop({
                clipKey: variation.clipKey,
                group: cue.group,
                gain: dbToLinearGain(cue.gainDb) * spatial.gain,
                pan: spatial.pan,
                fadeInMs: cue.transitionMs
            });
        } catch {
            this.counters.invalidRequests += 1;
            return false;
        }
        if (existing) existing.handle.stop(existing.transitionMs);
        this.loops.set(lifecycleKey, {
            kind: "loop",
            lifecycleKey,
            cueId,
            priority: cue.priority,
            startedAt: this.clock(),
            transitionMs: cue.transitionMs,
            handle
        });
        return true;
    }

    stopLoop(lifecycleKey, fadeMs = null) {
        const existing = this.loops.get(lifecycleKey);
        if (!existing) return false;
        existing.handle.stop(fadeMs ?? existing.transitionMs);
        this.loops.delete(lifecycleKey);
        return true;
    }

    stopAll() {
        for (const record of [...this.voices]) record.handle.stop(0);
        for (const loop of this.loops.values()) loop.handle.stop(0);
        this.loops.clear();
    }

    suspend() {
        for (const record of [...this.voices]) record.handle.stop(0);
        this.adapter.suspend();
    }

    async resume() {
        return this.adapter.resume();
    }

    release() {
        this.stopAll();
        this.adapter.release();
    }

    diagnostics() {
        const groups = { gameplay: 0, ui: 0, ambience: 0, bgm: 0 };
        for (const voice of this.voices) groups[this.definition.cues[voice.cueId].group] += 1;
        for (const loop of this.loops.values()) groups[this.definition.cues[loop.cueId].group] += 1;
        return Object.freeze({
            activeVoices: this.voices.length + this.loops.size,
            oneShotVoices: this.voices.length,
            loopVoices: this.loops.size,
            groups: Object.freeze(groups),
            ...this.counters
        });
    }

    #cue(cueId, kind) {
        const cue = this.definition?.cues[cueId];
        if (!cue || cue.kind !== kind) {
            this.counters.invalidRequests += 1;
            return null;
        }
        return cue;
    }

    #availableVariations(cue) {
        return cue.variations.filter((variation) => this.availableClipKeys.has(variation.clipKey));
    }

    #selectVariation(cue) {
        const variations = this.#availableVariations(cue);
        if (variations.length === 0) {
            this.counters.invalidRequests += 1;
            return null;
        }
        const previous = this.lastVariation.get(cue.id);
        const candidates =
            variations.length > 1 ? variations.filter(({ clipKey }) => clipKey !== previous) : variations;
        const totalWeight = candidates.reduce((sum, variation) => sum + variation.weight, 0);
        let selection = this.random() * totalWeight;
        let selected = candidates.at(-1);
        for (const variation of candidates) {
            selection -= variation.weight;
            if (selection <= 0) {
                selected = variation;
                break;
            }
        }
        this.lastVariation.set(cue.id, selected.clipKey);
        return selected;
    }

    #spatial(cue, request) {
        if (cue.spatial === "none") return neutralSpatialAudio();
        try {
            return calculateSpatialAudio({
                listener: request.listener,
                source: request.position,
                visibleWorldBounds: request.visibleWorldBounds,
                minGainDb: cue.minGainDb
            });
        } catch {
            this.counters.invalidRequests += 1;
            return null;
        }
    }

    #reserveVoice(cue) {
        const cueVoices = this.voices.filter(({ cueId }) => cueId === cue.id);
        if (cueVoices.length >= cue.maxVoices && !this.#stealOrDrop(cueVoices, cue.priority)) return false;
        if (!this.#reserveGlobal(cue.priority)) return false;
        return true;
    }

    #reserveGlobal(priority) {
        if (this.voices.length + this.loops.size < this.maxVoices) return true;
        return this.#stealOrDrop([...this.voices, ...this.loops.values()], priority);
    }

    #stealOrDrop(candidates, newPriority) {
        const candidate = oldestLowestPriority(candidates);
        if (!candidate || candidate.priority > newPriority) {
            this.counters.priorityDrops += 1;
            return false;
        }
        this.counters.voiceSteals += 1;
        candidate.handle.stop(0);
        this.#removeRecord(candidate);
        return true;
    }

    #removeVoice(record) {
        this.#removeRecord(record);
    }

    #removeRecord(record) {
        if (record.kind === "loop") {
            if (this.loops.get(record.lifecycleKey) === record) this.loops.delete(record.lifecycleKey);
            return;
        }
        const index = this.voices.indexOf(record);
        if (index >= 0) this.voices.splice(index, 1);
        this.mixer.endDucking(record.duckingId);
    }

    #rememberCausalId(causalId, now) {
        this.causalIds.set(causalId, now);
        while (this.causalIds.size > 256) this.causalIds.delete(this.causalIds.keys().next().value);
    }
}
