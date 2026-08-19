# SECTOR 01-8 — CONTAINMENT GATE — REV8.0

> **DESIGN LOCKED**
> Runtime audit baseline: `ea9c4438c0f106474baa09621bfb42ae5876b86e`
> Current Runtime: `1024×1792`
> REV8 target: **`1664×1792`**
> Spatial signature: **TALL MULTI-LOCK HEADHOUSE / COUNTERFLOW SECURITY LANES**
> Runtime status: `SYSTEM / STORY MATCH — MAJOR BLOCKOUT RE-AUTHOR`

## 1. One-line experience

Sector 01에서 배운 Rope / Augment / Security / Wind를 새 규칙 없이 종합하고,
Maintenance Override 하나가 예상보다 큰 인프라 상태 변경을 일으킨 뒤
**Worker District를 처음 직접 마주하며 Sector 02로 넘어간다.**

Core:

`LOWER SECURITY RIGHTWARD → MID RELIEF → UPPER SECURITY LEFTWARD → FINAL PULSE RIGHTWARD → OVERRIDE → WORKER DISTRICT REVEAL`

## 2. Stage role

1-7:
`WARNING RHYTHM BECOMES GAMEPLAY RHYTHM`

1-8:
**`WORLD STATE CHANGE / SECTOR REVEAL`**

New mechanic:
**NONE**

This is the Sector 01 exam.

Use:
- Rope
- selected Augment
- Security reading
- local recovery
- known Pulse Wind
- manual interaction
- world-state Story consequence

## 3. Current Runtime — VERIFIED

At `ea9c4438c0f106474baa09621bfb42ae5876b86e`:
- name `CONTAINMENT GATE`
- subtitle `FINAL MAINTENANCE ACCESS`
- current bounds `1024×1792`
- Grapple landmarks A / D / F
- exactly 4 Late Pool enemy slots
- sequential activation
- no-crossfire
- standard projectile behavior
- no Rope cut
- final RIGHT pulsed Vent:
  - strength 800
  - falloff 80
  - LULL 1.75
  - WARNING 0.7
  - ACTIVE 1.4
  - DECAY 0.3
  - damage false
- objective:
  `sector-01-08:maintenance-override`
- Gate requires Maintenance Override
- Sector checkpoint exists
- Worker District reveal cue exists

## 4. Verified Story authority

### Entry
`CONTAINMENT GATE / LOCKED`

### Lower progression
`FINAL WARNING`

`RETURN TO LOWER MAINTENANCE`

`CONTAINMENT GATE / CLOSURE IN PROGRESS`

### Mid relief
`CONTAINMENT GATE / LOCKDOWN · 87%`

### Maintenance Override objective
`OVERRIDE LOCK / CONFIRM`

`LOWER GRID CONNECTION / TERMINATING`

### Gate
`WORKER DISTRICT / ACCESS OPEN`

### Sector handoff
`WORKER DISTRICT / BLOCK 12`

These exact Runtime texts are retained.

## 5. Story meaning

Player intends to open their own escape route.

The system reports a larger consequence:
`LOWER GRID CONNECTION / TERMINATING`.

Do NOT claim:
- deliberate sabotage
- intentional accident
- confirmed civilian harm
- who caused the failure

The reveal is:
**the maintenance infrastructure is connected to an inhabited Worker District.**

Sector 02 owns the social consequences.

## 6. Scale

Target:
`1664×1792`

Local:
- X `-832..+832`
- Y `0..-1792`

Height remains finale-scale.

Width:
`1024 → 1664`

Reason:
- two real counterflow Security lanes
- sequential/no-crossfire enemies need lateral separation
- final Pulse needs a genuine movement finish
- safe midpoint and Override zone need distinct staging

Still far tighter than 1-7 `3328×1472`.

The environment compresses as Containment closes.

## 7. Spatial silhouette

```text
                         SECTOR CHECKPOINT
                                ▲
                         OVERRIDE / GATE
                                ▲
FINAL PULSE             LEFT ────────► RIGHT
                                ▲
UPPER SECURITY          RIGHT ◄────── LEFT
                         Guard → Turret
                                ▲
                           MID RELIEF
                                ▲
LOWER SECURITY          LEFT ────────► RIGHT
                         Guard → Turret
                                ▲
                              ENTRY
```

Body rhythm:

**RIGHTWARD FIGHT → SAFE RESET → LEFTWARD FIGHT → RIGHTWARD WIND FINISH → OVERRIDE → REVEAL**

Not a vertical Anchor ladder.

