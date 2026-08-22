import { GameApp } from "../GameApp.js";
import { resolveEffectiveRopeConfig, resolveEffectiveRopeDisabledSeconds } from "../config.js";
import { LocalAuthority } from "./LocalAuthority.js";
import { GameSimulation } from "../simulation/GameSimulation.js";
import { defineArea, defineAreaCatalog } from "../world/areas/AreaDefinition.js";
import { PreviewFlightController } from "./PreviewFlightController.js";

const PREVIEW_COMPLETION_MODE = "content-boundary";

class AreaPreviewAuthority extends LocalAuthority {
    applyFlightMotion(position) {
        this.simulation.applyOwnerMotion(this.playerId, {
            ...this.ownerState(),
            position,
            velocity: { x: 0, y: 0 },
            isGrounded: false
        });
    }
}

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

function isolatePreviewArea(generatedArea) {
    return defineArea({
        ...generatedArea,
        nextAreaId: null,
        gate: {
            ...generatedArea.gate,
            nextAreaId: null,
            completionMode: PREVIEW_COMPLETION_MODE
        }
    });
}

export class AreaPreviewGameApp extends GameApp {
    constructor({ generatedArea, revision, ...options } = {}) {
        const area = isolatePreviewArea(assertGeneratedArea(generatedArea));
        const previewRevision = assertPreviewRevision(revision);
        const worldCatalog = defineAreaCatalog({
            id: "map-editor-preview",
            revision: previewRevision,
            areas: [area]
        });
        const authority = new AreaPreviewAuthority(
            new GameSimulation({
                worldCatalog,
                startAreaId: area.id,
                worldSeed: options.worldSeed,
                ropeConfig: resolveEffectiveRopeConfig(options.ropeTuning),
                ropeDisabledSeconds: resolveEffectiveRopeDisabledSeconds(options.ropeTuning),
                debugAugmentIds: options.debugAugmentIds ?? []
            })
        );
        const previewWorld = authority.snapshot().world;
        if (
            previewWorld.layout === "seamless-sectors" ||
            previewWorld.areas?.length !== 1 ||
            previewWorld.areas[0]?.id !== area.id
        ) {
            throw new Error("map-editor-preview-scope-invalid");
        }
        super({ ...options, startAreaId: area.id, authority });
        this.previewAreaId = area.id;
        this.previewFlight = new PreviewFlightController();
    }

    previewScope() {
        const world = this.authority.snapshot().world;
        return Object.freeze({
            areaId: world.areas?.[0]?.id ?? null,
            areaCount: world.areas?.length ?? 0,
            surfaceCount: world.surfaces?.length ?? 0
        });
    }

    applyDebugSettings({ metrics = this.metricsVisible, startAreaId = null } = {}) {
        this.setMetricsVisible(metrics);
        return startAreaId === null || startAreaId === this.previewAreaId;
    }

    setPreviewFlightEnabled(enabled) {
        return this.previewFlight.setEnabled(enabled);
    }

    update(dt, input) {
        if (!this.previewFlight.enabled) return super.update(dt, input);
        const owner = this.authority.ownerState();
        const area = this.authority.snapshot().world.areas[0];
        const nextPosition = this.previewFlight.nextPosition(owner.position, area.bounds, dt, input);
        super.update(dt, this.previewFlight.neutralInput(input));
        this.authority.applyFlightMotion(nextPosition);
    }
}
