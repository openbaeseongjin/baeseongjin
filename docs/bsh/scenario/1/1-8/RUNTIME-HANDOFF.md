# 1-8 RUNTIME HANDOFF — REV8.0

Baseline:
`ea9c4438c0f106474baa09621bfb42ae5876b86e`

## Before edit

Fetch latest main and record SHA.

Re-read:
- `src/game/world/areas/sector01/Sector01AreaCatalog.js`
- `src/game/presentation/AuthoredStoryPresentation.js`
- `src/game/presentation/`
- Wind Runtime owner
- Sector checkpoint / sector-transition owner
- landed 1-7 Runtime

If relevant contracts changed, report before coordinate edits.

## 1-7 Seam dependency

Do not finalize 1-8 Entry against stale 1-7.

Implementation order:
1. land/reconcile approved 1-7 REV8
2. read actual 1-7 Exit/Seam
3. minimally adjust 1-8 Entry connector
4. preserve counterflow Security-lane topology
5. test spawn/camera handoff

## Preserve

Enemy:
- exactly 4 Late Pool slots
- sequential activation
- no-crossfire
- no Rope cut

Final Vent:
- RIGHT
- pulsed
- 800
- falloff 80
- cycle 1.75 / 0.7 / 1.4 / 0.3
- no damage

Objective:
`sector-01-08:maintenance-override`

Checkpoint:
current Sector-end checkpoint concept.

Story:
all verified current 1-8 copy.

## Re-author geometry

Implement:
`LOWER LEFT→RIGHT SECURITY → MID SAFE → UPPER RIGHT→LEFT SECURITY → FINAL LEFT→RIGHT PULSE → OVERRIDE → CHECKPOINT`

Target:
`1664×1792`

## Sequential enemies

Order:
1. Lower Grid Guard
2. Lower Turret
3. Upper Grid Guard
4. Upper Turret

Critical:
do not allow all four active as crossfire.

Use current sequential/no-crossfire contract.

## Mid Relief

Must be fully safe:
- no active enemy pressure
- no Wind

This is where:
`CONTAINMENT GATE / LOCKDOWN · 87%`
and Bark B can be read.

## Final Vent

No enemy overlap.

It is a known-mechanic reprise,
not another difficulty spike.

## Player Barks

Current layer absent.

If still absent:
- keep all lines NOT IMPLEMENTED
- do not convert to System Toast
- do not gate Stage
- report clearly

If implementing Player Bark layer:
- local-player
- world continues
- no input capture
- speech visually distinct from System
- causal triggers below

A after Warning sequence:
`…이제 와서 돌아가라고?`

B after Lockdown 87%:
`…멈출 생각이 없네.`

C before/during committed Override:
`좋아… 열어.`

D after Grid Terminating:
`…하부 연결이 끊긴다고?`

E after Worker District / Block 12 checkpoint:
`사람들이 사는 곳까지 이어져 있었던 건가…`

No Bark at Gate-open `ACCESS OPEN`.

## Story order

Preserve causal order:

1. Entry LOCKED
2. FINAL WARNING / RETURN
3. CLOSURE IN PROGRESS
4. LOCKDOWN · 87%
5. Override interaction
6. OVERRIDE LOCK / CONFIRM
7. LOWER GRID CONNECTION / TERMINATING
8. Gate opens → WORKER DISTRICT / ACCESS OPEN
9. Sector checkpoint → WORKER DISTRICT / BLOCK 12

Do not introduce Group C here.

## Sector transition caveat

Current 1-8 has `nextAreaId: null` while checkpoint / Worker District handoff presentation exists.

Do not blindly set nextAreaId to Sector 02.

Find the authoritative current sector-transition/checkpoint owner first.

Preserve its mechanism unless a verified implementation requirement says otherwise.

## Camera

Target zones:
1. intro
2. lower-security
3. mid-relief
4. upper-security
5. final-preview
6. final-crossing
7. override
8. gate-open
9. worker-reveal

No long forced cinematic.

## Validation

Run full repository checks plus:
- 1664×1792 bounds
- enemy count 4
- sequential order/no-crossfire
- no fifth enemy
- final Vent values/cycle/no damage
- no enemy in final Vent
- Mid Relief safe
- Maintenance Override objective
- exact Story regression
- Bark trigger tests if layer implemented
- no fake-Bark System Toast
- checkpoint/sector transition
- landed 1-7 Seam
- multiplayer smoke
- pacing/recovery

Report:
- start SHA
- final SHA
- exact files changed
- tests/checks
- Story/transition deltas
- HYPOTHESIS / NOT IMPLEMENTED
