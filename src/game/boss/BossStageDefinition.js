const BOSS_STAGE_SPEC_TYPE = "boss-stage";
const DEFAULT_ADDITIONAL_PLAYER_MULTIPLIER = 0.5;
const DEFAULT_WEAK_FIXED_PERCENT = 0.25;
const MIN_PARTICIPANTS = 1;
const MAX_PARTICIPANTS = 4;

function freezeValue(value) {
    if (Array.isArray(value)) return Object.freeze(value.map((entry) => freezeValue(entry)));
    if (!value || typeof value !== "object") return value;
    return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, freezeValue(entry)])));
}

function requireId(value, label) {
    if (typeof value !== "string" || !value.trim()) throw new Error(`${label} must be a non-empty string`);
    return value;
}

function requireNumber(value, label, { minimum = Number.NEGATIVE_INFINITY, maximum = Number.POSITIVE_INFINITY } = {}) {
    if (!Number.isFinite(value) || value < minimum || value > maximum) {
        throw new Error(`${label} must be between ${minimum} and ${maximum}`);
    }
    return value;
}

function normalizePhase(phase, index) {
    const phaseNumber = index + 1;
    if (!phase || typeof phase !== "object" || Array.isArray(phase)) {
        throw new Error(`Boss phase ${phaseNumber} must be an object`);
    }
    return freezeValue({
        ...phase,
        id: requireId(phase.id ?? `phase-${phaseNumber}`, `Boss phase ${phaseNumber} id`),
        phase: phaseNumber,
        basePhaseHealth: requireNumber(phase.basePhaseHealth, `Boss phase ${phaseNumber} basePhaseHealth`, {
            minimum: 1
        }),
        weakTargetId: requireId(
            phase.weakTargetId ??
                phase.targetId ??
                phase.vulnerability?.targetId ??
                `boss-01:weakpoint:phase-${phaseNumber}`,
            `Boss phase ${phaseNumber} weakTargetId`
        ),
        mechanicId: requireId(phase.mechanicId ?? phase.mechanicIds?.[0], `Boss phase ${phaseNumber} mechanicId`),
        objective: phase.objective ?? phase.hud?.objective ?? null
    });
}

export function roundBossHealth(value) {
    return 5 * Math.round(requireNumber(value, "Boss health value", { minimum: 0 }) / 5);
}

export function scaledBossPhaseHealth(basePhaseHealth, participantCount, additionalPlayerMultiplier) {
    if (
        !Number.isSafeInteger(participantCount) ||
        participantCount < MIN_PARTICIPANTS ||
        participantCount > MAX_PARTICIPANTS
    ) {
        throw new Error(`Boss participant count must be ${MIN_PARTICIPANTS}..${MAX_PARTICIPANTS}`);
    }
    return roundBossHealth(basePhaseHealth * (1 + additionalPlayerMultiplier * (participantCount - 1)));
}

export class BossStageDefinition {
    constructor(spec) {
        if (!spec || typeof spec !== "object" || Array.isArray(spec)) {
            throw new Error("BossStageDefinition requires a spec object");
        }
        const specType = spec.specType ?? BOSS_STAGE_SPEC_TYPE;
        if (specType !== BOSS_STAGE_SPEC_TYPE) throw new Error(`unsupported Boss specType: ${specType}`);
        if (!Array.isArray(spec.phases) || spec.phases.length === 0) {
            throw new Error("Boss Stage requires at least one phase");
        }
        this.specType = specType;
        this.id = requireId(spec.id ?? spec.stageId, "Boss Stage id");
        this.revision = requireId(spec.revision ?? spec.specRevision ?? spec.schemaVersion, "Boss Stage revision");
        this.name = requireId(spec.name, "Boss Stage name");
        this.additionalPlayerMultiplier = requireNumber(
            spec.combat?.additionalPlayerMultiplier ??
                spec.additionalPlayerMultiplier ??
                DEFAULT_ADDITIONAL_PLAYER_MULTIPLIER,
            "Boss additionalPlayerMultiplier",
            { minimum: 0, maximum: 1 }
        );
        this.weakFixedPercent = requireNumber(
            spec.combat?.weakFixedPercent ?? spec.weakFixedPercent ?? DEFAULT_WEAK_FIXED_PERCENT,
            "Boss weakFixedPercent",
            { minimum: 0, maximum: 1 }
        );
        this.phases = Object.freeze(spec.phases.map((phase, index) => normalizePhase(phase, index)));
        this.arena = freezeValue({ ...(spec.arena ?? {}), boss: spec.boss ?? null, mechanics: spec.mechanics ?? [] });
        this.bossHud = freezeValue(spec.bossHud ?? spec.hud ?? {});
        this.sourceAreaId = spec.sourceAreaId ?? spec.transition?.sourceAreaId ?? null;
        this.nextAreaId = spec.nextAreaId ?? spec.transition?.nextAreaId ?? null;
        Object.freeze(this);
    }

    scaledHealth(participantCount) {
        const phaseHealths = this.phases.map(({ basePhaseHealth }) =>
            scaledBossPhaseHealth(basePhaseHealth, participantCount, this.additionalPlayerMultiplier)
        );
        const maxHealth = phaseHealths.reduce((total, health) => total + health, 0);
        const phaseFloors = phaseHealths.map((_, index) =>
            phaseHealths.slice(index + 1).reduce((total, health) => total + health, 0)
        );
        return freezeValue({ participantCount, phaseHealths, phaseFloors, maxHealth });
    }
}

export function defineBossStage(spec) {
    return spec instanceof BossStageDefinition ? spec : new BossStageDefinition(spec);
}
