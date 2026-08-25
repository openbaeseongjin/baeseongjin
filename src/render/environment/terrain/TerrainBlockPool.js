export const TERRAIN_BLOCK_ROLE = Object.freeze({
    PLATFORM: "platform",
    SAFE_DECK: "safe-deck",
    RECOVERY: "recovery",
    OVERHANG: "overhang",
    SEALED_DOOR: "sealed-door",
    COVER: "cover",
    SOLID: "solid"
});

export const TERRAIN_BLOCK_PRESET_ID = Object.freeze({
    PLATFORM: "platform",
    SAFE_DECK: "safe-deck",
    RECOVERY: "recovery",
    OVERHANG: "overhang",
    SEALED_DOOR: "sealed-door",
    COVER: "cover",
    SOLID: "solid"
});

const TERRAIN_BLOCK_ROLE_BY_SURFACE_KIND = Object.freeze({
    platform: TERRAIN_BLOCK_ROLE.PLATFORM,
    "safe-deck": TERRAIN_BLOCK_ROLE.SAFE_DECK,
    recovery: TERRAIN_BLOCK_ROLE.RECOVERY,
    overhang: TERRAIN_BLOCK_ROLE.OVERHANG,
    "sealed-door": TERRAIN_BLOCK_ROLE.SEALED_DOOR,
    cover: TERRAIN_BLOCK_ROLE.COVER,
    solid: TERRAIN_BLOCK_ROLE.SOLID,
    "solid-architectural-blocker": TERRAIN_BLOCK_ROLE.SOLID,
    "solid-los-blocker": TERRAIN_BLOCK_ROLE.SOLID,
    "main-security-runway": TERRAIN_BLOCK_ROLE.PLATFORM,
    "raised-ledge": TERRAIN_BLOCK_ROLE.RECOVERY,
    "departure-deck": TERRAIN_BLOCK_ROLE.SAFE_DECK,
    "grapple-target": TERRAIN_BLOCK_ROLE.PLATFORM
});

export const TERRAIN_BLOCK_POOL = Object.freeze({
    [TERRAIN_BLOCK_PRESET_ID.PLATFORM]: Object.freeze({
        id: TERRAIN_BLOCK_PRESET_ID.PLATFORM,
        variants: Object.freeze(["panel", "rib", "brace"])
    }),
    [TERRAIN_BLOCK_PRESET_ID.SAFE_DECK]: Object.freeze({
        id: TERRAIN_BLOCK_PRESET_ID.SAFE_DECK,
        variants: Object.freeze(["beacon", "stripe", "rail"])
    }),
    [TERRAIN_BLOCK_PRESET_ID.RECOVERY]: Object.freeze({
        id: TERRAIN_BLOCK_PRESET_ID.RECOVERY,
        variants: Object.freeze(["beacon", "rail"])
    }),
    [TERRAIN_BLOCK_PRESET_ID.OVERHANG]: Object.freeze({
        id: TERRAIN_BLOCK_PRESET_ID.OVERHANG,
        variants: Object.freeze(["cross-brace", "diagonal"])
    }),
    [TERRAIN_BLOCK_PRESET_ID.SEALED_DOOR]: Object.freeze({
        id: TERRAIN_BLOCK_PRESET_ID.SEALED_DOOR,
        variants: Object.freeze(["shutter", "warning"])
    }),
    [TERRAIN_BLOCK_PRESET_ID.COVER]: Object.freeze({
        id: TERRAIN_BLOCK_PRESET_ID.COVER,
        variants: Object.freeze(["panel", "recess"])
    }),
    [TERRAIN_BLOCK_PRESET_ID.SOLID]: Object.freeze({
        id: TERRAIN_BLOCK_PRESET_ID.SOLID,
        variants: Object.freeze(["panel", "brace"])
    })
});

export function terrainBlockRoleForSurfaceKind(surfaceKind) {
    return TERRAIN_BLOCK_ROLE_BY_SURFACE_KIND[surfaceKind] ?? TERRAIN_BLOCK_ROLE.PLATFORM;
}

export function isTerrainBlockPresetId(value) {
    return typeof value === "string" && Object.hasOwn(TERRAIN_BLOCK_POOL, value);
}

function stableHash(value) {
    let hash = 2166136261;
    for (const character of value) {
        hash ^= character.codePointAt(0);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}

export function resolveTerrainBlockPresentation({ definition, sectorId, surface } = {}) {
    const role = terrainBlockRoleForSurfaceKind(surface?.kind);
    const presetId = definition.blockPresetForRole(role);
    const preset = TERRAIN_BLOCK_POOL[presetId];
    if (!preset) throw new Error(`Unknown terrain block preset '${presetId}'`);
    const stableKey = `${sectorId ?? "default"}:${surface?.kind ?? "platform"}:${surface?.id ?? "surface"}`;
    const variantId = preset.variants[stableHash(stableKey) % preset.variants.length];
    return Object.freeze({ role, presetId, variantId });
}
