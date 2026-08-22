# Artillery Drone T1 acquisition redesign

- Asset ID: `artillery-drone-t1-acquisition-redesign`
- Category: `characters`
- State: user-selected candidate integrated into the local Runtime package; final in-game review pending
- Intended enemy: `artillery-drone-t1` / 포격 드론
- Authoring cell: transparent `32x32` RGBA
- Intended Runtime output: `56x56`, nearest-neighbor
- Stable orientation: upright and symmetric; no Player-facing rotation

## Presentation direction

The gameplay captures the Player position once when `idle` enters `telegraph`, displays the existing circular ground area for `0.65s`, then resolves the strike at that stored position. The drone therefore does not continuously aim. Its integrated top sensor shutters open symmetrically for one short acquisition beat while the lower range projector extends, then the body settles into a non-directional locked pose. The circular ground telegraph remains the only direction and strike-position indicator.

The design keeps the previous clipped-kite identity but removes the separate rotating optic. Large silhouette changes carry the cue: closed top block, split shutters, exposed square eye and an extended belly projector. Orange-red and amber support those shapes rather than acting as the only distinction. There is no barrel, muzzle, projectile, antenna, cable or micro-panel noise.

## State and frame map

- `idle`: `idle-00..02`, `220ms` each, loop; closed shutters with a restrained projector pulse
- `artillery-telegraph`: `acquire-00..04`, `80/100/120/150/200ms`, non-loop; total `650ms`
- `artillery-cooldown`: `cooldown-00..03`, `180/220/400/600ms`, non-loop; total `1400ms`
- `knockback`: not newly authored; a later Runtime integration may explicitly fall back to `idle`

The frame sums mirror the current gameplay references, but gameplay remains the sole owner of state transitions and damage timing.

## Files

- ImageGen concept input: `source/imagegen-acquisition-concept.png`
- Generation record: `source/generation-prompt.md`
- Deterministic pixel source: `source/build_artillery_acquisition_candidate.py`
- Transparent atlas: `export/artillery-acquisition-motion.png` (`384x32`, twelve `32x32` cells)
- Transparent individual frames: `export/idle-*.png`, `export/acquire-*.png`, `export/cooldown-*.png`
- Animation preview: `preview/artillery-acquisition-cycle.gif`
- State comparison: `preview/artillery-acquisition-states.png`
- Intended `56x56` comparison: `preview/artillery-acquisition-runtime-size.png`

## Tool, source and license

- Concept: OpenAI built-in ImageGen, generated for this repository on 2026-08-22
- Pixel normalization: Python 3.14 and Pillow with exact-coordinate drawing and nearest-neighbor scaling
- Reference inputs: previous fresh-kite Artillery identity, current Player scale review and selected Pursuit gameplay-size review
- External source artwork: none
- License: repository-owned original work under the repository license

## Validation and non-scope

- Every export frame is transparent `32x32` RGBA and shares the same center registration.
- The atlas contains exactly twelve cells in frame order and uses hard pixel edges without antialiasing.
- Preview GIF/PNG files are review artifacts, not Runtime inputs.
- Runtime normalization: copied without resampling to `assets/runtime/characters/sector-01-enemies/artillery-acquisition-motion.png` and mapped through that package's enemy manifest.
- Gameplay, collider, hitbox, damage, physics, AI, telegraph behavior and network state are unchanged.
- Runtime validator PASS on 2026-08-22 (`5 atlas, 4 enemies, 31 states`). Desktop Stage 1-8 displayed the integrated frame without a rotating optic or fallback mock, and mobile-landscape startup completed without browser warnings or errors. Direct mobile encounter traversal and final user play approval remain pending.
