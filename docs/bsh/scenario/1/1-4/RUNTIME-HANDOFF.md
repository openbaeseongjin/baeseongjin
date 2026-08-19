# 1-4 RUNTIME HANDOFF — REV8.1

Baseline: `5ae6efca720720ee34f2a8b45daf1778fd206c1f`

## Before edit

Fetch latest main and record SHA.

Re-read:
- `src/game/world/areas/sector01/Sector01AreaCatalog.js`
- `src/game/presentation/AuthoredStoryPresentation.js`
- `src/game/augments/FoundationAugmentCatalog.js`
- `docs/augment-v1.md`
- `docs/enemy-density-composition.md`
- relevant Augment Runtime / chooser / objective owners discovered from latest tree

If main differs, re-audit before editing.

## Preserve current product rules

- source `sector-01-04:maintenance-node`
- generic compatible deterministic 3-card offer
- no reroll/rarity/category quota
- Player-specific source/pending offer state
- chooser captures only selecting Player gameplay input
- world/enemies/projectiles/teammates continue
- 1-4 enemy budget exactly 1
- Node opens without kill prerequisite
- selection Story:
  - AUGMENT PROTOCOL / ACCEPTED
  - selected card name / ONLINE

## Retire stale design

Do not restore:
- fixed `impulse-coil / relay-link / shear-current` offer
- Foundation-only geometry
- three fixed build routes
- old 768×640 vertical stack

## Geometry

Implement AREA-SPEC target:
- 1152×832
- right Vestibule
- one Guard
- static Service Baffle
- safe Node chamber
- Universal Calibration Frame
- upper-left exit
- persistent room casing as needed for Seamless bypass prevention

Baffle:
STATIC / solid / non-grappleable / non-damaging / LOS blocker.

## New objective

Add:
`sector-01-04:augment-calibrated`

Exit panel must require:
- `sector-01-04:augment-selected`
- `sector-01-04:augment-calibrated`

Do not complete calibration merely on selection.

## Calibration owner

Prefer a small dedicated runtime owner/adapter.

Responsibilities:
- Player-local active profile keyed by selected Augment ID
- only active inside/after 1-4 calibration source
- observe canonical action/rope events
- reset instrument on failure
- complete personal pass on valid selected-card use
- aggregate to shared objective without deadlocking leavers
- late join must not relock an already-open gate

Do not put validation logic in Story Presentation.

## Profile data

Use:
`docs/bsh/scenario/1/1-4/CALIBRATION-PROFILES.json`

The code implementation may translate planning data into Runtime constants,
but the semantic contract must stay aligned.

## Profile validation examples

- long-rope: designated target outside 400 and inside 480
- fast-recover: second attach inside fast-reload-only window
- action cards: canonical action event + instrument success
- electrified/collision: canonical augment cause on calibration receiver
- slow-fall: actual active state across scan interval

Do not fake completion by checking inventory only.

## Multiplayer

Player A and Player B may have different cards.

Shared geometry remains identical.

Instrument activation/readability may be Player-local.
No Player may complete another Player's calibration.

Shared objective completes when current required set passes.
Leavers are removed from required set.
Late join after gate opened does not relock it.

## Story

Keep current:
- GRAPPLE DEVICE / DETECTED
- GRAPPLE TELEMETRY / ANALYZED
- SAFETY LIMIT OVERRIDE / AVAILABLE
- AUGMENT PROTOCOL / ACCEPTED
- selected card / ONLINE

Add:
- CALIBRATION PROFILE / LOADED
- CALIBRATION / VERIFIED

Player Bark:
`…이건 쓸 수 있겠네.`
after verification only if bark layer exists.

## Tests

Required:
- all 12 first-choice IDs map to profile
- unsupported selected ID fails safely / logs loudly in dev
- inventory ownership alone does not pass
- each profile success path
- each profile retry/reset
- Guard cannot threaten chooser
- chooser world continues
- two Players different cards calibrate independently
- leaver does not deadlock
- late join does not relock
- Story regression
- Stage pacing smoke

Report exact remaining NOT IMPLEMENTED items.
