import { InputSampler } from "../core/input/InputSampler.js";
import { FixedStepRunner } from "../core/sim/FixedStepRunner.js";
import { Vector2 } from "../game-kit/index.js";
import { createGameRenderer, DEFAULT_RENDERER_PROFILE } from "../render/GameRendererFactory.js";
import { assertGameRenderer } from "../render/SceneRenderer.js";
import { createPlayerCommand } from "./commands/PlayerCommand.js";
import { CAMERA_CONFIG, resolveMobileCameraZoom } from "./config.js";
import { ClientCombatFeedback } from "./combat/ClientCombatFeedback.js";
import { PLATFORM_COLLISION_DAMAGE_EVENT_TYPE } from "./combat/PlatformCollisionDamage.js";
import { createBossPresentationEvents, createBossStagePresentation } from "../render/boss/BossStagePresentation.js";
import { bossStageSpecById } from "./boss-authoring/BossStageCatalog.js";
import { ClientStatusFeedback } from "./combat/ClientStatusFeedback.js";
import { selectClientStatusFeedback } from "./combat/ClientStatusFeedback.js";
import { advanceAugmentRewardSelection, createAugmentRewardSelection } from "./rewards/AugmentRewardSelection.js";
import { PredictableProjectileStore } from "./runtime/PredictableProjectileStore.js";
import { createPlayerPresentationEvents } from "../render/sprites/PlayerPresentationEvent.js";
import { DEFAULT_PLAYER_SPRITE_DEFINITION } from "../render/sprites/PlayerSpriteCatalog.js";
import { createRenderViewport } from "../render/RenderViewport.js";
import {
    advanceAuthoredCamera,
    localTriggerObjects,
    resolveAuthoredCameraShot
} from "./camera/AuthoredCameraDirector.js";
import { createLocalDirectionRuntime } from "./direction/DirectionProductionAdapters.js";
import { PlayerRespawnPresentation } from "./presentation/PlayerRespawnPresentation.js";
import { WorldUnlockPresentation } from "./presentation/WorldUnlockPresentation.js";
import { FinalEscapeCinematic } from "./presentation/FinalEscapeCinematic.js";
import {
    BOSS_CAMERA_ZOOM_RATIO,
    bossCameraFocusPlayer,
    localBossStageSnapshot
} from "./presentation/BossStageLocalView.js";
import { ropeAnchorState } from "./rope/RopeAttachment.js";
import { PLAYER_IMPACT_SOURCE_KIND } from "./network/PlayerImpactClaim.js";
import { MultiplayerChatPanel } from "./ui/MultiplayerChatPanel.js";
import { definePartyChatPlayerMessage } from "./presentation/PlayerMessageCatalog.js";

function ropeAtBossTransform(rope, bossStage) {
    if (!rope?.isAttached || !rope.anchorOwnerId || !rope.anchorLocalOffset) return rope;
    const owner = bossStage?.ropeAttachmentActors?.find(({ id }) => id === rope.anchorOwnerId);
    if (!owner) return rope;
    return Object.freeze({ ...rope, anchor: ropeAnchorState(owner, rope.anchorLocalOffset).position });
}

function renderPlayer(state, predicted = null, bossStage = null) {
    const position = predicted?.position ?? state.position;
    const velocity = predicted?.velocity ?? state.velocity;
    const rope = predicted?.rope ?? state.rope;
    return {
        ...state,
        angle: predicted?.angle ?? state.angle,
        angularVelocity: predicted?.angularVelocity ?? state.angularVelocity,
        statusEffects: predicted?.statusEffects ?? state.statusEffects,
        rope: ropeAtBossTransform(rope, bossStage),
        position: new Vector2(position.x, position.y),
        velocity: new Vector2(velocity.x, velocity.y)
    };
}

