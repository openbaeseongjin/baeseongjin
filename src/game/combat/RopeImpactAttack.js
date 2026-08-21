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
        this.overlappingEnemyIds = new Set();
        this.pendingImpactsByEnemyId = new Map();
    }

    reset() {
        this.overlappingEnemyIds.clear();
        this.pendingImpactsByEnemyId.clear();
    }

    advance(owner, enemies, tick) {
        const overlaps = enemies.filter(
            (enemy) =>
                enemy.health > 0 &&
                owner.physics.collider.overlapsCollider(
                    owner.physics.position,
                    enemy.position,
                    enemy.collider ?? { type: "circle", radius: enemy.radius }
                )
        );
        const speed = Math.hypot(owner.physics.velocity.x, owner.physics.velocity.y);
        const canHit = owner.ropeObject.rope.isAttached && speed >= this.minimumSpeed;
        const damage = ropeImpactDamageForSpeed(speed, this.config);
        const impacts = canHit
            ? overlaps
                  .filter(
                      (enemy) =>
                          !this.overlappingEnemyIds.has(enemy.id) && !enemy.blocksImpactFrom?.(owner.physics.position)
                  )
                  .map((enemy) =>
                      Object.freeze({
                          predictionId: `${owner.id}:rope-impact:${tick}:${enemy.id}`,
                          clientTick: tick,
                          sourcePlayerId: owner.id,
                          targetId: enemy.id,
                          position: Object.freeze({ x: enemy.position.x, y: enemy.position.y }),
                          velocity: Object.freeze({ x: owner.physics.velocity.x, y: owner.physics.velocity.y }),
                          impactSpeed: speed,
                          damage,
                          predictedResolution: enemy.health <= damage ? "enemy-defeated" : "enemy-hit"
                      })
                  )
            : [];
        this.overlappingEnemyIds = new Set(overlaps.map(({ id }) => id));
        return Object.freeze(impacts);
    }

    observe(owner, enemies, tick) {
        const impacts = this.advance(owner, enemies, tick);
        for (const targetId of this.pendingImpactsByEnemyId.keys()) {
            if (!this.overlappingEnemyIds.has(targetId)) this.pendingImpactsByEnemyId.delete(targetId);
        }
        for (const impact of impacts) this.pendingImpactsByEnemyId.set(impact.targetId, impact);
        return impacts;
    }

    consume(predictionId, targetId) {
        const pending = this.pendingImpactsByEnemyId.get(targetId);
        if (!pending || pending.predictionId !== predictionId) return null;
        this.pendingImpactsByEnemyId.delete(targetId);
        return pending;
    }
}
