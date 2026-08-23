# Sector 04 Upper Residential Background

## 상태

- 자산 ID: `sector-04-upper-residential-background`
- 상태: `FAR/MID/NEAR V3 — RUNTIME INTEGRATED`
- 대상: Sector 04 전체의 비충돌 authored backdrop
- Runtime: `assets/runtime/environments/sector-04-upper-residential/`
- 기준: `docs/bsh/scenario/4/README.md`, `docs/graphics-asset-guide.md`, `docs/environment-asset-format.md`
- 비범위: Stage geometry, Collision, Terrain, Camera, Enemy, Rope target, Sector 04→05 gameplay 전환

## 승인 제작물

- 유일한 master: `source/far-mid-near-v3-open-ascent-attached-master/sector-04-upper-residential-master.png`
- 사용자 첨부 SHA-256: `6D2233BE0473CE03F3CD0A64AA2D8618FF5E77A32C69C967DFCBF211A663D827`
- master와 세 레이어: `1024×1536`
- Far: 불투명 RGB, 중앙·원경과 전경 가림 영역의 복원 plate
- Mid: Near를 제외한 좌·우 건물 전체와 `32px` hidden apron
- Near: 가장 가까운 좌·우 외곽 건물 두 개와 `8px` hidden overlap
- 하단의 Sector 03 표현은 캔버스 15% 이내이며 아래로 갈수록 명확해진다.
- 중립 `Far + Mid + Near` 합성은 master와 최대 RGB 차이 `0`이다.

ImageGen depth/inpaint 입력, 원문 프롬프트와 오프라인 정규화 스크립트는 `source/far-mid-near-v3-open-ascent-attached-master/`가 소유한다. Runtime export와 시차 검수 이미지는 각각 같은 이름의 `export/`, `preview/` 하위 폴더에 보존한다. 이전 후보와 폐기 mask는 이번 Runtime 입력에 포함하지 않는다.

Sector 03→04 접점은 `PixelBackdropRenderer`가 경계 중심 `1024 world px` 동안 두 package 전체와 sky를 smoothstep 역비율로 합성한다. 이 표현 전환은 3-8과 4-1 사이에 collision, Gate 또는 이동 경로를 추가하지 않는다.
