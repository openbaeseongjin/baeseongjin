import { MULTIPLAYER_TIMING } from "../network/MultiplayerTiming.js";

function projectPosition(entity, elapsedSeconds, correction, maxSeconds, correctionSeconds) {
    const velocity = entity.velocity ?? { x: 0, y: 0 };
    const projectionSeconds = Math.max(0, Math.min(maxSeconds, elapsedSeconds));
    const correctionRatio = Math.max(0, 1 - elapsedSeconds / correctionSeconds);
    return {
        x: entity.position.x + velocity.x * projectionSeconds + (correction?.x ?? 0) * correctionRatio,
        y: entity.position.y + velocity.y * projectionSeconds + (correction?.y ?? 0) * correctionRatio
    };
}

export class RemoteWorldStateBuffer {
    constructor({
        maxRecentEventIds = 2048,
        maxExtrapolationSeconds = MULTIPLAYER_TIMING.deadReckoningMaxSeconds,
        correctionSeconds = MULTIPLAYER_TIMING.correctionSeconds
    } = {}) {
        if (!Number.isSafeInteger(maxRecentEventIds) || maxRecentEventIds < 1) {
            throw new Error("maxRecentEventIds must be a positive safe integer");
        }
        if (!Number.isFinite(maxExtrapolationSeconds) || maxExtrapolationSeconds <= 0) {
            throw new Error("maxExtrapolationSeconds must be positive");
        }
        if (!Number.isFinite(correctionSeconds) || correctionSeconds <= 0) {
            throw new Error("correctionSeconds must be positive");
        }
        this.maxRecentEventIds = maxRecentEventIds;
        this.maxExtrapolationSeconds = maxExtrapolationSeconds;
        this.correctionSeconds = correctionSeconds;
        this.latest = null;
        this.latestReceivedAt = 0;
        this.corrections = new Map();
        this.events = [];
        this.recentEventIds = new Set();
        this.eventIdOrder = [];
    }

    push(snapshot, receivedAt = performance.now()) {
        if (!Number.isSafeInteger(snapshot?.serverTick) || snapshot.serverTick < 0) {
            throw new Error("snapshot.serverTick must be a non-negative safe integer");
        }
        if (!Number.isFinite(receivedAt)) throw new Error("receivedAt must be finite");
        if (this.latest && snapshot.serverTick <= this.latest.serverTick) return false;

        const nextCorrections = new Map();
        if (this.latest) {
            const elapsedSeconds = Math.max(0, (receivedAt - this.latestReceivedAt) / 1000);
            const previousPlayers = new Map(this.latest.state.players.map((player) => [player.id, player]));
            for (const player of snapshot.state.players) {
                const previous = previousPlayers.get(player.id);
                if (!previous) continue;
                const displayed = projectPosition(
                    previous,
                    elapsedSeconds,
                    this.corrections.get(player.id),
                    this.maxExtrapolationSeconds,
                    this.correctionSeconds
                );
                nextCorrections.set(player.id, {
                    x: displayed.x - player.position.x,
                    y: displayed.y - player.position.y
                });
            }
        }

        this.latest = snapshot;
        this.latestReceivedAt = receivedAt;
        this.corrections = nextCorrections;
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

    sample({ elapsedSeconds = 0, localPlayerId = null } = {}) {
        if (!this.latest) return null;
        if (!Number.isFinite(elapsedSeconds)) throw new Error("elapsedSeconds must be finite");
        const latestState = this.latest.state;
        return {
            ...latestState,
            players: latestState.players.map((player) => ({
                ...player,
                position:
                    player.id === localPlayerId
                        ? player.position
                        : projectPosition(
                              player,
                              elapsedSeconds,
                              this.corrections.get(player.id),
                              this.maxExtrapolationSeconds,
                              this.correctionSeconds
                          )
            }))
        };
    }

    drainEvents() {
        const drained = Object.freeze([...this.events]);
        this.events.length = 0;
        return drained;
    }
}