## 8. Entry

Entry:
`(-640,-32)`

P0:
- center `(-608,0)`
- W384

A:
`(-480,-224)`

Story:
`CONTAINMENT GATE / LOCKED`

Camera reveals only:
- Player
- A
- lower lane start

Do not reveal whole finale.

## 9. Lower Security Lane — LEFT → RIGHT

B:
`(-96,-320)`

C:
`(+352,-416)`

Lower Transfer:
- center `(+480,-512)`
- W320

Enemy 1:
Lower Grid Guard around `(-64,-384)`

Enemy 2:
Lower Turret around `(+544,-512)`

Sequence:
**Guard → Turret**

Rules:
- sequential activation
- no-crossfire
- current Late Pool
- no Rope cut
- no Wind

Player movement:
**LEFT → RIGHT**

Combat must happen while moving.

Do not make a stationary shooting arena.

## 10. Lower recovery

R1:
- center `(-128,-176)`
- W288

R2:
- center `(+256,-352)`
- W224

Retry:
`4–7s`

No Stage-start reset from a normal miss.

## 11. Lower Story sequence

After Player has committed to continuing:

1. `FINAL WARNING`
2. `RETURN TO LOWER MAINTENANCE`

Player Bark A:
`…이제 와서 돌아가라고?`

Then:
`CONTAINMENT GATE / CLOSURE IN PROGRESS`

The Player refuses the order through continued play.

## 12. Mid Relief Cell

D:
`(+384,-704)`

Mid Safe Deck:
- center `(0,-832)`
- W512

Fully safe:
- no enemy
- no Wind

Story:
`CONTAINMENT GATE / LOCKDOWN · 87%`

Player Bark B:
`…멈출 생각이 없네.`

Purpose:
- reset combat state
- make closure progression legible
- show Player deciding to continue

## 13. Upper Security Lane — RIGHT → LEFT

Upper Setup E:
`(+416,-960)`

F:
`(+64,-1056)`

G:
`(-384,-1152)`

Upper Transfer:
- center `(-480,-1248)`
- W320

Enemy 3:
Upper Grid Guard around `(+192,-1056)`

Enemy 4:
Upper Turret around `(-544,-1184)`

Sequence:
**Guard → Turret**

Movement:
**RIGHT → LEFT**

Same enemy-system rules,
opposite body direction.

This prevents lower/upper lanes from reading as identical.

## 14. Upper recovery

R3:
- center `(+160,-896)`
- W256

R4:
- center `(-256,-1088)`
- W224

Retry:
`5–8s`

No full Stage reset.

## 15. Final Pulse Finish

After Upper Transfer:
combat ends.

H:
`(-96,-1344)`

I:
`(+352,-1432)`

Override Deck:
- center `(+480,-1536)`
- W352

Final Vent:
- RIGHT
- pulsed
- 800
- current cycle
- no damage

Movement:
**LEFT → RIGHT**

No enemies overlap the final Vent.

This is not a new lesson.

It is a confidence reprise:
- LULL = control
- ACTIVE = speed

## 16. Maintenance Override

Panel:
around `(+512,-1536)`

Objective:
`sector-01-08:maintenance-override`

Safe interaction zone.

Player Bark C:
`좋아… 열어.`

Use immediately before / during committed interaction.
Do not delay input for speech.

Objective Presentation:

1. `OVERRIDE LOCK / CONFIRM`
2. `LOWER GRID CONNECTION / TERMINATING`

## 17. World consequence Bark

After:
`LOWER GRID CONNECTION / TERMINATING`

Player Bark D:
`…하부 연결이 끊긴다고?`

This is the emotional hinge of Sector 01.

Purpose:
- victory becomes concern
- Player notices scale of consequence
- no unsupported causality claim

## 18. Gate open

After Override:
Gate opens.

Verified:
`WORKER DISTRICT / ACCESS OPEN`

**No Player Bark here.**

Reason:
let Gate movement + place-name System text breathe.

Do not stack reveal dialogue immediately.

## 19. Sector checkpoint / final Bark

At Sector checkpoint:

Verified:
`WORKER DISTRICT / BLOCK 12`

Player Bark E:
`사람들이 사는 곳까지 이어져 있었던 건가…`

This is the final Sector 01 realization.

Meaning:
the Player reframes the situation from:
`facility problem`
to:
`facility system connected to an inhabited district`.

Do not explain Group C yet.

## 20. Player Bark Runtime status

Approved 1-8 Bark sequence:

A:
`…이제 와서 돌아가라고?`

