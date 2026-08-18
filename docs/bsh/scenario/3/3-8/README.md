# SECTOR 03-8 — UPPER EXCHANGE GATE

*ROPE-AWARE BLOCKOUT CANDIDATE · REV 2.0*

◀ PREV — [SECTOR 03-7 / TRANSFER MEZZANINE](../3-7/README.md) · NEXT — POST-SECTOR 03 TRANSITION / BOSS FLOW TBD ▶

`SECTOR 03 CENTRAL EXCHANGE COMPLEX` · `STAGE 08` · `SECTOR GENERAL FINALE` · `ROPE RHYTHM / ACCESS / TRANSFER SYNTHESIS`

| 항목 | 기준 |
|---|---|
| Status | HYPOTHESIS — ROPE-AWARE BLOCKOUT CANDIDATE |
| Runtime Status | LEGACY MOCK INTEGRATED — REV2 MIGRATION REQUIRED |
| Difficulty | ★★★★ |
| Enemy | Patrol Drone T1 ×2 — SEQUENTIAL / NON-OVERLAPPING PRESSURE BANDS |
| Scanner | ACCESS SCAN FIELD ×1 shared group |
| New Mechanic | NONE |
| New Enemy Behavior | NONE |
| New Input | NONE |
| New Rope Mode | NONE |
| New Augment | NONE |
| Wind | NONE |
| Rope Cut | NONE for Patrol Drone |
| Required Kill | NONE |
| Boss | NONE IN THIS STAGE |
| Sector-end Checkpoint | OPEN — Boss transition contract must be locked first |
| Exit Destination | POST-SECTOR 03 TRANSITION / BOSS FLOW TBD |
| Primary Role | Sector 03 Rope Rhythm Synthesis + Access / Evacuation Story Juxtaposition |
| Primary Space | One continuous Upper Market Gate Atrium built around a zig-zag swing spine |

---

## 0. REV2에서 바뀐 핵심

REV1의 핵심 구조:

```text
CENTRAL VERTICAL SCANNER SPINE
+
WEST / EAST DRONE POCKET
+
MULTIPLE REJOIN POINTS
```

은 폐기한다.

이유:

1. 현재 Rope는 단순한 `400px grapple teleport`가 아니다.
2. Hook은 실제 flight time을 가진다.
3. 부착 시 손→Anchor 거리가 Fixed-Length Rope가 된다.
4. Swing impulse는 Rope 반경의 접선 방향으로 한 번 적용된다.
5. Release 뒤 Base Rope는 1.0초 reload가 있다.
6. Rope 부착 중 일반 좌우 입력은 지속 Swing 가속을 만들지 않는다.
7. 따라서 짧은 간격의 `G1→G2→G3→C2` 연속 재부착 구조는 Base Rope 리듬과 충돌한다.

REV2의 기본 리듬:

```text
HOOK
→ FIXED-LENGTH SWING
→ RELEASE
→ COAST / LAND / RELOAD
→ NEXT HOOK
```

Stage geometry는 이 박자를 따른다.

---

## 1. 최신 코드 기준

### VERIFIED — CURRENT MAIN CHECK

REV2 작성 전 확인 HEAD:

```text
6f8d2529a759ca37c8aecc0185d9a0a797c6bbda
```

중요 최근 변경:

```text
2e06df8f...
AUGMENT V1 22장 + owner-first 전투 루프 통합

a43a5303...
Debug Rope tuning을 다음 Single Run 재시작에 연결

6f8d2529...
현재 main HEAD
```

Debug Rope tuning은 설계 기준값을 바꾸는 Production 계약이 아니다.
맵은 기본 `ROPE_CONFIG`로 반드시 성립해야 한다.

### VERIFIED — BASE PLAYER

```text
Player Radius            15
Gravity                  1250
Ground Acceleration      1350
Air Acceleration         520
Max Horizontal Speed     360
Jump Speed               440
```

### VERIFIED — BASE ROPE

```text
Hook Speed               1200 px/s
Hook Flight Lifetime     1/3 sec
Hook Reach               400 px
Hook Reload              1.0 sec
Attach Buffer            0.1 sec
Aim Tolerance            90 px
Swing Drag Hold          0.08 sec
Swing Impulse            780
Release Angular Transfer 0.55
Hand Offset              (12, -7)
```

