# SECTOR 03-1 — PRODUCTION ALIGNMENT

*RUNTIME · CAMERA · STORY · REV 1.0*

본 문서는 [3-1 시나리오](./README.md)와 현재 `Sector03AreaCatalog` 구현을 연결한다. 3-1은 Sector 03 첫 진입 Stage이며 현재 메인 authored world에 `MOCK INTEGRATED` 상태로 연결돼 있다.

## 1. 현재 판정

| 항목 | 상태 | 판정 |
| --- | --- | --- |
| Runtime 연결 | `MOCK INTEGRATED` | `CurrentAuthoredAreaCatalog`가 `2-8 → 3-1`을 연결한다 |
| Geometry / Gate | `IMPLEMENTED` | bounds `1280×1088`, Gate Panel → Gate open → physical crossing 계약이 들어가 있다 |
| Camera | `IMPLEMENTED BY DEFAULT CAMERA` | `cameraZones` 없음, README §14 `Custom Pan 없음`과 일치 |
| Story | `IMPLEMENTED (text binding)` | `story-display` 2개와 `storyTriggers` 3개가 연결돼 있다 |
| Threat | `IMPLEMENTED AS NONE` | README 요구대로 Drone / Scanner Active / Wind / Trap이 없다 |

## 2. Runtime 좌표 / Stable ID 요약

- Area: `sector-03-01`, entry `(-432,-32)`, exit `(400,-1056)`, next `sector-03-02`
- Grapple: `G1(-320,-256)`, `G2(-32,-448)`, `G3(96,-672)`, `G4(-96,-800)`, `G5(128,-960)`
- Recovery: `R1(288,-632)`, `R2(352,-888)`
- Story display: `district-sign(-320,-184)`, `welcome-kiosk(-416,-184)`
- Gate set: `exit-panel(272,-1024)`, `service-gate(400,-1024)`, gateId `sector-03-01:gate`
- Objectives: `final-deck-reached bounds (192,-1056,288×96)`, `exit-panel-engaged`

## 3. Camera · Story 상태

- Camera는 baseline follow만 사용한다. README §14의 `Custom Pan 없음`과 일치하며 별도 `cameraZones`는 없다.
- Story cue는 `sector-03-01:district-sign`, `sector-03-01:welcome-kiosk`를 직접 바인딩한다.
- `storyTriggers`: `district-sign`, `powered-environment`, `automated-welcome`

## 4. 검증 근거

- Source: `src/game/world/areas/sector03/Sector03AreaCatalog.js`
- Tests: `tests/sector03AreaCatalog.mjs`, `tests/currentAuthoredWorld.mjs`
- Integration status: `docs/scenario-development-integration.md`의 Sector 03 `MOCK INTEGRATED`
- 미확인: 실제 브라우저 / 기기 플레이테스트, 정식 art / audio 자산

## 5. 남은 blocker / asset handoff

- README OPEN QUESTIONS의 `Sector 02 Boss → 3-1` 정확한 진입 연출은 아직 미확정이다.
- 비활성 Scanner Housing은 README가 optional foreshadow로 남겨 두며 현재 runtime에는 직접 배치하지 않았다.
- `images/`와 Sector 03 근경 / 배경 / 사운드 자산 인계는 아직 없다.
