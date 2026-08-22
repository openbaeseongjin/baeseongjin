# Sector 03 Central Exchange Background

## 상태

- 자산 ID: `sector-03-central-exchange-background`
- 상태: `SEAM-MATCH V8 FAR/MID/NEAR DEPTH — RUNTIME INTEGRATED`
- 대상: Sector 03 전체의 비충돌 authored backdrop
- Runtime: `assets/runtime/environments/sector-03-central-exchange/`
- 기준: `docs/bsh/scenario/3/README.md`, `docs/graphics-asset-guide.md`, `docs/environment-asset-format.md`
- 비범위: Stage geometry, Collision, Terrain, Camera, Scanner, Enemy, Rope target, Sector 04 전환

## 제작 계약

Discord `코딩` 채널에서 가져온 배경 생성 규칙을 저장소 시나리오 문서와 대조해 적용했다. Runtime에서 depth pixel을 계산하지 않고, 같은 캔버스의 불투명 master와 8-bit grayscale depth map을 제작 입력으로 사용한다. import 단계에서 가까운 구조를 좌·우 연결 island 최대 2개로 추출하고, 가려진 영역은 불투명 fixed background에 미리 복원한다.

- 생성 도구: OpenAI built-in ImageGen
- 정규화 도구: Python, Pillow, NumPy, OpenCV
- 승인 입력: `source/seam-match-v8-far-mid-near-depth-v1/sector-03-central-exchange-master.png`
- master/depth/fixed/islands 크기: `1024×1536`
- depth 규칙: 흰색=가까움, 검은색=멀어짐
- 추출: moving threshold `190`, near threshold `220`, 8-connectivity, 최소 `500px`, 좌·우 component 정확히 2개
- 중립 합성: far + mid + near와 master의 최대 RGB 차이 `0`
- 시차 검수: mid `(+4,+2)px`, near `(+8,+4)px` 정수 이동 시 inpainted far plate가 노출되고 투명 구멍은 없음

| 파일 | 역할 |
|---|---|
| `source/seam-match-v8-far-mid-near-depth-v1/sector-03-central-exchange-master.png` | Sector 02 비중을 하단 약 15%로 제한한 불투명 authoring master |
| `source/seam-match-v8-far-mid-near-depth-v1/depth-map-imagegen.png` | grayscale depth 입력 |
| `source/seam-match-v8-far-mid-near-depth-v1/fixed-background-inpaint-imagegen.png` | 가림 영역 복원 입력 |
| `export/seam-match-v8-far-mid-near-depth-v1/backdrop-far.png` | 불투명 fixed far plate |
| `export/seam-match-v8-far-mid-near-depth-v1/backdrop-mid.png` | 중간 깊이 RGBA band |
| `export/seam-match-v8-far-mid-near-depth-v1/backdrop-near.png` | 근접 RGBA core |
| `preview/seam-match-v8-far-mid-near-depth-v1/sector-03-central-exchange-neutral.png` | 중립 합성 검수 |
| `preview/seam-match-v8-far-mid-near-depth-v1/sector-03-central-exchange-shifted.png` | 시차 이동 검수 |

V8 원문 프롬프트는 `source/seam-match-v8-far-mid-near-depth-v1/PROMPTS.md`, 재현 스크립트는 같은 폴더의 `extract_far_mid_near.py`에 보존한다. V4는 이전 Runtime 자산의 역사 자료로 보존한다. 사용자 제공 원본은 프로젝트 내부 승인 입력이며 외부 재배포 조건은 별도 확인이 필요하고 ImageGen 결과는 프로젝트용 파생 자산이다.

Sector 02→03 접점은 기존 `PixelBackdropRenderer`가 소유한다. Sector 02 package는 수정하지 않고 Runtime은 경계 중심 `1024 world px` 동안 두 package 전체와 sky를 Sector 01→02와 같은 smoothstep 역비율로 합성한다.
