import { graphemeLength } from "../../core/text/GraphemeText.js";
import { PARTY_CHAT_LINGER_SECONDS, PARTY_CHAT_REVEAL_CHARACTERS_PER_SECOND } from "../network/PartyChatMessage.js";

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

export function definePartyChatPlayerMessage({ messageId, speakerId, text }) {
    const durationSeconds = graphemeLength(text) / PARTY_CHAT_REVEAL_CHARACTERS_PER_SECOND + PARTY_CHAT_LINGER_SECONDS;
    return definePlayerMessage({
        messageId,
        channel: "party-chat",
        audience: "party",
        speakerId,
        text,
        durationSeconds,
        revealCharactersPerSecond: PARTY_CHAT_REVEAL_CHARACTERS_PER_SECOND,
        causalId: messageId
    });
}

export const DEFAULT_PLAYER_MESSAGE_DEFINITIONS = Object.freeze([]);
