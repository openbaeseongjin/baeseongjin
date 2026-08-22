# sector-03-central-exchange runtime environment

## 상태

- Package ID: `environment-sector-03-central-exchange`
- 적용 범위: `sector-03-01`~`sector-03-08` 및 seamless Runtime의 대응 `legacyAreaId`
- 상태: seam-match V8의 offline depth map 기반 far/mid/near 기본 Runtime
- 원본: `assets/artwork/environments/sector-03-central-exchange-background/source/seam-match-v8-far-mid-near-depth-v1/`
- Runtime export: `assets/artwork/environments/sector-03-central-exchange-background/export/seam-match-v8-far-mid-near-depth-v1/`
- Runtime 크기: 세 backdrop layer 각각 `1024×1536`
- 비범위: Collision, Terrain geometry, Camera, Enemy, Gameplay, Network authority

| 레이어 | 역할 | Parallax X/Y | 형식 |
|---|---|---:|---|
| `far-background` | 가림 영역을 복원한 Sector 3 고정 배경 | `0.018 / 0.030` | `backdrop-v8-far.png`, 불투명 RGB |
| `mid-structure` | 좌·우 연결 구조의 중간 깊이 band | `0.050 / 0.065` | `backdrop-v8-mid.png`, RGBA |
| `near-frame` | 같은 좌·우 구조의 가장 가까운 core | `0.080 / 0.100` | `backdrop-v8-near.png`, RGBA |

Runtime은 캐시된 PNG만 nearest sampling과 작은 정수 시차로 그린다. depth pixel 재계산, 동적 mask, texture 재생성, WebGL은 사용하지 않는다. Terrain과 Decoration PNG는 manifest v1 계약을 위한 fallback이며 authored Sector의 기존 collision-aligned 표현은 유지한다.

Sector 02→03 경계 중심 총 `1024 world px`에서는 Sector 01→02와 같은 `PixelBackdropRenderer` 권위가 Sector 02·03 package 전체와 sky gradient를 smoothstep 역비율로 합성한다. 정확한 접점은 50/50이며 far/mid/near에는 항상 같은 package alpha가 적용된다. Sector 02 package는 변경하지 않는다.

```powershell
npm run validate:environment-assets -- assets/runtime/environments/sector-03-central-exchange
```

Issue #790과 V4의 기존 검증은 `verification-ledger.md`, `verification-ledger-issue-798.md`에 역사 자료로 보존한다. V8 후보의 최종 검증은 `verification-ledger-issue-827.md`가 소유한다.
