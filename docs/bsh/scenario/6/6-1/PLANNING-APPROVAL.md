# ONE ROPE — SECTOR 06-1 SKYBREAK ACCESS — REV3 PLANNING DRAFT

> Status: APPROVED BY USER — DESIGN LOCKED REV3.0<br>
> Authoring snapshot: `1009af0ef14ec9f64af891833156e6af8a1abdc1`<br>
> Supersedes: REV2 V-shaped right→left→right traverse<br>
> Sector06 role: **OPEN-SKY TOPOLOGY INTRO + RECOVERY SHADOW INTRO**

---

# 0. 왜 REV3인가

REV2의:

```text
RIGHT ENTRY
→ FAR LEFT
→ RIGHT CROWN
```

은 단독으로는 읽히지만,
Sector06 전체에서 예정된:

- 6-2 Right→Left→short Right→Left
- 6-3 Left→Right→Left
- 6-5 Right→Left→Right
- 6-6 Left→Right→Left
- 6-7 upper/right + lower recovery + return

과 방향전환 문법이 반복될 위험이 있었다.

REV3는 6-1을 아예:

> **“건물 외피를 벗어나 실제로 아래의 열린 하늘 구조물로 몸을 던진 뒤, 독립 Mast를 다시 오른다.”**

라는 고유 Stage로 바꾼다.

---

# 1. 최종 공간 문법

> **HIGH ROOF HATCH → SKYBREAK DROP → LOWER SKY ISLAND → FREESTANDING MAST CLIMB → SHORT CROWN CROSS**

Macro:

```text
                 CROWN / 6-2
                    ─────→
                   /
                 ↑
                 ↑
          FREESTANDING
              MAST
                ↑
                │
        LOWER SKY ISLAND
              ↙
           ↙
        ↙
 HIGH ROOF HATCH
```

이 Stage의 기억은:

```text
좌우 왕복
NO

건물에서 떨어져 나감
→ 하부 구조물 Catch
→ 벽 없는 Mast 재상승
YES
```

---

# 2. Core Question

> **“벽과 천장이 사라진 상태에서, 눈앞의 아래쪽 구조물까지 과감하게 내려간 뒤 다시 독립 구조물을 타고 올라갈 수 있는가?”**

6-1은 적도, Wind도 없다.

따라서 플레이어는 오직:

- open-sky depth
- structural island readability
- failure recovery layer

만 읽는다.

---

# 3. Z0 — HIGH ROOF HATCH

Sector05에서 나온 직후.

높은 Corporate roof edge.

System:

```text
ROOFTOP ZONE
EXTERIOR SERVICE ACCESS
```

Player Bark:

> **“…이제 진짜 밖이네.”**

여기서 반드시 한 화면에 보여야 한다:

- Drop H1
- Drop H2
- Lower Sky Island

즉 Blind Leap 금지.

---

# 4. Z1 — SKYBREAK DROP

이번 Stage의 고유 기믹.

진행은 **위가 아니라 아래/바깥**이다.

```text
ROOF EDGE
       ○
             ○
                   ○
            LOWER ISLAND
```

규칙은 새로 없다.

그냥 기존 Rope를
**의도적으로 하강 방향으로 연속 사용**한다.

목적:

- 실내에서 “위로 가는 Rope”만 생각하던 습관을 깨기
- open sky depth를 실제 movement로 체험
- 6-2 이후 lateral rooftop traversal과 차별화

---

# 5. Z2 — LOWER SKY ISLAND

Stage의 가장 낮은 주요 Safe Point.

넓은 maintenance island.

여기서 플레이어가:

- 자신이 나온 Roof Hatch
- 앞으로 오를 Freestanding Mast
- 아래 Recovery Shadow

를 모두 볼 수 있다.

No story.

---

# 6. Z3 — RECOVERY SHADOW

Sector06의 반복 가능한 outdoor failure language.

Main Route 아래:

```text
MAIN ROUTE
  ○
       ○
           ○

----------------
RECOVERY SHADOW
```

6-1에서는 안전하게 익힌다.

Ordinary miss:

```text
miss
→ lower maintenance lip / mesh
→ 1~2 Hook
→ main route return
```

Target:

`≤5 sec`

Important:

- instant-death sky 금지
- Recovery가 main route shortcut이 되면 안 됨
- Recovery는 항상 다음 main beat 이전으로 복귀

Sector06 payoff:

```text
6-1
Recovery Shadow 학습

↓

6-7
Cutter가 Rope를 끊었을 때
Lower Maintenance Catwalk를 실제 recovery로 사용
```

---

# 7. Z4 — FREESTANDING MAST CLIMB

벽에 붙은 Shaft가 아니다.

