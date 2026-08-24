import { CONTINUITY_WARDEN_STATE } from "../boss/ContinuityWardenRuntime.js";
import { COMPOSITE_BOSS_STAGE_STATUS } from "../boss/CompositeBossEncounterRuntime.js";
import { CLIENT_FEEDBACK_PRESET_ID } from "./ClientFeedbackEventDefinition.js";

export const CONTINUITY_WARDEN_PRESENTATION_KIND = Object.freeze({
    HAZARD: "boss-warden-hazard",
    SECURITY_BEAM: "boss-security-beam"
});

export const CONTINUITY_WARDEN_PRESENTATION_STATE = Object.freeze({
    ACTIVE: "active"
});

const CONTINUITY_WARDEN_MELEE_STATE = Object.freeze({
    [CONTINUITY_WARDEN_STATE.BATON_1]: true,
    [CONTINUITY_WARDEN_STATE.BATON_2]: true,
    [CONTINUITY_WARDEN_STATE.OVERHEAD_SLAM]: true,
    [CONTINUITY_WARDEN_STATE.BACK_SWING]: true,
    [CONTINUITY_WARDEN_STATE.COUNTER_BASH]: true
});

const MELEE_DIRECTION_BY_STATE = Object.freeze({
    [CONTINUITY_WARDEN_STATE.BATON_1]: (facing) => ({ x: facing, y: 0.08 }),
    [CONTINUITY_WARDEN_STATE.BATON_2]: (facing) => ({ x: facing, y: 0.2 }),
    [CONTINUITY_WARDEN_STATE.OVERHEAD_SLAM]: () => ({ x: 0, y: 1 }),
    [CONTINUITY_WARDEN_STATE.BACK_SWING]: (facing) => ({ x: -facing, y: -0.06 }),
    [CONTINUITY_WARDEN_STATE.COUNTER_BASH]: (facing) => ({ x: facing, y: 0.12 })
});

export const CONTINUITY_WARDEN_COMBAT_VFX_CONFIG = Object.freeze({
    ACTIVE_STAGE_STATUS: COMPOSITE_BOSS_STAGE_STATUS.ACTIVE,
    DEFAULT_FACING: 1,
    MELEE_DENSITY: 1,
    BEAM_DENSITY: 1,
    MELEE_INTERVAL_SECONDS: 0.1,
    BEAM_INTERVAL_SECONDS: 0.08,
    PRIORITY: 0,
    BEAM_DIRECTION: Object.freeze({ x: 1, y: 0 })
});

export const CONTINUITY_WARDEN_COMBAT_VFX_KEY = Object.freeze({
    activeRange: (objectId, variant) => `boss-warden-range:${objectId}:${variant}`
});

function finitePosition(position) {
    return Number.isFinite(position?.x) && Number.isFinite(position?.y);
}

function finiteSize(size) {
    return Number.isFinite(size?.width) && size.width > 0 && Number.isFinite(size?.height) && size.height > 0;
}

function presentationBounds({ position, size }) {
    const halfWidth = size.width * 0.5;
    const halfHeight = size.height * 0.5;
    return Object.freeze({
        minX: position.x - halfWidth,
        minY: position.y - halfHeight,
        maxX: position.x + halfWidth,
        maxY: position.y + halfHeight
    });
}

function meleeDirection(object) {
    const facing = object.direction === -1 ? -1 : CONTINUITY_WARDEN_COMBAT_VFX_CONFIG.DEFAULT_FACING;
    return Object.freeze(MELEE_DIRECTION_BY_STATE[object.variant](facing));
}

export function continuityWardenCombatFeedbackSource(bossStage) {
    if (
        bossStage?.status !== CONTINUITY_WARDEN_COMBAT_VFX_CONFIG.ACTIVE_STAGE_STATUS ||
        !Array.isArray(bossStage.presentation?.objects)
    ) {
        return null;
    }
    return Object.freeze({ objects: bossStage.presentation.objects });
}

export function validContinuityWardenPresentationObject(object) {
    return Boolean(
        object?.active === true &&
        object.state === CONTINUITY_WARDEN_PRESENTATION_STATE.ACTIVE &&
        finitePosition(object.position) &&
        finiteSize(object.size)
    );
}

export function isContinuityWardenMeleeObject(object) {
    return Boolean(
        validContinuityWardenPresentationObject(object) &&
        object.kind === CONTINUITY_WARDEN_PRESENTATION_KIND.HAZARD &&
        object.damaging === true &&
        CONTINUITY_WARDEN_MELEE_STATE[object.variant] === true
    );
}

export function isContinuityWardenBeamObject(object) {
    return Boolean(
        validContinuityWardenPresentationObject(object) &&
        object.kind === CONTINUITY_WARDEN_PRESENTATION_KIND.SECURITY_BEAM &&
        object.damaging === true
    );
}

export class ContinuityWardenRangeFeedbackDefinition {
    constructor({ presetId, density, intervalSeconds, direction }) {
        if (
            typeof presetId !== "string" ||
            !Number.isFinite(density) ||
            density <= 0 ||
            !Number.isFinite(intervalSeconds) ||
            intervalSeconds <= 0 ||
            typeof direction !== "function"
        ) {
            throw new Error(
                "ContinuityWardenRangeFeedbackDefinition requires presetId, density, intervalSeconds and direction"
            );
        }
        this.presetId = presetId;
        this.density = density;
        this.intervalSeconds = intervalSeconds;
        this.direction = direction;
        Object.freeze(this);
    }

    request(object) {
        return Object.freeze({
            id: CONTINUITY_WARDEN_COMBAT_VFX_KEY.activeRange(object.id, object.variant),
            presetId: this.presetId,
            position: object.position,
            direction: this.direction(object),
            options: Object.freeze({
                bounds: presentationBounds(object),
                density: this.density,
                intervalSeconds: this.intervalSeconds,
                priority: CONTINUITY_WARDEN_COMBAT_VFX_CONFIG.PRIORITY
            })
        });
    }
}

export const CONTINUITY_WARDEN_COMBAT_VFX = Object.freeze({
    MELEE: new ContinuityWardenRangeFeedbackDefinition({
        presetId: CLIENT_FEEDBACK_PRESET_ID.BOSS_WARDEN_MELEE_ACTIVE,
        density: CONTINUITY_WARDEN_COMBAT_VFX_CONFIG.MELEE_DENSITY,
        intervalSeconds: CONTINUITY_WARDEN_COMBAT_VFX_CONFIG.MELEE_INTERVAL_SECONDS,
        direction: meleeDirection
    }),
    BEAM: new ContinuityWardenRangeFeedbackDefinition({
        presetId: CLIENT_FEEDBACK_PRESET_ID.BOSS_WARDEN_BEAM_ACTIVE,
        density: CONTINUITY_WARDEN_COMBAT_VFX_CONFIG.BEAM_DENSITY,
        intervalSeconds: CONTINUITY_WARDEN_COMBAT_VFX_CONFIG.BEAM_INTERVAL_SECONDS,
        direction: () => CONTINUITY_WARDEN_COMBAT_VFX_CONFIG.BEAM_DIRECTION
    })
});
