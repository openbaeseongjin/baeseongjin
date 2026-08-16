# SECTOR 04-7 — ISOLATION JUNCTION

*BLOCKOUT CANDIDATE · REV 1.2 — GATE COORDINATE FIX / 4-1 DRIFT FALSE ALARM RESOLVED*

◀ PREV — [SECTOR 04-6 / POWER RELAY SPAN](../4-6/README.md) · NEXT — [SECTOR 04-8 / TRANSIT CONTROL TRUNK](../4-8/README.md) ▶

`SECTOR 04 TRANSIT / INFRASTRUCTURE` · `STAGE 07` · `CUTTER + WAKE SYNTHESIS` · `ISOLATION STORY REVEAL`

| 항목 | 기준 |
|---|---|
| Status | HYPOTHESIS — BLOCKOUT CANDIDATE |
| Difficulty | ★★★★ |
| Expected First Playtime | 165–225 sec |
| Expected Skilled Clear | 70–100 sec |
| Enemy | Cutter Sentry T1 ×1 — STATIONARY |
| Patrol | NONE |
| Cutter Fire | ACTIVE |
| Transit Wake / Wind | Pulsed Wind ×1 — JUNCTION CROSS-FLOW |
| Scanner | NONE |
| Moving Platform / Train Collision | NONE |
| New Player Input | NONE |
| New Rope Mode | NONE |
| Foundation | CURRENT RUNTIME — selected Foundation KEEP |
| First Specialization | CONTENT BLOCKED / NOT REQUIRED |
| New Growth | NONE |
| Legacy Artifact Layer | REMOVED FROM CURRENT RUNTIME |
| Required Kill | NONE |
| Design Checkpoint / Reward | NONE |
| Boss | NONE |
| Primary Role | Cutter/Wake 숙련 Synthesis + Lower Ascent Feeder Isolation 확정 Reveal |
| Primary Space | Transit Isolation Junction / Cross-Flow Routing Spine |
| Exit | Reach Final Deck → Gate Panel → Gate Open → Physical Crossing |
| Runtime Status | Sector 04 standalone catalog AUTHORED & VALIDATED (4-1~4-8) — 메인 월드 NOT CONNECTED |
| Approved Gameplay Art | HOLD until Runtime Area / Camera Zone / Stable IDs exist |

---

## 0. 기획 기준

### LOCKED FOR THIS STAGE

4-7은 Sector 04의 Story Pressure Stage다.

Gameplay로는 이미 배운:

```text
CUTTER
+
TRANSIT WAKE
```

를 다시 쓰지만,
4-3의 복습이 아니라 **최종 숙련 Synthesis**여야 한다.

### Core Question

> **“같은 Wake가 진행 방향에 따라 도움과 방해로 바뀌어도, Cutter Line을 읽으며 Flow를 유지할 수 있는가?”**

### Stage Grammar

```text
SAFE JUNCTION READ
↓
WAKE ASSIST
↓
CUTTER + WAKE CROSS-CONTROL
↓
WAKE OPPOSE
↓
SAFE STORY REVEAL
↓
4-8
```

### Story Core

4-4:

```text
LOWER ASCENT FEEDER
STATUS: SEGMENTED
TELEMETRY: PARTIAL
```

4-7:

```text
LOWER ASCENT FEEDER
ISOLATED
```

까지 확정.

### 그러나 아직 확정하지 않는 것

```text
WHY isolated
WHO ordered it
WHEN exact isolation order happened
Group C suspension was caused by isolation
A/B used the upper trunk
company intentionally sacrificed lower sectors
```

### 금지

- Patrol 추가
- 두 번째 Cutter
- Scanner
- Moving Platform
- Moving Train collision
- New Input
- New Rope Mode
- New Growth
- Kill Gate
- Story Terminal interaction required
- Combat 중 긴 Story dump
- Group C 직접 인과
- Corporate decision 공개

---

## 0-1. 최신 GitHub / Runtime 교차검증

### VERIFIED — CURRENT MAIN AT AUTHORING

작성 시작 시점 최신 `main`:

```text
0d62593283a0002b8cb1cbef5713eee09a8d3589
```

현재 HEAD는:

```text
PR #503
4-6 POWER RELAY SPAN
```

병합까지 포함한다.

그 이전:

```text
PR #501
4-5 EXPRESS SHAFT

PR #500
Sentry Combat Stat 문서 정렬
```

도 parent chain에 포함돼 있다.

### Current Sector 04 Document State

현재 GitHub:

```text
4-1
MERGED

4-2
MERGED / REV 1.1

4-3
MERGED / REV 1.0

4-4
MERGED / REV 1.0

4-5
MERGED / REV 1.0

4-6
MERGED / REV 1.0

4-7
THIS DOCUMENT
```

따라서 본 문서는 현재 GitHub 4-6의 Exit:

```text
JUNCTION CONTROL

ROUTING SECURITY
AHEAD
```

