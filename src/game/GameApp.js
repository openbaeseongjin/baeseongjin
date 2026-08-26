import { InputSampler } from "../core/input/InputSampler.js";
import { FixedStepRunner } from "../core/sim/FixedStepRunner.js";
import { createGameRenderer, DEFAULT_RENDERER_PROFILE } from "../render/GameRendererFactory.js";
import { assertGameRenderer } from "../render/SceneRenderer.js";
import { createPlayerCommand } from "./commands/PlayerCommand.js";
import { LocalAuthority } from "./runtime/LocalAuthority.js";
import { PredictableProjectileStore } from "./runtime/PredictableProjectileStore.js";
import { createCurrentGameSimulation } from "./simulation/GameSimulationFactory.js";
import { CAMERA_CONFIG, resolveEffectiveRopeConfig, resolveEffectiveRopeDisabledSeconds } from "./config.js";
import { ClientCombatFeedback } from "./combat/ClientCombatFeedback.js";
import { createBossPresentationEvents, createBossStagePresentation } from "../render/boss/BossStagePresentation.js";
import { bossStageSpecById } from "./boss-authoring/BossStageCatalog.js";
import { ClientStatusFeedback } from "./combat/ClientStatusFeedback.js";
import { selectClientStatusFeedback } from "./combat/ClientStatusFeedback.js";
import { selectWorldSeed } from "./world/WorldSeed.js";
import { createPlayerPresentationEvents } from "../render/sprites/PlayerPresentationEvent.js";
import { createRenderViewport } from "../render/RenderViewport.js";
import {
    advanceAuthoredCamera,
    localTriggerObjects,
    resolveAuthoredCameraShot
} from "./camera/AuthoredCameraDirector.js";
import { createLocalDirectionRuntime } from "./direction/DirectionProductionAdapters.js";
import { interpolateRenderSnapshot } from "../render/interpolateRenderSnapshot.js";
import { DEFAULT_PLAYER_SPRITE_DEFINITION } from "../render/sprites/PlayerSpriteCatalog.js";
import { PlayerRespawnPresentation } from "./presentation/PlayerRespawnPresentation.js";
import { WorldUnlockPresentation } from "./presentation/WorldUnlockPresentation.js";
import { FinalEscapeCinematic } from "./presentation/FinalEscapeCinematic.js";
import {
    BOSS_CAMERA_ZOOM_RATIO,
    bossCameraFocusPlayer,
    bossCameraVisibilityTarget,
    localBossStageSnapshot
} from "./presentation/BossStageLocalView.js";
import { enemyPresentationDefinition, resolveEnemyPresentationState } from "../render/EnemyPresentationState.js";
import { isCanonicalEnemyType } from "./combat/EnemyArchetypeCatalog.js";
import { PreviewFlightController, previewFlightBoundsForWorld } from "./runtime/PreviewFlightController.js";

function boundsContains(bounds, position) {
    return (
        position.x >= bounds.x &&
        position.x <= bounds.x + bounds.width &&
        position.y >= bounds.y &&
        position.y <= bounds.y + bounds.height
    );
}

function debugFlightBounds(state) {
    const bossBounds = state.bossStage?.arena?.bounds ?? state.bossRuntime?.arena?.bounds ?? null;
    if (bossBounds && boundsContains(bossBounds, state.player.position)) return bossBounds;
    return previewFlightBoundsForWorld(state.world, state.player.position);
}

