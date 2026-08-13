export const DEFAULT_CANVAS_PERFORMANCE_POLICY = Object.freeze({
    maxPixelRatio: 2,
    maxBackingPixels: 3 * 1024 * 1024,
    sampleSize: 180
});

function finitePositive(value, fallback) {
    return Number.isFinite(value) && value > 0 ? value : fallback;
}

function percentile(values, ratio) {
    if (values.length === 0) return null;
    const sorted = [...values].sort((left, right) => left - right);
    const position = (sorted.length - 1) * ratio;
    const lower = Math.floor(position);
    const upper = Math.ceil(position);
    if (lower === upper) return sorted[lower];
    return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
}

function rounded(value, digits = 2) {
    if (value === null) return null;
    const factor = 10 ** digits;
    return Math.round(value * factor) / factor;
}

export function resolveCanvasBackingStore({
    cssWidth,
    cssHeight,
    devicePixelRatio,
    maxPixelRatio = DEFAULT_CANVAS_PERFORMANCE_POLICY.maxPixelRatio,
    maxBackingPixels = DEFAULT_CANVAS_PERFORMANCE_POLICY.maxBackingPixels
}) {
    const width = finitePositive(cssWidth, 1);
    const height = finitePositive(cssHeight, 1);
    const deviceRatio = finitePositive(devicePixelRatio, 1);
    const ratioLimit = finitePositive(maxPixelRatio, 1);
    const pixelLimit = finitePositive(maxBackingPixels, width * height);
    const pixelBudgetRatio = Math.sqrt(pixelLimit / (width * height));
    const effectivePixelRatio = Math.max(1, Math.min(deviceRatio, ratioLimit, pixelBudgetRatio));
    return Object.freeze({
        cssWidth: width,
        cssHeight: height,
        devicePixelRatio: deviceRatio,
        effectivePixelRatio,
        backingWidth: Math.max(1, Math.floor(width * effectivePixelRatio)),
        backingHeight: Math.max(1, Math.floor(height * effectivePixelRatio))
    });
}

export class RenderFrameStats {
    constructor() {
        this.collections = new Map();
    }

    recordCollection(category, total, drawn) {
        if (typeof category !== "string" || !category) return;
        const previous = this.collections.get(category) ?? { total: 0, drawn: 0 };
        this.collections.set(category, {
            total: previous.total + Math.max(0, total ?? 0),
            drawn: previous.drawn + Math.max(0, drawn ?? 0)
        });
    }

    snapshot() {
        return Object.freeze(
            Object.fromEntries(
                [...this.collections.entries()].map(([category, counts]) => [
                    category,
                    Object.freeze({ total: counts.total, drawn: counts.drawn })
                ])
            )
        );
    }
}

export class RenderPerformanceMetrics {
    constructor({ sampleSize = DEFAULT_CANVAS_PERFORMANCE_POLICY.sampleSize } = {}) {
        this.sampleSize = Math.max(1, Math.floor(finitePositive(sampleSize, 180)));
        this.previousFrameStartedAtMs = null;
        this.previousDroppedSteps = 0;
        this.frameIntervals = [];
        this.renderDurations = [];
        this.maxFrameIntervalMs = 0;
        this.maxRenderDurationMs = 0;
        this.frameCount = 0;
        this.latest = null;
    }

    record({ startedAtMs, endedAtMs, resolution, droppedSteps = 0, drawCounts = Object.freeze({}) }) {
        const duration = Math.max(0, endedAtMs - startedAtMs);
        this.renderDurations.push(duration);
        this.maxRenderDurationMs = Math.max(this.maxRenderDurationMs, duration);
        if (this.previousFrameStartedAtMs !== null) {
            const interval = Math.max(0, startedAtMs - this.previousFrameStartedAtMs);
            this.frameIntervals.push(interval);
            this.maxFrameIntervalMs = Math.max(this.maxFrameIntervalMs, interval);
        }
        this.previousFrameStartedAtMs = startedAtMs;
        this.frameIntervals.splice(0, Math.max(0, this.frameIntervals.length - this.sampleSize));
        this.renderDurations.splice(0, Math.max(0, this.renderDurations.length - this.sampleSize));

        const cumulativeDroppedSteps = Math.max(0, droppedSteps ?? 0);
        const recentDroppedSteps = Math.max(0, cumulativeDroppedSteps - this.previousDroppedSteps);
        this.previousDroppedSteps = cumulativeDroppedSteps;
        this.frameCount += 1;

        const frameIntervalP50Ms = percentile(this.frameIntervals, 0.5);
        const frameIntervalP95Ms = percentile(this.frameIntervals, 0.95);
        this.latest = Object.freeze({
            frameCount: this.frameCount,
            framesPerSecond:
                frameIntervalP50Ms === null || frameIntervalP50Ms <= 0 ? null : rounded(1000 / frameIntervalP50Ms, 1),
            frameIntervalP50Ms: rounded(frameIntervalP50Ms),
            frameIntervalP95Ms: rounded(frameIntervalP95Ms),
            maxFrameIntervalMs: rounded(this.maxFrameIntervalMs),
            renderDurationP50Ms: rounded(percentile(this.renderDurations, 0.5)),
            renderDurationP95Ms: rounded(percentile(this.renderDurations, 0.95)),
            maxRenderDurationMs: rounded(this.maxRenderDurationMs),
            recentDroppedSteps,
            droppedSteps: cumulativeDroppedSteps,
            cssWidth: resolution.cssWidth,
            cssHeight: resolution.cssHeight,
            backingWidth: resolution.backingWidth,
            backingHeight: resolution.backingHeight,
            devicePixelRatio: rounded(resolution.devicePixelRatio),
            effectivePixelRatio: rounded(resolution.effectivePixelRatio),
            drawCounts
        });
        return this.latest;
    }

    snapshot() {
        return this.latest;
    }
}
