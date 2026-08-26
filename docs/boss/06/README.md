# Boss 06 — CONTINUITY WARDEN

상태: **V4 OPEN-EDGE ARENA / FULL STATE CATALOG + WEIGHTED SELECTION IMPLEMENTED / FULL PLAYTEST PENDING**

이 문서는 기존 `PAD 03 Containment Clamp Security System` 기획을 대체하기 위한 Boss06 인간형 최종 보스 재설계 Blockout이다.

- source ZIP SHA-256: `72be0adfc27e3f714024c6d0f6f331652b2d3d50c288fb32adc2f83b299edd4d`
- imported Blockout Markdown은 저장소의 `git diff --check` 규칙에 맞춰 줄끝 공백만 정규화했으며, 정규화 전 원본 파일 SHA-256은 package manifest와 대조했다.
- 현행 구현 기준은 [`BOSS-06-V4-CONTRACT.md`](./BOSS-06-V4-CONTRACT.md)와 canonical `boss-06.json`이다. V2/V3 문서는 대체된 설계·검증 이력이며 V4 좌표나 상태 선택의 권위가 아니다.

## 현재 기준

- Authoring baseline: `9cf4b0189030921b212c512e686f1b85d499d106`
- 6-8 현행: `ROOFTOP PAD 03`, `nextAreaId: null`, `pad-access-console` 완료 후 `content-boundary`
- Base Rope Reach: `400px`
- V2/V3 Security Court 좌표와 Recovery 구조: **SUPERSEDED BY V4**

## 핵심 정의

> **CONTINUITY WARDEN = Pad 03의 탈출 권한과 보안 시스템을 현장에서 집행하는 인간형 최종 보스.**

Warden은 Rope를 사용하지 않는다. Shield, Baton, Thruster Dash와 Pad Security Beam Gate를 이용해 공간을 통제하고, Player는 Rope를 이용해 정면 통제를 우회한다.

보행은 이동 거리 기반 Pose로 다리 움직임을 읽히게 하고 점프 전 TAKEOFF는 무릎을 굽힌 준비 자세를 사용한다. 돌진은 빨간 사각 범위가 아니라 본체 자세·방향·잔상으로 예고하며 Security Beam 예고 중 Boss HP 아래에 `WARNING`을 표시한다. 공격 범위 표현은 닫힌 실선 외곽을 사용하지 않는다.

V4에서는 Warden이 좌표로 판정한 주 바닥·Raised Ledge를 평상 걷기·점프·내려가기 상태로 계속 추적한다. 공격은 실행 가능한 상태 풀에서 결정적 가중 랜덤으로 고르며, 정점의 5발 유도미사일과 제한 각속도는 유지한다.

여러 Player가 있으면 Neutral에서 전투 구역 안의 active 참가자 중 거리·ID 순으로 최근접 대상을 선택한다. 공격을 시작한 뒤에는 target과 facing을 종료까지 고정해 Guard/Counter가 자동 회전하거나 미사일 예고 대상이 발사 직전에 바뀌지 않는다.

별도 소환 패턴은 이동형 공격 Enemy pool에서 2마리를 생성한다. 성공한 패턴 뒤 15초 동안 재사용하지 않고, 살아 있는 Boss 소환몹이 6마리 이상이면 패턴 순서에서 건너뛴다.

## 전투 계약

- 하나의 visible HP Bar
- Player에게 보이는 P1/P2/P3 없음
- 내부 authoring은 단일 combat segment로 처리 가능
- 평상시 Warden body damage 허용
- `GUARD` 중 정면 공격 완전 방어 / 후면 정상 피해
- `COUNTER READY` 중 정면 공격은 Shield Bash로 반격
- 직접전 : Pad Security ≈ 50 : 50
- HP가 낮아져도 신규 기술 추가 없음
- 후반 난도 = 패턴 연결 증가 + Security 사용 증가
- Warden이 직접 Player를 처치할 때마다 현재 HP를 최대 HP 이내에서 100 회복하며 별도 Boss06 회복 규칙은 두지 않음

## Arena

`PAD 03 OPEN-EDGE SECURITY COURT`

