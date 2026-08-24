# ONE ROPE --- Boss06 `CONTINUITY WARDEN`

# `departure_gate_closed_open` Art Specification v1

## Production Order

Package 03 --- SECURITY / VICTORY SET

Current Asset:

`departure_gate_closed_open`

Previous: - security_beam_high

------------------------------------------------------------------------

# 1. Purpose

`departure_gate_closed_open` is the main gate state transition asset for
the final encounter exit flow.

The purpose is:

> Communicate the transition from locked security state to escape route
> availability.

------------------------------------------------------------------------

# 2. Gameplay Readability

Must communicate:

-   closed security gate
-   opening sequence
-   available departure route

Must support:

-   Boss defeat flow
-   Rooftop evacuation
-   Maintenance Shuttle reveal sequence

------------------------------------------------------------------------

# 3. Style Lock

Maintain Boss06 visual language:

-   corporate continuity facility
-   industrial security architecture
-   cold steel structure
-   cyan control lighting

------------------------------------------------------------------------

# 4. Required Elements

Recommended:

-   segmented mechanical gate panels
-   security locking mechanism
-   cyan activation lights
-   opening state indication

Avoid:

-   fantasy portal
-   magical doorway
-   unrelated architecture style

------------------------------------------------------------------------

# 5. Runtime Contract

Purpose:

Environment state transition visual.

Rules:

-   Runtime controls open/close timing
-   Graphics do not modify collision
-   Graphics follow gameplay state

States:

-   closed
-   opening
-   open

------------------------------------------------------------------------

# 6. Image Production Rule

Create:

-   gate object asset
-   runtime environment purpose
-   transparent background if possible

No:

-   text
-   UI
-   labels
-   presentation board

------------------------------------------------------------------------

# 7. P0 Verification

\[ \] Reads as security gate

\[ \] Closed/open states understandable

\[ \] Matches Continuity Control architecture

\[ \] Runtime environment suitable

\[ \] Victory flow compatible
