# Boss04 Latest Implementation Handoff

> **Repository:** `openbaeseongjin/baeseongjin`
> **Merge path:** `docs/boss/04/BOSS-04-LATEST-HANDOFF.md`
> **Current audited `main`:** `ea007998cef6168bfa4139d06f443eb444acfda5`
> **Current HEAD date:** 2026-08-23 KST
> **Boss:** `boss-04 / UPPER RESIDENTIAL SECURITY SYSTEM`
> **Theme:** `PRIVILEGE IS PROTECTED`
> **Status:** `LATEST SOURCE OF TRUTH / IMPLEMENTATION HANDOFF / DESIGN LOCKED WHERE MARKED`

---

# 0. Purpose

Boss04 already has authored content and a dedicated runtime. This handoff is **not** a request to rebuild Boss04 from scratch.

It is the repository-level source of truth for aligning the current `main` implementation with the finalized Boss04 design and for removing movement friction that can make the encounter feel unresponsive, unfair, or physically blocked.

This document combines:

1. finalized **DESIGN LOCKED** decisions,
2. current `main` facts verified at `ea007998cef6168bfa4139d06f443eb444acfda5`,
3. implementation mismatches,
4. exact likely code locations,
5. movement-usability requirements,
6. deterministic QA and browser playtest criteria,
7. regression constraints and Definition of Done.

Do not treat historical Boss04 documents as more authoritative than this handoff.

---

# 1. Authority / precedence

If Boss04 sources conflict, use this precedence:

1. shared current engine architecture,
2. this `BOSS-04-LATEST-HANDOFF.md`,
3. current Boss04 spec/runtime,
4. historical Boss04 design/audit documents.

For gameplay semantics explicitly marked **DESIGN LOCKED**, this document overrides stale Boss04 spec/runtime behavior.

---

# 2. P0 BLOCKER — deleted Territory / LOS / RETURN design has re-entered current `main`

## CURRENT MAIN FACT

At current `main`, `ResidentialSecuritySystemRuntime.js` contains:

```text
RESIDENT_SECURITY_SYSTEM_STATE.RETURN
DEFAULT_CONFIG.returnSpeed
territoryBounds
#hasLineOfSight()
#beginReturn()
```

Current Guard flow can become:

```text
target outside territory
+
LOS false
+
Guard not ACTIVE
→ RETURN
→ weakpoint exposed
→ Guard moves home
→ DORMANT
```

Current `boss-04.json` also authors `territoryBounds` for Guard A/B and the HUD text tells the player to leave the territory and break LOS before attacking the weakpoint.

## DESIGN LOCKED

This design was explicitly deleted.

Final Guard flow is:

```text
DORMANT
→ detection
→ CHASE
→ WARNING
→ ACTIVE
→ RECOVERY
→ CHASE
→ ...
→ DEAD
```

Once detected:

```text
LOS lost             → pursuit continues
territory left        → pursuit continues
Refuge entered        → pursuit continues if already detected
next phase entered    → pursuit continues
distance increased    → pursuit continues
```

Only Guard death or encounter reset ends pursuit.

## REQUIRED FIX

Remove from Boss04:

- `RETURN` state,
- `returnSpeed`,
- `territoryBounds`,
- `#hasLineOfSight()`,
- `#beginReturn()`,
- return-to-home de-aggro,
- weakpoint exposure during RETURN.

Weakpoints open only during authored `RECOVERY`.

Update Boss04 HUD objectives to the final combat loop, for example:

```text
Guard A:
착지 폭발 뒤 후방 추진기를 Rope Impact

Guard B:
돌진 뒤 측면 제어기를 Rope Impact
```

Do not restore Territory/LOS mechanics under a new name.

## PRIMARY FILES

```text
src/game/boss/ResidentialSecuritySystemRuntime.js
src/game/boss-authoring/specs/boss-04.json
docs/boss/04/*
docs/scenario-development-integration.md
```

---

# 3. Final DESIGN LOCKED encounter contract

## 3.1 Guard A

Role:

```text
upper pursuit / landing pressure
```

Required cycle:

```text
CHASE
→ choose 2–3 actually reachable predicted landing candidates
→ WARNING shows all targets and order
→ targets lock
→ ACTIVE sequential explosions
→ RECOVERY
→ rear-thruster exposed
→ repeat
```

Rules:

- do not continuously target direct player center if valid landing candidates exist,
- fallback to player snapshot only when no valid candidate exists,
- ACTIVE Guard A body is itself damaging,
- ACTIVE Guard A body is invulnerable,
- sequential landing explosions are separate hazards,
- outside ACTIVE, Guard body collision is physical push/depenetration only,
- Recovery follows target slowly,
- rear weakpoint is physically behind actual Guard facing.

Recommended existing timing:

```text
Warning ≈ 0.60 s
Burst interval ≈ 0.25 s
Recovery ≈ 1.80 s
```

---

## 3.2 Guard B

Role:

```text
same-height route block / landing interceptor
```

Required cycle:

```text
CHASE
→ choose one most likely reachable landing
→ WARNING locks landing
→ ACTIVE Guard B body physically dashes to it
→ abrupt stop
→ RECOVERY
→ side-controller exposed
→ repeat
```

If ACTIVE dash intersects Solid:

```text
stop at safe boundary
→ discard remaining dash
→ ACTIVE ends
→ RECOVERY begins at collision position
```

No wall retry, reroute, or wall-slide during ACTIVE dash.

One-way surfaces do not block Guard flight.

---

## 3.3 Guard A facing / rear weakpoint

**DESIGN LOCKED**

Guard A keeps meaningful actual facing from its real locomotion.

```text
actual movement direction changes
→ facing changes
→ rear-thruster moves with the true rear
```

Forbidden:

```text
player moves
→ rear weakpoint independently rotates to stay opposite player
```

One shared weakpoint-position helper must feed both presentation and impact targeting.

---

## 3.4 Guard B side weakpoint

**DESIGN LOCKED**

At B Recovery start:

```text
dashDirection retained
→ resolve cycle-target reference position
→ determine which side target occupied relative to dash axis
→ expose opposite side-controller
→ lock side for whole Recovery
```

If the cycle target dies after Warning:

```text
use stored targetReferencePosition
```

If even that is unavailable:

```text
use deterministic fallback from dashDirection
```

The side does not flip as players move.

---

# 4. Multiplayer DESIGN LOCKED contract

## 4.1 One target per Guard attack cycle

At new CHASE:

```text
choose nearest valid active player
→ targetPlayerId locked
```

Maintain target through:

```text
CHASE
WARNING
ACTIVE
RECOVERY
```

At Recovery end:

```text
clear target
→ next CHASE selects again
```

If target becomes invalid **before Warning**:

```text
select replacement
```

If target dies **after Warning begins**:

```text
do not cancel
do not retarget
do not move attack geometry
execute already-telegraphed attack
```

---

## 4.2 One player authors attack geometry; all players can be hit

Target ownership affects prediction/geometry only.

World hazard collision affects every active player.

Example:

```text
A targets Player 1
→ A landing burst authored from Player 1
→ Player 2 enters burst
→ Player 2 is hit
```

Same rule for B dash, Hub Beam, and Hub Burst.

---

# 5. Open progression DESIGN LOCKED

No P1/P2/P3 combat walls.

Valid simultaneous states include:

```text
A + B
A + Hub
B + Hub
A + B + Hub
```

A detected Guard does not stop chasing merely because the player enters a later phase.

No global Boss special-attack token.

No friendly fire between Boss actors.

Guards ignore each other physically.

Hub does not block Guard movement.

---

# 6. Rope attachment DESIGN LOCKED

Direct Rope attachment must be possible to:

- Guard A,
- Guard B,
- Central Security Hub.

Attachment does not:

- stun,
- cancel attacks,
- drag the Boss,
- override Boss locomotion.

Hub remains stationary.

Hub may be Rope-attached while Shield/Core is secured; attachment and damage permission are separate.

---

# 7. Standing / riding Guard DESIGN LOCKED

The player may land on Guard A/B and use them as temporary moving platforms.

Required:

```text
player grounded on Guard
+
Guard moves by delta
→ player receives support displacement
```

Warning:

```text
player may remain standing
→ no attack damage yet
```

ACTIVE begins:

```text
Guard body becomes damaging
→ rider can be hit immediately
→ damage
→ authored knockback
→ safe ride ends
```

A hit does not automatically detach Rope unless the shared Rope system independently invalidates that attachment.

---

# 8. Architecture DESIGN LOCKED

Guard A/B fly freely, but Solid architecture blocks them.

```text
Solid → blocks Guard
one-way → does not block Guard flight
```

Normal pursuit may use a minimal local wall slide/avoidance.

No full NavMesh is required.

Wall collision never de-aggros Guard.

---

# 9. Hub DESIGN LOCKED contract

## 9.1 Links / Shield / Core

```text
any Guard Link ON
→ Shield ON
→ Core secured
→ Hub invulnerable
```

```text
both Guard Links OFF
→ current already-running Hub attack finishes
→ then Core may open
```

Last Guard death during Beam/Burst:

```text
Link OFF visual immediately
→ current Beam/Burst finishes
→ then Core opens
```

---

## 9.2 Hub attack loop

```text
Beam
→ Landing Burst
→ if both Guards dead: CORE_OPEN
→ independent Rope Impact
→ Core closes
→ Beam
```

Core open:

```text
≈ 2.2 s
no Hub attack during open
```

Continuous overlap does not create repeated free Core hits; a new valid Rope Impact must be independently generated.

---

## 9.3 Hub retreat

If all active players leave P3:

```text
cancel current Hub Warning / Beam / Burst / Core-open cycle
→ Hub DORMANT
```

Preserve:

- Hub HP,
- Guard deaths,
- Link states,
- encounter progression.

Re-entry begins a fresh Beam.

---

# 10. Current `main` movement / map facts

All facts below are from current `main@ea007998cef6168bfa4139d06f443eb444acfda5`.

## 10.1 Core movement constants

```text
Player radius = 15
Base Rope reach = 400
Jump speed = 440
Gravity = 1250
Max horizontal speed = 360
Rope attach buffer = 0.1 s
Rope Impact minimum speed = 620
```

---

## 10.2 Current Boss04 authored route

Current Boss04 contains:

```text
22 route anchors
21 route edges
max route-edge point distance ≈ 353.553 px
```

Every authored route edge is within Base Rope reach as a **planning graph**.

Important:

> route anchors are not automatically physical Rope targets.

A route-edge distance check alone does not prove actual gameplay traversal.

---

## 10.3 Current phase / recovery relationship

Current P2 bounds:

```text
x = 2460..3960
y = -1800..-1100
```

Current Refuge recovery:

```text
(2290, -1562)
```

Therefore the **old immediate-respawn-inside-P2 bug is no longer true at current authored coordinates**.

However, current Guard B detection still uses the broad P2 phase zone itself, not a dedicated detection trigger.

The final design still requires explicit intentional P2 commitment semantics.

---

## 10.4 Current Guard Rope authority

Current Guard bodies are constructed with:

```text
canGroundActors = true
ropeAttachment = true
```

`KinematicPhysicsBody` also exposes a `ropeableSurface`.

Current `GameSimulation.#ropeAttachmentActors()` prefers that `ropeableSurface`.

Current `RopePointerInput.findRopeAttachment()`:

```text
aims at actual Guard collision surface
→ resolves closest surface point
→ stores body-local localAnchor
```

Current attached-Rope sync preserves:

```text
owner.position + anchorLocalOffset
```

Therefore **direct Guard Rope attachment is currently gameplay-authoritative and surface-based**.

Do not “restore” Guard Rope by replacing this with center-only attachment.

Current presentation still reports Guard:

```text
ropeAttachable: false
```

which is a readability/UI mismatch and must be aligned with actual authority.

---

## 10.5 Current Guard contact

Current Guard kinematic bodies do not override collision restitution.

Shared default:

```text
collisionRestitution = 0.25
```

Final Boss04 non-ACTIVE contact should feel like push/depenetration/ride support, not a generic bouncy collision.

---

## 10.6 Current Hub / Core geometry

Current Hub body / `security-hub-deck`:

```text
x = 3970..4230
y = -2280..-2120
width = 260
height = 160
grappleable = false
```

Hub/Core center:

```text
(4100, -2200)
```

Core impact radius:

```text
80
```

Player + Core overlap threshold:

```text
15 + 80 = 95 px
```

From directly above the Solid Hub body, the nearest non-penetrating player center is:

```text
y = -2295
```

Distance to current Core center:

```text
95 px exactly
```

So current Core contact has effectively **zero geometric clearance** at the outer collision envelope.

This is not a robust movement/combat contract for a `minimumSpeed=620` Rope Impact and is sensitive to collision resolution/numerical/presentation mismatch.

Core must be physically exposed outside the blocking Hub body with positive approach clearance.

---

## 10.7 Current Hub direct Rope authority

