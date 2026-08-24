# Sector 06 Rooftop Evacuation platforms

## 목적과 상태

- Asset ID: `sector-06-rooftop-evacuation-platforms`
- Category: `environments`
- 역할: Sector 06의 기존 collision polygon과 one-way edge chain에 입히는 terrain skin
- 상태: Runtime 통합·데스크톱/모바일 실제 화면 검증 완료
- 기준점: 별도 sprite placement를 만들지 않으며 기존 world geometry의 보행면 `top-center`를 유지한다.

## 시각 문법

- `32×32` fill: deep navy의 바람이 통하는 service-gantry bay, 32px 간격 boundary post, 단일 사선 load brace
- `32×8` edge: cool off-white aviation cap, weathered pale metal chamfer, recessed drainage seam, graphite flange
- solid는 두꺼운 load-bearing deck와 열린 brace 하부, one-way는 authored polygon의 얕은 두께와 중성 pale-steel chain으로 구분한다.
- 일반 terrain에는 antenna·mast·rail·socket·hook·jaw 같은 돌출물을 넣지 않는다. Antenna 기반 외부 시설 문법은 flush aviation panel과 gantry 구조로만 전달한다.
- muted amber aviation accent는 `landing-pad` zone의 기존 palette accent에만 제한하며 atlas 반복 무늬로 넣지 않는다. Cyan Rope·Anchor와 Red/Orange Telegraph 색은 terrain atlas에 사용하지 않는다.

## 파일

| 경로 | 형식·크기 | 역할 |
| --- | --- | --- |
| `source/sector-06-rooftop-evacuation-platforms-imagegen-v1.png` | RGBA PNG `1536×1024` | built-in ImageGen 제작 원본 |
| `source/generation-prompt.md` | Markdown | 최종 생성 프롬프트·금지 범위 |
| `source/build_platform_atlas.py` | Python + Pillow | alpha 정리, 저색수 정규화, exact atlas·preview 제작 |
| `export/sector-06-rooftop-evacuation-platforms-module-sheet-v1.png` | RGBA PNG `1536×1024` | 24색 무디더 정규화 제작 시트 |
| `export/terrain-fill.png` | RGBA PNG `32×32` | 8색 seam-safe service-gantry fill |
| `export/terrain-edge.png` | RGBA PNG `32×8` | 8색 aviation deck edge |
| `preview/sector-06-rooftop-evacuation-platforms-review-v1.png` | RGBA PNG `768×384` | solid·thin·1x/4x 판독 미리보기 |

## 출처와 라이선스

- 제작 도구: OpenAI built-in ImageGen + Pillow 정수 픽셀 정규화
- 외부 에셋 복사: 없음
- Sector 06 Runtime background는 팔레트·외부 노출감·관리 상태 reference로만 육안 확인했으며 source pixel과 건축 geometry를 복제하지 않았다.
- 생성·정규화 결과는 이 프로젝트용 제작 자산이다.

## Runtime 연결 경계

- 대상 package: `assets/runtime/environments/sector-06-rooftop-evacuation/`
- `terrain-fill.png`, `terrain-edge.png`, manifest atlas·palette와 package README만 교체한다.
- `AuthoredAreaEnvironmentCatalog`의 기존 `sector-06-01`~`sector-06-08` stable selection과 공용 Block Pool을 그대로 사용한다.
- Collision, one-way chain, surface kind, grappleable, Rope, Physics, Camera, Stage geometry, Map Editor, AREA-SPEC와 Network authority는 비범위다.

## 재현과 검증

```powershell
python assets/artwork/environments/sector-06-rooftop-evacuation-platforms/source/build_platform_atlas.py
npm run validate:environment-assets -- assets/runtime/environments/sector-06-rooftop-evacuation
```
