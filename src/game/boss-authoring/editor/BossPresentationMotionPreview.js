import {
    LOWER_SECTOR_COMMANDER_ACTION_PHASE,
    LOWER_SECTOR_COMMANDER_GRAB_HOOK,
    LOWER_SECTOR_COMMANDER_GRAB_STAGE,
    LOWER_SECTOR_COMMANDER_OBJECT_KIND,
    LOWER_SECTOR_COMMANDER_STATE
} from "../../boss/LowerSectorCommanderDefinition.js";

export const BOSS_PRESENTATION_PREVIEW_MODE = Object.freeze({
    ACTUAL: "actual",
    BOSS03_GRAB_LAUNCH: "boss03-grab-launch"
});

const BOSS03_STAGE_ID = "boss-03";
const BOSS03_GRAB_LAUNCH_PREVIEW = Object.freeze({
    targetDistance: 370,
    endHoldSeconds: 0.2
});
const MODE_STAGE_ID = Object.freeze({
    [BOSS_PRESENTATION_PREVIEW_MODE.BOSS03_GRAB_LAUNCH]: BOSS03_STAGE_ID
});

function facingValue(direction) {
    if (typeof direction === "number") return direction < 0 ? -1 : 1;
    return direction === "left" ? -1 : 1;
}

function previewObjectId(objectId, mode, sequence) {
    return `${objectId}:motion-preview:${mode}:${sequence}`;
}

export class BossPresentationMotionPreview {
    constructor({ bossStageId }) {
        if (typeof bossStageId !== "string" || bossStageId.length === 0) {
            throw new Error("Boss presentation motion preview requires a Boss Stage ID");
        }
        this.bossStageId = bossStageId;
        this.mode = BOSS_PRESENTATION_PREVIEW_MODE.ACTUAL;
        this.elapsedSeconds = 0;
        this.sequence = 0;
    }

    supports(mode) {
        return mode === BOSS_PRESENTATION_PREVIEW_MODE.ACTUAL || MODE_STAGE_ID[mode] === this.bossStageId;
    }

    setMode(mode) {
        if (!this.supports(mode)) return Object.freeze({ accepted: false, ...this.snapshot() });
        this.mode = mode;
        this.elapsedSeconds = 0;
        this.sequence += 1;
        return Object.freeze({ accepted: true, ...this.snapshot() });
    }

    get active() {
        return this.mode !== BOSS_PRESENTATION_PREVIEW_MODE.ACTUAL;
    }

    advance(dt) {
        if (!this.active) return this.snapshot();
        if (!Number.isFinite(dt) || dt < 0) throw new Error("Boss presentation preview dt must be non-negative");
        this.elapsedSeconds += dt;
        const cycleSeconds =
            BOSS03_GRAB_LAUNCH_PREVIEW.targetDistance / LOWER_SECTOR_COMMANDER_GRAB_HOOK.SPEED +
            BOSS03_GRAB_LAUNCH_PREVIEW.endHoldSeconds;
        while (this.elapsedSeconds >= cycleSeconds) {
            this.elapsedSeconds -= cycleSeconds;
            this.sequence += 1;
        }
        return this.snapshot();
    }

    project(snapshot) {
        if (!this.active || snapshot?.stageId !== this.bossStageId || snapshot.status !== "active") return snapshot;
        if (this.mode !== BOSS_PRESENTATION_PREVIEW_MODE.BOSS03_GRAB_LAUNCH) return snapshot;
        const presentation = snapshot.presentation ?? {};
        const body = (presentation.objects ?? []).find(({ kind }) => kind === LOWER_SECTOR_COMMANDER_OBJECT_KIND.BODY);
        if (!body?.position) return snapshot;
        const direction = facingValue(body.direction);
        const hand = Object.freeze({
            x: body.position.x + direction * LOWER_SECTOR_COMMANDER_GRAB_HOOK.HAND_OFFSET_X,
            y: body.position.y + LOWER_SECTOR_COMMANDER_GRAB_HOOK.HAND_OFFSET_Y
        });
        const target = Object.freeze({
            x: hand.x + direction * BOSS03_GRAB_LAUNCH_PREVIEW.targetDistance,
            y: hand.y
        });
        const flightSeconds = BOSS03_GRAB_LAUNCH_PREVIEW.targetDistance / LOWER_SECTOR_COMMANDER_GRAB_HOOK.SPEED;
        const progress = Math.max(0, Math.min(1, this.elapsedSeconds / flightSeconds));
        const grabHookPosition = Object.freeze({
            x: hand.x + (target.x - hand.x) * progress,
            y: hand.y + (target.y - hand.y) * progress
        });
        const objects = Object.freeze(
            presentation.objects.map((object) =>
                object === body
                    ? Object.freeze({
                          ...object,
                          id: previewObjectId(object.id, this.mode, this.sequence),
                          state: LOWER_SECTOR_COMMANDER_STATE.GRAB,
                          actionState: LOWER_SECTOR_COMMANDER_ACTION_PHASE.ACTIVE,
                          grabStage: LOWER_SECTOR_COMMANDER_GRAB_STAGE.SEARCH,
                          grabHookPosition,
                          grabHookProgress: progress,
                          targetPosition: target
                      })
                    : object
            )
        );
        return Object.freeze({
            ...snapshot,
            presentation: Object.freeze({ ...presentation, objects })
        });
    }

    snapshot() {
        return Object.freeze({
            bossStageId: this.bossStageId,
            mode: this.mode,
            active: this.active,
            elapsedSeconds: this.elapsedSeconds,
            sequence: this.sequence
        });
    }
}