export class GameApp {
    constructor({
        canvas,
        renderer = null,
        authority = null,
        onDiagnostics = () => {},
        audioBindings = null,
        worldSeed = selectWorldSeed(globalThis.location?.search),
        startAreaId = null,
        metricsVisible = false,
        colliderOverlayVisible = false,
        debugFlightEnabled = false,
        hudVisible = true,
        ropeTuning = null,
        debugAugmentIds = [],
        playerDefinition = null,
        directionDefinitions = [],
        enemyDefinition = null,
        bossStageSpecResolver = bossStageSpecById,
        onDebugTrainingDummyChange = () => {}
    }) {
        if (!canvas) throw new Error("GameApp requires a canvas element");
        this.renderer = renderer
            ? assertGameRenderer(renderer)
            : createGameRenderer({ canvas, profile: DEFAULT_RENDERER_PROFILE });
        this.input = new InputSampler(globalThis.window, canvas, {
            onRopeRelease: (input, reason) => this.flushInterruptedRopeRelease(input, reason)
        });
        this.authority =
            authority ??
            new LocalAuthority(
                createCurrentGameSimulation({
                    worldSeed,
                    startAreaId,
                    ropeConfig: resolveEffectiveRopeConfig(ropeTuning),
                    ropeDisabledSeconds: resolveEffectiveRopeDisabledSeconds(ropeTuning),
                    debugAugmentIds
                })
            );
        this.mobileView = globalThis.matchMedia?.("(pointer: coarse)").matches ?? false;
        this.metricsVisible = metricsVisible;
        this.colliderOverlayVisible = colliderOverlayVisible === true;
        this.debugFlight = new PreviewFlightController();
        this.debugFlight.setEnabled(debugFlightEnabled);
        this.hudVisible = hudVisible !== false;
        this.onDiagnostics = onDiagnostics;
        this.audioBindings = audioBindings;
        this.enemyDefinition = enemyDefinition ?? this.renderer.sceneRenderer?.enemyDefinition ?? null;
        this.onDebugTrainingDummyChange = onDebugTrainingDummyChange;
        this.bossStageSpecResolver = bossStageSpecResolver;
        this.debugTrainingDummyControl = null;
        this.debugTrainingDummySignature = "";
        this.camera = this.createCamera();
        this.stats = { totalSteps: 0, droppedSteps: 0, resets: 0 };
        this.frameId = null;
        this.latestInput = this.input.snapshot();
        this.predictableProjectiles = new PredictableProjectileStore();
        this.combatFeedback = new ClientCombatFeedback({ viewerId: this.authority.playerId });
        this.statusFeedback = new ClientStatusFeedback({ viewerId: this.authority.playerId });
        this.playerPresentationEvents = [];
        this.bossPresentationEvents = [];
        const presentationDefinition =
            playerDefinition ?? this.renderer.sceneRenderer?.playerDefinition ?? DEFAULT_PLAYER_SPRITE_DEFINITION;
        const deathPresentation = presentationDefinition.presentationFor("death");
        this.respawnPresentation = new PlayerRespawnPresentation({
            playerId: this.authority.playerId,
            deathDurationSeconds: deathPresentation.clip.totalDurationSeconds,
            spriteSize: deathPresentation.size
        });
        this.worldUnlockPresentation = new WorldUnlockPresentation();
        this.finalEscapeCinematic = new FinalEscapeCinematic(canvas);
        const direction = createLocalDirectionRuntime({
            viewerId: this.authority.playerId,
            definitions: directionDefinitions,
            audioBindings
        });
        this.directionRuntime = direction.runtime;
        this.storyPresentation = direction.storyPresentation;
        this.playerMessagePresentation = direction.messagePresentation;
        this.directionLightingPresentation = direction.lightingPresentation;
        this.directionCharacterPresentation = direction.characterPresentation;
        this.directionCoverage = direction.coverage;
        this.runner = new FixedStepRunner({
            step: (dt, input) => this.update(dt, input),
            render: (alpha) => this.render(alpha)
        });
        this.previousRenderSnapshot = null;
        this.currentRenderSnapshot = this.authority.snapshot();
        this.tick = (time) => {
            this.stats = { ...this.stats, ...this.runner.frame(time, this.input.snapshot()) };
            this.frameId = requestAnimationFrame(this.tick);
        };
    }

    setMetricsVisible(visible) {
        this.metricsVisible = Boolean(visible);
    }

    setColliderOverlayVisible(visible) {
        this.colliderOverlayVisible = Boolean(visible);
        return this.colliderOverlayVisible;
    }

    setDebugFlightEnabled(enabled) {
        if (enabled && typeof this.authority.applyFlightMotion !== "function") return false;
        return this.debugFlight.setEnabled(enabled);
    }

