import assert from "node:assert/strict";
import { formatPlaytestDiagnostics, setupPlaytestDiagnostics } from "../src/game/metrics/PlaytestDiagnostics.js";

function metrics() {
    return {
        activeSeconds: 125.25,
        checkpointsReached: 2,
        enemyDefeats: 7,
        damageTaken: 3,
        ropeCuts: 1,
        defeats: 1,
        firstRewardSeconds: 58.24
    };
}

export async function run() {
    const text = formatPlaytestDiagnostics({
        capturedAt: "2026-08-10T10:00:00.000Z",
        version: "0.7.0",
        url: "https://example.test/?metrics=1",
        channelId: "1234",
        worldSeed: 481516,
        metrics: metrics(),
        networkMetrics: {
            roundTripMs: 103.8,
            snapshotIntervalMs: 50.2,
            pendingCommands: 4,
            rejectionRate: 0.02,
            acceptedOwnerMotions: 40,
            rejectedOwnerMotions: 1,
            correctionP50: 3.4,
            correctionP95: 19.6,
            hardSnaps: 1,
            extrapolationMs: 12.2,
            maxExtrapolationMs: 80.1,
            clockCorrectionMs: -1.8,
            maxClockCorrectionMs: 16.7,
            predictionCancellations: 2
        },
        renderMetrics: {
            framesPerSecond: 58.8,
            frameIntervalP50Ms: 17,
            frameIntervalP95Ms: 28,
            maxFrameIntervalMs: 44,
            renderDurationP50Ms: 4,
            renderDurationP95Ms: 8,
            maxRenderDurationMs: 12,
            recentDroppedSteps: 1,
            droppedSteps: 3,
            cssWidth: 1024,
            cssHeight: 768,
            backingWidth: 2048,
            backingHeight: 1536,
            devicePixelRatio: 3,
            effectivePixelRatio: 2,
            drawCounts: { enemies: { total: 48, drawn: 6 } }
        }
    });
    assert.match(text, /channel: 1234/);
    assert.match(text, /worldSeed: 481516/);
    assert.match(text, /roundTripMs: 104/);
    assert.match(text, /rejectionRatePercent: 2/);
    assert.match(text, /acceptedOwnerMotions: 40/);
    assert.match(text, /rejectedOwnerMotions: 1/);
    assert.match(text, /clockCorrectionMs: -2/);
    assert.match(text, /maxClockCorrectionMs: 17/);
    assert.match(text, /firstRewardSeconds: 58.2/);
    assert.match(text, /renderFps: 59/);
    assert.match(text, /backingStore: 2048x1536/);
    assert.match(text, /drawCounts: enemies=6\/48/);

    let click = null;
    let copied = null;
    const root = {
        hidden: true,
        textContent: "진단 복사",
        addEventListener(_type, listener) {
            click = listener;
        },
        removeEventListener(_type, listener) {
            if (click === listener) click = null;
        }
    };
    const diagnostics = setupPlaytestDiagnostics({
        root,
        navigator: {
            clipboard: {
                async writeText(value) {
                    copied = value;
                }
            }
        },
        enabled: true,
        context: () => ({ version: "0.7.0", url: "https://example.test/?metrics=1", channelId: null }),
        now: () => new Date("2026-08-10T10:00:00.000Z")
    });
    diagnostics.update({ metrics: metrics(), worldSeed: 108 });
    await click();
    assert.equal(root.hidden, false);
    assert.match(copied, /channel: single/);
    assert.match(copied, /worldSeed: 108/);
    assert.equal(root.textContent, "복사 완료");
    diagnostics.release();
    assert.equal(click, null);

    const disabledRoot = { hidden: false };
    const disabled = setupPlaytestDiagnostics({ root: disabledRoot, enabled: false });
    disabled.update({ metrics: metrics() });
    assert.equal(disabledRoot.hidden, true);
}
