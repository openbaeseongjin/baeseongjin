# BOSS 06 — COMPONENTS

> 상태: **AUTHORED FINAL CONTENT / RUNTIME NOT IMPLEMENTED**
> AUTHORING SNAPSHOT: `7e235084e86591adef107d84c9f527e5fadb2d3e`
> 구현 절차·코드·테스트 지시는 포함하지 않는다.

## 1. Primary Objects

### MAINTENANCE SHUTTLE
- 실제 탈출 수단
- `STANDBY`
- Boss 본체 아님
- 파괴 대상 아님
- 전투 내내 중앙 시각 목표

### CLAMP A
- Left Structural Island
- Low Arm Sweep
- MAX EXTENSION
- Rear Joint exposure
- P1 release target

### CLAMP B
- Upper Structural Island
- High Arm Sweep
- short Counter-Window
- Side Coupling exposure
- P2 release target

### DEPARTURE TOWER
- Right Structural Island / Shuttle 후방
- P3 최종 구조물
- 세 번째 Clamp 아님

### DEPARTURE INTERLOCK
- P3 최종 공격 대상
- 파괴 시 Departure Lock 해제

### PAD LIGHTING ARMS
- P3 보조 위협
- 일부 Route Sweep
- no Rope Cut
- no instant death

### PAD BEACON
- 승리 후 순차 정상 점등
- Boarding availability를 시각적으로 전달

## 2. Phase State

```text
START
Clamp A = LOCKED
Clamp B = LOCKED
Departure Interlock = LOCKED

P1 WIN
Clamp A = RELEASED

P2 WIN
Clamp B = RELEASED

P3 WIN
Departure Interlock = RELEASED
Pad Security = OVERRIDDEN
Boarding = AVAILABLE
```

## 3. P1 Attack Contract

```text
LOW SWEEP
→ MAX EXTENSION
→ REAR JOINT EXPOSED
→ ROPE IMPACT
```

- positional read
- generous first-phase clarity
- Clamp remains physically legible as Shuttle restraint

## 4. P2 Attack Contract

```text
HIGH SWEEP
→ COUNTER-WINDOW
→ SIDE COUPLING EXPOSED
→ ROPE IMPACT
```

- timing read
- Counter-Window short but telegraphed
- no hidden exposure state

## 5. P3 Attack Contract

```text
PAD LIGHTING ARMS
→ ROUTE PARTIAL DENIAL
→ DEPARTURE TOWER APPROACH
→ INTERLOCK IMPACT
```

- A/B Clamp do not reactivate
- no third Clamp repetition
- no Scanner/Cutter/Patrol reprise
- no new combat system

## 6. Arena Geometry

Primary:
- Structural Island A
- Structural Island B
- Structural Island C
- central Pad 03
- visible Shuttle
- visible lower recovery structures

Combat route:
- authored links: **16**
- maximum link: **358.05px**
- non-adjacent ≤400: **0**

Mandatory geometry is Foundation-independent.

## 7. Threat Readability

Visual priority:
1. Player
2. Rope
3. Shuttle
4. active Clamp / Tower
5. current exposed Joint / Coupling / Interlock
6. Sweep telegraph
7. Structural Route
8. background skyline

Forbidden:
- background antenna mistaken for grapple target
- Clamp attack hidden by Shuttle silhouette
- Lighting Arm sweep covering entire Pad
- recovery layer invisible before commitment

## 8. Recovery

Standard target:
- failure → stable recovery → main band ≤5 sec

Open Sky:
- no blind fall
- no instant death sky dependency
- recovery structure visible before major commitment

## 9. Victory Presentation

```text
CLAMP A RETRACT
CLAMP B RETRACT
PAD BEACON NORMAL
SHUTTLE IDLE ON
BOARDING AVAILABLE
```

Final approach:
- safe
- readable
- no precision gate
- no last hazard

## 10. Ending Boundary

Boss06 owns:
- Security override
- Pad release
- Boarding availability

Ending owns:
- Shuttle departure
- city-wide visual
- Red Scarf
- `EVACUATION COMPLETE`

No post-escape world-resolution claim.
