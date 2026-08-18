# SECTOR 04-7 — REFUGE TERRACE

*APPROVED BLOCKOUT · REV2.7 — SECURITY CONVERGENCE IN ARCHITECTURAL TURBULENCE*

◀ `4-6 PRIVATE SKYBRIDGE` · NEXT `4-8 UPPER RESIDENTIAL THRESHOLD` ▶

| Item | Contract |
|---|---|
| Status | **DESIGN LOCKED · NOT IMPLEMENTED** |
| Snapshot | `1cb2d48870352dc71637cfc7ad553d655e0a94d4` / `0.32.0` |
| Guards | A lower Pingpong · B mid staggered Pingpong · C upper perimeter Loop |
| Worst case | 3 Persistent Pursuers |
| Wind | 2 deterministic Pulsed zones; upper overlap |
| True RNG | **NO** |
| Cutter / Scanner / Moving Anchor / Treatment | NONE |
| Security Override | Relay `resident-override-refuge` on upper perimeter (Proof C/3, optional, no Alert clear) — see [Sector Access Rollout](../4-8/SECTOR-04-ACCESS-ROLLOUT.md) |

## 1. Core

> A/B Pursuit를 끌고 Refuge 상부로 들어가, 서로 다른 방향·주기의 Gust가 겹치는 순간에도 C perimeter와 Rope Momentum을 읽고 계속 올라간다.

`REFUGE`는 세계관상 비상대피 공간이지만 Gameplay Safe Room은 아니다.

## 2. Flow

```text
ENTRY
→ A1 → LOWER / Guard A
→ A2 → MID / Guard B / +X Gust
→ A3 → CENTRAL REFUGE CORE
→ A4 → UPPER / Guard C / +X + -X overlap
→ A5 → EXIT → 4-8
```

## 3. Base Rope snapshot

```text
Hook Speed 1200
Reach 400
Reload 0.50s
Hand Offset ±12,-7
```

| Link | Dist | Margin | Flight |
|---|---:|---:|---:|
| entry → a1 | 306.8px | 93.2px | 0.256s |
| lower → a2 | 303.8px | 96.2px | 0.253s |
| mid → a3 | 322.3px | 77.7px | 0.269s |
| central → a4 | 315.2px | 84.8px | 0.263s |
| upper → a5 | 185.4px | 214.6px | 0.154s |

## 4. Long Rope 480

| Earlier → future Anchor | Dist | Within 480 |
|---|---:|---|
| entry → a2 | 906.2px | NO |
| lower → a3 | 491.0px | NO |
| mid → a4 | 487.9px | NO |
| central → a5 | 583.6px | NO |

정적 planning sample에서 다음 security band Anchor 직접 삭제를 막았다. Dynamic Swing regression은 Runtime graybox에서 재검증한다.

## 5. Guard choreography

### A — Lower
`(-470,-470) ↔ (250,-470)` · speed58 candidate · Wind 없음.

### B — Mid
`(380,-760) ↔ (-260,-760)` · speed66 candidate · Tower Gap Gust 첫 도입.

### C — Upper Perimeter
`(-360,-1080) → (300,-1080) → (300,-1320) → (-360,-1320)` · loop · speed54 candidate.

A/B를 살려두면 C까지 최대 3 Pursuers.

## 6. Deterministic irregular Wind

### GUST A — TOWER GAP FLOW
```text
direction +X
strength 220
bounds -480,-1420,1100,820
cycle 1.10 LULL / .30 WARNING / .55 ACTIVE / .20 DECAY
TOTAL 2.15s
```

### GUST B — RETURN EDDY
```text
direction -X
strength 170
bounds -420,-1510,940,570
cycle 1.55 LULL / .35 WARNING / .45 ACTIVE / .25 DECAY
TOTAL 2.60s
```

Upper Refuge에서 Runtime force 합산으로:

```text
A ACTIVE / B LULL   → +220 raw X
A ACTIVE / B ACTIVE → +50 raw X
A LULL / B ACTIVE   → -170 raw X
both inactive        → 0
```

**RNG는 없다.** 동일 elapsed time이면 같은 결과가 나와야 한다.

## 7. Telegraph

WARNING phase는 물리 force가 0인 현재 Runtime 특성을 활용한다.

- +X: foliage, emergency ribbon, canopy edge, mist →
- -X: upper curtain, opposite foliage, debris ←

최종 HUD 화살표에 의존하지 않고 세계 오브젝트가 방향을 말한다.

## 8. Guard Wind Drift

`guard-wind-drift-v1 = NOT_IMPLEMENTED`.

```text
PRIMARY Patrol/Pursuit
→ sample same World Wind
→ secondary Guard Drift
```

Initial tuning:

```text
normal Patrol/Pursuit 0.30
Pursuit Dash          0.12
```

Player만 바람에 밀리고 Guard가 고정되는 숨은 불이익 구조는 금지.

## 9. Recovery

R1~R4는 낙하 복귀만 담당.

```text
Alert clear NO
Wind phase reset NO
Pursuit reset NO
```

## 10. Security Override Relay

4-8 Sector Access Rollout에서 4-7이 Proof C로 확정됐다: `resident-override-refuge` relay, terminal `(420,-1325)`, relay ledge top `-1285`, upper C perimeter 안쪽(`upper` 데크 우측 끝).

원하는 플레이:

```text
Pursuit + Gust
→ perimeter 침투
→ Relay interact
→ shared proof
→ escape
```

Alert 비해제·Wind phase 비초기화·Guard kill 불요. 상세 계약은 [`4-8/SECTOR-04-ACCESS-ROLLOUT.md`](../4-8/SECTOR-04-ACCESS-ROLLOUT.md)와 [`4-8/ACCESS-PATCHES/4-7-RELAY-PATCH.md`](../4-8/ACCESS-PATCHES/4-7-RELAY-PATCH.md)를 따른다.

## 11. Story

```text
RESIDENT EMERGENCY REFUGE
ACCESS: RESIDENT
SYSTEMS: STANDBY
SECURITY NETWORK: ACTIVE
```

상층 보호 인프라가 살아 있다는 사실까지만 보여준다. Corporate causality는 Sector05가 소유한다.

## 12. Current migration

Legacy 4-7 `ISOLATION JUNCTION / CUTTER + WAKE SYNTHESIS`는 교체 대상.

Target:

```text
REFUGE TERRACE
3 Guards / Persistent Pursuit
+X Tower Gap Gust
-X Return Eddy
No Cutter
```
