import { WORLD_CONFIG } from "../../game/config.js";

export const ENVIRONMENT_MAX_ALTITUDE = WORLD_CONFIG.levelCount * WORLD_CONFIG.verticalStep;
export const ENVIRONMENT_ZONE_STEP = Math.ceil(ENVIRONMENT_MAX_ALTITUDE / 500) * 100;
