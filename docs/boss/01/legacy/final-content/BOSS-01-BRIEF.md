# BOSS 01 — GATE LOCKING CARRIAGE

> 상태: **AUTHORED FINAL CONTENT / RUNTIME NOT IMPLEMENTED**
> AUTHORING SNAPSHOT: `a8ad8658cc94df4f766a0da5ff921a2e77e96300`
> 역할: Sector01 → Sector02 Transition Boss

## 1. 핵심 정의

1-8의 `Maintenance Override`와 `WORKER DISTRICT / ACCESS OPEN`은 그대로 유지한다.

Boss01은 Gate를 다시 잠그지 않는다.

Gate 상부의 거대한 Locking Assembly가 비상 분리되어 단일 수평 Rail에 체결되고,
열린 Gate를 넘어가려는 Player를 공격한다.

**Boss 본체 = GATE LOCKING CARRIAGE**

## 2. 1-8 연결

```text
1-8 Maintenance Override
→ LOWER GRID CONNECTION / TERMINATING
→ WORKER DISTRICT / ACCESS OPEN
→ WORKER DISTRICT / BLOCK 12 첫 Reveal
→ Locking Assembly DETACH
→ GATE LOCKING CARRIAGE
→ Boss01
→ Carriage 정지
→ 열린 Gate 통과
→ Sector02
```

기존 Boss01의:
`Boss 승리 → Worker District Access Open`
구조는 폐기한다.

## 3. Arena

하나의 단일 수평 Rail을 중심으로:

- Upper Maintenance Frame
- Carriage Rail
- Lower Catwalk / Recovery
- 열린 Gate
- Gate 너머 Worker District

를 동시에 읽게 한다.

첫 Boss이므로 Rope 목표와 회복층이 명확해야 한다.

## 4. P1 — FULL CROSSBEAM

대표 문법:

```text
CARRIAGE TRAVEL
→ LOW FULL CROSSBEAM SWEEP
→ MAX EXTENSION
→ REAR DRIVE EXPOSED
→ ROPE FLANK
→ IMPACT
```

목적:
- Sweep을 정면으로 버티는 것이 아니라 위/아래로 피한다.
- Sweep이 끝나면 뒤를 잡는다.
- Rope 이동 자체가 공격 준비다.

P1 약점:
**Rear Drive**

## 5. P2 — DIRECTIONAL BROKEN BEAM

P1 충격으로 Locking Beam 일부가 파손된다.

규칙:

```text
Carriage moving RIGHT
→ RIGHT Beam remains

Carriage moving LEFT
→ LEFT Beam remains
```

즉:
**진행 방향 쪽 Beam이 위험 방향**이다.

Player는 진행 방향을 보고 반대 측면으로 flank한다.

Sweep 종료 후:
**Side Gearbox** 노출.

P1과 차이:
- P1 = 뒤를 잡는다.
- P2 = 진행 방향을 읽고 반대 측면을 잡는다.

## 6. P3 — CENTRAL LOCK CORE

P2 이후 Carriage가 마지막 Full-Speed Sweep을 시도한다.

```text
FULL-SPEED SWEEP ATTEMPT
→ DAMAGED BEAM FAILURE
→ BEAM FULL BREAK
→ CENTRAL ARMOR TEARS OPEN
→ CENTRAL LOCK CORE EXPOSED
```

이 시점부터 Beam 공격은 종료.

P3 공격:
**Rail Ram only**

Player는 움직이는 Carriage의 Core를 Rope로 추적해 최종 Impact한다.

## 7. Victory

Final Core Impact:

```text
CARRIAGE POWER LOSS
→ FULL STOP ON RAIL
```

폭발하지 않는다.
추락하지 않는다.
Gate를 다시 닫지 않는다.

승리 후:

1. Carriage 조명 순차 소등
2. Worker District 생활광 유지
3. Worker District 생활소음이 전면으로 남음
4. 짧은 Camera framing
   - Player
   - 정지한 Carriage
   - 열린 Gate
   - Worker District 첫 건물층
5. 즉시 Player control 유지
6. Sector02 진입

## 8. Story Boundary

Boss01은 다음을 설명하지 않는다.

- 누가 사고를 일으켰는지
- Lower Grid termination의 실제 피해
- 회사의 고의 여부
- Worker District의 구체적 사회상
- Group C의 의미

1-8이 만든 첫 질문을 Boss01이 덮지 않는다.

Boss01 역할은:
**첫 Reveal 뒤 물리적 Transition obstacle**이다.

## 9. 전투 원칙

- Boss는 단일 명확한 산업기계
- Human / creature boss 아님
- Stationary shooting arena 금지
- Rope flank가 핵심
- P1/P2/P3 공격 의미가 서로 다름
- Boss Timer 없음
- Arena collapse 없음
- 새 Rope input 없음
- 새 Growth 없음
- 실패 후 local recovery 우선

## 10. Rope QA

Base Hook Reach:
**400px**

Final authored route:
- relations: **17**
- max relation: **357.77px**
- non-adjacent ≤400px shortcut: **0**

모든 mandatory authored relation은 400px 이내이며,
비의도 Base shortcut은 0이다.