    setHudVisible(visible) {
        this.hudVisible = Boolean(visible);
        return this.hudVisible;
    }

    applyDebugSettings({
        metrics = this.metricsVisible,
        colliderOverlay = this.colliderOverlayVisible,
        flightMode = this.debugFlight.enabled,
        startAreaId = null
    } = {}) {
        this.setMetricsVisible(metrics);
        this.setColliderOverlayVisible(colliderOverlay);
        this.setDebugFlightEnabled(flightMode);
        if (startAreaId && this.authority.applyDebugStartArea(startAreaId)) {
            this.camera = this.createCamera();
            this.currentRenderSnapshot = this.authority.snapshot();
            this.previousRenderSnapshot = null;
        }
    }

    debugTrainingDummyStateOptions(enemyType) {
        if (!isCanonicalEnemyType(enemyType)) return Object.freeze([]);
        return enemyPresentationDefinition(enemyType).states;
    }

    spawnDebugTrainingDummy(enemyType) {
        const states = this.debugTrainingDummyStateOptions(enemyType);
        if (states.length === 0) {
            return Object.freeze({ created: false, reason: `Runtime catalog가 '${enemyType}'을 지원하지 않습니다.` });
        }
        const visibleWorldBounds = createRenderViewport({
            camera: this.camera,
            cssWidth: this.renderer.cssWidth,
            cssHeight: this.renderer.cssHeight
        }).visibleWorldBounds;
        const inputDirection = this.latestInput?.horizontal;
        const playerDirection = this.authority.ownerState()?.velocity?.x;
        const result = this.authority.spawnDebugTrainingDummy({
            enemyType,
            visibleWorldBounds,
            directionX:
                Number.isFinite(inputDirection) && Math.abs(inputDirection) > Number.EPSILON
                    ? inputDirection
                    : playerDirection
        });
        if (!result.created) return result;
        this.debugTrainingDummyControl = {
            enemyType,
            states,
            mode: "actual",
            forcedState: null,
            autoElapsedSeconds: 0
        };
        this.authority.setDebugTrainingDummyPresentationControlled(false);
        this.emitDebugTrainingDummyChange(true);
        return Object.freeze({ ...result, state: this.debugTrainingDummyUiState() });
    }

    setDebugTrainingDummyActualMode() {
        if (!this.debugTrainingDummyControl || !this.authority.debugTrainingDummySnapshot()) return null;
        this.debugTrainingDummyControl.mode = "actual";
        this.debugTrainingDummyControl.forcedState = null;
        this.debugTrainingDummyControl.autoElapsedSeconds = 0;
        this.authority.setDebugTrainingDummyPresentationControlled(false);
        return this.emitDebugTrainingDummyChange(true);
    }

    stepDebugTrainingDummyState(offset) {
        const control = this.debugTrainingDummyControl;
        const dummy = this.authority.debugTrainingDummySnapshot();
        if (!control || !dummy) return null;
        const current = control.forcedState ?? resolveEnemyPresentationState(dummy).primaryState;
        const currentIndex = Math.max(0, control.states.indexOf(current));
        const nextIndex = (currentIndex + offset + control.states.length) % control.states.length;
        control.mode = "forced";
        control.forcedState = control.states[nextIndex];
        control.autoElapsedSeconds = 0;
        this.authority.setDebugTrainingDummyPresentationControlled(true);
        return this.emitDebugTrainingDummyChange(true);
    }

    toggleDebugTrainingDummyAuto() {
        const control = this.debugTrainingDummyControl;
        const dummy = this.authority.debugTrainingDummySnapshot();
        if (!control || !dummy) return null;
        if (control.mode === "auto") return this.setDebugTrainingDummyActualMode();
        control.mode = "auto";
        control.forcedState = control.forcedState ?? resolveEnemyPresentationState(dummy).primaryState;
        control.autoElapsedSeconds = 0;
        this.authority.setDebugTrainingDummyPresentationControlled(true);
        return this.emitDebugTrainingDummyChange(true);
    }

    removeDebugTrainingDummy() {
        const removed = this.authority.removeDebugTrainingDummy();
        this.debugTrainingDummyControl = null;
        this.emitDebugTrainingDummyChange(true);
        return removed;
    }

