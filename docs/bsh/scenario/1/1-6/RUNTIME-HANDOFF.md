# 1-6 RUNTIME HANDOFF — REV8.0

Baseline:
`ea9c4438c0f106474baa09621bfb42ae5876b86e`

## Before edit

Fetch latest main and record SHA.

Re-read:
- `src/game/world/areas/sector01/Sector01AreaCatalog.js`
- Wind Runtime owner(s)
- `src/game/presentation/AuthoredStoryPresentation.js`
- `src/game/presentation/` directory
- Access Module / Sector progression owner
- `docs/enemy-density-composition.md`
- approved 1-5 Runtime if landed

If relevant contracts changed, report before applying coordinates.

## Implementation order / Seam

Current baseline still contains old 1-5 Runtime.

Therefore:
1. reconcile approved 1-5 REV8 first
2. read actual 1-5 final deck / exit / Seam
3. adjust only minimal 1-6 entry connector
4. preserve 1-6 cross-flow topology
5. test seamless Camera / spawn handoff

Do not revert 1-6 to a vertical shaft for coordinate convenience.

## Preserve current systems

Fan A:
- LEFT
- continuous
- 500
- falloff 80
- damage false

Fan B:
- RIGHT
- pulsed
- 800
- falloff 80
- cycle 1.75 / 0.7 / 1.4 / 0.3
- damage false

Access:
- Module B
- Carrier + 2 Guards
- optional main-route relationship

## Re-author geometry

Implement:
`ENTRY RIGHT → FAN A LEFT SWEEP → WIND SHADOW → FAN B RIGHT SWEEP → EXIT RIGHT`

Target bounds:
`3840×1280`

Mainline:
0 enemies.

All 3 enemies:
optional far-left Intake Pocket.

## Wind Baffle

Must be a real Wind Occluder:
- static
- solid
- non-grappleable
- non-damaging
- blocks Fan A influence into Neutral Shadow

The Player should feel a clean force contrast.

## Fan A lesson

First Wind should assist desired leftward movement.

Do not add combat.

Provide local recovery.

## Fan B lesson

Same route supports:
- LULL / DECAY = control
- WARNING / ACTIVE = faster, more commitment

Do not implement a simple “red means stop” gate.

Do not require ACTIVE.

Do not make ACTIVE universally optimal.

## Access Module B

Access route:
Neutral → Access A → Access B → Intake.

Return:
Intake → Access B → Access A → Neutral.

Use Carrier + 2 Guards.

Do not introduce third Wind rule.

Residual continuous Fan A behavior is allowed if spatially coherent.

## Story

Preserve:
`COOLING DISTRIBUTION / AIRFLOW UNSTABLE`

Do NOT create visible Story from:
- cooling-pressure-critical
- bypass-required

unless another current authoritative design explicitly binds them.

## Player Barks

If no Bark layer exists:
- leave all three as NOT IMPLEMENTED
- report this clearly
- do not fake Barks through System Toast
- do not block Stage

If implementing a Player Bark layer in scope:
- visually distinguish Player speech from System presentation
- local-player only
- world continues
- no input capture
- once per Stage attempt
- no replay spam

### Bark A
`뭐야—!`

Trigger:
first meaningful unexpected Fan A lateral influence while airborne/attached.

Not:
Stage entry.

### Bark B
`…바람 때문에 밀린 건가.`

Trigger:
first arrival at Neutral Wind Shadow after Fan A traversal.

### Bark C
`…이 바람, 이용할 수 있겠는데.`

Trigger:
successful Fan B traversal after meaningful WARNING/ACTIVE assistance.

Not:
LULL-only clear.
Not:
ACTIVE state start.
Not:
failure.

## Camera

Re-author around:
1. airflow-preview
2. fan-a-crossflow
3. neutral-shadow
4. fan-b-crossflow
5. access-intake
6. exit

Horizontal movement needs look-ahead in travel direction.

No forced cinematic pan.

## Tests

Required:
- bounds/topology
- Fan A direction/mode/strength
- Fan B direction/mode/strength/cycle
- Baffle Wind occlusion
- 0 mainline enemies
- 3 optional Access enemy slots
- Module B Carrier ownership
- no fan damage
- no moving platform / instant death
- local recovery
- Fan B LULL viability
- Fan B ACTIVE viability
- Story Entry regression
- unverified triggers do not accidentally Toast
- Bark trigger tests if Bark layer is implemented
- Seam transition from landed 1-5
- multiplayer smoke

Report:
- starting SHA
- final SHA
- files changed
- exact physics changes if any
- tests/checks
- remaining HYPOTHESIS / NOT IMPLEMENTED
