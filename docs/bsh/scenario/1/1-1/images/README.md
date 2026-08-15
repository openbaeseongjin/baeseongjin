# 1-1 이미지 상태

| 파일 | 상태 | 사용 범위 |
| --- | --- | --- |
| `01_gameplay_reference.png` | `RETIRED` | Turret이 있어 현재 1-1 Gameplay·배치 기준으로 사용 금지 |
| `02_level_layout.png` | `RETIRED` | Anchor 2개와 Turret이 있어 현재 1-1 Gameplay·배치 기준으로 사용 금지 |
| `03_approved_blockout.svg` | `APPROVED BLOCKOUT` | Runtime 좌표·충돌·Anchor·Terminal·Gate 배치 기준 |
| `04_scenario_art_reference.png` | `RETIRED / STRUCTURE MISMATCH` | R3가 지나치게 길고 P3와의 상대 배치가 Blockout과 달라 현재 기준으로 사용 금지 |
| `05_scenario_art_reference.png` | `APPROVED ART REFERENCE` | C04의 P3·R3·C 구조 관계, Player·한 줄 live Rope와 비활성 Fan 기준 |

Sector 전체의 색과 산업시설 분위기는 [`../../README.md`](../../README.md)의 공용 배경 레퍼런스를 사용한다. `01`, `02`, `04`는 결정 이력 보존용이며 새 구현이나 아트 외주 자료에 첨부하지 않는다.

## 05 생성 기록

- 생성일: `2026-08-15 KST`
- 생성 방식: built-in image generation, Runtime·Approved Blockout에서 만든 C04 구조 가이드와 공용 Sector Mood Reference 사용
- 대표 Shot: `C04 open-swing`
- Runtime 범위: local Player Y `-832~-608`, Desktop Zoom `1.0`
- 출력: `1672×941`, RGB PNG
- 구조 고정: P3는 위쪽의 긴 Landing, R3는 그 아래·왼쪽의 짧은 Recovery, C는 R3 오른쪽 아래, 비활성 Fan은 왼쪽 아래 배경
- 정확한 Gameplay 내용: Player 1명, Anchor C 1개, live Rope 1줄, P3 1개, R3 1개, 비활성 Fan 1개
- 제외: A/B Anchor, Enemy, Wind, Augment, Terminal, Gate, 전체 Route·Trajectory·UI·Label

### 프롬프트 세트

```text
Use case: stylized-concept
Input images: Image 1 is the immutable C04 camera-space structure guide. Image 2 is Sector 01 mood, palette and depth only.
Primary request: render C04 Open Swing on the locked structure.
Immutable gameplay structure: exactly two collidable surfaces. P3 is the longer upper landing. R3 is the shorter recovery beam below and left of P3. Anchor C is immediately below the right edge of R3. Do not move, resize, merge, extend, split or add gameplay surfaces.
Player: exactly one dark agile player, apparent body height about 48px, asymmetric grapple arm, long red scarf.
Rope/Anchor: exactly one Anchor C and exactly one taut live cyan rope from the player's hand to C.
Environment: Navy·Charcoal industrial shaft, blue haze, one inactive fan lower-left, sparse amber lights. Background structures are visibly non-collidable.
Avoid: route lines, labels, UI, extra platform, player, anchor, rope, enemy, wind, augment, terminal, gate and perspective.

Use case: precise-object-edit
Primary request: shrink only the oversized player to 48px apparent height and reconnect the rope to the resized grapple hand.
Invariants: preserve camera, P3, shorter R3, Anchor C, fan, background, lighting and palette unchanged.
```

### 구조 사후 검수

- [x] P3가 R3보다 위쪽에 있고 더 길다.
- [x] R3는 P3보다 왼쪽에 있으며 기존 `04`처럼 화면을 가로지르지 않는다.
- [x] Anchor C는 R3 오른쪽 아래에 있다.
- [x] 충돌 가능한 P3/R3 Edge와 비충돌 배경 구조가 구분된다.
- [x] Player 1명은 약 48px이며 Anchor C와 live Rope 한 줄로만 연결된다.
- [x] 비활성 Fan, 금지 요소와 `1672×941` RGB 출력 계약을 지킨다.

