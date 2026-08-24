# Generation prompt V2

## 도구와 역할

- OpenAI built-in ImageGen
- 생성일: 2026-08-24
- 입력 reference: Sector 05 `neutral-composite.png`; 팔레트·재질 마감·명도 위계·정비 상태만 참조
- 출력 역할: 게임 규격을 먼저 적용한 `32×32` solid·`32×8` one-way 정규화용 제작 원본

## 적용한 저장소 규칙

- 기본 타일은 `32×32`, 얇은 one-way는 `32×8`이며 logical pixel보다 작은 디테일을 만들지 않는다.
- solid와 one-way는 색이 아니라 body 두께·하부 실루엣·outline으로 구분한다.
- 보행면은 `top-center` 기준이며 가장 먼저 읽히는 연속선으로 만든다.
- Cyan Rope·Anchor와 Red/Orange Telegraph 색을 피하고 terrain은 hardpoint처럼 돌출되지 않는다.
- PNG는 presentation source일 뿐 collision·one-way geometry·grappleable을 정의하지 않는다.
- ImageGen 출력은 Runtime에 직접 넣지 않고 도구 중립 RGBA PNG atlas로 정규화한다.

## Prompt

```text
Use case: stylized-concept
Asset type: production source sheet for Baeseongjin, a 2D side-view pixel-art game's collision-aligned Sector 05 terrain skin
Input images: Image 1 is a palette, material finish, lighting hierarchy, and maintenance-state reference only. Do not copy its platform positions, architecture, geometry, silhouette, or pixels.
Primary request: generate one coherent modular platform kit for Sector 05 Continuity Control that can be normalized into exact 32×32 solid terrain tiles and exact 32×8 one-way platform tiles. It must look bright, precise, expensive, sealed, and immaculately maintained.
Scene/backdrop: genuinely transparent background only. Isolated modules, no checkerboard, no environment scene, no ground plane, no cast shadows outside each sprite.
Subject: orthographic side-elevation pixel-art modules aligned to a single top walking baseline. Include: seamless solid center tile, top cap, closed side fascia, enclosed underside, left and right end caps, outer and inner corner shapes, and a separate row of much thinner one-way blades. Solid modules use a thick enclosed load-bearing body; one-way modules use a thin flat blade with short flush recessed support geometry. Keep all ordinary terrain silhouettes flush and closed.
Logical pixel construction: design at a logical 32×32 pixel grid, with the one-way blade only 8 logical pixels tall. Use large deliberate pixel clusters, a maximum of 8 colors, 1–2 logical-pixel outlines, no subpixel detail, and no feature smaller than 2 logical pixels. Present logical pixels enlarged uniformly with hard square edges so the kit remains readable after nearest-neighbor reduction to 32×32 and 32×8.
Style/medium: original hand-authored low-resolution pixel art, strict square pixels, hard edges, nearest-neighbor look, no antialiasing, no gradients, no soft lighting, no painterly rendering, no photorealism, no isometric or perspective view.
Composition/framing: clean production sheet with generous transparent gaps; straight horizontal rows; modules shown once each; same scale and walking baseline; no text, labels, numbers, arrows, guides, grid, UI, or measurements.
Color palette: pale titanium and cool frost-gray walking surface; cool light-gray sealed composite; restrained graphite outline and underside; very limited low-chroma violet-gray recessed channel. The walking boundary is the brightest continuous line. Avoid pure white. No cyan, turquoise, saturated blue, red, orange, gold, green, or neon.
Materials/textures: broad quiet composite panels, precise narrow graphite joints, chamfered closed metal edges, one restrained recessed service band. No repeated rivet rows, no noisy micro-panels, no grime, scratches, rust, exposed structure, grating, pipes, bolts, cables, masonry, glass, vegetation, aviation markings, residential ornament, or ruin damage.
Gameplay readability: at true 1× scale the top walking edge reads before the detailed background. Solid and one-way surfaces differ by body thickness, underside silhouette, and outline—not color alone. Player, cyan Rope/Anchor, and red/orange Telegraph remain more salient. Ordinary terrain contains no protruding mechanical silhouette, leaving the game's existing grappleable hardpoints as the only protrusions.
Constraints: seamless repeat boundaries; top-center authoring anchor; presentation skin only; never infer collision from PNG; no fake ledges or collision-like decoration; no socket, hook, jaw, clamp, antenna, post, rail, handle, hardpoint, anchor-like detail, hazards, lamps, signs, doors, characters, Rope, Anchor, logos, trademarks, watermark, or extra text.
```

ImageGen이 투명 배경 요청에도 중립 checker를 baked RGB로 반환한 경우 `build_platform_atlas.py`는 외곽과 연결된 checker만 제거한다. 이후 무디더 24색 RGBA source sheet와 저장소가 정한 8색 `32×32`·`32×8` atlas를 생성한다.
