# SECTOR 04-2 — CUTTER LINE

*BLOCKOUT CANDIDATE · REV 1.2 — GATE COORDINATE FIX / BUILD METADATA ALIGNMENT*

◀ PREV — [SECTOR 04-1 / TRANSIT INTAKE](../4-1/README.md) · NEXT — [SECTOR 04-3 / FREIGHT BYPASS](../4-3/README.md) ▶

`SECTOR 04 TRANSIT / INFRASTRUCTURE` · `STAGE 02` · `FIRST ROPE-CUT TUTORIAL` · `MOMENTUM INTERRUPTION / RECOVERY`

| 항목 | 기준 |
|---|---|
| Status | HYPOTHESIS — BLOCKOUT CANDIDATE |
| Difficulty | ★★★ |
| Expected First Playtime | 130–185 sec |
| Expected Skilled Clear | 50–75 sec |
| Enemy | Sentry T1 ×1 — STATIONARY |
| Cutter Fire | FIRST ACTIVE USE |
| Patrol | NONE |
| Transit Wake / Wind | NONE |
| Scanner | NONE |
| Moving Platform / Train Collision | NONE |
| New Player Input | NONE |
| New Rope Mode | NONE |
| New Augment | NONE |
| Artifact Reward | NONE |
| Required Kill | NONE |
| Design Checkpoint / Reward | NONE |
| Boss | NONE |
| Design Carry Build | Foundation KEEP — CURRENT RUNTIME; First Specialization — CONTENT BLOCKED (selection pool TBD) |
| Primary Role | Rope Cut의 원인·텔레그래프·0.6s 복구를 처음 학습 |
| Primary Space | Protected Transit Security Line / Cutter Rail Node |
| Exit | Reach Final Deck → Gate Panel → Gate Open → Physical Crossing |
| Runtime Status | Sector 04 standalone catalog AUTHORED & VALIDATED (4-1~4-8) — 메인 월드 NOT CONNECTED |
| Art Status | Cutter gameplay presentation PROTOTYPE REQUIRED / Approved Art HOLD |

---

## 0. 기획 기준

### LOCKED FOR THIS STAGE

4-2는 Sector 04의 첫 **Interruption** Stage다.

4-1:

```text
MOMENTUM
```

을 먼저 즐겼다.

4-2:

```text
MOMENTUM
→
CUT
→
BRIEF ROPE DISABLE
→
RECOVER
→
RE-ATTACH
```

를 처음 학습한다.

### Core Question

> **“Rope가 끊겼을 때 당황하지 않고 다음 연결을 만들 수 있는가?”**

### First Lesson

Cutter의 정답은:

```text
Rope를 쓰지 않는다
```

가 아니다.

정답은:

```text
TELEGRAPH READ
→
LINE / RELEASE CHOICE

or

CUT
→
RECOVER
→
RE-ATTACH
```

다.

### 금지

- Cutter를 사실상 즉사 공격으로 만들기
- Rope Cut 후 긴 입력 금지
- Cutter + Wind 동시 학습
- Cutter + Patrol 동시 학습
- New Input
- Parry
- Shield
- Rope Mode Switch
- Scanner
- Moving Platform
- Kill Gate
- 특정 Build 요구
- Lower Feeder Isolation Story Reveal

---

## 0-1. 최신 GitHub / Runtime 교차검증

### VERIFIED — CURRENT MAIN AT AUTHORING

이 Stage 초안 작성 시점 `main`:

```text
cab469f1b1bb5444bf521d2bc0a4a2bc402de0fc
```

이 값은 **AUTHORING SNAPSHOT**으로 보존한다.

### VERIFIED — CURRENT MAIN AT RUNTIME RE-ALIGNMENT

문서 반영 시점 재확인한 최신 `main`:

```text
cb38a2c7fd5246f163cad633a9fde8c2f90f630b
```

AUTHORING SNAPSHOT 이후 Rope / Combat Runtime을 바꾸는 대규모 변경이 병합됐다:

```text
commit 904a328
"Make rope mastery and Foundation the sole core progression loop"
```

핵심 변경:

```text
Rope Attach
= fixed 440px candidate scoring
→ deterministic Hook Flight (hookSpeed 1400 × 2/7s = 400px reach)

Artifact 체크포인트 보상 시스템
= 전체 제거

Enemy Combat Balance
= 재조정 (Attack Range / Fire Interval / Projectile Speed 등)
```

아래 §0-1 VERIFIED — CURRENT ROPE / COMBAT는 **RUNTIME RE-ALIGNMENT 시점 값으로 갱신**했다. AUTHORING SNAPSHOT 당시 값과 다르면 이 갱신이 우선한다.

현재 관련 병합:

```text
PR #479
Sector 04 Transit / Infrastructure Master Plan

PR #481
4-1 TRANSIT INTAKE
```

까지 `main`에 반영됐다.

### Current Scenario State

현재 GitHub Master에는:

```text
4-1 TRANSIT INTAKE
4-2 CUTTER LINE
...
4-8 TRANSIT CONTROL TRUNK
```

8 Stage 역할이 정의돼 있다.

현재:

```text
4-1 detailed README
= MERGED / REV 1.0

4-2 detailed README
= 없음
```

따라서 본 문서는
현재 GitHub 4-1을 직접 PREV로 사용하는
4-2 첫 상세 Stage 후보.

### VERIFIED — 4-1 → 4-2 HANDOFF

현재 병합된 4-1 Exit Preview:

```text
INFRASTRUCTURE SECURITY
ACTIVE

SERVICE LINE
AHEAD
```

4-2 Entry:

