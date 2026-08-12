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
