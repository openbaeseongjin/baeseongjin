import { InputSampler } from "../core/input/InputSampler.js";
import { FixedStepRunner } from "../core/sim/FixedStepRunner.js";
import { Vector2 } from "../game-kit/index.js";
import { CanvasRenderer } from "../render/CanvasRenderer.js";
import { createPlayerCommand } from "./commands/PlayerCommand.js";
import { CAMERA_CONFIG, PLAYER_CONFIG, ROPE_CONFIG } from "./config.js";
import { isMetricsPanelEnabled } from "./metrics/MetricsDebugMode.js";
import { PredictableProjectileStore } from "./runtime/PredictableProjectileStore.js";
import { ClientCombatFeedback } from "./combat/ClientCombatFeedback.js";

function renderPlayer(state, predicted = null) {
    const position = predicted?.position ?? state.position;
    const velocity = predicted?.velocity ?? state.velocity;
    return {
        ...state,
        position: new Vector2(position.x, position.y),
        velocity: new Vector2(velocity.x, velocity.y),
        config: PLAYER_CONFIG
    };
}

export class MultiplayerGameApp {
    constructor({ canvas, authority, onDisconnect = () => {} }) {
        this.renderer = new CanvasRenderer(canvas);
        this.input = new InputSampler(globalThis.window, canvas);
        this.authority = authority;
        this.onDisconnect = onDisconnect;
        this.disconnectHandled = false;
        this.mobileView = globalThis.matchMedia?.("(pointer: coarse)").matches ?? false;
        this.metricsVisible = isMetricsPanelEnabled(globalThis.location?.search);
        this.camera = { x: 0, y: 0, zoom: this.mobileView ? CAMERA_CONFIG.mobileZoom : CAMERA_CONFIG.desktopZoom };
        this.latestInput = this.input.snapshot();
        this.frameId = null;
        this.stepCount = 0;
        this.stats = { totalSteps: 0, droppedSteps: 0, resets: 0 };
        this.predictableProjectiles = new PredictableProjectileStore();
        this.combatFeedback = new ClientCombatFeedback();
        this.runner = new FixedStepRunner({ step: (dt, input) => this.update(dt, input), render: () => this.render() });
        this.tick = (time) => {
            this.stats = { ...this.stats, ...this.runner.frame(time, this.input.snapshot()) };
            this.frameId = requestAnimationFrame(this.tick);
        };
    }

    start() {
        this.input.attach();
        this.frameId = requestAnimationFrame(this.tick);
    }

    stop() {
        if (this.frameId !== null) cancelAnimationFrame(this.frameId);
        this.input.detach();
        this.authority.close();
        this.frameId = null;
    }

    update(dt, input) {
        if (this.authority.closed) {
            if (!this.disconnectHandled) {
                this.disconnectHandled = true;
                queueMicrotask(() =>
                    this.onDisconnect(this.authority.closeReason ?? "멀티 서버 연결이 종료되었습니다.")
                );
            }
            return;
        }
        this.latestInput = input;
        this.stepCount += 1;
        const current = this.authority.snapshot(1);
        if (!current.predicted) return;
        const events = this.authority.drainEvents();
        const authorityFeedback = this.predictableProjectiles.apply(
            events,
            this.authority.latestSnapshot.serverTick,
            current.state
        );
        this.combatFeedback.apply(authorityFeedback);
        const aimWorld = this.renderer.screenToWorld(input.pointer, this.camera);
        const command = createPlayerCommand(input, aimWorld);
        this.authority.advance(command);
        this.predictableProjectiles.predict(this.authority.drainPredictedEvents());
        const predictedResolutions = this.predictableProjectiles.update(
            dt,
            current.state,
            this.authority.predictor.state().tick
        );
        for (const resolution of predictedResolutions) this.authority.submitHitClaim(resolution);
        this.combatFeedback.apply(predictedResolutions);
        this.combatFeedback.update(dt);
        if (this.stepCount % 2 === 0) {
            this.authority.submit(command);
        }
        const player = this.authority.snapshot(1).predicted;
        const targetX = player.position.x - (this.renderer.cssWidth / this.camera.zoom) * 0.38;
        const targetY = player.position.y - (this.renderer.cssHeight / this.camera.zoom) * 0.58;
        const blend = 1 - Math.exp(-5 * dt);
        this.camera.x += (targetX - this.camera.x) * blend;
        this.camera.y += (targetY - this.camera.y) * blend;
    }

    render() {
        const remote = this.authority.snapshot(1);
        if (!remote.state || !remote.predicted) return;
        const localState = remote.state.players.find(({ id }) => id === this.authority.playerId);
        if (!localState) return;
        const base = this.authority.predictor.simulation.snapshot();
        const predictableProjectiles = this.predictableProjectiles.snapshot();
        const player = renderPlayer(localState, remote.predicted);
        const otherPlayers = remote.state.players
            .filter(({ id }) => id !== this.authority.playerId)
            .map((state) => renderPlayer(state));
        const activeCheckpoint =
            base.world.checkpoints.find(({ id }) => id === remote.state.activeCheckpointId) ?? null;
        this.renderer.draw({
            ...base,
            player,
            rope: remote.predicted.rope,
            swingDrag: remote.predicted.swingDrag,
            attachmentCandidate: this.authority.predictor.simulation.playerEntity.attachmentCandidate,
            enemies: remote.state.enemies,
            ...predictableProjectiles,
            ...this.combatFeedback.snapshot(),
            otherPlayers,
            playerHealth: localState.health,
            playerMaxHealth: localState.maxHealth,
            ropeDisabledRemaining: localState.ropeDisabledRemaining,
            playerLifeState: localState.lifeState,
            artifacts: localState.artifacts,
            ropeDamageBoostRemaining: localState.ropeDamageBoostRemaining,
            activeCheckpoint,
            artifactReward: remote.state.artifactRewards?.[this.authority.playerId] ?? null,
            runState: remote.state.runState,
            defeatReason: remote.state.defeatReason,
            restartRemaining: remote.state.restartRemaining,
            maxAttachDistance: ROPE_CONFIG.maxAttachDistance,
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
