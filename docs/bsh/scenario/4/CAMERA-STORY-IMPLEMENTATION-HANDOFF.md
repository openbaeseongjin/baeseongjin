# Sector 04 (4-1~4-8) Camera Zone / Story Presentation 점검·구현 Handoff

Sector 01·02·03과 같은 방식으로 `docs/bsh/scenario/4/4-1`~`4-8` README의
Camera·Story 절을 전수 대조한 결과와 코드 반영 지점을 정리한다.

## Part 0 — Camera Zone은 이미 구현돼 있다 (점검 결과)

Sector 04는 Sector 02·03과 달리 8개 Stage 전부 **per-zone zoom 제안이 있는
유일한 Sector**다. 대조 결과:

| Stage | 문서 zone 제안                              | Runtime 상태                                 |
| ----- | ------------------------------------------- | -------------------------------------------- |
| 4-1   | C0~~C4(0.95~~1.00/0.72), localY band 명시   | 삭제된 legacy catalog에 동일 zoom으로 구현됐음 |
| 4-2   | C0~~C4(0.92~~1.00/0.70~0.72), **band 없음** | band는 Geometry에서 파생해 구현됨            |
| 4-3   | C0~~C4(0.88~~1.00/0.70~0.72), **band 없음** | 동일                                         |
| 4-4   | C0~~C3(0.92~~1.00/0.70~0.72), **band 없음** | 동일                                         |
| 4-5   | C0~~C4(0.86~~0.96/0.68~0.72)                | 문서 zoom 그대로 구현됨                      |
| 4-6   | C0~~C4(0.88~~1.00/0.68~0.72)                | 동일                                         |
| 4-7   | C0~~C5(0.87~~1.00/0.68~0.72)                | 동일                                         |
| 4-8   | C0~~C5(0.87~~1.00/0.68~0.72)                | 동일                                         |

4-2~4-4는 문서가 localY band를 주지 않아 Runtime은 Stage Geometry(데크·위협
경계)에서 band를 파생했다. 문서의 "Must show" 목록(예: 4-2 C1은 P1/C1/S1/R1
동시 가시, 4-4 C1은 N1 텍스트와 Player/Hook 동시 가독)은 Camera 코드가
아니라 Geometry 좌표 계약으로 남는다. 이 표는 삭제된 legacy catalog의 과거
구현 기록이며, 새 Sector04 Runtime의 구현 완료 근거가 아니다.

## Part 1 — Story Presentation 반영

Sector 04 Story는 전 Stage "짧은 infrastructure status" 원칙을 명시한다.
Runtime 매핑:

- ENTRY: Stage 진입 HUD Toast(`ENTRY_PRESENTATIONS`)
- POSITION: 데크 도달 HUD Toast(`POSITION_PRESENTATIONS`)
- 이미 catalog에 있는 `story-display`(4-4 N1, 4-7 N1/N2, 4-8 N1/Post-Sector)는
  `TRIGGER_CUE_PRESENTATIONS`로 바인딩

### ENTRY (진입 시 1회)

- 4-1 `TRANSIT BACKBONE / SERVICE DEGRADED`
- 4-2 `INFRASTRUCTURE SECURITY / ACTIVE` (4-1 Exit Preview의 직접 계승)
- 4-3 `FREIGHT BYPASS / PRESSURE SERVICE · CYCLING`
- 4-4 `INFRASTRUCTURE SERVICE NODE / LOCAL CONTROL AVAILABLE`
- 4-5 `EXPRESS SHAFT / SERVICE CHANNEL OPEN`
- 4-6 `POWER RELAY SPAN / GRID COUPLING ACTIVE`
- 4-7 `JUNCTION CONTROL / CONTAINMENT ROUTING ACTIVE`
- 4-8 `TRANSIT CONTROL TRUNK / SYSTEM ACCESS LIMITED`

### POSITION (데크 도달 시 1회, token dedup)

