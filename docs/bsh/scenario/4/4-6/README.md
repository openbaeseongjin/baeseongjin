# SECTOR 04-6 — PRIVATE SKYBRIDGE

*APPROVED BLOCKOUT PACKAGE · REV 2.6 — ROPE INTERRUPTION UNDER PURSUIT*

◀ PREV — `4-5 AMENITY ATRIUM` · NEXT — `4-7 REFUGE TERRACE` ▶

| 항목 | 기준 |
|---|---|
| Status | **DESIGN LOCKED · NOT IMPLEMENTED** |
| Snapshot | `90208deb1e1946538dd76c22e280fcf7677106bd` |
| Runtime | `0.31.2` / `seamless-sector-landmark-v1` |
| Current source | Legacy `POWER RELAY SPAN` — migration required |
| Threats | Guard A + Static Cutter + Guard B |
| Max Hostiles | 3 |
| Mandatory Kill | NONE |

## 1. Core

> **뒤에서 Persistent Guard가 추격하는 동안 Cutter의 Lock/Fire를 읽고 지금 Rope를 걸 것인가, Cutter를 먼저 제거할 것인가?**

```text
Guard A pursuit
→ Cutter Read
→ Rope-cut pressure
→ Central Pylon
→ Guard B stack
→ Exit
```

## 2. Latest Rope

```text
Hook speed       1200
Hook lifetime    1/3s
Reach            400
Reload           0.50s
Swing impulse    780
Rope Cut disable 0.60s
```

일반 Rope 실패/해제의 재발사 대기는 0.50초로 줄었지만 Cutter Cut의 별도 차단은 0.60초이므로 여전히 더 강한 interruption이다. Fast Recover는 normal reload를 줄이지만 Cutter disable을 무효화하는 열쇠로 설계하지 않는다.

## 3. Wide City

최신 world compiler는 `VERTICAL ASCENT SPINE + LATERAL CITY WINGS`를 유지한다. Private Skybridge는 상층 주거 lateral wing을 연결하지만 Stage 결과는 계속 위로 상승한다.

## 4. Backbone

```text
ENTRY
→ A1
→ LOWER PRIVATE BRIDGE / Guard A
→ A2
→ CUTTER READ BALCONY
→ A3
→ CENTRAL SECURITY PYLON / Static Cutter
→ A4
→ UPPER PRIVATE BRIDGE / Guard B
→ A5
→ EXIT / PRIVATE TOWER
```

## 5. Static Rope

| Sample | Hand→Anchor | Margin | Flight |
|---|---:|---:|---:|
| L0 → A1 | 290.4px | 109.6px | 0.242s |
| L1 → A2 | 290.3px | 109.7px | 0.242s |
| L2 → A3 | 277.7px | 122.3px | 0.231s |
| L3 → A4 | 290.3px | 109.7px | 0.242s |
| L4 → A5 | 189.8px | 210.2px | 0.158s |

## 6. Guard A

```text
(-440,-430) ↔ (320,-430)
speed 64 candidate
wait .22 candidate
```

발각 후 `PATROL → ALERT LATCH → PERSISTENT PURSUIT`. Cutter Read/Recovery에서 Alert를 풀지 않는다.

## 7. Static Cutter

```text
position (650,-825)
role PRIVATE SKYBRIDGE ROPE-INTERDICTION SECURITY
```

Current Runtime의 `cutter-fire`를 재사용한다. Rope segment 충돌은 body hit보다 먼저 판정되고, cut은 forced release + launcher clear + Rope-disabled를 만든다. Cutter는 추격하지 않고 authored Security Pylon에 남는다.

## 8. Cutter Read Balcony

Safe Room 아님. Guard A가 살아 있으면 진입한다.

```text
KILL CUTTER   = 시간을 써서 미래 interruption 제거
COMMIT        = Momentum 유지, Cut risk 감수
REPOSITION    = Telegraph를 읽고 짧게 타이밍 조정
```

## 9. Recovery

R2 `(110,-930)`와 R3 `(-30,-1210)`는 representative Rope-cut 낙하를 받아준다. `CUT → FALL → RECOVERY → REJOIN`; cut을 deterministic death로 만들지 않는다.

## 10. Guard B

```text
(-260,-1350) ↔ (520,-1350)
speed 76 candidate
wait .18 candidate
```

Worst overlap는 `Guard A pursuit + Guard B pursuit + Static Cutter = 3 hostiles`. Cutter band를 벗어나면 Exit까지 이동 추격은 A/B 최대 2기다.

## 11. Story

```text
PRIVATE SKYBRIDGE
RESIDENT-ONLY TOWER LINK
ROPE-INTERDICTION SECURITY ACTIVE
```

상층의 건물 간 이동 연결부 자체가 적극적으로 보호됐다는 사실만 보여주고 Corporate causality는 Sector05로 넘긴다.

## 12. Augment

Long Rope, Fast Recover, Release Propulsion, Direction Dash, Combat Action은 표현/효율만 바꾼다. 특정 Augment required = FAIL.

## 13. Excluded

`NO Wind · NO Scanner · NO Moving Anchor · NO Treatment Pod · NO fourth hostile`. 4-5의 Moving Anchor를 바로 반복하지 않는다.

## 14. AREA-SPEC

최신 REV1.1 규칙에 따라 Runtime baseline 숫자는 AREA-SPEC acceptanceTests에 복제하지 않는다. Main validator는 아직 Cutter/Persistent Guard preset을 KNOWN으로 갖고 있지 않아 authoring dependency를 `NOT_IMPLEMENTED`로 명시했다. Underlying `cutter-fire` Runtime 자체는 VERIFIED capability다.

## 15. Sector Access system

새 Cross-Sector Access Proof는 별도 Master Plan으로 기획한다. 승인 전에는 4-6 package에 임의의 Key/Relay를 추가하지 않는다.
