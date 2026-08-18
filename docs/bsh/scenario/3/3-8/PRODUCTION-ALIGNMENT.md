# SECTOR 03-8 — PRODUCTION ALIGNMENT

*ROPE-AWARE FINALE · REV 2.0 MIGRATION*

본 문서는 [3-8 시나리오](./README.md)의 REV2 Rope-aware 설계와 현재 `main` Runtime의 차이를 기록한다.

## 1. 현재 판정

| 항목 | 상태 | 판정 |
|---|---|---|
| Latest checked main | `6f8d2529a759ca37c8aecc0185d9a0a797c6bbda` | VERIFIED |
| Runtime 연결 | `MOCK INTEGRATED` | Sector03 authored chain의 마지막 area |
| REV2 Geometry | `NOT IMPLEMENTED` | Current area08은 legacy vertical/free-weave layout |
| Finale boundary | `IMPLEMENTED AS CONTENT-BOUNDARY` | 유지 |
| Scanner | `IMPLEMENTED PROTOTYPE` | C1/C2/C3/C4 shared group exists |
| Wait Pivot S2/S3 | `NOT IMPLEMENTED` | REV2 신규 authored geometry |
| Patrol Drone | `IMPLEMENTED LEGACY PLACEMENT` | 2기 존재, REV2 band 재배치 필요 |
| Recovery | `NONE IN CURRENT RUNTIME` | REV2 1–2개 검토 |
| Story Archive Pair | `IMPLEMENTED` | Stable IDs 유지 권장 |
| Augment V1 | `IMPLEMENTED` | 22-card catalog를 blockout compatibility에 반영해야 함 |
| Debug Rope Tuning | `IMPLEMENTED FOR NEXT SINGLE RUN` | Production baseline 대체 아님 |

---

## 2. Current Runtime — LEGACY

Source:

```text
src/game/world/areas/sector03/Sector03AreaCatalog.js
```

Current area:

```text
sector-03-08
UPPER MARKET GATE
FREE-WEAVE FINALE
bounds 1408×1664
entry (-544,-32)
nextAreaId null
completionMode content-boundary
```

Current Scanner targets:

```text
C1 (-160,-384)
C2 (0,-736)
C3 (0,-1024)
C4 (0,-1344)
```

문제:

```text
C2 / C3 / C4가 거의 중앙 수직 spine
```

이라 REV2 Rope tangent / reload rhythm 설계와 맞지 않는다.

Current Drones:

```text
drone-1 lower/left
drone-2 lower/right
```

현재 두 기체가 유사한 높이의 좌/우 pocket 성격을 가진다.
REV2에서는 서로 다른 progression beat로 분리한다.

Current Recovery:

```text
NONE
```

---

## 3. REV2 Target

### Main Swing Spine

```text
C1
→ opposite-side C2
→ opposite-side C3
→ C4
```

수직 ladder가 아니라 diagonal zig-zag.

### Wait Pivot

```text
S2
S3
```

- permanent structural
- grappleable
- not scanner-controlled
- not fragile
- not moving
- one pivot per scanner pressure beat

### Drone

```text
Drone A
= C2/S2 beat only

Drone B
= C3/S3 beat only
```

Activation overlap 금지.

### Recovery

REV2에서 1–2개의 service catwalk recovery를 검토한다.

---

## 4. Verified Base Rope Contract

Current `src/game/config.js`:

```text
hookSpeed          1200
hookFlightSeconds  1/3
reach              400
hookReloadSeconds  1.0
attachBuffer       0.1
swingImpulse       780
releaseTransfer    0.55
aimTolerance       90
```

중요:

`AreaDefinitionValidator`의 default grapple topology budget은 현재 600이다.

따라서:

```text
default validator PASS
!=
Base Rope traversal PASS
```

REV2 구현은 별도로 400 reach 기준을 검증해야 한다.

---

## 5. Augment Runtime Alignment

Current Rope Augments:

```text
fast-launch         hook speed +50%
long-rope           reach +20% => 480
fast-recover        reload -50% => 0.5s
release-propulsion  release velocity ×1.25
electrified-rope
collision-explosion
```

Current movement/action relevant Augments:

```text
direction-dash  150px / 0.25s
dash-strike     +500 impulse
slow-fall       2s, gravity ×0.25
fast-reuse
extra-charge
rope-link
post-action-shield
```

REV2 requirement:

```text
NO MOVEMENT AUGMENT
= baseline mandatory clear

AUGMENT
= optimization / expression / recovery
```

---

## 6. Stable IDs

가능하면 유지:

```text
sector-03-08:entry
sector-03-08:c1-surface
sector-03-08:c2-surface
sector-03-08:c3-surface
sector-03-08:c4-surface
sector-03-08:c1
sector-03-08:c2
sector-03-08:c3
sector-03-08:c4
sector-03-08:scanner-upper-market-A
sector-03-08:drone-1
sector-03-08:drone-2
sector-03-08:market-gate
sector-03-08:market-directory
sector-03-08:evacuation-archive
sector-03-08:access-archive
sector-03-08:final-control
sector-03-08:final-deck-reached
sector-03-08:exit-panel-engaged
```

신규 후보:

```text
sector-03-08:s2-surface
sector-03-08:s3-surface
sector-03-08:s2
sector-03-08:s3
sector-03-08:recovery-a
sector-03-08:recovery-b
```

Stable ID 이름은 구현 PR에서 current schema와 test convention을 다시 확인 후 확정한다.

---

## 7. Story / Boundary

유지:

```text
evacuation-archive
access-archive
final-control
```

Boss transition이 확정되기 전:

```text
nextAreaId: null
completionMode: content-boundary
```

유지.

3-8에서 `sector-04-01`로 직접 연결하지 않는다.

---

## 8. Migration Checklist

- [ ] Branch 시작 직전 `main` HEAD 다시 기록
- [ ] Rope / Player / Scanner / Augment source re-read
- [ ] area08 legacy vertical C1–C4 재배치
- [ ] S2/S3 authored grapple 추가
- [ ] Drone activation sequential bands로 재배치
- [ ] recovery 1–2개 추가 여부 확정
- [ ] archive/final stable IDs 유지
- [ ] default validator 실행
- [ ] `ropeHookReach() = 400` 기준 별도 geometry validation
- [ ] no-Augment traversal simulation
- [ ] `long-rope` 480 skip test
- [ ] `fast-recover` 0.5 scanner timing test
- [ ] `release-propulsion` collision safety test
- [ ] `direction-dash` / `slow-fall` bypass safety test
- [ ] Desktop/Mobile camera readability
- [ ] 2-player Scanner/Drone separation smoke
- [ ] tests / check / format / diff check

---

## 9. Production Status Rule

REV2 runtime PR이 병합되기 전까지 문서 표기는 반드시:

```text
ROPE-AWARE BLOCKOUT CANDIDATE
RUNTIME MIGRATION REQUIRED
```

로 유지한다.

실제 Runtime 좌표와 테스트가 병합된 뒤에만:

```text
MOCK INTEGRATED — REV2
```

로 변경한다.
