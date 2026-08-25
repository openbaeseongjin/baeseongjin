import { COMBAT_CONFIG } from "../config.js";
import { InputStateSimulator } from "../network/InputStateSimulator.js";
import { MULTIPLAYER_TIMING } from "../network/MultiplayerTiming.js";
import { WORLD_GENERATION_REVISION } from "../world/WorldGenerator.js";
import { GameSimulation } from "../simulation/GameSimulation.js";
import { ROPE_AUTHORITY_EVENT_TYPE } from "../network/RopeAuthorityEvent.js";
import { SPELL_SOURCE_KIND } from "../spells/SpellRuntimeDefinition.js";
import { IncomingSpellImpactDetector } from "../spells/IncomingSpellImpactDetector.js";
import { LOWER_SECTOR_COMMANDER_HAZARD } from "../boss/LowerSectorCommanderDefinition.js";
import {
    PLATFORM_COLLISION_DAMAGE_EVENT_TYPE,
    PLATFORM_COLLISION_DAMAGE_ID
} from "../combat/PlatformCollisionDamage.js";

const APPLIED_AUTHORITY_EVENT_HISTORY_LIMIT = 64;

function percentile(samples, ratio) {
    if (samples.length === 0) return 0;
    const sorted = [...samples].sort((left, right) => left - right);
    return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * ratio) - 1)];
}

function copyPredictedImpact(event) {
    return Object.freeze({
        ...event,
        ...(event.position ? { position: Object.freeze({ ...event.position }) } : {}),
        ...(event.velocity ? { velocity: Object.freeze({ ...event.velocity }) } : {}),
        ...(event.parameters ? { parameters: Object.freeze({ ...event.parameters }) } : {})
    });
}

function rebaseLaterTimerPredictions(entries, rejected, fixedDt, previousValueKey, appliedValueKey) {
    const later = [...entries].filter(({ tick }) => tick > rejected.tick).sort((left, right) => left.tick - right.tick);
    if (later.length === 0) return false;

    let value = rejected[previousValueKey];
    let valueTick = rejected.previousTick;
    for (const entry of later) {
        entry[previousValueKey] = Math.max(0, value - (entry.previousTick - valueTick) * fixedDt);
        value = entry[appliedValueKey];
        valueTick = entry.tick;
    }
    return true;
}

function ownerPortalTransition(event, ownerId) {
    if (!event || event.playerId !== ownerId) return null;
    if (event.eventType === "gate-portal-entered") return event;
    if (event.eventType === "debug-teleported") {
        return Object.freeze({
            ...event,
            eventType: "gate-portal-entered",
            gateId: `debug:${event.areaId}`
        });
    }
    return null;
}

export class OwnerPredictionRuntime {
    constructor({
        ownerId,
        simulation = null,
        fixedDt = 1 / 120,
        inputHoldTicks = MULTIPLAYER_TIMING.inputHoldTicks,
        predictionLeadTicks = MULTIPLAYER_TIMING.inputLeadTicks,
        maxInputHistory = 512,
        correctionSeconds = MULTIPLAYER_TIMING.ownerCorrectionSeconds,
        hardSnapDistance = MULTIPLAYER_TIMING.ownerHardSnapDistance
    }) {
        if (typeof ownerId !== "string" || ownerId.length === 0) throw new Error("ownerId must be non-empty");
        if (!Number.isFinite(fixedDt) || fixedDt <= 0) throw new Error("fixedDt must be positive");
        if (!Number.isSafeInteger(predictionLeadTicks) || predictionLeadTicks < 0) {
            throw new Error("predictionLeadTicks must be a non-negative safe integer");
        }
        if (!Number.isSafeInteger(maxInputHistory) || maxInputHistory < 1) {
            throw new Error("maxInputHistory must be a positive safe integer");
        }
        if (!Number.isFinite(correctionSeconds) || correctionSeconds <= 0) {
            throw new Error("correctionSeconds must be positive");
        }
        if (!Number.isFinite(hardSnapDistance) || hardSnapDistance <= 0) {
            throw new Error("hardSnapDistance must be positive");
        }
        this.ownerId = ownerId;
        this.simulation = simulation ?? new GameSimulation({ playerId: ownerId });
        this.simulation.useHardpointJammerSnapshotAuthority();
        if (this.simulation.getPrimaryPlayerId() !== ownerId) {
            throw new Error(
                `prediction simulation ownerId mismatch: expected ${ownerId}, received ${this.simulation.getPrimaryPlayerId()}`
            );
        }
        this.fixedDt = fixedDt;
        this.inputHoldTicks = inputHoldTicks;
        this.predictionLeadTicks = predictionLeadTicks;
        this.maxInputHistory = maxInputHistory;
        this.correctionSeconds = correctionSeconds;
        this.hardSnapDistance = hardSnapDistance;
        this.inputHistory = new Map();
        this.initialized = false;
        this.presentationOffset = { x: 0, y: 0 };
        this.correctionRemaining = 0;
        this.lastCorrectionDistance = 0;
        this.hardSnapCount = 0;
        this.correctionSamples = [];
        this.predictedEvents = [];
        this.emittedPredictionTicks = new Map();
        this.pendingProjectileSpawns = new Map();
        this.pendingImpacts = new Map();
        this.nextImpactPredictionOrder = 0;
        this.pendingCheckpoint = null;
        this.pendingAugmentSelection = null;
        this.incomingSpellImpacts = new IncomingSpellImpactDetector();
        this.appliedPortalEventIds = new Set();
        this.appliedPortalEventIdOrder = [];
        this.appliedRopeReleaseEventIds = new Set();
        this.appliedRopeReleaseEventIdOrder = [];
        this.simulation.preparePrediction();
    }

