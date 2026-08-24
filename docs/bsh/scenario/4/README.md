# SECTOR 04 — UPPER RESIDENTIAL / AMENITY DISTRICT
## MASTER PLAN REV 1.0 — PRIVILEGE IS PROTECTED

> **CURRENT RUNTIME ENEMY DENSITY — 0.68.0:** 각 Stage는 4개 slot을 사용한다. 아래 authored snapshot의 exact enemy count는 대체되며 기존 Patrol/Pursuit/Cutter 분리와 현재 권위는 [`../../../enemy-density-composition.md`](../../../enemy-density-composition.md)를 따른다.

> **Status**
>
> - Sector Identity / Theme: **DESIGN DIRECTION LOCKED**
> - Resident Security Override 2-of-3: **DESIGN LOCKED**
> - 4-1~4-8 Stage breakdown / names / exact topology: **AUTHORED PACKAGE MERGED — individual Runtime migration approval required**
> - Sector04 Runtime: **GENERATED / PLAYABLE — 4-1..4-8**
> - Runtime authority: canonical `AREA-SPEC.v2.json` + `AREA-CATALOG.sector04.json`
> - Authoring snapshot: `cb4f690ac180a04868322e9c4cfe1384897c348b`
> - Stage Direction Runtime v1: **VERIFIED AVAILABLE**
> - Post-Sector03 transition → Sector04 entry: **DIRECT AUTHORED PORTAL — 3-8 → 4-1**

## Runtime promotion reconciliation

| Stage | Runtime bounds | Result |
|---|---:|---|
| 4-1 | 4992×2208 | Editor geometry retained over the older 4992×2112 design bound. |
| 4-2 | 4480×2112 | Editor and design agree. |
| 4-3 | 5376×2432 | Editor and design agree. |
| 4-4 | 5376×2400 | Editor geometry retained over the older 5376×2240 design bound. |
| 4-5 | 5376×2432 | Editor and design agree. |
| 4-6 | 5120×2656 | Editor geometry retained over the older 5120×2560 design bound. |
| 4-7 | 5440×3072 | Editor geometry retained; duplicated distance/recovery imports were removed. |
| 4-8 | 3328×2976 | Editor geometry retained; under-quorum return is separate from final control. |

Only 4-1→…→4-8 is connected. 4-8 remains a content boundary; Sector03 and Sector05 transitions are not authored here.

---

# 0. MASTER DECISION

## Sector Name

```text
SECTOR 04
UPPER RESIDENTIAL / AMENITY DISTRICT
```

## Theme

> **PRIVILEGE IS PROTECTED.**<br>
> **특권은 보호된다.**

## Player-facing Story Question

Sector03 ends with:

```text
GROUP C
TRANSFER SUSPENDED

vs

PRIORITY ROUTE
ACTIVE
```

Sector04 asks:

> **“그 우선 이동이 연결된 상층은 실제로 어떤 곳이었나?”**

그리고 플레이어는 점점 다음 사실을 보게 된다.

```text
아래쪽에서는 이동이 멈췄다.

그런데 상층의 주거·편의·피난 공간은
전력도,
환경도,
동선도,
경비도
계속 유지되고 있었다.
```

Sector04는 아직 다음을 확정하지 않는다.

```text
누가 이런 우선순위를 결정했는가?
왜 Group C가 멈췄는가?
Priority Route 이용자는 누구였는가?
상층을 유지하기 위해 하층을 희생했는가?
```

그 결정 구조의 진실은 Sector05 `CONTINUITY CONTROL`로 넘긴다.

---

# 1. WORLD CONTINUITY

전체 공간 대비:

```text
SECTOR 01
MAINTENANCE / FACILITY
설비와 유지보수

↓

SECTOR 02
WORKER DISTRICT
노동자의 생활권과 대피

↓

SECTOR 03
CENTRAL EXCHANGE
상업 / 공공 / 환승 / 우선 통로

↓

SECTOR 04
UPPER RESIDENTIAL / AMENITY
상층 주거 / 편의 / 보호 / 피난

↓

SECTOR 05
CONTINUITY CONTROL
무엇을 계속 유지할지 결정하는 곳

↓

SECTOR 06
ROOFTOP / EVACUATION
최종 탈출
```

