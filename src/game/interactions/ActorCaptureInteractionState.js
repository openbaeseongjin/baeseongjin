const CAPTURE_PHASE = Object.freeze({ PULLING: "pulling", HELD: "held", RESOLVED: "resolved", CANCELLED: "cancelled" });

function point(value, label) {
    if (!Number.isFinite(value?.x) || !Number.isFinite(value?.y)) throw new Error(`${label} requires finite x and y`);
    return Object.freeze({ x: value.x, y: value.y });
}

export class ActorCaptureInteractionState {
    constructor({ interactionId, definition, sourceActorId, targetActorId, startPosition, targetPosition }) {
        if (typeof interactionId !== "string" || !interactionId) throw new Error("capture interaction requires id");
        this.interactionId = interactionId;
        this.definition = definition;
        this.sourceActorId = sourceActorId;
        this.targetActorId = targetActorId;
        this.startPosition = point(startPosition, "capture startPosition");
        this.targetPosition = point(targetPosition, "capture targetPosition");
        this.elapsedSeconds = 0;
        this.phase = CAPTURE_PHASE.PULLING;
    }

    get active() {
        return this.phase !== CAPTURE_PHASE.RESOLVED && this.phase !== CAPTURE_PHASE.CANCELLED;
    }

    advance(dt) {
        if (!this.active) return this.snapshot();
        if (!Number.isFinite(dt) || dt < 0) throw new Error("capture interaction dt must be non-negative");
        this.elapsedSeconds = Math.min(this.definition.holdSeconds, this.elapsedSeconds + dt);
        this.phase =
            this.elapsedSeconds >= this.definition.holdSeconds
                ? CAPTURE_PHASE.RESOLVED
                : this.elapsedSeconds >= this.definition.pullSeconds
                  ? CAPTURE_PHASE.HELD
                  : CAPTURE_PHASE.PULLING;
        return this.snapshot();
    }

    position() {
        const ratio = Math.min(1, this.elapsedSeconds / this.definition.pullSeconds);
        return Object.freeze({
            x: this.startPosition.x + (this.targetPosition.x - this.startPosition.x) * ratio,
            y: this.startPosition.y + (this.targetPosition.y - this.startPosition.y) * ratio
        });
    }

    cancel() {
        if (this.active) this.phase = CAPTURE_PHASE.CANCELLED;
        return this.snapshot();
    }

    snapshot() {
        return Object.freeze({
            interactionId: this.interactionId,
            definitionId: this.definition.id,
            sourceActorId: this.sourceActorId,
            targetActorId: this.targetActorId,
            startPosition: this.startPosition,
            targetPosition: this.targetPosition,
            elapsedSeconds: this.elapsedSeconds,
            phase: this.phase,
            active: this.active
        });
    }
}
