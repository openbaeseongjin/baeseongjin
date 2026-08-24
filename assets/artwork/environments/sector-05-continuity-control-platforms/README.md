# Sector 05 Continuity Control platforms

## 목적과 상태

- Asset ID: `sector-05-continuity-control-platforms`
- Category: `environments`
- 역할: Sector 05의 기존 collision polygon과 one-way edge chain에 입히는 terrain skin
- 상태: 게임 규격 우선 V2 Runtime-ready
- 기준점: 별도 sprite placement를 만들지 않고 기존 world geometry를 사용한다. 제작 개념의 기준은 보행면 `top-center`다.

## 시각 문법

- `32×32` control deck: warm-neutral pale-titanium cap, cool sealed composite body, graphite precision seam, 제한된 low-chroma violet-gray service recess
- `32×8` edge lip: 연속형 밝은 보행선과 닫힌 하부 load shell을 가진 정밀한 solid 외곽
- solid는 두꺼운 밀폐 body와 넓은 load shell, one-way는 기존 얇은 authored polygon과 중성 pale-steel chain stroke로 구분한다.
- 일반 terrain은 flush·sealed silhouette만 사용한다. socket·jaw·hook·post·rail을 넣지 않아 기존 grappleable hardpoint만 돌출된 기계 실루엣으로 남긴다.
- Cyan Rope·Anchor 및 Red/Orange Telegraph 색을 사용하지 않는다. 반복 무늬는 넓은 panel 한 칸과 연속 service recess로 제한한다.
- 모서리와 끝단은 Runtime이 같은 collision polygon edge를 회전·clip해 표현한다. PNG 외곽으로 geometry를 만들지 않는다.

## 파일

| 경로 | 형식·크기 | 역할 |
| --- | --- | --- |
| `source/sector-05-continuity-control-platforms-imagegen-v1.png` | RGB PNG `1536×1024` | 최초 ImageGen 제작 원본; 비교·이력 보존 |
| `source/sector-05-continuity-control-platforms-imagegen-v2.png` | RGB PNG `1536×1024` | 게임 logical grid·저밀도 규칙을 먼저 적용한 현재 ImageGen 제작 원본 |
| `source/generation-prompt.md` | Markdown | V1 생성 프롬프트와 금지 범위 |
| `source/generation-prompt-v2.md` | Markdown | V2 게임 적용 규격과 최종 생성 프롬프트 |
| `source/build_platform_atlas.py` | Python + Pillow | checker 제거, 저색수 투명 source 정규화, 정수 픽셀 atlas 제작 |
| `export/sector-05-continuity-control-platforms-module-sheet.png` | RGBA PNG `1536×1024` | V1 투명 24색 제작 시트; 비교·이력 보존 |
| `export/sector-05-continuity-control-platforms-module-sheet-v2.png` | RGBA PNG `1536×1024` | V2 checker 제거·무디더 24색 제작 시트 |
| `export/terrain-fill.png` | RGBA PNG `32×32` | V2 8색 seam-safe opaque fill |
| `export/terrain-edge.png` | RGBA PNG `32×8` | V2 7색 collision edge lip |
| `preview/sector-05-continuity-control-platforms-review.png` | RGBA PNG `768×384` | V1 비교 미리보기 |
| `preview/sector-05-continuity-control-platforms-review-v2.png` | RGBA PNG `768×384` | V2 solid·thin·1x/4x 판독 미리보기 |

## 출처와 라이선스

- 제작 도구: OpenAI built-in ImageGen + Pillow 정수 픽셀 정규화
- 외부 에셋 복사: 없음
- Sector 05 배경은 팔레트·정밀도·관리 상태를 확인하는 reference로만 사용했으며 source pixel, 발판 배치와 건물 외곽을 복제하지 않았다.
- 생성·정규화 결과: 이 프로젝트용 제작 자산

## Runtime 연결 경계

- 대상 package: `assets/runtime/environments/sector-05-continuity-control/`
- `terrain-fill.png`, `terrain-edge.png`, manifest atlas·palette와 package README만 교체한다.
- `AuthoredAreaEnvironmentCatalog`의 기존 `sector-05-01`~`sector-05-08` stable selection과 공용 Block Pool을 그대로 사용한다.
- Collision, one-way chain, surface kind, grappleable, Rope, Physics, Camera, Stage geometry, Map Editor, AREA-SPEC와 Network authority는 비범위다.

## 재현과 검증

```powershell
python assets/artwork/environments/sector-05-continuity-control-platforms/source/build_platform_atlas.py
npm run validate:environment-assets -- assets/runtime/environments/sector-05-continuity-control
```

V1 검증 근거는 `verification-ledger.md`, V2 검증 근거는 `verification-ledger-v2.md`에 기록한다.