Current Hub presentation says:

```text
ropeAttachable: true
```

but gameplay authority does not currently expose a Hub collision actor/attachment owner.

`security-hub-deck` is also:

```text
grappleable: false
```

Therefore final direct Hub Rope attachment is not currently fulfilled.

---

## 10.8 Current real P3 Rope gap

Current relevant physical surfaces:

```text
upper-skybridge top = -1680
left-refuge-terrace bottom = -2145
```

Standing on the upper skybridge:

```text
Player center ≈ -1695
Rope hand Y ≈ -1702
```

Nearest vertical point on the underside of the left Refuge terrace:

```text
-2145
```

Stable vertical Rope distance is therefore about:

```text
443 px
```

which exceeds Base Rope reach `400`.

At jump apex, the gap can become reachable, so this is not proof of absolute impossibility.

It **is** proof that a nominal mandatory transition currently relies on a timed jump-to-hook correction rather than a comfortable stable Base-Rope target.

R1 movement usability must fix or explicitly reclassify this as an optional skill route.

---

## 10.9 Current static Boss surface Rope self-occlusion defect

Current Boss-stage compiler creates Boss surfaces with:

```text
ropeOccluder = surface.ropeOccluder !== false
```

so surfaces default to `ropeOccluder:true`.

Current Boss04 grappleable surfaces do not opt out.

In `RopePointerInput.findRopeAttachment()`, static-surface candidate checking currently does:

```text
ropeOccluders.some(divider =>
    segmentIntersectsSurface(origin, point, divider)
)
```

without excluding:

```text
divider.id === candidateSurface.id
```

`segmentIntersectsSurface()` treats endpoint-on-edge contact as intersection.

Therefore a grappleable Boss surface can reject itself as its own Rope occluder.

This is a P0 traversal defect.

---

## 10.10 Current protected gate / exit collision

Current `protected-gate` authored surface:

```text
x = 4860..5220
y = -2320..-1760
collision = true
grappleable = false
```

Current exit:

```text
(5160, -2220)
```

which lies inside that Solid bounds.

Boss04 presentation changes the gate state to `"open"` after completion, but no Boss04-specific dynamic collision removal path was found in the current runtime.

Current Boss surface compilation keeps this as a static collision surface.

Therefore the visual gate may become open while its collision continues to block the exit route.

This must be fixed and verified.

---

## 10.11 Current warning geometry

Guard warning presentation:

```text
240 × 150
```

Guard A actual landing hazard:

```text
radius = 130
diameter = 260
```

These do not match.

Hub has a `BURST_WARNING` state and stores `burstPositions`, but current Boss04 presentation does not emit equivalent persistent burst-warning objects matching the future 130-radius hazards.

Movement decisions must never be made from a smaller/different warning than the future damage region.

---

## 10.12 Current camera

Current single-player Boss camera still uses:

```text
BOSS_CAMERA_FOCUS_WEIGHT = 0.3
BOSS_CAMERA_ZOOM_RATIO = 0.55
```

and considers `boss-security-hub` as a generic Boss focus object.

This can pull P1/P2 framing toward the distant Hub and make local Rope targets unnecessarily small.

Current `MultiplayerGameApp.updatePresentationCamera()` still calls:

```text
this.updateCamera(...)
```

but the audited class ends without defining `updateCamera()`.

This remains a concrete multiplayer client integration defect.

---

# 11. Latest mismatch matrix

| ID | Pri | CURRENT MAIN FACT | REQUIRED |
|---|---:|---|---|
| M00 | P0 | Territory/LOS/RETURN is back in Runtime/spec | delete it; persistent pursuit |
| M01 | P0 | B activation still uses broad P2 phase zone | explicit B detection/commit trigger |
| M02 | P0 | Guard target reselects nearest player during cycle | lock one target per cycle |
| M03 | P0 | attack candidates independently choose player near fixed reference | use locked cycle target |
| M04 | P0 | A exposes all attackPositions hazards simultaneously | sequential burst |
| M05 | P0 | B "dash" is a remote circular hazard | real Guard B body dash |
| M06 | P0 | Guard movement is direct `clampStep` | Solid sweep; one-way ignored |
| M07 | P0 | Guard A/B pursue player center | role-specific standoff; anti-hard-pin |
| M08 | P0 | ACTIVE Guard body knockback contract incomplete | body damage + directional knockback |
| M09 | P0 | A/B weakpoints remain at Guard center | real rear/side world positions |
| M10 | P0 | one global exposed weakpoint suppresses other Boss targets | actor-aware simultaneous weakpoints |
| M11 | P0 | riding Guard lacks explicit collision-safe support carry | moving-platform carry |
| M12 | P0 | static Boss grapple surface can self-occlude Rope | exclude candidate surface from its own occluder test |
| M13 | P0 | Hub direct Rope authority missing | real Hub Ropeable body surface |
| M14 | P0 | Core contact has zero-clearance tangent against Hub Solid | expose Core outside body |
| M15 | P0 | stable mandatory P3 gap can be ~443px | real visible hardpoint / stable Base-Rope path |
| M16 | P0 | protected gate can stay static Solid after visual open | disable/remove gate collision on completion |
| M17 | P0 | Warning shape differs from damage; Hub Burst warning missing | Warning = Damage geometry |
| M18 | P1 | Hub Beam safety checks anchor outside bounds only | graph + actual entry reachability |
| M19 | P1 | Hub Burst candidates are generic nearby anchors | reachable post-Beam candidates |
| M20 | P1 | Guard presentation says Rope unavailable while gameplay allows it | presentation/authority alignment |
| M21 | P1 | generic Boss camera biases Hub + fixed 0.55 | local-threat camera |
| M22 | P0 | multiplayer camera calls missing `updateCamera()` | shared camera resolver |
| M23 | P1 | victory spectator recovery uses Boss entry | completion-side safe recovery |
| M24 | P1 | wipe/recovery can stack players | spaced safe recovery |
| M25 | P2 | docs contain historical/current contradictions | cleanup after implementation |

---

# 12. M01 — Guard B explicit activation

Current Refuge recovery is now outside P2, so do not preserve the old stale statement that respawn itself immediately wakes B.

Still separate:

```text
phase bounds
```

from:

```text
detection / commitment trigger
```

Final flow:

```text
A dead
→ Refuge safe
→ B DORMANT

player leaves Refuge and enters committed P2 route
→ cross B activation trigger
→ B CHASE
```

Recommended authored field:

```text
activationBounds
```

or an equivalent explicit mechanic trigger.

Primary files:

```text
src/game/boss/ResidentialSecuritySystemRuntime.js
src/game/boss-authoring/specs/boss-04.json
```

---

# 13. M02/M03 — attack-cycle target lock

Add authoritative per-Guard cycle target state.

Concept:

```text
new CHASE
→ choose nearest valid living player
→ targetPlayerId

CHASE
WARNING
ACTIVE
RECOVERY
→ same targetPlayerId
```

Before Warning, dead target may be replaced.

After Warning, geometry stays locked.

Candidate generation must receive the already-resolved target instead of selecting a player internally.

Recommended conceptual API:

```text
#selectCycleTarget(guard, players)
#cycleTarget(guard, players)
#candidatePositions(context, targetPlayer, count, role)
```

Do not let candidate generation call another global nearest-player query.

---

# 14. M04 — Guard A sequential burst

WARNING:

```text
all target positions shown
all positions locked
order visible
```

ACTIVE contains **two concurrent hazard layers**:

```text
Guard A body
→ damaging for entire ACTIVE
```

and:

```text
landing explosion
→ only attackPositions[attackIndex] damaging for that sub-step
```

Use deterministic state such as:

```text
attackIndex
attackIntervalRemaining
```

Each explosion must have a distinct deterministic contact/hazard identity so de-duplication cannot suppress burst #2/#3.

Example conceptual identity:

```text
boss04:A:attempt:<attempt>:sequence:<sequence>:burst:<index>
```

---

# 15. M05 — Guard B real dash

WARNING:

```text
lock one reachable landing
show target
```

ACTIVE:

```text
B body physically moves to dashTarget
B body itself is damaging
```

State as needed:

```text
dashStart
dashTarget
dashDirection
dashProgress / remaining state
targetReferencePosition
```

Dash ends on:

- target reached,
- Solid collision,
- authored max dash duration/distance.

Solid collision:

```text
move to farthest safe point
→ ACTIVE ends
→ RECOVERY
→ side-controller opens
```

No remote fake circle with stationary Guard B.

---

# 16. M06/M07 — Guard locomotion, standoff and hard-pin prevention

Current direct `clampStep(player.position)` should be removed.

## Guard A

Target a locomotion point above player.

Initial playtest range:

```text
~160–200 px above
```

## Guard B

Target a lateral/same-height standoff position.

Initial playtest range:

```text
~180–220 px lateral standoff
```

These numbers are tuning suggestions, not DESIGN LOCKED constants.

The role distinction is required.

## Solid movement

For normal Guard motion:

```text
desired delta
→ sweep Guard polygon against Solid surfaces
→ one-way excluded
→ move to safe position
→ optional minimal tangent/local slide
```

Existing `PolygonCollider.farthestSafePositionAlong()` is suitable.

## Anti-hard-pin

Do not let a non-ACTIVE Guard repeatedly compress the player between Guard body and Solid.

Required player result:

```text
Guard approaches player near wall
→ Guard movement is limited/slid
→ player is not continuously forced into Solid
```

Set Boss04 Guard physical collision restitution to:

```text
0
```

unless playtest proves a nonzero value is necessary.

Do not use generic default `0.25` for normal Boss04 body contact.

---

# 17. M08 — ACTIVE body damage + knockback

Outside ACTIVE:

```text
physical collision / grounding / ride
no Boss attack damage merely from touching
```

ACTIVE A body:

```text
damage
→ knockback away from Guard center / authored outward direction
```

ACTIVE B body:

```text
damage
→ knockback along dashDirection
```

The attack continues after contact.

Boss body remains invulnerable during ACTIVE.

Use shared player impulse/knockback infrastructure, not teleport.

Suggested hazard metadata:

```text
impactDirection
knockbackSpeed
```

---

# 18. M09 — physical weakpoint geometry

## A

Maintain:

```text
facing
```

from actual meaningful Guard movement.

```text
rearPosition = guard.position - facing * rearOffset
```

## B

At Recovery start:

```text
weakpointSide = opposite(target side relative to dashDirection)
```

Then:

```text
sidePosition = guard.position + perpendicular(dashDirection) * signedSideOffset
```

One helper must feed:

```text
impactTargetSnapshot()
presentationObjects()
```

Visible target and actual Rope Impact collider must match.

---

# 19. M10 — simultaneous A/B weakpoint targeting

Current global logic:

```text
find first exposed weakpoint
→ return only that one
```

must become actor-aware.

Expected:

```text
A RECOVERY → A weakpoint
B RECOVERY → B weakpoint
Hub CORE_OPEN → Core
```

A+B simultaneous Recovery must expose both Guard weakpoints as combat targets.

---

# 20. M11 — collision-safe moving Guard carry

Do not directly do:

```text
player.position += guardDelta
```

Required:

```text
Guard previousPosition
Guard currentPosition
delta
→ support displacement through existing player collision path
```

Use shared surface-physics support mechanisms where practical, including `queueSurfaceDisplacement(...)`.

Must pass:

```text
Guard carries player toward wall/ceiling
→ Guard does not penetrate
→ player does not penetrate
→ player may jump off normally
```

---

# 21. M12 — fix static Boss Rope self-occlusion

This is a generic but Boss04-critical P0.

Current static candidate logic must exclude the candidate surface itself from Rope occlusion.

Conceptual fix:

```js
ropeOccluders.some(
    divider =>
        divider.id !== surface.id &&
        segmentIntersectsSurface(origin, point, divider)
)
```

Do not globally disable `ropeOccluder` on Boss geometry merely to avoid self-blocking.

The same surface should:

```text
remain attachable to itself
AND
still occlude a different Rope target behind it
```

Primary file:

```text
src/game/input/RopePointerInput.js
```

Add a focused unit/regression test.

---

# 22. M13 — real Hub direct Rope attachment

Hub is stationary; it does not require a moving actor attachment if the visible Hub body itself is an authoritative Ropeable collision surface.

Recommended alignment:

```text
security-hub-deck
=
Hub physical body
=
Hub visible body
=
grappleable collision surface
```

Then:

```text
Shield ON
→ direct Hub Rope attach allowed
→ Core damage denied

CORE_OPEN
→ direct Hub Rope attach allowed
→ Core Rope Impact possible
```

Fix the static self-occlusion issue first so a grappleable Hub surface is actually usable.

Do not couple Rope attachment to Core vulnerability.

---

# 23. M14 — physically expose the Core

Current Core center exactly touches the player's non-penetrating outer contact envelope with no positive clearance.

Do not rely on exact tangency.

Add an authored Core offset / exterior exposure position.

