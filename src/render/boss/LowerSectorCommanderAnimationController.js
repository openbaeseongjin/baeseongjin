import { LOWER_SECTOR_COMMANDER_STATE } from "../../game/boss/LowerSectorCommanderDefinition.js";

const RECOVERY_CLIP_BY_STATE = Object.freeze({
    [LOWER_SECTOR_COMMANDER_STATE.GRAB]: "hammer-recovery",
    [LOWER_SECTOR_COMMANDER_STATE.HAMMER]: "hammer-recovery",
    [LOWER_SECTOR_COMMANDER_STATE.CHARGE]: "charge-recovery"
});
const REACTION_CLIP_BY_EVENT_TYPE = Object.freeze({
    "boss-damaged": "hit"
});

function reactionClipId(event, objectId) {
    if (event?.targetId !== objectId && event?.bossId !== objectId) return null;
    return REACTION_CLIP_BY_EVENT_TYPE[event?.eventType] ?? null;
}

export class LowerSectorCommanderAnimationController {
    constructor() {
        this.state = null;
        this.actionState = null;
        this.grabStage = null;
        this.previousPresentationTimeSeconds = null;
        this.previousX = null;
        this.stateElapsedSeconds = 0;
        this.phaseElapsedSeconds = 0;
        this.grabStageElapsedSeconds = 0;
        this.distancePx = 0;
        this.transitionClipId = null;
        this.transitionElapsedSeconds = 0;
        this.transientClipId = null;
        this.transientElapsedSeconds = 0;
    }

    update(object, events = Object.freeze([]), presentationTimeSeconds = 0) {
        const x = object.position?.x;
        if (!Number.isFinite(x)) throw new Error("Lower Sector Commander animation requires a finite position.x");
        const stateChanged = object.state !== this.state;
        const phaseChanged = object.actionState !== this.actionState;
        const grabStageChanged = object.grabStage !== this.grabStage;
        const elapsedDelta =
            this.previousPresentationTimeSeconds === null || !Number.isFinite(presentationTimeSeconds)
                ? 0
                : Math.min(0.1, Math.max(0, presentationTimeSeconds - this.previousPresentationTimeSeconds));

        if (stateChanged) {
            this.transitionClipId =
                object.state === LOWER_SECTOR_COMMANDER_STATE.NEUTRAL
                    ? (RECOVERY_CLIP_BY_STATE[this.state] ?? null)
                    : null;
            this.transitionElapsedSeconds = 0;
            this.stateElapsedSeconds = 0;
            this.phaseElapsedSeconds = 0;
            this.grabStageElapsedSeconds = 0;
            this.distancePx = 0;
        } else {
            this.stateElapsedSeconds += elapsedDelta;
            this.phaseElapsedSeconds = phaseChanged ? 0 : this.phaseElapsedSeconds + elapsedDelta;
            this.grabStageElapsedSeconds = grabStageChanged ? 0 : this.grabStageElapsedSeconds + elapsedDelta;
            if (this.previousX !== null) this.distancePx += Math.abs(x - this.previousX);
            if (this.transitionClipId) this.transitionElapsedSeconds += elapsedDelta;
            if (this.transientClipId) this.transientElapsedSeconds += elapsedDelta;
        }

        const reactionClip =
            object.state === LOWER_SECTOR_COMMANDER_STATE.DEFEATED
                ? null
                : ([...events]
                      .reverse()
                      .map((event) => reactionClipId(event, object.id))
                      .find(Boolean) ?? null);
        if (reactionClip) {
            this.transientClipId = reactionClip;
            this.transientElapsedSeconds = 0;
        }

        this.state = object.state;
        this.actionState = object.actionState;
        this.grabStage = object.grabStage;
        this.previousPresentationTimeSeconds = presentationTimeSeconds;
        this.previousX = x;
        return this.snapshot();
    }

    snapshot() {
        return Object.freeze({
            stateElapsedSeconds: this.stateElapsedSeconds,
            phaseElapsedSeconds: this.phaseElapsedSeconds,
            grabStageElapsedSeconds: this.grabStageElapsedSeconds,
            distancePx: this.distancePx,
            transitionClipId: this.transitionClipId,
            transitionElapsedSeconds: this.transitionElapsedSeconds,
            transientClipId: this.transientClipId,
            transientElapsedSeconds: this.transientElapsedSeconds
        });
    }
}
