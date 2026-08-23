export const ROPE_AUTHORITY_EVENT_TYPE = Object.freeze({
    ANCHOR_RELEASED: "rope-anchor-released"
});

export const ROPE_ANCHOR_RELEASE_REASON = Object.freeze({
    OWNER_UNAVAILABLE: "anchor-owner-unavailable",
    SURFACE_DISABLED: "anchor-surface-disabled",
    POINT_OFF_SURFACE: "anchor-point-off-surface",
    POINT_OUT_OF_REACH: "anchor-point-out-of-reach",
    POINT_OCCLUDED: "anchor-point-occluded",
    CONSTRAINT_INVALID: "anchor-constraint-invalid"
});

export const ROPE_ATTACHMENT_ID = Object.freeze({
    forOwnerTick(ownerId, tick) {
        if (typeof ownerId !== "string" || !ownerId || !Number.isSafeInteger(tick) || tick < 0) {
            throw new Error("Rope attachment ID requires owner ID and non-negative tick");
        }
        return `${ownerId}:rope-attachment:${tick}`;
    }
});
