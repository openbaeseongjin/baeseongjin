# Boss 06 — CONTINUITY WARDEN

상태: **V3 SKYBRIDGE ARENA / AIRBORNE HOMING MISSILE + SUMMON IMPLEMENTED / PIXEL PHASE1 INTEGRATED / FULL PLAYTEST PENDING**

이 문서는 기존 `PAD 03 Containment Clamp Security System` 기획을 대체하기 위한 Boss06 인간형 최종 보스 재설계 Blockout이다.

- source ZIP SHA-256: `72be0adfc27e3f714024c6d0f6f331652b2d3d50c288fb32adc2f83b299edd4d`
- imported Blockout Markdown은 저장소의 `git diff --check` 규칙에 맞춰 줄끝 공백만 정규화했으며, 정규화 전 원본 파일 SHA-256은 package manifest와 대조했다.
- 현행 구현 기준은 [`BOSS-06-V3-CONTRACT.md`](./BOSS-06-V3-CONTRACT.md)와 canonical `boss-06.json`이다. `blockout-draft/`는 V2 설계·검증 이력이며 V3 좌표나 패턴의 권위가 아니다.

## 현재 기준

- Authoring baseline: `9cf4b0189030921b212c512e686f1b85d499d106`
- 6-8 현행: `ROOFTOP PAD 03`, `nextAreaId: null`, `pad-access-console` 완료 후 `content-boundary`
- Base Rope Reach: `400px`
- V2 flat Security Court와 U1~U8/RR1/RR3 좌표: **SUPERSEDED BY V3**

## 핵심 정의

> **CONTINUITY WARDEN = Pad 03의 탈출 권한과 보안 시스템을 현장에서 집행하는 인간형 최종 보스.**

Warden은 Rope를 사용하지 않는다. Shield, Baton, Thruster Dash와 Pad Security Beam Gate를 이용해 공간을 통제하고, Player는 Rope를 이용해 정면 통제를 우회한다.

V3에서는 Warden이 Raised Ledge를 포함한 authored landing point로 직접 점프하며, 정점에서 5발 유도미사일을 부채꼴로 동시에 전개한다. 각 탄은 즉시 목표 방향으로 꺾이지 않고 제한된 각속도로 Player를 향해 휘어진다.

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

## Arena

`PAD 03 SECURITY COURT`

- 3920px Main Security Runway와 좌·중·우 Raised Ledge
- 파형 Upper `swing-attack` Hardpoint U1~U10
- Warden 점프 착지점은 authored Raised Ledge top과 Main top에서 파생
- Open Sky
- 좌·우 Recovery와 RR-left/right 실제 복귀 Anchor; 완전 이탈만 Runtime fallback
- 오른쪽 Main edge와 Gate 사이 220px fall lane
- Victory 시 220px threshold bridge가 열려 Boarding Deck과 연결
- Shuttle은 전투 중 숨김
- Warden 패배 후 Gate light → Gate open → camera pan → Shuttle 최초 Reveal

## 최신 main 재사용점

최신 main에는 이미 Boss `swing-attack` anchor materialization, custom Encounter Runtime factory, `CompositeBossEncounterRuntime`, `activeHazards()`, `recoverPlayer()`, `impactTargetSnapshot()` 경로가 존재한다.

Boss06는 이를 우선 재사용하고, 별도의 Rope AI나 새 범용 hazard framework를 만들지 않는다.

## 문서

- [`BOSS-06-V3-CONTRACT.md`](./BOSS-06-V3-CONTRACT.md) — 현재 전투·Arena 계약
- [`V3-VALIDATION.md`](./V3-VALIDATION.md) — 현재 fresh 검증과 열린 playtest
- [`BOSS-06-BRIEF.md`](./blockout-draft/BOSS-06-BRIEF.md)
- [`BOSS-06-COMPONENTS.md`](./blockout-draft/BOSS-06-COMPONENTS.md)
- [`MAP-PREVIEW.html`](./blockout-draft/MAP-PREVIEW.html)
- [`BLOCKOUT-QA.md`](./blockout-draft/BLOCKOUT-QA.md)
- [`RUNTIME-ALIGNMENT.md`](./blockout-draft/RUNTIME-ALIGNMENT.md)
- [`VALIDATION.md`](./blockout-draft/VALIDATION.md)

## Runtime 연결

- `6-8` content boundary 뒤 regular `6-9` 없이 terminal `boss-06`을 삽입한다.
- Warden body ImpactTarget 하나, 96×150 Polygon body, Guard/Counter, Baton·Dash·Charge·LOW/HIGH Security와 점프 상태를 `ContinuityWardenRuntime`이 소유한다.
- 점프 물리는 공용 Physics mixin 기반 Has-A 컴포넌트, 5발 유도탄은 `enemy + homing` projectile 조합과 서버 spawn/resolve 사건을 사용한다.
- 소환 요청은 Boss Runtime이 만들고 서버 `GameSimulation`만 동적 Enemy를 등록한다. Patrol·Pursuit·Shield·Artillery를 결정적 순서로 고르며 wipe·승리 때 소환몹과 잔탄을 제거한다.
- 승인된 Phase1 Warden pixel sprite를 유지하고, 전용 jump atlas가 없는 V3 `takeoff/jump/fall/landing`은 `combat-idle` body의 renderer-local pose fallback으로 표현한다. 소환 명령은 `security-command` clip을 재사용한다.
- `boss-06.json`의 Main·Ledge 3개·U1~U10·RR-left/right·Recovery·Gate·220px Bridge·Boarding Deck을 authored geometry로 실행한다. 모든 solid surface는 일반 부착 가능하다.
- 승리 뒤 Warden은 기절하고 Gate light/open → Threshold Bridge → Shuttle reveal → Player별 Boarding → 모든 active Player ready → `beginCompletion()` 순서로 진행한다. 첫 Player가 동료를 순간이동시키지 않는다.
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
- Warden solid collider <=96×150
- Main collision deck exactly 1
- RR1/RR3 actual swing-attack anchors
- Emitter/Beam solid collision 금지
- Gameplay View 필수

- [`FINAL-PREFLIGHT.md`](./blockout-draft/FINAL-PREFLIGHT.md)
- [`CODEX-IMPLEMENTATION-TASK.md`](./blockout-draft/CODEX-IMPLEMENTATION-TASK.md)

- [`DAMAGE-LOOP-PREFLIGHT.md`](./blockout-draft/DAMAGE-LOOP-PREFLIGHT.md)
- [`DAMAGE-CHECKS.json`](./blockout-draft/DAMAGE-CHECKS.json)