```text
INFRASTRUCTURE SECURITY
ACTIVE
```

로 바로 이어진다.

즉 4-1에서 예고만 하고
4-2에서 실제 Security Threat를 처음 보여준다.

---

### VERIFIED — CURRENT ROPE / COMBAT (RUNTIME RE-ALIGNMENT)

```text
Hook Speed                 1400 px/s
Hook Flight Ratio          2/7 sec
Rope Max Attach Distance   400   ← hookSpeed × 2/7, more no longer a fixed constant
Hook Reload                0.20 sec
Attach Buffer              0.10 sec
Swing Impulse              780

Enemy Attack Range         760   ← was 520
Acquire                    0.25 sec
Track                      0.80 sec
Lock                       0.20 sec
Fire Flash                 0.08 sec
Enemy Fire Interval        1.00 sec   ← was 1.40 sec
Enemy Projectile Speed     520   ← was 260 (2배)
Enemy Projectile Radius    7
Enemy Projectile Damage    20
Player Weapon Range        320
Rope Disabled On Cut       0.60 sec
```

Attach는 더 이상 순간 판정이 아니라 `RopeLauncher.js`가 관리하는 Hook Flight(발사 → 최대 2/7초 비행 → 도달/실패)다. `owner.ropeDisabledRemaining <= 0` 조건이 새 Hook 발사 자체를 막는 게이트로 유지되므로(`RopePointerInput.js`), Rope Cut 후 0.60초 동안 재발사가 불가능하다는 이 Stage의 핵심 학습은 그대로 유효하다.

### Cutter Pre-fire Baseline

첫 Projectile spawn 전 상태:

```text
ACQUIRE
0.25

→ TRACK
0.80

→ LOCK
0.20

→ FIRE
```

합계:

```text
1.25 sec
```

Current generic attack-cycle baseline.

이 1.25초를
Cutter의 **독특한 Presentation Telegraph**에 매핑해야 한다.

정확한 최종 VFX timing은
아직 Production LOCK 아님.

---

## 0-2. 현재 Rope-Cut 구현의 정확한 의미

### VERIFIED — Enemy Projectile Capability

현재 Enemy projectile 생성:

```text
canCutRope
=
!enemy.rules.includes("no-rope-cut")
```

즉 현재 Runtime은
명시적 positive Cutter rule이 아니라:

```text
no-rope-cut 부재
```

로 Rope Cut capability가 켜진다.

### VERIFIED — Rope Collision

Projectile이:

```text
Player Rope Attachment Point
→
Rope Anchor
```

segment와 Projectile Radius 안에서 겹치면:

```text
rope-cut
```

resolution.

### IMPORTANT — Cutter는 Rope를 직접 조준하지 않는다

Current Enemy AI는:

```text
PLAYER POSITION
```

을 조준한다.

즉:

```text
canCutRope = true
```

라고 해서 Projectile이
자동으로 Rope Line을 찾아 쏘는 것이 아니다.

Rope Cut은:

```text
Projectile trajectory
INTERSECTS
current Rope segment
```

할 때 발생한다.

### DESIGN CONSEQUENCE

4-2는:

```text
아무 Sentry나 놓고
“이제 Rope를 잘 자른다.”
```

고 가정하면 안 된다.

따라서 첫 Tutorial Geometry에서:

```text
SENTRY
→
CUTTER ANCHOR
→
PLAYER NOMINAL LINE
```

을 의도적으로 정렬한다.

---

## 0-3. Rope Cut vs Body Hit

### VERIFIED — Collision Priority

Current prediction collision은:

```text
ropeHit
```

을 먼저 계산.

그리고:

```text
bodyHit
=
!ropeHit
&& body overlap
```

이다.

따라서 같은 Projectile이 Rope와 Body 둘 다 위협할 때
Rope collision이 먼저 성립하면:

```text
ROPE CUT
```

로 처리.

### VERIFIED — Rope Cut Result

Rope Cut:

```text
Rope Detach
+
Swing Drag Clear
+
Rope Disabled 0.60 sec
```

### Health

Authority victim transition은
rope-cut branch에서 Health damage 전에 return한다.

따라서 현재 의도:

```text
ROPE CUT
= NO BODY DAMAGE

but

ROPE unavailable
for 0.60 sec
```

### Body Hit

Rope와 만나지 않고 Body에 맞으면:

```text
20 Damage
+
Knockback
```

일반 Projectile body-hit 결과.

### Tutorial Requirement

첫 Cutter Line은
가능한 한:

```text
ROPE HIT
```

을 우선 경험하게 하고,

```text
BODY HIT
```

이 첫 학습의 주 결과가 되지 않게
Geometry를 정렬한다.

### VERIFIED — Current Rope-Cut HUD

현재 Renderer는 rope-cut event 발생 시:

```text
로프 절단!

재연결까지 X.X초
```

를 표시한다.

이 Feedback은 약 0.8초 동안 표시되며
현재 0.60초 Rope Disable 상태를 직접 알려준다.

따라서 4-2에서:

```text
별도 tutorial modal
```

을 추가하지 않는다.

기존 Rope-Cut HUD
+
Recovery Deck
+
Cutter-specific projectile telegraph

세 요소로 학습시킨다.

---

## 0-4. Runtime Hardening Gate

### VERIFIED CODE-PATH DIFFERENCE

현재 Owner predicted rope-cut path:

```text
releasePlayerRope(
    transferAngularMomentum: true
)
```

를 사용.

반면 Authority / victim impact transition은:

```text
rope.detach()
+
ropeDisabledRemaining = 0.60
```

형태의 직접 detach path가 존재한다.

### 현재 판정

