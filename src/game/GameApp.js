import { InputSampler } from "../core/input/InputSampler.js";
import { FixedStepRunner } from "../core/sim/FixedStepRunner.js";
import { CanvasRenderer } from "../render/CanvasRenderer.js";
import { createPlayerCommand } from "./commands/PlayerCommand.js";
import { LocalAuthority } from "./runtime/LocalAuthority.js";
import { PredictableProjectileStore } from "./runtime/PredictableProjectileStore.js";
import { GameSimulation } from "./simulation/GameSimulation.js";
import { CAMERA_CONFIG, PLAYER_CONFIG } from "./config.js";
import { isMetricsPanelEnabled } from "./metrics/MetricsDebugMode.js";
import { ClientCombatFeedback } from "./combat/ClientCombatFeedback.js";
import { selectWorldSeed } from "./world/WorldSeed.js";

export class GameApp {
    constructor({ canvas, onDiagnostics = () => {}, worldSeed = selectWorldSeed(globalThis.location?.search) }) {
        if (!canvas) throw new Error("GameApp requires a canvas element");
        this.renderer = new CanvasRenderer(canvas);
        this.input = new InputSampler(globalThis.window, canvas, {
            onRopeRelease: (input, reason) => this.flushInterruptedRopeRelease(input, reason)
        });
        this.authority = new LocalAuthority(new GameSimulation({ worldSeed }));
        this.mobileView = globalThis.matchMedia?.("(pointer: coarse)").matches ?? false;
        this.metricsVisible = isMetricsPanelEnabled(globalThis.location?.search);
        this.onDiagnostics = onDiagnostics;
        this.camera = this.createCamera();
        this.stats = { totalSteps: 0, droppedSteps: 0, resets: 0 };
        this.frameId = null;
        this.latestInput = this.input.snapshot();
        this.predictableProjectiles = new PredictableProjectileStore();
        this.combatFeedback = new ClientCombatFeedback();
        this.runner = new FixedStepRunner({
            step: (dt, input) => this.update(dt, input),
            render: () => this.render()
        });
        this.tick = (time) => {
            this.stats = { ...this.stats, ...this.runner.frame(time, this.input.snapshot()) };
            this.frameId = requestAnimationFrame(this.tick);
        };
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
        const aimWorld = this.renderer.screenToWorld(input.pointer, this.camera);
        this.authority.step(dt, createPlayerCommand(input, aimWorld));
        let state = this.authority.snapshot();
        const authorityEvents = this.authority.drainEvents();
        const authorityFeedback = this.predictableProjectiles.apply(authorityEvents, state.tick, state);
        const owner = this.authority.ownerState();
        const predictedImpacts = this.predictableProjectiles
            .update(
                dt,
                {
                    enemies: state.enemies,
                    localPlayer: { ...owner, radius: PLAYER_CONFIG.radius }
                },
                state.tick
            )
            .filter(({ projectileId }) => projectileId);
        for (const impact of predictedImpacts) this.authority.submitImpactClaim(impact);
        this.combatFeedback.apply([...authorityFeedback, ...predictedImpacts]);
        this.combatFeedback.update(dt);
        state = this.authority.snapshot();
        if (state.resets !== before.resets) this.camera = this.createCamera();
        this.updateCamera(dt, state.player);
    }

    updateCamera(dt, player) {
        const targetX = player.position.x - (this.renderer.cssWidth / this.camera.zoom) * 0.38;
        const targetY = player.position.y - (this.renderer.cssHeight / this.camera.zoom) * 0.58;
        const blend = 1 - Math.exp(-5 * dt);
        this.camera.x += (targetX - this.camera.x) * blend;
        this.camera.y += (targetY - this.camera.y) * blend;
    }

    createCamera() {
        return { x: 0, y: 0, zoom: this.mobileView ? CAMERA_CONFIG.mobileZoom : CAMERA_CONFIG.desktopZoom };
    }

    render() {
        const state = this.authority.snapshot();
        if (this.metricsVisible) this.onDiagnostics({ metrics: state.metrics, worldSeed: state.world.seed });
        this.stats.resets = state.resets;
        this.renderer.draw({
            ...state,
            ...this.combatFeedback.snapshot(),
            camera: this.camera,
            stats: this.stats,
            mobileView: this.mobileView,
            metricsVisible: this.metricsVisible,
            mobileControls: {
                ...this.latestInput.mobileControls,
                visible: this.mobileView || this.latestInput.mobileControls.visible
            }
        });
    }
}