    applyPortalEvents(events) {
        for (const event of events) {
            if (this.appliedPortalEventIds.has(event.eventId)) continue;
            const transition = ownerPortalTransition(event, this.ownerId);
            if (!transition) continue;
            this.appliedPortalEventIds.add(event.eventId);
            this.appliedPortalEventIdOrder.push(event.eventId);
            while (this.appliedPortalEventIdOrder.length > APPLIED_AUTHORITY_EVENT_HISTORY_LIMIT) {
                this.appliedPortalEventIds.delete(this.appliedPortalEventIdOrder.shift());
            }
            if (
                !this.simulation.confirmPortalTransition(
                    this.ownerId,
                    transition.gateId,
                    transition.position,
                    event.tick
                )
            ) {
                this.simulation.applyPortalTransition(this.ownerId, transition.position, event.tick, transition.gateId);
            }
            for (const tick of this.inputHistory.keys()) {
                if (tick <= event.tick) this.inputHistory.delete(tick);
            }
            this.presentationOffset = { x: 0, y: 0 };
            this.correctionRemaining = 0;
        }
    }

    applyRopeAnchorReleaseEvents(events) {
        for (const event of events) {
            if (
                event.eventType !== ROPE_AUTHORITY_EVENT_TYPE.ANCHOR_RELEASED ||
                event.playerId !== this.ownerId ||
                this.appliedRopeReleaseEventIds.has(event.eventId)
            ) {
                continue;
            }
            this.appliedRopeReleaseEventIds.add(event.eventId);
            this.appliedRopeReleaseEventIdOrder.push(event.eventId);
            while (this.appliedRopeReleaseEventIdOrder.length > APPLIED_AUTHORITY_EVENT_HISTORY_LIMIT) {
                this.appliedRopeReleaseEventIds.delete(this.appliedRopeReleaseEventIdOrder.shift());
            }
            const rope = this.simulation.playerState(this.ownerId)?.rope;
            if (rope?.isAttached && rope.attachmentId === event.attachmentId && rope.anchorOwnerId === event.ownerId) {
                this.releaseOwnerRope(event.attachmentId);
            }
        }
    }

    releaseOwnerRope(expectedAttachmentId = null) {
        const rope = this.simulation.playerState(this.ownerId)?.rope;
        if (expectedAttachmentId !== null && rope?.attachmentId !== expectedAttachmentId) return false;
        return this.simulation.releasePlayerRope(this.ownerId);
    }

