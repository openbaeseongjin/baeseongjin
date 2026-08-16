# SECTOR 03-7 — PRODUCTION ALIGNMENT

*ACCESS TIER REVEAL · SCANNER + PATROL · REV 1.0*

본 문서는 [3-7 시나리오](./README.md)와 현재 `Sector03AreaCatalog` 구현을 연결한다. 3-7은 Access Tier story pressure와 static cost profile 분기를 도입하는 Stage이며 현재 메인 authored world에 `MOCK INTEGRATED` 상태로 연결돼 있다.

## 1. 현재 판정

| 항목 | 상태 | 판정 |
| --- | --- | --- |
| Runtime 연결 | `MOCK INTEGRATED` | 메인 authored chain의 `3-7`으로 연결돼 있다 |
| Geometry / Gate | `IMPLEMENTED` | bounds `1280×1344`, upper market approach와 exit contract 구현 |
| Scanner | `IMPLEMENTED PROTOTYPE` | `scanner-priority-concourse-A`가 `C1/C2/C3`를 제어한다 |
| Patrol Drone | `IMPLEMENTED` | `drone-1` 한 기체만 배치돼 README의 “2대 금지”와 일치한다 |
| Story | `IMPLEMENTED` | `story-display` 3개로 concourse / directory / next gate를 표시한다 |

## 2. Runtime 좌표 / Stable ID 요약

- Area: `sector-03-07`, entry `(-512,-32)`, exit `(448,-1312)`, next `sector-03-08`
- Grapple: `C1(-192,-320)`, `S1(-32,-288)`, `S2(288,-416)`, `C2(-288,-864)`, `C3(64,-736)`, `G4(128,-896)`, `S3(352,-736)`, `S4(384,-896)`, `G5(192,-1184)`
- Recovery: 없음
- Drone: `drone-1(-64,-800)`, activation `(-160,-976,704×336)`, rules `kill-optional / no-rope-cut / target-lock-cycle / activation-band-only`
- Story display: `concourse-sign(-352,-184)`, `access-directory(0,-1080)`, `upper-market-gate-ahead(384,-1336)`
- Scanner group: `sector-03-07:scanner-priority-concourse-A`, controlled surfaces `c1-surface`, `c2-surface`, `c3-surface`
- Gate set: `exit-panel(320,-1280)`, `service-gate(448,-1280)` — 출구 표준화(offset 64)로 32px 하강

## 3. Camera · Story 상태

- Camera는 README §14 `Custom Pan 없음`대로 baseline follow만 사용한다.
- Story cue는 `sector-03-07:concourse-sign`, `access-directory`, `upper-market-gate-ahead`
- `storyTriggers`: `priority-concourse`, `access-tier`, `service-class`

## 4. 검증 근거

- Source: `src/game/world/areas/sector03/Sector03AreaCatalog.js`
- Tests: `tests/sector03AreaCatalog.mjs`, `tests/currentAuthoredWorld.mjs`
- Integration recent change #25가 story signage 28개 반영 완료를 기록한다
- 미확인: 실제 플레이에서 3개의 cost profile이 구분되는지, directory story가 과설명으로 느껴지지 않는지

## 5. 남은 blocker / asset handoff

- README가 강조한 Access Tier 구조의 체감 검증이 남아 있다.
- Concourse signage / directory / background props / ambience 자산이 아직 없다.
- 3-8과 차별화되는 pre-finale 압박으로 읽히는지 실제 플레이 기반 검증이 필요하다.
