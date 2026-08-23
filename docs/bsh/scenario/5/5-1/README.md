# SECTOR 05-1 — CONTINUITY RECEPTION REV8.0

> Status: **RUNTIME GENERATED · PLAYTEST PENDING**<br>
> Authoring snapshot: `4551798860193a16e53814aae5c3a42022b4e1cf`<br>
> Source Area ID: `sector-05-01`<br>
> Runtime connection: **5-1 → 5-2 INTERNAL ONLY**<br>
> Bounds: **4608×2496 EDITOR RECONCILED**<br>
> Enemy: **NONE**<br>
> Signature: **MONUMENTAL SEALED CORE ALTERNATING ASCENT**<br>
> Lesson: **SEALED CORPORATE SURFACE ≠ SERVICE HARDPOINT**<br>
> Next: **5-2 CONTROL ATRIUM**

---

## 1. One-line Definition

Sector 04에서 상부 시스템은 제한적으로 살아 있고 하부 Ascent Feeder는 격리되어 있었다는 사실을 확인한 Player가,
거대한 **Continuity Control** 시설에 진입해 완성된 Corporate 표면은 Rope가 걸리지 않고
유지관리용 Service Hardpoint만 유효하다는 Sector05 Rope 문법을 적 없이 학습하고,
도시 하부가 끊긴 사고 당시에도 이 통제시설 자체는 작동 중이었다는 사실을 확인한 뒤
5-2 Control Atrium으로 올라가는 Sector05 도입 Stage.

---

## 2. Previous Story Memory

5-1의 Player는 처음부터 아무것도 모르는 상태가 아니다.

이미 확인:

```text
SECTOR 03

GROUP C
TRANSFER SUSPENDED

PRIORITY ROUTE
ACTIVE
```

그리고 Sector04 후반:

```text
UPPER EXPRESS TRUNK
LIMITED OPERATION

LOWER ASCENT FEEDER
ISOLATED
```

따라서 5-1 진입 질문:

> **왜 계속 살아 있던 쪽과 끊긴 쪽이 따로 있었지?**

5-1은 원인을 답하지 않는다.

새로 추가하는 사실:

> **사고 당시에도 Continuity Control 자체는 살아 있었다.**

---

## 3. Core Question

> **완성된 통제시설의 표면이 아니라, 그 사이에 숨은 유지관리 구조를 읽을 수 있는가?**

```text
SEALED CORPORATE SURFACE
collision YES
grappleable NO

SERVICE HARDPOINT
grappleable YES
```

Hardpoint는 숨은 정답이 아니다.

시각적으로 항상 구분 가능해야 한다.

---

## 4. Scale

```text
WIDTH  4608
HEIGHT 2432

X -2304 ~ +2304
Y     0 ~ -2432
```

기존 5-1의 `1600×1420` Blockout을 단순 확대하지 않는다.

REV8은 4개의 대형 Sealed Core Segment 사이를:

```text
LEFT
→ RIGHT
→ LEFT
→ RIGHT
```

로 교차 상승하는 새로운 공간 구조다.

### Map Size Audit

```text
TOTAL BOUNDS
4608×2432
≈ 11.21M px²

SAFE ROUTE TRAVEL
≈ 7716px

MAX SAFE LINK
384.7px

FLOW-CHOICE TAIL
≈ 2660px

MAX FLOW LINK
394.5px

ENEMY
0

TRUE SAFE READ DECK
Reception
Control Void
Inspection
Final

RECOVERY LAYERS
3

CAMERA ROLES
5

HARDPOINT DENSITY
MEDIUM
```

Stage의 크기는 긴 평지 걷기가 아니라:

```text
large sealed core
+
large void
+
sparse readable hardpoints
+
340~395px meaningful crossings
```

으로 체감시킨다.

---

## 5. Macro Flow

