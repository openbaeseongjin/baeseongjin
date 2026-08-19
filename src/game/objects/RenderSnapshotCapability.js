function requireKind(value) {
    if (typeof value !== "string" || value.length === 0) {
        throw new Error("render snapshot capability kind must be non-empty");
    }
    return value;
}

export function snapshotVector(vector) {
    return vector ? { x: vector.x, y: vector.y } : null;
}

export function createRenderSnapshotCapabilityMixin({ kind, snapshot }) {
    const capabilityKind = requireKind(kind);
    if (typeof snapshot !== "function") throw new Error("render snapshot capability requires a snapshot function");
    return (Base) =>
        class extends Base {
            constructor(...args) {
                super(...args);
                this.registerRenderSnapshotCapability({
                    kind: capabilityKind,
                    snapshot: () => snapshot.call(this)
                });
            }
        };
}
