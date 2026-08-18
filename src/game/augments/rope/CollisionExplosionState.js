import { distancePointToSegment } from "../../combat/CombatSystems.js";

function requirePositiveNumber(value, label) {
    if (!Number.isFinite(value) || value <= 0) {
        throw new Error(`${label} must be a positive finite number`);
    }
    return value;
}

function finitePosition(value, label) {
    if (!Number.isFinite(value?.x) || !Number.isFinite(value?.y)) {
        throw new Error(`${label} must contain finite x and y`);
    }
    return value;
}

function normalizeVector(vector, fallback = { x: 1, y: 0 }) {
    const magnitude = Math.hypot(vector.x, vector.y);
    if (magnitude <= 1e-9) return Object.freeze({ x: fallback.x, y: fallback.y });
    return Object.freeze({ x: vector.x / magnitude, y: vector.y / magnitude });
}

function normalizeSegments(segments) {
    return (segments ?? []).map((segment, index) => {
        finitePosition(segment?.start, `segments[${index}].start`);
        finitePosition(segment?.end, `segments[${index}].end`);
        return Object.freeze({
            start: Object.freeze({ x: segment.start.x, y: segment.start.y }),
            end: Object.freeze({ x: segment.end.x, y: segment.end.y })
        });
    });
}

export function ropeBodyTouchesEnemy({ segments, enemy, contactBandPadding = 0 }) {
    const normalizedSegments = normalizeSegments(segments);
    finitePosition(enemy?.position, "enemy.position");
    const threshold = requirePositiveNumber(enemy?.radius, "enemy.radius") + contactBandPadding;
    return normalizedSegments.some(
        (segment) => distancePointToSegment(enemy.position, segment.start, segment.end) <= threshold
    );
}

function createKnockback({ direction, distance, durationSeconds }) {
    return Object.freeze({
        direction: normalizeVector(direction),
        distance: requirePositiveNumber(distance, "knockback distance"),
        durationSeconds: requirePositiveNumber(durationSeconds, "knockback durationSeconds")
    });
}

export function resolveCollisionExplosion({
    sourcePlayerId = "player",
    clientTick = 0,
    primaryTarget,
    playerPosition,
    enemies,
    impactDamage,
    radius = 120,
    splashDamageFactor = 0.5,
    knockbackDistance = 100,
    knockbackSeconds = 0.25
} = {}) {
    finitePosition(primaryTarget?.position, "primaryTarget.position");
    finitePosition(playerPosition, "playerPosition");
    const resolvedRadius = requirePositiveNumber(radius, "radius");
    const resolvedImpactDamage = requirePositiveNumber(impactDamage, "impactDamage");
    const splashDamage = resolvedImpactDamage * splashDamageFactor;
    const center = primaryTarget.position;
    return Object.freeze(
        (enemies ?? [])
            .filter(
                (enemy) =>
                    enemy?.health > 0 && Number.isFinite(enemy?.position?.x) && Number.isFinite(enemy?.position?.y)
            )
            .filter((enemy) => Math.hypot(enemy.position.x - center.x, enemy.position.y - center.y) <= resolvedRadius)
            .map((enemy) => {
                const isPrimary = enemy.id === primaryTarget.id;
                const damage = isPrimary ? resolvedImpactDamage : splashDamage;
                const direction = isPrimary
                    ? normalizeVector({
                          x: primaryTarget.position.x - playerPosition.x,
                          y: primaryTarget.position.y - playerPosition.y
                      })
                    : normalizeVector({
                          x: enemy.position.x - center.x,
                          y: enemy.position.y - center.y
                      });
                return Object.freeze({
                    eventId: `${sourcePlayerId}:collision-explosion:${clientTick}:${primaryTarget.id}:${enemy.id}`,
                    sourcePlayerId,
                    targetId: enemy.id,
                    clientTick,
                    damage,
                    position: Object.freeze({ x: enemy.position.x, y: enemy.position.y }),
                    knockback:
                        enemy.isBoss === true
                            ? null
                            : createKnockback({
                                  direction,
                                  distance: knockbackDistance,
                                  durationSeconds: knockbackSeconds
                              }),
                    predictedResolution:
                        Number.isFinite(enemy.health) && enemy.health <= damage ? "enemy-defeated" : "enemy-hit"
                });
            })
    );
}

export class CollisionExplosionState {
    constructor({ minimumSpeed, impactDamage, radius = 120, knockbackDistance = 100, knockbackSeconds = 0.25 } = {}) {
        this.minimumSpeed = requirePositiveNumber(minimumSpeed, "minimumSpeed");
        this.impactDamage = requirePositiveNumber(impactDamage, "impactDamage");
        this.radius = requirePositiveNumber(radius, "radius");
        this.knockbackDistance = requirePositiveNumber(knockbackDistance, "knockbackDistance");
        this.knockbackSeconds = requirePositiveNumber(knockbackSeconds, "knockbackSeconds");
        this.overlappingEnemyIds = new Set();
    }

    reset() {
        this.overlappingEnemyIds.clear();
    }

    snapshot() {
        return Object.freeze({
            overlappingEnemyIds: Object.freeze(Array.from(this.overlappingEnemyIds))
        });
    }

    restore(snapshot = null) {
        this.reset();
        if (!snapshot) return this.snapshot();
        this.overlappingEnemyIds = new Set(snapshot.overlappingEnemyIds ?? []);
        return this.snapshot();
    }

    observe({
        ropeAttached,
        speed,
        segments,
        playerPosition,
        enemies,
        sourcePlayerId = "player",
        clientTick = 0
    } = {}) {
        if (typeof ropeAttached !== "boolean") throw new Error("ropeAttached must be a boolean");
        requirePositiveNumber(speed, "speed");
        finitePosition(playerPosition, "playerPosition");
        const normalizedSegments = normalizeSegments(segments);
        const contacts = (enemies ?? []).filter(
            (enemy) =>
                enemy?.health > 0 &&
                ropeBodyTouchesEnemy({
                    segments: normalizedSegments,
                    enemy,
                    contactBandPadding: 0
                })
        );
        const currentOverlaps = new Set(contacts.map((enemy) => enemy.id));
        const newContacts = contacts.filter((enemy) => !this.overlappingEnemyIds.has(enemy.id));
        const explosions =
            ropeAttached && speed >= this.minimumSpeed
                ? newContacts.flatMap((enemy) =>
                      resolveCollisionExplosion({
                          sourcePlayerId,
                          clientTick,
                          primaryTarget: enemy,
                          playerPosition,
                          enemies,
                          impactDamage: this.impactDamage,
                          radius: this.radius,
                          knockbackDistance: this.knockbackDistance,
                          knockbackSeconds: this.knockbackSeconds
                      })
                  )
                : [];
        this.overlappingEnemyIds = currentOverlaps;
        return Object.freeze(explosions);
    }
}
