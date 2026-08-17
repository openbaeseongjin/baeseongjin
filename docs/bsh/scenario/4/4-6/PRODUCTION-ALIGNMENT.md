# SECTOR 04-6 — PRODUCTION ALIGNMENT

*ROPE LINE GEOMETRY COMBAT · CUTTER + PATROL · REV 1.0*

본 문서는 [4-6 시나리오](./README.md)와 현재 `Sector04AreaCatalog` 구현을 연결한다. 4-6은 Cutter와 Patrol band separation을 도입하는 Stage이며 현재 standalone catalog에서 `GRAYBOX READY` 상태다.

## 1. 현재 판정

| 항목 | 상태 | 판정 |
| --- | --- | --- |
| Runtime 연결 | `GRAYBOX READY / STANDALONE ONLY` | 메인 authored chain 미연결 |
| Geometry / Gate | `IMPLEMENTED` | bounds `1536×1568`, lower combat / upper patrol / exit contract 구현 |
| Cutter | `IMPLEMENTED` | `cutter-sentry-01`이 lower band에 고정 배치돼 있다 |
| Patrol Drone | `IMPLEMENTED` | `patrol-drone-01`이 upper band를 pingpong patrol한다 |
| Camera | `IMPLEMENTED` | `cameraZones` 5개 구현 |

## 2. Runtime 좌표 / Stable ID 요약

- Area: `sector-04-06`, entry `(-480,-32)`, exit `(-48,-1536)`, next `sector-04-07`
- Grapple: `A0(-352,-128)`, `C1(-96,-416)`, `C2(256,-576)`, `A3(320,-928)`, `A4(160,-1120)`, `A5(-192,-1248)`
- Recovery: `R2(-320,-1336)`
- Cutter: `cutter-sentry-01(80,-496)`, activation `(-160,-704,512×352)`, rules `cutter-fire / kill-optional / target-lock-cycle / activation-band-only`
- Patrol: `patrol-drone-01(208,-1184)`, patrol `(-240,-1184) ↔ (208,-1184)`, activation `(-448,-1280,896×224)`, rules `kill-optional / no-rope-cut / target-lock-cycle / activation-band-only`
- Gate set(exitBlock 표준): `exit-deck(-256,-1443,416)`, `exit-gate(-80,-1443)`, `exit-panel(-192,-1443)`, exit `(-80,-1475)` — 층간 격벽 전폭 봉쇄, 문 상단은 천장 아래 5px

## 3. Camera · Story 상태

- Camera zones: `entry-cutter-read`, `lower-cutter-span`, `mid-reset`, `patrol-span`, `exit`
- Zone 값: `(-352~0,0.94/0.7)`, `(-704~-352,0.9/0.68)`, `(-1056~-704,0.94/0.7)`, `(-1280~-1056,0.88/0.68)`, `(-1568~-1280,1/0.72)`
- `storyTriggers`: `relay-entry`, `redundant-channel-online`, `junction-security-ahead`
- `cueIds`: `power-relay-span`, `redundant-channel`, `routing-security-ahead`

## 4. 검증 근거

- Source: `src/game/world/areas/sector04/Sector04AreaCatalog.js`
- Tests: `tests/sector04AreaCatalog.mjs`, `tests/combatSystems.mjs`, `tests/renderPerformance.mjs`
- 미확인: lower cutter fairness, upper patrol interruption, 2인 cross-rope cut 체감

## 5. 남은 blocker / asset handoff

- Cutter / Patrol / relay span 시각 자산과 대응 audio / VFX가 아직 없다.
- README가 강조한 band separation이 실제 플레이에서 명확한지 검증이 남아 있다.
- lower combat과 upper patrol을 한 Stage에 둔 리듬이 과밀하지 않은지 standalone playtest가 필요하다.
