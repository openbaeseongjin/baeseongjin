# 3-1 PRODUCTION ALIGNMENT — REV8.0

> **CURRENT RUNTIME OVERRIDE — 0.68.0:** Enemy slot은 4개이며 아래 exact one 기록을 대체한다.

> **CURRENT RUNTIME:** 2-8 objective와 Sector 02 Access 3/3을 완료한 Player가 authored Gate portal로 3-1 Entry에 직접 진입한다. 3-1 내부 REV8 geometry·Story·Enemy·3-2 exit 계약은 바뀌지 않는다.

Baseline:
`c1f9cd7f0362de7f7a3065a34e7ea9d35927a934`

## Current Runtime truth

`sector-03-01`은 `AREA-SPEC.v2.json`의 `authoringMode: "runtime"`에서 생성한 모듈을 `AREA-CATALOG.sector03.json` manifest가 선택한다. Sector 03의 3-1~3-8은 모두 같은 generated catalog에서 production Runtime으로 합성된다.

Current `sector-03-01` owns:
- Runtime name `LOWER MARKET PROMENADE`
- subtitle `COMMERCIAL THRESHOLD`
- bounds `3072×1088`
- entry `(-1392,-32)`, exit `(1440,-832)`와 기존 `sector-03-02` 연결
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
- Wind: none
- Camera: authored default camera만 사용하며 별도 Camera Zone 수치는 저작하지 않는다. 이는 REV8의 `customZonesRequired: false` 계약을 따른다.
- objective chain:
  `final-deck-reached → exit-panel-engaged → physical crossing`
- late activation sentry: `sector-03-01:promenade-guard`는 Right Market 착지 이후의 384×192 activation band에만 활성화되어 Left Market·Suspended Market Island Story safe zone을 침범하지 않는다.

## Cutover boundary

- v2 원본과 `src/game/world/areas/generated/sector03/`의 결정적 생성 파일은 이 Stage의 유일한 지형·Anchor·Recovery·적 슬롯·출구 권위다.
- 수기 Sector 03 definition과 Stage별 fallback은 없으며 canonical v2와 generated output만 Runtime 지형·Stable ID·진행 의미를 소유한다.
- Player Bark는 이 변경에 포함하지 않는다. System Story presentation과 혼용하지 않는다.

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
