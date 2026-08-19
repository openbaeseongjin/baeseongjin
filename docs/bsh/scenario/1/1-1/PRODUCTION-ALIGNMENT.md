# 1-1 PRODUCTION ALIGNMENT — REV7.0

> Audit baseline: `5ae6efca720720ee34f2a8b45daf1778fd206c1f`  
> Planning status: **DESIGN LOCKED**  
> Runtime status: **PARTIAL MATCH** (was NOT IMPLEMENTED for geometry at audit baseline; geometry now VERIFIED — see §7)

## 1. Current match table

| Item | REV7 plan | Current Runtime at baseline | Status |
|---|---|---|---|
| Bounds / Entry | 960×960 / (-320,-32) | same | VERIFIED |
| Dedicated Grapple | A, C only | A, C only | VERIFIED |
| Cable Overhang | grappleable structural opportunity | overhang; no explicit grappleable false | VERIFIED |
| P3 | x224, y-800, w192 | x16, y-800, w224 at audit baseline; **x224, w192 after this branch** | VERIFIED (§7) |
| Shaft Shell | two 32×960 non-grapple solid casings | absent at audit baseline; **present after this branch** | VERIFIED (§7), City Wing bypass margin still MANUAL |
| Recovery R1/R2/R3 | preserve | present | VERIFIED |
| Enemy/Wind/Augment | none | none | VERIFIED |
| Entry Story | GROUND SERVICE ACCESS / LOCKDOWN | present | VERIFIED |
| Terminal sequence | 3-step exact current sequence | present + tested | VERIFIED |
| Gate text | SERVICE SHAFT 02 / ACCESS OPEN | present + tested | VERIFIED |
| Player Bark S0 | `뭐야…?` | no player bark owner found | **NOT IMPLEMENTED** |
| Player Bark S5 | `…일단 위로.` | no player bark owner found | **NOT IMPLEMENTED** |
| S3 exhale | optional non-verbal | no verified authored layer | **NOT IMPLEMENTED** |
| Atmosphere audio/light timing | REV7 direction | not verified | **NOT IMPLEMENTED / AUDIT REQUIRED** |

## 2. Runtime geometry changes required

### P3
Change legacy source geometry from:
- x `16`
- width `224`

to:
- x `224`
- width `192`

Keep:
- y `-800`
- height `16`

### Shaft Shell
Add two persistent solids:
- left center `(-464,-480)`, `32×960`
- right center `(+464,-480)`, `32×960`

Required semantics:
- solid
- not one-way
- non-grappleable
- non-filtered by Seamless legacy boundary import
- visible as Service Riser casing

Implementation must audit current generic rectangle/surface contract first.
Do not create a large new subsystem if current `rectangle()` properties can represent this.

## 3. Story preservation

Do not alter the verified system sequence order/cadence merely to add protagonist voice.

Preserve:
- Entry `GROUND SERVICE ACCESS / LOCKDOWN`
- Terminal:
  - `VERTICAL GRID / CASCADE FAILURE`
  - +0.9 `LOWER TRANSIT / OFFLINE`
  - +0.9 `ROOFTOP PAD 03 / MAINTENANCE SHUTTLE · STANDBY`
- Gate `SERVICE SHAFT 02 / ACCESS OPEN`

Existing tests must continue to pass.

## 4. New presentation work

Player Bark is a new requirement and must remain separate in meaning from system Story text.

Requirements:
- local player
- no world pause
- no movement/rope lock
- once-per-run/attempt dedupe as specified
- no replay spam from network gate replays
- S0 Bark must not hide the LOCKDOWN text
- S5 Bark must wait until system message reading competition is over
- Bark layer must not own objectives/gates

If Runtime gained a dialogue owner after this baseline, reuse it.
Otherwise implement the smallest dedicated local presentation layer rather than overloading objective authority.

## 5. Current source-of-truth split

- Plan: README / AREA-SPEC / DIRECTION-SPEC
- Actual Runtime: `src/game/world/areas/sector01/Sector01AreaCatalog.js`
- System story: `src/game/presentation/AuthoredStoryPresentation.js`
- Story regression tests: `tests/authoredStoryPresentation.mjs`
- Final seamless behavior: audit `LegacyAreaSeamlessSectorRuntime.js`

