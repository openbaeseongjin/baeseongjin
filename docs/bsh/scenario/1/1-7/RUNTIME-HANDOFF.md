# 1-7 RUNTIME HANDOFF — REV8.0

Baseline:
`ea9c4438c0f106474baa09621bfb42ae5876b86e`

## Before implementation

Fetch latest main and record SHA.

Re-read:
- `src/game/world/areas/sector01/Sector01AreaCatalog.js`
- Wind Runtime owner(s)
- Access / Module progression
- `src/game/presentation/AuthoredStoryPresentation.js`
- `src/game/presentation/`
- landed 1-6 Runtime

If relevant contracts changed, report conflict before coordinate edits.

## Dependency / 1-6 Seam

At package baseline, main still has old 1-6 geometry.

Implementation order:
1. land/reconcile approved 1-6 REV8
2. read actual 1-6 exit / Seam
3. minimally adjust 1-7 Entry connector
4. preserve 1-7 Chambered S-Curve
5. test seamless camera/spawn handoff

Do not restore a vertical spine for coordinate convenience.

## Preserve systems

Residual Wind:
- RIGHT
- continuous
- 220
- falloff 80

Main Pulse:
- RIGHT
- pulsed
- 800
- 1.75 / 0.7 / 1.4 / 0.3
- damage false

Access:
- Module C
- Carrier + 2 Guards
- optional

Objective:
`sector-01-07:bypass-open`

## Mainline geometry

Implement:
`LOWER LEFT→RIGHT → MIDDLE RIGHT→LEFT → SAFE SHADOW → UPPER LEFT→RIGHT → BYPASS`

Mainline:
0 enemies.

## Tactical pulse inversion

Critical:
do not create different pulse logic for Middle and Upper.

Both use the SAME Runtime Pulse.

Only geometry changes meaning:
- Middle movement LEFT while Pulse RIGHT → opposition
- Upper movement RIGHT while Pulse RIGHT → assistance

## Wind Baffle

Real Wind Occluder:
- static
- solid
- non-grappleable
- non-damaging

Safe Shadow must genuinely remove pressure influence.

## Access Module C

All 3 Stage enemy slots are here.

- Carrier
- Guard
- Guard

Do not add mainline Turret.
Do not add fourth Sentry.

Access route:
Far Catch → Access A → Access B → Pocket.

Return:
Pocket → Access B → Access A → Far Catch.

No third Wind behavior.

## Story

Preserve exact verified text:
- `PRESSURE NETWORK / UNSTABLE`
- `PRESSURE LIMIT / EXCEEDED`
- `CONTAINMENT VIOLATION / ACTIVE`

Retune trigger regions to new topology.

Do not automatically present:
- bypass-ready
- bypass-open
- service-route-available

Their presence in `storyTriggers` is not proof of visible Story.

## Player Bark

Approved:
`…아까랑 같은 주기네.`

Current Bark layer:
absent.

If still absent:
- do not fake as System Toast
- Stage remains functional
- report NOT IMPLEMENTED

If implementing Bark layer:
- local-player only
- once per Stage attempt
- world continues
- after first stable Left Safe Shadow arrival
- never a gameplay gate

## Camera

Target:
1. lower-approach
2. pressure-preview
3. middle-against
4. left-shadow
5. upper-with
6. access-pocket
7. bypass
8. exit

No forced cinematic pan.

## Tests

Run full project checks plus focused:
- bounds/topology
- residual Wind values
- pulse values/cycle
- same Pulse used Middle + Upper
- Baffle occlusion
- mainline enemy count 0
- Access enemy count 3
- Module C ownership
- objective bypass-open
- verified Story strings / retuned triggers
- unverified Story stays hidden
- Bark trigger if Bark layer exists
- recovery
- Seam from landed 1-6
- multiplayer smoke

Report:
- start SHA
- final SHA
- files changed
- Wind deltas if any
- tests/checks
- NOT IMPLEMENTED / HYPOTHESIS
