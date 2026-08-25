import { runtimeAssetUrl } from "../assets/RuntimeAssetCatalog.js";
import { SpriteAnimation } from "../sprites/SpriteAnimation.js";
import {
    CONTINUITY_WARDEN_LOCOMOTION_STATE,
    CONTINUITY_WARDEN_STATE
} from "../../game/boss/ContinuityWardenDefinition.js";

const ASSET_ID = "continuity-warden-phase-1";
const CELL = Object.freeze({ width: 128, height: 192 });
const OUTPUT_SIZE = Object.freeze({ width: 128, height: 192 });
const ANCHOR = Object.freeze({ x: 0.5, y: 113 / 192 });
const VISUAL_PRESET_ID = "continuity-warden";
const LEFT_DIRECTION = "left";
const LEFT_DIRECTION_VALUE = -1;
const ACTION_PHASE = Object.freeze({ TELEGRAPH: "telegraph", ACTIVE: "active" });
const CHARGE_CLIP_ID = Object.freeze({
    TELEGRAPH: "charge-telegraph",
    SUSTAIN: "charge-sustain",
    EXIT: "charge-exit",
    JUMP_PREPARE: "jump-prepare"
});

const ATLAS = Object.freeze({
    "combat-idle": Object.freeze({ file: "combat-idle.png", frames: 6 }),
    "baton-1": Object.freeze({ file: "baton-1.png", frames: 3 }),
    "baton-2": Object.freeze({ file: "baton-2.png", frames: 3 }),
    "overhead-slam": Object.freeze({ file: "overhead-slam.png", frames: 3 }),
    "back-swing": Object.freeze({ file: "back-swing.png", frames: 4 }),
    "guard-enter": Object.freeze({ file: "guard-enter.png", frames: 3 }),
    "guard-loop": Object.freeze({ file: "guard-loop.png", frames: 2 }),
    "guard-exit": Object.freeze({ file: "guard-exit.png", frames: 2 }),
    "ground-dash": Object.freeze({ file: "ground-dash.png", frames: 6 }),
    "diagonal-dash": Object.freeze({ file: "diagonal-dash.png", frames: 6 }),
    charge: Object.freeze({ file: "charge.png", frames: 8 }),
    "counter-ready": Object.freeze({ file: "counter-ready.png", frames: 4 }),
    "counter-bash": Object.freeze({ file: "counter-bash.png", frames: 4 }),
    "security-command": Object.freeze({ file: "security-command.png", frames: 6 }),
    "neutral-recovery": Object.freeze({ file: "neutral-recovery.png", frames: 4 }),
    "guard-block": Object.freeze({ file: "guard-block.png", frames: 3 }),
    "hit-front": Object.freeze({ file: "hit-front.png", frames: 4 }),
    "hit-back": Object.freeze({ file: "hit-back.png", frames: 4 }),
    turn: Object.freeze({ file: "turn.png", frames: 4 }),
    "defeated-baton-drop": Object.freeze({ file: "defeated-baton-drop.png", frames: 4 }),
    "defeated-shield-fall": Object.freeze({ file: "defeated-shield-fall.png", frames: 4 }),
    "defeated-unconscious": Object.freeze({ file: "defeated-unconscious.png", frames: 5 })
});

const FRAME_DURATION_BY_CLIP = Object.freeze({
    "combat-idle": Object.freeze([0.22, 0.22, 0.22, 0.22, 0.22, 0.22]),
    "baton-1": Object.freeze([0.3, 0.3, 0.35]),
    "baton-2": Object.freeze([0.2, 0.19, 0.35]),
    "overhead-slam": Object.freeze([0.2, 0.19, 0.35]),
    "back-swing": Object.freeze([0.18, 0.09, 0.11, 0.18]),
    "guard-enter": Object.freeze([0.1, 0.1, 0.1]),
    "guard-loop": Object.freeze([0.28, 0.28]),
    "guard-exit": Object.freeze([0.12, 0.12]),
    "ground-dash": Object.freeze([0.3, 0.3, 0.11, 0.11, 0.11, 0.12]),
    "diagonal-dash": Object.freeze([0.18, 0.15, 0.1, 0.1, 0.12, 0.16]),
    charge: Object.freeze([0.45, 0.45, 0.14, 0.14, 0.14, 0.14, 0.2, 0.2]),
    "counter-ready": Object.freeze([0.14, 0.14, 0.22, 0.22]),
    "counter-bash": Object.freeze([0.08, 0.08, 0.1, 0.12]),
    "security-command": Object.freeze([0.16, 0.16, 0.17, 0.17, 0.17, 0.17]),
    "neutral-recovery": Object.freeze([0.12, 0.12, 0.12, 0.12]),
    "guard-block": Object.freeze([0.08, 0.08, 0.12]),
    "hit-front": Object.freeze([0.08, 0.08, 0.1, 0.12]),
    "hit-back": Object.freeze([0.08, 0.08, 0.1, 0.12]),
    turn: Object.freeze([0.08, 0.08, 0.08, 0.08]),
    "defeated-baton-drop": Object.freeze([0.12, 0.12, 0.14, 0.22]),
    "defeated-shield-fall": Object.freeze([0.12, 0.12, 0.14, 0.22]),
    "defeated-unconscious": Object.freeze([0.12, 0.12, 0.14, 0.18, 0.26])
});

