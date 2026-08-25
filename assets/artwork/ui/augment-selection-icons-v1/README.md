# Augment Selection Icons v1

증강 선택 카드에서 현재 Catalog 24종의 핵심 효과를 이미지 하나만으로 추론할 수 있게 만든 고가독성 UI 일러스트 패키지다. 저해상도 픽셀 표현보다 대상·방향·범위·상태 변화의 즉시 판독을 우선한다.

## 결과물

- `source/<augment-id>-imagegen.png`: 증강별 ImageGen 생성 원본 24장
- `source/PROMPTS.md`: 공통 시각 지시와 증강별 핵심 형태 기록
- `source/normalize-icons.ps1`: 배경 제거, 여백 통일, 96×96 export와 시작 Spell 파생 및 atlas 생성 스크립트
- `source/export-runtime-icons.ps1`: 96×96 export를 런타임용 48×48로 고품질 축소하는 스크립트
- `export/<stable-id>.png`: 선택 가능 증강 24장과 시작 Spell 파생본 2장의 96×96 투명 PNG
- `export/augment-selection-icons-v1.png`: Catalog 순서의 6×4, 576×384 투명 atlas
- `preview/augment-selection-icons-v1-review.png`: atlas와 같은 크기의 어두운 배경 검수본

## 시각 규격

- 제작 크기: 96×96 px, 실제 UI에서는 48×48 표시를 기준으로 정확히 2:1 축소 가능
- 배경: 투명 RGBA
- 팔레트: graphite/navy 기계 재질, cyan 에너지, orange/coral 충돌·열 강조, ice blue 빙결 강조
- 형태: 주 대상 하나와 기능 단서 하나를 큰 실루엣으로 배치
- 판독 기준: 색만으로 구분하지 않고 대상, 이동 방향, 효과 범위, 상태 변화가 형태로 보일 것
- 금지: 프레임, 배지, 글자, 숫자, 워터마크, 전체 장면, 작은 장식 위주의 차이

시작 Spell은 선택 가능 증강이 아니므로 별도 생성 원본을 추가하지 않는다. `energy-orb`는 `long-range-orb`의 구체 본체를, `physics-dash`는 `chain-dash`의 첫 단일 대시를 잘라 96×96로 재배치하며, 선택 가능 24종의 1:1 이미지는 변경하지 않는다.

## 제작 기록

- 제작일: 2026-08-25
- 생성 도구: OpenAI ImageGen
- 후처리 도구: PowerShell 7, `System.Drawing`
- 공식 분위기 기준: `assets/runtime/environments/sector-01-maintenance/backdrop-mid.png`, `assets/runtime/characters/player-main/locomotion.png`
- 원본 형식: 1254×1254 PNG 22장, 1536×1024 RGBA PNG 2장
- export 형식: 96×96 RGBA PNG
- 라이선스: OpenAI 생성 프로젝트 자산
- 상태: authoring candidate. Runtime UI에 공개 manifest/loader/validator가 생기기 전까지 runtime-ready로 간주하지 않는다.

## 검증

- `source/normalize-icons.ps1`: PASS — 선택 아이콘 24개, 시작 Spell 파생 아이콘 2개, 576×384 atlas와 검수본 생성
- 개별 크기·RGBA·투명 배경·빈 이미지 여부·atlas 크기 검사: PASS
- 576×384 실제 크기 검수본 육안 확인: PASS
