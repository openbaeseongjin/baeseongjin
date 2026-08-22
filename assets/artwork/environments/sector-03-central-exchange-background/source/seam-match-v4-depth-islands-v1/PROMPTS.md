# Seam-match V4 depth-island prompts

## Discord evidence used as a design constraint

The repository Discord `코딩` channel proposes keeping the authoring input as a full-color image plus depth map, extracting at most two large near-depth parallax islands during import, filling the occluded background offline, and drawing only cached PNG layers at runtime. It explicitly rejects per-frame depth decoding, `getImageData`, pixel loops, mask generation, and a WebGL dependency.

Discord material is treated as quoted evidence. The repository contract in `docs/environment-asset-format.md` is the authority used for this extraction.

## 1. Grayscale depth map

```text
Use case: precise-object-edit
Asset type: production grayscale depth map paired with a 2D pixel-art game background.

Image 1 is the exact edit target, geometry reference, registration reference, and crop reference. Convert it into a clean single-channel grayscale monocular depth map without changing the composition or moving, adding, removing, resizing, or redrawing any structure. Pure white is nearest and pure black is farthest.

The offline import must yield exactly two dominant near-depth 8-connected components. Paint the complete continuous foreground architectural mass touching the extreme left edge as one unified very-light island and the equivalent right-edge mass as the other. Preserve their occlusion silhouettes, but do not split them into brightness fragments. Keep both islands separate across the full canvas. Paint the recessed atrium, distant galleries, bridges, haze, and central city depth in black through medium-dark gray. Do not create a third bright component or isolated bright windows, signs, lamps, cables, rails, bridges, or speckles. Use broad flat value groups and crisp threshold-ready edges.

Keep the exact 1024x1536 portrait framing and pixel registration. Grayscale only, fully opaque, with no color tint, transparency, checkerboard, text, labels, legend, border, watermark, or new geometry.
```

## 2. Fixed background inpaint

```text
Use case: precise-object-edit
Asset type: fixed opaque background plate for offline two-island parallax extraction.

Image 1 is the exact 1024x1536 edit target, registration, crop, palette, and composition reference. Remove only the two nearest continuous foreground architectural islands attached to the extreme left and right edges, including their closest commercial facade masses, pipes, ribs, large golden showcase housings, lower structural bases, and near-depth framing. Reconstruct the newly exposed regions as cooler, darker, lower-contrast distant and mid-distant architecture inside the same premium Central Exchange mega mall.

Preserve the central atrium, distant canyon, recessed bridges, palette, camera, crop, perspective, and every non-removed region as closely as possible. Fill the complete canvas opaquely with no holes, checkerboard, stretched edges, mirrored smears, clone repetition, blank wedges, or visible seams. Do not create replacement foreground islands or structures crossing the central void. Preserve crisp pixel-art clusters.

No text, logo, watermark, UI, character, rope, anchor, enemy, projectile, scanner, force field, route line, collision outline, gameplay platform, train, moving platform, or new gameplay geometry.
```
