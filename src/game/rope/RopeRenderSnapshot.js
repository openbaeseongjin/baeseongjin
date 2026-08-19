import { createRenderSnapshotCapabilityMixin, snapshotVector } from "../objects/RenderSnapshotCapability.js";

function swingDragState(swingDrag) {
    if (!swingDrag) return null;
    return {
        origin: snapshotVector(swingDrag.origin),
        direction: snapshotVector(swingDrag.direction),
        progress: swingDrag.progress,
        age: swingDrag.age,
        used: swingDrag.used
    };
}

export const withRopeRenderSnapshot = createRenderSnapshotCapabilityMixin({
    kind: "rope",
    snapshot() {
        return {
            id: this.id,
            rope: {
                isAttached: this.rope.isAttached,
                anchor: snapshotVector(this.rope.anchor),
                attachmentOffset: snapshotVector(this.rope.attachmentOffset),
                length: this.rope.length,
                currentLength: this.rope.currentLength,
                tension: this.rope.tension
            },
            attachmentCandidate: snapshotVector(this.attachmentCandidate),
            control: {
                aimWorld: snapshotVector(this.aimWorld),
                lastPointer: { ...this.lastPointer },
                lastViewport: { ...this.lastViewport },
                wasPointerDown: this.wasPointerDown,
                attachBufferRemaining: this.attachBufferRemaining,
                swingDrag: swingDragState(this.swingDrag)
            },
            launcher: this.launcher.snapshot()
        };
    }
});
