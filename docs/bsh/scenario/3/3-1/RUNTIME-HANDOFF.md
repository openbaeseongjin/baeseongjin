# 3-1 RUNTIME HANDOFF — REV8.0

Baseline:
`c1f9cd7f0362de7f7a3065a34e7ea9d35927a934`

## Before implementation

Fetch latest main and record SHA.

Re-read:
- Sector03AreaCatalog.js
- AuthoredStoryPresentation.js
- current presentation directory / Bark-layer status
- Sector 03 enemy-density authority
- generic Augment contract
- current 3-2 Scanner implementation
- current Exit/Gate contract

## Approved topology

Bounds:
`3072×1088`

Body:
`LOW LEFT → HIGH CENTRAL SUSPENDED ISLAND → RIGHT MARKET → SHORT SERVICE LIFT`

Do not implement superseded REV2 twin-void corridor grammar.

## Story objects

Preserve stable IDs:

`sector-03-01:district-sign`
→ exact verified presentation:
`COMMERCIAL DISTRICT / PROMENADE 06`

`sector-03-01:welcome-kiosk`
→ exact verified presentation:
`WELCOME / PUBLIC SERVICE ONLINE`

Move positions with the new topology, not IDs/cue ownership.

## Player Bark

A:
`…여긴 아직 불이 들어와 있어.`

B:
`사람은 없는데… 기계들만 계속 일하고 있네.`

If Player Bark layer is still absent:
- report NOT IMPLEMENTED
- no fake System Toast
- no gameplay dependency

## Enemy

Exactly one stable slot:
`sector-03-01:promenade-guard`

Preserve:
- Standard Pool
- kill optional
- no Rope Cut
- activation-band-only

REV8 activation:
right market only, after Central Island Story.

Do not pressure:
- left Story terrace
- Central Island Story zone
- ascent/descent before Right Market landing

If Artillery is selected:
validate projectile contrast against bright commercial art.

## Scanner

None active in 3-1.

Do not create scannerGroups.

Inactive visual housing is atmospheric only and must not look gameplay-active.

## Rope relations

Critical intended relations:
- Entry→G1 ≈262px
- P1 edge→G2 ≈295px
- G2→Island edge ≈286px
- Island edge→G3 ≈304px
- G3→Right Market ≈365px
- Right Market→G4 ≈302px
- G4→Exit ≈160px

No mandatory >400px.

Large scale comes from architecture/travel/sightline,
not max-reach fishing.

## Recovery

Recovery A:
3–5s.

Recovery B:
3–5s.

Neither may bypass its successful destination by walking.

## Camera

Default first.

Entry:
Player + distant high Island; Exit hidden.

Island ascent:
Player + G2 + Island edge.

Island:
Player + broad safe island + Right Market direction.

Descent:
Player + G3 + broad Right Market landing.

Guard:
ordinary gameplay framing.

Exit:
Player + G4 + service threshold.

## Exit

Preserve current contract:

`final deck reached`
→ `exit panel engaged`
→ Gate open
→ physical crossing
→ `sector-03-02`

## Validation

Run full project checks plus:
- bounds / actual footprint use
- one enemy slot
- Story IDs/copy
- Story safe zones
- Bark status
- Scanner OFF
- all Rope distances
- recovery no-bypass
- mobile readability
- no similarity regression
- 3-2 handoff
- multiplayer / respawn / pacing