    prepareSnapshot(snapshot, fallbackProgress = null) {
        if (!snapshot) {
            const progress = fallbackProgress ?? this.simulation.predictionProgressState(this.ownerId);
            this.simulation.preparePrediction([], progress.activeCheckpointId, progress.respawnAnchorId);
            this.simulation.synchronizePredictionProgress(this.ownerId, progress);
            return;
        }
        if (this.pendingCheckpoint?.checkpointId === snapshot.state.activeCheckpointId) {
            this.pendingCheckpoint = null;
        }
        const preserveCheckpoint = this.pendingCheckpoint !== null;
        const sharedOwner = snapshot.state.players.find(({ id }) => id === this.ownerId);
        const localProgress = this.simulation.predictionProgressState(this.ownerId);
        const localRespawnAnchor = this.simulation.world.respawnAnchors?.find(
            ({ id }) => id === localProgress.respawnAnchorId
        );
        const sharedRespawnAnchor = this.simulation.world.respawnAnchors?.find(
            ({ id }) => id === sharedOwner?.respawnAnchorId
        );
        const predictedRespawnIsAhead = (localRespawnAnchor?.level ?? -1) > (sharedRespawnAnchor?.level ?? -1);
        const progress = preserveCheckpoint
            ? localProgress
            : {
                  activeCheckpointId: snapshot.state.activeCheckpointId,
                  respawnAnchorId: predictedRespawnIsAhead
                      ? localProgress.respawnAnchorId
                      : (sharedOwner?.respawnAnchorId ?? null),
                  augmentReward: snapshot.state.augmentRewards?.[this.ownerId] ?? null
              };
        this.simulation.preparePrediction(
            this.hydrateEnemyNetworkStates(snapshot.state.enemies ?? []),
            progress.activeCheckpointId,
            progress.respawnAnchorId
        );
        if (this.simulation.worldProgress && snapshot.state.worldProgress) {
            this.simulation.restoreWorldProgress(
                snapshot.state.worldProgress,
                snapshot.state.worldElapsedSeconds ?? snapshot.serverTick * this.fixedDt
            );
        }
        this.simulation.restoreHardpointJammers(snapshot.state.hardpointJammerStates ?? []);
        this.simulation.restoreBossRuntime(snapshot.state.bossStage ?? snapshot.state.bossRuntime ?? null);
        this.simulation.restoreCombatInteractions(snapshot.state.combatInteractions, { preserveActive: true });
        if (!preserveCheckpoint) this.simulation.synchronizePredictionProgress(this.ownerId, progress);
    }

    hydrateEnemyNetworkStates(states) {
        return this.simulation.hydrateEnemyNetworkStates(states);
    }

    reconcile(snapshot, pendingBatches) {
        if (snapshot.worldSeed !== this.simulation.world.seed) throw new Error("prediction world seed mismatch");
        if (snapshot.worldRevision !== (this.simulation.world.definitionRevision ?? WORLD_GENERATION_REVISION)) {
            throw new Error("prediction world revision mismatch");
        }
        const sharedOwner = snapshot.state.players.find(({ id }) => id === this.ownerId);
        if (!sharedOwner) throw new Error(`missing predicted ownerId: ${this.ownerId}`);
        if (sharedOwner.selectedAugmentIds?.includes(this.pendingAugmentSelection?.augmentId)) {
            this.pendingAugmentSelection = null;
        }
        const ownerMotionTick = sharedOwner.ownerMotionTick;
        if (
            !Number.isSafeInteger(ownerMotionTick) ||
            ownerMotionTick < 0 ||
            ownerMotionTick > snapshot.serverTick + MULTIPLAYER_TIMING.maxFutureTicks
        ) {
            throw new Error(`invalid ownerMotionTick: ${ownerMotionTick}`);
        }
        this.applyPortalEvents(snapshot.events);
        this.applyRopeAnchorReleaseEvents(snapshot.events);
        this.confirmResolvedImpacts(snapshot.events);
        const pendingTicks = pendingBatches.map(({ tick }) => tick);
        const targetTick = Math.max(
            snapshot.serverTick + this.predictionLeadTicks,
            ownerMotionTick,
            this.initialized ? this.simulation.getTick() : snapshot.serverTick,
            ...pendingTicks
        );
        if (this.initialized) {
            return this.acceptSharedOutcomes(snapshot, sharedOwner, targetTick, ownerMotionTick);
        }
        this.prepareSnapshot(snapshot);
        this.simulation.restoreOwnerPrediction(this.ownerId, sharedOwner, ownerMotionTick);
        this.simulation.rebaseElapsedSeconds(
            ownerMotionTick,
            snapshot.serverTick,
            snapshot.state.worldElapsedSeconds ?? snapshot.serverTick * this.fixedDt,
            this.fixedDt
        );
        if (this.pendingCheckpoint) this.simulation.releasePlayerRope(this.ownerId);
        this.initialized = true;

        for (const tick of this.inputHistory.keys()) {
            if (tick <= ownerMotionTick) this.inputHistory.delete(tick);
        }
        for (const [predictionId, tick] of this.emittedPredictionTicks) {
            if (tick <= ownerMotionTick) this.emittedPredictionTicks.delete(predictionId);
        }

        const batchesByTick = this.pendingBatchesByTick(ownerMotionTick, pendingBatches);
        const pendingImpacts = [...this.pendingImpacts.values()]
            .filter(({ tick }) => tick >= ownerMotionTick)
            .sort((left, right) => left.tick - right.tick || left.order - right.order);
        this.replayInputs(ownerMotionTick, targetTick, batchesByTick, pendingImpacts);
        return this.state();
    }

