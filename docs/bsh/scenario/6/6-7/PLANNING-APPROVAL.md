# ONE ROPE — SECTOR 06-7 CONTAINMENT LATTICE — REV2.1 APPROVED

> Status: **USER APPROVED DIRECTION · FULL STATIC QA PASSED · DESIGN LOCKED · NOT IMPLEMENTED**
> Baseline checked: `8b344f0f7a2309bfb316655668ed180718db7781`
> Role: FINAL CUTTER MASTERY / ROPE-CUT RECOVERY / PRE-CLIMAX

---

# 0. QA outcome

REV2 concept passed.

REV2.1 makes one fairness-only correction:

```text
Recovery x offset
±420px → ±330px
```

Reason:
- still outside Cutter Activation x-band `[-300,+300]`
- more likely to catch the player after a real Rope Cut
- no new progression bypass.

All non-adjacent Main Route pairs were exhaustively checked.

```text
Base-Reach skip pairs <=400px:
0
```

---

# 1. Spatial identity

> **RISING CONTAINMENT LATTICE / THREE OFFSET RECOVERY TIERS**

Main route continuously rises through:

```text
P1 SAFE
→ BAY A
→ BAY B
→ BAY C
→ P2 FULL SAFE
→ PAD03 FINAL APPROACH
```

Recovery tiers are:
- off-axis
- disconnected
- landing-only
- non-grappleable.

No continuous lower route.

---

# 2. Runtime contract

Latest checked main:

`8b344f0f7a2309bfb316655668ed180718db7781`

Current Rope:

```text
hookSpeed              1200
hookFlightRatio        1/3 sec
Derived Hook Reach     400px
hookReloadSeconds      0.5
attachBufferSeconds    0.1
swingImpulse           780
releaseAngularTransfer 0.55
```

Current Rope Cut result:

```text
Rope detach
Swing Drag clear
Attach Buffer clear
Launcher clear
Rope disabled 0.60 sec
```

Cutter projectile must have:

```text
canCutRope = true
```

6-7 achieves that through:

```text
rules includes "cutter-fire"
```

No forced scripted cut.

---

# 3. Enemy

```text
S1
CUTTER SENTRY T1 ×1
STATIONARY
position (+360,-1160)
```

Rules:

```text
standard-projectile
cutter-fire
kill-optional
```

Combat hardpoint distances from S1:

H2     722.5px
H3    440.45px
H4    300.83px
H5     522.4px
H6    590.59px
H7     501.2px

All H2–H7 are inside current 760px attack range.

---

# 4. Activation

```text
x -300 ~ +300
y -1680 ~ -650
```

Contracts:

```text
P1 OUT
H2–H7 IN
P2 OUT

R0 OUT
R1 OUT
R2 OUT
```

Recovery therefore gives a real reset window.

---

# 5. Final route

```text
P0  (-420,  -80)
H1  (-420, -300)
P1  (-420, -500)

H2  (-180, -680)
H3  (  80, -820)
H4  (  80,-1050)
H5  (-160,-1210)
H6  (-160,-1440)
H7  ( 120,-1600)

P2  ( 120,-1810)
H8  ( 340,-1970)
P3  ( 500,-2140)
```

Metrics:

```text
Mandatory links   11
Route length      2801.71px
Vertical gain     2060px
Max relation      322.49px < 400px
```

Adjacent distances:

`220.0, 200.0, 300.0, 295.3, 230.0, 288.44, 230.0, 322.49, 210.0, 272.03, 233.45`

---

# 6. Exhaustive anti-skip QA

Every forward pair separated by at least one authored node was checked.

Result:

```text
NON-ADJACENT FORWARD PAIRS <= 400px
NONE
```

Therefore Base Reach cannot skip:
- P1 preview
- any Cutter Bay beat
- P2 Full Safe
- final H8 approach.

---

# 7. Recovery tiers

## R0
```text
(-330,-600)
```

Reachable authored nodes ≤400px:

{"H1": 313.21, "P1": 134.54, "H2": 170.0}

No H3+ bypass.

## R1
```text
(+330,-1000)
```

Reachable authored nodes ≤400px:

{"H3": 308.06, "H4": 254.95}

No H5+ bypass.

## R2
```text
(-330,-1420)
```

Reachable authored nodes ≤400px:

{"H5": 270.19, "H6": 171.17}

No H7+ bypass.

Target after actual Rope Cut:

```text
stable landing     ≤2 sec
next attach        ≤3 sec
main-band recovery ≤5 sec
```

These are Runtime-validation targets, not document-stage claims.

---

# 8. Difficulty / pacing

```text
Difficulty        ★★★★☆
First Play        145–195 sec
Skilled           60–80 sec
```

Relative curve:

```text
6-5  ★★★★   Scanner timing
6-6  ★★★★   sustained Patrol body path
6-7  ★★★★☆  Rope Cut + Recovery
6-8          threat-free movement climax
```

6-7 is the highest mechanical-pressure general Stage.

---

# 9. Sector06 concept QA

Sector06:

> **THE GOAL IS VISIBLE; THE ROOM IS GONE.**

6-7 passes because:
- open-sky vertical lattice, not enclosed room
- structure is readable as exposed truss/bay infrastructure
- Pad03 remains visible and visibly closer
- main route is a visible structural chain
- missing a Rope does not mean disappearing into the sky.

Lattice bodies are architectural trusses, not grapple surfaces.

---

# 10. Story boundary

Entry:

```text
CONTAINMENT LATTICE
SECURITY / ACTIVE
```

P1:

```text
ROPE INTERDICTION
ACTIVE
```

P2:

```text
ROOFTOP PAD 03
FINAL APPROACH / AHEAD
```

Exit:

```text
ROOFTOP PAD 03
FINAL APPROACH / OPEN
```

No combat Bark.

Forbidden here:
- ACCESS DENIED
- CONTAINMENT VIOLATION
- Final Security identity
- Shuttle boarding.

---

# 11. Final QA matrix

| Check | Result |
|---|---|
| Latest main | PASS |
| Hook Reach 400px | PASS |
| All mandatory adjacent links <400 | PASS |
| Exhaustive non-adjacent skip scan | PASS — 0 skips |
| Continuous ascent | PASS |
| H2–H7 inside Cutter range | PASS |
| P1/P2 outside activation | PASS |
| R0/R1/R2 outside activation | PASS |
| Recovery cannot skip later bay | PASS |
| One Cutter only | PASS |
| No Patrol/Wind/Scanner | PASS |
| Real projectile Rope-cut contract | PASS |
| No forced scripted Cut | PASS |
| Map size vs 6-6 | PASS |
| Difficulty curve vs 6-6/6-8 | PASS |
| Open-Sky concept | PASS |
| Pad03 goal continuity | PASS |
| Story boundary | PASS |
| Runtime physical clear | REQUIRED AFTER IMPLEMENTATION |
