# SECTOR 04-1 — PRODUCTION ALIGNMENT

*STANDALONE GRAYBOX · CAMERA · REV 1.0*

본 문서는 [4-1 시나리오](./README.md)와 현재 `Sector04AreaCatalog` 구현을 연결한다. 4-1은 Sector 04 첫 진입 graybox이며 현재 standalone catalog에서만 `GRAYBOX READY` 상태로 존재하고 메인 authored world에는 아직 연결되지 않는다.

## 1. 현재 판정

| 항목 | 상태 | 판정 |
| --- | --- | --- |
| Runtime 연결 | `GRAYBOX READY / STANDALONE ONLY` | `SECTOR_04_AREA_CATALOG`에만 존재하고 `CurrentAuthoredAreaCatalog`에는 없다 |
| Geometry / Gate | `IMPLEMENTED` | bounds `1600×1376`, route / recovery / Gate contract 구현 |
| Camera | `IMPLEMENTED` | `cameraZones` 5개가 runtime에 들어가 있다 |
| Story | `NOT YET MATERIALIZED AS OBJECTS` | `storyTriggers` / `cueIds`는 있으나 `story-display` object는 없다 |
| Threat | `IMPLEMENTED AS NONE` | README 방향대로 Enemy / Wake / Cutter가 없다 |

## 2. Runtime 좌표 / Stable ID 요약

- Area: `sector-04-01`, entry `(-640,-32)`, exit `(672,-1344)`, next `sector-04-02`
- Grapple: `A1(-352,-192)`, `A2(0,-352)`, `A3(288,-592)`, `A4(-64,-800)`, `A5(192,-1056)`, `A6(448,-1248)`
- Recovery: `R1(-192,-344)`, `R2(160,-536)`, `R3(-160,-952)`
- Gate set: `exit-panel(560,-1312)`, `service-gate(672,-1312)`
- Objectives: `final-deck-reached bounds (272,-1344,416×96)`, `exit-panel-engaged`
- Camera zones: `intake-reveal`, `lower-long-span`, `cross-trunk`, `upper-relay`, `exit`

## 3. Camera · Story 상태

- Camera zone 구현: `(-224~0, 0.95/0.72)`, `(-560~-224, 0.9/0.7)`, `(-864~-560, 0.88/0.7)`, `(-1184~-864, 0.9/0.7)`, `(-1376~-1184, 1/0.72)`
- `storyTriggers`: `transit-backbone-status`, `upper-express-status`, `security-line-preview`
- `cueIds`: `transit-backbone`, `speed-space`, `upper-express-limited`
- 아직 dedicated `story-display` object는 없으므로 실제 위치 기반 signage는 후속 자산 / 표현 작업이 필요하다

## 4. 검증 근거

- Source: `src/game/world/areas/sector04/Sector04AreaCatalog.js`
- Tests: `tests/sector04AreaCatalog.mjs`
- Integration status: `docs/scenario-development-integration.md`의 Sector 04 `GRAYBOX READY`
- 미확인: 메인 world 연결, 실제 브라우저 / 기기 플레이, 정식 art / audio

## 5. 남은 blocker / asset handoff

- `3-8 → 4-1`과 Post-Sector 03 Boss / Transition이 미확정이라 메인 진행에 연결할 수 없다.
- Entry status signage, intake backdrop, express preview 자산이 아직 없다.
- README가 요구한 speed-space reveal이 실제 체감으로 살아 있는지 standalone playtest가 필요하다.
