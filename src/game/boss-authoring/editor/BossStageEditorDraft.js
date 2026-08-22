import { validateBossStageSpec } from "../BossStageSpecValidator.js";

const HISTORY_LIMIT = 80;
const EDITABLE_DOMAINS = Object.freeze([
    "arena",
    "entry",
    "exit",
    "surfaces",
    "anchors",
    "recovery",
    "boss",
    "phases",
    "mechanics",
    "combat",
    "hud",
    "transition"
]);
const DOMAIN_TOP_LEVEL_ROOTS = Object.freeze({
    arena: Object.freeze(["arena"]),
    entry: Object.freeze(["arena"]),
    exit: Object.freeze(["arena"]),
    surfaces: Object.freeze(["arena"]),
    anchors: Object.freeze(["arena"]),
    recovery: Object.freeze(["arena"]),
    boss: Object.freeze(["boss"]),
    phases: Object.freeze(["phases"]),
    mechanics: Object.freeze(["mechanics", "phases"]),
    combat: Object.freeze(["combat"]),
    hud: Object.freeze(["hud"]),
    transition: Object.freeze(["transition", "nextAreaId"])
});

function stable(value) {
    if (Array.isArray(value)) return value.map(stable);
    if (!value || typeof value !== "object") return value;
    return Object.fromEntries(
        Object.keys(value)
            .sort()
            .map((key) => [key, stable(value[key])])
    );
}

function same(left, right) {
    return JSON.stringify(stable(left)) === JSON.stringify(stable(right));
}

function pointerSegments(pointer) {
    return pointer
        .split("/")
        .slice(1)
        .map((segment) => segment.replaceAll("~1", "/").replaceAll("~0", "~"));
}

function setPointer(target, pointer, value) {
    const segments = pointerSegments(pointer);
    const key = segments.pop();
    let owner = target;
    for (const segment of segments) owner = owner[segment];
    owner[key] = structuredClone(value);
}

function changedRoots(before, after) {
    return [...new Set([...Object.keys(before), ...Object.keys(after)])].filter(
        (key) => !same(before[key], after[key])
    );
}

function domainAllows(domain, roots) {
    const allowed = DOMAIN_TOP_LEVEL_ROOTS[domain] ?? [];
    return roots.length > 0 && roots.every((root) => allowed.includes(root));
}

export class BossStageEditorDraft {
    constructor({ spec, revision = 0 } = {}) {
        if (!spec || typeof spec !== "object") throw new TypeError("boss-editor-spec-required");
        this.spec = structuredClone(spec);
        this.appliedSpec = structuredClone(spec);
        this.serverRevision = revision;
        this.selection = null;
        this.history = [];
        this.redoHistory = [];
        this.bufferedMutation = null;
    }

    currentSpec() {
        return this.bufferedMutation?.spec ?? this.spec;
    }

    specification() {
        return structuredClone(this.currentSpec());
    }

    revision() {
        return this.serverRevision;
    }

    selected() {
        return this.selection ? Object.freeze({ ...this.selection }) : null;
    }

    select(selection) {
        this.selection = selection ? Object.freeze({ ...selection }) : null;
        return this.selected();
    }

    validate() {
        return validateBossStageSpec(this.currentSpec());
    }

    snapshot() {
        const validation = this.validate();
        return Object.freeze({
            spec: this.specification(),
            revision: this.serverRevision,
            selection: this.selected(),
            dirty: !same(this.currentSpec(), this.appliedSpec),
            valid: validation.valid,
            issues: validation.issues,
            canUndo: this.history.length > 0,
            canRedo: this.redoHistory.length > 0
        });
    }

    record(domain, label, before, after) {
        const roots = changedRoots(before, after);
        if (!domainAllows(domain, roots)) throw new Error("boss-editor-domain-forbidden");
        this.history.push(Object.freeze({ domain, label, before, after }));
        if (this.history.length > HISTORY_LIMIT) this.history.shift();
        this.redoHistory = [];
    }

    mutate({ domain, label, apply } = {}) {
        if (!EDITABLE_DOMAINS.includes(domain)) return false;
        if (this.bufferedMutation) throw new Error("boss-editor-buffered-mutation-active");
        const before = structuredClone(this.spec);
        const next = structuredClone(this.spec);
        if (apply(next) === false || same(before, next)) return false;
        this.spec = next;
        this.record(domain, label, before, next);
        return true;
    }

    replaceAtPointer({ domain, label, pointer, value } = {}) {
        return this.mutate({
            domain,
            label,
            apply: (spec) => {
                setPointer(spec, pointer, value);
                return true;
            }
        });
    }

    beginBufferedMutation({ domain, label } = {}) {
        if (!EDITABLE_DOMAINS.includes(domain) || this.bufferedMutation) return false;
        this.bufferedMutation = {
            domain,
            label,
            baseSpec: structuredClone(this.spec),
            spec: structuredClone(this.spec)
        };
        return true;
    }

    updateBufferedMutation(apply) {
        if (!this.bufferedMutation) throw new Error("boss-editor-buffered-mutation-missing");
        const next = structuredClone(this.bufferedMutation.spec);
        if (apply(next) === false) return false;
        this.bufferedMutation.spec = next;
        return true;
    }

    commitBufferedMutation() {
        const entry = this.bufferedMutation;
        if (!entry) return false;
        this.bufferedMutation = null;
        if (same(entry.baseSpec, entry.spec)) return false;
        this.spec = entry.spec;
        this.record(entry.domain, entry.label, entry.baseSpec, entry.spec);
        return true;
    }

    cancelBufferedMutation() {
        if (!this.bufferedMutation) return false;
        this.bufferedMutation = null;
        return true;
    }

    undo() {
        const entry = this.history.pop();
        if (!entry || this.bufferedMutation) return false;
        this.spec = structuredClone(entry.before);
        this.redoHistory.push(entry);
        return true;
    }

    redo() {
        const entry = this.redoHistory.pop();
        if (!entry || this.bufferedMutation) return false;
        this.spec = structuredClone(entry.after);
        this.history.push(entry);
        return true;
    }

    markApplied(revision) {
        if (!Number.isInteger(revision) || revision < this.serverRevision || !this.validate().valid) return false;
        this.serverRevision = revision;
        this.appliedSpec = structuredClone(this.spec);
        return true;
    }
}
