# SECTOR 04-7 — PRODUCTION ALIGNMENT

*CUTTER + WAKE SYNTHESIS · STORY REVEAL · REV 1.0*

본 문서는 [4-7 시나리오](./README.md)와 현재 `Sector04AreaCatalog` 구현을 연결한다. 4-7은 Lower Ascent Feeder reveal과 Cutter + Wake 합성을 담당하는 Stage이며 현재 standalone catalog에서 `GRAYBOX READY` 상태다.

## 1. 현재 판정

| 항목 | 상태 | 판정 |
| --- | --- | --- |
| Runtime 연결 | `GRAYBOX READY / STANDALONE ONLY` | 메인 authored chain 미연결 |
| Geometry / Gate | `IMPLEMENTED` | bounds `1472×1536`, junction flow / recovery / exit 구현 |
| Cutter | `IMPLEMENTED` | `cutter-sentry-01` 한 기체가 lower band를 차단한다 |
| Wake | `IMPLEMENTED` | `junction-wake` pulsed zone이 route 전체를 관통한다 |
| Story | `IMPLEMENTED` | `routing-status-display`, `feeder-status-display` 두 object로 reveal을 노출한다 |

## 2. Runtime 좌표 / Stable ID 요약

- Area: `sector-04-07`, entry `(-480,-32)`, exit `(544,-1504)`, next `sector-04-08`
- Grapple: `A0(-352,-128)`, `W1(-160,-416)`, `W2(160,-576)`, `W3(160,-800)`, `W4(-160,-960)`, `A5(-96,-1152)`, `A6(224,-1344)`
- Recovery: `R1(320,-536)`, `R2(-320,-920)`
- Cutter: `cutter-sentry-01(480,-640)`, activation `(-240,-1008,480×624)`, rules `cutter-fire / kill-optional / target-lock-cycle / activation-band-only`
- Wake: `sector-04-07:junction-wake`, bounds `(-224,-1008,448×688)`, direction `(+1,0)`, cycle `1.75 / 0.7 / 1.4 / 0.3`
- Story display: `routing-status-display(-128,-256)`, `feeder-status-display(96,-1248)`
- Gate set: `exit-panel(432,-1472)`, `service-gate(544,-1472)` — 출구 표준화(offset 64)로 32px 상승

## 3. Camera · Story 상태

- Camera zones: `junction-read`, `lower-assist`, `center-turn`, `upper-opposed-return`, `story-deck`, `exit`
- Story cue는 `sector-04-07:containment-routing-active`, `lower-feeder-isolated`, `route-telemetry-offline`
- `storyTriggers`: `junction-entry`, `feeder-isolated`, `trunk-access-ahead`
- README 기준으로 `LOWER ASCENT FEEDER ISOLATED` reveal은 4-7에서 처음 노출되며, 현재 runtime도 그 경계를 지킨다

## 4. 검증 근거

- Source: `src/game/world/areas/sector04/Sector04AreaCatalog.js`
- Tests: `tests/sector04AreaCatalog.mjs`, `tests/worldForceField.mjs`, `tests/combatSystems.mjs`
- Integration recent change #27이 4-7 story binding 반영을 기록한다
- 미확인: 실제 reveal 타이밍, wake + cutter 합성 난이도, 브라우저 플레이

## 5. 남은 blocker / asset handoff

- Junction reveal용 signage / backdrop / wake VFX / story audio 자산이 아직 없다.
- README가 요구한 lower assist vs upper opposed return 리듬이 실제 플레이에서 구분되는지 검증이 필요하다.
- 4-8로 이어지는 continuity는 현재 standalone 수준으로만 확인됐다.
