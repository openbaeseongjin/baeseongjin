import { runtimeAssetUrl } from "../assets/RuntimeAssetCatalog.js";
import { SpriteAnimation } from "../sprites/SpriteAnimation.js";
import {
    LOWER_SECTOR_COMMANDER_ACTION_PHASE,
    LOWER_SECTOR_COMMANDER_GRAB_STAGE,
    LOWER_SECTOR_COMMANDER_STATE
} from "../../game/boss/LowerSectorCommanderDefinition.js";

const ASSET_ID = "lower-sector-commander-v1";
const VISUAL_PRESET_ID = "lower-sector-commander";
const MOTION_SIZE = Object.freeze({ width: 256, height: 256 });
const MOTION_ANCHOR = Object.freeze({ x: 0.5, y: 152 / 256 });
const WALK_STRIDE_PIXELS = 144;
const FACING = Object.freeze({ LEFT: "left", LEFT_VALUE: -1, RIGHT: "right" });
const AUTHORED_FACING_BY_ATLAS_ID = Object.freeze({
    idle: FACING.RIGHT,
    walk: FACING.RIGHT,
    jump: FACING.RIGHT,
    "grab-lock": FACING.LEFT,
    "grab-pull": FACING.LEFT,
    "hammer-slam": FACING.RIGHT,
    "body-charge": FACING.RIGHT,
    hit: FACING.RIGHT,
    defeated: FACING.RIGHT
});

const ATLAS = Object.freeze({
    idle: Object.freeze({ file: "idle.png", frames: 4, cell: Object.freeze({ width: 256, height: 256 }) }),
    walk: Object.freeze({ file: "walk.png", frames: 8, cell: Object.freeze({ width: 256, height: 256 }) }),
    jump: Object.freeze({ file: "jump.png", frames: 6, cell: Object.freeze({ width: 256, height: 256 }) }),
    "grab-lock": Object.freeze({
        file: "grab-lock.png",
        frames: 4,
        cell: Object.freeze({ width: 256, height: 256 })
    }),
    "grab-pull": Object.freeze({
        file: "grab-pull.png",
        frames: 6,
        cell: Object.freeze({ width: 256, height: 256 })
    }),
    "hammer-slam": Object.freeze({
        file: "hammer-slam.png",
        frames: 8,
        cell: Object.freeze({ width: 256, height: 256 })
    }),
    "body-charge": Object.freeze({
        file: "body-charge.png",
        frames: 6,
        cell: Object.freeze({ width: 256, height: 256 })
    }),
    hit: Object.freeze({ file: "hit.png", frames: 3, cell: Object.freeze({ width: 256, height: 256 }) }),
    defeated: Object.freeze({
        file: "defeated.png",
        frames: 8,
        cell: Object.freeze({ width: 256, height: 256 })
    }),
    "hook-flight": Object.freeze({
        file: "hook-flight.png",
        frames: 4,
        cell: Object.freeze({ width: 64, height: 64 })
    }),
    "pull-tension": Object.freeze({
        file: "pull-tension.png",
        frames: 4,
        cell: Object.freeze({ width: 128, height: 64 })
    }),
    "chain-link": Object.freeze({
        file: "chain-link.png",
        frames: 1,
        cell: Object.freeze({ width: 32, height: 24 })
    })
});

const FRAME_DURATION_SECONDS = Object.freeze({
    idle: Object.freeze([0.32, 0.32, 0.32, 0.32]),
    walk: Object.freeze([0.12, 0.12, 0.12, 0.12, 0.12, 0.12, 0.12, 0.12]),
    jump: Object.freeze([0.08, 0.08, 0.22, 0.18, 0.39, 0.3]),
    "grab-lock": Object.freeze([0.2, 0.3, 0.4, 0.6]),
    "grab-pull": Object.freeze([0.12, 0.16, 0.22, 0.14, 0.18, 0.24]),
    "hammer-slam": Object.freeze([0.18, 0.18, 0.2, 0.24, 0.07, 0.07, 0.12, 0.22]),
    "body-charge": Object.freeze([0.3, 0.5, 0.12, 0.12, 0.12, 0.26]),
    hit: Object.freeze([0.08, 0.08, 0.12]),
    defeated: Object.freeze([0.18, 0.18, 0.22, 0.26, 0.3, 0.36, 0.42, 0.6]),
    "hook-flight": Object.freeze([0.06, 0.06, 0.06, 0.06]),
    "pull-tension": Object.freeze([0.08, 0.08, 0.08, 0.08])
});

