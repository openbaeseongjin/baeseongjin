# SECTOR 04 — INTEGRATION CROSS-VALIDATION AUDIT

*MASTER · STAGE · CURRENT RUNTIME CROSS-REVIEW · REV 1.0*

> **HISTORICAL CUTTER SEMANTICS — DO NOT USE FOR CURRENT AUTHORING:** 아래 원본 감사의 `no-rope-cut` 부재 기반 설명은 현재 계약이 아니다. 현재 Runtime과 저작은 `rules.includes("cutter-fire")` 명시적 positive opt-in만 Rope Cut capability로 사용한다.

`SECTOR 04 TRANSIT / INFRASTRUCTURE` · `4-1 → 4-8` · `MOMENTUM → INTERRUPTION → RECOVERY → MOMENTUM`

| 항목 | 판정 |
|---|---|
| Audit Snapshot | `9a45299e4c76b818f708175f20de90290e326116` |
| Detailed Stage Coverage | `4-1 ~ 4-8` — 8/8 authored on GitHub `main` |
| Current Authored Runtime | Sector 01 + Sector 02 only |
| Sector 04 Runtime | `NOT CONNECTED` |
| Overall Design | **CONDITIONAL PASS** |
| Runtime Integration Readiness | **HOLD — alignment patches required first** |
| Stage Redesign Required | **NO**, except 4-1 one-coordinate Flow fix |
| Main Product Blockers | 4-1 reach drift, Master/integration status drift, Wind-runtime drift, Cutter presentation, catalog/camera/story/runtime integration, Boss transitions |
| Approved Gameplay Art | HOLD |

---

### DOCUMENT INTEGRATION UPDATE — RE-VERIFIED AGAINST SHIPPED CODE (중요 정정 포함)

이 감사가 지적한 "4-1 reach drift"(§24 P0-A, 아래 본문의 `A3→A4 408.9px > 400px`)를
실제로 고치려던 첫 patch 시도 중, **Sector 04 4-1~4-8이 이 감사 이후 별도
세션에서 이미 `Sector04AreaCatalog.js`로 완전히 구현·validator 검증까지
끝난 상태**임을 발견했다. 이 shipped 코드의 4-1 A4 좌표는 원래 값
`(-64, -800)` 그대로였고, 이 감사가 제안한 "좌표 이동" 방향과 정면으로
어긋났다.

재검증 결과: **`A3→A4` 408.9px는 실제로 문제가 아니었다.** 4-1의
Mandatory Safe Route는 같은 구간을 `A3 → M1 → A4`로 우회하며(4-1 §9,
각 222.3px / 186.6px), 전체 Safe Route max는 374.5px로 400px 이내다.
이 감사가 "Flow Route" 표만 보고 "reach drift"로 판정한 것은 4-1 문서
자신이 이미 Flow Route를 `OPTIONAL EXPRESSION`으로 명시했다는 맥락을
놓친 오분석이었다. **좌표 변경은 하지 않았고, 필요하지도 않았다.**

