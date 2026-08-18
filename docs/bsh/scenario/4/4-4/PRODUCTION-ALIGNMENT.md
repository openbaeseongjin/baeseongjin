# SECTOR 04-4 — PRODUCTION ALIGNMENT

Status: **MIGRATION REQUIRED**

Latest checked main:

```text
b6e5b640f04135545341d3368a843b45c35fcedd
```

## Current Runtime

Current Sector04 source catalog still represents the old Transit/Infrastructure master. 4-4 is an `INFRASTRUCTURE SERVICE NODE / REST` style stage with no approved REV2.4 Care Pavilion/Treatment Pod behavior.

## REV2.4 target

```text
CARE PAVILION
3 moving persistent guards
Treatment Pod
No Wind
No Cutter
No Scanner
```

## AREA-SPEC status

Latest authoring standard is REV1.1 / `area-spec-v1` with Seamless Sector semantics.

The standard explicitly separates:

```text
sourceExit = legacy source geometry
progression = Seamless connector authority
```

and forbids silently inventing unknown presets/systems.

This package declares:

```text
sector04-persistent-guard-v1  NOT_IMPLEMENTED
care-treatment-pod-v1        NOT_IMPLEMENTED
```

## Treatment Pod gap

Current Runtime has Player HP state, but no approved Player-operated Care Treatment Pod with:

- interaction channel
- damage interruption
- per-Player use state
- +40 capped heal
- Pursuit-safe behavior

Therefore Pod is not Runtime-aligned yet.

## Schema/validator gap

AREA-SPEC REV1.1 has no generic top-level arbitrary interactable placement collection.

The custom objective preset can name the treatment interaction, but production implementation still needs an approved way to author:

```text
x/y placement
channelSeconds
healAmount
usesPerPlayer
interruptOnDamage
alert interaction
```

Do not add an unreviewed top-level field merely to make JSON convenient.

## Persistent Guard gap

Current EnemyPatrol and Pursuit pieces exist, but the integrated:

```text
multi-point Patrol
→ alert latch
→ persistent whole-stage pursuit
```

preset remains implementation work.

## Art

Scenario Art remains HOLD until:

- source Area migration
- persistent guard implementation
- Treatment Pod implementation
- 3-Pursuer graybox
- treatment/camera readability
