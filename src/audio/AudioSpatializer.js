export const AUDIO_REFERENCE_DISTANCE = 160;
export const AUDIO_MAX_DISTANCE = 1200;
export const AUDIO_MAX_DISTANCE_GAIN_DB = -36;
export const AUDIO_WARNING_MIN_GAIN_DB = -18;

export function clamp(value, minimum, maximum) {
    return Math.max(minimum, Math.min(maximum, value));
}

export function dbToLinearGain(db) {
    if (db === null || db === Number.NEGATIVE_INFINITY) return 0;
    return 10 ** (db / 20);
}

export function distanceGainDb(distance) {
    if (!Number.isFinite(distance) || distance < 0) throw new Error("audio distance must be a non-negative number");
    if (distance <= AUDIO_REFERENCE_DISTANCE) return 0;
    if (distance > AUDIO_MAX_DISTANCE) return Number.NEGATIVE_INFINITY;
    const progress = (distance - AUDIO_REFERENCE_DISTANCE) / (AUDIO_MAX_DISTANCE - AUDIO_REFERENCE_DISTANCE);
    return AUDIO_MAX_DISTANCE_GAIN_DB * progress;
}

export function calculateSpatialAudio({ listener, source, visibleWorldBounds, minGainDb = null }) {
    if (!listener || !source || !visibleWorldBounds)
        throw new Error("world audio requires listener, source and bounds");
    const centerX = (visibleWorldBounds.minX + visibleWorldBounds.maxX) * 0.5;
    const halfWidth = Math.max(1, (visibleWorldBounds.maxX - visibleWorldBounds.minX) * 0.5);
    const pan = clamp((source.x - centerX) / halfWidth, -1, 1);
    const distance = Math.hypot(source.x - listener.x, source.y - listener.y);
    const attenuatedDb = distanceGainDb(distance);
    const gainDb =
        distance > AUDIO_MAX_DISTANCE || minGainDb === null ? attenuatedDb : Math.max(minGainDb, attenuatedDb);
    return Object.freeze({ pan, distance, gainDb, gain: dbToLinearGain(gainDb) });
}

export function neutralSpatialAudio() {
    return Object.freeze({ pan: 0, distance: 0, gainDb: 0, gain: 1 });
}
