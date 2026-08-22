# Shield Drone T1 Polygon Redesign

- Status: `LOCAL RUNTIME CANDIDATE / USER APPROVAL PENDING`
- Asset ID: `shield-drone-t1-polygon-redesign`
- Category: `characters`
- Target enemy: `shield-drone-t1` (방패 드론)
- Authored presentation: neutral body plus guard positions `E, SE, S, SW, W, NW, N, NE`
- Target cell: transparent `32x32`
- Intended game display: approximately `60x60 px`; `64x64` integer-scale review is provided
- Source/tool: Codex built-in ImageGen, then deterministic Pillow nearest-neighbor reduction and fixed-palette normalization
- Source/license: repository Sector 01 environment, current Shield Drone motion preview, and approved Player artwork only; no external asset used

## Direction

The small upright drone body is the primary identity. Its compact clipped-octagonal housing reuses Sector 01's straight armor edges, 45-degree chamfers, and heavy industrial massing. A single separate warm-gray polygon shield plate moves around the body without rotating the body itself. The design excludes a visible circular rail, energy ring, limbs, weapon, cables, and dense panel detail.

The 3x3 source layout is `NW, N, NE / W, neutral, E / SW, S, SE`. The generated directional cells are concept evidence rather than a Runtime atlas: small ImageGen identity differences between cells must be removed during a later approved animation pass.

## Files

- `source/imagegen-polygon-direction-sheet.png`: selected transparent ImageGen authoring source
- `source/generation-prompt.md`: selected generation and refinement prompts
- `source/normalize_polygon_preview.py`: deterministic preview normalization
- `export/polygon-design-sheet-32.png`: `96x96` sheet with nine `32x32` concept cells and a fixed six-color opaque palette
- `export/shield-body.png`: `128x32` four-frame upright body atlas; the housing remains fixed while the lower hover cue pulses
- `export/shield-directions.png`: `256x32` shield-only atlas ordered `E, SE, S, SW, W, NW, N, NE`
- `preview/polygon-design-sheet-8x.png`: nearest-neighbor enlarged review sheet
- `preview/polygon-guard-east-12x.png`: selected east-guard pose enlarged on a Sector 01 dark field
- `preview/polygon-neutral-scale-check.png`: neutral cell at logical `1x` and integer `2x` on a Sector 01 dark field
- `preview/shield-body-layer-review.png`: body-only atlas review
- `preview/shield-direction-layer-review.png`: shield-only eight-direction review
- `preview/shield-separated-composite-review.png`: separated layers recombined in Runtime order

## Validation and non-scope

- Confirmed source dimensions `1254x1254`, RGBA, transparent corner alpha.
- Preview normalization uses binary alpha, nearest-neighbor scaling, and six opaque colors.
- Runtime normalization reuses the existing manifest v4 `shield-body` clip and `guard-octants` layer; no schema or renderer branch is added.
- The authoring exports are copied to the local Sector 01 enemy Runtime package for validator and browser review.
- `npm run validate:enemy-sprite-assets -- assets/runtime/characters/sector-01-enemies` passed on 2026-08-21 (`4 atlas, 3 enemies, 26 states`).
- Direct browser review passed in Sector 01-08 with seed `4` at desktop `1280x1000` and mobile `844x390`: the body stayed upright, the physical shield rendered as a separate layer, and no asset-loading warning or error was logged.
- Gameplay, collider, hitbox, damage, physics, AI, and network state remain explicitly unchanged.
- Final completion remains pending until the user reviews the new body/shield composition in the actual game.
