# SECTOR 01-2 — DOUBLE ANCHOR SHAFT

*BLOCKOUT CANDIDATE · REV 3.0*

◀ PREV — [SECTOR 01-1 / SERVICE SHAFT](../1-1/README.md) · NEXT — [SECTOR 01-3 / SECURITY CHECK](../1-3/README.md) ▶

`SECTOR 01 MAINTENANCE` · `STAGE 02` · `THEME VERTICAL MAINTENANCE LIFT SHAFT` · `DIFFICULTY ★–★☆` · `TARGET 1:30–2:00` · `PRIMARY AIRBORNE RE-ATTACH / GRAPPLE CHAINING` · `COMBAT NONE` · `DAMAGE HAZARD NONE` · `AUGMENT NONE` · `WIND NONE`

## 1. 한 줄 정의

정지한 Maintenance Lift를 우회해 수직 승강기 샤프트를 올라가면서, 플레이어가 `Release`를 Rope 이동의 끝이 아니라 `다음 Attach의 시작`으로 이해하도록 만드는 연속 Grapple 튜토리얼.

핵심 플레이 문장:

```text
Attach A
→ Swing
→ Release
→ Airborne Attach B
→ Swing
→ Release
→ Attach C
→ Swing
→ Attach D
→ Exit
```

## 2. 전체 게임에서의 역할

### 1-1에서 이미 배운 것

- Move
- Jump
- Aim
- Attach
- Swing
- Release
- Landing

### 1-2에서 새로 배우는 것

- 공중 상태에서도 Rope를 다시 Attach할 수 있음
- Release 직후 다음 Anchor를 잡을 수 있음
- Rope를 연속으로 연결하면 착지 없이 빠르게 상승할 수 있음
- Anchor 위치에 따라 이동 방향을 크게 바꿀 수 있음

### 1-2에서 배우지 않는 것

- Enemy
- Turret
- Projectile
- Wind
- Moving Platform
- Laser
- Rope Cut
- Augment
- Maintenance Node
- Combat Challenge

첫 Enemy는 1-3에서 등장한다.

## 3. 스토리 역할

1-1의 Service Terminal에서 플레이어는 이미 다음 정보를 확인했다.

- `LOWER TRANSIT OFFLINE`
- `ROOFTOP PAD 03`
- `MAINTENANCE SHUTTLE — STANDBY`

따라서 플레이어의 현재 목표는 **“Rooftop까지 올라간다.”**이다.

1-2에 들어오면 정상적인 수직 이동수단인 Maintenance Lift를 발견하지만 Lift는 정지 상태다.

입구 표시:

```text
LIFT CONTROL
OFFLINE
```

보조 표시:

```text
VERTICAL GRID FAULT

AUTOMATIC LIFT SERVICE
SUSPENDED

MANUAL ACCESS ONLY
```

이 Stage의 스토리 역할은 새로운 목적을 주는 것이 아니라 **“정상적인 이동수단은 정말 사용할 수 없기 때문에 정비용 Grapple로 직접 올라가야 한다.”**는 것을 공간으로 확인시키는 것이다.

## 4. 공간 콘셉트

1-1보다 다음 특성을 강화한다.

- 더 좁음
- 더 높음
- 더 강한 수직성
- 플랫폼 수는 적음
- 중앙에 거대한 하나의 랜드마크가 있음

대표 랜드마크는 `STOPPED MAINTENANCE LIFT`다.

화면 중앙을 따라 Lift Cage, Vertical Rail, Counterweight, Heavy Power Cable, Maintenance Numbers, Broken Lift Indicator가 위쪽까지 이어진다. 플레이어는 Lift 자체가 아니라 Lift 좌우의 빈 공간을 지그재그로 Rope 이동한다.

```text
1-1 = 넓은 Service Shaft
1-2 = 좁고 높은 Elevator Shaft
```

## 5. Pixel / Grid 기준

| 항목 | 기준 |
|---|---:|
| Base Tile Grid | 32×32px |
| Player Game Output | 48×48px |
| Recommended Grapple Anchor Visual | 24×24px, 최대 32×32px |
| Thin Platform | 32×16px Tile |
| Standard Collision Platform | 32×32px Tile |
| Stage Width | 960px = 30 Tiles |
| Stage Height | 1088px = 34 Tiles |
| X Bounds | -480–+480 |
| Y Bounds | 0–-1088, 작아질수록 위쪽 |

