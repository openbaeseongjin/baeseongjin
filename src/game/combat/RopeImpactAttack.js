export class RopeImpactAttack {
    constructor(config) {
        if (!Number.isFinite(config?.minimumSpeed) || config.minimumSpeed <= 0) {
            throw new Error("RopeImpactAttack requires a positive minimumSpeed");
        }
        if (!Number.isFinite(config?.damage) || config.damage <= 0) {
            throw new Error("RopeImpactAttack requires positive damage");
        }
        this.minimumSpeed = config.minimumSpeed;
        this.damage = config.damage;
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
                owner.physics.collider.overlapsCircle(owner.physics.position, enemy.position, enemy.radius)
        );
        const speed = Math.hypot(owner.physics.velocity.x, owner.physics.velocity.y);
        const canHit = owner.ropeObject.rope.isAttached && speed >= this.minimumSpeed;
        const impacts = canHit
            ? overlaps
                  .filter((enemy) => !this.overlappingEnemyIds.has(enemy.id))
                  .map((enemy) =>
                      Object.freeze({
                          predictionId: `${owner.id}:rope-impact:${tick}:${enemy.id}`,
                          clientTick: tick,
                          sourcePlayerId: owner.id,
                          targetId: enemy.id,
                          position: Object.freeze({ x: enemy.position.x, y: enemy.position.y }),
                          velocity: Object.freeze({ x: owner.physics.velocity.x, y: owner.physics.velocity.y }),
                          damage: this.damage,
                          predictedResolution: enemy.health <= this.damage ? "enemy-defeated" : "enemy-hit"
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
