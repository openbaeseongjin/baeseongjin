import { withRopePointerInput } from "../input/RopePointerInput.js";
import { InputDrivenObject } from "../objects/InputDrivenObject.js";
import { RopeLauncher } from "./RopeLauncher.js";
import { withRopeRenderSnapshot } from "./RopeRenderSnapshot.js";

export class RopeObject extends withRopeRenderSnapshot(withRopePointerInput(InputDrivenObject)) {
    constructor({ id, ownerId, rope }) {
        super({ id, ownerId });
        this.rope = rope;
        this.aimWorld = Object.freeze({ x: 0, y: 0 });
        this.attachmentCandidate = null;
        this.wasPointerDown = false;
        this.lastPointer = Object.freeze({ x: 0, y: 0, down: false });
        this.lastViewport = Object.freeze({ width: 1, height: 1 });
        this.attachBufferRemaining = 0;
        this.swingDrag = null;
        this.launcher = new RopeLauncher(rope.config);
    }
}
