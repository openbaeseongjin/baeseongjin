# sector-04-upper-residential runtime environment

## 상태

- Package ID: `environment-sector-04-upper-residential`
- 적용 범위: `sector-04-01`~`sector-04-08` 및 seamless Runtime의 대응 `legacyAreaId`
- 상태: open-ascent V3 far/mid/near 기본 Runtime
- 원본: `assets/artwork/environments/sector-04-upper-residential-background/source/far-mid-near-v3-open-ascent-attached-master/`
- Runtime export: `assets/artwork/environments/sector-04-upper-residential-background/export/far-mid-near-v3-open-ascent-attached-master/`
- Runtime 크기: 세 backdrop layer 각각 `1024×1536`
- 비범위: Collision, Terrain geometry, Camera, Enemy, Gameplay, Network authority

| 레이어           | 역할                                             |    Parallax X/Y | 형식                           |
| ---------------- | ------------------------------------------------ | --------------: | ------------------------------ |
| `far-background` | 중앙·원경과 가림 영역이 복원된 고정 배경         | `0.018 / 0.030` | `backdrop-far.png`, 불투명 RGB |
| `mid-structure`  | 좌·우 건물 전체에서 Near를 제외한 중간 깊이 mass | `0.050 / 0.065` | `backdrop-mid.png`, RGBA       |
| `near-frame`     | 좌·우 가장 가까운 외곽 건물 두 개                | `0.080 / 0.100` | `backdrop-near.png`, RGBA      |

Runtime은 캐시된 PNG만 nearest sampling과 작은 정수 시차로 그린다. depth pixel 재계산, 동적 mask, texture 재생성, WebGL은 사용하지 않는다. Terrain과 Decoration PNG는 manifest v1 계약을 위한 fallback이며 authored Sector의 기존 collision-aligned 표현은 유지한다.

Sector 03→04 경계 중심 총 `1024 world px`에서는 기존 01→02·02→03과 같은 `PixelBackdropRenderer` 권위가 Sector 03·04 package 전체와 sky gradient를 smoothstep 역비율로 합성한다. 정확한 접점은 50/50이며 far/mid/near에는 항상 같은 package alpha가 적용된다. Sector 03 package는 변경하지 않으며 이 표현 전환은 3-8과 4-1 사이에 gameplay connector를 추가하지 않는다.

```powershell
npm run validate:environment-assets -- assets/runtime/environments/sector-04-upper-residential
```

Issue #897의 최종 검증은 `verification-ledger-issue-897.md`가 소유한다.