이 감사 §24가 지정한 나머지 항목 중 실제로 유효했던 것들은 반영했다:
4-1/4-2 metadata 정렬, Wind Strength 360 재분류(Sector01 baseline이 아니라
Sector04 고유 hypothesis — 다만 shipped catalog가 그대로 사용 중인 CURRENT
RUNTIME 값), Sector 04 Master REV 1.1, `scenario-development-integration.md`
갱신(#29). 또한 이 감사 작성 이후 별도 세션에서 이미 반영된 항목도 확인했다:
P0-C의 Wind Shadow/Grounded Attenuation 문서 정합(PR #510), Sector 04
Master의 stale 상태 문구 정렬(#541/PR #542), Cutter Fire opt-in 강화(#513,
`canCutRope = rules.includes("cutter-fire")` — 이 감사 §8/§34가 "harden 검토
필요"로 남겨둔 항목), Camera Zone·Story Presentation 구현(#543).

추가로 이번 재검증에서 이 감사 본문에는 없던 새 결함도 발견해 고쳤다:
4-2/4-3/4-4/4-5/4-6/4-7 6개 Stage 문서의 Gate/Panel worldObject 좌표가
shipped catalog와 어긋나 있었고(대부분 Y 32px), 4-8 D1 Patrol activation
X 범위도 ±192→±208로 정정했다.

P0-F(Cutter-specific player-facing telegraph 구현)는 실제 코드/에셋 작업이라
이번 문서 패치 범위 밖이며 여전히 OPEN이다.

아래 본문은 이 재검증 이전 시점의 원본 감사 기록이며, 위에서 정정된
"4-1 reach drift"·"좌표 수정 필요" 관련 판정은 본문에서는 고치지 않고
그대로 보존한다(작성 당시의 분석 과정을 남기기 위함). 본문을 읽을 때는
위 정정 사항을 우선한다.

---

## 0. Audit 목적

이 문서는 Sector 04의 8개 상세 Stage를 각각 따로 읽는 것이 아니라 하나의 Sector로 묶어 다음을 검증한다.

```text
CURRENT CODE
↕
SECTOR MASTER
↕
4-1 ~ 4-8 DETAILED STAGES
↕
TIMER / BOSS PRODUCT CONTRACT
```

검증 축:

1. 현재 400px Derived Hook Reach와 좌표 정합성
2. Hook Flight / Reload를 고려한 Mandatory Route
3. Cutter / Patrol / Wake의 실제 Runtime 계약
4. Foundation / Specialization / Legacy Artifact 상태
5. Stage 간 Threat 반복성과 Difficulty Rhythm
6. Recovery의 역할과 Activation 분리
7. Story Disclosure 순서
8. Multiplayer 위험
9. Sector Timer / Stage08 / Boss 경계
10. 현재 Runtime과 문서 사이 Drift
11. Runtime integration 전에 반드시 닫아야 할 P0
12. Playtest에서 검증할 P1/P2

---

## 1. Executive Verdict

### 최종 판정

```text
CONDITIONAL PASS
```

Sector 04의 **게임플레이 구조와 Story 순서 자체는 유지할 가치가 있다.**

특히 다음 progression은 잘 분리돼 있다.

```text
4-1 PURE MOMENTUM
→
4-2 FIRST CUTTER
→
4-3 CUTTER + WAKE
→
4-4 REST / ROUTING STORY
→
4-5 PURE WAKE MOVEMENT JOY
→
4-6 ROPE GEOMETRY COMBAT
→
4-7 CUTTER + WAKE DIRECTIONAL SYNTHESIS
→
4-8 GENERAL FINALE
```

그러나 현재 GitHub와 최신 Runtime을 다시 대조하면:

```text
DESIGN COHERENT
≠
RUNTIME-INTEGRATION READY
```

다.

### Runtime integration 전에 반드시 닫을 것

```text
P0-1
4-1 Flow 408.9px > current 400px Hook Reach

P0-2
Sector 04 Master가 4-2~4-8을 outline-only로 기록

P0-3
scenario-development-integration이 stage-count 31 / 4-8 outline으로 stale

P0-4
Wind Runtime이 PR #507에서 확장됐는데
4-3 / 4-5 / 4-7 / Master 일부 설명이 이전 상태를 전제로 함

P0-5
Strength 360을 “현재 Sector01 Runtime baseline”으로 부르는 문구 제거
→ Sector04 HYPOTHESIS로 재분류

P0-6
4-1 / 4-2의 Foundation / Specialization / Artifact metadata 정렬

P0-7
Cutter 물리 capability는 존재하지만
Cutter-specific projectile / pre-fire presentation은 아직 별도 구현 확인 필요
```

이 P0를 닫은 뒤 Sector 04 authored catalog graybox로 넘어가는 것이 안전하다.

---

## 2. Source of Truth 우선순위

현재 Audit의 우선순위:

```text
1. CURRENT RUNTIME CODE @ 9a45299
2. PRODUCT TIMER / BOSS CONTRACT
3. MERGED DETAILED STAGE README 4-1~4-8
4. SECTOR 04 MASTER
5. LOCAL REVIEW PATCH
```

중요:

Sector 04 Master는 현재 상세 Stage보다 오래됐다.

따라서 Master와 Stage가 충돌하면:

```text
CURRENT CODE
+
LATEST DETAILED STAGE
```

를 먼저 보고 Master를 갱신한다.

---

## 3. Current Runtime Truth

### 3-1. Hook / Rope

Current:

```text
Hook Speed
1400 px/s

Hook Flight Lifetime
2 / 7 sec

Derived Hook Reach
400 px

Hook Reload
0.20 sec

Attach Buffer
0.10 sec

Swing Impulse
780

Release Angular Transfer
0.55
```

따라서 Sector 04 geometry 기준:

```text
MANDATORY LINK
< 400 px

FLOW LINK
< 400 px
```

이다.

`400`은 독립 거리 상수가 아니라:

```text
1400 × 2/7
```

에서 파생한다.

### 3-2. Combat

Current:

```text
Enemy Radius
18

Enemy Health
100

Enemy Attack Range
760

Acquire
0.25 sec

Track
0.80 sec

Lock
0.20 sec

Fire Flash
0.08 sec

Enemy Fire Interval
1.00 sec

Enemy Projectile Speed
520 px/s

Enemy Projectile Radius
7

Enemy Projectile Damage
20

Rope Disabled After Cut
0.60 sec
```

### 3-3. Cutter

Current Enemy projectile:

```text
canCutRope
=
!rules.includes("no-rope-cut")
```

즉 Rope Cut physics capability는 이미 존재한다.

Cutter는 Rope를 직접 Homing하지 않는다.

```text
Enemy aims at Player
→ projectile trajectory
→ current Rope segment intersects
→ rope-cut
```

### 3-4. Patrol

Current Patrol:

```text
NO VALID TARGET
→ patrol

VALID TARGET
→ patrol pause
→ acquire / track / lock / fire

TARGET INVALID
→ attack reset
→ patrol resume
```

Sector 04 reusable baseline:

```text
speed 48
wait 0.45
pingpong
```

Patrol은:

```text
no-rope-cut
```

를 유지.

### 3-5. Foundation

Current actual catalog:

```text
IMPULSE COIL
+180 release impulse

RELAY LINK
0.65 sec release window
0.16 sec attach buffer
108 aim tolerance

SHEAR CURRENT
20 damage
segment tolerance 4
```

### 3-6. First Specialization

Current:

```text
NODE SKELETON
IMPLEMENTED

selectionPool
"TBD"

Catalog / effects / result storage
PENDING
```

따라서 Sector 04:

```text
FIRST SPECIALIZATION
NOT REQUIRED
```

가 맞다.

### 3-7. Legacy Artifact

기존 글로벌 Artifact progression은 은퇴.

```text
LEGACY ARTIFACT
REMOVED
```

Checkpoint를 Reward Selection으로 다시 사용하지 않는다.

---

## 4. Wind Runtime — PR #507 이후 새 기준

### 4-1. Current Capability

현재 Wind는 단순 Hard Rect만이 아니다.

Runtime에 존재:

```text
STATIC RECT ZONE
+
OPTIONAL PER-ZONE FALLOFF
+
WIND OCCLUSION / SHADOW
+
GROUNDED ATTENUATION
+
DETERMINISTIC PULSED PHASE
```

Current config:

```text
groundedFactor
0.35

shadowFactor
0.15

defaultFalloff
0
```

### 4-2. Falloff

Zone에:

```text
falloff: N
```

이 있으면 경계에서 force가 점차 증가/감소한다.

없으면:

```text
defaultFalloff = 0
```

이므로 기존 Hard Edge처럼 동작.

### 4-3. Wind Shadow

Wind origin과 Player 사이 segment가:

```text
windOcclusion:true
```

surface 또는:

```text
collision !== false
AND
oneWay === false
```

solid surface를 가로지르면:

```text
force × 0.15
```

로 감소.

### 4-4. Grounded Attenuation

Player가 grounded면:

```text
force × 0.35
```

로 실제 감쇠.

### 4-5. Sector 04 REV1 권장 계약

Sector 04 첫 Runtime graybox에서는:

```text
falloff
OMIT / 0

dedicated windOcclusion blockers
NONE

Recovery Deck
Wake bounds OUTSIDE
```

를 유지하는 것을 권장.

즉 새 Runtime capability를 **사용하지 않는 것**은 가능하지만:

```text
“Runtime에 capability가 없다.”
```

라고 문서에 쓰면 안 된다.

### 4-6. Solid Surface 주의

Dedicated `windOcclusion:true`가 없어도
non-oneWay solid surface는 자동 occluder가 될 수 있다.

따라서 Sector 04 graybox 제작 시:

> Wake Corridor 안의 structural solid가 의도치 않게 Wake를 15%로 낮추지 않는지 확인해야 한다.

---

## 5. Wind Strength 360 재분류

Sector 04 Stage 문서의 공통 후보:

```text
Strength
360

Cycle
1.75 / 0.70 / 1.40 / 0.30
```

현재 판정은 둘을 분리해야 한다.

### Cycle

```text
1.75
0.70
1.40
0.30
```

은 current Pulsed Wind precedent와 일치.

```text
VERIFIED PRECEDENT
```

### Strength 360

PR #507 이후 Sector01 current authored tuning:

```text
1-6 Fan A
500

1-6 Fan B Pulsed
800

1-7 Main Pulsed
800
```

이다.

따라서 Sector 04의:

```text
360
```

은 더 이상:

```text
“Current Sector01 Runtime baseline”
```

이라고 부를 수 없다.

정확한 상태:

```text
HYPOTHESIS
SECTOR 04 INITIAL TUNING
```

### 결정

360을 자동으로 800으로 올리지 않는다.

이유:

- Sector04 geometry가 다름
- Cutter와 결합되는 Stage가 있음
- 4-5 vertical Wake는 체감이 다름
- 4-7 opposed flow에서 800은 과도할 수 있음
- 실제 graybox playtest 전 최종 수치 확정 금지

---

## 6. Stage Coverage Matrix

| Stage | Gameplay Role | Enemy | Wake | Story Role | Current Audit |
|---|---|---:|---|---|---|
| 4-1 TRANSIT INTAKE | Pure Momentum / scale reveal | 0 | 0 | powered infrastructure entry | **PATCH REQUIRED** |
| 4-2 CUTTER LINE | first Rope-Cut tutorial | Cutter ×1 | 0 | infrastructure security | PASS / metadata patch |
| 4-3 FREIGHT BYPASS | first Cutter + Wake combination | Cutter ×1 | horizontal | freight service active | PASS / Wind doc patch |
| 4-4 INFRASTRUCTURE SERVICE NODE | REST / routing diagnostic | 0 | 0 | feeder `SEGMENTED` | PASS |
| 4-5 EXPRESS SHAFT | pure Movement Joy | 0 | vertical | upper trunk limited service | PASS / Wind doc patch |
| 4-6 POWER RELAY SPAN | Rope geometry combat | Cutter ×1 + Patrol ×1 separated | 0 | power/transit coupling | PASS |
| 4-7 ISOLATION JUNCTION | directional Cutter+Wake synthesis | Cutter ×1 | S-route horizontal | feeder `ISOLATED` | PASS / Wind doc patch |
| 4-8 TRANSIT CONTROL TRUNK | General Finale | Cutter ×1 + Patrol ×1 separated | long vertical | upper limited vs lower isolated | PASS / Wind classification patch |

### Overall

```text
8/8 DETAILED STAGES AUTHORED ON MAIN
```

현재 Master / integration status 문서의:

```text
4-2 ~ 4-8 outline only
```

또는:

```text
4-8 outline only
```

은 현재 상태가 아니다.

---

## 7. 400px Geometry Audit

### Current Intended Geometry

| Stage | Safe Max | Flow Max | Margin to 400 | 판정 |
|---|---:|---:|---:|---|
| 4-1 REV1.1 intended | 374.6 | 386.7 | 13.3 flow | PASS after patch |
| 4-2 | 385.3 | 385.3 | 14.7 | PASS / narrow |
| 4-3 | 349.4 | 320.0 | 50.6 | PASS |
| 4-4 | 315.2 | 315.2 | 84.8 | PASS |
| 4-5 | 374.6 | 320.0 | 25.4 | PASS |
| 4-6 | 386.7 | 386.7 | 13.3 | PASS / narrow |
| 4-7 | 357.8 | 357.8 | 42.2 | PASS |
| 4-8 | 364.9 | 346.1 | 35.1 | PASS |

### GitHub 4-1 Current Failure

Current `main` 4-1:

```text
A3 → A4
408.9 px

MAX FLOW LINK
408.9 px

400px보다 작다.
```

이는 명백한 모순.

```text
408.9 > 400
```

### Approved Patch Candidate

기존 local reviewed REV1.1:

```text
A4
(-64,-800)
→
(-32,-800)
```

결과:

```text
A3 → A4
≈ 381.7 px

Safe Max
≈ 374.6 px

Flow Max
≈ 386.7 px
```

Stage role 변경 없음.

### 판정

```text
P0
PATCH BEFORE SECTOR 04 RUNTIME INTEGRATION
```

---

## 8. Hook Flight / Aim Margin Audit

단순 거리 PASS와 실제 초행 플레이 PASS는 다르다.

특히 좁은 margin:

```text
4-1 Flow
386.7 / 400

4-2
385.3 / 400

4-6
386.7 / 400
```

### 위험

Hook은 instant attach가 아니다.

```text
Launch
→ Flight
→ Surface Hit
```

이므로 Player 자체가 이동하면
실제 aim / flight 결과가 달라질 수 있다.

### Playtest Rule

각 Stage Mandatory graybox에서:

```text
swingImpulse = 0
```

와 함께:

- Hook miss rate
- first-play re-aim count
- mobile aim difficulty
- next-anchor visibility
- 2P remote readability

확인.

### 조정 우선순위

FAIL하면:

```text
Anchor 8~16px inward
→ Camera readability
→ Aim presentation
```

순서.

Hook Reach 자체를 늘려 해결하지 않는다.

---

## 9. Threat / Repetition Audit

### Threat Sequence

```text
4-1
NONE

4-2
CUTTER

4-3
CUTTER + WAKE

4-4
REST

4-5
WAKE ONLY

4-6
CUTTER + PATROL SEPARATED

4-7
CUTTER + WAKE / S-SHAPE

4-8
CUTTER + PATROL SEPARATED + WAKE FINALE
```

### Cutter Frequency

Cutter 사용:

```text
4-2
4-3
4-6
4-7
4-8

= 5 / 8 stages
```

수는 많지만 역할이 다르다.

```text
4-2
TUTORIAL

4-3
FIRST COMBINATION

4-6
ROPE GEOMETRY

4-7
DIRECTIONAL SYNTHESIS

4-8
FINALE INTERRUPTION
```

### 판정

Gameplay repetition:

```text
PASS
```

Presentation fatigue:

```text
P2 RISK
```

같은 Sentry family를 5개 Stage에서 쓰므로:

- Camera silhouette
- encounter geometry
- Cutter pre-fire cue
- environment context
- recovery shape

가 Stage마다 즉시 달라 보여야 한다.

새 Enemy Type을 만들 필요는 없다.

---

## 10. Wake Repetition Audit

Wake 등장:

```text
4-3
horizontal + Cutter

4-5
vertical / pure movement

4-7
horizontal + S-route
assist → drift → oppose

4-8
long vertical Finale spine
```

### 공간 역할

서로 충분히 다름.

```text
PASS
```

### Cycle Repetition Risk

모두 같은:

```text
1.75 / .70 / 1.40 / .30
```

을 쓰면 학습 일관성은 좋지만
Sector 후반에 기계적으로 느껴질 수 있다.

### 권장

Prototype에서는 같은 cycle 유지.

Playtest 후:

- 4-5 pure speed
- 4-8 finale

중 하나만 phase duration variation 후보로 검토.

처음부터 Stage별 값을 다르게 만들어 학습성을 깨지 않는다.

---

## 11. Difficulty / Rhythm Audit

Current:

```text
4-1 ★★☆
4-2 ★★★
4-3 ★★★
4-4 REST
4-5 ★★★☆
4-6 ★★★☆
4-7 ★★★★
4-8 ★★★★
```

### 판정

```text
PASS
```

좋은 점:

- 첫 3 Stage가 new rule 학습
- 4-4 명확한 decompression
- 4-5 combat 없는 joy peak
- 4-6 combat 복귀
- 4-7 synthesis
- 4-8 finale

### 주의

4-7과 4-8이 모두 ★★★★이므로
4-8의 난이도 증가는:

```text
more simultaneous systems
```

가 아니라:

```text
longer continuity
+
recovery quality
```

에서 나와야 한다.

Cutter + Patrol 동시 activation 금지 유지.

---

## 12. Recovery Audit

Sector 04의 핵심은:

```text
SPEED
+
RECOVERY QUALITY
```

다.

### Stage별 Recovery 역할

```text
4-2
Cut tutorial catch

4-3
Cutter/Wake combined catch

4-5
side ledge as optional rhythm reset

4-6
full-safe enemy-band reset

4-7
direction-change recovery

4-8
Cutter recovery
→ re-acceleration
→ Patrol recovery
```

### 판정

```text
PASS
```

특히 4-8의:

```text
RECOVERY
→ MOMENTUM AGAIN
```

구간은 Sector 전체 주제를 잘 회수한다.

---

## 13. Cutter Presentation Audit

### Physics

```text
VERIFIED
```

### Current Player-facing Feedback

Rope Cut 후 feedback / disable은 존재.

### 그러나 Projectile Rendering

현재 Enemy projectile renderer는:

```text
scene.enemyProjectiles
```

전체에 동일 enemy projectile sprite / palette를 사용한다.

확인된 Renderer 계약만으로는:

```text
canCutRope === true
```

Projectile이 일반 `no-rope-cut` Projectile과
명확히 다른 sprite / trail / pre-fire visual을 쓰는 근거가 없다.

### Sector 04 Required Presentation

4-2 첫 Tutorial 이전:

```text
distinct charge cue
distinct projectile silhouette
distinct trail
distinct audio
```

필요.

### 판정

```text
P0 PRODUCTION BLOCKER FOR CUTTER PLAYTEST READABILITY
```

물리 구현이 없는 것이 아니다.

정확한 상태:

```text
CUTTER PHYSICS
READY

CUTTER-SPECIFIC PLAYER-FACING TELEGRAPH
NEEDS IMPLEMENTATION / VERIFICATION
```

---

## 14. Patrol Audit

4-6 / 4-8은 현재 Patrol Runtime과 정렬.

### 정확한 계약

```text
no valid target
→ patrol

valid target
→ stop patrol and engage

target invalid
→ patrol resumes
```

### Rope Cut

```text
no-rope-cut
```

유지.

### LOS

Generic:

```text
cover-ends-los
```

없이는 Cover가 안전을 보장하지 않는다.

4-6 / 4-8이 activation으로 safe deck을 만드는 방식은 적절.

### 판정

```text
PASS
```

---

## 15. Foundation / Specialization Audit

### Foundation

```text
CURRENT RUNTIME
```

4-3 이후 Stage가 현재 값을 사용하는 것은 맞다.

### 4-1 / 4-2 Drift

현재 일부 metadata:

```text
Foundation + first Specialization KEEP
runtime pending
```

은 부정확.

정확한 표현:

```text
Foundation
IMPLEMENTED / KEEP

First Specialization
CONTENT BLOCKED / NOT REQUIRED
```

### Legacy Artifact

4-2 top table의:

```text
Artifact Reward
NONE
```

보다:

```text
Legacy Artifact Layer
REMOVED FROM CURRENT RUNTIME
```

가 현재 구조를 더 정확히 설명.

### 판정

```text
P0/P1 DOCUMENT ALIGNMENT
```

Gameplay geometry를 바꿀 필요는 없다.

---

## 16. Build Lock Audit

Sector 04 Stage 모두:

```text
NO FOUNDATION REQUIRED FOR MANDATORY CLEAR
```

가 원칙.

Foundation expression:

```text
IMPULSE
speed / exposure compression

RELAY
chain consistency

SHEAR
optional offense
```

### Shear

4-6이 strongest showcase.

4-7 / 4-8에서 다시 Shear 중심으로 만들지 않은 점이 좋다.

### 판정

```text
PASS
```

---

## 17. Story Disclosure Audit

### 4-1

```text
Transit / Infrastructure
powered enough to operate
```

### 4-2

```text
Infrastructure Security
protected access
```

### 4-3

```text
Freight / pressure service
partially active
```

### 4-4

첫 anomaly:

```text
LOWER ASCENT FEEDER
STATUS: SEGMENTED
TELEMETRY: PARTIAL
```

### 4-5

Upper contrast:

```text
UPPER EXPRESS TRUNK
LIMITED OPERATION
```

### 4-6

```text
TRANSIT POWER FEED
REDUNDANT CHANNEL ONLINE
```

원인 Reveal 없음.

### 4-7

확정:

```text
LOWER ASCENT FEEDER
ISOLATED
```

별도 표시:

```text
CONTAINMENT ROUTING
ACTIVE
```

직접 causal arrow 없음.

### 4-8

독립 Row 병치:

```text
UPPER EXPRESS TRUNK
LIMITED OPERATION

LOWER ASCENT FEEDER
ISOLATED
```

### 아직 숨기는 것

```text
WHY
WHO
GROUP A/B/C ROUTE MAPPING
GROUP C CAUSALITY
INTENTIONAL SACRIFICE
```

### 판정

```text
PASS
```

Story disclosure는 Sector 04의 가장 강한 정합 항목 중 하나.

---

## 18. 4-8 Boss / Timer Boundary Audit

Current product contract:

```text
GENERAL SECTOR TIMER
continues through general stages

DESIGNER-DEFINED BOSS ENTRY
→ general timer STOP
→ general collapse STOP
→ remaining general time DISCARD
→ initial Boss START without a timer; separate Boss Timer DEFERRED
```

### 4-8 Current

```text
INTERNAL BOSS
NONE

P6
STAGE-LOCAL COMPLETION

P6
≠ BOSS ENTRY

nextAreaId
null

POST-SECTOR ACCESS
VISUAL HOLD
```

### 판정

```text
PASS
```

특히 금지:

```text
4-8 → sector-05-01
```

직결.

### 남은 Product Gate

```text
Post-Sector 04 Boss location
Boss identity
Boss combat
exact Boss Entry
4-8 → Boss
Boss → Sector05
```

모두 OPEN.

---

## 19. Multiplayer Audit

### 좋은 계약

- Wake phase shared deterministic
- Enemy activation spatially limits eligible target
- Cutter / Patrol separated where required
- Gate shared open + individual physical crossing
- no forced party teleport
- no Stage-specific build lock

### Cutter Risk

Cutter projectile은 실제 world Rope segment와 충돌하므로
Target Player가 아닌 Partner Rope를 우발적으로 자를 수 있는지 확인 필요.

### Two-player required tests

```text
A in Cutter band
B on safe recovery

A targeted projectile
→ B Rope intersection?

A / B different vertical bands
→ Enemy target eligibility stable?

One Player P6
Other still below
→ no forced transition
```

### 판정

```text
DESIGN PASS
PLAYTEST REQUIRED
```

---

## 20. Sector Playtime / Timer Budget

Stage first-play estimates 합:

```text
LOW
1065 sec
= 17m45s

HIGH
1500 sec
= 25m00s
```

Skilled estimates:

```text
LOW
435 sec
= 7m15s

HIGH
645 sec
= 10m45s
```

이 값은:

```text
POST-SECTOR BOSS
미포함
```

이다.

### 위험

Sector general timer가 아직 mock / open이므로
현재 Stage 길이가 자동 FAIL은 아니다.

그러나 8 Stage + Boss를 고려하면:

```text
P2 TIMER-BUDGET RISK
```

다.

### 권장

Sector04 first graybox 이후:

1. 3명 공동 플레이
2. Stage별 median clear time
3. Gate pause / observation time
4. Cutter recovery delay
5. Wake full-cycle waits
6. multiplayer lagging-player gap

을 기록한 뒤 Sector Timer를 정한다.

Stage 문서 예상시간을 Timer에 억지로 맞추지 않는다.

---

## 21. Sector Master Drift

현재 Master의 주요 stale 항목:

### Drift A

```text
Carry Build
Foundation + first Specialization KEEP — runtime pending
```

현재 사실과 불일치.

### Drift B

```text
4-1 detailed
4-2 ~ 4-8 outline only
```

현재 8/8 detailed.

### Drift C

Wind limitations:

```text
wind shadow 없음
grounded attenuation 없음
spatial falloff 없음
```

현재 false.

### Drift D

Wind strength / precedent 설명이 PR #507 이전 상태.

### Required

```text
SECTOR 04 MASTER
REV 1.1+
```

로 재정렬.

### Master에서 유지할 핵심

- Momentum Under Interruption
- Cutter as Rope-Line pressure
- Transit Wake as existing Wind family
- no moving train requirement
- no new Rope Mode/Input
- Growth HOLD
- 4-8 internal Boss none
- Post-Sector04 transition TBD
- Story operational-state-only boundary

---

## 22. scenario-development-integration Drift

현재 integration document는 latest main에서도 일부 stale.

기록:

```text
stage-count
31

coverage
through 4-7

Sector04 4-8
outline only
```

하지만 실제:

```text
4-8 merged via PR #508
```

따라서:

```text
stage-count
32

coverage
include 4-8
```

로 갱신 필요.

### Sector04 Status도 수정

현재 표현은 Cutter / Wake “prototype이 필요”에 가깝지만
정확한 현재 상태는:

```text
Hook
IMPLEMENTED

Foundation
IMPLEMENTED

Patrol
IMPLEMENTED

Cutter physics
IMPLEMENTED

Wind physics
IMPLEMENTED
including falloff / occlusion / grounded attenuation

Sector04 authored areas
NOT CONNECTED

Cutter-specific presentation
PENDING / VERIFY

Camera / Story / Stable IDs
PENDING

Graybox playtest
PENDING
```

이다.

---

## 23. Current Runtime Boundary

Current authored catalog:

```text
Sector01
+
Sector02
```

만 포함.

즉:

```text
Sector03
NOT CONNECTED

Sector04
NOT CONNECTED
```

### Sector04를 막는 실제 것

basic physics가 아니다.

현재 실제 blocker:

```text
Post-Sector03 Boss / transition
Sector04 area catalog
Area stable IDs
Camera zones
Story presentation
Cutter telegraph presentation
4-1 reach patch
Wind doc/runtime alignment
graybox physics
multiplayer playtest
Post-Sector04 Boss / transition
```

---

## 24. Required Patch Order

### P0-A — 4-1 Geometry

```text
A4 x
-64 → -32
```

or mathematically equivalent patch.

목표:

```text
all flow links < 400
```

### P0-B — 4-1 / 4-2 Metadata

정렬:

```text
Foundation IMPLEMENTED
Specialization CONTENT BLOCKED / NOT REQUIRED
Legacy Artifact REMOVED
current detailed-stage links
Derived Hook Reach wording
```

### P0-C — Wind Documents

대상:

```text
Sector04 Master
4-3
4-5
4-7
4-8
```

수정:

```text
falloff capability exists
wind shadow exists
grounded factor .35 exists
default falloff 0
```

그리고:

```text
Strength 360
= Sector04 HYPOTHESIS
```

### P0-D — Sector Master

8/8 detailed stage 상태와 current runtime으로 REV update.

### P0-E — Integration Status

```text
stage-count 32
4-8 AUTHORED
```

반영.

### P0-F — Cutter Presentation Spike

4-2 first playtest 전에:

```text
canCutRope projectile
```

의 charge / sprite / trail / sound가 일반 projectile과 구별되는지 구현.

### P0-G — Re-run Documentation Integration Check

patch 후:

```text
npm run check:scenario-integration
```

현재 workflow에 맞춰 fingerprint 정렬.

---

## 25. Runtime Implementation Readiness by Stage

### 4-1

```text
HOLD
```

이유:

```text
GitHub Flow geometry invalid
```

patch 후:

```text
GRAYBOX READY
```

### 4-2

```text
CORE PHYSICS READY
PRESENTATION / AREA INTEGRATION HOLD
```

### 4-3

```text
CORE PHYSICS READY
WIND DOC PATCH
AREA INTEGRATION HOLD
```

### 4-4

```text
GRAYBOX READY
```

새 Physics 없음.

### 4-5

```text
CORE PHYSICS READY
WIND DOC PATCH
AREA INTEGRATION HOLD
```

### 4-6

```text
CORE PHYSICS READY
GRAYBOX / AREA INTEGRATION HOLD
```

### 4-7

```text
CORE PHYSICS READY
WIND DOC PATCH
AREA INTEGRATION HOLD
```

### 4-8

```text
CORE PHYSICS READY
WIND CLASSIFICATION PATCH
BOSS BOUNDARY REMAINS HOLD
```

---

## 26. Recommended Implementation Order

Sector04 전체를 한 번에 구현하지 않는다.

```text
P0 DOCUMENT / GEOMETRY PATCH
↓
4-1 PURE GEOMETRY GRAYBOX
↓
4-2 CUTTER PRESENTATION + TUTORIAL SLICE
↓
4-3 CUTTER + WAKE SLICE
↓
4-4 REST / STORY
↓
4-5 VERTICAL WAKE
↓
4-6 PATROL / ROPE GEOMETRY
↓
4-7 DIRECTIONAL SYNTHESIS
↓
4-8 FINALE
↓
FULL SECTOR PLAYTEST
```

### 4-8 이후

```text
STOP
```

Post-Sector04 Boss / Sector05 wiring은
별도 기획 결정 전 추정하지 않는다.

---

## 27. Full-Sector Acceptance Checklist

### Geometry

- [ ] 4-1 GitHub Flow max <400
- [x] 4-2 intended max <400
- [x] 4-3 intended max <400
- [x] 4-4 intended max <400
- [x] 4-5 intended max <400
- [x] 4-6 intended max <400
- [x] 4-7 intended max <400
- [x] 4-8 intended max <400
- [ ] all Mandatory routes runtime-validated with `swingImpulse=0`

### Systems

- [x] Hook Flight exists
- [x] Foundation exists
- [x] Cutter physics exists
- [x] Patrol exists
- [x] Pulsed Wind exists
- [x] Wind falloff capability exists
- [x] Wind shadow capability exists
- [x] grounded Wind attenuation exists
- [ ] Cutter-specific player-facing telegraph verified

### Progression

- [x] no new Rope Mode
- [x] no new input
- [x] no new growth tier
- [x] no mandatory Specialization
- [x] no Legacy Artifact
- [x] kill optional
- [x] Recovery repeated as core skill

### Story

- [x] 4-4 `SEGMENTED`
- [x] 4-5 Upper limited operation
- [x] 4-7 `ISOLATED`
- [x] containment/isolation causality remains unconfirmed
- [x] Group route mapping withheld
- [x] intentional sacrifice withheld
- [x] 4-8 upper/lower juxtaposition

### Finale

- [x] 4-8 internal Boss none
- [x] P6 local completion only
- [x] P6 not General Timer end by itself
- [x] Sector05 direct wiring prohibited
- [ ] Post-Sector04 Boss / Transition designed

### Documentation

- [ ] Sector04 Master current
- [ ] 4-1 current
- [ ] 4-2 metadata current
- [ ] Wind Stage docs current
- [ ] scenario-development-integration current
- [x] 4-8 detailed Stage exists on `main`

---

## 28. Priority Classification

### P0 — Runtime Integration 전에 반드시

1. 4-1 408.9px fix
2. Sector04 Master revision
3. scenario-development-integration revision
4. Wind runtime sections update
5. Strength360 HYPOTHESIS reclassification
6. 4-1/4-2 progression metadata update
7. Cutter presentation implementation / verification

### P1 — 첫 Sector04 Graybox 전에 권장

1. 4-2 / 4-6 narrow Hook margin check
2. Sector04 stable ID convention final pass
3. no unintended Wind occlusion from solid surfaces
4. 4-2 / 4-3 Cutter authority/prediction parity regression
5. story trigger placement volumes
6. camera next-anchor readability

### P2 — Playtest

1. 17m45s~25m first-play sector budget
2. Cutter visual fatigue
3. same Wind cycle repetition
4. 2P cross-rope Cutter behavior
5. vertical multiplayer pacing
6. Foundation route efficiency gaps

---

## 29. Final Recommendation

Sector 04의 레벨 기획은 다시 갈아엎을 필요가 없다.

현재 최선의 판단:

```text
KEEP
4-1 ~ 4-8 gameplay progression

KEEP
Story disclosure order

KEEP
Cutter / Wake / Patrol reuse strategy

KEEP
4-8 Boss boundary
```

바꿔야 하는 것은:

```text
CURRENT RUNTIME과 어긋난 문서
+
4-1 한 개의 invalid Flow link
+
Cutter presentation readiness
```

이다.

### 다음 작업

Sector 05 Master Planning으로 바로 넘어가기 전에:

```text
SECTOR 04 ALIGNMENT PATCH PACKAGE
```

를 먼저 만드는 것을 권장한다.

패키지 범위:

```text
4-1 REV1.1 patch
4-2 metadata patch
4-3/4-5/4-7/4-8 Wind patch
Sector04 Master revision
scenario-development-integration revision
```

그 뒤 Sector04를:

```text
CROSS-REVIEWED
+
GRAYBOX HANDOFF READY
```

상태로 잠그고 Sector05로 넘어가는 것이 가장 안전하다.

---

## OPEN QUESTIONS

### 1. Sector04 Strength 360

360을 initial hypothesis로 유지할지,
first graybox에서 500 / 600 / 800까지 비교할지 결정 필요.

권장:

```text
360
500
800
```

3-point spike.

단 Stage별로 서로 다른 strength를 먼저 만들지 않는다.

### 2. Falloff

Sector04 REV1:

```text
falloff 0
```

권장.

필요 시 first graybox 후 64~80px 추가.

### 3. Wind Shadow

현재 capability는 존재.

Sector04 first graybox에서는 dedicated blocker를 쓰지 않는 것을 권장.

4-7 Junction에서 나중에 공간적 깊이를 추가하고 싶을 때 후보.

### 4. Cutter Positive Opt-in

현재:

```text
rules.includes("cutter-fire")
```

이 유일한 capability switch다. 과거 `no-rope-cut` 부재 기반 opt-out 제안은 폐기됐다.

### 5. Sector04 Timer

Full-sector graybox 기록 전 Final 수치 LOCK 금지.

### 6. Post-Sector04 Boss

4-8 이후 가장 큰 Product Gate.

Sector05를 실제 연결하기 전 반드시 별도 결정.

---

SECTOR 04 — INTEGRATION CROSS-VALIDATION AUDIT · REV 1.0

**FINAL STATUS: CONDITIONAL PASS — STAGE DESIGN COHERENT; DOCUMENTATION / RUNTIME ALIGNMENT PATCH REQUIRED BEFORE SECTOR 04 RUNTIME INTEGRATION**
