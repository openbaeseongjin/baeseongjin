function interpolatePosition(previous, latest, alpha) {
    if (!previous || !latest) return latest;
    return {
        x: previous.x + (latest.x - previous.x) * alpha,
        y: previous.y + (latest.y - previous.y) * alpha
    };
}

function interpolateEntities(previousEntities, latestEntities, alpha) {
    const previousById = new Map((previousEntities ?? []).map((entity) => [entity.id, entity]));
    return (latestEntities ?? []).map((entity) => ({
        ...entity,
        position: interpolatePosition(previousById.get(entity.id)?.position, entity.position, alpha)
    }));
}

export class RemoteWorldStateBuffer {
    constructor() {
        this.previous = null;
        this.latest = null;
        this.events = [];
    }

    push(snapshot) {
        if (!Number.isSafeInteger(snapshot?.serverTick) || snapshot.serverTick < 0) {
            throw new Error("snapshot.serverTick must be a non-negative safe integer");
        }
        if (this.latest && snapshot.serverTick <= this.latest.serverTick) return false;
        this.previous = this.latest;
        this.latest = snapshot;
        this.events.push(...snapshot.events);
        return true;
    }

    sample(alpha = 1) {
        if (!this.latest) return null;
        if (!Number.isFinite(alpha)) throw new Error("alpha must be finite");
        const amount = Math.max(0, Math.min(1, alpha));
        const previousState = this.previous?.state;
        const latestState = this.latest.state;
        return {
            ...latestState,
            players: interpolateEntities(previousState?.players, latestState.players, amount),
            enemies: interpolateEntities(previousState?.enemies, latestState.enemies, amount)
        };
    }

    drainEvents() {
        const drained = Object.freeze([...this.events]);
        this.events.length = 0;
        return drained;
    }
}