```text
ENTRY LEFT
→ H1
→ LEFT RECEPTION
→ CORE GAP 1 / LEFT→RIGHT
→ RIGHT CONTROL VOID
→ CORE GAP 2 / RIGHT→LEFT
→ LEFT INSPECTION
→ H4 SAFE or H4 FLOW
→ CORE GAP 3 / LEFT→RIGHT
→ FINAL DECK
→ EXIT PANEL
→ 5-2 CONTROL ATRIUM
```

---

## 6. Sealed Core

Gameplay-relevant collision only.

### CORE A

`x=-480..+480 / y=-620..-300`

### CORE B

`x=-650..+650 / y=-1110..-830`

### CORE C

`x=-520..+520 / y=-1580..-1330`

### CORE D

`x=-700..+700 / y=-2080..-1840`

All:

```text
collision YES
grappleable NO
```

The gaps between these Core segments create the major Rope crossings.

---

## 7. Phase A — First Read

```text
ENTRY (-1900,-64)
→ H1 (-1600,-240)
→ RECEPTION (-1260,-420)
```

Player must understand on the first attempt:

```text
large smooth wall
≠ rope target

small cyan service structure
= rope target
```

No explanatory Player dialogue here.

---

## 8. Story Beat 1

After the first gameplay read:

```text
CONTINUITY CONTROL
INCIDENT OPERATIONS ACTIVE
```

No Player Bark.

The game first lets the Player absorb that this facility is a live incident-control site.

---

## 9. Phase B — Core Gap 1

```text
RECEPTION
→ H2A
→ H2B
→ H2C
→ H2D
→ H2E
→ CONTROL VOID
```

This is the first large left→right traversal.

Hardpoints should read as one sparse maintenance-joint chain,
not a generic ceiling full of grapple nodes.

---

## 10. Story Beat 2

At Control Void:

```text
CITY SYSTEM STATUS
DEGRADED
```

This establishes:

```text
CITY
damaged

CONTINUITY FACILITY
still active
```

without explaining why.

---

## 11. Phase C — Core Gap 2

```text
CONTROL VOID
→ H3A
→ H3B
→ H3C
→ H3D
→ H3E
→ INSPECTION
```

Direction reverses right→left.

It must not feel like a mirror copy of Gap 1.

Gap 2 is more vertically compressed and partially occluded by CORE B/C,
while always keeping:

```text
current usable hardpoint
+
next meaningful hardpoint
```

readable.

---

## 12. Story Beat 3 / Player Bark

Inspection is TRUE SAFE.

System:

```text
CONTROL NETWORK
ONLINE
```

Wait:

```text
0.4–0.7 sec
```

Then local Player Bark:

> **`…아래쪽은 끊겼는데, 여긴 사고 때도 돌아가고 있었네.`**

Then:

```text
1.0–1.5 sec clean ambience
```

This line connects two visible/known facts only:

```text
PREVIOUS
LOWER ASCENT FEEDER
ISOLATED

CURRENT
CONTINUITY CONTROL
INCIDENT OPERATIONS ACTIVE
CONTROL NETWORK
ONLINE
```

It does **not** mean:

```text
Continuity Control caused the isolation
Priority caused the isolation
a specific person ordered the isolation
```

---

## 13. H4 Safe / Flow Read

After Story, Player sees two Base-clear options.

### SAFE

```text
INSPECTION
→ H4_SAFE_A
→ H4_SAFE_B
→ H4_SAFE_C
→ H4_SAFE_D
→ H4_SAFE_E
→ H5
```

Characteristics:

- more readable stopping points
- more attach/release
- easier correction
- recovery surface available

### FLOW

```text
INSPECTION
→ H4_FLOW_A
→ H4_FLOW_B
→ H4_FLOW_C
→ H4_FLOW_D
→ H4_FLOW_E
→ H5
```

Characteristics:

- fewer stable pauses
- momentum-friendly
- Base Rope clear
- no Augment required

Neither is the required “correct” answer.

Purpose:

> **before Jammer appears later, teach the Player to notice more than one possible next Rope.**

---

## 14. Final Core