Sector04는 설비 공간이 아니다.

Sector04는:

```text
사람이 살던 곳
+
상층 주민을 위한 편의시설
+
조경과 휴게 공간
+
사유화된 이동공간
+
상층 대피·피난 시설
+
이를 보호하는 강한 경비
```

다.

---

# 2. LEGACY SECTOR04 RETIREMENT

현재 GitHub에는 과거 Sector04가 다음 이름으로 남아 있다.

```text
TRANSIT INTAKE
CUTTER LINE
FREIGHT BYPASS
INFRASTRUCTURE SERVICE NODE
EXPRESS SHAFT
POWER RELAY SPAN
ISOLATION JUNCTION
TRANSIT CONTROL TRUNK
```

standalone `Sector04AreaCatalog`는 과거 실행 코드였지만 현재는 삭제되었다.

하지만 새 Sector04 Authoring에서는 이것을:

> **LEGACY / SUPERSEDED**

로 취급한다.

## 재사용 가능한 것

공간 정체성은 폐기하지만 이미 구현된 Runtime capability는 재사용할 수 있다.

```text
Patrol
Pursuit
Standard projectile
Cutter Fire
Wind
Camera Zone
Story Presentation
Stage Direction Runtime
```

## 재사용하지 않는 것

```text
Transit Shaft fantasy
Freight fantasy
Power Relay fantasy
Infrastructure Backbone story
Lower Ascent Feeder story
Express Trunk story
Sector04 = Transit identity
```

이 내용은 새 Sector04의 세계관 권위가 아니다.

---

# 3. SECTOR FANTASY

Sector04의 첫 인상은:

> **“도시는 무너지고 있는데, 여긴 아직 너무 멀쩡하다.”**

Player가 Sector03의 상업·환승 공간을 지나 위로 올라왔을 때 환경이 다시 크게 바뀌어야 한다.

## Visual / Spatial Keywords

```text
UPPER RESIDENCE
PRIVATE COURTYARD
SKY GARDEN
AMENITY LOUNGE
INDOOR GARDEN
POOL / WELLNESS DECK
RESIDENTIAL SKYBRIDGE
PRIVATE LIFT LOBBY
REFUGE GALLERY
REFUGE TERRACE
PROTECTED ASCENT
```

## 공간 감정

```text
CLEAN
QUIET
SPACIOUS
LANDSCAPED
WELL-MAINTAINED
PRIVATE
PROTECTED
UNNATURALLY NORMAL
```

폐허처럼 보이면 안 된다.

오히려:

```text
비상사태가 벌어졌는데도
이곳은 정상적으로 유지되는 느낌
```

이 중요하다.

---

# 4. CORE GAMEPLAY IDENTITY

## Sector04 Question

> **“발견되기 전에 통과할 것인가, 발견된 뒤에도 추격을 끊지 않고 도망칠 수 있는가?”**

Core:

```text
PATROL READ
→ ENTER PROTECTED SPACE
→ DETECTION
→ PERSISTENT PURSUIT
→ USE ROPE TO BREAK LINE / CHANGE HEIGHT / CROSS VOID
→ SAFE RE-READ
→ CONTINUE
```

Sector03:

```text
환경 상태를 읽고
붙는 타이밍을 결정한다.
```

Sector04:

```text
움직이는 경비의 위치를 읽고
발견된 뒤에도 이동을 멈추지 않는다.
```

---

# 5. PERSISTENT PURSUIT

Sector04의 대표 Security는 **이동형 경비**다.

## 역할

경비가 단순히 한 방 쏘고 끝나는 것이 아니라:

```text
PATROL
→ PLAYER DETECTED
→ PURSUIT
→ PLAYER CHANGES ELEVATION / ROUTE
→ SECURITY FOLLOWS WITHIN AUTHORED LIMIT
→ PLAYER BREAKS CONTACT
```

