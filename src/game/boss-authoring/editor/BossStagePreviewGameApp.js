import { GameApp } from "../../GameApp.js";
import { BOSS_VULNERABILITY_TRIGGER } from "../BossStageSpec.js";
import { defineBossStage } from "../../boss/BossStageDefinition.js";
import { CONTINUITY_WARDEN_SURFACE_KIND } from "../../boss/ContinuityWardenDefinition.js";
import { PLAYER_CONFIG, resolveEffectiveRopeConfig, resolveEffectiveRopeDisabledSeconds } from "../../config.js";
import { LocalAuthority } from "../../runtime/LocalAuthority.js";
import { PreviewFlightController } from "../../runtime/PreviewFlightController.js";
import { GameSimulation } from "../../simulation/GameSimulation.js";
import { createAuthoredSeamlessSectorRuntimeWorld } from "../../world/sectors/AuthoredSeamlessSectorRuntime.js";

const BOSS_PREVIEW_DEBUG_WEAKPOINT_DAMAGE = 100;
const BOSS_PREVIEW_EDGE_INSET = 64;

class BossPreviewAuthority extends LocalAuthority {
    applyFlightMotion(position) {
        this.simulation.applyOwnerMotion(this.playerId, {
            ...this.ownerState(),
            position,
            velocity: { x: 0, y: 0 },
            isGrounded: false
        });
    }
}

function requireBossStageSpec(spec) {
    if (spec?.specType !== "boss-stage" || typeof spec.id !== "string") {
        throw new TypeError("map-editor-preview-boss-stage-required");
    }
    return spec;
}

function requirePreviewRevision(revision) {
    if ((typeof revision !== "string" && !Number.isInteger(revision)) || String(revision).trim() === "") {
        throw new TypeError("map-editor-preview-revision-required");
    }
    return String(revision);
}

function bossPreviewStartPosition(stage) {
    return Object.freeze({ x: stage.entry.x, y: stage.entry.y });
}

export class BossStagePreviewGameApp extends GameApp {
    constructor({ bossStageSpec, revision, ...options } = {}) {
        const spec = requireBossStageSpec(bossStageSpec);
        const definition = defineBossStage(spec);
        const previewRevision = requirePreviewRevision(revision);
        const worldFactory = (worldOptions) =>
            createAuthoredSeamlessSectorRuntimeWorld({ ...worldOptions, bossStageSpec: spec });
        const simulation = new GameSimulation({
            worldFactory,
            worldSeed: options.worldSeed,
            startLandmarkId: spec.sourceAreaId,
            ropeConfig: resolveEffectiveRopeConfig(options.ropeTuning),
            ropeDisabledSeconds: resolveEffectiveRopeDisabledSeconds(options.ropeTuning),
            debugAugmentIds: options.debugAugmentIds ?? [],
            bossDefinition: definition
        });
        const stage = simulation.world.bossStages?.find(({ id }) => id === spec.id);
        if (!stage) throw new Error("map-editor-preview-boss-stage-world-missing");
        const outcome = simulation.startBossEncounter(simulation.playerIds());
        if (!outcome.accepted) throw new Error(`map-editor-preview-boss-start-failed:${outcome.reason ?? "unknown"}`);
        const playerId = simulation.getPrimaryPlayerId();
        simulation.applyPortalTransition(
            playerId,
            bossPreviewStartPosition(stage),
            simulation.getTick(),
            `${stage.id}:preview-entry`
        );
        const authority = new BossPreviewAuthority(simulation);
        super({
            ...options,
            authority,
            startAreaId: null,
            bossStageSpecResolver: (id) => (id === spec.id ? spec : null)
        });
        this.previewBossStageId = spec.id;
        this.previewBossStageSpec = spec;
        this.previewRevision = previewRevision;
        this.previewFlight = new PreviewFlightController();
        this.debugWeakpointStrikeSequence = 0;
    }

    previewScope() {
        const snapshot = this.authority.snapshot();
        return Object.freeze({
            bossStageId: snapshot.bossStage?.stageId ?? null,
            status: snapshot.bossStage?.status ?? null,
            surfaceCount: snapshot.world.surfaces?.filter(({ bossStageId }) => bossStageId === this.previewBossStageId)
                .length,
            revision: this.previewRevision
        });
    }

    applyDebugSettings({ metrics = this.metricsVisible, startAreaId = null } = {}) {
        this.setMetricsVisible(metrics);
        return startAreaId === null;
    }

    setPreviewFlightEnabled(enabled) {
        return this.previewFlight.setEnabled(enabled);
    }

    debugStrikeWeakpoint() {
        const snapshot = this.authority.snapshot().bossStage;
        const targetId = snapshot?.vulnerability?.targetId ?? null;
        const phase = this.previewBossStageSpec.phases?.[Math.max(0, (snapshot?.phase ?? 1) - 1)];
        const alwaysActive = phase?.vulnerability?.trigger === BOSS_VULNERABILITY_TRIGGER.ALWAYS_ACTIVE;
        if (snapshot?.status !== "active" || (!alwaysActive && snapshot.vulnerability?.active !== true) || !targetId) {
            return Object.freeze({ accepted: false, reason: "boss-preview-weakpoint-unavailable" });
        }
        this.debugWeakpointStrikeSequence += 1;
        return this.authority.simulation.applyBossImpact({
            impactId: `${this.previewBossStageId}:preview-weakpoint:${this.debugWeakpointStrikeSequence}`,
            sourcePlayerId: this.authority.playerId,
            baseDamage: BOSS_PREVIEW_DEBUG_WEAKPOINT_DAMAGE,
            targetId,
            impactPosition: this.authority.ownerState().position
        });
    }

    debugMovePlayerNearBoss() {
        const snapshot = this.authority.snapshot();
        const bossBody = snapshot.bossStage?.presentation?.objects?.find(({ physicsBody }) => physicsBody === true);
        if (!bossBody?.position) return Object.freeze({ accepted: false });
        const stage = this.authority.simulation.world.bossStages?.find(({ id }) => id === this.previewBossStageId);
        if (!stage) return Object.freeze({ accepted: false });
        const mainSurface = stage.surfaces.find(({ kind }) => kind === CONTINUITY_WARDEN_SURFACE_KIND.MAIN);
        if (!mainSurface) return Object.freeze({ accepted: false });
        const target = {
            x: Math.max(
                mainSurface.x + BOSS_PREVIEW_EDGE_INSET,
                Math.min(mainSurface.x + mainSurface.width - BOSS_PREVIEW_EDGE_INSET, bossBody.position.x - 420)
            ),
            y: mainSurface.y - PLAYER_CONFIG.radius
        };
        this.authority.applyFlightMotion(target);
        return Object.freeze({ accepted: true, position: Object.freeze(target) });
    }

    update(dt, input) {
        if (!this.previewFlight.enabled) return super.update(dt, input);
        const owner = this.authority.ownerState();
        const stage = this.authority.simulation.world.bossStages?.find(({ id }) => id === this.previewBossStageId);
        if (!stage) return super.update(dt, input);
        const nextPosition = this.previewFlight.nextPosition(owner.position, stage.bounds, dt, input);
        super.update(dt, this.previewFlight.neutralInput(input));
        this.authority.applyFlightMotion(nextPosition);
    }
}
