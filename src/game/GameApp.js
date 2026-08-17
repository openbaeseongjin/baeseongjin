import { InputSampler } from "../core/input/InputSampler.js";
import { FixedStepRunner } from "../core/sim/FixedStepRunner.js";
import { createGameRenderer, DEFAULT_RENDERER_PROFILE } from "../render/GameRendererFactory.js";
import { assertGameRenderer } from "../render/SceneRenderer.js";
import { createPlayerCommand } from "./commands/PlayerCommand.js";
import { LocalAuthority } from "./runtime/LocalAuthority.js";
import { PredictableProjectileStore } from "./runtime/PredictableProjectileStore.js";
import { createCurrentGameSimulation } from "./simulation/GameSimulationFactory.js";
import { CAMERA_CONFIG } from "./config.js";
import { ClientCombatFeedback } from "./combat/ClientCombatFeedback.js";
import { selectClientStatusFeedback } from "./combat/ClientFeedbackEventObject.js";
import { selectWorldSeed } from "./world/WorldSeed.js";
import { createPlayerPresentationEvents } from "../render/sprites/PlayerPresentationEvent.js";
import { createRenderViewport } from "../render/RenderViewport.js";
import {
    advanceAuthoredCamera,
    localTriggerObjects,
    resolveAuthoredCameraShot
} from "./camera/AuthoredCameraDirector.js";
import { AuthoredStoryPresentation } from "./presentation/AuthoredStoryPresentation.js";
import { interpolateRenderSnapshot } from "../render/interpolateRenderSnapshot.js";

export class GameApp {
    constructor({
        canvas,
        renderer = null,
        onDiagnostics = () => {},
        audioBindings = null,
        worldSeed = selectWorldSeed(globalThis.location?.search),
        startAreaId = null,
        metricsVisible = false
    }) {
        if (!canvas) throw new Error("GameApp requires a canvas element");
        this.renderer = renderer
            ? assertGameRenderer(renderer)
            : createGameRenderer({ canvas, profile: DEFAULT_RENDERER_PROFILE });
        this.input = new InputSampler(globalThis.window, canvas, {
            onRopeRelease: (input, reason) => this.flushInterruptedRopeRelease(input, reason)
        });
        this.authority = new LocalAuthority(createCurrentGameSimulation({ worldSeed, startAreaId }));
        this.mobileView = globalThis.matchMedia?.("(pointer: coarse)").matches ?? false;
        this.metricsVisible = metricsVisible;
        this.onDiagnostics = onDiagnostics;
        this.audioBindings = audioBindings;
        this.camera = this.createCamera();
        this.stats = { totalSteps: 0, droppedSteps: 0, resets: 0 };
        this.frameId = null;
        this.latestInput = this.input.snapshot();
        this.predictableProjectiles = new PredictableProjectileStore();
        this.combatFeedback = new ClientCombatFeedback({ viewerId: this.authority.playerId });
        this.playerPresentationEvents = [];
        this.storyPresentation = new AuthoredStoryPresentation();
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
        const before = this.authority.snapshot();
        this.previousRenderSnapshot = before;
        const aimWorld = this.renderer.screenToWorld(input.pointer, this.camera);
        this.authority.step(dt, createPlayerCommand(input, aimWorld));
        let state = this.authority.snapshot();
        const authorityEvents = this.authority.drainEvents();
        this.playerPresentationEvents.push(...createPlayerPresentationEvents(authorityEvents));
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
        this.playerPresentationEvents.push(...createPlayerPresentationEvents(predictedImpacts));
        this.combatFeedback.apply([...authorityFeedback, ...predictedImpacts]);
        this.combatFeedback.update(dt);
        state = this.authority.snapshot();
        if (state.resets !== before.resets) this.camera = this.createCamera();
        const cameraShot = this.updateCamera(dt, state.player, state.world);
        this.storyPresentation.update(dt, {
            currentAreaId: cameraShot.areaId,
            currentAreaLocalX: cameraShot.localX,
            currentAreaLocalY: cameraShot.localY,
            events: authorityEvents,
            triggers: localTriggerObjects(state.world, cameraShot.areaId)
        });
        const audioScene = this.createAudioContext(state.player.position, state.tick, state.runState);
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
            defaultZoom: this.mobileView ? CAMERA_CONFIG.mobileZoom : CAMERA_CONFIG.desktopZoom,
            cssWidth: this.renderer.cssWidth,
            cssHeight: this.renderer.cssHeight,
            dt
        });
    }

    createCamera() {
        const defaultZoom = this.mobileView ? CAMERA_CONFIG.mobileZoom : CAMERA_CONFIG.desktopZoom;
        const state = this.authority.snapshot();
        const zoom = resolveAuthoredCameraShot({
            world: state.world,
            player: state.player,
            mobileView: this.mobileView,
            defaultZoom
        }).zoom;
        return { x: 0, y: 0, zoom, initialized: false };
    }

    render(alpha = 0) {
        const state = interpolateRenderSnapshot(this.previousRenderSnapshot, this.authority.snapshot(), alpha);
        const combatFeedback = this.combatFeedback.snapshot();
        this.stats.resets = state.resets;
        this.playerPresentationEvents.push(...createPlayerPresentationEvents([state.eventFlash]));
        const playerPresentationEvents = Object.freeze(this.playerPresentationEvents.splice(0));
        const renderMetrics = this.renderer.draw({
            ...state,
            ...combatFeedback,
            localPlayerId: this.authority.playerId,
            playerPresentationEvents,
            storyPresentation: this.storyPresentation.snapshot(),
            eventFlash:
                combatFeedback.eventFlash ?? selectClientStatusFeedback(state.eventFlash, this.authority.playerId),
            camera: this.camera,
            stats: this.stats,
            mobileView: this.mobileView,
            metricsVisible: this.metricsVisible,
            mobileControls: {
                ...this.latestInput.mobileControls,
                visible: this.mobileView || this.latestInput.mobileControls.visible
            }
        });
        if (this.metricsVisible) {
            this.onDiagnostics({ metrics: state.metrics, renderMetrics, worldSeed: state.world.seed });
        }
    }
}
