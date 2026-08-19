# 시나리오 아트 생성 규격

*CURRENT RUNTIME ALIGNMENT · REV 1.1*

이 문서는 시나리오용 `Scenario Art Reference`를 같은 게임의 실제 플레이 화면처럼 일관되게 만들기 위한 공통 기준이다. 생성 이미지는 레벨 좌표를 결정하는 설계도가 아니지만, 선택한 카메라 한 장면에 보이는 발판·장애물의 구조 관계를 현재 Runtime과 다르게 재배치해서도 안 된다. 이미지의 역할은 고정된 Gameplay 구조 위에서 분위기와 정보 위계를 검증하는 것이다.

## 1. 적용 범위와 산출물 구분

| 산출물 | 결정하는 것 | 결정하지 않는 것 |
| --- | --- | --- |
| `Scenario Art Reference` | 실제 플레이 카메라 한 장면의 분위기, 크기 관계, 명도·색·정보 위계, 보이는 Gameplay Geometry의 좌우·상하 관계와 상대 폭 | Collision 권위, 전체 경로, World 좌표 원본, Runtime 자산 |
| `Approved Blockout` | 전체 Stage Geometry, 좌표, 경로, LOS·Wind·Recovery·목표 배치 | 최종 조명, 재질, 캐릭터 디자인 |
| Runtime asset | 검증된 Sprite·Atlas·Manifest와 교체 가능한 표현 package | 시나리오의 진행·물리·완료 조건 |

`Scenario Art Reference`에 전체 경로 선과 좌표 도식을 섞지 않는다. 전체 맵을 설명해야 하면 별도의 `Approved Blockout`을 수정한다. 생성된 PNG를 통이미지 배경이나 충돌 지형으로 사용하지 않지만, 화면에 보이는 Collision Surface와 장애물의 구조 관계는 Approved Blockout을 따라야 한다.

## 2. 생성 전 자료 우선순위

이미지를 만들거나 수정하기 전에 다음 순서로 확인한다.

1. 해당 Stage `README.md`: 핵심 학습, Story, 등장·금지 요소
2. 해당 Stage `PRODUCTION-ALIGNMENT.md`: 현재 구현·미구현 상태, Camera, Asset 인계 계약
3. 현재 Area Catalog와 관련 Runtime 정의: 실제 `cameraZones` 또는 검증된 기본 Camera capture 계약, Stable ID, 오브젝트 수와 상태
4. 해당 Stage `Approved Blockout`: Geometry·좌표·경로 의미
5. 이 문서: 공통 화면·Player·Rope·색·출력 규격
6. Sector 공용 배경 레퍼런스: 환경의 분위기만 참고

문서와 Runtime이 다르면 이미지를 생성하지 않는다. 먼저 어느 쪽이 현재 결정인지 확인하고 같은 변경에서 정렬한다. `RETIRED`, `RETIRED PARTIAL`, `PENDING REGENERATION` 이미지는 새 이미지의 입력 레퍼런스로 사용하지 않는다.

## 3. 현재 Runtime과 맞춘 고정 기준

아래 값은 REV 1.0 작성 시점의 현재 구현을 설명한다. 생성 직전에는 반드시 원본 파일에서 다시 확인한다.

| 항목 | 현재 기준 | 확인 위치 |
| --- | --- | --- |
| Player 기본 월드 출력 | `48×48` | `assets/runtime/characters/README.md`, Player manifest |
| Player 제작 범위 | 기본 `32×32~48×48`, 동작 확장 `48×48~64×64` | `docs/pixel-graphics-design-guide.md` |
| Grapple Landmark | Cyan `#22d3ee`, 현재 mock radius `15` | `WorldObjectPresentationCatalog.js` |
| Rope 최대 부착 거리 | `400` world unit | `src/game/config.js` |
| 기본 Swing Impulse | `780` | `src/game/config.js` |
| Player 강조색 | 긴 Red Scarf `#fb4b5a` 계열 | Stage 문서와 현재 Player 방향 |
| Gate Panel·Terminal | Amber `#fbbf24` 계열 | `WorldObjectPresentationCatalog.js` |
| Augment Node | 현재 mock Purple `#c084fc` | `WorldObjectPresentationCatalog.js` |

`24×24` Player starter frame은 렌더 연결용 개발 mock이지 정식 캐릭터의 화면 크기 기준이 아니다. 그림 속 Player의 몸 높이는 선택한 데스크톱 Camera Zone의 `48 × desktopZoom`에 가깝게 보이도록 하고 `±15%` 안에서만 구도상 조정한다. Stage마다 Player를 두 배로 키우거나 복장·신체 비율을 새로 만들지 않는다.

