# Sector 03 seam-match V8 depth extraction prompts

## 1. Grayscale depth map

```text
Use case: precise-object-edit
Asset type: production 8-bit grayscale depth map paired with the exact Sector 3 V8 pixel-art background.

Image 1 is the exact geometry, registration, silhouette, crop, and composition authority. Convert it into a clean fully opaque single-channel grayscale monocular depth map. Do not move, add, remove, resize, reinterpret, or redraw any structure. White is nearest; black is farthest.

The offline import must resolve exactly two dominant near-depth 8-connected islands:
- one complete continuous foreground architectural mass touching the extreme left canvas edge,
- one complete continuous foreground architectural mass touching the extreme right canvas edge.
Each island should follow the dark closest side framing and its connected lower Worker District facade. Keep the left and right islands completely separated by the central canyon on every row. Use very light gray to white for these two near masses with crisp threshold-ready silhouettes.

All circular transit rings, central bridges, floating central platform, recessed blue corporate towers, central luminous shaft, atmospheric canyon, and distant Worker District continuation belong to the fixed background. Encode them from medium gray down to black according to distance. Do not classify bright lights, windows, rails, signs, cables, isolated facade fragments, the floating platform, or circular rings as separate near islands. Do not create a third threshold-bright component or scattered white speckles.

Use broad flat depth-value groups, no lighting-based grayscale conversion, and crisp pixel-registered boundaries. Exact 1024x1536 portrait output. Grayscale only, fully opaque. No color tint, transparency, checkerboard, labels, legend, border, text, watermark, or new geometry.
```

## 2. Fixed background inpaint

```text
Use case: precise-object-edit
Asset type: fixed opaque background plate for offline two-island parallax extraction.

Image 1 is the exact 1024x1536 edit target, registration, crop, palette, perspective, and composition authority. Remove only the two nearest continuous architectural masses attached to the extreme left and right canvas edges. These are the dark foreground side frames and their connected lower Worker District facades that will become the two moving parallax islands.

Reconstruct every newly exposed pixel as plausible cooler, darker, lower-contrast distant or mid-distant architecture belonging to the same Sector 3 blue corporate megacity canyon. Continue the recessed circular transit rings, blue towers, structural ribs, distant lower Worker District canyon, and atmospheric central shaft behind the removed foreground. Keep these reconstructed structures clearly farther away and do not create new near edge frames.

Preserve the central canyon, all central circular rings and bridges, the floating central platform, palette, camera, crop, perspective, lighting hierarchy, and every non-removed region as closely as possible. The bottom 15% must still transition toward Sector 2 through distant Worker District architecture, but without the closest left/right facades.

Fill the complete canvas opaquely with no transparency, holes, black wedges, checkerboard, stretched edges, mirrored smears, cloned repetition, blank side columns, or visible inpaint seams. Preserve crisp high-bit pixel-art clusters and the exact 1024x1536 portrait registration.

No text, logo, watermark, UI, character, rope, anchor, enemy, projectile, scanner, force field, route line, collision outline, gameplay platform, new bridge, or new gameplay geometry.
```