- 3200px Main Security Runway와 좌·중·우 단방향 Raised Ledge
- 파형 Upper `swing-attack` Hardpoint U1~U10
- Warden 점프 착지점은 authored Raised Ledge top과 Main top에서 파생
- Open Sky
- 좌우 벽과 Recovery 0개; 바닥 이탈은 해당 Player의 Boss 입구 낙사 부활
- 오른쪽 Main edge와 Gate 사이 220px fall lane
- Victory 시 220px threshold bridge가 열려 Boarding Deck과 연결
- Shuttle은 전투 중 숨김
- Warden 패배 후 Gate light → Gate open → camera pan → Shuttle 최초 Reveal

## 최신 main 재사용점

최신 main에는 이미 Boss `swing-attack` anchor materialization, custom Encounter Runtime factory, `CompositeBossEncounterRuntime`, `activeHazards()`, `recoverPlayer()`, `impactTargetSnapshot()` 경로가 존재한다.

Boss06는 이를 우선 재사용하고, 별도의 Rope AI나 새 범용 hazard framework를 만들지 않는다.

## 문서

- [`BOSS-06-V4-CONTRACT.md`](./BOSS-06-V4-CONTRACT.md) — 현재 전투·Arena·상태 선택 계약
- [`BOSS-06-V3-CONTRACT.md`](./BOSS-06-V3-CONTRACT.md) — 대체된 V3 계약
- [`V3-VALIDATION.md`](./V3-VALIDATION.md) — 대체된 V3 검증 기록
- [`BOSS-06-BRIEF.md`](./blockout-draft/BOSS-06-BRIEF.md)
- [`BOSS-06-COMPONENTS.md`](./blockout-draft/BOSS-06-COMPONENTS.md)
- [`MAP-PREVIEW.html`](./blockout-draft/MAP-PREVIEW.html)
- [`BLOCKOUT-QA.md`](./blockout-draft/BLOCKOUT-QA.md)
- [`RUNTIME-ALIGNMENT.md`](./blockout-draft/RUNTIME-ALIGNMENT.md)
- [`VALIDATION.md`](./blockout-draft/VALIDATION.md)

## Runtime 연결

