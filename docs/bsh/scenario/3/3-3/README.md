# ONE ROPE — SECTOR 03-3 CENTRAL RETAIL WALK — REV8 STAGE DRAFT REV3

> Status: DESIGN LOCKED  
> Runtime audit baseline: `d588aa041a350cab198cd187d8dccbe3b3a244dd`  
> Sector 03 Master Plan: REV3  
> REV1: HOLD — TOO LINEAR  
> REV2: HOLD — MORE LANDMARKS, BUT STILL MOSTLY ONE-WAY ASCENT  
> Proposed REV3 target: **`3712×1792`**  
> Spatial Signature: **ALTERNATING ESCALATOR ATRIUM / SWITCHBACK CROSSING WITH CENTRAL SECURITY DIP**  
> Dominant Movement: **`↗ → ↖ → ↘ → ↖ → ↗`**  
> Stage Role: **FIRST SCANNER + PATROL SYNTHESIS / TRUE DIRECTION-CHANGE STAGE**

---

# 0. USER CORRECTION

The problem was not simply that the map looked visually plain.

The real problem:

> **Player movement kept going in one overall direction.**

REV3 therefore changes the movement vector itself.

Not:

```text
RIGHT + UP
RIGHT + UP
RIGHT + UP
```

But:

```text
↗
↖
↘
↖
↗
```

The Player repeatedly changes facing / swing direction.

---

# 1. ARCHITECTURAL CAUSE

Central Retail Atrium normally uses **alternating escalator banks**.

Real mall circulation often switches direction between floors:

```text
LEVEL 1  → escalator up-right
LEVEL 2  → escalator up-left
LEVEL 3  → cross bridge
LEVEL 4  → escalator up-right
```

After the incident:

- escalator steps are broken/stalled
- landings remain
- maintenance anchors remain
- one central wayfinding/service gantry remains
- security patrol still covers the central crossing

Therefore the Player must use Rope along the surviving **switchback retail circulation**.

Direction changes are architectural, not arbitrary.

---

# 2. RUNTIME CONTRACT — KEEP

- `sector-03-03`
- subtitle `SCANNER + PATROL`
- one Scanner Group:
  `sector-03-03:scanner-retail-A`
- Scanner cycle:
  `AVAILABLE 1.5 / WARNING .6 / LOCKED 1.1 / RESET .3`
- current Rope persists through LOCK
- Patrol Drone:
  `sector-03-03:drone-1`
- Patrol speed 48
- wait .45
- pingpong
- no Rope Cut
- Support Pool Guard:
  `sector-03-03:retail-support-guard`
- total Enemy slots = 2
- Story:
  - `RETAIL SECURITY / ACTIVE`
  - `VERTICAL SERVICE ROUTE / AUTHORIZATION INVALID`
  - `AUTOMATED PATROL / ONLINE`
- no Access Module
- no Wind
- exit → 3-4

---

# 3. SCALE

Target:

**`3712×1792`**

Local:
- X `-1856..+1856`
- Y `0..-1792`

This is still larger than 3-2 in perceived vertical public-space scale.

But unlike REV2,
the Player does not simply travel from left edge to right edge.

The route repeatedly crosses the Atrium centerline.

---

# 4. MASTER SILHOUETTE

```text
Y -1792

                                      EXIT MEZZANINE █████
                                              ↗
                                           G7 ●

                     WEST UPPER BRIDGE █████
                                      ↖
                                   G6 ●
                                 ↖

                       CENTRAL LOW GANTRY
                       C2 ●──────G5
                         ↘
                           ↘
                    PATROL BAND

       WEST OBSERVATION █████
                     ↖
                  G3 ●
                ↖

                         EAST MID LANDING █████
                                      ↗
                                   G2 ●
                                 ↗

          LOWER RETAIL █████
                     ↗
                  G1 ●
                ↗
ENTRY ████

Y 0
```

Actual rhythm:

> **LOWER LEFT → EAST MID → WEST HIGH → CENTRAL LOWER → WEST UPPER → EAST EXIT**

This is the key change.

---

# 5. PHASE A — LOWER RETAIL → EAST MID

Entry:
`(-1680,-32)`

P0:
- W224
- Y0

G1:
`(-1376,-224)`

P1 Lower Retail:
- X `-1472..-1120`
- W352
- Y `-256`

G1B:
`(-960,-352)`

G2:
`(-768,-480)`

P2 East Mid Landing:
- X `-544..-160`
- W384
- Y `-544`

Movement:

> **long ↗**

