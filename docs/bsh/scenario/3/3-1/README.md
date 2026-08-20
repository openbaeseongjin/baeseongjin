# ONE ROPE — SECTOR 03-1 LOWER MARKET PROMENADE — REV8 STAGE DRAFT REV3

> Status: DESIGN LOCKED  
> Runtime audit baseline: `c1f9cd7f0362de7f7a3065a34e7ea9d35927a934`  
> Sector 03 Master Plan: REV3  
> Previous REV2 `2816×960`: **HOLD / SUPERSEDED — TOO REPETITIVE**  
> Proposed REV3: **`3072×1088`**  
> Spatial Signature: **PANORAMIC MARKET VOID / SUSPENDED MARKET ISLAND ARCH**  
> Dominant body: **`LOW LEFT → LONG UP-RIGHT → HIGH CENTRAL ISLAND → LONG DOWN-RIGHT → SHORT SERVICE LIFT`**  
> Stage role: **SECTOR 03 OPENING / SCALE REVEAL / POWERED DAILY-LIFE CONTRAST**  
> Full package: CREATED — REV8.0 GITHUB-READY

---

# 0. REV3 수정 이유

REV2의 문제:

```text
TERRACE
→ VOID A
→ TERRACE
→ VOID B
→ TERRACE
```

이 구조는 규모는 커졌지만 Player movement가 기존 Sector의:

- 긴 수평 Bridge
- 긴 Courtyard Rim
- Long Walkway

와 비슷하게 읽힐 수 있었다.

Sector 03 첫 Stage는 단순히 “더 긴 길”이면 안 된다.

REV3는 하나의 거대한 Market 공간을 중심으로 한다.

> **ONE HUGE VOID + ONE SUSPENDED MARKET ISLAND**

Player는 같은 공간을:

1. 아래에서 올려다보고
2. 중앙 Island 위에서 전체를 내려다보고
3. 반대편으로 내려가며 다시 읽는다.

즉 공간 자체가 Stage의 주인공이다.

---

# 1. LATEST RUNTIME CONTRACT

Current 3-1 authority:

- `sector-03-01`
- Runtime name `POWERED PROMENADE`
- subtitle `COMMERCIAL THRESHOLD`
- current bounds `1280×1088`
- `district-sign`
- `welcome-kiosk`
- exactly one `promenade-guard`
- Standard Pool
- Scanner Groups NONE
- Patrol NONE
- no Wind
- no Rope Cut
- final deck → exit panel → physical crossing
- next `sector-03-02`

REV3 keeps those system/story contracts and re-authors scale/topology.

---

# 2. SCALE

Target:

> **`3072×1088`**

Local:

- X `-1536..+1536`
- Y `0..-1088`

Actual Player traversal:

approximately:

`X -1392 → +1450`

= **~2840px lateral travel**

Height variation:

approximately:

`0 → -544 → -416 → -800`

The expanded space is actually used.

---

# 3. NEW SPATIAL SIGNATURE

## PANORAMIC MARKET VOID / SUSPENDED MARKET ISLAND ARCH

```text
Y -1088

                                                     EXIT → 3-2
                                                        █████
                                                           ▲
                                                        G4 ●
                                                          /
                                       LATE GUARD     ███████
                                                     P3
                                                  ↙
                                               G3 ●
                                            ↙
                         █████████████████
                         SUSPENDED MARKET ISLAND
                         DISTRICT / KIOSK
                                 ▲
                              G2 ●
                            ↗
                         ↗
              ███████████
              LEFT MARKET TERRACE
                   ▲
                G1 ●
              ↗
ENTRY █████

Y 0
```

Overall body:

> **`↗ BIG ASCENT ARC → CENTRAL HIGH ISLAND → ↘ BIG DESCENT ARC → ↗ SHORT EXIT LIFT`**

이 Stage는 수평 Corridor가 아니다.

---

# 4. ARCHITECTURAL CAUSALITY

Lower Market는 하나의 거대한 Commercial Concourse Void를 가진다.

중앙에는:

> **Suspended Market Island / Hanging Concourse**

가 존재한다.

평상시:

- skybridge
- escalator
- balcony
- suspended concourse

등으로 접근했지만 사고로 연결부가 끊겼다.

남은 Maintenance / Canopy structural joint를 Rope가 사용한다.