```text
BUG CONFIRMED
```

라고 단정하지 않는다.

Prediction claim / reconcile 전체 과정에서
결과가 수렴할 수 있다.

하지만 Cutter는 Sector 04 Core Threat이므로
Production 전에 반드시:

```text
post-cut velocity
angular velocity
rope state
ropeDisabledRemaining
```

Authority / Owner Prediction parity test가 필요하다.

### PASS 전

```text
CUTTER RUNTIME
= CAPABILITY VERIFIED
  PRODUCTION HARDENING REQUIRED
```

로 표기.

---

## 0-5. Reference Transfer

### SANABI — TRANSFER

공식 소개는 같은 Chain-hook으로:

```text
movement
+
bullet / trap traversal
+
enemy defeat
```

을 연결한다.

4-2 Transfer:

> Bullet이 Rope 게임을 중단시키는 별도 미니게임이 아니라
> **Rope를 언제 유지·놓고·다시 붙일지** 바꾸게 해야 한다.

### Rusted Moss — TRANSFER

한 grapple core를 중심으로
같은 Challenge에 여러 해결을 허용한다.

4-2에서 허용:

```text
Telegraph를 읽고 Release

Rope Line을 바꿔 Shot을 빗나가게 함

Cut을 감수하고 Recovery Deck 사용

숙련자는 Cutter zone을 빠르게 Chain
```

### Celeste / N — TRANSFER

처음 보는 강한 상태 변화는:

```text
읽을 수 있고
실패 후 즉시 다음 행동이 보이고
긴 리셋이 없어야 한다.
```

---

## 1. 한 줄 정의

4-1에서 긴 Transit Rope Flow를 경험한 Player가
첫 **Protected Transit Security Line**에 진입해,
Safe Observation Deck에서 Stationary Sentry의 Cutter Telegraph를 읽고,
Sentry와 거의 일직선으로 배치된 C1 Cutter Anchor에 Rope를 연결하면서
**Projectile이 Player가 아니라 현재 Rope Segment를 먼저 가로지를 수 있음**을 경험한 뒤,
Cut을 맞아도 0.60초 동안 R1 Recovery Deck으로 떨어져 살아남고,
두 번째 C2에서 Release / Rope Line / Recovery 선택을 다시 적용한 후
Threat가 없는 Upper Exit Flow로 빠져나가는 첫 Rope-Cut Tutorial Stage.

---

## 2. 전체 게임에서의 역할

### 2-1. First True Rope Interruption

이전 Projectile:

```text
BODY THREAT
```

중심.

4-2:

```text
ROPE STATE THREAT
```

가 처음 명확하게 등장.

### 2-2. Sector 04의 문법 확립

Sector 04의 핵심:

```text
MOMENTUM
→ INTERRUPTION
→ RECOVERY
→ MOMENTUM
```

중:

```text
INTERRUPTION
+
RECOVERY
```

를 처음 학습.

### 2-3. 4-3 준비

4-3에서는:

```text
CUTTER
+
TRANSIT WAKE
```

가 결합된다.

따라서 4-2는
Wind 없이 Cutter만 이해시킨다.

---

## 3. Story 역할

새 대형 Plot Reveal 없음.

### S0 — Entry

```text
INFRASTRUCTURE SECURITY

ACTIVE
```

### S1 — Cutter Node

```text
STRUCTURAL ACCESS LINE

PROTECTED
```

### S2 — Exit

```text
FREIGHT BYPASS

PRESSURE SERVICE
AHEAD
```

### Story Function

Commercial Security가 끝난 것이 아니라
도시 Backbone 내부에도:

```text
Infrastructure Security
```

가 살아 있다는 정도만 확인.

### 금지

- Lower Ascent Feeder Isolation
- Upper vs Lower causal comparison
- Group A/B/C mapping
- Corporate order
- intentional sacrifice

---

## 4. 공간 콘셉트

### PROTECTED TRANSIT CUTTER LINE

하나의 Stationary Cutter Sentry가
Transit maintenance brace에 고정.

그 주변에:

```text
C1
C2
```

두 개의 Grapple Brace가 있다.

### 공간 구조

```text
SAFE OBSERVATION
→
CUTTER LINE 1
→
SAFE RECOVERY
→
CUTTER LINE 2
→
SAFE UPPER FLOW
→
GATE
```

### 중요한 차이

4-1:

```text
wide open backbone
```

4-2:

```text
narrow protected security rail
```

공간 압축.

그래서 같은 Transit Sector 안에서도
Stage silhouette가 다르다.

---

## 5. Pixel / Grid 기준

### Base

```text
32×32
```

### Map

```text
WIDTH
1280 px

X
-640 ~ +640

HEIGHT
1312 px

Y
0 ~ -1312
```

### Cutter Tutorial Scale

첫 Cutter Zone은
화면 한 장 안에서:

- Sentry
- current Rope
- Cutter Anchor
- Recovery Deck

이 같이 읽히는 크기.

### Cutter Visual Priority

```text
Rope Cyan
vs
Cutter Hot Orange / White
```

명확히 분리.

---

## 6. 전체 맵 구조

```text
Y 0

P0 ENTRY
   \
    A0
      \
       P1  SAFE OBSERVATION
          \
           C1  ← FIRST CUTTER LINE
            \    [S1 CUTTER SENTRY]
             \
             R1 SAFE RECOVERY

                 C2 ← SECOND CUTTER LINE
                /
              P2 SAFE RECOVERY

                 A3
                  \
                   P3
                  /
                A4
                  \
                  P4 FINAL SAFE DECK
                     PANEL / GATE

Y -1312
```

### Cutter Core