를 PREV candidate로 사용한다.

### VERIFIED — CURRENT HOOK / ROPE

```text
Hook Speed                 1400 px/s
Hook Flight Ratio          2 / 7 sec
Derived Hook Reach         400 px
Hook Reload                0.20 sec
Attach Buffer              0.10 sec
Swing Drag Min Hold        0.08 sec
Swing Impulse              780
Release Angular Transfer   0.55
```

모든 Mandatory / Flow Link:

```text
< 400 px
```

### VERIFIED — CURRENT COMBAT

```text
Enemy Radius                18
Enemy Health                100
Enemy Attack Range          760
Acquire                     0.25 sec
Track                       0.80 sec
Lock                        0.20 sec
Fire Flash                  0.08 sec
Enemy Fire Interval         1.00 sec
Enemy Projectile Speed      520
Enemy Projectile Radius     7
Enemy Projectile Damage     20
Rope Disabled On Cut        0.60 sec
```

### VERIFIED — CUTTER

Current projectile:

```text
canCutRope
=
!rules.includes("no-rope-cut")
```

S1은:

```text
no-rope-cut
```

을 갖지 않는다.

### VERIFIED — WIND

Current Pulsed Wind:

```text
LULL
multiplier 0

WARNING
multiplier 0

ACTIVE
multiplier 1

DECAY
multiplier 1 → 0 linear
```

Static rectangular zone 안에 있는 Player point에만 적용.

### RUNTIME UPDATE — WIND SHADOW / GROUNDED ATTENUATION 구현됨

4-7 최초 작성 이후 병합된 Runtime 변경(`WorldForceField.js`, `GameSimulation.js`)에서
다음이 실제로 구현되고 **기본 활성화**됐다.

```text
WIND_CONFIG (config.js)
groundedFactor  0.35
shadowFactor    0.15
defaultFalloff  0
```

```text
GROUNDED ATTENUATION
player.physics.isGrounded === true
→ wind force × 0.35

WIND SHADOW
windOrigin(zone)와 player point 사이 segment가
solid occluding surface(기본: collision !== false && oneWay !== true)와 교차
→ wind force × 0.15 (추가 배율)
```

§24 FAIL 목록의 "Wind shadow 가정" / "grounded attenuation 가정" 문구는
작성 당시 기준이며 이제 STALE이다.

Falloff는 `defaultFalloff: 0`이므로 Zone이 명시적으로 `falloff` 값을 지정하지 않는 한
비활성 상태로 남는다. 4-7 Wake Zone은 falloff를 지정하지 않으므로 설계 변경 없음.

---

## 0-2. Reference Transfer

### VERIFIED / OFFICIAL — SANABI

Official description은 같은 Chain-hook을:

```text
movement
+
bullet / trap traversal
+
enemy defeat
```

에 함께 사용한다고 설명한다.

### TRANSFER

4-7에서 Cutter와 Wake는
서로 별개 퍼즐이 아니다.

한 Rope decision이 동시에:

- 이동 속도
- Cutter exposure
- Rope Line
- recovery

를 결정해야 한다.

### VERIFIED / DEVELOPER — Rusted Moss

Developer 설명은:

```text
everything revolves around one grapple core
```

와 같은 challenge의 multiple solutions를 강조한다.

### TRANSFER

4-7의 정답은 하나가 아니다.

```text
wait for safer phase

use ACTIVE assist

release early

take cut and recover

use Foundation expression
```

모두 가능.

---

## 0-3. 4-3 반복 방지

4-3 FREIGHT BYPASS:

```text
ONE CORRIDOR
+
+X WAKE
+
CUTTER

질문:
WHEN TO ENTER?
```

4-7 ISOLATION JUNCTION:

```text
S-SHAPED JUNCTION
+
SAME +X WAKE
+
CUTTER

질문:
SAME FORCE가
route direction에 따라 바뀔 때
HOW TO RE-DIRECT?
```

### 4-7에서 같은 Wake의 의미

#### LOWER CROSSING

Player 진행:

```text
LEFT → RIGHT
```

Wake:

```text
+X
```

따라서:

```text
ASSIST
```

#### CENTER TURN

Player 진행:

```text
mostly upward
```

Wake:

```text
+X
```

따라서:

```text
LATERAL DRIFT / LINE CONTROL
```

#### UPPER RETURN

Player 진행:

```text
RIGHT → LEFT
```

Wake:

```text
+X
```

따라서:

```text
OPPOSE
```

같은 Physics가
세 가지 의미를 가진다.

---

## 1. 한 줄 정의

