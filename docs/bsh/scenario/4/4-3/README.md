# SECTOR 04-3 — SKY GARDEN TERRACES

*APPROVED BLOCKOUT PACKAGE · REV 2.3 — CROSSWIND + GUARD WIND DRIFT*

◀ PREV — `4-2 RESIDENTIAL COURTYARD` · NEXT — `4-4 CARE PAVILION` ▶

`UPPER RESIDENTIAL` · `SKY GARDEN` · `PERSISTENT PURSUIT` · `CROSSWIND` · `GUARD WIND DRIFT`

| 항목 | 기준 |
|---|---|
| Status | **DESIGN LOCKED · NOT IMPLEMENTED** |
| Authoring Snapshot | `b6e5b640f04135545341d3368a843b45c35fcedd` |
| Runtime Model | `seamless-sector-landmark-v1` |
| Current Runtime | Legacy `FREIGHT BYPASS / CUTTER + TRANSIT WAKE` |
| Guard A | Garden Perimeter Loop → Persistent Pursuit |
| Guard B | Trellis Diagonal/Vertical Sweep → Persistent Pursuit |
| Wind | Existing 360 pulsed tuning reused |
| Guard Wind Drift | **REQUIRED · NOT IMPLEMENTED** |
| Normal Guard Wind Factor | **0.30 initial tuning** |
| Pursuit Dash Wind Factor | **0.12 initial tuning** |
| Cutter / Scanner / third Guard | NONE |
| Augment Node | NONE |

## 1. Core

> **Player와 Guard 모두 Wind에 영향을 받는 움직이는 공간에서, Wind phase를 기다리는 대신 Rope Momentum과 환경 Drift를 이용해 계속 전진한다.**

4-2의 Pursuit Stacking에 Crosswind를 더한다.

```text
PLAYER movement changes
+
GUARD actual position changes
+
PURSUIT spacing changes
```

## 2. Flow

```text
ENTRY
→ A1
→ LOWER GARDEN DECK
→ GUARD A / 4-point Perimeter Loop
→ A2
→ SHELTER / READ DECK
→ Crosswind Preview
→ A3
→ EXPOSED TERRACE
→ GUARD B / Trellis Sweep + Crosswind
→ A4
→ EXIT
→ 4-4 CARE PAVILION
```

별도 Safe/Flow route 없음.

## 3. Rope

```text
Hook Speed 1200
Reach 400
Reload 1.0
Swing Impulse 780
Hand Offset ±12,-7
```

| Sample | Hand→Anchor | Margin to 400 | Flight |
|---|---:|---:|---:|
| L0 → A1 | 295.7px | 104.3px | 0.246s |
| L1 → A2 | 262.4px | 137.6px | 0.219s |
| L2 → A3 | 292.6px | 107.4px | 0.244s |
| L3 → A4 | 295.0px | 105.0px | 0.246s |

Static reach는 PASS. Dynamic swing/release/landing + Wind + Pursuit는 Runtime graybox 대상.

## 4. Guard A

발각 전 4점 Loop:

```text
(-390,-390)
→ (260,-390)
→ (260,-610)
→ (-390,-610)
```

Speed 54 / wait 0.18s.

하부에서는 Wind 밖. 살려두면 Persistent Pursuit로 Crosswind/B band까지 따라오며 Wind zone 진입 후 Drift 적용.

## 5. Guard B

발각 전 3점 Sweep:

```text
(330,-780)
→ (80,-920)
→ (330,-1050)
→ pingpong
```

Speed 66 / wait 0.25s.

Patrol 자체가 Wind zone 안이라 발각 전부터 실제 위치가:

```text
AUTHORED AI MOVEMENT + WIND DRIFT
```

로 바뀐다.

## 6. Crosswind

기존 4-3 Wind tuning 재사용:

```text
Direction →
Strength 360

LULL 1.75
WARNING 0.70
ACTIVE 1.40
DECAY 0.30
```

Player는 현재 Runtime 그대로 sampled force를 velocity에 받는다.

