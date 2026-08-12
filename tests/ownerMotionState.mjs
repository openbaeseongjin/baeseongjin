import assert from "node:assert/strict";
import {
    createOwnerMotionState,
    deserializeOwnerMotionState,
    OWNER_MOTION_STATE_PROTOCOL_VERSION,
    serializeOwnerMotionState
} from "../src/game/network/OwnerMotionState.js";

export function run() {
    const motion = createOwnerMotionState({
        clientTick: 42,
        position: { x: 100, y: 200 },
        velocity: { x: 30, y: -20 },
        angle: 0.75,
        angularVelocity: -2.5,
        isGrounded: false,
        rope: {
            isAttached: true,
            anchor: { x: 160, y: 40 },
            attachmentOffset: { x: 12, y: -7 }
        }
    });
    assert.equal(OWNER_MOTION_STATE_PROTOCOL_VERSION, 2);
    assert.equal(motion.angle, 0.75);
    assert.equal(motion.angularVelocity, -2.5);
    assert.deepEqual(motion.rope.attachmentOffset, { x: 12, y: -7 });
    assert.deepEqual(deserializeOwnerMotionState(serializeOwnerMotionState(motion)), motion);
    assert.throws(
        () => createOwnerMotionState({ ...motion, rope: { ...motion.rope, attachmentOffset: null } }),
        /attachmentOffset/
    );
    assert.throws(() => createOwnerMotionState({ ...motion, angularVelocity: Infinity }), /angularVelocity/);
    assert.throws(() => deserializeOwnerMotionState('{"protocolVersion":1}'), /unsupported owner motion/);
}
