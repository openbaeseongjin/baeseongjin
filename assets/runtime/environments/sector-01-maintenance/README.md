# sector-01-maintenance runtime environment

Sector 01 `1-1`~`1-8` 전체에서 선택하는 산업 정비 환경 package다. `far`, `mid`, `near`는 하나의 연속 수직 시설을 공유하고, 현재 플레이어의 Sector 01 진행률로 아래에서 위까지 스크롤한다.

## 계약

- Package ID: `environment-sector-01-maintenance`
- 선택 Area ID: `sector-01-01`~`sector-01-08`
- 원본: `assets/artwork/environments/sector-01-maintenance-vertical-backdrop/`
- 이미지: `1024×1536` far·mid·near PNG와 기존 검증용 terrain·decoration atlas
- 생성·정규화: OpenAI built-in ImageGen, 밝은 무채색 매트의 실제 alpha 정규화
- 라이선스: 프로젝트 자체 생성 자산, 외부 자산 없음

## 위치 불변식

- 이 package는 배경과 표면 표현만 바꾼다.
- 기존 collision surface, one-way edge, Area bounds, Anchor, Checkpoint, Terminal, Gate, Gate Panel, Portal trigger와 모든 world object 좌표를 변경하지 않는다.
- Gate와 상호작용 설비의 산업 정비 외형은 기존 좌표 기반 renderer가 담당한다.
- 배경의 기계와 배관은 비충돌 장식이며 새 발판이나 이동 경로를 만들지 않는다.
- 1-1 P0는 좌우 authored 경계벽 사이 `X=-448~448`를 채우는 `896×32` one-way Collision이며, `terrain:ground-foundation` 표현도 같은 폭으로 640px 깊이의 기초 슬래브를 그려 최하층 전체가 바닥으로 읽히게 한다.

## 파일

- `backdrop-far.png`: 불투명 원경 샤프트
- `backdrop-mid.png`: `mid-connected-v3`의 중경 기계·지지 구조를 유지하되 상단 `512px`에서 16단계 alpha로 공용 원경 샤프트에 수렴한다.
- `backdrop-near.png`: 투명 좌우 근경 프레임·배관. 상단 `512px`은 같은 방식으로 점차 비워 Sector 02와 구조물이 겹치지 않게 한다.
- `terrain-fill.png`, `terrain-edge.png`: collision-aligned surface skin 입력
- `decoration.png`: 비충돌 장식 입력

## Gameplay terrain skin

`PixelTerrainRenderer`는 이 package가 선택된 Sector 01 surface의 기존 `kind`를 사용해 외형만 구분한다. 좌표나 collision을 파생하지 않는다.

- `platform`: 32px 반복 패널과 청록 정비 리브를 가진 얇은 산업용 catwalk
- `recovery`: 더 어두운 매입 패널과 양끝 주황 service marker를 가진 보조 발판
- `safe-deck`: 64px 보강 패널, 세로 설비 리브와 하단 주황 경고 띠를 가진 넓은 데크
- `overhang`: 바닥처럼 보이지 않는 회색 X-brace 고정 crossbeam
- `cover` / `solid`: 32px 폐쇄형 장갑 패널
- `sealed-door`: 수평 shutter slat와 상단 주황 봉쇄 표시
- `terrain:ground-foundation`: 1-1 P0와 같은 폭으로 이어지는 깊은 기초 구조

one-way 표면은 실제 `oneWayEdgeEnd` chain을 그대로 따르는 `2px` 저채도 청회색 분절선과 32px마다 배경색으로 깊게 비운 grate aperture, 그 안의 작은 상향 절개로 구분한다. 강한 Cyan은 Anchor와 Rope에 양보하며, 색을 보지 않아도 비어 있는 얇은 catwalk와 꽉 찬 Solid·Overhang의 실루엣이 달라야 한다. 1-1 P0 `ground-foundation`은 aperture와 분절선을 사용하지 않아 최하층 바닥으로 읽히게 한다. 각 skin은 collision polygon 안에서만 본체를 그린다.

## Grapple landmark

Sector 01 `grapple-landmark`는 공용 사각 mock 대신 어두운 팔각 정비 하우징, 양쪽 잠금 jaw, 중앙 원형 coupling socket, 작은 Orange service marker와 짧은 상부 bracket으로 표시한다. 강한 Cyan은 전체 외곽선이 아니라 실제 로프가 결합하는 중앙 4px core와 socket ring에 집중한다. `areaId → sectorId` 표현 선택만 사용하며 Anchor A/B/C의 좌표, label, 24×24 비충돌 `grapple-target`, 로프 사거리와 부착 물리는 변경하지 않는다.

## Wind source 환풍구

