import { MULTIPLAYER_TIMING } from "../network/MultiplayerTiming.js";
import { normalizeAngle, shortestAngleDelta } from "../physics/AngularMotion.js";

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

function interpolateAngle(left, right, alpha) {
    return normalizeAngle((left.angle ?? 0) + shortestAngleDelta(left.angle ?? 0, right.angle ?? 0) * alpha);
}

function extrapolateAngle(entity, tickDelta, maxSeconds) {
    const elapsedSeconds = Math.min(maxSeconds, Math.max(0, tickDelta / TICKS_PER_SECOND));
    return normalizeAngle((entity.angle ?? 0) + (entity.angularVelocity ?? 0) * elapsedSeconds);
}

function indexEntities(snapshot, collection) {
    return new Map(
        (snapshot?.state?.[collection] ?? []).map((entity) => {
            const tick =
                collection === "players" && Number.isSafeInteger(entity.ownerMotionTick)
                    ? entity.ownerMotionTick
                    : snapshot.serverTick;
            return [entity.id, { ...entity, tick, snapshotTick: snapshot.serverTick }];
        })
    );
}

function historyEntry(snapshot, receivedAt) {
    return {
        snapshot,
        receivedAt,
        entitiesByCollection: {
            players: indexEntities(snapshot, "players"),
            enemies: indexEntities(snapshot, "enemies")
        }
    };
}

function entityAt(entry, collection, id) {
    return entry?.entitiesByCollection?.[collection]?.get(id) ?? null;
}

function portalTicks(history, playerId) {
    return [
        ...new Set(
            history.flatMap(({ snapshot }) =>
                (snapshot.events ?? [])
                    .filter((event) => event.eventType === "gate-portal-entered" && event.playerId === playerId)
                    .map(({ tick }) => tick)
            )
        )
    ].sort((left, right) => left - right);
}

function samplesOnPortalSide(history, playerId, samples, targetTick) {
    const ticks = portalTicks(history, playerId);
    if (ticks.length === 0) return samples;
    const previousPortalTick = [...ticks].reverse().find((tick) => tick <= targetTick) ?? -Infinity;
    const nextPortalTick = ticks.find((tick) => tick > targetTick) ?? Infinity;
    const selected = samples.filter(
        ({ snapshotTick }) => snapshotTick >= previousPortalTick && snapshotTick < nextPortalTick
    );
    return selected.length > 0 ? selected : samples;
}

