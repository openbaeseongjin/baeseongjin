import { EDITOR_EDITABLE_DOMAINS, EDITOR_READ_ONLY_DOMAINS } from "../AreaSpecV2.js";
import { validateAreaSpecV2 } from "../AreaSpecV2Validator.js";

const HISTORY_LIMIT = 80;
const MISSING = Symbol("missing-draft-value");
const EDITABLE_POINTER_ROOTS = Object.freeze({
    bounds: Object.freeze(["/definition/bounds"]),
    entry: Object.freeze(["/definition/entry"]),
    surfaces: Object.freeze(["/definition/surfaces"]),
    anchors: Object.freeze(["/anchors"]),
    recoveryRoute: Object.freeze(["/definition/recoveryPoints", "/definition/routePoints"]),
    enemySlots: Object.freeze(["/definition/objects"]),
    wind: Object.freeze(["/definition/objects", "/definition/windZones"]),
    camera: Object.freeze(["/definition/cameraZones"])
});

function stableValue(value) {
    if (Array.isArray(value)) return value.map((entry) => stableValue(entry));
    if (!value || typeof value !== "object") return value;
    return Object.fromEntries(
        Object.keys(value)
            .sort((left, right) => left.localeCompare(right, "en"))
            .map((key) => [key, stableValue(value[key])])
    );
}

function sameValue(left, right) {
    return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right));
}

function escapePointerSegment(value) {
    return value.replaceAll("~", "~0").replaceAll("/", "~1");
}

function unescapePointerSegment(value) {
    return value.replaceAll("~1", "/").replaceAll("~0", "~");
}

function collectChanges(before, after, pointer = "") {
    if (sameValue(before, after)) return [];
    if (Array.isArray(before) || Array.isArray(after)) {
        return [{ pointer, before: structuredClone(before), after: structuredClone(after) }];
    }
    const beforeObject = Boolean(before) && typeof before === "object";
    const afterObject = Boolean(after) && typeof after === "object";
    if (!beforeObject || !afterObject) {
        return [
            {
                pointer,
                before: before === MISSING ? MISSING : structuredClone(before),
                after: after === MISSING ? MISSING : structuredClone(after)
            }
        ];
    }
    const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])].sort((left, right) =>
        left.localeCompare(right, "en")
    );
    return keys.flatMap((key) =>
        collectChanges(
            Object.hasOwn(before, key) ? before[key] : MISSING,
            Object.hasOwn(after, key) ? after[key] : MISSING,
            `${pointer}/${escapePointerSegment(key)}`
        )
    );
}

function setPointerValue(target, pointer, value) {
    const segments = pointer.split("/").slice(1).map(unescapePointerSegment);
    if (segments.length === 0) throw new TypeError("draft-root-replacement-forbidden");
    const leaf = segments.pop();
    let parent = target;
    for (const segment of segments) parent = parent[segment];
    if (value === MISSING) delete parent[leaf];
    else parent[leaf] = structuredClone(value);
}

function applyChanges(spec, changes, side) {
    const next = structuredClone(spec);
    for (const change of changes) setPointerValue(next, change.pointer, change[side]);
    return next;
}

function pointerWithinRoot(pointer, root) {
    return pointer === root || pointer.startsWith(`${root}/`);
}

function editableRoots(domain) {
    return EDITABLE_POINTER_ROOTS[domain] ?? [];
}

function changesRespectDomain(domain, changes) {
    const roots = editableRoots(domain);
    return roots.length > 0 && changes.every(({ pointer }) => roots.some((root) => pointerWithinRoot(pointer, root)));
}

function cloneSelection(selection) {
    return selection ? Object.freeze({ ...selection }) : null;
}

function moveAnchorPair(spec, landmarkId, delta) {
    const anchor = spec.anchors?.find(({ landmark }) => landmark.id === landmarkId);
    if (!anchor || !Number.isFinite(delta?.x) || !Number.isFinite(delta?.y)) return false;
    anchor.landmark.x += delta.x;
    anchor.landmark.y += delta.y;
    anchor.target.x += delta.x;
    anchor.target.y += delta.y;
    return true;
}

export class AreaEditorDraft {
    constructor({ spec, revision = 0, validate = validateAreaSpecV2 } = {}) {
        if (!spec || typeof spec !== "object") throw new TypeError("editor-draft-spec-required");
        if (!Number.isInteger(revision) || revision < 0) throw new TypeError("editor-draft-revision-invalid");
        if (typeof validate !== "function") throw new TypeError("editor-draft-validate-required");
        this.spec = structuredClone(spec);
        this.appliedSpec = structuredClone(spec);
        this.serverRevision = revision;
        this.validateFn = validate;
        this.selection = null;
        this.history = [];
        this.redoHistory = [];
        this.bufferedMutation = null;
    }

    currentSpec() {
        return this.bufferedMutation?.spec ?? this.spec;
    }

    pushHistoryEntry(domain, label, changes) {
        if (!changesRespectDomain(domain, changes)) throw new Error("editor-draft-pointer-forbidden");
        this.history.push(Object.freeze({ domain, label: label.trim(), changes: Object.freeze(changes) }));
        if (this.history.length > HISTORY_LIMIT) this.history.shift();
        this.redoHistory = [];
    }