const CHARGE_CLIP_DEFINITION = Object.freeze({
    [CHARGE_CLIP_ID.TELEGRAPH]: Object.freeze({
        atlasId: "charge",
        frameOffset: 0,
        durations: Object.freeze(FRAME_DURATION_BY_CLIP.charge.slice(0, 2)),
        loop: false
    }),
    [CHARGE_CLIP_ID.SUSTAIN]: Object.freeze({
        atlasId: "charge",
        frameOffset: 2,
        durations: Object.freeze(FRAME_DURATION_BY_CLIP.charge.slice(2, 6)),
        loop: true
    }),
    [CHARGE_CLIP_ID.EXIT]: Object.freeze({
        atlasId: "charge",
        frameOffset: 6,
        durations: Object.freeze(FRAME_DURATION_BY_CLIP.charge.slice(6, 8)),
        loop: false
    }),
    [CHARGE_CLIP_ID.JUMP_PREPARE]: Object.freeze({
        atlasId: "charge",
        frameOffset: 0,
        durations: Object.freeze([0.2, 0.2]),
        loop: false
    })
});

const CHARGE_CLIP_BY_ACTION_PHASE = Object.freeze({
    [ACTION_PHASE.TELEGRAPH]: CHARGE_CLIP_ID.TELEGRAPH,
    [ACTION_PHASE.ACTIVE]: CHARGE_CLIP_ID.SUSTAIN
});
const DEFEAT_CLIP_BY_STAGE = Object.freeze({
    "baton-drop": "defeated-baton-drop",
    "shield-fall": "defeated-shield-fall",
    unconscious: "defeated-unconscious"
});
const LOCOMOTION_CLIP_BY_STATE = Object.freeze({
    [CONTINUITY_WARDEN_LOCOMOTION_STATE.WALK]: "combat-idle",
    [CONTINUITY_WARDEN_LOCOMOTION_STATE.TAKEOFF]: CHARGE_CLIP_ID.JUMP_PREPARE
});

const STATE_CLIP_ID = Object.freeze({
    neutral: "combat-idle",
    "baton-1": "baton-1",
    "baton-2": "baton-2",
    "overhead-slam": "overhead-slam",
    "back-swing": "back-swing",
    "ground-thruster-dash": "ground-dash",
    "diagonal-thruster-dash": "diagonal-dash",
    charge: CHARGE_CLIP_ID.SUSTAIN,
    "counter-ready": "counter-ready",
    "counter-bash": "counter-bash",
    "security-command": "security-command",
    "security-active": "security-command",
    [CONTINUITY_WARDEN_STATE.JUMP]: "combat-idle",
    [CONTINUITY_WARDEN_STATE.LANDING]: "combat-idle",
    [CONTINUITY_WARDEN_STATE.SUMMON]: "security-command",
    defeated: "defeated-unconscious"
});

function frame(atlasId, index, durationSeconds) {
    return Object.freeze({
        atlasId,
        x: index * CELL.width,
        y: 0,
        width: CELL.width,
        height: CELL.height,
        durationSeconds
    });
}

function clip(id, { loop = false } = {}) {
    const atlas = ATLAS[id];
    const durations = FRAME_DURATION_BY_CLIP[id];
    if (!atlas || !durations || durations.length !== atlas.frames) {
        throw new Error(`Continuity Warden clip '${id}' does not match its atlas`);
    }
    return new SpriteAnimation({
        id,
        loop,
        frames: durations.map((durationSeconds, index) => frame(id, index, durationSeconds))
    });
}

function segmentedClip(id) {
    const definition = CHARGE_CLIP_DEFINITION[id];
    const atlas = ATLAS[definition?.atlasId];
    const frameEnd = definition ? definition.frameOffset + definition.durations.length : 0;
    if (!definition || !atlas || frameEnd > atlas.frames) {
        throw new Error(`Continuity Warden segmented clip '${id}' does not match its atlas`);
    }
    return new SpriteAnimation({
        id,
        loop: definition.loop,
        frames: definition.durations.map((durationSeconds, index) =>
            frame(definition.atlasId, definition.frameOffset + index, durationSeconds)
        )
    });
}

function lastFrame(clipDefinition) {
    return clipDefinition.frames.at(-1);
}

