# SECTOR 03-8 — UPPER EXCHANGE GATE REV8.0

> Status: **DESIGN LOCKED**  
> Runtime: **GENERATED — Preview platform/Anchor topology is materialized in canonical `AREA-SPEC.v2.json`**
> Latest audited main: `cb4f690ac180a04868322e9c4cfe1384897c348b`  
> Runtime id: `sector-03-08`  
> Runtime current name: `UPPER MARKET GATE`  
> Canonical planning name: **UPPER EXCHANGE GATE**  
> Bounds target: **4608×2176**  
> Signature: **OPEN MARKET SECURITY WEAVE / CENTRAL SCANNER SPINE ↔ SIDE POCKETS → INCIDENT RECORDS BAY**  
> Emotion: **CONNECTION / UNEASE**  
> Role: **SECTOR 03 GAMEPLAY SYNTHESIS + STORY JUXTAPOSITION**

## 1. Finale Role

3-8은 Sector03 일반 진행 Finale다.

Boss는 이 Stage 안에 없다.

Current Runtime exit:
`nextAreaId: null`
`completionMode: content-boundary`

따라서:
- Boss03 catalog 활성 시 Gate route는 `LOWER SECTOR COMMANDER` 독립 Arena로 이어진다.
- Boss03 처치 뒤 각 Player가 4-1 authored Entry로 이동하며 catalog 비활성 시 direct portal로 복구된다.

## 2. Gameplay Question

3-7이 `어느 Cost Profile을 한 번 고를까?`였다면 3-8은:

> **Scanner가 잠길 때 멈출까, 측면으로 Flow를 계속 이어갈까?**

Safe Hub마다 다시 판단한다.

```text
ENTRY / C1
→ M0 SAFE
  CENTRAL C2 / WEST PATROL / EAST SUPPORT
→ MX SAFE
  CENTRAL C3 / WEST LONG ARC / EAST PATROL
→ M1 SAFE
  CENTRAL C4 / WEST LATE / EAST LATE
→ INCIDENT TRANSFER CONTROL RECORDS BAY
→ FINAL CONTROL
→ CONTENT BOUNDARY
```

## 3. Scale

`4608×2176`

3-6:
macro flight circuit.

3-8:
여러 Security Pocket이 중앙 Scanner Spine과 반복적으로 재결합하는 open lattice.

## 4. Entry

Entry `(-1920,-64)`
→ G0 `(-1664,-192)`
→ C1 `(-1376,-384)`
→ P2
→ M0

C1 common Scanner commit.

M0:
`x=-896..-512 / y=-640 / W384`
**FULL SAFE**

## 5. First Weave — M0 → MX

Central:
C2 Scanner / fastest.

West:
W1→W5 / Patrol 1 / no Scanner.

`sector-03-08:drone-1`

Proposed patrol:
`(-1504,-896) ↔ (-1056,-1024)`

East:
E1→E4 / Support Guard / no Scanner.

`sector-03-08:market-lower-guard`

MX:
`x=-64..+320 / y=-1120 / W384`
**FULL SAFE**

## 6. Second Weave — MX → M1

Central:
C3 Scanner / shortest.

West:
U1→U3 / longer / no enemy / no Scanner.

East:
V1→V3 / Patrol 2.

`sector-03-08:drone-2`

Proposed patrol:
`(+720,-1264) ↔ (+1088,-1408)`

Patrol activation overlap 금지.

M1:
`x=-64..+320 / y=-1488 / W384`
**FULL SAFE**

## 7. Final Weave — M1 → Records Bay

Central:
C4 + GC4 / Scanner / fastest / no enemy.

West:
FW1→FW3 / Late Guard:
`sector-03-08:market-upper-guard`

East:
FE1→FE3 / Late Guard:
`sector-03-08:final-control-guard`

No kill gate.

## 8. Enemy — exactly 5