## 6. 전체 맵 단면

```text
SYMBOL

●    Recommended Grapple Target
════ Collision Platform
---- Thin Recovery Platform
▒▒   Background Maintenance Lift
██   Static Collision Geometry
GATE Exit

                         Y -1088

              ┌─────────────────────────────┐
              │              SECURITY CHECK│
              │                  GATE 03 → │
              │                     █████  │
              │            P4 FINAL DECK   │
              │        ═══════════════════ │
              │                 ↑          │
              │              ● D           │
              │             ╱              │
              │            ╱               │
              │       ▒▒▒▒▒▒▒▒             │
              │       ▒ LIFT ▒             │
              │       ▒ CAGE ▒             │
              │       ▒▒▒▒▒▒▒▒             │
              │                             │
              │        P3 / RECOVERY        │
              │       ─────────────         │
              │                             │
              │   ● C                       │
              │      ╲                      │
              │       ╲                     │
              │        ███████              │
              │        CROSSBEAM X1         │
              │                             │
              │                  ● B        │
              │                 ╱           │
              │                ╱            │
              │          P1 / RECOVERY      │
              │        ─────────────        │
              │                             │
              │       ● A                   │
              │      ╱                      │
              │                             │
              │ P0 START                    │
              │ ═══════════                 │
              │       LIFT OFFLINE          │
              └─────────────────────────────┘

                         Y 0
```

전체 진행은 아래에서 위로 향한다. 이동 궤적은 좌 → 우 → 좌 → 우의 큰 S자 형태가 되어야 한다.

## 7. 주요 오브젝트 좌표 초안

모든 수치는 **BLOCKOUT HYPOTHESIS**이며 플레이테스트 후 수정한다.

### PLAYER SPAWN

- Position: `(-320, -32)`

### P0 — START PLATFORM

- Bounds: `x = -416–-160`, `y = 0`
- Size: `256×32px`
- Role: Stage 시작, Lift Offline 확인, Anchor A 확인, 기본 이동 준비
- Collision: `true`

### ANCHOR A — REVIEW ANCHOR

- Position: `(-128, -192)`
- Visual: `24×24px`
- Role: 1-1 기본 Rope 복습, 첫 Swing 준비, 새 학습 아님
- Difficulty: `VERY EASY`
- Required: `true`

### P1 — FIRST SAFE / RECOVERY PLATFORM

- Bounds: `x = +64–+256`, `y = -288`
- Size: `192×16px`
- Role: A→B Handoff 실패 Recovery, 초보 Safe Route, B 재조준
- Collision: `true`
- Grapple Priority: `LOW`

### ANCHOR B — FIRST HANDOFF TARGET

- Position: `(+160, -416)`
- Visual: `24×24px`
- Role: 게임 최초 Airborne Re-Attach, A Release 직후 잡는 첫 다음 Anchor, 1-2 핵심 Tutorial Target
- A→B Distance: 약 `365px`
- Difficulty: `EASY / FORGIVING`
- Required: `true`

### CROSSBEAM X1 — STATIC GEOMETRY

- Bounds: `x = -64–+64`, `y ≈ -544`
- Size: `128×32px`
- Role: B→C의 너무 낮은 궤적 차단, 높은 Release Arc 유도
- Collision: `true`
- Damage: `false`
- Recommended: `grappleable = false`

> **IMPLEMENTATION NOTE**
> 현재 엔진에서 Non-grapple Collision Surface 분리가 어렵다면 초기 Blockout에서는 X1을 비충돌 시각 요소로 테스트한 뒤 `grappleable` Surface Filter 구현 후 Collision을 적용한다.

### P2 — SECOND RECOVERY PLATFORM

- Bounds: `x = -288–-96`, `y = -576`
- Size: `192×16px`
- Role: B→C 실패 Recovery, Safe Route, C 재시도
- Collision: `true`

### ANCHOR C — DIRECTION CHANGE TARGET

- Position: `(-160, -640)`
- Visual: `24×24px`
- Role: 첫 방향 반전 Grapple. B에서 오른쪽으로 이동하던 Player를 다시 왼쪽 위로 전환하여 Rope가 단순 상승기가 아니라 방향 제어 수단이라는 점을 학습
- B→C Distance: 약 `390px`
- Difficulty: `MEDIUM`
- Required: `true`

### P3 — THIRD RECOVERY PLATFORM