export class ContinuityWardenSpriteDefinition {
    constructor() {
        this.atlases = Object.freeze(
            Object.fromEntries(
                Object.entries(ATLAS).map(([id, atlas]) => [
                    id,
                    Object.freeze({
                        source: runtimeAssetUrl("characters", ASSET_ID, atlas.file),
                        size: Object.freeze({ width: atlas.frames * CELL.width, height: CELL.height })
                    })
                ])
            )
        );
        this.clips = Object.freeze({
            "combat-idle": clip("combat-idle", { loop: true }),
            "baton-1": clip("baton-1"),
            "baton-2": clip("baton-2"),
            "overhead-slam": clip("overhead-slam"),
            "back-swing": clip("back-swing"),
            "guard-enter": clip("guard-enter"),
            "guard-loop": clip("guard-loop", { loop: true }),
            "guard-exit": clip("guard-exit"),
            "ground-dash": clip("ground-dash"),
            "diagonal-dash": clip("diagonal-dash"),
            [CHARGE_CLIP_ID.TELEGRAPH]: segmentedClip(CHARGE_CLIP_ID.TELEGRAPH),
            [CHARGE_CLIP_ID.SUSTAIN]: segmentedClip(CHARGE_CLIP_ID.SUSTAIN),
            [CHARGE_CLIP_ID.EXIT]: segmentedClip(CHARGE_CLIP_ID.EXIT),
            [CHARGE_CLIP_ID.JUMP_PREPARE]: segmentedClip(CHARGE_CLIP_ID.JUMP_PREPARE),
            "counter-ready": clip("counter-ready"),
            "counter-bash": clip("counter-bash"),
            "security-command": clip("security-command"),
            "neutral-recovery": clip("neutral-recovery"),
            "guard-block": clip("guard-block"),
            "hit-front": clip("hit-front"),
            "hit-back": clip("hit-back"),
            turn: clip("turn"),
            "defeated-baton-drop": clip("defeated-baton-drop"),
            "defeated-shield-fall": clip("defeated-shield-fall"),
            "defeated-unconscious": clip("defeated-unconscious")
        });
        this.size = OUTPUT_SIZE;
        this.anchor = ANCHOR;
        this.visualPresetId = VISUAL_PRESET_ID;
        Object.freeze(this);
    }

    supports(object) {
        return (
            object.variant === this.visualPresetId &&
            (object.state === "guard" || STATE_CLIP_ID[object.state] !== undefined)
        );
    }

    frameFor(object, animation) {
        const transient = animation.transientClipId ? this.clips[animation.transientClipId] : null;
        if (transient && animation.transientElapsedSeconds < transient.totalDurationSeconds) {
            return transient.frameAt(animation.transientElapsedSeconds);
        }
        const transition = animation.transitionClipId ? this.clips[animation.transitionClipId] : null;
        if (transition && animation.transitionElapsedSeconds < transition.totalDurationSeconds) {
            return transition.frameAt(animation.transitionElapsedSeconds);
        }
        if (object.state === "guard") {
            const enter = this.clips["guard-enter"];
            return animation.stateElapsedSeconds < enter.totalDurationSeconds
                ? enter.frameAt(animation.stateElapsedSeconds)
                : this.clips["guard-loop"].frameAt(animation.stateElapsedSeconds - enter.totalDurationSeconds);
        }
        const locomotionClipId = LOCOMOTION_CLIP_BY_STATE[object.locomotionState];
        if (locomotionClipId) {
            const locomotionClip = this.clips[locomotionClipId];
            const phase =
                object.locomotionState === CONTINUITY_WARDEN_LOCOMOTION_STATE.WALK
                    ? animation.distancePx / 36
                    : animation.stateElapsedSeconds;
            return locomotionClip.frameAt(phase);
        }
        if (object.state === "security-active") return lastFrame(this.clips["security-command"]);
        if (object.state === "defeated") {
            const defeatClipId = DEFEAT_CLIP_BY_STAGE[object.defeatStage] ?? "defeated-unconscious";
            const defeatClip = this.clips[defeatClipId];
            return DEFEAT_CLIP_BY_STAGE[object.defeatStage]
                ? defeatClip.frameAt(animation.defeatStageElapsedSeconds)
                : lastFrame(defeatClip);
        }
        if (object.state === "charge") {
            const chargeClipId = CHARGE_CLIP_BY_ACTION_PHASE[object.actionState] ?? CHARGE_CLIP_ID.SUSTAIN;
            return this.clips[chargeClipId].frameAt(animation.phaseElapsedSeconds);
        }
        const clipDefinition = this.clips[STATE_CLIP_ID[object.state]];
        return clipDefinition.frameAt(animation.stateElapsedSeconds);
    }

    flipX(direction) {
        return direction === LEFT_DIRECTION || direction === LEFT_DIRECTION_VALUE;
    }
}

export const DEFAULT_CONTINUITY_WARDEN_SPRITE_DEFINITION = new ContinuityWardenSpriteDefinition();
