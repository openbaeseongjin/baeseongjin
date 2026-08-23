import { ROPE_IMPACT_STATE_REASON } from "./RopeImpactState.js";

export const ROPE_IMPACT_REJECTION_REASON = Object.freeze({
    ...ROPE_IMPACT_STATE_REASON,
    SPEED_BELOW_MINIMUM: "speed-below-minimum",
    SHIELD_BLOCKED: "shield-blocked"
});

export const ROPE_IMPACT_EVENT_TYPE = Object.freeze({
    REJECTED: "rope-impact-rejected"
});

function predictedResolution(target, normalDamage) {
    if (target.impactTargetKind !== "boss") {
        return target.health <= normalDamage ? "enemy-defeated" : "enemy-hit";
    }
    const totalDamage = createImpactDamage({
        normalDamage: normalDamage * (target.normalDamageMultiplier ?? 1),
        weakpointExposed: target.weakpointExposed === true,
        phaseMaxHealth: target.phaseMaxHealth ?? 0,
        weakpointRatio: target.weakpointDamageRatio ?? 0.25
    }).totalDamage;
    const remainingInPhase = Math.max(0, target.health - (target.phaseFloor ?? 0));
    if (totalDamage < remainingInPhase) return "boss-hit";
    return target.phase >= target.phaseCount ? "boss-defeated" : "boss-phase-completed";
}

function impactContact(owner, actorImpact) {
    const position = actorImpact?.position ?? owner.physics.position;
    const velocity = actorImpact?.velocity ?? owner.physics.physicsStepVelocity();
    if (!Number.isFinite(position?.x) || !Number.isFinite(position?.y)) {
        throw new Error("rope impact contact position must be finite");
    }
    if (!Number.isFinite(velocity?.x) || !Number.isFinite(velocity?.y)) {
        throw new Error("rope impact contact velocity must be finite");
    }
    return Object.freeze({
        position: Object.freeze({ x: position.x, y: position.y }),
        velocity: Object.freeze({ x: velocity.x, y: velocity.y })
    });
}

function overlappingTargets(owner, targets, contact) {
    return targets.filter(
        (target) =>
            target.active !== false &&
            (target.health === undefined || target.health > 0) &&
            owner.physics.collider.overlapsCollider(
                contact.position,
                target.position,
                target.collider ?? { type: "circle", radius: target.radius }
            )
    );
}

export function ropeImpactDamageForSpeed(speed, config) {
    if (!Number.isFinite(speed) || speed < 0) {
        throw new Error("rope impact speed must be non-negative and finite");
    }
    if (
        !Number.isFinite(config?.referenceSpeed) ||
        config.referenceSpeed <= 0 ||
        !Number.isFinite(config?.referenceDamage) ||
        config.referenceDamage <= 0
    ) {
        throw new Error("rope impact config requires positive reference speed and damage");
    }
    return (speed / config.referenceSpeed) * config.referenceDamage;
}

export class RopeImpactAttack {
    constructor(config) {
        if (!Number.isFinite(config?.minimumSpeed) || config.minimumSpeed <= 0) {
            throw new Error("RopeImpactAttack requires a positive minimumSpeed");
        }
        ropeImpactDamageForSpeed(config.minimumSpeed, config);
        this.minimumSpeed = config.minimumSpeed;
        this.config = config;
    }

    observe(owner, impactState, targets, actorImpact = null) {
        const contact = impactContact(owner, actorImpact);
        const contacts = overlappingTargets(owner, targets, contact);
        impactState.enteringTargetIds(contacts.map(({ id }) => id));
        return Object.freeze({ contact, contacts: Object.freeze(contacts) });
    }

    advance(owner, impactState, targets, tick, actorImpact = null) {
        const contact = impactContact(owner, actorImpact);
        const contacts = overlappingTargets(owner, targets, contact);
        const enteringTargetIds = new Set(impactState.enteringTargetIds(contacts.map(({ id }) => id)));
        const enteringTargets = contacts.filter(({ id }) => enteringTargetIds.has(id));
        const impactSpeed = Math.hypot(contact.velocity.x, contact.velocity.y);
        const ropeAttached = owner.ropeObject.rope.isAttached;
        const canImpact = impactState.isActive({ ropeAttached });
        const unavailableReason = canImpact ? null : impactState.unavailableReason({ ropeAttached });
        const impacts = [];
        const rejections = [];

        for (const target of enteringTargets) {
            let reason = unavailableReason;
            if (reason === null && impactSpeed < this.minimumSpeed) {
                reason = ROPE_IMPACT_REJECTION_REASON.SPEED_BELOW_MINIMUM;
            }
            if (reason === null && target.blocksImpactFrom?.(contact.position)) {
                reason = ROPE_IMPACT_REJECTION_REASON.SHIELD_BLOCKED;
            }
            if (reason !== null) {
                rejections.push(
                    Object.freeze({
                        reason,
                        sourcePlayerId: owner.id,
                        targetId: target.id,
                        position: Object.freeze({ x: target.position.x, y: target.position.y }),
                        impactPosition: contact.position,
                        velocity: contact.velocity,
                        impactSpeed
                    })
                );
                continue;
            }
            const damage = ropeImpactDamageForSpeed(impactSpeed, this.config);
            impacts.push(
                Object.freeze({
                    predictionId: `${owner.id}:rope-impact:${tick}:${target.id}`,
                    clientTick: tick,
                    sourcePlayerId: owner.id,
                    targetId: target.id,
                    targetKind: target.impactTargetKind ?? "enemy",
                    position: Object.freeze({ x: target.position.x, y: target.position.y }),
                    impactPosition: contact.position,
                    velocity: contact.velocity,
                    impactSpeed,
                    damage,
                    predictedResolution: predictedResolution(target, damage)
                })
            );
        }
        return Object.freeze({ impacts: Object.freeze(impacts), rejections: Object.freeze(rejections) });
    }
}
