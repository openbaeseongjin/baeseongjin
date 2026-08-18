# SECTOR 04-2 — RESIDENTIAL COURTYARD

*APPROVED BLOCKOUT PACKAGE · REV 2.3 — PURSUIT STACKING*

◀ PREV — `4-1 SKY RESIDENCE ARRIVAL` · NEXT — `4-3 SKY GARDEN TERRACES` ▶

`UPPER RESIDENTIAL` · `STAGGERED PATROL` · `KILL VS OUTRUN` · `PERSISTENT PURSUIT STACKING`

| 항목 | 기준 |
|---|---|
| Status | **DESIGN LOCKED · NOT IMPLEMENTED** |
| Authoring Snapshot | `eaf05cd4b771879504f76d078ee728c48be5feb6` |
| Current Runtime | Legacy `CUTTER LINE` — migration required |
| Stage Role | First Pursuit Stacking / Kill-vs-Outrun Decision |
| Guard A | 3-point Diagonal Pingpong |
| Guard B | 3-point Vertical / Diagonal Pingpong |
| Worst Case | 2 Pursuers alive at exit |
| Kill Requirement | NONE |
| Cutter / Wind / Scanner | NONE |
| Augment Node | NONE |
| New System | Persistent Pursuit Alert Latch — NOT IMPLEMENTED |

---

## 1. 한 줄 정의

4-1에서 Persistent Pursuit를 배운 Player가 상층 Residential Courtyard 안으로 들어가, 대각선으로 순찰하는 Guard A를 지나친 뒤 **Decision Balcony에서 A를 죽일지 계속 달릴지 선택**하고, A를 살려 둔 경우 A가 뒤에서 따라온 상태로 세로·대각선 순찰을 하는 Guard B 구간에 진입해 최대 두 추격자를 달고 Exit까지 밀어붙일 수 있는 Stage.

---

## 2. Core Question

> **“첫 Guard를 지금 제거할까, 아니면 추격자를 달고 두 번째 Guard까지 밀어붙일까?”**

이 Stage의 선택은 Route branch가 아니다.

```text
같은 Backbone
+
시간 / 위험 관리 선택
```

이다.

---

## 3. 4-1과의 차이

### 4-1

```text
different patrol patterns
→ detection
→ persistent pursuit introduced
```

### 4-2

```text
Guard A detected
→ Guard A not killed
→ Guard A follows into next band
→ Guard B detected
→ pressure stacks
```

4-2가 처음으로 **“경비를 안 죽이고 지나간 선택의 미래 비용”**을 체감시킨다.

---

## 4. 공간

Private Residential Courtyard.

- planted courtyard
- large private balconies
- staggered upper terraces
- quiet circulation bridges
- automated residential security

Sector 02 Worker housing보다:

- 여백이 크고
- 공용 기능 밀도가 낮고
- 식재와 private setback이 많고
- Security coverage가 더 안정적으로 보인다.

사치 caricature 금지.

---

## 5. 전체 Flow

```text
ENTRY
→ A1
→ LOWER BALCONY

→ GUARD A / DIAGONAL PINGPONG
→ A2
→ DECISION BALCONY

→ KILL A?
   or
   KEEP MOVING?

→ A3
→ UPPER BALCONY

→ GUARD B / VERTICAL ZIGZAG
→ A4
→ EXIT TERRACE
→ 4-3
```

별도 Safe / Flow / Left / Right Route 없음.

---

## 6. Rope

Current Base:

```text
Hook Speed   1200
Reach        400
Reload       1.0
Hand Offset  ±12,-7
```

Static hand-origin validation:

| Sample | Hand→Anchor | Margin to 400 | Flight |
|---|---:|---:|---:|
| L0 → A1 | 309.5px | 90.5px | 0.258s |
| L1 → A2 | 255.3px | 144.7px | 0.213s |
| L2 → A3 | 241.3px | 158.7px | 0.201s |
| L3 → A4 | 248.8px | 151.2px | 0.207s |

모든 필수 Hook은 400px 최대치에 붙지 않는다.

Dynamic Fixed-Length Swing / release / landing은 Runtime graybox에서 최종 검증한다.

---

## 7. Guard A — Diagonal Pingpong

Before alert:

```text
3-point pingpong
(-390,-390)
→ (-30,-535)
→ (300,-405)
```

Speed candidate:

```text
58
```

Wait:

```text
0.18s
```

중앙 Courtyard를 좌우가 아니라 **대각선으로 횡단**한다.

