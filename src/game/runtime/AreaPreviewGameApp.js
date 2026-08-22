import { GameApp } from "../GameApp.js";
import { resolveEffectiveRopeConfig, resolveEffectiveRopeDisabledSeconds } from "../config.js";
import { GameSimulation } from "../simulation/GameSimulation.js";
import { createAuthoredSeamlessSectorRuntimeWorld } from "../world/sectors/AuthoredSeamlessSectorRuntime.js";
import { selectWorldSeed } from "../world/WorldSeed.js";
import { LocalAuthority } from "./LocalAuthority.js";
import { PreviewFlightController } from "./PreviewFlightController.js";

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

function assertPreviewAreaId(areaId) {
    if (typeof areaId !== "string" || areaId.trim() === "") {
        throw new TypeError("map-editor-preview-area-required");
    }
    return areaId;
}

function productionLandmarkForArea(world, areaId) {
    if (world?.layout !== "seamless-sectors") {
        throw new Error("map-editor-preview-production-world-required");
    }
    const landmark = world.landmarks?.find(
        ({ id, areaId: sourceAreaId, stageId }) => id === areaId || sourceAreaId === areaId || stageId === areaId
    );
    if (!landmark) throw new Error(`map-editor-preview-area-not-in-production-world: ${areaId}`);
    return landmark;
}

function productionWorldFactory(previewArea, areaId) {
    if (!previewArea) return createAuthoredSeamlessSectorRuntimeWorld;
    if (previewArea.id !== areaId) throw new Error(`map-editor-preview-area-id-mismatch: ${areaId}`);
    const areaOverrides = Object.freeze({ [areaId]: previewArea });
    return (options) => createAuthoredSeamlessSectorRuntimeWorld({ ...options, areaOverrides });
}

export class AreaPreviewGameApp extends GameApp {
    constructor({
        areaId,
        previewArea = null,
        worldSeed = selectWorldSeed(globalThis.location?.search),
        ...options
    } = {}) {
        const previewAreaId = assertPreviewAreaId(areaId);
        const simulation = new GameSimulation({
            worldSeed,
            startAreaId: previewAreaId,
            worldFactory: productionWorldFactory(previewArea, previewAreaId),
            ropeConfig: resolveEffectiveRopeConfig(options.ropeTuning),
            ropeDisabledSeconds: resolveEffectiveRopeDisabledSeconds(options.ropeTuning),
            debugAugmentIds: options.debugAugmentIds ?? []
        });
        const previewLandmark = productionLandmarkForArea(simulation.world, previewAreaId);
        const authority = new AreaPreviewAuthority(simulation);
        super({ ...options, worldSeed, startAreaId: previewAreaId, authority });
        this.previewAreaId = previewAreaId;
        this.previewLandmarkId = previewLandmark.id;
        this.previewFlight = new PreviewFlightController();
    }

    previewScope() {
        const world = this.authority.snapshot().world;
        const landmark = world.landmarks.find(({ id }) => id === this.previewLandmarkId);
        const surfaceIdLookup = Object.freeze(Object.fromEntries(landmark.surfaceIds.map((id) => [id, true])));
        const landmarkSurfaces = world.surfaces.filter(({ id }) => surfaceIdLookup[id]);
        return Object.freeze({
            layout: world.layout,
            areaId: this.previewAreaId,
            landmarkId: landmark.id,
            surfaceCount: landmarkSurfaces.length,
            visibleSurfaceCount: landmarkSurfaces.filter(({ renderable }) => renderable !== false).length,
            worldSurfaceCount: world.surfaces.length
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
        const world = this.authority.snapshot().world;
        const landmark = world.landmarks.find(({ id }) => id === this.previewLandmarkId);
        const nextPosition = this.previewFlight.nextPosition(owner.position, landmark.bounds, dt, input);
        super.update(dt, this.previewFlight.neutralInput(input));
        this.authority.applyFlightMotion(nextPosition);
    }
}