### VERIFIED — ROPE PHYSICS CONTRACT

```text
ATTACH
→ hand-to-anchor distance becomes fixed rope length

SWING DRAG
→ one tangential impulse along rope tangent

RELEASE
→ body angular tangential velocity ×0.55 is added to linear velocity
→ rope detaches
→ reload begins
```

### VERIFIED — INPUT BUFFER

Pressing during reload can preserve a short attach intent so the Hook may fire when reload ends.

This is an implemented Rope behavior and may be expressed by 3-8.
It is not a new mechanic.

### VERIFIED — SCANNER

```text
AVAILABLE 1.5
WARNING   0.6
LOCKED    1.1
RESET     0.3
```

- AVAILABLE / WARNING: new attach allowed
- LOCKED / RESET: new attach denied
- existing attached Rope remains attached
- no forced detach
- no scanner damage

### VERIFIED — PATROL DRONE T1

Existing authored behavior only.

```text
kill optional
no rope cut
target-lock-cycle
activation-band-only
```

No new LOS-cover dependency is introduced by this stage.

---

## 2. Augment V1 호환 계약

3-8은 `New Augment = NONE`이지만,
Player가 기존 Augment를 갖고 진입할 수 있으므로 맵은 현재 Augment V1을 고려한다.

### 2-1. Rope Augments

| ID | 현재 효과 | 3-8 설계 영향 |
|---|---|---|
| `fast-launch` | Hook Speed ×1.5 | Hook flight가 빨라져도 동선이 깨지지 않아야 함 |
| `long-rope` | Reach +20% = 480px | 일부 안전한 skip/expressive line 허용, Story/Final Gate skip 금지 |
| `fast-recover` | Reload 1.0→0.5s | Wait Pivot이 강제가 아닌 faster expression이 되어야 함 |
| `release-propulsion` | Release 후 전체 속도 ×1.25 | 긴 launch/landing 공간 필요 |
| `electrified-rope` | Rope 접촉 적 지속 피해 | Drone 처치가 필요 조건이 되어서는 안 됨 |
| `collision-explosion` | 고속 Rope body hit 폭발 | 주변 구조가 combat-only gate가 되어서는 안 됨 |

### 2-2. Movement / Action Augments

| ID | 현재 효과 | 3-8 설계 영향 |
|---|---|---|
| `direction-dash` | 150px / 0.25s 이동 | Gap recovery/line optimization 허용 |
| `dash-strike` | 500 impulse + 공격 | Drone 압박 완화 가능, traversal 필수 금지 |
| `slow-fall` | 2s 동안 gravity ×0.25 | Recovery가 쉬워질 수 있음 |
| `fast-reuse` | Action cooldown ×0.60 | Stage critical path 변화 금지 |
| `extra-charge` | Action charge +1 | Sequence skip가 objective skip로 이어지지 않게 함 |
| `rope-link` | Rope release 후 1s 내 다음 Action cooldown ×0.5 | Rope→Action expression 허용 |
| `post-action-shield` | Action 후 2s shield | Drone pressure 완화 허용 |

### LOCKED AUGMENT RULE

```text
BASELINE WITHOUT MOVEMENT AUGMENT
= MUST CLEAR

AUGMENT
= EXPRESSION / SPEED / RECOVERY ADVANTAGE

AUGMENT
≠ REQUIRED KEY
≠ REQUIRED DISTANCE
≠ REQUIRED SURVIVAL TOOL
```

### Long Rope Skip Safety

`long-rope`는 480px까지 Reach가 늘어난다.

Story-critical / phase-critical node를 건너뛰면 안 되는 구간은
단순한 Grapple spacing만으로 보호하지 않는다.

다음이 필요하다:

- Story archive cue는 Archive Deck / object trigger에 묶는다.
- Final Gate objective는 final deck reach 이후에만 가능하게 유지한다.
- inter-floor divider / gate barrier를 우회 가능한 Anchor로 만들지 않는다.
- Long Rope로 C1→C3, C2→C4 같은 중요 단계 직접 skip이 생기는지 별도 검증한다.