    debugTrainingDummyUiState() {
        const dummy = this.authority.debugTrainingDummySnapshot();
        const control = this.debugTrainingDummyControl;
        if (!dummy || !control) return null;
        const actualState = resolveEnemyPresentationState(dummy).primaryState;
        return Object.freeze({
            packageId: this.enemyDefinition?.supports(dummy.enemyType)
                ? this.enemyDefinition.id
                : "built-in-enemy-mock",
            enemyType: dummy.enemyType,
            mode: control.mode,
            currentState: control.forcedState ?? actualState,
            actualState,
            health: dummy.health,
            maxHealth: dummy.maxHealth,
            states: control.states
        });
    }

    advanceDebugTrainingDummy(dt) {
        const control = this.debugTrainingDummyControl;
        const dummy = this.authority.debugTrainingDummySnapshot();
        if (!dummy) {
            if (control) {
                this.debugTrainingDummyControl = null;
                this.emitDebugTrainingDummyChange(true);
            }
            return;
        }
        if (control?.mode === "auto") {
            control.autoElapsedSeconds += dt;
            const presentation = this.enemyDefinition?.presentationFor(dummy.enemyType, control.forcedState);
            const holdSeconds = Math.max(0.8, presentation?.clip.totalDurationSeconds ?? 0.8);
            if (control.autoElapsedSeconds >= holdSeconds) {
                const currentIndex = Math.max(0, control.states.indexOf(control.forcedState));
                control.forcedState = control.states[(currentIndex + 1) % control.states.length];
                control.autoElapsedSeconds = 0;
                this.emitDebugTrainingDummyChange(true);
            }
        }
        this.emitDebugTrainingDummyChange();
    }

    emitDebugTrainingDummyChange(force = false) {
        const state = this.debugTrainingDummyUiState();
        const signature = JSON.stringify(state);
        if (!force && signature === this.debugTrainingDummySignature) return state;
        this.debugTrainingDummySignature = signature;
        this.onDebugTrainingDummyChange(state);
        return state;
    }

    flushInterruptedRopeRelease(input, reason) {
        if (reason === "pointerup") return false;
        this.update(this.runner.dt, input);
        return true;
    }

    start() {
        if (this.frameId !== null) return;
        this.input.attach();
        this.frameId = requestAnimationFrame(this.tick);
    }

    stop() {
        if (this.frameId !== null) cancelAnimationFrame(this.frameId);
        this.input.detach();
        this.frameId = null;
        this.onDebugTrainingDummyChange(null);
        this.finalEscapeCinematic.dispose();
    }

