# 2-1 PRODUCTION ALIGNMENT — REV8.1

Baseline:
`447e6c11e0a007364809aaad634afcb499a2d309`

## Supersession

`ONE-ROPE-SECTOR-02-01-REV8.0-GITHUB-READY`
is:
**SUPERSEDED / DO NOT IMPLEMENT**

Reason:
movement skeleton overlapped too strongly with 1-7.

## Current Runtime vs REV8.1

| Item | Current | REV8.1 | Status |
|---|---|---|---|
| Bounds | 1152×1024 | 1440×832 | RE-AUTHOR |
| Route | compact vertical zig-zag | diagonal lower-left→upper-right rowhouse cut | MAJOR DELTA |
| Full-width reversals | multiple vertical zig-zag relations | 0 | DESIGN LOCK |
| Local offset | n/a | 1 short Laundry offset | KEEP SMALL |
| Enemy slots | 1 | 1 | KEEP |
| Enemy pool | Standard Pool incl. Patrol | static-only legacy Security | FAMILY CORRECTION |
| Entry Story | Worker Block 12 | preserve | VERIFIED |
| Community Notice | present | preserve/reposition | VERIFIED |
| Exit | 2-2 | preserve | KEEP |
| 2-2 Patrol | explicit Patrol Drone | 2-1 must not pre-empt | VERIFIED BOUNDARY |
| Player Bark layer | absent | 2 Barks authored | NOT IMPLEMENTED |

## 1-7 similarity audit

### 1-7
`L→R → rise → R→L → rise → L→R`

### Retired 2-1 REV8.0
`L→R → rise → R→L → rise → L→R`

Result:
REDESIGN.

### 2-1 REV8.1
`→ ↗ ↗ → local ↙ offset → ↗ ↗ →`

Result:
meaningful overlap = **1**.

PASS.

## Forbidden geometry regression

Implementation must not recreate:
- three full horizontal bands
- L→R/R→L/L→R pattern
- end-wall vertical rise after each band
- central chamber reset

If any of these return:
report conflict instead of silently approximating.

## Runtime enemy correction

Current 2-1 uses `SECTOR_02_STANDARD_POOL`,
which contains Patrol.

Current 2-2 explicitly owns an actual `patrol-drone-t1` and subtitle:
`FIRST MOVING SECURITY`.

Therefore:
2-1 should minimally pin its single slot to fixed legacy static Security.

## Player Bark

Approved:
- `…다 어디 간 거지?`
- `…여기서 기다리라고 한 건가.`

Current Bark layer:
absent.

Do not fake as System Toast.

## Runtime implementation (2026-08-19)

Implemented against REV8.1's approved topology, not the superseded REV8.0 draft.
`src/game/world/areas/sector02/Sector02AreaCatalog.js` area01 rewritten in full:
bounds 1472x832 (widened +32 from the doc's 1440x832 - the `entry-walk` platform's authored
left edge sat 16px outside the doc's stated bounds; same disclosed-widening pattern used for
1-7 in Sector 01), entry (-624,-32), diagonal LOWER ALLEY -> SMALL COURT -> MID UTILITY ->
LAUNDRY OFFSET -> UPPER GALLERY -> COMMUNITY TERRACE route with zero full-width reversals and
exactly one local offset (Laundry Landing dips left before UPPER GALLERY resumes the diagonal),
Anchors A/C/E/G as labeled `grapple-landmark` targets and grips B/D/F as unlabeled
`structural-grapple-target` grip points (same runtime mechanics as a grapple-target, kind
renamed so AreaDefinitionValidator's landmark-pairing rule does not require a visible marker
object for them - matches the AREA-SPEC's own "structural-grapple-target" vs "grapple-target"
preset distinction). Single enemy slot pinned to a one-entry `["sentry-t1"]` pool
(`courtyard-guard`), making `patrol-drone-t1` structurally impossible in 2-1 per the enemy-family
correction above. Community Notice sequence text preserved exactly.

Exit deck/point are derived from the shared `exitBlock()` helper (deckX 536, deckTopY -768,
deckWidth 320 - matching the doc's `community-terrace` safe-deck position) rather than the doc's
literal exit point (640,-784); the helper's fixed 32px door inset/exit-height convention (same
one used throughout Sector 01) puts the actual exit point at (664,-800), a small deterministic
offset from the doc's authored value. Documented here rather than silently reconciled, same as
every other exitBlock-driven Stage.

`npm run check`/`npm test` (7 scenario groups) pass. `tests/authoredWorldAssembler.mjs`'s
coordinate-anchor invariant test was extended to also accept `structural-grapple-target` (same
center-anchored 24x24 grip surface as `grapple-target`, only the kind label differs).

Player Bark layer: still absent codebase-wide (confirmed again this pass) - both approved Barks
remain NOT IMPLEMENTED, Stage functions without them per RUNTIME-HANDOFF's own fallback guidance.
