# Sector 05 Far / Mid / Near Layer Split

## 상태

- 분류: 환경 배경 authoring layer split
- 상태: `REVIEW CANDIDATE`
- Runtime 상태: 연결하지 않음
- 캔버스: `1024×1536`, 세로 `2:3`

## 레이어 소유권

- Far: 중앙의 순수 후경 대기, 원거리 수직 도시, 중앙 원경 타워와 그 완전한 연결 구조만 소유한다.
- Mid: Near를 제외한 좌우 건물군 전체를 소유한다. 한 건물은 Far와 Mid에 나누지 않는다.
- Near: 화면 양끝에 붙은 가장 가까운 좌우 프레임 구조만 소유한다. 좌우 한 덩어리씩 최대 두 island다.
- Far는 전체 캔버스를 채운 불투명 hidden background이며 Mid 경계 뒤쪽까지 이어지는 apron을 제공한다.

## 입력과 제작 자료

- `sector-05-layer-master-user.png`: 이번 작업에서 제공된 편집 원본
- `sector-05-far-hidden-background-imagegen.png`: 좌우 구조 뒤를 복원한 hidden Far 원본
- `layer-boundaries.json`: 이번 이미지에서 새로 판단한 Mid/Near 경계와 검수 이동량
- `build-layers.ps1`: 원본 픽셀을 RGBA 레이어로 분리하고 합성 검수본을 만드는 스크립트
- `mask-mid.png`, `mask-near.png`: 이 이미지 전용 이진 알파 마스크
- `depth-map.png`: Far/Mid/Near 분류 확인용 grayscale map
- `HIDDEN-FAR-PROMPT.md`: hidden Far 생성에 사용한 프롬프트 원문

## 출력

- `../../export/layer-split-dense-city-transition/backdrop-far.png`
- `../../export/layer-split-dense-city-transition/backdrop-mid.png`
- `../../export/layer-split-dense-city-transition/backdrop-near.png`
- `../../preview/layer-split-dense-city-transition/neutral-composite.png`
- `../../preview/layer-split-dense-city-transition/parallax-left.png`
- `../../preview/layer-split-dense-city-transition/parallax-right.png`
- `../../preview/layer-split-dense-city-transition/parallax-preview-strip.png`

## 검수 결과

- 중립 합성은 입력 원본과 decoded pixel mismatch `0`이다.
- Mid와 Near 알파의 중복 pixel은 `0`이며 모든 레이어 알파는 `0` 또는 `255`만 사용한다.
- Mid/Near의 보이는 픽셀은 입력 원본과 mismatch `0`이다.
- Far와 좌우 이동 합성은 전 픽셀이 불투명하며 구멍이 없다.
- Mid `±6 px`, Near `±12 px` 정수 이동 검수에서 seam, 복제 건물, 분리된 측면 건물은 보이지 않는다.
- nearest sampling과 hard alpha를 사용하며 런타임 depth pixel 재계산을 전제하지 않는다.

## 제작 정보

- hidden Far: Codex 내장 ImageGen
- 레이어 분리와 검수 합성: PowerShell, System.Drawing
- 원본 권리: 사용자 제공 이미지의 프로젝트 사용 권리는 최종 통합 전에 확인 필요

## 주의

이 결과는 authoring 검토본이다. 통이미지를 collision 또는 Runtime 배경으로 바로 사용하지 않으며, 승인 뒤 환경 manifest 계약에 맞춘 import가 별도로 필요하다.