- Bounds: `x = +64–+256`, `y = -800`
- Size: `192×16px`
- Role: C→D 실패 Recovery, 마지막 Flow Test 재시도, 초보 Safe Route
- Collision: `true`

### ANCHOR D — FLOW CONFIRMATION TARGET

- Position: `(+128, -864)`
- Visual: `24×24px`
- Role: B→C에서 배운 방향 전환 재사용, 별도 Tutorial Text 없이 연속 Grapple 이해 확인, 마지막 상승 Momentum 연결
- C→D Distance: 약 `365px`
- Difficulty: `MEDIUM`
- Required: `true`

### P4 — FINAL SAFE DECK

- Bounds: `x = +64–+352`, `y = -960`
- Size: `288×32px`
- Role: Level Challenge 종료, 숨 돌리는 안전 공간, 1-3 진입 준비
- Collision: `true`

### EXIT GATE

- Position: `(+320, -992)`
- Visual: `64×96–64×128px`
- Label: `SECURITY ACCESS CHECK`
- Destination: `SECTOR 01-3`

## 8. 이동 경로

### FLOW ROUTE — 숙련 경로

목표는 중간 Landing 0회다.

```text
START → A → Swing → Release → Airborne Attach B
→ Swing → Release → Airborne Attach C
→ Swing → Release → Airborne Attach D
→ Final Deck → Exit
```

이 경로가 1-2의 이상적인 플레이다. Rope 이동 자체가 `착 → 슉 → 착 → 슉 → 착 → 슉`의 Combo처럼 보여야 하지만 별도 Combo UI는 사용하지 않는다.

### SAFE ROUTE — 초보 경로

```text
START → A → P1 Landing → B → P2 Landing
→ C → P3 Landing → D → P4 → Exit
```

공중 Re-Attach를 완벽히 수행하지 못해도 레벨은 진행 가능해야 한다. Safe Route는 쉽고 안정적이지만 느리며, Flow Route는 조금 어렵지만 빠르고 시각적 만족감이 높다.

### RECOVERY ROUTE

| 실패 | 복구 |
|---|---|
| A→B | P1 → B Retry |
| B→C | P2 → C Retry |
| C→D | P3 → D Retry |

실패 후 5초 안에 같은 동작을 다시 시도할 수 있어야 하며 Stage 처음으로 떨어뜨리지 않는다.

## 9. ZONE A — LIFT FAILURE

- 범위: `Y 0–-256`
- 예상 시간: `10–15초`

플레이어가 1-1 Gate에서 진입하면 화면 중앙에 거대한 Maintenance Lift가 보인다.

```text
LIFT CONTROL
OFFLINE
```

Lift Call Button을 구현한다면 `AUTOMATIC LIFT SERVICE / SUSPENDED`만 표시하며 긴 Interaction은 금지한다. 플레이어가 위를 보면 Anchor A가 보여야 한다.

목표는 **“엘리베이터가 안 되니까 Rope로 올라가야 한다.”**를 5–10초 안에 이해시키는 것이다.

## 10. ZONE B — FIRST HANDOFF

- 범위: `Y -192–-480`
- 핵심 행동: `A → Release → B Attach`

플레이어가 A에 붙으면 Camera는 Player보다 위쪽을 보여준다. 반드시 같은 화면에 Player, Anchor A, Anchor B, P1 Recovery가 보여야 한다.

Anchor B 주변 128–160px에는 복잡한 Collision과 강한 배경 Detail을 제거한다. B가 다른 Surface와 Target 경쟁을 해서는 안 된다.

Tutorial Goal은 **“착지하기 전에 다음 Rope를 잡을 수 있다.”**이다.

## 11. FIRST HANDOFF TUTORIAL

처음부터 큰 설명창을 띄우지 않는다. A Swing 중 B가 화면에 들어오면 다음 짧은 Hint만 표시한다.

```text
RELEASE
→
AIM NEXT
→
ATTACH
```

한 번 성공하면 영구적으로 숨긴다. 두 번 이상 실패할 경우에만 `YOU CAN ATTACH / BEFORE LANDING` 추가 Hint를 허용한다. Tutorial Text보다 B의 위치와 Camera Framing을 우선한다.

## 12. ZONE C — DIRECTION REVERSAL

- 범위: `Y -416–-736`
- 핵심 행동: `B → C`

첫 Handoff와 동일한 동작을 반대 방향으로 수행한다. 오른쪽의 B에서 Swing하고 Release한 뒤 왼쪽 위의 C에 Attach하여 이동 방향을 전환한다.

