# Boss03 jump ImageGen prompt record

- Tool: Codex built-in ImageGen
- Identity reference: `../boss03-idle-player-style-selected-v1.png`
- Motion/style reference: `../../preview/runtime-v1/boss03-motion-runtime-review.png`
- Source output: `jump-6-imagegen.png`, RGB `1536×1024`, visible checkerboard included by the generator
- Layout: 3 columns × 2 rows, six frames ordered `takeoff → launch → rise → apex → fall → land`
- Requested invariants: same Boss03 body scale, round heavy armor, two orange sensors, separate hook arm, separate hand-held hammer, right-facing, stable horizontal center
- Pixel constraints: hard stair-step outline, large flat clusters, restricted palette, no antialiasing, gradients, blur, VFX, shadow, text, UI or extra characters
- Normalization: `normalize_jump_authoring.py` removes the checkerboard, maps to the established 16-color palette, aligns a common logical scale and exports exact nearest-neighbor `256×256` frames.

The source sheet is authoring input, not a runtime atlas. Collider, hitbox, jump physics, gameplay timing and network authority are outside this asset.
