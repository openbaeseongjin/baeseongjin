# SECTOR 03-8 — ROPE-AWARE BLOCKOUT

*REV 2.0 · PHYSICS-FIRST MAP NOTES*

이 문서는 README의 기획을 실제 Blockout으로 옮기기 위한 작업용 문서다.

## 1. 설계 원칙

```text
Anchor distance alone is insufficient.
```

각 mandatory beat는 다음 연속 상태로 검증한다.

```text
LAUNCH STATE
(position + velocity + body angle)
→ HOOK FLIGHT
→ ATTACH POINT
→ FIXED ROPE LENGTH
→ TANGENTIAL SWING IMPULSE
→ RELEASE STATE
→ 1.0s BASE RELOAD
→ LAND / COAST
→ NEXT HOOK
```

## 2. Current Baseline

```text
Player radius 15
Gravity 1250

Hook speed 1200
Hook reach 400
Hook flight max 0.333s
Hook reload 1.0s
Aim tolerance 90
Swing impulse 780
Release angular transfer 0.55
```

## 3. Provisional Nodes

> HYPOTHESIS. 구현 좌표 아님.

```text
ENTRY APPROACH (-416,-160)

C1             (-160,-352)
READ A          (  96,-480)

S2             (-192,-544)
C2              ( 384,-704)

MID             (-128,-800)

S3              ( 160,-864)
C3             (-416,-1024)

FINAL LAUNCH     (128,-1120)
C4               (416,-1344)

ARCHIVE          (  0,-1440)
```

## 4. Direct Hook Planning Distances

Approximate center planning values only:

```text
ENTRY APPROACH → C1
dx 256 / dy -192
distance ≈ 320

READ A → C2
dx 288 / dy -224
distance ≈ 365

READ A → S2
dx -288 / dy -64
distance ≈ 295

MID → C3
dx -288 / dy -224
distance ≈ 365

MID → S3
dx 288 / dy -64
distance ≈ 295

FINAL LAUNCH → C4
dx 288 / dy -224
distance ≈ 365
```

모두 계획상 400 안이지만
실제 attach는 center가 아니라 target surface closest point + hand origin을 사용하므로 Simulation 재검증 필요.

## 5. Why S2/S3 Are Lateral

Wait Pivot을 launch deck과 거의 같은 높이, 반대편에 두면:

```text
radial vector ≈ horizontal
tangent vector ≈ vertical
```

이 되어 Swing Impulse 780의 큰 부분을 상승에 활용할 수 있다.

반대로 Wait Pivot을 Player 바로 위에 두면 tangent가 수평에 가까워져
Reload runway를 위한 상승 여유가 줄어든다.

## 6. Base Reload Window

C2/C3가 LOCKED일 때:

```text
LOCKED 1.1
RESET  0.3
total  1.4s
```

Base Rope:

```text
release reload 1.0s
+
~0.25–0.31s Hook flight
```

Scanner의 잠긴 시간과 유사한 scale이다.

하지만 exact phase sync를 mandatory timing으로 만들지 않는다.

이 Stage는:

```text
“1.25s 뒤에 무조건 AVAILABLE”
```

를 암기하는 rhythm game이 아니라

```text
movement during downtime
+
read scanner again before commit
```

가 목적이다.

## 7. Aim Separation

Current candidate search tolerance:

```text
90px
```

따라서 S2와 C2, S3와 C3은 Screen-space / World-space 모두에서
명확히 다른 조준 target으로 읽혀야 한다.

검증:

- candidate closest point
- cursor around midpoint
- mobile camera
- player rotation hand offset
- alternate incoming approach

## 8. Long Rope Test

`long-rope`:

```text
400 → 480
```

검증 항목:

- C1에서 C2를 직접 잡아 phase beat skip 가능한가?
- C2에서 C3 직접 grab 가능한가?
- recovery에서 upper story deck 직행 가능한가?
- archive/final boundary를 구조적으로 건너뛸 수 있는가?

Expressive skip은 허용할 수 있지만
Story / gate objective skip은 허용하지 않는다.

## 9. Fast Recover Test

`fast-recover`:

```text
1.0s → 0.5s
```

Player가 S2/S3에서 더 일찍 Hook 가능해진다.

그래도:

- LOCKED surface는 attach predicate가 막아야 함
- Player는 WAIT PIVOT을 더 짧게 사용할 수 있음
- mandatory timing이 깨지는 게 아니라 faster line이 되어야 함

## 10. Release Propulsion Test

`release-propulsion`:

```text
velocity ×1.25
```

주의:

- low ceiling 금지
- narrow wall funnel 금지
- main landing deck edge 여유 확보
- high-speed collision을 강제로 만들지 않음

## 11. Direction Dash / Slow Fall

`direction-dash`:

```text
150px / 0.25s
```

`slow-fall`:

```text
2s / gravity ×0.25
```

둘 다 recovery optimization으로 작동해야 한다.

없으면 못 넘는 mandatory gap 금지.

## 12. Drone Bands

Recommended concept:

```text
Drone A activation
= S2 / C2 transition only

Drone B activation
= S3 / C3 transition only
```

두 band 사이에는 clear vertical separation을 둔다.

Archive Deck:

```text
NO ACTIVE DRONE PRESSURE
```

## 13. Recovery

Recovery A:
- C2 miss
- lower service ledge
- 3–4s target to READ/MID

Recovery B:
- C3 miss
- lower service ledge
- 3–4s target to MID/FINAL

Recovery anchor 자체가 Long Rope shortcut이 되지 않게 한다.

## 14. Camera Test

Desktop 1.0 / Mobile 0.72 각각:

- launch deck에서 intended main anchor가 보임
- wait pivot이 보임
- 둘이 너무 가까워 candidate ambiguity를 만들지 않음
- Drone이 next beat까지 동시에 보이며 심리적 crossfire를 만들지 않음
- release-propulsion speed에서 landing deck을 잃지 않음

## 15. Approval Gate

다음이 모두 확인되기 전 Scenario Art 금지:

```text
BASE ROPE SIMULATION PASS
400px ATTACH PASS
AIM AMBIGUITY PASS
SCANNER WAIT PIVOT PASS
AUGMENT COMPAT PASS
DRONE BAND PASS
RECOVERY PASS
CAMERA PASS
STORY DECK PASS
```
