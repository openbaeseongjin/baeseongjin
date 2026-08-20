# 3-1 PRODUCTION ALIGNMENT — REV8.0

Baseline:
`c1f9cd7f0362de7f7a3065a34e7ea9d35927a934`

## Current Runtime truth

Current `sector-03-01` still owns:
- Runtime name `POWERED PROMENADE`
- subtitle `COMMERCIAL THRESHOLD`
- bounds `1280×1088`
- Story objects:
  - `sector-03-01:district-sign`
  - `sector-03-01:welcome-kiosk`
- verified Story presentations:
  - `COMMERCIAL DISTRICT / PROMENADE 06`
  - `WELCOME / PUBLIC SERVICE ONLINE`
- exactly one pooled sentry:
  - `sector-03-01:promenade-guard`
  - Standard Pool
- Scanner Groups: none
- Patrol: none
- objective chain:
  `final-deck-reached → exit-panel-engaged → physical crossing`
- next area:
  `sector-03-02`

## Stale documentation corrected

Legacy 3-1 README says:
`Enemy NONE`

Actual Runtime says:
one `promenade-guard`.

REV8 follows Runtime:
**1 late slot**.

Legacy wording:
`Foundation + Specialization`

REV8:
**generic Augment v1 carry / no specific-card lock**.

## REV8 topology

`3072×1088`

`LEFT MARKET → HIGH SUSPENDED MARKET ISLAND → RIGHT MARKET → SHORT SERVICE LIFT`

This replaces:
- old compact vertical promenade
- superseded REV2 twin-void terrace repetition

## Story

System Story is already bound in Runtime.

Player Bark A:
`…여긴 아직 불이 들어와 있어.`

Player Bark B:
`사람은 없는데… 기계들만 계속 일하고 있네.`

Both:
**NOT IMPLEMENTED — PLAYER BARK LAYER**

Do not fake them as System Toast.

## 3-2 boundary

3-1 may show only inactive service/maintenance housing as atmospheric foreshadow.

Forbidden in 3-1:
- Scanner AVAILABLE/WARNING/LOCKED/RESET
- scanner beam
- attach denial
- scanner alarm

3-2 owns the first active Scanner lesson.