    acceptSharedOutcomes(snapshot, sharedOwner, targetTick, ownerMotionTick) {
        this.prepareSnapshot(snapshot);
        for (const tick of this.inputHistory.keys()) {
            if (tick <= ownerMotionTick) this.inputHistory.delete(tick);
        }
        for (const [predictionId, tick] of this.emittedPredictionTicks) {
            if (tick <= ownerMotionTick) this.emittedPredictionTicks.delete(predictionId);
        }
        this.simulation.applySharedOwnerProgress(this.ownerId, sharedOwner, targetTick, {
            preservePendingImpact: this.pendingImpacts.size > 0,
            preservePendingAugment: this.pendingAugmentSelection !== null
        });
        this.simulation.rebaseElapsedSeconds(
            this.simulation.getTick(),
            snapshot.serverTick,
            snapshot.state.worldElapsedSeconds ?? snapshot.serverTick * this.fixedDt,
            this.fixedDt
        );
        return this.state();
    }

    pendingBatchesByTick(serverTick, pendingBatches) {
        const batchesByTick = new Map();
        for (const batch of pendingBatches) {
            if (batch.tick <= serverTick) continue;
            if (batchesByTick.has(batch.tick)) throw new Error(`duplicate pending target tick: ${batch.tick}`);
            batchesByTick.set(batch.tick, batch);
            const entry = batch.commands.find(({ playerId }) => playerId === this.ownerId);
            if (entry && !this.inputHistory.has(batch.tick)) this.rememberInput(batch.tick, entry.command);
        }
        return batchesByTick;
    }

    replayInputs(serverTick, targetTick, batchesByTick, impactEntries = []) {
        const inputState = new InputStateSimulator({ holdTicks: this.inputHoldTicks });
        const impactsByTick = new Map();
        for (const entry of impactEntries) {
            if (!impactsByTick.has(entry.tick)) impactsByTick.set(entry.tick, []);
            impactsByTick.get(entry.tick).push(entry);
        }
        const replayImpactsAtTick = (tick) => {
            for (const entry of impactsByTick.get(tick) ?? []) {
                entry.before = this.simulation.playerState(this.ownerId);
                if (!this.simulation.applyPredictedOwnerImpact(this.ownerId, entry.event)) {
                    throw new Error(`failed to replay pending impact: ${entry.event.projectileId}`);
                }
            }
        };
        replayImpactsAtTick(serverTick);
        for (let tick = serverTick + 1; tick <= targetTick; tick += 1) {
            const remembered = this.inputHistory.get(tick);
            const batch = remembered
                ? { tick, commands: [{ playerId: this.ownerId, sequence: tick, command: remembered }] }
                : (batchesByTick.get(tick) ?? { tick, commands: [] });
            const simulated = inputState.expand(batch, [this.ownerId]);
            const command = simulated.commands[0]?.command ?? this.simulation.idleOwnerCommand(this.ownerId);
            const previous = this.state();
            const outcome = this.simulation.advanceOwnerPrediction(this.ownerId, command, this.fixedDt, tick, {
                allowFire: false
            });
            this.recordPredictedOutcome(outcome, tick, previous);
            replayImpactsAtTick(tick);
        }
    }

    advance(command) {
        if (!this.initialized) return null;
        const tick = this.simulation.getTick() + 1;
        this.rememberInput(tick, command);
        const previous = this.state();
        const outcome = this.simulation.advanceOwnerPrediction(this.ownerId, command, this.fixedDt, tick);
        this.recordPredictedOutcome(outcome, tick, previous);
        this.updatePresentation(this.fixedDt);
        return this.state();
    }

    releaseRope() {
        if (!this.initialized) return false;
        return this.simulation.releasePlayerRope(this.ownerId);
    }

    predictFall() {
        if (!this.initialized) return null;
        this.simulation.resolvePlayerFall(this.ownerId);
        return this.state();
    }

