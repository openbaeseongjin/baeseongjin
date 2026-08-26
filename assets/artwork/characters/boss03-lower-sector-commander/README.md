# Boss03 Lower Sector Commander 그래픽 원본

> 상태: **APPROVED AUTHORING SOURCE / LOCAL RUNTIME INTEGRATED**

사용자가 승인한 Boss03 본체·장비·상태별 reference와 Player 스타일 모션 원본을 보존한다. 정규화한 10개 본체 모션과 그랩 VFX는 `assets/runtime/characters/lower-sector-commander-v1/`에 연결하지만, 이 authoring 폴더는 충돌·피해·물리·네트워크 권위를 만들지 않는다.

## 파일

| 역할 | 파일 | 규격·상태 |
| --- | --- | --- |
| 승인 원본 | [`source/commander-base-sprite-approved-source.png`](./source/commander-base-sprite-approved-source.png) | `1024×1536px` RGB · 체크무늬가 실제 배경에 포함된 사용자 선택 원본 · SHA-256 `B452FE68B659F29726ADAB6D768F61DC65E3D0DC1485D71CBF81EEC0AAD91F93` |
| 검토 export | [`export/commander-base-sprite-approved-128x192.png`](./export/commander-base-sprite-approved-128x192.png) | `128×192px` RGBA · alpha `0/255` · 우향 · 발 중앙 anchor `(64, 152)` · SHA-256 `2528D781466B3B5960E38E8D432876CA33930807D959E09967A99313AEA78110` |
| 사슬 훅 승인 원본 | [`source/commander-chain-hook-approved-source.png`](./source/commander-chain-hook-approved-source.png) | `1024×1536px` RGB · 단일 체인·단일 훅 사용자 승인 원본 · SHA-256 `BE347689641995CE940AD6EF52EC76629F4FFB99E941DDA3D0F7FE352C720D15` |
| 사슬 훅 검토 export | [`export/commander-chain-hook-approved-128x192.png`](./export/commander-chain-hook-approved-128x192.png) | `128×192px` RGBA · alpha `0/255` · 우향 결합 방향 · SHA-256 `02639E7EE42A9A51B7A690D4554AC4601A12B18153B918CC765A3EF7E8E83516` |
| 휴대형 해머 승인 원본 | [`source/commander-hammer-arm-approved-source.png`](./source/commander-hammer-arm-approved-source.png) | `1024×1536px` RGB · 중량형 분절 팔·기계 손·별도 손잡이·대형 사각 머리 사용자 승인 원본 · SHA-256 `906CB20E2280358BFEB225AD3C1CC38D1AF4CA13F6A06633EEEBD9C6525BDD7C` |
| 휴대형 해머 검토 export | [`export/commander-hammer-arm-approved-128x192.png`](./export/commander-hammer-arm-approved-128x192.png) | `128×192px` RGBA · alpha `0/255` · 우향 결합 방향 · SHA-256 `4DC65825FE41F4AE8ADA882CE2ACDCF288EF4A773E7941D61105C7D65FD80F4D` |
| 그랩 대상 고정 예고 승인본 | [`source/commander-grab-target-lock-telegraph-approved.png`](./source/commander-grab-target-lock-telegraph-approved.png) | `1536×1024px` RGB · 눈 센서 조준 레이저+대상 발밑 경고 원 상태 참고 · SHA-256 `DD879002C906BBDD8320CE0A7516E53826F212144CE920052B7C50E8A359C972` |
| 그랩 끌어오기 성공 승인본 | [`source/commander-grab-pull-success-approved.png`](./source/commander-grab-pull-success-approved.png) | `1536×1024px` RGB · 단일 사슬·단일 곡선 훅·Player 강제 이동 상태 참고 · SHA-256 `3D7FD1E3952A2CA6482E3D42D6D944F7061808CDABA9D5896FD26570CCD64AE0` |
| 보행 접지 자세 승인 원본 | [`source/commander-walk-contact-approved-source.png`](./source/commander-walk-contact-approved-source.png) | `1024×1536px` RGB · 체크무늬가 실제 배경에 포함된 사용자 승인 자세 원본 · SHA-256 `0BEDC0A52A03277A8CE6213C8CE35CAD0340963D1A36788A265483C92774DF84` |
| 보행 접지 자세 검토 export | [`export/commander-walk-contact-approved-128x192.png`](./export/commander-walk-contact-approved-128x192.png) | `128×192px` RGBA · alpha `0/255` · 발 중앙 anchor `(64, 152)` · SHA-256 `36F18509245EA15BDD60BAA598CA6394B0BDEC73B22DD2965D35A414DEA190CF` |
| 그랩 구속 승인본 | [`source/commander-grab-held-approved.png`](./source/commander-grab-held-approved.png) | `1536×1024px` RGB · 보스 앞 근거리·단일 사슬·단일 곡선 훅·해머 중립 상태 참고 · SHA-256 `E6884E189CC800FDA1FB9205DE94F4912E195DA8A75CA8368F76BA3BB1F29A98` |
| 그랩 예고 본체 승인 원본 | [`source/commander-grab-telegraph-body-approved-source.png`](./source/commander-grab-telegraph-body-approved-source.png) | `1024×1536px` RGB · Player·조준선·경고 원을 제외한 사용자 승인 자세 원본 |
| 그랩 예고 본체 승인 export | [`export/commander-grab-telegraph-body-approved-128x192.png`](./export/commander-grab-telegraph-body-approved-128x192.png) | `128×192px` RGBA · alpha `0/255` · 발 중앙 anchor `(64, 152)` · SHA-256 `B29BBBA8B4ABF038B6036AEBB13FE882676E0CB2B696A5F01A1C5DE5816D03A1` |
| 당김 본체 승인 export | [`export/commander-grab-pull-body-approved-128x192.png`](./export/commander-grab-pull-body-approved-128x192.png) | `128×192px` RGBA · alpha `0/255` · 발 중앙 anchor `(64, 152)` · 체인·훅 제외 · SHA-256 `8E46EFBB84647D1BB70141084386EEDCC7FCC25FF4395D357F866757CF3A198C` |
| 당김 훅 머리 승인 export | [`export/commander-grab-hook-head-approved-48x48.png`](./export/commander-grab-hook-head-approved-48x48.png) | `48×48px` RGBA · alpha `0/255` · 단일 곡선 훅과 상단 결합 고리 · SHA-256 `734748C5C725E871554830B59C72C13E8B3DCA546D26E98266E7CDBD409EA7FC` |
| 당김 체인 링크 승인 export | [`export/commander-grab-chain-link-approved-16x16.png`](./export/commander-grab-chain-link-approved-16x16.png) | `16×16px` RGBA · alpha `0/255` · 회전·반복용 단일 수평 링크 · SHA-256 `EF45788AC0E2B0AE4836C9C81CF55714A07267D31BDD1F1E5787DDD403EE9383` |
| 구속 본체 승인 export | [`export/commander-grab-held-body-approved-128x192.png`](./export/commander-grab-held-body-approved-128x192.png) | `128×192px` RGBA · alpha `0/255` · 발 중앙 anchor `(64, 152)` · Player·체인·훅 제외 · SHA-256 `4D7CC3D6BF1F4560244F9216C6F57DCC25185969D8773D732C7C984CF7FE6B29` |
| 구속 훅 머리 승인 export | [`export/commander-grab-held-hook-head-approved-48x48.png`](./export/commander-grab-held-hook-head-approved-48x48.png) | `48×48px` RGBA · 당김 승인 훅 머리 재사용 · SHA-256 `734748C5C725E871554830B59C72C13E8B3DCA546D26E98266E7CDBD409EA7FC` |
| 구속 체인 링크 승인 export | [`export/commander-grab-held-chain-link-approved-16x16.png`](./export/commander-grab-held-chain-link-approved-16x16.png) | `16×16px` RGBA · 당김 승인 체인 링크 재사용 · SHA-256 `EF45788AC0E2B0AE4836C9C81CF55714A07267D31BDD1F1E5787DDD403EE9383` |
| 그랩 예고 픽셀 저작 후보 | [`source/boss03-grab-telegraph-pixel-authoring-v2.png`](./source/boss03-grab-telegraph-pixel-authoring-v2.png) | `1024×1536px` RGB · 체크무늬 포함 ImageGen source |
| 기본 대기 픽셀 저작 후보 | [`source/boss03-idle-pixel-authoring-v1.png`](./source/boss03-idle-pixel-authoring-v1.png) | `1024×1536px` RGB · 체크무늬 포함 ImageGen source |
| Player 스타일 대기 후보 | [`source/boss03-idle-player-style-authoring-v2.png`](./source/boss03-idle-player-style-authoring-v2.png) | `1024×1536px` RGBA · 모션 스타일 탐색 source |
| Player 스타일 대기 선택본 | [`source/boss03-idle-player-style-selected-v1.png`](./source/boss03-idle-player-style-selected-v1.png) | `1024×1536px` · 사용자 선택 모션 외형 기준 |
| 모션 저작 v1 | [`source/motion-authoring-v1/README.md`](./source/motion-authoring-v1/README.md) | pull v2·summon을 포함한 9개 클립·53개 생성 프레임·결정적 Runtime 정규화 |
| 점프 모션 v2 | [`source/motion-authoring-v2-jump/README.md`](./source/motion-authoring-v2-jump/README.md) | `jump` 6프레임·투명 atlas·대표 apex·Runtime 연결 |

