# Sector 02 Worker District Background

## 상태

- 자산 ID: `sector-02-worker-district-background`
- 분류: Sector 02 공용 환경 배경 authoring 원본
- 상태: `RUNTIME INTEGRATED`
- Runtime 상태: `assets/runtime/environments/sector-02-worker-district/`에서 Sector 02 전용 비충돌 backdrop으로 연결
- 기준 문서: `docs/bsh/scenario/2/README.md`, `docs/bsh/scenario/SCENARIO-ART-GENERATION-STANDARD.md`
- 현재 추천 검토본: `export/sector-01-to-02-transition-background-v3.png`
- 현재 추천 패럴랙스 검토본: `preview/sector-02-worker-district-parallax-composite-v1.png`

이 이미지는 Sector 02 전체의 `VERTICAL · DENSE · MODULAR · WORN · LIVED-IN` 분위기를 검토하기 위한 공용 배경 후보다. 특정 Stage의 Gameplay Camera Shot, Approved Blockout, Collision Surface 또는 전체 이동 경로를 결정하지 않는다. 2-1~2-8에는 아직 Approved Blockout이 없으므로 Stage별 Scenario Art Reference로 사용하지 않는다.

2026-08-20의 `v2`는 로딩 없이 이어지는 Sector 01→02 경계를 위한 세로형 전이 후보로 추가했다. 아래에서 위로 `industrial-maintenance → conversion/service interstitial → worker residential` 비율을 점진적으로 바꾸며, 두 Sector가 공유하는 중앙 Vertical Void·Dark Navy/Charcoal 골조·배관 언어는 유지한다.

## 제작 규격

- 출력 크기: `1672 × 941 px`
- 형식: 불투명 RGB PNG, 24 bpp
- 화면 비율: 16:9 landscape
- 표현: 하드 엣지 high-bit 2D pixel-art 배경
- 주요 색: Dark Navy, Charcoal, desaturated Steel Blue, sparse Warm Yellow, Amber, muted Emergency Red
- 깊이: 어두운 근경 프레임, 주거 모듈 중경, Blue Haze 원경
- 중앙: Rope 이동과 Gameplay 판독성을 위한 큰 수직 Negative Space

### Sector 01→02 전이 v2

- 출력 크기: `1024 × 1536 px`
- 형식: 불투명 RGB PNG, 24 bpp
- 화면 비율: 2:3 portrait
- 하단 약 35%: Sector 01 산업 정비 구조와 차가운 설비광
- 중앙 약 30%: 기존 산업 골조에 발코니·계단·주거 설비가 점진적으로 덧대어진 전이층
- 상단 약 35%: Sector 02 Worker District의 주거 모듈·생활 흔적·낮은 밀도의 온색 조명
- 접합 불변식: 중앙 Void 폭, 좌우 구조 질량, Dark Navy/Charcoal 기반과 배관 문법을 경계 양쪽에서 유지

### Sector 02 far/mid/near 패럴랙스 v1

- 입력 이미지 크기: `1024 × 2176 px`
- 공통 출력 좌표계: `1024 × 2176 px`
- `far`: 불투명 RGB PNG. Deep City Void, 원거리 Housing Silhouette, 낮은 대비의 Blue/Violet Haze와 희소한 원거리 조명
- `mid`: 투명 RGBA PNG. 좌우의 중거리 Apartment Module, Stair Tower, Service Rail, Balcony와 생활 흔적
- `near`: 투명 RGBA PNG. 화면 가장자리의 어두운 Wall Mass, 대형 Pipe/Duct, Fan Housing, 하단 Cross-pipe와 가까운 Balcony
- 합성 순서: `far → mid → near`
- 공통 불변식: 중앙 Vertical Void, 세로 vanishing axis, 좌우 구조 질량, Dark Navy/Charcoal 기반, 낮은 밀도의 Warm Window
- 비범위: Collision, Gameplay Surface, Anchor, Rope, Enemy, Camera

## 생성 기록

- 도구: OpenAI built-in ImageGen, 2026-08-19 KST
- 입력 형식: 텍스트 프롬프트
- 외부 이미지 입력: 없음
- 출처: 프로젝트 Sector 02 시나리오 문서만 사용
- 라이선스 메모: 외부 이미지·상표·로고를 입력하지 않은 AI 생성 원본. 배포 전 프로젝트의 생성 자산 정책과 최종 사용권 검토가 필요하다.

핵심 프롬프트는 거대한 폐쇄형 노동자 주거 Mega-Structure, 반복되는 Apartment Module·외부 계단·배관·세탁물·대피 흔적, 중앙 Vertical Void, 낮은 밀도의 온기와 비상등을 요구했다. Player·NPC·Rope·Anchor·Drone·무기·읽을 수 있는 문구·Route 선·UI·Collision 권위 표현은 금지했다. 첫 결과의 회화적 표면과 원근감을 보정하기 위해 두 번째 패스에서 구도와 오브젝트를 유지한 채 square pixel cluster, hard stair-stepped edge, limited clustered shading, side-on orthographic treatment를 적용했다.

