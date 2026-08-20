export class DirectionCharacterPresentation {
    constructor() {
        this.current = null;
        this.seenCausalIds = new Set();
    }

    present(command, { viewerId = null } = {}) {
        if (this.seenCausalIds.has(command.causalId)) return false;
        this.seenCausalIds.add(command.causalId);
        this.current = {
            kind: command.action,
            speakerId: viewerId,
            age: 0,
            durationSeconds: command.payload.durationSeconds ?? 0.8
        };
        return true;
    }

    update(dt) {
        if (!Number.isFinite(dt) || dt < 0) throw new Error("DirectionCharacterPresentation dt must be non-negative");
        if (!this.current) return null;
        this.current.age += dt;
        if (this.current.age >= this.current.durationSeconds) this.current = null;
        return this.snapshot();
    }

    snapshot() {
        return this.current ? Object.freeze({ ...this.current }) : null;
    }
}