export function commandForLocalSimulation(command, choosingChoice) {
    if (!choosingChoice) return command;
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
        audioBindings = null,
        metricsVisible = false,
        hudVisible = true,
        playerDefinition = null,
        directionDefinitions = [],
        chatPanelRoot = null
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
        this.metricsVisible = metricsVisible;
        this.hudVisible = hudVisible !== false;
        this.onDiagnostics = onDiagnostics;
        this.audioBindings = audioBindings;
        this.camera = {
            x: 0,
            y: 0,
            zoom: this.mobileView
                ? resolveMobileCameraZoom(undefined, {
                      cssWidth: globalThis.innerWidth,
                      cssHeight: globalThis.innerHeight
                  })
                : CAMERA_CONFIG.desktopZoom,
            initialized: false
        };
        this.latestInput = this.input.snapshot();
        this.frameId = null;
        this.stepCount = 0;
        this.stats = { totalSteps: 0, droppedSteps: 0, resets: 0 };
        this.predictableProjectiles = new PredictableProjectileStore();
        this.combatFeedback = new ClientCombatFeedback({ viewerId: this.authority.playerId });
        this.statusFeedback = new ClientStatusFeedback({ viewerId: this.authority.playerId });
        this.checkpointFeedback = null;
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
        this.chatPanel = new MultiplayerChatPanel({
            root: chatPanelRoot,
            returnFocus: canvas,
            onActiveChange: (active) => this.input.setSuspended(active, "party-chat"),
            onSubmit: (text) => this.submitPartyChat(text)
        });
        this.localRunCompleted = false;
        this.localAugmentReward = null;
        this.pendingAugmentSelection = null;
        this.augmentFeedback = null;
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
        this.chatPanel.attach();
        this.input.attach();
        this.frameId = requestAnimationFrame(this.tick);
    }

    stop() {
        if (this.frameId !== null) cancelAnimationFrame(this.frameId);
        this.chatPanel.detach();
        this.input.detach();
        this.authority.close();
        this.frameId = null;
        this.finalEscapeCinematic.dispose();
    }

    setMetricsVisible(visible) {
        this.metricsVisible = Boolean(visible);
    }

    setHudVisible(visible) {
        this.hudVisible = Boolean(visible);
        return this.hudVisible;
    }

    submitPartyChat(text) {
        const message = this.authority.submitPartyChat(text);
        if (!message) return false;
        this.playerMessagePresentation.enqueue(definePartyChatPlayerMessage(message));
        return true;
    }

    receivePartyChatMessages() {
        for (const message of this.authority.drainPartyChatMessages()) {
            this.playerMessagePresentation.enqueue(definePartyChatPlayerMessage(message));
        }
    }

    applyDebugSettings({ metrics = this.metricsVisible, startAreaId = null } = {}) {
        this.setMetricsVisible(metrics);
        if (startAreaId) this.authority.requestDebugTeleport(startAreaId);
    }

    syncAugmentReward(authoritativeReward, selectedAugmentIds = []) {
        if (this.pendingAugmentSelection && selectedAugmentIds.includes(this.pendingAugmentSelection.augmentId)) {
            this.localAugmentReward = null;
            this.pendingAugmentSelection = null;
            return;
        }
        if (this.pendingAugmentSelection) return;
        if (this.localAugmentReward) return;
        if (!authoritativeReward) return;
        this.localAugmentReward = createAugmentRewardSelection(authoritativeReward);
    }

    applyAugmentSelectionReceipts(authoritativeReward) {
        for (const receipt of this.authority.drainAugmentSelectionReceipts()) {
            if (receipt.sourceId !== this.pendingAugmentSelection?.sourceId) continue;
            const pending = this.pendingAugmentSelection;
            this.pendingAugmentSelection = null;
            if (receipt.accepted) {
                this.localAugmentReward = null;
                continue;
            }
            this.authority.rejectPredictedAugmentSelection(pending.sourceId);
            this.localAugmentReward = authoritativeReward ? createAugmentRewardSelection(authoritativeReward) : null;
        }
    }

    applyAugmentFeedback(events, dt) {
        const latest = [...events]
            .reverse()
            .find(({ eventType }) => eventType?.includes("augment-") || eventType === "augment-selected");
        if (latest) {
            this.augmentFeedback = {
                ...latest,
                type: latest.eventType.replace(/^predicted-/, ""),
                age: 0
            };
        } else if (this.augmentFeedback) {
            this.augmentFeedback.age += dt;
            if (this.augmentFeedback.age >= 2.2) this.augmentFeedback = null;
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
        this.finalEscapeCinematic.sync(this.localRunCompleted ? "completed" : current.state.runState);
        if (!current.predicted) return;
        this.receivePartyChatMessages();
        const particleBounds = createRenderViewport({
            camera: this.camera,
            cssWidth: this.renderer.cssWidth,
            cssHeight: this.renderer.cssHeight
        }).worldBounds;
        const events = this.authority.drainEvents();
        this.bossPresentationEvents.push(...createBossPresentationEvents(events));
        this.statusFeedback.update(dt);
        this.statusFeedback.apply(events);
        this.worldUnlockPresentation.prepare(events, {
            world: this.authority.worldSnapshot(),
            camera: this.camera,
            cssWidth: this.renderer.cssWidth,
            cssHeight: this.renderer.cssHeight
        });
        const initialAudioContext = this.createAudioContext(
            current.predicted.position,
            current.predicted.tick,
            current.state.runState
        );
        this.audioBindings?.presentFrame({ events, context: initialAudioContext });
        this.queuePlayerPresentationEvents(events);
        this.applyCheckpointEvents(events);
        this.applyCheckpointClaimReceipts();
        this.applySummitClaimReceipts();
        this.predictableProjectiles.applySpawnClaimReceipts(this.authority.drainProjectileSpawnClaimReceipts());
        this.predictableProjectiles.applyHitClaimReceipts(this.authority.drainHitClaimReceipts());
        this.predictableProjectiles.applyImpactReceipts(this.authority.drainImpactClaimReceipts());
        const authorityFeedback = this.predictableProjectiles.apply(events, current.serverTick, current.state);
        this.combatFeedback.apply(authorityFeedback, { visibleWorldBounds: particleBounds });
        if (current.state.runState === "completed") this.localRunCompleted = false;
        if (this.localRunCompleted || current.state.runState === "completed") {
            this.playerMessagePresentation.update(dt, { storyPresentation: this.storyPresentation.snapshot() });
            this.combatFeedback.update(dt);
            this.updateCheckpointFeedback(dt);
            this.audioBindings?.presentFrame({ scene: { ...initialAudioContext, runState: "completed" } });
            return;
        }
        const aimWorld = this.renderer.screenToWorld(input.pointer, this.camera);
        const command = createPlayerCommand(input, aimWorld);
        const authoritativeAugmentReward =
            current.ownerAugmentReward ?? current.state.augmentRewards?.[this.authority.playerId] ?? null;
        this.applyAugmentSelectionReceipts(authoritativeAugmentReward);
        this.syncAugmentReward(authoritativeAugmentReward, current.owner.selectedAugmentIds ?? []);
        const choosingAugment = Boolean(this.localAugmentReward || this.pendingAugmentSelection);
        if (this.localAugmentReward) {
            const outcome = advanceAugmentRewardSelection(this.localAugmentReward, command);
            this.localAugmentReward = outcome.selection;
            if (outcome.confirmedAugmentId) {
                this.pendingAugmentSelection = Object.freeze({
                    sourceId: this.localAugmentReward.sourceId,
                    augmentId: outcome.confirmedAugmentId
                });
                this.localAugmentReward = null;
                if (
                    !this.authority.applyPredictedAugmentSelection(this.pendingAugmentSelection) ||
                    !this.authority.submitAugmentSelection(this.pendingAugmentSelection)
                ) {
                    const sourceId = this.pendingAugmentSelection.sourceId;
                    this.pendingAugmentSelection = null;
                    this.authority.rejectPredictedAugmentSelection(sourceId);
                    this.localAugmentReward = authoritativeAugmentReward
                        ? createAugmentRewardSelection(authoritativeAugmentReward)
                        : null;
                }
            }
        }
        const gameplayCommand = commandForLocalSimulation(command, choosingAugment);
        this.authority.advance(gameplayCommand);
        if (current.state.progressKind === "area") {
            const checkpointClaim = this.authority.submitReachedCheckpoint();
            if (checkpointClaim) {
                this.showCheckpointFeedback({
                    checkpointId: checkpointClaim.checkpointId,
                    position: checkpointClaim.feedbackPosition
                });
                this.audioBindings?.presentFrame({
                    checkpoint: {
                        checkpointId: checkpointClaim.checkpointId,
                        position: checkpointClaim.feedbackPosition
                    },
                    context: initialAudioContext
                });
            }
            if (this.authority.submitReachedSummit()) {
                this.localRunCompleted = true;
                this.audioBindings?.presentFrame({ scene: { ...initialAudioContext, runState: "completed" } });
                return;
            }
        }
        const ownerCollisionOutcome = this.authority.resolveOwnerCollisions(
            current.state.players.filter(({ id }) => id !== this.authority.playerId)
        );
        for (const event of ownerCollisionOutcome?.incomingSpellImpacts ?? []) {
            this.authority.submitIncomingSpellImpact(event);
        }
        const predictedEvents = this.authority.drainPredictedEvents();
        this.queuePlayerPresentationEvents(predictedEvents);
        this.applyAugmentFeedback([...events, ...predictedEvents], dt);
        this.authority.drainRopeImpactReceipts();
        this.audioBindings?.presentFrame({ events: predictedEvents, context: initialAudioContext });
        this.combatFeedback.apply(predictedEvents, { visibleWorldBounds: particleBounds });
        const predictedSpawns = predictedEvents.filter(({ eventType }) => eventType === "predicted-spawn");
        for (const event of predictedEvents.filter(({ parameters }) => parameters?.sourceKind === "rope-impact")) {
            this.authority.submitRopeImpact(event);
        }
        for (const event of predictedEvents.filter(({ parameters }) => parameters?.sourceKind === "augment-impact")) {
            this.authority.submitAugmentImpact(event);
        }
        for (const event of predictedEvents.filter(
            ({ eventType }) => eventType === PLATFORM_COLLISION_DAMAGE_EVENT_TYPE.PREDICTED
        )) {
            this.authority.submitPredictedPlatformCollisionImpact(event);
        }
        for (const event of predictedEvents.filter(({ parameters }) => parameters?.sourceKind === "boss-hazard")) {
            this.authority.submitPredictedBossImpact(event);
        }
        for (const event of predictedEvents.filter(
            ({ parameters }) => parameters?.sourceKind === PLAYER_IMPACT_SOURCE_KIND.HARDPOINT_JAMMER
        )) {
            this.authority.submitPredictedJammerImpact(event);
        }
        this.predictableProjectiles.predict(predictedSpawns);
        for (const event of predictedSpawns) this.authority.submitProjectileSpawnClaim(event);
        const predictedPlayer = this.authority.ownerState();
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
                      collider: predictedPlayer.collider
                  }
                : null
        };
        const predictedResolutions = this.predictableProjectiles.update(dt, collisionState, predictedPlayer.tick);
        this.audioBindings?.presentFrame({ events: predictedResolutions, context: predictedAudioContext });
        const presentationResolutions = [];
        for (const resolution of predictedResolutions) {
            if (resolution.projectileId) {
                const respawned =
                    resolution.resolution === "player-hit" &&
                    (resolution.parameters?.damage ?? 0) >= collisionState.localPlayer.health;
                this.authority.resolvePredictedImpact(resolution);
                presentationResolutions.push(respawned ? { ...resolution, respawned: true } : resolution);
            } else {
                this.authority.submitHitClaim(resolution);
                presentationResolutions.push(resolution);
            }
        }
        this.queuePlayerPresentationEvents(presentationResolutions);
        this.combatFeedback.apply(predictedResolutions, { visibleWorldBounds: particleBounds });
        const presentationState = this.authority.renderSnapshot();
        if (presentationState) {
            const replicatedProjectiles = this.predictableProjectiles.snapshot();
            this.combatFeedback.syncContinuous(
                {
                    ...presentationState,
                    bossStage:
                        current.state.bossStage ??
                        current.state.bossStageRuntime ??
                        current.state.bossRuntime ??
                        presentationState.bossStage,
                    players: current.state.players.map((player) =>
                        player.id === this.authority.playerId ? presentationState.player : player
                    ),
                    projectiles: replicatedProjectiles.projectiles,
                    enemyProjectiles: replicatedProjectiles.enemyProjectiles,
                    augmentProjectiles: [
                        ...(presentationState.augmentProjectiles ?? []),
                        ...current.state.players.flatMap(
                            (player) => player.augmentRuntimeState?.combat?.spellProjectiles ?? []
                        )
                    ],
                    augmentAreas: current.state.players.flatMap(
                        (player) => player.augmentRuntimeState?.combat?.spellAreas ?? []
                    )
                },
                dt,
                particleBounds
            );
        }
        this.combatFeedback.update(dt);
        this.updateCheckpointFeedback(dt);
        if (forceSubmit || this.stepCount % 2 === 0) {
            this.authority.submit(gameplayCommand);
        }
        const player = this.authority.presentationState();
        const authoredWorld = this.authority.worldSnapshot();
        const cameraShot = this.updatePresentationCamera(
            dt,
            player,
            authoredWorld,
            this.authority.bossStageSnapshot() ??
                current.state.bossStage ??
                current.state.bossStageRuntime ??
                current.state.bossRuntime
        );
        const directionAudioContext = this.createAudioContext(
            player.position,
            player.tick,
            this.localRunCompleted ? "completed" : current.state.runState
        );
        this.directionRuntime.update(dt, {
            areaId: cameraShot.areaId,
            cameraZoneId: cameraShot.zoneId,
            localX: cameraShot.localX,
            localY: cameraShot.localY,
            events: [...events, ...predictedEvents],
            audioContext: directionAudioContext
        });
        const storyPresentation = this.storyPresentation.update(dt, {
            currentAreaId: cameraShot.areaId,
            currentAreaLocalX: cameraShot.localX,
            currentAreaLocalY: cameraShot.localY,
            events: [...events, ...predictedEvents],
            triggers: localTriggerObjects(authoredWorld, cameraShot.areaId)
        });
        this.playerMessagePresentation.update(dt, {
            currentAreaId: cameraShot.areaId,
            storyPresentation
        });
        this.directionLightingPresentation.update(dt, { areaId: cameraShot.areaId });
        this.directionCharacterPresentation.update(dt);
        this.audioBindings?.presentFrame({
            scene: directionAudioContext
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
        if (phase.holding) {
            return resolveAuthoredCameraShot({
                world,
                player: { position: phase.deathPosition },
                mobileView: this.mobileView,
                defaultZoom: CAMERA_CONFIG.desktopZoom,
                cssWidth: this.renderer.cssWidth,
                cssHeight: this.renderer.cssHeight
            });
        }
        return this.updateCamera(dt, player, world, bossStage);
    }

    updateCamera(dt, player, world, bossStage = null) {
        const localBossStage = localBossStageSnapshot(bossStage, player);
        return advanceAuthoredCamera({
            camera: this.camera,
            world,
            player: bossCameraFocusPlayer(player, localBossStage),
            visibilityTarget: player,
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

    render() {
        const remote = this.authority.snapshot(1);
        if (!remote.state || !remote.predicted) return;
        const localState = remote.state.players.find(({ id }) => id === this.authority.playerId);
        if (!localState) return;
        const base = this.authority.renderSnapshot();
        if (!base) return;
        const bossStageSnapshot =
            this.authority.bossStageSnapshot() ??
            remote.state.bossStage ??
            remote.state.bossStageRuntime ??
            remote.state.bossRuntime;
        const predictableProjectiles = this.predictableProjectiles.snapshot();
        const player = renderPlayer(localState, remote.predicted, bossStageSnapshot);
        const otherPlayers = remote.state.players
            .filter(({ id }) => id !== this.authority.playerId)
            .map((state) => renderPlayer(state, null, bossStageSnapshot));
        const activeCheckpoint =
            base.world.checkpoints.find(({ id }) => id === remote.state.activeCheckpointId) ?? null;
        const activeRespawnAnchor =
            base.world.respawnAnchors?.find(
                ({ id }) => id === (remote.predicted.respawnAnchorId ?? localState.respawnAnchorId)
            ) ?? null;
        const networkMetrics = { ...this.authority.metrics(), ...this.predictableProjectiles.metrics() };
        const combatFeedback = this.combatFeedback.snapshot();
        const localBossStage = localBossStageSnapshot(bossStageSnapshot, player);
        const bossStagePresentation = createBossStagePresentation(
            localBossStage,
            bossStageSpecById(localBossStage?.stageId ?? localBossStage?.id ?? localBossStage?.encounterId),
            Object.freeze(this.bossPresentationEvents.splice(0))
        );
        this.statusFeedback.apply([base.eventFlash]);
        this.queuePlayerPresentationEvents([base.eventFlash]);
        const playerPresentationEvents = Object.freeze(this.playerPresentationEvents.splice(0));
        const renderMetrics = this.renderer.draw({
            ...base,
            player,
            rope: player.rope,
            swingDrag: remote.predicted.swingDrag,
            attachmentCandidate: base.attachmentCandidate,
            enemies: remote.state.enemies,
            augmentProjectiles: [
                ...(base.augmentProjectiles ?? []),
                ...otherPlayers.flatMap((other) => other.augmentRuntimeState?.combat?.spellProjectiles ?? [])
            ],
            augmentAreas: [
                ...(base.augmentAreas ?? []),
                ...otherPlayers.flatMap((other) => other.augmentRuntimeState?.combat?.spellAreas ?? [])
            ],
            ...predictableProjectiles,
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
                this.augmentFeedback ??
                this.checkpointFeedback ??
                this.statusFeedback.snapshot() ??
                selectClientStatusFeedback(base.eventFlash, this.authority.playerId),
            otherPlayers,
            playerHealth: remote.predicted.health,
            playerMaxHealth: remote.predicted.maxHealth,
            ropeDisabledRemaining: remote.predicted.ropeDisabledRemaining,
            playerLifeState: remote.predicted.lifeState,
            ropeShot: remote.predicted.launcher,
            activeCheckpoint,
            activeRespawnAnchor,
            augmentReward: this.localAugmentReward,
            runState: this.localRunCompleted ? "completed" : remote.state.runState,
            camera: this.camera,
            stats: this.stats,
            mobileView: this.mobileView,
            metricsVisible: this.metricsVisible,
            hudVisible: this.hudVisible,
            metrics: remote.state.metrics,
            networkMetrics,
            mobileControls: {
                ...this.latestInput.mobileControls,
                visible: this.mobileView || this.latestInput.mobileControls.visible
            },
            spellInput: this.latestInput.spellCommand
        });
        if (this.metricsVisible) {
            this.onDiagnostics({
                metrics: remote.state.metrics,
                networkMetrics,
                renderMetrics,
                worldSeed: base.world.seed,
                directionCoverage: this.directionCoverage
            });
        }
    }
}