Required:

```text
Core visual world position
=
Core impact-target world position
```

and:

```text
player can reach Core collider
without entering Hub Solid
with positive geometric clearance
```

Core should be reachable both:

1. from a Rope already attached to Hub before Core opens,
2. by a fresh Hub attach during the Core window.

Do not require clipping through Hub geometry.

Final Core placement/tuning may be adjusted in playtest, but non-penetrating positive clearance is mandatory.

---

# 24. M15 — mandatory movement must use real Rope targets

Current planning graph is healthy:

```text
22 anchors
21 edges
max point edge ≈ 353.553
```

but this does not prove gameplay traversal.

At least one current physical transition can require about:

```text
443 px
```

from a stable standing position.

## R1 movement-usability requirement

For a **mandatory stable route**:

```text
preferred stable attachment distance <= 360 px
361..400 px = only when intentionally readable
>400 px = not acceptable as mandatory stable route
```

If a >400 transition is deliberately retained:

```text
it must be optional skill routing
or
the required jump-to-hook action must be explicitly telegraphed and playtested
```

Preferred fix for the current P3 climb:

```text
add/reposition a visible physical grappleable hardpoint/platform
```

No invisible floating mandatory anchor.

## Traversal validation

Build a Boss04 traversal QA that uses the same actual target classes as gameplay:

```text
grappleable collision surfaces
+
dynamic Rope attachment targets
```

Do not certify movement using route-anchor distances alone.

Prove:

```text
Entry
→ P1
→ Refuge
→ P2
→ P3
→ Hub
→ post-victory exit
```

with Base Rope.

---

# 25. M16 — protected gate collision must actually open

Visual state alone is insufficient.

Required completion transition:

```text
Hub HP reaches 0
→ Hub SHUTDOWN
→ protected gate visual opens
→ protected gate collision disabled/removed
→ exit trigger physically reachable
```

Possible implementation strategies:

- completion-gated collision filtering,
- dynamic Boss collision surface owned by Runtime,
- propagated `blockedByBossStageId` semantics if compatible with current shared world architecture.

Do not leave a static Solid occupying the exit trigger after completion.

QA must attempt physical crossing through the center of the intended opened gate, not around an edge.

---

# 26. M17 — Warning geometry = Damage geometry

## Guard A

Future landing burst:

```text
radius 130
```

Warning must show the same effective 130-radius region.

Do not show `240 × 150` while damaging a 260-diameter circle.

## Guard B

Warning must represent:

- locked landing,
- real dash approach/path if needed for readability,
- actual damaging body footprint.

## Hub Beam

Current Warning/Active uses the same authored beam bounds conceptually; preserve that.

## Hub Burst

During `BURST_WARNING`:

```text
show every future burst position
with same radius/shape as BURST_ACTIVE
```

Player movement decisions must never be invalidated by a larger hidden future hitbox.

---

# 27. M18/M19 — Hub route fairness

## Beam

A Beam direction is valid only if the player's current **actually accessible** route-entry context has reachable Hub-only safety.

Do not choose graph start from straight-line nearest anchor through Solid.

Concept:

```text
player current position
→ actually accessible route-entry node(s)
→ traverse mandatory routeEdges
→ exclude Beam-covered nodes
→ safe reachable set
```

Optional `SWING_ATTACK` anchors are not automatically mandatory safety nodes.

Multiplayer preference:

1. safe route for every active P3 player,
2. otherwise maximize players with safety,
3. maximize total safe nodes,
4. avoid repeat direction when possible,
5. deterministic tie-break.

Ignore concurrent Guards when validating Hub-only Beam fairness.

## Landing Burst

Use actual post-Beam player state.

```text
reachable >= 3 → attack 2
reachable == 2 → attack 1
reachable == 1 → attack 0
```

Always preserve at least one Hub-only safe landing.

---

# 28. M20 — Guard Rope presentation must match authority

Gameplay already supports surface-local Guard Rope attachment.

Do not rewrite it as center-only attachment.

Change presentation/readability so the player is not told the opposite.

Required:

```text
actual Guard is Ropeable
→ rendered Guard state / target feedback also communicates Ropeable
```

Mobile/coarse pointer QA is mandatory because Guard is a moving target.

---

# 29. M21/M22 — camera

## Singleplayer

Replace permanent generic Hub weighting with local-threat logic.

Priority:

1. local player,
2. Warning/ACTIVE world hazard threatening local player,
3. attacker targeting local player,
4. relevant attack destination/path,
5. nearest active relevant Guard,
6. Hub while locally relevant in P3,
7. exposed weakpoint.

Do not force the entire arena into frame.

Do not keep a permanent P1/P2 Hub pull.

The current fixed Boss `0.55` zoom should not be the Boss04 default movement camera.

Initial playtest range for ordinary Boss04 movement:

```text
~0.72–0.85
```

This range is tuning guidance, not DESIGN LOCKED.

Large Beam telegraphs may widen temporarily.

## Multiplayer

Each client camera is local-player-centric.

Current missing-method defect must be fixed through a shared camera resolver/helper instead of copying singleplayer code.

Do not use distant teammates to force zoom-out.

A hazard can be locally camera-relevant even if another player authored the attack.

---

# 30. M23/M24 — multiplayer recovery / respawn movement

## Victory

Current generic spectator recovery sends spectators to Boss entry.

Boss04 victory should recover them near:

```text
P3 completion / exit-side safe geometry
```

not P1.

## Wipe / recovery

Do not stack all players on exactly the same Boss recovery point.

Use deterministic spacing and collision-safe placement.

Required:

```text
base recovery point
→ per-player offset
→ validate against Solid
→ avoid active Boss body overlap where practical
```

Do not spawn players inside each other or inside architecture.

---

# 31. Snapshot / network requirements

Any new gameplay-authoritative state must survive snapshot/restore.

## Common Guard

```text
state
health
position
timer
targetPlayerId
facing
```

## A

```text
attackPositions
attackIndex
sequential sub-timer / deterministic equivalent
```

## B

```text
dashStart
dashTarget
dashDirection
dash progress / deterministic remaining state
targetReferencePosition
weakpointSide
```

## Hub

Preserve:

```text
state
health
timer
beamDirection
burstPositions
```

## Encounter

Preserve:

- Guard deaths,
- Links,
- participant states,
- attempt,
- hazard sequence,
- processed impact IDs,
- processed hazard-contact IDs,
- event sequence,
- late-join no-rescale contract.

Mid-A-burst restore must continue same burst index.

Mid-B-dash restore must continue same dash target/direction/progress.