---

## 3. Stage 한 줄 정의

3-7의 service-side Upper Concourse에서 3-8 Upper Market Gate로 진입한 Player가,
**좌우로 편심된 Scanner Anchor를 이용하는 하나의 Zig-zag Main Swing Spine**을 따라 상승한다.

Scanner가 열려 있으면 Main Anchor로 즉시 Commit하고,
잠겨 있으면 해당 Beat의 **Lateral Wait Pivot 하나**를 이용해 Rope Swing을 유지하면서
Reload / Scanner 시간을 이동으로 소비한 뒤 Main Spine으로 복귀한다.

후반에는 같은 구조를 Patrol Drone T1 압박 속에서 반복하고,
Archive Deck에 도달해
**Evacuation Transfer 기록과 Upper Commercial Access 기록이 같은 운영 환경에 병치되어 있었음**을 확인한 뒤
Post-Sector 03 content boundary로 이동한다.

---

## 4. Gameplay Question

> **“다음 Scanner Anchor가 닫혀 있을 때, 멈춰 기다릴 것인가 아니면 Rope의 1초 Reload 자체를 이동으로 소비할 것인가?”**

3-8은 Route Selection Stage가 아니다.

```text
NOT:
WEST ROUTE vs CENTRAL ROUTE vs EAST ROUTE

YES:
ONE MAIN SWING SPINE
+
TEMPORARY WAIT PIVOT
+
REJOIN
```

---

## 5. 왜 Main Spine은 수직이 아닌가

Swing impulse는 Rope 반경의 tangent에 적용된다.

Player 바로 위에 Anchor를 두면:

```text
rope radial ≈ vertical
tangent ≈ horizontal
```

이 되어 impulse가 상승보다 수평 이동에 쓰이기 쉽다.

따라서 REV2 Main Scanner Anchors는 좌/우로 편심시킨다.

```text
C1 LEFT/RIGHT OFFSET
→ release
→ opposite-side C2
→ release
→ opposite-side C3
→ release
→ C4
```

이 교차 리듬이 Stage의 기본 공간 언어다.

---

## 6. 공간 구조

```text
3-7 EXIT
   ↓
UPPER MARKET ENTRY
   ↓
OPENING LAUNCH
   ↓
C1 — first rope-aware scanner commit
   ↓
READ DECK A
   ├─ C2 AVAILABLE/WARNING → direct commit
   └─ C2 LOCKED/RESET → S2 WAIT PIVOT → release/reload → C2
   ↓
MID DECK
   ├─ C3 AVAILABLE/WARNING → direct commit
   └─ C3 LOCKED/RESET → S3 WAIT PIVOT → release/reload → C3
   ↓
FINAL LAUNCH DECK
   ↓
C4 — final scanner commit
   ↓
ARCHIVE DECK
   ├─ EVACUATION TRANSFER ARCHIVE
   └─ UPPER COMMERCIAL ACCESS ARCHIVE
   ↓
FINAL CONTROL
   ↓
POST-SECTOR 03 CONTENT BOUNDARY
```

---

## 7. Zone 설계

### ZONE A — ENTRY / OPENING COMMIT

목적:

- 3-7의 좁은 service-side ending에서 3-8 Finale 공간으로 전환
- 첫 Anchor부터 수직 climb가 아니라 diagonal swing임을 보여줌
- Scanner와 Drone을 동시에 쓰지 않음

구성:

```text
ENTRY SAFE DECK
→ short approach
→ C1 offset scanner anchor
→ swing
→ READ DECK A
```

C1은 Stage의 Rope-aware 문법 확인용이다.

### ZONE B — C2 READ / S2 WAIT PIVOT

READ DECK A에서 C2가 명확히 보인다.

C2가 열림:

```text
READ A
→ C2
→ SWING
→ MID
```

C2가 잠김:

```text
READ A
→ S2
→ SWING / PHASE READ
→ RELEASE
→ RELOAD RUNWAY
→ BUFFERED AIM
→ C2
→ MID
```

S2는 Route가 아니다.
단일 temporary wait pivot이다.

### ZONE C — C3 / DRONE LATE PRESSURE

동일 규칙을 반대 방향으로 변주한다.