라는 긴 압력을 만든다.

## 중요한 제한

Persistent Pursuit는:

```text
Sector 전체를 무한 추적
```

이 아니다.

각 Pursuit actor에는 반드시:

```text
AUTHORED PURSUIT TERRITORY
+
DROP-OFF / RETURN RULE
```

이 필요하다.

목표:

> 쫓기는 느낌은 강하게,<br>
> Stage 전체가 영구 전투 상태가 되는 것은 방지.

---

# 6. SECURITY ROSTER

## PRIMARY

### PURSUIT DRONE

Sector04 대표 actor.

Role:

```text
CHASE / ROUTE PRESSURE
```

Player가 Rope로 높이를 바꾸고, Void를 넘고, 건축물 뒤로 들어가고, 다른 층으로 빠져나가는 이유를 만든다.

### PATROL DRONE

Role:

```text
DETECTION TIMING
```

Pursuit가 시작되기 전의 읽기 단계.

Patrol route는 Stage마다 형태가 달라야 한다.

```text
horizontal sweep
vertical balcony loop
courtyard orbit
skybridge shuttle
terrace perimeter
figure-eight / return loop
```

Runtime이 실제 지원하는 Patrol movement 범위 안에서만 작성한다.

## SECONDARY

### STANDARD SENTRY

정적 보호 지점에 제한적으로 사용.

Good:
- private gate
- resident control booth
- refuge checkpoint

Bad:
- Stage 전체를 Sentry gallery로 만드는 것.

### CUTTER — LATE SECTOR SECONDARY

Cutter는 Sector04의 정체성이 아니다.

하지만 Sector05가 Cutter를 tutorial 없이 재사용하려면 Sector04 후반부에서 한 번 이상 명확하게 학습될 수 있다.

권장:

```text
4-6 or 4-7
```

에서 Pursuit와 최초부터 겹치지 않는 짧고 공정한 Rope-Cut Encounter로 소개.

Cutter의 핵심은:

```text
CURRENT ROPE INTERRUPTED
→ NEXT RECOVERY ATTACH
```

이다.

## RESERVED FOR SECTOR05

Sector04에서 Core로 사용하지 않는다.

```text
AEGIS
HARDPOINT JAMMER
ARTILLERY
```

이 셋은 Sector05의 `CONTROLLED COMMITMENT`를 위해 남긴다.

---

# 7. SECURITY DESIGN PHILOSOPHY

Sector04 Security는:

> **상층 주민을 보호하기 위해 존재하는 시스템**

처럼 보여야 한다.

즉 플레이어가 침입자가 되어 버린 느낌이 중요하다.

Player에게 직접 `EVIL SECURITY`라고 설명하지 않는다.

대신:

```text
RESIDENTIAL PATROL ACTIVE
PRIVATE COURTYARD SECURED
REFUGE ACCESS MONITORED
PROTECTED ASCENT CONTROL
```

같은 정상적인 운영 문구가 나온다.

불편함의 원인은:

> 아래에서는 대피가 멈췄는데 이곳의 보호 시스템은 너무 정상적으로 작동하고 있다는 점.

---

# 8. RESIDENT SECURITY OVERRIDE — 2 OF 3

## Status

> **DESIGN LOCKED / RUNTIME NOT IMPLEMENTED**

Sector04에는 세 개의 Resident Security Override source가 있다.

```text
4-2 COURTYARD
Override A

4-5 AMENITY ATRIUM
Override B

4-7 REFUGE TERRACE
Override C
```

하지만 다음 Sector 경계를 열기 위해 필요한 것은:

```text
2 / 3
```

이다.

## Why 2-of-3

Sector01~03의 `3-of-3 전부 회수`와 다른 선택감을 준다.

Player는:

```text
어떤 위험 구간을 뚫을 것인가
어떤 Override를 생략할 것인가
현재 Build가 어떤 Route에 유리한가
```

를 선택할 수 있다.

Override는 Augment나 새 Rope 능력이 아니다. Sector-local security progression key다.

## 4-8

