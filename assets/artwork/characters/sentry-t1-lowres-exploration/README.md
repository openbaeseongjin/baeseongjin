# Sentry T1 Low-Resolution Exploration

- Status: `SELECTED / RUNTIME-NORMALIZED`
- Runtime target: `sentry-t1` (경계 포탑)
- Runtime display target: 약 `56 x 56 px`
- Authored assumption: 논리 `24 x 24~32 x 32 px`의 큰 픽셀 덩어리
- Generated: 2026-08-20, Codex built-in ImageGen
- Runtime integration: `source/06.png` selected; normalized export at `export/runtime-selected.png`

## Purpose

Sector 01의 낮은 정보량 플레이어·환경과 함께 읽히는 경계 포탑 실루엣을 고르기 위한 10종 탐색본이다. 한 후보 안에서는 `고정부 + 포탑 머리 + 짧은 단일 총구`만 역할 형태로 사용한다.

## Variants

| File | Primary silhouette |
| --- | --- |
| `source/01.png` | 원형 저상 베이스 + 사각 머리 |
| `source/02.png` | 팔각 베이스 + 좁은 머리 |
| `source/03.png` | 클램프형 베이스 + 쐐기 머리 |
| `source/04.png` | 평평한 베이스 + 셔터형 머리 |
| `source/05.png` | 드럼 베이스 + 작은 사각 총구 |
| `source/06.png` | 납작한 퍽 베이스 |
| `source/07.png` | 사다리꼴 베이스 + 전방 쐐기 |
| `source/08.png` | 반구형 베이스 + 매립 머리 |
| `source/09.png` | 낮은 레일형 베이스 |
| `source/10.png` | 가장 작은 L자형 포탑 |

## References and constraints

- Player scale/style reference: user-provided `C:\TEMPFO~1\codex-clipboard-a78d0034-fb84-42eb-8c22-92cbf6271dce.png` (project use approved in conversation; redistribution status unknown)
- Gameplay scale reference: `../sector-01-enemy-family-concept/preview/sector-01-sentry-runtime-desktop.png`
- Rules: `docs/graphics-asset-guide.md`, `docs/pixel-graphics-design-guide.md`, `docs/enemy-sprite-asset-format.md`
- Palette direction: dark navy/charcoal, warm gray rim, red-orange sensor, optional single amber accent; cyan/teal excluded

The ImageGen authoring PNGs remain selection sources and must not be copied directly into `assets/runtime/`. Candidate `06` is normalized by `../sector-01-enemy-family-concept/source/normalize_sector01_selected_enemies.py` into a transparent `32x32` cell with binary alpha, nearest-neighbor scaling, and the shared six-color Sector 01 enemy palette. Required animations still fall back to the selected base frame until separate poses are authored.