따라서 Player route는:

```text
LEFT MARKET EDGE
→ SUSPENDED CENTRAL ISLAND
→ RIGHT MARKET EDGE
```

이다.

Floating platform chain가 아니라
실제 public-commercial architecture를 통과한다.

---

# 5. ENTRY

Entry:

`(-1392,-32)`

P0:

- X `-1504..-1280`
- W224
- Y `0`

First G1:

`(-1184,-192)`

Entry edge → G1:

~205px class.

No challenge.

첫 Frame에서 보여줘야 하는 것:

- 큰 중앙 Void
- 높은 곳에 떠 있는 Market Island
- 오른쪽 먼 Terrace는 부분적으로만 보임
- Exit는 보이지 않음

---

# 6. DIALOGUE BEAT A — SECTOR ENTRY

P1에 올라온 직후.

Environment first:

- lights
- storefront standby
- powered ventilation
- signage

그다음 Player:

> **`…여긴 아직 불이 들어와 있어.`**

이게 Sector 03의 첫 Character line.

목적:

- Sector 시작 감정 표시
- Worker District와 즉각 비교
- 설명하지 않음
- 단순한 물리적 놀람

Status:

**NOT IMPLEMENTED — PLAYER BARK LAYER**

---

# 7. LEFT MARKET TERRACE / DISTRICT SIGN

P1:

- X `-1248..-864`
- W384
- Y `-224`

Stable Story Object:

`sector-03-01:district-sign`

Current copy:

```text
COMMERCIAL DISTRICT
PROMENADE 06
```

이 Text는 유지.

P1은 완전 Safe.

---

# 8. GRAND VOID ASCENT → CENTRAL ISLAND

P1 right edge:

`X -864`

G2:

`(-640,-416)`

Central Island left edge:

`X -384`

Island deck:

- X `-384..+128`
- W512
- Y `-544`

Relations:

P1 edge → G2:

~295px

G2 → Island edge:

~286px

Visually:

Player는 큰 Void를 약 **480px 높이 상승**하며 중앙 Island로 올라간다.

Mechanically:

Hook relation은 normal.

이게 Sector-scale rule:

> **Large Architecture ≠ Max Reach Fishing**

---

# 9. CENTRAL SUSPENDED MARKET ISLAND

P2:

- X `-384..+128`
- W512
- Y `-544`

이 Stage의 중심.

Player가 충분히 걸을 수 있는 큰 안전 Island.

여기서 Camera / composition은:

- 방금 건너온 Left Market
- 아래 여러 commercial floor depth
- 앞으로 내려갈 Right Market
- powered signage

를 한 번에 느끼게 한다.

하지만 Stage 전체를 한 화면에 넣지는 않는다.

Enemy 0.

Scanner 0.

---

# 10. WELCOME KIOSK

Stable Story Object:

`sector-03-01:welcome-kiosk`

Central Island에 배치.

Current copy:

```text
WELCOME
PUBLIC SERVICE ONLINE
```

Ordinary kiosk chime.

Horror alarm 금지.

---

# 11. DIALOGUE BEAT B — RECOGNITION

Kiosk가 정상 작동하는 것을 본 뒤:

> **`사람은 없는데… 기계들만 계속 일하고 있네.`**

Beat A:

> 불이 들어와 있다.

Beat B:

> 사람은 없는데 시스템은 계속 일한다.

따라서 감정이:

```text
SURPRISE
→
RECOGNITION
```

으로 발전한다.

아직:

```text
WHY?
WHO?
PRIORITY?
```

로 가지 않는다.

Status:

**NOT IMPLEMENTED — PLAYER BARK LAYER**

---

# 12. CENTRAL ISLAND → RIGHT MARKET DESCENT ARC

Island right edge:

`X +128`

G3:

`(+416,-640)`

Right Market left edge:

`X +704`

P3:

- X `+704..+1088`
- W384
- Y `-416`

Relations:

Island edge → G3:

~304px

G3 → P3 edge:

~363px

Movement:

> **high central Island → long down-right swing → lower right Market**

이 Descending Rope arc가 3-1의 두 번째 signature movement다.

중요:

- controlled vertical Drop 아님
- maintenance bypass 아님
- lower recovery loop 아님

한 번의 큰 forward swing이다.

---

# 13. RECOVERY

