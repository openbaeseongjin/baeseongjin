export const CONTINUITY_WARDEN_STATE_LANE = Object.freeze({
    LOCOMOTION: "locomotion",
    ATTACK: "attack",
    ACTIVE: "active",
    REACTION: "reaction",
    TERMINAL: "terminal"
});

const SELECTED_MULTIPLIER = 0.25;
const MULTIPLIER_RECOVERY = 0.25;
const MAXIMUM_MULTIPLIER = 1;
const CHAIN_MULTIPLIER = 2;
const HASH_OFFSET = 2166136261;
const HASH_PRIME = 16777619;

function alwaysEnter() {
    return true;
}

function emptyHook() {}

function unitWeight() {
    return 1;
}

function requireNonEmptyString(value, label) {
    if (typeof value !== "string" || value.length === 0) throw new Error(`${label} must be a non-empty string`);
    return value;
}

function requireHook(value, label) {
    if (typeof value !== "function") throw new Error(`${label} must be a function`);
    return value;
}

function requireAttempt(value) {
    if (!Number.isSafeInteger(value) || value < 0) {
        throw new Error("Continuity Warden attempt must be a non-negative safe integer");
    }
    return value;
}

function requireSelectionSequence(value) {
    if (!Number.isSafeInteger(value) || value < 0) {
        throw new Error("Continuity Warden selectionSequence must be a non-negative safe integer");
    }
    return value;
}

function requireWorldSeed(value) {
    if ((typeof value !== "string" && !Number.isSafeInteger(value)) || String(value).length === 0) {
        throw new Error("Continuity Warden worldSeed must be a safe integer or non-empty string");
    }
    return value;
}

function requireMultiplier(value, stateId) {
    if (!Number.isFinite(value) || value < SELECTED_MULTIPLIER || value > MAXIMUM_MULTIPLIER) {
        throw new Error(`Continuity Warden multiplier for ${stateId} must be between 0.25 and 1`);
    }
    return value;
}

function deterministicUnit(worldSeed, attempt, selectionSequence) {
    const input = `${worldSeed}\u0000${attempt}\u0000${selectionSequence}`;
    let hash = HASH_OFFSET;
    for (let index = 0; index < input.length; index += 1) {
        hash ^= input.charCodeAt(index);
        hash = Math.imul(hash, HASH_PRIME);
    }
    let value = hash >>> 0;
    value += 0x6d2b79f5;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
}

function createMultiplierState(definitions, restored = null) {
    const multipliers = Object.create(null);
    for (const definition of definitions) {
        const weighted = definition.lane === CONTINUITY_WARDEN_STATE_LANE.ATTACK;
        multipliers[definition.id] =
            restored === null || !weighted
                ? MAXIMUM_MULTIPLIER
                : requireMultiplier(restored[definition.id], definition.id);
    }
    if (restored !== null) {
        for (const stateId of Object.keys(restored)) {
            if (
                multipliers[stateId] === undefined ||
                definitions.find(({ id }) => id === stateId)?.lane !== CONTINUITY_WARDEN_STATE_LANE.ATTACK
            ) {
                throw new Error(`Continuity Warden multiplier references unknown state ${stateId}`);
            }
        }
    }
    return multipliers;
}

function immutableMultiplierSnapshot(definitions, multipliers) {
    return Object.freeze(
        Object.fromEntries(
            definitions
                .filter(({ lane }) => lane === CONTINUITY_WARDEN_STATE_LANE.ATTACK)
                .map((definition) => [definition.id, multipliers[definition.id]])
        )
    );
}

export class ContinuityWardenStateDefinition {
    constructor({
        id,
        lane,
        canEnter = alwaysEnter,
        weight = unitWeight,
        enter = emptyHook,
        advance = emptyHook,
        exit = emptyHook
    }) {
        this.id = requireNonEmptyString(id, "Continuity Warden state id");
        this.lane = requireNonEmptyString(lane, `Continuity Warden state ${this.id} lane`);
        this.canEnter = requireHook(canEnter, `Continuity Warden state ${this.id} canEnter`);
        this.weight = requireHook(weight, `Continuity Warden state ${this.id} weight`);
        this.enter = requireHook(enter, `Continuity Warden state ${this.id} enter`);
        this.advance = requireHook(advance, `Continuity Warden state ${this.id} advance`);
        this.exit = requireHook(exit, `Continuity Warden state ${this.id} exit`);
        Object.freeze(this);
    }
}

