# sector-03-central-exchange runtime environment

## 상태

- Package ID: `environment-sector-03-central-exchange`
- 적용 범위: `sector-03-01`~`sector-03-08` 및 seamless Runtime의 대응 `legacyAreaId`
- 상태: 승인된 seam-match V4의 offline depth map 기반 fixed background + 2 parallax islands 기본 Runtime
- 원본: `assets/artwork/environments/sector-03-central-exchange-background/source/seam-match-v4-depth-islands-v1/`
- Runtime export: `assets/artwork/environments/sector-02-03-runtime-seam/export/sector-03-central-exchange/`
- Runtime 크기: 세 backdrop layer 각각 `1024×1536`
- 비범위: Collision, Terrain geometry, Camera, Enemy, Gameplay, Network authority

| 레이어 | 역할 | Parallax X/Y | 형식 |
|---|---|---:|---|
| `fixed-background` | 가림 영역을 복원한 Violet-Blue 상업 Atrium | `0.018 / 0.030` | 불투명 RGB PNG |
| `near-island-left` | 좌측 연결 foreground mass | `0.080 / 0.100` | RGBA PNG |
| `near-island-right` | 우측 연결 foreground mass | `0.080 / 0.100` | RGBA PNG |

Runtime은 캐시된 PNG만 nearest sampling과 작은 정수 시차로 그린다. depth pixel 재계산, 동적 mask, texture 재생성, WebGL은 사용하지 않는다. Terrain과 Decoration PNG는 manifest v1 계약을 위한 fallback이며 authored Sector의 기존 collision-aligned 표현은 유지한다.

Sector 02→03 경계 중심 총 `1024 world px`에서는 Sector 02·03 package와 sky gradient를 smoothstep 역비율로 합성한다. 정확한 접점은 50/50이고, Sector 03 island 하단 `512px`이 공용 fixed shaft로 수렴해 거대 건축물이 겹쳐 보이지 않는다.

```powershell
npm run validate:environment-assets -- assets/runtime/environments/sector-03-central-exchange
```

Issue #790의 기존 검증은 `verification-ledger.md`, V4 후보의 최종 검증은 `verification-ledger-issue-798.md`가 소유한다.
