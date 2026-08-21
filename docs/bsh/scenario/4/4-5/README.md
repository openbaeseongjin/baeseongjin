# ONE ROPE — SECTOR 04-5 AMENITY ATRIUM — REV1.0

Status: **DESIGN LOCKED / RUNTIME NOT IMPLEMENTED**<br>
Baseline audit: `3c9f661bba58af6f7351e00754c12aef86575a12`

## 1. Stage identity

**Spatial signature:** `RISING AMENITY SPIRAL / THREE LONG CROSS-ATRIUM SWEEPS / OPTIONAL SECURITY OVERLOOK POD`

**Movement memory:**

`WEST LOWER ↗ EAST MID ↖ WEST UPPER ↗ EAST HIGH`

The left/right reversal is not backtracking. The maintenance route circles the Grand Resident Amenity Atrium and gains height at every major sweep.

## 2. Why the player goes this way

4-4 ends at **HIGH AMENITY ACCESS**. That access opens directly into the Atrium's facility-maintenance circulation. 4-6 **REFUGE ACCESS GALLERY** is physically above and across the Atrium. The service route itself climbs there.

No key, Relay, arbitrary platform detour, or Pursuit event creates the route. Architecture comes first.

## 3. Macro flow

```text
4-4 HIGH AMENITY ACCESS
→ WEST LOWER LOUNGE / SERVICE EDGE
→ LOWER HORTICULTURE / LIGHTING SERVICE RIB
↗ EAST MID WELLNESS BALCONY / SAFE READ
→ PATROL ×1 TIMING READ
↖ UPPER CANOPY MAINTENANCE SPINE
→ PURSUIT ×1 BEGINS
→ WEST UPPER GARDEN CLUB BALCONY
↗ FINAL HIGH SWEEP
├─ OPTIONAL: SECURITY OVERLOOK POD → OVERRIDE B → RETURN
└─ MAIN: EAST HIGH REFUGE ACCESS
→ 4-6
```

## 4. Rope contract

Bounds: **5376×2432**.<br>
Current verified Base Hook Reach: **400px**.

- Main route max adjacent relation: **381.18px**
- Override B branch max: **388.33px** (`J5 ↔ Security Overlook Pod`)

Both PASS at the package baseline. Recalculate on latest main and after any coordinate edit.

## 5. Security choreography

### East Mid Patrol
Patrol ×1 exists to create a readable timing beat before the chase. No kill requirement.

### Upper Spiral Pursuit
Pursuit ×1 begins only after the Patrol read. Player follows the authored Spiral; Pursuit crosses central airspace directly. Do not invent pathfinding around architecture.

No Cutter / Scanner / Wind / Augment / kill gate.

## 6. Override B

**Resident Security Override B** is optional for local 4-5 completion.

Architectural location: **central Atrium Security Overlook Pod**, because that station monitors multiple resident Amenity levels.

The branch has a real cost: leave the efficient high route during active Pursuit, reach the Pod, interact, and return. It is not a forced key detour.

Sector intent:
`A=4-2 / B=4-5 / C=4-7 / any 2-of-3 at 4-8`.

Current `SectorProgressState` has generic access-module count support, but the new Residential Sector04 and B mapping are not implemented. Therefore this package intentionally ships `AREA-SPEC-REV1-DESIGN.json`, not a false canonical `AREA-SPEC-REV1-DESIGN.json`.

## 7. Story function

4-4 already showed that refuge/life-support systems were maintained. 4-5 expands the observation:

> even a large private Amenity / Wellness environment remained operational.

This is evidence of **protection**, not the explanation of **why** it happened.

Allowed system facts:
- `PRIVATE AMENITY ATRIUM / ENVIRONMENTAL SERVICE NORMAL`
- `PRIVATE AMENITY SERVICE / CLIMATE NORMAL`
- `WELLNESS WATER SYSTEM / NORMAL`
- `AMENITY SECURITY / PATROL ACTIVE`
- `AMENITY SECURITY / INTRUSION RESPONSE ACTIVE`
- `RESIDENT SECURITY OVERRIDE B / OPTIONAL / SERVICE CONTROL`
- `RESIDENT REFUGE ROUTE / ACTIVE`

Forbidden in Sector04:
- resource-allocation cause
- Group C causal mapping
- priority/selection policy
- who ordered protection

## 8. Dialogue contract

Exactly one core Player Bark:

> **“…이런 데까지.”**

Meaning: short disbelief/discomfort/anger after seeing operational Wellness infrastructure.

Trigger intent:
1. East Mid Safe Read reached.
2. operational Climate/Water evidence has been presented.
3. Player stable ≥0.5s.
4. Rope not actively attached/controlled.
5. enemy not acquired; otherwise delay.

No Player dialogue during Patrol, Pursuit, Rope commit, or Override choice. Do not replace the Bark with System Toast if the voice/Bark Runtime is absent.

## 9. Failure / recovery

Falls reach lower Amenity recovery terraces rather than arbitrary death voids. Recovery must return the Player to the same Spiral problem, not bypass Patrol/Pursuit or teleport to a higher band.

## 10. Uniqueness

- not 4-3: no objective descent → Relay → vertical re-entry
- not 4-4: no short stepped refuge truss chain
- not 2-8: no drop→ring→opposite-arm transfer
- not 3-8: no repeated free-weave choice field
- not a complete circular orbit: three directional rising sweeps with a clear upper exit

## 11. Release blockers

Do not call implementation complete until:
- actual bounds = 5376×2432
- all main/branch Rope relations pass current Base reach
- East Mid story Bark happens only in safe timing
- Patrol precedes Pursuit
- local exit works without Override B
- B can be collected only once and persists according to Sector progression authority
- no unsupported Sector04 2-of-3 claim is faked locally
- live browser play confirms the Stage reads as continuous ascent
