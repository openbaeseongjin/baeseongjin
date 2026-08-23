# Sector 04 enemy Runtime package

- Package ID: `sector-04-enemies`
- Source: [`assets/artwork/characters/sector-04-enemy-family-material-variant/`](../../../artwork/characters/sector-04-enemy-family-material-variant/)
- Tool chain: OpenAI built-in ImageGen material/vine references plus deterministic Pillow normalization
- Provenance: repository-owned approved Sector 01 assets; no external artwork
- Runtime selection: only enemies whose authored `sectorId` resolves to `sector-04`

This package preserves the Sector 01 public enemy manifest contract: eight RGBA PNG atlases, seven enemy definitions, the existing `32x32` cells, state and frame order, timing, render sizes, anchors and transparent padding. Neutral exterior metal receives a maintained Upper Residential blue-green graphite and olive-gray treatment. Short two-tone vines replace only existing neutral plate pixels, so atlas size, binary alpha, transparent padding and silhouettes remain unchanged across every frame.

Shield blue, Support green, Swarm purple, Patrol red/orange, Artillery orange/red and the Sentry/Pursuit sensor, exhaust and warning colors remain exact source RGB values. The vine masks never replace role colors, cores, sensors, exhausts, warning panels or attack telegraphs.

The package does not change enemy types, gameplay, AI, collision, damage, networking, animation timing or other sectors. Missing sector packages or unsupported types continue to use the existing Sector 01 and built-in fallbacks.

## Validation

- Authoring export to Runtime PNG hash identity: `PASS` — all eight Runtime atlases are byte-identical to the approved authoring exports.
- Runtime manifest validator: `PASS` — 8 atlases, 7 enemies and 48 states.
- Fixed selection: `PASS` — Sector 01~03 remain unchanged and Sector 04 resolves to `sector-04-enemies`.
- Manual browser review: `PASS` — production Gameplay View rendered Sector 04 Stage 4-1 on desktop and `390x844` mobile without console warnings or errors.
