const movementKeys = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "KeyA", "KeyD", "KeyW", "KeyS"]);

export class InputSampler {
    constructor(target = globalThis.window) {
        this.target = target;
        this.keys = new Set();
        this.pointer = { x: 0, y: 0, down: false };
        this.attached = false;
        this.onKeyDown = (event) => {
            if (movementKeys.has(event.code)) this.keys.add(event.code);
        };
        this.onKeyUp = (event) => this.keys.delete(event.code);
        this.onPointerMove = (event) => {
            this.pointer.x = event.clientX;
            this.pointer.y = event.clientY;
        };
        this.onPointerDown = () => {
            this.pointer.down = true;
        };
        this.onPointerUp = () => {
            this.pointer.down = false;
        };
    }

    attach() {
        if (this.attached || !this.target?.addEventListener) return;
        this.target.addEventListener("keydown", this.onKeyDown);
        this.target.addEventListener("keyup", this.onKeyUp);
        this.target.addEventListener("pointermove", this.onPointerMove);
        this.target.addEventListener("pointerdown", this.onPointerDown);
        this.target.addEventListener("pointerup", this.onPointerUp);
        this.attached = true;
    }

    detach() {
        if (!this.attached) return;
        this.target.removeEventListener("keydown", this.onKeyDown);
        this.target.removeEventListener("keyup", this.onKeyUp);
        this.target.removeEventListener("pointermove", this.onPointerMove);
        this.target.removeEventListener("pointerdown", this.onPointerDown);
        this.target.removeEventListener("pointerup", this.onPointerUp);
        this.keys.clear();
        this.attached = false;
    }

    snapshot() {
        const horizontal =
            Number(this.keys.has("ArrowRight") || this.keys.has("KeyD")) -
            Number(this.keys.has("ArrowLeft") || this.keys.has("KeyA"));
        const vertical =
            Number(this.keys.has("ArrowDown") || this.keys.has("KeyS")) -
            Number(this.keys.has("ArrowUp") || this.keys.has("KeyW"));
        return Object.freeze({ horizontal, vertical, pointer: Object.freeze({ ...this.pointer }) });
    }
}
