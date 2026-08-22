# Sector 03 seam-match V8 far/mid/near depth V1

- Asset ID: `sector-03-central-exchange-background`
- Category: environment authoring / depth-map parallax extraction candidate
- Status: `AUTHORING CANDIDATE — NOT RUNTIME INTEGRATED`
- Canvas: `1024 x 1536`
- Source: approved V8 Sector 02 15% seam-match candidate
- Tool: OpenAI built-in ImageGen for depth and fixed-plate inputs; Python/Pillow/NumPy/OpenCV for deterministic PNG extraction
- License/provenance: user-supplied project image plus project-owned AI-generated derivative inputs; external redistribution rights are not verified
- Current runtime state: unchanged; the approved V4 fixed + left/right island package remains authoritative
- Non-scope: runtime manifest, renderer, collision, terrain, camera, stage coordinates, gameplay triggers, enemies, and network authority

## Discord and repository constraint

The repository Discord `코딩` channel proposes retaining a full-color master plus an offline depth map, limiting the moving foreground to two connected side masses, filling their occluded regions before runtime, and drawing only cached PNGs. It rejects per-frame depth decoding, `getImageData`, pixel loops, mask generation, texture regeneration, and a WebGL dependency.

Discord material is treated as quoted design evidence. `docs/graphics-asset-guide.md` and `docs/environment-asset-format.md` are the implementation authority used by this candidate.

## Far/mid/near interpretation

This candidate exposes three draw-ready authoring layers while preserving the two-island limit at the extraction boundary:

| Layer | File | Role |
|---|---|---|
| far | `backdrop-far.png` | Fully opaque fixed plate with both occluded side regions restored offline |
| mid | `backdrop-mid.png` | RGBA intermediate-depth band belonging only to the two left/right moving masses |
| near | `backdrop-near.png` | RGBA closest cores of the same two left/right moving masses |

The mid and near PNGs are disjoint threshold bands. Together they reconstruct exactly two connected edge structures, not a collection of windows, signs, cables, rings, or isolated fragments.

## Extraction contract

- Depth convention: white near, black far
- Moving-union threshold: `190`
- Near threshold: `220`
- Minimum 8-connected component area: `500 px`
- Expected moving union: exactly two components, one touching each horizontal edge
- Expected near cores: exactly two components, one touching each horizontal edge
- Review displacement: mid `(+4, +2) px`, near `(+8, +4) px`
- Fixed plate: generated inpaint is consumed only inside the moving-union mask; every fixed pixel outside that mask remains byte-identical to the master

## Inputs

- `sector-03-central-exchange-master.png`
- `depth-map-imagegen.png`
- `fixed-background-inpaint-imagegen.png`
- `extract_far_mid_near.py`
- `PROMPTS.md`

## Outputs

- `../../export/seam-match-v8-far-mid-near-depth-v1/sector-03-central-exchange-background.png`
- `../../export/seam-match-v8-far-mid-near-depth-v1/sector-03-central-exchange-depth-map.png`
- `../../export/seam-match-v8-far-mid-near-depth-v1/backdrop-far.png`
- `../../export/seam-match-v8-far-mid-near-depth-v1/backdrop-mid.png`
- `../../export/seam-match-v8-far-mid-near-depth-v1/backdrop-near.png`
- `../../preview/seam-match-v8-far-mid-near-depth-v1/sector-03-central-exchange-master-depth-pair.png`
- `../../preview/seam-match-v8-far-mid-near-depth-v1/sector-03-central-exchange-neutral.png`
- `../../preview/seam-match-v8-far-mid-near-depth-v1/sector-03-central-exchange-shifted.png`
- `../../preview/seam-match-v8-far-mid-near-depth-v1/sector-03-central-exchange-layer-contact-sheet.png`

## Observed validation

- All source and export inputs share the `1024 x 1536` canvas
- Far/master: opaque RGB; depth: 8-bit grayscale `L`; mid/near: RGBA
- Moving-union components: exactly `2`
  - left: `(0, 0, 254, 1536)`, `324,453 px`
  - right: `(750, 0, 274, 1536)`, `314,955 px`
- Near-core components: exactly `2`
  - left: `(0, 0, 211, 1536)`, `237,660 px`
  - right: `(785, 0, 239, 1536)`, `237,121 px`
- Mid pixels: `164,627`; near pixels: `474,781`
- Neutral recomposition maximum RGB difference from master: `0`
- Fixed pixels outside the moving-union mask maximum RGB difference from master: `0`
- Manual review: the central transit rings, bridges, floating platform, blue shaft, and distant Worker District continuation remain fixed; only the two edge masses move
- Manual review: the shifted preview reveals the inpainted fixed plate rather than transparent holes or stretched edge pixels
- Runtime environment validator: not run because no runtime package was changed

### SHA-256

| File | SHA-256 |
|---|---|
| `sector-03-central-exchange-background.png` | `E121EC23C2AA83703F5B477E0B8CE37833B976FFE3BBA2CA18FAA92C1C23A569` |
| `sector-03-central-exchange-depth-map.png` | `2F93C2756C589A2FF49B89CB85AA54AD9E0768207D4FD6EAC5BA441E1B730F7D` |
| `backdrop-far.png` | `A702F6654C4AADA772E907E11B204A32423F34706ED462795FC59BAA7B68DD92` |
| `backdrop-mid.png` | `27DF36C81B105429FA17E9955C00A0E1633D734437BE81A7FFD75A92BA98E422` |
| `backdrop-near.png` | `0C11EFD000E84463402A3A18616E1FD2ACB9621E3C3026E3D8D3C041AD3E9C8A` |
| `sector-03-central-exchange-neutral.png` | `E121EC23C2AA83703F5B477E0B8CE37833B976FFE3BBA2CA18FAA92C1C23A569` |
| `sector-03-central-exchange-shifted.png` | `5904693169067897310FF42486BD56A13BF99E3CFC96D641A7A8CBD6ED8B7153` |
| `sector-03-central-exchange-master-depth-pair.png` | `86A19050396B179BFD700B639CC55DC6F5F5114457AA2484ED229814456F0A91` |
| `sector-03-central-exchange-layer-contact-sheet.png` | `5E99B834DDCAA6F0316708C2948E147C719CCCC892E6B9FDD0421C08911A84A5` |