## 4. 공통 시각 언어

### Player

- 한 명만 표시한다.
- 작고 민첩한 수직 폐허 탐사자 실루엣을 유지한다.
- 어두운 몸체, 비대칭 Rope Arm, 길게 반응하는 Red Scarf를 고정 인식점으로 사용한다.
- Rope Attach·Swing·Release 중 어떤 순간인지 자세만으로 읽혀야 한다.
- Stage마다 Helmet, Coat, 체형, 장비 위치를 새로 해석하지 않는다.
- 정식 Character Master가 승인되기 전에는 이 고정 설명과 Runtime 출력 크기를 우선한다. 직전 Stage 생성 이미지를 연쇄적으로 새 캐릭터 원본으로 사용하지 않는다.

### Environment

- Sector 01은 Navy·Charcoal 산업 정비 시설, Cyan 설비 보조광, 드문 Amber 경고등을 사용한다.
- 전경은 거의 검은 구조물, 중경은 플레이 공간, 원경은 푸른 안개로 깊이를 분리한다.
- 중앙에는 Rope 궤적과 다음 행동을 읽을 여백을 둔다.
- 배경 Cyan은 Rope·Anchor보다 어둡고 채도가 낮아야 한다.
- 배경 Red·Orange는 Telegraph와 Projectile의 방향을 방해하지 않는다.
- Sector가 바뀌면 해당 Sector README의 환경 언어를 사용하되 Player·Rope 가독성 규칙은 유지한다.

### Gameplay 색 우선순위

1. 현재 Player와 Red Scarf
2. 현재 연결된 Cyan Rope와 Attach Anchor
3. 다음 행동에 필요한 Anchor·Gate·Panel·Recovery
4. 해당 Stage의 Enemy Telegraph·Wind·Augment 상태
5. 배경 조명과 장식

Purple·Amber·Red를 장식용으로 넓게 퍼뜨리지 않는다. 각 색은 실제 Gameplay 역할이 있는 오브젝트에만 집중한다.

## 5. Camera와 화면 구성 계약

- 기본 문서 출력은 `1672×941`, landscape, RGB/sRGB PNG다.
- Side-on 2D orthographic gameplay camera를 사용하고 원근 왜곡·3/4 시점·영화식 클로즈업을 금지한다.
- Stage 전체가 아니라 하나의 대표 Gameplay Camera Shot을 선택한다.
- **Mode A — explicit Runtime `cameraZone`:** Zone ID, local Y 범위, desktop/mobile zoom, player screen ratio를 기록한다.
- **Mode B — verified default-camera capture:** custom gameplay Camera를 추가하지 않고 Area ID, local Y 범위, 기본 desktop/mobile zoom, 세로 player ratio/framing target, Stable ID와 보이는 Geometry를 기록한다.
- Mode B를 위해 Gameplay Runtime에 가짜 `cameraZone`을 추가하지 않는다. 두 Mode 모두 Approved Blockout·정확한 visible object count와 Runtime capture 근거가 필요하다.
- Player의 화면상 크기는 `48 × desktopZoom`을 기준으로 한다.
- 실제 Camera Zone에서 보여야 하는 다음 Anchor·Recovery·Gate·위협만 프레임에 포함한다.
- 전경 구조물이 Player, 현재 Anchor, 다음 의사결정 지점을 가리지 않아야 한다.
- 모바일 화면 검수는 별도 Runtime 캡처에서 수행한다. 문서용 가로 이미지를 세로 모바일 화면인 것처럼 압축하지 않는다.

### Camera-space Geometry 고정 계약

- 생성 전에 선택한 Camera Zone에서 보이는 Gameplay Surface와 장애물만 추린 구조 가이드를 만든다.
- 구조 가이드는 Area Catalog와 Approved Blockout의 좌우·상하 순서, 상대 폭, 겹침과 빈 공간을 그대로 투영한다. 새 좌표의 권위 자료가 아니라 기존 좌표를 화면으로 옮긴 검수 입력이다.
- Platform, Recovery, Safe Deck, Wall, Cover, Overhang, Crossbeam과 Gate 바닥은 구도를 위해 이동·확대·축소·병합·분할하지 않는다.
- Player와 움직이는 위협의 순간 위치만 선택한 Gameplay 상태 안에서 달라질 수 있다.
- 비충돌 배경 Catwalk·Pipe·Frame은 Gameplay Surface와 같은 밝은 Edge나 착지 가능한 상면을 갖지 않게 한다.
- 생성 후에는 픽셀 단위 World 좌표 복원이 아니라 `좌우 순서`, `상하 순서`, `상대 폭`, `개수`, `기능 실루엣` 다섯 항목을 승인 Blockout과 대조한다.

