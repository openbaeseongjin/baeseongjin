# SECTOR 04 — RESIDENT SECURITY OVERRIDE ROLLOUT

Status: **DESIGN LOCKED · NOT IMPLEMENTED**

Snapshot: `1cb2d48870352dc71637cfc7ad553d655e0a94d4`

## Final proof slots

| Proof | Stage | Fiction | Position |
|---|---|---|---|
| A | 4-2 Residential Courtyard | Courtyard Resident Access Relay | `(-165,-730)` |
| B | 4-5 Amenity Atrium | Amenity Network Security Relay | `(-200,-1420)` |
| C | 4-7 Refuge Terrace | Refuge Security Override Relay | terminal `(420,-1325)`, relay ledge top `-1285` |

## Rule

```text
AVAILABLE = 3
REQUIRED = 2
OWNER = shared Sector progress
```

Acquisition:

```text
REACH
→ INTERACT
→ COLLECT SHARED PROOF
```

No proof requires:
- Guard kill
- Augment
- Moving Anchor
- Wind manipulation

## Sector boundary

```text
4-8 exit objective complete
+
proof count >= 2
=
Post-Sector04 transition route ready
```

4-8 itself is not a proof source.

## Why the three slots

```text
4-2 HOME
4-5 AMENITY
4-7 REFUGE
```

This turns the Sector Access fiction into a tour through three layers of privileged residential infrastructure instead of three identical keys.

## Runtime extension

Reuse/generalize existing `SectorProgressState` access logic.

Current implementation already supports:
- shared collected access IDs
- per-Sector summary
- route-required access count
- snapshot/restore

Current compiler limitations:
- access proof source is currently encounter-carrier oriented
- `requiredAccessModuleCount: 2` is currently Sector01-specific
- Sector04 is not yet in the default compiled catalog set

Required implementation capability:

```text
RELAY INTERACTION
→ collect access proof
→ same shared access state
```

Do not create a parallel `SecurityKeyState` unless architecture review proves necessary.

## Stage patch intent

### 4-2
Add one interactable Relay on the left side of `decision-deck`.
Collection does not clear Alert.

### 4-5
Add one interactable Relay on `upper-gallery`.
Static Mandatory Route reaches it; Moving Anchor Drone remains optional.

### 4-7
Keep approved side Relay ledge at upper Refuge.
Collection does not reset Wind phase or Persistent Pursuit.

### 4-8
No Relay.
Display/route logic reflects quorum readiness.

## Recommended UI

```text
OVERRIDE 0/2 · SIGNAL 3
OVERRIDE 1/2 · SIGNAL 2
OVERRIDE 2/2 · TRANSIT CLEARANCE READY
```

For full collection:

```text
3 / 3 FOUND
2 REQUIRED
```
