# SECTOR 01-1 — SERVICE SHAFT

> **REV 7.0 · DESIGN LOCKED**  
> Runtime audit baseline: `5ae6efca720720ee34f2a8b45daf1778fd206c1f`  
> Sector masterplan: `../SECTOR-01-MASTERPLAN-REV7.md`  
> Runtime status and mismatches: `PRODUCTION-ALIGNMENT.md`

## 0. One-line experience

사고 직후, 주인공은 **정상성을 잃은 첫 유지관리 설비**를 마주하고 당황하지만,
Rope 조작에 집중하면서 작은 통제감을 얻는다.
Terminal에서 문제의 범위가 예상보다 크다는 사실을 확인한 뒤에도 완전히 안정되지는 않은 채
**“일단 위로”라는 임시 목표만 잡고** 다음 구역으로 이동한다.

## 1. Stage role

- Stage identity: `1-1 / SERVICE SHAFT`
- Spatial Signature: `STRAIGHT EMERGENCY SERVICE RISER`
- Movement Signature: `ATTACH → SWING → RELEASE → LAND`
- Failure Signature: 짧은 아래쪽 Recovery; 첫 Grapple 실패 비용 약 5초 이하
- Combat / Pressure Signature: NONE
- Augment Affordance Signature: NONE
- Story Function: `FIRST CRACK IN NORMALITY`
- Presentation Signature: `ENVIRONMENT → PLAY → TERMINAL CONFIRMATION → UNCERTAIN DIRECTION`
- Target feeling: `당황 → 집중 → 작은 통제감 → 다시 불안 → 임시 방향`

## 2. What the player should know on exit

1. Rope를 걸고 Swing/Release/Land할 수 있다.
2. 실제 Maintenance 구조물도 일부 Grapple 가능한 공간 언어가 될 수 있다.
3. Ground / Lower Transit은 현재 정상 탈출 경로가 아니다.
4. 위쪽 Rooftop Pad 03에 Maintenance Shuttle 상태가 남아 있다.
5. **왜 이런 일이 일어났는지는 아직 모른다.**

Stage 1-1에서 절대 완료하지 않는다:
- 공포 극복
- 사고 원인 규명
- 시스템 음모/의도 추론
- Security 구조에 대한 불신 확정
- 영웅적 결심
- Augment / Combat / Airborne Re-Attach 학습

## 3. Psychology contract

Start target:
- Fear ≈ 90+
- Control ≈ 10
- Understanding ≈ 5

Exit target:
- Fear ≈ 72
- Control ≈ 28
- Understanding ≈ 15

Psychological sequence:

`STARTLED → FOCUS → FIRST ENVIRONMENTAL UNDERSTANDING → SMALL CONTROL → SCALE REVEAL → UNCERTAIN DIRECTION`

핵심:
**Control이 조금 올라가도 Fear가 완전히 내려가면 안 된다.**
Terminal reveal에서 Fear가 다시 올라가야 한다.

## 4. Map contract

Bounds:
- `960 × 960`
- local X `-480..+480`
- local Y `0..-960`

Approved route intent:

`ENTRY → A → P1 → STRUCTURAL GRIP opportunity → P2 → C → P3 → TERMINAL → GATE`

### Dedicated Grapple Targets

- A `(-96, -192)`
- C `(-64, -704)`
- **NO dedicated B**

### Structural Grip

`Cable Overhang (176, -608), 224×32`

- 실제 Maintenance Infrastructure다.
- normal grappleable Surface로 읽힌다.
- Tutorial arrow / glowing B / 별도 팝업 금지.
- Player가 먼저 발견해야 한다.
- 필수 hidden quiz로 만들지 않는다.
- Base Rope의 다른 합법 경로가 존재해도 된다.

### P3 — DESIGN LOCKED target

- center x `+224`
- y `-800`
- width `192`
- height `16`

목적:
C 이후 첫 번째 기억에 남는 큰 오른쪽 Swing을 만든다.

### Persistent Shaft Shell — DESIGN LOCKED intent

- left center `(-464, -480)`, `32×960`
- right center `(+464, -480)`, `32×960`
- solid
- oneWay false equivalent
- grappleable false
- Seamless import 뒤에도 유지
- City Wing overlap을 통한 riser 우회 차단
- invisible wall이 아니라 Service Riser casing으로 보여야 함

현재 Runtime에는 이 계약이 아직 구현되지 않았다.
`AREA-SPEC.json`에서는 `non-grapple-solid`을 `NOT_IMPLEMENTED` dependency로 선언한다.

## 5. Recovery

- R1 `(-176,-224)` surface / recovery point `(-176,-248)`
- R2 `(-192,-480)` / `(-192,-504)`
- R3 `(-144,-736)` / `(-144,-760)`

목표:
- 첫 Stage에서 Rope miss 후 같은 문제 재시도까지 ≤ 5초
- full-stage reset 금지

## 6. Story / atmosphere beats

### S0 — INCIDENT BAY

**Psychology:** `STARTLED`

Player sees:
- Ground Shutter
- A
- partial P1
- 익숙한 Maintenance 공간의 첫 비정상 상태

VERIFIED system:
`GROUND SERVICE ACCESS / LOCKDOWN` — 1.8s

DESIGN LOCKED player bark:
`뭐야…?`

Bark status:
`NOT IMPLEMENTED — PLAYER BARK LAYER`

