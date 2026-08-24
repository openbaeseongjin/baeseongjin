import { compatibleAugmentsForSelection } from "./AugmentCatalog.js";
import { augmentById } from "./AugmentCatalog.js";
import { SPELL_ID } from "../spells/SpellDefinition.js";

function requireIndex(value) {
    if (!Number.isSafeInteger(value) || value < 0) {
        throw new Error("selectionIndex must be a non-negative safe integer");
    }
    return value;
}

function hashOfferSeed(runSeed, playerId, selectionIndex) {
    const input = `${runSeed}\u0000${playerId}\u0000${selectionIndex}`;
    let hash = 2166136261;
    for (let index = 0; index < input.length; index += 1) {
        hash ^= input.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}

function nextRandom(state) {
    let value = (state.value += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
}

export function deterministicAugmentOffer({ runSeed, playerId, selectionIndex, selectedAugmentIds = [] }) {
    if ((!Number.isSafeInteger(runSeed) && typeof runSeed !== "string") || `${runSeed}`.length === 0) {
        throw new Error("runSeed must be a safe integer or non-empty string");
    }
    if (typeof playerId !== "string" || playerId.length === 0) throw new Error("playerId must be non-empty");
    requireIndex(selectionIndex);
    const guaranteedSpellId = Object.freeze({ 0: SPELL_ID.METEOR, 1: SPELL_ID.MOBILITY_SURGE })[selectionIndex] ?? null;
    if (guaranteedSpellId && !selectedAugmentIds.includes(guaranteedSpellId)) {
        return Object.freeze([augmentById(guaranteedSpellId).id]);
    }
    const pool = compatibleAugmentsForSelection(selectedAugmentIds)
        .filter(({ category }) => category === "rope")
        .map(({ id }) => id);
    if (pool.length === 0) return Object.freeze([]);
    const randomState = { value: hashOfferSeed(runSeed, playerId, selectionIndex) };
    for (let index = pool.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(nextRandom(randomState) * (index + 1));
        [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
    }
    return Object.freeze(pool.slice(0, Math.min(3, pool.length)));
}

export function createLogicalAugmentEntitlement({
    runSeed,
    playerId,
    selectionIndex,
    selectedAugmentIds = [],
    sourceId
}) {
    if (typeof sourceId !== "string" || sourceId.length === 0) throw new Error("sourceId must be non-empty");
    return Object.freeze({
        sourceId,
        triggerToken: `augment-entitlement:${playerId}:${requireIndex(selectionIndex)}`,
        selectionIndex,
        choices: deterministicAugmentOffer({ runSeed, playerId, selectionIndex, selectedAugmentIds })
    });
}
