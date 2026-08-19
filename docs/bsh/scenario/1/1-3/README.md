# SECTOR 01-3 — SECURITY CHECK — REV8.0

> **DESIGN LOCKED**
> Runtime audit baseline: `5ae6efca720720ee34f2a8b45daf1778fd206c1f`
> Bounds: `3840×1152` — KEEP
> Runtime status: `PARTIAL MATCH — ANNEX RE-AUTHOR REQUIRED`

## 1. One-line experience

정상 직원으로 정확히 인증된 정비기사가 위쪽으로 계속 이동하자,
정상 작동 중인 Security System이 Player를 `UNAUTHORIZED VERTICAL TRANSIT`으로 판정한다.
Player는 처음으로 Sentry Telegraph를 Rope 이동 자체로 회피하고,
Main Security Spine에서 깊은 Access Annex로 들어가 Access Module A를 얻을 수 있다.

Story meaning:
`고장난 설비보다 제대로 작동하는 보안이 더 불편하다.`

하지만 아직:
- 음모 확정
- 고의 사고
- 시스템 전체 진실
- 적대 대상/범죄자 확정

으로 해석하지 않는다.

Combat Requirement:
REQUIRED ACCESS CARRIER (SECTOR 3-OF-3)

## 2. Scale

Keep:
`3840×1152`

Why:
- Sector 01 최초의 거대한 횡방향 확장
- Main Spine과 Access Annex가 명확히 다른 기능 공간
- Carrier + 2 guards의 LOS geometry 필요
- Key 접근 ≥2 Rope decisions 필요
- Return path를 실제 거리로 체감해야 함
- 1-4의 compact emotional pocket과 강한 대비 필요

This width is intentionally asymmetric.
The left side is not filled symmetrically.

## 3. Spatial Signature

`VERTICAL SECURITY SPINE + HUGE ONE-SIDED ACCESS ANNEX`

Main Spine:
- Stage progression
- Scanner
- warning
- route violation
- exit denial / maintenance override

Access Annex:
- Access Module A acquisition
- 2 meaningful Rope commits
- Carrier + 2 guards
- static cover / LOS play
- return path

This is NOT a fake left/right choice.

## 4. Current Runtime contract retained

VERIFIED at baseline:
- bounds 3840×1152
- Entry `(-320,-32)`
- Scanner `(-96,-64)`
- Main A `(64,-224)`
- Main C `(-192,-736)`
- Access A `(448,-480)`
- Access B `(896,-544)`
- Access Carrier A
- 2 guards
- Cover LOS behavior
- 6 Camera zones
- Story sequence
- 2-of-3 Sector Access Module rule

Old Main B/D documentation is retired.
REV8 uses:
- Main A/C
- Annex Access A/B

## 5. Main Security Spine — REV8 target

Entry:
`(-320,-32)` KEEP

P0:
- center `(-144,0)`
- width 544

Scanner:
`(-96,-64)`

A:
`(+64,-224)`

P1 Warning Deck:
- center `(+256,-320)`
- W256

Security Junction:
- center `(+288,-480)`
- W256

R1:
- center `(+80,-592)`
- W256

Safe Ledge:
- center `(-240,-656)`
- W240

C:
`(-192,-752)`

Upper static Cover:
- around `(-32,-848)`
- static / solid / non-grappleable
- LOS blocker
- does NOT move

Upper Relief Deck:
- center `(+64,-896)`
- W320

Final Deck:
- center `(+192,-1027)`
- W320

## 6. Access Annex — REV8 target

### Access Rope Decision 1
Access A:
`(+512,-496)`

Mid Gantry:
- center `(+736,-560)`
- W192

### Access Rope Decision 2
Access B:
`(+960,-608)`

Arena Entry:
- center `(+1168,-640)`
- W224

The old 832px continuous walkable bridge is retired.
The bridge becomes segmented machinery framing / void.

### Arena
Main Floor:
- center `(+1536,-640)`
- W736
- approx x `+1168..+1904`

Upper Security Balcony:
- center `(+1512,-768)`
- W320

### Arena static Cover

Cover 1 — Security Console:
- around `(+1328,-640)`
- approx 72×112
- STATIC
- SOLID
- NON-GRAPPLEABLE
- NON-DAMAGING
- LOS BLOCKER

Cover 2 — Equipment / Power Rack:
- around `(+1600,-640)`
- approx 88×160
- STATIC
- SOLID
- NON-GRAPPLEABLE
- NON-DAMAGING
- LOS BLOCKER

Important:
these stand **on top of Arena Floor**.
They do not hang below the floor and they do not move.

Their different profiles prevent the Arena from reading as two identical vertical walls.

## 7. Access encounter

Exactly 3 enemy slots.

### Approach Guard
Target region:
`(+960,-576)`