## 승인 외형

- 먹색·녹슨 철색의 둥근 장갑 본체, 낮은 센서 헤드, 넓은 어깨, 짧고 굵은 두 다리와 넓은 발을 유지한다.
- 검은 원형 전면 판과 두 적·주황 센서등을 유지한다.
- 한쪽 팔의 굵은 사슬과 곡선형 산업 훅은 중립 위치에 두고, 반대 손은 별도 손잡이 하단을 쥔 대형 사각 산업 해머를 든다.
- 손, 손잡이와 해머 머리는 분리된 실루엣으로 보이며 팔 융합형 해머나 손 변형으로 바꾸지 않는다.
- 승인 사슬 훅 파츠는 상단 우측 어깨 결합부, 중량형 분절 팔, 손목에서 이어지는 하나의 느슨한 굵은 사슬과 하나의 대형 곡선 훅만 사용한다. 여분 체인·두 번째 훅·Player Rope·전기 무기로 바꾸지 않는다.
- 승인 휴대형 해머 파츠는 상단 좌측 어깨 결합부에서 이어지는 중량형 분절 팔과 기계 손을 사용한다. 손은 별도 손잡이 하단을 감싸 쥐고, 대형 사각 머리는 손 위에 두며 짧은 손잡이 끝은 손 아래로 보인다. 손·손잡이·머리를 융합하거나 해머를 작게 줄이거나 거꾸로 쥐게 바꾸지 않는다.
- 승인 그랩 예고 상태는 몸 중앙의 두 눈 사이 센서부에서 고정 대상에게 이어지는 황색 조준 레이저와 대상 발밑 경고 원을 동시에 사용한다. 훅 손목에서 레이저를 발사하지 않으며 예고 중 사슬 훅은 발사 전 상태다.
- 승인 끌어오기 상태는 훅 팔에서 이어지는 하나의 팽팽한 사슬 끝에 하나의 대형 곡선 훅을 두고, 그 훅이 Player 허리를 붙잡아 보스 앞으로 당기는 순간을 사용한다. 체인 링크가 Player를 직접 감거나 두 번째 훅·Rope·전기 효과를 추가하지 않는다.
- 승인 보행 자세는 앞발을 진행 방향에 접지하고 뒷발을 밀어내며, 본체 중량을 앞발 위로 옮긴다. 사슬 훅과 손에 든 해머는 중립 휴대하고 공격 예고·레이저·VFX를 추가하지 않는다.
- 승인 구속 상태는 Player를 보스 앞발 한 명분 거리 안에 두고, 손목에서 이어지는 짧은 단일 사슬 끝의 단일 곡선 훅으로 허리를 고정한다. 해머는 중립 휴대하며 아직 내려찍지 않는다.