    startPresentationCorrection(displayedBefore, corrected, forceHardSnap = false) {
        const offset = {
            x: displayedBefore.position.x - corrected.position.x,
            y: displayedBefore.position.y - corrected.position.y
        };
        const distance = Math.hypot(offset.x, offset.y);
        this.lastCorrectionDistance = distance;
        if (distance > 0) {
            this.correctionSamples.push(distance);
            if (this.correctionSamples.length > 256) this.correctionSamples.shift();
        }
        const hardSnap =
            forceHardSnap || distance > this.hardSnapDistance || displayedBefore.lifeState !== corrected.lifeState;
        if (hardSnap) {
            this.presentationOffset = { x: 0, y: 0 };
            this.correctionRemaining = 0;
            this.hardSnapCount += 1;
            return;
        }
        this.presentationOffset = offset;
        this.correctionRemaining = distance > 0 ? this.correctionSeconds : 0;
    }

    updatePresentation(dt) {
        if (this.correctionRemaining <= 0) return;
        const remaining = Math.max(0, this.correctionRemaining - dt);
        const ratio = remaining / this.correctionRemaining;
        this.presentationOffset.x *= ratio;
        this.presentationOffset.y *= ratio;
        this.correctionRemaining = remaining;
    }

    rememberInput(tick, command) {
        this.inputHistory.set(tick, command);
        while (this.inputHistory.size > this.maxInputHistory) {
            this.inputHistory.delete(this.inputHistory.keys().next().value);
        }
    }

    applyPredictedImpact(event) {
        if (!this.initialized) return false;
        if (event.projectileId && this.pendingImpacts.has(event.projectileId)) return false;
        const before = this.simulation.playerState(this.ownerId);
        const tick = this.simulation.getTick();
        const applied = this.simulation.applyPredictedOwnerImpact(this.ownerId, event);
        if (applied) this.recordPredictedAugmentImpacts(this.simulation.drainQueuedAugmentImpactEvents(this.ownerId));
        if (applied && event.projectileId) {
            this.pendingImpacts.set(event.projectileId, {
                before,
                tick,
                order: this.nextImpactPredictionOrder++,
                status: "pending",
                event: copyPredictedImpact(event)
            });
        }
        return applied;
    }

    confirmResolvedImpacts(events) {
        for (const event of events ?? []) {
            if (event.eventType !== "resolve") continue;
            const pending = this.pendingImpacts.get(event.objectId);
            if (!pending || pending.status !== "accepted" || pending.event.resolution !== event.resolution) continue;
            this.pendingImpacts.delete(event.objectId);
        }
    }

    recordImpactReceipt(receipt, snapshot = null) {
        const impactId = receipt.impactId ?? receipt.projectileId;
        const pending = this.pendingImpacts.get(impactId);
        if (!pending) return false;
        if (receipt.accepted) {
            pending.status = "accepted";
            return true;
        }
        this.pendingImpacts.delete(impactId);
        if (pending.event.parameters?.sourceType === LOWER_SECTOR_COMMANDER_HAZARD.GRAB && snapshot) {
            const displayedBefore = this.presentationState();
            const targetTick = this.simulation.getTick();
            const progress = this.simulation.predictionProgressState(this.ownerId);
            this.prepareSnapshot(snapshot, progress);
            this.simulation.restoreCombatInteractions(snapshot.state.combatInteractions, { preserveActive: false });
            this.simulation.restoreOwnerPrediction(this.ownerId, pending.before, pending.tick);
            const pendingImpacts = [...this.pendingImpacts.values()]
                .filter(({ tick }) => tick >= pending.tick)
                .sort((left, right) => left.tick - right.tick || left.order - right.order);
            this.replayInputs(pending.tick, targetTick, new Map(), pendingImpacts);
            this.startPresentationCorrection(displayedBefore, this.state());
        }
        return true;
    }

    resolveCollisions(otherPlayers) {
        if (!this.initialized) return false;
        const playerCollision = this.simulation.resolveOwnerCollisions(this.ownerId, otherPlayers);
        const target = Object.freeze({ ...this.state(), id: this.ownerId });
        const detectedSpellImpacts = this.incomingSpellImpacts.observe(target, otherPlayers, {
            targets: [target, ...this.simulation.enemyStates()],
            surfaces: this.simulation.activeCollisionSurfaces
        });
        const incomingSpellImpacts = [];
        for (const event of detectedSpellImpacts) {
            if (!this.simulation.applyPredictedIncomingSpellImpact(this.ownerId, event)) continue;
            this.recordPredictedIncomingSpellImpact(event);
            incomingSpellImpacts.push(event);
        }
        return Object.freeze({ playerCollision, incomingSpellImpacts: Object.freeze(incomingSpellImpacts) });
    }

