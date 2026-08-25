# Boss06 Maintenance Shuttle

Status: `ENDING-ALIGNED PIXEL V3 / BOARDING STATE / RUNTIME-INTEGRATED`

## Purpose

- Asset ID: `boss-06-maintenance-shuttle`
- Category: `objects`
- Role: Boss06 승리 후 출발 게이트 뒤에서 처음 공개되는 정비 셔틀과 안전한 탑승 목표
- Runtime states: `hidden`, `boarding`; `hidden`은 렌더되지 않으므로 `boarding` 이미지만 제작
- Runtime definition: `src/game/boss/ContinuityWardenRuntime.js`
- Runtime atlas size: `500×390px`; world display size: `250×195px`
- Runtime contact point: authored `shuttlePosition` `(4630, -1055)`
- Authoring anchor: actual bottom contact `(0.356, 1)` (`shuttlePosition`과 Departure Deck top이 같은 착지 좌표를 소유)
- Identity reference: `assets/runtime/cinematics/final-escape/one_rope_final_escape_with_english_credits_preview.gif`

엔딩 비행 셔틀의 왼쪽을 향한 뾰족한 기수·낮은 캐노피·짧은 주익·높은 후방 수직미익을 Boss06 정비 셔틀의 고정 정체성으로 사용한다. `boarding`은 같은 기체가 착륙한 형태에서 가까운 측면 승선문과 짧은 램프만 펼친 상태다. 옅은 파란빛 정비 외장과 흑연색 프레임을 사용하고, 시안색은 탑승 유도등에만, 호박색은 정비 체결부에만 제한한다.

## Files

| Path | Purpose | Dimensions |
| --- | --- | --- |
| `source/maintenance-shuttle-boarding-imagegen.png` | OpenAI built-in ImageGen RGBA source | `1420×1108` |
| `source/maintenance-shuttle-boarding-pixel-v2-imagegen.png` | 저밀도 픽셀 해상도를 확정한 정면형 탐색본 | `1419×1108` |
| `source/maintenance-shuttle-boarding-ending-aligned-imagegen.png` | 사용자가 승인한 엔딩 정렬 ImageGen 원본 | `1420×1108` |
| `source/generation-prompt.md` | Initial concept generation prompt | text |
| `source/generation-prompt-ending-aligned.md` | Ending-aligned pixel V3 prompt | text |
| `source/normalize_shuttle_asset.py` | Transparent trim, logical downsample and nearest-neighbor export | script |
| `export/maintenance-shuttle-boarding.png` | `boarding` visual candidate | `500×390` |
| `export/maintenance-shuttle-boarding-ending-aligned.png` | Ending-aligned pixel V3 `boarding` candidate | `500×390` |
| `preview/maintenance-shuttle-boarding-review.png` | Nearest-neighbor `2×` transparency review | `1000×780` |
| `preview/maintenance-shuttle-runtime-scale-review.png` | `500×390` shuttle with `48px` player visual-height reference | `720×500` |
| `preview/maintenance-shuttle-boarding-ending-aligned-review.png` | Pixel V3 nearest-neighbor `2×` transparency review | `1000×780` |
| `preview/maintenance-shuttle-ending-aligned-runtime-scale-review.png` | Pixel V3 with `48px` player visual-height reference | `720×500` |

## Production record

- Tool: OpenAI built-in ImageGen edit flow, 2026-08-25
- Approval source: user-attached PNG `sha256:28921665fa712fc6aea66f36743c6a8087706b01f492f44f6cdf7c14d88db46e`
- Internal reference: final-escape fallback GIF frame 14; Player locomotion and Sector06 platform pixel density
- Normalization: Pillow 12.1.1; connected bright-neutral background extraction; `250×195` nearest logical pixels; 32-color no-dither quantization; binary alpha; nearest-neighbor `2×` export
- External visual source: none embedded in generation
- Provenance/license: OpenAI-generated project artwork

## Validation

- Export는 정확히 `500×390` RGBA이며 배경이 투명해야 한다.
- Pixel V3 export는 투명색을 포함해 정확히 32색 이하이고 alpha는 `0 / 255`만 사용해야 한다.
- 셔틀의 불투명 하단은 캔버스 마지막 행까지 이어지고 실제 하단 접점의 중심 `x=178/500`이 Runtime `shuttlePosition`에 대응해야 한다.
- 엔딩 셔틀의 기수·캐노피·주익·수직미익과 `boarding` 승선문·램프가 색 없이도 형태로 구분되어야 한다.
- Runtime package는 export와 동일한 `500×390` RGBA pixel content를 사용한다.
- Sector06 Boss 승리 화면의 데스크톱·모바일 크기에서 셔틀과 탑승 램프를 확인한다.

2026-08-25 Runtime 검증에서 desktop `1280×720`과 mobile `390×844`의 실제 Boss06 `shuttle-reveal` 화면에 승인 sprite가 표시됐고 브라우저 오류 로그는 없었다. Runtime PNG를 잠시 격리한 같은 화면에서는 기존 Canvas 셔틀 fallback이 표시됐으며, 확인 직후 PNG를 원래 경로로 복원했다.

## Runtime integration

- Runtime package: `assets/runtime/objects/boss-06-maintenance-shuttle/`
- Runtime source: `maintenance-shuttle-boarding.png`
- Loader boundary: `RuntimeAssetCatalog` + `WorldObjectSpriteAssetCatalog`
- Renderer: `ContinuityWardenSpriteObjectRendererCatalog`
- `boarding` 상태는 sprite를 실제 하단 접점 anchor `(0.356, 1)`로 그리며 `hidden` 상태는 계속 렌더하지 않는다.
- 준비 전 또는 로드 실패 시 기존 `MaintenanceShuttleRenderer` Canvas 표현으로 독립 복구한다.

## Non-scope / integration needs

- 이 Runtime 연결은 Shuttle을 논리 원본 `250×195`로 표시하고 실제 하단 접점만 Departure Deck top에 맞춘다. 탑승 영역·게이트/카메라 승리 타임라인·충돌·물리·네트워크 권한은 변경하지 않는다.
- 기존 `maintenance-shuttle-boarding.png`과 정면형 pixel V2 원본은 이력용 탐색본이며, Pixel V3가 현재 제작 후보다.
- World object 전용 manifest·validator는 없으므로 실제 PNG 규격, 로더 크기 검증과 브라우저 화면 확인을 Runtime 검증으로 사용한다.
