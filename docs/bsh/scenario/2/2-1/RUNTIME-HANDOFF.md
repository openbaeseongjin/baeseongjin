# 2-1 RUNTIME HANDOFF — REV8.1

Baseline:
`447e6c11e0a007364809aaad634afcb499a2d309`

## Critical first instruction

Do NOT implement the old REV8.0 route.

REV8.0 is superseded because it recreated the 1-7 S-curve movement skeleton.

## Re-read before editing

- latest main
- `Sector02AreaCatalog.js`
- current 2-1
- current 2-2
- `AuthoredStoryPresentation.js`
- `src/game/presentation/`
- Sector 02 enemy-density authority
- landed 1-8→2-1 transition

## Approved topology

Bounds:
`1440×832`

Core:
`LOWER ALLEY → SMALL COURT → MID UTILITY → LAUNDRY OFFSET → UPPER GALLERY → COMMUNITY TERRACE`

Dominant route:
**lower-left → upper-right**

Exactly:
- zero full-width route reversals
- one small left offset

Do not make three horizontal Floors.

## Rope geometry

Main Grapple targets:
A `(-384,-176)`
B `(-96,-256)`
C `(+224,-352)`
D `(+160,-464)`
E `(+160,-576)`
F `(+416,-640)`
G `(+416,-752)`

All current planning spans are safely within 400px.

Do not expand them to range-edge difficulty without a concrete playtest reason.

## Enemy

Keep one slot.

Current Runtime pool can choose Patrol.

Correct this.

Recommended:
fixed `sentry-t1`.

Contract:
- kill optional
- no Rope cut
- activation-band
- low pressure

2-2 must remain first actual Patrol Drone.

## Story

Preserve exact Entry:
`WORKER BLOCK 12 / RESIDENTIAL COURTYARD`

Reposition Notice to Community Terrace and preserve exact sequence:

`COMMUNITY NOTICE / EVACUATION GROUP C`

then

`ASSEMBLY: BLOCK 12 / WAIT FOR FURTHER INSTRUCTION`

Notice zone fully safe.

## Bark

Current Bark layer absent.

If absent:
- do not fake as System Toast
- report NOT IMPLEMENTED
- Stage still works

If implementing:
A `…다 어디 간 거지?`
after lived-in evidence.

B `…여기서 기다리라고 한 건가.`
after full Notice.

Local only.
Once per attempt.
No world pause.

## Camera

Test default Camera first.

No dramatic scale pan/zoom.

The low-rise density should be conveyed by art and topology.

## Seam

1-8 may not yet be landed.

Final Entry coordinates only after:
- Sector transition owner audit
- actual 2-1 spawn check

Minimal connector change only.

Preserve internal diagonal topology.

## Regression tests

Must explicitly test:
1. route has zero full-width reversals
2. no three-band S shape
3. Patrol impossible in 2-1
4. Patrol still present in 2-2
5. one enemy slot only
6. exact Notice copy
7. safe Notice
8. exit chain to 2-2
9. Bark behavior if implemented
10. multiplayer / respawn / seam
11. pacing / visual scale

Report:
- start SHA
- final SHA
- changed files
- geometry changes
- enemy-family correction
- tests
- NOT IMPLEMENTED / HYPOTHESIS
