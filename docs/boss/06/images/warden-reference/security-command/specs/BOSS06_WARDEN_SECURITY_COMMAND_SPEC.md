# ONE ROPE --- Boss06 `CONTINUITY WARDEN`

# `warden_security_command` Art Specification v1

## Production Order

Package 01

After: - warden_body_base - warden_shield_guard -
warden_shield_counter_ready - warden_baton - warden_overhead_slam -
warden_thruster_dash - warden_charge

Next Asset:

`warden_security_command`

------------------------------------------------------------------------

# 1. Purpose

`warden_security_command` is not a direct attack animation.

This pose represents:

> The Warden is ordering the security system to activate.

The player must read:

-   environmental threat incoming
-   Warden controls the arena
-   attack source is external security system

------------------------------------------------------------------------

# 2. Base Lock

This asset MUST use the approved Warden base.

Maintain:

-   same helmet
-   same visor
-   same graphite armor
-   same cold steel plates
-   same cyan accent
-   same Solid Armor Plate Shield
-   same Shock Baton
-   same human-scale silhouette

Only modify:

-   pose
-   arm position
-   minor posture

------------------------------------------------------------------------

# 3. Forbidden Changes

Do NOT add:

-   new armor
-   new weapon
-   horns
-   cape
-   fantasy elements
-   giant equipment
-   different character silhouette

------------------------------------------------------------------------

# 4. Gameplay Readability

Player must distinguish:

## Security Command

Meaning:

"System activation command"

NOT:

-   melee attack
-   baton attack
-   shield attack
-   charge

------------------------------------------------------------------------

# 5. Required Pose

Must show:

-   Warden mostly stationary
-   stable feet placement
-   commanding posture
-   one arm communicating command/control
-   visor focused toward arena/system direction

Recommended:

-   Baton lowered or inactive
-   Shield not blocking
-   body upright

------------------------------------------------------------------------

# 6. Security Command vs Security Active

## Command

Warden: - performs activation gesture

Environment: - attack has not started yet

## Active

Environment: - beam/security hazard appears

Warden: - can reuse neutral body

------------------------------------------------------------------------

# 7. Technical Contract

Canvas:

128×192 px

Output:

128×192 world px

Facing:

right-facing

Pivot:

bottom-center / feet center

Collider:

96×150 world px

Runtime authority:

-   animation does not control timing
-   sprite does not change hitbox

------------------------------------------------------------------------

# 8. Layer Order

rear VFX

↓

body

↓

rear arm

↓

shield/baton

↓

front arm

↓

front VFX

------------------------------------------------------------------------

# 9. Image Production Rule

After this MD approval:

Create only:

-   one character
-   one pose
-   one main image

Do NOT include:

-   text
-   UI
-   labels
-   measurements
-   sprite sheet
-   concept board

------------------------------------------------------------------------

# 10. P0 Verification

Before accepting:

\[ \] Same Warden base silhouette

\[ \] Reads as security command

\[ \] Not a combat attack pose

\[ \] Shield not Guard

\[ \] Baton not Strike

\[ \] No new equipment

\[ \] Suitable as runtime asset

------------------------------------------------------------------------

Next:

Create `warden_security_command` main image.