```text
C1
S1
C2
```

가 하나의 Cutter Rail Assembly로 보인다.

---

## 7. Zone 구성

### Z0 — Warm Entry

```text
Y 0 ~ -192
```

P0 → A0 → P1.

Enemy activation 없음.

4-1의 Flow를 짧게 한 번 유지.

### Z1 — Safe Cutter Observation

P1.

보여야 함:

- S1
- C1
- R1
- Cutter charge state
- Rope-safe recovery direction

P1은:

```text
S1 activation OUTSIDE
```

### Z2 — First Cutter Line

P1 → C1.

Player가 Cutter activation 안으로 진입.

S1:

```text
ACQUIRE
→ TRACK
→ LOCK
→ FIRE
```

처음 읽음.

C1 nominal line은
Sentry shot이 Rope near-anchor를 가로지르기 쉽게 정렬.

### Z3 — R1 Recovery

Cut 발생 시:

```text
0.60 sec Rope Disabled
```

동안 낙하를 받아준다.

R1:

```text
S1 activation OUTSIDE
```

목표.

Player가 여기서:

> “잘렸지만 바로 다시 할 수 있다.”

를 이해.

### Z4 — Second Cutter Application

R1 → C2 → P2.

이번에는 Player가:

- Cutter charge를 읽고 Release
- Rope line을 흔들어 trajectory를 바꿈
- Cut을 감수하고 P2로 Recover

중 하나를 선택.

### Z5 — Threat Exit

P2 → A3 → P3 → A4 → P4.

S1 activation 밖.

Enemy 없음처럼 느껴지는
짧은 Flow Recovery.

4-3으로 넘어가기 전
다시 Rope 감각을 정상화.

---

## 8. 좌표 / 오브젝트

모두:

```text
HYPOTHESIS — BLOCKOUT
```

### 8-1. Landing / Recovery

| ID | Center | Size | Role |
|---|---:|---:|---|
| P0 | `(-480, 0)` | `320×32` | Entry |
| P1 | `(-256, -192)` | `320×32` | Safe Observation |
| R1 | `(-288, -576)` | `256×24` | First Cut Recovery |
| P2 | `(-224, -800)` | `288×24` | Second Recovery |
| P3 | `(+224, -1056)` | `224×16` | Upper Flow Landing |
| P4 | `(+256, -1248)` | `416×32` | Final Safe Deck |

### 8-2. Grapple Targets

| ID | Position | Role |
|---|---:|---|
| A0 | `(-352, -128)` | Warm-up |
| C1 | `(+32, -448)` | Cutter Anchor 1 |
| C2 | `(-32, -621)` | Cutter Anchor 2 |
| A3 | `(+64, -992)` | Upper Exit Anchor |
| A4 | `(+64, -1168)` | Final Flow Anchor |

### 8-3. Cutter Sentry

```text
S1
(+92, -501)
```

Type:

```text
sentry-t1
```

Stationary.

### 8-4. Activation Bounds

HYPOTHESIS:

```text
X -96 ~ +256
Y -880 ~ -240
```

즉:

```text
P1 OUTSIDE
R1 OUTSIDE
P2 OUTSIDE

C1 COMMIT REGION
C2 COMMIT REGION
```

### 8-5. Gate

```text
Panel
(+352, -1248)

Gate
(+464, -1248)
```

완전 Safe.

S1 attack range / activation 밖.

---

## 9. Safe Route

### Route

```text
P0
→ A0
→ P1
→ C1
→ R1
→ C2
→ P2
→ A3
→ P3
→ A4
→ P4
```

### Pre-check Distance

| Link | Distance |
|---|---:|
| P0 → A0 | `181.0 px` |
| A0 → P1 | `115.4 px` |
| P1 → C1 | `385.3 px` |
| C1 → R1 | `344.7 px` |
| R1 → C2 | `259.9 px` |
| C2 → P2 | `262.5 px` |
| P2 → A3 | `346.1 px` |
| A3 → P3 | `172.3 px` |
| P3 → A4 | `195.3 px` |
| A4 → P4 | `208.0 px` |

### Result

```text
MAX SAFE LINK
= 385.3 px

ROPE MAX (RUNTIME RE-ALIGNMENT)
= 400 px   ← was 440 px at authoring time
```

Mandatory range margin:

```text
14.7 px   ← was 54.7 px at authoring time
```

### IMPORTANT — Margin Tightened by Runtime Re-Alignment

Hook Reach가 440→400으로 줄면서 P1→C1(385.3px)의 여유가
54.7px에서 14.7px로 크게 줄었다.

여전히 PASS(385.3 < 400)이지만
Runtime graybox 단계에서 이 Link를 최우선으로 재검증한다.

필요하면:

```text
P1 또는 C1을
16~24px 정도 서로 가깝게 조정
```

을 검토하되, 이는 Geometry 변경이므로
이 문서에서 좌표 자체를 미리 확정하지 않는다.

### Physics Contract

Runtime graybox에서:

```text
swingImpulse = 0
```

Safe Route 통과 확인.

Cut recovery를 위해
Impulse bonus를 요구하지 않는다.

---

## 10. Flow Route

### Skilled Path

```text
P0
→ A0
→ P1
→ C1
→ C2
→ A3
→ A4
→ P4
```

### Meaning

R1 / P2를 건너뛰면:

```text
CUTTER ACTIVATION
```

안에 더 오래 머문다.

즉 Flow Route는:

```text
faster
but
higher Cutter commitment
```

### Max Link

```text
C2 → A3
≈ 383.2 px

P1 → C1
≈ 385.3 px
```

