# ONE ROPE — SECTOR 04-1 UPPER RESIDENTIAL ARRIVAL — REV1.0

> Status: **DESIGN LOCKED — FULL PACKAGE**
> Sector04 Master: **UPPER RESIDENTIAL / AMENITY DISTRICT**
> Theme: **PRIVILEGE IS PROTECTED**
> Authoring snapshot: `4551798860193a16e53814aae5c3a42022b4e1cf`
> Previous REV2: **SUPERSEDED — MAP SIMILARITY FAIL vs 2-6**
> Legacy Runtime `sector-04-01 / TRANSIT INTAKE`: **SUPERSEDED FOR NEW AUTHORING**
> New 4-1 Runtime: **GENERATED / PLAYABLE**
> Post-Sector03 transition → 4-1: **3-8 → Boss03 → 4-1 authored Entry**

---

# 0. REV3 REDESIGN REASON

REV2 had:

```text
M0 SAFE
→ LARGE GARDEN VOID
→ INWARD TURN
→ LONG UPPER BALCONY
→ LATE PATROL
```

This overlapped too strongly with Sector02-6:

```text
SAFE REVEAL
→ COURTYARD VOID
→ 90° TURN
→ LONG UPPER RESIDENTIAL RIM
→ LATE SECURITY
```

Overlap axes:
- large residential void
- meaningful turn around void
- long upper rim
- late security

Result:
**4 overlaps → REDESIGN REQUIRED**

REV3 removes that skeleton completely.

---

# 1. REV3 SPATIAL SIGNATURE

> **SUNKEN SKY-GARDEN BASIN / CROSS-VALLEY RESIDENTIAL ASCENT**

Core section:

```text
HIGH LEFT ARRIVAL TERRACE

        ↘
          ↘
            SUNKEN GARDEN BASIN
ENTRY ───────╲_______________________________
               → → → PATROL → → →
                                             ╲
                                              ↗
                                                ↗
                                          FAR-SIDE
                                     RESIDENTIAL ASCENT
                                                ↗
                                             PRIVATE LOBBY
```

Dominant movement:

> **`↘ DESCEND → LONG LOW CROSSING → ↗ / ↑ FAR-SIDE ASCENT`**

This is not:
- rim traversal,
- courtyard orbit,
- free-weave,
- switchback atrium,
- one diagonal rise.

---

# 2. MAP SCALE

Bounds:

> **4992×2112**

Local:
- X `-2496..+2496`
- Y `0..-2112`

Direct comparison:

```text
3-8
4608×2176
Upper Exchange / dense security weave

4-1 REV3
4992×2112
Upper Residential / wide basin section
```

4-1 total authored area:
**1.051× 3-8**

Mandatory route X span:
- Entry `-2240`
- Exit `+2208`
- span **4448px**
- width usage **89.1%**

The additional width is actually traversed.

---

# 3. STAGE ROLE

**SECTOR CONTRAST / FIRST UPPER RESIDENTIAL REVEAL**

First Player question:

> **“도시는 비상상황인데, 왜 여기는 아직 이렇게 정상적으로 유지되고 있지?”**

4-1 does not teach Persistent Pursuit.

It establishes:
1. Upper Residential scale.
2. Maintained environment.
3. Active moving security.
4. Large residential landscape is playable space, not backdrop.

---

# 4. PHASE A — HIGH ARRIVAL TERRACE

Entry:

`(-2240,-448)`

A1:
`(-1952,-320)`

M0:
`(-1664,-256)`

The Player enters on a **raised residential arrival terrace**.

M0:
**FULL SAFE**

From here the Player can see down into the Garden Basin.

Important first impression:

> the Stage initially asks the Player to go **down**, not climb up.

This immediately differentiates 4-1 from Sector02/03 climb openings.

---

# 5. STORY BEAT A — NORMALITY FROM ABOVE

Before System text, Player sees:

- maintained multi-level residences,
- active landscape lighting,
- water circulation,
- large sunken communal garden,
- clean terrace surfaces,
- almost no people,
- Security visible in the distance but not acquiring.

