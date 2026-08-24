# Generation prompt V2

## 도구

- OpenAI built-in ImageGen
- 생성일: 2026-08-24
- 출력 역할: Runtime atlas를 직접 사용하지 않는 모듈·재질·실루엣 제작 원본

## Prompt

```text
Use case: stylized-concept
Asset type: production source sheet for a 2D pixel-art game terrain skin
Primary request: create a clean modular platform sprite source sheet for Sector 04 Upper Residential, designed to be normalized into actual 32×32 solid terrain tiles and 32×8 or 32×16 one-way platform tiles
Scene/backdrop: genuinely transparent background only; isolated modules with generous empty separation; no environment scene
Subject: one coherent kit of orthographic side-elevation modules: thick solid amenity-deck body, seamless center fill, top walking curb, closed fascia, lower enclosed support, left/right ends, inner/outer corners, and clearly thinner one-way skybridge modules with short downward residential corbels; align every walking surface to one baseline and a top-center authoring anchor
Style/medium: crisp hand-authored low-resolution pixel art, strict hard-edged square pixels, nearest-neighbor appearance, no antialiasing, no painting, no photorealism, no isometric perspective
Composition/framing: organized sprite-production sheet; separated modules aligned in rows; front/side orthographic elevation only; no labels, grids, measurements, arrows, UI, or text
Color palette: maintained warm limestone gray, cool sealed composite gray, pale ivory walking-edge highlight, restrained desaturated sage-green recessed fascia reveal; charcoal only for narrow outline and depth; no cyan, turquoise, saturated blue, red, orange, neon, or muted gold
Materials/textures: clean maintained courtyard stone and sealed residential composite; broad quiet panels, sparse joints; no cracks, grime, rust, exposed pipes, grating, bolts, wires, machinery, or ruin damage
Gameplay readability: top walking boundary is the clearest continuous line; thick solid and thin one-way modules differ by body thickness, support silhouette, and outline rather than color; remain readable at true 1× scale against a detailed dark garden-city background; no dense repeated slots or checkerboard panel noise
Constraints: original project-created design; transparent pixels outside modules; seamless horizontal repeat boundaries; no collision-like decoration; no railings, glass barriers, benches, planters, shrubs, trees, vines, lamps, signs, doors, characters, Rope, Anchor, hazards, Telegraph, floor shadows, scene lighting, logos, trademarks, watermark, or extra text; visual terrain skin only and never collision geometry
```

투명 배경 보정 iteration은 동일 모듈 배치와 형태를 보존하고 RGB checker·그림자·halo만 제거하도록 요청했다. built-in 결과가 RGB로 저장되어 `build_platform_atlas.py`가 neutral checker를 알파 0으로 제거하고 dithering 없는 20색 RGBA 제작 시트로 정규화한다.

## 정규화 범위

ImageGen 출력의 배치·외곽선·픽셀은 Runtime에 직접 사용하지 않는다. `build_platform_atlas.py`가 투명 저색수 module sheet를 만들고, 그 문법을 프로젝트 팔레트와 정확한 `32×32`, `32×8` 정수 픽셀 atlas로 다시 그린다.
