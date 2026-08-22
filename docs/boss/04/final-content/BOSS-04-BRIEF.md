# BOSS 04 — 상층 주거 보안 시스템
## 핵심 브리프 + 스토리/연출

> 상태: **AUTHORED FINAL CONTENT / RUNTIME NOT IMPLEMENTED**
> AUTHORING SNAPSHOT: `6a8911d354df6b218a64970b5d35d41359ef62f2`
> Sector: **04 UPPER RESIDENTIAL / AMENITY DISTRICT**
> Sector Theme: **PRIVILEGE IS PROTECTED**

## 1. 한 줄 정의

**잘 관리된 상층 주거·피난 구역에서 두 경비기가 각자의 보호 Territory를 교대로 추격한다. Player는 Rope로 높이·시야·경로를 바꿔 추격을 끊고 Return 상태에서 Guard A의 후방 추진기와 Guard B의 측면 제어기를 역공한다. 마지막에는 두 경비의 보호 링크를 차례로 끊어 중앙 Security Hub의 Shield를 해제하고, 좌·우 어느 쪽에서든 중앙 Core에 최종 Rope Impact를 가한다.**

## 2. Boss04의 정체성

Boss04는 **보스 2마리**가 따로 존재하는 구조가 아니다.

하나의 Boss Encounter가 세 요소로 구성된다.

1. **Guard A** — 상부 감시 / 추격 / 후방 추진기
2. **Guard B** — 경로 차단 / 추격 / 측면 제어기
3. **Central Security Hub** — 두 Guard의 보호 링크를 소유하는 최종 Core

즉 Guard A/B는 같은 보호 시스템의 두 팔이다.

## 3. TOP 3 우선순위

### 1순위 — 도망치는 것이 공격 준비가 된다

핵심 문법:

```text
발각
→ Pursuit
→ Rope로 높이 / 시야 / Route 변경
→ Territory Exit
→ 시야 차단 유지
→ Guard Return
→ 약점 노출
→ Rope Impact
```

### 2순위 — Guard A와 B는 확실히 달라야 한다

**Guard A**
- Player보다 높은 위치 유지
- 짧은 Burst로 착지점 압박
- 공간: Private Sky Garden
- 약점: 후방 추진기

**Guard B**
- 상/하 Skybridge 이동선 압박
- 짧은 Dash로 다음 착지점 선점
- 공간: Residential Skybridge / Refuge Terrace
- 약점: 측면 제어기

### 3순위 — 보호 시스템이 추격을 “인계”한다

P3의 핵심은 두 Guard가 무작정 동시에 쫓는 것이 아니다.

```text
GUARD A PURSUIT
→ Territory 경계
→ A Return 시작
+
B Acquire 시작
→ 짧은 HANDOFF OVERLAP
→ GUARD B PURSUIT
```

보안 시스템의 보호 구역이 이어진다는 느낌이 중요하다.

## 4. Sector 04와의 연결

Sector04의 핵심 질문:

> **“발견되기 전에 통과할 것인가, 발견된 뒤에도 추격을 끊지 않고 도망칠 수 있는가?”**

Boss04는 이 문법을 그대로 최종 시험으로 발전시킨다.

4-8 종료:
```text
PROTECTED ASCENT
POWER NORMAL

ASCENT CONTROL
READY
```

Player:
> “…여긴 아직도 정상이라고?”

그 뒤 실제 Protected Upper Residence 구간 진입 순간 Boss04 보안체계가 Player를 비인가 침입자로 판단한다.

## 5. 전체 공간

약 **5400×2500 planning space**

진행:

```text
4-8 / PROTECTED ASCENT
↓
P1 PRIVATE SKY GARDEN
↓
REFUGE LANDING
↓
P2 UPPER / LOWER SKYBRIDGE
↓
REFUGE TERRACE
↓
P3 LEFT / RIGHT TERRACE + HIGH SKYBRIDGE
↓
CENTRAL SECURITY HUB
↓
PROTECTED GATE
↓
SECTOR05 CONTINUITY CONTROL 방향
```

## 6. P1 — Guard A

### 공간
- Private Sky Garden
- Pergola
- Residential Terrace
- 중앙의 큰 조경 Void
- 낮고 넓은 시야 차단 구조

### Guard A 행동
- Player보다 약간 높은 위치에서 추격
- 짧은 Burst로 현재 위치가 아니라 **다음 착지 후보**를 압박
- Territory 밖까지 무한 추적하지 않음

