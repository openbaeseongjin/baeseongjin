# SECTOR 04-5 — AMENITY ATRIUM

*APPROVED BLOCKOUT PACKAGE · REV 2.5 — STAGGERED ORBIT + MOVING ANCHOR DRONE*

◀ PREV — `4-4 CARE PAVILION` · NEXT — `4-6 PRIVATE SKYBRIDGE` ▶

`UPPER RESIDENTIAL` · `PATROL CHOREOGRAPHY PEAK` · `MOVING SECURITY WINDOW` · `MOVING ANCHOR`

| 항목 | 기준 |
|---|---|
| Status | **DESIGN LOCKED · NOT IMPLEMENTED** |
| Snapshot | `b6e5b640f04135545341d3368a843b45c35fcedd` |
| Runtime Model | `seamless-sector-landmark-v1` |
| Current Runtime | Legacy `EXPRESS SHAFT + vertical Wind` — migration required |
| Guard A/B | Same Diamond Orbit · 0.5 phase separation |
| Guard C | Upper vertical/diagonal sweep |
| Worst Case | 3 Persistent Pursuers |
| Anchor Drone | Neutral · kinematic · indestructible · grappleable |
| Anchor Drone Required | **NO** |
| Static Mandatory Route | Base Rope 400 clear |
| Wind / Cutter / Scanner / Treatment | NONE |
| Augment Node | NONE |

---

## 1. 한 줄 정의

상층 주민용 대형 Amenity Atrium에서 두 Security Guard가 같은 Diamond Orbit을 180° 위상차로 순찰해 **계속 움직이는 Security Window**를 만들고, 중앙의 중립 Service `Anchor Drone`이 별도의 수평 경로를 이동하는 상황에서, Player가 정적 Anchor만으로 안전하게 통과하거나 **경비 사이의 Gap과 Moving Anchor 위치가 맞는 순간을 읽어 Drone을 Rope Pivot으로 사용해 착지 하나를 줄이는 고속 Atrium 횡단**을 선택하는 Stage.

---

## 2. Core Question

> **“A/B의 움직이는 Security Window와 Anchor Drone 위치가 맞는 순간을 읽고 한 번의 큰 Rope Commit으로 Atrium을 가로지를 수 있는가?”**

4-5는 단순히 경비 수를 늘리는 Stage가 아니다.

```text
Guard A position
+
Guard B position
+
Anchor Drone position
+
Player Rope momentum
=
COMMIT WINDOW
```

를 읽는 Stage다.

---

## 3. 공간

`PRIVATE AMENITY ATRIUM`

- large central void
- suspended amenity bridge
- resident lounge gallery
- landscaped perimeter
- façade / lighting / planting maintenance access
- service drone circulation

Anchor Drone은 Gameplay를 위해 뜬금없이 존재하는 것이 아니라, **대형 Atrium의 조명·식재·파사드·상부 설비 유지관리용 중립 Service Drone**이다.

---

## 4. 전체 Flow

### Mandatory Static

```text
ENTRY
→ A1
→ LOWER AMENITY DECK
→ A2
→ ATRIUM READ

→ A3
→ MID SUSPENDED BRIDGE
→ A4
→ UPPER LOUNGE GALLERY

→ Guard C
→ A5
→ EXIT
→ 4-6
```

### Optional Moving Anchor Expression

```text
ATRIUM READ
→ ANCHOR DRONE
→ moving-pivot swing
→ release
→ DRONE EXIT TERRACE
→ A4
→ UPPER LOUNGE
```

Drone Route는 **동일한 Atrium Backbone 안의 숙련 표현**이지 별도 Safe/Flow Route 메뉴가 아니다.

---

## 5. Static Base Rope

Current production baseline:

```text
Hook Speed    1200
Reach         400
Flight        1/3 sec
Reload        1.0 sec
Swing Impulse 780
Hand Offset   ±12,-7
```

| Sample | Hand→Anchor | Margin | Flight |
|---|---:|---:|---:|
| L0 → A1 | 295.7px | 104.3px | 0.246s |
| L1 → A2 | 281.4px | 118.6px | 0.235s |
| L2 → A3 | 320.5px | 79.5px | 0.267s |
| L3 → A4 | 277.0px | 123.0px | 0.231s |
| L4 → A5 | 290.8px | 109.2px | 0.242s |

마지막 A5도 최종 좌표에서 400 끝자락에서 당겨 margin을 확보했다.

---

## 6. Guard A/B — Staggered Orbit Pair

동일 Diamond Loop:

```text
(-420,-650)
→ (0,-850)
→ (420,-650)
→ (0,-500)
→ repeat
```

둘 다:

```text
speed 60
same direction
same route
```

차이는:

```text
A phase = 0.0
B phase = 0.5
```

