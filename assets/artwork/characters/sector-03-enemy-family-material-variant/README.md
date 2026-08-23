# Sector 03 Enemy Family Material Variant

- Asset ID: `sector-03-enemy-family-material-variant`
- Category: `characters`
- Status: `USER APPROVED / RUNTIME INTEGRATED FOR SECTOR 03`
- Target: the current Sector 01 approved seven-enemy Runtime family, adapted lightly for Sector 03
- Source: repository Runtime atlases copied without resampling from `assets/runtime/characters/sector-01-enemies/`
- Tool chain: user-approved comparison sheet plus deterministic Pillow palette normalization
- Source/license: user-provided project reference and repository-owned approved project assets; no external artwork

## Scope

This is an identity-preserving image-to-image authoring pass. It keeps every existing silhouette, proportion, equipment shape, facing, pose, cell, atlas dimension, frame order, anchor intent, transparent padding and binary alpha. Neutral metal and auxiliary housing colors follow the current user-approved Sector 03 sheet: bright maintained silver faces, brushed-steel midtones, deep graphite seams and restrained warm-metal highlights. Existing source shading supplies the brushed texture without adding new one-pixel decoration. No new weapon, limb, attachment, effect, motion, gameplay timing or collider information is introduced.

Role and behavior colors remain exact source RGB values: Shield blue; Support green; Swarm purple; Patrol red/orange; Artillery orange/red warning colors; Sentry and Pursuit sensors, exhaust and warning highlights. No sector marking is added because a new 1-pixel marking would compete with the role cues at the `32x32` cell scale.

## Deliverables

- `source/approved-sector-01/`: untouched copies of the eight source atlases
- `source/user-reference/sector-03-brushed-steel-user-reference.png`: current approved material sheet; not an atlas input
- `source/imagegen/`: superseded generated treatment references retained for provenance; not atlas inputs
- `source/generation-prompt.md`: deterministic edit contract and reference roles
- `source/build_sector03_variant.py`: deterministic palette-only normalization and preview builder
- `export/`: eight transparent PNG atlases with the same dimensions as their sources
- `preview/sector-01-vs-sector-03-comparison.png`: side-by-side representative comparison
- `preview/sector-03-runtime-size-comparison.png`: exact intended world-output comparison on the approved Sector 03 backdrop
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

The user replaced the earlier Sector 03 treatment with the attached brushed-steel sheet for Runtime integration in GitHub Issue #944. The eight authoring exports are promoted byte-for-byte to `assets/runtime/characters/sector-03-enemies/`; Sector 01, Sector 02 and Sector 04 packages remain unchanged. This approval covers only the color and material treatment. It does not authorize new shapes, equipment, animation, timing, gameplay, collision or networking changes.

## Validation

- Deterministic build: `PASS` with Python `3.14` and bundled Pillow `12.3.0`.
- Atlas contract: `PASS` — 8 RGBA PNGs, exact source dimensions, unchanged `32x32` cell grids and frame/layer order.
- Pixel contract: `PASS` — source alpha bytes and opaque masks are identical; output alpha values are only `0` and `255`.
- Role-color contract: `PASS` — protected role, sensor, exhaust, telegraph and healing RGB counts are identical to the approved source atlases.
- Visual review: `PASS` for the authoring candidate comparison at enlarged nearest-neighbor scale and exact `56x56`, `60x60` and `18x18` world-output sizes on the Sector 03 Central Exchange reference.
- Runtime export hash identity: `PASS` — all eight Runtime PNGs are byte-identical to the approved authoring exports.
- Runtime validator: `PASS` — manifest v4 with eight atlases, seven enemies and 48 presentation states.
- Browser gameplay: `PASS` — Stage `3-5` showed the silver Support treatment at desktop size and the silver Patrol treatment with preserved warning colors at `844x390`; no browser warnings or errors.
