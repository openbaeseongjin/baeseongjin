# Boss03 jump motion authoring v2

> Status: **APPROVED AUTHORING / LOCAL RUNTIME INTEGRATED**

This package fills the one explicitly documented Boss03 body-motion gap: `LOWER_SECTOR_COMMANDER_STATE.JUMP` currently displays the final `idle` frame because no dedicated generated jump clip exists.

## Frame map

| Frame | Pose | Authoring duration |
| ---: | --- | ---: |
| 0 | heavy grounded takeoff crouch | 80 ms |
| 1 | launch, feet leaving the surface | 80 ms |
| 2 | compact rising pose | 220 ms |
| 3 | apex, both feet clearly airborne | 180 ms |
| 4 | falling and extending for contact | 390 ms |
| 5 | compressed two-foot landing | 300 ms |

The source is a 3×2 ImageGen board. The normalized atlas is six horizontal `256×256` RGBA frames (`1536×256` total), uses a `128×128` logical canvas enlarged exactly 2× with nearest-neighbor sampling, binary alpha, the established 16-color Boss03 palette and a stable horizontal center. Airborne frames move upward inside the cell instead of changing body scale.

## Outputs

- `jump-6-imagegen.png`: original RGB `1536×1024` ImageGen board with embedded checkerboard
- `../../export/motion-authoring-v2-jump/jump.png`: transparent six-frame authoring atlas
- `../../export/motion-authoring-v2-jump/jump-apex.png`: representative transparent jump image
- `../../preview/motion-authoring-v2-jump/boss03-jump-motion-review.png`: labeled checkerboard review sheet
- `../../preview/motion-authoring-v2-jump/boss03-jump-motion.gif`: review-only animation
- `../../../../../runtime/characters/lower-sector-commander-v1/jump.png`: normalized local Runtime atlas

## Tool, source and license

- Generator: Codex built-in ImageGen
- Deterministic normalization: Python/Pillow, nearest-neighbor, fixed palette, binary alpha
- References: project-owned Boss03 selected idle source and Boss03 runtime-v1 motion review only
- External artwork: none
- License/source: generated for this repository; apply the repository's normal rights review before public distribution

## Validation

- Source: RGB `1536×1024`, SHA-256 `679C18C3FC21AE60B7072AFF21C77DC24703376C7E9AF285038A3831D08FDF3D`
- Atlas: RGBA `1536×256`, six `256×256` cells, SHA-256 `1CB9BC62B29039EAFBA87C8DDFA98DE18F8541A3FB8633BE9794F699789BF1C5`
- Representative apex: RGBA `256×256`, SHA-256 `D8EB1B6C376F3EF1D2261911ADF4AA8F12744AE12C121686C918922B5A9BAB3E`
- Binary alpha (`0/255`), 16 opaque colors, non-empty padding on all four sides of every frame: PASS
- Manual review: takeoff, launch, rise, apex, fall and two-foot landing are distinct by silhouette; body scale and horizontal center remain stable; no VFX or extra actor is baked into the body atlas.

## Runtime integration

Frames 0–4 cover the default `0.95s` kinematic jump. Frame 5 is a `0.3s` landing transition that plays after the gameplay state returns to neutral. `normalize_jump_authoring.py` writes the same transparent atlas to the authoring export and the Boss03 local Runtime package; the renderer owns clip selection without adding animation state to gameplay or network snapshots.

## Non-scope

The asset does not modify collider, hitbox, jump trajectory, landing logic, VFX or multiplayer state.
