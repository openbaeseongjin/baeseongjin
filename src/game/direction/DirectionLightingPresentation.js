export class DirectionLightingPresentation {
    constructor() {
        this.current = null;
        this.seenCausalIds = new Set();
    }

    present(command, { areaId = null } = {}) {
        if (this.seenCausalIds.has(command.causalId)) return false;
        this.seenCausalIds.add(command.causalId);
        this.current = {
            presetId: command.payload.presetId,
            areaId,
            age: 0
        };
        return true;
    }

    update(dt, { areaId = null } = {}) {
        if (!Number.isFinite(dt) || dt < 0) throw new Error("DirectionLightingPresentation dt must be non-negative");
        if (this.current && this.current.areaId !== areaId) this.current = null;
        if (this.current) this.current.age += dt;
        return this.snapshot();
    }

    snapshot() {
        return this.current ? Object.freeze({ ...this.current }) : null;
    }
}
