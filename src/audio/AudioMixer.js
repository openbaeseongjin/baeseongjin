import { AUDIO_GROUPS } from "./AudioManifest.js";
import { dbToLinearGain } from "./AudioSpatializer.js";

export class AudioMixer {
    constructor({ adapter, settings }) {
        this.adapter = adapter;
        this.settings = settings;
        this.ducking = new Map();
        this.nextDuckingId = 1;
        this.releaseSettings = settings.subscribe((value) => this.#applySettings(value));
    }

    beginDucking(entries) {
        if (!entries?.length) return null;
        const id = this.nextDuckingId++;
        this.ducking.set(id, entries);
        for (const entry of entries) this.#applyGroup(entry.group, entry.attackMs);
        return id;
    }

    endDucking(id) {
        const entries = this.ducking.get(id);
        if (!entries) return;
        this.ducking.delete(id);
        for (const entry of entries) this.#applyGroup(entry.group, entry.releaseMs);
    }

    release() {
        this.releaseSettings?.();
        this.releaseSettings = null;
        this.ducking.clear();
    }

    #applySettings(value) {
        this.currentSettings = value;
        this.adapter.setMasterGain(
            value.muted || value.gainsDb.master === null ? 0 : dbToLinearGain(value.gainsDb.master),
            0
        );
        for (const group of AUDIO_GROUPS) this.#applyGroup(group, 0);
    }

    #applyGroup(group, transitionMs) {
        const userDb = this.currentSettings?.gainsDb[group];
        let duckDb = 0;
        for (const entries of this.ducking.values()) {
            for (const entry of entries) {
                if (entry.group === group) duckDb = Math.min(duckDb, entry.gainDb);
            }
        }
        const gain = userDb === null ? 0 : dbToLinearGain(userDb + duckDb);
        this.adapter.setGroupGain(group, gain, transitionMs);
    }
}
