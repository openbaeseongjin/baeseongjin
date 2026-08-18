# SECTOR 04-8 — PRODUCTION ALIGNMENT

Status: **MIGRATION REQUIRED**

Latest checked main:

```text
1cb2d48870352dc71637cfc7ad553d655e0a94d4
version 0.32.0
```

## Current source

Current shipped/source `sector-04-08` is still legacy:

```text
TRANSIT CONTROL TRUNK
Cutter Sentry
Patrol Drone
vertical pulsed Wind
content-boundary exit
```

Target package:

```text
UPPER RESIDENTIAL THRESHOLD
3 staged Patrol bands
Persistent Pursuit
NO Cutter
NO Wind
2-of-3 Resident Override payoff
```

## Runtime alignment

### VERIFIED existing

- Base Rope Reach 400 / Hook 1200 / Reload .50.
- `patrol-drone-t1` is a known AREA-SPEC preset.
- `EnemyPatrol` supports endpoint pingpong movement.
- `SectorProgressState` already stores collected access modules and evaluates required access counts on route unlock.
- Seamless progression uses connector/routeLock, not Stage portal gates.
- 4-8 is currently a content boundary.

### NOT IMPLEMENTED

```text
sector04-persistent-pursuit-latch-v1
resident-security-override-quorum-v1
Sector04 source migration
Sector04 inclusion in default seamless compiled Runtime
Post-Sector04 Boss / Transition landmark
```

## Access rollout dependency

Current compiler creates Access Modules from Access Carrier encounters and currently hardcodes the 2-module transition requirement to Sector01.

Sector04 needs a deliberate generalization so a Relay interaction can collect a shared Access proof without pretending it came from an enemy death.

Do not create a second parallel currency/state class unless the existing access state proves structurally insufficient.

## 4-8 progression

`AREA-SPEC.json` intentionally uses:

```text
targetStageAlias = null
```

It does not wire to `5-1`.

When Post-Sector04 transition content exists, the compiler/world transition layer should own the actual target route.

## Scenario Art

HOLD until:

- Sector04 source migration
- three Relay sources integrated
- Persistent Pursuit integrated
- 4-8 graybox approved
- post-Sector transition shape known
