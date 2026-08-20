import { GameApp } from "../GameApp.js";
import { ClientCombatFeedback } from "../combat/ClientCombatFeedback.js";
import { ClientStatusFeedback } from "../combat/ClientStatusFeedback.js";
import { resolveEffectiveRopeConfig, resolveEffectiveRopeDisabledSeconds } from "../config.js";
import { PlayerRespawnPresentation } from "../presentation/PlayerRespawnPresentation.js";
import { LocalAuthority } from "./LocalAuthority.js";
import { GameSimulation } from "../simulation/GameSimulation.js";
import { defineAreaCatalog } from "../world/areas/AreaDefinition.js";

function assertGeneratedArea(generatedArea) {
    if (!generatedArea || typeof generatedArea.id !== "string" || generatedArea.id.trim() === "") {
        throw new TypeError("map-editor-preview-area-required");
    }
    return generatedArea;
}

function assertPreviewRevision(revision) {
    if ((typeof revision !== "string" && !Number.isInteger(revision)) || String(revision).trim() === "") {
        throw new TypeError("map-editor-preview-revision-required");
    }
    return String(revision);
}

export class AreaPreviewGameApp extends GameApp {
    constructor({ generatedArea, revision, ...options } = {}) {
        const area = assertGeneratedArea(generatedArea);
        const previewRevision = assertPreviewRevision(revision);
        super({ ...options, startAreaId: area.id });
        const worldCatalog = defineAreaCatalog({
            id: "map-editor-preview",
            revision: previewRevision,
            areas: [area]
        });
        this.previewAreaId = area.id;
        this.authority = new LocalAuthority(
            new GameSimulation({
                worldCatalog,
                startAreaId: area.id,
                worldSeed: options.worldSeed,
                ropeConfig: resolveEffectiveRopeConfig(options.ropeTuning),
                ropeDisabledSeconds: resolveEffectiveRopeDisabledSeconds(options.ropeTuning),
                debugAugmentIds: options.debugAugmentIds ?? []
            })
        );
        this.combatFeedback = new ClientCombatFeedback({ viewerId: this.authority.playerId });
        this.statusFeedback = new ClientStatusFeedback({ viewerId: this.authority.playerId });
        this.respawnPresentation = new PlayerRespawnPresentation({
            playerId: this.authority.playerId,
            deathDurationSeconds: this.respawnPresentation.deathDurationSeconds,
            spriteSize: this.respawnPresentation.spriteSize
        });
        this.previousRenderSnapshot = null;
        this.camera = this.createCamera();
    }

    applyDebugSettings({ metrics = this.metricsVisible, startAreaId = null } = {}) {
        this.setMetricsVisible(metrics);
        return startAreaId === null || startAreaId === this.previewAreaId;
    }
}
