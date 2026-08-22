# BOSS 05 — CONTINUITY CONTROL CORE
## 핵심 브리프 + 스토리/연출

> 상태: **AUTHORED FINAL CONTENT / RUNTIME NOT IMPLEMENTED**
> AUTHORING SNAPSHOT: `e827ead2ef88a4a04b0291952b9c3a2e04ce4441`
> Sector: **05 CONTINUITY CONTROL**
> Sector Theme: **THE SYSTEM CHOOSES WHAT CONTINUES**

## 1. 한 줄 정의

**5-8 Authority Deck에서 용량 부족, 상층 우선 유지, Lower Ascent suspension 승인, 실제 하층 대피 중단과 Incident Continuity Control의 조직적 책임을 모두 확인한 Player가 Rooftop Service Access로 향하자, 중앙 Void 위의 Suspended Rectangular Control Core가 Chamber 전체를 Sliding Partition과 Control Pulse로 재구성해 탈출을 차단한다. Player는 좌우 보조 Actuator와 중앙 Main Actuator의 Coupling을 차례로 파괴해 공간 통제력을 빼앗고, 모든 Partition이 정지한 뒤 완전히 노출된 Central Core에 최종 Rope Impact를 가한다.**

## 2. Boss05의 정체성

Boss는 **벽이 아니다.**

실제 Boss:

**SUSPENDED CONTINUITY CONTROL CORE**

구성:

1. Suspended Rectangular Core — 본체
2. AUX ACTUATOR A — 좌측 보조 구동계
3. AUX ACTUATOR B — 우측 보조 구동계
4. MAIN ACTUATOR — Core 바로 아래의 최종 중앙 구동계
5. Sliding Partitions — Core가 공간 통제를 위해 사용하는 건축 장치
6. Control Pulse — 특정 구역 체류를 압박하는 Chamber 공격

핵심 인상:

> **중앙 시스템이 방을 조종한다.**

## 3. Story 위치

Boss05는 새로운 진실을 밝히지 않는다.

5-8에서 Player는 이미 다음 사실을 확인했다.

```text
CRITICAL CAPACITY DEFICIT

UPPER CORE CONTROL / PRESERVE
UPPER EVACUATION CAPACITY / PRESERVE

LOWER ASCENT / SUSPEND

LOWER-SECTOR EVACUATION / SUSPENDED

AUTHORITY
INCIDENT CONTINUITY CONTROL
```

그리고 탈출 목표:

```text
ROOFTOP PAD 03
MAINTENANCE SHUTTLE
STANDBY

ROOFTOP SERVICE ACCESS
ROUTE AVAILABLE
```

Boss05의 역할은 **진실을 하나 더 설명하는 것**이 아니라,
그 진실을 확인한 Player가 실제 Rooftop route로 빠져나가기 직전 만나는 **마지막 물리적 통제체계**다.

## 4. TOP 3 우선순위

### 1. 중앙 Core가 항상 보스의 중심이어야 한다

처음 진입부터 Final까지 Suspended Core가 화면 중심의 상부에 존재한다.

Partition이 움직일 때:
- Core → Actuator control signal
- Actuator → Partition movement
가 한 눈에 읽혀야 한다.

### 2. Partition 회피와 약점 생성은 같은 사건이다

```text
CORE COMMAND
→ PARTITION MOVE
→ PARTITION FULL CLOSE
→ ACTUATOR LOCK
→ COUPLING EXPOSED
→ SERVICE ROUTE 우회
→ ROPE IMPACT
```

### 3. Phase가 진행될수록 Core가 통제력을 잃는 것이 보여야 한다

Actuator 하나 파괴할 때마다:
- 해당 control line OFF
- Core 외피 일부 OPEN
- Core 반응/진동 강화
- 다음 Phase의 공간 통제는 더 공격적으로 변화

P3 Main Actuator 파괴:
- 모든 Partition STOP
- Core FULL OPEN

## 5. 공간

하나의 거대한 **Final Continuity Control Chamber**를 P1~P3에서 계속 재사용한다.

구성:
- 중앙 Control Void
- Void 상부 Suspended Core
- 좌/우 Service perimeter route
- sealed corporate wall
- glass control partitions
- left/right auxiliary actuator
- central main actuator
- final central approach
- Rooftop Service Access