4-8에서는 새 Override를 주지 않는다.

```text
CURRENT OVERRIDES
2 / 3 OR 3 / 3
↓
QUORUM ACCEPTED
↓
FINAL PROTECTED ROUTE OPEN
```

## Runtime Warning

현재 Sector01~03 Access progression은 3-of-3 계약이다.

Sector04의 2-of-3는 **새 Runtime authoring/progression 계약이 필요하다.**

구현 전 반드시:
- Sector progression validator
- HUD
- unlock scene
- multiplayer shared state
- reconnect persistence

를 2-of-3에 맞춰 검증해야 한다.

---

# 9. AUGMENT CONTRACT

Current Augment v1:

```text
1-4
2-3
3-5
```

명시적 Node source를 사용한다.

Sector04 Master는 자동으로 새 Augment Node를 생성하지 않는다.

```text
CURRENT BUILD PERSISTS
NEW SECTOR04 AUGMENT SOURCE = NONE
```

Stage별 별도 Design Decision이 생기기 전까지 이 상태를 유지한다.

Mandatory Base Rope clear는 항상 가능해야 한다.

---

# 10. STORY DISCLOSURE RULE

Sector04는 **보호의 존재**를 보여주는 Sector다.

Sector05는 **보호를 결정한 구조**를 보여주는 Sector다.

따라서 Sector04에서 금지:

```text
CORPORATE ORDER CAUSED C
GROUP C WAS SACRIFICED
RESIDENT CLASS TOOK C CAPACITY
PRIORITY ROUTE WAS FOR THE RICH
EXECUTIVE AUTHORIZATION
CONTINUITY DECISION
```

Sector04에서 허용:

```text
상층 생활환경은 계속 유지됨
상층 전용 동선이 존재함
상층 Security가 강하게 유지됨
상층 Refuge가 별도로 보호됨
```

Player가 느끼는 것:

> **“같은 사고를 겪고 있는데, 이곳의 조건은 아래와 완전히 다르다.”**

---

# 11. STORY ARC

## 4-1 — CONTRAST

첫 상층 주거 공간.

```text
UPPER RESIDENTIAL DISTRICT
ENVIRONMENTAL SERVICE / NORMAL
RESIDENTIAL SECURITY / ACTIVE
```

Story function:

> **“여긴 왜 이렇게 멀쩡하지?”**

아직 Override 없음.

## 4-2 — PROTECTION

Resident Courtyard.

첫 Resident Security Override.

환경:
- private garden
- protected courtyard
- controlled entrance

Player realizes:

> 이곳의 Security는 사고 대응 임시조치가 아니라 원래부터 생활공간에 깊게 들어가 있었다.

Override A.

## 4-3 — PURSUIT

Residential Skybridge.

첫 본격 Persistent Pursuit.

Story보다 Gameplay 우선.

Player learns:

> 상층 Security는 한 자리에 서 있는 것이 아니라 공간을 따라 움직이며 침입자를 쫓는다.

## 4-4 — NORMALITY

Private Amenity Gardens / Leisure Deck.

Threat를 낮춘다.

```text
LIGHTING / NORMAL
CLIMATE / NORMAL
WATER SERVICE / NORMAL
AMENITY SERVICE / AVAILABLE
```

중요:

> 위기는 도시 전체를 똑같이 멈추게 하지 않았다.

왜 유지됐는지는 아직 설명하지 않는다.

## 4-5 — PRIVILEGE

Amenity Atrium.

상층의 큰 생활 편의공간.

Override B.

Story function:

> **“이 정도 공간까지 계속 보호되고 있었어?”**

Pool / garden / lounge / recreation 등 상층 주민을 위한 공간이 Emergency 상황에서도 유지되고 있음.

## 4-6 — REFUGE APPROACH

Refuge Access Gallery.

Residential leisure → evacuation/refuge로 분위기 이동.

Security 강도 증가.

후반부 Secondary Cutter tutorial을 넣는다면 이 Stage가 1순위 후보.

Story:

```text
RESIDENT REFUGE ROUTE
ACTIVE
```

