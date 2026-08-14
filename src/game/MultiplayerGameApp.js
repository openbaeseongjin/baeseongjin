import { InputSampler } from "../core/input/InputSampler.js";
import { FixedStepRunner } from "../core/sim/FixedStepRunner.js";
import { Vector2 } from "../game-kit/index.js";
import { createGameRenderer, DEFAULT_RENDERER_PROFILE } from "../render/GameRendererFactory.js";
import { assertGameRenderer } from "../render/SceneRenderer.js";
import { createPlayerCommand } from "./commands/PlayerCommand.js";
import { CAMERA_CONFIG, ROPE_CONFIG } from "./config.js";
import { ClientCombatFeedback } from "./combat/ClientCombatFeedback.js";
import { selectClientStatusFeedback } from "./combat/ClientFeedbackEventObject.js";
import { isMetricsPanelEnabled } from "./metrics/MetricsDebugMode.js";
import { advanceArtifactRewardSelection, createArtifactRewardSelection } from "./rewards/ArtifactRewardSelection.js";
import { PredictableProjectileStore } from "./runtime/PredictableProjectileStore.js";
import { createPlayerPresentationEvents } from "../render/sprites/PlayerPresentationEvent.js";
import { createRenderViewport } from "../render/RenderViewport.js";
import { advanceAuthoredCamera } from "./camera/AuthoredCameraDirector.js";
import { AuthoredStoryPresentation } from "./presentation/AuthoredStoryPresentation.js";

