# Generation prompt

## 도구

- OpenAI built-in ImageGen
- 생성일: 2026-08-24
- 출력 역할: Runtime atlas를 직접 사용하지 않는 재질·실루엣 탐색 원본

## Prompt

```text
Create an original transparent-background pixel-art concept sheet for a modular 2D side-view terrain skin used by a character as walkable platforms in a game.

Use case: material and silhouette exploration source only, not a finished gameplay screenshot.
Environment: Sector 03 “Central Exchange”, a huge orderly commercial/transit interchange and service atrium.
Visual grammar: graphite structural shells, cool concrete walking slabs, restrained muted-gold service frames and sparse maintenance rails. Brighter, cleaner and better powered than a worker district, but incident-worn and civic/transit-like — absolutely not a luxury shopping mall.
Show isolated orthographic modular pieces on transparent gutters: a thick solid deck top, side face, underside service frame, left/right end caps, inner/outer corner ideas, and a distinctly thinner one-way service bridge. The solid platform must read through thickness and heavy support structure; the one-way platform through a thin lip and light service brackets. Favor large quiet panels and long service-frame rhythms over noisy repeated rivets.
Pixel-art constraints: crisp hard pixels, no antialiasing, 32x32 base-module logic, thin platform 32x8 or 32x16 logic, neutral top walking edge with strong readability. Keep muted gold subordinate.
Do not include a full scene, perspective environment, text, signage, characters, enemies, rope, anchors, grapple hooks, cyan accents, red/orange warnings, holograms, storefront branding, collision diagrams, or platform geometry copied from a background image.
```

## 정규화 범위

ImageGen 출력의 배치·외곽선·픽셀은 Runtime에 직접 사용하지 않는다. `build_platform_atlas.py`가 프로젝트 팔레트와 정확한 `32×32`, `32×8` 정수 픽셀 규격으로 새로 그린다.
