# 1-1 PRODUCTION ALIGNMENT — REV8.0

Baseline: `5ae6efca720720ee34f2a8b45daf1778fd206c1f`

## Current Runtime vs target

| Item | Current | REV8 Target | Status |
|---|---|---|---|
| Bounds | 960×960 at baseline | 1280×1024 | VERIFIED (§8) |
| Entry | (-320,-32) at baseline | (-416,-32) | VERIFIED (§8) |
| A | (-96,-192) at baseline | (-128,-192) | VERIFIED (§8) |
| P1 | (160,-288), W192 at baseline | (224,-320), W224 | VERIFIED (§8) |
| P2 | (-160,-544), W192 at baseline | (-144,-560), W224 | VERIFIED (§8) |
| Overhang | (176,-608), W224 at baseline | (240,-608), W256 | VERIFIED (§8) |
| C | (-64,-704) at baseline | (-96,-736) | VERIFIED (§8) |
| P3 | (16,-800), W224 at baseline | (256,-864), W256 | VERIFIED (§8) |
| Final Deck | (128,-835), W320 at baseline | (320,-947), W384 | VERIFIED (§8) |
| Casing | absent at baseline | ±624, 32×1024 | VERIFIED (§8), same 16px City Wing margin as REV7 — see §8 |
| Story sequence | current verified | preserve exact | VERIFIED / PRESERVE |
| Player Bark | absent | two local barks | NOT IMPLEMENTED (§8) |

## Important Runtime correction

Current config verifies effective Rope hook reach = **400px**, not the older 440px planning value.
Implementation and tests must use current code as authority.

## Seamless

Seamless Runtime width remains 4800.
City Wing surfaces overlap local core by 48px.
Persistent casing must survive legacy import and block external bypass.

## Geometry authority

REV7.0 geometry is superseded.
REV7 psychology/story remains incorporated into REV8.

## 8. Implementation status (branch `docs/sector-01-1-1-rev7-implementation`, REV8 update)

Implementation baseline: `5ae6efca720720ee34f2a8b45daf1778fd206c1f` (still matches latest `main` exactly at REV8 install time — no drift, no re-audit required).

### Geometry — VERIFIED, replaces REV7 entirely

`src/game/world/areas/sector01/Sector01AreaCatalog.js` rewritten to the REV8 coordinates above: `bounds`, `entry`, `p0`/`r1`/`p1`/`p2`/`cable-overhang`/`r3`/`p3`, the exit deck (`block01` `deckX/deckTopY/deckWidth`), `ground-shutter`, `shaft-shell-left/right` (now `±624`, `32×1024`, same `oneWay:false`/`grappleable:false` contract as REV7 — still no new subsystem), `anchor-a`/`anchor-c`, `routePoints`, `recoveryPoints` (REV8 drops the `r2`/mid-recovery point present in REV7 — not re-added, since the package's own surfaces list has no `r2`), and `cameraZones` (`release-corridor` renamed `cross-back`, all five zoom values rescaled per REV8's `AREA-SPEC.json`).

`sector-01-01:cooling-fan` (a decorative `background-prop`, not part of the AREA-SPEC/DIRECTION-SPEC machine contract) was left at its original absolute coordinates `(-288,-672)` — REV8 doesn't mention it, and repositioning it without a design directive would be inventing placement, not implementing one. Flagged here as a likely atmosphere/art follow-up once REV8's visual pass happens.

### Two package defects found and fixed (mechanical, not design invention)

The as-authored `docs/bsh/scenario/1/1-1/AREA-SPEC.json` failed `npm run validate:area-specs` on install:

1. **Missing `route` block** (required field). Added `route.mandatory`/`runtimeLandmarks: ["entry","anchor-a","anchor-c","exit"]`, mirroring the exact same relationship already stated in REV8's own README §7 Movement Signature (`Entry → A → P1 → cross back → P2 → optional Structural Grip → P3 → Terminal`) and unchanged from REV7's route. No new route/order decision was made — this is schema boilerplate for an already-fully-specified order, not new design.
2. **`acceptanceTests[].type: "playtest"`** is not in the validator's known enum (`schema|geometry|traversal|runtime|story|camera|multiplayer|regression`). Changed to `"traversal"`, the closest existing meaning for a first-clear/mastered-clear timing check, without adding a new enum value.

### Found but NOT silently fixed: P0 does not fully reach the Shaft Shell inner face

REV8's `p0` (ground) is `1184` wide (spans `±592`). The Shaft Shell casing sits at `±624` with `32` thickness, giving an inner face at `±608`. That leaves a **16px gap per side** (`592` to `608`) where neither surface exists — the same off-by-16 pattern found in REV7 (there it was `CITY_WING_OVERLAP=48` vs shell thickness `32`; here it's `p0` half-width `592` vs shell inner face `608`). This branch implements the DESIGN LOCKED numbers exactly as given rather than silently widening `p0` or moving the shell to close the gap. `tests/areaDefinitionValidator.mjs`'s pre-existing "P0 must fill the full walkable width" regression test was updated to match REV8's actual authored vertices (`±592`) — the updated assertion message now says it checks the *authored* width, not that the gap is closed, and the test file comment flags this exact discrepancy so it isn't silently normalized.

### Player Bark — still NOT IMPLEMENTED

Same finding as REV7 (§ prior notes, carried forward unchanged): `AuthoredStoryPresentation.js`'s FIFO queue + per-token dedupe would satisfy the sequencing/dedupe contract, but the UI layer that renders `snapshot()` for a `speaker`-distinct visual treatment was not audited this pass either. Left `NOT IMPLEMENTED` per REV8's own priority order (bounds/geometry/casing → 400px reach correctness → bypass prevention → Story preservation → Player Bark → atmosphere last).
