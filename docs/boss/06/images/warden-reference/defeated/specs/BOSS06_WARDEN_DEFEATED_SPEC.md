# ONE ROPE --- Boss06 `CONTINUITY WARDEN`

# `warden_defeated` Art Specification v1

## Production Order

Package 01

Current Asset:

`warden_defeated`

Previous: - warden_security_command

------------------------------------------------------------------------

# 1. Purpose

`warden_defeated` is the final combat state after CONTINUITY WARDEN is
defeated.

The purpose is not another combat pose.

It is:

> Victory transition starting point.

The player must understand:

-   Boss defeated
-   Combat ended
-   Transition to victory sequence begins

------------------------------------------------------------------------

# 2. Base Lock

Use the approved Warden base.

Maintain:

-   same helmet
-   same visor
-   same graphite armor
-   same cold steel plates
-   same cyan accent
-   same Solid Armor Plate Shield
-   same Shock Baton
-   same human-scale silhouette

Only change:

-   collapse posture
-   weapon/shield resting position
-   body state

------------------------------------------------------------------------

# 3. Forbidden Changes

Do NOT add:

-   new armor
-   new damage form
-   destroyed redesign
-   missing major body parts
-   fantasy transformation
-   different character silhouette

------------------------------------------------------------------------

# 4. Gameplay Readability

The player should immediately read:

"CONTINUITY WARDEN has been defeated."

Required:

-   loss of combat stance
-   reduced threat posture
-   inactive equipment feeling

------------------------------------------------------------------------

# 5. Required Pose

Recommended:

-   body lowered or collapsed
-   knees weakened
-   shield lowered
-   baton inactive
-   visor inactive or lowered

Avoid:

-   attack pose
-   guard pose
-   charge pose
-   command pose

------------------------------------------------------------------------

# 6. Technical Contract

Canvas:

128×192 px

Output:

128×192 world px

Facing:

right-facing

Pivot:

bottom-center / feet center

Collider reference:

96×150 world px

Runtime authority:

-   animation timing controlled by Runtime
-   sprite does not change collision

------------------------------------------------------------------------

# 7. Layer Order

rear VFX

↓

body

↓

rear arm

↓

weapon/shield

↓

front arm

↓

front VFX

------------------------------------------------------------------------

# 8. Image Production Rule

Create:

-   one character
-   one pose
-   one main image

Do not include:

-   text
-   UI
-   labels
-   measurements
-   sprite sheet
-   concept board

------------------------------------------------------------------------

# 9. P0 Verification

\[ \] Same Warden base

\[ \] Reads as defeated

\[ \] Not a combat stance

\[ \] Shield/Baton inactive

\[ \] No new design elements

\[ \] Runtime asset suitable

------------------------------------------------------------------------

Next:

Create `warden_defeated` main image.
