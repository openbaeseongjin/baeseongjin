const movementKeys = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "KeyA", "KeyD", "KeyW", "KeyS"]);
export class InputSampler {
    constructor(target = globalThis.window, surface = target) {
        this.target = target;
        this.surface = surface;
        this.keys = new Set();
        this.pointer = { x: 0, y: 0, down: false };
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
            if (this.ropePointerId === null) {
                this.surface?.setPointerCapture?.(event.pointerId);
                this.ropePointerId = event.pointerId;
                this.pointer = { x: event.clientX, y: event.clientY, down: true };
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
        if (this.ropePointerId === event.pointerId) {
            this.pointer.x = event.clientX;
            this.pointer.y = event.clientY;
        }
    }

    releasePointer(pointerId, pointerType) {
        if (pointerType !== "touch") {
            this.pointer.down = false;
            return;
        }
        if (this.ropePointerId === pointerId) {
            this.ropePointerId = null;
            this.pointer.down = false;
        }
    }

    clearTransientInput() {
        this.keys.clear();
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

    snapshot() {
        const keyboardHorizontal =
            Number(this.keys.has("ArrowRight") || this.keys.has("KeyD")) -
            Number(this.keys.has("ArrowLeft") || this.keys.has("KeyA"));
        const keyboardVertical =
            Number(this.keys.has("ArrowDown") || this.keys.has("KeyS")) -
            Number(this.keys.has("ArrowUp") || this.keys.has("KeyW"));
        const mobileControls = Object.freeze({
            visible: this.touchActive,
            ropePointerDown: this.ropePointerId !== null
        });
        return Object.freeze({
            horizontal: keyboardHorizontal,
            vertical: keyboardVertical,
            pointer: Object.freeze({ ...this.pointer }),
            viewport: Object.freeze({ width: this.viewportWidth(), height: this.viewportHeight() }),
            mobileControls
        });
    }
}