400 미만(RUNTIME RE-ALIGNMENT 기준, was 440). 두 Link 모두 여유가 16.8px / 14.7px로 줄었으므로 §9의 Runtime graybox 재검증 대상에 포함한다.

### Skill Expression

- Release before Cutter shot
- keep line away from projectile
- C1 → C2 quick relay
- fast exit from activation

---

## 11. Cutter Geometry

### FIRST LINE — C1

Nominal Geometry:

```text
P1
(-256, -192)

↓

C1
(+32, -448)

↓

S1
(+92, -501)
```

S1 → P1 shot segment와
C1 point의 perpendicular miss distance:

```text
≈ 0.2 px
```

즉 **nominal entry line에서는 사실상 정렬**.

### Projectile Travel to C1

S1 → C1:

```text
≈ 80 px
```

Current Projectile Speed (RUNTIME RE-ALIGNMENT):

```text
520 px/s   ← was 260 px/s at authoring time
```

대략:

```text
0.15 sec   ← was 0.31 sec
```

shot 이후 Rope near-anchor에 도달.

Generic pre-fire:

```text
1.25 sec
```

이므로 nominal total:

```text
~1.40 sec   ← was ~1.56 sec
```

Acquire 시작 후 Cut zone 도달 후보.

Projectile Speed가 2배로 빨라지면서
Release 판단에 필요한 반응 여유가 줄었다.
C1 Telegraph(Acquire/Track/Lock 1.25초 자체는 불변)를
Runtime graybox에서 실제로 충분히 읽히는지 우선 재검증한다.

### IMPORTANT

Player는 움직인다.

따라서:

```text
GUARANTEED CUT
```

은 아니다.

의도:

- 가만히 Rope를 오래 유지하면 Cut 가능성 높음
- Release / Arc change로 회피 가능
- Cut돼도 Recovery 가능

### SECOND LINE — C2

Nominal:

```text
S1
→ C2
→ P2
```

도 거의 직선.

C2 point의 nominal miss:

```text
≈ 2 px
```

따라서 두 번째 구간에서도
Player가 P2 방향으로 Rope를 오래 유지하면
Cutter line이 다시 Rope를 통과할 가능성이 높다.

### 핵심

Cutter Tutorial은:

```text
random rope collision
```

에 의존하지 않고
Level Geometry로 collision 확률을 높인다.

---

## 12. Cutter Timing / Player Choices

### Generic Current Baseline

```text
ACQUIRE 0.25
TRACK   0.80
LOCK    0.20
FIRE
```

### Player Choice A — Release

LOCK / Fire 전에:

```text
release
→ move off line
→ R1 / P2
```

### Choice B — Change Rope Line

Swing arc로
Player–Anchor segment angle을 바꿈.

Projectile은
마지막 lock direction으로 진행.

### Choice C — Take the Cut

```text
CUT
→ 0.60 sec Rope Disabled
→ fall
→ Recovery Deck
→ Re-attach
```

유효.

### Wrong Lesson 금지

```text
“Cutter는 무조건 맞아야 한다.”
```

아님.

또:

```text
“Cutter가 쏘면 Rope를 쓰면 안 된다.”
```

도 아님.

---

## 13. Recovery

### Current Forced Disable

Rope Cut 후:

```text
0.60 sec
```

새 Attach가 차단된다.

Current Rope input은 실제 attach 조건에:

```text
owner.ropeDisabledRemaining <= 0
```

을 요구한다.

따라서 이 0.60초는 단순 VFX가 아니라
실제 Gameplay Disable window다.

따라서 Recovery Deck은
**Disable window 자체를 공간으로 흡수**해야 한다.

### R1

C1 아래 / 왼쪽.

첫 Cut 후:

```text
fall
→ R1
```

후보.

### P2

두 번째 Cutter line 뒤.

### Recovery Target

Cut event 후:

```text
≤ 2.0 sec
```

안에:

- R1 / P2 landing
- Rope control recovery
- next attach decision

중 하나.

### Full-stage Fall

C1 Cut 한 번으로:

```text
P0
```

까지 돌아가면 FAIL.

### Body Hit

Body hit은:

```text
20 damage
+
knockback
```

이므로 Recovery 결과가 더 거칠다.

첫 Tutorial에서 Body Hit 비율이
Rope Cut보다 높으면
Cutter geometry / telegraph를 다시 조정.

---

## 14. Enemy / Threat

### Enemy

```text
Sentry T1 ×1
```

Stationary.

Patrol 없음.

### Current Runtime Rope-Cut Enable

현재 기술적으로:

```text
rules
DO NOT include
"no-rope-cut"
```

이면 Projectile:

```text
canCutRope = true
```

### Design Intent Tag

Stage Data에서는:

```text
cutter-fire
```

를 명시적 **design / presentation intent tag**로 표기할 수 있다.

하지만 현재 `EnemyObject`가
`cutter-fire`를 capability switch로 읽는다고
가정하지 않는다.

### Recommended Production Hardening

Sector 04 integration 전:

```text
explicit rope-cut opt-in rule
```

로 바꿀지 검토.

목적:

다른 Enemy에서 실수로
`no-rope-cut`가 빠져 Cutter가 되는 것을 방지.

### Kill

Optional.

### Important Range Design

Safe Deck:

```text
P1
R1
P2
```

와 S1 거리는
대략:

```text
465
387
435 px
```

Player Weapon Range:

```text
320
```

보다 큼.

따라서 Safe Observation에서
자동 사격으로 S1이 Tutorial 전에 죽는 문제를 줄인다.

Enemy Attack Range(RUNTIME RE-ALIGNMENT):

```text
760   ← was 520
```

