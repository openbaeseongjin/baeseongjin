import { MULTIPLAYER_TIMING } from "../network/MultiplayerTiming.js";

const TICKS_PER_SECOND = 120;

function interpolatePosition(left, right, alpha) {
    return {
        x: left.position.x + (right.position.x - left.position.x) * alpha,
        y: left.position.y + (right.position.y - left.position.y) * alpha
    };
}

function extrapolatePosition(entity, previous, tickDelta, maxSeconds) {
    const elapsedSeconds = Math.min(maxSeconds, Math.max(0, tickDelta / TICKS_PER_SECOND));
    let velocity = entity.velocity;
    if (!velocity && previous) {
        const seconds = (entity.tick - previous.tick) / TICKS_PER_SECOND;
        if (seconds > 0) {
            velocity = {
                x: (entity.position.x - previous.position.x) / seconds,
                y: (entity.position.y - previous.position.y) / seconds
            };
        }
    }
    return {
        x: entity.position.x + (velocity?.x ?? 0) * elapsedSeconds,
        y: entity.position.y + (velocity?.y ?? 0) * elapsedSeconds
    };
}

function entityAt(snapshot, collection, id) {
    const entity = snapshot?.state?.[collection]?.find((candidate) => candidate.id === id);
    return entity ? { ...entity, tick: snapshot.serverTick } : null;
}

export class RemoteWorldStateBuffer {
    constructor({
        maxRecentEventIds = 2048,
        maxSnapshots = 8,
        interpolationSeconds = MULTIPLAYER_TIMING.remoteInterpolationSeconds,
        maxExtrapolationSeconds = MULTIPLAYER_TIMING.deadReckoningMaxSeconds,
        clockCorrectionRatio = MULTIPLAYER_TIMING.remoteClockCorrectionRatio,
        maxClockCorrectionSeconds = MULTIPLAYER_TIMING.remoteClockMaxCorrectionSeconds
    } = {}) {
        if (!Number.isSafeInteger(maxRecentEventIds) || maxRecentEventIds < 1) {
            throw new Error("maxRecentEventIds must be a positive safe integer");
        }
        if (!Number.isSafeInteger(maxSnapshots) || maxSnapshots < 3) {
            throw new Error("maxSnapshots must be a safe integer of at least 3");
        }
        if (!Number.isFinite(interpolationSeconds) || interpolationSeconds < 0) {
            throw new Error("interpolationSeconds must be non-negative");
        }
        if (!Number.isFinite(maxExtrapolationSeconds) || maxExtrapolationSeconds <= 0) {
            throw new Error("maxExtrapolationSeconds must be positive");
        }
        if (!Number.isFinite(clockCorrectionRatio) || clockCorrectionRatio <= 0 || clockCorrectionRatio > 1) {
            throw new Error("clockCorrectionRatio must be in (0, 1]");
        }
        if (!Number.isFinite(maxClockCorrectionSeconds) || maxClockCorrectionSeconds <= 0) {
            throw new Error("maxClockCorrectionSeconds must be positive");
        }
        this.maxRecentEventIds = maxRecentEventIds;
        this.maxSnapshots = maxSnapshots;
        this.interpolationSeconds = interpolationSeconds;
        this.maxExtrapolationSeconds = maxExtrapolationSeconds;
        this.clockCorrectionRatio = clockCorrectionRatio;
        this.maxClockCorrectionTicks = maxClockCorrectionSeconds * TICKS_PER_SECOND;
        this.history = [];
        this.latest = null;
        this.latestReceivedAt = 0;
        this.clockAnchorTick = null;
        this.clockAnchorAt = null;
        this.events = [];
        this.recentEventIds = new Set();
        this.eventIdOrder = [];
        this.lastExtrapolationSeconds = 0;
        this.maxExtrapolationSecondsObserved = 0;
        this.lastClockCorrectionTicks = 0;
        this.maxClockCorrectionTicksObserved = 0;
    }

