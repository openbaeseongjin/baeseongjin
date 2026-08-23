# Sector 05 Continuity Control Vertical Master

## 상태

- 분류: 환경 배경 authoring master와 Runtime 승격 입력
- 상태: `RUNTIME INTEGRATION CANDIDATE`
- 캔버스: `1024×1536`, 세로 `2:3`
- Asset ID: `sector-05-continuity-control`

## 레이어

- Far: 중앙의 순수 후경 대기와 완전한 원거리 건축만 소유한다.
- Mid: Near를 제외한 좌우 건물군 전체를 소유한다.
- Near: 화면 양끝에 붙은 가장 가까운 좌우 프레임 구조만 소유한다.
- Far는 Mid/Near 이동 뒤를 전부 덮는 불투명 hidden background apron이다.

## 경로

- `source/layer-split-dense-city-transition/`: 이번 이미지의 원본, hidden Far, depth/mask, 재현 스크립트와 프롬프트
- `export/layer-split-dense-city-transition/`: Far/Mid/Near PNG
- `preview/layer-split-dense-city-transition/`: 중립·좌우 이동 합성 검수본
- Runtime package: `assets/runtime/environments/sector-05-continuity-control/`

## 제작·권리

- hidden Far: Codex 내장 ImageGen
- 레이어 정규화: PowerShell과 System.Drawing
- 사용자 제공 원본의 프로젝트 사용 권리는 최종 배포 전에 확인해야 한다.

## 비범위

이 배경은 Collision, Terrain geometry, Camera, Stage progression, Enemy, Rope와 Network authority를 변경하지 않는다.
