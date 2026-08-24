import { CLIENT_FEEDBACK_KEY } from "./ClientFeedbackEventDefinition.js";
import { PLAYER_ROPE_FEEDBACK_CONFIG } from "./PlayerRopeFeedbackDefinition.js";

export class ContinuousFeedbackEmitter {
    constructor({ config = PLAYER_ROPE_FEEDBACK_CONFIG } = {}) {
        this.config = config;
        this.elapsedById = new Map();
        this.sequenceById = new Map();
        this.activeIds = new Set();
        this.frame = null;
    }

    beginFrame({ dt, visibleWorldBounds, effectBuffer }) {
        this.activeIds.clear();
        this.frame = { dt, visibleWorldBounds, effectBuffer };
    }

    emit(
        id,
        presetId,
        position,
        direction,
        { intervalSeconds = this.config.EMITTER_INTERVAL_SECONDS, ...particleOptions } = {}
    ) {
        if (!position) return;
        if (!Number.isFinite(intervalSeconds) || intervalSeconds <= 0) {
            throw new Error("ContinuousFeedbackEmitter intervalSeconds must be positive");
        }
        this.activeIds.add(id);
        const elapsed = (this.elapsedById.get(id) ?? this.config.INITIAL_ELAPSED_SECONDS) + this.frame.dt;
        if (elapsed < intervalSeconds) {
            this.elapsedById.set(id, elapsed);
            return;
        }
        this.elapsedById.set(id, this.config.INITIAL_ELAPSED_SECONDS);
        const sequence = (this.sequenceById.get(id) ?? this.config.INITIAL_SEQUENCE) + this.config.SEQUENCE_INCREMENT;
        this.sequenceById.set(id, sequence);
        this.frame.effectBuffer.appendParticle({
            presetId,
            position,
            direction,
            identity: CLIENT_FEEDBACK_KEY.continuous(id, sequence),
            density: this.config.EMITTER_DENSITY,
            priority: this.config.EMITTER_PRIORITY,
            visibleWorldBounds: this.frame.visibleWorldBounds,
            ...particleOptions
        });
    }

    endFrame() {
        for (const id of this.elapsedById.keys()) {
            if (this.activeIds.has(id)) continue;
            this.elapsedById.delete(id);
            this.sequenceById.delete(id);
        }
        this.frame = null;
    }
}