At M0:

```text
UPPER RESIDENTIAL DISTRICT
ENVIRONMENTAL SERVICE / NORMAL
```

0.5–0.8 sec later:

> **PLAYER: `…여긴 아직 다 돌아가고 있네.`**

No explanation.

No:
- `PRIVILEGE`
- `UPPER CLASS`
- `PRIORITY RESIDENT`
- Group C causality.

---

# 6. PHASE B — DESCENT INTO THE GARDEN BASIN

From M0:

D1:
`(-1376,-160)`

B0:
`(-1088,-96)`

The Player descends into the low Garden Basin.

This is intentionally safe/recoverable.

The Garden Basin is **not a death void**.

If the Player loses a Rope during descent:
- they land lower,
- keep moving,
- do not reset to the upper terrace.

Failure direction:

> **DOWNWARD RECOVERY INTO PLAYABLE SPACE**

This is a major identity change from 2-6.

---

# 7. PHASE C — LONG LOW BASIN CROSSING

Basin chain:

```text
B0 (-1088,-96)
→ B1 (-736,-128)
→ B2 (-384,-80)
→ B3 (-32,-144)
→ B4 (+320,-96)
→ B5 (+672,-160)
→ B6 (+1024,-224)
```

Movement:

> **long, shallow, mostly horizontal**

The basin should feel like:
- garden terraces,
- shallow water crossings,
- sunken communal walkway,
- low canopy/pergola Rope points,

but Gameplay Map only shows collision / Rope / enemy.

No lethal environmental hazard.

---

# 8. FIRST SECURITY READ — BASIN CENTER

Exactly:

> **Patrol Drone ×1**

Patrol is placed **mid-Stage**, not at the end.

Proposed authored Patrol route:

```text
(-288,-176)
→ (+96,-256)
→ (+480,-176)
→ (+96,-96)
→ (-288,-176)
```

Mode:
**loop**

Candidate:
- speed `48`
- wait `.35–.45`

Why loop:

4-1 should not repeat a simple left-right corridor Patrol if the architecture is a broad basin.

The Patrol performs a visible **diamond/orbit-like patrol around the central garden crossing**.

No Pursuit behavior.

No Rope Cut.

No kill requirement.

Story confirmation:

```text
RESIDENTIAL SECURITY
ACTIVE
```

No Bark.

---

# 9. PATROL PRESSURE RULE

Patrol activation territory:
**B2 → B5 only**

Must not acquire:
- M0 story terrace,
- descent D1/B0,
- far-side R1,
- ascent,
- final Lobby.

Player choices:
- wait for Patrol to rotate,
- swing above/behind it,
- use low basin landing,
- keep moving.

The question is:

> **“어디로 빠져나가면 Patrol의 시야를 덜 받지?”**

Not:
> “어떻게 추격을 따돌리지?”

That is 4-2/4-3.

---

# 10. PHASE D — FAR-SIDE ASCENT

After B6:

R1:
`(+1280,-416)`

A2:
`(+1440,-736)`

A3:
`(+1248,-1024)`

A4:
`(+1504,-1280)`

A5:
`(+1760,-1536)`

A6:
`(+2016,-1760)`

Exit Lobby:
`(+2208,-1952)`

This ascent is deliberately **not a straight diagonal**.

It includes one architectural recess:

```text
A2 (+1440,-736)
→ A3 (+1248,-1024)
```

The Player enters a recessed residential façade,
then comes back outward/up through A4–A6.

Purpose:
- make the far-side residence feel volumetric,
- avoid a single right-up staircase,
- transition from communal garden to private residential frontage.

---

# 11. FINAL PRIVATE LOBBY

Final Lobby:
around `(+2208,-1952)`

**FULL SAFE**

Patrol cannot acquire.

Preview only:

```text
RESIDENT COURTYARD
SECURITY CONTROL
```

Do not reveal:
- Override A,
- Pursuit,
- 2-of-3 rule.

