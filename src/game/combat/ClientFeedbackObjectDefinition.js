import { CLIENT_FEEDBACK_PRESET_ID } from "./ClientFeedbackEventDefinition.js";
import { WIND_PHASE } from "../world/WindPhase.js";

export class ClientFeedbackObjectDefinition {
    constructor({ collection = null, predicate, request }) {
        if (typeof predicate !== "function" || typeof request !== "function") {
            throw new Error("ClientFeedbackObjectDefinition requires predicate and request functions");
        }
        this.collection = collection;
        this.predicate = predicate;
        this.request = request;
        Object.freeze(this);
    }
}

const KEY = Object.freeze({
    wind: (id) => `wind:${id}`,
    projectile: (id) => `trail:${id}`
});

function moving(projectile) {
    return Math.hypot(projectile.velocity?.x ?? 0, projectile.velocity?.y ?? 0) >= 1;
}

function projectileDefinition(collection, presetId) {
    return new ClientFeedbackObjectDefinition({
        collection,
        predicate: moving,
        request: (projectile) => ({
            id: KEY.projectile(projectile.id),
            presetId,
            position: projectile.position,
            direction: projectile.velocity
        })
    });
}

const WIND_DENSITY_BY_PHASE = Object.freeze({
    [WIND_PHASE.WARNING]: () => 0.25,
    [WIND_PHASE.ACTIVE]: (state) => Math.max(0.35, state.multiplier),
    [WIND_PHASE.DECAY]: (state) => state.multiplier
});

function windDensity(state) {
    return WIND_DENSITY_BY_PHASE[state.phase](state);
}

export const CLIENT_FEEDBACK_OBJECT = Object.freeze({
    WIND: new ClientFeedbackObjectDefinition({
        predicate: ({ state }) => Boolean(state && WIND_DENSITY_BY_PHASE[state.phase]),
        request: ({ zone, state }) => ({
            id: KEY.wind(zone.id),
            presetId: CLIENT_FEEDBACK_PRESET_ID.WIND_FLOW,
            position: { x: zone.bounds.x + zone.bounds.width / 2, y: zone.bounds.y + zone.bounds.height / 2 },
            direction: zone.direction,
            options: {
                bounds: {
                    minX: zone.bounds.x,
                    minY: zone.bounds.y,
                    maxX: zone.bounds.x + zone.bounds.width,
                    maxY: zone.bounds.y + zone.bounds.height
                },
                density: windDensity(state)
            }
        })
    }),
    PROJECTILE: Object.freeze([
        projectileDefinition("projectiles", CLIENT_FEEDBACK_PRESET_ID.PLAYER_SHOT),
        projectileDefinition("enemyProjectiles", CLIENT_FEEDBACK_PRESET_ID.ENEMY_MUZZLE),
        projectileDefinition("augmentProjectiles", CLIENT_FEEDBACK_PRESET_ID.PLAYER_SHOT)
    ])
});
