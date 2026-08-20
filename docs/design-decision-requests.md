# 기획 결정 요청·답변 추적

이 문서는 개발 구현이 준비되어 있고 기획 결정이 필요한 항목을 우선순위 순으로 정리하며, 현재 확정된 답변을 개발 가능한 계약으로 기록한다.

> **기획 계약 확정 / Runtime 부분 구현**
> 현재 구현 상태와 검토 기준은 [`scenario-development-integration.md`](./scenario-development-integration.md)가 소유한다.

- 상태 범례: `요청됨` → `답변됨` → `구현 완료`, 또는 `보류`
- 상세 Stage: **48/48**, `1-1 → 6-8`
- 정확한 Stage별 Runtime 상태는 [`scenario-development-integration.md`](./scenario-development-integration.md)를 따른다.
- 전체 수치·상태·UI 계약은 [`design-decision-resolution-package.md`](./design-decision-resolution-package.md)를 따른다.
- 과거 Foundation/Specialization 설계는 [`augment-v1.md`](./augment-v1.md)의 22장 generic Augment 계약으로 대체됐으며 상세 legacy 본문은 제거했다.

## 현재 구현 기준

| 축 | 상태 |
|---|---|
| 월드 | `1-1 → 3-8` 24개 영역 `MOCK INTEGRATED`; Sector04 `4-1→4-8` standalone authored; Sector05·06 Runtime 미저작 |
| 시나리오 | Sector01~06 상세 Stage 48/48 완료 |
| 시스템 | Rope core, 22장 generic Augment v1, Sentry/Patrol, Wind, Access Scan Field, Cutter Fire, 2인 멀티 구현 |
| 성장 | 1-4·2-3·3-5 explicit Node의 Player별 결정적 3장 offer·최대 6장 loadout·선택/효과/저장/복원 구현; 고정 Specialization tier는 대체됨 |
| Boss | Boss01 Has-A core와 snapshot 구현; physical Arena·피해/사망·`2-1` 전환 대기, Sector02~05 상세 미확정 |
| 프레젠테이션 | Sector01~04 Camera/Story 일부/대부분 반영; 정식 Art/Audio 교체 대기 |
| 검증 | 전체 48-Stage 실제 브라우저/기기 플레이테스트 없음 |

## 응답 방법

1. 각 항목은 구현 가능한 계약으로 답한다.
2. Prototype 수치는 `PROTOTYPE`으로 표시하고 Playtest 전 최종값으로 주장하지 않는다.
3. 답변이 붙은 항목부터 개발자가 구현한다.
4. 현재 Code가 과거 문서와 충돌하면 Code + 최신 결정이 우선한다.

---

## P1. 성장 규칙 — generic Augment v1로 대체 완료

- 현재 계약은 [`augment-v1.md`](./augment-v1.md)가 단독 소유한다.
- 1-4·2-3·3-5 explicit Node는 Player별 결정적 3장 offer를 제공하며 고정 Foundation/Specialization tier, pair pool, 별도 선택 상태를 복구하지 않는다.

---

## P2. 섹터 보스 전투 시나리오

- **상태**: `답변됨 — BOSS01 READY / SECTOR02~05 DETAIL FOLLOW-UP`
- **공통 흐름**: `n-8 → Boss Entry → Sector Boss → Next Sector`
- Stage08 내부에는 Boss를 넣지 않는다.

### Boss 위치

| Sector | Boss Entry |
|---|---|
| 01 | `1-8` Worker District Reveal + Sector Checkpoint 이후 |
| 02 | `2-8` Finale 이후 |
| 03 | `3-8` content boundary 이후 |
| 04 | `4-8` content boundary 이후 |
| 05 | `5-8` content boundary 이후 |
| 06 | `6-8` Pad Access Denial 이후 Final Security |

### 첫 Boss — CONTAINMENT GANTRY C-01

정체:

```text
AUTOMATED FACILITY SECURITY / MAINTENANCE GANTRY
```

Human villain 아님.

배치:

```text
1-8
→ Lower Grid Shutdown
→ Worker District Reveal
→ Sector Checkpoint
→ short sealed transfer
→ CONTAINMENT GANTRY C-01
→ Boss Win
→ 2-1
```