Player Rope arc와 경비 이동선이 실제로 교차하도록 하는 첫 Stage다.

After alert:

```text
PATROL OFF
→ PERSISTENT PURSUIT
```

---

## 8. Decision Balcony

`decision-deck`.

게임적인 휴게실이나 Safe Reset이 아니다.

Player가 여기 도달했을 때:

### A가 죽었으면

상부로 바로 진행.

### A가 살아서 추격 중이면

```text
fight now
or
keep moving
```

을 판단한다.

**중요:** Decision Balcony에 올라왔다고 Alert가 초기화되면 FAIL.

---

## 9. Guard B — Vertical Zigzag

Before alert:

```text
(330,-735)
→ (330,-945)
→ (20,-1070)
```

3-point pingpong.

Guard A와 시각적 / 시간적 리듬을 다르게 한다.

Speed candidate:

```text
72
```

Wait:

```text
0.28s
```

Player가 상하 Rope 이동을 하는 동안 Guard B도 vertical + diagonal route로 움직여 trajectory 교차를 만든다.

---

## 10. Pursuit Stacking

### Case A — Kill A

```text
A dead
→ B only
→ lower future pressure
```

### Case B — Outrun A

```text
A alive / alerted
→ A follows through Decision Balcony
→ B band entered
→ B alerted
→ A + B pursue
```

Worst Case:

```text
2 Pursuers
```

4-2에는 세 번째 Guard를 넣지 않는다.

---

## 11. Why no Cutter

기존 Runtime은 4-2를 `CUTTER LINE`으로 사용한다.

REV2.3에서는 제거한다.

이유:

Sector 04의 새 핵심 문법:

```text
PATROL
→ DETECT
→ PERSISTENT PURSUIT
→ KILL OR OUTRUN
```

을 충분히 학습시키기 전에 Rope-cut까지 넣으면 Gameplay 정체성이 분산된다.

Cutter는 현재 Master 기준 4-6 `PRIVATE SKYBRIDGE` 첫 도입 후보로 남긴다.

---

## 12. Recovery

- R1 Garden Ledge
- R2 Balcony Lip
- R3 Facade Ledge

Recovery:

```text
does NOT clear alert
does NOT despawn Guard
does NOT become safe reset room
```

목표:

```text
3–5 sec back to current band
```

---

## 13. Story

큰 Reveal 없음.

보여주는 것:

```text
PRIVATE RESIDENTIAL COURTYARD
AUTOMATED SECURITY ACTIVE
```

상층 생활 공간 내부까지 보호 시스템이 지속되고 있음을 공간적으로 누적한다.

왜 그런지는 Sector05 전까지 설명하지 않는다.

---

## 14. Camera

카메라 핵심은 **뒤에서 따라오는 A가 상부 B band 진입 시 보이도록 하는 것**.

Player 위 Anchor만 확대해서 아래 추격자가 사라지면 Pursuit Stacking의 의미가 약해진다.

Zones:

```text
entry-lower-court
guard-a-band
decision-balcony
guard-b-band
exit
```

---

## 15. Augment

Node 없음.

Current main에서 Sector04~06 Augment source topology는 아직 stable source가 확정되지 않았다.

### Compatibility

- Long Rope 480: landing 감소 가능, Decision Balcony + B band 전체 skip 금지.
- Fast Recover 0.5: outrun 강화.
- Fast Launch: commit window 강화.
- Release Propulsion: pursuit separation 강화.
- Direction Dash: air correction.
- Slow Fall: recovery.

모두 optional.

---

## 16. Runtime Status

Current:

```text
sector-04-02
CUTTER LINE
1 Cutter Sentry
```

Target:

```text
sector-04-02
RESIDENTIAL COURTYARD
2 moving Security Guards
Pursuit Stacking
NO Cutter
```

따라서 migration required.

---

## 17. PASS

- [ ] Base Rope only clear.
- [ ] Guard A diagonal pingpong.
- [ ] Guard B vertical/diagonal pingpong.
- [ ] Alerted A follows into B band.
- [ ] Decision Balcony does not clear alert.
- [ ] A killed = B only.
- [ ] A+B alive = 2 Pursuers to exit, still readable and survivable.
- [ ] No kill gate.
- [ ] No Cutter/Wind/Scanner.
- [ ] Long Rope 480 cannot skip the whole pressure stack.
- [ ] Recovery does not reset pursuit.
- [ ] Camera preserves below-player pursuit readability.