const SEGMENT = Object.freeze({
    JUMP_ACTIVE: Object.freeze({ id: "jump-active", atlasId: "jump", offset: 0, count: 5 }),
    JUMP_LANDING: Object.freeze({ id: "jump-landing", atlasId: "jump", offset: 5, count: 1 }),
    GRAB_LAUNCH: Object.freeze({ id: "grab-launch", atlasId: "grab-pull", offset: 0, count: 3 }),
    GRAB_HOLD: Object.freeze({ id: "grab-hold", atlasId: "grab-pull", offset: 3, count: 3 }),
    HAMMER_TELEGRAPH: Object.freeze({ id: "hammer-telegraph", atlasId: "hammer-slam", offset: 0, count: 4 }),
    HAMMER_IMPACT: Object.freeze({ id: "hammer-impact", atlasId: "hammer-slam", offset: 4, count: 3 }),
    HAMMER_RECOVERY: Object.freeze({ id: "hammer-recovery", atlasId: "hammer-slam", offset: 7, count: 1 }),
    CHARGE_TELEGRAPH: Object.freeze({ id: "charge-telegraph", atlasId: "body-charge", offset: 0, count: 2 }),
    CHARGE_ACTIVE: Object.freeze({ id: "charge-active", atlasId: "body-charge", offset: 2, count: 3 }),
    CHARGE_RECOVERY: Object.freeze({ id: "charge-recovery", atlasId: "body-charge", offset: 5, count: 1 })
});

const SUPPORTED_STATE = Object.freeze({
    [LOWER_SECTOR_COMMANDER_STATE.NEUTRAL]: true,
    [LOWER_SECTOR_COMMANDER_STATE.WALK]: true,
    [LOWER_SECTOR_COMMANDER_STATE.JUMP]: true,
    [LOWER_SECTOR_COMMANDER_STATE.GRAB]: true,
    [LOWER_SECTOR_COMMANDER_STATE.HAMMER]: true,
    [LOWER_SECTOR_COMMANDER_STATE.CHARGE]: true,
    [LOWER_SECTOR_COMMANDER_STATE.DEFEATED]: true
});

function atlasFrame(atlasId, index, durationSeconds) {
    const atlas = ATLAS[atlasId];
    if (!atlas || index < 0 || index >= atlas.frames) {
        throw new Error(`Lower Sector Commander frame '${atlasId}:${index}' is outside its atlas`);
    }
    return Object.freeze({
        atlasId,
        x: index * atlas.cell.width,
        y: 0,
        width: atlas.cell.width,
        height: atlas.cell.height,
        durationSeconds
    });
}

function clip(id, { loop = false } = {}) {
    const durations = FRAME_DURATION_SECONDS[id];
    if (!durations || durations.length !== ATLAS[id]?.frames) {
        throw new Error(`Lower Sector Commander clip '${id}' does not match its atlas`);
    }
    return new SpriteAnimation({
        id,
        loop,
        frames: durations.map((durationSeconds, index) => atlasFrame(id, index, durationSeconds))
    });
}

function segmentedClip(definition) {
    const durations = FRAME_DURATION_SECONDS[definition.atlasId]?.slice(
        definition.offset,
        definition.offset + definition.count
    );
    if (!durations || durations.length !== definition.count) {
        throw new Error(`Lower Sector Commander segmented clip '${definition.id}' does not match its atlas`);
    }
    return new SpriteAnimation({
        id: definition.id,
        loop: false,
        frames: durations.map((durationSeconds, index) =>
            atlasFrame(definition.atlasId, definition.offset + index, durationSeconds)
        )
    });
}

export class LowerSectorCommanderSpriteDefinition {
    constructor() {
        this.atlases = Object.freeze(
            Object.fromEntries(
                Object.entries(ATLAS).map(([id, atlas]) => [
                    id,
                    Object.freeze({
                        source: runtimeAssetUrl("characters", ASSET_ID, atlas.file),
                        size: Object.freeze({
                            width: atlas.frames * atlas.cell.width,
                            height: atlas.cell.height
                        })
                    })
                ])
            )
        );
        this.clips = Object.freeze({
            idle: clip("idle", { loop: true }),
            walk: clip("walk", { loop: true }),
            "jump-active": segmentedClip(SEGMENT.JUMP_ACTIVE),
            "jump-landing": segmentedClip(SEGMENT.JUMP_LANDING),
            "grab-lock": clip("grab-lock"),
            "grab-launch": segmentedClip(SEGMENT.GRAB_LAUNCH),
            "grab-hold": segmentedClip(SEGMENT.GRAB_HOLD),
            "hammer-telegraph": segmentedClip(SEGMENT.HAMMER_TELEGRAPH),
            "hammer-impact": segmentedClip(SEGMENT.HAMMER_IMPACT),
            "hammer-recovery": segmentedClip(SEGMENT.HAMMER_RECOVERY),
            "charge-telegraph": segmentedClip(SEGMENT.CHARGE_TELEGRAPH),
            "charge-active": segmentedClip(SEGMENT.CHARGE_ACTIVE),
            "charge-recovery": segmentedClip(SEGMENT.CHARGE_RECOVERY),
            hit: clip("hit"),
            defeated: clip("defeated")
        });
        this.effectClips = Object.freeze({
            hookFlight: clip("hook-flight", { loop: true }),
            pullTension: clip("pull-tension", { loop: true })
        });
        this.chainLinkFrame = atlasFrame("chain-link", 0, 1);
        this.size = MOTION_SIZE;
        this.anchor = MOTION_ANCHOR;
        this.visualPresetId = VISUAL_PRESET_ID;
        Object.freeze(this);
    }