4-6 Power Relay Span에서 Static Cutter Geometry와 Moving Patrol Geometry를 연속해서 통과한 Player가
**Isolation Junction**에 진입해, 하나의 +X Pulsed Transit Wake가 흐르는 S자형 Routing Spine을 따라
하단 W1→W2에서는 Wake의 힘을 이용해 Cutter activation 체류시간을 줄이고,
중앙 W2→W3에서는 측면 Drift 속에서 Hook flight와 Rope Line을 다시 정렬하며,
상단 W3→W4에서는 같은 Wake를 거슬러 왼쪽으로 돌아가야 하는 상태에서
Stationary Cutter가 W3 Anchor와 Return Rope Line을 겨냥하기 쉬운 Geometry를 통과한 뒤,
Threat가 완전히 끝난 Safe Isolation Control Deck에서
`CONTAINMENT ROUTING — ACTIVE`와 `LOWER ASCENT FEEDER — ISOLATED`라는 두 시스템 상태를 분리해서 확인하고,
두 사실의 직접 인과는 확정하지 않은 채 4-8 Transit Control Trunk로 진입하는 Sector 04 Story Pressure Stage.

---

## 2. 전체 게임에서의 역할

### 2-1. Sector 04 Gameplay Synthesis

이미 배운 것:

```text
4-2
CUTTER

4-3
CUTTER + WAKE

4-5
WAKE AS MOVEMENT ASSIST

4-6
ROPE LINE GEOMETRY
```

4-7은:

```text
CUTTER
+
WAKE
+
DIRECTION CHANGE
+
RECOVERY
```

를 한 공간에 합친다.

### 2-2. Story Payoff

4-4의:

```text
SEGMENTED
```

가 단순 Telemetry Noise가 아니었음을 확인.

### 2-3. 4-8 Preparation

4-7:

```text
Lower Feeder
ISOLATED
```

4-8:

```text
Upper Trunk
still limited-operational

vs

Lower Feeder
isolated
```

를 같은 Finale 흐름 안에서 병치.

따라서 4-7이
Story fact를 확정하고,
4-8이 그 의미를 체감시킨다.

---

## 3. Story 역할

### S0 — Entry Security Status

P1 접근.

```text
JUNCTION CONTROL

CONTAINMENT ROUTING
ACTIVE
```

### Important

이 시점에는 아직:

```text
LOWER ASCENT FEEDER
ISOLATED
```

를 함께 붙이지 않는다.

### S1 — Safe Isolation Deck

P3 진입.

별도 Feeder Status Display:

```text
LOWER ASCENT FEEDER

ISOLATED

ROUTE TELEMETRY
OFFLINE
```

### Player가 확정할 수 있는 것

```text
Lower Ascent Feeder가
정상 연결이 아니라
격리 상태였다.
```

### Player가 추론할 수는 있지만 확정하면 안 되는 것

```text
Containment Routing
MAY BE RELATED

Lower Feeder Isolation
MAY BE RELATED
```

### NOT CONFIRMED

```text
CONTAINMENT ROUTING
CAUSED
LOWER FEEDER ISOLATION
```

확정 아님.

그리고:

```text
LOWER FEEDER ISOLATION
CAUSED
GROUP C SUSPENSION
```

도 확정 아님.

### S2 — Exit

```text
TRANSIT CONTROL TRUNK

ACCESS
AHEAD
```

4-8 Preview.

---

## 4. 공간 콘셉트

### ISOLATION JUNCTION

하부 Transit feeder와
Upper control trunk가 교차하는
S자형 Routing Junction.

### 공간 언어

- split conduit
- isolation bulkhead
- feeder branch
- trunk relay
- pressure cross-flow grille
- routing status panel
- static service bridge

### Gameplay Shape

```text
LEFT LOWER
→ RIGHT MID
→ RIGHT UPPER
→ LEFT UPPER
→ SAFE STORY DECK
```

### Physical Story

Lower Feeder 쪽 구조는
실제로 닫힌/분리된 service branch처럼 보일 수 있다.

하지만:

```text
그 닫힘이 누구의 명령인지
```

를 시각적으로 확정하지 않는다.

---

## 5. Pixel / Grid 기준

### Base

```text
32 px
```

### Map Hypothesis

```text
WIDTH
1472 px

X
-736 ~ +736

HEIGHT
1536 px

Y
0 ~ -1536
```

### Gameplay Elements

- Main Deck: 32px
- Recovery Ledge: 24px
- Story Deck: 32px
- Grapple Target: current 24×24 family

### Visual Priority

```text
Hook / Rope Cyan
>
Cutter
>
Wake state
>
Story displays
>
Background infrastructure
```

Combat 구간에서 Story text가 시선 우선순위를 뺏으면 안 된다.

---

## 6. 전체 맵 구조

```text
Y = 0

P0 ENTRY
  \
   A0
    \
    P1 SAFE JUNCTION READ
       \
        W1  →→→ +X WAKE ASSIST
          \
           W2
             \
              R1 RIGHT RECOVERY

              W3
             /
      ←←← W4   +X WAKE OPPOSE
        \
         R2 LEFT RECOVERY
          \
           A5
            \
            P3 SAFE ISOLATION STORY DECK
            [FEEDER STATUS]
              \
               A6
                \
                 P4 FINAL SAFE
                 PANEL / GATE

S1 CUTTER
right side of W3 / W4 return line
```