모든 `wind-source`는 `128×128` 공용 Canvas 환풍구 표현을 사용한다. Sector 01 배경의 설비 문법에 맞춘 어두운 팔각 장갑 하우징, 청회색 보강 프레임, 안쪽으로 매입된 fan well, 십자 보호대와 네 개의 작은 Orange service fastener로 구성한다. 강한 Cyan은 작동 중인 중앙 pressure core와 3칸 출력 meter에만 제한한다. 풍향 반대쪽에는 짧은 duct collar를 붙여 측벽 설비와 연결된 인상을 준다.

환풍구 날개 회전과 출력 meter는 기존 Wind Zone의 `continuous` 또는 `lull → warning → active → decay` 상태를 그대로 사용한다. 외형 변경은 `wind-source` 좌표·radius, Wind Zone bounds·방향·세기·falloff·cycle, Wind Shadow, 충돌과 플레이어 Force를 변경하지 않는다.

## Authored boundary wall

Sector 01 좌우 경계벽은 기존 Area bounds에서 파생한 `44px` collision wall을 그대로 사용한다. 외형은 64px 반복 장갑 panel bay, 이중 세로 rail, 어두운 pipe channel, 희소한 저강도 Cyan service slot, Orange maintenance fastener와 짧은 내부 brace로 구성한다. Gate Panel 위의 층간 bulkhead는 기존의 개구부 없는 전폭 `58px` collision band 안에서 이중 수평 하중빔, 반복 X형 철골 보강재, 중앙 체결판과 양끝 한 쌍의 두꺼운 하중 post를 사용한다. Panel을 작동한 뒤 별도 Gate aperture로만 다음 영역에 갈 수 있다는 인상을 형태로 전달하며, 새 고체 실루엣이나 통로를 만들지 않는다.

## Exit Gate와 Gate Panel

현재 world object에는 별도 PNG package 계약이 없으므로 `AuthoredWorldObjectRenderer`가 Sector 01에서만 산업 정비 skin을 그린다. 표현 선택은 object `areaId → sectorId`만 사용하며 gameplay 상태를 만들거나 변경하지 않는다.

- Gate는 기존 `52×62` bottom-center bounds와 바닥 접촉을 유지한다. 잠김 상태는 폐쇄형 장갑 shutter, 반복 slat, 중앙 maintenance lock과 작은 Orange 봉쇄등을 사용한다. 개방 상태는 중앙 shutter를 완전히 비우고 측면 jamb·상부 lintel·작은 Cyan 통과등만 남긴다.
- Gate Panel은 기존 `44×45` bottom-center bounds 안에 `30×27` 본체와 짧은 pedestal을 그려 48px Player보다 작게 유지한다. 차단 상태는 닫힌 보호 slat, 조작 가능 상태는 Orange cross handle, 개방 완료 상태는 분리된 Cyan 상태창으로 구분한다.
- 전폭 층간 격벽, Gate aperture·Portal trigger, Panel interaction radius, objective와 모든 world object 좌표는 그대로다.

## Connected mid backdrop

`backdrop-mid.png`는 `sector-01-maintenance-v2-mid-connected-v3.png`의 구조를 유지하고 Sector 02 접점 상단 `512px`에 정적 seam alpha를 적용한다. 배관은 가까운 설비·서비스 레일·manifold로 이어지며, 연결이 필요 없는 배기구는 볼트 flange와 guard cap으로 의도적인 끝을 표시한다. Runtime은 접점을 중심으로 총 `1024 world px`에서 Sector 01·02 package와 sky gradient를 같은 smoothstep 비율로 교차 합성한다. 이 연결은 비충돌 표현이며 중앙 Rope 이동 여백, collision surface, one-way edge, camera, gameplay, network state와 world object 좌표를 변경하지 않는다.

## 검증

```powershell
npm run validate:environment-assets -- assets/runtime/environments/sector-01-maintenance
```

Validator 통과와 실제 게임의 데스크톱 화면 확인 전에는 최종 제작 완료로 취급하지 않는다.

2026-08-17 검수에서는 데스크톱 기본 viewport와 `390×844` 모바일 viewport의 1-1 C01을 직접 실행했다. 두 화면 모두 P0 하부 기초가 화면 아래까지 끊기지 않고 이어졌으며 Player·P0 상단 Collision Edge·Anchor A가 기초보다 먼저 읽혔다. 브라우저 console warning/error는 없었다.

같은 날짜 `mid-connected-v3` 통합 후 데스크톱과 `390×844` 모바일 1-1을 다시 확인했다. 상단 허브↔팬 보조 배관, 하단 제어함의 capped exhaust와 폐쇄 return loop가 far·near 사이의 중경으로 자연스럽게 보였고 중앙 이동 여백, Player, 발판과 Anchor의 시각 우선순위를 침범하지 않았다.

2026-08-22에는 정확한 Sector 01→02 경계를 데스크톱 `1280×720`과 모바일 가로 `844×390`에서 확인했다. 두 package는 접점에서 각각 50%로 합성됐고 terrain·HUD는 backdrop 위의 정상 순서를 유지했으며 브라우저 warning/error는 없었다.
