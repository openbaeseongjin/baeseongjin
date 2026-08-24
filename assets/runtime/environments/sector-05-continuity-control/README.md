# sector-05-continuity-control runtime environment

## 상태

- Package ID: `environment-sector-05-continuity-control`
- 적용 범위: `sector-05-01`~`sector-05-08` 및 seamless Runtime의 대응 Area ID
- 상태: 수동 검수 Far/Mid/Near 배경 + 게임 규격 우선 V2 Sector 05 terrain skin Runtime 통합 완료
- 원본: `assets/artwork/environments/sector-05-continuity-control-vertical-master/source/layer-split-dense-city-transition/`
- Runtime export: `assets/artwork/environments/sector-05-continuity-control-vertical-master/export/layer-split-dense-city-transition/`
- Terrain 원본·export: `assets/artwork/environments/sector-05-continuity-control-platforms/`
- Runtime 크기: 세 backdrop layer 각각 `1024×1536`
- Terrain 크기: RGBA fill `32×32`, RGBA edge `32×8`
- 비범위: Collision, one-way edge chain, surface kind, grappleable, Rope, Physics, Camera, Stage progression, Enemy, Network authority

| 레이어 | 역할 | Parallax X/Y | 형식 |
|---|---|---:|---|
| `far-background` | hidden apron을 포함한 순수 후경과 완전한 중앙 원경 구조 | `0.015 / 0.025` | `backdrop-far.png`, 불투명 RGB |
| `mid-structure` | Near를 제외한 좌우 건물 전체 | `0.045 / 0.055` | `backdrop-mid.png`, RGBA |
| `near-frame` | 화면 양끝의 가장 가까운 좌우 프레임 | `0.075 / 0.090` | `backdrop-near.png`, RGBA |

Runtime은 캐시된 PNG만 nearest sampling과 제한된 시차로 그린다. depth pixel 재계산, 동적 mask, texture 재생성과 WebGL은 사용하지 않는다. Terrain V2는 warm-neutral pale-titanium walking cap·cool sealed composite body·graphite precision seam·제한된 violet-gray service recess를 기존 collision polygon과 one-way edge chain 위에 그린다. Decoration PNG는 manifest v1 계약을 유지하며 collision을 만들지 않는다.

solid platform은 두꺼운 밀폐 control-deck body와 넓은 load shell, one-way platform은 authored polygon의 얇은 두께와 중성 pale-steel chain stroke로 구분한다. 일반 terrain에는 socket·jaw·hook·post·rail을 넣지 않아 기존 grappleable hardpoint만 돌출된 기계 실루엣으로 남긴다. Cyan Rope·Anchor 및 Red/Orange Telegraph와 경쟁하는 terrain accent는 사용하지 않는다. 위치·크기·collision·grappleable·Rope·Physics·맵 동선·멀티플레이 상태는 변경하지 않는다.

## 합성 검수

- 중립 합성의 입력 원본 대비 decoded pixel mismatch: `0`
- Mid/Near alpha overlap: `0`
- Mid/Near의 보이는 원본 pixel mismatch: `0`
- Far와 이동 합성의 투명 pixel: `0`
- Mid와 Near는 hard alpha만 사용하며 구조물 소유권을 Far와 나누지 않는다.

## 인접 Sector 전이

Sector 04→05 경계는 공용 `PixelBackdropRenderer`가 Player world Y에서 파생한 smoothstep 비율로 양쪽 package와 sky를 opacity 교차 합성한다. 전환은 표현 전용이며 gameplay·camera·network state를 추가하지 않는다. Sector 04 package와 03→04 전환은 Issue #897이 소유하고, 이 package는 그 공용 전환 계약이 main에 병합된 뒤 최신 base에서 연결한다.

```powershell
npm run validate:environment-assets -- assets/runtime/environments/sector-05-continuity-control
```