### 핵심

한 Stage 안에서
Wake 방향은 바뀌지 않는다.

```text
+X
```

그대로.

Route 방향이 바뀌기 때문에
체감만 바뀐다.

---

## 7. Zone 구성

### Z0 — Safe Junction Read

```text
P0 → A0 → P1
```

Wake OUT.
S1 activation OUT.

S0:

```text
CONTAINMENT ROUTING
ACTIVE
```

확인.

### Z1 — Lower Assist Crossing

```text
P1 → W1 → W2
```

Wake IN.
S1 activation IN.

진행 방향:

```text
+X
```

Wake와 같은 방향.

### Z2 — Right Recovery / Turn

```text
R1
```

Wake OUT.
S1 activation OUT.

완전한 hard reset은 아니지만
새 acquire가 없는 Recovery.

### Z3 — Center Re-entry

```text
R1 → W3
```

Wake IN.
S1 activation IN.

이 구간은 세로 성분이 커서
+X drift를 읽어야 한다.

### Z4 — Upper Opposed Return

```text
W3 → W4
```

Player:

```text
RIGHT → LEFT
```

Wake:

```text
+X
```

반대.

동시에 Cutter가
W3 Return Rope를 자르기 쉬운 Geometry.

### Z5 — Left Recovery

```text
R2
```

Wake OUT.
S1 activation OUT.

### Z6 — Story / Exit

```text
R2 → A5 → P3 → A6 → P4
```

Threat 없음.

S1 Feeder Isolation Reveal은
P3에서만 표시.

---

## 8. 좌표 / 오브젝트

전부:

```text
HYPOTHESIS — BLOCKOUT
```

### 8-1. Landing / Recovery

| ID | Center | Size | Role |
|---|---:|---:|---|
| P0 | `(-480, 0)` | `320×32` | Entry |
| P1 | `(-320, -256)` | `320×32` | Safe Junction Read |
| R1 | `(+320, -512)` | `256×24` | Right Recovery |
| R2 | `(-320, -896)` | `256×24` | Left Recovery |
| P3 | `(-32, -1248)` | `512×32` | Safe Isolation Story Deck |
| P4 | `(+352, -1440)` | `416×32` | Final Safe Deck |

### 8-2. Grapple Targets

| ID | Position | Role |
|---|---:|---|
| A0 | `(-352, -128)` | Entry Brace |
| W1 | `(-160, -416)` | Lower Wake Anchor 1 |
| W2 | `(+160, -576)` | Lower Wake Anchor 2 |
| W3 | `(+160, -800)` | Upper Return Anchor 1 |
| W4 | `(-160, -960)` | Upper Return Anchor 2 |
| A5 | `(-96, -1152)` | Story Approach Anchor |
| A6 | `(+224, -1344)` | Final Trunk Anchor |

### 8-3. Cutter Sentry

```text
S1
(+480, -640)
```

Type:

```text
sentry-t1
```

### 8-4. Cutter Activation

```text
X -240 ~ +240
Y -1008 ~ -384
```

Membership:

```text
P1 OUT

W1 IN
W2 IN
W3 IN
W4 IN

R1 OUT
R2 OUT

A5 OUT
P3 OUT
```

### 8-5. Transit Wake

```text
ID
sector-04-07:junction-wake

Bounds
X -224 ~ +224
Y -1008 ~ -320

Direction
(+1, 0)

Mode
pulsed

Strength
360

Cycle
LULL    1.75
WARNING 0.70
ACTIVE  1.40
DECAY   0.30
```

Membership:

```text
W1 IN
W2 IN
W3 IN
W4 IN

P1 OUT
R1 OUT
R2 OUT
A5 OUT
P3 OUT
```

### 8-6. Story Displays

#### N1 — Entry Routing Status

```text
(-128, -256)
```

Content:

```text
CONTAINMENT ROUTING
ACTIVE
```

#### N2 — Feeder Status

```text
(+96, -1248)
```

Content:

```text
LOWER ASCENT FEEDER
ISOLATED
ROUTE TELEMETRY OFFLINE
```

둘 사이에:

```text
arrow
cause label
authorization signature
```

같은 직접 인과 Graphic 없음.

### 8-7. Gate

```text
Panel
(+432, -1440)

Gate
(+544, -1440)
```

Threat 완전 OUT.

---

## 9. Safe Route

### Route

```text
P0
→ A0
→ P1
→ W1
→ W2
→ R1
→ W3
→ W4
→ R2
→ A5
→ P3
→ A6
→ P4
```

### Distance Pre-check

