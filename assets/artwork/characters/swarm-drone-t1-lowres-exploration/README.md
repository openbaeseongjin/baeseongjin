# Swarm Drone T1 Low-resolution Exploration

- Asset ID: `swarm-drone-t1-lowres-exploration`
- Category: `characters`
- Status: `AUTHORING ANIMATION CANDIDATE / NOT RUNTIME-INTEGRATED`
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
- `export/swarm-drone-contact-animation-atlas-v3.png`: 최종 authoring atlas, `1448x1086` RGBA, 4x3 grid, cell `362x362`, core anchor `(181,181)`
- `preview/swarm-drone-concept-sheet.png`: 앱에서 형상을 바로 비교하기 위한 불투명 checkerboard 미리보기
- `preview/swarm-drone-contact-animation-atlas-v3.png`: 최종 투명 atlas 검토 미리보기

## Candidate map

번호는 왼쪽 위부터 행 우선으로 `01`~`09`다. 현재 애니메이션 atlas는 중간 오른쪽의 `06` 외형을 그대로 사용한다. 중앙 core와 갈라진 위·아래 plate가 군집 개체와 몸체 접촉을 함께 읽히게 하며, Patrol·Support·Pursuit와 실루엣 중복이 가장 적다. 나머지 후보는 실루엣 탐색 이력으로만 보존한다.

## Animation atlas

최종 `v3` atlas는 열 4개, 행 3개의 동일한 `362x362` authoring cell로 구성한다. 모든 프레임은 오른쪽을 향하며 보라색 core의 local anchor를 `(181,181)`로 맞춘다.

| Row | Frames | Meaning | Authoring timing proposal |
| --- | --- | --- | --- |
| 0 | 0~3 | `swarm-chase`: 핀을 벌린 추격 loop와 작은 상하 진동 | `90 / 90 / 90 / 90ms`, loop |
| 1 | 0~3 | contact cue: 핀 수축 → 몸체 압축 → 짧은 우향 body-check | `45 / 55 / 70 / 90ms`, non-loop |
| 2 | 0~3 | `swarm-recoil`: 좌향 반동 → 핀 전개 제동 → 추격 자세 복귀 | `100 / 110 / 120 / 120ms`, non-loop |

contact row는 현재 gameplay presentation state가 아니라 `SWARM_CONTACT` 사건에 붙일 수 있는 authoring cue 후보다. Runtime 통합 시 새 gameplay state를 만들지 않고 기존 사건을 적 ID별 표현 controller에 전달하는 방식으로 검토한다. recoil timing 합계 `450ms`는 현재 gameplay recoil `0.45초`와 맞지만 manifest timing이 gameplay 상태 전이를 소유하지 않는다.

## Validation and next step

현재 결과는 동작 검토용 고해상도 authoring source다. 최종 `v3` export는 RGBA이며 실제 alpha 범위 `0~255`, atlas `1448x1086`, 셀 `362x362`, 정확한 4x3 분할, 12개 frame의 공통 이동 기준점 `(181,181)`과 frame별 투명 padding을 확인했다. 독립적인 색상 중심 검사에서도 보라색 core 중심이 기준점 반경 `3px` 안에 유지된다. 정규화는 Node.js `v24.19.0`과 Sharp `0.35.3`으로 canvas 여백을 `1448x1086`에 맞추고 각 cell을 평행 이동했으며 sprite 색·크기·형상은 변경하지 않았다. 저해상도 runtime validator 대상은 아니며, Runtime 통합 전에는 같은 외형을 실제 `24x24`~`32x32` logical cell의 hard-alpha pixel art로 정규화하고 `1x`/정수 배율 family-scale preview를 별도로 검수해야 한다.

Runtime manifest, atlas, renderer, gameplay timing, collider, hitbox, damage, physics와 network authority는 이번 범위에 포함하지 않는다.

## Validation ledger

- Owner: Codex
- Base SHA: `28f684d42e695395cb2e975e457ac7e1c809279a`
- Pre-ledger diff fingerprint: `9b7806459b9ae1d0a20409c02200a1d67d6a8b8c`
- `npm run check`: PASS — syntax 401, AREA-SPEC 16, generated output 21, Boss Stage, Direction 2/33, scenario integration 48
- `npm run format:check`: PASS
- `git diff --check`: PASS, existing CRLF conversion warnings only
- Manual image check: PASS — transparent RGBA, 4x3 cells, 12 non-empty frames, meaningful border alpha `0`, core color centroid within `3px` of `(181,181)`
- Runtime enemy validator and browser gameplay check: not applicable to this authoring-only output; no runtime package or renderer changed
