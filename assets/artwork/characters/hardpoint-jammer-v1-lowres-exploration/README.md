# Hardpoint Jammer V1 Low-Resolution Exploration

- Asset ID: `hardpoint-jammer-v1-lowres-exploration`
- Category: character enemy authoring concept
- Status: Runtime integration candidate; pending explicit final visual approval
- Neutral source: `source/hardpoint-jammer-v1-hover-imagegen.png`
- Motion source: `source/hardpoint-jammer-motion-imagegen.png`
- Runtime-normalized export: `export/hardpoint-jammer-motion.png`
- Previews: `preview/hardpoint-jammer-v1-hover-concept.png`, `preview/hardpoint-jammer-motion-atlas-8x.png`
- Motion source dimensions: transparent RGBA `1240x1268`
- Production atlas: transparent RGBA `128x160`, `4x5` cells at `32x32`
- World output: `56x56`
- Anchor: `center`
- Tool: Codex built-in ImageGen, 2026-08-23
- Normalization: deterministic Sharp script `source/normalize_hardpoint_jammer_motion.mjs`
- Reference inputs: repository-owned approved Sector 01 Sentry, Artillery, Patrol, Support, and Swarm character images
- License: repository license; generated specifically for this project without external source artwork

## Purpose

The concept represents `hardpoint-jammer-v1` as a stationary hovering route-control enemy. Its symmetric level body and compact cyan underside lift cells communicate motionless suspension when it spawns in midair. The dominant opposing antenna paddles and central emitter communicate wireless interference instead of projectile fire.

The state-ready color hierarchy follows the gameplay contract:

- `normal`: cyan core
- `warning`: amber core or antenna cue
- `active`: violet/magenta interference core
- `clear`: cyan recovery cue
- `disabled`: closed, dark antenna assembly

The selected motion keeps the gameplay position fixed. The body only breathes around its center and the antenna paddles carry the larger state change, so a midair-spawned unit reads as suspended rather than walking or patrolling. It intentionally has no floor contact, landing feet, gun barrel, missile rack, shield, wheel, leg, rotor, propeller, Rope-cut cue, or damage effect. The earlier floor-mounted concept remains in `source/hardpoint-jammer-v1-imagegen.png` and `preview/hardpoint-jammer-v1-concept.png` as a superseded exploration record.

## Animation rows

- Row 0, `jammer-normal`: slow cyan hover breathing; `800 ms` loop.
- Row 1, `jammer-warning`: antenna brace and cyan-to-amber charge; non-loop `750 ms`, matching the gameplay warning phase.
- Row 2, `jammer-active`: flared antenna vibration and magenta core; `400 ms` loop while the gameplay-owned `1.5 s` active phase lasts.
- Row 3, `jammer-clear`: magenta-to-cyan release and damped settling; non-loop `500 ms`, matching the gameplay clear phase.
- Row 4, `jammer-disabled`: dark, motionless first frame; the remaining normalized cells are retained but unused.

The ImageGen motion sheet is the creative source. The checked-in Sharp script uniformly slices it, uses nearest-neighbor normalization, derives the dim disabled row, and writes both the production atlas and `8x` review preview. The Runtime manifest selects the current `hardpointJammerStates` phase through `sourceObjectId`; it does not change jammer target selection, cycle authority, Rope attachment rules, collider, damage, AI, physics position, or network state.

Validation (2026-08-23): `npm run validate:enemy-sprite-assets -- assets/runtime/characters/sector-01-enemies` PASS (`9` atlases, `8` enemies, `55` states). The atlas was checked at native `1x` and nearest-neighbor `8x`; the local single-player package load produced no browser warnings or errors.
