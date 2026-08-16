# SECTOR 03-6 — PRODUCTION ALIGNMENT

*LARGE MOVEMENT · SCANNER + PATROL · REV 1.0*

본 문서는 [3-6 시나리오](./README.md)와 현재 `Sector03AreaCatalog` 구현을 연결한다. 3-6은 큰 공간 이동과 known security timing을 결합한 Stage이며 현재 메인 authored world에 `MOCK INTEGRATED` 상태로 연결돼 있다.

## 1. 현재 판정

| 항목 | 상태 | 판정 |
| --- | --- | --- |
| Runtime 연결 | `MOCK INTEGRATED` | 메인 authored chain의 `3-6`으로 연결돼 있다 |
| Geometry / Gate | `IMPLEMENTED` | bounds `1280×1440`, large atrium flow와 final gate 구현 |
| Scanner | `IMPLEMENTED PROTOTYPE` | `scanner-premium-atrium-A`가 `C1/C2`를 제어한다 |
| Patrol Drone | `IMPLEMENTED` | `drone-1` 한 기체가 upper atrium band를 감시한다 |
| Story | `IMPLEMENTED` | `story-display` 4개와 trigger 3개가 연결돼 있다 |

## 2. Runtime 좌표 / Stable ID 요약

- Area: `sector-03-06`, entry `(-512,-32)`, exit `(448,-1440)`, next `sector-03-07`
- Grapple: `G1(-416,-288)`, `C1(-64,-384)`, `C2(192,-768)`, `G3(0,-928)`, `G4(256,-1088)`, `G5(128,-1312)`
- Recovery: `R1(352,-536)`
- Drone: `drone-1(-128,-736)`, activation `(-384,-896,832×224)`, rules `kill-optional / no-rope-cut / target-lock-cycle / activation-band-only`
- Story display: `atrium-id(-384,-184)`, `power-state(-64,-504)`, `upper-concourse(416,-1208)`, `access-control-ahead(384,-1432)`
- Scanner group: `sector-03-06:scanner-premium-atrium-A`, controlled surfaces `c1-surface`, `c2-surface`
- Gate set: `exit-panel(320,-1408)`, `service-gate(448,-1408)`

## 3. Camera · Story 상태

- Camera는 README §14 `Custom Pan 없음` 기준으로 baseline follow만 사용한다.
- Story cue는 `sector-03-06:atrium-id`, `power-state`, `upper-concourse`, `access-control-ahead`
- `storyTriggers`: `premium-atrium`, `local-power`, `security-timing`

## 4. 검증 근거

- Source: `src/game/world/areas/sector03/Sector03AreaCatalog.js`
- Tests: `tests/sector03AreaCatalog.mjs`, `tests/currentAuthoredWorld.mjs`
- Scanner / Patrol 시스템 근거: `tests/accessScanField.mjs`
- 미확인: 실제 large-space movement joy, scanner same-phase pacing, 2인 플레이 체감

## 5. 남은 blocker / asset handoff

- README가 요구한 large atrium 시각 / 음향 대비는 아직 mock geometry 수준이다.
- Commercial far / mid reuse는 가능하지만 전용 near assets와 ambience / VFX는 비어 있다.
- C1/C2 same-phase가 실제로 재미있는지, geometry vs timing 조정이 필요한지 플레이테스트가 남아 있다.
