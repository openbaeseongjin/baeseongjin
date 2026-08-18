import { findMobileControl } from "./MobileControlLayout.js";

const movementKeys = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "KeyA", "KeyD", "KeyW", "KeyS"]);
export class InputSampler {
    constructor(target = globalThis.window, surface = target, { onRopeRelease = () => {} } = {}) {
        this.target = target;
        this.surface = surface;
        this.documentTarget = target?.document ?? globalThis.document;
        this.onRopeRelease = onRopeRelease;
        this.keys = new Set();
        this.pointer = { x: 0, y: 0, down: false };
        this.actionDown = false;
        this.ropePointerId = null;
        this.actionPointerId = null;
        this.mobileAimMode = "rope";
        this.controlPointers = new Map();
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
                if (event.button === 2) {
                    event.preventDefault?.();
                    this.pointer.x = event.clientX ?? this.pointer.x;
                    this.pointer.y = event.clientY ?? this.pointer.y;
                    this.actionDown = true;
                    return;
                }
                this.pointer = { x: event.clientX ?? this.pointer.x, y: event.clientY ?? this.pointer.y, down: true };
                return;
            }
            event.preventDefault?.();
            this.touchActive = true;
            const point = this.surfacePoint(event);
            const control = findMobileControl(point.x, point.y, this.viewportWidth(), this.viewportHeight());
            if (control) {
                this.surface?.setPointerCapture?.(event.pointerId);
                if (control === "action") {
                    if (this.ropePointerId === null && this.actionPointerId === null) {
                        this.mobileAimMode = this.mobileAimMode === "rope" ? "action" : "rope";
                    }
                    this.controlPointers.set(event.pointerId, "action-toggle");
                } else {
                    this.controlPointers.set(event.pointerId, control);
                }
                return;
            }
            if (this.mobileAimMode === "action" && this.actionPointerId === null) {
                this.surface?.setPointerCapture?.(event.pointerId);
                this.actionPointerId = event.pointerId;
                this.pointer = { x: event.clientX, y: event.clientY, down: false };
                this.actionDown = true;
                return;
            }
            if (this.ropePointerId === null) {
                this.surface?.setPointerCapture?.(event.pointerId);
                this.ropePointerId = event.pointerId;
                this.pointer = { x: event.clientX, y: event.clientY, down: true };
            }
        };
        this.onPointerUp = (event) => {
            if (event.pointerType !== "touch" && event.button === 2) {
                this.actionDown = false;
                return;
            }
            this.releasePointer(event.pointerId, event.pointerType, "pointerup");
        };
        this.onPointerCancel = (event) => this.releasePointer(event.pointerId, event.pointerType, "pointercancel");
        this.onPointerLeave = (event) => {
            if (event.pointerType !== "touch" && event.relatedTarget === null) {
                this.actionDown = false;
                this.releasePointer(event.pointerId, event.pointerType, "pointer-leave");
            }
        };
        this.onInterrupted = () => this.clearTransientInput("blur");
        this.onContextMenu = (event) => event.preventDefault?.();
        this.onVisibilityChange = () => {
            if (this.documentTarget?.hidden) this.clearTransientInput("visibility-hidden");
        };
    }

    viewportWidth() {
        return this.surface?.clientWidth || this.target?.innerWidth || 1;
    }

    viewportHeight() {
        return this.surface?.clientHeight || this.target?.innerHeight || 1;
    }

    surfacePoint(event) {
        const rect = this.surface?.getBoundingClientRect?.() ?? { left: 0, top: 0 };
        return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }

    updateTouchPointer(event) {
        if (this.ropePointerId === event.pointerId || this.actionPointerId === event.pointerId) {
            this.pointer.x = event.clientX;
            this.pointer.y = event.clientY;
        }
    }

    releasePointer(pointerId, pointerType, reason) {
        if (pointerType !== "touch") {
            const releasedRope = this.pointer.down;
            this.pointer.down = false;
            if (releasedRope) this.notifyRopeRelease(reason);
            return;
        }
        if (this.controlPointers.delete(pointerId)) return;
        if (this.actionPointerId === pointerId) {
            this.actionPointerId = null;
            this.actionDown = false;
            return;
        }
        if (this.ropePointerId === pointerId) {
            this.ropePointerId = null;
            this.pointer.down = false;
            this.notifyRopeRelease(reason);
        }
    }

    clearTransientInput(reason = null) {
        const releasedRope = this.pointer.down || this.ropePointerId !== null;
        this.keys.clear();
        this.ropePointerId = null;
        this.actionPointerId = null;
        this.controlPointers.clear();
        this.actionDown = false;
        this.pointer.down = false;
        if (releasedRope && reason) this.notifyRopeRelease(reason);
    }

    notifyRopeRelease(reason) {
        this.onRopeRelease(this.snapshot(), reason);
    }

    attach() {
        if (this.attached || !this.target?.addEventListener || !this.surface?.addEventListener) return;
        this.target.addEventListener("keydown", this.onKeyDown);
        this.target.addEventListener("keyup", this.onKeyUp);
        this.target.addEventListener("blur", this.onInterrupted);
        this.documentTarget?.addEventListener?.("visibilitychange", this.onVisibilityChange);
        this.surface.addEventListener("pointermove", this.onPointerMove);
        this.surface.addEventListener("pointerdown", this.onPointerDown);
        this.surface.addEventListener("pointerup", this.onPointerUp);
        this.surface.addEventListener("pointercancel", this.onPointerCancel);
        this.surface.addEventListener("pointerleave", this.onPointerLeave);
        this.surface.addEventListener("contextmenu", this.onContextMenu);
        this.attached = true;
    }

    detach() {
        if (!this.attached) return;
        this.target.removeEventListener("keydown", this.onKeyDown);
        this.target.removeEventListener("keyup", this.onKeyUp);
        this.target.removeEventListener("blur", this.onInterrupted);
        this.documentTarget?.removeEventListener?.("visibilitychange", this.onVisibilityChange);
        this.surface.removeEventListener("pointermove", this.onPointerMove);
        this.surface.removeEventListener("pointerdown", this.onPointerDown);
        this.surface.removeEventListener("pointerup", this.onPointerUp);
        this.surface.removeEventListener("pointercancel", this.onPointerCancel);
        this.surface.removeEventListener("pointerleave", this.onPointerLeave);
        this.surface.removeEventListener("contextmenu", this.onContextMenu);
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
        const mobileLeft = [...this.controlPointers.values()].includes("left");
        const mobileRight = [...this.controlPointers.values()].includes("right");
        const mobileJump = [...this.controlPointers.values()].includes("jump");
        const mobileControls = Object.freeze({
            visible: this.touchActive,
            ropePointerDown: this.ropePointerId !== null,
            actionPointerDown: this.actionPointerId !== null,
            aimMode: this.mobileAimMode,
            left: mobileLeft,
            right: mobileRight,
            jump: mobileJump,
            action: this.mobileAimMode === "action"
        });
        return Object.freeze({
            horizontal: Math.max(-1, Math.min(1, keyboardHorizontal + Number(mobileRight) - Number(mobileLeft))),
            vertical: Math.max(-1, Math.min(1, keyboardVertical - Number(mobileJump))),
            interact: keyboardVertical < 0 || mobileJump,
            action: this.actionDown,
            pointer: Object.freeze({ ...this.pointer }),
            viewport: Object.freeze({ width: this.viewportWidth(), height: this.viewportHeight() }),
            mobileControls
        });
    }
}