### Boss01 Prototype

```text
HP 360
3 phases × 120

Boss Timer
210 sec

Timer 0
→ arena collapse 80 px/s prototype
```

Core는 기본 Shielded.

각 Phase:

```text
Rope로 Maintenance Breaker 도달
→ Interact
→ Core 8 sec exposed
→ Auto Weapon / optional Shear damage
```

#### Phase 1

```text
ONE STANDARD EMITTER
NO WIND
```

#### Phase 2

```text
ONE STANDARD EMITTER
+
ONE PULSED WIND LANE
```

#### Phase 3

```text
LEFT / RIGHT EMITTER ALTERNATING
NO CROSSFIRE
+
PULSED WIND
```

금지:
- Cutter
- Patrol
- Scanner
- Moving Platform
- 새 버튼
- 특정 Foundation 필수

### Boss01 Reward

```text
CONTAINMENT CLEARED
→ next Sector access
→ new Sector general timer
```

Artifact 없음.
새 Growth tier 없음.

### Retry / Multiplayer

- 일반 잔여 Timer는 Boss 진입 때 폐기.
- Boss 전원 탈락 → Boss만 재시작.
- 한 명 붕괴 탈락 → Survivor spectate.
- Survivor Boss 처치 → 다음 Sector safe entry에서 active session players 재합류.

---

## P3. 일반 Timer·Containment Purge Field

- **상태**: `core 계약 확정 / topology mapping HOLD`
- **대체 대상**: `960초 / +45초 / cap 960초 / 상승 붕괴 80px/s / 다음 Gate 자동 합류`

### 확정 계약

```text
Sector General Timer: 60 sec
Progress Reward: +10 sec
Timer Cap: 60 sec
Containment Purge Field: 240 px/sec
Purge Contact: lethal
Party Wipe: current Sector reset
Boss Entry: general Timer/Purge ends, remaining time discarded
```

- Field는 시간 보상 중 현재 높이에서 멈추고 다음 0초부터 같은 위치에서 재상승한다.
- Field는 후퇴하거나 Player를 추적·순간이동하지 않는다.
- 전멸 reset은 Player별 증강과 이전 Sector 완료 진행을 보존한다.
- 일반 Purge를 Boss 전투에 이어 붙이지 않는다.
- 10초·3초·0초 경고는 시각·문구·음향을 함께 사용한다.

### 구현 금지 HOLD

- 어떤 physical landmark/objective transition이 +10초를 지급하는가.
- 연속 Sector geometry에서 최초 Field origin은 어디인가.
- 개인 Purge 사망 뒤 Sector-entry 즉시 복귀와 관전·후속 전이 합류 중 무엇을 사용하는가.

Stage ID, legacy Gate portal과 Area 하단을 위 세 항목에 자동 매핑하지 않는다. 상세 현재 계약은 `docs/sector-timer-and-boss-flow.md`, 대체 이력은 `docs/decision-history.md`를 따른다.

---

## P4. NPC 역할·대화 계약

- **상태**: `답변됨 — ONLINE QUALIFIER CORE에서 제외`
- **결정**:

```text
LIVE NPC
NO

BRANCHING DIALOGUE
NO

ESCORT
NO
```

NPC/대화 시스템은 현재 예선 빌드의 필수 조건이 아니다.

이유:
- Runtime 없음
- 현재 Environmental Story만으로 48-Stage Story chain 존재
- Boss / generic Augment 조합 검증 / Ending이 더 높은 제품 가치
- Networking·UI·Animation 신규 비용 회피

### Optional Post-Core NPC

Core가 안정된 경우에만:

```text
Stage
2-6 QUIET RESIDENTIAL VOID

NPC
RESIDENT MAINTENANCE TECHNICIAN
```

- sealed service glass 뒤
- stationary
- pathfinding 없음
- 전투 없음
- escort 없음
- choice 없음
- proximity 3 lines
- progression key 아님

Candidate lines:

```text
"Service route's still live?"

"They moved some groups upward.
Not everyone."

"If you're climbing, don't wait here."
```

NPC는:
- 회사가 Cascade를 일으켰다고 말하지 않음
- Group A/B/C와 계급을 매핑하지 않음
- WHY를 알지 못함
- 보상/퀘스트를 주지 않음