## 6. Rope와 Anchor 의미 계약

- 한 프레임에는 **현재 Player와 현재 Attach Anchor를 잇는 살아 있는 Rope 한 줄만** 표시한다.
- 다른 Anchor는 빛나는 후보 오브젝트로만 보이고 서로 연결되지 않는다.
- Release 순간을 표현하면 Rope가 없거나 사라지는 한 줄만 허용한다.
- Anchor 전체를 잇는 경로 Polyline, 삼각형, 네트워크 선, 화살표는 `Approved Blockout`에서만 사용한다.
- Rope는 Player의 손 또는 Rope 장치에서 시작하고 Anchor의 중심에 끝난다.
- Rope와 Anchor는 같은 Cyan 계열을 쓰되 Anchor 외곽선과 Rope 선이 배경에서 분리돼야 한다.
- Anchor 개수는 Stage 문서나 현재 Camera Zone에서 요구한 정확한 수를 지킨다. 구도를 채우기 위한 추가 Anchor를 만들지 않는다.

## 7. 생성 프롬프트 작성 규격

프롬프트는 공통 불변 블록과 Stage 변수 블록을 분리한다. 아래 양식을 복사한 뒤 꺾쇠 항목을 현재 Runtime 값으로 교체한다.

```text
USE CASE
stylized-concept

ASSET TYPE
2D pixel-art Scenario Art Reference, one representative desktop gameplay camera shot

STAGE SOURCE OF TRUTH
Stage: <sector-stage-id and name>
Runtime area ID: <area-id>
Camera zone: <zone-id, local Y range, desktop zoom, vertical player ratio>
Stage role: <one sentence>

REFERENCE ROLES
- Sector shared image: environment mood, palette and depth only
- Approved Blockout or camera-space structure guide: immutable left/right and up/down placement, relative width and visible geometry count; not visual style
- Runtime/Production Alignment: exact object count, state and forbidden elements
- Do not use retired or pending-regeneration images as references

FIXED VISUAL LANGUAGE
- side-on orthographic 2D gameplay view, 1672×941 landscape
- high-bit pixel art with hard pixel edges, no painterly blur
- one small agile player, dark silhouette, asymmetric rope arm, long red scarf
- player apparent body height near 48 × <desktop zoom> pixels, tolerance ±15%
- dark foreground framing, readable midground gameplay, blue-haze background depth
- Rope and Anchor electric cyan; sparse amber machinery lights; red only for scarf or real danger telegraph

EXACT GAMEPLAY CONTENT
- exactly one player
- player action/state: <attach, swing, release, run, observe, interact>
- exactly <N> visible grapple anchors
- exactly one live cyan rope segment from player hand/device to <current anchor ID>
- next decision point: <anchor, recovery, cover, gate, panel, node>
- exact Stage objects and states: <list with counts>
- visible Gameplay Geometry: <surface/obstacle IDs, left/right and up/down relation, relative width>
- implemented/pending distinction: <what may appear and what must not appear>

FORBIDDEN
- no full-stage map, route polyline, triangle or anchor network
- no labels, coordinates, editor guides or non-diegetic UI
- no extra player, enemy, anchor, weapon, hazard or story object
- no invented costume, oversized player or changed body proportions
- no retired Stage elements
- do not move, enlarge, merge or split visible Gameplay Geometry for composition
- no invented platform, cover, wall or obstacle
- final art is not authoritative collision data
```

## 8. 생성 전 확인표

- [ ] Stage README와 Production Alignment를 끝까지 읽었다.
- [ ] 현재 Area Catalog의 Area ID·Camera Zone·Stable ID를 확인했다.
- [ ] Runtime과 문서의 구현·미구현 상태가 일치한다.
- [ ] 대표 Camera Zone 하나를 선택했다.
- [ ] Camera Zone에 보이는 발판·장애물의 구조 가이드를 Runtime과 Approved Blockout에서 만들었다.
- [ ] 구조 가이드의 좌우·상하 순서, 상대 폭과 개수를 프롬프트에 적었다.
- [ ] 화면에 보일 Player·Anchor·Enemy·Node·Gate·Panel의 정확한 수를 적었다.
- [ ] 현재 Rope 상태와 연결 대상 Anchor를 하나 정했다.
- [ ] Stage 금지 요소를 프롬프트에 명시했다.
- [ ] Sector 공용 이미지는 환경 분위기 용도로만 지정했다.
- [ ] `RETIRED`와 `PENDING REGENERATION` 이미지를 입력에서 제외했다.
- [ ] 출력 경로와 새 상태를 정했다.

