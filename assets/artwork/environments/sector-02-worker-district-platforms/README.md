# Sector 02 Worker District platforms

## 목적과 상태

- Asset ID: `sector-02-worker-district-platforms`
- Category: `environments`
- 역할: Sector 02의 기존 collision polygon과 one-way edge chain에 입히는 terrain skin
- 상태: Runtime-ready
- 기준점: collision polygon과 같은 world geometry를 사용하며 별도 sprite placement anchor를 만들지 않는다. 제작 개념의 기준은 보행면 `top-center`다.

## 시각 문법

- `32×32` 마모된 주거 모듈: 낡은 콘크리트, 덧댄 철판, 재도장 흔적과 제한된 grime
- `32×8` edge lip: solid platform의 하중감과 one-way authored polygon의 얇은 두께를 색이 아닌 외곽선으로 구분
- Dark Navy·Charcoal·Cool Concrete가 본체를 소유하고 Muted Teal·Old Fluorescent Green·Warm service wear는 낮은 밀도로만 사용
- Cyan Rope·Anchor와 Red/Orange Telegraph 색은 사용하지 않는다.
- 모서리와 끝단은 Runtime이 같은 collision polygon edge를 회전·clip해 표현한다. PNG 외곽으로 새 geometry를 만들지 않는다.

## 파일

| 경로 | 형식·크기 | 역할 |
| --- | --- | --- |
| `source/sector-02-worker-district-platforms-imagegen.png` | RGBA PNG `1536×1024` | ImageGen 콘셉트 원본 |
| `source/generation-prompt.md` | Markdown | 생성 프롬프트와 reference 역할 |
| `source/build_platform_atlas.py` | Python + Pillow | 정수 격자·팔레트·seam 재현 |
| `export/terrain-fill.png` | RGBA PNG `32×32` | 반복 가능한 opaque terrain fill |
| `export/terrain-edge.png` | RGBA PNG `32×8` | collision edge lip |
| `preview/sector-02-worker-district-platforms-review.png` | RGBA PNG `768×384` | 반복·1x/4x 판독 검토 |

## 출처와 라이선스

- 제작 도구: OpenAI built-in ImageGen + Pillow 정수 픽셀 정규화
- 외부 에셋 복사: 없음
- 프로젝트 레퍼런스: 사용자가 제공한 Sector 02 배경 이미지는 mood reference로만 사용했고 source pixel이나 배치를 Runtime PNG에 복사하지 않았다. 해당 레퍼런스의 원본 사용권 상태는 `UNVERIFIED`다.
- 생성·정규화 결과: 이 프로젝트용 제작 자산

## Runtime 연결

- 대상 package: `assets/runtime/environments/sector-02-worker-district/`
- `terrain-fill.png`, `terrain-edge.png`와 manifest atlas 크기만 교체한다.
- `AuthoredAreaEnvironmentCatalog`의 기존 `sector-02-01`~`sector-02-08` 선택을 그대로 사용한다.
- Collision, one-way chain, surface kind, grappleable, Rope, Physics, Camera, Stage geometry와 Network authority는 비범위다.

## 재현과 검증

```powershell
python assets/artwork/environments/sector-02-worker-district-platforms/source/build_platform_atlas.py
npm run validate:environment-assets -- assets/runtime/environments/sector-02-worker-district
```

validator와 데스크톱·모바일 실제 화면 검증 근거는 `verification-ledger.md`에 기록한다.