Mandatory reach is split by G1B so the direction stays long/up-right without exceeding Base Rope reach.

This follows the first broken escalator bank.

No Scanner.
No enemy.

---

# 6. PHASE B — EAST MID → WEST OBSERVATION

The next escalator bank points back the other way.

G3:
`(-832,-704)`

P3 West Observation:
- X `-1216..-832`
- W384
- Y `-768`

Movement:

> **↖**

This is the first real direction reversal.

No enemy pressure.

P3 is fully safe.

---

# 7. STORY AT WEST OBSERVATION

From P3 the Player sees:

- C1/C2
- Patrol band below/right
- Central Gantry destination
- next upper west route

Story displays:

```text
VERTICAL SERVICE ROUTE
AUTHORIZATION INVALID
```

and:

```text
AUTOMATED PATROL
ONLINE
```

No Player Bark.

The point is:
> read the space, not explain it.

---

# 8. PHASE C — WEST OBSERVATION → CENTRAL SECURITY DIP

This is the Stage's synthesis peak.

Instead of always climbing,
the Player must deliberately **descend into the Atrium center**.

C1:
`(-608,-896)`

C2:
`(-256,-1024)`

G4:
`(+96,-1088)`

Central Gantry P4:
- X `+96..+416`
- W320
- Y `-1120`

Movement:

> **↘**

This is a strong contrast against the previous two climbing phases.

Distances:

P3 edge → C1:
~267px

C1 → C2:
~374.5px

C2 → G4:
~357.8px

G4 → P4:
short landing.

Scanner + Patrol overlap only here.

---

# 9. PATROL BAND

Patrol Drone:
`sector-03-03:drone-1`

Proposed path:

> **`(-384,-976) ↔ (+352,-976)`**

Keep:
- speed 48
- wait .45
- pingpong
- no Rope Cut

Activation band:
roughly:
- X `-512..+512`
- Y `-1160..-840`

P3 remains outside.
P4 exits sustained pressure.

Decision:

```text
Scanner state
+
Patrol side
↓
commit downward-right
↓
land on central gantry
```

This is intentionally a **descending commit**.

That gives the Stage a unique failure/read direction.

---

# 10. RECOVERY

Recovery A:
around `(-224,-768)`

W256.

Retry:
`4–6s`.

Recovery cannot walk to P4.

Patrol should not keep firing into Recovery.

---

# 11. PHASE D — CENTRAL GANTRY → WEST UPPER BRIDGE

After landing centrally,
the Player does not continue right.

Instead the surviving upper retail bridge is back to the left.

G5:
`(-128,-1248)`

G6A:
`(-352,-1328)`

G6:
`(-512,-1376)`

P5 West Upper Bridge:
- X `-832..-512`
- W320
- Y `-1408`

Movement:

> **↖**

This is the second major direction reversal.

No Scanner.
Patrol pressure has ended.

---

# 12. SUPPORT GUARD — SLOT 2

Stable:
`sector-03-03:retail-support-guard`

Support Pool.

Target:
around `(-672,-1408)`.

Rules:
- activates only on P5
- no Scanner overlap
- no Patrol overlap
- kill optional
- no Rope Cut
- no kill gate

This is short local pressure.

---

# 13. PHASE E — WEST UPPER → EAST EXIT

The final surviving public/service connector crosses upward-right.

G7:
`(-160,-1536)`

G8:
`(+192,-1624)`

Exit P6:
- X `+544..+864`
- W320
- Y `-1696`

Movement:

> **↗**

Easy finish.

No enemy.

Final mandatory Rope links after reach correction:
- P5 → G7 ≈374.5px
- G7 → G8 ≈362.8px
- G8 → Exit ≈359.3px

All mandatory links remain ≤400px.

This creates final direction rhythm:

```text
↗
↖
↘
↖
↗
```

---

# 14. WHY THIS IS NOT 3-2 AGAIN

3-2:
> wraps one Media Wall at three service layers.

Direction changes:
`L→R → R→L → L→R`

3-3 REV3:
> follows alternating public escalator banks and crosses the Atrium center vertically.

Direction changes:
`↗ → ↖ → ↘ → ↖ → ↗`

Differences:
- sectional switchback rather than facade wrap
- central downward commit
- public retail architecture
- Scanner+Patrol only on the downward center crossing
- support pressure on a later west bridge

Meaningful overlap:
direction reversal only.

PASS.

---

# 15. PLAYER EXPERIENCE

Remembered sequence:

