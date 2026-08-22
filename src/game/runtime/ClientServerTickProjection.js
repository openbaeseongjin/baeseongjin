function requireTick(value, label) {
    if (!Number.isSafeInteger(value) || value < 0) throw new Error(`${label} must be a non-negative safe integer`);
    return value;
}

export class ClientServerTickProjection {
    constructor() {
        this.clientTick = null;
        this.serverTick = null;
    }

    observe({ clientTick, serverTick }) {
        this.clientTick = requireTick(clientTick, "clientTick");
        this.serverTick = requireTick(serverTick, "serverTick");
    }

    project(clientTick) {
        const sourceTick = requireTick(clientTick, "clientTick");
        if (this.clientTick === null) throw new Error("server tick projection is not initialized");
        return requireTick(Math.max(0, this.serverTick + sourceTick - this.clientTick), "authorityTick");
    }
}