**완전히 독립된 Mast**.

시각:

```text
       ○
       │
   ○   │
       │
 ○     │
       │
○      │

    OPEN SKY
```

플레이어 주변의 큰 solid wall은 없다.

Gameplay structures:

- mast bracket
- maintenance ring
- beacon brace
- small service shelf

핵심 감각:

> “공간 안을 오르는 게 아니라 구조물 자체를 오른다.”

---

# 8. Z5 — SHORT CROWN CROSS

Mast를 오른 뒤 짧게 오른쪽 Crown으로 이동.

여기서는 긴 좌우 왕복을 하지 않는다.

최종 Safe Deck:

```text
CROSSWIND MASTS
AHEAD
```

실제 Wind Force는 6-2 소유.

6-1에서는:
- streamer
- cable tag
- scarf
- vapor

정도의 **비물리적 방향 cue**만 허용.

---

# 9. 구조물이 갈수록 얇아지는 시각 기믹

새 Gameplay rule 없이
Open-Sky exposure를 강화한다.

```text
ENTRY
큰 Roof Truss
↓

DROP
Service Frame
↓

LOWER ISLAND
Maintenance Deck
↓

MAST
Bracket / Ring
↓

CROWN
Thin Beacon Frame
```

즉:

> **support silhouette gets thinner as confidence grows**

---

# 10. Route Coordinates

Entry:
[(620, -2100), (420, -1910), (170, -1730)]

Skybreak Drop:
[(170, -1730), (-90, -1540), (-350, -1360), (-620, -1180), (-830, -980)]

Lower Island:
[(-830, -980), (-760, -1180)]

Freestanding Mast:
[(-760, -1180), (-760, -1460), (-650, -1720), (-650, -2000), (-520, -2240)]

Crown Cross:
[(-520, -2240), (-240, -2330), (60, -2370), (330, -2310), (570, -2440)]

Maximum authored relation:

**324.5px < 400px**

---

# 11. Recovery Authoring

### R1 — Drop Shadow
Skybreak Drop 아래 maintenance mesh.

### R2 — Lower Island underside
Mast entry miss recovery.

### R3 — Mast lower service ring
첫 vertical miss recovery.

### R4 — Mast mid service ring
mid-climb recovery.

### R5 — Crown underside lip
final cross recovery.

모두:
`≤5 sec return target`.

---

# 12. Enemy / Mechanic

```text
Enemy 0
Wind Force 0
Scanner 0
Cutter 0
Patrol 0
Sentry 0
Moving Platform 0
Damage Hazard 0
New Input 0
New Rope Mode 0
```

6-1의 기믹은 시스템 추가가 아니라:

- deliberate downward Rope progression
- open-sky structural island
- recovery shadow
- freestanding mast

이라는 **공간 기믹**이다.

---

# 13. Story Boundary

Allowed:

```text
ROOFTOP ZONE
EXTERIOR SERVICE ACCESS

CROSSWIND MASTS
AHEAD
```

Player:

> **“…이제 진짜 밖이네.”**

Forbidden:

- Pad03 direct visual
- Shuttle direct visual
- Access Denied
- Containment Violation
- Final Security
- new Corporate policy exposition.

---

# 14. Similarity Audit

## 5-8
Twin vertical bus + crosslinks.

6-1:
high roof departure → outward/downward drop → freestanding mast.

PASS.

## 6-2
mostly leftward crosswind lateral run.

6-1:
major deliberate descent then vertical freestanding climb.

PASS.

## 6-3
rightward Sentry firing arc.

PASS.

## 6-4
horizontal Rest / Shelter.

PASS.

## 6-5
controlled diagonal Scanner chain.

PASS.

## 6-6
diagonal Patrol combat arc.

PASS.

## 6-7
upper Cutter line + lower recovery.

Partial grammar link:
Recovery layer.

But role differs:

```text
6-1
safe introduction

6-7
combat mastery payoff
```

DESIRABLE CALLBACK, not duplication.

## 6-8
strictly one-way Pad runway.

PASS.

---

# 15. Approval Gate

Approve/revise:

1. High Roof Hatch 시작
2. 실제 Skybreak Drop
3. Lower Sky Island
4. Recovery Shadow
5. Freestanding Mast
6. 짧은 Crown Cross
7. Player Bark `…이제 진짜 밖이네.`


---

# APPROVAL RECORD

User reviewed REV3 and instructed progression with `진행하자` on 2026-08-21 KST.

Approved authority:
- Skybreak Drop
- Lower Sky Island
- Recovery Shadow
- Freestanding Mast
- Short Crown Cross
- Korean-first Player dialogue

Checked main:
`1009af0ef14ec9f64af891833156e6af8a1abdc1`
