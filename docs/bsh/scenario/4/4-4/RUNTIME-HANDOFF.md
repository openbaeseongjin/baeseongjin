# 4-4 RUNTIME HANDOFF — REV1.0

Baseline: `3c9f661bba58af6f7351e00754c12aef86575a12`

## Preflight
Before editing, re-read latest:
- `src/game/config.js`
- Surface Physics / grounded movement changes after Issue #750/#751
- current Sector04 Area Catalog / Seamless compiler
- current `AREA-SPEC-AUTHORING-STANDARD.md` + validator
- Patrol enemy handling
- Direction Runtime/compiler
- current Player Bark capability, if any
- approved 4-1~4-3 Residential docs

## Replace legacy identity
Implement 4-4 as **RESIDENT REFUGE HALL**, bounds `5376×2240`.

Do not preserve the old Infrastructure/Transit 4-4 identity merely because it already exists in code.

## Geometry
The hall is architecturally stepped upward. Door A/B close the floor-level compartments. The approved traversable continuation is the overhead MEP chain.

Do not flatten the three recovery floors into one continuous ground route. Do not turn the MEP route into decorative art only.

## Rope
Approved preview max mandatory relation: **390.61px**. Baseline Hook Reach: **400px**. Recalculate after any coordinate edit and against latest config.

## Enemy
Exactly two `patrol-drone-t1` enemies:
- Patrol A pressures Chamber A recovery floor.
- Patrol B pressures Chamber B recovery floor.

No Pursuit, Cutter, Scanner, Wind, kill gate, or combat-required exit.

## Story / Direction
System facts are operational only. Player Bark is one line:
`“…아래는 저 꼴인데.”`

It must not fire during Rope control or active Patrol pressure. If no compatible Bark Runtime exists, implement the smallest local/reusable capability consistent with current architecture or keep it explicitly unimplemented; **never replace it with a System Toast**.

## Progression
4-4 has no Override. A=4-2, B=4-5, C=4-7, any 2-of-3 at 4-8.

## Release block
- 5376×2240 actual Runtime bounds
- upward silhouette recognizable in live play
- Door A/B prevent flat bypass
- recovery floors recover without bypassing the chamber
- Patrol ×2 only
- Rope audit passes
- system-state text reflects real state
- one Bark max, safe timing only
- no Sector05 explanation
- browser playtest confirms Player naturally keeps moving upward
