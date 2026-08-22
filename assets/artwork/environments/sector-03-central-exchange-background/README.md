# Sector 03 Central Exchange Background

## 상태

- 자산 ID: `sector-03-central-exchange-background`
- 상태: `DEPTH ISLANDS V2 — RUNTIME INTEGRATED`
- 대상: Sector 03 전체의 비충돌 authored backdrop
- Runtime: `assets/runtime/environments/sector-03-central-exchange/`
- 기준: `docs/bsh/scenario/3/README.md`, `docs/graphics-asset-guide.md`, `docs/environment-asset-format.md`
- 비범위: Stage geometry, Collision, Terrain, Camera, Scanner, Enemy, Rope target, Sector 04 전환

## 제작 계약

Discord `코딩` 채널에서 가져온 배경 생성 규칙을 저장소 시나리오 문서와 대조해 적용했다. Runtime에서 depth pixel을 계산하지 않고, 같은 캔버스의 불투명 master와 8-bit grayscale depth map을 제작 입력으로 사용한다. import 단계에서 가까운 구조를 좌·우 연결 island 최대 2개로 추출하고, 가려진 영역은 불투명 fixed background에 미리 복원한다.

- 생성 도구: OpenAI built-in ImageGen
- 정규화 도구: Python, Pillow, NumPy, OpenCV
- master/depth/fixed/islands 크기: `1024×1536`
- depth 규칙: 흰색=가까움, 검은색=멀어짐
- 추출: threshold `192`, 8-connectivity, 최소 `500px`, 좌·우 component 정확히 2개
- 중립 합성: fixed + left + right와 master의 최대 RGBA 차이 `0`
- 시차 검수: 좌·우 `8px` 정수 이동 시 inpainted fixed plate가 노출되고 투명 구멍은 없음

| 파일 | 역할 |
|---|---|
| `source/depth-islands-v2/sector-03-central-exchange-imagegen.png` | 불투명 authoring master |
| `source/depth-islands-v2/depth-map-imagegen.png` | grayscale depth 입력 |
| `source/depth-islands-v2/fixed-background-inpaint-imagegen.png` | 가림 영역 복원 입력 |
| `export/depth-islands-v2/backdrop-fixed.png` | 불투명 fixed plate |
| `export/depth-islands-v2/parallax-island-left.png` | 좌측 RGBA island |
| `export/depth-islands-v2/parallax-island-right.png` | 우측 RGBA island |
| `preview/sector-03-central-exchange-depth-islands-v2-neutral.png` | 중립 합성 검수 |
| `preview/sector-03-central-exchange-depth-islands-v2-shifted.png` | 시차 이동 검수 |

원문 프롬프트는 `source/depth-islands-v2/PROMPTS.md`, 재현 스크립트는 `normalize_depth_islands.py`에 보존한다. 사용자 제공 원본은 `source/references/user-sector-03-background-2026-08-22.png`, Discord 검토 자료는 `source/references/discord-meeting-reference-2026-08-21.png`에 프로젝트 내부 근거로 보존한다. 원본의 외부 재배포 조건은 별도 확인이 필요하며 ImageGen 결과는 프로젝트용 파생 자산이다.

Sector 02→03 접점은 `assets/artwork/environments/sector-02-03-runtime-seam/`이 소유한다. Sector 03 좌·우 island는 하단 `512px`에서 공용 fixed shaft로 사라지고, Runtime은 경계 중심 `1024 world px` 동안 두 package와 sky를 smoothstep 역비율로 합성한다.
