function valueOrDash(value, format = String) {
    return value === null || value === undefined ? "-" : format(value);
}

function rounded(value) {
    return String(Math.round(value));
}

export function formatPlaytestDiagnostics({
    capturedAt,
    version,
    url,
    channelId,
    worldSeed,
    metrics,
    networkMetrics = null,
    renderMetrics = null
}) {
    const lines = [
        "[ROPE PLAYTEST DIAGNOSTICS]",
        `capturedAt: ${capturedAt}`,
        `version: ${version}`,
        `url: ${url}`,
        `channel: ${channelId ?? "single"}`,
        `worldSeed: ${worldSeed}`,
        `activeSeconds: ${metrics.activeSeconds.toFixed(1)}`,
        `checkpointsReached: ${metrics.checkpointsReached}`,
        `enemyDefeats: ${metrics.enemyDefeats}`,
        `damageTaken: ${metrics.damageTaken}`,
        `ropeCuts: ${metrics.ropeCuts}`,
        `defeats: ${metrics.defeats}`,
        `firstRewardSeconds: ${valueOrDash(metrics.firstRewardSeconds, (value) => value.toFixed(1))}`
    ];

    if (networkMetrics) {
        lines.push(
            `roundTripMs: ${valueOrDash(networkMetrics.roundTripMs, rounded)}`,
            `snapshotIntervalMs: ${valueOrDash(networkMetrics.snapshotIntervalMs, rounded)}`,
            `pendingCommands: ${networkMetrics.pendingCommands}`,
            `rejectionRatePercent: ${Math.round(networkMetrics.rejectionRate * 100)}`,
            `acceptedOwnerMotions: ${networkMetrics.acceptedOwnerMotions}`,
            `rejectedOwnerMotions: ${networkMetrics.rejectedOwnerMotions}`,
            `correctionP50: ${rounded(networkMetrics.correctionP50)}`,
            `correctionP95: ${rounded(networkMetrics.correctionP95)}`,
            `hardSnaps: ${networkMetrics.hardSnaps}`,
            `extrapolationMs: ${rounded(networkMetrics.extrapolationMs)}`,
            `maxExtrapolationMs: ${rounded(networkMetrics.maxExtrapolationMs)}`,
            `clockCorrectionMs: ${rounded(networkMetrics.clockCorrectionMs)}`,
            `maxClockCorrectionMs: ${rounded(networkMetrics.maxClockCorrectionMs)}`,
            `predictionCancellations: ${networkMetrics.predictionCancellations}`
        );
    }

    if (renderMetrics) {
        const drawCounts = Object.entries(renderMetrics.drawCounts)
            .map(([category, counts]) => `${category}=${counts.drawn}/${counts.total}`)
            .join(",");
        lines.push(
            `renderFps: ${valueOrDash(renderMetrics.framesPerSecond, rounded)}`,
            `frameIntervalP50Ms: ${valueOrDash(renderMetrics.frameIntervalP50Ms, rounded)}`,
            `frameIntervalP95Ms: ${valueOrDash(renderMetrics.frameIntervalP95Ms, rounded)}`,
            `maxFrameIntervalMs: ${rounded(renderMetrics.maxFrameIntervalMs)}`,
            `renderDurationP50Ms: ${rounded(renderMetrics.renderDurationP50Ms)}`,
            `renderDurationP95Ms: ${rounded(renderMetrics.renderDurationP95Ms)}`,
            `maxRenderDurationMs: ${rounded(renderMetrics.maxRenderDurationMs)}`,
            `recentDroppedSteps: ${renderMetrics.recentDroppedSteps}`,
            `droppedSteps: ${renderMetrics.droppedSteps}`,
            `cssViewport: ${Math.round(renderMetrics.cssWidth)}x${Math.round(renderMetrics.cssHeight)}`,
            `backingStore: ${renderMetrics.backingWidth}x${renderMetrics.backingHeight}`,
            `devicePixelRatio: ${renderMetrics.devicePixelRatio}`,
            `effectivePixelRatio: ${renderMetrics.effectivePixelRatio}`,
            `drawCounts: ${drawCounts || "-"}`
        );
    }

    return lines.join("\n");
}

export function setupPlaytestDiagnostics({ root, navigator, enabled, context, now = () => new Date() }) {
    let latest = null;
    root.hidden = !enabled;
    if (!enabled) return { update() {}, release() {} };

    const originalLabel = root.textContent;
    let feedbackTimer = null;
    const showFeedback = (label) => {
        root.textContent = label;
        clearTimeout(feedbackTimer);
        feedbackTimer = setTimeout(() => {
            root.textContent = originalLabel;
        }, 1600);
    };
    const copy = async () => {
        if (!latest) return showFeedback("지표 준비 중");
        try {
            await navigator.clipboard.writeText(
                formatPlaytestDiagnostics({ ...context(), ...latest, capturedAt: now().toISOString() })
            );
            showFeedback("복사 완료");
        } catch {
            showFeedback("복사 실패");
        }
    };
    root.addEventListener("click", copy);

    return {
        update(snapshot) {
            latest = snapshot;
        },
        release() {
            clearTimeout(feedbackTimer);
            root.removeEventListener("click", copy);
        }
    };
}