    update(dt, input) {
        this.latestInput = input;
        const particleBounds = createRenderViewport({
            camera: this.camera,
            cssWidth: this.renderer.cssWidth,
            cssHeight: this.renderer.cssHeight
        }).worldBounds;
        const before = this.currentRenderSnapshot;
        this.previousRenderSnapshot = before;
        const flightBounds = this.debugFlight.enabled ? debugFlightBounds(before) : null;
        const flightPosition = flightBounds
            ? this.debugFlight.nextPosition(before.player.position, flightBounds, dt, input)
            : null;
        const simulationInput = flightPosition ? this.debugFlight.neutralInput(input) : input;
        const aimWorld = this.renderer.screenToWorld(input.pointer, this.camera);
        this.authority.step(dt, createPlayerCommand(simulationInput, aimWorld));
        if (flightPosition) this.authority.applyFlightMotion(flightPosition);
        this.advanceDebugTrainingDummy(dt);
        let state = this.authority.snapshot();
        const authorityEvents = this.authority.drainEvents();
        this.bossPresentationEvents.push(...createBossPresentationEvents(authorityEvents));
        this.statusFeedback.update(dt);
        this.statusFeedback.apply(authorityEvents);
        this.queuePlayerPresentationEvents(authorityEvents);
        this.worldUnlockPresentation.prepare(authorityEvents, {
            world: state.world,
            camera: this.camera,
            cssWidth: this.renderer.cssWidth,
            cssHeight: this.renderer.cssHeight
        });
        const authorityFeedback = this.predictableProjectiles.apply(authorityEvents, state.tick, state);
        const owner = this.authority.ownerState();
        const predictedImpacts = this.predictableProjectiles
            .update(
                dt,
                {
                    enemies: state.enemies,
                    bossStage: state.bossStage ?? state.bossRuntime ?? null,
                    localPlayer: owner
                },
                state.tick
            )
            .filter(({ projectileId }) => projectileId);
        for (const impact of predictedImpacts) {
            this.predictableProjectiles.applyImpactReceipts([this.authority.submitImpactClaim(impact)]);
        }
        this.queuePlayerPresentationEvents(predictedImpacts);
        this.combatFeedback.apply([...authorityFeedback, ...predictedImpacts], { visibleWorldBounds: particleBounds });
        if (predictedImpacts.length > 0) state = this.authority.snapshot();
        this.currentRenderSnapshot = state;
        this.finalEscapeCinematic.sync(state.runState);
        const cameraShot = this.updatePresentationCamera(
            dt,
            state.player,
            state.world,
            state.bossStage ?? state.bossStageRuntime ?? state.bossRuntime
        );
        this.combatFeedback.syncContinuous({ ...state, players: [state.player] }, dt, particleBounds);
        this.combatFeedback.update(dt);
        const audioScene = this.createAudioContext(state.player.position, state.tick, state.runState);
        this.directionRuntime.update(dt, {
            areaId: cameraShot.areaId,
            cameraZoneId: cameraShot.zoneId,
            localX: cameraShot.localX,
            localY: cameraShot.localY,
            events: authorityEvents,
            audioContext: audioScene
        });
        const storyPresentation = this.storyPresentation.update(dt, {
            currentAreaId: cameraShot.areaId,
            currentAreaLocalX: cameraShot.localX,
            currentAreaLocalY: cameraShot.localY,
            events: authorityEvents,
            triggers: localTriggerObjects(state.world, cameraShot.areaId)
        });
        this.playerMessagePresentation.update(dt, {
            currentAreaId: cameraShot.areaId,
            storyPresentation
        });
        this.directionLightingPresentation.update(dt, { areaId: cameraShot.areaId });
        this.directionCharacterPresentation.update(dt);
        this.audioBindings?.presentFrame({
            events: [...authorityEvents, ...predictedImpacts],
            context: audioScene,
            ropeTransition: { before: before.rope, after: state.rope },
            scene: audioScene
        });
    }

    createAudioContext(listener, tick, runState = "playing") {
        return Object.freeze({
            localPlayerId: this.authority.playerId,
            tick,
            listener,
            visibleWorldBounds: createRenderViewport({
                camera: this.camera,
                cssWidth: this.renderer.cssWidth,
                cssHeight: this.renderer.cssHeight
            }).visibleWorldBounds,
            runState
        });
    }

    updateCamera(dt, player, world, bossStage = null) {
        const localBossStage = localBossStageSnapshot(bossStage, player);
        const focusPlayer = bossCameraFocusPlayer(player, localBossStage);
        return advanceAuthoredCamera({
            camera: this.camera,
            world,
            player: focusPlayer,
            visibilityTarget: bossCameraVisibilityTarget(player, localBossStage, focusPlayer),
            mobileView: this.mobileView,
            defaultZoom:
                localBossStage?.status === "active"
                    ? CAMERA_CONFIG.desktopZoom * BOSS_CAMERA_ZOOM_RATIO
                    : CAMERA_CONFIG.desktopZoom,
            cssWidth: this.renderer.cssWidth,
            cssHeight: this.renderer.cssHeight,
            dt
        });
    }

    queuePlayerPresentationEvents(events) {
        const prepared = this.respawnPresentation.prepare(createPlayerPresentationEvents(events), {
            camera: this.camera,
            cssWidth: this.renderer.cssWidth,
            cssHeight: this.renderer.cssHeight
        });
        this.playerPresentationEvents.push(...prepared);
        return prepared;
    }

