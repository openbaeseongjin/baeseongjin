import { CaptureDefinition } from "../interactions/CaptureDefinition.js";

export const LOWER_SECTOR_COMMANDER_STATE = Object.freeze({
    NEUTRAL: "neutral",
    WALK: "walk",
    GRAB: "chain-hook-grab",
    HAMMER: "hammer-slam",
    CHARGE: "body-charge",
    DEFEATED: "defeated"
});

export const LOWER_SECTOR_COMMANDER_ACTION_PHASE = Object.freeze({
    TELEGRAPH: "telegraph",
    ACTIVE: "active",
    RECOVERY: "recovery"
});

export const LOWER_SECTOR_COMMANDER_HAZARD = Object.freeze({
    GRAB: "commander-grab",
    HAMMER: "commander-hammer",
    CHARGE: "commander-charge"
});

export const LOWER_SECTOR_COMMANDER_OBJECT_KIND = Object.freeze({
    BODY: "boss-lower-sector-commander",
    HAZARD: "boss-lower-sector-commander-hazard",
    GRAB_RANGE: "boss-lower-sector-commander-grab-range",
    GATE: "boss-lower-sector-gate",
    ARENA_SURFACE: "boss-lower-sector-surface"
});

export const LOWER_SECTOR_COMMANDER_ID = Object.freeze({
    BODY: "boss-03:lower-sector-commander:body",
    CAPTURE_DEFINITION: "boss-03:capture:chain-hook",
    ATTACK_HAZARD: (sequence) => `boss-03:hazard:${sequence}`,
    CAPTURE_INTERACTION: (attempt, sequence, playerId) =>
        `boss-03:attempt:${attempt}:capture:${sequence}:target:${playerId}`,
    PRESENTATION_SURFACE: (surfaceId) => `boss-03:presentation:${surfaceId}`
});

export const LOWER_SECTOR_COMMANDER_CAPTURE_DEFINITION = new CaptureDefinition({
    id: LOWER_SECTOR_COMMANDER_ID.CAPTURE_DEFINITION,
    pullSeconds: 0.35,
    holdSeconds: 2
});

export const LOWER_SECTOR_COMMANDER_CAPTURE_DEFINITIONS = Object.freeze({
    [LOWER_SECTOR_COMMANDER_CAPTURE_DEFINITION.id]: LOWER_SECTOR_COMMANDER_CAPTURE_DEFINITION
});
