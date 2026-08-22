# BOSS 01 — COMPONENTS

> 상태: **AUTHORED FINAL CONTENT / RUNTIME NOT IMPLEMENTED**
> AUTHORING SNAPSHOT: `a8ad8658cc94df4f766a0da5ff921a2e77e96300`

## 1. Boss Object

### GATE LOCKING CARRIAGE
- Gate 상부 Locking Assembly가 분리된 산업기계
- 단일 수평 Rail에 고정
- Gate 자체와 별도 객체
- Worker District Access를 다시 잠그지 않음

## 2. Arena Objects

### Upper Maintenance Frame
- 상부 Rope flank route
- Sweep 회피와 P2 방향 전환에 사용

### Main Locking Rail
- Carriage 이동 축
- 단일 수평 Rail

### Lower Catwalk / Recovery
- 하부 회복층
- miss 후 main band 복귀 지원

### Open Gate
- 1-8에서 이미 열린 상태 유지

### Worker District Background
- Boss 전부터 보임
- Victory 후 생활광/생활소음 강조

## 3. Phase 1 Components

### Full Crossbeam
- 넓고 느린 Low Sweep
- 첫 Boss용 명확한 Telegraph

### Rear Drive
- MAX EXTENSION 후 노출
- P1 Rope Impact target

P1 loop:

```text
FULL BEAM SWEEP
→ MAX EXTENSION
→ REAR DRIVE
→ ROPE FLANK
→ IMPACT
```

## 4. Phase 2 Components

### Broken Directional Beam
- Carriage 진행 방향 쪽 Beam만 남음

```text
RIGHT travel → RIGHT Beam
LEFT travel → LEFT Beam
```

### Side Gearbox
- Sweep 종료 후 반대 측면에서 노출
- P2 Rope Impact target

P2는 P1 Rear Drive 반복이 아니다.

## 5. Phase 3 Components

### Beam Failure
- 마지막 Full-Speed Sweep 시도에서 완전 파손
- 이후 Beam attack 제거

### Central Armor
- Beam failure와 함께 개방

### Central Lock Core
- Final damage target

### Rail Ram
- P3 유일한 직접 공격
- readable telegraph
- no instant kill requirement

## 6. Boss State Readability

Visual priority:

1. Player
2. Rope
3. Carriage body
4. active Beam / Ram telegraph
5. exposed weakpoint
6. Upper / Lower route
7. Open Gate
8. Worker District background

P2에서는 반드시:
**Carriage 이동 방향 = 남아 있는 Beam 방향**
이 한눈에 보여야 한다.

## 7. Recovery

Standard target:
- miss → stable recovery → main band ≤5 sec 목표

Lower Catwalk:
- visible before commitment
- no blind fall
- no stage-start reset for normal miss

## 8. Victory Presentation

```text
FINAL CORE IMPACT
→ POWER LOSS
→ CARRIAGE FULL STOP
→ LIGHTS OFF
→ DISTRICT LIGHT / LIFE SOUND REMAINS
→ OPEN GATE TRAVERSE
```

No explosion.
No fall.
No Gate reclosing.

## 9. Rope Geometry QA

- Base Reach: **400px**
- authored relations: **17**
- max relation: **357.77px**
- non-adjacent ≤400px: **0**

## 10. Not Included

- Implementation pseudocode
- Runtime delta
- test plan
- class/file instructions
- new enemy AI
- new Rope mechanic
- Boss timer
- arena collapse
