import { MOBILE_GAMEPLAY_ACTION_ID } from "./MobileGameplayInputAdapter.js";
import { POINTER_SPELL_COMMAND_ORDER } from "./PointerSpellCommandBuffer.js";

export const MOBILE_CONTROL_ID = Object.freeze({
    LEFT: "left",
    JUMP: "jump",
    RIGHT: "right"
});

const MOBILE_MOVEMENT_CONTROL = Object.freeze({
    [MOBILE_CONTROL_ID.LEFT]: true,
    [MOBILE_CONTROL_ID.JUMP]: true,
    [MOBILE_CONTROL_ID.RIGHT]: true
});

const MOBILE_ACTION_CONTROL_ORDER = Object.freeze([MOBILE_GAMEPLAY_ACTION_ID.ROPE, ...POINTER_SPELL_COMMAND_ORDER]);

const CONTROL_ORDER = Object.freeze([
    MOBILE_CONTROL_ID.LEFT,
    MOBILE_CONTROL_ID.JUMP,
    MOBILE_CONTROL_ID.RIGHT,
    ...MOBILE_ACTION_CONTROL_ORDER
]);

export const MOBILE_CONTROL_LAYOUT_SPEC = Object.freeze({
    movementMinimumSize: 64,
    movementMaximumSize: 96,
    movementHeightRatio: 0.2,
    jumpWidthRatio: 0.4,
    minimumGap: 4,
    maximumGap: 8,
    gapWidthRatio: 0.008,
    minimumMargin: 10,
    maximumMargin: 18,
    marginHeightRatio: 0.025,
    actionMinimumSize: 44,
    actionMaximumSize: 58,
    actionHeightRatio: 0.13,
    actionGap: 6,
    actionBandGap: 10
});

function rect(x, y, width, height) {
    return Object.freeze({ x, y, width, height });
}

export function getMobileControlLayout(width, height) {
    const spec = MOBILE_CONTROL_LAYOUT_SPEC;
    const size = Math.max(
        spec.movementMinimumSize,
        Math.min(spec.movementMaximumSize, height * spec.movementHeightRatio)
    );
    const jumpWidth = width * spec.jumpWidthRatio;
    const controlGap = Math.max(spec.minimumGap, Math.min(spec.maximumGap, width * spec.gapWidthRatio));
    const margin = Math.max(spec.minimumMargin, Math.min(spec.maximumMargin, height * spec.marginHeightRatio));
    const y = height - size - margin;
    const jumpX = (width - jumpWidth) * 0.5;
    const actionSize = Math.max(
        spec.actionMinimumSize,
        Math.min(spec.actionMaximumSize, height * spec.actionHeightRatio)
    );
    const actionWidth =
        MOBILE_ACTION_CONTROL_ORDER.length * actionSize + (MOBILE_ACTION_CONTROL_ORDER.length - 1) * spec.actionGap;
    const actionX = (width - actionWidth) * 0.5;
    const actionY = y - actionSize - spec.actionBandGap;
    const actionControls = Object.freeze(
        Object.fromEntries(
            MOBILE_ACTION_CONTROL_ORDER.map((actionId, index) => [
                actionId,
                rect(actionX + index * (actionSize + spec.actionGap), actionY, actionSize, actionSize)
            ])
        )
    );
    const movementControls = Object.freeze({
        [MOBILE_CONTROL_ID.LEFT]: rect(jumpX - size - controlGap, y, size, size),
        [MOBILE_CONTROL_ID.JUMP]: rect(jumpX, y, jumpWidth, size),
        [MOBILE_CONTROL_ID.RIGHT]: rect(jumpX + jumpWidth + controlGap, y, size, size)
    });
    return Object.freeze({
        size,
        actionSize,
        left: movementControls[MOBILE_CONTROL_ID.LEFT],
        jump: movementControls[MOBILE_CONTROL_ID.JUMP],
        right: movementControls[MOBILE_CONTROL_ID.RIGHT],
        rope: actionControls[MOBILE_GAMEPLAY_ACTION_ID.ROPE],
        spellSlots: Object.freeze(
            Object.fromEntries(
                POINTER_SPELL_COMMAND_ORDER.map((commandKey) => [commandKey, actionControls[commandKey]])
            )
        ),
        controls: Object.freeze({ ...movementControls, ...actionControls })
    });
}

export function isMobileMovementControl(controlId) {
    return Boolean(MOBILE_MOVEMENT_CONTROL[controlId]);
}

export function findMobileControl(x, y, width, height) {
    const layout = getMobileControlLayout(width, height);
    return (
        CONTROL_ORDER.find((name) => {
            const bounds = layout.controls[name];
            return x >= bounds.x && x <= bounds.x + bounds.width && y >= bounds.y && y <= bounds.y + bounds.height;
        }) ?? null
    );
}
