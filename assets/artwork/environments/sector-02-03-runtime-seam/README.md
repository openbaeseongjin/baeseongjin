# Sector 02→03 Runtime Seam

## 상태

- Asset ID: `sector-02-03-runtime-seam`
- 분류: 인접 Sector 배경 전이용 환경 authoring source
- 상태: `SECTOR 03 V4 RUNTIME CANDIDATE`
- 도구: deterministic Python + Pillow/NumPy
- 전이 밴드: 각 접점의 이미지 안쪽 `512px`, 16단계 smoothstep
- Runtime 전환: Sector 01→02와 Sector 02→03 각각 경계 중심 총 `1024 world px` crossfade
- 비범위: Collision, Terrain geometry, Camera, Gameplay, Network authority

## 방법

- 승인된 기존 Sector 02 Runtime fixed plate와 island는 수정하지 않는다.
- Sector 03 V4 fixed plate의 하단 `512px`만 기존 Sector 02 fixed 상단으로 수렴한다.
- Sector 03 V4 좌·우 island는 하단 `512px`에서 alpha가 0으로 수렴한다.
- 정확한 2→3 접점에서 Sector 02 fixed의 상단 행과 Sector 03 fixed의 하단 행은 픽셀 단위로 같다.
- Runtime은 Player world Y에 따른 표현용 smoothstep으로 두 package와 sky gradient를 역비율 합성한다. 별도 상태나 timer를 만들지 않아 하강할 때도 같은 전이가 역방향으로 재생된다.

## 파일

- `source/references/`: Sector 01 far와 승인된 Sector 03 V4 fixed/islands 입력 보존본
- `source/build_runtime_seam_layers.py`: 기존 Sector 02를 읽기 전용 endpoint로 사용해 Sector 03 fixed 수렴과 island alpha band를 재현하는 빌더
- `export/sector-02-worker-district/`: 기존 승인본을 보존하며 빌더가 쓰지 않는 Sector 02 Runtime PNG
- `export/sector-03-central-exchange/`: Sector 02 접점이 반영된 Sector 03 Runtime PNG
- `preview/sector-02-03-boundary.png`: 위쪽 Sector 03 하단과 아래쪽 Sector 02 상단의 접합 검토본

## 출처와 라이선스

Sector 02 입력은 사용자가 프로젝트의 Sector 02 이미지로 제공한 `1024×2176` PNG와 그 ImageGen 파생 자산이다. Sector 01·03 입력은 저장소의 프로젝트 생성 자산이다. Sector 02 원 제작 도구와 외부 재배포 조건은 별도로 확인되지 않았으며, 이 package는 프로젝트 내부 Runtime 통합용 파생 자산이다.

## 결정적 검증

- Sector 02 fixed·island export와 Runtime SHA-256 불변
- Sector 02 fixed 하단 행 = Sector 01 far 상단 행
- Sector 02 fixed 상단 행 = Sector 03 V4 fixed 하단 행
- Sector 02 좌·우 island의 상단 경계 alpha max = `0`
- Sector 03 좌·우 island의 하단 경계 alpha max = `0`
- Sector 03 fixed는 하단 `512px` 밖에서 승인된 V4 fixed와 픽셀 단위로 같음
- 모든 출력 폭 `1024px`, fixed는 불투명 RGB, island는 RGBA