    recordPredictedIncomingSpellImpact(event) {
        this.predictedEvents.push(
            Object.freeze({
                ...event,
                eventType: "predicted-resolve",
                resolution: event.predictedResolution,
                parameters: Object.freeze({
                    sourceKind: "incoming-spell-impact",
                    eventId: event.eventId,
                    predictionId: event.predictionId,
                    effectId: event.effectId,
                    effectSourceKind: event.sourceKind,
                    sourcePlayerId: event.sourcePlayerId,
                    targetId: event.targetId,
                    damage: event.damage
                })
            })
        );
    }

    checkpointClaimCandidate() {
        if (!this.initialized) return null;
        const checkpoint = this.simulation.checkpointClaimCandidate(this.ownerId);
        if (!checkpoint) return null;
        const state = this.state();
        return Object.freeze({
            checkpointId: checkpoint.id,
            clientTick: state.tick,
            position: { x: state.position.x, y: state.position.y },
            feedbackPosition: { x: checkpoint.x, y: checkpoint.y }
        });
    }

    applyPredictedCheckpoint(candidate) {
        if (!this.initialized || this.pendingCheckpoint) return false;
        const before = this.simulation.playerState(this.ownerId);
        const beforeProgress = this.simulation.predictionProgressState(this.ownerId);
        const result = this.simulation.resolveCheckpointClaim(this.ownerId, candidate, { positionTolerance: 0 });
        if (!result.accepted) return false;
        this.pendingCheckpoint = {
            checkpointId: candidate.checkpointId,
            before,
            beforeProgress,
            tick: this.simulation.getTick()
        };
        return true;
    }

    recordCheckpointReceipt(receipt, snapshot = null) {
        const pending = this.pendingCheckpoint;
        if (!pending || pending.checkpointId !== receipt.checkpointId) return false;
        if (receipt.accepted) return true;

        this.pendingCheckpoint = null;
        const displayedBefore = this.presentationState();
        const targetTick = this.simulation.getTick();
        this.prepareSnapshot(snapshot, pending.beforeProgress);
        this.simulation.restoreOwnerPrediction(this.ownerId, pending.before, pending.tick);
        const pendingImpacts = [...this.pendingImpacts.values()]
            .filter(({ tick }) => tick >= pending.tick)
            .sort((left, right) => left.tick - right.tick || left.order - right.order);
        this.replayInputs(pending.tick, targetTick, new Map(), pendingImpacts);

        const sharedOwner = snapshot?.state?.players?.find(({ id }) => id === this.ownerId);
        if (sharedOwner) {
            this.simulation.applySharedOwnerProgress(this.ownerId, sharedOwner, targetTick, {
                preservePendingImpact: this.pendingImpacts.size > 0,
                preservePendingAugment: this.pendingAugmentSelection !== null
            });
        }
        this.startPresentationCorrection(displayedBefore, this.state());
        return true;
    }

    augmentReward() {
        return this.simulation.getAugmentReward(this.ownerId);
    }

    applyPredictedAugmentSelection(selection) {
        if (!this.initialized || this.pendingAugmentSelection) return false;
        const result = this.simulation.resolveAugmentSelection(this.ownerId, selection, {
            replicate: false,
            requireOpenReward: false
        });
        if (!result.accepted) return false;
        this.pendingAugmentSelection = Object.freeze({ ...selection });
        const state = this.state();
        this.predictedEvents.push(
            Object.freeze({
                eventType: "predicted-augment-selected",
                predictionId: `${this.ownerId}:augment-selection:${state.tick}`,
                tick: state.tick,
                playerId: this.ownerId,
                ownerId: this.ownerId,
                sourceId: selection.sourceId,
                augmentId: selection.augmentId
            })
        );
        return true;
    }

    rejectPredictedAugmentSelection(sourceId, snapshot = null) {
        if (!this.initialized) return false;
        const rejectedAugmentId = this.pendingAugmentSelection?.augmentId ?? null;
        this.pendingAugmentSelection = null;
        this.simulation.clearAugmentSelection(this.ownerId, sourceId, rejectedAugmentId);
        if (snapshot?.state?.worldProgress && this.simulation.worldProgress) {
            this.simulation.restoreWorldProgress(
                snapshot.state.worldProgress,
                snapshot.state.worldElapsedSeconds ?? snapshot.serverTick * this.fixedDt
            );
        }
        return false;
    }

