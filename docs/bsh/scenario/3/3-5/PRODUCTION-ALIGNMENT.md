# SECTOR 03-5 — PRODUCTION ALIGNMENT

*REST · DIAGNOSTIC · STORY · REV 1.0*

본 문서는 [3-5 시나리오](./README.md)와 현재 `Sector03AreaCatalog` 구현을 연결한다. 3-5는 Sector 03의 휴식 / 진단 Stage이며 현재 메인 authored world에 `MOCK INTEGRATED` 상태로 연결돼 있다.

## 1. 현재 판정

| 항목 | 상태 | 판정 |
| --- | --- | --- |
| Runtime 연결 | `MOCK INTEGRATED` | 메인 authored chain의 rest node로 연결돼 있다 |
| Geometry / Gate | `IMPLEMENTED` | bounds `960×688`, 짧은 safe deck 흐름과 exit contract 구현 |
| Threat | `IMPLEMENTED AS NONE` | Enemy / Scanner / Wind가 없다 |
| Story | `IMPLEMENTED` | `story-display` 3개와 `maintenance-frame` 1개가 배치돼 있다 |
| Growth | `NOT ADDED ON PURPOSE` | README의 “새 growth tier를 여기서 임의 결정하지 않는다”와 일치한다 |

## 2. Runtime 좌표 / Stable ID 요약

- Area: `sector-03-05`, entry `(-240,-32)`, exit `(352,-688)`, next `sector-03-06`
- Grapple: `G1(-32,-400)`, `G2(192,-512)`, `G3(32,-624)`
- Recovery: `R1(-48,-488)`
- Story / object: `service-calibration-frame`(gate-linked maintenance-frame), `node-id(0,-312)`, `access-summary(240,-312)`, `premium-atrium-ahead(288,-680)`
- Gate set: `exit-panel(224,-656)`, `service-gate(352,-656)`
- Objectives: `final-deck-reached bounds (160,-688,256×96)`, `exit-panel-engaged`

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

- README OPEN QUESTIONS대로 다음 growth tier / reward 위치는 여기서 결정하지 않는다.
- service node decoration, diagnostic frame art, quiet ambience 자산이 아직 없다.
- 실제 플레이에서 “의도된 decompression”으로 느껴지는지 계측과 플레이테스트가 남아 있다.
