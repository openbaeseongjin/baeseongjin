import { normalizeRopeTuningOverride } from "../config.js";
import { augmentById, isAugmentCompatibleWithSelection, MAX_AUGMENT_SELECTIONS } from "../augments/AugmentCatalog.js";

export const DEBUG_SETTINGS_STORAGE_KEY = "baeseongjin.debug-settings.v2";
export const DEBUG_SETTINGS_VERSION = 2;
export const MAX_DEBUG_AUGMENT_COUNT = MAX_AUGMENT_SELECTIONS;

export const DEFAULT_DEBUG_SETTINGS = Object.freeze({
    version: DEBUG_SETTINGS_VERSION,
    metrics: false,
    startAreaId: null,
    ropeTuning: null,
    debugAugmentIds: Object.freeze([])
});

function augmentSelectionError(ids) {
    if (!Array.isArray(ids)) return "획득 증강 목록은 배열이어야 합니다.";
    if (ids.length > MAX_DEBUG_AUGMENT_COUNT) {
        return `획득 증강은 최대 ${MAX_DEBUG_AUGMENT_COUNT}장입니다.`;
    }
    const selected = [];
    for (const id of ids) {
        if (typeof id !== "string" || !id.trim()) return "증강 ID는 비어 있지 않은 문자열이어야 합니다.";
        const augment = augmentById(id);
        if (!augment) return `알 수 없는 증강 '${id}'입니다.`;
        if (selected.includes(augment.id)) return `증강 '${augment.name}'을 중복 선택할 수 없습니다.`;
        if (!isAugmentCompatibleWithSelection(augment.id, selected)) {
            return `증강 '${augment.name}'을 현재 순서에 추가할 수 없습니다.`;
        }
        selected.push(augment.id);
    }
    return null;
}

export function validateDebugAugmentIds(ids) {
    const error = augmentSelectionError(ids);
    return Object.freeze({ valid: error === null, error });
}

function normalizeDebugAugmentIds(ids) {
    if (ids === undefined) return Object.freeze([]);
    return augmentSelectionError(ids) === null ? Object.freeze(ids.map((id) => augmentById(id).id)) : Object.freeze([]);
}

function cloneSettings(settings) {
    return Object.freeze({
        version: DEBUG_SETTINGS_VERSION,
        metrics: settings.metrics,
        startAreaId: settings.startAreaId,
        ropeTuning: settings.ropeTuning,
        debugAugmentIds: Object.freeze([...settings.debugAugmentIds])
    });
}

export function normalizeDebugSettings(value, validAreaIds = null) {
    if (!value || typeof value !== "object" || Array.isArray(value) || value.version !== DEBUG_SETTINGS_VERSION) {
        return DEFAULT_DEBUG_SETTINGS;
    }
    if (typeof value.metrics !== "boolean") return DEFAULT_DEBUG_SETTINGS;
    if (value.startAreaId !== null && (typeof value.startAreaId !== "string" || !value.startAreaId.trim())) {
        return DEFAULT_DEBUG_SETTINGS;
    }
    const startAreaId = validAreaIds && !validAreaIds.has(value.startAreaId) ? null : value.startAreaId;
    return cloneSettings({
        metrics: value.metrics,
        startAreaId,
        ropeTuning: normalizeRopeTuningOverride(value.ropeTuning),
        debugAugmentIds: normalizeDebugAugmentIds(value.debugAugmentIds)
    });
}

function readStoredSettings(storage, key, validAreaIds) {
    if (!storage?.getItem) return DEFAULT_DEBUG_SETTINGS;
    try {
        const value = storage.getItem(key);
        return value === null ? DEFAULT_DEBUG_SETTINGS : normalizeDebugSettings(JSON.parse(value), validAreaIds);
    } catch {
        return DEFAULT_DEBUG_SETTINGS;
    }
}

export class DebugSettings {
    constructor({ storage = null, key = DEBUG_SETTINGS_STORAGE_KEY, validAreaIds = null } = {}) {
        this.storage = storage;
        this.key = key;
        this.validAreaIds = validAreaIds ? new Set(validAreaIds) : null;
        this.value = readStoredSettings(storage, key, this.validAreaIds);
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
        if (startAreaId !== null && this.validAreaIds && !this.validAreaIds.has(startAreaId)) {
            throw new Error(`unknown debug start area '${startAreaId}'`);
        }
        this.#replace({ ...this.value, startAreaId });
    }

    setRopeTuning(ropeTuning) {
        if (ropeTuning !== null && (typeof ropeTuning !== "object" || Array.isArray(ropeTuning))) {
            throw new Error("debug Rope tuning must be an object or null");
        }
        this.#replace({ ...this.value, ropeTuning: normalizeRopeTuningOverride(ropeTuning) });
    }

    setDebugAugmentIds(debugAugmentIds) {
        const validation = validateDebugAugmentIds(debugAugmentIds);
        if (!validation.valid) throw new Error(validation.error);
        this.#replace({ ...this.value, debugAugmentIds: normalizeDebugAugmentIds(debugAugmentIds) });
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
