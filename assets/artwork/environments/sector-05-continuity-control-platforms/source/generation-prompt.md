# Generation prompt V1

## 도구

- OpenAI built-in ImageGen
- 생성일: 2026-08-24
- 입력 reference: Sector 05 `neutral-composite.png`; 색·재질·관리 상태만 참조
- 출력 역할: Runtime atlas를 직접 사용하지 않는 모듈·재질·실루엣 제작 원본

## Prompt

```text
Use case: stylized-concept
Asset type: production source sheet for a 2D pixel-art game collision-aligned terrain skin
Input images: Image 1 is a palette, material-quality, lighting-hierarchy, and maintenance-state reference only; do not copy any platform placement, geometry, building silhouette, or pixels from it
Primary request: create one coherent modular platform kit for Sector 05 Continuity Control, a bright, precise, expensive control facility, to be normalized into exact 32x32 solid terrain tiles and 32x8 or 32x16 one-way platform tiles
Scene/backdrop: genuinely transparent background only, isolated modules with generous empty separation, no environment scene and no cast shadow outside sprites
Subject: orthographic side-elevation modules aligned to one walking-surface baseline and top-center authoring anchor: thick sealed control-deck body, quiet seamless center fill, pale-metal walking cap, closed composite fascia, lower enclosed load shell, left and right end caps, inner and outer corners, plus clearly thinner one-way service blades with short flush integrated brackets; solid modules must read as massive sealed volumes while one-way modules read as thin precision blades by thickness, support silhouette, and outline
Style/medium: crisp hand-authored low-resolution pixel art, hard-edged square pixels, nearest-neighbor appearance, sparse precision seams, no antialiasing, no painterly rendering, no photorealism, no isometric perspective
Composition/framing: organized sprite-production sheet, separated modules in straight rows, front/side orthographic elevation only, no labels, grid, measurements, arrows, UI, or text
Color palette: frost-white and pale titanium walking surfaces, cool light-gray sealed composite, restrained graphite seams and underside shadow, a very limited low-chroma violet-gray recessed service channel; no cyan, turquoise, saturated blue, red, orange, neon, gold, or green
Materials/textures: immaculate costly precision metal and sealed composite, broad quiet panels, exact narrow joints, chamfered closed edges, no grime, scratches, rust, exposed pipes, grating, bolts, loose wires, residential stone, vegetation, aviation markings, or ruin damage
Gameplay readability: continuous top walking boundary must be the clearest line at true 1x scale against the detailed Sector 05 city backdrop; leave all ordinary platform bodies flush and enclosed so the game’s existing grappleable hardpoints remain the only protruding mechanical silhouettes; avoid any socket, hook, jaw, antenna, post, rail, or anchor-like detail on terrain modules
Constraints: original project-created design; actual transparency outside modules; seamless horizontal repeat boundaries; no collision-like decoration; no railings, glass barriers, lamps, signs, doors, characters, Rope, Anchor, hazards, Telegraph, logos, trademarks, watermark, or extra text; visual skin only, never collision geometry
```

ImageGen 결과는 RGB checker를 포함하므로 Runtime에 직접 사용하지 않는다. `build_platform_atlas.py`가 외곽에서 연결된 중립 checker만 alpha 0으로 제거하고 dithering 없는 24색 RGBA 제작 시트로 보존한 뒤, 프로젝트 팔레트와 정확한 `32×32`, `32×8` 격자로 Runtime atlas를 다시 그린다.