    push(snapshot, receivedAt = performance.now()) {
        if (!Number.isSafeInteger(snapshot?.serverTick) || snapshot.serverTick < 0) {
            throw new Error("snapshot.serverTick must be a non-negative safe integer");
        }
        if (!Number.isFinite(receivedAt)) throw new Error("receivedAt must be finite");
        if (this.latest && snapshot.serverTick <= this.latest.serverTick) return false;

        if (this.clockAnchorTick === null) {
            this.clockAnchorTick = snapshot.serverTick;
            this.clockAnchorAt = receivedAt;
        } else {
            const elapsedTicks = ((receivedAt - this.clockAnchorAt) * TICKS_PER_SECOND) / 1000;
            const clockErrorTicks = snapshot.serverTick - (this.clockAnchorTick + elapsedTicks);
            this.lastClockCorrectionTicks = Math.max(
                -this.maxClockCorrectionTicks,
                Math.min(this.maxClockCorrectionTicks, clockErrorTicks * this.clockCorrectionRatio)
            );
            this.clockAnchorTick += this.lastClockCorrectionTicks;
            this.maxClockCorrectionTicksObserved = Math.max(
                this.maxClockCorrectionTicksObserved,
                Math.abs(this.lastClockCorrectionTicks)
            );
        }
        this.latest = snapshot;
        this.latestReceivedAt = receivedAt;
        this.history.push({ snapshot, receivedAt });
        if (this.history.length > this.maxSnapshots) this.history.splice(0, this.history.length - this.maxSnapshots);
        for (const event of snapshot.events) {
            if (this.recentEventIds.has(event.eventId)) continue;
            this.recentEventIds.add(event.eventId);
            this.eventIdOrder.push(event.eventId);
            this.events.push(event);
            while (this.eventIdOrder.length > this.maxRecentEventIds) {
                this.recentEventIds.delete(this.eventIdOrder.shift());
            }
        }
        return true;
    }

    sample({ now = this.latestReceivedAt, localPlayerId = null } = {}) {
        if (!this.latest) return null;
        if (!Number.isFinite(now)) throw new Error("now must be finite");
        const elapsedTicks = (Math.max(0, now - this.clockAnchorAt) * TICKS_PER_SECOND) / 1000;
        const targetTick = this.clockAnchorTick + elapsedTicks - this.interpolationSeconds * TICKS_PER_SECOND;
        this.lastExtrapolationSeconds = Math.min(
            this.maxExtrapolationSeconds,
            Math.max(0, (targetTick - this.latest.serverTick) / TICKS_PER_SECOND)
        );
        this.maxExtrapolationSecondsObserved = Math.max(
            this.maxExtrapolationSecondsObserved,
            this.lastExtrapolationSeconds
        );
        const lowerEntry = [...this.history].reverse().find(({ snapshot }) => snapshot.serverTick <= targetTick);
        const upperEntry = this.history.find(({ snapshot }) => snapshot.serverTick >= targetTick);
        const latestState = this.latest.state;
        return {
            ...latestState,
            players: latestState.players.map((player) => ({
                ...player,
                position:
                    player.id === localPlayerId
                        ? player.position
                        : this.samplePosition("players", player.id, targetTick, lowerEntry, upperEntry)
            })),
            enemies: (latestState.enemies ?? []).map((enemy) => ({
                ...enemy,
                position: this.samplePosition("enemies", enemy.id, targetTick, lowerEntry, upperEntry)
            }))
        };
    }

    samplePosition(collection, id, targetTick, lowerEntry, upperEntry) {
        const oldest = entityAt(this.history[0]?.snapshot, collection, id);
        const latest = entityAt(this.latest, collection, id);
        if (!latest) return null;
        const lower = entityAt(lowerEntry?.snapshot, collection, id);
        const upper = entityAt(upperEntry?.snapshot, collection, id);
        if (lower && upper && upper.tick > lower.tick) {
            const alpha = (targetTick - lower.tick) / (upper.tick - lower.tick);
            return interpolatePosition(lower, upper, alpha);
        }
        if (targetTick <= (oldest?.tick ?? latest.tick)) return oldest?.position ?? latest.position;
        const previousEntry = this.history.at(-2)?.snapshot;
        const previous = entityAt(previousEntry, collection, id);
        return extrapolatePosition(latest, previous, targetTick - latest.tick, this.maxExtrapolationSeconds);
    }

    drainEvents() {
        const drained = Object.freeze([...this.events]);
        this.events.length = 0;
        return drained;
    }

    metrics() {
        return Object.freeze({
            extrapolationMs: this.lastExtrapolationSeconds * 1000,
            maxExtrapolationMs: this.maxExtrapolationSecondsObserved * 1000,
            clockCorrectionMs: (this.lastClockCorrectionTicks / TICKS_PER_SECOND) * 1000,
            maxClockCorrectionMs: (this.maxClockCorrectionTicksObserved / TICKS_PER_SECOND) * 1000
        });
    }
}
