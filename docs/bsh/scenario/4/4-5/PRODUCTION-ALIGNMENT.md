# SECTOR 04-5 — PRODUCTION ALIGNMENT

*PURE MOVEMENT JOY · WAKE · REV 1.0*

본 문서는 [4-5 시나리오](./README.md)와 현재 `Sector04AreaCatalog` 구현을 연결한다. 4-5는 Enemy 없는 Express Shaft Stage이며 현재 standalone catalog에서 `GRAYBOX READY` 상태다.

## 1. 현재 판정

| 항목 | 상태 | 판정 |
| --- | --- | --- |
| Runtime 연결 | `GRAYBOX READY / STANDALONE ONLY` | 메인 authored chain 미연결 |
| Geometry / Gate | `IMPLEMENTED` | bounds `1216×1536`, 장거리 vertical shaft와 exit contract 구현 |
| Wake | `IMPLEMENTED` | `express-wake` pulsed zone이 들어가 있다 |
| Threat | `IMPLEMENTED AS NONE` | Enemy / Cutter / Scanner 없음 |
| Camera | `IMPLEMENTED` | `cameraZones` 5개 구현 |

## 2. Runtime 좌표 / Stable ID 요약

- Area: `sector-04-05`, entry `(-448,-32)`, exit `(528,-1504)`, next `sector-04-06`
- Grapple: `A0(-320,-160)`, `W1(-96,-416)`, `W2(96,-640)`, `W3(96,-896)`, `W4(-96,-1152)`, `W5(96,-1376)`
- Recovery: `R1(-256,-568)`, `R2(256,-792)`, `R3(-256,-1048)`, `R4(256,-1304)`
- Wake: `sector-04-05:express-wake`, bounds `(-192,-1408,384×1088)`, direction `(0,-1)`, cycle `1.75 / 0.7 / 1.4 / 0.3`, strength `360`
- Gate set(exitBlock 표준): `exit-deck(288,-1411,416)`, `exit-gate(464,-1411)`, `exit-panel(352,-1411)`, exit `(464,-1443)` — 층간 격벽 전폭 봉쇄, 문 상단은 천장 아래 5px
- Objectives: `final-deck-reached bounds (112,-1504,416×96)`, `exit-panel-engaged`

## 3. Camera · Story 상태

- Camera zones: `shaft-reveal`, `lower-express`, `mid-express`, `upper-express`, `exit`
- Zone 값: `(-288~0,0.94/0.7)`, `(-544~-288,0.88/0.68)`, `(-1056~-544,0.86/0.68)`, `(-1408~-1056,0.86/0.68)`, `(-1536~-1408,0.96/0.72)`
- `storyTriggers`: `express-shaft-entry`, `pressure-assist-cycling`, `upper-express-limited`
- `cueIds`: `express-shaft`, `pressure-assist`, `upper-express-limited`

## 4. 검증 근거

- Source: `src/game/world/areas/sector04/Sector04AreaCatalog.js`
- Tests: `tests/sector04AreaCatalog.mjs`, `tests/worldForceField.mjs`
- 미확인: wake-only movement joy, camera look-ahead 필요성, 브라우저 플레이

## 5. 남은 blocker / asset handoff

- Central pressure column / express shaft backdrop / wake VFX / ambience 자산이 아직 없다.
- README가 요구한 “pure movement joy”가 실제로 살아 있는지 standalone playtest가 필요하다.
- 고속 vertical look-ahead가 필요한지 runtime spike 검토가 남아 있다.
