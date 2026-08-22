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
import { ClientStatusFeedback } from "./combat/ClientStatusFeedback.js";
import { selectClientStatusFeedback } from "./combat/ClientFeedbackEventObject.js";
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
import { CalibrationPresentation } from "./presentation/CalibrationPresentation.js";
import { PlayerRespawnPresentation } from "./presentation/PlayerRespawnPresentation.js";
import { WorldUnlockPresentation } from "./presentation/WorldUnlockPresentation.js";

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
        hudVisible = true,
        ropeTuning = null,
        debugAugmentIds = [],
        playerDefinition = null,
        directionDefinitions = []
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
        this.hudVisible = hudVisible !== false;
        this.onDiagnostics = onDiagnostics;
        this.audioBindings = audioBindings;
        this.camera = this.createCamera();
        this.stats = { totalSteps: 0, droppedSteps: 0, resets: 0 };
        this.frameId = null;
        this.latestInput = this.input.snapshot();
        this.predictableProjectiles = new PredictableProjectileStore();
        this.combatFeedback = new ClientCombatFeedback({ viewerId: this.authority.playerId });
        this.statusFeedback = new ClientStatusFeedback({ viewerId: this.authority.playerId });
        this.playerPresentationEvents = [];
        const presentationDefinition =
            playerDefinition ?? this.renderer.sceneRenderer?.playerDefinition ?? DEFAULT_PLAYER_SPRITE_DEFINITION;
        const deathPresentation = presentationDefinition.presentationFor("death");
        this.respawnPresentation = new PlayerRespawnPresentation({
            playerId: this.authority.playerId,
            deathDurationSeconds: deathPresentation.clip.totalDurationSeconds,
            spriteSize: deathPresentation.size
        });
        this.worldUnlockPresentation = new WorldUnlockPresentation();
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
        this.calibrationPresentation = new CalibrationPresentation({ viewerId: this.authority.playerId });
        this.runner = new FixedStepRunner({
            step: (dt, input) => this.update(dt, input),
            render: (alpha) => this.render(alpha)
        });
        this.previousRenderSnapshot = null;
        this.tick = (time) => {
            this.stats = { ...this.stats, ...this.runner.frame(time, this.input.snapshot()) };
            this.frameId = requestAnimationFrame(this.tick);
        };
    }

    setMetricsVisible(visible) {
        this.metricsVisible = Boolean(visible);
    }

    setHudVisible(visible) {
        this.hudVisible = Boolean(visible);
        return this.hudVisible;
    }

    applyDebugSettings({ metrics = this.metricsVisible, startAreaId = null } = {}) {
        this.setMetricsVisible(metrics);
        if (startAreaId && this.authority.applyDebugStartArea(startAreaId)) {
            this.camera = this.createCamera();
        }
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
    }

    update(dt, input) {
        this.latestInput = input;
        const particleBounds = createRenderViewport({
            camera: this.camera,
            cssWidth: this.renderer.cssWidth,
            cssHeight: this.renderer.cssHeight
        }).worldBounds;
        const before = this.authority.snapshot();
        this.previousRenderSnapshot = before;
        const aimWorld = this.renderer.screenToWorld(input.pointer, this.camera);
        this.authority.step(dt, createPlayerCommand(input, aimWorld));
        let state = this.authority.snapshot();
        const authorityEvents = this.authority.drainEvents();
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
        state = this.authority.snapshot();
        const cameraShot = this.updatePresentationCamera(dt, state.player, state.world);
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
        this.calibrationPresentation.update(dt, {
            currentAreaId: cameraShot.areaId,
            player: state.player,
            events: authorityEvents
        });
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

    updateCamera(dt, player, world) {
        return advanceAuthoredCamera({
            camera: this.camera,
            world,
            player,
            mobileView: this.mobileView,
            defaultZoom: CAMERA_CONFIG.desktopZoom,
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

    updatePresentationCamera(dt, player, world) {
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
        if (!phase.holding) return this.updateCamera(dt, player, world);
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
        const state = interpolateRenderSnapshot(this.previousRenderSnapshot, this.authority.snapshot(), alpha);
        const combatFeedback = this.combatFeedback.snapshot();
        this.statusFeedback.apply([state.eventFlash]);
        this.stats.resets = state.resets;
        this.queuePlayerPresentationEvents([state.eventFlash]);
        const playerPresentationEvents = Object.freeze(this.playerPresentationEvents.splice(0));
        const renderMetrics = this.renderer.draw({
            ...state,
            ...combatFeedback,
            localPlayerId: this.authority.playerId,
            playerPresentationEvents,
            storyPresentation: this.storyPresentation.snapshot(),
            calibrationPresentation: this.calibrationPresentation.snapshot(),
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