Atmosphere:
- ordinary facility hum 기준
- relay trip
- brief light interruption
- shutter metal settle
- 작은 acoustic gap
- Maintenance white가 기본
- local Amber 1개 수준
- full-screen red emergency wash 금지

Control:
`worldPause=false`, movement/aim/rope/action/interaction ON

### S1 — FIRST ROPE

**Psychology:** `PANIC SUPPRESSED BY FOCUS`

- Player + A + P1 + R1
- Story Toast 없음
- Player Bark 없음
- 자기진정 독백 없음
- Rope launch/attach/tension/release가 mix 최우선

Story는 입력에 집중하는 행위 자체에서 발생한다.

### S2 — STRUCTURAL READ

**Psychology:** `FIRST ENVIRONMENTAL UNDERSTANDING`

- Cable Overhang + P2 + recovery
- Story Toast 없음
- Player Bark 없음
- `저것도 잡히네`류 자가 튜토리얼 금지
- optional structural metal attach resonance 허용

발견의 소유권은 Player에게 둔다.

### S3 — OPEN SWING

**Psychology:** `SMALL CONTROL / BRIEF RELIEF`

- C + P3 + R3 + open void
- Story Toast 없음
- Text Bark 없음
- optional non-verbal exhale only
- open-swing Camera를 넓게 유지
- alarm recedes
- Rope / air / landing foreground
- 성공 후 0.3~0.5s 정보 여백 권장

`NOT IMPLEMENTED — CHARACTER BREATH / AUDIO REACTION`

### S4 — TERMINAL REVEAL

**Psychology:** `RELIEF INTERRUPTED BY SCALE REVEAL`

VERIFIED sequence:
1. `VERTICAL GRID / CASCADE FAILURE`
2. +0.9s `LOWER TRANSIT / OFFLINE`
3. +0.9s `ROOFTOP PAD 03 / MAINTENANCE SHUTTLE · STANDBY`

- sequence 동안 Player Bark 없음
- 시스템 정보를 주인공이 요약하지 않음
- Terminal blue-white가 정보 focus
- Rope layer는 줄고 low facility hum / distant structure noise가 다시 전면
- worldPause 없음

### S5 — ROUTE OPEN

**Psychology:** `UNCERTAIN DIRECTION`

VERIFIED:
`SERVICE SHAFT 02 / ACCESS OPEN` — 1.2s

DESIGN LOCKED player bark:
`…일단 위로.`

Timing:
1. Gate physical state change
2. ACCESS OPEN system presentation
3. system reading 경쟁이 끝난 뒤 local Player Bark
4. control lock 없음

의미:
자신감이나 해결감이 아니라 **선택지가 적은 상태의 임시 결정**.

Exit emotion:
`불안하지만, 다음 행동은 있다.`

## 7. Dialogue contract

1-1 Player Bark total:
- S0: `뭐야…?`
- S5: `…일단 위로.`

그 외 text dialogue 없음.

Rules:
- System = objective facts
- Environment = evidence
- Player = reaction / temporary decision
- System text 반복 금지
- Rope 정답 선행 금지
- 고난도 입력 중 Bark 금지
- local-player scope
- worldPause false
- failure/retry 때 반복 spam 금지

## 8. Camera

Current five-zone structure 유지:
- `intro`: -176..0, desktop 1.25 / mobile 0.82
- `first-hook`: -352..-176, 1.20 / 0.80
- `release-corridor`: -608..-352, 1.10 / 0.76
- `open-swing`: -832..-608, 1.00 / 0.72
- `terminal`: -960..-832, 1.15 / 0.78

No forced cinematic pan.

Priority:
`PLAYER + NEXT ACTION + STORY OBJECT`

## 9. Light / audio master curve

`NORMAL HUM`
→ `FIRST RELAY / SHUTTER FAILURE`
→ `ROPE FOCUS`
→ `STRUCTURAL DISCOVERY`
→ `MOVEMENT RELIEF`
→ `TERMINAL SCALE REVEAL`
→ `GATE OPENS / UNCERTAINTY REMAINS`

Gameplay readability:
`Rope / Landing > Hazard/Enemy (none) > Story ambience > Decorative ambience`

## 10. Do not repeat / next-stage contrast

DO-NOT-REPEAT in 1-2:
- Terminal 3-step reveal as primary device
- straight service riser silhouette
- basic Attach tutorial
- Cable Overhang discovery as same teaching beat

1-2 contrast:
- `CROSSING HOIST / COUNTERWEIGHT`
- expected Lift physically fails
- Airborne Re-Attach becomes new movement problem
- Story through physical obstacle, not terminal exposition

## 11. Forbidden

- enemy of any kind
- contact damage
- Wind / Laser / Cutter
- Augment / Maintenance Node
- Key / Access Module
- mandatory Airborne Re-Attach
- full-stage reset on Rope failure
- conspiracy implication
- long log
- tutorial spam
- dedicated Anchor B
- generic success bark such as `좋아!`
- Player dialogue that explains Rope affordance
- full red apocalypse lighting

## 12. Source split

- `README.md` = WHY / PLAYER EXPERIENCE
- `AREA-SPEC.json` = WHERE / WHAT EXACTLY
- `DIRECTION-SPEC.json` = WHEN / HOW
- `RUNTIME-HANDOFF.md` = WHICH RUNTIME CODE
- `VALIDATION.md` = DID IT MATCH?
- `PRODUCTION-ALIGNMENT.md` = current Runtime mismatch/status
