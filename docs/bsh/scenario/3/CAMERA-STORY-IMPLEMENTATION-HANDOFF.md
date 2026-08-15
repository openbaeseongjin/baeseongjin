# Sector 03 (3-1~3-8) Camera Zone / Story Presentation 점검·구현 Handoff

Sector 01·02와 같은 방식으로 `docs/bsh/scenario/3/3-1`~`3-8` README의
`## 14. Camera`·`## 15. Story Trigger`(및 `## 3. Story 역할`·`## 0-2/0-3`
Disclosure 절) 8개 Stage를 전수 대조한 결과를 기록하고, 실제 코드 반영 지점을
정리한다.

## Part 0 — Camera Zone은 gap이 아니다 (Sector 02와 동일 결론)

| Stage | Camera 절 원문 결론                                                                             |
| ----- | ----------------------------------------------------------------------------------------------- |
| 3-1   | `Custom Pan 없음` — "환경 규모와 조명 대비로 Reveal한다."                                       |
| 3-2   | `Custom Pan 없음` — 상태 가독성은 형태/발광/Surface Cue로                                       |
| 3-3   | `Custom Pan 없음` — 한 화면 우선 표시 목록은 Geometry 배치 계약                                 |
| 3-4   | `Custom Pan 없음` — Mobile 0.72에서 구조로 Route 구분                                           |
| 3-5   | `Custom Pan 없음`                                                                               |
| 3-6   | Stage-specific zoom을 Runtime 계약으로 확정하지 않음 — "Geometry / Layering으로 Scale을 만든다" |
| 3-7   | `Custom Pan 없음`                                                                               |
| 3-8   | 단계별 zoom 변경을 필수 조건으로 두지 않음                                                      |

8개 Stage 전부 기본 Camera(`Desktop Zoom 1`, `Mobile 0.72`, Player 38%/58%
오프셋)만 사용하고 원하는 구도는 Level Geometry 배치로 해결한다고 명시한다.
`Sector03AreaCatalog.js`에 `cameraZones`가 없는 것은 **의도된 상태**이며
`cameraZone(...)` 객체를 채우는 작업은 필요 없다. 각 Stage의 "한 화면 우선
표시" 목록(P2 Reveal, M0 Free-Weave Read 등)은 Camera 코드가 아니라 Geometry
좌표 계약으로 남는다.

## Part 1 — Story Trigger는 위치 기반 Signage다

Sector 03 Story Trigger는 Sector 01의 HUD Toast 위주 문구가 아니라 **데크별
World Panel/Sign 텍스트**다. Runtime 매핑은 Sector 02의 기존 계약을 그대로
사용한다: 각 표지 위치에 `story-display` world object를 두고, object의
`cueIds`를 `AuthoredStoryPresentation.js`의 `TRIGGER_CUE_PRESENTATIONS`에
바인딩해 플레이어가 bounds 안에 들어오면 HUD Toast로 표시한다.

### 구현된 매핑 (표지 → cueId → 문구)

- **3-1** P1 `district-sign` → `COMMERCIAL DISTRICT / PROMENADE 06` · P1
  `welcome-kiosk`(Optional) → `WELCOME / PUBLIC SERVICE ONLINE`
- **3-2** P1 `access-control` → `COMMERCIAL ACCESS CONTROL / EMPLOYEE VERIFIED`
  → `ROUTE AUTHORIZATION / INVALID` · P2 부근 `service-mount` →
  `SERVICE MOUNT ACCESS / CYCLING` · Exit `retail-security-ahead` →
  `RETAIL SECURITY / ACTIVE`
- **3-3** P1 `retail-security` → `RETAIL SECURITY / ACTIVE` · S2 `route-state`
  → `VERTICAL SERVICE ROUTE / AUTHORIZATION INVALID` · S2 부근 `patrol-status`
  → `AUTOMATED PATROL / ONLINE` · P5 `service-arcade-next` →
  `SERVICE ARCADE / NEXT`
- **3-4** P1 `route-split` → `PUBLIC PROMENADE / ←` → `FACILITY SERVICE / →`
  · PU1 `public-route` → `PUBLIC ROUTE / AUTHORIZATION INVALID` →
  `SECURITY CONTROL / ACTIVE` · SV1 `service-route` →
  `FACILITY SERVICE ACCESS / MAINTENANCE CLEARANCE RECOGNIZED` →
  `LOCAL SERVICE ROUTE / AVAILABLE` · M1 `service-node-upper` →
  `COMMERCIAL SERVICE NODE / UPPER LEVEL`