---

# 32. Code modification map

## `src/game/boss/ResidentialSecuritySystemRuntime.js`

Primary work:

- delete Territory/LOS/RETURN,
- explicit B activation,
- per-cycle target lock,
- A sequential burst,
- B real dash,
- role-specific pursuit standoff,
- Solid sweep / one-way ignore,
- facing,
- weakpoint world positions,
- ACTIVE body hazards/knockback metadata,
- Hub Beam/Burst graph safety,
- Core external world position,
- snapshot/restore additions,
- Warning presentation states,
- gate completion collision contract hook if Runtime-owned.

## `src/game/boss-authoring/specs/boss-04.json`

Primary work:

- remove `territoryBounds`,
- update stale HUD objective text,
- author B activation trigger,
- adjust/add P3 real physical hardpoint(s),
- make Hub physical body Ropeable,
- author Core offset if spec-owned,
- express protected-gate collision ownership if spec-owned,
- preserve open P1/P2/P3 topology.

## `src/game/input/RopePointerInput.js`

P0 generic fix:

- candidate static surface must not self-occlude.

Preserve:

- other geometry still occludes Rope,
- Guard surface-local `localAnchor` behavior.

## `src/game/simulation/GameSimulation.js`

Expected integration:

- actor-aware multiple Boss weakpoint targets,
- directional composite Boss knockback,
- moving-Guard support carry or bridge to generic physics,
- Hub route graph context if needed,
- Boss04 completion-side spectator recovery,
- multi-player recovery spacing/safe placement,
- protected-gate completion collision filtering if simulation-owned,
- preserve dynamic Rope local-anchor sync.

## `src/game/physics/KinematicPhysicsBody.js`

Boss04 caller should use:

```text
collisionRestitution: 0
```

No global default change is required unless independently justified.

## `src/game/physics/colliders/PolygonCollider.js`

Reuse existing:

```text
farthestSafePositionAlong()
```

for Guard flight and B dash Solid sweep.

## `src/game/physics/SurfacePhysicsMixin.js`

Reuse support/carry primitives such as:

```text
queueSurfaceDisplacement(...)
```

through collision-resolved player movement.

## `src/game/GameApp.js`
## `src/game/MultiplayerGameApp.js`
## `src/game/camera/*`

Create shared local-threat Boss camera logic.

Remove multiplayer dependency on undefined `this.updateCamera()`.

## `src/render/boss/*`

Align:

- Guard Ropeable cue,
- A sequential warning/current burst,
- B real dash,
- real weakpoint locations,
- Hub Burst warning,
- Core external location,
- gate open state,
- local hazard readability.

---

# 33. P0 implementation order

## P0-0 — remove contradictory mechanics

1. remove Territory/LOS/RETURN behavior/spec text.

## P0-1 — restore actual movement viability

2. fix static Boss Rope self-occlusion,
3. prove real Base-Rope traversal,
4. fix current P3 >400 stable gap,
5. make protected gate physically open,
6. make Hub directly Ropeable,
7. expose Core with positive non-penetrating clearance.

## P0-2 — Guard combat/movement

8. cycle target lock,
9. A sequential burst,
10. B real dash,
11. Solid sweep / one-way ignore,
12. role-specific standoff / anti-hard-pin,
13. real weakpoints,
14. ACTIVE body damage + knockback,
15. moving-platform carry,
16. simultaneous weakpoint targeting.

## P0-3 — multiplayer/client correctness

17. snapshot/restore new state,
18. shared camera resolver / missing multiplayer method,
19. deterministic movement/hazard QA.

## P1

20. graph-safe Hub Beam,
21. reachable Hub Burst,
22. Guard Rope presentation alignment,
23. threat-aware camera tuning,
24. spectator/retry recovery UX,
25. optional final attack anchors if still useful.

## P2 / playtest

26. coyote/jump buffer if edge-jump still feels harsh,
27. hook-miss reload tuning if misses remain punitive after targeting fixes,
28. numerical standoff/zoom/weakpoint offset tuning,
29. final VFX/audio/animation,
30. docs cleanup.

---

# 34. Optional movement tuning — NOT DESIGN LOCKED

Do not tune around structural bugs.

Only after P0 movement fixes:

## Coyote time / jump buffer

If edge jump still feels strict:

```text
coyote time ≈ 0.08 s
jump input buffer ≈ 0.10 s
```

Playtest first.

## Failed hook reload

Current default launch reload is relatively punitive for a miss.

After targetability/self-occlusion is fixed, if misses still interrupt flow:

```text
test failed-hook reload ≈ 0.3–0.5 s
```

Do not change successful release behavior automatically with this tuning.

## Rope-attached horizontal control

Do not change the core Rope control model merely to hide Boss04 geometry problems.

Revisit only after real Rope targets, camera, and routes are correct.

---

# 35. Deterministic / automated QA

## QA-00 Persistent pursuit regression

```text
Guard detected
→ player leaves authored phase/territory area
→ LOS blocked by pergola
EXPECT:
no RETURN
no DORMANT
pursuit cycle continues
```

---

## QA-01 B activation

```text
A DEAD
player at recovery-refuge
EXPECT B DORMANT
```

Then:

```text
player crosses explicit B activation trigger
EXPECT B CHASE
```

Do not assert that current Refuge is inside P2; it is not at latest coordinates.

---

## QA-02 cycle target lock

```text
A targets P1
P2 becomes closer during same cycle
EXPECT target remains P1
```

---

## QA-03 target death timing

Before Warning:

```text
target dies
→ replacement allowed
```

After Warning:

```text
target dies
→ attack geometry unchanged
→ attack executes
```

---

## QA-04 A sequential attack

```text
3 locked positions
→ burst0
→ interval
→ burst1
→ interval
→ burst2
```

Only current landing burst damages.

Guard A body remains damaging for full ACTIVE.

Each burst has unique deterministic contact ID.

---

## QA-05 B real dash

```text
B ACTIVE
→ Guard B world position changes toward dashTarget
```

No stationary B + remote fake dash.

---

## QA-06 B Solid / one-way

Solid:

```text
dash collides
→ no penetration
→ immediate RECOVERY
```

One-way:

```text
Guard flight passes through
```

---

## QA-07 weakpoint geometry

A:

```text
rear-thruster == actual rear of facing
presentation == impact target
```

B:

```text
opposite target side
fixed for Recovery
presentation == impact target
```

---

## QA-08 simultaneous weakpoints

```text
A RECOVERY
B RECOVERY
→ both weakpoints valid impact targets
```

---

