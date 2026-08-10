import { InputSampler } from "../core/input/InputSampler.js";
import { FixedStepRunner } from "../core/sim/FixedStepRunner.js";
import { Vector2 } from "../game-kit/index.js";
import { CanvasRenderer } from "../render/CanvasRenderer.js";
import { createPlayerCommand } from "./commands/PlayerCommand.js";
import { CAMERA_CONFIG, PLAYER_CONFIG, ROPE_CONFIG } from "./config.js";
import { ClientCombatFeedback } from "./combat/ClientCombatFeedback.js";
import { isMetricsPanelEnabled } from "./metrics/MetricsDebugMode.js";
import { resolvePlayerCollisions } from "./physics/PlayerCollision.js";
import { advanceArtifactRewardSelection, createArtifactRewardSelection } from "./rewards/ArtifactRewardSelection.js";
import { PredictableProjectileStore } from "./runtime/PredictableProjectileStore.js";

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

export function commandForLocalSimulation(command, choosingArtifact) {
    if (!choosingArtifact) return command;
    return Object.freeze({
        ...command,
        horizontal: 0,
        vertical: 0,
        interact: false,
        pointer: Object.freeze({ ...command.pointer, down: false })
    });
}

export class MultiplayerGameApp {
    constructor({ canvas, authority, onDisconnect = () => {}, onDiagnostics = () => {} }) {
        this.renderer = new CanvasRenderer(canvas);
        this.input = new InputSampler(globalThis.window, canvas);
        this.authority = authority;
        this.onDisconnect = onDisconnect;
        this.disconnectHandled = false;
        this.mobileView = globalThis.matchMedia?.("(pointer: coarse)").matches ?? false;
        this.metricsVisible = isMetricsPanelEnabled(globalThis.location?.search);
        this.onDiagnostics = onDiagnostics;
        this.camera = { x: 0, y: 0, zoom: this.mobileView ? CAMERA_CONFIG.mobileZoom : CAMERA_CONFIG.desktopZoom };
        this.latestInput = this.input.snapshot();
        this.frameId = null;
        this.stepCount = 0;
        this.stats = { totalSteps: 0, droppedSteps: 0, resets: 0 };
        this.predictableProjectiles = new PredictableProjectileStore();
        this.combatFeedback = new ClientCombatFeedback();
        this.localArtifactReward = null;
        this.pendingArtifactSelection = null;
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

    syncArtifactReward(authoritativeReward) {
        if (!authoritativeReward) {
            this.localArtifactReward = null;
            this.pendingArtifactSelection = null;
            return;
        }
        if (this.pendingArtifactSelection?.checkpointId === authoritativeReward.checkpointId) return;
        if (this.localArtifactReward?.checkpointId === authoritativeReward.checkpointId) return;
        this.localArtifactReward = createArtifactRewardSelection(authoritativeReward);
    }

    applyArtifactSelectionReceipts(authoritativeReward) {
        for (const receipt of this.authority.drainArtifactSelectionReceipts()) {
            if (receipt.accepted || receipt.checkpointId !== this.pendingArtifactSelection?.checkpointId) continue;
            this.pendingArtifactSelection = null;
            this.localArtifactReward = authoritativeReward ? createArtifactRewardSelection(authoritativeReward) : null;
        }
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
        const authoritativeReward = current.state.artifactRewards?.[this.authority.playerId] ?? null;
        this.applyArtifactSelectionReceipts(authoritativeReward);
        this.syncArtifactReward(authoritativeReward);
        const choosingArtifact = Boolean(this.localArtifactReward || this.pendingArtifactSelection);
        if (this.localArtifactReward) {
            const outcome = advanceArtifactRewardSelection(this.localArtifactReward, command);
            this.localArtifactReward = outcome.selection;
            if (outcome.confirmedArtifactId) {
                this.pendingArtifactSelection = Object.freeze({
                    checkpointId: this.localArtifactReward.checkpointId,
                    artifactId: outcome.confirmedArtifactId
                });
                this.localArtifactReward = null;
                if (!this.authority.submitArtifactSelection(this.pendingArtifactSelection)) {
                    this.pendingArtifactSelection = null;
                    this.localArtifactReward = createArtifactRewardSelection(authoritativeReward);
                }
            }
        }
        const gameplayCommand = commandForLocalSimulation(command, choosingArtifact);
        this.authority.advance(gameplayCommand);
        resolvePlayerCollisions(
            this.authority.predictor.simulation.playerEntity,
            current.state.players.filter(({ id }) => id !== this.authority.playerId),
            PLAYER_CONFIG.radius
        );
        this.predictableProjectiles.predict(this.authority.drainPredictedEvents());
        const predictedPlayer = this.authority.predictor.state();
        const localAuthorityPlayer = current.state.players.find(({ id }) => id === this.authority.playerId);
        const collisionState = {
            ...current.state,
            localPlayer: localAuthorityPlayer
                ? {
                      ...localAuthorityPlayer,
                      position: predictedPlayer.position,
                      rope: predictedPlayer.rope,
                      radius: PLAYER_CONFIG.radius
                  }
                : null
        };
        const predictedResolutions = this.predictableProjectiles.update(dt, collisionState, predictedPlayer.tick);
        for (const resolution of predictedResolutions) {
            if (resolution.projectileId) {
                this.authority.predictor.applyPredictedImpact(resolution);
                this.authority.submitImpactClaim(resolution);
            } else {
                this.authority.submitHitClaim(resolution);
            }
        }
        this.combatFeedback.apply(predictedResolutions);
        this.combatFeedback.update(dt);
        if (this.stepCount % 2 === 0) {
            this.authority.submit(gameplayCommand);
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
        const networkMetrics = { ...this.authority.metrics(), ...this.predictableProjectiles.metrics() };
        if (this.metricsVisible) {
            this.onDiagnostics({ metrics: remote.state.metrics, networkMetrics, worldSeed: base.world.seed });
        }
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
            artifactReward: this.localArtifactReward,
            runState: remote.state.runState,
            defeatReason: remote.state.defeatReason,
            restartRemaining: remote.state.restartRemaining,
            maxAttachDistance: ROPE_CONFIG.maxAttachDistance,
            camera: this.camera,
            stats: this.stats,
            mobileView: this.mobileView,
            metricsVisible: this.metricsVisible,
            metrics: remote.state.metrics,
            networkMetrics,
            mobileControls: {
                ...this.latestInput.mobileControls,
                visible: this.mobileView || this.latestInput.mobileControls.visible
            }
        });
    }
}
