# 3-1 PRODUCTION ALIGNMENT — REV8.0

Baseline:
`c1f9cd7f0362de7f7a3065a34e7ea9d35927a934`

## Current Runtime truth

`sector-03-01`은 `AREA-SPEC.v2.json`의 `authoringMode: "runtime"`에서 생성한 모듈을 `AREA-CATALOG.sector03.json` manifest가 선택한다. Sector 03 facade는 3-1만 generated로 교체하고, 3-2~3-8 legacy Area를 그대로 합성한다.

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
- 기존 `Sector03AreaCatalog.js`의 3-1 수기 definition은 composer가 선택하지 않는다. 3-2~3-8은 다음 Stage별 cutover 전까지 legacy definition을 계속 사용한다.
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
