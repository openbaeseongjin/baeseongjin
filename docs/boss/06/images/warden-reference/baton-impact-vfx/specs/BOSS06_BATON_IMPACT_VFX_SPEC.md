# ONE ROPE --- Boss06 `CONTINUITY WARDEN`

# `baton_impact_vfx` Art Specification v1

## Production Order

Package 02 --- COMBAT EXTENSION / VFX

Current Asset:

`baton_impact_vfx`

Previous: - warden_counter_bash

------------------------------------------------------------------------

# 1. Purpose

`baton_impact_vfx` is the impact feedback effect for Shock Baton
attacks.

The purpose is:

> Make the player immediately understand that the Baton attack
> connected.

This is not a weapon replacement.

------------------------------------------------------------------------

# 2. VFX Role

Must communicate:

-   impact location
-   hit confirmation
-   energy discharge

Must NOT communicate:

-   new weapon
-   projectile attack
-   magic effect

------------------------------------------------------------------------

# 3. Style Lock

Maintain Boss06 visual language:

-   industrial security technology
-   cyan energy
-   cold steel
-   mechanical electricity
-   clean sci-fi combat feedback

------------------------------------------------------------------------

# 4. Required Elements

Recommended:

-   short cyan electrical burst
-   small impact flash
-   mechanical sparks
-   directional hit cue

Avoid:

-   large explosion
-   fire
-   fantasy magic
-   excessive particles

------------------------------------------------------------------------

# 5. Runtime Contract

Canvas:

small overlay VFX asset

Pivot:

impact center

Runtime authority:

-   VFX timing controlled by code
-   VFX does not modify damage
-   VFX does not modify hitbox

------------------------------------------------------------------------

# 6. Layer Order

front VFX

↓

impact point

↓

weapon/body relationship

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

\[ \] Reads as Baton impact

\[ \] Cyan industrial energy style

\[ \] Not a projectile

\[ \] Not an explosion

\[ \] Runtime overlay suitable

------------------------------------------------------------------------

Next:

Create `baton_impact_vfx` main image.