## 제작·출처

- 도구: Codex 내장 이미지 생성과 결정적 픽셀 export 정규화.
- 정규화 도구: [`source/normalize_approved_sprites.py`](./source/normalize_approved_sprites.py). 밝은 중성 체크무늬 중 캔버스 가장자리와 연결된 영역만 제거하고, nearest-neighbor로 `128×192`에 맞춘 뒤 alpha를 `0/255`, 발 바닥선을 `y=152`로 고정한다.
- 원본 형식: 사용자 제공·선택 PNG. 외부 웹 이미지나 제3자 그래픽 파일은 합성하지 않았다.
- 검토 export는 승인 원본의 8배 픽셀 블록을 `128×192` 정수 격자로 옮기고 밝은 중성 체크무늬만 투명 처리했다. 새 형태나 장비를 다시 그리지 않았다.
- 검토 export의 불투명 영역은 `(2, 28)~(125, 152)`이며 두 발이 닿는 바닥선 중앙 `(64, 152)`을 anchor 검토 기준으로 사용한다.
- 보행 검토 export의 불투명 영역은 `(6, 28)~(121, 152)`이며 같은 발 중앙 anchor를 사용한다.
- 그랩 예고 본체 승인 export의 불투명 영역은 `(4, 42)~(123, 152)`이며 같은 발 중앙 anchor를 사용한다.
- 당김 본체 승인 export의 불투명 영역은 `(5, 62)~(123, 152)`이며 같은 발 중앙 anchor를 사용한다. 팔 끝은 체인·훅 레이어가 결합할 손목 발사구다.
- 당김 훅 머리 승인본은 상단 고리가 체인 결합부이고, 체인 링크 승인본은 중심을 회전·반복 검토 기준으로 사용한다. 실제 결합 좌표와 체인 길이는 PNG가 아니라 향후 renderer 계약이 소유한다.
- 구속 본체 승인본의 불투명 영역은 `(6, 43)~(121, 152)`이며, 당김보다 힘이 풀린 낮은 접지 자세와 앞발 가까이 아래로 향한 빈 손목 발사구를 사용한다. 해머는 중립으로 세워 들고 Player·훅·체인은 포함하지 않는다.
- 구속 훅 머리와 체인 링크 승인본은 당김 승인 부품을 그대로 재사용한다. 구속 상태 차이는 새 장비 외형이 아니라 본체 자세와 renderer가 정하는 짧은 체인 배치로 표현한다.
- 사슬 훅 검토 export도 승인 확대 원본을 같은 정수 격자와 hard alpha로 정규화했으며, 결합 좌표나 공격 범위를 새로 정하지 않는다.
- 휴대형 해머 검토 export도 승인 확대 원본을 같은 정수 격자와 hard alpha로 정규화했다. 불투명 영역은 `(9, 25)~(116, 166)`이며 이 범위는 결합 좌표나 공격 판정을 정하지 않는다.
- 구속 분리 P0 검수 결과는 [`GRAB_HELD_P0_VALIDATION.md`](./GRAB_HELD_P0_VALIDATION.md)에 기록한다.