export function defineContinuityWardenStateCatalog(definitions) {
    if (!Array.isArray(definitions) || definitions.length === 0) {
        throw new Error("Continuity Warden state catalog requires at least one definition");
    }
    const catalog = Object.create(null);
    for (const definition of definitions) {
        if (!(definition instanceof ContinuityWardenStateDefinition)) {
            throw new Error("Continuity Warden state catalog accepts only ContinuityWardenStateDefinition entries");
        }
        if (catalog[definition.id] !== undefined) {
            throw new Error(`Continuity Warden state catalog contains duplicate id ${definition.id}`);
        }
        catalog[definition.id] = definition;
    }
    return Object.freeze(catalog);
}

export class ContinuityWardenStatePool {
    constructor({ catalog, worldSeed, attempt = 0, selectionSequence = 0, multipliers = null }) {
        if (catalog === null || typeof catalog !== "object" || Array.isArray(catalog) || !Object.isFrozen(catalog)) {
            throw new Error("ContinuityWardenStatePool requires a fixed catalog object");
        }
        this.catalog = catalog;
        this.definitions = Object.freeze(Object.values(catalog));
        if (this.definitions.length === 0) throw new Error("ContinuityWardenStatePool catalog cannot be empty");
        for (const definition of this.definitions) {
            if (!(definition instanceof ContinuityWardenStateDefinition) || catalog[definition.id] !== definition) {
                throw new Error("ContinuityWardenStatePool catalog must be keyed by definition id");
            }
        }
        this.worldSeed = requireWorldSeed(worldSeed);
        this.attempt = requireAttempt(attempt);
        this.selectionSequence = requireSelectionSequence(selectionSequence);
        this.multipliers = createMultiplierState(this.definitions, multipliers);
    }

    definition(stateId) {
        requireNonEmptyString(stateId, "Continuity Warden state id");
        const definition = this.catalog[stateId];
        if (definition === undefined) throw new Error(`Unknown Continuity Warden state ${stateId}`);
        return definition;
    }

    canEnter(stateId, context) {
        return this.definition(stateId).canEnter(context) === true;
    }

    enter(stateId, context) {
        return this.definition(stateId).enter(context);
    }

    advance(stateId, context) {
        return this.definition(stateId).advance(context);
    }

    exit(stateId, context) {
        return this.definition(stateId).exit(context);
    }

    multiplier(stateId) {
        this.definition(stateId);
        return this.multipliers[stateId];
    }

    select({ lane, context, chainStateId = null }) {
        requireNonEmptyString(lane, "Continuity Warden selection lane");
        if (chainStateId !== null) this.definition(chainStateId);
        const candidates = [];
        let totalWeight = 0;
        for (const definition of this.definitions) {
            if (definition.lane !== lane || definition.canEnter(context) !== true) continue;
            const baseWeight = definition.weight(context);
            if (!Number.isFinite(baseWeight) || baseWeight <= 0) continue;
            const chainApplied = definition.id === chainStateId;
            const weight = baseWeight * this.multipliers[definition.id] * (chainApplied ? CHAIN_MULTIPLIER : 1);
            totalWeight += weight;
            candidates.push(Object.freeze({ definition, weight, chainApplied }));
        }
        if (candidates.length === 0) return null;

        const usedSequence = this.selectionSequence;
        const randomValue = deterministicUnit(this.worldSeed, this.attempt, usedSequence);
        let cursor = randomValue * totalWeight;
        let selected = candidates.at(-1);
        for (const candidate of candidates) {
            cursor -= candidate.weight;
            if (cursor < 0) {
                selected = candidate;
                break;
            }
        }

        for (const definition of this.definitions) {
            if (definition.lane !== lane) continue;
            this.multipliers[definition.id] =
                definition.id === selected.definition.id
                    ? SELECTED_MULTIPLIER
                    : Math.min(MAXIMUM_MULTIPLIER, this.multipliers[definition.id] + MULTIPLIER_RECOVERY);
        }
        this.selectionSequence += 1;
        return Object.freeze({
            definition: selected.definition,
            id: selected.definition.id,
            lane,
            selectionSequence: usedSequence,
            randomValue,
            weight: selected.weight,
            chainApplied: selected.chainApplied
        });
    }

    resetAttempt({ attempt, selectionSequence = 0, multipliers = null }) {
        this.attempt = requireAttempt(attempt);
        this.selectionSequence = requireSelectionSequence(selectionSequence);
        this.multipliers = createMultiplierState(this.definitions, multipliers);
        return this;
    }

    snapshot() {
        return Object.freeze({
            attempt: this.attempt,
            selectionSequence: this.selectionSequence,
            multipliers: immutableMultiplierSnapshot(this.definitions, this.multipliers)
        });
    }

    restore(snapshot) {
        if (snapshot === null || typeof snapshot !== "object") {
            throw new Error("ContinuityWardenStatePool restore requires a snapshot");
        }
        return this.resetAttempt({
            attempt: snapshot.attempt,
            selectionSequence: snapshot.selectionSequence,
            multipliers: snapshot.multipliers
        });
    }
}
