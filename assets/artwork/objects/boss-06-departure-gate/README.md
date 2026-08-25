# Boss06 Departure Gate

Status: `RUNTIME-INTEGRATED / LOCKED-LIGHT-OPEN + TRANSITION MOTION`

## Purpose

- Asset ID: `boss-06-departure-gate`
- Category: `objects`
- Role: Boss06 전투 중 Maintenance Shuttle 접근을 막는 대형 출발 보안문
- Runtime states delivered: `locked`, `light`, `open`
- Presentation-only transition: `light → open`, 8 frames over the existing `0.3s` gate-light interval
- Runtime world footprint reference: `480×760px`
- Authoring anchor: `bottom-center`

The silhouette follows the current `ContinuityWardenRuntime` Gate bounds rather than the older `1536×1024` landscape reference. The two interlocking leaves and central mechanical spine make the locked state readable without text or a lock icon. Dark navy/graphite steel matches Sector06 rooftop dusk; cyan is limited to security status lighting and amber to maintenance markings.

## Files

| Path | Purpose | Dimensions |
| --- | --- | --- |
| `source/departure-gate-locked-imagegen.png` | Built-in ImageGen locked-state source | `997×1577` |
| `source/departure-gate-light-imagegen.png` | Built-in ImageGen light-state source | `996×1580` |
| `source/departure-gate-open-imagegen.png` | Built-in ImageGen open-state source | `997×1577` |
| `export/departure-gate-locked.png` | Runtime `locked` visual candidate | `480×760` |
| `export/departure-gate-light.png` | Runtime `light` visual candidate | `480×760` |
| `export/departure-gate-open.png` | Runtime `open` visual candidate | `480×760` |
| `export/departure-gate-state-sheet.png` | `locked / light / open` horizontal review sheet | `1440×760` |
| `export/opening/opening-00.png`…`opening-07.png` | Presentation-only opening sequence | each `480×760` |
| `preview/departure-gate-transition.gif` | `locked → light → open` motion review | `640×900` |

## Production record

- Tool: OpenAI built-in ImageGen, 2026-08-25
- Normalization: Pillow 12.1.1; large neutral-component alpha extraction; crop; `240×380` working downsample; nearest-neighbor `2×` export
- Motion: deterministic center-out panel retraction mask; 8 transparent PNG frames; GIF preview only
- External visual source: none used in generation
- Provenance/license: OpenAI-generated project artwork; no third-party reference image embedded
- Prompt: `source/generation-prompt.md`

## Validation

- Confirm all three state exports and all eight motion frames are exact `480×760` RGBA images.
- Confirm `locked` and `light` retain an opaque center while `open` has a transparent passage.
- Confirm the bottom opaque row provides a stable bottom-center contact edge.
- Review at `1×` and against the Sector06 dark-blue background before runtime integration.

## Non-scope / integration needs

- Runtime package: `assets/runtime/objects/boss-06-departure-gate/`
- Loader boundary: `RuntimeAssetCatalog` + `WorldObjectSpriteAssetCatalog`
- Renderer: `ContinuityWardenSpriteObjectRendererCatalog`
- `locked`는 전투 중 닫힌 문, `light`는 기존 0.3초 동안 `opening-00..07`, `open`은 열린 통로를 표시한다.
- bottom-center anchor는 Departure Deck 왼쪽에서 visual 반폭만큼 떨어진 보행면 좌표를 사용해 `480px` visual 전체를 Deck 안에 둔다. 기존 Gate collision bounds는 이 시각 보정과 독립적으로 유지한다.
- 준비 전 또는 상태별 이미지 로드 실패 시 기존 `DepartureGateRenderer` Canvas 표현으로 독립 복구한다.
- 이 Runtime 연결은 Gate collision, `gateOpen`, victory timing, bridge deployment, Shuttle reveal, gameplay, physics or network authority를 변경하지 않는다.
- The `opening-00..07` files are presentation frames, not a new gameplay state. Runtime remains `locked / light / open`.
- World objects do not yet have a dedicated runtime image package validator; exact PNG size, loader validation and Boss06 브라우저 화면 확인을 runtime evidence로 사용한다.