하지만 Group C와 직접 연결하지 않는다. Priority Route 사용자도 밝히지 않는다.

## 4-7 — REFUGE SECURITY

Refuge Terrace.

Sector04 최대 Security pressure 전초전.

Override C.

```text
UPPER REFUGE
SECURITY ACTIVE

PROTECTED ASCENT
AVAILABLE
```

Story function:

> 주거와 편의만 보호된 것이 아니라 **피난 경로 자체도 별도의 Security 아래 보호되고 있었다.**

## 4-8 — PROTECTED ASCENT

Sector04 General Finale.

새 Override 없음.

Entry:

```text
RESIDENT SECURITY OVERRIDE
2 / 3 REQUIRED
```

Quorum met:

```text
OVERRIDE QUORUM
ACCEPTED

PROTECTED ASCENT
OPEN
```

Final Story should juxtapose:

```text
Sector03 memory:
GROUP C
TRANSFER SUSPENDED

Current Sector04:
UPPER REFUGE ROUTE
ACTIVE
```

직접 인과선은 그리지 않는다.

Candidate Player Bark:

> **`…아래는 멈췄는데, 여긴 계속 지켜지고 있었네.`**

Status: **CANDIDATE — Stage 4-8 approval 때 확정**

Sector ending question:

> **“누가 이곳을 이렇게까지 계속 보호한 거지?”**

This hands off to Sector05:

```text
CONTINUITY CONTROL
THE SYSTEM CHOOSES WHAT CONTINUES
```

---

# 12. STAGE MASTER TABLE

| Stage | Working Name | Space | Gameplay Role | Security | Override | Story Emotion |
|---|---|---|---|---|---|---|
| 4-1 | **UPPER RESIDENTIAL ARRIVAL** | Upper Residence Entry / Garden Lobby | Sector contrast + Patrol read | Patrol ×1 candidate | — | CONTRAST |
| 4-2 | **RESIDENT COURTYARD** | Private Courtyard / Garden Ring | Patrol + local pursuit / first choice key | Patrol + Pursuit | **A** | PROTECTION |
| 4-3 | **RESIDENTIAL SKYBRIDGE** | Multi-level residential bridge network | First full Persistent Pursuit | Pursuit core | — | PRESSURE |
| 4-4 | **PRIVATE AMENITY GARDENS** | Landscaped leisure / wellness deck | low-pressure story read | none or distant Patrol only | — | NORMALITY |
| 4-5 | **AMENITY ATRIUM** | large resident amenity complex | pursuit around open public-private void | Pursuit + Patrol | **B** | PRIVILEGE |
| 4-6 | **REFUGE ACCESS GALLERY** | controlled transition to refuge zone | pursuit geometry + optional Cutter lesson | Patrol/Pursuit + Cutter separated | — | UNEASE |
| 4-7 | **REFUGE TERRACE** | protected refuge terrace / sky garden | strongest Override approach pressure | Pursuit-heavy + late security | **C** | RECOGNITION |
| 4-8 | **PROTECTED ASCENT GATE** | Upper Refuge Security Boundary | Sector synthesis + 2-of-3 quorum | multi-band pursuit/security | — | REALIZATION |

Working names are not yet individual Stage locks.

---

# 13. MAP SCALE MASTER TARGETS

Higher Sector = larger perceived footprint.

Sector04 should feel wider and more spatially luxurious than Sector03.

But:
- not every Stage must numerically exceed 3-8,
- low-pressure stages may compress,
- width must come from meaningful architecture,
- do not create filler.

Candidate bounds:

| Stage | Target Bounds | Spatial Signature |
|---|---:|---|
| 4-1 | **4224×1856** | RESIDENTIAL ENTRY TERRACE / GARDEN CROSSING |
| 4-2 | **4352×2048** | COURTYARD ORBIT / INNER GARDEN VOID |
| 4-3 | **4736×2112** | INTERLOCKED SKYBRIDGE PURSUIT LOOP |
| 4-4 | **3840×1792** | AMENITY GARDEN PLATE / intentional breath |
| 4-5 | **4864×2240** | GRAND AMENITY ATRIUM RING |
| 4-6 | **4608×2176** | REFUGE ACCESS GALLERY / SPLIT HEIGHT RUN |
| 4-7 | **4992×2304** | REFUGE TERRACE PERIMETER CHASE |
| 4-8 | **5248×2432** | PROTECTED ASCENT SECURITY CONVERGENCE |

