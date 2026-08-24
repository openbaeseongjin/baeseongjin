const RECOVERY_CLIP_BY_STATE = Object.freeze({
    "baton-1": "neutral-recovery",
    "baton-2": "neutral-recovery",
    "overhead-slam": "neutral-recovery",
    "back-swing": "neutral-recovery",
    "ground-thruster-dash": "neutral-recovery",
    "diagonal-thruster-dash": "neutral-recovery",
    charge: "charge-exit",
    guard: "guard-exit",
    "counter-ready": "neutral-recovery",
    "counter-bash": "neutral-recovery",
    "security-active": "neutral-recovery"
});
const REACTION_CLIP_BY_EVENT_TYPE = Object.freeze({
    "boss-damaged": Object.freeze({ front: "hit-front", flank: "hit-back" }),
    "boss-guard-blocked": "guard-block"
});

function reactionClipId(event) {
    const definition = REACTION_CLIP_BY_EVENT_TYPE[event?.eventType];
    if (typeof definition === "string") return definition;
    return definition?.[event.flank === true ? "flank" : "front"] ?? null;
}

export class ContinuityWardenAnimationController {
    constructor() {
        this.state = null;
        this.actionState = null;
        this.previousPresentationTimeSeconds = null;
        this.previousX = null;
        this.stateElapsedSeconds = 0;
        this.phaseElapsedSeconds = 0;
        this.distancePx = 0;
        this.transitionClipId = null;
        this.transitionElapsedSeconds = 0;
        this.transientClipId = null;
        this.transientElapsedSeconds = 0;
        this.direction = null;
        this.defeatStage = null;
        this.defeatStageElapsedSeconds = 0;
    }

    update(object, events = Object.freeze([]), presentationTimeSeconds = 0) {
        const x = object.position?.x;
        if (!Number.isFinite(x)) throw new Error("Continuity Warden animation requires a finite position.x");
        const stateChanged = object.state !== this.state;
        const phaseChanged = object.actionState !== this.actionState;
        const defeatStageChanged = object.defeatStage !== this.defeatStage;
        const directionChanged = this.direction !== null && object.direction !== this.direction;
        const elapsedDelta =
            this.previousPresentationTimeSeconds === null || !Number.isFinite(presentationTimeSeconds)
                ? 0
                : Math.min(0.1, Math.max(0, presentationTimeSeconds - this.previousPresentationTimeSeconds));

        if (stateChanged) {
            this.transitionClipId = object.state === "neutral" ? (RECOVERY_CLIP_BY_STATE[this.state] ?? null) : null;
            this.transitionElapsedSeconds = 0;
            this.stateElapsedSeconds = 0;
            this.phaseElapsedSeconds = 0;
            this.distancePx = 0;
        } else {
            this.stateElapsedSeconds += elapsedDelta;
            this.phaseElapsedSeconds = phaseChanged ? 0 : this.phaseElapsedSeconds + elapsedDelta;
            if (this.previousX !== null) this.distancePx += Math.abs(x - this.previousX);
            if (this.transitionClipId) this.transitionElapsedSeconds += elapsedDelta;
            if (this.transientClipId) this.transientElapsedSeconds += elapsedDelta;
        }
        this.defeatStageElapsedSeconds = defeatStageChanged ? 0 : this.defeatStageElapsedSeconds + elapsedDelta;

        const reactionClip = [...events].reverse().map(reactionClipId).find(Boolean) ?? null;
        if (reactionClip || directionChanged) {
            this.transientClipId = reactionClip ?? "turn";
            this.transientElapsedSeconds = 0;
        }

        this.state = object.state;
        this.actionState = object.actionState;
        this.direction = object.direction;
        this.defeatStage = object.defeatStage;
        this.previousPresentationTimeSeconds = presentationTimeSeconds;
        this.previousX = x;
        return this.snapshot();
    }

    snapshot() {
        return Object.freeze({
            stateElapsedSeconds: this.stateElapsedSeconds,
            phaseElapsedSeconds: this.phaseElapsedSeconds,
            distancePx: this.distancePx,
            transitionClipId: this.transitionClipId,
            transitionElapsedSeconds: this.transitionElapsedSeconds,
            transientClipId: this.transientClipId,
            transientElapsedSeconds: this.transientElapsedSeconds,
            defeatStageElapsedSeconds: this.defeatStageElapsedSeconds
        });
    }
}
