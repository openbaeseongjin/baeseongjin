import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
    DIRECTION_COMMAND_CONTRACTS,
    compileDirectionAuthoring,
    compileDirectionAuthoringReport,
    defineDirectionCommand
} from "../src/game/direction/DirectionDefinition.js";
import { assessDirectionCoverage } from "../src/game/direction/DirectionCoverage.js";
import { DirectionAdapterRegistry } from "../src/game/direction/DirectionAdapterRegistry.js";
import {
    assertLocalDirectionReleaseReady,
    createLocalDirectionRuntime
} from "../src/game/direction/DirectionProductionAdapters.js";
import { DirectionRuntime } from "../src/game/direction/DirectionRuntime.js";
import { loadDefaultDirectionDefinitions } from "../src/game/direction/DirectionCatalog.js";
import { validateDirectionSpecs } from "../scripts/validateDirectionSpecs.mjs";

function loadSpec(stageAlias) {
    return JSON.parse(readFileSync(resolve(`docs/bsh/scenario/1/${stageAlias}/DIRECTION-SPEC.json`), "utf8"));
}

function commandKinds(beat) {
    return beat.commands.map(({ domain, action }) => `${domain}.${action}`);
}

export async function run() {
    assert.equal(validateDirectionSpecs().coverage.releaseReady, true);
    const invalidReportSpec = structuredClone(loadSpec("1-1"));
    invalidReportSpec.beats[0].trigger.type = "magic-timeline";
    const invalidReport = compileDirectionAuthoringReport(invalidReportSpec);
    assert.equal(invalidReport.status, "compile-failed");
    assert.match(invalidReport.issues[0].message, /unsupported direction trigger/);
    const loadedDefinitions = await loadDefaultDirectionDefinitions({
        fetcher: async (url) => {
            const stageAlias = String(url).includes("1-1") ? "1-1" : "1-2";
            return { ok: true, status: 200, json: async () => loadSpec(stageAlias) };
        }
    });
    assert.deepEqual(
        loadedDefinitions.map(({ areaId }) => areaId),
        ["sector-01-01", "sector-01-02"]
    );
    const area01 = compileDirectionAuthoring(loadSpec("1-1"));
    const area02 = compileDirectionAuthoring(loadSpec("1-2"));
    assert.equal(area01.areaId, "sector-01-01");
    assert.equal(area02.areaId, "sector-01-02");
    assert.equal(area01.beats.length, 6);
    assert.equal(area02.beats.length, 6);
    assert.deepEqual(commandKinds(area01.beats[0]), [
        "camera.follow-zone",
        "story.show",
        "audio.play-direction-cue",
        "lighting.apply-preset",
        "message.show-bark"
    ]);
    assert.deepEqual(commandKinds(area02.beats[2]), ["camera.follow-zone", "audio.play-direction-cue"]);
    assert.equal(
        area02.beats[2].commands.some(({ domain }) => domain === "story" || domain === "message"),
        false,
        "Airborne C must remain a text-free beat"
    );
    assert.equal(
        area02.beats[4].commands.some(({ domain }) => domain === "story" || domain === "message"),
        false,
        "the upper catwalk close must not invent dialogue"
    );

    assert.deepEqual(DIRECTION_COMMAND_CONTRACTS.player.authorities, ["owner"]);
    assert.deepEqual(DIRECTION_COMMAND_CONTRACTS.enemy.authorities, ["server"]);
    assert.deepEqual(DIRECTION_COMMAND_CONTRACTS.collision.authorities, ["server"]);
    assert.deepEqual(DIRECTION_COMMAND_CONTRACTS.camera.authorities, ["local"]);
    assert.throws(
        () =>
            defineDirectionCommand({
                commandId: "bad-enemy-command",
                beatId: "beat",
                trackId: "track",
                domain: "enemy",
                action: "spawn",
                scope: "local-player",
                authority: "local",
                payload: {},
                causalId: "bad-enemy-command"
            }),
        /authority.*enemy|enemy.*authority/
    );
    assert.throws(
        () =>
            defineDirectionCommand({
                commandId: "bad-owner-scope",
                beatId: "beat",
                trackId: "track",
                domain: "player",
                action: "set-input-lock",
                scope: "shared-world",
                authority: "owner",
                payload: {},
                causalId: "bad-owner-scope"
            }),
        /scope.*owner authority/
    );
    const gameplaySpec = structuredClone(loadSpec("1-1"));
    gameplaySpec.beats[0].tracks.push({
        type: "player",
        action: "set-invulnerability",
        payload: { durationSeconds: 1 }
    });
    gameplaySpec.beats[0].tracks.push({
        type: "enemy",
        action: "spawn",
        payload: { enemyId: "direction-fixture" }
    });
    const gameplayDefinition = compileDirectionAuthoring(gameplaySpec);
    const ownerTrack = gameplayDefinition.beats[0].commands.find(({ domain }) => domain === "player");
    const serverTrack = gameplayDefinition.beats[0].commands.find(({ domain }) => domain === "enemy");
    assert.deepEqual([ownerTrack.scope, ownerTrack.authority], ["owner-player", "owner"]);
    assert.deepEqual([serverTrack.scope, serverTrack.authority], ["shared-world", "server"]);
    const unsupportedGameplaySpec = structuredClone(loadSpec("1-1"));
    unsupportedGameplaySpec.beats[0].tracks.push({
        type: "player",
        action: "teleport-everyone",
        payload: {}
    });
    const unsupportedGameplayDefinition = compileDirectionAuthoring(unsupportedGameplaySpec);
    const unsupportedGameplayCommand = unsupportedGameplayDefinition.beats[0].commands.find(
        ({ domain, action }) => domain === "player" && action === "review"
    );
    assert.equal(unsupportedGameplayCommand.review.reason, "unsupported-gameplay-action");

    const allActions = new Set(
        [...area01.beats, ...area02.beats].flatMap(({ commands }) =>
            commands.map(({ domain, action }) => `${domain}.${action}`)
        )
    );
    const verifiedCoverage = assessDirectionCoverage([area01, area02], {
        supportedActions: allActions,
        boundActions: allActions,
        verifiedActions: allActions
    });
    assert.equal(verifiedCoverage.releaseReady, true);
    assert.ok(verifiedCoverage.tracks.every(({ status }) => status === "verified"));

    const missingAudio = new Set([...allActions].filter((action) => action !== "audio.play-direction-cue"));
    const blockedCoverage = assessDirectionCoverage([area01, area02], {
        supportedActions: allActions,
        boundActions: missingAudio,
        verifiedActions: missingAudio
    });
    assert.equal(blockedCoverage.releaseReady, false);
    assert.ok(blockedCoverage.tracks.some(({ status, optional }) => status === "unbound" && !optional));

    const optionalSpec = structuredClone(loadSpec("1-1"));
    optionalSpec.beats[0].tracks.find(({ type }) => type === "lighting").optional = true;
    const optionalArea = compileDirectionAuthoring(optionalSpec);
    const optionalCoverage = assessDirectionCoverage([optionalArea], {
        supportedActions: allActions,
        boundActions: new Set([...allActions].filter((action) => action !== "lighting.apply-preset")),
        verifiedActions: new Set([...allActions].filter((action) => action !== "lighting.apply-preset"))
    });
    assert.equal(optionalCoverage.releaseReady, true, "an explicitly optional loss may not block release");

    const reviewSpec = structuredClone(loadSpec("1-1"));
    const reviewTrack = reviewSpec.beats[0].tracks.find(({ type }) => type === "audio");
    reviewTrack.action = "cinematic-reactor-collapse";
    const reviewArea = compileDirectionAuthoring(reviewSpec);
    const reviewCoverage = assessDirectionCoverage([reviewArea], {
        supportedActions: allActions,
        boundActions: allActions,
        verifiedActions: allActions
    });
    assert.equal(reviewCoverage.releaseReady, false);
    assert.ok(reviewCoverage.tracks.some(({ status }) => status === "review-required"));
    assert.throws(() => assertLocalDirectionReleaseReady([reviewArea]), /의도: cinematic-reactor-collapse/);
    reviewTrack.fallbackPolicy = {
        approval: "approved",
        approvedBy: "scenario-planner",
        originalIntent: "대형 원자로 붕괴음을 전달한다.",
        replacementAction: "normal-hum-relay-trip-shutter-settle",
        lostMeaning: "대형 붕괴의 저역 규모감은 mock에서 축소된다."
    };
    const approvedFallbackArea = compileDirectionAuthoring(reviewSpec);
    const fallbackCommand = approvedFallbackArea.beats[0].commands.find(({ domain }) => domain === "audio");
    assert.equal(fallbackCommand.review, null);
    assert.equal(fallbackCommand.payload.cueId, "direction-relay-trip-settle");
    assert.equal(fallbackCommand.payload.fallbackPolicy.approval, "approved");
    const forcedCameraSpec = structuredClone(loadSpec("1-1"));
    forcedCameraSpec.beats[0].camera.forcedPan = true;
    const forcedCameraCoverage = assessDirectionCoverage([compileDirectionAuthoring(forcedCameraSpec)], {
        supportedActions: allActions,
        boundActions: allActions,
        verifiedActions: allActions
    });
    assert.equal(forcedCameraCoverage.releaseReady, false);
    assert.ok(
        forcedCameraCoverage.tracks.some(
            ({ actionKey, status }) => actionKey === "camera.follow-zone" && status === "review-required"
        )
    );

    const calls = [];
    const registry = new DirectionAdapterRegistry();
    for (const actionKey of allActions) {
        const [domain, action] = actionKey.split(".");
        registry.register({
            domain,
            action,
            execute: (command) => calls.push(command)
        });
    }
    const runtime = new DirectionRuntime({ definitions: [area01, area02], adapters: registry });
    runtime.update(0, {
        areaId: "sector-01-01",
        cameraZoneId: "intro",
        localX: -416,
        localY: -32,
        events: []
    });
    assert.ok(calls.some(({ domain }) => domain === "story"));
    assert.equal(
        calls.some(({ domain }) => domain === "message"),
        false
    );
    runtime.update(1.79, {
        areaId: "sector-01-01",
        cameraZoneId: "intro",
        localX: -416,
        localY: -32,
        events: []
    });
    assert.equal(
        calls.some(({ domain }) => domain === "message"),
        false
    );
    runtime.update(0.01, {
        areaId: "sector-01-01",
        cameraZoneId: "intro",
        localX: -416,
        localY: -32,
        events: []
    });
    assert.equal(calls.find(({ domain }) => domain === "message").payload.text, "뭐야…?");
    const firstAreaCallCount = calls.length;
    runtime.update(3, {
        areaId: "sector-01-01",
        cameraZoneId: "intro",
        localX: -416,
        localY: -32,
        events: []
    });
    assert.equal(calls.length, firstAreaCallCount, "once-per-sector-attempt beats must dedupe locally");

    const cancellableCalls = [];
    const cancellableRegistry = new DirectionAdapterRegistry();
    for (const actionKey of allActions) {
        const [domain, action] = actionKey.split(".");
        cancellableRegistry.register({ domain, action, execute: (command) => cancellableCalls.push(command) });
    }
    const cancellable = new DirectionRuntime({ definitions: [area01], adapters: cancellableRegistry });
    cancellable.update(0, {
        areaId: "sector-01-01",
        cameraZoneId: "intro",
        localX: -416,
        localY: -32,
        events: []
    });
    assert.equal(cancellable.cancelBeat("s0-incident-bay"), 1);
    cancellable.update(2, {
        areaId: "sector-01-01",
        cameraZoneId: "intro",
        localX: -416,
        localY: -32,
        events: []
    });
    assert.equal(
        cancellableCalls.some(({ domain }) => domain === "message"),
        false
    );
    cancellable.resetAttempt();
    cancellable.update(0, {
        areaId: "sector-01-01",
        cameraZoneId: "intro",
        localX: -416,
        localY: -32,
        events: []
    });
    assert.ok(cancellableCalls.filter(({ domain }) => domain === "story").length >= 2);

    const fakeOwnerRegistry = new DirectionAdapterRegistry();
    fakeOwnerRegistry.register({ domain: "player", action: "set-invulnerability", execute: () => true });
    const ownerCommand = defineDirectionCommand({
        commandId: "owner-command",
        beatId: "beat",
        trackId: "track",
        domain: "player",
        action: "set-invulnerability",
        scope: "owner-player",
        authority: "owner",
        payload: { durationSeconds: 1 },
        causalId: "owner-command"
    });
    assert.equal(fakeOwnerRegistry.dispatch(ownerCommand, { executionAuthority: "local" }), false);
    assert.equal(fakeOwnerRegistry.dispatch(ownerCommand, { executionAuthority: "owner" }), true);

    const audioCalls = [];
    const production = createLocalDirectionRuntime({
        viewerId: "player-local",
        definitions: [area01, area02],
        audioBindings: {
            playDirectionCue: (cueId, request) => {
                audioCalls.push({ cueId, request });
                return true;
            }
        }
    });
    const entryContext = {
        areaId: "sector-01-01",
        cameraZoneId: "intro",
        localX: -416,
        localY: -32,
        events: [],
        audioContext: { listener: { x: -416, y: -32 } }
    };
    production.runtime.update(0, entryContext);
    assert.equal(production.storyPresentation.snapshot().title, "GROUND SERVICE ACCESS");
    assert.equal(production.lightingPresentation.snapshot().presetId, "maintenance-white-local-amber");
    assert.equal(audioCalls[0].cueId, "direction-relay-trip-settle");
    production.storyPresentation.update(1.8, { currentAreaId: "sector-01-01" });
    production.runtime.update(1.8, entryContext);
    production.messagePresentation.update(0, { storyPresentation: production.storyPresentation.snapshot() });
    assert.equal(production.messagePresentation.snapshot().text, "뭐야…?");
    production.runtime.update(0, {
        ...entryContext,
        cameraZoneId: "open-swing",
        localY: -720
    });
    assert.equal(production.characterPresentation.snapshot().kind, "exhale");

    const teammate = createLocalDirectionRuntime({
        viewerId: "player-2",
        definitions: [area01, area02],
        audioBindings: { playDirectionCue: () => true }
    });
    teammate.runtime.update(0, entryContext);
    teammate.storyPresentation.update(1.8, { currentAreaId: "sector-01-01" });
    teammate.runtime.update(1.8, entryContext);
    teammate.messagePresentation.update(0, { storyPresentation: teammate.storyPresentation.snapshot() });
    assert.equal(teammate.messagePresentation.snapshot().speakerId, "player-2");
    assert.notEqual(
        teammate.messagePresentation.snapshot().speakerId,
        production.messagePresentation.snapshot().speakerId,
        "each multiplayer client must bind a local Direction Bark to its own viewer"
    );
}
