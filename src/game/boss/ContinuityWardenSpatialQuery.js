import { BOSS_ARENA_SUPPORT_KIND, BossArenaSpatialQuery } from "./BossArenaSpatialQuery.js";
import { CONTINUITY_WARDEN_SURFACE_KIND } from "./ContinuityWardenDefinition.js";

export const CONTINUITY_WARDEN_SUPPORT_KIND = BOSS_ARENA_SUPPORT_KIND;

const SUPPORT_KIND_BY_SURFACE_KIND = Object.freeze({
    [CONTINUITY_WARDEN_SURFACE_KIND.MAIN]: CONTINUITY_WARDEN_SUPPORT_KIND.GROUND,
    [CONTINUITY_WARDEN_SURFACE_KIND.LEDGE]: CONTINUITY_WARDEN_SUPPORT_KIND.PLATFORM
});

export function continuityWardenSupportKind(surface) {
    return SUPPORT_KIND_BY_SURFACE_KIND[surface?.kind ?? surface?.surfaceKind] ?? null;
}

export class ContinuityWardenSpatialQuery extends BossArenaSpatialQuery {
    constructor({ surfaces, footTolerance }) {
        super({
            surfaces,
            supportKindBySurfaceKind: SUPPORT_KIND_BY_SURFACE_KIND,
            ...(footTolerance === undefined ? {} : { footTolerance }),
            label: "Continuity Warden"
        });
    }
}
