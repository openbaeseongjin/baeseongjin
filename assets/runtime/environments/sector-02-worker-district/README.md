# sector-02-worker-district runtime environment

## 상태

- Package ID: `environment-sector-02-worker-district`
- 적용 범위: `sector-02-01`~`sector-02-08` 및 seamless Runtime의 대응 `legacyAreaId`
- 상태: 환경 manifest v1 Runtime 통합·실게임 검증 완료
- 원본: `assets/artwork/environments/sector-02-worker-district-background/source/references/sector-02-worker-district-parallax-user-reference.png`
- 정규화 export: `assets/artwork/environments/sector-02-worker-district-background/export/backdrop-*-parallax-v1.png`
- Runtime 크기: far/mid/near 각각 `1024×2176`
- Sector 01→02 접점: far 하단 `512px`은 Sector 01 far 상단으로 수렴하고 mid/near 하단 `512px`은 16단계 alpha로 비운다.
- 비범위: Collision, Terrain geometry, Decoration 교체, Camera, Enemy, Gameplay trigger, Network authority

## 레이어

| 레이어 | 역할 | Parallax X/Y | 형식 |
|---|---|---:|---|
| `far` | Blue/Violet haze, 먼 수직 도시와 원거리 연결부 | `0.02 / 0.035` | 불투명 RGB PNG |
| `mid` | 좌우 Worker Apartment Stack, stair, balcony와 service rail | `0.05 / 0.07` | RGBA PNG |
| `near` | 가장 가까운 wall mass, pipe, fan housing과 하단 cross-pipe | `0.09 / 0.12` | RGBA PNG |

세 레이어는 같은 `1024×2176` 좌표계에 정렬된다. authored backdrop renderer가 현재 구역 판정과 같은 authored-region 집합에서 Sector 02 전체 상승 진행률을 계산해 공통 세로 구도를 이동시키고 각 레이어에 독립 시차를 적용한다. seamless Runtime에서는 `world.landmarks`, legacy Runtime에서는 `world.areas`를 사용한다. 이 이미지는 비충돌 배경이며 Gameplay surface나 Rope 부착 지형을 만들지 않는다.

Sector 02 최하단은 Sector 01 최상단과 같은 원경 샤프트로 시작한다. 주거 건물과 가로 배관은 하단 `512px`에서만 점진적으로 사라지므로, `1-8` 상단의 거대 정비 기계가 `2-1` 하단의 배관으로 한 프레임에 교체되지 않는다.

실행 중에는 `PixelBackdropRenderer`가 Sector 01 exit / Sector 02 entry 중심의 총 `1024 world px`에서 이 package의 전체 opacity를 smoothstep `0 → 1`로 올리고 Sector 01 package는 `1 → 0`으로 내린다. 정확한 경계에서는 양쪽이 각각 50%이며 sky gradient도 같은 비율을 사용한다. Player가 다시 내려가면 같은 Y 기반 비율이 역방향으로 재생되고 별도 gameplay·camera·network 상태는 생기지 않는다.

Terrain과 Decoration 필드는 환경 manifest v1 공개 계약을 충족하기 위해 `default-mock` PNG를 보유하지만, authored Sector 02에서는 기존 collision-aligned terrain renderer와 authored-world decoration 정책을 그대로 사용한다. 이번 패키지는 backdrop만 교체한다.

## 제작·정규화

- 편집 도구: OpenAI built-in ImageGen(앱에서 세부 모델 버전 미노출)
- 원본 형식: 사용자 제공 `1024×2176` 불투명 RGB PNG
- ImageGen 출력: far/mid/near `860×1828` RGB PNG
- 정규화: `source/normalize_parallax_layers.py`가 mid/near의 생성 checkerboard matte를 실제 alpha로 복원하고 세 레이어를 nearest-neighbor로 `1024×2176`에 맞춤
- 라이선스 메모: 사용자가 프로젝트용 Sector 02 배경으로 직접 제공한 원본이다. 원 제작 도구와 외부 재배포 조건은 별도로 확인되지 않았다. ImageGen 편집 결과는 이 프로젝트용 파생 자산이다.

## 검증

```powershell
npm run validate:environment-assets -- assets/runtime/environments/sector-02-worker-district
```

2026-08-22 검증 결과:

- validator: `Environment assets valid: environment-sector-02-worker-district (6 atlases, 5 zones, 3 backdrop layers)`
- renderer syntax check: PASS
- 실제 Canvas: `sector-02-01` Desktop `1280×720`, mobile landscape `844×390`에서 far → mid → near와 기존 terrain/HUD 합성 확인
- 범위 비교: `sector-01-01`은 기존 Sector 01 package를 유지하며 Sector 02 backdrop이 나타나지 않음
- 브라우저 console: warn/error 없음
- seamless 진행률 확인: `world.landmarks`의 Sector 02 전체 bounds를 사용해 `2-1` 하단 crop과 `2-8` 상단 crop의 배경 Y가 실제로 달라지는 것을 Desktop Canvas에서 확인

같은 날짜 Sector 01→02 seam export 적용 뒤 캐시가 없는 현재 소스 오리진에서 `sector-02-01`을 데스크톱 `1428×817`과 모바일 가로 `844×390`으로 다시 확인했다. 하단 `512px`의 mid·near와 cross-pipe가 공용 원경 샤프트로 수렴하며 Sector 01-8의 정비 구조와 한 프레임에 교체되지 않았고, procedural fallback·브라우저 warning/error는 없었다. 경계 밴드 밖 세 레이어 픽셀은 원본과 일치한다.

같은 날짜 Runtime package crossfade를 적용하고 정확한 `sector-02-01` entry에서 데스크톱 `1280×720`과 모바일 가로 `844×390`을 다시 확인했다. Sector 01·02 package와 sky gradient가 각각 50%로 합성되고 terrain·HUD는 정상 순서로 유지됐으며 브라우저 warning/error는 없었다.
