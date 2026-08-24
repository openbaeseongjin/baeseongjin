# Sector 02 Enemy Family Material Variant

- Asset ID: `sector-02-enemy-family-material-variant`
- Category: `characters`
- Status: `USER APPROVED / RUNTIME INTEGRATED FOR SECTOR 02`
- Target: the current Sector 01 approved seven-enemy Runtime family, given the user-selected rugged Sector 02 material treatment
- Source: repository Runtime atlases copied without resampling from `assets/runtime/characters/sector-01-enemies/`
- Tool chain: user-supplied material reference plus deterministic Pillow palette and body-relative clustered surface normalization
- Source/license: repository-owned approved project assets; no external artwork

## Scope

This is an identity-preserving image-to-image authoring pass. It keeps every existing silhouette, proportion, equipment shape, facing, pose, cell, atlas dimension, frame order, anchor intent, transparent padding and binary alpha. The user-selected comparison sheet is the current material authority: neutral housing uses near-black cast-iron recesses, mottled graphite-brown midtones, dry gray-beige worn edges and restrained Worker District dust. Body-relative clustered masks now make the material readable through blocky pits, brown oxidation spots, dust bands and worn highlights at actual game size; the superseded global periodic brightness noise did not meet this requirement. No new weapon, limb, attachment, effect, motion, gameplay timing or collider information is introduced.

Role and behavior colors remain exact source RGB values: Shield blue; Support green; Swarm purple; Patrol red/orange; Artillery orange/red warning colors; Sentry and Pursuit sensors, exhaust and warning highlights. No sector marking is added because a new 1-pixel marking would compete with the role cues at the `32x32` cell scale.

## Deliverables

- `source/approved-sector-01/`: untouched copies of the eight source atlases
- `source/imagegen/`: generated material-treatment references; not atlas inputs
- `source/user-reference/sector-02-rugged-cast-iron-user-reference.png`: current user-selected material authority; comparison sheet only, not copied into atlas geometry
- `source/generation-prompt.md`: ImageGen edit contract and reference roles
- `source/build_sector02_variant.py`: deterministic palette and body-relative clustered surface normalization plus preview builder
- `export/`: eight transparent PNG atlases with the same dimensions as their sources
- `preview/sector-01-vs-sector-02-comparison.png`: side-by-side representative comparison
- `preview/sector-02-runtime-size-comparison.png`: exact intended world-output comparison on a Sector 02 crop
- `preview/atlas-review/`: all output atlases enlarged with nearest-neighbor sampling

## Frame and output contract

| Enemy | Atlas | Source/output size | Cell | Intended world output |
| --- | --- | ---: | ---: | ---: |
| Pursuit | `pursuit-motion.png` | `128x160` | `32x32`, 20 frames | `56x56` |
| Sentry | `sentry-upright-aim.png` | `64x32` | `32x32`, 2 layers | `56x56` |
| Artillery | `artillery-acquisition-motion.png` | `384x32` | `32x32`, 12 frames | `56x56` |
| Shield | `shield-body.png`, `shield-directions.png` | `128x32`, `256x32` | `32x32`, 4 + 8 frames | `60x60` |
| Patrol | `patrol-motion-attack.png` | `128x192` | `32x32`, 24 cells | `56x56` |
| Support | `support-motion.png` | `128x64` | `32x32`, 8 frames | `56x56` |
| Swarm | `swarm-motion.png` | `128x96` | `32x32`, 12 frames | `18x18` |

## Approval and non-scope

The user required the rugged cast-iron replacement to match the supplied material structure, not only its colors. Issue #987 supersedes Issue #941's too-subtle periodic brightness treatment. The eight exports are copied without further image changes into `assets/runtime/characters/sector-02-enemies/`; the existing immutable `sectorId → package` selection registers only `sector-02`. Sector 01, Sector 03, Sector 04, gameplay, AI, collision and networking remain outside its scope. Issue #898 remains the history of the earlier restrained treatment.

## Validation

- Deterministic build: `PASS` with Python `3.14.3` and Pillow `12.1.1`; the current user-reference SHA-256 is recorded per atlas in `verification.json`.
- Atlas contract: `PASS` — 8 RGBA PNGs, exact source dimensions, unchanged `32x32` cell grids and frame/layer order.
- Pixel contract: `PASS` — source alpha bytes and opaque masks are identical; output alpha values are only `0` and `255`.
- Role-color contract: `PASS` — protected role, sensor, exhaust, telegraph and healing RGB counts are identical to the approved source atlases.
- Surface-structure contract: `PASS` — every populated neutral-metal frame has body-relative clustered pits, oxidation, dust and edge wear; Shield role-blue body pixels remain untouched.
- Visual review: `PASS` for the rugged cast-iron authoring comparison, all enlarged animation atlases and exact `56x56`, `60x60` and `18x18` world-output sizes on the Sector 02 reference crop.
- Runtime validator/browser gameplay: `PASS` against the integrated `sector-02-enemies` package at Stage 2-3 desktop `1280x720` and mobile landscape `844x390`; the new pitting, oxidation and dust clusters remain visible on the Support housing with its green role core preserved, and the browser reported no warnings or errors.