## QA-09 Guard direct Rope surface

Aim near visible edge of Guard polygon.

```text
EXPECT:
surface-local attachment
localAnchor not forced to center
anchor follows Guard movement
```

Also verify presentation communicates Ropeability.

---

## QA-10 static Boss surface self-occlusion

Create/choose one Boss grappleable surface with `ropeOccluder:true`.

```text
aim at that same surface
→ attachment succeeds
```

Place another Rope target behind it:

```text
same surface
→ still occludes target behind
```

---

## QA-11 Hub direct Rope

Shield ON:

```text
Hub Rope attach succeeds
Core damage = 0
```

CORE_OPEN:

```text
Hub Rope attach succeeds
valid Rope Impact can damage Core
```

---

## QA-12 Core physical accessibility

From every intended Core approach:

```text
player never enters Hub Solid
Core overlap has positive clearance
valid Rope Impact can reach >=620 speed
```

Test:

- pre-attached Rope before Core opens,
- fresh attach during Core window.

---

## QA-13 real mandatory traversal

Using only real gameplay Rope targets:

```text
Entry
→ P1
→ Refuge
→ P2
→ P3
→ Hub
→ Exit
```

must clear with Base Rope.

Do not use route anchors as fake attachment targets in the test.

---

## QA-14 stable P3 margin

Current regression case:

```text
upper-skybridge
→ left/P3 refuge climb
```

After fix:

```text
mandatory stable attachment <= intended margin
prefer <=360
never >400
```

---

## QA-15 protected gate collision

Before completion:

```text
gate blocks
```

After Hub shutdown:

```text
gate visual open
gate collision gone
player crosses intended gate center
exit trigger reachable
```

---

## QA-16 Warning = Damage

For A and Hub Burst:

```text
Warning region == future damaging region
```

For B:

```text
Warning communicates actual dash target/body path sufficiently for avoidance
```

---

## QA-17 Guard contact / hard-pin

Non-ACTIVE body:

```text
no attack damage
no generic bounce
```

Guard approaching player near Solid:

```text
no repeated compression into wall
no embedded player
```

---

## QA-18 moving-platform carry

```text
player grounded on Guard
Guard moves delta
→ player receives support movement
```

Toward Solid:

```text
Guard no penetration
player no penetration
```

ACTIVE transition:

```text
rider can be hit + knocked away
```

---

## QA-19 ACTIVE directional knockback

A:

```text
knockback authored outward/from Guard
```

B:

```text
knockback follows dashDirection
```

---

## QA-20 Hub Beam fairness

Start graph search only from actually accessible route entry nodes.

A straight-line-nearest node across Solid is invalid.

Selected Beam follows the Hub-only safety policy.

---

## QA-21 Hub Burst count

```text
reachable >=3 → attack2
reachable ==2 → attack1
reachable ==1 → attack0
```

At least one Hub-only safe landing remains.

---

## QA-22 last Guard death

During current Hub attack:

```text
last Guard dies
→ Link OFF
→ current attack completes
→ Core opens
```

---

## QA-23 Hub retreat

All active players leave P3:

```text
current Hub cycle cancelled
HP/deaths/Links persist
```

Re-entry:

```text
fresh Beam
```

---

## QA-24 multiplayer camera

Boss04 multiplayer client update loop:

```text
no missing this.updateCamera() error
```

Each client frames own local player/threat.

---

## QA-25 local hazard camera relevance

Attack authored from P1.

P2 moves into Warning/hazard.

```text
P2 camera treats hazard as locally relevant
```

even though `targetPlayerId != P2`.

---

## QA-26 wipe recovery spacing

2–4 players wipe.

```text
no identical-position stack
no Solid spawn
no immediate Boss-body overlap where avoidable
```

---

## QA-27 spectator victory recovery

Spectator exists when Hub dies.

```text
recover near P3 completion / exit-safe area
NOT Boss entry
```

---

## QA-28 A mid-burst snapshot

Restore mid-sequence:

```text
same attackIndex
same remaining timing
no restart burst0
```

---

## QA-29 B mid-dash snapshot

Restore mid-dash:

```text
same dashTarget
same dashDirection
same progress
same targetReferencePosition
```

---

## QA-30 dead-target B side

Target dies after Warning.

```text
original dash completes
side weakpoint uses stored targetReferencePosition
snapshot/restore picks same side
```

---

# 36. Manual browser / gameplay QA

Automated tests are necessary but not sufficient.

## 36.1 Movement pass — 1P

Clear Boss04 from Entry to Exit with Base Rope and no debug movement.

Record any place where the tester reports:

- “왜 안 걸리지?”
- “여기 어디에 걸어야 하지?”
- “벽에 끼었다.”
- “보이는 경고보다 더 크게 맞았다.”
- “카메라 때문에 다음 지점이 안 보였다.”
- “Core는 보이는데 정상적으로 못 때리겠다.”
- “Gate는 열렸는데 못 지나간다.”

Any reproducible case is a movement QA failure until classified and resolved.

## 36.2 P1

Verify:

- A persistent pursuit after LOS break,
- no RETURN,
- surface-local Rope on A,
- ride/jump-off,
- sequential warning/bursts,
- A body hazard,
- rear weakpoint readability,
- camera shows local movement space.

## 36.3 Refuge / P2

Verify:

- Refuge safe with A dead / B dormant,
- B activation requires intended commitment,
- B lateral standoff does not body-block route,
- B real dash,
- Solid stop,
- one-way pass,
- side weakpoint readable.

## 36.4 P3 / Hub

Verify:

- no hidden >400 mandatory stable Rope requirement after fix,
- Hub body directly Ropeable,
- Core attack possible without clipping,
- Beam/Burst safe routes readable,
- Core window practical both pre-attached and fresh-attach,
- gate collision really opens,
- exit reachable.

## 36.5 2P

Verify:

- independent cycle targets,
- all-player hazard collision,
- one player can draw aggro while other attacks weakpoint,
- both weakpoints can coexist,
- independent local cameras,
- no respawn stack,
- victory spectator recovery.

## 36.6 3–4P smoke

Verify:

- no spawn pile-up,
- no target-selection nondeterminism,
- no simultaneous-hazard crash,
- no camera forced by distant teammates,
- late join no rescale.

---

# 37. Regression constraints

Do not regress:

- generic Player movement,
- current player one-way semantics,
- Base Rope reach,
- Rope attach buffer,
- Rope dynamic surface-local anchors,
- Rope owner movement sync,
- Rope impact de-duplication,
- Boss participant scaling,
- late join no-rescale,
- owner prediction,
- shared impact IDs,
- other Boss runtimes,
- regular Stage portal architecture,
- `4-8 → Boss04 → 5-1`,
- Guard death persistence,
- Hub retreat persistence,
- Boss completion persistence.