export class RemoteWorldStateBuffer {
    constructor({
        maxRecentEventIds = 2048,
        maxSnapshots = 8,
        interpolationSeconds = MULTIPLAYER_TIMING.remoteInterpolationSeconds,
        maxExtrapolationSeconds = MULTIPLAYER_TIMING.deadReckoningMaxSeconds,
        playerInterpolationSeconds = MULTIPLAYER_TIMING.remotePlayerInterpolationSeconds,
        maxPlayerInterpolationSeconds = MULTIPLAYER_TIMING.remotePlayerMaxInterpolationSeconds,
        playerJitterBufferMultiplier = MULTIPLAYER_TIMING.remotePlayerJitterBufferMultiplier,
        playerPlaybackRateAdjustment = MULTIPLAYER_TIMING.remotePlayerPlaybackRateAdjustment,
        playerPresentationSmoothingSeconds = MULTIPLAYER_TIMING.remotePlayerPresentationSmoothingSeconds,
        playerPresentationSnapDistance = MULTIPLAYER_TIMING.remotePlayerPresentationSnapDistance,
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
        if (!Number.isFinite(playerInterpolationSeconds) || playerInterpolationSeconds < 0) {
            throw new Error("playerInterpolationSeconds must be non-negative");
        }
        if (
            !Number.isFinite(maxPlayerInterpolationSeconds) ||
            maxPlayerInterpolationSeconds < playerInterpolationSeconds
        ) {
            throw new Error("maxPlayerInterpolationSeconds must be at least playerInterpolationSeconds");
        }
        if (!Number.isFinite(playerJitterBufferMultiplier) || playerJitterBufferMultiplier < 0) {
            throw new Error("playerJitterBufferMultiplier must be non-negative");
        }
        if (
            !Number.isFinite(playerPlaybackRateAdjustment) ||
            playerPlaybackRateAdjustment < 0 ||
            playerPlaybackRateAdjustment >= 1
        ) {
            throw new Error("playerPlaybackRateAdjustment must be in [0, 1)");
        }
        if (!Number.isFinite(playerPresentationSmoothingSeconds) || playerPresentationSmoothingSeconds < 0) {
            throw new Error("playerPresentationSmoothingSeconds must be non-negative");
        }
        if (!Number.isFinite(playerPresentationSnapDistance) || playerPresentationSnapDistance <= 0) {
            throw new Error("playerPresentationSnapDistance must be positive");
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
        this.baseInterpolationTicks = playerInterpolationSeconds * TICKS_PER_SECOND;
        this.maxPlayerInterpolationTicks = maxPlayerInterpolationSeconds * TICKS_PER_SECOND;
        this.playerJitterBufferMultiplier = playerJitterBufferMultiplier;
        this.playerPlaybackRateAdjustment = playerPlaybackRateAdjustment;
        this.playerPresentationSmoothingSeconds = playerPresentationSmoothingSeconds;
        this.playerPresentationSnapDistance = playerPresentationSnapDistance;
        this.clockCorrectionRatio = clockCorrectionRatio;
        this.maxClockCorrectionTicks = maxClockCorrectionSeconds * TICKS_PER_SECOND;
        this.history = [];
        this.latest = null;
        this.latestSnapshotSequence = -1;
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
        this.sampleCalls = 0;
        this.playerTimingById = new Map();
        this.playerPresentationById = new Map();
        this.lastPlayerInterpolationDelayTicks = this.baseInterpolationTicks;
        this.maxPlayerInterpolationDelayTicksObserved = this.baseInterpolationTicks;
    }

    updatePlayerTiming(snapshot, receivedAt) {
        const currentPlayerIds = new Set(snapshot.state.players.map(({ id }) => id));
        for (const playerId of this.playerTimingById.keys()) {
            if (!currentPlayerIds.has(playerId)) this.playerTimingById.delete(playerId);
        }
        for (const playerId of this.playerPresentationById.keys()) {
            if (!currentPlayerIds.has(playerId)) this.playerPresentationById.delete(playerId);
        }
        for (const player of snapshot.state.players) {
            if (!Number.isSafeInteger(player.ownerMotionTick)) continue;
            const timing = this.playerTimingById.get(player.id);
            if (!timing) {
                this.playerTimingById.set(player.id, {
                    playbackTick: Math.max(0, player.ownerMotionTick - this.baseInterpolationTicks),
                    sampledAt: receivedAt,
                    jitterTicks: 0,
                    lastOwnerMotionTick: player.ownerMotionTick,
                    lastReceivedAt: receivedAt
                });
                continue;
            }
            if (player.ownerMotionTick <= timing.lastOwnerMotionTick) continue;
            const arrivalTicks = ((receivedAt - timing.lastReceivedAt) * TICKS_PER_SECOND) / 1000;
            const ownerTickDelta = player.ownerMotionTick - timing.lastOwnerMotionTick;
            const variationTicks = Math.abs(arrivalTicks - ownerTickDelta);
            timing.jitterTicks +=
                (variationTicks - timing.jitterTicks) * MULTIPLAYER_TIMING.remotePlayerJitterSmoothingRatio;
            timing.lastOwnerMotionTick = player.ownerMotionTick;
            timing.lastReceivedAt = receivedAt;
        }
    }

    push(snapshot, receivedAt = performance.now()) {
        if (!Number.isSafeInteger(snapshot?.serverTick) || snapshot.serverTick < 0) {
            throw new Error("snapshot.serverTick must be a non-negative safe integer");
        }
        if (!Number.isFinite(receivedAt)) throw new Error("receivedAt must be finite");
        const snapshotSequence = snapshot.snapshotSequence;
        if (!Number.isSafeInteger(snapshotSequence) || snapshotSequence < 0) {
            throw new Error("snapshot.snapshotSequence must be a non-negative safe integer");
        }
        if (
            this.latest &&
            (snapshotSequence <= this.latestSnapshotSequence || snapshot.serverTick < this.latest.serverTick)
        ) {
            return false;
        }

        const sameTick = this.latest?.serverTick === snapshot.serverTick;
        this.updatePlayerTiming(snapshot, receivedAt);
        if (this.clockAnchorTick === null) {
            this.clockAnchorTick = snapshot.serverTick;
            this.clockAnchorAt = receivedAt;
        } else if (!sameTick) {
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
        this.latestSnapshotSequence = snapshotSequence;
        this.latestReceivedAt = receivedAt;
        if (sameTick) {
            this.history[this.history.length - 1] = historyEntry(snapshot, receivedAt);
        } else {
            this.history.push(historyEntry(snapshot, receivedAt));
        }
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
        this.sampleCalls += 1;
        const elapsedTicks = (Math.max(0, now - this.clockAnchorAt) * TICKS_PER_SECOND) / 1000;
        const targetTick = this.clockAnchorTick + elapsedTicks - this.interpolationSeconds * TICKS_PER_SECOND;
        this.lastExtrapolationSeconds = 0;
        const latestState = this.latest.state;
        const sampled = {
            ...latestState,
            players: latestState.players.map((player) => {
                if (player.id === localPlayerId) return player;
                const playerTargetTick = this.playerTargetTick(player.id, now, targetTick);
                return {
                    ...player,
                    ...this.smoothPlayerPresentation(
                        player.id,
                        this.samplePosition("players", player.id, playerTargetTick),
                        this.samplePlayerAngle(player.id, playerTargetTick),
                        now
                    )
                };
            }),
            enemies: (latestState.enemies ?? []).map((enemy) => ({
                ...enemy,
                position: this.samplePosition("enemies", enemy.id, targetTick)
            }))
        };
        this.maxExtrapolationSecondsObserved = Math.max(
            this.maxExtrapolationSecondsObserved,
            this.lastExtrapolationSeconds
        );
        return sampled;
    }

    playerTargetTick(playerId, now, fallbackTargetTick) {
        const timing = this.playerTimingById.get(playerId);
        const latest = entityAt(this.history.at(-1), "players", playerId);
        if (!timing || !latest) return fallbackTargetTick;
        const desiredDelayTicks = Math.min(
            this.maxPlayerInterpolationTicks,
            this.baseInterpolationTicks + timing.jitterTicks * this.playerJitterBufferMultiplier
        );
        const elapsedTicks = (Math.max(0, now - timing.sampledAt) * TICKS_PER_SECOND) / 1000;
        const desiredTick = latest.tick - desiredDelayTicks;
        const projectedTick = timing.playbackTick + elapsedTicks;
        const errorTicks = desiredTick - projectedTick;
        let nextTick;
        if (Math.abs(errorTicks) > this.maxPlayerInterpolationTicks) {
            nextTick = desiredTick;
        } else {
            const normalizedError = desiredDelayTicks > 0 ? errorTicks / desiredDelayTicks : 0;
            const rateAdjustment = Math.max(
                -this.playerPlaybackRateAdjustment,
                Math.min(this.playerPlaybackRateAdjustment, normalizedError)
            );
            nextTick = timing.playbackTick + elapsedTicks * (1 + rateAdjustment);
        }
        nextTick = Math.max(0, Math.min(nextTick, latest.tick + this.maxExtrapolationSeconds * TICKS_PER_SECOND));
        timing.playbackTick = nextTick;
        timing.sampledAt = now;
        this.lastPlayerInterpolationDelayTicks = Math.max(0, latest.tick - nextTick);
        this.maxPlayerInterpolationDelayTicksObserved = Math.max(
            this.maxPlayerInterpolationDelayTicksObserved,
            this.lastPlayerInterpolationDelayTicks
        );
        return nextTick;
    }

    smoothPlayerPresentation(playerId, targetPosition, targetAngle, now) {
        const previous = this.playerPresentationById.get(playerId);
        if (!previous) {
            const initial = { position: targetPosition, angle: targetAngle, sampledAt: now };
            this.playerPresentationById.set(playerId, initial);
            return { position: initial.position, angle: initial.angle };
        }
        const distance = Math.hypot(targetPosition.x - previous.position.x, targetPosition.y - previous.position.y);
        const elapsedSeconds = Math.max(0, now - previous.sampledAt) / 1000;
        const alpha =
            this.playerPresentationSmoothingSeconds === 0
                ? 1
                : 1 - Math.exp(-elapsedSeconds / this.playerPresentationSmoothingSeconds);
        const next =
            distance > this.playerPresentationSnapDistance
                ? { position: targetPosition, angle: targetAngle, sampledAt: now }
                : {
                      position: interpolatePosition(previous, { position: targetPosition }, alpha),
                      angle: interpolateAngle(previous, { angle: targetAngle }, alpha),
                      sampledAt: now
                  };
        this.playerPresentationById.set(playerId, next);
        return { position: next.position, angle: next.angle };
    }

    samplePosition(collection, id, serverTargetTick) {
        let samples = this.history.map((entry) => entityAt(entry, collection, id)).filter((entity) => entity !== null);
        let latest = samples.at(-1);
        if (!latest) return null;
        const targetTick = serverTargetTick;
        if (collection === "players") samples = samplesOnPortalSide(this.history, id, samples, targetTick);
        const oldest = samples[0];
        latest = samples.at(-1);
        const lower = [...samples].reverse().find(({ tick }) => tick <= targetTick);
        const upper = samples.find(({ tick }) => tick >= targetTick);
        if (lower && upper && upper.tick === lower.tick) return lower.position;
        if (lower && upper) {
            const alpha = (targetTick - lower.tick) / (upper.tick - lower.tick);
            return interpolatePosition(lower, upper, alpha);
        }
        if (targetTick <= (oldest?.tick ?? latest.tick)) return oldest?.position ?? latest.position;
        const previous = [...samples].reverse().find(({ tick }) => tick < latest.tick);
        this.lastExtrapolationSeconds = Math.max(
            this.lastExtrapolationSeconds,
            Math.min(this.maxExtrapolationSeconds, Math.max(0, (targetTick - latest.tick) / TICKS_PER_SECOND))
        );
        return extrapolatePosition(latest, previous, targetTick - latest.tick, this.maxExtrapolationSeconds);
    }

    samplePlayerAngle(id, serverTargetTick) {
        let samples = this.history.map((entry) => entityAt(entry, "players", id)).filter((entity) => entity !== null);
        let latest = samples.at(-1);
        if (!latest) return 0;
        const targetTick = serverTargetTick;
        samples = samplesOnPortalSide(this.history, id, samples, targetTick);
        const oldest = samples[0];
        latest = samples.at(-1);
        const lower = [...samples].reverse().find(({ tick }) => tick <= targetTick);
        const upper = samples.find(({ tick }) => tick >= targetTick);
        if (lower && upper && upper.tick === lower.tick) return lower.angle ?? 0;
        if (lower && upper) {
            const alpha = (targetTick - lower.tick) / (upper.tick - lower.tick);
            return interpolateAngle(lower, upper, alpha);
        }
        if (targetTick <= (oldest?.tick ?? latest.tick)) return oldest?.angle ?? latest.angle ?? 0;
        return extrapolateAngle(latest, targetTick - latest.tick, this.maxExtrapolationSeconds);
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
            maxClockCorrectionMs: (this.maxClockCorrectionTicksObserved / TICKS_PER_SECOND) * 1000,
            playerInterpolationDelayMs: (this.lastPlayerInterpolationDelayTicks / TICKS_PER_SECOND) * 1000,
            maxPlayerInterpolationDelayMs: (this.maxPlayerInterpolationDelayTicksObserved / TICKS_PER_SECOND) * 1000,
            sampleCalls: this.sampleCalls
        });
    }
}
