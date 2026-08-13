import { AUDIO_GROUPS } from "./AudioManifest.js";

export const AUDIO_SETTINGS_STORAGE_KEY = "baeseongjin.audio-settings.v1";
export const AUDIO_SETTINGS_VERSION = 1;
export const AUDIO_GAIN_KEYS = Object.freeze(["master", ...AUDIO_GROUPS]);
export const MUTED_GAIN_DB = null;

const DEFAULT_GAINS_DB = Object.freeze({
    master: -6,
    gameplay: 0,
    ui: -4,
    ambience: -10,
    bgm: -8
});

export const DEFAULT_AUDIO_SETTINGS = Object.freeze({
    version: AUDIO_SETTINGS_VERSION,
    muted: false,
    gainsDb: DEFAULT_GAINS_DB
});

function cloneSettings(settings) {
    return Object.freeze({
        version: AUDIO_SETTINGS_VERSION,
        muted: settings.muted,
        gainsDb: Object.freeze({ ...settings.gainsDb })
    });
}

function isGain(value) {
    return value === MUTED_GAIN_DB || (Number.isFinite(value) && value >= -60 && value <= 0);
}

export function normalizeAudioSettings(value) {
    if (!value || typeof value !== "object" || Array.isArray(value) || value.version !== AUDIO_SETTINGS_VERSION) {
        return DEFAULT_AUDIO_SETTINGS;
    }
    if (typeof value.muted !== "boolean" || !value.gainsDb || typeof value.gainsDb !== "object") {
        return DEFAULT_AUDIO_SETTINGS;
    }
    const gainsDb = {};
    for (const key of AUDIO_GAIN_KEYS) {
        if (!isGain(value.gainsDb[key])) return DEFAULT_AUDIO_SETTINGS;
        gainsDb[key] = value.gainsDb[key];
    }
    return cloneSettings({ muted: value.muted, gainsDb });
}

function readStoredSettings(storage, key) {
    if (!storage?.getItem) return DEFAULT_AUDIO_SETTINGS;
    try {
        const value = storage.getItem(key);
        return value === null ? DEFAULT_AUDIO_SETTINGS : normalizeAudioSettings(JSON.parse(value));
    } catch {
        return DEFAULT_AUDIO_SETTINGS;
    }
}

export class AudioSettings {
    constructor({ storage = null, key = AUDIO_SETTINGS_STORAGE_KEY } = {}) {
        this.storage = storage;
        this.key = key;
        this.value = readStoredSettings(storage, key);
        this.listeners = new Set();
    }

    snapshot() {
        return this.value;
    }

    subscribe(listener) {
        if (typeof listener !== "function") throw new Error("audio settings listener must be a function");
        this.listeners.add(listener);
        listener(this.value);
        return () => this.listeners.delete(listener);
    }

    setMuted(muted) {
        if (typeof muted !== "boolean") throw new Error("audio muted setting must be boolean");
        this.#replace({ ...this.value, muted });
    }

    setGainDb(group, gainDb) {
        if (!AUDIO_GAIN_KEYS.includes(group)) throw new Error(`unknown audio gain group '${group}'`);
        if (!isGain(gainDb)) throw new Error(`audio gain '${group}' must be mute or between -60 and 0 dB`);
        this.#replace({ ...this.value, gainsDb: { ...this.value.gainsDb, [group]: gainDb } });
    }

    reset() {
        this.#replace(DEFAULT_AUDIO_SETTINGS);
    }

    #replace(next) {
        this.value = cloneSettings(next);
        try {
            this.storage?.setItem?.(this.key, JSON.stringify(this.value));
        } catch {
            // Storage is optional; the in-memory setting remains usable.
        }
        for (const listener of this.listeners) listener(this.value);
    }
}
