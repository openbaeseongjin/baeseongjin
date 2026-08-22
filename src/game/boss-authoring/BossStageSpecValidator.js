import {
    BOSS_DAMAGE_MODE,
    BOSS_HEALTH_BAR_STYLE,
    BOSS_MECHANIC_TYPE,
    BOSS_STAGE_SPEC_TYPE,
    BOSS_STAGE_SPEC_VERSION,
    BOSS_TRANSITION_TRIGGER,
    BOSS_VICTORY_PRESENTATION_ID,
    BOSS_VISUAL_PRESET_ID,
    BOSS_VULNERABILITY_TARGET_ID,
    BOSS_VULNERABILITY_TRIGGER,
    canonicalizeBossStageSpec,
    freezeBossStageValue
} from "./BossStageSpec.js";

const MECHANIC_TYPES = Object.freeze(Object.values(BOSS_MECHANIC_TYPE));
const VISUAL_PRESET_IDS = Object.freeze(Object.values(BOSS_VISUAL_PRESET_ID));
const VULNERABILITY_TARGET_IDS = Object.freeze(Object.values(BOSS_VULNERABILITY_TARGET_ID));
const VULNERABILITY_TRIGGERS = Object.freeze(Object.values(BOSS_VULNERABILITY_TRIGGER));
const HEALTH_BAR_STYLES = Object.freeze(Object.values(BOSS_HEALTH_BAR_STYLE));
const ARCHITECTURE_IMPACT_MECHANIC_TYPES = Object.freeze([
    BOSS_MECHANIC_TYPE.SIMPLE_LOCK_CHARGE,
    BOSS_MECHANIC_TYPE.ROTATING_GROUND_SLAM,
    BOSS_MECHANIC_TYPE.DIAGONAL_DIVE
]);
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
    if (arena?.routeEdges !== undefined) {
        if (!Array.isArray(arena.routeEdges)) {
            issue(issues, file, "arena-route-edges-invalid");
        } else {
            const anchorIds = new Set((arena.anchors ?? []).map(({ id }) => id));
            const edgeIds = validateIds(arena.routeEdges, issues, file, "arena-route-edge");
            for (const edge of arena.routeEdges) {
                if (
                    !edgeIds.has(edge.id) ||
                    !anchorIds.has(edge.from) ||
                    !anchorIds.has(edge.to) ||
                    edge.from === edge.to
                ) {
                    issue(issues, file, "arena-route-edge-reference-invalid", { id: edge.id ?? null });
                    continue;
                }
                const from = arena.anchors.find(({ id }) => id === edge.from);
                const to = arena.anchors.find(({ id }) => id === edge.to);
                const distance = Math.hypot(from.x - to.x, from.y - to.y);
                if (distance > arena.baseHookReach) {
                    issue(issues, file, "arena-route-relation-out-of-reach", {
                        from: edge.from,
                        to: edge.to,
                        distance
                    });
                }
            }
            const adjacency = Object.fromEntries((arena.anchors ?? []).map(({ id }) => [id, []]));
            for (const edge of arena.routeEdges) {
                if (!adjacency[edge.from] || !adjacency[edge.to] || edge.from === edge.to) continue;
                adjacency[edge.from].push(edge.to);
                adjacency[edge.to].push(edge.from);
            }
            const startId = arena.anchors?.[0]?.id;
            const visited = new Set(startId ? [startId] : []);
            const queue = startId ? [startId] : [];
            while (queue.length > 0) {
                const current = queue.shift();
                for (const next of adjacency[current] ?? []) {
                    if (visited.has(next)) continue;
                    visited.add(next);
                    queue.push(next);
                }
            }
            if (visited.size !== (arena.anchors?.length ?? 0)) {
                issue(issues, file, "arena-route-disconnected");
            }
        }
    } else
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
    if (arena?.phaseZones !== undefined) {
        if (!Array.isArray(arena.phaseZones)) issue(issues, file, "arena-phase-zones-invalid");
        else {
            validateIds(arena.phaseZones, issues, file, "arena-phase-zone");
            for (const zone of arena.phaseZones) {
                if (!validBounds(zone.bounds) || !boundsInside(arena.bounds, zone.bounds)) {
                    issue(issues, file, "arena-phase-zone-bounds-invalid", { id: zone.id ?? null });
                }
                if (typeof zone.phaseId !== "string") {
                    issue(issues, file, "arena-phase-zone-reference-invalid", { id: zone.id ?? null });
                }
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
    if (
        !Number.isFinite(combat.closedBodyDamageMultiplier) ||
        combat.closedBodyDamageMultiplier < 0 ||
        combat.closedBodyDamageMultiplier > 1
    ) {
        issue(issues, file, "combat-closed-body-multiplier-invalid");
    }
    if (combat.generalDamageMode !== BOSS_DAMAGE_MODE.STANDARD_COMBAT) {
        issue(issues, file, "combat-general-damage-mode-invalid");
    }
    if (combat.participantCountSnapshot !== "boss-stage-start") {
        issue(issues, file, "combat-participant-snapshot-invalid");
    }
    if (
        combat.weakNormalDamageMultiplier !== undefined &&
        (!Number.isFinite(combat.weakNormalDamageMultiplier) ||
            combat.weakNormalDamageMultiplier < 0 ||
            combat.weakNormalDamageMultiplier > 10)
    ) {
        issue(issues, file, "combat-weak-normal-multiplier-invalid");
    }
    if (combat.architectureImpactBossDamage !== undefined && combat.architectureImpactBossDamage !== 0) {
        issue(issues, file, "combat-architecture-impact-damage-invalid");
    }
}

function validateMechanics(spec, issues, file) {
    if (!Array.isArray(spec.mechanics)) {
        issue(issues, file, "mechanics-invalid");
        return new Set();
    }
    const ids = validateIds(spec.mechanics, issues, file, "mechanic");
    const validArchitectureIds = new Set(
        (spec.arena?.surfaces ?? []).filter(({ validArchitecture }) => validArchitecture === true).map(({ id }) => id)
    );
    const phaseZoneIds = new Set((spec.arena?.phaseZones ?? []).map(({ id }) => id));
    for (const mechanic of spec.mechanics) {
        if (!MECHANIC_TYPES.includes(mechanic.type)) {
            issue(issues, file, "mechanic-type-unregistered", { id: mechanic.id, type: mechanic.type ?? null });
        }
        if (!finitePoint(mechanic.position)) issue(issues, file, "mechanic-position-invalid", { id: mechanic.id });
        if (mechanic.bounds !== undefined && !validBounds(mechanic.bounds)) {
            issue(issues, file, "mechanic-bounds-invalid", { id: mechanic.id });
        }
        if (!isObject(mechanic.parameters)) issue(issues, file, "mechanic-parameters-invalid", { id: mechanic.id });
        if (
            mechanic.type === BOSS_MECHANIC_TYPE.BEAM_FAILURE &&
            (!Number.isFinite(mechanic.parameters?.failureProgress) ||
                mechanic.parameters.failureProgress <= 0 ||
                mechanic.parameters.failureProgress >= 1 ||
                !positive(mechanic.parameters.travelSpeed))
        ) {
            issue(issues, file, "beam-failure-parameters-invalid", { id: mechanic.id });
        }
        if (ARCHITECTURE_IMPACT_MECHANIC_TYPES.includes(mechanic.type)) {
            const surfaceIds = mechanic.parameters?.validArchitectureSurfaceIds;
            if (
                !Array.isArray(surfaceIds) ||
                surfaceIds.length === 0 ||
                surfaceIds.some((id) => !validArchitectureIds.has(id))
            ) {
                issue(issues, file, "mechanic-valid-architecture-reference-invalid", { id: mechanic.id });
            }
        }
        if (
            mechanic.type === BOSS_MECHANIC_TYPE.PHASE_REPOSITION &&
            !phaseZoneIds.has(mechanic.parameters?.targetZoneId)
        ) {
            issue(issues, file, "mechanic-phase-zone-reference-invalid", { id: mechanic.id });
        }
    }
    return ids;
}

function validatePhases(spec, mechanicIds, issues, file) {
    if (!Array.isArray(spec.phases) || spec.phases.length === 0) {
        issue(issues, file, "phases-invalid");
        return;
    }
    validateIds(spec.phases, issues, file, "phase");
    const phaseIds = new Set(spec.phases.map(({ id }) => id));
    for (const zone of spec.arena?.phaseZones ?? []) {
        if (!phaseIds.has(zone.phaseId)) {
            issue(issues, file, "arena-phase-zone-reference-invalid", { id: zone.id });
        }
    }
    const orders = spec.phases.map(({ order }) => order);
    if (orders.some((order, index) => order !== index + 1)) {
        issue(issues, file, "phase-order-invalid");
    }
    for (const phase of spec.phases) {
        if (!positive(phase.basePhaseHealth)) issue(issues, file, "phase-base-health-invalid", { id: phase.id });
        if (phase.startPosition !== undefined && !finitePoint(phase.startPosition)) {
            issue(issues, file, "phase-start-position-invalid", { id: phase.id });
        }
        if (!Array.isArray(phase.mechanicIds) || phase.mechanicIds.some((id) => !mechanicIds.has(id))) {
            issue(issues, file, "phase-mechanic-reference-invalid", { id: phase.id });
        }
        if (!isObject(phase.vulnerability) || typeof phase.vulnerability.targetId !== "string") {
            issue(issues, file, "phase-vulnerability-invalid", { id: phase.id });
        } else {
            if (!VULNERABILITY_TARGET_IDS.includes(phase.vulnerability.targetId)) {
                issue(issues, file, "phase-vulnerability-target-invalid", { id: phase.id });
            }
            if (!VULNERABILITY_TRIGGERS.includes(phase.vulnerability.trigger)) {
                issue(issues, file, "phase-vulnerability-trigger-invalid", { id: phase.id });
            }
            if (!positive(phase.vulnerability.durationSeconds)) {
                issue(issues, file, "phase-vulnerability-duration-invalid", { id: phase.id });
            }
            if (phase.vulnerability.offset !== undefined && !finitePoint(phase.vulnerability.offset)) {
                issue(issues, file, "phase-vulnerability-offset-invalid", { id: phase.id });
            }
            if (phase.vulnerability.radius !== undefined && !positive(phase.vulnerability.radius)) {
                issue(issues, file, "phase-vulnerability-radius-invalid", { id: phase.id });
            }
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
    if (
        !isObject(spec.boss) ||
        typeof spec.boss.actorId !== "string" ||
        !validBounds(spec.boss.collider) ||
        !VISUAL_PRESET_IDS.includes(spec.boss.visualPresetId)
    ) {
        issue(issues, file, "boss-actor-invalid");
    }
    const mechanicIds = validateMechanics(spec, issues, file);
    validatePhases(spec, mechanicIds, issues, file);
    if (!isObject(spec.hud) || !HEALTH_BAR_STYLES.includes(spec.hud.healthBar?.style)) {
        issue(issues, file, "boss-hud-invalid");
    }
    if (
        !isObject(spec.transition) ||
        spec.transition.sourceAreaId !== spec.sourceAreaId ||
        spec.transition.nextAreaId !== spec.nextAreaId ||
        spec.transition.entryTrigger !== BOSS_TRANSITION_TRIGGER.CHECKPOINT_COMPLETE ||
        spec.transition.victoryTrigger !== BOSS_TRANSITION_TRIGGER.ALL_PHASES_DEPLETED ||
        !Object.values(BOSS_VICTORY_PRESENTATION_ID).includes(spec.transition.victoryPresentationId)
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
    const editableCombatKeys = Object.freeze([
        "additionalPlayerMultiplier",
        "weakFixedPercent",
        "closedBodyDamageMultiplier",
        "weakNormalDamageMultiplier",
        "architectureImpactBossDamage"
    ]);
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
