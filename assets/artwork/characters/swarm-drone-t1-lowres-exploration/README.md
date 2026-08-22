# Swarm Drone T1 Low-resolution Exploration

- Asset ID: `swarm-drone-t1-lowres-exploration`
- Category: `characters`
- Status: `RUNTIME-INTEGRATED / DEBUG VERIFIED`
- Purpose: Sector 01 군집 드론 단일 개체의 외형과 접촉 공격 동작 제작
- Intended logical cell: transparent `24x24` to `32x32`
- Intended opaque bounds: approximately `15x15` to `23x23` logical pixels
- Intended game output: 기존 `56x56` 일반 드론보다 작게 보이는 정수 배율 출력
- Facing: 후보 시트 기준 오른쪽 돌진 방향
- Gameplay states represented by the identity: `swarm-chase`, `swarm-recoil`
- Event cue candidate: contact body-check between chase and recoil
- Source tool: Codex built-in ImageGen, 2026-08-22
- Source format: generated PNG concept/animation sheets followed by background extraction and tool-neutral atlas normalization
- External references: none; the repository's own Support family scale preview was used only as a family-style reference
- License: original project authoring source under the repository license

## Role and visual contract

최신 main의 군집 드론은 투사체를 사용하지 않는다. 같은 `swarmGroupId`의 살아 있는 개체들이 중심에서 `72px` 이상 떨어지면 응집 방향을 섞으면서 Player를 `210` 속도로 지속 추격한다. Player와 실제 body collision이 발생하면 `14` 접촉 피해를 한 번 발생시키고 충돌 반대 방향으로 `360` 속도, `0.45초` 동안 튕겨난 뒤 다시 추격한다. 따라서 한 개체 안에 여러 드론을 그리지 않고, 작은 중앙 질량과 전방으로 모이는 fin/prong 실루엣으로 군집성·기동성·접촉 공격을 전달한다.

보라색 계열은 현재 `swarm-chase`, `swarm-recoil` particle과 맞추는 제한적 sensor/core 강조색이다. 역할 구분은 색만이 아니라 기존 Pursuit의 windup·단발 dash 실루엣과 다른 분할 fin, 열린 gap, compact core 외곽으로 먼저 읽혀야 한다. 대형 포신, 방패, green support core, red patrol visor는 제외한다.

## Files

- `source/imagegen-swarm-drone-sheet-raw.png`: 첫 ImageGen 결과, `1254x1254`, 불투명 checkerboard가 포함된 보존 원본
- `source/imagegen-swarm-drone-sheet.png`: 배경 추출 편집 결과, `1536x1024` RGBA, 3x3 선택 시트
- `source/imagegen-swarm-drone-animation-raw.png`: 4x3 동작 시트 첫 결과, `1448x1086`, 불투명 checkerboard가 포함된 보존 원본
- `source/imagegen-swarm-drone-animation-aligned.png`: core 정렬을 요청한 ImageGen 수정 원본, `1447x1087` RGBA
- `source/generation-prompt.md`: 생성·배경 추출 prompt와 정규화 조건
- `source/normalize-runtime-assets.py`: 단독 이미지·재생 preview·32px Runtime atlas를 재생성하는 결정적 Pillow 정규화 도구
- `export/swarm-drone-approved-still.png`: 승인 외형의 첫 `swarm-chase` frame을 분리한 `362x362` RGBA 단독 이미지
- `export/swarm-drone-contact-animation-atlas-v3.png`: 최종 authoring atlas, `1448x1086` RGBA, 4x3 grid, cell `362x362`, core anchor `(181,181)`
- `preview/swarm-drone-concept-sheet.png`: 앱에서 형상을 바로 비교하기 위한 불투명 checkerboard 미리보기
- `preview/swarm-drone-contact-animation-atlas-v3.png`: 최종 투명 atlas 검토 미리보기
- `preview/swarm-drone-contact-animation.webp`: 12개 authoring frame과 제안 timing을 그대로 재생하는 lossless WebP

## Candidate map

번호는 왼쪽 위부터 행 우선으로 `01`~`09`다. 현재 애니메이션 atlas는 중간 오른쪽의 `06` 외형을 그대로 사용한다. 중앙 core와 갈라진 위·아래 plate가 군집 개체와 몸체 접촉을 함께 읽히게 하며, Patrol·Support·Pursuit와 실루엣 중복이 가장 적다. 나머지 후보는 실루엣 탐색 이력으로만 보존한다.

## Animation atlas

최종 `v3` atlas는 열 4개, 행 3개의 동일한 `362x362` authoring cell로 구성한다. 모든 프레임은 오른쪽을 향하며 보라색 core의 local anchor를 `(181,181)`로 맞춘다.

