# SECTOR 04-4 — PRODUCTION ALIGNMENT

*REST / ROUTING PREVIEW · CAMERA · REV 1.0*

본 문서는 [4-4 시나리오](./README.md)와 현재 `Sector04AreaCatalog` 구현을 연결한다. 4-4는 Sector 04 rest / story setup Stage이며 현재 standalone catalog에서 `GRAYBOX READY` 상태다.

## 1. 현재 판정

| 항목 | 상태 | 판정 |
| --- | --- | --- |
| Runtime 연결 | `GRAYBOX READY / STANDALONE ONLY` | 메인 authored chain 미연결 |
| Geometry / Gate | `IMPLEMENTED` | bounds `1152×896`, exit contract와 recovery 구현 |
| Threat | `IMPLEMENTED AS NONE` | Enemy / Wake / Cutter / Scanner 없음 |
| Camera | `IMPLEMENTED` | `cameraZones` 4개가 runtime에 있다 |
| Story | `IMPLEMENTED` | `routing-status-display` 1개가 실제 object로 배치됐다 |

## 2. Runtime 좌표 / Stable ID 요약

- Area: `sector-04-04`, entry `(-352,-32)`, exit `(512,-864)`, next `sector-04-05`
- Grapple: `A1(-256,-128)`, `A2(128,-320)`, `A3(224,-512)`, `A4(-32,-672)`, `A5(160,-800)`
- Recovery: `R1(192,-632)`
- Story display: `routing-status-display(176,-384)` → cue `service-node-online`, `lower-feeder-segmented`
- Gate set(exitBlock 표준): `exit-deck(320,-771,384)`, `exit-gate(480,-771)`, `exit-panel(368,-771)`, exit `(480,-803)` — 층간 격벽 전폭 봉쇄, 문 상단은 천장 아래 5px
- Objectives: `final-deck-reached bounds (128,-864,384×96)`, `exit-panel-engaged`

## 3. Camera · Story 상태

- Camera zones: `decompression`, `routing-overview`, `upper-service-spine`, `express-preview`
- Zone 값: `(-224~0,1/0.72)`, `(-512~-224,0.95/0.72)`, `(-800~-512,0.95/0.72)`, `(-896~-800,0.92/0.7)`
- `storyTriggers`: `service-node-online`, `lower-feeder-segmented`, `express-shaft-open`
- `cueIds`: `service-node-online`, `lower-feeder-segmented`, `express-shaft-open`

## 4. 검증 근거

- Source: `src/game/world/areas/sector04/Sector04AreaCatalog.js`
- Tests: `tests/sector04AreaCatalog.mjs`
- Integration recent changes #19, #24, #27이 4-4 story / camera 반영을 기록한다
- 미확인: 실제 브라우저 / 기기 rest pacing, 정식 routing display 자산

## 5. 남은 blocker / asset handoff

- 4-5 express preview를 실제 art / backdrop으로 넘길 자산이 아직 없다.
- README가 금지한 4-7 reveal 선행 노출이 없는지 실제 화면 검증이 남아 있다.
- Sector 04 메인 world 미연결 상태라 full run rhythm 검증은 아직 불가능하다.