## Mandatory Scale Rule

숫자만 커지고 실제 이동이:

```text
↗ ↗ ↗ ↗
```

한 방향으로만 읽히면 FAIL.

Stage마다:
- route silhouette
- movement axis
- chase geometry
- recovery direction
- failure direction

을 바꾼다.

---

# 14. MAP UNIQUENESS TARGET

각 Stage는 인접 Stage와 최소 3개가 달라야 한다.

평가축:

1. silhouette
2. movement axis
3. Rope rhythm
4. Pursuit behavior
5. failure direction
6. Security pressure
7. Override approach
8. story staging

## Initial signatures

### 4-1
Broad terrace → inward residential entry.

### 4-2
Courtyard orbit around a protected garden void.

### 4-3
Interlocked bridges with vertical pursuit handoff.

### 4-4
Wide quiet amenity plate with layered garden islands.

### 4-5
Large atrium ring + suspended resident facilities.

### 4-6
Split-height access gallery with pursuit on one layer / Cutter on another.

### 4-7
Outer refuge terrace perimeter → inward secure core.

### 4-8
Multiple residential/refuge security bands converging on one ascent boundary.

Similarity:
- 0–1 PASS
- 2 REVIEW
- 3+ REDESIGN

---

# 15. PURSUIT FAIRNESS

Persistent Pursuit is only fun when the Player can understand how to escape it.

Each Pursuit encounter must expose at least one of:

```text
VERTICAL BREAK
ARCHITECTURAL COVER
LONG VOID CROSSING
CONTROLLED DROP
ROUTE FORK
SAFE INTERIOR
```

## Forbidden

```text
enemy follows through every wall
enemy stays aggro across whole Stage
enemy attacks Safe Story Deck
enemy teleports between balconies
player cannot know where chase ends
```

## Recovery

If Player is hit / loses momentum:

```text
recoverable deck
or
next Rope anchor
```

must be visible quickly.

Pursuit should create:

> **“도망치는 플레이”**

not:

> **“적을 다 죽일 때까지 플랫폼에서 버티는 플레이”**

---

# 16. SAFE STORY SPACE RULE

Story Objects / Override interaction should not be placed under unavoidable fire.

At major Story / Override read:

```text
NO ACTIVE PURSUIT ACQUIRE
NO CROSS-STAGE PROJECTILE
NO CUTTER LINE
NO UNREADABLE PATROL OVERLAP
```

The Player should first:
- escape
- land
- understand where they are
- then read the story

World does not pause.

No invulnerability is assumed.

Safety must be authored spatially.

---

# 17. CAMERA MASTER RULE

Sector04 has much larger open residential spaces.

Camera should communicate:
- landscaped void
- upper residence scale
- visible pursuing guard
- next escape route

## Pursuit Frame

At any chase decision:

```text
PLAYER
+
PURSUER
+
NEXT ANCHOR / COVER / DROP
```

should ideally coexist.

## Override Frame

```text
PLAYER
+
OVERRIDE OBJECT
+
SAFE EXIT DIRECTION
```

No forced cinematic that hides live danger.

## Story Frame

Show architecture before text.

Text should confirm what the environment already suggests.

---

# 18. STORY PRESENTATION RULE

Use Stage Direction Runtime v1 for new authoring.

Target pipeline:

```text
DIRECTION-SPEC
→ compiler
→ DirectionRuntime
→ domain adapter
```

Required Direction tracks must reach:

```text
implemented / verified
```

before release.

## Player Bark

Dialogue:
- short
- physical
- immediate
- normal Korean
- no system jargon

Bad:

