import { createRenderViewport } from "../../render/RenderViewport.js";

const MAX_PROCESSED_EVENT_IDS = 64;

function clampCoordinate(value, minimum, maximum) {
    if (value === Number.NEGATIVE_INFINITY) return minimum;
    if (!Number.isFinite(value)) return maximum;
    return Math.min(maximum, Math.max(minimum, value));
}

export function viewportSafeDeathPosition(position, { camera, cssWidth, cssHeight, spriteSize }) {
    const viewport = createRenderViewport({ camera, cssWidth, cssHeight }).visibleWorldBounds;
    const halfWidth = Math.min((spriteSize?.width ?? 48) * 0.5, (viewport.maxX - viewport.minX) * 0.5);
    const halfHeight = Math.min((spriteSize?.height ?? 48) * 0.5, (viewport.maxY - viewport.minY) * 0.5);
    return Object.freeze({
        x: clampCoordinate(position?.x, viewport.minX + halfWidth, viewport.maxX - halfWidth),
        y: clampCoordinate(position?.y, viewport.minY + halfHeight, viewport.maxY - halfHeight)
    });
}

export class PlayerRespawnPresentation {
    constructor({ playerId, deathDurationSeconds, spriteSize = { width: 48, height: 48 } }) {
        if (typeof playerId !== "string" || !playerId) {
            throw new Error("PlayerRespawnPresentation requires a playerId");
        }
        if (!Number.isFinite(deathDurationSeconds) || deathDurationSeconds <= 0) {
            throw new Error("PlayerRespawnPresentation requires a positive deathDurationSeconds");
        }
        this.playerId = playerId;
        this.deathDurationSeconds = deathDurationSeconds;
        this.spriteSize = Object.freeze({ ...spriteSize });
        this.active = null;
        this.processedEventIds = new Set();
        this.processedEventOrder = [];
    }

    prepare(events, { camera, cssWidth, cssHeight }) {
        return Object.freeze(
            events.map((event) => {
                if (event.type !== "respawn" || event.playerId !== this.playerId) return event;
                const deathPosition = viewportSafeDeathPosition(event.deathPosition, {
                    camera,
                    cssWidth,
                    cssHeight,
                    spriteSize: this.spriteSize
                });
                const prepared = Object.freeze({ ...event, deathPosition });
                if (!this.rememberEvent(event.id)) return prepared;
                this.active = {
                    id: event.id,
                    elapsedSeconds: 0,
                    justStarted: true,
                    deathPosition,
                    camera: Object.freeze({
                        x: camera.x,
                        y: camera.y,
                        zoom: camera.zoom,
                        initialized: camera.initialized
                    })
                };
                return prepared;
            })
        );
    }

    advance(dt, camera) {
        if (!this.active) return Object.freeze({ holding: false, released: false, deathPosition: null });
        if (this.active.justStarted) this.active.justStarted = false;
        else this.active.elapsedSeconds += dt;
        if (this.active.elapsedSeconds + Number.EPSILON >= this.deathDurationSeconds) {
            this.active = null;
            camera.initialized = false;
            return Object.freeze({ holding: false, released: true, deathPosition: null });
        }
        Object.assign(camera, this.active.camera);
        return Object.freeze({
            holding: true,
            released: false,
            deathPosition: this.active.deathPosition
        });
    }

    rememberEvent(id) {
        if (typeof id !== "string" || !id || this.processedEventIds.has(id)) return false;
        this.processedEventIds.add(id);
        this.processedEventOrder.push(id);
        while (this.processedEventOrder.length > MAX_PROCESSED_EVENT_IDS) {
            this.processedEventIds.delete(this.processedEventOrder.shift());
        }
        return true;
    }
}