이 구간에서는 Crossbeam X1을 사용한다.

```text
너무 낮은 궤적 → Beam 충돌 → Momentum 감소 → P2 Recovery
좋은 궤적      → Beam 위/옆 통과 → C Attach
```

Damage는 없다. 실패 피드백은 **“더 좋은 Release Timing과 높이가 필요하다.”**이다.

## 13. ZONE D — FLOW TEST

- 범위: `Y -640–-960`

C→D에서는 새 Tutorial Text를 사용하지 않는다. 플레이어가 지금까지 배운 것을 스스로 적용해 `C → Swing → Release → D → P4`로 이동한다.

숙련자는 A부터 D까지 한 번도 바닥을 밟지 않고 도달 가능해야 한다. 목적은 **“내가 Rope Chaining을 이해했다.”**는 자기 확인이다.

## 14. 맵 장애물 설계 원칙

1-2에는 Damage Hazard가 없다. 사용 장애물은 오직 거리, 방향 변화, Static Crossbeam, Recovery Platform 위치뿐이다.

| 구간 | 질문 |
|---|---|
| A→B | 착지하기 전에 다음 것을 잡을 수 있는가? |
| B→C | 다음 Anchor가 반대쪽이어도 방향을 바꿀 수 있는가? |
| Crossbeam | 언제 Release해야 좋은 궤도가 만들어지는가? |
| C→D | 이제 설명 없이 연속 이동할 수 있는가? |

## 15. 죽음 / 추락 규칙

1-2에서는 Grapple 실패 자체로 죽이지 않는다. Stage를 P1 `LOWER CATCH`, P2 `MIDDLE CATCH`, P3 `UPPER CATCH`의 세 층으로 나누어 큰 실수도 가장 가까운 Recovery Tier에서 복구한다.

목표는 `실패 비용 = 3–5초`이며 전체 재등반은 금지한다.

## 16. Camera Specification

### CAMERA A — INTRO

- Show: Player, Lift, Anchor A, P1 일부
- Focus: 상승 방향 인지

### CAMERA B — FIRST HANDOFF

- A Attach 순간 Show: Player, A, B, P1
- Camera Lead Y: 약 `120–160px Upward`
- Release 전에 B가 화면에 보여야 함

### CAMERA C — DIRECTION REVERSAL

- B Attach 순간 Show: Player, C, Crossbeam, P2
- C를 화면 상단 가장자리에 숨기지 않음

### CAMERA D — FLOW TEST

- C Attach 순간 Show: Player, D, P3, Final Deck 일부
- D Attach 후 Final Deck과 Exit Gate가 보이도록 상승

## 17. 카메라 금지사항

- Player만 중앙에 고정해 다음 Anchor가 안 보이는 것
- Release 순간 Target이 화면 밖으로 나가는 것
- Recovery Platform이 안 보여 추락을 죽음처럼 느끼게 하는 것
- Lift 배경을 보여주느라 Gameplay Target을 가리는 것

Camera의 목적은 Player Tracking이 아니라 **Next Decision Information 제공**이다.

## 18. 스토리 Trigger

| 시점 | 메시지 |
|---|---|
| Entry | `LIFT CONTROL / OFFLINE` |
| After First Ascent | `MANUAL ACCESS ONLY` |
| Mid Shaft | `SECTOR 01 / POWER REDUCTION — STAGE 2` |
| Exit Gate | `SECURITY ACCESS CHECK` |

Mid Shaft 메시지는 짧게 지나가며 플레이를 멈추지 않는다. `UNAUTHORIZED`, `VIOLATION`, `HOSTILE`은 1-3에서 처음 사용한다.

## 19. 그래픽 방향

전체 스타일은 **SANABI-inspired High-bit Pixel Art**이며, 작은 Gameplay Entity와 큰 산업 Background Component의 대비가 핵심이다. 레퍼런스의 자산이나 레벨을 복제하지 않고 공간 밀도와 정보 위계의 원리만 사용한다.

## 20. Gameplay Asset Spec

### PLAYER

- Game Output: `48×48px`
- Dark/Charcoal Silhouette
- Long Red Scarf
- Small Grapple Device
- Minimal Facial Detail

### ANCHOR A/B/C/D

