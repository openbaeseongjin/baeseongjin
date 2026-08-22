# BOSS 01 — 구성요소 명세

> 목적: **무엇을 만들어야 하는지**만 정리한다.
> 구현 방법/파일 수정 절차/의사코드는 포함하지 않는다.
> 상태: **AUTHORED FINAL CONTENT / RUNTIME PARTIALLY IMPLEMENTED**
> AUTHORING SNAPSHOT: `6a8911d354df6b218a64970b5d35d41359ef62f2`

## 1. 상태 구분

- **[현재 게임 기반]** 현재 코드/제품 계약에 존재
- **[Boss01 신규 연결 필요]** 기획은 확정됐지만 물리 Arena/월드 연결이 필요
- **[시각 요소]** Gameplay 권위를 바꾸지 않는 표현

## 2. 현재 게임 기반

### Boss 공용 상태
- HP 360
- 3 Phase
- Phase HP 120
- Exposure 8초
- Phase별 현재 Breaker 1개
- Breaker 성공 시 Core exposed
- Core exposed 동안만 Boss damage 적용
- Phase 완료 시 다음 Breaker로 이동
- 전멸 시 attempt reset

### Boss01 Definition
P1:
- `standard-emitter`

P2:
- `standard-emitter`
- `pulsed-wind`

P3:
- `alternating-emitters`
- `pulsed-wind`
- `no-crossfire`

### 금지
- Boss Timer 없음
- Arena collapse 없음

## 3. Boss 전체 형태

Boss는 단일 Actor가 아니라 **Containment Gantry 시설 전체**다.

반드시 포함:
- Gate Crown / HeadHouse mass
- Clamp assembly
- Vent / Fan assembly
- Gate Brake / Lock assembly
- 3개 Maintenance Breaker
- Security Emitter 위치
- Pulse Wind 영역
- Grapple 구조
- Local recovery decks
- Sector02 방향 passage

## 4. P1 구성요소

### 실제 설비
**Clamp Drive**

### Breaker
**M1 — Clamp Pressure Release**

### 노출 Core
**Clamp Drive Stress Seam**

### 압박
**Standard Emitter**

### 시각 상태
시작:
- Clamp 양측 locked
- pressure indicator active

Breaker 후:
- Clamp 잠금 일부 풀림
- Stress Seam / Core exposed
- 8초 노출 상태가 명확히 읽힘

Phase 완료:
- Clamp 한쪽 drive inactive
- 구조물은 남아 있으나 위협 기능 감소

## 5. P2 구성요소

### 실제 설비
**Vent Fan / Main Bearing**

### Breaker
**M2 — Backpressure Isolation**

### 노출 Core
**Exposed Fan Bearing**

### 압박
- Standard Emitter
- Pulse Wind

### Pulse Wind
**[현재 게임 기반]**
Sector01에서 이미 학습한 주기형 Wind를 재사용.

역할:
- 새 기믹이 아님
- Rope Arc / Landing timing 변화
- Damage gimmick으로 만들지 않음

### 시각 상태
Breaker 후:
- Bearing housing open
- Fan vibration 증가
- exposed bearing visible

Phase 완료:
- Bearing 파손
- Fan 불안정 회전 / 안전 감쇠

## 6. P3 구성요소

### 실제 설비
**Gate Lock / Brake**

### Breaker
**M3 — Gate Brake Manual Release**

### 노출 Core
**Lock Pin Fracture**

### 압박
- Alternating Emitters
- Pulse Wind
- No Crossfire

### Security 원칙
- 교대로 위협
- 동시 난사 금지
- 한 시점 dominant pressure 1개가 읽혀야 함

### 시각 상태
Breaker 후:
- Gate Brake housing open
- Lock Pin exposed
- Gate Crown warning light 최고 단계

Phase 완료:
- Lock Pin 파손
- Gate Brake release
- C-01 shutdown

## 7. Arena / Rope

기존 REV2.1 authored backbone을 유지한다.

- Mandatory links: **14**
- Route length: **3973.83px**
- Max adjacent link: **366.19px**
- Base Hook Reach: **400px**
- Non-adjacent pairs ≤400px: **0**

정식 원칙:
- Mandatory Base-clear
- 의도하지 않은 400px shortcut 없음
- 정상 recovery는 짧고 local
- 일반 miss가 Stage/Boss 전체 reset으로 이어지지 않음

## 8. 공간 진행

```text
POST-1-8 ENTRY
↓
P1 LOWER CLAMP ZONE
↓
MID TRANSFER
↓
P2 VENT / FAN ZONE
↓
UPPER TRANSFER
↓
P3 GATE LOCK ZONE
↓
GATE CROWN
↓
SECTOR 02 PASSAGE
```

이 공간은 1-8 자체가 아니다.

1-8 완료 후 Sector transition slot에 존재하는 별도 Boss 공간이다.

## 9. 1-8 연결 구성요소

### 1-8에서 유지
- Maintenance Override
- `LOWER GRID CONNECTION / TERMINATING`
- Worker District reveal
- `WORKER DISTRICT / ACCESS OPEN`
- `WORKER DISTRICT / BLOCK 12`

### Boss 시작
**[Boss01 신규 연결 필요]**
Sector02 playable 진입 직전:

```text
C-01 EMERGENCY CONTAINMENT
AUTOMATIC LOCKDOWN / ACTIVE
```

### Boss 승리
```text
C-01 EMERGENCY CONTAINMENT
OFFLINE

WORKER DISTRICT
PASSAGE RESTORED
```

→ Sector02 실제 진입.

## 10. 현재 게임 기반 vs 신규 연결 필요

### 현재 게임 기반
- Boss01 definition
- HP / Phase / Breaker / Exposure state
- 8초 exposure
- exposed 동안 damage 허용
- attempt reset
- Standard Emitter threat concept
- Pulse Wind capability
- Base Rope 400px

### 신규 연결 필요
- 실제 Post-Sector Boss Arena
- Clamp/Fan/Gate 물리 설비
- M1/M2/M3 world interaction object
- 실제 exposed Core world target
- Phase별 Security/Wind 배치
- Rope Impact → Boss damage 연결
- 자동 Boss entry
- Boss 승리 → Sector02 playable transition

## 11. 시각 가독성

우선순위:
1. Player
2. Rope / Anchor
3. 현재 dominant threat
4. 현재 Maintenance Breaker
5. exposed Core
6. Wind 상태
7. 다음 이동 목적지
8. 시설 배경

Breakers와 Core는 같은 색만으로 구분하지 않는다.
형태/점멸/기계 동작으로 상태가 읽혀야 한다.
