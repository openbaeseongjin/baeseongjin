# SECTOR 03-4 — PRODUCTION ALIGNMENT

*PUBLIC VS SERVICE · SCANNER · STORY · REV 1.0*

본 문서는 [3-4 시나리오](./README.md)와 현재 `Sector03AreaCatalog` 구현을 연결한다. 3-4는 Public / Service Route 분기와 local-only maintenance read를 도입하는 Stage이며 현재 메인 authored world에 `MOCK INTEGRATED` 상태로 연결돼 있다.

## 1. 현재 판정

| 항목 | 상태 | 판정 |
| --- | --- | --- |
| Runtime 연결 | `MOCK INTEGRATED` | 메인 authored chain에서 `3-4`로 진행된다 |
| Geometry / Gate | `IMPLEMENTED` | bounds `1280×1216`, route split / recovery / Gate 계약 구현 |
| Scanner | `IMPLEMENTED PROTOTYPE` | `scanner-service-arcade-public`이 public 측 `C1/C2`만 제어한다 |
| Patrol Drone | `IMPLEMENTED` | `drone-1` 한 기체가 public route pressure를 만든다 |
| Story | `IMPLEMENTED` | `story-display` 4개로 route split / service local-only를 표시한다 |

## 2. Runtime 좌표 / Stable ID 요약

- Area: `sector-03-04`, entry `(-440,-32)`, exit `(448,-1184)`, next `sector-03-05`
- Grapple: `C1(-288,-320)`, `C2(-160,-608)`, `S0(32,-256)`, `GS1(320,-384)`, `GS2(320,-640)`, `G5(64,-960)`, `G6(256,-1120)`
- Recovery: `SV1(432,-536)`, `SV2(432,-760)`
- Drone: `drone-1(-384,-576)`, activation `(-608,-704,624×224)`, rules `kill-optional / no-rope-cut / target-lock-cycle / activation-band-only`
- Story display: `route-split(-272,-184)`, `public-route(-320,-472)`, `service-route(432,-536)`, `service-node-upper(96,-856)`
- Scanner group: `sector-03-04:scanner-service-arcade-public`, controlled surfaces `c1-surface`, `c2-surface`
- Gate set(exitBlock 표준): `exit-deck(384,-1091,320)`, `exit-gate(512,-1091)`, `exit-panel(400,-1091)`, exit `(512,-1123)` — 층간 격벽 전폭 봉쇄, 문 상단은 천장 아래 5px

## 3. Camera · Story 상태

- Camera는 README §14 `Custom Pan 없음`대로 baseline follow만 사용한다.
- Story cue는 `sector-03-04:route-split`, `public-route`, `service-route`, `service-node-upper`
- `storyTriggers`: `service-arcade`, `public-vs-service`, `maintenance-local-only`

## 4. 검증 근거

- Source: `src/game/world/areas/sector03/Sector03AreaCatalog.js`
- Tests: `tests/sector03AreaCatalog.mjs`, `tests/currentAuthoredWorld.mjs`
- Scanner / Patrol 기반 시스템은 기존 focused tests로 보호된다
- 미확인: public route와 service route의 시간 / 위험 대비가 실제 체감에서 분리되는지

## 5. 남은 blocker / asset handoff

- README가 요구한 Public vs Service 시각 대비는 아직 mock geometry + signage 수준이다.
- Route signage / storefront / maintenance near art, 관련 ambience / VFX가 비어 있다.
- Scanner fail 시 대체 설계를 Stage가 임의 확정하지 말라는 README 조건은 그대로 유지한다.