    summitClaimCandidate() {
        if (!this.initialized) return null;
        const summit = this.simulation.summitClaimCandidate(this.ownerId);
        if (!summit) return null;
        const state = this.state();
        return Object.freeze({
            clientTick: state.tick,
            position: { x: state.position.x, y: state.position.y },
            feedbackPosition: { x: summit.x, y: summit.y }
        });
    }

    renderSnapshot() {
        return this.initialized ? this.simulation.snapshot() : null;
    }

    worldSnapshot() {
        return this.initialized ? this.simulation.world : null;
    }

    bossStageSnapshot() {
        return this.initialized ? this.simulation.bossStageSnapshot() : null;
    }

    impactClaimState() {
        return this.initialized ? this.simulation.playerState(this.ownerId) : null;
    }

    impactRecoveryState() {
        if (!this.initialized) return null;
        return Object.freeze({
            stateTick: this.simulation.getTick(),
            state: this.simulation.playerState(this.ownerId)
        });
    }

    recordPredictedOutcome(
        {
            projectile,
            ropeAugmentEvents = [],
            platformCollisionImpactEvents = [],
            jammerImpactEvents = [],
            bossImpactEvents = [],
            ropeImpactEvents = [],
            augmentImpactEvents = [],
            spellEvents = []
        },
        tick,
        previous
    ) {
        this.recordPredictedAugmentEvents(ropeAugmentEvents, tick);
        this.recordPredictedPlatformCollisionImpacts(platformCollisionImpactEvents);
        this.recordPredictedPlayerImpacts(jammerImpactEvents);
        this.recordPredictedBossImpacts(bossImpactEvents, tick, previous);
        this.recordPredictedRopeImpacts(ropeImpactEvents);
        this.recordPredictedAugmentImpacts(augmentImpactEvents);
        this.recordPredictedAugmentEvents(spellEvents, tick);
        this.recordPredictedProjectile(projectile, tick, previous.weaponCooldown);
    }

    recordPredictedPlatformCollisionImpacts(events) {
        for (const event of events) {
            const eventKey = PLATFORM_COLLISION_DAMAGE_ID.predictionKey(event.impactId);
            if (this.emittedPredictionTicks.has(eventKey)) continue;
            this.emittedPredictionTicks.set(eventKey, event.clientTick);
            this.predictedEvents.push(
                Object.freeze({
                    ...event,
                    eventType: PLATFORM_COLLISION_DAMAGE_EVENT_TYPE.PREDICTED
                })
            );
        }
    }

    recordPredictedPlayerImpacts(events) {
        for (const event of events) {
            if (!this.applyPredictedImpact(event)) continue;
            this.predictedEvents.push(Object.freeze({ ...event, eventType: "predicted-resolve" }));
        }
    }

    pendingImpactBefore(impactId) {
        const pending = this.pendingImpacts.get(impactId);
        return pending ? Object.freeze({ tick: pending.tick, state: pending.before }) : null;
    }

    recordPredictedBossImpacts(events, tick, previous) {
        for (const event of events) {
            const eventKey = `boss-hazard:${event.impactId}`;
            if (this.emittedPredictionTicks.has(eventKey)) continue;
            this.emittedPredictionTicks.set(eventKey, event.clientTick);
            this.pendingImpacts.set(event.impactId, {
                before: previous,
                tick,
                order: this.nextImpactPredictionOrder++,
                status: "pending",
                event: copyPredictedImpact(event)
            });
            this.predictedEvents.push(Object.freeze({ ...event, eventType: "predicted-resolve" }));
        }
    }

    recordPredictedRopeImpacts(events) {
        for (const event of events) {
            const eventKey = `rope-impact:${event.predictionId}`;
            if (this.emittedPredictionTicks.has(eventKey)) continue;
            this.emittedPredictionTicks.set(eventKey, event.clientTick);
            this.predictedEvents.push(
                Object.freeze({
                    eventType: "predicted-resolve",
                    predictionId: event.predictionId,
                    clientTick: event.clientTick,
                    resolution: event.predictedResolution,
                    position: event.position,
                    velocity: event.velocity,
                    parameters: Object.freeze({
                        sourceKind: "rope-impact",
                        predictionId: event.predictionId,
                        sourcePlayerId: event.sourcePlayerId,
                        targetId: event.targetId,
                        targetKind: event.targetKind ?? "enemy",
                        impactPosition: event.impactPosition,
                        damage: event.damage
                    })
                })
            );
        }
    }

