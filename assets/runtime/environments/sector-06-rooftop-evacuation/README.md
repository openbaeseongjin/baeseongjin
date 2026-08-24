# sector-06-rooftop-evacuation runtime environment

## 상태

- Package ID: `environment-sector-06-rooftop-evacuation`
- 적용 범위: `sector-06-01`~`sector-06-08`
- 상태: depth-island 배경 + Sector 06 Rooftop Evacuation terrain skin Runtime 통합
- 원본: `assets/artwork/environments/sector-06-rooftop-evacuation-background/`
- Terrain 원본·export: `assets/artwork/environments/sector-06-rooftop-evacuation-platforms/`
- Runtime 입력: opaque fixed background 1장과 좌·우 RGBA parallax island 2장, 모두 `1024×1536`
- Terrain 크기: RGBA fill `32×32`, RGBA edge `32×8`
- 비범위: Collision, one-way edge chain, surface kind, grappleable, Rope, Physics, Camera, Stage progression, Enemy, Network authority

| 레이어 | 역할 | Parallax X/Y | 형식 |
|---|---|---:|---|
| `fixed-background` | inpaint가 끝난 불투명 원·중경 | `0.012 / 0.018` | `backdrop-fixed.png`, RGB |
| `parallax-island-left` | 좌측 연결 근경 건물 island | `0.060 / 0.070` | `parallax-island-left.png`, RGBA |
| `parallax-island-right` | 우측 연결 근경 건물 island | `0.060 / 0.070` | `parallax-island-right.png`, RGBA |

Runtime은 정규화된 PNG만 nearest sampling과 정수 좌표 이동으로 그린다. depth map 처리, per-frame mask 생성, texture 재생성, WebGL 전용 경로를 추가하지 않는다. Terrain은 pale aviation-metal walking cap·deep navy의 열린 service-gantry bay·32px 단위 사선 load brace를 기존 collision polygon과 one-way edge chain 위에 그린다. Decoration PNG는 manifest v1 계약을 유지하며 collision geometry를 만들지 않는다.

solid platform은 두꺼운 외부 load-bearing deck와 열린 brace 하부, one-way platform은 authored polygon의 얕은 두께와 중성 pale-steel chain stroke로 구분한다. 일반 terrain에는 antenna·mast·rail·socket·hook 같은 돌출물을 넣지 않으며, muted amber aviation accent는 `landing-pad` zone에만 제한한다. Cyan Rope·Anchor와 Red/Orange Telegraph가 terrain보다 먼저 읽히며 위치·크기·collision·grappleable·Rope·Physics·맵 동선·멀티플레이 상태는 변경하지 않는다.

## Stage 노출 리듬

세로 master의 crop은 Sector 전체 등반 비율과 Sector 06 전용 `0.05` reveal offset을 따른다. 6-1~6-6에는 건물 밀도를 유지하고 6-7부터 상단 하늘이 좁게 보이며 6-8 Pad 03 접근에서 하늘·Pad·Shuttle 노출이 커진다. 화면 구도를 위해 Stage geometry나 Camera를 바꾸지 않는다.

## Sector 05→06 전환

공용 `PixelBackdropRenderer`가 Player world Y 기반 smoothstep 비율로 sky와 양쪽 package를 교차 합성한다. 나가는 Sector 05 package의 세 layer는 같은 alpha로 감소하고 최대 `12px`까지 같은 blur가 증가한다. 들어오는 Sector 06 package의 세 layer는 blur 없이 같은 비율로 증가한다. 표현 전환은 gameplay·camera·collision·network state를 추가하지 않는다.

```powershell
npm run validate:environment-assets -- assets/runtime/environments/sector-06-rooftop-evacuation
```