```text
MID
→ C3 direct
or
MID
→ S3 wait pivot
→ C3
```

여기부터 Patrol Drone T1 pressure가 들어온다.

Drone은 Scanner를 대신 풀어주는 대상이 아니며
Kill은 선택 사항이다.

### ZONE D — FINAL C4

C4는 긴 튜토리얼이 아니다.

이미 학습한:

```text
offset anchor
scanner read
swing impulse
release timing
reload runway
```

를 한 번에 회수한다.

### ZONE E — ARCHIVE DECK

전투 / Scanner pressure를 종료한다.

Player가 Control을 잃는 cinematic은 쓰지 않는다.

두 Archive를 같은 Deck에서 직접 읽게 한다.

---

## 8. Wait Pivot 규칙

S2 / S3는 다음 조건을 만족해야 한다.

```text
PERMANENT STRUCTURAL GRAPPLE
not scanner-controlled
not fragile
not moving
not damage source
not route branch
```

역할:

1. Scanner가 잠긴 시간을 정지 대기로 만들지 않는다.
2. Swing impulse를 이용해 다음 launch state를 만든다.
3. Release 후 Base 1.0s reload를 공중 이동 / landing으로 소비한다.
4. 다음 Scanner Anchor를 미리 조준할 여유를 만든다.

### 금지

```text
S2-A → S2-B → S2-C
```

같은 multi-anchor chain을 만들지 않는다.

---

## 9. Provisional Rope-Aware Blockout

아래 좌표는 **HYPOTHESIS**다.
코드 구현 좌표로 그대로 복사하지 않는다.

현재 Area envelope:

```text
width  1408
height 1664
entry  (-544, -32)
final content boundary near current exit block
```

Provisional flow targets:

| Beat | Approx Position | Role |
|---|---:|---|
| Entry approach | `(-416,-160)` | grounded read |
| C1 | `(-160,-352)` | Scanner / opening diagonal |
| Read A | `(96,-480)` | scanner read / re-aim |
| S2 | `(-192,-544)` | left wait pivot |
| C2 | `(384,-704)` | Scanner / right commit |
| Mid | `(-128,-800)` | rejoin / read |
| S3 | `(160,-864)` | right wait pivot |
| C3 | `(-416,-1024)` | Scanner / left commit |
| Final Launch | `(128,-1120)` | final read |
| C4 | `(416,-1344)` | Scanner / right commit |
| Archive Deck | `(0,-1440)` | story-safe landing |
| Final Control | current exit-side | boundary approach |

### 반드시 Simulation으로 다시 조정할 것

- Anchor 실제 closest-point attach position
- hand offset
- incoming velocity
- body angular velocity
- tangential impulse direction
- gravity during 1.0s reload
- release angular transfer
- collision with deck edge
- player radius 15
- mobile camera framing

---

## 10. Grapple Validation Rule

현재 `AreaDefinitionValidator` 기본 `GRAPPLE_LINK_BUDGET`은 600이다.

하지만 Base Rope 실제 Reach는 400이다.

따라서:

```text
validateAreaCatalog(...)
PASS
```

만으로 traversal이 유효하다고 판단하면 안 된다.

3-8 mandatory geometry는 별도로:

```text
maxAttachDistance = ropeHookReach() // 400
```

기준 검증을 통과해야 한다.

### PASS

- mandatory attach point ≤400 from reachable launch state
- sealed divider가 Hook segment를 막지 않음
- closest-point candidate가 400 안쪽
- intended target이 90px aim tolerance에서 읽힘
- adjacent competing target 때문에 candidate 선택이 뒤집히지 않음

### FAIL

- center-to-center만 400 이하
- 실제 hand origin 기준 400 초과
- target surface의 closest point가 의도와 다름
- 600 validator만 통과하고 400 runtime에서 실패
- Long Rope 480에서 Story-critical bypass 발생

---

## 11. Scanner 설계

Scanner group은 기존 `scanner-upper-market-A` 계열을 유지할 수 있다.

REV2 목표:

```text
C1
C2
C3
C4
=
same phase group
```

Wait Pivot:

```text
S2
S3
=
NOT scanner-controlled
```

### 이유

Scanner의 학습 대상은:

> “언제 새 Anchor에 붙을 수 있는가?”

이지,

> “몇 개의 임의의 Anchor가 켜졌다 꺼지는가?”

가 아니다.

---

## 12. Drone 배치

REV1의 같은 높이 좌/우 Drone Pocket 구조를 폐기한다.

REV2:

```text
DRONE PRESSURE A
= S2 / C2 후반 beat

DRONE PRESSURE B
= S3 / C3 후반 beat
```

두 activation은 겹치지 않는다.

### Drone A

- lower / left-ish band
- S2 wait pivot에 너무 오래 매달리는 것을 압박
- C2 direct line을 완전히 차단하지 않음

### Drone B

- upper / right-ish band
- S3 wait pivot / C3 recovery를 압박
- Archive Deck까지 추격하지 않음

### LOCKED

- sustained crossfire 없음
- kill gate 없음
- rope cut 없음
- new enemy behavior 없음
- cover-ends-los 의존 없음

---

## 13. Recovery

REV1 `Recovery: 없음`은 REV2에서 재검토한다.

권장:

```text
RECOVERY CATWALK A
below C2 transition

RECOVERY CATWALK B
below C3 transition
```

조건:

- main fastest line 아님
- 3–4초 내 main flow 복귀 가능
- Slow Fall / Direction Dash가 없어도 사용 가능
- Augment가 있으면 더 쉽게 회복 가능
- story beat를 건너뛰는 shortcut 아님

---

## 14. Story

### Archive A — EVACUATION TRANSFER

```text
EVACUATION TRANSFER ARCHIVE

GROUP A
TRANSFER COMPLETE

GROUP B
TRANSFER COMPLETE

GROUP C
TRANSFER SUSPENDED
```

### Archive B — UPPER COMMERCIAL ACCESS

```text
UPPER COMMERCIAL ACCESS ARCHIVE

SERVICE CLASS CONTROL
ENABLED

ACCESS TIER CONTROL
ENABLED

PRIORITY ROUTE
ACTIVE
```

### 3-8이 확인하는 것

```text
TRANSFER RECORD
+
ACCESS CONTROL RECORD

existed in the same upper commercial operating environment
```

### 3-8이 확인하지 않는 것

- Group A/B/C ↔ Tier mapping
- Priority가 Group C Suspension의 원인
- 누가 Priority를 받았는지
- 누가 Tier를 정했는지
- Corporate decision maker
- deliberate abandonment

Sector 03 종료 질문:

> **“이 Access 규칙과 대피 결과는 어떤 관계였고, 누가 그 규칙을 만들었지?”**

---

## 15. Camera

Base:

```text
Desktop Zoom 1
Mobile Zoom  0.72
```

REV2는 custom cinematic pan을 필수로 요구하지 않는다.

하지만 blockout 검증 시:

- 다음 Main Scanner Anchor가 launch deck에서 읽히는지
- Wait Pivot과 Main Anchor가 같은 90px aim cluster처럼 보이지 않는지
- Mobile 0.72에서 Drone / Scanner / landing deck이 과도하게 한 화면에 겹치지 않는지
- high-speed release-propulsion에서 camera lag가 landing read를 해치지 않는지

확인한다.

---

## 16. Fragile Merchandise

3-8의 핵심 기믹으로 추가하지 않는다.

사용한다면:

```text
optional visual / momentum expression only
```

- Main mandatory pivot 아님
- Scanner wait pivot 아님
- Archive 접근 key 아님
- break state 때문에 softlock 없음

3-5 / 3-6에서 배운 Fragile language를 Finale에 과도하게 반복하지 않는다.

---

## 17. Multiplayer

- Scanner state는 shared authoritative
- Fragile을 사용한다면 break state shared
- Drone authoritative behavior 기존 계약 유지
- Player별 Rope / Augment state는 기존 runtime 계약 사용
- 두 Player가 서로 다른 Wait Pivot 상태에 있어도 Stage progression이 분리되지 않아야 함
- Final objective / gate는 현재 authored world progression contract를 따라야 함

---

## 18. 금지

