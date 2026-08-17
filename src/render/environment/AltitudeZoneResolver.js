export class AltitudeZoneResolver {
    constructor(definition) {
        this.definition = definition;
    }

    resolve(altitude) {
        return this.definition.zoneAt(altitude);
    }
}

export class AltitudeSunrise {
    constructor({ definition, maxWorldAltitude = ENVIRONMENT_MAX_ALTITUDE } = {}) {
        this.definition = definition;
        this.maxWorldAltitude = maxWorldAltitude;
    }

    progress(altitude) {
        const topZone = this.definition.zones[this.definition.zones.length - 1];
        const minAlt = this.definition.zones[0].minAltitude;
        const maxAlt = Math.max(topZone.minAltitude, this.maxWorldAltitude);
        const range = maxAlt - minAlt;
        if (range <= 0) return 1;
        return Math.max(0, Math.min(1, (altitude - minAlt) / range));
    }

    brightness(altitude) {
        const p = this.progress(altitude);
        return 0.15 + p * 0.85;
    }

    skyOpacity(altitude) {
        return this.brightness(altitude);
    }
}
import { ENVIRONMENT_MAX_ALTITUDE } from "./EnvironmentAltitude.js";

const AUTHORED_SECTOR_ZONE_IDS = Object.freeze({
    "sector-01": "industrial-maintenance",
    "sector-02": "residential-commercial"
});

function playerYDistanceFromArea(position, area) {
    const bounds = area?.bounds;
    if (!Number.isFinite(position?.y) || !bounds) return Number.POSITIVE_INFINITY;
    if (position.y < bounds.y) return bounds.y - position.y;
    if (position.y > bounds.y + bounds.height) return position.y - (bounds.y + bounds.height);
    return 0;
}

export function currentAuthoredArea(scene) {
    const areas = scene?.world?.areas;
    if (!Array.isArray(areas) || areas.length === 0) return null;
    let nearestArea = null;
    let nearestDistance = Number.POSITIVE_INFINITY;
    for (const area of areas) {
        const distance = playerYDistanceFromArea(scene.player?.position, area);
        if (distance < nearestDistance) {
            nearestArea = area;
            nearestDistance = distance;
        }
        if (distance === 0) break;
    }
    return nearestArea;
}

export function sceneEnvironmentZone(definition, scene) {
    const area = currentAuthoredArea(scene);
    const authoredZoneId = AUTHORED_SECTOR_ZONE_IDS[area?.sectorId];
    if (authoredZoneId) {
        const authoredZone = definition.zones.find(({ id }) => id === authoredZoneId);
        if (authoredZone) return authoredZone;
    }
    const playerAltitude = -(scene?.player?.position?.y ?? 0);
    return definition.zoneAt(playerAltitude);
}
