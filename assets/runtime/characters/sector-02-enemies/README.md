# Sector 02 enemy Runtime package

- Package ID: `sector-02-enemies`
- Source: [`assets/artwork/characters/sector-02-enemy-family-material-variant/`](../../../artwork/characters/sector-02-enemy-family-material-variant/)
- Tool chain: user-supplied material reference plus deterministic Pillow palette and body-relative clustered surface normalization
- Provenance: repository-owned approved Sector 01 assets and the user-provided comparison sheet; no third-party artwork
- Runtime selection: only enemies whose authored `sectorId` resolves to `sector-02`

This package preserves the Sector 01 public enemy manifest contract: eight RGBA PNG atlases, seven enemy definitions, the existing `32x32` cells, state and frame order, timing, render sizes, anchors and transparent padding. Only neutral metal and auxiliary housing receive the user-selected rugged Worker District treatment: near-black cast-iron recesses, mottled graphite-brown midtones, blocky pits, brown oxidation clusters, dry dust bands and worn gray-beige edges. The clustered pattern follows each frame's body-relative metal bounds and occupies 30% of eligible neutral pixels so the supplied material structure remains readable at game size. Shield blue, Support green, Swarm purple, Patrol red/orange, Artillery orange/red and the Sentry/Pursuit sensor, exhaust and warning colors remain unchanged.

The package does not change enemy types, gameplay, AI, collision, damage, networking, animation timing or other sectors. Missing sector packages or unsupported types continue to use the existing Sector 01 and built-in fallbacks.

## Validation

- Authoring export to Runtime PNG hash identity: `PASS` for all eight atlases
- Runtime manifest validator: `PASS` — `8 atlas, 7 enemies, 48 states`
- Fixed selection: `PASS` — Sector 02 resolves to `sector-02-enemies`; Sector 01, Sector 03 and Sector 04 selections remain unchanged
- Manual browser review: `PASS` — Stage 2-3 rendered the denser cast-iron pitting, oxidation and dust treatment on Patrol and Support housing with their role colors preserved at desktop `1280x720` and mobile landscape `844x390`; no browser warnings or errors
