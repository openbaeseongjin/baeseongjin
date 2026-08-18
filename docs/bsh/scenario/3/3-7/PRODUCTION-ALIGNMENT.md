# SECTOR 03-7 — PRODUCTION ALIGNMENT

*TRANSFER MEZZANINE · REV 2.0 MIGRATION PENDING*

본 문서는 [3-7 시나리오](./README.md)의 REV 2.0 `TRANSFER MEZZANINE` 설계와 현재 `main` Runtime의 차이를 기록한다.

## 1. 현재 판정

| 항목 | 상태 | 판정 |
| --- | --- | --- |
| Latest checked main | `862a71b14b01d0927e509fca3ffcc138f5034a4f` | REV 2.0 설계 작성 시점 기준 |
| Runtime 연결 | `MOCK INTEGRATED` | 메인 authored chain의 `3-7`으로 연결돼 있다 |
| REV 2.0 Geometry | `NOT IMPLEMENTED` | 현재 `area07`은 REV 1.0 `PRIORITY CONCOURSE` legacy geometry다 |
| Scanner | `IMPLEMENTED PROTOTYPE` | `scanner-priority-concourse-A`가 `C1/C2/C3`를 제어한다(legacy 이름) |
| Patrol Drone | `IMPLEMENTED LEGACY PLACEMENT` | `drone-1` 한 기체, REV 2.0 좌표로 재배치 필요 |
| Story | `IMPLEMENTED (LEGACY WORDING)` | `story-display` 3개, REV 2.0 문구/이름으로 갱신 필요 |
| Recovery | `NONE IN CURRENT RUNTIME` | REV 2.0 `r1` 신규 authored geometry |

## 2. Current Runtime — LEGACY (`PRIORITY CONCOURSE`, REV 1.0)

Source:

```text
src/game/world/areas/sector03/Sector03AreaCatalog.js
```

Current area:

```text
sector-03-07
PRIORITY CONCOURSE
bounds 1280×1344
entry (-512,-32)
exit (448,-1312)
nextAreaId sector-03-08
```

Current Grapple(코드 기준으로 정정 — 이전 판 문서가 존재하지 않는 `S1/S2/S3/S4/G4`를 나열했던 오류를 바로잡음):

```text
c1-surface (-192,-320)
c2-surface (-288,-864)
c3-surface (64,-736)
g5-surface (192,-1184)
```

Current Drone:

```text
drone-1 (-64,-800)
activation (-160,-976,704×336)
rules kill-optional / no-rope-cut / target-lock-cycle / activation-band-only
```

Current Scanner group:

```text
sector-03-07:scanner-priority-concourse-A
controls c1-surface, c2-surface, c3-surface
```

Current Story display:

```text
concourse-sign(-352,-184)
access-directory(0,-1080)
upper-market-gate-ahead(384,-1336)
```

Current Recovery:

```text
NONE
```

Current Gate(exitBlock 표준): `exit-deck(384,-1219,320)`, `exit-gate(512,-1219)`, `exit-panel(400,-1219)`, exit `(512,-1251)`.

## 3. REV 2.0 Target ([`AREA-SPEC.json`](./AREA-SPEC.json))

```text
c1 (-128,-320)
c2 (0,-736)
g3 (-352,-896)  — Permanent, not Scanner-controlled
g4 (192,-1184)  — Permanent final attach

scanner group: c1/c2 shared ("scanner-A", 3-2 baseline reuse)
drone-1 (-128,-800), activation (-416,-976,576×368)
recovery r1 (320,-880) — outside Drone acquire, reaches c2, cannot reach g3
```

핵심 구조 변화: legacy는 `C1/C2/C3` 3개 Scanner-controlled mount + `G5` 1개 Permanent였고, REV 2.0은 `C1/C2` 2개 Scanner-controlled + `G3/G4` 2개 Permanent로 재구성했다. Scanner group도 `scanner-priority-concourse-A`(3개 대상) → `scanner-A`(2개 대상)로 축소된다.

## 4. Story Wording 차이

Legacy story display id: `concourse-sign`, `access-directory`, `upper-market-gate-ahead`.

REV 2.0 story cue id(안): `transfer-mezzanine-sign`, `transfer-control-directory`, `upper-exchange-ahead`. 정확한 story-display object id는 구현 시 기존 stable-id 유지 관례를 먼저 확인한다.

## 5. Verified Base Rope Contract (REV 2.0 설계 시점)

```text
hookSpeed          1200
hookFlightSeconds  1/3
reach              400
hookReloadSeconds  1.0
attachBuffer       0.1
swingImpulse       780
releaseTransfer    0.55
```

REV 2.0 `AREA-SPEC.json`의 `physicsValidation.mandatoryMaxAuthoredLinkPx`(386.7px)는 이 기준으로 계산됐다. `#632` 이후 Rope 수치가 다시 바뀌면 재검증한다.

## 6. Migration Checklist

- [ ] Branch 시작 직전 `main` HEAD 다시 기록
- [ ] Rope / Scanner / Drone source re-read
- [ ] `c1/c2/c3` 3-mount 구조를 `c1/c2` 2-mount + `g3/g4` Permanent로 재배치
- [ ] `scanner-priority-concourse-A` → `scanner-A`(또는 project naming convention) 재명명 여부 확인
- [ ] `drone-1` activation을 REV 2.0 band로 재배치
- [ ] `r1` recovery surface 신규 추가
- [ ] Story display id/문구를 REV 2.0으로 갱신
- [ ] default validator 실행
- [ ] `ropeHookReach()` 기준 별도 mandatory link 검증
- [ ] tests / check / format / diff check

## 7. Production Status Rule

REV 2.0 runtime PR이 병합되기 전까지 이 문서와 README는 반드시 `NOT IMPLEMENTED` / `LEGACY` 판정을 유지한다. 실제 Runtime 좌표와 테스트가 병합된 뒤에만 `MOCK INTEGRATED — REV 2.0`으로 변경한다.

## 8. 남은 blocker / asset handoff

- REV 2.0 geometry가 아직 Runtime에 없다(§3).
- Concourse/Transfer signage, background props, ambience 자산이 아직 없다.
- 3-8과 차별화되는 pre-finale 압박으로 읽히는지 실제 플레이 기반 검증이 필요하다.