## Recovery A

under Left→Island ascent.

Approx:

`(-576,-176)`

W256.

Retry:
`3–5s`

## Recovery B

under Island→Right descent.

Approx:

`(+384,-304)`

W256.

Retry:
`3–5s`

Recovery에서 Story Island / Right Terrace를 걸어서 bypass 불가.

---

# 14. RIGHT MARKET TERRACE / SINGLE LATE GUARD

P3:

`+704..+1088`
Y `-416`

Only now:

`promenade-guard`

activates.

Target:

around:

`(+944,-416)`

Authority:

`SECTOR_03_STANDARD_POOL`

Current possible types:

- pursuit
- shield
- artillery

Rules:

- exactly 1 slot
- no Patrol
- kill optional
- no Rope Cut
- no kill gate
- cannot pressure Left Terrace
- cannot pressure Central Story Island
- activation only after Player lands on Right Market

This keeps:

> **roughly first 75–80% Stage = no enemy pressure**

---

# 15. FINAL SERVICE LIFT

G4:

`(+1184,-672)`

Exit Deck:

- X `+1152..+1472`
- W320
- Y `-800`

P3 → G4:

~280px class.

G4 → Exit:

comfort.

Purpose:

> Lower Market public space → Facade Service Gallery.

Scanner remains OFF.

At final art level:
one inactive Service Mount housing may appear.

No active cycle.

---

# 16. PLAYER EXPERIENCE

The five remembered moments should be:

1. **새 Sector에 들어오자 공간이 갑자기 커진다.**
2. **아직 불이 켜져 있다는 것을 알아차린다.**
3. **거대한 Void 위 중앙 Hanging Market Island로 올라간다.**
4. **사람은 없는데 Kiosk와 기계가 계속 일한다.**
5. **반대편 Market으로 길게 내려간 뒤 처음으로 Security 1기를 만난다.**

If Player remembers:

> `긴 플랫폼 두 번 건넌 Stage`

REDESIGN.

---

# 17. DIALOGUE MASTER

## Bark A

Trigger:

first powered-safe terrace after Sector entry.

Text:

> **`…여긴 아직 불이 들어와 있어.`**

Purpose:

physical surprise.

## Bark B

Trigger:

after `WELCOME / PUBLIC SERVICE ONLINE`.

Text:

> **`사람은 없는데… 기계들만 계속 일하고 있네.`**

Purpose:

emotional recognition.

No third Bark.

No tutorial speech.

No Scanner mention.

---

# 18. STORY FUNCTION

Sector 02 question:

> 왜 C만 멈췄지?

3-1 new evidence:

> 이곳의 생활 서비스는 더 많이 살아 있다.

3-1 does NOT conclude:

- 상층부는 사고 피해가 없었다
- Priority 대상은 이곳 주민이었다
- Group A/B가 이곳에 살았다
- Group C는 Worker였기 때문에 중단됐다

Story progression:

```text
DIFFERENCE IN EVACUATION
+
DIFFERENCE IN SURVIVING INFRASTRUCTURE

but

NO CAUSAL LINK YET
```

---

# 19. MAP SIMILARITY

## vs 2-2

2-2:
single horizontal Patrol walkway.

3-1:
large arch-shaped two-height Market crossing,
no Patrol,
central hanging Island.

PASS.

## vs 2-6

2-6:
short vertical → hard 90° turn → long rim.

3-1:
long up-right → high Island → long down-right.

PASS.

## vs 2-8

2-8:
Dead Lip → controlled Drop → lower Ring → relaunch upper opposite Arm.

3-1:
smooth ascent to high central Island → smooth forward descent.

Overlap:
large central landmark / elevation change.

Meaningful overlap = 1.

PASS.

## vs 1-5

1-5:
Horseshoe / drop-through / low test slot / return.

3-1:
no loop, no return, no low test slot.

PASS.

## vs 1-6

1-6:
wide open horizontal Plenum + Wind.

3-1:
arched commercial Void traversal,
large central collision Island,
no Wind.

Overlap:
large open space only.

PASS.

## vs 1-7

1-7:
enclosed multi-turn S curve.

3-1:
one arch with no reversal.

PASS.

## vs planned 3-3

3-3 owns:
Half-Orbit Retail Balcony around Central Atrium.

