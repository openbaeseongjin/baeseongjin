# SECTOR 03-3 — PRODUCTION ALIGNMENT

*SCANNER + PATROL · CAMERA · STORY · REV 1.0*

본 문서는 [3-3 시나리오](./README.md)와 현재 `Sector03AreaCatalog` 구현을 연결한다. 3-3은 Sector 03의 첫 Scanner + Patrol Drone 결합 Stage이며 현재 메인 authored world에 `MOCK INTEGRATED` 상태로 연결돼 있다.

## 1. 현재 판정

| 항목 | 상태 | 판정 |
| --- | --- | --- |
| Runtime 연결 | `MOCK INTEGRATED` | 메인 authored chain의 `3-3`으로 연결돼 있다 |
| Geometry / Gate | `IMPLEMENTED` | bounds `1280×1184`, Gate Panel / Gate / objective 구현 |
| Scanner | `IMPLEMENTED PROTOTYPE` | `scanner-retail-A`가 `C1/C2`를 제어한다 |
| Patrol Drone | `IMPLEMENTED` | `drone-1` 한 기체가 authored activation band로 배치돼 있다 |
| Camera / Story | `IMPLEMENTED` | baseline camera + `story-display` 4개 + trigger 3개 |

## 2. Runtime 좌표 / Stable ID 요약

- Area: `sector-03-03`, entry `(-432,-32)`, exit `(432,-1152)`, next `sector-03-04`
- Grapple: `C1(-96,-288)`, `C2(128,-640)`, `G3(0,-800)`, `G4(192,-960)`, `G5(96,-1104)`
- Recovery: `R1(384,-440)`
- Drone: `drone-1(-256,-560)`, activation bounds `(-512,-768,1024×320)`, rules `kill-optional / no-rope-cut / target-lock-cycle / activation-band-only`
- Story display: `retail-security(-320,-184)`, `route-state(-48,-440)`, `patrol-status(48,-440)`, `service-arcade-next(368,-1176)`
- Scanner group: `sector-03-03:scanner-retail-A`, controlled surfaces `c1-surface`, `c2-surface`
- Gate set(exitBlock 표준): `exit-deck(368,-1059,288)`, `exit-gate(480,-1059)`, `exit-panel(368,-1059)`, exit `(480,-1091)` — 층간 격벽 전폭 봉쇄, 문 상단은 천장 아래 5px

## 3. Camera · Story 상태

- Camera는 README §14 `Custom Pan 없음` 기준으로 baseline follow만 사용한다.
- Story cue는 `sector-03-03:retail-security`, `route-state`, `patrol-status`, `service-arcade-next`
- `storyTriggers`: `retail-security`, `scanner-reminder`, `patrol-reveal`

## 4. 검증 근거

- Source: `src/game/world/areas/sector03/Sector03AreaCatalog.js`
- Tests: `tests/sector03AreaCatalog.mjs`, `tests/currentAuthoredWorld.mjs`
- Related systems: Patrol behavior는 기존 enemy runtime 재사용, scanner gating은 `tests/accessScanField.mjs`로 검증
- 미확인: 실제 2인 플레이에서 Drone 압박과 Scanner timing 동시 체감

## 5. 남은 blocker / asset handoff

- Scanner + Drone combined readability는 아직 브라우저 플레이로 검증되지 않았다.
- Sector 03 상업 보안 near art, Patrol / Scanner 전용 VFX / audio 자산이 없다.
- README가 강조한 “kill optional / scanner 우선 학습”이 실제 난이도에서 유지되는지 플레이테스트가 남아 있다.
