# sector-03-central-exchange runtime environment

## 상태

- Package ID: `environment-sector-03-central-exchange`
- 적용 범위: `sector-03-01`~`sector-03-08` 및 seamless Runtime의 대응 `legacyAreaId`
- 상태: seam-match V8 far/mid/near 배경 + Sector 03 Central Exchange terrain skin Runtime
- 원본: `assets/artwork/environments/sector-03-central-exchange-background/source/seam-match-v8-far-mid-near-depth-v1/`
- Runtime export: `assets/artwork/environments/sector-03-central-exchange-background/export/seam-match-v8-far-mid-near-depth-v1/`
- Terrain 원본·export: `assets/artwork/environments/sector-03-central-exchange-platforms/`
- Runtime 크기: 세 backdrop layer 각각 `1024×1536`
- Terrain 크기: RGBA fill `32×32`, RGBA edge `32×8`
- 비범위: Collision, Terrain geometry, Camera, Enemy, Gameplay, Network authority

| 레이어 | 역할 | Parallax X/Y | 형식 |
|---|---|---:|---|
| `far-background` | 가림 영역을 복원한 Sector 3 고정 배경 | `0.018 / 0.030` | `backdrop-v8-far.png`, 불투명 RGB |
| `mid-structure` | 좌·우 연결 구조의 중간 깊이 band | `0.050 / 0.065` | `backdrop-v8-mid.png`, RGBA |
| `near-frame` | 같은 좌·우 구조의 가장 가까운 core | `0.080 / 0.100` | `backdrop-v8-near.png`, RGBA |

Runtime은 캐시된 PNG만 nearest sampling과 작은 정수 시차로 그린다. depth pixel 재계산, 동적 mask, texture 재생성, WebGL은 사용하지 않는다. Terrain은 Graphite·Cool Concrete 대형 deck와 제한된 Muted Gold service frame을 기존 collision polygon과 one-way edge chain 위에 그린다. Decoration PNG는 manifest v1 계약을 유지하며 collision을 만들지 않는다.

solid platform은 무거운 edge nose와 하부 service frame, one-way platform은 authored polygon의 얇은 두께와 중성 회색 chain stroke로 구분한다. Cyan Rope·Anchor 및 Red/Orange Telegraph와 경쟁하는 terrain accent는 사용하지 않는다. 위치·크기·collision·grappleable·Rope·Physics·맵 동선·멀티플레이 상태는 변경하지 않는다.

Sector 02→03 경계 중심 총 `1024 world px`에서는 Sector 01→02와 같은 `PixelBackdropRenderer` 권위가 Sector 02·03 package 전체와 sky gradient를 smoothstep 역비율로 합성한다. 정확한 접점은 50/50이며 far/mid/near에는 항상 같은 package alpha가 적용된다. Sector 02 package는 변경하지 않는다.

```powershell
npm run validate:environment-assets -- assets/runtime/environments/sector-03-central-exchange
```

Issue #790과 V4의 기존 검증은 `verification-ledger.md`, `verification-ledger-issue-798.md`에 역사 자료로 보존한다. V8 후보의 최종 검증은 `verification-ledger-issue-827.md`가 소유한다.