| Link | Distance |
|---|---:|
| P0 → A0 | `181.0 px` |
| A0 → P1 | `131.9 px` |
| P1 → W1 | `226.3 px` |
| W1 → W2 | `357.8 px` |
| W2 → R1 | `172.3 px` |
| R1 → W3 | `329.5 px` |
| W3 → W4 | `357.8 px` |
| W4 → R2 | `172.3 px` |
| R2 → A5 | `340.2 px` |
| A5 → P3 | `115.4 px` |
| P3 → A6 | `273.4 px` |
| A6 → P4 | `160.0 px` |

### Result

```text
MAX SAFE LINK
= 357.8 px

CURRENT DERIVED HOOK REACH
= 400 px

MARGIN
= 42.2 px
```

### Safe Route Contract

Safe Route는:

```text
LULL
WARNING
ACTIVE
DECAY
```

모든 Wake state에서 생존 가능해야 한다.

ACTIVE가 어려워도:

```text
R1
R2
```

로 회수 가능.

### `swingImpulse = 0`

Mandatory Safe Route:

```text
swingImpulse = 0
```

graybox PASS 필수.

---

## 10. Flow Route

### Route

```text
P0
→ A0
→ P1
→ W1
→ W2
→ W3
→ W4
→ A5
→ P3
→ A6
→ P4
```

R1 / R2 landing 생략.

### 주요 거리

```text
P1 → W1
226.3 px

W1 → W2
357.8 px

W2 → W3
224.0 px

W3 → W4
357.8 px

W4 → A5
202.4 px

P3 → A6
273.4 px
```

### Result

```text
MAX FLOW LINK
= 357.8 px
```

400px 한계에 붙지 않는다.

### Flow Skill

하단:

```text
ACTIVE assist를 타고
W1 → W2 빠르게 통과
```

상단:

```text
same ACTIVE가 진행을 방해
→ release angle
→ hook timing
→ line correction
```

으로 숙련 차이가 난다.

---

## 11. Cutter Geometry

### Critical Return Line

S1:

```text
(+480, -640)
```

W3:

```text
(+160, -800)
```

W4:

```text
(-160, -960)
```

세 점은 같은 직선 위에 있다.

벡터:

```text
S1 → W3
(-320, -160)

W3 → W4
(-320, -160)
```

### Meaning

Player가 W3에 붙은 채
W4 방향으로 이동할 때:

```text
S1
→
W3
→
PLAYER NOMINAL PATH
```

정렬이 만들어진다.

S1은 Player를 조준하지만,
shot trajectory가 Rope near-anchor를
가로지를 가능성이 높아진다.

### Important

```text
GUARANTEED CUT
```

아님.

Player가:

- early release
- arc change
- active wake drift
- recovery

로 회피 가능.

### Lower W1/W2

하단에서는 Cutter가 존재하지만
Cutter Line Tutorial을 반복할 정도의
강한 forced alignment는 만들지 않는다.

하단 역할은:

```text
Wake assist + Cutter exposure compression
```

이다.

---

## 12. Transit Wake Gameplay

### One Constant Force

```text
Direction
+X
```

만 사용.

### LOWER — Assist

```text
W1 → W2
LEFT → RIGHT
```

Wake와 같은 방향.

ACTIVE:

- horizontal speed 증가
- Cutter activation 체류시간 감소
- overshoot 가능성 증가

### CENTER — Cross-Control

```text
R1 → W3
```

진행은 위쪽 비중이 큼.

+X Wake가:

```text
side drift
```

를 만든다.

### UPPER — Oppose

```text
W3 → W4
RIGHT → LEFT
```

Wake 반대.

ACTIVE:

- leftward progress 저항
- Rope tension / release timing 변화
- Cutter exposure 증가 가능

### 핵심

```text
ACTIVE
= 항상 좋음
```

도 아니고:

```text
ACTIVE
= 항상 나쁨
```

도 아니다.

Route direction에 따라 의미가 바뀐다.

---

## 13. Recovery

### R1

```text
(+320, -512)
```

Wake OUT.
S1 activation OUT.

하단 Assist overshoot / cut recovery.

### R2

```text
(-320, -896)
```

Wake OUT.
S1 activation OUT.

상단 Oppose / cut recovery.

### Cut Contract

Current:

```text
Rope Cut
→ detach
→ Rope Disabled 0.60 sec
```

이후에도:

```text
Hook launch
→ flight
→ hit
```

이 필요.

### Target

Cut event 후:

```text
stable landing ≤ 2.0 sec
next successful attach ≤ 3.0 sec target
```

### Already-fired Projectile

R1 / R2로 들어갔다고
기존 Projectile이 삭제된다고 가정하지 않는다.

새 acquire는 꺼지지만
이미 날아온 탄은 끝까지 읽는다.

### No Full Reset

W3/W4 Cut 하나로
P0 reset이면 FAIL.

---

## 14. Enemy Contract

### S1

```text
Stationary Sentry T1 ×1
```

