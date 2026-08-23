import { evaluateSwingDrag, getSwingDragThreshold } from "../rope/SwingDrag.js";
import { releaseRopeFromBody, ropeAttachmentPoint, ropeLaunchHandPoint } from "../rope/RopeAttachment.js";
import { hookReach } from "../rope/RopeLauncher.js";
import { RopeAttachmentTargetResolver } from "../rope/RopeAttachmentTargetResolver.js";
import { createInputCapabilityMixin } from "./InputCapability.js";

export function findRopeAttachment({
    aimPoint,
    origin,
    surfaces,
    attachmentTargets = [],
    maxAttachDistance,
    aimTolerance = 90,
    canAttachToSurface = null
}) {
    if (!Number.isFinite(origin?.x) || !Number.isFinite(origin?.y)) return null;
    return new RopeAttachmentTargetResolver({
        aimPoint,
        origin,
        surfaces,
        attachmentTargets,
        maxAttachDistance,
        aimTolerance,
        canAttachToSurface
    }).resolve();
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
    owner.physics.applyImpulseAtLocalPoint(evaluation.direction, ropeObject.rope.attachmentOffset, config.swingImpulse);
    ropeObject.swingDrag.used = true;
    onSwing();
    onFlash({ type: "swing", age: 0 });
}

export function launchHandPosition(owner, ropeConfig, aimWorld) {
    return ropeLaunchHandPoint(owner.physics, ropeConfig.handOffset, aimWorld);
}

function launchAimDirection(owner, ropeConfig, aimWorld, candidate = null) {
    const origin = launchHandPosition(owner, ropeConfig, aimWorld);
    const target = candidate ?? aimWorld;
    return {
        origin,
        direction: { x: target.x - origin.x, y: target.y - origin.y }
    };
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
            attachmentTargets = [],
            surfaceCandidates = () => surfaces,
            resolveAttachmentTarget = () => null,
            getRopeInputModifiers = () => ({
                attachBufferSeconds: ropeConfig.attachBufferSeconds,
                aimTolerance: 90,
                relayActive: false
            }),
            canAttachToSurface = null,
            createAttachmentId = () => null,
            onAttach = () => {},
            onRelease = () => {},
            onSwing = () => {},
            onFlash
        }
    ) {
        const inputModifiers = getRopeInputModifiers();
        this.lastPointer = command.pointer;
        this.lastViewport = command.viewport ?? this.lastViewport;
        this.aimWorld = command.aimWorld;
        if (owner.ropeDisabledRemaining > 0 && this.launcher.inFlight) {
            this.launcher.clear();
        }
        const reach = hookReach(ropeConfig);
        const launchOrigin = launchHandPosition(owner, ropeConfig, this.aimWorld);
        this.attachmentCandidate =
            canControl && owner.ropeDisabledRemaining <= 0 && !this.launcher.inFlight && !this.rope.isAttached
                ? findRopeAttachment({
                      aimPoint: this.aimWorld,
                      origin: launchOrigin,
                      surfaces: surfaceCandidates({
                          origin: launchOrigin,
                          aimPoint: this.aimWorld,
                          maxAttachDistance: reach,
                          aimTolerance: inputModifiers.aimTolerance
                      }),
                      attachmentTargets,
                      maxAttachDistance: reach,
                      aimTolerance: inputModifiers.aimTolerance,
                      canAttachToSurface
                  })
                : null;

        if (command.pointer.down && !this.wasPointerDown) {
            this.attachBufferRemaining = inputModifiers.attachBufferSeconds;
        }

        if (this.launcher.inFlight) {
            if (!this.launcher.refreshAttachmentTarget(resolveAttachmentTarget)) {
                this.launcher.cancel();
            }
            const outcome = this.launcher.advance(dt);
            if (outcome?.status === "hit") {
                const attachment = outcome.target.ropeAttachment;
                if (
                    this.rope.attach(owner.physics.position, outcome.target, {
                        angle: owner.physics.angle,
                        anchorSurfaceId: outcome.target.surfaceId,
                        anchorOwnerId: attachment?.ownerId ?? null,
                        anchorLocalOffset: attachment?.localAnchor ?? null,
                        anchorVelocity: outcome.target.anchorVelocity,
                        attachmentId: createAttachmentId()
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
                    onAttach({
                        relayAssisted: inputModifiers.relayActive,
                        surfaceId: outcome.target.surfaceId,
                        position: Object.freeze({ x: outcome.target.x, y: outcome.target.y }),
                        attachmentId: this.rope.attachmentId
                    });
                } else {
                    this.launcher.startLaunchReload();
                }
            }
        }

        if (
            command.pointer.down &&
            !this.rope.isAttached &&
            owner.ropeDisabledRemaining <= 0 &&
            this.launcher.cooldownRemaining <= 0 &&
            this.attachBufferRemaining > 0 &&
            !this.launcher.inFlight
        ) {
            const { origin, direction } = launchAimDirection(
                owner,
                ropeConfig,
                this.aimWorld,
                this.attachmentCandidate
            );
            if (this.launcher.launch(origin, direction, this.attachmentCandidate)) {
                this.attachBufferRemaining = 0;
            }
        }

        if (!command.pointer.down && this.wasPointerDown && this.launcher.inFlight) {
            this.launcher.cancel();
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
            this.launcher.startReleaseReload();
        }
        this.launcher.update(dt);
        if (this.launcher.cooldownRemaining <= 0) {
            this.attachBufferRemaining = Math.max(0, this.attachBufferRemaining - dt);
        }
        this.wasPointerDown = command.pointer.down;
    }
});
