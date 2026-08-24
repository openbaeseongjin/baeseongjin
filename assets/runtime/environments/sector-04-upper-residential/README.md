# sector-04-upper-residential runtime environment

## 상태

- Package ID: `environment-sector-04-upper-residential`
- 적용 범위: `sector-04-01`~`sector-04-08` 및 seamless Runtime의 대응 `legacyAreaId`
- 상태: open-ascent V3 far/mid/near 배경 + Sector 04 Upper Residential terrain skin Runtime
- 원본: `assets/artwork/environments/sector-04-upper-residential-background/source/far-mid-near-v3-open-ascent-attached-master/`
- Runtime export: `assets/artwork/environments/sector-04-upper-residential-background/export/far-mid-near-v3-open-ascent-attached-master/`
- Terrain 원본·export: `assets/artwork/environments/sector-04-upper-residential-platforms/`
- Runtime 크기: 세 backdrop layer 각각 `1024×1536`
- Terrain 크기: RGBA fill `32×32`, RGBA edge `32×8`
- 비범위: Collision, Terrain geometry, Camera, Enemy, Gameplay, Network authority

| 레이어           | 역할                                             |    Parallax X/Y | 형식                           |
| ---------------- | ------------------------------------------------ | --------------: | ------------------------------ |
| `far-background` | 중앙·원경과 가림 영역이 복원된 고정 배경         | `0.018 / 0.030` | `backdrop-far.png`, 불투명 RGB |
| `mid-structure`  | 좌·우 건물 전체에서 Near를 제외한 중간 깊이 mass | `0.050 / 0.065` | `backdrop-mid.png`, RGBA       |
| `near-frame`     | 좌·우 가장 가까운 외곽 건물 두 개                | `0.080 / 0.100` | `backdrop-near.png`, RGBA      |

Runtime은 캐시된 PNG만 nearest sampling과 작은 정수 시차로 그린다. depth pixel 재계산, 동적 mask, texture 재생성, WebGL은 사용하지 않는다. Terrain은 pale-ivory walking curb·warm-gray sealed fascia·연속형 recessed sage reveal을 기존 collision polygon과 one-way edge chain 위에 그린다. Decoration PNG는 manifest v1 계약을 유지하며 collision을 만들지 않는다.

solid platform은 무거운 courtyard curb와 닫힌 측면·넓은 support shell, one-way platform은 authored polygon의 얇은 두께와 중성 회녹색 chain stroke로 구분한다. Cyan Rope·Anchor 및 Red/Orange Telegraph와 경쟁하는 terrain accent는 사용하지 않는다. 위치·크기·collision·grappleable·Rope·Physics·맵 동선·멀티플레이 상태는 변경하지 않는다.

Sector 03→04 경계 중심 총 `1024 world px`에서는 기존 01→02·02→03과 같은 `PixelBackdropRenderer` 권위가 Sector 03·04 package 전체와 sky gradient를 smoothstep 역비율로 합성한다. 정확한 접점은 50/50이며 far/mid/near에는 항상 같은 package alpha가 적용된다. Sector 03 package는 변경하지 않으며 이 표현 전환은 3-8과 4-1 사이에 gameplay connector를 추가하지 않는다.

```powershell
npm run validate:environment-assets -- assets/runtime/environments/sector-04-upper-residential
```

Issue #897의 최종 검증은 `verification-ledger-issue-897.md`가 소유한다.