- Grounded factor 0.35
- Wind shadow factor 0.15
- LULL/ACTIVE 모두 유효한 progression이어야 함

**LULL을 기다리는 것만 정답이면 FAIL.**

## 7. NEW — Guard Wind Drift

현재 Enemy에는 World Wind가 적용되지 않는다.

REV2.3:

```text
PRIMARY AI MOVEMENT
→ sample same World Wind
→ secondary Guard Drift
```

Waypoint는 움직이지 않는다.

### Initial tuning

Normal Patrol/Pursuit:

```text
factor 0.30
360 × 0.30 = 108 px/s raw ACTIVE drift
```

Pursuit Dash:

```text
factor 0.12
360 × 0.12 = 43.2 px/s raw ACTIVE drift
```

Dash factor를 낮춰 640 dash telegraph가 Wind 때문에 무너지지 않게 한다.

```text
Behavior = DESIGN LOCKED
0.30 / 0.12 = INITIAL PLAYTEST TUNING
```

### Rules

- LULL/WARNING multiplier 0 → no Drift.
- ACTIVE/DECAY → Drift.
- Guard A도 pursuit로 zone에 들어오면 Drift.
- Guard B는 Patrol 중에도 Drift.
- unalerted = activation bounds clamp.
- alerted = wider pursuit bounds clamp.
- projectile는 Wind 영향 없음.
- 가능하면 Player와 같은 Wind phase/occlusion sampling 재사용.

## 8. KILL vs OUTRUN

KILL:
```text
현재 시간 사용
→ 이후 pressure 제거
```

OUTRUN:
```text
Momentum 유지
→ Pursuer 유지
→ Wind가 상대 거리까지 바꿈
```

Wind 방향을 잘 이용하면 Player가 추격자와 거리를 벌릴 수 있다.

## 9. Worst Case

```text
A alive + alerted
B alerted
Wind ACTIVE
→ Player + A + B all environmentally displaced
```

최대 2 Pursuers. Third Guard 금지.

## 10. Recovery

- R1 Planter Edge
- R2 Lower Terrace Lip
- R3 Garden Service Ledge

Recovery는 Alert/Wind cycle을 reset하지 않는다. 5초 이내 현재 band 복귀 목표.

## 11. Story

보여주는 것:

```text
SKY GARDEN
RESIDENT AMENITY
EXTERIOR WEATHER SAFETY
AUTOMATED SECURITY
```

사람은 없지만 Garden/Weather/Security 시스템은 지속.

Corporate 원인/Group mapping/Evacuation hierarchy는 아직 공개하지 않는다.

## 12. Augment

Node 없음.

Fast Launch / Long Rope / Fast Recover / Release Propulsion / Direction Dash / Slow Fall = expression only.

Long Rope 480이 Shelter → Exit combined beat를 통째로 skip하면 FAIL.

## 13. AREA-SPEC REV1.1

최신 표준에 맞춰:

```text
stage
sourceExit
progression
route
runtimeDependencies
```

를 분리.

Current generic AREA-SPEC patrol 검증은 start/end 위주이므로, 승인된 multi-point Patrol + Pursuit + Wind Drift를 거짓 2-point route로 축소하지 않고:

```text
sector04-persistent-guard-v1
guard-wind-drift-v1
```

을 `NOT_IMPLEMENTED` 신규 시스템으로 선언한다.

## 14. Runtime Migration

Current:
```text
4-3 FREIGHT BYPASS
Cutter
Transit Wake
```

Target:
```text
4-3 SKY GARDEN TERRACES
Guard A Loop
Guard B Sweep
Persistent Pursuit
Guard Wind Drift
same Crosswind baseline
NO Cutter
```

## 15. PASS

- Base Rope 400 clear
- official swingImpulse=0 route check
- ACTIVE Wind playable
- A reaches Wind/B band if alive
- B visibly drifts in Patrol
- normal factor starts 0.30
- Dash factor starts 0.12
- two Pursuers + Wind readable
- Recovery does not clear Alert
- Guard does not drift outside state bounds
- projectile Wind unchanged
