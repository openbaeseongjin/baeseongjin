import assert from "node:assert/strict";
import { findMobileControl, getMobileControlLayout } from "../src/core/input/MobileControlLayout.js";

export function run() {
    const layout = getMobileControlLayout(1000, 640);
    assert.equal(layout.left.width, layout.left.height);
    assert.equal(layout.jump.height, layout.left.height, "the jump target must not consume more vertical space");
    assert.ok(layout.jump.width > layout.jump.height, "the jump target must be wide like a space bar");
    assert.equal(layout.jump.width, 400, "the jump target must occupy 40% of the screen width");
    assert.equal(layout.jump.x + layout.jump.width * 0.5, 500, "the larger jump target must remain centered");
    assert.equal(
        layout.jump.y + layout.jump.height,
        layout.left.y + layout.left.height,
        "all controls must share the bottom edge"
    );
    const leftGap = layout.jump.x - (layout.left.x + layout.left.width);
    const rightGap = layout.right.x - (layout.jump.x + layout.jump.width);
    assert.ok(leftGap >= 4 && leftGap <= 8, "left and jump controls need only a small safety gap");
    assert.equal(rightGap, leftGap, "control gaps must remain symmetric");
    assert.equal(findMobileControl(250, 590, 1000, 640), "left");
    assert.equal(findMobileControl(500, 590, 1000, 640), "jump");
    assert.equal(findMobileControl(750, 590, 1000, 640), "right");
    assert.equal(findMobileControl(500, 300, 1000, 640), null, "the rope area must exclude only the three buttons");
}