- Visual: `24×24px`, 최대 `32×32px`
- Color: Cyan
- Priority: `VERY HIGH`
- 주변 Glow는 작게 처리하고 큰 Neon Object처럼 만들지 않음

### PLATFORM

- Standard: `32×32 Tile`
- Thin: `32×16 Tile`
- P1/P2/P3: `6 Tiles × 16px`, 권장 시각 폭 `192px`

### CROSSBEAM X1

- Visual/Collision: `128×32px`
- Construction: `32×32 Tile × 4`
- Color: Dark Gray / Steel
- Damage Color: 없음
- Red/Orange 금지. Hazard처럼 보이면 안 됨

### EXIT GATE

- Visual: `64×96–64×128px`
- Industrial Service Door
- Background보다 밝지만 Anchor보다 시각적으로 약함

## 21. Background Layer

Gameplay 구조는 단순하지만 Background는 풍부하게 구성한다.

### FAR BACKGROUND

- Asset Target: `512×288` 또는 `960×540`
- 거대한 내부 도시 Shaft, 먼 Vertical Structural Grid, 작은 작업등, Dark Void, 다른 Lift Shaft Silhouette
- Contrast/Saturation: 가장 낮음
- Parallax: 느림

### MID BACKGROUND

128×128–256×256 Component를 사용한다.

#### MAINTENANCE LIFT CAGE

- 권장 Component: `192×256` 또는 `256×256` 반복
- 여러 Module을 세로로 이어 전체 화면에서 약 700–900px 규모로 구성
- 중앙 범위: `X -96–+96`
- 대부분 Non-collision Background

#### LIFT RAIL

- `32×256` Module 좌우 반복

#### COUNTERWEIGHT

- `64×128` 또는 `96×160`
- Lift와 반대 방향 한쪽에 배치

#### HEAVY POWER CABLE

- `32×64` / `64×128` 반복

## 22. NEAR BACKGROUND

32×32–64×64 Tile/Component로 Service Hatch, Cable Socket, Maintenance Number, Small Warning Lamp, Bolts, Inspection Markings, Thin Pipe, Lift Call Panel을 구성한다.

Near Background도 Collision Platform보다 Contrast가 낮아야 한다.

## 23. 화면 정보 우선순위

1. Player + Red Scarf
2. Cyan Rope / Anchor
3. Collision / Recovery Platform
4. Exit
5. Lift Landmark
6. Background Pipe / Cable
7. Decorative Light

Lift가 거대하더라도 Gameplay보다 강하게 읽혀서는 안 된다.

## 24. 색 규칙

| 요소 | 색 규칙 |
|---|---|
| Player | Dark + Red Scarf |
| Rope | Cyan |
| Anchor | Cyan |
| Collision Terrain | Dark Gray / Navy |
| Lift | Desaturated Steel / Navy |
| Warning | Small Red / Orange Only |
| Background Light | Low Saturation |

Cyan Neon Background를 남발하지 않는다. Cyan은 Rope 언어로 보호한다.

## 25. VFX / Sound

- Attach: 짧은 Cyan Flash + Metallic Lock Sound
- Release: Small Snap / Whoosh
- Successful Re-Attach: Attach보다 약간 더 선명한 Impact Sound 허용
- Landing: Metal Platform Impact
- Lift: 낮은 정지 기계음 + 간헐적 Electrical Hum
- Flow Route: 별도 Combo UI 없이 Rope Sound Rhythm 자체가 보상

## 26. 현재 구현 고려사항

| CURRENT BASELINE | 값 |
|---|---:|
| `maxAttachDistance` | 440px |
| `attachBuffer` | 100ms |
| Aim-to-surface Threshold | 90px |
| `swingImpulse` | 780 |
| `maxHorizontalSpeed` | 360 |

이 값들은 현재 코드 기준이며 Level Design 최종값으로 고정하지 않는다.

## 27. 구현 요구사항 — Grapple Target Clarity

현재 Rope가 모든 Surface를 후보로 볼 수 있으므로 Anchor B/C 주변에 불필요한 Collision을 두지 않는다.

- Recommended Clean Radius: Anchor 중심에서 약 `128–160px`
- 금지: 작은 Collision Pipe, Decorative Collision, 겹치는 Ledge, 복잡한 Protrusion
- 장기 권장: Surface에 `grappleable: true / false` 속성 도입 검토
- Crossbeam X1의 이상적인 설정: `grappleable = false`

## 28. 구현 요구사항 — Momentum Test

