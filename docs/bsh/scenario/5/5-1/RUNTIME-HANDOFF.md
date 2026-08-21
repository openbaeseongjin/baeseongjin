# 5-1 RUNTIME HANDOFF — REV8.0

Baseline: `4551798860193a16e53814aae5c3a42022b4e1cf`

## Before Coding

1. fetch/rebase latest `main`
2. re-audit current Rope constants
3. re-audit world surface grappleability contract
4. re-audit `direction-spec.schema.json`
5. re-audit Direction compiler/coverage
6. re-audit Sector05 catalog status
7. re-audit Post-Sector04 transition state
8. re-run geometry distance validation

## Stable Contract

```text
sourceAreaId
sector-05-01

name
CONTINUITY RECEPTION

enemy
NONE

next planning stage
5-2 CONTROL ATRIUM
```

## Geometry

Implement:

```text
4608×2432
```

Do not scale the old `1600×1420` Stage.

Use four large Sealed Core segments and three major crossing bands.

Every broad Core face:

```text
collision yes
grappleable false
```

Every Service Hardpoint:

```text
readable
grappleable true
```

## Preset Gap

`sealed-corporate-surface-v1` is **NOT IMPLEMENTED** as an authoring preset.

It is not a new physics system.

Use one of:

1. add the preset using existing non-grappleable-surface capability, or
2. author equivalent explicit surfaces with stable IDs.

Do not change Rope physics to implement the preset.

## Gameplay

No:
- enemy
- scanner
- wind
- rope cut
- Jammer
- AEGIS
- Artillery
- mandatory Augment

Preserve Safe/Flow final choice.

## Story

Direction order:

```text
CONTINUITY CONTROL
INCIDENT OPERATIONS ACTIVE

↓

CITY SYSTEM STATUS
DEGRADED

↓

CONTROL NETWORK
ONLINE

↓

PLAYER
…아래쪽은 끊겼는데, 여긴 사고 때도 돌아가고 있었네.
```

Only one Player Bark.

No Story cause inference.

## Exit

Final deck objective
→ contextual exit panel
→ 5-2 connector.

Do not wire the incoming Post-Sector04 transition unless that transition has separately become authoritative.

## Release Gate

Do not release until:

- Area validation passes
- Direction schema passes
- required Direction tracks are `implemented/verified`
- all mandatory Base Rope relations ≤400px
- Sealed surfaces are actually unattachable
- first-time visual legibility is playtested
- both Safe and Flow routes are Base-clear
