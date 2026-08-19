# SECTOR 03-2 — PRODUCTION ALIGNMENT

*SCANNER RUNTIME · CAMERA · STORY · REV 1.0*

본 문서는 [3-2 시나리오](./README.md)와 현재 `Sector03AreaCatalog` 및 `AccessScanField` 구현을 연결한다. 3-2는 Sector 03의 첫 Scanner Stage이며 현재 메인 authored world에 `MOCK INTEGRATED` 상태로 연결돼 있다.

## 0. CURRENT RUNTIME OVERRIDE — 2026-08-19

- 0.32.0 enemy density 이후 pooled Sentry slot 두 기가 존재하며, 0.41.0부터 `scanner-upper-guard(-96,-928)`가 `sector-03:access-module:a` Carrier다.
- 적 수·위치·activation·pool과 Scanner cycle은 바꾸지 않고 Sector 03의 첫 3-of-3 source만 부여한다. 아래 Threat 0 서술은 이 override로 대체한다.

## 1. 현재 판정

| 항목 | 상태 | 판정 |
| --- | --- | --- |
| Runtime 연결 | `MOCK INTEGRATED` | `CurrentAuthoredAreaCatalog`에 `3-2`가 포함된다 |
| Scanner | `IMPLEMENTED PROTOTYPE` | `scanner-A`가 `C1/C2/C3` 새 부착만 주기적으로 제한한다 |
| Geometry / Gate | `IMPLEMENTED` | bounds `1280×1184`, Exit Panel / Gate / objective가 구현돼 있다 |
| Camera | `IMPLEMENTED BY DEFAULT CAMERA` | `cameraZones` 없음, README §14 `Custom Pan 없음`과 일치 |
| Story | `IMPLEMENTED (text binding)` | `story-display` 3개와 `storyTriggers` 3개가 연결돼 있다 |
| Threat | `IMPLEMENTED AS NON-DAMAGE SCANNER` | Enemy 없음, README 금지대로 Scanner damage / knockback / patrol 없음 |

## 2. Runtime 좌표 / Stable ID 요약

- Area: `sector-03-02`, entry `(-432,-32)`, exit `(432,-1152)`, next `sector-03-03`
- Grapple: `G1(-320,-256)`, `C1(-64,-320)`, `C2(160,-544)`, `C3(96,-768)`, `G4(-128,-864)`, `G5(128,-1024)`
- Recovery: `R1(416,-696)`
- Story display: `access-control(-304,-184)`, `service-mount(64,-440)`, `retail-security-ahead(368,-1144)`
- Scanner group: `sector-03-02:scanner-A`, cycle `1.5 / 0.6 / 1.1 / 0.3`, controlled surfaces `c1-surface`, `c2-surface`, `c3-surface`
- Gate set(exitBlock 표준): `exit-deck(368,-1059,288)`, `exit-gate(480,-1059)`, `exit-panel(368,-1059)`, exit `(480,-1091)` — 층간 격벽 전폭 봉쇄, 문 상단은 천장 아래 5px
- Objectives: `final-deck-reached bounds (224,-1152,288×96)`, `exit-panel-engaged`

## 3. Camera · Story 상태

- Camera는 baseline follow만 사용한다. README §14 `Custom Pan 없음`과 일치하며 별도 `cameraZones`는 없다.
- Story cue는 `sector-03-02:access-control`, `sector-03-02:service-mount`, `sector-03-02:retail-security-ahead`
- `storyTriggers`: `scanner-gallery-entry`, `access-denied`, `scanner-learned`

## 4. 검증 근거

- Source: `src/game/world/areas/sector03/Sector03AreaCatalog.js`, `src/game/world/AccessScanField.js`
- Tests: `tests/accessScanField.mjs`, `tests/sector03AreaCatalog.mjs`, `tests/currentAuthoredWorld.mjs`
- Integration status: `docs/scenario-development-integration.md` recent changes #21, #22, #25
- 미확인: 실제 배포 빌드에서 Scanner telegraph 가독성, 실제 브라우저 / 기기 플레이

## 5. 남은 blocker / asset handoff

- README의 Scanner 구현 상태는 현재 `AccessScanField` prototype과 동적 부착 predicate에 맞춰 정리됐다.
- Scanner housing / beam / mount art와 전용 audio / VFX 자산은 아직 없다.
- Sector 03 전체 실플레이에서 `AVAILABLE/WARNING/LOCKED/RESET` 체감과 오독 여부 검증이 남아 있다.
