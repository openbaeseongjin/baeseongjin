import { closestPointOnSurface } from "../world/WorldGenerator.js";
import { evaluateSwingDrag, getSwingDragThreshold } from "../rope/SwingDrag.js";
import { releaseRopeFromBody, ropeAttachmentPoint } from "../rope/RopeAttachment.js";
import { createInputCapabilityMixin } from "./InputCapability.js";

export function findRopeAttachment({ aimPoint, playerPosition, surfaces, maxAttachDistance, aimTolerance = 90 }) {
    let best = null;
    let bestScore = Number.POSITIVE_INFINITY;
    for (const surface of surfaces) {
        if (surface.grappleable === false) continue;
        const point = closestPointOnSurface(aimPoint, surface);
        const playerDistance = playerPosition.distanceTo(point);
        if (playerDistance > maxAttachDistance) continue;
        const aimDistance = Math.hypot(point.x - aimPoint.x, point.y - aimPoint.y);
        const score = aimDistance * 2 + playerDistance * 0.05;
        if (aimDistance <= aimTolerance && score < bestScore) {
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
        playerPosition: ropeAttachmentPoint(owner.physics, ropeObject.rope),
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
    owner.physics.addImpulseAtLocalPoint(evaluation.direction, config.swingImpulse, ropeObject.rope.attachmentOffset);
    onSwing();
    ropeObject.swingDrag.used = true;
    onFlash({ type: "swing", age: 0 });
}

export const withRopePointerInput = createInputCapabilityMixin({
    id: "rope-pointer",
    order: 10,
    apply(
        command,
        {
            canControl,
            dt,
            owner,
            ropeConfig,
            surfaces,
            getRopeInputModifiers = () => ({
                attachBufferSeconds: ropeConfig.attachBufferSeconds,
                aimTolerance: 90,
                relayActive: false
            }),
            onAttach = () => {},
            onRelease = () => {},
            onFlash,
            onSwing
        }
    ) {
        const inputModifiers = getRopeInputModifiers();
        this.lastPointer = command.pointer;
        this.lastViewport = command.viewport ?? this.lastViewport;
        this.aimWorld = command.aimWorld;
        this.attachmentCandidate = canControl
            ? findRopeAttachment({
                  aimPoint: this.aimWorld,
                  playerPosition: owner.physics.position,
                  surfaces,
                  maxAttachDistance: ropeConfig.maxAttachDistance,
                  aimTolerance: inputModifiers.aimTolerance
              })
            : null;
        if (command.pointer.down && !this.wasPointerDown) {
            this.attachBufferRemaining = inputModifiers.attachBufferSeconds;
        }
        if (
            command.pointer.down &&
            !this.rope.isAttached &&
            owner.ropeDisabledRemaining <= 0 &&
            this.attachBufferRemaining > 0 &&
            this.attachmentCandidate
        ) {
            if (
                this.rope.attach(owner.physics.position, this.attachmentCandidate, {
                    angle: owner.physics.angle
                })
            ) {
                onFlash({ type: "attach", age: 0 });
                this.swingDrag = {
                    origin: { x: command.pointer.x, y: command.pointer.y },
                    direction: null,
                    progress: 0,
                    age: 0,
                    used: false
                };
                this.attachBufferRemaining = 0;
                onAttach({ relayAssisted: inputModifiers.relayActive });
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
            const release = {
                anchor: { x: this.rope.anchor.x, y: this.rope.anchor.y },
                playerPosition: ropeAttachmentPoint(owner.physics, this.rope),
                swingDrag: this.swingDrag
                    ? {
                          ...this.swingDrag,
                          direction: this.swingDrag.direction ? { ...this.swingDrag.direction } : null
                      }
                    : null
            };
            releaseRopeFromBody(owner.physics, this.rope);
            onRelease(release);
            onFlash({ type: "release", age: 0 });
            this.swingDrag = null;
        }
        this.attachBufferRemaining = Math.max(0, this.attachBufferRemaining - dt);
        this.wasPointerDown = command.pointer.down;
    }
});