4-2 owns those.

---

# 12. ENEMY / MECHANIC LOCK

Exactly:

**Patrol Drone ×1**

No:
- Pursuit
- Cutter
- Scanner
- Wind
- Shield
- Artillery
- Support
- Swarm
- Override
- Augment Node
- kill gate

Difficulty:

**★★☆**

---

# 13. STORY FUNCTION

Emotion:

> **CONTRAST**

Story is delivered in this order:

```text
PLAYER ENTERS HIGH TERRACE

↓
SEES HUGE MAINTAINED GARDEN BELOW

↓
SYSTEM CONFIRMS
ENVIRONMENTAL SERVICE / NORMAL

↓
PLAYER DESCENDS INTO THAT SPACE

↓
MOVING SECURITY IS STILL ACTIVE

↓
PLAYER CLIMBS INTO PRIVATE RESIDENTIAL SIDE

↓
4-2 COURTYARD
```

The Player does not merely look at privilege.

They physically traverse the amount of space allocated to it.

---

# 14. FAILURE DIRECTION

This is a major REV3 lock.

REV2:
Garden Void risked becoming another central drop / rim structure.

REV3:

```text
HIGH TERRACE
↓ failure / intended descent
PLAYABLE BASIN
↓
RECOVERY / CONTINUE
```

The basin is part of the main route.

No bottomless central death void.

This helps distinguish it from:
- 2-6 courtyard rim,
- 3-6 atrium flight,
- 3-8 security pockets.

---

# 15. CAMERA

## M0 Reveal

Frame:
- small Player on high-left terrace,
- broad basin below,
- far-right residences,
- distant Patrol moving at basin center.

This is the main Sector04 reveal.

Do not zoom in until scale is lost.

## Basin

Frame:
- Player,
- Patrol,
- next 1–2 Rope targets,
- recoverable lower landing.

## Far-side Ascent

Frame:
- Player,
- recessed A3,
- outward A4,
- distant final Lobby.

## Lobby

Player + safe Lobby + Courtyard preview.

No forced cinematic.

---

# 16. AUDIO / LIGHTING

Audio:
- soft HVAC,
- water circulation,
- quiet garden ambience,
- distant residential chime,
- Patrol positional motor.

No crowd.

Lighting:
- maintained daylight-well / residential interior spill,
- soft landscape light,
- no emergency-red wash,
- no gold-rich cliché,
- no Sector05 corporate control lighting.

---

# 17. MAP SIMILARITY AUDIT

## vs 2-6 QUIET RESIDENTIAL VOID

2-6:
```text
SHORT UP
→ SAFE REVEAL
→ 90° TURN
→ LONG UPPER RIM
→ LATE SECURITY
```

4-1 REV3:
```text
HIGH ENTRY
→ DESCEND
→ PLAYABLE LOW BASIN
→ MID-STAGE LOOP PATROL
→ FAR-SIDE ASCENT
```

Overlap:
- residential-scale reveal only.

**1 / PASS**

## vs 2-1

2-1:
low-rise diagonal rowhouse cut-through.

4-1:
large U-section basin crossing.

Overlap:
residential vocabulary only.

**1 / PASS**

## vs 3-6

3-6:
monumental Atrium flight circuit around open aerial volume.

4-1:
grounded basin descent / low crossing / far-side ascent.

Overlap:
large space only.

**1 / PASS**

## vs 3-8

3-8:
repeated central ↔ side Free-Weave choices with 5 enemies + Scanner.

4-1:
single U-section movement with 1 mid-basin Patrol.

Overlap:
large footprint only.

**1 / PASS**

## vs planned 4-2

4-2:
Courtyard orbit + limited Pursuit + Override A.

4-1:
cross-basin traversal + Patrol only.

Overlap:
upper residential environment.

**1 / PASS CANDIDATE**

---

# 18. OBSTACLE FUNCTION

Gameplay architecture:
- high arrival terrace,
- descending landscape terraces,
- low basin walkway,
- actual basin Rope crossing,
- recessed far-side façade,
- ascending residential ledges,
- private Lobby.

