# ImageGen prompt

- 도구: OpenAI built-in ImageGen
- use case: `stylized-concept`
- 입력 이미지: `docs/bsh/scenario/2/images/sector-02-background-reference.png` — 색·재료·마모 문법만 참고한 mood reference
- 금지: 레퍼런스의 다리·발판·표지판·텍스트·구도 복제

```text
Create an original modular platform tileset for the walkable collision surfaces of a worn vertical worker-housing megastructure. Show solid residential balcony slabs, patched concrete and steel access decks, thin one-way laundry/service catwalks, utility-bridge undersides, end caps, inside/outside corners and support brackets. Use crisp hand-authored pixel-art logic with a 32x32 base grid, dark navy, charcoal, worn cool concrete, desaturated muted teal, sparse old fluorescent green and very sparse warm yellow service wear. Solid modules must look thick and weight-bearing; one-way modules must look thin and open underneath. Use a genuinely transparent background with clear gutters. Do not include people, enemies, ropes, anchors, signs, text, UI, logos, watermark, scenery, perspective mockups, bright cyan or red/orange telegraph colors. Do not copy the reference image's platform layout or create gameplay geometry.
```

Runtime export는 생성 시트의 안티앨리어싱과 임의 배열을 직접 사용하지 않는다. `build_platform_atlas.py`가 승인된 재료 문법을 `32×32` fill과 `32×8` edge의 정수 픽셀 격자로 다시 저작한다.