Boss03처럼 별도 움직이는 기계가 Atrium을 횡단하는 구조가 아니다.

Boss05는:

> **같은 방의 건축적 관계 자체가 계속 바뀐다.**

## 6. P1 — AUX ACTUATOR A

### 목적
Central Split 규칙 학습.

Core가 AUX A에 명령한다.

```text
CORE
→ AUX A
→ PARTITION 01 CLOSE
```

Partition은 Chamber를 좌/우로 분할한다.

중요:
- 어느 쪽에 남아도 즉사/실패가 아니다.
- 압사 Instant Kill 없음.
- 분할 후에도 Service Route는 읽을 수 있다.

Partition 완전 폐쇄:

```text
AUX A
LOCK
```

그 순간 중앙 Coupling 노출.

Player:
- perimeter Service Hardpoint 이용
- Partition 후면/측면으로 우회
- A Coupling Rope Impact

결과:
- AUX A OFF
- control line A LOST
- Core shell 1단계 OPEN

## 7. P2 — AUX ACTUATOR B + CONTROL PULSE

같은 Chamber를 다시 읽는다.

이번에는 Core가 AUX B를 구동한다.

```text
CORE
→ AUX B
→ PARTITION 02 CLOSE
```

Partition이 Player를 한쪽 Cell로 분리한 뒤
그 Cell에 Control Pulse가 연결된다.

### Control Pulse

목적:
**MOVE.**

효과:
- 명확한 Warning
- 짧은 Knockback
- 작은 Damage
- Rope Cut 없음
- 강제 Release 없음
- 즉사 없음

Player는 Pulse Zone에 버티는 대신
보이는 Service Route로 빠져나간다.

Partition 완전 폐쇄:

```text
AUX B
LOCK
```

B Coupling 노출 → Rope Impact.

결과:
- AUX B OFF
- Core shell 2단계 OPEN
- Core의 공간 통제 반응이 더 공격적으로 변화

## 8. P3 — MAIN AUTHORITY PARTITION

Core 바로 아래의 **MAIN ACTUATOR**가 활성화된다.

이 Phase는 A/B를 또 두 번 반복하지 않는다.

하나의 가장 큰 중앙 Partition만 사용한다.

```text
CORE
→ MAIN ACTUATOR
→ MAIN AUTHORITY PARTITION
```

Main Partition:
- Chamber 전체를 가장 강하게 분리
- P1/P2에서 익힌 공간 읽기를 최종 확인
- 분리된 Cell에 Pulse pressure 연동
- 여전히 읽을 수 있는 Service Route 유지

완전 폐쇄:

```text
MAIN ACTUATOR
LOCK
```

Main Central Coupling 완전 노출.

Player가 Main Coupling 파괴.

결과:

```text
CHAMBER CONTROL
LOST
```

- 모든 Sliding Partition 정지
- Control Pulse 정지
- Core shell FULL OPEN

## 9. FINAL

Final에는 새 기믹을 추가하지 않는다.

모든 공간 통제가 죽으면:

```text
CENTRAL APPROACH
OPEN
```

Player가 중앙 Void를 향한 명확한 Service Route를 타고
완전히 노출된 Control Core까지 접근한다.

Final:

**ROPE IMPACT → CENTRAL CORE**

Boss defeat.

## 10. 승리 연출

거대한 폭발보다 **통제의 정지**가 핵심.

순서:
1. Core control signal OFF
2. Partition movement STOP
3. Pulse warning OFF
4. Chamber warning light 순차 소등
5. Suspended Core가 정지/무력화
6. Rooftop Service Access 개방

System:

```text
CONTINUITY CHAMBER
CONTROL LOST

ROOFTOP SERVICE ACCESS
OPEN
```

Sector06의 실제 내용이나 추가 진실은 여기서 설명하지 않는다.

## 11. 반드시 피할 것

- Partition 자체를 Boss처럼 연출
- Boss05에서 Capacity/Priority/Authorization Story 재설명
- AEGIS/Jammer/Cutter/Artillery를 다시 순서대로 시험
- Partition 압사 즉사
- Arena collapse
- Boss Timer 추가
- Pulse로 Rope를 자르거나 강제 Release
- P1/P2/P3가 모두 같은 Partition 3회 반복처럼 보이는 구성
- Main Actuator 뒤에 또 다른 새로운 combat gimmick 추가
