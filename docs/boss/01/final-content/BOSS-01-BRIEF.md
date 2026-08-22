# BOSS 01 — C-01 비상 격리구동계
## 핵심 브리프 + 스토리/연출

> 상태: **AUTHORED FINAL CONTENT / RUNTIME PARTIALLY IMPLEMENTED**
> AUTHORING SNAPSHOT: `6a8911d354df6b218a64970b5d35d41359ef62f2`
> 위치: **Sector 01 완료 뒤 Post-Sector Boss Slot**
> Player-facing name: **C-01 비상 격리구동계**
> Internal: `CONTAINMENT GANTRY C-01`

## 1. 한 줄 정의

**1-8의 Maintenance Override 이후 Worker District가 처음 드러난 직후, 정비시설 전체가 비상 격리 시스템으로 전환된다. Player는 격리 Clamp, 환기 Fan, Gate Lock의 세 실제 정비 조작점을 차례로 해제하고 각 설비의 Core가 8초간 노출되는 동안 Rope Impact로 파괴해 통과로를 다시 연다.**

Boss는 인간형/생물형 단일 기체가 아니다.

Boss는 다음 설비의 결합이다.

- 격리 Clamp
- 환기 Fan
- Gate Brake / Lock Pin
- Security Emitter
- Pulse Wind
- Containment Gantry 구조물

## 2. TOP 3 우선순위

### 1순위 — “정비공이 시설을 직접 해제한다”
Boss01의 핵심은 적을 쓰러뜨리는 것보다:

```text
시설 상태 읽기
→ 실제 정비 조작점 접근
→ Breaker / Release 작동
→ 해당 설비 Core 8초 노출
→ Rope로 속도 확보
→ Rope Impact
```

이다.

### 2순위 — Sector 01에서 배운 것을 새 입력 없이 종합
새 Rope 입력/모드가 없어야 한다.

- Rope 이동
- Security 읽기
- Pulse Wind
- local recovery
- manual interaction
- Rope Impact

### 3순위 — 시설 전체가 Boss처럼 느껴져야 함
Boss02처럼 한 기체가 쫓아오는 전투가 아니다.

Phase가 바뀔수록:
- 격리 압력
- 환기 압력
- Security 압력
- Gate 잠금

이 한 시설 안에서 겹쳐진다.

## 3. 1-8과의 연결 — 수정된 정식 순서

**1-8의 현재 Story/Stage 권위는 유지한다.**

1-8 내부:
```text
MAINTENANCE OVERRIDE
→ OVERRIDE LOCK / CONFIRM
→ LOWER GRID CONNECTION / TERMINATING
→ WORKER DISTRICT / ACCESS OPEN
→ WORKER DISTRICT / BLOCK 12
```

Player는 Worker District가 실제 생활권이라는 사실을 처음 인지한다.

그 직후 **Sector 02 playable area에 직접 진입하기 전에** Post-Sector Boss Slot에서:

```text
C-01 EMERGENCY CONTAINMENT
AUTOMATIC LOCKDOWN / ACTIVE
```

가 발생한다.

즉:
> Worker District는 먼저 **보인다**.
> 그러나 그곳으로 실제 넘어가기 직전에 시설의 비상 격리가 마지막으로 통로를 붙잡는다.

Boss 승리 후:
```text
C-01 EMERGENCY CONTAINMENT
OFFLINE

WORKER DISTRICT
PASSAGE RESTORED
```

→ Sector 02 진입.

중요:
- 1-8의 `WORKER DISTRICT / ACCESS OPEN`을 삭제하거나 Boss 승리 뒤로 옮기지 않는다.
- Boss는 1-8 안이 아니라 별도 Post-Sector transition encounter다.

## 4. Boss Runtime 권위

현재 Boss01:
- HP **360**
- Phase **3**
- Phase HP **120**
- Exposure **8 sec**
- Boss Timer **없음**
- Arena collapse **없음**

현재 공용 Boss Runtime은:
- 현재 Phase Breaker 조작
- Core exposed
- 8초 노출
- 노출 중에만 damage 적용
- Phase floor
- 3 Phase 완료
- 전멸 시 attempt reset

을 권위로 사용한다.