    recordPredictedAugmentImpacts(events) {
        for (const event of events) {
            const eventKey = `augment-impact:${event.eventId}`;
            if (this.emittedPredictionTicks.has(eventKey)) continue;
            this.emittedPredictionTicks.set(eventKey, event.clientTick);
            this.predictedEvents.push(
                Object.freeze({
                    eventType: "predicted-resolve",
                    predictionId: event.predictionId ?? event.eventId,
                    eventId: event.eventId,
                    clientTick: event.clientTick,
                    resolution: event.predictedResolution ?? "enemy-hit",
                    position: event.contactPosition ?? event.position,
                    sourcePosition: event.sourcePosition,
                    damage: event.damage,
                    ...(event.impactSpeed === undefined ? {} : { impactSpeed: event.impactSpeed }),
                    knockback: event.knockback ?? null,
                    effectId: event.effectId,
                    sourceKind: event.sourceKind ?? SPELL_SOURCE_KIND.CAST,
                    sourcePlayerId: event.sourcePlayerId,
                    targetId: event.targetId,
                    parameters: Object.freeze({
                        sourceKind: "augment-impact",
                        eventId: event.eventId,
                        predictionId: event.predictionId ?? event.eventId,
                        effectId: event.effectId,
                        effectSourceKind: event.sourceKind ?? SPELL_SOURCE_KIND.CAST,
                        sourcePlayerId: event.sourcePlayerId,
                        targetId: event.targetId,
                        damage: event.damage
                    })
                })
            );
        }
    }

    recordPredictedAugmentEvents(events, tick) {
        events.forEach((event, index) => {
            this.predictedEvents.push(
                Object.freeze({
                    ...event,
                    eventType: `predicted-${event.eventType ?? "augment-effect"}`,
                    predictionId: event.predictionId ?? `${this.ownerId}:augment-effect:${tick}:${index}`,
                    tick,
                    ownerId: this.ownerId
                })
            );
        });
    }

    recordProjectileSpawnReceipt(receipt) {
        const pending = this.pendingProjectileSpawns.get(receipt.predictionId);
        if (!pending) return false;
        this.pendingProjectileSpawns.delete(receipt.predictionId);
        if (receipt.accepted) return true;
        if (
            rebaseLaterTimerPredictions(
                this.pendingProjectileSpawns.values(),
                pending,
                this.fixedDt,
                "previousCooldown",
                "appliedCooldown"
            )
        ) {
            return true;
        }
        const elapsedTicks = Math.max(0, this.simulation.getTick() - pending.previousTick);
        const remaining = Math.max(0, pending.previousCooldown - elapsedTicks * this.fixedDt);
        this.simulation.restorePredictedWeaponCooldown(this.ownerId, remaining);
        return true;
    }

    recordPredictedProjectile(projectile, tick, previousCooldown) {
        if (!projectile) return;
        const predictionId = `${this.ownerId}:${tick}`;
        const eventKey = `projectile:${predictionId}`;
        if (this.emittedPredictionTicks.has(eventKey)) return;
        this.emittedPredictionTicks.set(eventKey, tick);
        this.pendingProjectileSpawns.set(predictionId, {
            previousCooldown,
            previousTick: tick - 1,
            appliedCooldown: this.state().weaponCooldown,
            tick
        });
        this.predictedEvents.push(
            Object.freeze({
                eventType: "predicted-spawn",
                predictionId,
                tick,
                objectType: "player-projectile",
                ownerId: projectile.ownerId,
                targetId: projectile.targetId,
                position: { x: projectile.position.x, y: projectile.position.y },
                velocity: { x: projectile.velocity.x, y: projectile.velocity.y },
                radius: projectile.radius,
                damage: projectile.damage,
                speed: COMBAT_CONFIG.projectileSpeed
            })
        );
    }

    drainPredictedEvents() {
        const events = Object.freeze([...this.predictedEvents]);
        this.predictedEvents.length = 0;
        return events;
    }

    state() {
        return this.simulation.ownerPredictionState(this.ownerId);
    }

    presentationState() {
        const state = this.state();
        return {
            ...state,
            position: {
                x: state.position.x + this.presentationOffset.x,
                y: state.position.y + this.presentationOffset.y
            }
        };
    }

    metrics() {
        return Object.freeze({
            correctionDistance: this.lastCorrectionDistance,
            correctionP50: percentile(this.correctionSamples, 0.5),
            correctionP95: percentile(this.correctionSamples, 0.95),
            correctionRemaining: this.correctionRemaining,
            hardSnaps: this.hardSnapCount
        });
    }
}