    snapshot() {
        const validation = this.validate();
        return Object.freeze({
            spec: structuredClone(this.currentSpec()),
            revision: this.serverRevision,
            selection: cloneSelection(this.selection),
            dirty: !sameValue(this.currentSpec(), this.appliedSpec),
            valid: validation.valid,
            issues: validation.issues,
            canUndo: this.history.length > 0,
            canRedo: this.redoHistory.length > 0
        });
    }

    specification() {
        return structuredClone(this.currentSpec());
    }

    revision() {
        return this.serverRevision;
    }

    select(selection) {
        if (
            selection !== null &&
            (!selection || typeof selection.domain !== "string" || typeof selection.id !== "string")
        ) {
            throw new TypeError("editor-draft-selection-invalid");
        }
        this.selection = cloneSelection(selection);
        return this.selection;
    }

    selected() {
        return cloneSelection(this.selection);
    }

    mutate({ domain, label, apply } = {}) {
        if (!EDITOR_EDITABLE_DOMAINS.includes(domain)) return false;
        if (typeof label !== "string" || label.trim() === "" || typeof apply !== "function") {
            throw new TypeError("editor-draft-mutation-invalid");
        }
        if (this.bufferedMutation) throw new Error("editor-draft-buffered-mutation-active");
        const before = structuredClone(this.currentSpec());
        const next = structuredClone(this.currentSpec());
        if (apply(next) === false) return false;
        const changes = collectChanges(before, next);
        if (changes.length === 0) return false;
        this.spec = next;
        this.pushHistoryEntry(domain, label, changes);
        return true;
    }

    moveAnchor(landmarkId, delta) {
        return this.mutate({
            domain: "anchors",
            label: "Move anchor",
            apply: (spec) => moveAnchorPair(spec, landmarkId, delta)
        });
    }

    replaceAtPointer({ domain, label, pointer, value } = {}) {
        if (typeof pointer !== "string" || !pointer.startsWith("/") || pointer === "/") {
            throw new TypeError("editor-draft-pointer-invalid");
        }
        return this.mutate({
            domain,
            label,
            apply: (spec) => {
                setPointerValue(spec, pointer, value);
                return true;
            }
        });
    }

    beginBufferedMutation({ domain, label } = {}) {
        if (!EDITOR_EDITABLE_DOMAINS.includes(domain)) return false;
        if (typeof label !== "string" || label.trim() === "") throw new TypeError("editor-draft-mutation-invalid");
        if (this.bufferedMutation) throw new Error("editor-draft-buffered-mutation-active");
        this.bufferedMutation = {
            domain,
            label: label.trim(),
            baseSpec: structuredClone(this.spec),
            spec: structuredClone(this.spec)
        };
        return true;
    }

    updateBufferedMutation(apply) {
        if (!this.bufferedMutation) throw new Error("editor-draft-buffered-mutation-missing");
        if (typeof apply !== "function") throw new TypeError("editor-draft-mutation-invalid");
        const next = structuredClone(this.bufferedMutation.spec);
        if (apply(next) === false) return false;
        this.bufferedMutation.spec = next;
        return true;
    }

    commitBufferedMutation() {
        const entry = this.bufferedMutation;
        if (!entry) return false;
        this.bufferedMutation = null;
        const changes = collectChanges(entry.baseSpec, entry.spec);
        if (changes.length === 0) return false;
        this.spec = entry.spec;
        this.pushHistoryEntry(entry.domain, entry.label, changes);
        return true;
    }

    cancelBufferedMutation() {
        if (!this.bufferedMutation) return false;
        this.bufferedMutation = null;
        return true;
    }

    undo() {
        if (this.bufferedMutation) return false;
        const entry = this.history.pop();
        if (!entry) return false;
        this.spec = applyChanges(this.spec, entry.changes, "before");
        this.redoHistory.push(entry);
        return true;
    }

    redo() {
        if (this.bufferedMutation) return false;
        const entry = this.redoHistory.pop();
        if (!entry) return false;
        this.spec = applyChanges(this.spec, entry.changes, "after");
        this.history.push(entry);
        return true;
    }

    validate() {
        return this.validateFn(this.currentSpec());
    }

    markApplied(revision) {
        if (this.bufferedMutation) throw new Error("editor-draft-buffered-mutation-active");
        if (!Number.isInteger(revision) || revision < this.serverRevision) {
            throw new TypeError("editor-draft-applied-revision-invalid");
        }
        const validation = this.validate();
        if (!validation.valid) return false;
        const current = this.currentSpec();
        this.serverRevision = revision;
        this.appliedSpec = structuredClone(current);
        this.spec = structuredClone(current);
        return true;
    }
}

export const AREA_EDITOR_HISTORY_LIMIT = HISTORY_LIMIT;
export const AREA_EDITOR_READ_ONLY_DOMAINS = EDITOR_READ_ONLY_DOMAINS;
