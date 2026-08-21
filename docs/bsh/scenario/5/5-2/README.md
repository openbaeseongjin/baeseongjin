# SECTOR 05-2 — CONTROL ATRIUM REV1.0

> Status: **DESIGN LOCKED · NOT IMPLEMENTED**<br>
> Authoring snapshot: `3c9f661bba58af6f7351e00754c12aef86575a12`<br>
> Source Area ID: `sector-05-02`<br>
> Bounds: **4608×2624**<br>
> Enemy: **AEGIS / shield-drone-t1 ×2, never simultaneous**<br>
> Signature: **STAGGERED SECURITY PARTITION FLANKS / AEGIS ANGLE CONTROL**<br>
> Next: **5-3 SECURITY REVIEW GALLERY**

## One-line definition

5-1에서 Service Hardpoint를 읽는 법을 배운 Player가, 두 개의 staggered Security Partition과 Review Bridge를 오르며 정면 공격을 막는 AEGIS의 방패 방향을 Rope 이동으로 측후면에서 무너뜨리거나 우회한 뒤, Upper Control이 powered 상태이고 Continuity Security가 active임을 확인하고 Security Review Gallery로 진입하는 Stage.

## Core question

> **정면이 막혔을 때, Rope로 공격 각도를 바꿀 수 있는가?**

## Flow

`ENTRY → P0 AEGIS PREVIEW → LOWER PARTITION FLANK → AEGIS A → M0 SAFE → UPPER PARTITION FLANK → AEGIS B → M1 SAFE → FINAL CONTROL DECK → 5-3`

## Security

- AEGIS A: first angle-control lesson.
- AEGIS B: reverse-side reinforcement.
- No overlap.
- Kill optional.
- No kill gate.

## Story

```text
CONTROL ATRIUM
CONTINUITY SECURITY / ACTIVE
```

then:

```text
UPPER CONTROL
POWERED
```

then:

```text
CONTINUITY SECURITY
ACTIVE
```

handoff:

```text
SECURITY REVIEW GALLERY
ACCESS RESTRICTED
```

Player Bark: **NONE**

## Rope

- Base Hook Reach: `400px`
- Maximum intended authored relation: `367.15px`

## Current Runtime basis

Current main already contains:
- `shield-drone-t1`
- directional `ShieldEnemyBehavior`
- shield turn toward nearest target
- frontal Rope Impact blocking through `blocksImpactFrom`

The Stage must use the existing behavior before inventing new AEGIS logic.
