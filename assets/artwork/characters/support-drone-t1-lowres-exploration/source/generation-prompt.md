# Support Drone T1 generation prompt

## Built-in ImageGen exploration

```text
Use case: stylized-concept
Asset type: low-resolution game enemy sprite exploration sheet for later normalization to transparent 32x32 cells
Input images: Image 1 is the exact current Sector 01 enemy family scale, palette, and low-resolution visual grammar; Image 2 is the Patrol Drone identity that the new design must not duplicate; Image 3 is the current Artillery Drone atlas identity that the new design must not duplicate.
Primary request: create a 3x3 sheet of nine closely related design variants for a compact Support Drone. This enemy does not attack the player and has no projectile. It stays at its authored position, detects the most wounded nearby allied enemy, and continuously restores that ally through a green directional support link.
Subject: each variant is one small upright industrial support drone with a stable compact clipped-hexagonal or clipped-diamond body, one visibly protected central green restoration core, and exactly two symmetrical lateral relay vanes or short prongs folded close to the body in idle. The relay parts must look able to open and direct a healing link toward another enemy, but no beam or target is shown. Use a small lower hover mass for stability, not a weapon.
Style/medium: genuine ultra-low-resolution pixel art designed natively for a 24x24 to 32x32 sprite, large deliberate square pixel clusters, hard edges, binary transparency, no antialiasing, no gradients, no texture or dithering. Match Image 1's near-black #050c18, blue-black #0e1e34, muted navy #263b56, warm gunmetal #756f64 body palette. Use green #4ade80 and pale green #bbf7d0 only for the restoration core and tiny relay tips; do not use the family red-orange or amber as the main role signal.
Composition/framing: exact 3x3 equal-cell layout on a genuinely transparent background; one complete centered front-facing upright drone per cell; consistent scale matching Image 1; generous transparent separation; no overlap; no labels and no visible grid.
Constraints: the role must read from silhouette before color; at most three major masses: compact body, paired relay vanes, stable lower hover mass. The body remains upright and non-directional. No external link beam, no second character, no target, no medical cross symbol, no text, logo, shadow, glow, floor, or watermark.
Avoid: cannon, barrel, muzzle, missile, projectile, detached shield plate, circular energy shield, artillery shutters or belly projector, pursuit wedge or arrowhead, Patrol's wide detached side motor pods, Sentry floor base, swarm fragments, humanoid arms or legs, antenna clutter, cables, tiny panels, bolts, high-detail concept art, smooth vector edges, cyan or teal.
```

The built-in ImageGen result is an RGB `3x3` exploration sheet with a baked light checkerboard. The final transparent export therefore selects the middle-center concept and removes the light background deterministically before nearest-neighbor reduction and palette normalization.

## Built-in ImageGen motion reference

```text
Use case: identity-preserve
Asset type: ultra-low-resolution game enemy animation motion reference sheet
Input images: Image 1 is the exact Support Drone identity and edit target. Preserve its clipped-diamond upright body, large protected green restoration core, two detached vertical relay bars, small lower hover mass, proportions, center anchor, and six-color visual language.
Primary request: create one clean 4-column by 2-row, eight-cell motion reference sheet. Top row is a 4-frame support-idle loop: relay bars remain folded, body remains upright and centered, with only a subtle one-pixel hover bob and gentle central-core breathing. Bottom row is a 4-frame active support-link loop: the core brightens and expands, and the paired vertical relay bars open symmetrically outward into clearly readable transmitter-bracket silhouettes, then pulse while remaining visibly open across the loop. The final bottom frame must transition smoothly back to the first bottom frame.
Style/medium: exact hard-edged pixel art, very sparse square clusters, no antialiasing, no subpixel detail, transparent background.
Composition/framing: each cell contains one complete centered 32x32-style sprite with consistent scale and anchor; uniform four columns and two rows.
Color palette: near-black, navy, gunmetal, warm gray, restoration green #4ade80, pale green #bbf7d0 only.
Constraints: preserve identity and body proportions across all eight frames; state difference must be readable by silhouette and relay-bar pose, not color alone; no rotation or facing direction; no external beam because gameplay already draws the target link; no target, ally, projectile, cannon, barrel, shield, medical cross, text, labels, grid lines, checkerboard, background, bloom, glow, shadow, or watermark.
```

The built-in result is retained as `source/imagegen-support-link-animation-reference.png`. It is a graded-alpha RGBA visual-motion reference with a dark atmospheric background and glow, so it is not a runtime input. `source/normalize_support_drone.py` applies the approved relay-opening and core-pulse ideas deterministically to the transparent `32x32` neutral master while preserving the exact palette, binary alpha, center anchor, and body identity.