## 04 생성 기록 — RETIRED

2026-08-15 구조 대조에서 R3 상대 폭과 P3 배치가 승인 Blockout과 다름을 확인해 현재 기준에서 제외했다. 아래 내용은 최초 생성 이력으로만 보존한다.

- 생성일: `2026-08-15 KST`
- 생성 방식: built-in image generation, 공용 Sector 이미지 1장을 환경 분위기 전용 레퍼런스로 사용
- 대표 Shot: `C04 open-swing`
- Runtime 범위: local Player Y `-832~-608`, Desktop Zoom `1.0`
- 출력: `1672×941`, RGB PNG
- 정확한 Gameplay 내용: Player 1명, Anchor C 1개, live Rope 1줄, P3 1개, R3 1개, 비활성 Fan 1개
- 제외: A/B Anchor, Enemy, Wind, Augment, Terminal, Gate, 전체 Route·Trajectory·UI·Label

### 최종 프롬프트

```text
Use case: precise-object-edit after one stylized-concept generation
Asset type: 2D pixel-art Scenario Art Reference for SECTOR 01-1 SERVICE SHAFT
Primary request: C04 Open Swing의 대표 데스크톱 Gameplay Shot. 공용 Sector 이미지는 Navy·Charcoal 산업시설의 분위기·팔레트·픽셀 밀도·깊이에만 사용하고 배치를 복제하지 않는다.
Camera: side-on orthographic, 1672×941, open-swing Y -832~-608, desktop zoom 1.0.
Player: 정확히 1명, 머리부터 발까지 약 48px, 어두운 작은 실루엣, 비대칭 Grapple Arm, Swing 반대 방향으로 흐르는 긴 Red Scarf.
Rope/Anchor: Anchor C만 정확히 1개. Player의 Grapple Hand에서 Anchor C 중심까지 팽팽한 Cyan live Rope 정확히 1줄.
Gameplay: 위쪽 진행 방향의 P3 Landing 1개, 아래쪽 R3 Recovery 1개, 중앙의 큰 Swing 여백, 배경의 비활성 Fan 1개.
Environment: 거의 검은 전경 프레임, 청회색 중경, 푸른 안개 원경, Rope보다 어둡고 저채도인 배경 Cyan, 드문 Amber 정비등.
Avoid: 전체 Stage 지도, Route·Trajectory 선, Anchor Network, 다른 Rope·Anchor·Player, Enemy, Turret, Drone, Projectile, Laser, Hazard, Wind 표현, Moving Platform, Augment, Node, Terminal, Gate, Weapon, UI, HUD, Text, Label, Coordinate, Watermark, Perspective, Player 확대·복장 재설계.
```

첫 생성본은 환경·오브젝트·Rope 의미는 통과했지만 Player가 목표보다 크게 보여 `PENDING`으로 두었다. 최종본은 배경·Anchor·Platform 구도를 유지하고 Player와 Rope 하단 접점만 수정했다.

### 사후 검수

- [x] Player 1명이며 약 48px 상대 크기와 Dark Body·Red Scarf가 읽힌다.
- [x] 살아 있는 Rope가 Player와 Anchor C를 잇는 한 줄뿐이다.
- [x] Grapple Anchor는 C 한 개뿐이며 P3와 R3가 구분된다.
- [x] 비활성 Fan에는 회전·Wind·Damage 표현이 없다.
- [x] Enemy·Augment·Terminal·Gate·UI·Route 선이 없다.
- [x] Sector 01의 Navy·Charcoal·Blue Haze와 제한된 Cyan·Amber를 유지한다.
- [x] 출력이 `1672×941` RGB PNG다.
- [x] Approved Blockout이나 Runtime 통이미지 배경으로 오해하지 않도록 사용 범위를 기록했다.
