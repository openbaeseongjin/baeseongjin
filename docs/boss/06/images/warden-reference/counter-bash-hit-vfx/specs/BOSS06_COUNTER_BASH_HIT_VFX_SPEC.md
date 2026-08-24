# ONE ROPE --- Boss06 `CONTINUITY WARDEN`

# `counter_bash_hit_vfx` Art Specification v1

## Production Order

Package 02 --- COMBAT EXTENSION / VFX

Current Asset:

`counter_bash_hit_vfx`

Previous: - guard_block_spark

------------------------------------------------------------------------

# 1. Purpose

`counter_bash_hit_vfx` is the impact feedback effect when the Warden
successfully lands Counter Bash.

The purpose is:

> Communicate a heavy shield-based counter impact and player knockback
> moment.

------------------------------------------------------------------------

# 2. Gameplay Readability

Must communicate:

-   shield collision
-   offensive counter success
-   heavy impact
-   knockback force

Must be clearly different from:

## Guard Block Spark

-   defensive
-   attack stopped
-   small shield contact

## Baton Impact

-   direct weapon hit
-   electrical strike

## Counter Bash Hit

-   shield strike
-   forward force
-   heavy collision

------------------------------------------------------------------------

# 3. Style Lock

Maintain Boss06 visual language:

-   industrial security technology
-   cold steel shield
-   cyan energy
-   mechanical impact feedback

------------------------------------------------------------------------

# 4. Required Elements

Recommended:

-   forward impact burst
-   shield collision flash
-   metallic fragments
-   cyan shock arc
-   short knockback streak

Avoid:

-   explosion
-   fire
-   magic
-   projectile effect

------------------------------------------------------------------------

# 5. Runtime Contract

Purpose:

Counter attack hit overlay VFX

Rules:

-   timing controlled by Runtime
-   no damage modification
-   no collision modification

Pivot:

shield impact point

------------------------------------------------------------------------

# 6. Scale Rule

Compared to:

Guard Block Spark: - larger - stronger - more aggressive

Overhead Ground Impact: - much smaller

------------------------------------------------------------------------

# 7. Image Production Rule

Create:

-   one VFX image
-   transparent background
-   runtime overlay purpose

No:

-   text
-   UI
-   labels
-   presentation board

------------------------------------------------------------------------

# 8. P0 Verification

\[ \] Reads as shield counter hit

\[ \] Different from guard block

\[ \] Heavy impact feeling

\[ \] Cyan industrial style

\[ \] Runtime VFX suitable
