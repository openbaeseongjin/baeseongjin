import { spellTargetPolicy } from "./SpellTargetPolicy.js";
import { directionBetween } from "./SpellRuntimeSupport.js";
import { SPELL_KEY, SPELL_SOURCE_KIND } from "./SpellRuntimeDefinition.js";

function targetRadius(target) {
    return target.radius ?? target.collider?.radius ?? 0;
}

export function spellAreaContainsTarget(area, target) {
    const dx = target.position.x - area.position.x;
    const dy = target.position.y - area.position.y;
    const radius = targetRadius(target);
    if (area.shape === "circle") return Math.hypot(dx, dy) <= area.radius + radius;
    const projection = dx * area.direction.x + dy * area.direction.y;
    if (projection < -radius || projection > area.range + radius) return false;
    const perpendicular = Math.abs(dx * area.direction.y - dy * area.direction.x);
    if (area.shape === "line") return perpendicular <= area.radius + radius;
    if (area.shape === "cone") {
        const distance = Math.hypot(dx, dy);
        if (distance > area.range + radius) return false;
        if (distance <= radius) return true;
        return projection / distance >= Math.cos((area.halfAngleDegrees * Math.PI) / 180);
    }
    return false;
}

function knockback(area, target) {
    if (!(area.knockbackImpulse > 0)) return null;
    const fallback = area.direction;
    const direction =
        area.knockbackMode === "inward"
            ? directionBetween(target.position, area.position, fallback)
            : directionBetween(area.position, target.position, fallback);
    return Object.freeze({ direction, impulse: area.knockbackImpulse });
}

export class SpellAreaState {
    constructor() {
        this.areas = [];
    }

    spawn(definition) {
        this.areas.push({ ...definition, affectedTargetIds: new Set(definition.affectedTargetIds ?? []) });
    }

    advance({ targets, dt, emitImpact }) {
        const survivors = [];
        for (const area of this.areas) {
            const policy = spellTargetPolicy(area.targetPolicyId);
            for (const target of targets) {
                if (
                    target.health <= 0 ||
                    area.affectedTargetIds.has(target.id) ||
                    !policy.allows(area.ownerId, target.id) ||
                    !spellAreaContainsTarget(area, target)
                )
                    continue;
                area.affectedTargetIds.add(target.id);
                emitImpact({
                    eventId: SPELL_KEY.projectileImpact(area.id, target.id),
                    target,
                    effectId: area.spellId,
                    sourceKind: SPELL_SOURCE_KIND.AREA,
                    damage: area.damage,
                    sourcePosition: area.position,
                    contactPosition: target.position,
                    statusEffectId: area.statusEffectId ?? null,
                    knockback: knockback(area, target)
                });
            }
            area.remainingSeconds -= dt;
            if (area.remainingSeconds > 0) survivors.push(area);
        }
        this.areas = survivors;
    }

    snapshot() {
        return Object.freeze(
            this.areas.map((area) =>
                Object.freeze({ ...area, affectedTargetIds: Object.freeze([...area.affectedTargetIds]) })
            )
        );
    }

    restore(areas = []) {
        this.areas = areas.map((area) => ({ ...area, affectedTargetIds: new Set(area.affectedTargetIds ?? []) }));
    }
    reset() {
        this.areas = [];
    }
}