    updatePresentationCamera(dt, player, world, bossStage = null) {
        const unlockPhase = this.worldUnlockPresentation.advance(dt, this.camera);
        if (unlockPhase.holding) {
            return resolveAuthoredCameraShot({
                world,
                player: { position: unlockPhase.focusPosition },
                mobileView: this.mobileView,
                defaultZoom: CAMERA_CONFIG.desktopZoom,
                cssWidth: this.renderer.cssWidth,
                cssHeight: this.renderer.cssHeight
            });
        }
        const phase = this.respawnPresentation.advance(dt, this.camera);
        if (!phase.holding) return this.updateCamera(dt, player, world, bossStage);
        return resolveAuthoredCameraShot({
            world,
            player: { position: phase.deathPosition },
            mobileView: this.mobileView,
            defaultZoom: CAMERA_CONFIG.desktopZoom,
            cssWidth: this.renderer.cssWidth,
            cssHeight: this.renderer.cssHeight
        });
    }

    createCamera() {
        const state = this.authority.snapshot();
        const zoom = resolveAuthoredCameraShot({
            world: state.world,
            player: state.player,
            mobileView: this.mobileView,
            defaultZoom: CAMERA_CONFIG.desktopZoom,
            cssWidth: globalThis.innerWidth,
            cssHeight: globalThis.innerHeight
        }).zoom;
        return { x: 0, y: 0, zoom, initialized: false };
    }

    render(alpha = 0) {
        const state = interpolateRenderSnapshot(this.previousRenderSnapshot, this.currentRenderSnapshot, alpha);
        const dummy = this.authority.debugTrainingDummySnapshot();
        const forcedState = this.debugTrainingDummyControl?.forcedState ?? null;
        const renderState =
            dummy && forcedState
                ? {
                      ...state,
                      enemies: state.enemies.map((enemy) =>
                          enemy.id === dummy.enemyId ? { ...enemy, debugPresentationState: forcedState } : enemy
                      )
                  }
                : state;
        const combatFeedback = this.combatFeedback.snapshot();
        this.statusFeedback.apply([state.eventFlash]);
        this.stats.resets = state.resets;
        this.queuePlayerPresentationEvents([state.eventFlash]);
        const playerPresentationEvents = Object.freeze(this.playerPresentationEvents.splice(0));
        const bossPresentationEvents = Object.freeze(this.bossPresentationEvents.splice(0));
        const bossStageSnapshot = renderState.bossStage ?? renderState.bossStageRuntime ?? renderState.bossRuntime;
        const localBossStage = localBossStageSnapshot(bossStageSnapshot, renderState.player);
        const bossStagePresentation = createBossStagePresentation(
            localBossStage,
            this.bossStageSpecResolver(localBossStage?.stageId ?? localBossStage?.id ?? localBossStage?.encounterId),
            bossPresentationEvents
        );
        const renderMetrics = this.renderer.draw({
            ...renderState,
            ...combatFeedback,
            localPlayerId: this.authority.playerId,
            bossStagePresentation,
            playerPresentationEvents,
            storyPresentation: this.storyPresentation.snapshot(),
            playerMessagePresentation: this.playerMessagePresentation.snapshot(),
            directionLightingPresentation: this.directionLightingPresentation.snapshot(),
            directionCharacterPresentation: this.directionCharacterPresentation.snapshot(),
            eventFlash:
                combatFeedback.eventFlash ??
                this.statusFeedback.snapshot() ??
                selectClientStatusFeedback(state.eventFlash, this.authority.playerId),
            camera: this.camera,
            stats: this.stats,
            mobileView: this.mobileView,
            metricsVisible: this.metricsVisible,
            collisionDebugGeometry: this.colliderOverlayVisible
                ? (this.authority.collisionDebugSnapshot?.() ?? null)
                : null,
            hudVisible: this.hudVisible,
            mobileControls: {
                ...this.latestInput.mobileControls,
                visible: this.mobileView || this.latestInput.mobileControls.visible
            }
        });
        if (this.metricsVisible) {
            this.onDiagnostics({
                metrics: state.metrics,
                renderMetrics,
                worldSeed: state.world.seed,
                directionCoverage: this.directionCoverage
            });
        }
    }
}
