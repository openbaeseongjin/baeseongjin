import { closestPointOnSurface } from "../world/WorldGenerator.js";
import { evaluateSwingDrag, getSwingDragThreshold } from "../rope/SwingDrag.js";
import { createInputCapabilityMixin } from "./InputCapability.js";

export function findRopeAttachment({ aimPoint, playerPosition, surfaces, maxAttachDistance }) {
    let best = null;
    let bestScore = Number.POSITIVE_INFINITY;
    for (const surface of surfaces) {
        const point = closestPointOnSurface(aimPoint, surface);
        const playerDistance = playerPosition.distanceTo(point);
        if (playerDistance > maxAttachDistance) continue;
        const aimDistance = Math.hypot(point.x - aimPoint.x, point.y - aimPoint.y);
        const score = aimDistance * 2 + playerDistance * 0.05;
        if (aimDistance <= 90 && score < bestScore) {
            best = point;
            bestScore = score;
        }
    }
    return best;
}

export function updateRopeSwingDrag({ ropeObject, owner, pointer, viewport, dt, config, onSwing, onFlash }) {
    if (!ropeObject.swingDrag || ropeObject.swingDrag.used || !ropeObject.rope.anchor) return;
    ropeObject.swingDrag.age += dt;
    const evaluation = evaluateSwingDrag({
        anchor: ropeObject.rope.anchor,
        playerPosition: owner.physics.position,
        drag: {
            x: pointer.x - ropeObject.swingDrag.origin.x,
            y: pointer.y - ropeObject.swingDrag.origin.y
        },
        threshold: getSwingDragThreshold(viewport, config.swingDragThresholdViewportRatio)
    });
    if (!evaluation) return;
    ropeObject.swingDrag.direction = evaluation.direction;
    ropeObject.swingDrag.progress = evaluation.progress;
    if (!evaluation.triggered || ropeObject.swingDrag.age < config.swingDragMinHoldSeconds) return;
    owner.physics.addImpulse(evaluation.direction, config.swingImpulse);
    onSwing();
    ropeObject.swingDrag.used = true;
    onFlash({ type: "swing", age: 0 });
}

export const withRopePointerInput = createInputCapabilityMixin({
    id: "rope-pointer",
    order: 10,
    apply(command, { canControl, dt, owner, ropeConfig, surfaces, onFlash, onSwing }) {
        this.lastPointer = command.pointer;
        this.lastViewport = command.viewport ?? this.lastViewport;
        this.aimWorld = command.aimWorld;
        this.attachmentCandidate = canControl
            ? findRopeAttachment({
                  aimPoint: this.aimWorld,
                  playerPosition: owner.physics.position,
                  surfaces,
                  maxAttachDistance: ropeConfig.maxAttachDistance
              })
            : null;
        if (command.pointer.down && !this.wasPointerDown) {
            this.attachBufferRemaining = ropeConfig.attachBufferSeconds;
        }
        if (
            command.pointer.down &&
            !this.rope.isAttached &&
            owner.ropeDisabledRemaining <= 0 &&
            this.attachBufferRemaining > 0 &&
            this.attachmentCandidate
        ) {
            if (this.rope.attach(owner.physics.position, this.attachmentCandidate)) {
                onFlash({ type: "attach", age: 0 });
                this.swingDrag = {
                    origin: { x: command.pointer.x, y: command.pointer.y },
                    direction: null,
                    progress: 0,
                    age: 0,
                    used: false
                };
                this.attachBufferRemaining = 0;
            }
        }
        if (command.pointer.down && this.rope.isAttached) {
            updateRopeSwingDrag({
                ropeObject: this,
                owner,
                pointer: command.pointer,
                viewport: command.viewport,
                dt,
                config: ropeConfig,
                onSwing,
                onFlash
            });
        }
        if (!command.pointer.down && this.wasPointerDown && this.rope.isAttached) {
            this.rope.detach();
            onFlash({ type: "release", age: 0 });
            this.swingDrag = null;
        }
        this.attachBufferRemaining = Math.max(0, this.attachBufferRemaining - dt);
        this.wasPointerDown = command.pointer.down;
    }
});
