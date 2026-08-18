# SECTOR 04-1 — SKY RESIDENCE ARRIVAL

*APPROVED BLOCKOUT PACKAGE · REV 2.3 — UPPER RESIDENTIAL / PERSISTENT PURSUIT*

◀ PREV — `POST-SECTOR 03 BOSS / TRANSITION TBD` · NEXT — `SECTOR 04-2 / RESIDENTIAL COURTYARD` ▶

`SECTOR 04 — UPPER RESIDENTIAL / AMENITY DISTRICT` · `PRIVILEGE IS PROTECTED` · `PATROL → DETECT → PERSISTENT PURSUIT`

| 항목 | 기준 |
|---|---|
| Status | **DESIGN LOCKED · NOT IMPLEMENTED** |
| Authoring Snapshot | `8afd16bc76462436490fe7c753611c2ecf36b548` |
| Runtime Status | Existing `sector-04-01` is legacy `TRANSIT INTAKE`; migration required |
| Primary Space | Upper residential arrival terrace + planted courtyard + upper balcony |
| Primary Enemy | 2 × moving Security Drone |
| Guard A | Perimeter Loop → Persistent Pursuit after detection |
| Guard B | Long Pingpong → Persistent Pursuit after detection |
| Kill Requirement | **NONE** |
| Cutter / Wind / Scanner | **NONE** |
| New Mechanic | **Persistent Pursuit Alert Latch — NOT IMPLEMENTED** |
| New Input / Rope Mode | NONE |
| Augment Node | NONE in 4-1; Sector 04 source topology remains HOLD |
| Mandatory Augment | NONE |
| Boss | NONE |

---

## 1. 한 줄 정의

Sector 03의 조밀한 공공 상업 공간을 빠져나온 Player가 처음으로 넓고 조용한 **Upper Residential Arrival**에 들어서고, 서로 다른 동선으로 움직이는 두 Security Drone을 보며 다음 Rope를 고른 뒤, 발각된 경비를 죽일지 아니면 Stage 끝까지 추격을 달고 Rope Momentum으로 앞서갈지를 선택하는 Sector 04 도입 Stage.

---

## 2. Stage 역할

4-1이 가르치는 것은 새 버튼이나 새 Rope가 아니다.

```text
넓어진 공간
+
경비의 이동 동선
+
발각 이후 추격의 지속성
```

이다.

### Core Question

> **“이 경비를 지금 죽일까, 아니면 뒤에 달고 더 빠르게 올라갈까?”**

### Sector 04 첫 인상

```text
PEOPLE ARE GONE

LIGHTS REMAIN
PLANTS REMAIN
SECURITY REMAINS

AND SECURITY DOES NOT DISENGAGE
```

---

## 3. 이전 / 다음 연결

### Previous

`3-8 → 4-1` 직접 배선은 아직 금지.

Post-Sector 03 Boss / Transition이 확정되기 전까지 4-1 Entry 내부만 LOCK한다.

### Next

Design target:

```text
4-2 — RESIDENTIAL COURTYARD
```

현재 Runtime `sector-04-02`는 legacy `CUTTER LINE`이므로 4-1 구현과 동시에 직접 콘텐츠 정합을 완료한 것으로 간주하면 안 된다.

---

## 4. 공간 콘셉트

### Upper Residential Arrival

Sector 02의 Worker housing과 같은 ‘주거’지만 공간의 사용권이 다르다.

**Sector 02**

- 좁은 공동 Balcony
- Canteen / Laundry
- 노동·Shift 흔적
- 높은 밀도

**Sector 04-1**

- 큰 Arrival Terrace
- 낮은 밀도
- 식재 Courtyard
- 긴 시야
- 조용한 재료
- 지속되는 자동 Security

사치 caricature가 아니라 **공간·빛·보호 시스템의 차이**로 계층을 읽게 한다.

---

## 5. 전체 Flow

```text
ENTRY TERRACE
→ A1
→ ARRIVAL COURT LANDING

→ GUARD A / PERIMETER LOOP READ
→ A2
→ COURTYARD READ DECK

→ GUARD B / LONG PINGPONG READ
→ A4
→ UPPER BALCONY LANDING

→ A5
→ EXIT TERRACE
→ GATE PANEL
→ 4-2
```

