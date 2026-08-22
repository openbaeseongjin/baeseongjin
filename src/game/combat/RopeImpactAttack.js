import { createImpactDamage } from "./ImpactTarget.js";

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
        this.overlappingTargetIds = new Set();
        this.pendingImpactsByTargetId = new Map();
    }

    reset() {
        this.overlappingTargetIds.clear();
        this.pendingImpactsByTargetId.clear();
    }

    advance(owner, targets, tick) {
        const overlaps = targets.filter(
            (target) =>
                target.active !== false &&
                (target.health === undefined || target.health > 0) &&
                owner.physics.collider.overlapsCollider(
                    owner.physics.position,
                    target.position,
                    target.collider ?? { type: "circle", radius: target.radius }
                )
        );
        const speed = Math.hypot(owner.physics.velocity.x, owner.physics.velocity.y);
        const canHit = owner.ropeObject.rope.isAttached && speed >= this.minimumSpeed;
        const damage = ropeImpactDamageForSpeed(speed, this.config);
        const impacts = canHit
            ? overlaps
                  .filter(
                      (target) =>
                          !this.overlappingTargetIds.has(target.id) &&
                          !target.blocksImpactFrom?.(owner.physics.position)
                  )
                  .map((target) =>
                      Object.freeze({
                          predictionId: `${owner.id}:rope-impact:${tick}:${target.id}`,
                          clientTick: tick,
                          sourcePlayerId: owner.id,
                          targetId: target.id,
                          targetKind: target.impactTargetKind ?? "enemy",
                          position: Object.freeze({ x: target.position.x, y: target.position.y }),
                          velocity: Object.freeze({ x: owner.physics.velocity.x, y: owner.physics.velocity.y }),
                          impactSpeed: speed,
                          damage,
                          predictedResolution: predictedResolution(target, damage)
                      })
                  )
            : [];
        this.overlappingTargetIds = new Set(overlaps.map(({ id }) => id));
        return Object.freeze(impacts);
    }

    observe(owner, targets, tick) {
        const impacts = this.advance(owner, targets, tick);
        for (const targetId of this.pendingImpactsByTargetId.keys()) {
            if (!this.overlappingTargetIds.has(targetId)) this.pendingImpactsByTargetId.delete(targetId);
        }
        for (const impact of impacts) this.pendingImpactsByTargetId.set(impact.targetId, impact);
        return impacts;
    }

    consume(predictionId, targetId) {
        const pending = this.pendingImpactsByTargetId.get(targetId);
        if (!pending || pending.predictionId !== predictionId) return null;
        this.pendingImpactsByTargetId.delete(targetId);
        return pending;
    }
}