3-1 does NOT orbit a Void.

It crosses straight through one:
Left edge → central Island → right edge.

PASS.

Maximum meaningful overlap:
**1**

---

# 20. OBSTACLE FUNCTION

Primary obstacle:

> **BROKEN ACCESS TO A SUSPENDED MARKET CONCOURSE**

Architectural cause:

- central Market Island originally connected by public bridge/escalator
- those links are damaged
- overhead maintenance joints remain
- Rope reaches Island
- opposite public connection is also damaged

Therefore:

```text
LEFT PUBLIC TERRACE
→ Rope
→ CENTRAL PUBLIC ISLAND
→ Rope
→ RIGHT PUBLIC TERRACE
```

The map topology comes from real Commercial circulation damage.

PASS.

---

# 21. SCALE GATE

Target:

`3072×1088`

Meaningful traversal width:

~2840px.

One central Void composition uses most of Stage width.

No repeated identical 600px gaps.

No empty filler rooms.

No Player-visible full map from Entry.

PASS.

---

# 22. PACING

First play:

**1:50–2:30**

Mastered:

**0:55–1:20**

Dialogue / observation included.

Difficulty:

★★

REDESIGN if:

- Central Island feels like just another small platform
- Right descent reads like 2-8 Drop
- Guard fires into Story Island
- Player sees Exit from Entry
- Bark B sounds like exposition rather than observation
- Stage reads as a horizontal bridge
- Stage mastered path consistently >1:30
- mobile Camera cannot read G3 + Right Market landing

---

# 23. CURRENT RUNTIME GATE

## KEEP

- source Area ID
- current Story stable IDs
- exact Story copy
- 1 pooled Guard slot
- Standard Pool
- Scanner OFF
- Patrol OFF
- Wind OFF
- no Rope Cut
- exit objective / panel / physical crossing
- nextArea 3-2

## RE-AUTHOR

- name → `LOWER MARKET PROMENADE`
- bounds `1280×1088 → 3072×1088`
- vertical compact climb → panoramic arch crossing
- Grapple layout
- recovery
- Story positions
- Guard activation
- Exit position

## STALE

Old `Threat NONE`.

Actual Runtime:
one pooled Guard.

REV3:
one late Guard.

---

# 24. FIVE GATES

MAP SCALE:
**PASS**

MAP SIMILARITY:
**PASS**

OBSTACLE FUNCTION:
**PASS**

STAGE LENGTH / PACING:
**HYPOTHESIS PASS**

CURRENT RUNTIME:
**1 SLOT + 2 STORY OBJECTS + SCANNER OFF + EXIT CONTRACT MATCH / MAJOR TOPOLOGY RE-AUTHOR**

---

# 25. STATUS

```text
REV2
HOLD / SUPERSEDED

REV3
3072×1088
PANORAMIC MARKET VOID
SUSPENDED MARKET ISLAND ARCH
TWO PLAYER DIALOGUE BEATS

USER APPROVED / DESIGN LOCKED
```


---

# 26. PACKAGING-TIME RE-AUDIT

Final packaging baseline:

`c1f9cd7f0362de7f7a3065a34e7ea9d35927a934`

Verified against latest `main`:

- `sector-03-01` still exists as current Runtime source area
- current Runtime name remains `POWERED PROMENADE`
- current subtitle remains `COMMERCIAL THRESHOLD`
- current bounds remain `1280×1088`
- current Story object IDs remain:
  - `sector-03-01:district-sign`
  - `sector-03-01:welcome-kiosk`
- current Story Presentation binds:
  - `COMMERCIAL DISTRICT / PROMENADE 06`
  - `WELCOME / PUBLIC SERVICE ONLINE`
- current enemy remains exactly one pooled sentry:
  - `sector-03-01:promenade-guard`
  - `SECTOR_03_STANDARD_POOL`
- current Standard Pool remains:
  - `pursuit-drone-t1`
  - `shield-drone-t1`
  - `artillery-drone-t1`
- current Scanner Groups remain absent
- current Patrol Drone remains absent
- current Exit contract remains:
  `final deck reached → exit panel engaged → physical crossing`
- nextArea remains `sector-03-02`

Player Bark layer remains separate from current System Story presentation and is not treated as implemented.

Therefore the approved REV3 topology remains valid as REV8.0 final planning authority.