시간이 부족하면 완전 삭제.

---

## P5. 엔딩·최종 전환

- **상태**: `답변됨 — FINAL FLOW READY`

### 진입

```text
6-8 ROOFTOP PAD 03
→ Pad Access request
→ ACCESS DENIED
→ CONTAINMENT VIOLATION
→ Final Security
```

### Final Security

Working name:

```text
PAD SECURITY WARDEN P-03
```

Automated rooftop security gantry.

No human final villain.

Prototype:

```text
HP 450
3 phases × 150
Boss Timer 240 sec
Arena collapse 80 px/s after timer 0
```

각 Phase:

```text
Security Relay 도달
→ Interact
→ Core 10 sec exposed
```

#### Phase 1

```text
ONE STANDARD EMITTER
```

#### Phase 2

```text
ONE cutter-fire emitter
+
lower recovery catwalk
```

#### Phase 3

```text
ONE Scanner-controlled 3-hardpoint group
+
Standard core emitter during exposure
```

No Wind.
No Patrol.
Cutter와 Scanner/Standard를 동시에 soup로 겹치지 않는다.

### Boss Win

```text
PAD SECURITY WARDEN
OFFLINE

ROOFTOP PAD 03
ACCESS RESTORED

MAINTENANCE SHUTTLE
BOARDING
```

### Boarding — Single

Player가 Shuttle boarding zone에 도달/Interact하면 Ending.

### Boarding — Multiplayer

각 active Player가 개별적으로 boarding zone에 들어가야 한다.

첫 Player:

```text
BOARDING READY
WAITING FOR PARTNER
```

파트너 auto-teleport 금지.

Boss 승리 시 spectator 상태 Player는 Final Safe Pad Deck에 재합류한 뒤 직접 Boarding.

```text
ALL ACTIVE PLAYERS READY
→ controls lock
→ ending
```

### Ending

10~15초 짧은 sequence.

1. Shuttle door close.
2. Shuttle이 Pad03에서 떠남.
3. 도시를 pullback으로 보여줌.
4. Lower sectors는 어둡고 일부 Upper infrastructure만 살아 있음.
5. 회사 HQ 폭발/혁명/도시 구원 연출 없음.

Final:

```text
ESCAPE CONFIRMED
ROUTE COMPLETE
```

가능하면 현재 RunMetrics 기반:
- Active Time
- Areas Cleared
- Deaths
- Rope Cuts
- Selected generic Augments

Optional:

```text
VERTICAL GRID STATUS
UNRESOLVED
```

그 뒤:
- New Run
- Title

New Run에서 generic Augment loadout·source 소비·선택 인덱스를 런 상태와 함께 reset한다.

---

## 현재 우선순위

### P0 — 먼저 정렬

1. [완료] 1-7 Runtime의 조기 `CONTAINMENT VIOLATION` 제거/rename.
2. [완료] Cutter `cutter-fire` positive opt-in 문서 정렬.
3. [완료] 1-5~1-8 generic Augment 구현 상태 문서 갱신.
4. [완료] 1-8 checkpoint `reward:true` stale 문구 제거.
5. [완료] Scenario Art의 verified default-camera capture contract 허용.
6. [완료] 이 문서와 roadmap/schedule를 48/48 상태로 갱신.

### 구현 순서

```text
P0 Alignment
→ Boss primitive + Boss01
→ Timer/Purge topology mapping
→ Sector04/05/06 Runtime expansion
→ Final Security
→ Boarding / Ending
→ Playtest
→ NPC only if surplus
```

---

## 기획 입력 없이 진행 가능한 항목

P0 정렬 이후:

- Boss Flow common primitive
- Boss01 prototype
- `60초 / 진행 보상 +10초 / cap 60초 / Purge 240px/s` topology mapping
- Sector05/06 graybox authoring
- Final Security mock
- Boarding / Ending mock
- Art/Audio mock 교체

여전히 별도 상세 기획이 필요한 것:

- Sector02 Boss
- Sector03 Boss
- Sector04 Boss
- Sector05 Boss
- 최종 balance values
- optional NPC final content

---

REV 2 · PLANNING CONTRACT APPROVED / RUNTIME IMPLEMENTATION PENDING