정확히 1.

### Current Attack

```text
Acquire 0.25
Track   0.80
Lock    0.20
Fire
```

Projectile:

```text
520 px/s
20 damage
canCutRope = true
```

### Kill

```text
OPTIONAL
```

### No Patrol

```text
NONE
```

### No LOS Rule

```text
cover-ends-los
```

사용하지 않는다.

Visual cover를 안전으로 설명하지 않는다.

### Safe Recovery

R1 / R2는:

```text
activation membership OUT
```

으로 새 acquire를 막는다.

거리만으로 안전성을 설명하지 않는다.

---

## 15. Foundation Expression

### IMPULSE COIL

Lower:

```text
W1 → W2
ACTIVE assist와 합쳐 exposure compression
```

Upper:

```text
W3 → W4
Wake opposition을 release impulse로 일부 상쇄
```

### RELAY LINK

```text
W1 → W2 → W3 → W4
```

landing 없는 chain 안정성.

### SHEAR CURRENT

이번 Stage 핵심은 Shear showcase가 아니다.

S1은 W3의 Anchor 반대편에 있으므로
W3→W4 nominal line에서
Shear가 자동으로 발생하지 않는다.

다른 swing geometry에서
Rope가 S1을 실제로 가로지르면
20 damage는 정상 적용.

### Important

4-6에서 Shear를 강하게 보여줬으므로
4-7에서 또 Shear 중심 Stage로 반복하지 않는다.

### Mandatory

어떤 Foundation도 Progression Key 아님.

---

## 16. Story Reveal Contract

### Timing

Story Reveal은:

```text
COMBAT / WAKE ZONE
완전히 종료
```

후 P3에서 발생.

### Display Separation

N1:

```text
CONTAINMENT ROUTING
ACTIVE
```

N2:

```text
LOWER ASCENT FEEDER
ISOLATED
```

동일 UI 한 줄로 합치지 않는다.

### Why

합치면:

```text
CONTAINMENT ROUTING
→ LOWER FEEDER ISOLATION
```

직접 명령/인과처럼 읽힐 수 있다.

### Player Conclusion

허용:

> **“Containment Routing과 Lower Feeder Isolation이 같은 Junction에 존재했네. 관련 있을 수 있다.”**

금지:

> **“Containment 명령 때문에 Lower Feeder가 격리됐다.”**

### Group C

4-7에서 Group C Text를 다시 띄우지 않는다.

Player가 3-8 정보를 기억해 스스로 연결할 수는 있지만
게임이 아직 확답하지 않는다.

---

## 17. Camera

모든 값 HYPOTHESIS.

### C0 — Junction Read

```text
P0 / A0 / P1 / N1

Desktop 0.96
Mobile  0.72
```

### C1 — Lower Assist

```text
W1 / W2 / R1 / S1

Desktop 0.89
Mobile  0.68
```

### C2 — Center Turn

```text
R1 / W3 / S1

Desktop 0.90
Mobile  0.68
```

### C3 — Upper Opposed Return

```text
W3 / W4 / R2 / S1

Desktop 0.87
Mobile  0.68
```

필수:

- S1 visible
- W3 current Anchor
- W4 destination
- R2 Recovery

### C4 — Story Deck

```text
A5 / P3 / N2

Desktop 1.00
Mobile  0.72
```

Threat 없음.

### C5 — Exit

```text
P3 / A6 / P4 / Gate

Desktop 0.96
Mobile  0.72
```

---

## 18. Story Trigger

### Trigger S0

P1 traversal.

```text
JUNCTION CONTROL
CONTAINMENT ROUTING ACTIVE
```

### Trigger S1 — MANDATORY

P3 broad traversal volume.

```text
LOWER ASCENT FEEDER
ISOLATED
ROUTE TELEMETRY OFFLINE
```

### Mandatory but Non-blocking

Flow Route도 P3 주변 trigger를 반드시 지나지만:

```text
movement lock
dialogue modal
interaction requirement
```

없음.

### Trigger S2

P4 approach.

```text
TRANSIT CONTROL TRUNK
ACCESS AHEAD
```

---

## 19. Pixel Art Asset Spec

### Isolation Junction

- branching feeder conduit
- locked isolation bulkhead
- trunk-side relay bridge
- pressure cross-flow vents
- routing schematic panel

### N1 Containment Display

Neutral infrastructure UI.

```text
CONTAINMENT ROUTING
ACTIVE
```

### N2 Feeder Display

```text
LOWER ASCENT FEEDER
ISOLATED
```

색은:

```text
muted amber / white
```

권장.

### 금지

- blood red emergency icon
- casualty symbol
- Group C icon
- priority class icon
- executive authorization stamp

### Why

Story는:

```text
operational fact
```

를 보여주는 것이지
악의적 의도를 시각적으로 확정하는 것이 아니다.

---

## 20. Background / Environment

### Far

