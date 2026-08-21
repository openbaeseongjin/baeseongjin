# ONE ROPE — SECTOR 06-5 PAD ACCESS ARRAY — REV2.1 APPROVED

> Status: **USER APPROVED · QA PASSED · DESIGN LOCKED · NOT IMPLEMENTED**
> Baseline checked: `8b344f0f7a2309bfb316655668ed180718db7781`
> Role: ACCESS SCAN MASTERY RECALL / THREE CONTROLLED MOUNTS / STACKED ACCESS TERRACES

---

# 0. Approval + QA correction

REV2 direction was approved.

Pre-package QA found two possible unintended bypasses:

1. Recovery R1 was close enough to allow a direct R1 → C3 attach.
2. C2 → P2 was exactly 400px, allowing C3 to be skipped if P2 remained always grappleable.

REV2.1 fixes both.

Final proof:

```text
P1 → C2       649.0px  > 400
C1 → C3       440.11px  > 400
C2 → P2       441.81px  > 400

C3 → P2       372.02px  < 400

R1 center → C2          176.92px  < 400
R1 nearest edge → C3    442.04px  > 400
```

Therefore the intended controlled sequence is geometrically protected:

> **C1 → C2 → C3 → P2**

---

# 1. Spatial identity

> **STACKED ACCESS TERRACES**

```text
                           EXIT
                            ↑
                     UPPER SAFE
                         ↗
               ┌───────────────┐
               │ TERRACE C     │
               └──────C3───────┘
                      ↖
          ┌────────────────┐
          │ TERRACE B      │
          └────C2──────────┘
                   ↗
             ┌─────────────┐
             │ TERRACE A   │
             └────C1───────┘
                    ↑
              SAFE PREVIEW
                    ↑
                  ENTRY
```

All mandatory route steps continue upward.

Terrace bodies and Recovery R1 are:

```text
LANDING-ONLY
NON-GRAPPLEABLE
```

Only authored hardpoints may be grappled.

---

# 2. Scanner runtime contract

Current Runtime:

```text
AVAILABLE
WARNING
LOCKED
RESET
```

New Attach:

```text
AVAILABLE  allowed
WARNING    allowed
LOCKED     blocked
RESET      blocked
```

Current Rope persists through a phase change into LOCKED.

One shared Scanner group only.

Controlled targets exactly:

```text
C1
C2
C3
```

Cycle:

```text
AVAILABLE  1.5 sec
WARNING    0.6 sec
LOCKED     1.1 sec
RESET      0.3 sec
TOTAL      3.5 sec
```

No phase offset.

---

# 3. Size / difficulty gate

```text
Difficulty        ★★★★
First Play target 105–155 sec
Skilled target    40–60 sec

Mandatory links   8
Route length      2308.9px
Vertical gain     1480px
Max link          372.02px < 400px
```

Difficulty comes from timing density, not oversized travel distance.

Relative pacing:

```text
6-4  LOW / REST
6-5  HIGH / SCANNER TIMING
6-6  HIGH / PATROL BODY-PATH
```

6-5 is deliberately shorter/simpler than the legacy 6-6 combat stage.

---

# 4. Final coordinates

```text
P0  ( 520,  -80) ENTRY
H1  ( 340, -220)
P1  ( 420, -360) SAFE PREVIEW

C1  ( 130, -500) CONTROLLED
C2  (-120, -720) CONTROLLED
C3  ( 140, -940) CONTROLLED

P2  (-160,-1160) FULL SAFE
H4  (  60,-1380)
P4  (-100,-1560) EXIT
```

Mandatory link distances:

`228.04, 161.25, 322.02, 333.02, 340.59, 372.02, 311.13, 240.83`

---

# 5. Recovery

R1:

```text
center (-240,-590)
width  220
```

Contract:

- landing-only
- non-grappleable
- recovery to C1/C2 permitted
- direct C3 skip impossible at Base Reach
- no Scanner bypass
- target retry ≤5 sec

---

# 6. Story

Entry:

```text
PAD ACCESS ARRAY
CONTROL / ONLINE
```

Safe Preview:

```text
PAD SERVICE MOUNTS
ACCESS / CYCLING
```

Exit:

```text
BEACON SPAN
SERVICE PATH / AVAILABLE
```

No Player Bark during timing traversal.

---

# 7. QA Gate result

| Check | Result |
|---|---|
| Latest main checked | PASS |
| Base Hook Reach 400px | PASS |
| Mandatory links <400px | PASS |
| Continuous ascent | PASS |
| C1/C2/C3 exactly 3 | PASS |
| One shared Scanner group | PASS |
| Scanner cycle uses existing precedent | PASS |
| P1 cannot skip C1 | PASS |
| C1 cannot skip C2 via C3 | PASS |
| C2 cannot skip C3 via P2 | PASS |
| R1 cannot bypass C2 into C3 | PASS |
| Terrace surfaces non-grappleable | PASS |
| Recovery ≤5 sec | RUNTIME VALIDATION REQUIRED |
| Difficulty curve 6-4→6-5→6-6 | PASS |
| Map silhouette distinct from 6-3/6-4/6-6 | PASS |
| Story boundary | PASS |
| ACCESS DENIED withheld | PASS |

---

# 8. Runtime-required validation

Not claimed at document stage:

- actual Scanner clear timing
- actual first-play/skilled times
- Recovery ≤5 sec in physics
- C1/C2/C3 visual phase readability on gameplay camera
- no unintended surface-grapple bypass in final Runtime geometry
