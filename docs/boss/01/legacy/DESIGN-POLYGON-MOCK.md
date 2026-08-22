# Design

## Source of truth

- Status: Active
- Last refreshed: 2026-08-22
- Primary product surfaces: Polygon gameplay, Map Editor runtime preview, gameplay HUD
- Evidence reviewed: `src/render/polygon/PolygonActorRenderers.js`, `docs/boss/01/final-content/*`, Boss01 Spec

## Brand

- Personality: readable industrial machinery, precise system feedback, restrained neon accents
- Trust signals: collider-aligned silhouettes and state changes that remain legible without final art
- Avoid: generic placeholder rectangles, decorative detail that implies nonexistent collision, creature-like Boss anatomy

## Product goals

- Goals: let a developer identify Boss phase, attack direction, telegraph and weakpoint state from gameplay alone
- Non-goals: final sprite art, cinematic polish, additional collision or gameplay rules
- Success signals: P1/P2/P3 screenshots are distinguishable with labels and HUD hidden

## Personas and jobs

- Primary personas: gameplay developer, level designer, playtester
- User jobs: compare authored intent with the running Boss and tune position/timing safely
- Key contexts of use: Polygon mode and Map Editor Boss Preview

## Information architecture

- Primary navigation: existing game and Map Editor flows stay unchanged
- Core routes/screens: `boss-01` Preview
- Content hierarchy: Player/Rope → Carriage → active Beam/Ram → weakpoint → arena

## Design principles

- Collider truth: every mock silhouette is centered on and bounded by its presentation object
- State before decoration: shape, direction and line treatment must distinguish states before color does
- Tradeoffs: diagnostic readability takes priority over realistic machine proportions

## Visual language

- Color: reuse Polygon cyan/yellow/rose accents over slate industrial bodies
- Typography: existing HUD only; world mock adds no labels
- Spacing/layout rhythm: details scale from the authored collider bounds
- Shape/radius/elevation: polygons, circles, cogs, hazard stripes and direction chevrons; no shadow depth
- Motion: Runtime state selects telegraph outlines, speed lines and disabled opacity
- Imagery/iconography: no image asset; Carriage uses body, bogie, wheels, lock plate and core primitives

## Components

- Existing components to reuse: Polygon renderer composition and `RenderFrameStats`
- New/changed components: kind-specific Boss polygon object renderers
- Variants and states: full/directional/broken Beam, Ram telegraph/attack/recovery, secured/exposed weakpoints
- Token/component ownership: Boss renderer definition registry owns mock colors and primitives

## Accessibility

- Target standard: color is supplementary; silhouette and line pattern carry state
- Keyboard/focus behavior: unchanged
- Contrast/readability: active hazards use bright outline against industrial backgrounds
- Screen-reader semantics: Canvas behavior unchanged
- Reduced motion and sensory considerations: state lines are static per frame; no independent flashing timer

## Responsive behavior

- Supported breakpoints/devices: existing Canvas camera and mobile scaling
- Layout adaptations: world shapes remain authored-world sized
- Touch/hover differences: none

## Interaction states

- Loading: existing Preview status
- Empty: no Boss presentation draws nothing
- Error: existing Preview error boundary
- Success: exposed weakpoint changes shape emphasis and outline
- Disabled: stopped Carriage uses reduced light and power indicators
- Offline/slow network, if applicable: unchanged

## Content voice

- Tone: mechanical and operational
- Terminology: Carriage, Full Beam, Directional Beam, Rail Ram, Rear Drive, Side Gearbox, Central Lock Core
- Microcopy rules: world mock contains no new text

## Implementation constraints

- Framework/styling system: Canvas 2D and repo-native renderer composition
- Design-token constraints: fixed lookup objects, no runtime `Map` for static variants
- Performance constraints: one save/restore per object renderer and one stats collection per frame
- Compatibility constraints: immutable presentation DTO; no Boss ID branching in the generic renderer
- Test/screenshot expectations: state diagnostics plus actual Polygon Boss Preview console and screenshot

## Open questions

- [ ] Final production Boss sprite package remains a separate asset task.