- split transit trunk
- isolated lower branch silhouette
- power / pressure cross-routing
- distant upper control trunk

### Mid

- bulkhead actuator
- static conduit valves
- relay cabinets
- junction brace

### Motion

Wake 구간:

- directional dust
- cable sway
- pressure indicator chase

Story Deck:

```text
motion density DOWN
```

읽기 쉬워야 한다.

### No Moving Gameplay Surface

유지.

---

## 21. Sound / VFX

### Entry

```text
junction relay hum
```

### Wake

기존:

```text
LULL
WARNING
ACTIVE
DECAY
```

audio family reuse.

### Cutter

기존 Cutter family reuse.

### Story Deck

Threat audio fade.

N2 Reveal:

```text
soft routing confirmation tone
```

정도.

Alarm siren 금지.

### Isolation Meaning

```text
ISOLATED
```

는 Horror sting가 아니라
시스템 상태 확인처럼 들려야 한다.

---

## 22. Multiplayer Contract

### Shared Wake Phase

두 Player 모두
동일 deterministic phase를 본다.

### Shared Sentry

S1은 Current Targeting contract에 따라
eligible Player 하나를 lock.

### Different Pace

Player A:

```text
W3/W4 combined zone
```

Player B:

```text
R1 recovery
```

동시 가능.

R1은 activation OUT라
B가 새 target이 되지 않는다.

### Cutter Cross-Rope

Target 외 Player Rope가
Projectile path에 겹치는 경우
우발 cut 가능성을 prototype에서 확인.

### Story Reveal

P3 World Fact는 shared presentation 가능.

하지만:

- movement lock 없음
- party teleport 없음
- other player forced snap 없음

### Gate

```text
shared open
individual physical crossing
```

유지.

---

## 23. Playtest Metrics

### Wake Direction Meaning

```text
lower ACTIVE clear time
upper ACTIVE clear time
LULL clear time
full-cycle waits
```

### Cutter

```text
shots
ropeCuts
bodyHits
activation exposure
```

### Recovery

```text
R1 landings
R2 landings
cut → landing
cut → next successful attach
```

### Flow

```text
W1→W4 no-landing chain
release count
hook misses
```

### Foundation

#### Impulse

Upper opposed-return 성공률.

#### Relay

W1→W4 continuous chain.

#### Shear

Optional only.

### Story

```text
P3 trigger seen
P3 stop duration
```

Stopping은 필요 없음.

---

## 24. PASS Criteria

### Gameplay

- Cutter exactly 1
- Patrol 0
- one static +X Wake zone
- lower crossing에서 Wake가 assist로 느껴짐
- center turn에서 lateral drift로 느껴짐
- upper return에서 same Wake가 oppose로 느껴짐
- 4-3의 단순 corridor 반복 아님
- R1 / R2 Wake OUT
- R1 / R2 Sentry activation OUT
- W1~W4 Wake IN
- W1~W4 Sentry activation IN
- W3 Return Rope Cutter alignment readable
- Kill Optional
- Safe max 357.8px
- Flow max 357.8px
- all Hook links < 400px
- `swingImpulse=0` Safe Route graybox PASS
- no new input
- no new Rope mode
- no Foundation lock
- no new growth

### Story

Player가 확정:

```text
LOWER ASCENT FEEDER
ISOLATED
```

Player가 아직 확정 못함:

```text
why
who
Group C causal relationship
intentional sacrifice
```

### Runtime Fidelity

- current 100 / 760 / 1.00 / 520 Combat
- Cutter = absence of `no-rope-cut`
- Wind static rectangular zone
- global deterministic phase
- already-fired projectile persists
- no generic LOS assumption

### Production

- no Moving Platform dependency
- no Scanner dependency
- Approved Gameplay Art HOLD

---

## 25. FAIL Conditions

### Gameplay

- 4-3와 거의 같은 left→right corridor
- Wake가 항상 좋거나 항상 나쁨
- R1/R2가 Wake 안
- R1/R2에서 새 Sentry acquire
- second enemy 추가
- Patrol 추가
- Cutter를 죽여야 진행
- 400px 이상 Hook link
- Story를 읽기 위해 combat zone에서 멈춰야 함
- one Cut → Stage start reset

### Build

- Impulse required
- Relay required
- Shear required
- first Specialization required
- Artifact reward 재도입

### Story

- `ISOLATED` 이전 단계처럼 애매하게 표현
- `CONTAINMENT ROUTING CAUSED ISOLATION` 확정
- `ISOLATION CAUSED GROUP C SUSPENSION` 확정
- Group A/B upper route mapping
- Corporate decision 공개
- deliberate sacrifice 확정

### Runtime

- moving force volume 가정
- Wind Shadow(0.15 배율) / Grounded Attenuation(0.35 배율) 존재를 모르고 옛 무보정 물리로만 Mandatory Route graybox 검증
- client-local Wind phase
- old Combat values 사용

