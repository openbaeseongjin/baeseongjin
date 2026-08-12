function freezeFrame(frame) {
    if (
        !frame ||
        !Number.isFinite(frame.x) ||
        !Number.isFinite(frame.y) ||
        !Number.isFinite(frame.width) ||
        !Number.isFinite(frame.height) ||
        frame.width <= 0 ||
        frame.height <= 0 ||
        !Number.isFinite(frame.durationSeconds) ||
        frame.durationSeconds <= 0
    )
        throw new Error("Sprite frame requires a positive source rectangle and durationSeconds");
    if (frame.atlasId !== undefined && (typeof frame.atlasId !== "string" || !frame.atlasId.trim())) {
        throw new Error("Sprite frame atlasId must be a non-empty string when provided");
    }
    return Object.freeze({
        atlasId: frame.atlasId ?? null,
        x: frame.x,
        y: frame.y,
        width: frame.width,
        height: frame.height,
        durationSeconds: frame.durationSeconds
    });
}
export class SpriteAnimation {
    constructor({ id, loop = true, frames }) {
        if (typeof id !== "string" || !id.trim()) throw new Error("Sprite clip requires a non-empty id");
        if (typeof loop !== "boolean") throw new Error("Sprite clip loop must be a boolean");
        if (!Array.isArray(frames) || !frames.length) throw new Error("Sprite clip requires frames");
        this.id = id;
        this.loop = loop;
        this.frames = Object.freeze(frames.map(freezeFrame));
        this.totalDurationSeconds = this.frames.reduce((sum, f) => sum + f.durationSeconds, 0);
        Object.freeze(this);
    }
    frameAt(elapsedSeconds) {
        if (!Number.isFinite(elapsedSeconds) || elapsedSeconds < 0)
            throw new Error("elapsedSeconds must be non-negative");
        let time = Math.min(elapsedSeconds, this.totalDurationSeconds);
        if (this.loop) {
            time = elapsedSeconds % this.totalDurationSeconds;
            const nearestCycle = Math.round(elapsedSeconds / this.totalDurationSeconds);
            const boundaryTolerance = this.totalDurationSeconds * 1e-9;
            if (Math.abs(elapsedSeconds - nearestCycle * this.totalDurationSeconds) <= boundaryTolerance) time = 0;
        }
        for (const frame of this.frames) {
            if (time < frame.durationSeconds) return frame;
            time -= frame.durationSeconds;
        }
        return this.frames.at(-1);
    }
}