1. **오른쪽 위로 끊긴 에스컬레이터를 오른다.**
2. **다음 층에서 왼쪽 위로 방향을 바꾼다.**
3. **Observation Balcony에서 아래 중앙 Security Gantry를 본다.**
4. **Scanner + Patrol 타이밍을 읽고 오른쪽 아래로 내려간다.**
5. **중앙에서 다시 왼쪽 위로 빠져나간다.**
6. **마지막에 오른쪽 위 Exit로 상승한다.**

If Player describes it as:

> “계속 오른쪽으로 올라가는 맵”

FAIL.

---

# 16. CAMERA

## Entry
Player + first up-right escalator bank.

## East Mid
Player + next leftward upper landing.
The direction change must be visually obvious.

## West Observation
Show:
- Player
- C1/C2
- Patrol
- central lower Gantry
- next left-upper escape direction hinted

## Security Dip
Camera must preserve the sense of **descending into danger**.

## Central Gantry
Next target should clearly point back left/up.

## West Upper
Support Guard local frame.

## Exit
Final right/up direction and 3-4 threshold.

---

# 17. STORY

Keep exact System story:

```text
RETAIL SECURITY
ACTIVE
```

```text
VERTICAL SERVICE ROUTE
AUTHORIZATION INVALID
```

```text
AUTOMATED PATROL
ONLINE
```

No new social truth.

No Player dialogue by default.

---

# 18. MAP SIMILARITY

vs 3-1:
- 3-1 = one huge arc via central island
- 3-3 = alternating switchback + central downward security dip
PASS.

vs 3-2:
- only overlap is direction reversal
- architecture / rhythm / threat relation differ
PASS.

vs 2-7:
- not diagonal→vertical mast
PASS.

vs 1-7:
- not enclosed S corridor
- open atrium and sectional escalator logic
PASS.

vs 1-5:
- no drop-return loop
PASS.

Maximum meaningful overlap:
**1**

---

# 19. OBSTACLE FUNCTION

Every reversal has a real cause:

- alternating escalator banks
- surviving observation balcony
- hanging central service gantry
- upper retail bridge
- final mezzanine connector

No arbitrary zigzag platforms.

PASS.

---

# 20. PACING

Difficulty:
★★★

First:
`2:30–3:20`

Mastered:
`1:10–1:40`

The difficulty peak is Phase C only.

REDESIGN if:
- direction change is not readable before jump/swing
- Player gets lost because destination is behind camera
- P3→Central descent feels like accidental fall
- Patrol fires into Recovery
- Support Guard overlaps Phase C
- route still feels globally one-directional

---

# 21. FIVE GATES

MAP SCALE:
PASS

MAP DIRECTION VARIETY:
**PASS CANDIDATE**
`↗ → ↖ → ↘ → ↖ → ↗`

MAP SIMILARITY:
PASS

OBSTACLE FUNCTION:
PASS

CURRENT RUNTIME:
1 Scanner Group + Patrol + Support Guard + Story + Exit contract preserved.

---

# 22. STATUS

```text
3-3 REV1
HOLD

3-3 REV2
HOLD

3-3 REV3
3712×1792

DIRECTION RHYTHM:
↗ → ↖ → ↘ → ↖ → ↗

USER APPROVED / DESIGN LOCKED
```


---

# 23. PACKAGING-TIME RE-AUDIT

Final packaging baseline:

`d588aa041a350cab198cd187d8dccbe3b3a244dd`

Latest `main` was rechecked at packaging time.

Verified current Runtime contract:
- area `sector-03-03`
- runtime name `RETAIL SECURITY WALK`
- subtitle `SCANNER + PATROL`
- current bounds `1280×1184`
- one Scanner Group `sector-03-03:scanner-retail-A`
- current Scanner cycle `1.5 / 0.6 / 1.1 / 0.3`
- current controlled surfaces C1/C2
- fixed Patrol `sector-03-03:drone-1`
- Patrol current baseline path `(-256,-560) ↔ (+256,-560)`
- Patrol speed `48`, wait `.45`, pingpong
- pooled Support Guard `sector-03-03:retail-support-guard`
- total enemy slots exactly 2
- Story objects/copy:
  - `RETAIL SECURITY / ACTIVE`
  - `VERTICAL SERVICE ROUTE / AUTHORIZATION INVALID`
  - `AUTOMATED PATROL / ONLINE`
- no Access Module
- no Wind
- no Rope Cut
- Exit contract continues to `sector-03-04`

REV8 re-authors geometry, patrol path and activation placement,
but preserves those behavior/system contracts.
