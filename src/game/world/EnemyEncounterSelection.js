import { SWARM_MEMBER_COUNT } from "../EnemyType.js";

const MAX_WORLD_SEED = 0xffffffff;
const FNV_OFFSET = 2166136261;
const FNV_PRIME = 16777619;

function requireNonEmptyString(value, label) {
    if (typeof value !== "string" || value.length === 0) throw new Error(`${label} must be a non-empty string`);
    return value;
}

function requireRunSeed(value) {
    if (!Number.isSafeInteger(value) || value < 1 || value > MAX_WORLD_SEED) {
        throw new Error(`runSeed must be an integer between 1 and ${MAX_WORLD_SEED}`);
    }
    return value;
}

function selectionHash(value) {
    let hash = FNV_OFFSET;
    for (let index = 0; index < value.length; index += 1) {
        hash ^= value.charCodeAt(index);
        hash = Math.imul(hash, FNV_PRIME) >>> 0;
    }
    return hash;
}

function validateAllowedEnemyTypes(value) {
    if (!Array.isArray(value) || value.length === 0) {
        throw new Error("allowedEnemyTypes must contain at least one enemy type");
    }
    const types = value.map((enemyType) => requireNonEmptyString(enemyType, "enemy type"));
    if (new Set(types).size !== types.length) throw new Error("allowedEnemyTypes must be unique");
    return Object.freeze([...types]);
}

export function resolveEnemySlot(slot, { runSeed, worldRevision } = {}) {
    if (!slot || typeof slot !== "object") throw new Error("enemy slot must be an object");
    const id = requireNonEmptyString(slot.id, "slot id");
    const hasFixed = slot.fixedEnemyType !== undefined && slot.fixedEnemyType !== null;
    const hasPool = slot.allowedEnemyTypes !== undefined && slot.allowedEnemyTypes !== null;
    if (Number(hasFixed) + Number(hasPool) !== 1) {
        throw new Error("enemy slot must define exactly one enemy selection source");
    }

    let enemyType;
    let selectionKind;
    let allowedEnemyTypes = null;
    if (hasFixed) {
        enemyType = requireNonEmptyString(slot.fixedEnemyType, "enemy type");
        selectionKind = "fixed";
    } else {
        allowedEnemyTypes = validateAllowedEnemyTypes(slot.allowedEnemyTypes);
        const seed = requireRunSeed(runSeed);
        const revision = requireNonEmptyString(worldRevision, "worldRevision");
        const hash = selectionHash(`${revision}\u0000${seed}\u0000${id}`);
        enemyType = allowedEnemyTypes[hash % allowedEnemyTypes.length];
        selectionKind = "pool";
    }

    return Object.freeze({
        ...slot,
        ...(allowedEnemyTypes ? { allowedEnemyTypes } : {}),
        id,
        enemyType,
        selectionKind
    });
}

function requireFinitePoint(value, label) {
    if (!Number.isFinite(value?.x) || !Number.isFinite(value?.y)) {
        throw new Error(`${label} must contain finite x and y`);
    }
    return Object.freeze({ x: value.x, y: value.y });
}

function normalizeActivation(value) {
    if (value === null || value === undefined) return null;
    for (const [key, entry] of Object.entries(value)) {
        if (!Number.isFinite(entry)) throw new Error(`encounter activation.${key} must be finite`);
    }
    return Object.freeze({ ...value });
}

function normalizeSwarmMemberCount(value) {
    if (value === undefined || value === null) return null;
    if (!Number.isSafeInteger(value) || value < SWARM_MEMBER_COUNT.MINIMUM || value > SWARM_MEMBER_COUNT.MAXIMUM) {
        throw new Error(
            `swarmMemberCount must be an integer between ${SWARM_MEMBER_COUNT.MINIMUM} and ${SWARM_MEMBER_COUNT.MAXIMUM}`
        );
    }
    return value;
}

export function resolveEnemyEncounter(encounter, context) {
    if (!encounter || typeof encounter !== "object" || Array.isArray(encounter)) {
        throw new Error("enemy encounter must be an object");
    }
    if ("areaId" in encounter || "areaId" in (encounter.enemySelection ?? {})) {
        throw new Error("enemy encounter must not use areaId as runtime authority");
    }
    const encounterId = requireNonEmptyString(encounter.encounterId, "encounter id");
    const slotId = requireNonEmptyString(encounter.slotId, "slot id");
    const position = requireFinitePoint(encounter.position, "encounter position");
    const activation = normalizeActivation(encounter.activation);
    const swarmMemberCount = normalizeSwarmMemberCount(encounter.swarmMemberCount);
    const selection = resolveEnemySlot(
        {
            id: slotId,
            fixedEnemyType: encounter.enemySelection?.fixedEnemyType,
            allowedEnemyTypes: encounter.enemySelection?.allowedEnemyTypes
        },
        context
    );
    return Object.freeze({
        encounterId,
        slotId,
        position,
        activation,
        ...(swarmMemberCount !== null ? { swarmMemberCount } : {}),
        enemyType: selection.enemyType,
        selectionKind: selection.selectionKind,
        ...(encounter.legacyStageAlias ? { legacyStageAlias: encounter.legacyStageAlias } : {})
    });
}

export function resolveSectorEnemyEncounters(catalog, context) {
    if (!Array.isArray(catalog?.sectors)) throw new Error("sector catalog must contain sectors");
    return Object.freeze(
        catalog.sectors.flatMap((sector) =>
            sector.landmarks.flatMap((landmark) =>
                landmark.encounters
                    .filter((encounter) => encounter.enemySelection)
                    .map((encounter) => resolveEnemyEncounter(encounter, context))
            )
        )
    );
}
