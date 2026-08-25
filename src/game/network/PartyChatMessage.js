import { graphemeLength } from "../../core/text/GraphemeText.js";

export const PARTY_CHAT_PROTOCOL_VERSION = 1;
export const PARTY_CHAT_MAX_GRAPHEMES = 80;
export const PARTY_CHAT_REVEAL_CHARACTERS_PER_SECOND = 18;
export const PARTY_CHAT_LINGER_SECONDS = 2;

function requireId(value, label) {
    if (typeof value !== "string" || value.length === 0) throw new Error(`${label} must be non-empty`);
    return value;
}

function requireClientSequence(value) {
    if (!Number.isSafeInteger(value) || value < 0) {
        throw new Error("party chat clientSequence must be a non-negative safe integer");
    }
    return value;
}

export function normalizePartyChatText(value) {
    if (typeof value !== "string") throw new Error("party chat text must be a string");
    const text = value.trim();
    if (text.length === 0) throw new Error("party chat text must be non-empty");
    if (/[\r\n]/u.test(text)) throw new Error("party chat text must be a single line");
    if (graphemeLength(text) > PARTY_CHAT_MAX_GRAPHEMES) {
        throw new Error(`party chat text must not exceed ${PARTY_CHAT_MAX_GRAPHEMES} characters`);
    }
    return text;
}

export function partyChatMessageId(speakerId, clientSequence) {
    return `party-chat:${requireId(speakerId, "speakerId")}:${requireClientSequence(clientSequence)}`;
}

export function createPartyChatSubmission({ clientSequence, text }) {
    return Object.freeze({
        protocolVersion: PARTY_CHAT_PROTOCOL_VERSION,
        clientSequence: requireClientSequence(clientSequence),
        text: normalizePartyChatText(text)
    });
}

export function createPartyChatMessage({ speakerId, clientSequence, text }) {
    const normalizedSpeakerId = requireId(speakerId, "speakerId");
    const normalizedClientSequence = requireClientSequence(clientSequence);
    return Object.freeze({
        protocolVersion: PARTY_CHAT_PROTOCOL_VERSION,
        messageId: partyChatMessageId(normalizedSpeakerId, normalizedClientSequence),
        speakerId: normalizedSpeakerId,
        clientSequence: normalizedClientSequence,
        text: normalizePartyChatText(text)
    });
}

export function serializePartyChatSubmission(submission) {
    return JSON.stringify(createPartyChatSubmission(submission));
}

export function deserializePartyChatSubmission(serialized) {
    const parsed = JSON.parse(serialized);
    if (parsed?.protocolVersion !== PARTY_CHAT_PROTOCOL_VERSION) {
        throw new Error(`unsupported party chat protocol: ${parsed?.protocolVersion}`);
    }
    return createPartyChatSubmission(parsed);
}

export function serializePartyChatMessage(message) {
    return JSON.stringify(createPartyChatMessage(message));
}

export function deserializePartyChatMessage(serialized) {
    const parsed = JSON.parse(serialized);
    if (parsed?.protocolVersion !== PARTY_CHAT_PROTOCOL_VERSION) {
        throw new Error(`unsupported party chat protocol: ${parsed?.protocolVersion}`);
    }
    const normalized = createPartyChatMessage(parsed);
    if (parsed.messageId !== normalized.messageId) throw new Error("party chat messageId does not match its speaker");
    return normalized;
}
