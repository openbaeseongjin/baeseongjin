const movementKeys = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "KeyA", "KeyD", "KeyW", "KeyS"]);
const MOVE_ZONE_RATIO = 0.42;
const JOYSTICK_RADIUS = 64;
const JOYSTICK_DEAD_ZONE = 12;
const ROPE_AIM_OFFSET_Y = 48;

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

export class InputSampler {
    constructor(target = globalThis.window, surface = target) {
        this.target = target;
        this.surface = surface;
        this.keys = new Set();
        this.pointer = { x: 0, y: 0, down: false };
        this.movePointer = null;
        this.ropePointerId = null;
        this.touchActive = false;
        this.attached = false;
        this.onKeyDown = (event) => {
            if (movementKeys.has(event.code)) this.keys.add(event.code);
        };
        this.onKeyUp = (event) => this.keys.delete(event.code);
        this.onPointerMove = (event) => {
            if (event.pointerType === "touch") {
                this.updateTouchPointer(event);
                return;
            }
            this.pointer.x = event.clientX;
            this.pointer.y = event.clientY;
        };
        this.onPointerDown = (event) => {
            if (event.pointerType !== "touch") {
                this.pointer = { x: event.clientX ?? this.pointer.x, y: event.clientY ?? this.pointer.y, down: true };
                return;
            }
            event.preventDefault?.();
            this.touchActive = true;
            this.surface?.setPointerCapture?.(event.pointerId);
            if (event.clientX <= this.viewportWidth() * MOVE_ZONE_RATIO && this.movePointer === null) {
                this.movePointer = {
                    id: event.pointerId,
                    originX: event.clientX,
                    originY: event.clientY,
                    x: event.clientX,
                    y: event.clientY
                };
                return;
            }
            if (this.ropePointerId === null) {
                this.ropePointerId = event.pointerId;
                this.pointer = { x: event.clientX, y: event.clientY - ROPE_AIM_OFFSET_Y, down: true };
            }
        };
        this.onPointerUp = (event) => this.releasePointer(event.pointerId, event.pointerType);
        this.onPointerCancel = (event) => this.releasePointer(event.pointerId, event.pointerType);
        this.onInterrupted = () => this.clearTransientInput();
    }

    viewportWidth() {
        return this.surface?.clientWidth || this.target?.innerWidth || 1;
    }

    viewportHeight() {
        return this.surface?.clientHeight || this.target?.innerHeight || 1;
    }

    updateTouchPointer(event) {
        if (this.movePointer?.id === event.pointerId) {
            this.movePointer.x = event.clientX;
            this.movePointer.y = event.clientY;
        }
        if (this.ropePointerId === event.pointerId) {
            this.pointer.x = event.clientX;
            this.pointer.y = event.clientY - ROPE_AIM_OFFSET_Y;
        }
    }

    releasePointer(pointerId, pointerType) {
        if (pointerType !== "touch") {
            this.pointer.down = false;
            return;
        }
        if (this.movePointer?.id === pointerId) this.movePointer = null;
        if (this.ropePointerId === pointerId) {
            this.ropePointerId = null;
            this.pointer.down = false;
        }
    }

    clearTransientInput() {
        this.keys.clear();
        this.movePointer = null;
        this.ropePointerId = null;
        this.pointer.down = false;
    }

    attach() {
        if (this.attached || !this.target?.addEventListener || !this.surface?.addEventListener) return;
        this.target.addEventListener("keydown", this.onKeyDown);
        this.target.addEventListener("keyup", this.onKeyUp);
        this.target.addEventListener("blur", this.onInterrupted);
        this.surface.addEventListener("pointermove", this.onPointerMove);
        this.surface.addEventListener("pointerdown", this.onPointerDown);
        this.surface.addEventListener("pointerup", this.onPointerUp);
        this.surface.addEventListener("pointercancel", this.onPointerCancel);
        this.attached = true;
    }

    detach() {
        if (!this.attached) return;
        this.target.removeEventListener("keydown", this.onKeyDown);
        this.target.removeEventListener("keyup", this.onKeyUp);
        this.target.removeEventListener("blur", this.onInterrupted);
        this.surface.removeEventListener("pointermove", this.onPointerMove);
        this.surface.removeEventListener("pointerdown", this.onPointerDown);
        this.surface.removeEventListener("pointerup", this.onPointerUp);
        this.surface.removeEventListener("pointercancel", this.onPointerCancel);
        this.clearTransientInput();
        this.attached = false;
    }

    touchMovement() {
        if (!this.movePointer) return { horizontal: 0, vertical: 0 };
        const dx = this.movePointer.x - this.movePointer.originX;
        const dy = this.movePointer.y - this.movePointer.originY;
        return {
            horizontal: Math.abs(dx) <= JOYSTICK_DEAD_ZONE ? 0 : clamp(dx / JOYSTICK_RADIUS, -1, 1),
            vertical: Math.abs(dy) <= JOYSTICK_DEAD_ZONE ? 0 : clamp(dy / JOYSTICK_RADIUS, -1, 1)
        };
    }

    snapshot() {
        const touch = this.touchMovement();
        const keyboardHorizontal =
            Number(this.keys.has("ArrowRight") || this.keys.has("KeyD")) -
            Number(this.keys.has("ArrowLeft") || this.keys.has("KeyA"));
        const keyboardVertical =
            Number(this.keys.has("ArrowDown") || this.keys.has("KeyS")) -
            Number(this.keys.has("ArrowUp") || this.keys.has("KeyW"));
        const mobileControls = Object.freeze({
            visible: this.touchActive,
            joystick: this.movePointer ? Object.freeze({ ...this.movePointer }) : null,
            ropePointerDown: this.ropePointerId !== null
        });
        return Object.freeze({
            horizontal: touch.horizontal || keyboardHorizontal,
            vertical: touch.vertical || keyboardVertical,
            pointer: Object.freeze({ ...this.pointer }),
            viewport: Object.freeze({ width: this.viewportWidth(), height: this.viewportHeight() }),
            mobileControls
        });
    }
}