---

## 26. 개발자 최종 전달 요약

### Stage

```text
SECTOR 04-7
ISOLATION JUNCTION
```

### Core

```text
ONE +X PULSED WAKE
+
ONE CUTTER SENTRY
+
S-SHAPED ROUTE
```

### Wake Meaning

```text
LOWER
ASSIST

CENTER
LATERAL CONTROL

UPPER
OPPOSE
```

### Geometry

```text
W1 (-160,-416)
W2 (+160,-576)
W3 (+160,-800)
W4 (-160,-960)

SAFE / FLOW MAX
357.8 px

HOOK REACH
400 px
```

### Cutter

```text
S1
(+480,-640)
```

Critical alignment:

```text
S1
→ W3
→ W4

collinear
```

### Recovery

```text
R1 (+320,-512)
R2 (-320,-896)

Wake OUT
Sentry Activation OUT
```

### Story Reveal

```text
CONTAINMENT ROUTING
ACTIVE
```

separate from:

```text
LOWER ASCENT FEEDER
ISOLATED
ROUTE TELEMETRY OFFLINE
```

### Causality

```text
MAY BE RELATED
NOT CONFIRMED
```

### Do Not Add

- Patrol
- Scanner
- Moving Platform
- New Input
- New Rope Mode
- Growth
- Artifact
- Kill Gate
- Boss

### Stage Feeling

> **“같은 흐름이 나를 밀어줄 때도 있고 거슬러 밀 때도 있다. 그 안에서 Rope를 끊기지 않게 이어가고 나니, Lower Ascent가 실제로 격리돼 있었다는 사실이 드러난다.”**

---

## OPEN QUESTIONS

### 1. W1 → W2 / W3 → W4 357.8px

400 Reach 대비:

```text
42.2px margin
```

현재는 충분한 후보.

Hook flight + Wake drift에서 초행 부담이 크면
16px inward를 우선 검토.

### 2. Wake Direction +X

4-3도 +X를 사용했다.

반복감은:

```text
S-shaped direction reversal
```

로 제거하는 설계.

그래도 playtest에서 4-3 반복으로 느껴지면
Wind direction 자체를 바꾸기보다
junction geometry / camera / pressure timing을 먼저 조정.

### 3. Cutter W3 Alignment

현재 S1-W3-W4가 완전 collinear.

실제 Cut rate가 지나치게 높으면:

- S1 16~32px vertical offset
- activation start delay via geometry
- W3 position

순으로 조정.

Projectile speed를 Stage-specific으로 낮추지 않는다.

### 4. R1 Position

R1은 S1과 물리적으로 가깝지만
activation x 밖에 있다.

Already-fired projectile 때문에
체감상 안전하지 않으면
R1을 +48~96px 더 바깥으로 이동하고
W2→R1 / R1→W3 link를 다시 계산한다.

### 5. Story Wording

현재:

```text
ISOLATED
ROUTE TELEMETRY OFFLINE
```

후보.

`OFFLINE`이 물리적 파괴처럼 너무 강하게 읽히면:

```text
ROUTE LINK
UNAVAILABLE
```

계열로 조정 가능.

단 `ISOLATED` 자체는 4-7에서 확정 유지.

### 6. Containment / Isolation Display Separation

현재 N1과 N2를 다른 위치·다른 시점에 둔다.

Playtest에서 여전히 직접 인과처럼 읽히면
두 표시 사이 시각 언어를 더 분리한다.

### 7. 4-6 Runtime Handoff

4-6은 PR #503으로 GitHub merge 완료.

현재 4-7은 4-6의:

```text
JUNCTION CONTROL
ROUTING SECURITY
AHEAD
```

Exit handoff를 직접 이어받는다.

향후 4-6 실제 Runtime geometry가 구현되면:

- Gate arrival position
- first 4-7 P0 framing
- camera continuity

를 다시 검증.

### 8. 4-8 Handoff

4-8은 새로운 Story fact를 많이 추가하기보다:

```text
UPPER TRUNK LIMITED OPERATION
vs
LOWER FEEDER ISOLATED
```

를 움직이는 Finale 안에서 병치하는 역할.

4-7에서 그 대비를 미리 다 소비하지 않는다.

### 9. 4-1 Geometry Drift — FALSE ALARM (RESOLVED)

4-1의 Flow Route `A3 → A4 = 408.9px > 400px Hook Reach`는 실제로는 문제가 아니었다.
4-1의 Mandatory Safe Route는 같은 구간을 `A3 → M1 → A4`로 우회해 400px 이내로
통과하며, shipped `Sector04AreaCatalog.js`도 이 좌표 그대로 구현·검증돼 있다.
좌표 교정은 필요하지 않았다(4-1 §9/§10 참고).

---

SECTOR 04-7 / ISOLATION JUNCTION — BLOCKOUT CANDIDATE · REV 1.2
