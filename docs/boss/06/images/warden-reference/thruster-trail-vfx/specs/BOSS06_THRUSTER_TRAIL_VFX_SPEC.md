# ONE ROPE --- Boss06 `CONTINUITY WARDEN`

# `thruster_trail_vfx` Art Specification v1

## Production Order

Package 02 --- COMBAT EXTENSION / VFX

Current Asset:

`thruster_trail_vfx`

Previous: - overhead_ground_impact_vfx

------------------------------------------------------------------------

# 1. Purpose

`thruster_trail_vfx` is the movement trail effect used for:

-   ground-thruster-dash
-   diagonal-thruster-dash

The purpose is:

> Make the Warden's short-range thruster movement immediately readable.

------------------------------------------------------------------------

# 2. Gameplay Readability

Must communicate:

-   rapid reposition movement
-   short burst propulsion
-   mechanical thruster activation

Must be different from:

## Charge Trail

Dash: - short - quick - reposition movement

Charge: - long - committed - stronger movement line

------------------------------------------------------------------------

# 3. Style Lock

Maintain Boss06 visual language:

-   industrial security technology
-   cyan energy
-   mechanical propulsion
-   cold steel sci-fi

------------------------------------------------------------------------

# 4. Required Elements

Recommended:

-   compact cyan exhaust
-   mechanical heat glow
-   short motion streak
-   small particles

Avoid:

-   rocket engine
-   fire flame
-   magic trail
-   projectile beam

------------------------------------------------------------------------

# 5. Runtime Contract

Purpose:

Movement overlay VFX

Rules:

-   timing controlled by Runtime
-   no movement modification
-   no collision modification

Pivot:

rear/waist thruster position

------------------------------------------------------------------------

# 6. Scale Rule

Compared to Charge Trail:

-   shorter
-   thinner
-   less intense

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

\[ \] Reads as thruster movement

\[ \] Different from charge trail

\[ \] Cyan industrial style

\[ \] Not fire

\[ \] Runtime VFX suitable

------------------------------------------------------------------------

Next:

Create `thruster_trail_vfx` main image.