1-2는 Release Momentum 검증용 Benchmark Stage로 사용한다.

반드시 기록할 값:

```text
A release 직전: velocity.x / velocity.y
A release 직후: velocity.x / velocity.y
B attach 직전: velocity.x / velocity.y
```

B→C와 C→D에도 같은 기록을 적용할 수 있다. 확인 질문은 **“Rope에서 얻은 이동 Momentum이 Release 직후 과도하게 잘리는가?”**이다.

## 29. swingImpulse 관련 필수 테스트

- Test A: 현재 `swingImpulse = 780`
- Test B: `swingImpulse = 0`

1-2 Flow Route는 최소한 Test B에서도 Clear 가능해야 한다. 기본 Rope Pendulum 자체가 연속 이동을 만들 수 있는지 확인한다. Impulse에 의존해야만 통과된다면 Stage를 더 꾸미기 전에 Rope Feel을 다시 검토한다.

## 30. Attach Forgiveness Test

A→B 구간을 Benchmark로 사용한다.

- Attach Buffer 후보: `50ms`, `100ms`, `150ms`
- Aim Threshold: 현재 `90px` Baseline
- 측정: Successful Airborne Attach, Early Click Failure, Late Click Failure, Wrong Surface Attach, No Candidate Despite Player Intent
- 목표: **“분명히 눌렀는데 왜 안 붙었지?”**라는 Ghost Attach 느낌 최소화

## 31. 플레이테스트 예상 경로

### FIRST-TIME PLAYER

```text
Start → A → P1 → B 실패 → P1 → B 성공
→ P2 → C 실패 → P2 → C → P3 → D → Exit
```

정상 플레이로 취급한다.

### INTERMEDIATE PLAYER

```text
Start → A → B → P2 → C → D → Exit
```

### SKILLED PLAYER

```text
Start → A → B → C → D → Exit
```

중간 Landing은 0회다.

## 32. 플레이 리듬

```text
INTRO — 안전
↓
A — 복습
↓
A→B — 첫 도전
↓
B ATTACH SUCCESS — 짧은 성취
↓
B→C — 두 번째 도전 + 방향 반전
↓
C — 숙련감 상승
↓
C→D — Flow Test
↓
P4 — 완전한 안전
↓
EXIT — 다음 Security 구간 예고
```

난이도가 계속 상승하기보다 `도전 → 성공 → 도전 → Flow → 해소`의 리듬을 사용한다.

## 33. Playtest Metrics

### REQUIRED

- First Handoff Success Rate
- Recovery → Retry Time
- Wrong Attach Count
- No-Attach Count
- A→B Attempts
- B→C Attempts
- C→D Attempts
- Total Landing Count
- First Clear Time
- Flow Route Clear Time

### QUALITATIVE

1. 착지하지 않고 다음 Rope를 잡을 수 있다는 것을 이해했는가?
2. Release 직후 다음 Anchor를 잡는 행동이 자연스러웠는가?
3. 실패 원인이 본인 조작 때문이라고 이해됐는가?
4. “눌렀는데 안 붙었다”고 느낀 순간이 있었는가?
5. B→C에서 방향이 바뀌는 것이 재미있었는가?
6. A→B→C→D를 착지 없이 연결해보고 싶다는 생각이 들었는가?

## 34. PASS 기준

1. 회색 Blockout만으로 위쪽 진행 방향이 읽힌다.
2. 첫 플레이어가 A→B Handoff 개념을 수회 안에 이해한다.
3. B→C가 A→B의 단순 복사가 아니라 방향 전환처럼 느껴진다.
4. 모든 실패 후 5초 안에 재시도할 수 있다.
5. 적이 없어도 Level이 지루하지 않다.
6. Safe Route로 초보도 Clear 가능하다.
7. A→B→C→D 무착지 Flow Route가 가능하다.
8. `swingImpulse = 0` 테스트에서도 Flow Route가 가능하거나, 불가능한 이유가 명확하게 Physics 문제로 확인된다.
9. Wrong Attach 빈도가 매우 낮다.
10. Release Momentum이 다음 Grapple까지 자연스럽게 이어진다.
11. 배경 Lift/Cable을 추가해도 Anchor 판독성이 유지된다.
12. 첫 Playtime이 약 90–120초다.

## 35. 제외 요소

**DO NOT ADD:**

