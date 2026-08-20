export const PLAYER_MESSAGE_CHANNELS = Object.freeze(["player-bark", "party-chat"]);
export const PLAYER_MESSAGE_AUDIENCES = Object.freeze(["local-player", "party"]);

function nonEmpty(value, label) {
    if (typeof value !== "string" || value.trim().length === 0) throw new Error(`${label} must be non-empty`);
    return value;
}

function finitePositive(value, label) {
    if (!Number.isFinite(value) || value <= 0) throw new Error(`${label} must be positive`);
    return value;
}

export function definePlayerMessage({
    messageId,
    channel,
    audience,
    speakerId,
    text,
    durationSeconds = 1.8,
    revealCharactersPerSecond = 18,
    priority = 0,
    causalId = messageId
}) {
    if (!PLAYER_MESSAGE_CHANNELS.includes(channel)) throw new Error(`unknown player message channel: ${channel}`);
    if (!PLAYER_MESSAGE_AUDIENCES.includes(audience)) throw new Error(`unknown player message audience: ${audience}`);
    if (!Number.isFinite(priority)) throw new Error("player message priority must be finite");
    return Object.freeze({
        messageId: nonEmpty(messageId, "messageId"),
        channel,
        audience,
        speakerId: nonEmpty(speakerId, "speakerId"),
        text: nonEmpty(text, "text"),
        durationSeconds: finitePositive(durationSeconds, "durationSeconds"),
        revealCharactersPerSecond: finitePositive(revealCharactersPerSecond, "revealCharactersPerSecond"),
        priority,
        causalId: nonEmpty(causalId, "causalId")
    });
}

function bark(messageId, areaId, afterStoryId, text, properties = {}) {
    return Object.freeze({
        ...definePlayerMessage({
            messageId,
            channel: "player-bark",
            audience: "local-player",
            speakerId: "local-player",
            text,
            ...properties
        }),
        areaId,
        trigger: Object.freeze({ kind: "after-story", storyId: afterStoryId })
    });
}

export const DEFAULT_PLAYER_MESSAGE_DEFINITIONS = Object.freeze([
    bark("sector-01-01:first-reaction", "sector-01-01", "sector-01-01:lockdown", "뭐야…?", { priority: 20 }),
    bark("sector-01-01:temporary-goal", "sector-01-01", "sector-01-01:gate-open", "…일단 위로.", {
        priority: 10
    }),
    bark("sector-01-02:lift-reaction", "sector-01-02", "sector-01-02:lift-offline", "…리프트도?", {
        priority: 20
    })
]);
