# 1-4 이미지 상태

| 파일 | 상태 | 사용 범위 |
| --- | --- | --- |
| `01_scenario_art_reference.png` | `RETIRED / PLAYER-ROPE MISMATCH` | 큰 Player와 삼각 Anchor 연결이 현재 Gameplay Camera·Rope 의미와 달라 사용 금지 |
| `02_approved_blockout.svg` | `APPROVED BLOCKOUT` | 현재 좌표, 통과 경로, Node, Calibration Dummy, Gate의 제작 기준 |
| `03_scenario_art_reference.png` | `APPROVED ART REFERENCE` | Node Camera의 Node Deck·N1·A 구조, 약 48px Player와 A live Rope 한 줄 기준 |

Sector 전체의 색과 산업시설 분위기는 [`../../README.md`](../../README.md)의 공용 배경 레퍼런스를 사용한다.

이 문서는 [`../PRODUCTION-ALIGNMENT.md`](../PRODUCTION-ALIGNMENT.md) §1·§2의 상태 표를 기준으로 [Scenario Art 생성 규격](../../../SCENARIO-ART-GENERATION-STANDARD.md) §10 형식에 맞춰 정리했다. `01_scenario_art_reference.png`는 현재 규격 이전의 결정 이력으로만 보존하며 새 생성·구현·외주·검수 입력으로 사용하지 않는다.

## 03 생성 기록

- 생성일: `2026-08-15 KST`
- 생성 방식: built-in image generation, Runtime·Approved Blockout에서 만든 Node Camera 구조 가이드와 공용 Sector Mood Reference 사용
- 대표 Shot: `Node`, Foundation 선택 직후 Anchor A로 이동하는 Gameplay 상태
- Runtime 범위: local Player Y `-320~-160`, Desktop Zoom `1.10`
- 출력: `1672×941`, RGB PNG
- 구조 고정: 긴 Node Safe Deck은 화면 아래, Maintenance Node N1은 Deck의 중앙, Anchor A는 오른쪽 위, Player는 Node와 A 사이·A의 왼쪽 아래
- 정확한 Gameplay 내용: Player 1명, Maintenance Node 1개, Anchor A 1개, Player→A live Rope 1줄, Node Safe Deck 1개
- 제외: Choice UI, P1/P2, Calibration Dummy, Anchor B/C, Exit Panel, Gate 05, Enemy, Wind, Damage Hazard, 전체 Route·Trajectory·Label

### 프롬프트 세트

```text
Use case: sketch-to-render
Input images: Image 1 is the immutable Node Camera structure guide. Image 2 is Sector 01 mood, palette and depth only.
Primary request: transform the locked structure into a polished gameplay screenshot-style Node Camera shot immediately after Foundation selection.
Immutable gameplay structure: exactly one long Node Safe Deck at the bottom, Maintenance Node N1 bottom-center on the deck, Anchor A upper-right, one approximately 48px Player between Node and A, and exactly one live cyan Rope from the Player's grapple hand to A. Preserve all left/right and up/down relations, relative width, count and empty space.
Node: practical corporate diagnostic and repair machine with repair arm, docking port, cable rack, compact screen, three equal low-brightness physical profile glyphs and one small amber emergency indicator; never a magical shrine.
Environment: quiet Navy·Steel·Charcoal calibration room, high-bit modern pixel art, low motion, low alarm intensity, non-collidable background structures kept low contrast.
Avoid: UI, text, labels, P1/P2, Dummy, B/C, Gate, Panel, Enemy, Wind, Hazard, extra platform, player, anchor or rope.

Use case: precise-object-edit
Primary request: reduce only the Player's full apparent body height to approximately 48px and reconnect the Rope start to the resized grapple hand.
Invariants: preserve Node Deck, N1, screen glyphs, Anchor A, Rope endpoint, background, lighting, palette, framing and every other object unchanged.
```

### 구조 사후 검수

- [x] Node Safe Deck만 착지 가능한 밝은 표면으로 보이며 화면 아래의 상대 폭을 유지한다.
- [x] Maintenance Node는 Deck 중앙, Anchor A는 오른쪽 위, Player는 두 대상 사이·A 왼쪽 아래에 있다.
- [x] Player 1명은 약 48px이며 Player와 A 사이에만 live Rope 한 줄이 있다.
- [x] Node는 산업용 진단·수리 장비이며 세 Profile이 낮은 밝기의 서로 다른 기호로 동등하게 보인다.
- [x] P1/P2·Dummy·B/C·Gate·Panel·Enemy·Wind·Hazard·선택 UI가 없다.
- [x] 비충돌 배경 구조는 Node Deck과 구분되며 추가 발판처럼 읽히지 않는다.
- [x] 출력이 `1672×941` RGB PNG다.
