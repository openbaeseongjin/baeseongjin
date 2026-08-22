import {
    BOSS_DAMAGE_MODE,
    BOSS_MECHANIC_TYPE,
    BOSS_STAGE_SPEC_TYPE,
    BOSS_STAGE_SPEC_VERSION,
    canonicalizeBossStageSpec,
    freezeBossStageValue
} from "./BossStageSpec.js";

const MECHANIC_TYPES = Object.freeze(Object.values(BOSS_MECHANIC_TYPE));
const EDITABLE_ROOTS = Object.freeze([
    "arena",
    "combat",
    "boss",
    "phases",
    "mechanics",
    "hud",
    "transition",
    "nextAreaId"
]);

function issue(issues, file, code, details = {}) {
    issues.push({ file, code, ...details });
}

function isObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function finitePoint(value) {
    return Number.isFinite(value?.x) && Number.isFinite(value?.y);
}

function positive(value) {
    return Number.isFinite(value) && value > 0;
}

function validBounds(value) {
    return finitePoint(value) && positive(value.width) && positive(value.height);
}

function pointInside(bounds, point) {
    return (
        finitePoint(point) &&
        point.x >= bounds.x &&
        point.x <= bounds.x + bounds.width &&
        point.y >= bounds.y &&
        point.y <= bounds.y + bounds.height
    );
}

function boundsInside(container, value) {
    return (
        validBounds(value) &&
        value.x >= container.x &&
        value.x + value.width <= container.x + container.width &&
        value.y >= container.y &&
        value.y + value.height <= container.y + container.height
    );
}

function validateIds(entries, issues, file, prefix) {
    const ids = new Set();
    for (const entry of entries ?? []) {
        if (typeof entry?.id !== "string" || entry.id.length === 0) issue(issues, file, `${prefix}-id-invalid`);
        else if (ids.has(entry.id)) issue(issues, file, `${prefix}-id-duplicate`, { id: entry.id });
        else ids.add(entry.id);
    }
    return ids;
}

function validateArena(spec, issues, file) {
    const arena = spec.arena;
    if (!isObject(arena) || !validBounds(arena.bounds)) issue(issues, file, "arena-bounds-invalid");
    for (const key of ["entry", "exit"]) {
        if (!finitePoint(arena?.[key]) || typeof arena[key].id !== "string") {
            issue(issues, file, `arena-${key}-invalid`);
        }
        if (validBounds(arena?.bounds) && !pointInside(arena.bounds, arena?.[key])) {
            issue(issues, file, `arena-${key}-out-of-bounds`);
        }
    }
    for (const key of ["surfaces", "anchors", "recoveryPoints"]) {
        if (!Array.isArray(arena?.[key])) issue(issues, file, `arena-${key}-invalid`);
    }
    const ids = validateIds(
        [...(arena?.surfaces ?? []), ...(arena?.anchors ?? []), ...(arena?.recoveryPoints ?? [])],
        issues,
        file,
        "arena-object"
    );
    for (const surface of arena?.surfaces ?? []) {
        if (!validBounds(surface.bounds)) issue(issues, file, "arena-surface-bounds-invalid", { id: surface.id });
        else if (validBounds(arena.bounds) && !boundsInside(arena.bounds, surface.bounds)) {
            issue(issues, file, "arena-surface-out-of-bounds", { id: surface.id });
        }
    }
    for (const entry of [...(arena?.anchors ?? []), ...(arena?.recoveryPoints ?? [])]) {
        if (!finitePoint(entry)) issue(issues, file, "arena-point-invalid", { id: entry?.id ?? null });
        else if (validBounds(arena.bounds) && !pointInside(arena.bounds, entry)) {
            issue(issues, file, "arena-point-out-of-bounds", { id: entry.id });
        }
    }
    if (!positive(arena?.baseHookReach)) issue(issues, file, "arena-hook-reach-invalid");
    for (let index = 0; index < (arena?.anchors?.length ?? 0); index += 1) {
        for (let targetIndex = index + 1; targetIndex < arena.anchors.length; targetIndex += 1) {
            const distance = Math.hypot(
                arena.anchors[index].x - arena.anchors[targetIndex].x,
                arena.anchors[index].y - arena.anchors[targetIndex].y
            );
            if (targetIndex === index + 1 && distance > arena.baseHookReach) {
                issue(issues, file, "arena-route-relation-out-of-reach", {
                    from: arena.anchors[index].id,
                    to: arena.anchors[targetIndex].id,
                    distance
                });
            }
            if (targetIndex > index + 1 && distance <= arena.baseHookReach) {
                issue(issues, file, "arena-route-unintended-shortcut", {
                    from: arena.anchors[index].id,
                    to: arena.anchors[targetIndex].id,
                    distance
                });
            }
        }
    }
    return ids;
}

function validateCombat(spec, issues, file) {
    const combat = spec.combat;
    if (!isObject(combat)) {
        issue(issues, file, "combat-invalid");
        return;
    }
    if (
        !Number.isFinite(combat.additionalPlayerMultiplier) ||
        combat.additionalPlayerMultiplier < 0 ||
        combat.additionalPlayerMultiplier > 1
    ) {
        issue(issues, file, "combat-player-multiplier-invalid");
    }
    if (!Number.isFinite(combat.weakFixedPercent) || combat.weakFixedPercent < 0 || combat.weakFixedPercent > 1) {
        issue(issues, file, "combat-weak-bonus-invalid");
    }
    if (combat.generalDamageMode !== BOSS_DAMAGE_MODE.STANDARD_COMBAT) {
        issue(issues, file, "combat-general-damage-mode-invalid");
    }
    if (combat.participantCountSnapshot !== "boss-stage-start") {
        issue(issues, file, "combat-participant-snapshot-invalid");
    }
}