Role:
- first readable Sentry telegraph near Junction/Annex approach
- teaches movement under Telegraph

### Upper Guard
Target:
`(+1512,-768)`

Role:
- elevated firing angle
- pressures landing / Cover relationship

### Access Carrier A
Target:
`(+1760,-640)`

Carries:
`sector-01:access-module:a`

Why:
- deepest meaningful point
- not on main route
- highest pressure around Key
- architecture + firing angles make the cost, not HP/count alone

Carrier defeat is not mandatory for Stage exit because Sector uses 2-of-3 modules.

## 8. Access return

After Carrier defeat:
`Carrier → Access B → Mid Gantry → Access A → Security Junction`

No teleport.

Mastered target:
`~12–20s` return after fight resolution.

## 9. Movement / Combat Signature

`READ TELEGRAPH → KEEP MOVING → ROPE THROUGH PRESSURE → BREAK LOS → REPOSITION`

No Dodge button.

The Rope movement is the dodge language.

Do not introduce:
- Wind
- moving platform
- laser
- Rope cutter
- grapple jammer
- augment
- new enemy family
- instant death

## 10. Psychology

Start:
- Fear ~67
- Control ~36
- Understanding ~22

Exit:
- Fear ~69
- Control ~43
- Understanding ~30

Arc:
`BRIEF RELIEF → CLASSIFICATION → CONFUSION → WARNING → THREAT → UNEASY ACCEPTANCE`

Player interprets:
`비상인데도 이 절차가 계속 적용되는 건가?`

Not:
`시스템이 일부러 사람을 버리고 있다.`

## 11. Dialogue

Player Bark total:
**1**

After Scanner two-step read:
`…신분은 맞는데.`

Status:
`NOT IMPLEMENTED — PLAYER BARK LAYER`

No Bark during:
- Final Warning
- Route Violation
- Sentry fight
- Carrier encounter
- Access Denied
- Override
- Violation Logged

## 12. Story sequence

### S0 Employee Scan — VERIFIED
1. `EMPLOYEE VERIFIED / VERTICAL MAINTENANCE`
2. `ASSIGNED SECTOR / LOWER MAINTENANCE`

### S1 Warning — VERIFIED
`RETURN TO ASSIGNED SECTOR / FINAL WARNING`

### S2 Violation — VERIFIED
1. `ROUTE VIOLATION / DETECTED`
2. `UNAUTHORIZED / VERTICAL TRANSIT`

### S3 Annex
No Story Toast.
Sentry/LOS/Cover/Carrier provide the system expression.

### S4 Return
No Story Toast.
No Player dialogue.

### S5 Exit Denial — VERIFIED
`ACCESS DENIED / RETURN TO ASSIGNED SECTOR`

### S6 Override / Gate — VERIFIED
`MAINTENANCE / OVERRIDE`
→
`VIOLATION / LOGGED`

## 13. Camera

C01 Identification:
- 0..-224
- Scanner + Player + A
- desktop ~1.15

C02 Warning:
- -224..-416
- P1 + Annex hint
- ~1.00

C03 Turret Reveal:
- -416..-544
- Junction + Access A + Approach Guard
- ~0.94

C04 Annex Combat:
- -544..-800
- horizontal Player follow
- ~0.84–0.88
- show next Anchor + current pressure, not whole Annex

C05 Relief:
- -800..-944
- tighter Main Spine frame
- ~1.00

C06 Exit:
- -944..-1152
- Panel + Gate
- ~1.15

No forced cinematic pan.

## 14. Atmosphere

1-2:
dead machinery / absent motor

1-3:
clean active security electronics

Audio:
- scanner beep
- acquire
- track
- lock
- fire
- cooldown
- Cover breaking LOS should stop aiming layer
- denial beep
- maintenance override
- violation log

Lighting:
- Maintenance white baseline
- clean Scanner cyan/white
- local enemy telegraph red/orange only
- no full-screen red wash

## 15. Pacing

Mainline only:
- First clear `1:15–1:45`
- Mastered `0:45–1:05`

Access A retrieval:
- First clear `2:10–3:00`
- Mastered `1:15–1:45`

Redesign if:
- flat walking dominates Annex
- Carrier can be engaged from Junction
- Access requires fewer than 2 Rope decisions
- solved return >25s
- first Sentry shot arrives before readable telegraph

## 16. Gate results

MAP SCALE / WORLD FOOTPRINT:
PASS

MAP SIMILARITY:
PASS

OBSTACLE FUNCTION:
PASS — `ENEMY LOS PRESSURE + ACCESS OBJECTIVE`

LENGTH / PACING:
HYPOTHESIS PASS — PLAYTEST REQUIRED

CURRENT GITHUB RUNTIME:
PARTIAL MATCH — bounds/core systems useful, Annex re-author required
