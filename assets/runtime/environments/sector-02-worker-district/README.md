# sector-02-worker-district runtime environment

## 상태

- Package ID: `environment-sector-02-worker-district`
- 적용 범위: `sector-02-01`~`sector-02-08` 및 seamless Runtime의 대응 `legacyAreaId`
- 상태: depth-map 기반 fixed background + 2 parallax islands Runtime 통합
- 원본: `assets/artwork/environments/sector-02-worker-district-background/source/depth-islands-v2/sector-02-worker-district-master.png`
- Runtime export: `assets/artwork/environments/sector-02-03-runtime-seam/export/sector-02-worker-district/`
- Runtime 크기: 세 backdrop layer 각각 `1024×2176`
- 비범위: Collision, Terrain geometry, Camera, Gameplay, Network authority

| 레이어 | 역할 | Parallax X/Y | 형식 |
|---|---|---:|---|
| `fixed-background` | 가림 영역을 복원한 Worker District canyon과 하단 횡단 Pipe | `0.02 / 0.035` | 불투명 RGB PNG |
| `near-island-left` | 좌측 연결 foreground mass | `0.08 / 0.10` | RGBA PNG |
| `near-island-right` | 우측 연결 foreground mass | `0.08 / 0.10` | RGBA PNG |

Runtime은 캐시된 PNG만 nearest sampling과 작은 정수 시차로 그린다. depth pixel 재계산, 동적 mask, texture 재생성, WebGL은 사용하지 않는다. 이 backdrop은 Collision, Gameplay surface, Rope 부착 지형을 만들지 않는다.

## 인접 Sector 전이

- 하단 `512px`: fixed가 Sector 01 far 상단으로 수렴하고 두 island가 16단계 alpha로 사라진다.
- 상단 `512px`: fixed가 Sector 03 fixed 하단으로 수렴하고 두 island가 16단계 alpha로 사라진다.
- `PixelBackdropRenderer`는 Sector 01→02와 Sector 02→03 경계 각각 총 `1024 world px`에서 두 package와 sky gradient를 smoothstep 역비율로 합성한다.
- 전이는 Player Y 기반 표현이며 gameplay·camera·network 상태를 추가하지 않는다.

Depth map threshold `160`에서 최소 500px인 8-connected component는 좌·우 정확히 두 개다. fixed와 두 island의 중립 합성은 master 대비 픽셀 차이 `0`이다. 제작 입력은 authoring README, 양쪽 seam 빌드와 픽셀 불변식은 `assets/artwork/environments/sector-02-03-runtime-seam/README.md`가 소유한다.

```powershell
npm run validate:environment-assets -- assets/runtime/environments/sector-02-worker-district
```

최종 검증의 base SHA, diff fingerprint, validator와 브라우저 결과는 같은 디렉터리의 `verification-ledger.md`가 소유한다.