Especially:

> Fixing Guard/Hub Rope must not revert PR-era shared Ropeable-surface architecture to center-point-only Boss attachment.

---

# 38. Documentation cleanup after R1

After implementation and QA:

## `docs/boss/04/README.md`

Only after actual passes, update status to something equivalent to:

```text
AUTHORED FINAL CONTENT
RUNTIME R1 ALIGNED
MOVEMENT QA PASSED
SINGLEPLAYER QA PASSED
MULTIPLAYER QA PASSED
POLYGON MOCK / FINAL ART STATUS AS ACTUAL
```

## `docs/scenario-development-integration.md`

Remove or clearly mark stale Boss04 statements that claim Runtime/collision/snapshot are unimplemented.

Also remove/mark any current statement that describes Territory/LOS/RETURN as the intended Boss04 design.

Historical provenance may remain if explicitly labeled historical.

---

# 39. Definition of Done

Boss04 R1 is complete only when all applicable items are true:

```text
[ ] current main rebased/reconciled before implementation
[ ] RETURN state removed from Boss04
[ ] territoryBounds removed from Boss04 final mechanics
[ ] LOS/territory no longer de-aggros Guards
[ ] weakpoints open only in authored Recovery
[ ] Guard A/B HUD objective text matches final attack→Recovery loop

[ ] B uses explicit intentional activation trigger
[ ] Refuge recovery does not activate B by itself

[ ] Guard target locks for one full attack cycle
[ ] candidate generation uses locked target
[ ] Warning does not retarget after target death

[ ] A burst is sequential
[ ] A body remains damaging during full ACTIVE
[ ] each A burst has unique deterministic contact identity

[ ] B physically dashes
[ ] B dash stops on Solid
[ ] Guard flight ignores one-way
[ ] B targetReferencePosition fallback deterministic

[ ] A has real facing
[ ] A rear weakpoint physically behind facing
[ ] B side weakpoint physically on locked opposite side
[ ] weakpoint visual == impact position
[ ] A+B weakpoints may both be impact targets

[ ] non-ACTIVE Guard contact has no attack damage
[ ] Boss04 Guard collision restitution tuned for non-bouncy contact
[ ] A/B use role-specific standoff
[ ] player cannot be hard-pinned into Solid
[ ] Guard Solid sweep works
[ ] player may stand on Guard
[ ] Guard support carry is collision-resolved
[ ] ACTIVE start can hit/knock rider away

[ ] existing Guard surface-local Rope attachment is preserved
[ ] Guard presentation communicates actual Ropeability
[ ] static Boss Rope surface does not self-occlude
[ ] static Boss surface still occludes different targets behind it

[ ] Hub has real direct Rope authority
[ ] Hub attachment works Shield ON and CORE_OPEN
[ ] Core is physically outside/accessible with positive non-penetrating clearance
[ ] pre-attached Core strike is practical
[ ] fresh-attach Core strike is practical
[ ] Core visual and impact position match

[ ] mandatory real Rope traversal passes Entry→Exit with Base Rope
[ ] no mandatory stable Rope target is >400 px
[ ] current P3 ~443 px stable-gap regression is removed/reclassified
[ ] mandatory grapples use visible physical targets, not invisible planning anchors

[ ] Warning geometry equals Damage geometry
[ ] Hub Burst Warning is visible and matches active hazard

[ ] protected gate collision blocks before completion
[ ] protected gate collision actually disappears/opens after Hub shutdown
[ ] exit trigger is physically reachable

[ ] Hub Beam uses actual route-entry reachability
[ ] Hub Burst preserves Hub-only safe landing
[ ] last Guard death does not cancel current Hub attack
[ ] Hub retreat preserves HP/deaths/Links

[ ] singleplayer Boss04 camera uses local threat rather than permanent Hub bias
[ ] Boss04 does not use fixed 0.55 as ordinary movement framing
[ ] multiplayer no longer calls missing updateCamera
[ ] each client camera is local-player-centric
[ ] local hazards matter even if another player authored the attack

[ ] Boss wipe/recovery positions are spaced and collision-safe
[ ] spectator victory recovery occurs near completion side
[ ] A mid-burst restore deterministic
[ ] B mid-dash restore deterministic

[ ] automated tests pass
[ ] repository check/format/scenario-integration checks pass
[ ] browser 1P Boss04 full movement/combat pass
[ ] browser 2P Boss04 pass
[ ] 3–4P smoke pass or explicit blocker documented
[ ] docs updated only after actual QA
```

---

# 40. Developer execution order

```text
1. Read current main before editing.
2. Read this handoff as Boss04 gameplay source of truth.
3. Remove latest-main Territory/LOS/RETURN regression first.
4. Fix static Boss Rope self-occlusion before judging map reachability.
5. Run real Base-Rope traversal test.
6. Fix P3 hardpoint / Hub Rope / Core clearance / gate collision.
7. Implement Guard target/attack/physics R1.
8. Add snapshot tests with each new state.
9. Fix shared camera and multiplayer missing-method defect.
10. Implement Hub graph fairness.
11. Run automated suite.
12. Run browser 1P, 2P, then 3–4P smoke.
13. Update documentation only after real pass.
```

If a DESIGN LOCKED behavior is technically impossible without a cross-game regression:

```text
document exact blocker
→ name affected shared contracts/files
→ preserve closest safe behavior
→ request an explicit design exception
```

Do not silently replace locked gameplay with another mechanic.

---

# 41. Final current-main status

At `main@ea007998cef6168bfa4139d06f443eb444acfda5`:

```text
Boss04 authored stage exists
Boss04 dedicated Runtime exists
Guard surface-local Rope attachment exists
Guard death / Link / Hub cycle / snapshot foundations exist

BUT

latest main has reintroduced deleted Territory/LOS/RETURN behavior,
Guard attacks are not aligned with final A/B design,
movement contains several structural friction/blocker risks,
Hub direct Rope authority is missing,
Core contact has zero physical clearance,
static Boss surface Rope self-occlusion can invalidate grapples,
a stable mandatory P3 transition exceeds Base Rope reach,
protected gate collision may remain after visual completion,
and camera/multiplayer integration still needs R1 correction.
```

This handoff defines the work required to close those gaps.

---

**END — BOSS04 LATEST IMPLEMENTATION HANDOFF**
