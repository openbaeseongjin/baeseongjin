# Sector 06 platform generation prompt

## 제작 입력

- 도구: OpenAI built-in ImageGen
- 생성일: 2026-08-24
- Use case: `stylized-concept`
- 역할: exact `32×32` terrain fill과 `32×8` terrain edge로 정규화할 제작 원본
- 배경 reference: Sector 06 Runtime background의 팔레트·외부 노출·건축 관리 상태만 육안으로 확인했다. 배경의 발판 위치·건축 geometry·source pixel은 생성 입력이나 Runtime terrain으로 복제하지 않았다.

## Prompt

```text
Use case: stylized-concept
Asset type: production source sheet for Baeseongjin, a 2D side-view pixel-art game's collision-aligned Sector 06 terrain skin
Primary request: generate one coherent modular platform kit for Sector 06 Rooftop Evacuation. It will be normalized into exact 32×32 terrain tiles and exact 32×8 edge tiles. The design must read as an exterior rooftop crown, wind-exposed service gantry, evacuation pad perimeter, and antenna-service aviation infrastructure—never as an indoor control room, luxury mall, residence, or ruin.
Scene/backdrop: genuinely transparent background only. Isolated sprite modules; no checkerboard, environment scene, ground plane, or cast shadows outside sprites.
Subject: orthographic side-elevation modular platform parts aligned to one top walking baseline. Include a seamless center deck, pale walking cap, side fascia, wind-exposed underside with broad open gantry bays and simple diagonal load braces, left/right end caps, outer/inner corner concepts, a pad-perimeter deck variant, and a separate row of much thinner one-way blades. Solid modules have a visibly thick load-bearing aviation deck and open braced underside; one-way modules are thin flat blades with a shallow flush support flange.
Logical pixel construction: design on a logical 32×32 pixel grid; one-way blade is 8 logical pixels tall. Use large deliberate pixel clusters, maximum 8 colors, 1–2 logical-pixel outlines, no subpixel detail, no feature smaller than 2 logical pixels. Show logical pixels enlarged uniformly with hard square edges for nearest-neighbor reduction.
Style/medium: original hand-authored low-resolution pixel art; strict square pixels; hard edges; no antialiasing, gradients, soft lighting, painterly rendering, photorealism, isometric view, or perspective.
Composition/framing: clean production sheet with generous transparent gaps, straight horizontal rows, each module shown once, identical scale and walking baseline. No text, labels, numbers, arrows, guides, grid, UI, or measurements.
Color palette: pale weather-resistant aviation metal and cool off-white walking cap; cool desaturated blue-gray structural metal; deep navy-charcoal open underside; restrained graphite outline. One extremely limited low-chroma amber aviation lamp may appear only on the pad-perimeter concept, never repeated across ordinary tiles. Avoid pure white, cyan, turquoise, saturated blue, red, orange, neon, vivid gold, green, or purple.
Materials/textures: broad wind-worn metal panels, chamfered aerodynamic edge, recessed drainage seam, large open service-gantry bay, simple diagonal structural brace. Clean and maintained but visibly exterior and wind-exposed. No grime clusters, rust, broken parts, noisy micro-panels, repeated rivet rows, masonry, concrete, glass, vegetation, residential ornament, shopping-mall trim, or sealed luxury composite body.
Gameplay readability: at true 1× scale the top walking line must read before the detailed city background. Solid and one-way surfaces differ by body thickness, open underside silhouette, and outline—not by color alone. Player, cyan Rope/Anchor, and red/orange Telegraph remain more salient.
Constraints: seamless repeat boundaries; top-center authoring anchor; presentation skin only; never infer collision from PNG; no fake ledges or collision-like decoration. Ordinary modules contain no protruding socket, hook, jaw, clamp, hardpoint, anchor, antenna, mast, post, railing, handle, hazard, sign, door, character, Rope, or Anchor. Antenna identity is communicated only through flush aviation structural language, not protrusions. No logos, trademarks, watermark, or extra text.
```

Built-in 결과는 RGBA PNG지만 외곽의 반투명 glow를 포함했다. `build_platform_atlas.py`는 alpha 128 미만만 제거하고 24색 무디더 RGBA 제작 시트를 보존한 뒤, 저장소 규격의 8색 fill·edge atlas를 결정적으로 생성한다.
