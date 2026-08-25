import { PLAYER_IMPACT_TYPE } from "../network/PlayerImpactClaim.js";

export const PLAYER_DAMAGE_REPLICATION_EVENT_TYPE = Object.freeze({
    BOSS_HIT: "boss-player-hit"
});

export function createPlayerDamageEvent({ impactId, targetId, damage, respawned = false, details = {} }) {
    if (typeof impactId !== "string" || impactId.length === 0) {
        throw new Error("Player damage event requires a non-empty impactId");
    }
    if (typeof targetId !== "string" || targetId.length === 0) {
        throw new Error("Player damage event requires a non-empty targetId");
    }
    if (!Number.isFinite(damage) || damage < 0) {
        throw new Error("Player damage event requires non-negative finite damage");
    }
    return Object.freeze({
        ...details,
        impactId,
        playerId: targetId,
        targetId,
        resolution: PLAYER_IMPACT_TYPE.PLAYER_HIT,
        damage,
        respawned: Boolean(respawned)
    });
}