### 승리 문법
```text
Guard A 발견
→ Sky Garden 추격
→ Pergola / Terrace / Void로 높이와 시야 변경
→ Territory Exit
→ 시야 차단 유지
→ A Return
→ 후방 추진기 노출
→ Rope Impact
```

P1 질문:

> **“추격자를 쓰러뜨리는 게 아니라, 추격을 끊어서 공격 기회를 만들 수 있는가?”**

## 7. Refuge Landing

P1→P2 사이 짧은 Safe.

요구:
- Guard A 진입 불가
- Guard B는 아직 공격하지 않음
- 다음 Upper / Lower Skybridge가 바로 보임
- Guard B의 이동 방향을 읽을 수 있음

별도 긴 Safe Room이 아니다.

## 8. P2 — Guard B

### 공간
- Upper Skybridge
- Lower Skybridge
- Refuge Balcony
- 넓은 Refuge Terrace

### Guard B 행동
- Player와 비슷한 높이에서 전방 Route 압박
- 일정 거리에서는 짧은 Dash
- Dash의 목적은 Player 직격보다 **다음 착지점을 선점**하는 것

### 승리 문법
```text
Guard B 발견
→ Upper / Lower Skybridge 선택
→ Dash로 다음 착지점 압박
→ 높이 변경 / Route 전환
→ Territory Exit
→ 시야 차단
→ B Return
→ 측면 제어기 노출
→ Rope Impact
```

## 9. P3 — Security Handoff

공간:
- Left Refuge Terrace
- Right Refuge Terrace
- High Refuge Skybridge
- 중앙 Protected Refuge Void
- Central Security Hub

P3에서는 두 Guard가 다시 작동한다.

하지만:
- A/B가 무한 동시 Pursuit하지 않음
- Territory 경계에서 짧은 Handoff Overlap만 존재
- 한 Guard가 Return할 때 다른 Guard가 Acquire

### P3 목표

1. Guard A Return 유도
2. **후방 추진기 재타격**
3. Guard A 보호 링크 OFF
4. Guard B Return 유도
5. **측면 제어기 재타격**
6. Guard B 보호 링크 OFF
7. Central Security Hub Shield 자동 해제

순서는 전투 상황에 따라 A/B가 일부 바뀌어도 되지만, **두 보호 링크를 모두 끊어야 Core가 열린다.**

## 10. Final Core

Central Security Hub는:
- Protected Ascent
- Refuge Security
- Guard A/B Docking Rail

이 연결된 중앙 보안 허브다.

두 Guard link OFF:
```text
PROTECTION LINK A / LOST
PROTECTION LINK B / LOST
↓
CENTRAL SECURITY SHIELD / OFFLINE
```

그 뒤 Player는 마지막으로 추격을 끊은 위치에 따라:

- LEFT Terrace
또는
- RIGHT Terrace

어느 쪽에서든 중앙 Core로 최종 Rope Impact 가능.

특정 한쪽을 정답으로 고정하지 않는다.

## 11. 승리 연출

폭발 중심 연출 금지.

승리 후:
- Guard A가 Docking 상태로 복귀
- Guard B가 Docking 상태로 복귀
- 두 기체의 추격등 OFF
- Central Security Hub 경고등 순차 소등
- 보호 유리/게이트가 조용히 열림
- Sector05 Continuity Control 방향이 처음 보임

System:
```text
RESIDENT SECURITY
PROTECTION LINK / OFFLINE

PROTECTED GATE
OPEN
```

## 12. Story 의미

Boss04가 보여주는 것:

> **아래에서는 대피가 멈췄는데, 상층은 주거·편의·피난·경비 체계까지 너무 정상적으로 유지되고 있다.**

아직 밝히지 않는다:
- Priority Route 이용자
- Group C 중단 직접 원인
- 누가 보호 우선순위를 결정했는가
- 상층 보호를 위해 하층이 희생됐는가
- Continuity decision의 주체

이 답은 Sector05가 소유한다.

## 13. 반드시 피할 것

- Guard A/B를 서로 무관한 2보스로 표현
- 두 Guard가 전 Phase 동안 동시에 무한 추격
- 단순 속도 상승으로만 난이도 강화
- Boss02처럼 건축물 충돌 반복
- 자동 시간 경과 후 약점 노출
- Territory가 화면에만 있고 실제 의미가 없는 구조
- 폭발로 상층 주거공간을 폐허화
- Sector05의 조직적 진실 조기 공개