1. `sector-03-08:drone-1` Patrol
2. `sector-03-08:drone-2` Patrol
3. `sector-03-08:market-lower-guard` Support
4. `sector-03-08:market-upper-guard` Late
5. `sector-03-08:final-control-guard` Late

No sixth slot.
No Rope Cut.
No Wind.
No new behavior.

## 9. Scanner

One shared group:
`sector-03-08:scanner-upper-market-A`

Targets:
C1/C2/C3/C4

Cycle:
`1.5 / .6 / 1.1 / .3`

Current Rope persists through LOCKED.

## 10. Access Modules

Current Runtime 3-8:
- Access A/B/C requirement 없음
- required kill 없음

3-7에서 Access C를 못 먹어도 3-8을 막지 않는다.

## 11. Story — Incident Transfer Control Records Bay

Final Story Deck는 완전 안전.

Physical object:
**one official Incident Transfer Control records bay**.

Inside:
two separate terminal modules.

```text
LEFT
EVACUATION TRANSFER RECORD

RIGHT
UPPER TRANSFER ROUTE STATUS
```

같은 records bay지만 separate screen / separate data block.
No arrow / no same-row mapping.

## 12. LEFT Record

Player lands left-of-center.

0.5 sec quiet.

```text
EVACUATION TRANSFER RECORD

GROUP A
TRANSFER COMPLETE

GROUP B
TRANSFER COMPLETE

GROUP C
TRANSFER SUSPENDED
```

마지막에는 LEFT 화면에:
`GROUP C / TRANSFER SUSPENDED`
가 남아 있어도 된다.

## 13. Player Physical Discovery

LEFT sequence 후 RIGHT를 자동 재생하지 않는다.

- no forced pan
- no arrow
- no tutorial pointer

Player가 같은 safe Deck 안에서 직접 오른쪽 단말로 몇 걸음 이동.

RIGHT proximity에서 두 번째 record 시작.

## 14. RIGHT Record

```text
UPPER TRANSFER ROUTE STATUS

PUBLIC / SERVICE ROUTES
ACTIVE

PRIORITY ROUTE
ACTIVE
```

마지막 frame:

LEFT:
`GROUP C / TRANSFER SUSPENDED`

RIGHT:
`PRIORITY ROUTE / ACTIVE`

둘이 동시에 공간적으로 이해되어야 한다.

연결선은 없다.

## 15. Player Bark

RIGHT sequence 끝
→ 0.4–0.7 sec
→

> **`…C는 멈췄는데, 우선 통로는 열려 있었네.`**

→ 1.0–1.5 sec ambience.

Visible fact만 읽는다.

말하지 않는 것:
- Priority 때문에 C가 멈췄다
- C가 Priority에서 배제됐다
- A/B가 Priority를 이용했다

## 16. Sector03 Exit Question

> **왜 C는 멈췄는데 우선 통로는 계속 열려 있었지?**

## 17. Final Control

Records bay → G5 → Final Control.

```text
UPPER CONTROL
ROUTE STATUS PENDING
```

No enemy.
No Scanner.

Then:
`content-boundary`.

## 18. Similarity Gate

3-7:
one route choice → merge.

3-8:
repeated re-weave at three Safe Hubs.

Overlap 1 / PASS.

3-6:
large commercial space only.
Topology different.
Overlap 1 / PASS.

2-8:
serial vertical pressure.
3-8 parallel pockets.
Overlap 1 / PASS.

## 19. Difficulty / Pacing

Difficulty ★★★★  
First 3:20–4:50  
Mastered 1:25–2:10

## 20. Runtime / Direction Status

VERIFIED:
- current 5 enemy slots
- C1–C4 one Scanner group
- no Access A/B/C completion requirement
- content-boundary
- Direction Runtime v1 schema exists

DESIGN LOCKED / NOT IMPLEMENTED:
- Priority Route simplified Story copy
- Incident Transfer Control record presentation
- 3-8 Player Bark
- 3-8 Direction migration

Release 전 compiler/adapter coverage가 `implemented/verified`여야 한다.
