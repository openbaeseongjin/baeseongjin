import { createPlayerCommand } from "../commands/PlayerCommand.js";
import { POINTER_SPELL_COMMAND_BY_TOKENS } from "../../core/input/PointerSpellCommandBuffer.js";

export const PLAYER_COMMAND_PROTOCOL_VERSION = 7;

function assertFinite(value, label) {
    if (!Number.isFinite(value)) throw new Error(`${label} must be finite`);
}

function normalizeCommand(command) {
    assertFinite(command?.horizontal, "horizontal");
    assertFinite(command?.vertical, "vertical");
    assertFinite(command?.pointer?.x, "pointer.x");
    assertFinite(command?.pointer?.y, "pointer.y");
    assertFinite(command?.viewport?.width, "viewport.width");
    assertFinite(command?.viewport?.height, "viewport.height");
    assertFinite(command?.aimWorld?.x, "aimWorld.x");
    assertFinite(command?.aimWorld?.y, "aimWorld.y");
    if (Math.abs(command.horizontal) > 1 || Math.abs(command.vertical) > 1) {
        throw new Error("movement axes must stay between -1 and 1");
    }
    if (typeof command.pointer.down !== "boolean") throw new Error("pointer.down must be boolean");
    if (
        !Number.isSafeInteger(command.spellCommand?.commandSequence ?? 0) ||
        (command.spellCommand?.commandSequence ?? 0) < 0
    ) {
        throw new Error("spellCommand.commandSequence must be a non-negative safe integer");
    }
    if (
        command.spellCommand?.commandKey !== null &&
        command.spellCommand?.commandKey !== undefined &&
        !Object.hasOwn(POINTER_SPELL_COMMAND_BY_TOKENS, command.spellCommand.commandKey)
    ) {
        throw new Error("spellCommand.commandKey must be null or a known spell command");
    }
    if (!Number.isSafeInteger(command.interactSequence ?? 0) || (command.interactSequence ?? 0) < 0) {
        throw new Error("interactSequence must be a non-negative safe integer");
    }
    if (command.viewport.width <= 0 || command.viewport.height <= 0) throw new Error("viewport must be positive");
    return createPlayerCommand(command, command.aimWorld);
}

export function createPlayerCommandBatch(tick, entries) {
    if (!Number.isSafeInteger(tick) || tick < 0) throw new Error("tick must be a non-negative safe integer");
    const playerIds = new Set();
    const commands = entries
        .map(({ playerId, sequence, command }) => {
            if (typeof playerId !== "string" || playerId.length === 0) throw new Error("playerId must be non-empty");
            if (playerIds.has(playerId)) throw new Error(`duplicate playerId: ${playerId}`);
            if (!Number.isSafeInteger(sequence) || sequence < 0) {
                throw new Error("sequence must be a non-negative safe integer");
            }
            playerIds.add(playerId);
            return Object.freeze({ playerId, sequence, command: normalizeCommand(command) });
        })
        .sort((left, right) => left.playerId.localeCompare(right.playerId));
    return Object.freeze({
        protocolVersion: PLAYER_COMMAND_PROTOCOL_VERSION,
        tick,
        commands: Object.freeze(commands)
    });
}

export function serializePlayerCommandBatch(batch) {
    return JSON.stringify(batch);
}

export function deserializePlayerCommandBatch(serialized) {
    const parsed = JSON.parse(serialized);
    if (parsed?.protocolVersion !== PLAYER_COMMAND_PROTOCOL_VERSION) {
        throw new Error(`unsupported player command protocol: ${parsed?.protocolVersion}`);
    }
    if (!Array.isArray(parsed.commands)) throw new Error("commands must be an array");
    return createPlayerCommandBatch(parsed.tick, parsed.commands);
}
