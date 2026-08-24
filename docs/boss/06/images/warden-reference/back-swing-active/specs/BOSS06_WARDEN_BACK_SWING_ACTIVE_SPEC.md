# ONE ROPE --- Boss06 `CONTINUITY WARDEN`

# `warden_back_swing_active` Art Specification v1

## Production Order

Package 02 --- COMBAT EXTENSION

Current Asset:

`warden_back_swing_active`

------------------------------------------------------------------------

# 1. Purpose

`warden_back_swing_active` is a rear-direction melee attack variation.

The goal is not to create a new attack style, but to extend the existing
baton melee system.

Player must read:

> The Warden is striking backward / covering a rear threat.

------------------------------------------------------------------------

# 2. Base Lock

Use the approved Warden base.

Maintain:

-   same helmet
-   same visor
-   same graphite armor
-   same cold steel plates
-   same Solid Armor Plate Shield
-   same Short Shock Baton
-   same human-scale silhouette

Only modify:

-   torso rotation
-   baton arm position
-   attack direction

------------------------------------------------------------------------

# 3. Forbidden Changes

Do NOT add:

-   new weapon
-   sword
-   spear
-   large mechanical arm
-   new armor
-   new character design
-   fantasy elements

------------------------------------------------------------------------

# 4. Gameplay Readability

Must be clearly different from:

## Front Baton Attack

Front attack: - baton moves forward

Back Swing: - baton travels behind/rear side - body rotation shows rear
coverage

------------------------------------------------------------------------

# 5. Required Pose

Need:

-   same Warden standing body
-   rear shoulder rotation
-   baton pulled behind body
-   clear wind-up/active direction

Avoid:

-   overhead slam silhouette
-   charge posture
-   guard posture

------------------------------------------------------------------------

# 6. Technical Contract

Canvas:

128×192 px

World Output:

128×192 world px

Facing:

right-facing

Pivot:

bottom-center / feet center

Collider:

96×150 world px

Runtime authority:

-   sprite does not modify hitbox
-   animation follows Runtime timing

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

No:

-   text
-   UI
-   labels
-   measurements
-   sprite sheet
-   presentation board

------------------------------------------------------------------------

# 9. P0 Verification

\[ \] Same Warden base

\[ \] Baton remains Short Shock Baton

\[ \] Attack direction reads backward

\[ \] Not confused with front baton

\[ \] Not confused with overhead slam

\[ \] Runtime asset suitable

------------------------------------------------------------------------

Next:

Create `warden_back_swing_active` main image.
