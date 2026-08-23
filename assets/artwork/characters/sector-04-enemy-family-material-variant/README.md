# Sector 04 Enemy Family Material Variant

- Asset ID: `sector-04-enemy-family-material-variant`
- Category: `characters`
- Status: `USER APPROVED / RUNTIME INTEGRATED FOR SECTOR 04`
- Target: the current Sector 01 approved seven-enemy family, adapted lightly for Sector 04
- Source: repository Runtime atlases copied without resampling from `assets/runtime/characters/sector-01-enemies/`
- Visual reference: approved Sector 04 Upper Residential master at `assets/artwork/environments/sector-04-upper-residential-background/source/far-mid-near-v3-open-ascent-attached-master/sector-04-upper-residential-master.png`
- Tool chain: OpenAI built-in ImageGen material-reference edit plus deterministic Pillow palette normalization
- Source/license: repository-owned approved project assets; no external artwork

## Scope

This is an identity-preserving image-to-image authoring pass. Every source silhouette, proportion, equipment shape, facing, pose, cell, atlas dimension, frame order, anchor intent, transparent padding and binary alpha stays unchanged. Neutral exterior metal moves slightly toward the maintained Sector 04 residential reference: blue-green graphite, cool architectural gray, pale alloy and restrained olive-gray lichen staining. The user-approved follow-up adds short two-tone vines by replacing only existing neutral plate pixels, so no loose grass, alpha expansion or protruding plant shape is introduced.

Role and behavior colors remain exact source RGB values: Shield blue; Support green; Swarm purple; Patrol red/orange; Artillery orange/red warning colors; Sentry and Pursuit sensors, exhaust and warning highlights. No sector marking is added because a new one-pixel mark would compete with the existing role cues at the `32x32` cell scale.

## Deliverables

- `source/approved-sector-01/`: untouched copies of the eight source atlases
- `source/imagegen/enemy-family-material-reference.png`: generated material-treatment reference; not an atlas input
- `preview/test/sector-04-enemy-vine-test-v1.png`: user-approved vine feasibility reference; not an atlas input
- `source/generation-prompt.md`: ImageGen edit contract and reference roles
- `source/build_sector04_variant.py`: deterministic palette-only normalization, validation and preview builder
- `export/`: eight transparent PNG atlases with the same dimensions as their sources
- `preview/sector-01-vs-sector-04-comparison.png`: side-by-side representative comparison
- `preview/sector-04-runtime-size-comparison.png`: exact intended world-output comparison on the approved Sector 04 backdrop
- `preview/atlas-review/`: all output atlases enlarged with nearest-neighbor sampling

## Frame and output contract

| Enemy     | Atlas                                      | Source/output size |                  Cell | Intended world output |
| --------- | ------------------------------------------ | -----------------: | --------------------: | --------------------: |
| Pursuit   | `pursuit-motion.png`                       |          `128x160` |    `32x32`, 20 frames |               `56x56` |
| Sentry    | `sentry-upright-aim.png`                   |            `64x32` |     `32x32`, 2 layers |               `56x56` |
| Artillery | `artillery-acquisition-motion.png`         |           `384x32` |    `32x32`, 12 frames |               `56x56` |
| Shield    | `shield-body.png`, `shield-directions.png` | `128x32`, `256x32` | `32x32`, 4 + 8 frames |               `60x60` |
| Patrol    | `patrol-motion-attack.png`                 |          `128x192` |     `32x32`, 24 cells |               `56x56` |
| Support   | `support-motion.png`                       |           `128x64` |     `32x32`, 8 frames |               `56x56` |
| Swarm     | `swarm-motion.png`                         |           `128x96` |    `32x32`, 12 frames |               `18x18` |

## Approval and non-scope

The user approved the vine feasibility image and requested Sector 04-only Runtime and GitHub integration in Issue #925. The eight deterministic exports are promoted byte-for-byte to `assets/runtime/characters/sector-04-enemies/`; Sector 01~03 packages remain unchanged. This approval covers only the existing material and restrained vine treatment. It does not authorize new equipment, animation, timing, gameplay, collision or networking changes.

## Validation

- Deterministic build: `PASS` with Python `3.14.3` and Pillow `12.1.1`.
- Source identity: `PASS` — all eight authoring source copies match the current approved Runtime atlases by SHA-256.
- Atlas contract: `PASS` — 8 RGBA PNGs, exact source dimensions, unchanged `32x32` cell grids and frame/layer order.
- Pixel contract: `PASS` — source alpha bytes and opaque masks are identical; output alpha values are only `0` and `255`.
- Role-color contract: `PASS` — protected role, sensor, exhaust, telegraph and healing RGB counts are identical to the approved source atlases.
- Vine contract: `PASS` — every populated atlas cell receives the same cell-local neutral-plate treatment while Shield role-blue body pixels remain unchanged.
- Visual review: `PASS` for all long atlases at enlarged nearest-neighbor scale and exact `56x56`, `60x60` and `18x18` world-output sizes on the approved Sector 04 backdrop.
- Runtime promotion: `PASS` — all eight Runtime PNGs are byte-identical to the approved exports and the enemy manifest validator reports 8 atlases, 7 enemies and 48 states.
- Browser review: `PASS` — production Gameplay View rendered Sector 04 Stage 4-1 on desktop and `390x844` mobile without console warnings or errors.
