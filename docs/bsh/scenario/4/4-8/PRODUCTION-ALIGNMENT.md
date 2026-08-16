# SECTOR 04-8 — PRODUCTION ALIGNMENT

*GENERAL FINALE · CUTTER + PATROL + WAKE · REV 1.0*

본 문서는 [4-8 시나리오](./README.md)와 현재 `Sector04AreaCatalog` 구현을 연결한다. 4-8은 Sector 04 일반 구간 finale이며 현재 standalone catalog에서 `GRAYBOX READY` 상태로 존재하고 `Post-Sector 04 Boss / Transition` 전까지 `content-boundary`를 유지한다.

## 1. 현재 판정

| 항목 | 상태 | 판정 |
| --- | --- | --- |
| Runtime 연결 | `GRAYBOX READY / STANDALONE ONLY` | 메인 authored chain 미연결 |
| Finale boundary | `IMPLEMENTED AS CONTENT-BOUNDARY` | `nextAreaId: null`, gate `completionMode: content-boundary` |
| Cutter / Patrol | `IMPLEMENTED` | lower `cutter-sentry-01` + upper `patrol-drone-01` 분리 배치 |
| Wake | `IMPLEMENTED` | `control-trunk-wake` 하나의 긴 중앙 zone으로 구현 |
| Story | `IMPLEMENTED` | `final-status-display`, `post-sector-access` 두 object가 finale juxtaposition을 담당한다 |

## 2. Runtime 좌표 / Stable ID 요약

- Area: `sector-04-08`, entry `(-448,-32)`, exit `(560,-1824)`, next `null`
- Grapple: `A0(-320,-160)`, `C1(-96,-448)`, `C2(96,-736)`, `W3(-96,-960)`, `A3(96,-1024)`, `A4(96,-1216)`, `A5(-160,-1344)`, `W6(-96,-1536)`, `A6(128,-1640)`
- Recovery: `R1(-256,-856)`, `R2(-320,-1432)`
- Cutter: `cutter-sentry-01(448,-640)`, activation `(-192,-800,384×400)`, rules `cutter-fire / kill-optional / target-lock-cycle / activation-band-only`
- Patrol: `patrol-drone-01(176,-1280)`, patrol `(-208,-1280) ↔ (208,-1280)`, activation `(-208,-1392,416×240)`, rules `kill-optional / no-rope-cut / target-lock-cycle / activation-band-only`
- Wake: `sector-04-08:control-trunk-wake`, bounds `(-192,-1664,384×1264)`, direction `(0,-1)`, cycle `1.75 / 0.7 / 1.4 / 0.3`
- Story display: `final-status-display(64,-1792)`, `post-sector-access(352,-1728)`, gate set `exit-panel(432,-1792)`, `service-gate(560,-1792)` — 출구 표준화(offset 64)로 32px 상승

## 3. Camera · Story 상태

- Camera zones: `entry-scale`, `cutter-band`, `re-acceleration`, `patrol-band`, `final-flow`, `final-deck`
- Story cue는 `sector-04-08:upper-trunk-limited`, `lower-feeder-isolated`, `transit-core-access-pending`
- `storyTriggers`: `trunk-entry`, `upper-trunk-limited`, `final-status-juxtaposition`
- 현재 runtime은 README 금지 조건대로 internal boss와 Sector 05 direct link를 추가하지 않는다

## 4. 검증 근거

- Source: `src/game/world/areas/sector04/Sector04AreaCatalog.js`
- Tests: `tests/sector04AreaCatalog.mjs`, `tests/worldForceField.mjs`, `tests/combatSystems.mjs`, `tests/renderPerformance.mjs`
- Integration recent change #24, #27이 4-8 runtime / camera / story 반영을 기록한다
- 미확인: finale 전체 브라우저 플레이, 2인 분리 band, post-sector visual hold 체감

## 5. 남은 blocker / asset handoff

- Post-Sector 04 Boss / Transition, Boss timer, Sector 05 연결은 여전히 미확정이다.
- Finale trunk / cutter / patrol / wake / final summary 자산과 오디오 / VFX가 아직 없다.
- README가 요구한 “4-8 ≠ 3-8” finale 기억점이 실제 플레이에서 살아 있는지 검증이 남아 있다.
