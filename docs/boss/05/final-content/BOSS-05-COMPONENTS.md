# BOSS 05 — 구성요소 명세

> 목적: **무엇이 존재해야 하는지**만 정리한다.
> 구현 방법·클래스·함수·파일 수정 절차는 포함하지 않는다.
> 상태: **AUTHORED FINAL CONTENT / RUNTIME NOT IMPLEMENTED**
> AUTHORING SNAPSHOT: `e827ead2ef88a4a04b0291952b9c3a2e04ce4441`

## 1. Encounter 구성

### A. Suspended Continuity Control Core
- Boss 본체
- 중앙 Control Void 위에 떠 있는 직육면체형 대형 기계체
- P1~Final까지 항상 시각적으로 존재
- shell은 Actuator 파괴에 따라 단계적으로 개방
- Final에 Core 완전 노출

### B. AUX ACTUATOR A
- 좌측 보조 구동계
- Partition 01 제어
- P1 대상

### C. AUX ACTUATOR B
- 우측 보조 구동계
- Partition 02 제어
- P2 대상

### D. MAIN ACTUATOR
- Core 바로 아래
- 가장 크고 가장 무거운 중앙 구동계
- Main Authority Partition 제어
- P3 대상

### E. Sliding Partition
- Boss 본체가 사용하는 공간 통제 장치
- 독립 보스 아님

### F. Control Pulse
- P2/P3 이동 압박
- 지속 체류를 불리하게 만드는 보조 공격

## 2. Visual Hierarchy

화면 우선순위:

1. Player
2. Rope
3. Central Core
4. 현재 활성 Actuator
5. 움직이는 Partition
6. 노출 Coupling
7. Service Hardpoint route
8. Pulse Warning
9. 환경 Detail

Core보다 Partition이 더 강한 시각적 중심이 되면 실패.

## 3. Suspended Core 형태

- rectangular / corporate / heavy
- 중앙 Void 상부
- 완성된 기업 설비 외장
- sealed surface
- 내부 warm mechanical core
- 3개 Actuator control link가 물리적으로 읽힘

Core shell states:

```text
P1 START
CLOSED

A DESTROYED
OPEN 1/3

B DESTROYED
OPEN 2/3

MAIN DESTROYED
FULL OPEN
```

## 4. Actuator 공통 규칙

모든 Actuator:

```text
MOVING
→ PARTITION TRAVEL

FULL CLOSE
→ LOCK

LOCK
→ CENTRAL COUPLING EXPOSED

COUPLING HIT
→ ACTUATOR DISABLED
```

Coupling은:
- 평소 명확히 보호
- LOCK 시 강하게 노출
- Rope Impact target

## 5. P1 구성

### 공간 상태
- 하나의 Chamber
- 중앙 Divider 01
- 좌/우 Cell
- perimeter Service Route

### 위협
- Partition movement
- Pulse 없음

### 약점
- AUX A Central Coupling

### 실패
- 잘못된 쪽에 남았다고 즉사하지 않음
- local recovery route 존재
- 재도전 ≤5 sec 목표

### 완료
- AUX A OFF
- Core shell first opening

## 6. P2 구성

### 공간 상태
같은 Chamber.

Partition 02는 P1과 다른 위치/구획감을 만든다.

### 위협
- Partition movement
- Control Pulse

### Control Pulse
- visible telegraph
- short knockback
- small damage
- no Rope Cut
- no forced detach
- no instant death

### 약점
- AUX B Central Coupling

### 완료
- AUX B OFF
- Core shell second opening

## 7. P3 구성

### 공간 상태
같은 Chamber.

Core 바로 아래 Main Actuator와 가장 큰 Main Authority Partition.

### 위협
- Main Partition
- stronger but readable Pulse cadence

### 약점
- MAIN Central Coupling

### 완료
- MAIN OFF
- all Partition STOP
- all Pulse STOP
- Core FULL OPEN

## 8. Final 구성

### 상태
```text
CHAMBER CONTROL LOST
```

### 공간
- Partition stopped
- 중앙 접근선 명확
- 새 enemy 없음
- 새 puzzle 없음

### 대상
Suspended Core 내부 중앙 Core.

### 공격
Final Rope Impact.

### 승리
- Core disabled
- warning OFF
- Rooftop Service Access OPEN

## 9. Rope topology QA

Planning bounds:
**약 5200×2800**

Base Hook Reach:
**400px**

Final perimeter Service scaffold:
- authored relations: **20**
- max authored relation: **360.56px**
- non-adjacent pairs ≤400px: **0**

즉:
- mandatory Service relations 모두 Base 400px 이내
- 비의도 ≤400px shortcut 0
- 좌/우 상부 route 사이 직접 Base shortcut 없음

최종 구현에서는 Partition collision/occlusion 상태별로 동일 기준을 다시 확인해야 한다.

## 10. Story Boundary

Boss05가 추가로 말하지 않는 것:
- 새로운 책임자
- named executive villain
- planned Cascade
- 고의적 casualty directive
- 새로운 Capacity/Priority 문서
- Sector06의 결론

Boss05는 **전투/탈출 경계**다.

## 11. 현재 기반과 신규 구성요소

### 현재 게임 기반으로 유지해야 하는 것
- Base Rope 400px authored standard
- collision yes / grappleable no sealed surface 문법
- Rope Impact
- general damage/knockback presentation
- Boss encounter phase/exposure 기반

### Boss05 신규 구성요소
- Suspended Core presentation
- Actuator A/B/Main
- Sliding Partition travel/lock states
- Coupling exposure at LOCK
- Control Pulse zone
- Core shell staged opening
- chamber-control-lost state
- stopped-partition final state

모든 신규 항목은 **NOT IMPLEMENTED**로 취급한다.
