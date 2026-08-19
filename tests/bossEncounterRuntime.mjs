import assert from "node:assert/strict";
import { BossEncounterRuntime } from "../src/game/boss/BossEncounterRuntime.js";
import { BOSS_01_DEFINITION } from "../src/game/boss/Boss01Definition.js";

function activeRuntime(participantIds = ["player-1", "player-2"]) {
    const runtime = new BossEncounterRuntime(BOSS_01_DEFINITION);
    assert.equal(runtime.start({ participantIds }).accepted, true);
    runtime.drainEvents();
    return runtime;
}

function expose(runtime, playerId = "player-1") {
    return runtime.interactBreaker({
        playerId,
        breakerId: runtime.snapshot().currentBreakerId
    });
}

export function run() {
    const runtime = new BossEncounterRuntime(BOSS_01_DEFINITION);
    assert.equal(runtime.snapshot().status, "inactive");
    assert.equal(runtime.start({ participantIds: ["player-1", "player-2"] }).accepted, true);
    assert.equal(runtime.snapshot().status, "active");
    assert.equal(runtime.snapshot().health, 360);
    assert.equal(runtime.snapshot().phase, 1);
    assert.equal(runtime.snapshot().shieldState, "closed");
    assert.deepEqual(runtime.snapshot().participantStates, [
        { playerId: "player-1", status: "active" },
        { playerId: "player-2", status: "active" }
    ]);
    assert.equal(runtime.start({ participantIds: ["player-1"] }).reason, "encounter-already-started");

    assert.equal(
        runtime.interactBreaker({ playerId: "player-1", breakerId: "boss-01:breaker:phase-2" }).reason,
        "breaker-not-current"
    );
    assert.equal(runtime.applyDamage({ sourcePlayerId: "player-1", damage: 40 }).reason, "core-shielded");
    assert.equal(expose(runtime).accepted, true);
    assert.equal(runtime.snapshot().shieldState, "exposed");
    assert.equal(runtime.snapshot().exposureRemainingSeconds, 8);

    const firstPhase = runtime.applyDamage({ sourcePlayerId: "player-1", damage: 200 });
    assert.equal(firstPhase.appliedDamage, 120, "damage must not bleed through the next shielded phase");
    assert.equal(runtime.snapshot().health, 240);
    assert.equal(runtime.snapshot().phase, 2);
    assert.equal(runtime.snapshot().shieldState, "closed");

    assert.equal(expose(runtime, "player-2").accepted, true);
    runtime.advance(7.5);
    assert.equal(runtime.snapshot().shieldState, "exposed");
    assert.equal(runtime.snapshot().exposureRemainingSeconds, 0.5);
    runtime.advance(0.5);
    assert.equal(runtime.snapshot().shieldState, "closed");
    assert.equal(expose(runtime).accepted, true, "the same phase breaker re-arms when exposure closes");
    runtime.applyDamage({ sourcePlayerId: "player-1", damage: 120 });
    assert.equal(runtime.snapshot().phase, 3);
    assert.equal(expose(runtime).accepted, true);
    const completed = runtime.applyDamage({ sourcePlayerId: "player-2", damage: 120 });
    assert.equal(completed.completed, true);
    assert.equal(runtime.snapshot().status, "completed");
    assert.equal(runtime.snapshot().health, 0);

    const timerRuntime = activeRuntime(["owner"]);
    timerRuntime.advance(209.5);
    assert.equal(timerRuntime.snapshot().collapseActive, false);
    timerRuntime.advance(1.5);
    assert.equal(timerRuntime.snapshot().timerRemainingSeconds, 0);
    assert.equal(timerRuntime.snapshot().collapseActive, true);
    assert.equal(timerRuntime.snapshot().collapseDistance, 80);
    timerRuntime.advance(0.5);
    assert.equal(timerRuntime.snapshot().collapseDistance, 120);

    const retryRuntime = activeRuntime();
    const progressSentinel = Object.freeze({ objective: "preserved" });
    assert.equal(retryRuntime.handlePlayerDefeat("player-1", "collapse").retryStarted, false);
    assert.equal(retryRuntime.snapshot().participantStates[0].status, "spectating");
    assert.equal(expose(retryRuntime, "player-1").reason, "participant-not-active");
    assert.equal(retryRuntime.handlePlayerDefeat("player-2", "collapse").retryStarted, true);
    assert.equal(retryRuntime.snapshot().attempt, 2);
    assert.equal(retryRuntime.snapshot().health, 360);
    assert.equal(retryRuntime.snapshot().timerRemainingSeconds, 210);
    assert.equal(retryRuntime.snapshot().collapseActive, false);
    assert.ok(retryRuntime.snapshot().participantStates.every(({ status }) => status === "active"));
    assert.deepEqual(progressSentinel, { objective: "preserved" });

    expose(retryRuntime);
    retryRuntime.applyDamage({ sourcePlayerId: "player-1", damage: 45 });
    retryRuntime.advance(3.25);
    retryRuntime.drainEvents();
    const snapshot = retryRuntime.snapshot();
    const restored = new BossEncounterRuntime(BOSS_01_DEFINITION, snapshot);
    assert.deepEqual(restored.snapshot(), snapshot);
    const restoredEvent = restored.handlePlayerDefeat("player-1", "health");
    assert.equal(restoredEvent.accepted, true);
    assert.equal(restored.drainEvents()[0].sequence, snapshot.eventSequence + 1);
    assert.throws(() => new BossEncounterRuntime(BOSS_01_DEFINITION, { ...snapshot, phaseCount: 4 }), /phaseCount/);
    assert.throws(() => new BossEncounterRuntime(BOSS_01_DEFINITION, { ...snapshot, phase: 3 }), /phase.*health/);
    assert.throws(
        () =>
            new BossEncounterRuntime(BOSS_01_DEFINITION, {
                ...snapshot,
                exposureRemainingSeconds: BOSS_01_DEFINITION.exposureSeconds + 1
            }),
        /exposureRemainingSeconds/
    );
    assert.throws(
        () =>
            new BossEncounterRuntime(BOSS_01_DEFINITION, {
                ...snapshot,
                timerRemainingSeconds: BOSS_01_DEFINITION.timerSeconds + 1
            }),
        /timerRemainingSeconds/
    );

    const events = runtime.drainEvents();
    assert.equal(new Set(events.map(({ eventId }) => eventId)).size, events.length);
    assert.throws(() => new BossEncounterRuntime(BOSS_01_DEFINITION).start({ participantIds: [] }), /participant/);
    assert.throws(() => timerRuntime.advance(-1), /non-negative/);
    assert.throws(() => timerRuntime.applyDamage({ sourcePlayerId: "owner", damage: 0 }), /positive/);
}