### 전이 v2 생성 기록

- 도구: OpenAI built-in ImageGen, 2026-08-20 KST
- Image 1 역할: 사용자가 제공한 Sector 01 실제 맵 배경의 하단 접합선·픽셀 밀도·팔레트·배관 재질 기준
- Image 2 역할: 기존 Sector 02 후보의 주거 모듈·생활 흔적·온색 조명 기준
- 입력 이미지 원본: `source/references/sector-01-map-background-user-reference.png`, `export/sector-02-worker-district-background.png`
- 사용자 제공 Sector 01 이미지 SHA-256: `636BE8C5B1E618BE73F24440C0731DEAB1640FA6C9E821ED1772E7F36A0E2B17`
- 라이선스 메모: Image 1은 사용자가 프로젝트의 Sector 01 맵 배경이라고 명시한 자료다. 저장소 안의 원 제작 경로·제작 도구·라이선스는 아직 식별되지 않았으므로 외부 재배포 근거로 사용하지 않는다.

최종 프롬프트는 새 이미지가 Image 1 바로 위에 놓인다고 명시하고, 하단 edge에서 중앙 Void 폭·좌우 wall mass·배관·어두운 명도를 이어받도록 했다. 하단 35%에는 주거 요소를 금지하고, 중앙 30%에서 산업 골조 위에 주거 설비를 점진 도입하며, 상단 35%에서만 Worker District 정체성을 지배적으로 보이게 했다. Sector title·경계선·Gate·Player·Rope·Anchor·Enemy·가짜 Collision Platform은 금지했다.

### 전이 v3 접합 보정

- 도구: OpenAI built-in ImageGen, 2026-08-20 KST
- 편집 대상: v2 전이 이미지
- 보존 범위: 상단 75%의 Worker District 구도·오브젝트·조명
- 변경 범위: 하단 25%의 Sector 01 접합 실루엣과 명도
- 접합 기준: Sector 01 상단의 좌측 구조 약 `x=0~320`, 중앙 Void 약 `x=320~704`, 우측 구조 약 `x=704~1024`
- 제거 대상: v2 하단의 횡단 Pipe와 Cyan 설비처럼 Sector 01 상단 구조와 중복되는 전경 요소

v3는 v2의 거시적인 Sector 변화는 유지하면서 하단을 더 어둡고 조용한 산업 골조로 정리했다. Native desktop/mobile crop에서 중앙 Void 폭과 좌우 구조 질량의 급변은 v2보다 줄었다. 다만 별도 PNG 두 장을 단순 butt-join하면 생성 이미지와 Sector 01 원본의 픽셀 클러스터가 완전히 같은 연속선은 아니므로, Runtime 정식 연결은 한 화면 높이의 overlap/전이 레이어 또는 far/mid 레이어 공용화를 통해 최종 접합해야 한다. 이 authoring 후보 자체를 즉시 통이미지 Runtime 배경으로 연결하지 않는다.

### far/mid/near 패럴랙스 v1 생성·정규화 기록

- 도구: OpenAI built-in ImageGen, 2026-08-22 KST. 세부 모델 버전은 도구가 노출하지 않음
- Image 1 역할: 사용자가 Sector 02 배경이라고 지정한 편집 대상·구도 기준
- 입력 보존본: `source/references/sector-02-worker-district-parallax-user-reference.png`
- 입력 SHA-256: `030354F8A656E886322E5E0850D58C6A91254A47B53296B37535EC7AAEA8F14D`
- 라이선스 메모: 사용자가 프로젝트의 Sector 02 배경으로 제공한 자료다. 외부 재배포 권리와 원 제작 도구는 별도 확인이 필요하다.

세 번의 편집 프롬프트는 같은 원본과 중앙 Void/vanishing axis를 고정하고, 각각 `deep city/haze only`, `middle-distance apartment stacks only`, `closest edge walls/pipes/fan only`를 요구했다. Player·Rope·Anchor·Drone·UI·읽을 수 있는 문구·새 Gameplay Platform은 모든 레이어에서 금지했다. `mid`와 `near`에는 실제 투명 RGBA를 요구했지만 도구가 `860×1828` RGB 체크무늬로 반환했으므로, `source/normalize_parallax_layers.py`가 체크무늬 matte를 알파로 복원하고 세 결과를 nearest-neighbor로 공통 `1024×2176` 좌표계에 정규화한다.

## 파일

- 생성 원본: `source/sector-02-worker-district-imagegen.png`
- 검토용 export: `export/sector-02-worker-district-background.png`
- 정지 미리보기: `preview/sector-02-worker-district-background-review.png`
- SHA-256: `08E4341DBBBFD159001A2BC91036D44AC5BC92CD38E708CB010D99AE7808AB24`

전이 v2:

