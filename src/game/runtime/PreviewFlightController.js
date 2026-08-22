const DEFAULT_FLIGHT_SPEED = 720;
const FLIGHT_BOUNDS_INSET = 16;

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

export class PreviewFlightController {
    constructor({ speed = DEFAULT_FLIGHT_SPEED } = {}) {
        this.enabled = false;
        this.speed = speed;
    }

    setEnabled(enabled) {
        this.enabled = Boolean(enabled);
        return this.enabled;
    }

    neutralInput(input) {
        return Object.freeze({
            ...input,
            horizontal: 0,
            vertical: 0,
            interact: false,
            action: false,
            pointer: Object.freeze({ ...input.pointer, down: false })
        });
    }

    nextPosition(position, bounds, dt, input) {
        const length = Math.hypot(input.horizontal, input.vertical);
        const scale = length > 1 ? 1 / length : 1;
        const x = position.x + input.horizontal * scale * this.speed * dt;
        const y = position.y + input.vertical * scale * this.speed * dt;
        return Object.freeze({
            x: clamp(x, bounds.x + FLIGHT_BOUNDS_INSET, bounds.x + bounds.width - FLIGHT_BOUNDS_INSET),
            y: clamp(y, bounds.y + FLIGHT_BOUNDS_INSET, bounds.y + bounds.height - FLIGHT_BOUNDS_INSET)
        });
    }
}