별도 Safe / Flow / Left / Right Route 없음.

숙련도는 같은 Backbone에서:

- 착지 감소
- Guard를 죽이지 않고 outrun
- Release 품질
- Recovery 품질

로 갈린다.

---

## 6. Rope 구조

현재 Base Rope 기준:

```text
Hook Speed   1200 px/s
Hook Reach   400 px
Reload       1.0 sec
Hand Offset  ±12, -7
```

필수 Hook의 **손 위치 기준 정적 거리**:

| Hook | Hand→Anchor | Base 400 Margin | Flight |
|---|---:|---:|---:|
| L0 → A1 | 256.5px | 143.5px | 0.214s |
| L1 → A2 | 296.8px | 103.2px | 0.247s |
| L2 → A4 | 286.3px | 113.7px | 0.239s |
| L3 → A5 | 294.9px | 105.1px | 0.246s |

모든 필수 샘플은 400px보다 충분히 아래에 둔다.

> **주의:** 이것은 정적 Attach 가능성 검증이다. 실제 Fixed-Length Swing → Release → Landing trajectory는 Runtime graybox playtest에서 최종 PASS해야 한다.

### Rhythm

```text
HOOK
→ FIXED-LENGTH SWING
→ RELEASE
→ LAND / COAST
→ ~1.0s RELOAD
→ NEXT HOOK
```

촘촘한 Anchor spam을 만들지 않는다.

---

## 7. Guard A — Courtyard Perimeter

### Patrol

```text
4-point LOOP
```

Courtyard 외곽을 순환한다.

Player는 Guard A가 어느 변에 있는지 보고 `Landing A → A2` Commit 시점을 정한다.

### After Detection

```text
PATROL
→ DETECT
→ ALERT LATCHED
→ PERSISTENT PURSUIT
```

Guard A는 이후 Stage의 상부까지 따라온다.

---

## 8. Guard B — Upper Balcony

### Patrol

```text
LONG PINGPONG
```

Upper Balcony 선을 길게 왕복한다.

Guard A와 다른 동선 / speed / endpoint wait를 사용한다.

### After Detection

Guard B도 동일한 Persistent Pursuit로 전환한다.

두 Guard 모두 살려 둔 경우:

```text
PLAYER
↑

GUARD B
↑

GUARD A
↑
```

의 pressure가 Stage 후반에 생길 수 있다.

4-1에서는 **최대 2 Pursuers**까지만 허용한다.

---

## 9. Persistent Pursuit 계약

### DESIGN LOCKED

한 번 Player를 인지한 Guard는:

- 거리 때문에 Aggro 해제 안 함
- 잠깐 LOS가 끊겨도 해제 안 함
- Recovery Ledge에 떨어져도 추적 유지
- 다음 Security Beat까지 추적 유지

끝나는 조건:

```text
Guard killed
or
valid Area unload / transition
or
Area reset / party wipe
```

### NOT IMPLEMENTED

현재 Runtime에는 `pursuit-drone-t1`과 `PursuitEnemyBehavior`가 있지만, **Patrol before alert + latched pursuit after alert + initial detection bounds를 벗어난 chase**의 통합 계약은 아직 없다.

`RUNTIME-HANDOFF.md` 참조.

---

## 10. Kill vs Outrun

### KILL

```text
시간 소모
→ 추격 pressure 제거
```

### OUTRUN

```text
Momentum 유지
→ 뒤에서 추격 계속
```

Gate는 절대 kill을 요구하지 않는다.

이 선택이 Sector 04 전투/이동 결합의 핵심이다.

---

## 11. Recovery

Recovery는 별도 게임용 보험방이 아니라 Upper Residential 구조다.

| ID | 공간 해석 |
|---|---|
| R1 | planter ledge |
| R2 | service balcony |
| R3 | facade lip |

목표:

```text
현재 progression band로 약 3–5초 내 복귀
```

Recovery가 최단 intentional route가 되면 FAIL.

---

## 12. Story

4-1은 원인을 설명하지 않는다.

