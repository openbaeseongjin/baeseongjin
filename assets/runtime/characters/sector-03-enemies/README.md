# Sector 03 enemy Runtime package

- Package ID: `sector-03-enemies`
- Source: [`assets/artwork/characters/sector-03-enemy-family-material-variant/`](../../../artwork/characters/sector-03-enemy-family-material-variant/)
- Tool chain: OpenAI built-in ImageGen material references plus deterministic Pillow palette normalization
- Provenance: repository-owned approved Sector 01 assets; no external artwork
- Runtime selection: only enemies whose authored `sectorId` resolves to `sector-03`

This package preserves the Sector 01 public enemy manifest contract: eight RGBA PNG atlases, seven enemy definitions, the existing `32x32` cells, state and frame order, timing, render sizes, anchors and transparent padding. Only neutral metal and auxiliary housing colors receive the restrained Sector 03 Central Exchange treatment: cool blue-silver, refined graphite, clean dark-navy panels, muted champagne hardware and a trace of dust. Shield blue, Support green, Swarm purple, Patrol red/orange, Artillery orange/red and the Sentry/Pursuit sensor, exhaust and warning colors remain unchanged.

The package does not change enemy types, gameplay, AI, collision, damage, networking, animation timing or other sectors. Missing sector packages or unsupported types continue to use the existing Sector 01 and built-in fallbacks.

## Validation

- Authoring export to Runtime PNG hash identity: `PASS` for all eight atlases
- Runtime manifest validator: `PASS` — `8 atlas, 7 enemies, 48 states`
- Fixed selection: `PASS` — Sector 01 remains `sector-01-enemies`, Sector 02 remains `sector-02-enemies`, Sector 03 resolves to `sector-03-enemies`
- Manual browser review: `PASS` — Sector 03 enemy rendered with preserved role colors at the default desktop viewport and `390x844` mobile viewport; no browser warnings or errors
