# Generation prompt

## ImageGen concept sheet

```text
Use case: stylized-concept
Asset type: 2D pixel-art game enemy concept sheet for Baeseongjin Sector 01
Input images: the repository Support family scale preview is a style, palette, family-scale, and pixel-density reference only.

Create a clean 3 by 3 concept sheet containing nine distinct designs for one single Swarm Drone T1 unit. This enemy appears in groups, orbits the player, then units take turns performing a fast body-first dive and recover. Each candidate must communicate orbiting agility and a dangerous forward dive without a gun or projectile launcher.

Use one compact mechanical drone per cell, visually smaller than the existing sentry, artillery, patrol, and support drones. Build one strong role silhouette from a compact central body plus two or three clipped fins, prongs, or swept plates converging toward the dive direction. Use dark navy and charcoal armor, warm gunmetal midtones, small off-white rim pixels, restrained amber service fasteners, and a limited violet/magenta orbit sensor using #c084fc, #e879f9, and #e9d5ff.

Author as genuine low-resolution pixel art for a logical transparent 24x24 to 32x32 cell with roughly 15 to 23 opaque logical pixels across. Use nearest-neighbor crisp square pixels, no anti-aliasing, no smooth gradients, consistent scale, and generous separation. Vary dart, chevron, clipped-diamond, mechanical insect-wing, tri-fin, pointed dive-nose, offset plate, and ring-gap motifs.

Transparent background. No text, labels, grid lines, borders, shadows, scenery, watermark, soft rendering, vector smoothing, 3D, bloom, motion blur, baked VFX, humanoid limbs, organic anatomy, propellers, large cannon, shield, healer cross, green support core, red patrol visor, or multiple drones fused into one sprite.
```

## Background extraction edit

```text
Remove only the baked white/light-gray checkerboard and replace it with genuine transparent alpha. Preserve the nine designs, pixel-art shapes, placement, scale, palette, outline, spacing, arrangement, hard pixel edges, and full canvas. Do not redraw, restyle, crop, resize, move, rotate, recolor, add a shadow, glow, text, border, watermark, or extra element.
```

## Normalization note

ImageGen 결과는 역할·실루엣 선택용 원본이다. 선택 전에는 `export/` 또는 runtime package로 승격하지 않는다. 승인 후보는 실제 logical cell에서 hard-alpha pixel art로 다시 저작하고 nearest-neighbor 정수 배율로만 preview를 만든다.

## Latest main role note

이 prompt는 당시 `orbit → dive → recover` 역할을 기준으로 생성한 이력이며 원문을 수정하지 않는다. `origin/main` `6dfad35`에서 실제 역할은 투사체 없는 `chase → contact damage → recoil`로 변경됐다. 후보 승인 뒤 animation과 Runtime 정규화는 새 상태만 사용한다.

## ImageGen contact animation atlas edit

```text
Use case: precise-object-edit
Asset type: game enemy pixel-animation authoring sprite sheet
Input images: Image 1 is the edit target and identity reference. Use only candidate 06, the middle-right drone in the 3x3 sheet.
Primary request: preserve that drone's exact identity and create a clean 4-column by 3-row animation atlas for its current no-projectile contact attack role.
Subject invariants: one small right-facing Swarm Drone per cell; keep the exact compact circular violet core, dark navy gunmetal body, orange service accents, split upper/lower blade-fins, open forward prong gap, proportions, silhouette, palette, pixel density, and side-view facing of candidate 06. Do not redesign, add equipment, or change colors.
Row 1 — chase, 4 seamless loop frames: fast forward pursuit communicated by a restrained 1–2 logical-pixel bob, slight alternating fin flex, and stable forward-leaning center of mass.
Row 2 — contact, 4 non-loop frames: no projectile. The fins tuck inward, the compact body compresses, then the whole drone makes a short readable forward body-check/ram pose; final frame is the instant of contact. Keep the drone itself recognizable in every frame.
Row 3 — recoil, 4 non-loop frames: immediately after contact the body pitches and shifts backward, fins flare wider to brake, core and shell settle toward the original chase pose. The recoil direction is visually opposite the right-facing attack direction.
Style/medium: true low-resolution hard-edged pixel art authored for a 32x32 logical cell, crisp square pixels, nearest-neighbor look.
Composition/framing: exactly 12 equal cells in a strict 4x3 grid, consistent center anchor and identical scale; generous transparent padding in every cell; no frame is cropped.
Constraints: genuinely transparent background; no checkerboard; no grid lines; no labels; no text; no shadow; no glow outside the sprite; no blur; no antialiasing; no gradients; no motion streaks; no particles; no projectile; no extra drones; no watermark. Change only pose and balance across frames while keeping the source identity unchanged.
```

## Animation atlas background extraction edit

```text
Remove only the pale checkerboard background and replace it with genuine transparent alpha. Preserve all 12 drone sprites in their exact 4-column by 3-row positions, scale, silhouette, palette, hard pixel edges, and spacing. Preserve the full canvas and every sprite. Do not redraw, restyle, move, resize, sharpen, blur, recolor, crop, add, or remove any part of a drone. No checkerboard, white matte, halo, shadow, grid, text, or watermark. Change only the background to actual transparency.
```

## Atlas normalization

ImageGen의 core 정렬 편집은 프레임 위치를 완전히 고정하지 못했고 canvas를 `1447x1087`로 변경했다. Node.js `v24.19.0`과 Sharp `0.35.3`으로 투명 여백만 `1448x1086`에 맞춘 뒤, 각 `362x362` cell의 보라색 core 중심을 검출해 전체 sprite를 local `(181,181)`로 평행 이동했다. frame 내부 픽셀의 색·형상·크기와 4x3 순서는 바꾸지 않았다.
