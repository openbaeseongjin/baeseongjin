# SECTOR 03-5 — PRODUCTION ALIGNMENT

*REST · GENERIC AUGMENT · STORY · REV 1.1*

본 문서는 [3-5 시나리오](./README.md)와 현재 `Sector03AreaCatalog` 구현을 연결한다. 3-5는 Sector 03의 휴식 / 세 번째 generic Augment Stage이며 현재 메인 authored world에 `MOCK INTEGRATED` 상태로 연결돼 있다.

## 0. CURRENT RUNTIME OVERRIDE — 2026-08-19

- 0.32.0 enemy density 이후 pooled Sentry slot 두 기가 존재하며, 0.41.0부터 `node-exit-guard(-48,-464)`가 `sector-03:access-module:b` Carrier다.
- 적 수·위치·activation·pool과 generic Augment Node는 바꾸지 않고 Sector 03의 두 번째 3-of-3 source만 부여한다. 아래 Threat 없음 서술은 이 override로 대체한다.
- 0.42.0부터 Carrier 위치 문자열은 제거하고 화면 밖 edge arrow와 화면 안 diamond marker를 같은 module world position에서 전환한다.

## 1. 현재 판정

| 항목 | 상태 | 판정 |
| --- | --- | --- |
| Runtime 연결 | `MOCK INTEGRATED` | 메인 authored chain의 rest node로 연결돼 있다 |
| Geometry / Gate | `IMPLEMENTED` | bounds `960×688`, 짧은 safe deck 흐름과 exit contract 구현 |
| Threat | `IMPLEMENTED AS NONE` | Enemy / Scanner / Wind가 없다 |
| Story | `IMPLEMENTED` | `story-display` 3개와 stable service Node가 배치돼 있다 |
| Growth | `IMPLEMENTED` | 기존 Calibration Frame ID를 세 번째 generic `augment-node`로 승격하고 Player별 offer를 연결 |

## 2. Runtime 좌표 / Stable ID 요약

- Area: `sector-03-05`, entry `(-240,-32)`, exit `(352,-656)`, next `sector-03-06`
- Grapple: `G1(-32,-400)`, `G2(192,-512)`, `G3(32,-624)`
- Recovery: `R1(-48,-488)`
- Story / object: `service-calibration-frame(240,-288)` generic Augment source, `node-id(0,-312)`, `access-summary(120,-312)`(Node 겹침 방지용 비충돌 표시 이동), `premium-atrium-ahead(288,-680)`
- Gate set(exitBlock 표준): `exit-deck(288,-563,256)`, `exit-gate(384,-563)`, `exit-panel(272,-563)`, exit `(384,-595)` — 층간 격벽 전폭 봉쇄, 문 상단은 천장 아래 5px
- Objectives: `augment-selected(interact-choice)`, `final-deck-reached bounds (160,-656,256×96)`, 두 objective를 요구하는 `exit-panel-engaged`

## 3. Camera · Story 상태

- Camera는 README §14 `Custom Pan 없음` 기준으로 baseline follow만 사용한다.
- Story cue는 `sector-03-05:node-id`, `access-summary`, `premium-atrium-ahead`
- `storyTriggers`: `commercial-service-node`, `authority-scope`, `calibration`

## 4. 검증 근거

- Source: `src/game/world/areas/sector03/Sector03AreaCatalog.js`
- Tests: `tests/sector03AreaCatalog.mjs`, `tests/currentAuthoredWorld.mjs`
- Integration status: Sector 03 `MOCK INTEGRATED`
- 미확인: 실제 rest rhythm과 story pacing, 정식 art / audio 자산

## 5. 남은 blocker / asset handoff

- 과거 다음 growth tier HOLD는 generic Augment v1과 사용자 선택 A로 대체됐다. 별도 Hybrid·Specialization tier는 추가하지 않는다.
- service node decoration, diagnostic frame art, quiet ambience 자산이 아직 없다.
- 실제 플레이에서 “의도된 decompression”으로 느껴지는지 계측과 플레이테스트가 남아 있다.
