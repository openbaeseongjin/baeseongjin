# Final generation prompt

Use case: identity-preserve

Asset type: four-frame horizontal pixel-art animation reference sheet for the Baeseongjin game authoring package

Primary request: create a seamless four-frame shield-guard hover-and-brace loop for the exact shield drone shown in the reference images.

Input images: the selected high-resolution candidate `03` is the identity reference; `export/runtime-selected.png` is the strict `32x32` low-resolution silhouette reference.

Subject: the same right-facing shield drone, with one large simple hexagonal physical shield occupying about 60% of the silhouette, a small dark navy rear body, one red-orange rectangular sensor, and one tiny amber hover exhaust.

Frame sequence, left to right: neutral guarded hover; rear body compresses one logical pixel down/back while the shield moves one logical pixel forward; strongest brace pose with body tucked tightly behind the shield and sensor slightly brighter; body settles one logical pixel upward toward neutral. Keep the shield's outer silhouette and defensive facing extremely stable so the animation reads through weight shift rather than deformation.

Style: authentic low-resolution hand-pixelled sprite art, designed directly at a logical `32x32` cell scale, crisp hard pixel clusters, binary alpha edges, no antialiasing, no smooth gradients.

Composition: exactly four equal square cells in one horizontal row, identical center anchor and scale in every cell, ample transparent padding, no overlaps.

Palette: preserve the dark navy/charcoal body, warm gray shield, red-orange sensor, and optional single amber hover pixel; very limited palette.

Constraints: transparent background; preserve exact identity, proportions, shield shape, right-facing orientation, visual mass, and hover height; no text, labels, guides, borders, grid, watermark, projectiles, attack effects, energy shield, cyan glow, extra weapons, extra limbs, cables, bolts, or tiny decorative noise.