function validateMechanics(spec, issues, file) {
    if (!Array.isArray(spec.mechanics)) {
        issue(issues, file, "mechanics-invalid");
        return new Set();
    }
    const ids = validateIds(spec.mechanics, issues, file, "mechanic");
    for (const mechanic of spec.mechanics) {
        if (!MECHANIC_TYPES.includes(mechanic.type)) {
            issue(issues, file, "mechanic-type-unregistered", { id: mechanic.id, type: mechanic.type ?? null });
        }
        if (!finitePoint(mechanic.position)) issue(issues, file, "mechanic-position-invalid", { id: mechanic.id });
        if (mechanic.bounds !== undefined && !validBounds(mechanic.bounds)) {
            issue(issues, file, "mechanic-bounds-invalid", { id: mechanic.id });
        }
        if (!isObject(mechanic.parameters)) issue(issues, file, "mechanic-parameters-invalid", { id: mechanic.id });
    }
    return ids;
}

function validatePhases(spec, mechanicIds, issues, file) {
    if (!Array.isArray(spec.phases) || spec.phases.length === 0) {
        issue(issues, file, "phases-invalid");
        return;
    }
    validateIds(spec.phases, issues, file, "phase");
    const orders = spec.phases.map(({ order }) => order);
    if (orders.some((order, index) => order !== index + 1)) {
        issue(issues, file, "phase-order-invalid");
    }
    for (const phase of spec.phases) {
        if (!positive(phase.basePhaseHealth)) issue(issues, file, "phase-base-health-invalid", { id: phase.id });
        if (!Array.isArray(phase.mechanicIds) || phase.mechanicIds.some((id) => !mechanicIds.has(id))) {
            issue(issues, file, "phase-mechanic-reference-invalid", { id: phase.id });
        }
        if (!isObject(phase.vulnerability) || typeof phase.vulnerability.targetId !== "string") {
            issue(issues, file, "phase-vulnerability-invalid", { id: phase.id });
        } else if (!positive(phase.vulnerability.durationSeconds)) {
            issue(issues, file, "phase-vulnerability-duration-invalid", { id: phase.id });
        }
        if (!isObject(phase.hud) || typeof phase.hud.objective !== "string") {
            issue(issues, file, "phase-hud-invalid", { id: phase.id });
        }
    }
}

export function validateBossStageSpec(spec, { file = "boss-stage.json" } = {}) {
    const issues = [];
    if (!isObject(spec)) {
        issue(issues, file, "spec-not-object");
        return freezeBossStageValue({ valid: false, issues });
    }
    if (spec.schemaVersion !== BOSS_STAGE_SPEC_VERSION) issue(issues, file, "schema-version-invalid");
    if (spec.specType !== BOSS_STAGE_SPEC_TYPE) issue(issues, file, "spec-type-invalid");
    if (!/^boss-\d+$/.test(spec.id ?? "")) issue(issues, file, "boss-id-invalid");
    if (typeof spec.name !== "string" || spec.name.length === 0) issue(issues, file, "boss-name-invalid");
    if (typeof spec.sourceAreaId !== "string" || typeof spec.nextAreaId !== "string") {
        issue(issues, file, "boss-transition-area-invalid");
    }
    validateArena(spec, issues, file);
    validateCombat(spec, issues, file);
    if (!isObject(spec.boss) || typeof spec.boss.actorId !== "string" || !validBounds(spec.boss.collider)) {
        issue(issues, file, "boss-actor-invalid");
    }
    const mechanicIds = validateMechanics(spec, issues, file);
    validatePhases(spec, mechanicIds, issues, file);
    if (!isObject(spec.hud) || spec.hud.healthBar?.style !== "segmented-total") {
        issue(issues, file, "boss-hud-invalid");
    }
    if (
        !isObject(spec.transition) ||
        spec.transition.sourceAreaId !== spec.sourceAreaId ||
        spec.transition.nextAreaId !== spec.nextAreaId
    ) {
        issue(issues, file, "boss-transition-invalid");
    }
    return freezeBossStageValue({ valid: issues.length === 0, issues });
}

export function validateBossStageEditorMutation(baseline, candidate, { file = "boss-stage.json" } = {}) {
    const issues = [];
    for (const key of Object.keys(baseline ?? {})) {
        if (EDITABLE_ROOTS.includes(key)) continue;
        if (
            JSON.stringify(canonicalizeBossStageSpec(baseline[key])) !==
            JSON.stringify(canonicalizeBossStageSpec(candidate?.[key]))
        ) {
            issue(issues, file, "editor-read-only-changed", { domain: key });
        }
    }
    const editableCombatKeys = Object.freeze(["additionalPlayerMultiplier", "weakFixedPercent"]);
    const baselineLockedCombat = Object.fromEntries(
        Object.entries(baseline?.combat ?? {}).filter(([key]) => !editableCombatKeys.includes(key))
    );
    const candidateLockedCombat = Object.fromEntries(
        Object.entries(candidate?.combat ?? {}).filter(([key]) => !editableCombatKeys.includes(key))
    );
    if (
        JSON.stringify(canonicalizeBossStageSpec(baselineLockedCombat)) !==
        JSON.stringify(canonicalizeBossStageSpec(candidateLockedCombat))
    ) {
        issue(issues, file, "editor-read-only-changed", { domain: "combat-policy" });
    }
    return freezeBossStageValue({ valid: issues.length === 0, issues });
}