```text
“상층 거주자 보호 우선순위가 유지되고 있었군.”
```

Good:

```text
“…여긴 아직 다 돌아가고 있네.”
“…경비가 왜 이렇게 많아?”
“…아래는 멈췄는데, 여긴 계속 지켜지고 있었네.”
```

Exact Bark is Stage-by-Stage approval territory.

---

# 19. ENVIRONMENTAL STORY

Sector04는 설명문보다 환경 대비가 중요하다.

Show:

```text
clean water feature still running
garden light still on
private lounge powered
empty but maintained residences
sealed private lift lobby
emergency supplies untouched
resident refuge signage
active security patrol
```

Do not automatically show:
- dead bodies
- destroyed homes
- looting
- warzone damage

The disturbing part is:

> **너무 잘 유지되고 있다는 것.**

---

# 20. AUDIO DIRECTION

## Upper Residential

```text
soft HVAC
water
garden ambience
distant building chime
quiet residential PA
```

People are absent or sparse.

No busy crowd ambience.

## Security

Patrol:
- directional motor
- detection cue

Pursuit:
- escalation tone
- movement sound that follows position

Safe break:
- pursuit tone drops immediately enough for Player to understand contact break

## Story

No villain sting.

No conspiracy music.

Normality itself should be unsettling.

---

# 21. LIGHTING DIRECTION

Sector02:
lower / worker / emergency / uneven.

Sector03:
commercial active / display light.

Sector04:
naturalized premium lighting.

```text
warm residential interior
soft landscape lighting
clean daylight wells
refuge white lighting
```

Do not make everything gold to say “rich.”

Privilege should come from:
- space
- maintenance
- resources
- protection
- calmness

not cliché color coding.

---

# 22. MULTIPLAYER

Persistent Pursuit must remain deterministic enough for shared play.

Required eventual rules:
- enemy ownership / target selection remains Runtime-authoritative
- no client-local pursuit state
- one Player's detection must not make unrelated remote guards teleport
- authored pursuit territory remains stable
- reconnect restores world security state correctly

## Override

Resident Security Override: shared world progress.

```text
A collected
B collected
C collected
```

Quorum:

```text
count >= 2
```

Unlock scene:
all Players may see it, but world does not pause.

Death / respawn must not erase collected Override unless an explicit Sector reset contract later says so.

---

# 23. ACCESS / BACKTRACK RULE

Because only 2-of-3 is required, Player may intentionally skip one Override.

But:
- 4-8 must communicate current count clearly
- if only 1/3 is collected, Player must be able to backtrack to at least one remaining source
- geometry must not permanently seal all missed Overrides

No fake freedom.

```text
2-of-3
```

only matters if multiple valid acquisition combinations actually exist.

Target combinations:

```text
A+B
A+C
B+C
A+B+C
```

all valid.

---

# 24. FAILURE / REDESIGN CONDITIONS

Sector04 requires redesign if:

- it reads as Transit / Infrastructure again
- spaces feel like Sector03 commercial rooms
- spaces feel like Sector05 corporate control rooms
- all Stages are just vertical climbs
- every encounter requires killing enemies
- Pursuit is effectively infinite aggro
- Patrol routes are visually identical
- Override sources are mandatory 3-of-3 in practice
- one Override is always obviously cheapest
- 4-8 creates a new Override instead of checking quorum
- Story directly proves why Group C stopped
- Story reveals Sector05 responsibility early
- static Sentry combat becomes the Sector identity
- Cutter becomes the Sector identity
- AEGIS/Jammer/Artillery steal Sector05's role
- Background luxury decoration hides gameplay readability

---

# 25. CURRENT RUNTIME COMPATIBILITY

## VERIFIED CURRENT

Authoring snapshot:

`cb4f690ac180a04868322e9c4cfe1384897c348b`

Available relevant systems include:
- Hook Flight / 400px effective reach
- Patrol capability
- Pursuit archetype
- Standard Sentry
- Cutter Fire opt-in
- authored Camera
- Player Bark runtime
- Stage Direction Runtime v1
- Sector progress / current Sector01~03 access systems

