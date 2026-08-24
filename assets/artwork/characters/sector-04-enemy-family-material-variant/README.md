# Sector 04 Enemy Family Material Variant

- Asset ID: `sector-04-enemy-family-material-variant`
- Category: `characters`
- Status: `USER APPROVED / RUNTIME INTEGRATED FOR SECTOR 04`
- Target: the current Sector 01 approved seven-enemy family, adapted to the user-approved overgrown Sector 04 treatment
- Source: repository Runtime atlases copied without resampling from `assets/runtime/characters/sector-01-enemies/`
- Visual reference: approved Sector 04 Upper Residential master at `assets/artwork/environments/sector-04-upper-residential-background/source/far-mid-near-v3-open-ascent-attached-master/sector-04-upper-residential-master.png`
- User reference: `source/user-reference/sector-04-overgrown-enemies-user-reference-v2.png`
- Tool chain: user-supplied concept reference, built-in ImageGen placement review and deterministic Pillow palette, surface-wear and hanging-vine normalization
- Source/license: repository-owned approved project assets; no external artwork

## Scope

This is an identity-preserving image-to-image authoring pass. Every source proportion, equipment shape, facing, pose, cell, atlas dimension, frame order, anchor intent and binary-alpha rule stays unchanged. Neutral exterior metal follows the attached Sector 04 concept with charcoal recesses, oxidized architectural gray, worn pale alloy, rust spotting, muted moss and long hanging vines. Existing opaque sprite pixels are never removed. The latest user decision intentionally allows vine pixels to extend the visible silhouette inside each unchanged `32x32` cell's transparent padding so every monster shows the reference's growth at actual game size.

Role and behavior colors remain exact source RGB values: Shield blue; Support green; Swarm purple; Patrol red/orange; Artillery orange/red warning colors; Sentry and Pursuit sensors, exhaust and warning highlights. No sector marking is added because a new one-pixel mark would compete with the existing role cues at the `32x32` cell scale.

## Deliverables

- `source/approved-sector-01/`: untouched copies of the eight source atlases
- `source/user-reference/sector-04-overgrown-enemies-user-reference-v2.png`: latest user-approved material and hanging-vine authority; not an atlas input
- `source/user-reference/sector-04-overgrown-enemies-user-reference.jpg`: earlier user reference retained for provenance
- `source/imagegen/enemy-family-material-reference.png`: earlier generated material-treatment reference; not an atlas input
- `preview/test/sector-04-enemy-vine-test-v1.png`: user-approved vine feasibility reference; not an atlas input
- `source/generation-prompt.md`: ImageGen edit contract and reference roles
- `source/build_sector04_variant.py`: deterministic palette, surface-wear, body-relative hanging-vine, validation and preview builder
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

The user supplied the final overgrown concept and requested Sector 04-only Runtime and GitHub integration in Issue #983. The eight deterministic exports are promoted byte-for-byte to `assets/runtime/characters/sector-04-enemies/`; Sector 01~03 packages remain unchanged. The latest request supersedes the earlier alpha-equality restriction only for hanging vines inside existing cell padding. It does not authorize cell or atlas resizing, new equipment, animation, timing, gameplay, collision or networking changes.

## Validation

- Deterministic build: `PASS` with Python `3.14.3` and Pillow `12.1.1`.
- Source identity: `PASS` — all eight authoring source copies match the current approved Runtime atlases by SHA-256.
- Atlas contract: `PASS` — 8 RGBA PNGs, exact source dimensions, unchanged `32x32` cell grids and frame/layer order.
- Pixel contract: `PASS` — existing opaque pixels are preserved; newly opaque padding pixels are vine colors only; output alpha values are only `0` and `255`.
- Role-color contract: `PASS` — protected role, sensor, exhaust, telegraph and healing RGB counts are identical to the approved source atlases.
- Surface-wear contract: `PASS` — every populated body frame receives deterministic body-relative moss/rust treatment and hanging strands; Shield role-blue pixels remain unchanged.
- Visual review: `PASS` — every visible body frame retains vine pixels after nearest-neighbor conversion to exact `56x56`, `60x60` or `18x18` world output.
- Runtime promotion: `PASS` — all eight Runtime PNGs are byte-identical to the approved exports and the enemy manifest validator reports 8 atlases, 7 enemies and 48 states.
- Browser review: `PASS` — Stage 4-6 Gameplay View에서 추격 드론의 외장 밖으로 이어진 덩굴과 주황 배기·빨강 센서를 데스크톱 1280×720 및 모바일 844×390으로 확인했고, browser warning/error는 0건이었다. 나머지 6종과 전체 48상태는 실제 출력 크기 시트 및 atlas validator로 확인했다.