function renderPlayer(state, predicted = null) {
    const position = predicted?.position ?? state.position;
    const velocity = predicted?.velocity ?? state.velocity;
    return {
        ...state,
        angle: predicted?.angle ?? state.angle,
        angularVelocity: predicted?.angularVelocity ?? state.angularVelocity,
        rope: predicted?.rope ?? state.rope,
        position: new Vector2(position.x, position.y),
        velocity: new Vector2(velocity.x, velocity.y)
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
    constructor({
        canvas,
        renderer = null,
        authority,
        onDisconnect = () => {},
        onDiagnostics = () => {},
        audioBindings = null
    }) {
        this.renderer = renderer
            ? assertGameRenderer(renderer)
            : createGameRenderer({ canvas, profile: DEFAULT_RENDERER_PROFILE });
        this.input = new InputSampler(globalThis.window, canvas, {
            onRopeRelease: (input, reason) => this.flushInterruptedRopeRelease(input, reason)
        });
        this.authority = authority;
        this.onDisconnect = onDisconnect;
        this.disconnectHandled = false;
        this.mobileView = globalThis.matchMedia?.("(pointer: coarse)").matches ?? false;
        this.metricsVisible = isMetricsPanelEnabled(globalThis.location?.search);
        this.onDiagnostics = onDiagnostics;
        this.audioBindings = audioBindings;
        this.camera = {
            x: 0,
            y: 0,
            zoom: this.mobileView ? CAMERA_CONFIG.mobileZoom : CAMERA_CONFIG.desktopZoom,
            initialized: false
        };
        this.latestInput = this.input.snapshot();
        this.frameId = null;
        this.stepCount = 0;
        this.stats = { totalSteps: 0, droppedSteps: 0, resets: 0 };
        this.predictableProjectiles = new PredictableProjectileStore();
        this.combatFeedback = new ClientCombatFeedback({ viewerId: this.authority.playerId });
        this.checkpointFeedback = null;
        this.playerPresentationEvents = [];
        this.storyPresentation = new AuthoredStoryPresentation();
        this.localRunCompleted = false;
        this.localArtifactReward = null;
        this.pendingArtifactSelection = null;
        this.runner = new FixedStepRunner({ step: (dt, input) => this.update(dt, input), render: () => this.render() });
        this.tick = (time) => {
            this.stats = { ...this.stats, ...this.runner.frame(time, this.input.snapshot()) };
            this.frameId = requestAnimationFrame(this.tick);
        };
    }

    flushInterruptedRopeRelease(input, reason) {
        if (reason === "pointerup" || this.authority.closed || !this.authority.snapshot().owner) return false;
        this.update(this.runner.dt, input, true);
        return true;
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

    showCheckpointFeedback({ checkpointId, position }) {
        if (this.checkpointFeedback?.checkpointId === checkpointId) return;
        this.checkpointFeedback = { type: "checkpoint", checkpointId, position: { ...position }, age: 0 };
    }

    applyCheckpointEvents(events) {
        for (const event of events) {
            if (event.eventType !== "checkpoint-reached") continue;
            this.showCheckpointFeedback({ checkpointId: event.checkpointId, position: event.position });
        }
    }

    applyCheckpointClaimReceipts() {
        for (const receipt of this.authority.drainCheckpointClaimReceipts()) {
            if (receipt.accepted || receipt.checkpointId !== this.checkpointFeedback?.checkpointId) continue;
            this.checkpointFeedback = null;
        }
    }

    applySummitClaimReceipts() {
        for (const receipt of this.authority.drainSummitClaimReceipts()) {
            if (!receipt.accepted) this.localRunCompleted = false;
        }
    }

    updateCheckpointFeedback(dt) {
        if (!this.checkpointFeedback) return;
        this.checkpointFeedback.age += dt;
        if (this.checkpointFeedback.age >= 0.8) this.checkpointFeedback = null;
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

    update(dt, input, forceSubmit = false) {
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
        const initialAudioContext = this.createAudioContext(
            current.predicted.position,
            current.predicted.tick,
            current.state.runState
        );
        this.audioBindings?.presentFrame({ events, context: initialAudioContext });
        this.playerPresentationEvents.push(...createPlayerPresentationEvents(events));
        this.applyCheckpointEvents(events);
        this.applyCheckpointClaimReceipts();
        this.applySummitClaimReceipts();
        this.predictableProjectiles.applySpawnClaimReceipts(this.authority.drainProjectileSpawnClaimReceipts());
        this.authority.drainRopeSwingClaimReceipts();
        this.predictableProjectiles.applyHitClaimReceipts(this.authority.drainHitClaimReceipts());
        this.predictableProjectiles.applyImpactReceipts(this.authority.drainImpactClaimReceipts());
        const authorityFeedback = this.predictableProjectiles.apply(events, current.serverTick, current.state);
        this.combatFeedback.apply(authorityFeedback);
        if (current.state.runState === "completed") this.localRunCompleted = false;
        if (this.localRunCompleted || current.state.runState === "completed") {
            this.combatFeedback.update(dt);
            this.updateCheckpointFeedback(dt);
            this.audioBindings?.presentFrame({ scene: { ...initialAudioContext, runState: "completed" } });
            return;
        }
        const aimWorld = this.renderer.screenToWorld(input.pointer, this.camera);
        const command = createPlayerCommand(input, aimWorld);
        const authoritativeReward = current.state.artifactRewards?.[this.authority.playerId] ?? null;
        this.applyArtifactSelectionReceipts(authoritativeReward);
        this.syncArtifactReward(current.ownerArtifactReward ?? authoritativeReward);
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
        const checkpointClaim = this.authority.submitReachedCheckpoint();
        if (checkpointClaim) {
            this.showCheckpointFeedback({
                checkpointId: checkpointClaim.checkpointId,
                position: checkpointClaim.feedbackPosition
            });
            this.syncArtifactReward(this.authority.snapshot().ownerArtifactReward);
            this.audioBindings?.presentFrame({
                checkpoint: { checkpointId: checkpointClaim.checkpointId, position: checkpointClaim.feedbackPosition },
                context: initialAudioContext
            });
        }
        if (this.authority.submitReachedSummit()) {
            this.localRunCompleted = true;
            this.audioBindings?.presentFrame({ scene: { ...initialAudioContext, runState: "completed" } });
            return;
        }
        this.authority.resolveOwnerCollisions(current.state.players.filter(({ id }) => id !== this.authority.playerId));
        const predictedEvents = this.authority.drainPredictedEvents();
        this.audioBindings?.presentFrame({ events: predictedEvents, context: initialAudioContext });
        const predictedSwings = predictedEvents.filter(({ eventType }) => eventType === "predicted-rope-swing");
        const predictedSpawns = predictedEvents.filter(({ eventType }) => eventType === "predicted-spawn");
        for (const event of predictedSwings) this.authority.submitRopeSwingClaim(event);
        this.predictableProjectiles.predict(predictedSpawns);
        for (const event of predictedSpawns) this.authority.submitProjectileSpawnClaim(event);
        const predictedPlayer = this.authority.snapshot().owner;
        const predictedAudioContext = this.createAudioContext(predictedPlayer.position, predictedPlayer.tick);
        this.audioBindings?.presentFrame({
            ropeTransition: { before: current.predicted.rope, after: predictedPlayer.rope },
            context: predictedAudioContext
        });
        const localAuthorityPlayer = current.state.players.find(({ id }) => id === this.authority.playerId);
        const collisionState = {
            ...current.state,
            localPlayer: localAuthorityPlayer
                ? {
                      ...localAuthorityPlayer,
                      position: predictedPlayer.position,
                      angle: predictedPlayer.angle,
                      angularVelocity: predictedPlayer.angularVelocity,
                      rope: predictedPlayer.rope,
                      hitInvulnerabilityRemaining: predictedPlayer.hitInvulnerabilityRemaining,
                      collider: predictedPlayer.collider
                  }
                : null
        };
        const predictedResolutions = this.predictableProjectiles.update(dt, collisionState, predictedPlayer.tick);
        this.audioBindings?.presentFrame({ events: predictedResolutions, context: predictedAudioContext });
        this.playerPresentationEvents.push(...createPlayerPresentationEvents(predictedResolutions));
        for (const resolution of predictedResolutions) {
            if (resolution.projectileId) {
                this.authority.resolvePredictedImpact(resolution);
            } else {
                this.authority.submitHitClaim(resolution);
            }
        }
        this.combatFeedback.apply(predictedResolutions);
        this.combatFeedback.update(dt);
        this.updateCheckpointFeedback(dt);
        if (forceSubmit || this.stepCount % 2 === 0) {
            this.authority.submit(gameplayCommand);
        }
        const player = this.authority.snapshot(1).predicted;
        const authoredWorld = this.authority.renderSnapshot()?.world;
        const cameraShot = advanceAuthoredCamera({
            camera: this.camera,
            world: authoredWorld,
            player,
            mobileView: this.mobileView,
            defaultZoom: this.mobileView ? CAMERA_CONFIG.mobileZoom : CAMERA_CONFIG.desktopZoom,
            cssWidth: this.renderer.cssWidth,
            cssHeight: this.renderer.cssHeight,
            dt
        });
        this.storyPresentation.update(dt, {
            currentAreaId: cameraShot.areaId,
            currentAreaLocalY: cameraShot.localY,
            events
        });
        this.audioBindings?.presentFrame({
            scene: this.createAudioContext(
                player.position,
                player.tick,
                this.localRunCompleted ? "completed" : current.state.runState
            )
        });
    }

    render() {
        const remote = this.authority.snapshot(1);
        if (!remote.state || !remote.predicted) return;
        const localState = remote.state.players.find(({ id }) => id === this.authority.playerId);
        if (!localState) return;
        const base = this.authority.renderSnapshot();
        if (!base) return;
        const predictableProjectiles = this.predictableProjectiles.snapshot();
        const player = renderPlayer(localState, remote.predicted);
        const otherPlayers = remote.state.players
            .filter(({ id }) => id !== this.authority.playerId)
            .map((state) => renderPlayer(state));
        const activeCheckpoint =
            base.world.checkpoints.find(({ id }) => id === remote.state.activeCheckpointId) ?? null;
        const networkMetrics = { ...this.authority.metrics(), ...this.predictableProjectiles.metrics() };
        const combatFeedback = this.combatFeedback.snapshot();
        this.playerPresentationEvents.push(...createPlayerPresentationEvents([base.eventFlash]));
        const playerPresentationEvents = Object.freeze(this.playerPresentationEvents.splice(0));
        const renderMetrics = this.renderer.draw({
            ...base,
            player,
            rope: remote.predicted.rope,
            swingDrag: remote.predicted.swingDrag,
            attachmentCandidate: base.attachmentCandidate,
            enemies: remote.state.enemies,
            ...predictableProjectiles,
            ...combatFeedback,
            localPlayerId: this.authority.playerId,
            playerPresentationEvents,
            storyPresentation: this.storyPresentation.snapshot(),
            eventFlash:
                combatFeedback.eventFlash ??
                this.checkpointFeedback ??
                selectClientStatusFeedback(base.eventFlash, this.authority.playerId),
            otherPlayers,
            playerHealth: remote.predicted.health,
            playerMaxHealth: remote.predicted.maxHealth,
            ropeDisabledRemaining: remote.predicted.ropeDisabledRemaining,
            playerLifeState: remote.predicted.lifeState,
            artifacts: remote.predicted.artifacts,
            ropeDamageBoostRemaining: remote.predicted.ropeDamageBoostRemaining,
            activeCheckpoint,
            artifactReward: this.localArtifactReward,
            runState: this.localRunCompleted ? "completed" : remote.state.runState,
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
        if (this.metricsVisible) {
            this.onDiagnostics({
                metrics: remote.state.metrics,
                networkMetrics,
                renderMetrics,
                worldSeed: base.world.seed
            });
        }
    }
}
