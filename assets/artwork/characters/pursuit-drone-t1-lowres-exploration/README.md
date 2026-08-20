# Pursuit Drone T1 Low-Resolution Exploration

- Status: `SELECTED / RUNTIME-NORMALIZED`
- Runtime target: `pursuit-drone-t1` (추격 드론)
- Runtime display target: 약 `56 x 56 px`
- Authored assumption: 논리 `24 x 24~32 x 32 px`의 큰 픽셀 덩어리
- Generated: 2026-08-20, Codex built-in ImageGen
- Runtime integration: `source/09.png` selected; normalized export at `export/runtime-selected.png`

## Purpose

Sector 01에서 빠르게 접근·돌진하는 역할을 장식 없이 실루엣만으로 읽히게 하는 10종 탐색본이다. `전방 돌진부 + 짧은 몸통 + 후방 추진부`만 허용하고 총·다리·복수 엔진은 사용하지 않는다.

## Variants

| File | Primary silhouette |
| --- | --- |
| `source/01.png` | 화살촉형 전방부 |
| `source/02.png` | 둔한 탄환형 몸체 |
| `source/03.png` | 얕은 초승달형 돌진부 |
| `source/04.png` | 다이아몬드 쐐기형 |
| `source/05.png` | 단순 만타형 쐐기 |
| `source/06.png` | 해머헤드형 돌진부 |
| `source/07.png` | 긴 창끝형 전방부 |
| `source/08.png` | 아래로 꺾인 갈고리형 |
| `source/09.png` | 최소 삼각형 실루엣 |
| `source/10.png` | 쐐기 몸체 + 두 블록 꼬리 |

## References and constraints

- Player scale/style reference: user-provided `C:\TEMPFO~1\codex-clipboard-a78d0034-fb84-42eb-8c22-92cbf6271dce.png` (project use approved in conversation; redistribution status unknown)
- Pursuit identity reference: `../pursuit-drone-t1-attack/source/reference-user-provided.png` (project use approved; redistribution status unknown)
- Gameplay scale reference: `../sector-01-enemy-family-concept/preview/sector-01-pursuit-runtime-desktop.png`
- Rules: `docs/graphics-asset-guide.md`, `docs/pixel-graphics-design-guide.md`, `docs/enemy-sprite-asset-format.md`
- Palette direction: dark navy/charcoal, warm gray rim, red-orange sensor, optional flat amber exhaust; cyan/teal excluded

The ImageGen authoring PNGs remain selection sources and must not be copied directly into `assets/runtime/`. Candidate `09` is normalized by `../sector-01-enemy-family-concept/source/normalize_sector01_selected_enemies.py` into a transparent `32x32` cell with binary alpha, nearest-neighbor scaling, and the shared six-color Sector 01 enemy palette. Required animations still fall back to the selected base frame until separate poses are authored.