하나라도 확인할 수 없으면 생성을 멈추고 Stage 문서 또는 Runtime 정렬부터 진행한다.

## 9. 생성 후 검수표

- [ ] 같은 Player 실루엣·몸 비율·복장·Red Scarf로 보인다.
- [ ] Player 크기가 선택한 Camera Zoom과 크게 어긋나지 않는다.
- [ ] 살아 있는 Rope가 정확히 한 줄이며 Player와 현재 Anchor만 잇는다.
- [ ] Anchor·Enemy·Node 등 오브젝트 수와 상태가 프롬프트와 같다.
- [ ] 다음 행동 지점이 배경보다 먼저 읽힌다.
- [ ] 발판·장애물의 좌우·상하 순서, 상대 폭과 개수가 구조 가이드와 같다.
- [ ] 충돌 Geometry와 비충돌 배경 구조가 외형과 명도로 구분된다.
- [ ] Sector의 팔레트·구조·깊이가 공용 환경 기준과 같다.
- [ ] 전체 경로 선·라벨·좌표·편집기 표식이 없다.
- [ ] 미구현 기능이 이미 완성된 것처럼 보이지 않는다.
- [ ] 이전 Stage 이미지의 오류를 연쇄적으로 복제하지 않았다.
- [ ] 이미지가 Approved Blockout이나 Runtime asset으로 오해되지 않게 상태가 문서에 기록됐다.

## 10. 파일명·상태·기록

- Stage 폴더의 `images/`에 `NN_scenario_art_reference.png`로 저장한다.
- 기존 파일을 덮어쓰기 전에 Stage 문서와 이미지 상태표에서 대체 관계를 기록한다.
- 허용 상태는 다음과 같다.
  - `APPROVED ART REFERENCE`: 모든 사전·사후 검수를 통과한 현재 기준
  - `TEMPORARY ART REFERENCE`: 일부 분위기 참고만 가능하고 알려진 불일치가 있음
  - `PENDING REGENERATION`: 새 규격으로 교체 예정이며 생성 입력으로 사용 금지
  - `RETIRED`: 현재 구현·아트 제작·검수에서 사용 금지
  - `APPROVED BLOCKOUT`: 좌표·Geometry 기준이며 Art Reference가 아님
- Stage README 또는 `images/README.md`에 생성 목적, 사용한 Camera Zone, 허용 범위, 알려진 불일치를 기록한다.
- 프롬프트와 검수 결과는 같은 Stage 문서 변경에 남긴다. 생성 도구의 대화 기록만을 유일한 근거로 삼지 않는다.
- 프로젝트용으로 승인한 이미지는 생성 도구의 기본 폴더나 대화 미리보기에만 남기지 않는다. Stage `images/`의 PNG, 생성 기록과 상태 변경을 같은 Git 커밋과 Pull Request로 올리고 `main` 병합까지 완료한다.

## 11. 현재 이미지 전환 판정

REV 1.0 작성 시점에는 이 표가 Sector 01의 1-1~1-4만 다뤘다. Sector 01 나머지 Stage와 Sector 02·03 전체를 §10 상태값 기준으로 전수 확인해 아래에 반영한다(확인일 `2026-08-15 KST`).

### Sector 01