## Runtime v1 정규화

- ImageGen 모션 보드는 [`source/motion-authoring-v1/`](./source/motion-authoring-v1/)에 보존하고, `normalize_runtime_assets.py`가 frame 분리·16색 palette·alpha `0/255`·nearest-neighbor 2배 확대를 결정적으로 수행한다.
- 본체 기본 clip은 `256×256`, 좌우 동작 폭이 큰 pull·summon은 `288×256` cell을 사용하고 공통 anchor Y `(0.59375)`를 유지한다. 각 clip 첫 기준 자세의 불투명 높이는 `184px`이며 긴 해머·훅은 본체를 줄이지 않고 투명 canvas를 사용한다.
- `walk` 8프레임은 이동 거리 `144px`마다 한 주기를 재생한다. collider·이동 속도·AI와 분리된 표현 주기다.
- 공격 clip은 gameplay `direction`과 원본 방향을 비교해 그랩·해머·돌진이 판정 방향을 바라보게 한다.
- 사출 훅·반복 사슬·당김 장력은 [`assets/artwork/effects/boss03-chain-hook-pull/`](../../effects/boss03-chain-hook-pull/)에서 분리 저작한다.
- `jump`는 별도 v2 source와 6프레임 atlas를 사용한다. 이륙 준비·상승·정점·낙하는 gameplay `jump` 상태 동안 재생하고 착지 frame은 `neutral` 전환 표현으로 분리한다.

## 사용 경계

- 넓은 장면형 승인본과 단일 검토 export는 Runtime atlas가 아니며 시각 관계 참고로만 사용한다.
- 기본 `sprite` profile은 정규화된 local Runtime package를 사용하고, 리소스 실패·미지원 상태와 `polygon` profile은 기존 Boss Polygon으로 복구한다.
- Boss 전용 공개 manifest·validator는 아직 없다. 코드 소유 불변 clip과 package README가 현재 local Runtime 계약이다.
- 당김 넓은 승인본은 상태 관계 참고이고, 당김 본체·훅 머리·체인 링크 승인본은 분리 렌더링을 위한 authoring export다. Player나 고정 길이 체인을 본체 PNG에 합치지 않는다.
- 그랩 예고 승인본은 시각 관계를 검수하는 넓은 참고 프레임이며 실제 Arena 배치·사거리·피격 범위를 정하지 않는다.
- 끌어오기 승인본도 시각 관계를 검수하는 넓은 참고 프레임이며 실제 이동 속도·피해·사거리·충돌 판정을 정하지 않는다.
- 그래픽 크기·프레임 시간·VFX는 collider·hitbox·피해량·사거리·물리·네트워크 결과를 바꾸지 않는다.
