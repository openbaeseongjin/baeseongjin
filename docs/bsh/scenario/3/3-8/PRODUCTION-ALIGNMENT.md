# SECTOR 03-8 — PRODUCTION ALIGNMENT

*FREE-WEAVE FINALE · SCANNER + DRONES · REV 1.0*

본 문서는 [3-8 시나리오](./README.md)와 현재 `Sector03AreaCatalog` 구현을 연결한다. 3-8은 Sector 03 일반 구간 finale이며 현재 메인 authored world에 `MOCK INTEGRATED` 상태로 연결돼 있고, `Post-Sector 03 Boss / Transition` 전까지 `content-boundary`를 유지한다.

## 1. 현재 판정

| 항목 | 상태 | 판정 |
| --- | --- | --- |
| Runtime 연결 | `MOCK INTEGRATED` | 메인 authored chain의 최종 area로 연결된다 |
| Finale boundary | `IMPLEMENTED AS CONTENT-BOUNDARY` | `nextAreaId: null`, gate `completionMode: content-boundary` |
| Scanner | `IMPLEMENTED PROTOTYPE` | `scanner-upper-market-A`가 `C1/C2/C3/C4`를 제어한다 |
| Patrol Drone | `IMPLEMENTED` | `drone-1`, `drone-2` 두 기체가 분리된 activation band를 사용한다 |
| Story | `IMPLEMENTED` | archive pair와 final control을 `story-display` 5개로 노출한다 |

## 2. Runtime 좌표 / Stable ID 요약

- Area: `sector-03-08`, entry `(-544,-32)`, exit `(480,-1632)`, next `null`
- Grapple: `G1(-448,-288)`, `C1(-160,-384)`, `C2(0,-736)`, `W1(-352,-800)`, `E1(352,-800)`, `C3(0,-1024)`, `W2(-320,-1088)`, `E2(320,-1088)`, `G4(224,-1280)`, `C4(0,-1344)`, `G6(256,-1536)`
- Recovery: 없음
- Drones: `drone-1(-512,-944)`, activation `(-640,-1120,480×416)` / `drone-2(192,-944)`, activation `(160,-1120,480×416)`
- Story display: `market-gate(-416,-184)`, `market-directory(0,-632)`, `evacuation-archive(-128,-1464)`, `access-archive(128,-1464)`, `final-control(416,-1656)`
- Scanner group: `sector-03-08:scanner-upper-market-A`, controlled surfaces `c1/c2/c3/c4`
- Gate set: `exit-panel(352,-1600)`, `final-gate(480,-1600)`, gate `sector-03-08:gate` — 출구 표준화(offset 64)로 32px 하강

## 3. Camera · Story 상태

- Camera는 README §14 `Custom Pan 없음` 기준으로 baseline follow만 사용한다.
- Story cue는 `sector-03-08:market-gate`, `market-directory`, `evacuation-archive`, `access-archive`, `final-control`
- `storyTriggers`: `upper-market-gate`, `evacuation-archive`, `access-archive`

## 4. 검증 근거

- Source: `src/game/world/areas/sector03/Sector03AreaCatalog.js`
- Tests: `tests/sector03AreaCatalog.mjs`, `tests/currentAuthoredWorld.mjs`
- Integration: `docs/scenario-development-integration.md`가 `3-8 → 4-1 직접 연결 금지`를 현재 기준으로 기록한다
- 미확인: 실제 브라우저 / 기기 finale 플레이, 2인 분산 플레이에서 두 Drone separation 체감

## 5. 남은 blocker / asset handoff

- `Post-Sector 03 Boss / Transition`과 `3-8 → 4-1` 흐름은 아직 미확정이다.
- Archive pair / finale signage / commercial market near art / audio 자산이 없다.
- README가 요구한 “Free-Weave Finale 기억점”이 실제 플레이에서 살아 있는지 검증이 남아 있다.