즉 둘 사이가 계속 움직이는 통과 창이다.

### 왜 반대 방향이 아닌가

Current `EnemyPatrol`의 실제 multi-point loop를 그대로 재사용하고, 별도 reverse-direction contract를 발명하지 않는다.

같은 route + 같은 speed + phase offset만으로 관계를 만든다.

---

## 7. Orbit Break

발각 전:

```text
A ↻
B ↻
```

A만 발각:

```text
A → PLAYER
B ↻
```

둘 다 발각:

```text
A → PLAYER
B → PLAYER
```

발각된 Guard만 Orbit을 떠나 `Persistent Pursuit`.

미발각 Guard는 authored Orbit을 계속 수행한다.

---

## 8. NEW — Anchor Drone

System:

```text
moving-anchor-drone-v1
```

Status:

```text
NOT IMPLEMENTED
```

### Identity

```text
role        Atrium Service Drone
hostile     false
killable    false
kinematic   true
grappleable true
```

공격하지 않는다.

Security Guard와 다른 Cyan Grapple Ring silhouette를 사용한다.

---

## 9. Anchor Drone Path

Drone body:

```text
(-190,-900)
↔
(150,-900)

speed        80 px/s
wait         0.20s
mode         pingpong
```

Grapple Socket:

```text
body local offset
(0,-31)
```

즉 실제 socket Y:

```text
-931
```

### Base 400 reach from Atrium Read

| Position | Hand→Socket | Margin |
|---|---:|---:|
| LEFT SOCKET | 253.7px | 146.3px |
| RIGHT SOCKET | 294.0px | 106.0px |

Drone이 어느 끝에 있어도 Base 400으로 잡을 수 있고 **worst static margin은 약 106.0px**다.

현재 Hook 최대 비행시간 1/3초 동안 Drone은 speed 80에서 최대 약:

```text
26.7px
```

이동할 수 있으므로 발사 순간 좌표를 고정하는 기존 Launcher 계약은 Moving Anchor에 적합하지 않다.

---

## 10. Dynamic Targeting Contract

현재 Rope는 `surfaces`만 검색한다.

Moving Anchor에서는 기존 Input을 유지하면서 후보 소스를 확장한다.

```text
STATIC SURFACE CANDIDATES
+
DYNAMIC GRAPPLE SOCKET CANDIDATES
```

새 버튼/키는 없다.

Drone Grapple Ring을 기존 Pointer Aim으로 조준한다.

### Target selection

Dynamic target도:

- Base Reach 제한
- Aim tolerance 철학
- sealed divider occlusion
- access predicate

를 우회하지 않는다.

Static anchor보다 무조건 우선하는 강제 Auto-Snap은 만들지 않는다.

---

## 11. Dynamic Hook Flight

Current Launcher는 launch 시 target 좌표를 복사한다.

Anchor Drone 대상에서는:

```text
shot target = dynamic target/socket ID
```

를 보존하고 비행 중 current socket position을 추적한다.

### 제한

```text
Hook Speed
Flight lifetime
Max Reach
```

는 그대로다.

Drone이 유효 범위를 벗어나거나 target이 unload되면 정상 miss/cancel/reload 처리.

Moving target이라고 순간이동 attach하지 않는다.

---

## 12. Moving Fixed-Length Rope

부착 순간:

```text
ropeLength = hand-to-current-socket distance
```

이후 Rope length는 고정.

하지만 Pivot은 움직인다.

Dynamic provider는 최소:

```text
socketPosition
socketVelocity
```

를 제공해야 한다.

Constraint는:

```text
relative radial velocity
=
(player hand velocity - anchor socket velocity)
· rope normal
```

을 기준으로 처리해야 한다.

단순히 `FixedLengthRope.anchor.x/y`만 매 frame 덮어쓰고 anchor velocity를 0으로 취급하면 움직이는 Pivot 물리가 부정확해질 수 있으므로 금지.

---

## 13. Drone은 Rope에 끌리지 않는다

```text
Drone = KINEMATIC
```

Player 한 명이든 여러 명이든:

```text
Drone path
Drone speed
Drone phase
```

는 변하지 않는다.

```text
Player A ─┐
          ├── Anchor Drone
Player B ─┘
```

동시 부착 허용.

Rope tension이 Drone을 늦추거나 경로에서 벗어나게 하지 않는다.

---

## 14. Release

Player가 기존 Rope Release를 하면:

```text
dynamic attach ends
→ existing release transfer
→ normal 1.0s Rope reload
```

Moving Anchor 전용 인공 Boost는 추가하지 않는다.

Pivot movement가 constraint를 통해 Player에게 준 실제 momentum만 남는다.

---

## 15. Failure Rules

