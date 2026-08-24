# Sector 04 Upper Residential platforms

## 목적과 상태

- Asset ID: `sector-04-upper-residential-platforms`
- Category: `environments`
- 역할: Sector 04의 기존 collision polygon과 one-way edge chain에 입히는 terrain skin
- 상태: Runtime-ready
- 기준점: collision polygon과 같은 world geometry를 사용하며 별도 sprite placement anchor를 만들지 않는다. 제작 개념의 기준은 보행면 `top-center`다.

## 시각 문법

- `32×32` 주거 amenity deck: 관리된 warm-gray stone, 닫힌 residential composite fascia, 연속형 recessed sage reveal
- `32×8` edge lip: solid platform의 두꺼운 courtyard curb와 하부 enclosed support를 표현한다.
- solid는 무거운 curb·닫힌 측면·넓은 지지 shell, one-way는 기존 얇은 authored polygon·중성 회녹색 3px chain stroke·가벼운 skybridge bracket으로 구분한다.
- Private courtyard·sky garden·amenity deck·residential skybridge의 깨끗하고 정상 작동하는 인상을 유지한다. 폐허·균열·grime·산업 grating·노출 배관은 사용하지 않는다.
- Desaturated garden green은 하부 inset에만 제한하고 Cyan Rope·Anchor 및 Red/Orange Telegraph 색은 사용하지 않는다.
- 모서리와 끝단은 Runtime이 같은 collision polygon edge를 회전·clip해 표현한다. PNG 외곽으로 새 geometry를 만들지 않는다.

## 파일

| 경로 | 형식·크기 | 역할 |
| --- | --- | --- |
| `source/sector-04-upper-residential-platforms-imagegen.png` | PNG `1536×1024` | V1 재질·실루엣 탐색 원본 |
| `source/sector-04-upper-residential-platforms-imagegen-v2-raw.png` | RGB PNG `1536×1024` | 그래픽 규칙 재감사 후 만든 V2 모듈 시트 원본 |
| `source/generation-prompt.md` | Markdown | 생성 프롬프트와 사용 범위 |
| `source/build_platform_atlas.py` | Python + Pillow | 정수 격자·팔레트·seam 재현 |
| `export/sector-04-upper-residential-platforms-module-sheet.png` | RGBA PNG `1536×1024` | V2 원본의 neutral checker 제거·20색 정규화 결과 |
| `export/terrain-fill.png` | RGBA PNG `32×32` | 반복 가능한 opaque terrain fill |
| `export/terrain-edge.png` | RGBA PNG `32×8` | collision edge lip |
| `preview/sector-04-upper-residential-platforms-review.png` | RGBA PNG `768×384` | 반복·1x/4x 판독 검토 |

## 출처와 라이선스

- 제작 도구: OpenAI built-in ImageGen + Pillow 정수 픽셀 정규화
- 외부 에셋 복사: 없음
- Sector 04 배경은 팔레트·명도·관리 상태를 확인하는 mood reference로만 사용했으며 source pixel이나 발판 배치를 Runtime PNG에 복사하지 않았다.
- 생성·정규화 결과: 이 프로젝트용 제작 자산

## Runtime 연결

- 대상 package: `assets/runtime/environments/sector-04-upper-residential/`
- `terrain-fill.png`, `terrain-edge.png`와 manifest atlas·palette만 교체한다.
- `AuthoredAreaEnvironmentCatalog`의 기존 `sector-04-01`~`sector-04-08` stable selection을 그대로 사용한다.
- Collision, one-way chain, surface kind, grappleable, Rope, Physics, Camera, Stage geometry와 Network authority는 비범위다.

## 재현과 검증

```powershell
python assets/artwork/environments/sector-04-upper-residential-platforms/source/build_platform_atlas.py
npm run validate:environment-assets -- assets/runtime/environments/sector-04-upper-residential
```

validator와 데스크톱·모바일 실제 화면 검증 근거는 `verification-ledger.md`에 기록한다.
