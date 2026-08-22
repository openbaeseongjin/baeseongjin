import { GameApp } from "../../GameApp.js";
import { defineBossStage } from "../../boss/BossStageDefinition.js";
import { resolveEffectiveRopeConfig, resolveEffectiveRopeDisabledSeconds } from "../../config.js";
import { LocalAuthority } from "../../runtime/LocalAuthority.js";
import { GameSimulation } from "../../simulation/GameSimulation.js";
import { createLegacyAreaSeamlessSectorRuntimeWorld } from "../../world/sectors/LegacyAreaSeamlessSectorRuntime.js";

const BOSS_PREVIEW_VERTICAL_OFFSET_RATIO = 0.1;

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

function bossPreviewStartPosition(simulation, stage) {
    const carriage = simulation.bossStageSnapshot()?.presentation?.objects.find(({ kind }) => kind === "boss-carriage");
    return Object.freeze({
        x: carriage?.position.x ?? stage.presentationOrigin.x,
        y:
            (carriage?.position.y ?? stage.presentationOrigin.y) +
            stage.bossCollider.height * BOSS_PREVIEW_VERTICAL_OFFSET_RATIO
    });
}

export class BossStagePreviewGameApp extends GameApp {
    constructor({ bossStageSpec, revision, ...options } = {}) {
        const spec = requireBossStageSpec(bossStageSpec);
        const definition = defineBossStage(spec);
        const previewRevision = requirePreviewRevision(revision);
        const worldFactory = (worldOptions) =>
            createLegacyAreaSeamlessSectorRuntimeWorld({ ...worldOptions, bossStageSpec: spec });
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
            bossPreviewStartPosition(simulation, stage),
            simulation.getTick(),
            `${stage.id}:preview-entry`
        );
        const authority = new LocalAuthority(simulation);
        super({
            ...options,
            authority,
            startAreaId: null,
            bossStageSpecResolver: (id) => (id === spec.id ? spec : null)
        });
        this.previewBossStageId = spec.id;
        this.previewRevision = previewRevision;
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
}