B:
`…멈출 생각이 없네.`

C:
`좋아… 열어.`

D:
`…하부 연결이 끊긴다고?`

E:
`사람들이 사는 곳까지 이어져 있었던 건가…`

Status:
**`NOT IMPLEMENTED — PLAYER BARK LAYER`**

At the audit baseline there is no verified dedicated Player Bark layer.

If still absent:
- do not fake these as System Toasts
- do not block gameplay
- report NOT IMPLEMENTED

## 21. Dialogue restraint

Forbidden:
- `내가 하부 전력을 끊었어`
- `사람들이 위험해졌어`
- `회사가 일부러 막은 거야`
- `사고가 조작됐어`
- `여기 사람들을 버린 거야`

Those are not established yet.

## 22. Enemy contract

Exactly 4 Stage slots:

1. Lower Grid Guard
2. Lower Turret
3. Upper Grid Guard
4. Upper Turret

Pool:
current Sector 01 Late Pool.

Rules:
**SEQUENTIAL ACTIVATION / NO CROSSFIRE**

At any time:
one dominant active threat.

No Access Module in 1-8.

No fifth surprise enemy.

## 23. Build expression

No Augment is a Gate key.

Natural advantages:
- fast-launch → combat reacquire / final WARNING timing
- long-rope → earlier security-lane catch
- fast-recover → local recovery
- release-propulsion → lane compression / final carry
- electrified-rope → movement + enemy damage
- collision-explosion → high-speed contact
- direction-dash → shot/landing correction
- dash-strike → Guard pressure
- instant-guard → maintain traversal through readable shot
- push-away → spacing when enemy allows
- straight-shot → pressure enemy from a landing
- slow-fall → long landing correction

No Build:
- replaces Override
- unlocks Gate
- skips checkpoint

## 24. Camera

C01 intro:
~1.08

C02 lower-security:
~0.88
Player + active threat + next Grip.
Do not reveal next enemy early.

C03 mid-relief:
~1.08
safe centered frame.

C04 upper-security:
~0.86
Player + active threat + leftward destination.

C05 final-preview:
~0.94
Vent + H/I + Override Deck.

C06 final-crossing:
~0.84
rightward look-ahead.

C07 override:
~1.10
Player + Panel.

C08 gate-open:
~1.02
immediate passage only.

C09 worker-reveal:
~1.12
transition frame, not full Sector 02 map.

No long forced cinematic pan.

## 25. Pacing

First:
`2:25–3:10`

Mastered:
`1:15–1:45`

Targets:
- Entry 10–15s
- Lower 35–50s
- Mid 8–12s
- Upper 40–55s
- Final Pulse 15–25s
- Override/reveal 15–25s

REDESIGN if:
- first >3:35 without repeated mistakes
- combat becomes stationary
- both Security lanes feel identical
- all four enemies overlap
- final Vent feels like a new mechanic
- Story blocks control too long
- Worker District reveal happens before threat ends

## 26. Five Gates

### MAP SCALE / WORLD FOOTPRINT
**PASS**

### MAP SIMILARITY
**PASS**

### OBSTACLE FUNCTION
**PASS**

Primary:
`COUNTERFLOW SEQUENTIAL SECURITY → KNOWN PULSE REPRISE → MANUAL OVERRIDE`

### LENGTH / PACING
**HYPOTHESIS PASS — PLAYTEST REQUIRED**

### CURRENT GITHUB RUNTIME
**SYSTEM / STORY MATCH — MAJOR GEOMETRY RE-AUTHOR**

## 27. 1-7 → 1-8 Seam dependency

Current baseline still contains old 1-7 geometry.

Before final 1-8 Entry coordinates:
1. land/reconcile approved 1-7 REV8
2. read actual 1-7 Exit/Seam
3. adjust minimal 1-8 connector
4. preserve counterflow security-lane topology
5. test spawn/camera handoff

## 28. Sector 02 handoff dependency

Current `area08.nextAreaId` is null while the Stage has a Sector checkpoint and Worker District handoff presentation.

Do NOT blindly change `nextAreaId`.

Implementation must inspect the current Sector transition/checkpoint owner and preserve its intended transition mechanism.

Only modify transition plumbing if required by that authoritative owner.

## 29. Gameplay Preview

Gameplay-only.

Show:
- collision
- Grapple
- enemies
- real Vent Wind
- recovery
- Override
- checkpoint
- route

Hide:
- decorative Gate mass
- background pipes
- cables
- architecture-only frames
- Sector 02 scenery