- Vertical ladder-like C1→C4
- multi-anchor wait chain
- artificial three-route selection
- new Rope mode
- new input
- new Scanner behavior
- forced detach
- scanner damage
- moving platform
- wind
- turret
- Drone T2
- Drone activation overlap
- required kill
- required Augment
- Long Rope mandatory gap
- Direction Dash mandatory gap
- Slow Fall mandatory fall
- Boss reveal
- Sector 04 Transit mechanic preview
- Group↔Tier mapping
- causality reveal

---

## 19. Runtime Migration Contract

Current `Sector03AreaCatalog.js` area08 is LEGACY.

현재 구현:

```text
C1(-160,-384)
C2(0,-736)
C3(0,-1024)
C4(0,-1344)

same central vertical spine

drone-1 / drone-2
same broad height region

recovery none
```

REV2 구현 시:

1. Existing Stable ID는 가능하면 유지한다.
2. `c1/c2/c3/c4`는 좌우 offset 위치로 재배치한다.
3. `s2/s3` permanent grapple targets를 추가한다.
4. Drone activation을 progression-separated bands로 재배치한다.
5. Recovery ledge 1–2개를 추가한다.
6. Archive / final control story IDs는 유지한다.
7. `nextAreaId: null` / content-boundary는 Boss contract 확정 전 유지한다.
8. 새 mechanic / new schema를 만들지 않는다.

---

## 20. 구현 전 Mandatory Re-check

앞으로 Stage Blockout을 작성하거나 수정할 때마다 먼저 아래를 최신 `main`에서 다시 확인한다.

```text
src/game/config.js
src/game/physics/PlayerPhysics.js
src/game/rope/FixedLengthRope.js
src/game/rope/RopeLauncher.js
src/game/rope/RopeAttachment.js
src/game/input/RopePointerInput.js
src/game/augments/FoundationAugmentCatalog.js
src/game/augments/FoundationAugmentState.js
src/game/augments/actions/ActionAugmentCatalog.js
src/game/augments/AugmentCombatRuntime.js
src/game/world/AccessScanField.js
src/game/world/AreaDefinitionValidator.js
current Sector Area Catalog
adjacent Stage README / PRODUCTION-ALIGNMENT
```

확인 항목:

- Rope 수치 변경
- Rope attach/release semantics 변경
- Input buffer 변경
- Player physics 변경
- Camera 변경
- Enemy behavior 변경
- Scanner 변경
- Augment 추가/삭제/튜닝
- World validator 변경
- Stage-to-stage connection 변경

변경이 있으면 이전 Blockout 수치를 그대로 복사하지 않는다.

---

## 21. REV2 PASS 조건

### Rope

- [ ] No-Augment Base Rope clear 가능
- [ ] mandatory Hook actual reach ≤400
- [ ] 90px candidate ambiguity 없음
- [ ] Swing tangent가 intended progression 방향을 만듦
- [ ] 1.0s reload를 위한 runway / landing 존재
- [ ] release angular transfer 포함 simulation 검증

### Augment

- [ ] Long Rope 480에서 critical story skip 없음
- [ ] Fast Recover 0.5s에서 scanner logic 파손 없음
- [ ] Release Propulsion에서 벽/천장 forced impact 없음
- [ ] Direction Dash / Slow Fall 없이 mandatory clear 가능
- [ ] movement Augment가 있으면 표현 이점은 존재

### Enemy / Scanner

- [ ] Drone bands non-overlap
- [ ] Drone kill optional
- [ ] Scanner existing semantics only
- [ ] S2/S3 not scanner controlled

### Recovery

- [ ] recovery from failed C2/C3 in ~3–4 sec target
- [ ] recovery is not fastest route

### Story

- [ ] Archive pair same deck / same environment
- [ ] no Group↔Tier mapping
- [ ] no causal claim
- [ ] content boundary preserved

---

## 22. 다음 제작 순서

```text
REV2 DOC
→ PHYSICS-AWARE BLOCKOUT
→ BASE ROPE SIMULATION
→ AUGMENT COMPATIBILITY TEST
→ CAMERA / MOBILE READABILITY
→ DRONE + SCANNER PLAYTEST
→ APPROVED BLOCKOUT
→ SCENARIO ART
```

Scenario Art는 Approved Blockout 이후 제작한다.