이므로 Commit Zone에서는
S1이 충분히 target 가능.

---

## 15. Camera

모두 HYPOTHESIS.

### C0 — Entry

P0 / A0 / P1.

```text
Desktop 1.00
Mobile 0.72
```

### C1 — Cutter Read

P1 / C1 / S1 / R1
동시 가시.

```text
Desktop 0.92
Mobile 0.70
```

가장 중요.

### C2 — Second Cutter

R1 / C2 / S1 / P2.

```text
Desktop 0.92
Mobile 0.70
```

### C3 — Exit Flow

P2 / A3 / P3 / A4.

```text
Desktop 0.95
Mobile 0.72
```

### C4 — Gate

P4 / Panel / Gate.

```text
Desktop 1.00
Mobile 0.72
```

### Camera Rule

Cutter Projectile이
off-screen에서 날아오면 FAIL.

항상 Fire 전에:

```text
S1
+
current Rope
+
Recovery
```

를 읽을 수 있어야 한다.

---

## 16. Pixel Art Asset Spec

### Cutter Sentry

Underlying Enemy:

```text
Sentry T1
```

실루엣 reuse 가능.

하지만 Cutter-enabled presentation은
일반 Sentry와 즉시 구별 필요.

후보:

- hot orange cutter core
- split emitter prongs
- thin white charge line
- segmented projectile trail

### Cutter Projectile

Current gameplay radius:

```text
7 px
```

Presentation은 실제 hit radius보다
지나치게 작아 보이면 안 된다.

### Anchor C1 / C2

Cutter Rail Assembly 소속처럼 보이되:

```text
Anchor = still grappleable
```

가 가장 먼저 읽혀야 한다.

### Recovery Deck

R1 / P2는
안전 착지라는 Silhouette.

Danger Red 남발 금지.

---

## 17. Background

### Environment

- protected rail spine
- transit security conduit
- power cable chamber
- maintenance brace
- distant freight bypass

### Motion

4-2는 Wake 없음.

Far Background motion도
4-1보다 약간 줄인다.

Player 시선이:

```text
Sentry / Rope / Projectile
```

에 집중되게 한다.

### No Moving Gameplay Surface

유지.

---

## 18. Sound / VFX

### Cutter Charge

Current attack state에 맞춰
고유 cue 필요.

#### Acquire

```text
low scan chirp
```

#### Track

```text
rising cutter whine
```

#### Lock

```text
short hard tone
```

#### Fire

```text
sharp slicing transient
```

### Rope Cut

Current HUD:

```text
로프 절단!
재연결까지 X.X초
```

는 이미 존재.

추가 Stage-specific presentation:

- Rope visual snap
- short cyan fragment / retract
- cutter hit spark
- distinct cut audio

### Important

Cut feedback가 강해도:

```text
0.60 sec recovery
```

동안 Player가 다음 Landing을 볼 수 있어야 한다.

Long hit-stop / long screen shake 금지.

Existing countdown이 있으므로
화면 중앙을 막는 별도 Tutorial Modal도 금지.

### Body Hit Distinction

Body hit은
기존 impact / knockback family.

Rope Cut과 다른 sound.

---

## 19. Implementation Notes

### Runtime IDs

Prefix:

```text
sector-04-02:*
```

### Candidate Surface IDs

```text
sector-04-02:p0
sector-04-02:p1
sector-04-02:r1
sector-04-02:p2
sector-04-02:p3
sector-04-02:p4

sector-04-02:a0-surface
sector-04-02:c1-surface
sector-04-02:c2-surface
sector-04-02:a3-surface
sector-04-02:a4-surface
```

### Cutter Sentry Object

Concept:

```js
worldObject(
    "sector-04-02:cutter-sentry-01",
    "sentry",
    92,
    -501,
    {
        enemyType: "sentry-t1",

        activation: {
            x: -96,
            y: -880,
            width: 352,
            height: 640
        },

        rules: [
            "cutter-fire",
            "target-lock-cycle",
            "activation-band-only"
        ]
    }
)
```

### IMPORTANT — Current Runtime

`cutter-fire`:

```text
PRESENTATION / DESIGN INTENT
```

이며 현재 capability gate로 검증된 rule이 아니다.

현재 Rope Cut enable은:

```text
"no-rope-cut" absent
```

에 의존.

### No LOS Rule

```text
cover-ends-los
```

사용하지 않는다.

첫 Cutter Tutorial은
Cover Puzzle이 아니다.

### Objective / Gate

P4 reach:

```text
final-deck-reached
```

후 Panel interact.

Gate는 Threat 밖.

---

## 20. Multiplayer

### Shared Sentry

S1은 한 번에
Current Enemy targeting contract에 따라
한 Player를 lock.

### Tutorial Meaning

두 Player가 동시에
반드시 한 번씩 Cut돼야 하는 Stage가 아니다.

관찰만으로도 Rule을 이해할 수 있어야 한다.

### Safe Observation

P1 / R1 / P2는
Activation 밖.

한 Player가 Safe Deck에서 기다리는 동안
다른 Player가 Cutter Line을 시험 가능.

### Cross-Rope Risk

Cutter Projectile은
실제 Rope Segment collision을 검사하므로
Target Player가 아닌 Partner Rope를
우발적으로 가로지를 가능성을
Prototype에서 확인해야 한다.

### Required 2P Test

```text
Player A
C1 active

Player B
R1 / P1 safe

→ Cutter projectile path
→ B rope / body unexpected collision?
```

확인.

FAIL이면:

- activation
- Sentry position
- safe deck lateral offset
- projectile lane

순으로 Geometry 조정.

