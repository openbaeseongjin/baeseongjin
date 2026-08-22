# SECTOR 03-7 — TRANSFER MEZZANINE REV8.1

> Status: **DESIGN LOCKED**  
> Runtime: **GENERATED — Preview platform/Anchor topology is materialized in canonical `AREA-SPEC.v2.json`**
> Latest audited main: `cb4f690ac180a04868322e9c4cfe1384897c348b`  
> Runtime current id: `sector-03-07`  
> Runtime current name: `PRIORITY CONCOURSE`  
> Canonical planning name: **TRANSFER MEZZANINE**  
> Bounds target: **3840×1792**  
> Signature: **THREE-BAND COMMERCIAL TRANSFER BRAID**  
> Emotion: **UNEASE**

## 1. Stage Role

Sector 03의 마지막 전초전.

하나의 Upper Commercial Transfer Mezzanine 안에서 서로 다른 비용을 가진 세 circulation band를 비교해 통과한다.

```text
COMMON ENTRY
→ M1 SAFE OVERVIEW
→ OUTER GALLERY / PRIORITY SPINE / FACILITY SERVICE
→ M2 SAFE STORY DECK
→ ACCESS C COMMON BAND
→ 3-8
```

## 2. Gameplay Question

> **어떤 이동 비용을 선택할 것인가?**

- Outer Gallery: 길지만 넓고 적 압박이 낮다.
- Priority Spine: 가장 짧지만 Scanner + Patrol timing을 읽어야 한다.
- Facility Service: Scanner는 없지만 Rope chaining이 많고 Late Guard가 있다.

세 Route는 초반 값싼 cross-switch로 비용을 지울 수 없어야 한다.
약 70% 이상 비용을 지불한 뒤 M2 부근에서만 다시 합류한다.

## 3. Map

Bounds: `3840×1792`

Macro:
`COMMON ↗ → [OUTER / PRIORITY / SERVICE] → SAFE MERGE → ↖ EXIT`

Common:
- Entry `(-1664,-64)`
- G0 `(-1472,-192)`
- G1 `(-864,-416)`
- M1 `x=-768..-384 / y=-544 / W384`
- **M1 FULL SAFE**

M1에서 한 프레임에 세 Route 시작, Scanner 상태, Patrol/Guard silhouette, distant M2가 읽혀야 한다.

## 4. Route Profiles

### Outer Gallery
`M1 → O1 → C1 → O2 → C2 → O3 → O4 → O5 → O6 → M2`

- longest
- C1+C2 Scanner
- widest landings
- no Patrol acquire
- no route Guard

### Priority Spine
`M1 → C3 → PSP1 → PSP2 → M2`

- shortest
- C3 Scanner
- Patrol overlap
- fewest landings
- no Priority key gate

Patrol authored path:
`(-64,-864) ↔ (+448,-1080)`

speed 48 / wait .45 / pingpong / no Rope Cut.

### Facility Service
`M1 → S1 → S2 → S3 → S4 → S5 → M2`

- no Scanner
- more Rope chaining
- Centre Late Guard
- no Patrol

Environment:
commercial tenant/staff support circulation.

금지:
Plant Core / Switchgear / heavy infrastructure identity.

## 5. Enemy — exactly 4

1. `sector-03-07:drone-1` — Patrol
2. `sector-03-07:concourse-lower-guard` — Support Pool
3. `sector-03-07:concourse-centre-guard` — Late Pool
4. `sector-03-07:concourse-upper-guard` — Late Pool + Access C

No fifth slot.

## 6. Scanner

One shared group:
`sector-03-07:scanner-priority-concourse-A`

Targets:
C1 / C2 / C3

Cycle:
`1.5 / .6 / 1.1 / .3`

LOCKED:
new attach denied / current Rope persists / no damage / no forced detach.

## 7. M2 — True Safe Story Deck

M2:
`x=+448..+832 / y=-1264 / W384`

No Scanner / Patrol / route Guard / upper Guard pressure during Story.

## 8. Story REV8.1 — Priority Route

Legacy `SERVICE CLASS / STANDARD-PREMIUM / ACCESS TIER`는 Player-facing 핵심 스토리에서 제거한다.

3-7에서 확정할 것은 하나:

> **상부 이동공간에 별도의 Priority Route가 존재하고 Active 상태다.**

M2:

```text
UPPER CONCOURSE ROUTE CONTROL

PUBLIC / SERVICE ROUTES
ACTIVE

PRIORITY ROUTE
ACTIVE
```

0.4–0.7 sec 후:

> **PLAYER: `…우선 통로가 따로 있었네.`**

A/B/C, Priority 사용자, Group C 중단 원인은 말하지 않는다.

## 9. Access C / Exit

M2를 물리적으로 떠난 뒤에만 upper Guard activation.

Carrier:
`sector-03-07:concourse-upper-guard`

Reward:
`sector-03:access-module:c`

Current Runtime:
Access C는 3-7 local exit requirement도, 3-8 requirement도 아니다.

Final deck → panel → physical crossing → `sector-03-08`.

Preview:

```text
UPPER MARKET GATE
TRANSFER CONTROL
```

## 10. Story Handoff

3-7:
`PRIORITY ROUTE EXISTS / ACTIVE`

3-8:
`GROUP C SUSPENDED`와 `PRIORITY ROUTE ACTIVE`를 같은 Incident Transfer Control 기록 환경에서 병치.

## 11. Difficulty / Pace

Difficulty ★★★★  
First 2:55–4:05  
Mastered 1:10–1:50

## 12. Direction Runtime Status

VERIFIED:
- Direction Runtime v1 / `direction-spec-v1` schema
- current 3-7 gameplay Runtime contract

DESIGN LOCKED / NOT IMPLEMENTED:
- 3-7 Direction migration
- REV8.1 Priority-route Story copy
- 3-7 Player Bark

Release 전:
`DIRECTION-SPEC → compiler → DirectionRuntime → adapter`
coverage가 `implemented/verified`여야 한다.
