# Patrol Drone T1 generation prompt

## Built-in ImageGen generation

```text
Use case: stylized-concept
Asset type: low-resolution game enemy sprite exploration sheet for later normalization to transparent 32x32 cells
Primary request: create a 3x3 sheet of nine closely related design variants for a compact Patrol Drone used in a side-view rope-action game set in a closed vertical corporate city. It is a moving security unit that travels back and forth along an authored route; physical lateral movement must read before its familiar target-lock and standard projectile attack.
Subject: each variant is one small upright patrol drone with a horizontally wide clipped-polygon chassis, two clear side hover/motor pods that make left-right travel readable, one centered recessed red-orange scanning visor, and at most one very small underslung standard emitter. Keep the body stable and balanced for ping-pong patrol movement. Variants may change only the side-pod and visor silhouette.
Style/medium: genuine ultra-low-resolution pixel art designed natively for a 24x24 to 32x32 sprite, large deliberate square pixel clusters, hard edges, binary transparency, no antialiasing. Match an established industrial enemy family using only near-black #050c18, blue-black #0e1e34, muted navy #263b56, warm gunmetal #756f64, red-orange #ff3b1c, and amber #ffae19.
Composition/framing: exact 3x3 equal-cell layout on a genuinely transparent background; one complete centered drone per cell; consistent scale; generous transparent separation; no overlap; no labels and no visible grid.
Constraints: same compact scale across all nine; role silhouette must remain readable at 32x32; no background, floor, shadow, text, logo, or watermark.
Avoid: high-detail concept art, smooth vector edges, gradients, glow, bloom, cyan, teal, circular energy rings, detached shield plates, artillery shutters or projector, large cannon, missile pods, legs, humanoid features, pursuit-drone arrowhead nose, fixed sentry floor base, cluttered mechanical greebles.
```

## Background extraction edit

```text
Remove the entire black background, all haze, all bloom, all cast shadows, and every soft halo from the 3x3 Patrol Drone sheet. Make all pixels outside the nine drone silhouettes genuinely transparent. Preserve the exact nine designs, positions, scale, hard pixel edges, palette, and spacing. Do not redesign, crop, label, or rearrange anything.
```

## Animation identity-preserve edit

```text
Use case: identity-preserve
Asset type: low-resolution game enemy animation reference sheet
Input images: Image 1 is the exact Patrol Drone identity and pixel-art edit target.
Primary request: turn Image 1 into a 4x4 animation reference sheet with sixteen equal square cells on a genuinely transparent background.
Row 1: four-frame patrol movement to the right. Preserve the chassis; show only a subtle one-pixel hover bob and a readable amber pulse from the left/trailing motor pod.
Row 2: four-frame patrol movement to the left. Mirror the motion logic: preserve the chassis; subtle hover bob and amber pulse from the right/trailing motor pod.
Row 3, left to right: acquire, track, lock, fire key poses. Acquire opens the recessed central sensor housing slightly; track moves a narrow scan bar inside that housing; lock compresses the housing around a bright centered amber core; fire extends only the tiny underslung emitter with a compact local muzzle flash.
Row 4: four cooldown frames returning from the extended emitter and bright sensor to the exact neutral Image 1 silhouette.
Style/medium: exact ultra-low-resolution pixel art from Image 1, hard square pixel clusters, binary transparency, no antialiasing, same six-color near-black/navy/warm-gunmetal/red-orange/amber palette.
Constraints: preserve the exact body proportions, detached twin side pods, central visor, underside emitter, scale, front-facing upright identity, and center anchor from Image 1 in every frame. No whole-body rotation. No extra weapon. No projectile. No motion trail. No text, labels, grid, background, floor, shadow, glow, or watermark.
Avoid: redesign, added detail, smooth gradients, blur, cyan or teal, large cannon, missile, shield, artillery projector, pursuit-drone wedge silhouette.
```

ImageGen produced a useful pose reference, but the apparent transparency was an RGB checkerboard. It is therefore retained only as authoring evidence. The final exports are generated deterministically from `patrol-neutral.png` by `normalize_patrol_drone.py`, with binary alpha and the exact shared six-color palette.
