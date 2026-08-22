import { anchoredRectangleBounds } from "../world/AuthoredCoordinateAnchor.js";
import { authoredRegionForPosition } from "../world/AuthoredLandmarkResolver.js";
import { resolveMobileCameraZoom } from "../config.js";

const HORIZONTAL_PLAYER_RATIO = 0.38;
const VERTICAL_PLAYER_RATIO = 0.58;
const CAMERA_BLEND_RATE = 5;
const ZOOM_BLEND_RATE = 6;
const STORY_DISPLAY_TRIGGER_SIZE = Object.freeze({ width: 192, height: 64 });

function cameraZoneForLocalY(area, localY) {
    const zones = area.cameraZones?.filter((zone) => zone && typeof zone === "object") ?? [];
    return zones.find(({ minY, maxY }) => localY >= minY && localY <= maxY) ?? null;
}

export function authoredAreaForPosition(world, position) {
    return authoredRegionForPosition(world, position);
}

export function localTriggerObjects(world, areaId) {
    const regions = world?.landmarks?.length ? world.landmarks : world?.areas;
    const area = regions?.find(({ id, areaId: sourceAreaId }) => id === areaId || sourceAreaId === areaId);
    if (!area) return Object.freeze([]);
    const originX = area.bounds.x + area.bounds.width * 0.5;
    const originY = area.bounds.y + area.bounds.height;
    return Object.freeze(
        (world.objects ?? [])
            .filter(
                (object) =>
                    (object.landmarkId === area.id || object.areaId === areaId) &&
                    (object.kind === "trigger" || object.kind === "story-display") &&
                    (object.bounds || object.position)
            )
            .map((object) => {
                const bounds =
                    object.bounds ??
                    anchoredRectangleBounds(
                        object.position,
                        STORY_DISPLAY_TRIGGER_SIZE,
                        object.coordinateAnchor ?? "center"
                    );
                return Object.freeze({
                    cueIds: object.cueIds ?? Object.freeze([]),
                    bounds: Object.freeze({
                        x: bounds.x - originX,
                        y: bounds.y - originY,
                        width: bounds.width,
                        height: bounds.height
                    })
                });
            })
    );
}

export function resolveAuthoredCameraShot({ world, player, mobileView = false, defaultZoom = 1, cssWidth, cssHeight }) {
    const area = authoredAreaForPosition(world, player.position);
    const resolvedDefaultZoom = mobileView ? resolveMobileCameraZoom(undefined, { cssWidth, cssHeight }) : defaultZoom;
    if (!area) {
        return Object.freeze({
            areaId: null,
            landmarkId: null,
            sectorId: null,
            zoneId: null,
            zoom: resolvedDefaultZoom,
            localX: null,
            localY: null,
            horizontalPlayerRatio: HORIZONTAL_PLAYER_RATIO,
            verticalPlayerRatio: VERTICAL_PLAYER_RATIO
        });
    }
    const areaOriginY = area.bounds.y + area.bounds.height;
    const localY = player.position.y - areaOriginY;
    const zone = cameraZoneForLocalY(area, localY);
    return Object.freeze({
        areaId: area.areaId ?? area.id,
        landmarkId: area.areaId ? area.id : null,
        sectorId: area.sectorId ?? null,
        zoneId: zone?.id ?? null,
        zoom: zone
            ? mobileView
                ? resolveMobileCameraZoom(zone.mobileZoom, { cssWidth, cssHeight })
                : zone.desktopZoom
            : resolvedDefaultZoom,
        localX: player.position.x - area.bounds.x - area.bounds.width * 0.5,
        localY,
        horizontalPlayerRatio: zone?.horizontalPlayerRatio ?? HORIZONTAL_PLAYER_RATIO,
        verticalPlayerRatio: zone?.verticalPlayerRatio ?? VERTICAL_PLAYER_RATIO
    });
}

export function advanceAuthoredCamera({
    camera,
    world,
    player,
    mobileView = false,
    defaultZoom = 1,
    cssWidth,
    cssHeight,
    dt
}) {
    const shot = resolveAuthoredCameraShot({ world, player, mobileView, defaultZoom, cssWidth, cssHeight });
    const zoomBlend = 1 - Math.exp(-ZOOM_BLEND_RATE * dt);
    camera.zoom += (shot.zoom - camera.zoom) * zoomBlend;
    const targetX = player.position.x - (cssWidth / shot.zoom) * shot.horizontalPlayerRatio;
    const targetY = player.position.y - (cssHeight / shot.zoom) * shot.verticalPlayerRatio;
    if (camera.initialized === false) {
        camera.x = targetX;
        camera.y = targetY;
        camera.zoom = shot.zoom;
        camera.initialized = true;
        return shot;
    }
    const cameraBlend = 1 - Math.exp(-CAMERA_BLEND_RATE * dt);
    camera.x += (targetX - camera.x) * cameraBlend;
    camera.y += (targetY - camera.y) * cameraBlend;
    return shot;
}
