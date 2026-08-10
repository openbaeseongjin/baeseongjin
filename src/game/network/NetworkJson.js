export function normalizeNetworkJson(value, label = "value", ancestors = new Set()) {
    if (value === null || typeof value === "string" || typeof value === "boolean") return value;
    if (typeof value === "number") {
        if (!Number.isFinite(value)) throw new Error(`${label} numbers must be finite`);
        return value;
    }
    if (typeof value !== "object") throw new Error(`${label} must be JSON-compatible`);
    if (ancestors.has(value)) throw new Error(`${label} must not contain cycles`);

    ancestors.add(value);
    let normalized;
    if (Array.isArray(value)) {
        normalized = value.map((item, index) => normalizeNetworkJson(item, `${label}[${index}]`, ancestors));
    } else {
        normalized = {};
        for (const key of Object.keys(value).sort()) {
            normalized[key] = normalizeNetworkJson(value[key], `${label}.${key}`, ancestors);
        }
    }
    ancestors.delete(value);
    return Object.freeze(normalized);
}