- **3-5** P2 `node-id` → `COMMERCIAL FACILITY SERVICE NODE` · N1
  `access-summary` → `EMPLOYEE CLASS / VERTICAL MAINTENANCE` →
  `LOCAL SERVICE CHANNEL / AVAILABLE` → `VERTICAL ROUTE AUTHORIZATION /
INVALID` · P4 `premium-atrium-ahead` → `PREMIUM ATRIUM / UPPER PROMENADE`
- **3-6** P1 `atrium-id` → `PREMIUM ATRIUM` · P2 `power-state` →
  `LOCAL POWER BUS / ACTIVE` → `COMMERCIAL SERVICE NETWORK / ONLINE` · P4
  `upper-concourse` → `UPPER CONCOURSE` · P5 `access-control-ahead` →
  `ACCESS CONTROL AHEAD`
- **3-7** P1 `concourse-sign` → `UPPER CONCOURSE / OUTER GALLERY` →
  `PRIORITY SPINE / FACILITY SERVICE` · M2 `access-directory` →
  `UPPER CONCOURSE ACCESS CONTROL / SERVICE CLASS CONTROL` →
  `STANDARD / PREMIUM PROFILES / ENABLED` → `ACCESS TIER CONTROL / ENABLED`
  → `PRIORITY ROUTE / ACTIVE` · P5 `upper-market-gate-ahead` →
  `UPPER MARKET GATE / TRANSFER CONTROL`
- **3-8** P1 `market-gate` → `UPPER MARKET GATE / ACCESS CONTROL ACTIVE` ·
  M0 `market-directory` → `UPPER MARKET / ACCESS CONTROL ACTIVE` →
  `FACILITY SERVICE / AVAILABLE` · A1 좌 `evacuation-archive` →
  `EVACUATION TRANSFER ARCHIVE / GROUP A · TRANSFER COMPLETE` →
  `GROUP B / TRANSFER COMPLETE` → `GROUP C / TRANSFER SUSPENDED` · A1 우
  `access-archive` → `UPPER COMMERCIAL ACCESS ARCHIVE / SERVICE CLASS CONTROL
ENABLED` → `ACCESS TIER CONTROL / ENABLED` → `PRIORITY ROUTE / ACTIVE` ·
  P6 `final-control` → `UPPER CONTROL / ROUTE STATUS PENDING`

3-8 A1은 README의 `archiveStoryTrigger: mandatory-on-enter` 계약대로 두
display가 같은 데크(같은 공간, 서로 다른 터미널)에 배치돼 진입 시 자동
노출되며, 두 기록을 연결하는 화살표·동일 행·동일 색 분류·공유 A/B/C 라벨은
두지 않는다(HUD Toast는 순차 표시뿐이므로 이 제약을 자연히 만족한다).

### 금지 문구 (코드에 추가하지 않음)

- 3-1/3-2/3-3/3-4/3-5/3-6 공통: `GROUP A/B`, `PRIORITY CUSTOMER`, `TIER A/B`,
  `EXECUTIVE ACCESS`, `WORKER DENIED`
- 3-7: `STANDARD = GROUP C`, `PREMIUM = GROUP B`, `PRIORITY = GROUP A` 등
  Service Class·Access Tier·Evacuation Group의 3단 대응, M2에서 Evacuation
  Group A/B/C 재표시
- 3-8: `GROUP A → PRIORITY` 등 대응 확정, `C SUSPENDED BECAUSE PRIORITY`,
  `NEXT: SECTOR 04` / `BOSS AHEAD` / `TRANSIT BOSS` 전환 문구

## Part 2 — 코드 반영 지점

1. `src/game/world/areas/sector03/Sector03AreaCatalog.js` 각 area `objects`에
   위 표지 `story-display` 추가(데크 상단에 배치).
2. `src/game/presentation/AuthoredStoryPresentation.js`
   `TRIGGER_CUE_PRESENTATIONS`에 위 cueId별 문구 순서 추가.
3. `tests/authoredStoryPresentation.mjs`에 3-2 access-control·3-7
   access-directory·3-8 evacuation/access archive 케이스 보강.
4. `docs/scenario-development-integration.md` 반영 기록과 fingerprint 갱신.

Sector 03의 `storyTriggers` 배열은 기존 catalog 필드로 유지하고, 이 문서가
추가하는 것은 display object + cue 바인딩뿐이다.
