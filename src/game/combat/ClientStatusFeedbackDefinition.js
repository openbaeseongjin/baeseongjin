export const CLIENT_STATUS_EVENT_TYPE = Object.freeze({
    PLAYER_RESPAWNED: "player-respawned",
    PORTAL_ACCESS_BLOCKED: "portal-access-blocked"
});

export const CLIENT_STATUS_TYPE = Object.freeze({
    ATTACH: "attach",
    RELEASE: "release",
    SWING: "swing",
    ROPE_CUT: "rope-cut",
    CHECKPOINT_RESPAWN: "checkpoint-respawn",
    SECTOR_RESPAWN: "sector-respawn",
    STAGE_SAVED: "stage-saved",
    PORTAL_ACCESS_BLOCKED: "portal-access-blocked"
});

export const CLIENT_STATUS_FEEDBACK_CONFIG = Object.freeze({
    EMPTY_VIEWER_ID_LENGTH: 0,
    MINIMUM_DT: 0,
    LIFETIME_SECONDS: 2.2,
    MAX_SEEN_IDS: 128,
    INITIAL_AGE: 0
});

export const CLIENT_RESPAWN_STATUS_TYPES = Object.freeze([
    CLIENT_STATUS_TYPE.CHECKPOINT_RESPAWN,
    CLIENT_STATUS_TYPE.SECTOR_RESPAWN
]);

export const CLIENT_TRACKED_STATUS_TYPES = Object.freeze([
    ...CLIENT_RESPAWN_STATUS_TYPES,
    CLIENT_STATUS_TYPE.PORTAL_ACCESS_BLOCKED
]);

const PERSONAL_STATUS_TYPES = Object.freeze([
    CLIENT_STATUS_TYPE.ATTACH,
    CLIENT_STATUS_TYPE.RELEASE,
    CLIENT_STATUS_TYPE.SWING,
    CLIENT_STATUS_TYPE.ROPE_CUT,
    CLIENT_STATUS_TYPE.CHECKPOINT_RESPAWN,
    CLIENT_STATUS_TYPE.SECTOR_RESPAWN,
    CLIENT_STATUS_TYPE.STAGE_SAVED,
    CLIENT_STATUS_TYPE.PORTAL_ACCESS_BLOCKED
]);

export const CLIENT_STATUS_KEY = Object.freeze({
    status: (status) => {
        const cause =
            status.causeId ??
            status.impactId ??
            status.eventId ??
            `${status.position?.x ?? "x"}:${status.position?.y ?? "y"}`;
        return `${status.type}:${status.playerId ?? "shared"}:${cause}`;
    }
});

function normalizeClientStatusEvent(event) {
    if (event?.eventType === CLIENT_STATUS_EVENT_TYPE.PLAYER_RESPAWNED) {
        if (!CLIENT_RESPAWN_STATUS_TYPES.includes(event.statusType)) return null;
        return Object.freeze({
            type: event.statusType,
            age: CLIENT_STATUS_FEEDBACK_CONFIG.INITIAL_AGE,
            playerId: event.playerId,
            reason: event.reason,
            causeId: event.causeId,
            deathPosition: event.deathPosition,
            position: event.position
        });
    }
    if (event?.eventType === CLIENT_STATUS_EVENT_TYPE.PORTAL_ACCESS_BLOCKED) {
        return Object.freeze({
            type: CLIENT_STATUS_TYPE.PORTAL_ACCESS_BLOCKED,
            age: CLIENT_STATUS_FEEDBACK_CONFIG.INITIAL_AGE,
            playerId: event.playerId,
            routeId: event.routeId,
            sectorId: event.sectorId,
            collectedCount: event.collectedCount,
            requiredCount: event.requiredCount,
            missingCount: event.missingCount,
            eventId: event.eventId,
            position: event.position
        });
    }
    return typeof event?.type === "string" ? event : null;
}

export function selectClientStatusFeedback(event, viewerId) {
    const normalized = normalizeClientStatusEvent(event);
    if (!normalized) return null;
    const personalViewerId = PERSONAL_STATUS_TYPES.includes(normalized.type) ? (normalized.playerId ?? null) : null;
    return !personalViewerId || personalViewerId === viewerId ? normalized : null;
}