CORE D is the largest/cleanest sealed mass.

Player cannot grab the Core itself.

```text
H5
→ H6
→ FINAL
```

This final ascent should make the Player feel small against the command architecture.

---

## 15. Exit

Final Deck is TRUE SAFE.

System preview:

```text
CONTROL ATRIUM
ACCESS AHEAD
```

Objectives:

```text
final-deck-reached
→ exit-panel-engaged
```

Progression target:

```text
5-2
```

5-1 entry authority: `BOSS04 DEFEATED → 5-1`.

Direct `4-8 → 5-1` wiring은 금지한다.

---

## 16. Threat Contract

```text
Enemy       0
AEGIS       0
Jammer      0
Artillery   0
Cutter      0
Scanner     0
Wind        0
Kill Gate   0
Augment Req 0
```

Do not raise difficulty by adding combat.

5-1 difficulty comes from spatial reading and controlled Rope commitment.

---

## 17. Recovery

Three recovery layers.

- R1: first teaching band
- R2: first/second Core Gap
- R3: Inspection / final choice

Target retry time:

```text
≤5 sec
```

A failed crossing should not always reset the entire 7.7k-px route.

---

## 18. Camera

### C0 Entry Establish

Player + large CORE A + H1 + Reception.

### C1 Gap 1 Read

Current and next Hardpoint + gap direction.

### C2 Control Void

Player small in frame + CORE B + reverse route clue.

### C3 Inspection

H4 SAFE + H4 FLOW candidates in one frame.

### C4 Final Core

CORE D mass + H5/H6 + Final Deck.

Never zoom out enough to display the whole 4608×2432 Stage at once during normal gameplay.

---

## 19. Dialogue Rule

Only one Player Bark is authored in 5-1.

Approved:

> **`…아래쪽은 끊겼는데, 여긴 사고 때도 돌아가고 있었네.`**

Forbidden:

```text
“…여긴 뭐 하는 곳이지?”
```

because it forgets previous Story knowledge.

Forbidden:

```text
“…Continuity Control이었네.”
```

because it merely repeats system terminology.

Forbidden:

```text
“…여기서 아래쪽을 끊은 거구나.”
```

because it asserts an unproven cause.

---

## 20. Story Boundary

5-1 may confirm:

- Continuity Control exists.
- Incident Operations were active.
- City System Status is degraded.
- Control Network is online.

5-1 must not reveal:

- Capacity shortage.
- Priority Directive.
- Route Suspension Authorization.
- exact evacuation consequence.
- who ordered anything.
- organizational responsibility conclusion.

Those belong to later Sector05 stages.

---

## 21. Runtime Status

### VERIFIED

- Base Rope effective authored reach: 400px.
- current engine supports collision surfaces that are non-grappleable.
- Direction Runtime v1 and `direction-spec-v1` schema exist.
- existing 5-1 planning sourceAreaId is `sector-05-01`.

### NOT IMPLEMENTED

- Sector05 authored runtime connection.
- REV8 4608×2432 geometry.
- `sealed-corporate-surface-v1` as an authoring preset.
- 5-1 Direction migration.
- 5-1 Story/Bark runtime binding.

Important:

> `sealed-corporate-surface-v1` is an **authoring preset gap**, not a new Rope physics requirement.

Implementation may either create that preset or author equivalent current Runtime surfaces with:

```text
collision yes
grappleable false
```

while preserving Stable IDs and visual legibility.

---

## 22. Release Gates

REDESIGN / BLOCK release if:

- any mandatory Base Rope relation exceeds 400px.
- Sealed Core faces can be attached to.
- valid Hardpoints are visually ambiguous.
- Stage feels like stretched old 1600×1420 blockout.
- large bounds become empty walking.
- H4 has an objectively dominant route.
- Enemy/Scanner/Wind is added.
- the Player Bark fires before the network state is read.
- Player dialogue claims causality.
- Direction Runtime duplicates legacy Story presentation.
- direct `4-8 → 5-1` transition is added.