## RETIRED LEGACY CODE

The standalone old Sector04 Transit catalog has been deleted.

Its design documents remain implementation history, not new Sector04 design authority.

## NOT IMPLEMENTED

- Upper Residential / Amenity Sector04
- new 4-1~4-8 geometry
- Resident Security Override A/B/C
- 2-of-3 quorum
- new Pursuit-oriented encounter layouts
- new Story/DIRECTION-SPEC
- Post-Sector03 transition into new 4-1

---

# 26. SECTOR03 → 04 HANDOFF

The Sector03 boundary uses the existing direct authored portal:

```text
3-8
→ 4-1
```

Narrative continuity:

```text
3-8
GROUP C SUSPENDED
PRIORITY ROUTE ACTIVE

↓

4-1
UPPER RESIDENTIAL DISTRICT
ENVIRONMENTAL SERVICE NORMAL
SECURITY ACTIVE
```

The first emotional beat is not another mystery terminal.

It is:

> **the physical shock of arriving somewhere that was protected.**

---

# 27. SECTOR04 → 05 HANDOFF

4-8 should end with:

```text
UPPER REFUGE / PROTECTED ASCENT
still maintained
```

and the question:

> **“누가 이곳을 이렇게까지 계속 보호한 거지?”**

Sector05 answers the next layer:

```text
CONTINUITY CONTROL
THE SYSTEM CHOOSES WHAT CONTINUES
```

Sector05 should feel like:

> the place where the protection seen in Sector04 became a decision.

---

# 28. MASTER STAGE SEQUENCE

```text
4-1
UPPER RESIDENTIAL ARRIVAL
CONTRAST
↓
4-2
RESIDENT COURTYARD
OVERRIDE A / PROTECTION
↓
4-3
RESIDENTIAL SKYBRIDGE
PERSISTENT PURSUIT
↓
4-4
PRIVATE AMENITY GARDENS
NORMALITY
↓
4-5
AMENITY ATRIUM
OVERRIDE B / PRIVILEGE
↓
4-6
REFUGE ACCESS GALLERY
SECURITY ESCALATION / CUTTER SECONDARY
↓
4-7
REFUGE TERRACE
OVERRIDE C / REFUGE PROTECTION
↓
4-8
PROTECTED ASCENT GATE
2-OF-3 QUORUM / REALIZATION
↓
DIRECT AUTHORED GATE PORTAL
↓
SECTOR05
CONTINUITY CONTROL
```

---

# 29. MASTER APPROVAL SUMMARY

```text
SECTOR 04
UPPER RESIDENTIAL / AMENITY DISTRICT

THEME
PRIVILEGE IS PROTECTED

CORE GAMEPLAY
PATROL
→ DETECTION
→ PERSISTENT PURSUIT
→ ROPE ESCAPE
→ CONTACT BREAK
→ RE-READ

SECONDARY
STANDARD SECURITY
LATE CUTTER INTRODUCTION

RESERVED FOR SECTOR05
AEGIS
JAMMER
ARTILLERY

ACCESS
RESIDENT SECURITY OVERRIDE
A = 4-2
B = 4-5
C = 4-7
REQUIRED = 2 OF 3

4-8
NO NEW OVERRIDE
QUORUM CHECK ONLY

STORY
3-8:
C SUSPENDED / PRIORITY ACTIVE

Sector04:
UPPER LIFE / AMENITY / REFUGE
STILL PROTECTED

ENDING QUESTION:
“누가 이곳을 이렇게까지 계속 보호한 거지?”

→ Sector05 Continuity Control

LEGACY TRANSIT SECTOR04
SUPERSEDED
```

---

# 30. NEXT AUTHORING ORDER

Master 승인 이후 Stage마다 반드시 별도 승인한다.

```text
4-1 DRAFT
→ Gameplay Map HTML
→ Story / Atmosphere HTML
→ User Approval
→ Full Stage Package

then 4-2 ...
```

Master approval은 개별 Stage approval을 대체하지 않는다.
