import { CONTINUITY_WARDEN_LOCOMOTION_STATE } from "../../game/boss/ContinuityWardenDefinition.js";

const WALK_STRIDE_PIXELS = 36;
const POSE_DEFINITION = Object.freeze({
    [CONTINUITY_WARDEN_LOCOMOTION_STATE.TAKEOFF]: Object.freeze({
        widthScale: 1.12,
        heightScale: 0.78,
        yScale: 0.1,
        rotationScale: 0
    }),
    [CONTINUITY_WARDEN_LOCOMOTION_STATE.JUMP]: Object.freeze({
        widthScale: 0.94,
        heightScale: 1.08,
        yScale: 0,
        rotationScale: 0.14
    }),
    [CONTINUITY_WARDEN_LOCOMOTION_STATE.FALL]: Object.freeze({
        widthScale: 1.04,
        heightScale: 0.96,
        yScale: 0,
        rotationScale: -0.1
    }),
    [CONTINUITY_WARDEN_LOCOMOTION_STATE.LANDING]: Object.freeze({
        widthScale: 1.18,
        heightScale: 0.72,
        yScale: 0.12,
        rotationScale: 0
    })
});

function direction(object) {
    if (typeof object.direction === "number") return object.direction < 0 ? -1 : 1;
    return object.direction === "left" ? -1 : 1;
}

export function resolveContinuityWardenPose(object, size) {
    if (object.locomotionState === CONTINUITY_WARDEN_LOCOMOTION_STATE.WALK) {
        const phase = ((object.movementProgress ?? 0) % WALK_STRIDE_PIXELS) / WALK_STRIDE_PIXELS;
        const radians = phase * Math.PI * 2;
        return Object.freeze({
            positionOffset: Object.freeze({ x: 0, y: -Math.abs(Math.sin(radians)) * 4 }),
            size: Object.freeze({ width: size.width, height: size.height }),
            rotation: direction(object) * Math.sin(radians) * 0.035,
            walkPhase: phase
        });
    }
    const definition = POSE_DEFINITION[object.locomotionState];
    if (!definition) {
        return Object.freeze({
            positionOffset: Object.freeze({ x: 0, y: 0 }),
            size: Object.freeze({ width: size.width, height: size.height }),
            rotation: 0,
            walkPhase: 0
        });
    }
    return Object.freeze({
        positionOffset: Object.freeze({ x: 0, y: size.height * definition.yScale }),
        size: Object.freeze({
            width: size.width * definition.widthScale,
            height: size.height * definition.heightScale
        }),
        rotation: direction(object) * definition.rotationScale,
        walkPhase: 0
    });
}