## 6. Acceptance

Runtime cannot be marked MATCH until:
- P3 matches target
- Shell blocks City Wing bypass
- existing Story tests pass
- player bark is implemented or explicitly left NOT IMPLEMENTED
- local/multiplayer dedupe is verified
- 1-1 base Rope remains clear

## 7. Implementation status (branch `docs/sector-01-1-1-rev7-implementation`)

Implementation baseline: `5ae6efca720720ee34f2a8b45daf1778fd206c1f` (matches package baseline exactly — no drift, no re-audit required).

### P3 — VERIFIED

`src/game/world/areas/sector01/Sector01AreaCatalog.js` `sector-01-01:p3` changed from `x16, w224` to `x224, w192` (y/height unchanged). No other file referenced the old coordinates (checked via repo-wide grep before editing).

### Shaft Shell — VERIFIED (geometry), City Wing bypass margin still MANUAL

Added `sector-01-01:shaft-shell-left`/`-right` using the existing `rectangle()`/`horizontalSurface()` contract only — `oneWay: false`, `grappleable: false` (both already-real Runtime properties, used elsewhere in this same file for `sector-01-02:crossbeam-x1`). No new subsystem was created; `AREA-SPEC.json` still declares `non-grapple-solid` as `NOT_IMPLEMENTED` under `runtimeDependencies.newSystems` because that is a *planning preset name*, not a Runtime capability gap — the validator already accepts it as a declared dependency and this PR does not add it to the AREA-SPEC validator's KNOWN preset registry, since doing so is a separate, cross-cutting infra decision outside this Stage's scope.

Position/size follow the DESIGN LOCKED spec exactly: center `(-464,-480)`/`(+464,-480)`, `32×960`, which the repo's `top-center` coordinate anchor computes as `y: -960` (top edge) for the `rectangle()` call — verified against `AuthoredCoordinateAnchor.js`'s `anchoredRectangleBounds()` formula (`bounds.y = position.y - height*anchor.y`, and `top-center`'s `anchor.y = 0`, so the authored `y` is already the top edge, not the center).

**Finding, not silently fixed**: `LegacyAreaSeamlessSectorRuntime.js`'s `CITY_WING_OVERLAP` constant is `48`, but the DESIGN LOCKED shell thickness is `32`. The City Wing safe-deck walkway can overlap `16px` past the shell's inner edge (`x -448` vs the wing's reach to `x -432` on the left; mirrored on the right). This branch does **not** change the DESIGN LOCKED `32×960` dimension to compensate — that is a planning-side call, not an implementation-side one. `shaft-shell-blocks-city-wing-bypass` in `AREA-SPEC.json` was already declared `automation: MANUAL`, so this remains a playtest item; the 16px margin above is flagged here so the playtester knows exactly what to check.

### Player Bark (S0/S5) — still NOT IMPLEMENTED

Audited `AuthoredStoryPresentation.js`'s architecture: it is a single-slot FIFO queue (`this.current`/`this.queue`) with per-token one-time dedupe (`this.seenTokens`). Enqueueing a bark entry into the same array as the existing system-text entry (for `ENTRY_PRESENTATIONS["sector-01-01"]` and the gate's `GATE_PRESENTATIONS` entry) would automatically satisfy the ordering/non-overlap/dedupe requirements in `RUNTIME-HANDOFF.md` §"Player voice contract" for free — no new dedupe or sequencing system needed. What is **not** audited: whether the UI layer that renders `AuthoredStoryPresentation.snapshot()` already supports a `speaker`/visual-treatment field to keep Bark from looking identical to system Toast (`ASSET-REQUIREMENTS.md` explicitly forbids that). Implementing the data-layer half without confirming the UI half would risk shipping a bark that visually competes with system text — exactly what's forbidden — so this is left `NOT IMPLEMENTED` per the package's own priority order (geometry/bypass/story-preservation before player bark, atmosphere last). Concrete next step: audit the UI component that consumes `AuthoredStoryPresentation.snapshot()` (not yet located this pass) for a speaker/kind field before implementing.

### S3 exhale / atmosphere audio-light — still NOT IMPLEMENTED

Not attempted this branch, consistent with "atmosphere polish last" in `CLAUDECODE-IMPLEMENT-1-1-REV7.md`.
