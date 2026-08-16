export const DEBUG_SETTINGS_STORAGE_KEY = "baeseongjin.debug-settings.v1";
export const DEBUG_SETTINGS_VERSION = 1;

export const DEFAULT_DEBUG_SETTINGS = Object.freeze({
    version: DEBUG_SETTINGS_VERSION,
    metrics: false,
    startAreaId: null
});

function cloneSettings(settings) {
    return Object.freeze({
        version: DEBUG_SETTINGS_VERSION,
        metrics: settings.metrics,
        startAreaId: settings.startAreaId
    });
}

export function normalizeDebugSettings(value) {
    if (!value || typeof value !== "object" || Array.isArray(value) || value.version !== DEBUG_SETTINGS_VERSION) {
        return DEFAULT_DEBUG_SETTINGS;
    }
    if (typeof value.metrics !== "boolean") return DEFAULT_DEBUG_SETTINGS;
    if (value.startAreaId !== null && (typeof value.startAreaId !== "string" || !value.startAreaId.trim())) {
        return DEFAULT_DEBUG_SETTINGS;
    }
    return cloneSettings({ metrics: value.metrics, startAreaId: value.startAreaId });
}

function readStoredSettings(storage, key) {
    if (!storage?.getItem) return DEFAULT_DEBUG_SETTINGS;
    try {
        const value = storage.getItem(key);
        return value === null ? DEFAULT_DEBUG_SETTINGS : normalizeDebugSettings(JSON.parse(value));
    } catch {
        return DEFAULT_DEBUG_SETTINGS;
    }
}

export class DebugSettings {
    constructor({ storage = null, key = DEBUG_SETTINGS_STORAGE_KEY } = {}) {
        this.storage = storage;
        this.key = key;
        this.value = readStoredSettings(storage, key);
        this.listeners = new Set();
    }

    snapshot() {
        return this.value;
    }

    subscribe(listener) {
        if (typeof listener !== "function") throw new Error("debug settings listener must be a function");
        this.listeners.add(listener);
        listener(this.value);
        return () => this.listeners.delete(listener);
    }

    setMetrics(metrics) {
        if (typeof metrics !== "boolean") throw new Error("debug metrics setting must be boolean");
        this.#replace({ ...this.value, metrics });
    }

    setStartAreaId(startAreaId) {
        if (startAreaId !== null && (typeof startAreaId !== "string" || !startAreaId.trim())) {
            throw new Error("debug start area must be null or a non-empty string");
        }
        this.#replace({ ...this.value, startAreaId });
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