- 생성 원본: `source/sector-01-to-02-transition-imagegen-v2.png`
- 검토용 export: `export/sector-01-to-02-transition-background-v2.png`
- Sector 02 위 + Sector 01 아래 접합 미리보기: `preview/sector-01-to-02-transition-stitch-review-v2.png`
- 사용자 제공 Sector 01 기준 이미지 보존본: `source/references/sector-01-map-background-user-reference.png`
- v2 export SHA-256: `D2E86632514BBD1DBE4C7BF75CBC757BB49D13D3FF5EDC5798CBBFE491661345`
- 접합 미리보기 SHA-256: `9437EB7010507E9598A47B5880E243D46F25B96CDDC5D8A27D0023C58E847620`

전이 v3:

- 생성 원본: `source/sector-01-to-02-transition-imagegen-v3.png`
- 현재 추천 export: `export/sector-01-to-02-transition-background-v3.png`
- 전체 접합 미리보기: `preview/sector-01-to-02-transition-stitch-review-v3.png`
- Desktop native crop: `preview/sector-01-to-02-transition-desktop-crop-v3.png`
- Mobile-landscape native crop: `preview/sector-01-to-02-transition-mobile-crop-v3.png`
- v3 export SHA-256: `17950B5318DE2B721FFE48DECCE6C5EE9530A2F2B8382F0E704C4B9F6DB66042`
- v3 접합 미리보기 SHA-256: `F063375F2E2D32951B5F4374C1A105ACB5D17043DEE40C15585AF0A04077E004`

v2는 첫 전이 구도 기록으로 보존하지만, 하단 횡단 Pipe와 접합선 구조 폭 불일치 때문에 현재 추천 후보가 아니다.

기존 초기 후보의 source/export/preview 세 파일은 같은 PNG를 보존한다. 패럴랙스 v1의 far/mid/near PNG는 환경 manifest v1 package로 정규화해 Sector 02 authored backdrop renderer에 연결했다.

패럴랙스 v1:

- 생성 원본 far: `source/sector-02-worker-district-parallax-far-imagegen.png`
- 생성 원본 mid: `source/sector-02-worker-district-parallax-mid-imagegen.png`
- 생성 원본 near: `source/sector-02-worker-district-parallax-near-imagegen.png`
- 정규화 스크립트: `source/normalize_parallax_layers.py`
- far export: `export/backdrop-far-parallax-v1.png` — SHA-256 `09F9FDB2FCE712B89FE80E207EB0B0ED2D0898DAD539512F3CD2B927A7A5909E`
- mid export: `export/backdrop-mid-parallax-v1.png` — SHA-256 `D3AB679B358B9B9AF665039ACF1CB2C27B60C9E99E871E8D62AA61A63962C54A`
- near export: `export/backdrop-near-parallax-v1.png` — SHA-256 `66188C5A1FC8DB695E6B0CAB1475470F2AE25248F902F9D72B633AA8833A9765`
- 합성 미리보기: `preview/sector-02-worker-district-parallax-composite-v1.png`
- 레이어 미리보기: `preview/sector-02-worker-district-parallax-layers-v1.png`

## 검수와 비범위

- 문서용 Desktop 1672×941에서 중앙 Void, 주거 스케일, 생활 흔적, Warm/Cold 명도 위계를 육안 검토했다.
- Player·Rope·Anchor·Drone·읽을 수 있는 문자·경로선이 없는 것을 생성 결과에서 확인했다.
- 작은 화면에서는 중앙 Void와 좌우 주거 실루엣은 유지되지만 세탁물·대피 물품 같은 작은 Story Prop은 축소된다.
- v2 접합 미리보기에서 Sector 01 상단과 Sector 02 하단을 무보간 원본 크기로 세로 연결해, 중앙 Void·좌우 구조 질량·Dark Navy/Charcoal 명도가 경계에서 유지되고 즉시 주거 팔레트로 바뀌지 않는 것을 확인했다.
- v3는 `1024×576` Desktop crop과 `844×390` Mobile-landscape crop을 무보간으로 만들어 경계 확대 검수했다. v2보다 중앙 Void와 산업 골조의 크기 변화가 작고, Sector 02의 Warm Window·Laundry는 경계선에서 떨어져 있다.
- 패럴랙스 v1의 세 export가 모두 `1024×2176`인지 확인했다. `far`는 불투명 RGB, `mid`와 `near`는 alpha extrema `(0,255)`인 실제 RGBA이며 합성 순서 `far → mid → near`에서 중앙 Void와 좌우 구조 질량이 유지된다.
- `source/normalize_parallax_layers.py`는 `py_compile`을 통과했고 합성/레이어 미리보기를 nearest-neighbor로 생성했다.
- 기존 Collision polygon, one-way edge, Stage geometry, Camera, gameplay, physics와 network authority는 변경하지 않는다.
- Runtime package `assets/runtime/environments/sector-02-worker-district/`가 `sprite-manifest.json` validator를 통과했다.
- 실제 게임의 `sector-02-01`에서 Desktop `1280×720`과 mobile landscape `844×390` Canvas를 확인했고, 세 레이어·Gameplay surface·HUD의 합성 순서와 중앙 이동 여백이 유지된다.
- 비교 실행한 `sector-01-01`에는 이 package가 선택되지 않았고 브라우저 console warn/error는 없었다.