| 자료 | 현재 판정 | 다음 조치 |
| --- | --- | --- |
| Sector 01 공용 배경 | `APPROVED MOOD REFERENCE` | 환경 분위기에만 계속 사용 |
| 1-1 `04_scenario_art_reference.png` | `RETIRED / STRUCTURE MISMATCH` | R3 상대 폭과 P3 배치가 Blockout과 달라 새 구조 정합 이미지로 교체 |
| 1-1 `05_scenario_art_reference.png` | `APPROVED ART REFERENCE` | C04의 P3 위·짧은 R3 왼쪽 아래·C 오른쪽 아래 구조 기준 |
| 1-2 `05_scenario_art_reference.png` | `RETIRED / STRUCTURE MISMATCH` | P1이 A보다 아래에 보여 C02 Blockout의 수직 관계와 달라 교체 |
| 1-2 `06_scenario_art_reference.png` | `APPROVED ART REFERENCE` | C02의 B 위·P1 중간·A 아래 구조와 한 줄 B live Rope 기준 |
| 1-3 `03_scenario_art_reference.png` | `RETIRED / ROPE-ROUTE MISMATCH` | live Rope와 전체 경로처럼 보이는 선이 함께 있어 새 제작 입력으로 사용 금지 |
| 1-3 `05_scenario_art_reference.png` | `APPROVED ART REFERENCE` | Route Choice의 D 위·C 왼쪽 중단·B 아래, Safe Ledge·R1·두 Cover·오른쪽 벽 Sentry와 한 줄 C live Rope 기준 |
| 1-4 `01_scenario_art_reference.png` | `RETIRED / PLAYER-ROPE MISMATCH` | 큰 Player와 A/B/C 삼각 연결이 실제 Gameplay Camera·Rope 의미와 달라 교체 |
| 1-4 `03_scenario_art_reference.png` | `APPROVED ART REFERENCE` | Node Camera의 Node Deck 아래·N1 중앙·A 오른쪽 위와 한 줄 A live Rope 기준 |
| 1-5 ~ 1-8 | `NEEDED` | `images/` 폴더 자체가 없음. Approved Blockout도 아직 없어([1-5](./1/1-5/PRODUCTION-ALIGNMENT.md)~[1-8](./1/1-8/PRODUCTION-ALIGNMENT.md) 판정 참고) Art Reference보다 Blockout 제작이 선행 과제다 |

1-1~1-4의 구조 정합 이미지 교체를 완료했다. 다음은 1-5~1-8의 Approved Blockout 제작이며, 각 Stage Art Reference는 Runtime·Camera와 Blockout 확정 뒤 만든다.

### Sector 02

| 자료 | 현재 판정 | 다음 조치 |
| --- | --- | --- |
| Sector 02 공용 배경(`sector-02-background-reference.png`) | `TEMPORARY MOOD REFERENCE` | Sector 01처럼 `APPROVED MOOD REFERENCE`로 승격하려면 원본 출처·사용권 확인이 먼저([2/README.md](./2/README.md) §28 자산 상태와 동일한 유보 상태) |
| 2-1 ~ 2-8 | `NEEDED` | 8개 Stage 전부 `images/` 폴더가 없다. Approved Blockout도 없어([2-1](./2/2-1/PRODUCTION-ALIGNMENT.md)~[2-8](./2/2-8/PRODUCTION-ALIGNMENT.md) 판정 참고) Art Reference보다 Blockout 제작이 선행 과제다 |

### Sector 03

| 자료 | 현재 판정 | 다음 조치 |
| --- | --- | --- |
| Sector 03 공용 배경 | `NEEDED` | 배경 레퍼런스 이미지 자체가 아직 없다 |
| 3-1 ~ 3-8 | `BLOCKOUT REQUIRED` | Runtime Area·Stable ID·Story binding과 의도적 기본 Camera 사용은 구현됐다. 신규 Art Reference 전에 각 Stage Approved Blockout, 대표 Camera Shot과 exact visible object count를 확정한다 |

### 우선순위 요약

Blockout·Runtime이 있는 Sector 01 1-1~1-4의 구조 정합 재생성은 완료됐다. 다음은 Sector 01 1-5~1-8과 Sector 02 전체의 Approved Blockout 제작이며, Art Reference는 그 이후다. Sector 03도 Runtime 부재가 아니라 Stage별 Approved Blockout 미확정 때문에 생성 대기 상태다.

## 12. 리소스 절약 원칙

- Stage마다 새 화풍을 탐색하지 않고 공통 불변 프롬프트를 재사용한다.
- 먼저 저해상도 또는 1장 생성으로 구도·수·Rope 의미를 확인하고, 통과한 경우에만 최종 해상도를 만든다.
- 실패 원인을 한 번에 하나씩 수정한다. 전체 프롬프트를 매번 새로 쓰지 않는다.
- 공용 환경 레퍼런스와 고정 Player 설명만 유지하고, 직전 생성 이미지를 계속 추가해 입력을 비대하게 만들지 않는다.
- Approved Blockout과 Runtime에서 구조 가이드를 한 번 만든 뒤 생성 입력으로 재사용한다. ImageGen에는 발판·장애물 재배치가 아니라 고정 구조 위 재질·조명·배경 표현만 맡긴다.