    supports(object) {
        return object.variant === this.visualPresetId && SUPPORTED_STATE[object.state] === true;
    }

    frameFor(object, animation) {
        const transient = animation.transientClipId ? this.clips[animation.transientClipId] : null;
        if (
            object.state !== LOWER_SECTOR_COMMANDER_STATE.DEFEATED &&
            transient &&
            animation.transientElapsedSeconds < transient.totalDurationSeconds
        ) {
            return transient.frameAt(animation.transientElapsedSeconds);
        }
        const transition = animation.transitionClipId ? this.clips[animation.transitionClipId] : null;
        if (transition && animation.transitionElapsedSeconds < transition.totalDurationSeconds) {
            return transition.frameAt(animation.transitionElapsedSeconds);
        }
        if (object.state === LOWER_SECTOR_COMMANDER_STATE.WALK) {
            const distancePhaseSeconds =
                (animation.distancePx / WALK_STRIDE_PIXELS) * this.clips.walk.totalDurationSeconds;
            return this.clips.walk.frameAt(distancePhaseSeconds);
        }
        if (object.state === LOWER_SECTOR_COMMANDER_STATE.JUMP) {
            return this.clips["jump-active"].frameAt(animation.stateElapsedSeconds);
        }
        if (object.state === LOWER_SECTOR_COMMANDER_STATE.GRAB) {
            if (
                object.grabStage === LOWER_SECTOR_COMMANDER_GRAB_STAGE.LEAD ||
                object.grabStage === LOWER_SECTOR_COMMANDER_GRAB_STAGE.TELEGRAPH
            ) {
                return this.clips["grab-lock"].frameAt(animation.grabStageElapsedSeconds);
            }
            if (object.grabStage === LOWER_SECTOR_COMMANDER_GRAB_STAGE.SEARCH) {
                return this.clips["grab-launch"].frameAt(animation.grabStageElapsedSeconds);
            }
            if (object.grabStage === LOWER_SECTOR_COMMANDER_GRAB_STAGE.CAPTURED) {
                return this.clips["grab-hold"].frameAt(animation.grabStageElapsedSeconds);
            }
            if (object.grabStage === LOWER_SECTOR_COMMANDER_GRAB_STAGE.HAMMER) {
                return this.clips["hammer-impact"].frameAt(animation.phaseElapsedSeconds);
            }
            return this.clips.idle.frameAt(animation.stateElapsedSeconds);
        }
        if (object.state === LOWER_SECTOR_COMMANDER_STATE.HAMMER) {
            const clipId =
                object.actionState === LOWER_SECTOR_COMMANDER_ACTION_PHASE.TELEGRAPH
                    ? "hammer-telegraph"
                    : object.actionState === LOWER_SECTOR_COMMANDER_ACTION_PHASE.ACTIVE
                      ? "hammer-impact"
                      : "hammer-recovery";
            return this.clips[clipId].frameAt(animation.phaseElapsedSeconds);
        }
        if (object.state === LOWER_SECTOR_COMMANDER_STATE.CHARGE) {
            const clipId =
                object.actionState === LOWER_SECTOR_COMMANDER_ACTION_PHASE.TELEGRAPH
                    ? "charge-telegraph"
                    : object.actionState === LOWER_SECTOR_COMMANDER_ACTION_PHASE.ACTIVE
                      ? "charge-active"
                      : "charge-recovery";
            return this.clips[clipId].frameAt(animation.phaseElapsedSeconds);
        }
        if (object.state === LOWER_SECTOR_COMMANDER_STATE.DEFEATED) {
            return this.clips.defeated.frameAt(animation.stateElapsedSeconds);
        }
        return this.clips.idle.frameAt(animation.stateElapsedSeconds);
    }

    hookFrameAt(elapsedSeconds) {
        return this.effectClips.hookFlight.frameAt(elapsedSeconds);
    }

    tensionFrameAt(elapsedSeconds) {
        return this.effectClips.pullTension.frameAt(elapsedSeconds);
    }

    flipX(object, frame) {
        const authoredFacing = AUTHORED_FACING_BY_ATLAS_ID[frame.atlasId] ?? FACING.RIGHT;
        const gameplayFacing =
            object.direction === FACING.LEFT || object.direction === FACING.LEFT_VALUE ? FACING.LEFT : FACING.RIGHT;
        return authoredFacing !== gameplayFacing;
    }
}

export const DEFAULT_LOWER_SECTOR_COMMANDER_SPRITE_DEFINITION = new LowerSectorCommanderSpriteDefinition();
