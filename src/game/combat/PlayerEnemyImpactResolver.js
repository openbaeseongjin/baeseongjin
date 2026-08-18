import { Vector2 } from "../../game-kit/index.js";
import { resolveEnemyImpactTombstone } from "./EnemyImpactTombstones.js";

export const PLAYER_ENEMY_IMPACT_RESOLUTIONS = Object.freeze(["enemy-hit", "enemy-defeated", "late-dead-noop"]);

function assertId(value, label) {
    if (typeof value !== "string" || value.length === 0) {
        throw new Error(`${label} must be a non-empty string`);
    }
    return value;
}

function assertFinite(value, label, { minimum = -Infinity, exclusiveMinimum = false } = {}) {
    if (!Number.isFinite(value)) throw new Error(`${label} must be finite`);
    if (exclusiveMinimum ? value <= minimum : value < minimum) {
        const comparison = exclusiveMinimum ? "greater than" : "at least";
        throw new Error(`${label} must be ${comparison} ${minimum}`);
    }
    return value;
}

function normalizeVector(value, label) {
    assertFinite(value?.x, `${label}.x`);
    assertFinite(value?.y, `${label}.y`);
    return new Vector2(value.x, value.y);
}

function normalizeKnockback(knockback) {
    if (knockback === null || knockback === undefined) return null;
    const direction = normalizeVector(knockback.direction, "knockback.direction");
    if (direction.length() === 0) throw new Error("knockback.direction must be non-zero");
    return Object.freeze({
        direction: direction.normalize(),
        distance: assertFinite(knockback.distance, "knockback.distance", { minimum: 0, exclusiveMinimum: true }),
        durationSeconds: assertFinite(knockback.durationSeconds, "knockback.durationSeconds", {
            minimum: 0,
            exclusiveMinimum: true
        })
    });
}

function createRejectedResult(reason) {
    return Object.freeze({
        accepted: false,
        reason,
        resolution: null,
        damage: 0,
        knockbackApplied: false,
        emitEffects: false
    });
}

function createLateDeadNoop(targetId, tombstone) {
    return Object.freeze({
        accepted: true,
        reason: null,
        resolution: "late-dead-noop",
        targetId,
        tombstone,
        damage: 0,
        knockbackApplied: false,
        emitEffects: false
    });
}

function createShieldBlock(targetId) {
    return Object.freeze({
        accepted: true,
        reason: null,
        resolution: "shield-blocked",
        targetId,
        damage: 0,
        knockbackApplied: false,
        emitEffects: true
    });
}

export function resolvePlayerEnemyImpact({
    targetId,
    target = null,
    sourcePosition = null,
    damage,
    knockback = null,
    displacementAllowed = true,
    tombstones = null
}) {
    const normalizedTargetId = assertId(targetId, "targetId");
    const normalizedDamage = assertFinite(damage, "damage", { minimum: 0, exclusiveMinimum: true });
    const normalizedSourcePosition =
        sourcePosition === null || sourcePosition === undefined
            ? null
            : normalizeVector(sourcePosition, "sourcePosition");
    const normalizedKnockback = normalizeKnockback(knockback);
    const tombstone = resolveEnemyImpactTombstone(tombstones, normalizedTargetId);
    if (!target || target.health <= 0) {
        return tombstone ? createLateDeadNoop(normalizedTargetId, tombstone) : createRejectedResult("target-missing");
    }
    if (normalizedSourcePosition && target.blocksImpactFrom(normalizedSourcePosition)) {
        return createShieldBlock(normalizedTargetId);
    }

    target.health = Math.max(0, target.health - normalizedDamage);
    const defeated = target.health <= 0;
    if (defeated) {
        return Object.freeze({
            accepted: true,
            reason: null,
            resolution: "enemy-defeated",
            targetId: normalizedTargetId,
            damage: normalizedDamage,
            knockbackApplied: false,
            emitEffects: true
        });
    }

    let knockbackApplied = false;
    if (
        displacementAllowed &&
        normalizedKnockback &&
        typeof target.canApplyImpactKnockback === "function" &&
        target.canApplyImpactKnockback(normalizedKnockback)
    ) {
        target.applyImpactKnockback(normalizedKnockback);
        knockbackApplied = true;
    }

    return Object.freeze({
        accepted: true,
        reason: null,
        resolution: "enemy-hit",
        targetId: normalizedTargetId,
        damage: normalizedDamage,
        knockbackApplied,
        emitEffects: true
    });
}