- Hook 중 Drone이 유효 target이 아니게 됨 → miss / reload.
- Stage transition / unload 중 attachment → safe detach.
- Drone reversal frame에서도 finite position/velocity 유지.
- reconnect/snapshot에서 duplicated dynamic attachment 금지.
- Drone은 죽지 않으므로 anchor-death detach 규칙은 4-5에서 필요 없음.

---

## 16. Guard C

Upper Terrace Sweep:

```text
(350,-1120)
→ (70,-1230)
→ (330,-1360)
→ (20,-1490)
→ pingpong
```

Speed 72 / wait .20.

A/B와 다른 vertical/diagonal axis.

Worst Case:

```text
A + B + C
= 3 Pursuers
```

4번째 Guard는 넣지 않는다.

---

## 17. Camera

Atrium Read에서 동시에 보여야 할 것:

```text
Player
A/B Orbit
their gap
Anchor Drone
A3 static fallback
```

Drone을 보기 위해 Static fallback Anchor가 화면 밖으로 사라지면 FAIL.

Moving Anchor는 선택이므로 항상 **“안 써도 어디로 가는지”** 보여야 한다.

---

## 18. Recovery

- R1 Planter Edge
- R2 Lower Lounge Lip
- R3 Atrium Service Ledge
- R4 Upper Gallery Lip

Recovery는:

```text
Alert clear NO
Drone reset NO
Drone phase reset NO
```

5초 이내 현재 band 복귀 목표.

---

## 19. Augment Compatibility

Current Augment V1:

### Long Rope
Base 400 → +20%.

Moving Drone을 더 일찍 잡거나 더 넓은 timing window를 만들 수 있다.

하지만 Base 400에서도 Drone 전체 path를 사용 가능하다.

### Fast Recover
Reload 절반.

Moving target miss 후 빠른 재도전.

### Release Propulsion
Release velocity ×1.25.

Drone release 표현력이 강해질 수 있음.

### Direction Dash
Drone release landing correction.

모두 optional.

```text
specific Augment required
= FAIL
```

Long Rope 480이 Atrium Read → Upper Gallery/Exit 전체를 직접 skip하면 FAIL.

---

## 20. Story

```text
PRIVATE AMENITY ATRIUM
RESIDENT ACCESS

ATRIUM SERVICE DRONE
FACILITY MAINTENANCE ACTIVE

SECURITY
ACTIVE
```

사람은 없지만:

- leisure infrastructure
- maintenance service
- security

가 계속 작동한다.

이 단계에서 Corporate 원인은 설명하지 않는다.

---

## 21. 왜 적 Security Drone을 Anchor로 쓰지 않는가

Moving Anchor V1에서 동시에:

- hostile AI
- projectile combat
- death
- persistent pursuit
- dynamic grapple target
- moving constraint
- anchor death detach

를 해결하지 않는다.

순서:

```text
4-5
NEUTRAL MOVING ANCHOR
→ mechanic learned

later 4-7 / 4-8 candidate
GRAPPLEABLE SECURITY DRONE
```

후반 응용은 별도 승인.

---

## 22. AREA-SPEC REV1.1

현재 공식 schema에 dynamic grapple entity collection이 없다.

따라서 임의 `dynamicGrappleTargets` top-level field를 만들지 않는다.

`AREA-SPEC.json`에는:

```text
moving-anchor-drone-v1
NOT_IMPLEMENTED
```

을 선언하고 Optional Route는 실제 referencable surface인:

```text
atrium-read
→ drone-exit
→ a4
```

로 표현한다.

Drone exact path/socket/physics는 이 README와 `RUNTIME-HANDOFF.md`가 신규 system 구현 계약으로 고정한다.

Production 단계에서는 공식 validator/authoring extension을 추가해야 한다.

---

## 23. Current Runtime Migration

Current 4-5:

```text
EXPRESS SHAFT
NO ENEMY
VERTICAL PULSED WIND
```

Target:

```text
AMENITY ATRIUM

A/B Staggered Orbit
C Upper Sweep
Persistent Pursuit

Neutral Moving Anchor Drone
No Wind
No Cutter
No Scanner
```

기존 `express-wake`는 제거 대상.

---

## 24. PASS

### Mandatory
- Base 400 static route clear.
- swingImpulse=0 contract clear.
- Moving Anchor NOT required.

### Moving Anchor
- entire Drone path in Base 400 reach.
- dynamic Hook tracks socket.
- no reach/lifetime bypass.
- fixed Rope length after hit.
- position + velocity aware moving constraint.
- normal release/reload.
- multiattach safe.
- Drone unaffected by Rope tension.

### Security
- A/B maintain 0.5 phase before detection.
- detected Guard independently breaks Orbit.
- C upper sweep.
- max 3 Pursuers.

### Augment
- optional expression only.
- no Long Rope total-band bypass.

### Camera
- A/B + Drone + A3 visible/readable together.
