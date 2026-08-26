import { findMobileControl, isMobileMovementControl, MOBILE_CONTROL_ID } from "./MobileControlLayout.js";
import { MobileGameplayInputAdapter, MOBILE_GAMEPLAY_ACTION_ID } from "./MobileGameplayInputAdapter.js";
import { SPELL_SLOT_COMMAND_BY_KEY_CODE, SpellSlotCommandInput } from "./SpellSlotCommandInput.js";

const movementKeys = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "KeyA", "KeyD", "KeyW", "KeyS"]);
const gameplayKeys = new Set([...movementKeys, ...Object.keys(SPELL_SLOT_COMMAND_BY_KEY_CODE)]);
export class InputSampler {
    constructor(target = globalThis.window, surface = target, { onRopeRelease = () => {} } = {}) {
        this.target = target;
        this.surface = surface;
        this.documentTarget = target?.document ?? globalThis.document;
        this.onRopeRelease = onRopeRelease;
        this.keys = new Set();
        this.pointer = { x: 0, y: 0, down: false };
        this.spellSlotCommands = new SpellSlotCommandInput();
        this.mobileGameplayInput = new MobileGameplayInputAdapter();
        this.ropePointerId = null;
        this.controlPointers = new Map();
        this.interactSequence = 0;
        this.touchActive = false;
        this.attached = false;
        this.suspended = false;
        this.onKeyDown = (event) => {
            if (this.suspended) return;
            const alreadyHeld = this.keys.has(event.code);
            if (gameplayKeys.has(event.code)) this.keys.add(event.code);
            if (!alreadyHeld && (event.code === "KeyW" || event.code === "ArrowUp")) {
                this.interactSequence += 1;
            }
            const spellCommandKey = SPELL_SLOT_COMMAND_BY_KEY_CODE[event.code];
            if (!alreadyHeld && spellCommandKey) {
                event.preventDefault?.();
                this.spellSlotCommands.issue(spellCommandKey);
            }
        };
        this.onKeyUp = (event) => {
            if (!this.suspended) this.keys.delete(event.code);
        };
        this.onPointerMove = (event) => {
            if (this.suspended) return;
            if (event.pointerType === "touch") {
                this.updateTouchPointer(event);
                return;
            }
            this.pointer.x = event.clientX;
            this.pointer.y = event.clientY;
        };
        this.onPointerDown = (event) => {
            if (this.suspended) return;
            if (event.pointerType !== "touch") {
                if (event.button === 2) {
                    event.preventDefault?.();
                    this.pointer.x = event.clientX ?? this.pointer.x;
                    this.pointer.y = event.clientY ?? this.pointer.y;
                    if (this.pointer.down) {
                        this.pointer.down = false;
                        this.notifyRopeRelease("secondary-pointer-release");
                    }
                    return;
                }
                this.pointer = { x: event.clientX ?? this.pointer.x, y: event.clientY ?? this.pointer.y, down: true };
                return;
            }
            event.preventDefault?.();
            this.touchActive = true;
            const point = this.surfacePoint(event);
            const control = findMobileControl(point.x, point.y, this.viewportWidth(), this.viewportHeight());
            if (isMobileMovementControl(control)) {
                this.surface?.setPointerCapture?.(event.pointerId);
                this.controlPointers.set(event.pointerId, control);
                if (control === MOBILE_CONTROL_ID.JUMP) this.interactSequence += 1;
                return;
            }
            if (control) return this.selectMobileGameplayAction(control);
            const spellCommandKey = this.mobileGameplayInput.consumeSpellTarget();
            if (spellCommandKey) {
                this.pointer = { x: event.clientX, y: event.clientY, down: false };
                this.spellSlotCommands.issue(spellCommandKey);
                return;
            }
            if (this.ropePointerId === null) {
                this.surface?.setPointerCapture?.(event.pointerId);
                this.ropePointerId = event.pointerId;
                this.pointer = { x: event.clientX, y: event.clientY, down: true };
            }
        };
        this.onPointerUp = (event) => {
            if (this.suspended) return;
            if (event.pointerType !== "touch" && event.button === 2) {
                return;
            }
            this.releasePointer(event.pointerId, event.pointerType, "pointerup");
        };
        this.onPointerCancel = (event) => {
            if (!this.suspended) this.releasePointer(event.pointerId, event.pointerType, "pointercancel");
        };
        this.onPointerLeave = (event) => {
            if (this.suspended) return;
            if (event.pointerType !== "touch" && event.relatedTarget === null) {
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
        if (this.ropePointerId === event.pointerId) {
            this.pointer.x = event.clientX;
            this.pointer.y = event.clientY;
        }
    }

    selectMobileGameplayAction(actionId) {
        if (actionId === MOBILE_GAMEPLAY_ACTION_ID.ROPE) {
            this.mobileGameplayInput.reset();
            return;
        }
        const releasedRope = this.pointer.down || this.ropePointerId !== null;
        if (this.ropePointerId !== null) this.surface?.releasePointerCapture?.(this.ropePointerId);
        this.ropePointerId = null;
        this.pointer.down = false;
        this.mobileGameplayInput.select(actionId);
        if (releasedRope) this.notifyRopeRelease("mobile-spell-selection");
    }

    releasePointer(pointerId, pointerType, reason) {
        if (pointerType !== "touch") {
            const releasedRope = this.pointer.down;
            this.pointer.down = false;
            if (releasedRope) this.notifyRopeRelease(reason);
            return;
        }
        if (this.controlPointers.delete(pointerId)) return;
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
        this.controlPointers.clear();
        this.pointer.down = false;
        this.mobileGameplayInput.reset();
        this.spellSlotCommands.clear();
        if (releasedRope && reason) this.notifyRopeRelease(reason);
    }

    notifyRopeRelease(reason) {
        this.onRopeRelease(this.snapshot({ consumeSpellCommand: reason !== "pointerup" }), reason);
    }

    setSuspended(suspended, reason = "input-suspended") {
        const next = Boolean(suspended);
        if (this.suspended === next) return false;
        if (next) this.clearTransientInput(reason);
        this.suspended = next;
        return true;
    }

    attach() {
        if (this.attached || !this.target?.addEventListener || !this.surface?.addEventListener) return;
        this.target.addEventListener("keydown", this.onKeyDown);
        this.target.addEventListener("keyup", this.onKeyUp);
        this.target.addEventListener("blur", this.onInterrupted);
        this.target.addEventListener("pointerup", this.onPointerUp, true);
        this.target.addEventListener("pointercancel", this.onPointerCancel, true);
        this.documentTarget?.addEventListener?.("visibilitychange", this.onVisibilityChange);
        this.surface.addEventListener("pointermove", this.onPointerMove);
        this.surface.addEventListener("pointerdown", this.onPointerDown);
        this.surface.addEventListener("pointerleave", this.onPointerLeave);
        this.surface.addEventListener("contextmenu", this.onContextMenu);
        this.attached = true;
    }

    detach() {
        if (!this.attached) return;
        this.target.removeEventListener("keydown", this.onKeyDown);
        this.target.removeEventListener("keyup", this.onKeyUp);
        this.target.removeEventListener("blur", this.onInterrupted);
        this.target.removeEventListener("pointerup", this.onPointerUp, true);
        this.target.removeEventListener("pointercancel", this.onPointerCancel, true);
        this.documentTarget?.removeEventListener?.("visibilitychange", this.onVisibilityChange);
        this.surface.removeEventListener("pointermove", this.onPointerMove);
        this.surface.removeEventListener("pointerdown", this.onPointerDown);
        this.surface.removeEventListener("pointerleave", this.onPointerLeave);
        this.surface.removeEventListener("contextmenu", this.onContextMenu);
        this.clearTransientInput();
        this.suspended = false;
        this.attached = false;
    }

    snapshot({ consumeSpellCommand = true } = {}) {
        const spellCommand = consumeSpellCommand ? this.spellSlotCommands.consume() : this.spellSlotCommands.snapshot();
        const keyboardHorizontal =
            Number(this.keys.has("ArrowRight") || this.keys.has("KeyD")) -
            Number(this.keys.has("ArrowLeft") || this.keys.has("KeyA"));
        const keyboardVertical =
            Number(this.keys.has("ArrowDown") || this.keys.has("KeyS")) -
            Number(this.keys.has("ArrowUp") || this.keys.has("KeyW"));
        const mobileLeft = [...this.controlPointers.values()].includes(MOBILE_CONTROL_ID.LEFT);
        const mobileRight = [...this.controlPointers.values()].includes(MOBILE_CONTROL_ID.RIGHT);
        const mobileJump = [...this.controlPointers.values()].includes(MOBILE_CONTROL_ID.JUMP);
        const mobileGameplay = this.mobileGameplayInput.snapshot();
        const mobileControls = Object.freeze({
            visible: this.touchActive,
            ropePointerDown: this.ropePointerId !== null,
            left: mobileLeft,
            right: mobileRight,
            jump: mobileJump,
            selectedActionId: mobileGameplay.selectedActionId
        });
        return Object.freeze({
            horizontal: Math.max(-1, Math.min(1, keyboardHorizontal + Number(mobileRight) - Number(mobileLeft))),
            vertical: Math.max(-1, Math.min(1, keyboardVertical - Number(mobileJump))),
            interact: keyboardVertical < 0 || mobileJump,
            interactSequence: this.interactSequence,
            spellCommand,
            pointer: Object.freeze({ ...this.pointer }),
            viewport: Object.freeze({ width: this.viewportWidth(), height: this.viewportHeight() }),
            mobileControls
        });
    }
}
