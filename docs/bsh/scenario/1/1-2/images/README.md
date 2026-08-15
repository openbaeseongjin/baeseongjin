# 1-2 이미지 상태

| 파일 | 상태 | 사용 범위 |
| --- | --- | --- |
| `01_swing_line.png` | `RETIRED PARTIAL` | 3-Anchor 초기 아이디어 기록, 현재 A→B→C→D 기준으로 사용 금지 |
| `02_level_layout.png` | `RETIRED` | Turret·Terminal이 있어 현재 1-2 Gameplay·배치 기준으로 사용 금지 |
| `03_scenario_art_reference.png` | `RETIRED` | 전체 Anchor 연결선과 Stage 전체 구도가 실제 Gameplay Shot·live Rope 의미와 불일치 |
| `04_approved_blockout.svg` | `APPROVED BLOCKOUT` | Runtime 좌표·충돌·Recovery·Crossbeam·Panel·Gate 배치 기준 |
| `05_scenario_art_reference.png` | `APPROVED ART REFERENCE` | C02 First Handoff의 Player·A/B·B live Rope·P1·정지 Lift 정보 위계 기준 |

Art Reference는 화면의 분위기를, Approved Blockout은 실제 위치를 결정한다. 두 이미지를 서로의 용도로 사용하지 않는다.

## 05 생성 기록

- 생성일: `2026-08-15 KST`
- 생성 방식: built-in image generation, 공용 Sector 이미지 1장을 환경 분위기 전용 레퍼런스로 사용
- 대표 Shot: `C02 first-handoff`
- Runtime 범위: local Player Y `-512~-224`, Desktop Zoom `1.0`
- 출력: `1672×941`, RGB PNG
- 정확한 Gameplay 내용: Player 1명, Anchor A/B 2개, Anchor B live Rope 1줄, P1 Recovery 1개, 정지 Maintenance Lift 1개
- 제외: Anchor C/D, Crossbeam X1, 다른 Platform, Enemy, Wind, Augment, Panel, Gate, 전체 Route·Trajectory·UI·Label

### 최종 프롬프트

```text
Use case: precise-object-edit after one stylized-concept generation
Asset type: 2D pixel-art Scenario Art Reference for SECTOR 01-2 DOUBLE ANCHOR SHAFT
Primary request: C02 First Handoff의 성공 순간을 보여주는 대표 데스크톱 Gameplay Shot. 공용 Sector 이미지는 Navy·Charcoal 산업시설의 분위기·팔레트·픽셀 밀도·깊이에만 사용하고 배치를 복제하지 않는다.
Camera: side-on orthographic, 1672×941, first-handoff Y -512~-224, desktop zoom 1.0.
Player: 정확히 1명, 머리부터 발까지 약 48px, 어두운 작은 실루엣, 비대칭 Grapple Arm, 이전 A→B Momentum 반대 방향으로 흐르는 긴 Red Scarf.
Rope/Anchor: inactive Anchor A와 current Anchor B만 정확히 2개. Player Grapple Hand에서 Anchor B 중심까지 팽팽한 Cyan live Rope 정확히 1줄. A에는 연결선이 없다.
Gameplay: 실패 시 보이는 P1 Recovery 1개, 중앙의 정지 Maintenance Lift Cage·Rail·Counterweight·Heavy Cable. Lift는 비충돌·비작동 배경이다.
Environment: 거의 검은 전경 프레임, 청회색 중경, 푸른 안개 원경, Rope보다 어둡고 저채도인 배경 Cyan, 드문 Amber 정비등.
Avoid: 전체 Stage 지도, Route·Trajectory 선, Anchor Network, Anchor C/D, 다른 Rope·Player·Platform, Crossbeam, Enemy, Turret, Drone, Projectile, Laser, Hazard, Wind, Moving Platform, Augment, Node, Terminal, Panel, Gate, Weapon, UI, HUD, Text, Label, Coordinate, Watermark, Perspective, Player 확대·복장 재설계.
```

첫 생성본은 A/B·B live Rope·P1·정지 Lift의 관계는 통과했지만 Player가 목표보다 크게 보여 `PENDING`으로 두었다. 두 번째 결과는 Player와 Rope 하단 접점만 수정했으나 폭이 `1671px`이어서 승인하지 않았다. 최종본은 내용과 구도를 유지한 채 출력 캔버스를 `1672×941`로 보정했다.

### 사후 검수

- [x] Player 1명이며 약 48px 상대 크기와 Dark Body·Red Scarf가 읽힌다.
- [x] Anchor A/B 두 개만 보이고 살아 있는 Rope는 Player와 B를 잇는 한 줄뿐이다.
- [x] A는 연결되지 않은 이전 Anchor, P1은 보조 Recovery로 읽힌다.
- [x] Maintenance Lift는 정지·비충돌 배경이며 Gameplay보다 낮은 대비다.
- [x] Anchor C/D·Crossbeam·Enemy·Wind·Augment·Panel·Gate·UI·Route 선이 없다.
- [x] Sector 01의 Navy·Charcoal·Blue Haze와 제한된 Cyan·Amber를 유지한다.
- [x] 출력이 `1672×941` RGB PNG다.
- [x] Approved Blockout이나 Runtime 통이미지 배경으로 오해하지 않도록 사용 범위를 기록했다.
