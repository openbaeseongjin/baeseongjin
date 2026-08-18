import { distancePointToSegment } from "../../combat/CombatSystems.js";

function finitePosition(value, label) {
    if (!Number.isFinite(value?.x) || !Number.isFinite(value?.y)) {
        throw new Error(`${label} must contain finite x and y`);
    }
    return value;
}

function requirePositiveNumber(value, label) {
    if (!Number.isFinite(value) || value <= 0) {
        throw new Error(`${label} must be a positive finite number`);
    }
    return value;
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

export function electrifiedContactThreshold(enemyRadius, contactBandPadding = 10) {
    return (
        requirePositiveNumber(enemyRadius, "enemyRadius") +
        requirePositiveNumber(contactBandPadding, "contactBandPadding")
    );
}

export function ropeTouchesEnemy({ segments, enemy, contactBandPadding = 10 }) {
    const normalizedSegments = normalizeSegments(segments);
    finitePosition(enemy?.position, "enemy.position");
    const threshold = electrifiedContactThreshold(enemy?.radius, contactBandPadding);
    return normalizedSegments.some(
        (segment) => distancePointToSegment(enemy.position, segment.start, segment.end) <= threshold
    );
}

export class ElectrifiedRopeContactState {
    constructor({ impactDamage, contactBandPadding = 10, pulseSeconds = 0.1, damagePerSecond = null } = {}) {
        this.contactBandPadding = requirePositiveNumber(contactBandPadding, "contactBandPadding");
        this.pulseSeconds = requirePositiveNumber(pulseSeconds, "pulseSeconds");
        this.damagePerSecond = damagePerSecond ?? requirePositiveNumber(impactDamage, "impactDamage") * 0.8;
        requirePositiveNumber(this.damagePerSecond, "damagePerSecond");
        this.unsettledContactSecondsByEnemyId = new Map();
        this.currentlyTouchingEnemyIds = new Set();
        this.eventSequence = 0;
    }

    reset() {
        this.unsettledContactSecondsByEnemyId.clear();
        this.currentlyTouchingEnemyIds.clear();
        this.eventSequence = 0;
    }

    snapshot() {
        return Object.freeze({
            eventSequence: this.eventSequence,
            unsettledContactSecondsByEnemyId: Object.freeze(
                Array.from(this.unsettledContactSecondsByEnemyId.entries()).map(([enemyId, seconds]) =>
                    Object.freeze({ enemyId, seconds })
                )
            )
        });
    }

    restore(snapshot = null) {
        this.reset();
        if (!snapshot) return this.snapshot();
        if (!Number.isInteger(snapshot.eventSequence) || snapshot.eventSequence < 0) {
            throw new Error("eventSequence must be a non-negative integer");
        }
        this.eventSequence = snapshot.eventSequence;
        for (const entry of snapshot.unsettledContactSecondsByEnemyId ?? []) {
            if (typeof entry?.enemyId !== "string" || !Number.isFinite(entry?.seconds) || entry.seconds < 0) {
                throw new Error("unsettled contact entries must contain enemyId and non-negative seconds");
            }
            this.unsettledContactSecondsByEnemyId.set(entry.enemyId, entry.seconds);
        }
        return this.snapshot();
    }

    observe({ dt, segments, enemies, sourcePlayerId = "player", clientTick = 0 } = {}) {
        requirePositiveNumber(dt, "dt");
        const normalizedSegments = normalizeSegments(segments);
        const pulses = [];
        const touchingEnemyIds = new Set();
        const knownEnemyIds = new Set();
        for (const enemy of enemies ?? []) {
            if (typeof enemy?.id !== "string") throw new Error("enemy.id must be a string");
            knownEnemyIds.add(enemy.id);
            if (enemy.health <= 0) {
                this.unsettledContactSecondsByEnemyId.delete(enemy.id);
                continue;
            }
            if (
                !ropeTouchesEnemy({ segments: normalizedSegments, enemy, contactBandPadding: this.contactBandPadding })
            ) {
                continue;
            }
            touchingEnemyIds.add(enemy.id);
            const accumulatedSeconds = (this.unsettledContactSecondsByEnemyId.get(enemy.id) ?? 0) + dt;
            const pulseCount = Math.floor((accumulatedSeconds + 1e-9) / this.pulseSeconds);
            const settledSeconds = pulseCount * this.pulseSeconds;
            const remainingSeconds = Math.max(0, accumulatedSeconds - settledSeconds);
            this.unsettledContactSecondsByEnemyId.set(enemy.id, remainingSeconds);
            for (let index = 0; index < pulseCount; index += 1) {
                const damage = this.damagePerSecond * this.pulseSeconds;
                pulses.push(
                    Object.freeze({
                        eventId: `${sourcePlayerId}:electrified-rope:${clientTick}:${enemy.id}:${this.eventSequence}`,
                        sourcePlayerId,
                        targetId: enemy.id,
                        clientTick,
                        settledSeconds: this.pulseSeconds,
                        damage,
                        position: Object.freeze({ x: enemy.position.x, y: enemy.position.y }),
                        predictedResolution:
                            Number.isFinite(enemy.health) && enemy.health <= damage ? "enemy-defeated" : "enemy-hit"
                    })
                );
                this.eventSequence += 1;
            }
        }
        for (const enemyId of Array.from(this.unsettledContactSecondsByEnemyId.keys())) {
            if (!knownEnemyIds.has(enemyId)) this.unsettledContactSecondsByEnemyId.delete(enemyId);
        }
        this.currentlyTouchingEnemyIds = touchingEnemyIds;
        return Object.freeze(pulses);
    }
}
