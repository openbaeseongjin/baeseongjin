# Sector 03 Central Exchange platforms

## 목적과 상태

- Asset ID: `sector-03-central-exchange-platforms`
- Category: `environments`
- 역할: Sector 03의 기존 collision polygon과 one-way edge chain에 입히는 terrain skin
- 상태: Runtime-ready
- 기준점: collision polygon과 같은 world geometry를 사용하며 별도 sprite placement anchor를 만들지 않는다. 제작 개념의 기준은 보행면 `top-center`다.

## 시각 문법

- `32×32` 대형 deck 모듈: Graphite 외피, Cool Concrete 보행 slab, 정돈된 service recess
- `32×8` edge lip: solid platform의 두꺼운 composite nose와 Muted Gold service frame을 표현한다.
- solid는 무거운 4px nose와 하부 service frame, one-way는 기존 얇은 authored polygon과 중성 회색 3px chain stroke로 구분한다.
- 밝고 정돈된 환승·상업 시설이지만 공공 인프라의 사용감만 남기며 고급 쇼핑몰의 광택·장식·브랜딩은 사용하지 않는다.
- Cyan Rope·Anchor와 Red/Orange Telegraph 색은 사용하지 않고 Muted Gold는 하부 구조에만 제한한다.
- 모서리와 끝단은 Runtime이 같은 collision polygon edge를 회전·clip해 표현한다. PNG 외곽으로 새 geometry를 만들지 않는다.

## 파일

| 경로 | 형식·크기 | 역할 |
| --- | --- | --- |
| `source/sector-03-central-exchange-platforms-imagegen.png` | PNG `1536×1024` | 재질·실루엣 탐색용 ImageGen 원본 |
| `source/generation-prompt.md` | Markdown | 생성 프롬프트와 사용 범위 |
| `source/build_platform_atlas.py` | Python + Pillow | 정수 격자·팔레트·seam 재현 |
| `export/terrain-fill.png` | RGBA PNG `32×32` | 반복 가능한 opaque terrain fill |
| `export/terrain-edge.png` | RGBA PNG `32×8` | collision edge lip |
| `preview/sector-03-central-exchange-platforms-review.png` | RGBA PNG `768×384` | 반복·1x/4x 판독 검토 |

## 출처와 라이선스

- 제작 도구: OpenAI built-in ImageGen + Pillow 정수 픽셀 정규화
- 외부 에셋 복사: 없음
- Sector 03 배경은 팔레트·명도 관계를 확인하는 mood reference로만 사용했으며 source pixel이나 발판 배치를 Runtime PNG에 복사하지 않았다.
- 생성·정규화 결과: 이 프로젝트용 제작 자산

## Runtime 연결

- 대상 package: `assets/runtime/environments/sector-03-central-exchange/`
- `terrain-fill.png`, `terrain-edge.png`와 manifest atlas·palette만 교체한다.
- `AuthoredAreaEnvironmentCatalog`의 기존 `sector-03-01`~`sector-03-08` stable selection을 그대로 사용한다.
- Collision, one-way chain, surface kind, grappleable, Rope, Physics, Camera, Stage geometry와 Network authority는 비범위다.

## 재현과 검증

```powershell
python assets/artwork/environments/sector-03-central-exchange-platforms/source/build_platform_atlas.py
npm run validate:environment-assets -- assets/runtime/environments/sector-03-central-exchange
```

validator와 데스크톱·모바일 실제 화면 검증 근거는 `verification-ledger.md`에 기록한다.
