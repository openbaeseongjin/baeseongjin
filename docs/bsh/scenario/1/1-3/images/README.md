# 1-3 이미지 상태

| 파일 | 상태 | 사용 범위 |
| --- | --- | --- |
| `01_swing_line.png` | `RETIRED` | 이전 `COOLING SHAFT` 이미지라 1-3 구현·외주·검수 기준으로 사용 금지 |
| `02_layout.png` | `RETIRED` | 이전 `COOLING SHAFT` 이미지라 1-3 구현·외주·검수 기준으로 사용 금지 |
| `03_scenario_art_reference.png` | `RETIRED / ROPE-ROUTE MISMATCH` | Sentry·분위기 이력만 보존한다. live Rope와 전체 경로처럼 보이는 선이 함께 있어 새 생성·구현·외주·검수 입력으로 사용 금지 |
| `04_approved_blockout.svg` | `APPROVED BLOCKOUT` | Runtime Geometry·Route·LOS·Sentry·Gate의 전체 좌표 기준 |
| `05_scenario_art_reference.png` | `APPROVED ART REFERENCE` | Route Choice Camera의 B/C/D·Safe Ledge·R1·두 Cover·Sentry 구조와 Player→C live Rope 한 줄 기준 |

Sector 전체의 색과 산업시설 분위기는 [`../../README.md`](../../README.md)의 공용 배경 레퍼런스를 사용한다. `RETIRED` 자료는 결정 이력 보존용이며 새 생성·구현·외주·검수 자료에 첨부하지 않는다.

이 문서는 [`../PRODUCTION-ALIGNMENT.md`](../PRODUCTION-ALIGNMENT.md) §1·§2의 상태 표를 기준으로 [Scenario Art 생성 규격](../../../SCENARIO-ART-GENERATION-STANDARD.md) §10 형식에 맞춰 정리했다.

## 05 생성 기록

- 생성일: `2026-08-15 KST`
- 생성 방식: built-in image generation, Runtime·Approved Blockout에서 투영한 Route Choice Camera 구조 가이드와 공용 Sector Mood Reference 사용
- 대표 Shot: `Route Choice`, B→C Airborne Re-Attach 중 Sentry가 Player를 Track하는 Gameplay 상태
- Runtime 범위: local Player Y `-800~-544`, Desktop Zoom `0.88`, Player screen Y ratio `0.62`
- 출력: `1672×941`, RGB PNG
- 구조 고정: D는 위, C는 왼쪽 중단, B는 아래; Safe Ledge는 왼쪽 중단, Safe Cover는 그 오른쪽 끝에서 위로 상승, R1은 아래 중단·오른쪽, Upper Cover는 위 중앙, Sentry T1은 오른쪽 벽
- 정확한 Gameplay 내용: Player 1명, Sentry T1 1기, Anchor B/C/D 3개, Player→C live Rope 1줄, Red TRACK Telegraph 1줄, Safe Ledge 1개, R1 1개, Safe Cover 1개, Upper Cover 1개
- 제외: P0·P1·P4, Anchor A, Scanner, Service Panel, Gate, Projectile, Route·Trajectory·Label·UI, Augment, Wind, Drone, Cutter, 두 번째 Enemy

### 프롬프트 세트

```text
Use case: sketch-to-render / structure-preserving edit
Input images: Image 1 is the immutable Route Choice camera-space structure guide. Image 2 is Sector 01 mood, palette, material density and lighting only.
Primary request: transform the locked guide into a polished 1672×941 gameplay screenshot-style shot while preserving every visible gameplay solid and landmark.
Immutable gameplay structure: exactly one left Safe Ledge, one narrow Safe Cover on its right edge, one lower Recovery deck, one upper-center Upper Cover, exactly three visible anchors D/C/B at their fixed positions, one small right-wall Sentry, one approximately 48px Player, one straight live cyan Rope from Player to current Anchor C, and one thin red TRACK Telegraph from Sentry toward Player.
Environment: Navy·Charcoal maintenance-security shaft, steel frames, pipes, cable bundles, distant machinery, deep blue haze, sparse dim cyan service lights and very sparse amber lamps. Keep low-detail zones behind C, Player, Rope and Sentry.
Readability: Player/scarf → cyan Rope/Anchors → red Telegraph/Sentry → collision edges → background. Safe and Recovery rims are material cues, not route graphics.
Avoid: text, UI, labels, route arrows, dotted cyan paths, anchor network, extra rope, projectile, extra platform, Scanner, Gate, Panel, Augment, Wind, Drone, Cutter or second Enemy.
```

### 구조 사후 검수

- [x] Safe Ledge·Safe Cover·R1·Upper Cover의 좌우·상하 관계와 상대 폭이 Route Choice 구조 가이드와 같다.
- [x] D는 위, C는 왼쪽 중단, B는 아래에 있으며 보이는 Anchor는 정확히 3개다.
- [x] Sentry T1은 오른쪽 벽에 한 기만 있고 얇은 Red Telegraph 한 줄로 Player를 Track한다.
- [x] Player 1명은 약 48px이며 Player와 현재 Anchor C 사이에만 live Cyan Rope 한 줄이 있다.
- [x] Safe·Flow·Recovery의 선택지는 Geometry로 읽히며 Route·Trajectory·Arrow·Label 선이 없다.
- [x] P0·P1·P4·A·Scanner·Panel·Gate·Projectile·Augment·Wind·Drone·Cutter·두 번째 Enemy가 없다.
- [x] 비충돌 배경 구조는 Gameplay Collision Edge보다 어둡고 Anchor·Rope·Telegraph와 경쟁하지 않는다.
- [x] 출력이 `1672×941` RGB PNG다.