### Gate

기존:

```text
shared open
individual crossing
```

계약.

---

## 21. Playtest Metrics

### Cutter Read

Current Run Metrics는 이미:

```text
ropeCuts
```

를 추적한다.

4-2 Stage instrumentation에서 추가로:

```text
first S1 acquire seen
first Cutter fire seen
first rope-cut
first body-hit
first voluntary release
```

를 계측 후보로 둔다.

### Recovery

```text
rope-cut → landing time
rope-cut → next successful attach time
rope-cut → death
rope-cut → P0 reset
```

### First Tutorial Outcome

목표:

```text
first rope-cut > first body-hit
```

비율이 높아야 한다.

첫 경험 대부분이 Body Hit이면
C1 alignment 실패.

### Learning

두 번째 C2에서:

```text
release-before-fire
line-change
cut-and-recover
```

어떤 행동이 늘어나는지 기록.

### Kill

Sentry kill timing.

Tutorial 전에 kill되는 비율이 높으면
S1 range / player weapon exposure 조정.

---

## 22. PASS Criteria

### Gameplay

- Sentry / Cutter / Recovery를 첫 화면에서 읽음
- Cutter Telegraph가 일반 Bullet과 구분됨
- C1 nominal geometry가 Rope Cut을 자주 유도
- Cutter가 자동 Rope-seeking이라고 오해시키지 않음
- Rope Cut 후 0.60s disable이 명확
- Cut 후 ≤2s recovery decision 가능
- no full-stage reset
- first experience가 body hit보다 rope cut 중심
- Safe Route max 385.3px
- Flow max 385.3px
- all mandatory < 400 (RUNTIME RE-ALIGNMENT; margin tightened to ~15px, graybox re-verify priority)
- `swingImpulse=0` Safe Route blockout PASS
- no new input
- no Build lock
- Kill Optional

### Runtime

- `canCutRope` current capability 확인
- `no-rope-cut` absence semantics 명시
- current rope-disable 0.60s 반영
- Cutter AI가 Player target임을 정확히 반영
- Authority / Prediction cut transition parity test 예정
- no moving platform dependency

### Story

확인:

```text
Infrastructure Security Active
```

미확인 유지:

```text
Lower Feeder Isolation
Group mapping
Corporate decision
```

### Multiplayer

- Partner safe deck가 accidental Cutter lane이 아님
- Shared Sentry 때문에 progression deadlock 없음
- Gate physical crossing 유지

---

## 23. FAIL Conditions

### Gameplay

- Cutter가 일반 Bullet처럼 보여 첫 Cut 이유를 모름
- Rope Cut이 20 Damage까지 동시에 적용되는 것처럼 연출
- Cut 후 0.60s 안에 attach UI가 계속 false 이유를 설명하지 못함
- Recovery Deck이 Projectile lane 안에서 계속 공격받음
- Rope를 안 쓰는 것이 최적
- Sentry를 Safe Deck에서 자동 사격으로 즉시 삭제
- Cut 하나로 P0까지 추락
- C1 geometry에서 Rope Cut이 거의 발생하지 않음
- Player Body Hit이 Tutorial의 주 학습이 됨

### Runtime

- `cutter-fire` rule이 이미 구현됐다고 거짓 가정
- `no-rope-cut`를 넣고 Cutter라고 부름
- Cutter projectile을 Rope-seeking homing으로 설명
- Rope Cut에서 body damage를 임의 추가
- Rope Disabled 0.60s를 문서에서 누락
- Prediction parity 검증 없이 production-ready 판정

### Progression

- Wind 추가
- Patrol 추가
- Scanner 추가
- Moving Platform 추가
- New Growth 추가
- Kill Gate 추가

### Story

- Lower Feeder Isolation 공개
- Group C와 Transit 연결 확정
- Corporate order 공개

---

## 24. Stage Data Concept

```js
{
    id: "sector-04-02",
    sectorId: "sector-04",
    order: 2,

    name: "CUTTER LINE",

    bounds: {
        width: 1280,
        height: 1312
    },

    entry: {
        x: -480,
        y: -32
    },

    surfaces: [
        "P0",
        "P1",
        "R1",
        "P2",
        "P3",
        "P4",
        "A0",
        "C1",
        "C2",
        "A3",
        "A4"
    ],

    enemies: [
        {
            id: "sector-04-02:cutter-sentry-01",
            enemyType: "sentry-t1",

            position: {
                x: 92,
                y: -501
            },

            activation: {
                x: -96,
                y: -880,
                width: 352,
                height: 640
            },

            rules: [
                "cutter-fire",
                "target-lock-cycle",
                "activation-band-only"
            ],

            ropeCutIntent: "ENABLED"
        }
    ],

    windZones: [],

    objectives: [
        "final-deck-reached",
        "exit-panel-engaged"
    ],

    nextAreaId: "sector-04-03"
}
```

### Important

Concept only.

현재 Runtime의 실제 Rope Cut capability는:

```text
ropeCutIntent
```

field나:

```text
cutter-fire
```

rule을 읽지 않는다.

Production integration에서는
현재 `no-rope-cut` absence semantics와
explicit opt-in hardening 결정에 맞춰
실제 data를 작성한다.

---

## 25. 아트 담당자 전달문

