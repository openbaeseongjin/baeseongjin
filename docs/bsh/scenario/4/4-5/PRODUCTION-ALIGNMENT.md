# SECTOR 04-5 — PRODUCTION ALIGNMENT

Status: **MIGRATION REQUIRED**

Latest checked main:

```text
b6e5b640f04135545341d3368a843b45c35fcedd
```

## Current Runtime

Current `sector-04-05` remains:

```text
EXPRESS SHAFT
PURE MOVEMENT JOY
bounds 1216 × 1536
Enemy NONE
vertical pulsed express-wake
strength 360
```

Current source uses static grapple surfaces and no Moving Anchor entity.

## REV2.5 target

```text
AMENITY ATRIUM
bounds 1600 × 1720

Guard A/B
same Diamond Orbit + 0.5 phase

Guard C
upper vertical/diagonal sweep

Persistent Pursuit

Anchor Drone
neutral / kinematic / dynamic grapple socket

Wind NONE
Cutter NONE
Scanner NONE
```

## Verified Rope gaps

Current `RopePointerInput.findRopeAttachment()`:

```text
candidate source = surfaces
```

Current `RopeLauncher.launch()`:

```text
target copied to fixed x/y
```

Current `FixedLengthRope.attach()`:

```text
anchor copied into Vector2
```

and the constraint treats the anchor as stationary.

Therefore current Runtime does NOT support:

- dynamic grapple entity candidates
- target tracking during Hook flight
- moving pivot position/velocity
- multi-Player dynamic anchor attachment

## New systems

```text
sector04-persistent-guard-v1               NOT_IMPLEMENTED
moving-anchor-drone-v1                     NOT_IMPLEMENTED
resident-security-override-relay-v1        NOT_IMPLEMENTED (Proof B/3, on upper-gallery — see ../4-8/SECTOR-04-ACCESS-ROLLOUT.md)
```

## AREA-SPEC gap

REV1.1 has no approved top-level collection for a dynamic grapple entity/path/socket.

This package intentionally does NOT invent one.

Production implementation must extend the official authoring/validator contract so the exact Anchor Drone path/socket/preset is machine-readable without breaking the KNOWN / NOT_IMPLEMENTED / UNKNOWN discipline.

## Augment

Current catalog still contains:

- long-rope +20%
- fast-recover -50% rope reload
- release-propulsion ×1.25
- direction-dash 150

No map requirement depends on them.

## Scenario Art

HOLD until:

- source Area migration
- Persistent Guard implementation
- Moving Anchor implementation
- dynamic Hook flight validation
- moving-pivot Rope validation
- multiplayer dynamic anchor replication
- graybox camera/readability validation