| Row | Frames | Meaning | Authoring timing proposal |
| --- | --- | --- | --- |
| 0 | 0~3 | `swarm-chase`: 핀을 벌린 추격 loop와 작은 상하 진동 | `90 / 90 / 90 / 90ms`, loop |
| 1 | 0~3 | contact cue: 핀 수축 → 몸체 압축 → 짧은 우향 body-check | `45 / 55 / 70 / 90ms`, non-loop |
| 2 | 0~3 | `swarm-recoil`: 좌향 반동 → 핀 전개 제동 → 추격 자세 복귀 | `100 / 110 / 120 / 120ms`, non-loop |

contact row는 별도 gameplay presentation state가 아니라 실제 접촉 순간을 강조하는 authoring cue다. Runtime은 새 gameplay state를 만들지 않고 기존 `swarm-recoil` clip의 앞부분에 이 cue를 포함한다. 전체 clip을 현재 gameplay recoil `0.45초` 안에 맞추되 manifest timing은 gameplay 상태 전이를 소유하지 않는다.

## Runtime normalization

`source/normalize-runtime-assets.py`는 Pillow `12.3.0`으로 각 authoring cell에서 외곽 동작 전체가 들어오는 공통 `268x268` 영역을 잘라 nearest-neighbor로 `32x32`에 축소한다. 원본 core `(181,181)`은 Runtime cell `(13,16)`에 대응하며 manifest anchor `0.40625, 0.5`가 이 지점을 gameplay 위치에 맞춘다. Alpha는 `96`을 기준으로 hard-alpha 처리하고 모든 frame에 같은 16색 Sector 01 팔레트를 적용한다. 결과 `assets/runtime/characters/sector-01-enemies/swarm-motion.png`는 `128x96` RGBA, 4x3 grid다.

Runtime `swarm-chase`는 첫 행 4 frame을 `90ms` loop로 사용한다. 접촉은 예측 가능한 사전 상태가 아니므로 별도 gameplay state를 만들지 않는다. 실제 body contact와 동시에 시작되는 기존 `swarm-recoil` 표현 clip 안에서 둘째 행의 압축·body-check 4 frame과 셋째 행의 반동 4 frame을 합계 `450ms`로 재생한다. 이는 기존 gameplay recoil `0.45초`에 맞춘 표현 정규화이며 행동 FSM·접촉 피해·collider·health·physics·network authority를 변경하지 않는다.

## Validation and next step

최종 `v3` authoring export는 RGBA이며 실제 alpha 범위 `0~255`, atlas `1448x1086`, 셀 `362x362`, 정확한 4x3 분할, 12개 frame의 공통 이동 기준점 `(181,181)`과 frame별 투명 padding을 확인했다. 독립적인 색상 중심 검사에서도 보라색 core 중심이 기준점 반경 `3px` 안에 유지된다. Node.js `v24.19.0`과 Sharp `0.35.3` 정규화는 sprite 색·크기·형상을 변경하지 않았다. 이후 Pillow `12.3.0` 정규화로 실제 `32x32` logical cell의 hard-alpha Runtime atlas를 만들었고 `1x`·게임 정수 배율을 디버그 더미에서 검수했다.

Runtime atlas와 enemy manifest 등록, 기존 디버그 더미의 package 선택은 이번 통합 범위에 포함한다. Renderer 구조, gameplay timing, collider, hitbox, damage, health, physics와 network authority는 변경하지 않는다.

## Validation ledger

- Owner: Codex
- Base SHA: `650a5ef5f79ad0a655a989b6ff38da0ebc4f6fd8`
- Pre-ledger diff fingerprint: `5190f3ce0b37e8c20ae876cb28c7e517830a6b76`
- `npm run check`: PASS — syntax 401, AREA-SPEC 16, generated output 21, Boss Stage, Direction 2/33, scenario integration 48
- `npm run format:check`: PASS
- `git diff --check` and staged diff check: PASS
- Deterministic normalization: PASS — standalone PNG, lossless 12-frame WebP and Runtime atlas SHA-256 reproduced exactly
- Runtime image check: PASS — `128x96` RGBA, `32x32` 4x3 cells, 12 non-empty hard-alpha frames, transparent border padding, common core anchor `(13,16)`
- `npm run validate:enemy-sprite-assets -- assets/runtime/characters/sector-01-enemies`: PASS — 8 atlases, 7 enemies, 48 states
- Browser debug dummy: PASS — `sector-01-enemies`, fixed `swarm-chase`, fixed `swarm-recoil`, automatic cycle at `1280x720` and `844x390`, no browser warnings or errors
- Automated test suite: not run; the user requested asset integration and interactive dummy verification, and repository policy does not add or run automatic tests without an explicit request
