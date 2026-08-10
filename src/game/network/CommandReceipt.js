export const COMMAND_RECEIPT_PROTOCOL_VERSION = 1;

function assertTick(value, label) {
    if (!Number.isSafeInteger(value) || value < 0) throw new Error(`${label} must be a non-negative safe integer`);
    return value;
}

function normalizeReference(reference, rejected) {
    if (typeof reference?.playerId !== "string" || reference.playerId.length === 0) {
        throw new Error("playerId must be non-empty");
    }
    const normalized = {
        playerId: reference.playerId,
        sequence: assertTick(reference.sequence, "sequence")
    };
    if (rejected) {
        if (typeof reference.reason !== "string" || reference.reason.length === 0) {
            throw new Error("rejection reason must be non-empty");
        }
        normalized.reason = reference.reason;
    }
    return Object.freeze(normalized);
}

function normalizeReferences(references, rejected) {
    if (!Array.isArray(references)) throw new Error("receipt references must be arrays");
    return Object.freeze(
        references
            .map((reference) => normalizeReference(reference, rejected))
            .sort((left, right) => left.playerId.localeCompare(right.playerId) || left.sequence - right.sequence)
    );
}

export function createCommandReceipt({ serverTick, targetTick, accepted = [], rejected = [] }) {
    return Object.freeze({
        protocolVersion: COMMAND_RECEIPT_PROTOCOL_VERSION,
        serverTick: assertTick(serverTick, "serverTick"),
        targetTick: assertTick(targetTick, "targetTick"),
        accepted: normalizeReferences(accepted, false),
        rejected: normalizeReferences(rejected, true)
    });
}

export function serializeCommandReceipt(receipt) {
    return JSON.stringify(receipt);
}

export function deserializeCommandReceipt(serialized) {
    const parsed = JSON.parse(serialized);
    if (parsed?.protocolVersion !== COMMAND_RECEIPT_PROTOCOL_VERSION) {
        throw new Error(`unsupported command receipt protocol: ${parsed?.protocolVersion}`);
    }
    return createCommandReceipt(parsed);
}
