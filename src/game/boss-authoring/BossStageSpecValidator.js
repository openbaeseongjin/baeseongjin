import {
    BOSS_ANCHOR_ROLE,
    BOSS_DAMAGE_MODE,
    BOSS_HEALTH_BAR_STYLE,
    BOSS_MECHANIC_TYPE,
    BOSS_PARTICIPANT_DEFEAT_POLICY,
    BOSS_STAGE_SPEC_TYPE,
    BOSS_STAGE_SPEC_VERSION,
    BOSS_TERMINAL_COMPLETION,
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
const PARTICIPANT_DEFEAT_POLICIES = Object.freeze(Object.values(BOSS_PARTICIPANT_DEFEAT_POLICY));
const ANCHOR_ROLES = Object.freeze(Object.values(BOSS_ANCHOR_ROLE));
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
const ARENA_ENTRY_MAX_SUPPORT_DROP = 96;
const SCANNER_CYCLE_KEYS = Object.freeze(["available", "warning", "locked", "reset"]);
const CONTINUITY_WARDEN_POSITIVE_PARAMETERS = Object.freeze([
    "jumpGravity",
    "jumpDurationSeconds",
    "jumpTelegraphSeconds",
    "landingActiveSeconds",
    "landingRecoverySeconds",
    "landingBurstRadius",
    "missileSpeed",
    "missileDamage",
    "missileRadius",
    "missileLifetimeSeconds",
    "missileTurnRateRadiansPerSecond",
    "trackingStopDistance",
    "walkSpeed"
]);
const CONTINUITY_WARDEN_ARENA = Object.freeze({
    MAIN_KIND: "main-security-runway",
    PLATFORM_KIND: "raised-ledge",
    MAIN_WIDTH: 3200,
    PLATFORM_COUNT: 3,
    ANCHOR_COUNT: 10,
    BODY_WIDTH: 120,
    BODY_HEIGHT: 150
});
const LOWER_SECTOR_COMMANDER_POSITIVE_PARAMETERS = Object.freeze([
    "acceleration",
    "deceleration",
    "grabRange",
    "grabTelegraphSeconds",
    "grabLeadSeconds",
    "grabTimeoutSeconds",
    "grabDamage",
    "grabHoldSeconds",
    "grabPullSeconds",
    "grabHammerDamage",
    "grabCooldownSeconds",
    "captureCliffMargin",
    "captureFrontGap",
    "hammerRange",
    "hammerHeight",
    "hammerTelegraphSeconds",
    "hammerActiveSeconds",
    "hammerDamage",
    "chargeDistance",
    "chargeSpeed",
    "chargeTelegraphSeconds",
    "chargeActiveSeconds",
    "chargeDamage",
    "chargeKnockback"
]);
const LOWER_SECTOR_COMMANDER_ARENA = Object.freeze({
    MAIN_KIND: "commander-main-runway",
    CROSSBEAM_KIND: "commander-crossbeam",
    WIDTH: 3200,
    HEIGHT: 1200,
    MAIN_WIDTH: 2800,
    CROSSBEAM_COUNT: 3,
    BODY_WIDTH: 128,
    BODY_HEIGHT: 192
});

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

function hasEntrySupport(entry, surfaces) {
    return (surfaces ?? []).some(
        (surface) =>
            validBounds(surface?.bounds) &&
            surface.collision !== false &&
            entry.x >= surface.bounds.x &&
            entry.x <= surface.bounds.x + surface.bounds.width &&
            entry.y <= surface.bounds.y &&
            surface.bounds.y - entry.y <= ARENA_ENTRY_MAX_SUPPORT_DROP
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
        if (surface.collision !== false && surface.grappleable !== true) {
            issue(issues, file, "arena-collision-surface-not-grappleable", { id: surface.id ?? null });
        }
    }
    if (finitePoint(arena?.entry) && !hasEntrySupport(arena.entry, arena?.surfaces)) {
        issue(issues, file, "arena-entry-support-missing");
    }
    for (const entry of [...(arena?.anchors ?? []), ...(arena?.recoveryPoints ?? [])]) {
        if (!finitePoint(entry)) issue(issues, file, "arena-point-invalid", { id: entry?.id ?? null });
        else if (validBounds(arena.bounds) && !pointInside(arena.bounds, entry)) {
            issue(issues, file, "arena-point-out-of-bounds", { id: entry.id });
        }
    }
    for (const anchor of arena?.anchors ?? []) {
        if (anchor.role !== undefined && !ANCHOR_ROLES.includes(anchor.role)) {
            issue(issues, file, "arena-anchor-role-invalid", { id: anchor.id ?? null });
        }
    }
    const surfaceIds = new Set((arena?.surfaces ?? []).map(({ id }) => id));
    const surfaceById = Object.fromEntries((arena?.surfaces ?? []).map((surface) => [surface.id, surface]));
    for (const anchor of arena?.anchors ?? []) {
        if (anchor.role !== BOSS_ANCHOR_ROLE.SWING_ATTACK) continue;
        if (typeof anchor.surfaceId !== "string" || !surfaceIds.has(anchor.surfaceId)) {
            issue(issues, file, "arena-anchor-surface-reference-invalid", { id: anchor.id ?? null });
            continue;
        }
        const surface = surfaceById[anchor.surfaceId];
        if (
            surface.bounds.width !== 24 ||
            surface.bounds.height !== 24 ||
            surface.bounds.x + 12 !== anchor.x ||
            surface.bounds.y + 12 !== anchor.y
        ) {
            issue(issues, file, "arena-anchor-surface-position-mismatch", { id: anchor.id ?? null });
        }
    }
    if (!positive(arena?.baseHookReach)) issue(issues, file, "arena-hook-reach-invalid");
    if (arena?.scannerGroups !== undefined) {
        if (!Array.isArray(arena.scannerGroups)) issue(issues, file, "arena-scanner-groups-invalid");
        else {
            validateIds(arena.scannerGroups, issues, file, "arena-scanner-group");
            const groupBySurfaceId = Object.create(null);
            for (const group of arena.scannerGroups) {
                const cycle = group?.cycle;
                if (
                    !isObject(cycle) ||
                    SCANNER_CYCLE_KEYS.some((key) => !positive(cycle[key])) ||
                    !Number.isFinite(group.phaseOffsetSeconds ?? 0)
                ) {
                    issue(issues, file, "arena-scanner-cycle-invalid", { id: group?.id ?? null });
                }
                if (!Array.isArray(group?.controlledSurfaceIds) || group.controlledSurfaceIds.length === 0) {
                    issue(issues, file, "arena-scanner-surfaces-invalid", { id: group?.id ?? null });
                    continue;
                }
                for (const surfaceId of group.controlledSurfaceIds) {
                    const surface = surfaceById[surfaceId];
                    if (!surface || surface.grappleable !== true || groupBySurfaceId[surfaceId]) {
                        issue(issues, file, "arena-scanner-surface-reference-invalid", {
                            id: group?.id ?? null,
                            surfaceId
                        });
                        continue;
                    }
                    groupBySurfaceId[surfaceId] = group.id;
                }
            }
        }
    }
    if (arena?.routeEdges !== undefined) {
        if (!Array.isArray(arena.routeEdges)) {
            issue(issues, file, "arena-route-edges-invalid");
        } else {
            const anchorIds = new Set((arena.anchors ?? []).map(({ id }) => id));
            const anchorById = Object.fromEntries((arena.anchors ?? []).map((anchor) => [anchor.id, anchor]));
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
                const from = anchorById[edge.from];
                const to = anchorById[edge.to];
                if (Math.hypot(to.x - from.x, to.y - from.y) > arena.baseHookReach) {
                    issue(issues, file, "arena-route-edge-reach-invalid", { id: edge.id ?? null });
                }
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
    if (!PARTICIPANT_DEFEAT_POLICIES.includes(combat.participantDefeatPolicy)) {
        issue(issues, file, "combat-participant-defeat-policy-invalid");
    }
    if (
        combat.weakNormalDamageMultiplier !== undefined &&
        (!Number.isFinite(combat.weakNormalDamageMultiplier) ||
            combat.weakNormalDamageMultiplier < 0 ||
            combat.weakNormalDamageMultiplier > 10)
    ) {
        issue(issues, file, "combat-weak-normal-multiplier-invalid");
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
        if (mechanic.type === BOSS_MECHANIC_TYPE.CONTINUITY_WARDEN && isObject(mechanic.parameters)) {
            for (const key of CONTINUITY_WARDEN_POSITIVE_PARAMETERS) {
                if (!positive(mechanic.parameters[key])) {
                    issue(issues, file, "continuity-warden-parameter-invalid", { id: mechanic.id, key });
                }
            }
            const fanAngles = mechanic.parameters.missileFanAnglesDegrees;
            if (
                !Array.isArray(fanAngles) ||
                fanAngles.length !== 5 ||
                !fanAngles.every(Number.isFinite) ||
                fanAngles.some((angle, index) => index > 0 && angle <= fanAngles[index - 1]) ||
                fanAngles[0] >= 0 ||
                fanAngles[fanAngles.length - 1] <= 0
            ) {
                issue(issues, file, "continuity-warden-missile-fan-invalid", { id: mechanic.id });
            }
            const summonConfigured = [
                "minionSummonCount",
                "minionSummonSkipAliveCount",
                "minionSummonCooldownSeconds",
                "summonLeft",
                "summonRight"
            ].some((key) => mechanic.parameters[key] !== undefined);
            if (
                summonConfigured &&
                (!Number.isSafeInteger(mechanic.parameters.minionSummonCount) ||
                    mechanic.parameters.minionSummonCount !== 2 ||
                    !Number.isSafeInteger(mechanic.parameters.minionSummonSkipAliveCount) ||
                    mechanic.parameters.minionSummonSkipAliveCount !== 6 ||
                    !positive(mechanic.parameters.minionSummonCooldownSeconds) ||
                    mechanic.parameters.minionSummonCooldownSeconds < 15 ||
                    !finitePoint(mechanic.parameters.summonLeft) ||
                    !finitePoint(mechanic.parameters.summonRight) ||
                    !pointInside(spec.arena.bounds, mechanic.parameters.summonLeft) ||
                    !pointInside(spec.arena.bounds, mechanic.parameters.summonRight))
            ) {
                issue(issues, file, "continuity-warden-summon-parameters-invalid", { id: mechanic.id });
            }
        }
        if (mechanic.type === BOSS_MECHANIC_TYPE.LOWER_SECTOR_COMMANDER && isObject(mechanic.parameters)) {
            for (const key of LOWER_SECTOR_COMMANDER_POSITIVE_PARAMETERS) {
                if (!positive(mechanic.parameters[key])) {
                    issue(issues, file, "lower-sector-commander-parameter-invalid", { id: mechanic.id, key });
                }
            }
            const speeds = mechanic.parameters.walkSpeeds;
            const ratios = mechanic.parameters.intensityHealthRatios;
            const recoveries = mechanic.parameters.recoverySeconds;
            if (!Array.isArray(speeds) || speeds.length !== 3 || !speeds.every(positive)) {
                issue(issues, file, "lower-sector-commander-walk-speeds-invalid", { id: mechanic.id });
            }
            if (
                !Array.isArray(ratios) ||
                ratios.length !== 2 ||
                !ratios.every((value) => Number.isFinite(value) && value > 0 && value < 1) ||
                ratios[0] <= ratios[1]
            ) {
                issue(issues, file, "lower-sector-commander-intensity-ratios-invalid", { id: mechanic.id });
            }
            if (!Array.isArray(recoveries) || recoveries.length !== 3 || !recoveries.every(positive)) {
                issue(issues, file, "lower-sector-commander-recovery-invalid", { id: mechanic.id });
            }
        }
    }
    return ids;
}

function validateLowerSectorCommanderArena(spec, issues, file) {
    if (!spec.mechanics?.some(({ type }) => type === BOSS_MECHANIC_TYPE.LOWER_SECTOR_COMMANDER)) return;
    const bounds = spec.arena?.bounds;
    const surfaces = spec.arena?.surfaces ?? [];
    const mains = surfaces.filter(({ kind }) => kind === LOWER_SECTOR_COMMANDER_ARENA.MAIN_KIND);
    const crossbeams = surfaces.filter(({ kind }) => kind === LOWER_SECTOR_COMMANDER_ARENA.CROSSBEAM_KIND);
    if (
        bounds?.width !== LOWER_SECTOR_COMMANDER_ARENA.WIDTH ||
        bounds?.height !== LOWER_SECTOR_COMMANDER_ARENA.HEIGHT
    ) {
        issue(issues, file, "lower-sector-commander-arena-size-invalid");
    }
    if (mains.length !== 1 || mains[0]?.bounds.width !== LOWER_SECTOR_COMMANDER_ARENA.MAIN_WIDTH) {
        issue(issues, file, "lower-sector-commander-main-floor-invalid");
    }
    if (crossbeams.length !== LOWER_SECTOR_COMMANDER_ARENA.CROSSBEAM_COUNT) {
        issue(issues, file, "lower-sector-commander-crossbeam-count-invalid");
    }
    const collider = spec.boss?.collider;
    const position = spec.boss?.position;
    if (
        collider?.width !== LOWER_SECTOR_COMMANDER_ARENA.BODY_WIDTH ||
        collider?.height !== LOWER_SECTOR_COMMANDER_ARENA.BODY_HEIGHT ||
        collider.x + collider.width * 0.5 !== position?.x ||
        collider.y + collider.height * 0.5 !== position?.y
    ) {
        issue(issues, file, "lower-sector-commander-body-collider-invalid");
    }
}

function validateContinuityWardenArena(spec, issues, file) {
    if (!spec.mechanics?.some(({ type }) => type === BOSS_MECHANIC_TYPE.CONTINUITY_WARDEN)) return;
    const surfaces = spec.arena?.surfaces ?? [];
    const mains = surfaces.filter(({ kind }) => kind === CONTINUITY_WARDEN_ARENA.MAIN_KIND);
    const platforms = surfaces.filter(({ kind }) => kind === CONTINUITY_WARDEN_ARENA.PLATFORM_KIND);
    const main = mains[0];
    if (mains.length !== 1 || main?.bounds.width !== CONTINUITY_WARDEN_ARENA.MAIN_WIDTH) {
        issue(issues, file, "continuity-warden-main-floor-invalid");
    }
    if (
        platforms.length !== CONTINUITY_WARDEN_ARENA.PLATFORM_COUNT ||
        platforms.some(({ oneWay }) => oneWay !== true)
    ) {
        issue(issues, file, "continuity-warden-platform-layout-invalid");
    }
    if ((spec.arena.recoveryPoints ?? []).length !== 0) {
        issue(issues, file, "continuity-warden-recovery-forbidden");
    }
    if ((spec.arena.anchors ?? []).length !== CONTINUITY_WARDEN_ARENA.ANCHOR_COUNT) {
        issue(issues, file, "continuity-warden-anchor-count-invalid");
    }
    const collider = spec.boss?.collider;
    const position = spec.boss?.position;
    if (
        collider?.width !== CONTINUITY_WARDEN_ARENA.BODY_WIDTH ||
        collider?.height !== CONTINUITY_WARDEN_ARENA.BODY_HEIGHT ||
        collider.x + collider.width * 0.5 !== position?.x ||
        collider.y + collider.height * 0.5 !== position?.y
    ) {
        issue(issues, file, "continuity-warden-body-collider-invalid");
    }
    if (
        main &&
        platforms.some(
            ({ bounds }) =>
                bounds.x < main.bounds.x ||
                bounds.x + bounds.width > main.bounds.x + main.bounds.width ||
                main.bounds.y - bounds.y < CONTINUITY_WARDEN_ARENA.BODY_HEIGHT
        )
    ) {
        issue(issues, file, "continuity-warden-platform-support-invalid");
    }
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
            if (
                phase.vulnerability.trigger !== BOSS_VULNERABILITY_TRIGGER.ALWAYS_ACTIVE &&
                !positive(phase.vulnerability.durationSeconds)
            ) {
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
    const terminalBoss = spec.nextAreaId === null;
    if (
        typeof spec.sourceAreaId !== "string" ||
        (!terminalBoss && typeof spec.nextAreaId !== "string") ||
        (terminalBoss && spec.transition?.terminalCompletion !== BOSS_TERMINAL_COMPLETION.ALL_ACTIVE_BOARDING)
    ) {
        issue(issues, file, "boss-transition-area-invalid");
    }
    validateArena(spec, issues, file);
    validateContinuityWardenArena(spec, issues, file);
    validateLowerSectorCommanderArena(spec, issues, file);
    validateCombat(spec, issues, file);
    if (
        !isObject(spec.boss) ||
        typeof spec.boss.actorId !== "string" ||
        !validBounds(spec.boss.collider) ||
        !VISUAL_PRESET_IDS.includes(spec.boss.visualPresetId) ||
        !MECHANIC_TYPES.includes(spec.boss.mechanicId) ||
        !spec.mechanics?.some(({ type }) => type === spec.boss.mechanicId)
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
        (terminalBoss
            ? spec.transition.terminalCompletion !== BOSS_TERMINAL_COMPLETION.ALL_ACTIVE_BOARDING
            : spec.transition.terminalCompletion !== undefined) ||
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
