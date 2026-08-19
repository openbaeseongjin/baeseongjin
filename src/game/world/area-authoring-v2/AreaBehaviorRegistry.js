const FORBIDDEN_ARGUMENT_KEYS = new Set(["callback", "factory", "import", "modulePath", "require"]);

function isPlainObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function freezeValue(value) {
    if (Array.isArray(value)) return Object.freeze(value.map((entry) => freezeValue(entry)));
    if (!value || typeof value !== "object") return value;
    return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, freezeValue(entry)])));
}

function firstExecutableValue(value, path = "arguments") {
    if (typeof value === "function") return path;
    if (!value || typeof value !== "object") return null;
    for (const [key, entry] of Object.entries(value)) {
        const nextPath = `${path}.${key}`;
        if (FORBIDDEN_ARGUMENT_KEYS.has(key)) return nextPath;
        const found = firstExecutableValue(entry, nextPath);
        if (found) return found;
    }
    return null;
}

export class AreaBehaviorReferenceError extends Error {
    constructor(code, details = {}) {
        super(code);
        this.name = "AreaBehaviorReferenceError";
        this.code = code;
        this.details = Object.freeze(details);
    }
}

export function createAreaBehaviorRegistry(entries) {
    if (!Array.isArray(entries)) throw new TypeError("behavior-registry-entries-invalid");
    const factories = new Map();
    for (const entry of entries) {
        if (!isPlainObject(entry) || typeof entry.id !== "string" || entry.id.length === 0) {
            throw new TypeError("behavior-registry-id-invalid");
        }
        if (typeof entry.factory !== "function") throw new TypeError("behavior-registry-factory-invalid");
        if (factories.has(entry.id)) throw new TypeError("behavior-registry-id-duplicate");
        factories.set(entry.id, entry.factory);
    }
    return Object.freeze({
        has(id) {
            return factories.has(id);
        },
        resolve(id) {
            return factories.get(id) ?? null;
        },
        ids: Object.freeze([...factories.keys()].sort((left, right) => left.localeCompare(right, "en")))
    });
}

export const EMPTY_AREA_BEHAVIOR_REGISTRY = createAreaBehaviorRegistry([]);

export function validateBehaviorRefs(refs, registry = EMPTY_AREA_BEHAVIOR_REGISTRY) {
    if (!Array.isArray(refs)) throw new AreaBehaviorReferenceError("behavior-reference-list-invalid");
    const ids = new Set();
    const normalized = [];
    for (const reference of refs) {
        if (!isPlainObject(reference) || typeof reference.id !== "string" || reference.id.length === 0) {
            throw new AreaBehaviorReferenceError("behavior-reference-id-invalid");
        }
        if (ids.has(reference.id)) throw new AreaBehaviorReferenceError("behavior-reference-id-duplicate", { id: reference.id });
        if (!registry?.has(reference.id)) {
            throw new AreaBehaviorReferenceError("behavior-reference-unknown", { id: reference.id });
        }
        const argumentsValue = reference.arguments ?? {};
        if (!isPlainObject(argumentsValue)) {
            throw new AreaBehaviorReferenceError("behavior-reference-arguments-invalid", { id: reference.id });
        }
        const executablePath = firstExecutableValue(argumentsValue);
        if (executablePath) {
            throw new AreaBehaviorReferenceError("behavior-reference-executable-value", {
                id: reference.id,
                path: executablePath
            });
        }
        ids.add(reference.id);
        normalized.push(freezeValue({ id: reference.id, arguments: argumentsValue }));
    }
    return Object.freeze(normalized);
}