- Turret
- Enemy
- Drone
- Projectile
- Wind
- Fan Hazard
- Laser
- Moving Platform
- Rope Cutter
- Augment
- Maintenance Node
- Instant Death Pit
- Combat Arena
- Boss
- Timed Challenge
- Combo Score UI

## 36. 개발용 최소 Stage Data

```yaml
stageId: sector-01-02
name: DOUBLE ANCHOR SHAFT
subtitle: LIFT BYPASS
bounds: 960x1088
spawn: [-320, -32]

grappleTargets:
  - A
  - B
  - C
  - D

platforms:
  - P0 Start
  - P1 First Recovery
  - P2 Second Recovery
  - P3 Third Recovery
  - P4 Final Safe Deck

geometry:
  - Crossbeam X1

background:
  - Maintenance Lift
  - Rails
  - Counterweight
  - Heavy Cables
  - Structural Shaft

storyTriggers:
  - Lift Offline
  - Manual Access Only
  - Power Reduction Stage 2
  - Security Access Check

cameraZones:
  - Intro
  - First Handoff
  - Direction Reversal
  - Flow Test
  - Exit

enemies: NONE
damageHazards: NONE
```

## 37. 아트 담당자 전달문

> **32px Tile Grid 기반의 좁고 높은 Maintenance Lift Shaft. 플레이어는 게임상 48×48 출력, 권장 Grapple Anchor는 24×24 Cyan, 플랫폼은 주로 32×16 / 32×32 Tile 조합으로 제작한다. Gameplay Geometry는 단순하게 유지하지만 Background는 128–256px 단위의 Lift Cage, Rail, Counterweight, Heavy Cable을 조합해 High-bit 산업 공간의 밀도를 만든다. 중앙 Maintenance Lift는 화면 전체 높이를 관통하는 거대한 랜드마크지만 저채도·저명도로 표현해 Player, Rope, Anchor, Recovery Platform보다 뒤로 밀어낸다. Player는 Dark Silhouette + Long Red Scarf, Rope/Anchor는 Cyan, Warning의 Red/Orange는 최소 사용하며 Cyan Background Neon은 남발하지 않는다.**

## 38. 개발자 최종 전달 요약

SECTOR 01-2 `DOUBLE ANCHOR SHAFT`는 1-1의 `Attach → Swing → Release → Landing`을 Airborne Re-Attach로 연결하는 두 번째 Authored Tutorial Stage다.

중앙에는 고장 난 Maintenance Lift가 거대한 배경 랜드마크로 존재하며, 플레이어는 좌우의 Anchor A→B→C→D를 지그재그로 연결하며 상승한다. A는 1-1 복습, B는 게임 최초 Airborne Handoff, C는 방향 반전, D는 Tutorial 없이 연속 Grapple 이해를 확인하는 Flow Test다.

숙련자는 Start 이후 A→B→C→D를 중간 착지 없이 한 호흡으로 통과할 수 있어야 한다. 초보자는 P1/P2/P3 Recovery Platform을 사용해 각 Handoff를 독립적으로 재시도할 수 있어야 하며 실패 비용은 3–5초 안으로 유지한다.

1-2에는 Enemy, Wind, Moving Hazard, Augment를 넣지 않는다. 현재 Rope 구현의 `maxAttachDistance = 440px`, `attachBuffer = 100ms`, `aim threshold = 90px`를 Baseline으로 사용하지만 최종값으로 고정하지 않는다.

이 Stage를 Rope Input / Momentum Benchmark Room으로 사용하며 다음을 검증한다.

1. Release 이후 운동량이 충분히 유지되는가?
2. 공중 Re-Attach 입력이 플레이어 의도대로 동작하는가?
3. Wrong/Ghost Attach가 발생하지 않는가?
4. `swingImpulse = 0` 상태에서도 Flow Route가 성립하는가?

Stage 성공 기준은 **“Release가 Rope 이동의 끝이 아니라 다음 Attach의 시작처럼 느껴지는가?”**이다.

---

## 문서 이미지 상태

기존 `01_swing_line.png`와 `02_level_layout.png`는 Anchor A–C 기준의 이전 Revision이므로 이력 보존을 위해 파일만 유지한다. REV 3.0의 Anchor A–D와 Crossbeam X1을 반영한 새 이미지가 제작되기 전까지 구현 기준으로 참조하지 않는다.

SECTOR 01-2 / DOUBLE ANCHOR SHAFT — BLOCKOUT CANDIDATE · REV 3.0