Every major shape changes movement.

No decorative geometry in Gameplay Map.

---

# 19. PACING

First play:
**2:15–3:05**

Mastered:
**1:10–1:40**

Suggested rhythm:

```text
High Reveal
20–30 sec

Story
8–12 sec

Descent
20–30 sec

Basin Crossing + Patrol
45–65 sec

Far-side Ascent
35–50 sec

Lobby
10–20 sec
```

---

# 20. FIVE GATES

MAP SCALE:
> **PASS CANDIDATE**
> `4992×2112`
> actual X usage `89.1%`

MAP SIMILARITY:
> **PASS CANDIDATE**
> max known overlap = `1`

OBSTACLE FUNCTION:
> **PASS CANDIDATE**
> Garden Basin is playable route, not decoration.

STAGE LENGTH:
> **PASS CANDIDATE**
> first `2:15–3:05`

CURRENT RUNTIME:
> **PASS WITH MAJOR RE-AUTHOR**
> Patrol capability verified.
> New Sector04 geometry/story not implemented.

STORY:
> **PASS CANDIDATE**
> Environment first, text second.

---

# 21. REDESIGN CONDITIONS

Redesign if:
- basin becomes a decorative void with rim traversal,
- route no longer descends significantly before rising,
- Patrol moves to final third,
- Patrol becomes Pursuit,
- far-side ascent becomes one straight diagonal,
- M0 is under threat,
- basin failures become instant death,
- actual X route usage drops materially below current ~89%,
- Stage starts reading like 2-6 again,
- Override A appears here.

---

# 22. APPROVAL SUMMARY

```text
4-1 UPPER RESIDENTIAL ARRIVAL
REV3 DRAFT

4992×2112

HIGH LEFT ARRIVAL
↓
M0 FULL SAFE / BASIN OVERLOOK

UPPER RESIDENTIAL DISTRICT
ENVIRONMENTAL SERVICE / NORMAL

PLAYER
“…여긴 아직 다 돌아가고 있네.”

↓
DESCEND
↘
SUNKEN SKY-GARDEN BASIN

→ → LOOP PATROL ×1 → →

RESIDENTIAL SECURITY / ACTIVE

↓
FAR-SIDE RESIDENTIAL ASCENT
↗
RECESSED FAÇADE
↗
PRIVATE LOBBY

↓
4-2 RESIDENT COURTYARD

NO PURSUIT
NO OVERRIDE
NO CUTTER
NO SCANNER
NO WIND
NO NEW AUGMENT

MAP SIMILARITY
PASS CANDIDATE — max overlap 1

DESIGN LOCKED
```

## Mandatory Rope Link Audit
- `ENTRY→A1` = `315.16px`
- `A1→M0` = `295.03px`
- `M0→D1` = `303.58px`
- `D1→B0` = `295.03px`
- `B0→B1` = `353.45px`
- `B1→B2` = `355.26px`
- `B2→B3` = `357.77px`
- `B3→B4` = `355.26px`
- `B4→B5` = `357.77px`
- `B5→B6` = `357.77px`
- `B6→R1` = `320.00px`
- `R1→A2` = `357.77px`
- `A2→A3` = `346.13px`
- `A3→A4` = `362.04px`
- `A4→A5` = `362.04px`
- `A5→A6` = `340.16px`
- `A6→EXIT` = `271.53px`

**Max mandatory Rope link = 362.04px / PASS ≤400px**

---

# 23. FINAL AUTHORING AUTHORITY

This README records WHY / PLAYER EXPERIENCE.

Exact design geometry:
`AREA-SPEC-REV1-DESIGN.json`

Exact presentation timing:
`DIRECTION-SPEC.json`

Implementation differences vs current Runtime:
`RUNTIME-HANDOFF.md`

Release checks:
`VALIDATION.md`

Current legacy `TRANSIT INTAKE` Runtime is not evidence that this new design is already implemented.
