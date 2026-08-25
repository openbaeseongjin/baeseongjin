function positive(value, label) {
    if (!Number.isFinite(value) || value <= 0) throw new Error(`${label} must be positive`);
    return value;
}

export class CaptureDefinition {
    constructor({ id, pullSeconds, holdSeconds }) {
        if (typeof id !== "string" || id.length === 0) throw new Error("CaptureDefinition requires id");
        this.id = id;
        this.pullSeconds = positive(pullSeconds, `${id}.pullSeconds`);
        this.holdSeconds = positive(holdSeconds, `${id}.holdSeconds`);
        if (this.pullSeconds > this.holdSeconds) throw new Error(`${id}.pullSeconds must not exceed holdSeconds`);
        Object.freeze(this);
    }
}
