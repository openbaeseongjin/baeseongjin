# SECTOR 04-2 — PRODUCTION ALIGNMENT

*CUTTER INTRO · CAMERA · REV 1.0*

본 문서는 [4-2 시나리오](./README.md)와 현재 `Sector04AreaCatalog` 구현을 연결한다. 4-2는 Sector 04의 첫 Cutter Stage이며 현재 standalone catalog에서만 `GRAYBOX READY` 상태다.

## 1. 현재 판정

| 항목 | 상태 | 판정 |
| --- | --- | --- |
| Runtime 연결 | `GRAYBOX READY / STANDALONE ONLY` | 메인 authored chain에는 아직 없다 |
| Geometry / Gate | `IMPLEMENTED` | bounds `1280×1312`, Gate / Panel / recovery 구현 |
| Cutter | `IMPLEMENTED` | `cutter-sentry-01`이 `cutter-fire` opt-in 규칙으로 배치돼 있다 |
| Camera | `IMPLEMENTED` | `cameraZones` 5개가 들어가 있다 |
| Story | `TRIGGER / CUE ONLY` | `storyTriggers` / `cueIds`는 있으나 `story-display` object는 없다 |

## 2. Runtime 좌표 / Stable ID 요약

- Area: `sector-04-02`, entry `(-480,-32)`, exit `(464,-1280)`, next `sector-04-03`
- Grapple: `A0(-352,-128)`, `C1(32,-448)`, `C2(-32,-621)`, `A3(64,-992)`, `A4(64,-1168)`
- Recovery: `R1(-288,-600)`, `P2(-224,-824)`
- Cutter: `cutter-sentry-01(92,-501)`, activation `(-96,-880,352×640)`, rules `cutter-fire / target-lock-cycle / activation-band-only`
- Gate set(exitBlock 표준): `exit-deck(256,-1187,416)`, `exit-gate(432,-1187)`, `exit-panel(320,-1187)`, exit `(432,-1219)` — 층간 격벽 전폭 봉쇄, 문 상단은 천장 아래 5px
- Objectives: `final-deck-reached bounds (48,-1280,416×96)`, `exit-panel-engaged`

## 3. Camera · Story 상태

- Camera zones: `entry`, `cutter-read`, `second-cutter`, `exit-flow`, `gate`
- Zone 값: `(-224~0,1/0.72)`, `(-608~-224,0.92/0.7)`, `(-864~-608,0.92/0.7)`, `(-1184~-864,0.95/0.72)`, `(-1312~-1184,1/0.72)`
- `storyTriggers`: `cutter-line-entry`, `cutter-read`, `cutter-recovery`
- `cueIds`: `cutter-line`, `cutter-fire`, `first-rope-interruption`

## 4. 검증 근거

- Source: `src/game/world/areas/sector04/Sector04AreaCatalog.js`
- Tests: `tests/sector04AreaCatalog.mjs`, `tests/combatSystems.mjs`, `tests/renderPerformance.mjs`
- 미확인: 실제 컷 가독성, 브라우저 플레이 fairness, 메인 world 연결

## 5. 남은 blocker / asset handoff

- Cutter 시각 프로필과 charge / slice cue는 runtime family만 있고 정식 자산은 없다.
- README 기준의 rope-cut readability와 fair first-shot 확인이 실제 플레이에서 필요하다.
- Sector 04 전체가 아직 standalone이므로 공용 timer / progression과의 결합 검증이 남아 있다.
