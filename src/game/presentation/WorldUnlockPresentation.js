const MAX_PROCESSED_EVENT_IDS = 64;

export const DEFAULT_WORLD_UNLOCK_TIMING = Object.freeze({
    travelSeconds: 0.35,
    holdSeconds: 0.5,
    returnSeconds: 0.35
});

function smoothStep(value) {
    const t = Math.max(0, Math.min(1, value));
    return t * t * (3 - 2 * t);
}

function interpolate(left, right, ratio) {
    return left + (right - left) * ratio;
}

function cameraState(camera) {
    return Object.freeze({
        x: camera.x,
        y: camera.y,
        zoom: camera.zoom,
        initialized: camera.initialized
    });
}

function focusCamera(position, zoom, cssWidth, cssHeight) {
    return Object.freeze({
        x: position.x - cssWidth / zoom / 2,
        y: position.y - cssHeight / zoom / 2,
        zoom,
        initialized: true
    });
}

function assignInterpolatedCamera(camera, from, to, ratio) {
    const eased = smoothStep(ratio);
    camera.x = interpolate(from.x, to.x, eased);
    camera.y = interpolate(from.y, to.y, eased);
    camera.zoom = interpolate(from.zoom, to.zoom, eased);
    camera.initialized = true;
}

export class WorldUnlockPresentation {
    constructor({ timing = DEFAULT_WORLD_UNLOCK_TIMING } = {}) {
        for (const key of ["travelSeconds", "holdSeconds", "returnSeconds"]) {
            if (!Number.isFinite(timing[key]) || timing[key] < 0) {
                throw new Error(`WorldUnlockPresentation requires a non-negative ${key}`);
            }
        }
        if (timing.travelSeconds + timing.holdSeconds + timing.returnSeconds <= 0) {
            throw new Error("WorldUnlockPresentation requires a positive total duration");
        }
        this.timing = Object.freeze({ ...timing });
        this.active = null;
        this.processedEventIds = new Set();
        this.processedEventOrder = [];
    }

    prepare(events, { world, camera, cssWidth, cssHeight }) {
        for (const event of events) {
            if (event?.eventType !== "route-unlocked" || !this.rememberEvent(event.eventId)) continue;
            const device = (world?.objects ?? []).find(
                (object) => object.kind === "access-transit-lock" && object.routeLockId === event.routeId
            );
            if (!device || this.active) continue;
            const captured = cameraState(camera);
            const zoom = device.unlockCameraZoom ?? captured.zoom;
            this.active = {
                eventId: event.eventId,
                elapsedSeconds: 0,
                captured,
                focus: focusCamera(device.position, zoom, cssWidth, cssHeight),
                focusPosition: Object.freeze({ x: device.position.x, y: device.position.y })
            };
        }
        return this.active !== null;
    }

    advance(dt, camera) {
        if (!this.active) {
            return Object.freeze({ holding: false, released: false, focusPosition: null });
        }
        this.active.elapsedSeconds += dt;
        const { travelSeconds, holdSeconds, returnSeconds } = this.timing;
        const total = travelSeconds + holdSeconds + returnSeconds;
        const elapsed = this.active.elapsedSeconds;
        if (elapsed >= total) {
            Object.assign(camera, this.active.captured);
            this.active = null;
            return Object.freeze({ holding: false, released: true, focusPosition: null });
        }
        if (elapsed < travelSeconds && travelSeconds > 0) {
            assignInterpolatedCamera(camera, this.active.captured, this.active.focus, elapsed / travelSeconds);
        } else if (elapsed < travelSeconds + holdSeconds) {
            Object.assign(camera, this.active.focus);
        } else if (returnSeconds > 0) {
            assignInterpolatedCamera(
                camera,
                this.active.focus,
                this.active.captured,
                (elapsed - travelSeconds - holdSeconds) / returnSeconds
            );
        } else {
            Object.assign(camera, this.active.captured);
        }
        return Object.freeze({
            holding: true,
            released: false,
            focusPosition: this.active.focusPosition
        });
    }

    rememberEvent(eventId) {
        if (typeof eventId !== "string" || !eventId || this.processedEventIds.has(eventId)) return false;
        this.processedEventIds.add(eventId);
        this.processedEventOrder.push(eventId);
        while (this.processedEventOrder.length > MAX_PROCESSED_EVENT_IDS) {
            this.processedEventIds.delete(this.processedEventOrder.shift());
        }
        return true;
    }
}
