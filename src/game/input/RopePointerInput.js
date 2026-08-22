import { closestPointOnSurface } from "../world/WorldGenerator.js";
import { segmentIntersectsSurface } from "../world/PolygonGeometry.js";
import { evaluateSwingDrag, getSwingDragThreshold } from "../rope/SwingDrag.js";
import { releaseRopeFromBody, ropeAttachmentPoint, ropeLaunchHandPoint } from "../rope/RopeAttachment.js";
import { hookReach } from "../rope/RopeLauncher.js";
import { createInputCapabilityMixin } from "./InputCapability.js";

export function findRopeAttachment({
    aimPoint,
    origin,
    surfaces,
    maxAttachDistance,
    aimTolerance = 90,
    canAttachToSurface = null
}) {
    if (!Number.isFinite(origin?.x) || !Number.isFinite(origin?.y)) return null;
    const sealedDividers = surfaces.filter((surface) => surface.kind === "inter-floor-divider");
    let best = null;
    let bestScore = Number.POSITIVE_INFINITY;
    for (const surface of surfaces) {
        if (surface.grappleable === false) continue;
        if (canAttachToSurface && canAttachToSurface(surface) === false) continue;
        const point = closestPointOnSurface(aimPoint, surface);
        const launchDistance = Math.hypot(point.x - origin.x, point.y - origin.y);
        if (launchDistance > maxAttachDistance) continue;
        if (sealedDividers.some((divider) => segmentIntersectsSurface(origin, point, divider))) continue;
        const aimDistance = Math.hypot(point.x - aimPoint.x, point.y - aimPoint.y);
        const score = aimDistance * 2 + launchDistance * 0.05;
        if (aimDistance <= aimTolerance && score < bestScore) {
            best = point;
            bestScore = score;
        }
    }
    return best;
}

export function updateRopeSwingDrag({ ropeObject, owner, pointer, viewport, dt, config, onFlash }) {
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
    ropeObject.swingDrag.used = true;
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
            getRopeInputModifiers = () => ({
                attachBufferSeconds: ropeConfig.attachBufferSeconds,
                aimTolerance: 90,
                relayActive: false
            }),
            canAttachToSurface = null,
            onAttach = () => {},
            onRelease = () => {},
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
                      surfaces,
                      maxAttachDistance: reach,
                      aimTolerance: inputModifiers.aimTolerance,
                      canAttachToSurface
                  })
                : null;

        if (command.pointer.down && !this.wasPointerDown) {
            this.attachBufferRemaining = inputModifiers.attachBufferSeconds;
        }

        if (this.launcher.inFlight) {
            const outcome = this.launcher.advance(dt);
            if (outcome?.status === "hit") {
                if (this.rope.attach(owner.physics.position, outcome.target, { angle: owner.physics.angle })) {
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
                } else {
                    this.launcher.startReload();
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
            this.launcher.startReload();
        }
        this.launcher.update(dt);
        if (this.launcher.cooldownRemaining <= 0) {
            this.attachBufferRemaining = Math.max(0, this.attachBufferRemaining - dt);
        }
        this.wasPointerDown = command.pointer.down;
    }
});