따라서 옛 문서의:
> “약점은 선택적 숙련 보상이며 일반 설비를 때려도 진행 가능”

이라는 문구는 이번 최종본에서 폐기한다.

Boss01의 정식 문법은:

> **정비 조작점 → 8초 Core 노출 → Rope Impact**

이다.

## 5. Phase 요약

| Phase | 실제 설비 | 정비 조작 | 노출 Core | 압박 |
|---|---|---|---|---|
| **P1** | 격리 Clamp 구동축 | Clamp Pressure Release | Stress Seam / Clamp Drive Core | Standard Emitter |
| **P2** | 환기 Fan 주베어링 | Backpressure Isolation | Exposed Bearing | Standard Emitter + Pulse Wind |
| **P3** | Gate Lock / Brake | Gate Brake Manual Release | Lock Pin Fracture | Alternating Emitters + Pulse Wind + No Crossfire |

## 6. P1 — 격리 Clamp

첫 질문:

> **“정비 조작점까지 접근해 Clamp 압력을 풀 수 있는가?”**

흐름:
```text
ENTRY
→ Security pressure
→ M1 CLAMP PRESSURE RELEASE
→ Clamp Core 8초 노출
→ Rope Arc
→ Rope Impact
→ Phase 2
```

연출:
- Clamp가 양쪽에서 긴장
- Release 성공 시 구동축이 순간 풀림
- Stress Seam / Core가 드러남
- 파손 후 Clamp 한쪽이 비활성화

## 7. P2 — 환기 Fan

두 번째 질문:

> **“Pulse Wind를 이동 방해가 아니라 접근 타이밍으로 읽을 수 있는가?”**

흐름:
```text
P2 진입
→ Standard pressure
→ Pulse Wind cycle
→ M2 BACKPRESSURE ISOLATION
→ Fan Bearing 8초 노출
→ Wind Lull / Carry 활용
→ Rope Impact
→ Phase 3
```

연출:
- Fan 속도/진동 증가
- Isolation 조작 후 Bearing Housing 개방
- 파손 후 Fan 회전 불안정
- Wind는 즉시 거대한 폭발로 끝나지 않고 감쇠

## 8. P3 — Gate Lock Pin

마지막 질문:

> **“교대 Security와 Pulse Wind를 읽으면서 마지막 Gate Brake까지 도달할 수 있는가?”**

흐름:
```text
P3
→ Alternating Emitters
→ No Crossfire
→ Pulse Wind
→ M3 GATE BRAKE MANUAL RELEASE
→ Lock Pin 8초 노출
→ 최종 Rope Impact
→ C-01 OFFLINE
```

중요:
- Security가 동시에 난사하지 않는다.
- 한 순간의 dominant threat가 읽혀야 한다.
- P3가 탄막 보스로 바뀌면 안 된다.

## 9. 승리 연출

최종 Lock Pin 파손:
- Gate Brake가 풀림
- Clamp 잔여 압력 해제
- Fan이 안전 감속
- Security Emitter OFF
- Gate Crown의 비상등이 순차적으로 꺼짐
- 거대 폭발 없음

System:
```text
C-01 EMERGENCY CONTAINMENT
OFFLINE

WORKER DISTRICT
PASSAGE RESTORED
```

그 뒤 실제 Sector02 진입.

## 10. Story 제한

Boss01은 다음을 설명하지 않는다.

- 사고가 의도적이었다
- 누가 Worker District를 희생시켰다
- Group C가 왜 멈췄다
- Corporate decision
- Priority allocation

Boss01이 보여주는 사실:

> **정비시설 하나의 Override가 사람이 사는 Worker District와 연결된 더 큰 시스템 상태를 건드렸고, 그 시스템은 마지막까지 자동 격리를 수행했다.**

## 11. 반드시 피할 것

- Boss Timer
- 시간 만료 HeadHouse closure
- Arena collapse
- 중앙 거대 인간형 로봇
- Breaker 없이 자동 약점 노출
- 약점 노출 전 Boss damage 진행
- 네 개 이상의 Phase
- 새로운 Rope 입력
- Cutter / Jammer / AEGIS / Artillery 추가
- 장시간 컷신