- 4-1 M1 접근 `UPPER EXPRESS TRUNK / LIMITED OPERATION` · P5 도착
  `INFRASTRUCTURE SECURITY / ACTIVE` → `SERVICE LINE / AHEAD`
- 4-2 C1/C2 commit 구간 `STRUCTURAL ACCESS LINE / PROTECTED` · P4
  `FREIGHT BYPASS / PRESSURE SERVICE AHEAD`
- 4-3 W1~W2 합성 구간 `TRANSIT PRESSURE / AUTOMATED CONTROL ACTIVE` · P4
  `FREIGHT SERVICE ROUTE / LIMITED OPERATION`
- 4-4 P2 주변 넓은 traversal volume(필수, 착지 기반 아님)
  `LOWER ASCENT FEEDER / STATUS: SEGMENTED` → `TELEMETRY / PARTIAL` · P4
  `EXPRESS SHAFT / SERVICE CHANNEL OPEN`
- 4-5 W1 구간 `PRESSURE ASSIST / CYCLING` · P5
  `UPPER EXPRESS TRUNK / LIMITED OPERATION`
- 4-6 M0 `TRANSIT POWER FEED / REDUNDANT CHANNEL ONLINE` · P4
  `JUNCTION CONTROL / ROUTING SECURITY AHEAD`
- 4-7 P3 넓은 traversal volume(필수) `LOWER ASCENT FEEDER / ISOLATED` →
  `ROUTE TELEMETRY / OFFLINE` · P4 `TRANSIT CONTROL TRUNK / ACCESS AHEAD`
- 4-8 P3 `UPPER EXPRESS TRUNK / LIMITED OPERATION` · P6 병치는 N1
  final-status-display cue 바인딩으로 처리

### TRIGGER CUE (기존 story-display 바인딩)

- `sector-04-04:service-node-online` → `INFRASTRUCTURE SERVICE NODE / LOCAL
CONTROL AVAILABLE`
- `sector-04-04:lower-feeder-segmented` → `LOWER ASCENT FEEDER / STATUS:
SEGMENTED` → `TELEMETRY / PARTIAL`
- `sector-04-07:containment-routing-active` → `CONTAINMENT ROUTING / ACTIVE`
- `sector-04-07:lower-feeder-isolated` → `LOWER ASCENT FEEDER / ISOLATED`
- `sector-04-07:route-telemetry-offline` → `ROUTE TELEMETRY / OFFLINE`
- `sector-04-08:upper-trunk-limited` → `UPPER EXPRESS TRUNK / LIMITED
OPERATION`
- `sector-04-08:lower-feeder-isolated` → `LOWER ASCENT FEEDER / ISOLATED`
- `sector-04-08:transit-core-access-pending` → `TRANSIT CORE ACCESS / ROUTE
PENDING`

### 금지 (코드에 추가하지 않음)

- 4-1~4-3: `LOWER ASCENT FEEDER / ISOLATED` 조기 공개(Reveal은 4-7 소유,
  4-4는 `SEGMENTED / PARTIAL`까지만), Group A/B/C와 Route/Tier 대응, Corporate
  order·고의성 확정
- 4-4: `ISOLATED` 문구, `SEGMENTED = intentional shutdown` 확정
- 4-8: Group↔Tier 대응, 원인 확정, `NEXT: SECTOR 04` / `BOSS AHEAD` /
  `TRANSIT BOSS` 전환 문구, 두 Archive의 화살표·동일 행·공유 라벨 연결

## Part 2 — 코드 반영 지점

1. `src/game/presentation/AuthoredStoryPresentation.js`에 위 ENTRY·POSITION·
   TRIGGER_CUE 바인딩 추가.
2. `tests/authoredStoryPresentation.mjs`에 4-1 entry, 4-4 SEGMENTED, 4-7
   ISOLATED, 4-8 archive cue 케이스 보강.
3. 영향받은 Stage `PRODUCTION-ALIGNMENT.md` 반영 기록과 fingerprint 갱신.