환경이 보여주는 것:

- 사람은 없음
- 식재와 조명은 남아 있음
- 기본 생활 시스템은 살아 있거나 최근까지 살아 있었던 흔적
- Security Patrol은 계속 움직임

### 4-1에서 금지

- Group A/B/C와 상·하층 주민 직접 매핑
- Priority가 하층 중단의 원인이라는 확정
- Corporate의 고의 희생
- 정확한 명령자
- 정확한 Evacuation hierarchy

---

## 13. Camera

목표:

> Player 위의 Anchor만 보여주는 카메라가 아니라 **현재 추격 중인 Guard와 다음 Grapple 선택을 동시에 읽게 하는 카메라**.

Zone:

```text
arrival-reveal
courtyard-patrol
upper-patrol
exit-threshold
```

Mobile에서도 추격자 UI/World 위치가 갑자기 화면 밖으로 사라져 pressure가 끊겨 보이지 않게 검증한다.

---

## 14. Augment

4-1에는 Augment Node를 배치하지 않는다.

현재 `main`에서 Sector 01~03 Node는 실제 획득 흐름에 연결됐지만, Sector 04~06의 안정된 source topology는 아직 HOLD다.

### Compatibility

- Fast Launch: Guard window commit에 이점, 필수 아님.
- Long Rope 480: 착지 감소 가능, Story/Security Beat skip 금지.
- Fast Recover 0.5: Outrun flow 강화 가능.
- Release Propulsion ×1.25: 큰 arc 허용, 강제 충돌 금지.
- Direction Dash: 추격 중 correction 이점, 필수 아님.
- Slow Fall: Recovery 이점, 필수 아님.
- Combat cards: Guard kill 편의, kill gate 없음.

---

## 15. 금지

- Cutter
- Wind / Crosswind
- Scanner
- vision-cone stealth
- aggro decay
- safe reset room
- mandatory kill
- mandatory Augment
- humanoid Guard를 구현된 것처럼 가정
- moving platform / train
- 별도 Safe / Flow Route
- exact 400px mandatory Hook
- Story 원인 Reveal

---

## 16. 구현 상태

```text
CURRENT RUNTIME
sector-04-01 = TRANSIT INTAKE
Enemy = NONE

REV2.3 TARGET
sector-04-01 = SKY RESIDENCE ARRIVAL
Enemy = 2 moving Security
Persistent Pursuit = REQUIRED
```

따라서 이 패키지는 **Approved Design / Migration Target**이지 shipped implementation이 아니다.

---

## 17. PASS 기준

### Space

- [ ] 4-1 첫 화면이 Worker/Commercial과 즉시 다름.
- [ ] Upper Residential 구조로 Anchor/Recovery/Patrol이 설명됨.

### Rope

- [ ] Base Rope 400만으로 전 구간 가능.
- [ ] Fixed-Length Swing/Release 실제 graybox PASS.
- [ ] mandatory link는 max-range exact input을 요구하지 않음.

### Security

- [ ] A = Loop, B = Pingpong으로 서로 다른 Patrol rhythm.
- [ ] 발각 전 Patrol.
- [ ] 발각 후 Patrol 중단.
- [ ] Alert는 거리/일시적 LOS 상실로 해제되지 않음.
- [ ] Guard kill optional.
- [ ] Guard 2기를 살려도 Base traversal이 읽히고 생존 가능.

### Augment

- [ ] Long Rope 480 bypass regression.
- [ ] Fast Recover 0.5 timing regression.
- [ ] Release Propulsion ×1.25 collision regression.
- [ ] Dash / Slow Fall not required.

### Story

- [ ] 상층 생활권의 차이는 느껴지나 Corporate 원인은 아직 모름.

---

## 18. Package

- `README.md` — Design intent
- `AREA-SPEC.json` — Implementation contract
- `MAP-PREVIEW.html` — Exact visual blockout of this AREA-SPEC
- `PRODUCTION-ALIGNMENT.md` — Current Runtime mismatch / migration status
- `RUNTIME-HANDOFF.md` — Implementation requirements, architecture left to developer
- `VALIDATION.md` — Static checks and pending dynamic checks
