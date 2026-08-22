export const MULTIPLAYER_MESSAGE_TYPE = Object.freeze({
    ERROR: "error",
    WELCOME: "welcome",
    SNAPSHOT: "snapshot",
    RECEIPT: "receipt",
    PLAYER_LEFT: "player-left",
    COMMAND: "command",
    HIT_CLAIM: "hit-claim",
    HIT_CLAIM_RECEIPT: "hit-claim-receipt",
    PROJECTILE_SPAWN_CLAIM: "projectile-spawn-claim",
    PROJECTILE_SPAWN_CLAIM_RECEIPT: "projectile-spawn-claim-receipt",
    IMPACT_CLAIM: "impact-claim",
    IMPACT_CLAIM_RECEIPT: "impact-claim-receipt",
    FOUNDATION_SELECTION: "foundation-selection",
    FOUNDATION_SELECTION_RECEIPT: "foundation-selection-receipt",
    ROPE_IMPACT: "rope-impact",
    ROPE_IMPACT_RECEIPT: "rope-impact-receipt",
    AUGMENT_OFFER: "augment-offer",
    AUGMENT_OFFER_RECEIPT: "augment-offer-receipt",
    AUGMENT_IMPACT: "augment-impact",
    AUGMENT_IMPACT_RECEIPT: "augment-impact-receipt",
    CHECKPOINT_CLAIM: "checkpoint-claim",
    CHECKPOINT_CLAIM_RECEIPT: "checkpoint-claim-receipt",
    SUMMIT_CLAIM: "summit-claim",
    SUMMIT_CLAIM_RECEIPT: "summit-claim-receipt",
    OWNER_MOTION: "owner-motion",
    OWNER_MOTION_RECEIPT: "owner-motion-receipt",
    DEBUG_TELEPORT: "debug-teleport",
    DEBUG_TELEPORT_RECEIPT: "debug-teleport-receipt",
    SNAPSHOT_ACK: "snapshot-ack"
});

export const MULTIPLAYER_ERROR_CODE = Object.freeze({
    CHANNEL_FULL: "channel-full",
    CHANNEL_NOT_FOUND: "channel-not-found",
    INVALID_MESSAGE: "invalid-message"
});
