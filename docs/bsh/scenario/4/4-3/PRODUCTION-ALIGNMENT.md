# SECTOR 04-3 — PRODUCTION ALIGNMENT

*CUTTER + WAKE · CAMERA · REV 1.0*

본 문서는 [4-3 시나리오](./README.md)와 현재 `Sector04AreaCatalog` 구현을 연결한다. 4-3은 첫 Transit Wake + Cutter 결합 Stage이며 현재 standalone catalog에서 `GRAYBOX READY` 상태다.

## 1. 현재 판정

| 항목 | 상태 | 판정 |
| --- | --- | --- |
| Runtime 연결 | `GRAYBOX READY / STANDALONE ONLY` | 메인 authored chain 미연결 |
| Geometry / Gate | `IMPLEMENTED` | bounds `1472×1472`, route / recovery / gate 구현 |
| Cutter | `IMPLEMENTED` | `cutter-sentry-01` 한 기체가 `cutter-fire` 규칙으로 배치돼 있다 |
| Wake | `IMPLEMENTED` | `freight-wake` pulsed zone이 들어가 있다 |
| Camera | `IMPLEMENTED` | `cameraZones` 5개 구현 |

## 2. Runtime 좌표 / Stable ID 요약

- Area: `sector-04-03`, entry `(-560,-32)`, exit `(-80,-1440)`, next `sector-04-04`
- Grapple: `A0(-432,-128)`, `W1(-176,-384)`, `W2(96,-544)`, `W3(256,-736)`, `A4(96,-992)`, `A5(-160,-1184)`, `A6(-320,-1312)`
- Recovery: `R1(-240,-664)`, `R2(64,-1112)`
- Cutter: `cutter-sentry-01(448,-640)`, activation `(-128,-832,704×480)`
- Wake: `sector-04-03:freight-wake`, bounds `(-208,-832,560×544)`, direction `(+1,0)`, cycle `1.75 / 0.7 / 1.4 / 0.3`, strength `360`
- Gate set(exitBlock 표준): `exit-deck(-288,-1347,416)`, `exit-gate(-112,-1347)`, `exit-panel(-224,-1347)`, exit `(-112,-1379)` — 층간 격벽 전폭 봉쇄, 문 상단은 천장 아래 5px

## 3. Camera · Story 상태

- Camera zones: `entry-wake-read`, `combined-freight`, `cutter-exit`, `upper-decompression`, `gate`
- Zone 값: `(-352~0,0.95/0.72)`, `(-736~-352,0.88/0.7)`, `(-992~-736,0.9/0.7)`, `(-1184~-992,0.95/0.72)`, `(-1472~-1184,1/0.72)`
- `storyTriggers`: `freight-entry`, `wake-warning`, `combined-commit`, `decompression`
- `cueIds`: `freight-bypass`, `transit-wake`, `cutter-fire`

## 4. 검증 근거

- Source: `src/game/world/areas/sector04/Sector04AreaCatalog.js`
- Tests: `tests/sector04AreaCatalog.mjs`, `tests/worldForceField.mjs`, `tests/combatSystems.mjs`
- 미확인: wake + cutter 동시 체감, 브라우저 플레이, 메인 world 연결

## 5. 남은 blocker / asset handoff

- Wake source / warning lamp / cutter audiovisual presentation은 아직 mock 수준이다.
- README가 요구한 first combination fairness는 실제 플레이에서 확인이 필요하다.
- 4-3 이후 4-4 rest 대비가 충분한지 standalone playtest가 남아 있다.