- `6-8` content boundary 뒤 regular `6-9` 없이 terminal `boss-06`을 삽입한다.
- Warden body ImpactTarget 하나와 sprite 불투명 body 폭에 맞춘 120×150 Polygon 하나를 물리·기본탄·Spell·멀티 client prediction이 공유한다. Guard/Counter, Baton·Dash·Charge·LOW/HIGH Security와 점프 상태는 `ContinuityWardenRuntime`이 소유한다.
- 점프 물리는 공용 Physics mixin 기반 Has-A 컴포넌트, 5발 유도탄은 `enemy + homing` projectile 조합과 서버 spawn/resolve 사건을 사용한다. 유도탄은 속도 방향 Rect collider 하나를 화면·디버그·피해 클라이언트 overlap/swept contact에 공유하며 원형 반경으로 피격을 근사하지 않는다.
- Boss03·06은 공용 `BossEnemySummonPattern`을 조합해 2마리·15초 cooldown·live 6 skip과 결정적 Patrol·Pursuit·Shield·Artillery 순서를 공유한다. 서버 `GameSimulation`만 동적 Enemy를 등록하며 attempt reset·승리 때 해당 Boss 소환몹과 잔탄을 제거한다.
- 승인된 Phase1 Warden pixel sprite를 유지한다. `walk`는 이동 거리 기반 전용 6프레임 보폭 atlas를 사용하고, 전용 locomotion atlas가 없는 V4 `jump/descend/fall/landing`만 `combat-idle` body의 renderer-local pose fallback으로 표현한다. 소환 명령은 `security-command` clip을 재사용한다.
- `boss-06.json`의 3200px Main·단방향 Ledge 3개·U1~U10·Gate·220px Bridge·Boarding Deck을 authored geometry로 실행한다. 모든 solid surface는 일반 부착 가능하며, World surface가 전용 Boss terrain atlas를 그리는 단일 권위다. Boss presentation object로 같은 발판을 다시 그리지 않는다.
- Security Beam 양 끝은 세로 기둥 없이 떠 있는 `64×64` Security Star 두 개만 표시한다. `idle`·amber `telegraph`·red `active`·amber `ending`은 기존 Security state와 beam gap에서 파생하며 solid collision·Rope target을 추가하지 않는다. active 3초는 시작 pulse와 이후 0.5초 간격을 합쳐 서버 공용 pulse 6개를 만들고, 각 순간 겹친 Player만 피해자 owner가 20 피해를 즉시 claim한다. 이탈 중인 pulse는 피해가 없고 재진입하면 현재 이후 pulse부터 다시 적용하며 pulse ID와 기존 Boss snapshot v2로 멱등 수렴한다.
- 승리 뒤 Warden은 기절하고 Gate light/open → Threshold Bridge → Shuttle reveal → Player별 Boarding → 모든 active Player ready → `beginCompletion()` 순서로 진행한다. 첫 Player가 동료를 순간이동시키지 않는다.
- shared wipe 중 먼저 사망한 Player는 spectating으로 기다리지만, 마지막 active 참가자의 사망 또는 연결 종료는 같은 roster 전멸 판정을 실행해 남은 연결 참가자를 active로 복구하고 Boss Entry에서 새 attempt를 시작한다.
- Shuttle reveal은 `assets/runtime/objects/boss-06-maintenance-shuttle/maintenance-shuttle-boarding.png`의 `500×390` atlas를 논리 원본 크기인 `250×195`로 표시한다. authored `shuttlePosition (4630, -1055)`은 실제 하단 착지 픽셀의 접점 anchor `(0.356, 1)`이며, 승리 카메라는 이 접점에서 sprite 중심을 파생한다. asset 준비 전·실패 시 같은 크기·anchor의 Canvas 셔틀로 복구하며 Boarding 판정·승리 타임라인은 바꾸지 않는다.
- Departure Gate는 `480×760` locked/light/open sprite와 기존 0.3초 `light → open` 8-frame motion을 사용한다. 시각 Gate의 왼쪽은 Departure Deck 왼쪽에서 시작하고 전체 폭은 Deck 안에 포함되며, 기존 `220×705` collision bounds는 유지한다. Gate의 bottom-center와 Shuttle의 실제 착지점은 Departure Deck top에 맞추고 asset 준비 전·상태별 실패 시 각 Canvas 표현으로 독립 복구한다. Bridge·Boarding zone·상태 권한은 유지한다.
- Browser Gameplay View와 실제 1~4인·멀티 수렴은 구현 상태와 분리해 검증한다.

## V2 기록

`blockout-draft/`의 좌표·U1~U8·240px Bridge·평면 보행 전제는 V3 구현 입력으로 사용하지 않는다. 당시 발견과 수정 chronology는 `IMPLEMENTATION-REVIEW.md`와 `GAP-REPORT-2026-08-24.md`에 보존한다.

## 이전 초안 correction

Draft01 QA에서 발견된 다음 문제를 이전 초안에서 수정했다.

- Preview sequence button ID mismatch
- solid floor 아래 접근 불가 Recovery
- standing Player를 못 막던 LOW band
- anchor line만 막던 HIGH band
- Beam 좌우 safe pocket
- Gate 뒤 Boarding floor 부재
- Guard/Charge Warden duplicate presentation
- Main↔Upper entry reach QA 누락
- 오른쪽 Recovery fall lane과 Gate threshold 충돌

## Implementation Preflight

구현 전에 [`IMPLEMENTATION-PREFLIGHT.md`](./blockout-draft/IMPLEMENTATION-PREFLIGHT.md)를 필수 Gate로 사용한다.

핵심:

- dummy weakpoint 금지
- body ImpactTarget exactly 1
- Warden solid collider =120×150
- Main collision deck exactly 1
- RR1/RR3 actual swing-attack anchors
- Emitter/Beam solid collision 금지
- Gameplay View 필수

- [`FINAL-PREFLIGHT.md`](./blockout-draft/FINAL-PREFLIGHT.md)
- [`CODEX-IMPLEMENTATION-TASK.md`](./blockout-draft/CODEX-IMPLEMENTATION-TASK.md)

- [`DAMAGE-LOOP-PREFLIGHT.md`](./blockout-draft/DAMAGE-LOOP-PREFLIGHT.md)
- [`DAMAGE-CHECKS.json`](./blockout-draft/DAMAGE-CHECKS.json)
