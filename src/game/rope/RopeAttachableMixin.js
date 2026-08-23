import { rotateVector } from "../physics/AngularMotion.js";

const ZERO = Object.freeze({ x: 0, y: 0 });

function finiteVector(value, label) {
    if (!Number.isFinite(value?.x) || !Number.isFinite(value?.y)) {
        throw new TypeError(`${label} requires finite x and y`);
    }
    return Object.freeze({ x: value.x, y: value.y });
}

function attachmentConfig(value) {
    if (value === undefined || value === null || value === false) return null;
    if (value === true) return Object.freeze({ localAnchor: ZERO });
    if (typeof value !== "object" || Array.isArray(value)) {
        throw new TypeError("ropeAttachment must be true, false, or an object");
    }
    return Object.freeze({ localAnchor: finiteVector(value.localAnchor ?? ZERO, "ropeAttachment.localAnchor") });
}

export function ropeAttachmentSnapshot({ ownerId, position, angle = 0, localAnchor = ZERO, worldOffset = ZERO }) {
    if (typeof ownerId !== "string" || !ownerId) throw new TypeError("rope attachment ownerId must be non-empty");
    finiteVector(position, "rope attachment position");
    finiteVector(localAnchor, "rope attachment localAnchor");
    finiteVector(worldOffset, "rope attachment worldOffset");
    if (!Number.isFinite(angle)) throw new TypeError("rope attachment angle must be finite");
    const rotatedAnchor = rotateVector(localAnchor, angle);
    return Object.freeze({
        ownerId,
        localAnchor: Object.freeze({ x: localAnchor.x, y: localAnchor.y }),
        position: Object.freeze({
            x: position.x + rotatedAnchor.x + worldOffset.x,
            y: position.y + rotatedAnchor.y + worldOffset.y
        })
    });
}

export const withRopeAttachable = (Base) =>
    class extends Base {
        initializeRopeAttachable(config = false) {
            this.ropeAttachment = attachmentConfig(config);
        }

        setRopeAttachment(config = false) {
            this.ropeAttachment = attachmentConfig(config);
            return this.ropeAttachment;
        }

        ropeAttachmentSnapshot(worldOffset = ZERO) {
            if (!this.ropeAttachment) return null;
            return ropeAttachmentSnapshot({
                ownerId: this.id,
                position: this.position,
                angle: this.angle ?? 0,
                localAnchor: this.ropeAttachment.localAnchor,
                worldOffset
            });
        }
    };