> **4-2는 Sector 04의 첫 Cutter Tutorial입니다. 화면에서 가장 중요한 것은 “어떤 총알이 나를 때리는가”가 아니라 “이 공격이 내 Rope Line을 자를 수 있다”는 점입니다. Stationary Sentry와 C1/C2 Grapple Brace를 하나의 Protected Rail Assembly로 묶되, Grapple Anchor 자체는 여전히 가장 명확한 Cyan gameplay target이어야 합니다. Cutter는 일반 Sentry Projectile과 다른 Hot Orange/White core, 독특한 charge cue와 slicing trail을 가져야 합니다. 첫 C1에서는 Sentry–Anchor–Player Line이 거의 일직선이라 Cut이 잘 발생하도록 설계되어 있으므로 이 방향성이 Camera에서 읽혀야 합니다. R1/P2 Recovery Deck은 위험색을 줄여 “잘려도 여기로 떨어지면 산다”는 Silhouette를 주세요. Final art는 Runtime Cutter Presentation과 Camera Zone이 고정되기 전까지 HOLD입니다.**

---

## 26. 개발자 최종 전달 요약

### Stage

```text
SECTOR 04-2
CUTTER LINE
```

### Enemy

```text
Sentry T1 ×1
Stationary
```

### Current Cutter Runtime

```text
canCutRope
=
"no-rope-cut" absent
```

Projectile:

```text
targets Player
NOT Rope
```

Rope intersection:

```text
→ rope-cut
→ Rope detach
→ Rope Disabled 0.60 sec
→ no body damage on rope-cut branch
```

### Tutorial Geometry

```text
P1
→ C1
→ R1

R1
→ C2
→ P2
```

S1:

```text
(+92, -501)
```

C1 nominal shot alignment:

```text
~0.2px line miss
```

C2 / P2 nominal:

```text
~2px line miss
```

### Recovery

```text
Cut
→ 0.60 sec free fall / Rope disabled
→ R1 or P2
→ re-attach
```

Target:

```text
≤ 2 sec decision
```

### Mandatory Geometry

```text
MAX
385.3 px

ROPE MAX (RUNTIME RE-ALIGNMENT)
400 px   ← was 440 px, margin now ~15px — graybox re-verify priority
```

### Do Not Add

- Wind
- Patrol
- Scanner
- Moving Platform
- new Input
- new Rope Mode
- new Growth
- Kill Gate

### Runtime Gate

Before Production Cutter lock:

```text
Authority / Owner Prediction
post-rope-cut state parity
```

test.

### Stage Feeling

> **“내 Rope도 공격받을 수 있다. 하지만 잘려도 게임이 끝나는 게 아니라, 바로 다음 Rope를 만드는 게 플레이가 된다.”**

---

## OPEN QUESTIONS

### 1. Explicit Rope-Cut Opt-in

Current:

```text
absence of no-rope-cut
```

로 capability 활성.

Sector 04 integration 전에:

```text
rope-cut-enabled
```

같은 positive authoring rule로 harden할지 결정.

새 Rule 이름 자체는 아직 LOCK하지 않는다.

### 2. Cutter Presentation Profile

`cutter-fire`를:

```text
renderer / projectile presentation tag
```

로 실제 구현할지 OPEN.

하지만 Player-facing visual distinction은 필수.

### 3. Authority / Prediction Momentum

Prediction path의:

```text
transferAngularMomentum: true
```

와 Authority victim detach 결과를
실제 parity test로 확인.

불일치 시
Cutter production 전에 수정.

### 4. C1 Cut Rate

Nominal line은 거의 완전 정렬.

하지만 실제 Player swing 때문에
Cut rate는 simulation-dependent.

Playtest 목표:

```text
first Cutter encounter에서
충분히 자주 Rope Cut을 보되
Release 회피도 가능
```

정확한 목표 비율은 OPEN.

### 5. C2 Role

두 번째 구간에서
Cut을 다시 강하게 유도할지,
숙련 Release Test에 더 가깝게 만들지
첫 C1 playtest 후 결정.

### 6. Two-player Cross-Rope

Cutter가 Target 외 Partner Rope를
실제로 자를 수 있는지
multiplayer prototype에서 확인.

### 7. 4-1 Runtime / Merge State

4-1 detailed design은 PR #481로 GitHub에 merge 완료.

현재 4-2는 4-1의:

```text
INFRASTRUCTURE SECURITY
ACTIVE

SERVICE LINE
AHEAD
```

Exit Preview와 정렬됐다.

향후 4-1 Runtime geometry가 실제 구현되면
Portal arrival / camera handoff만 다시 검증.

### 8. Runtime Re-Alignment — 4-1과 Rope Max 불일치 — RESOLVED

이 문서는 커밋 `904a328`(Hook Flight 전환, Rope Max 440→400, Enemy Combat 재조정) 이후 기준으로
§0-1 / §9 / §10 / §11 / §14를 갱신했다.

당시 이미 merge된 **4-1(PR #481)은 여전히 440px 기준**으로 작성돼 있었고,
4-1의 Safe Route MAX SAFE LINK는 374.5px(400 이내, 문제 없음), Flow Route MAX는
408.9px(400 초과)였다.

이후 재검증 결과 이 408.9px는 실제로는 문제가 아니었다. 4-1의 **Mandatory
Safe Route**는 같은 구간(A3→A4)을 `A3 → M1 → A4`로 우회해 400px 이내로
통과하며(4-1 §9), Flow Route는 4-1 문서 자체가 `OPTIONAL EXPRESSION`으로
명시한 skilled-only 지름길이라 Mandatory 진행에는 영향이 없다(4-1 §10). 좌표
수정은 필요하지 않았고, 실제 shipped `Sector04AreaCatalog.js`도 원래 좌표
그대로 구현·검증돼 있다. 4-1은 REV 1.1로 이 재검증 내용을 반영했다.

---

SECTOR 04-2 / CUTTER LINE — BLOCKOUT CANDIDATE · REV 1.2
