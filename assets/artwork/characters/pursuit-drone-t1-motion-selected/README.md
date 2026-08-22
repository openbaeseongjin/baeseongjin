# Pursuit Drone T1 Selected Motion

## Status

- Asset ID: `pursuit-drone-t1-motion-selected`
- Runtime enemy ID: `pursuit-drone-t1`
- Category: `characters`
- Status: `RUNTIME-INTEGRATED / USER-APPROVED / FINAL VERIFIED`
- Identity source: selected low-resolution candidate `09`
- Intended game display: `56 x 56 px`
- Facing: right
- Anchor intent: center `(0.5, 0.5)`

This package gives the selected Sector 01 pursuit drone a compact motion set without adding guns, legs, panels, or secondary engines. The silhouette remains a right-facing triangular wedge with one amber rear thruster and one red front sensor.

2026-08-20 사용자 최종 검수에서 후보 `09` 기반 이미지와 `pursuit-seek`, `pursuit-windup`, `pursuit-dash`, `pursuit-recover`, `knockback` 애니메이션이 승인됐다. 이후 명시적인 새 결정 없이 후보 재생성이나 다른 실루엣·모션 세트로 교체하지 않는다.

`pursuit-windup`과 `pursuit-dash`에서는 이 atlas의 현재 frame 전체를 새 이미지나 분리 layer 없이 회전·필요 시 수평 반전한다. Renderer는 gameplay가 Player 위치에서 확정해 실제 돌진에도 사용하는 `behaviorState.dashDirection`을 소비하므로 기존 전방 머리와 센서가 돌진 대상을 가리킨다. 나머지 상태는 기존 upright 방향 표현을 유지한다.

## State and frame map

Every row contains four uniform `32 x 32` RGBA frames. The exported atlas is ordered top to bottom as listed here and left to right from frame `00` through `03`.

| Atlas row | Presentation state | Motion read | Review GIF timing |
| ---: | --- | --- | --- |
| 0 | `pursuit-seek` | one-pixel hover bob while tracking | `160 / 160 / 160 / 160ms` |
| 1 | `pursuit-windup` | body pulls back and compresses before launch | `70 / 60 / 60 / 60ms` |
| 2 | `pursuit-dash` | long, low forward wedge with extended thrust | `50 / 50 / 50 / 50ms` |
| 3 | `pursuit-recover` | nose drops, then settles through a short wobble | `100 / 120 / 140 / 140ms` |
| 4 | `knockback` | backward/upward tilt followed by stabilization | `90 / 90 / 110 / 140ms` |

GIF timings are review-only. Gameplay remains authoritative for state duration, including current pursuit references of windup `0.25s`, dash `0.20s`, and recovery `0.50s`. The PNGs contain no collider, hitbox, damage, physics, behavior timing, or network fields.

## Dimensions and palette

- Individual frames: `32 x 32` RGBA PNG with transparent padding and binary alpha
- Atlas: `128 x 160` RGBA PNG, four columns by five rows, no spacing or margin
- Opaque frame bounds: width `25~30px`, height `12~22px` depending on pose and offset
- Visible palette: exactly six shared Sector 01 colors per frame
- Sampling: nearest-neighbor only; no antialiasing or dithering
- Information budget: one body wedge, one rear thruster cue, one front sensor cue

## Files

| Path | Purpose |
| --- | --- |
| `source/pursuit-motion-imagegen.png` | built-in ImageGen authoring sheet |
| `source/generation-prompt.md` | generation input, reference role, and prompt record |
| `source/normalize_pursuit_motion.py` | repeatable crop, noise removal, palette normalization, atlas, GIF, and preview builder |
| `export/pursuit-motion.png` | transparent five-row, four-column atlas |
| `export/<state>-00.png` through `03.png` | twenty transparent state frames |
| `preview/<state>.gif` | five review-only state loops |
| `preview/pursuit-behavior-cycle.gif` | seek → windup → dash → recover review sequence |
| `preview/pursuit-motion-review.png` | enlarged nearest-neighbor frame sheet |
| `preview/pursuit-motion-runtime-size-check.png` | exact `56 x 56` display check on the Sector 01 environment |

## Source, tool, and license status

- Generation tool: Codex built-in ImageGen, 2026-08-20
- Normalization tool: Pillow script in this package
- Direct identity reference: `../pursuit-drone-t1-lowres-exploration/export/runtime-selected.png`
- Identity reference SHA-256: `fd997d950fb1eb5e8a4aa87c608b1b2e4e5f90cb25b1b750cab68df578a55a29`
- ImageGen source SHA-256: `76bfe7f7ece7bd5c2c56c851896387985d8712a51329daef041b76fb89946f41`
- Normalized atlas SHA-256: `9dcacd787c0692ec0fe5f3b937d0ae0f4627e533d49860b19ae2318c7c86e037`
- Source format: repository-generated PNG transformed into a generated RGBA motion sheet and normalized to transparent RGBA frames
- License status: generated for this repository. The upstream player/reference material used during the earlier identity exploration had no supplied redistribution license, so confirm that source chain before public distribution or final production promotion.

## Review and validation

- Structural normalization: PASS. The script produced `20` non-empty `32 x 32` RGBA frames and one `128 x 160` atlas.
- Pixel constraints: PASS. Each frame has binary transparency, six visible colors, and no resampling other than nearest-neighbor for the exported pixels.
- State readability: PASS in the enlarged review sheet. Seek, compression, forward dash, recovery wobble, and knockback tilt remain distinguishable by silhouette and displacement.
- Sector 01 scale check: PASS at exact `56 x 56` display size against the current maintenance environment preview.
- Runtime enemy validator: PASS after promotion to `assets/runtime/characters/sector-01-enemies/pursuit-motion.png` and enemy manifest v3.
- In-game review: PASS in fixed Stage 1-5 `?seed=15` at desktop `1280x720` and mobile-landscape `844x390`; output remained readable at `56x56` with no built-in mock overlay or browser warning/error.

## Runtime boundary and non-scope

The normalized atlas is promoted to `assets/runtime/characters/sector-01-enemies/pursuit-motion.png`. Enemy manifest v3, parser/loader, immutable definition, renderer, validator, and documentation consume the shared `SpriteAnimation` clip structure without adding an ImageGen- or Pillow-specific runtime branch.

Shared projectile attack states, death motion, hit flash, collider, hurtbox, damage, health, physics, behavior, and network authority are outside this authoring delivery.
