# SECTOR 03 — CENTRAL EXCHANGE COMPLEX MASTER PLAN
## REV 3.0 — SCALE ESCALATION / RUNTIME AUTHORITY / STORY FLOW INTEGRATED

> **Status:** AUTHORED — REV8/REV8.1 STAGE PACKAGES MERGED; RUNTIME MIGRATION NOT IMPLEMENTED
> **AUTHORING SNAPSHOT:** `cb4f690ac180a04868322e9c4cfe1384897c348b`
> **Sector Identity:** `CENTRAL EXCHANGE COMPLEX`
> **Core System:** `SMART MAINTENANCE SAFETY SYSTEM` / Runtime internal name `ACCESS SCAN FIELD`
> **Core Gameplay:** `ENVIRONMENT STATE + ENEMY POSITION + CURRENT BUILD → COMMIT WINDOW → ROPE FLOW`
> **Core Story Shift:** `왜 C만 멈췄지? → 같은 사고였는데… 이동 조건은 같지 않았어.`
> **General Stages:** `3-1 → 3-8`
> **3-8 Boss:** NONE IN THIS STAGE
> **Post-Sector Transition:** `3-8 → Boss03 → 4-1 authored Entry`
> **New Enemy Type:** NONE
> **New Rope Input / Mode:** NONE
> **Growth:** 3-5에서 generic Augment Offer #3
> **Stage package authority:** Each 3-N AREA-SPEC-REV8-DESIGN.json and DIRECTION-SPEC.json owns its detailed authored topology. This master owns cross-stage intent only.
> **Runtime boundary:** No Runtime code or current mock geometry is changed by this authoring merge; PRODUCTION-ALIGNMENT.md owns the implementation gap.
> **Current Enemy Slot Authority — 0.68.0:** `4,4,4,4,4,4,4,5 = TOTAL 33`; 이전 Stage별 exact count는 대체되며 [`../../../enemy-density-composition.md`](../../../enemy-density-composition.md)가 현재 권위다.

---

# 0. REV3 목적

Sector 03 REV2의 공간·세계관 방향은 유지한다.

유지:

- `CENTRAL EXCHANGE COMPLEX`
- `SMART MAINTENANCE SAFETY SYSTEM`
- Public / Service / Building Core / Atrium / Transfer의 건축적 진행
- Scanner의 `AVAILABLE → WARNING → LOCKED → RESET`
- LOCKED에서 기존 Rope는 유지
- Scanner는 Damage Laser가 아님
- Patrol과 Building Automation은 독립 시스템
- 3-5 generic Augment Offer #3
- 3-8 Free-Weave
- Sector 03 Story 결론은 **“차이가 있었다.”**까지
- Group A/B/C ↔ Access Tier 직접 매핑 금지

REV3에서 새로 고친다:

1. **Sector가 높아질수록 맵 월드 풋프린트가 커지는 규칙을 최상위 설계 원칙으로 추가**
2. Sector 03의 평균 공간 규모를 Sector 02보다 명확히 확대
3. 최신 Runtime 적 밀도 권위 `4,4,4,4,4,4,4,5` 반영
4. 3-2 / 3-5 / 3-7 Access Carrier 반영
5. 3-5를 Enemy 0 Rest에서 `압력 → 완전 Safe Node → 압력` 구조로 수정
6. 3-1 기존 `2112×704` Draft 폐기 및 더 큰 Sector Intro 재설계
7. 3-6 / 3-8을 지금까지의 일반 Stage 중 최대급 대공간으로 설정

---

# 1. SECTOR SCALE ESCALATION — DESIGN LOCK CANDIDATE

## 핵심 규칙

> **Sector number가 올라갈수록 평균적인 playable world footprint와 시야 깊이는 증가해야 한다.**

단순히 Bounds 숫자만 늘리는 것은 금지한다.

실제로 커져야 하는 것:

```text
TRAVERSAL DISTANCE
+
VOID SIZE
+
ARCHITECTURAL DEPTH
+
LONG ROPE SIGHTLINE
+
DISTANT DESTINATION READ
```

즉 Player는 Sector가 올라갈수록:

- 더 먼 곳을 본다.
- 더 큰 Void를 건넌다.
- 더 큰 건축 구조 안에 있다는 느낌을 받는다.
- 한 Camera Frame 안에 Stage 전체가 들어오지 않는다.
- 다음 목적지를 멀리서 보고 이동을 계획한다.
- Rope를 단순 이동도구가 아니라 대공간 횡단 수단으로 사용한다.

## Sector 03 Planning Envelope

아래 수치는 Stage final bounds가 아니라 **Master Planning Target**이다.

| Stage | Space | Planning Footprint | Scale Role |
|---|---|---:|---|
| 3-1 | LOWER MARKET PROMENADE | **3072×1088** | 첫 Upper-City 수평 확장 |
| 3-2 | FACADE SERVICE GALLERY | **3200×1472** | 거대한 외피 / 광고 구조 |
| 3-3 | CENTRAL RETAIL WALK | **3712×1792** | Atrium 외곽 반주기 |
| 3-4 | RETAIL SERVICE SPINE | **3584×1664** | Public / Service 이중 구조 |
| 3-5 | COMMERCIAL OPERATIONS HUB | **2688×1248** | 의도적 압축 / Breath |
| 3-6 | GRAND CENTRAL ATRIUM | **4352×2176** | Sector 공간적 클라이맥스 |
| 3-7 | TRANSFER MEZZANINE | **3840×1792** | 대형 환승 의사결정층 |
| 3-8 | UPPER EXCHANGE GATE | **4608×2176** | Sector Gameplay Finale / 최대 규모 |

## 중요한 리듬

```text
3-1  WIDE
      ███████

3-2  WIDE + DEEP
      ████████

3-3  BIG CENTRAL VOID
      █████████

3-4  DOUBLE-SKIN COMPLEX
      ██████████

3-5  INTENTIONAL COMPRESSION
      ██████

3-6  MONUMENTAL EXPANSION
      ███████████████

3-7  LARGE TRANSFER FLOOR
      ████████████

3-8  MAXIMUM EXCHANGE FIELD
      ████████████████
```

3-5에서 한 번 공간을 압축한 뒤 3-6에서 폭발적으로 열리는 것이 중요하다.

---

# 2. WORLD IDENTITY — CENTRAL EXCHANGE COMPLEX

Sector 03은 서로 독립된 상업 방 8개가 아니다.

하나의 거대한:

> **수직 상업·서비스·환승 복합시설**

이다.

평상시 기능:

- Worker District 주민의 생활형 상권
- 식당 / 약국 / 세탁 / 수리 / 편의점 / 작업용품점
- 대형 Commercial Atrium
- Front-of-House Retail
- Back-of-House Service
- Building Services
- Upper Transfer / Transit Connection

도시적 흐름:

```text
SECTOR 04
UPPER RESIDENTIAL / AMENITY
        ↑
UPPER EXCHANGE
        │
TRANSFER MEZZANINE
        │
GRAND CENTRAL ATRIUM
        │
BUILDING SERVICES
        │
RETAIL / SERVICE
        │
LOWER MARKET
        ↑
SECTOR 02
WORKER DISTRICT
```

진행 논리:

```text
RESIDENTIAL LIFE
→ DAILY COMMERCIAL LIFE
→ BUILDING SKIN / SERVICE
→ CENTRAL PUBLIC SPACE
→ FRONT / BACK OF HOUSE
→ BUILDING CORE
→ MONUMENTAL ATRIUM
→ TRANSFER LEVEL
→ UPPER RESIDENTIAL BOUNDARY
```

---

# 3. SECTOR 02 → SECTOR 03 STORY HANDOFF

Sector 02 마지막에 Player가 아는 것:

```text
EVACUATION GROUP A
TRANSFER COMPLETE

EVACUATION GROUP B
TRANSFER COMPLETE

EVACUATION GROUP C
TRANSFER SUSPENDED

PRIORITY ACCESS
ACTIVE
```

Player Question:

> **`…왜 C만 멈춘 거지?`**

Sector 03은 이 질문에 즉시 답하지 않는다.

대신 물리적 관찰을 하나씩 추가한다.

```text
3-1
상부 Commercial은 하부보다 훨씬 많은 시스템이 살아 있다.

3-2
Building Automation도 계속 자기 안전 절차를 돌고 있다.

3-3
Automation과 Security는 서로 독립적으로 움직인다.

3-4
Maintenance Clearance와 Upper Transit Authorization은 다른 개념이다.

3-5
이 건물은 자체 계통으로 꽤 오래 버틴 것으로 보인다.

3-6
설명보다 공간 규모와 Rope Flow가 중심.

3-7
사고 당시 이동 요청에는 Priority / Access 처리 차이가 있었다.

3-8
Evacuation Archive와 Upper Access / Transfer Archive가 같은 시설에 공존한다.
```

Sector 03 결론:

> **`같은 사고였는데… 이동 조건은 같지 않았어.`**

아직 모르는 것:

- 왜 차이가 생겼는가
- 누가 결정했는가
- Priority 대상이 누구인가
- Group A/B/C의 사회적 계층
- Group C suspension의 직접 원인
- Priority와 C suspension의 직접 인과
- 의도적 희생 여부
- Corporate final truth

---

# 4. CORE GAMEPLAY SHIFT

## Sector 01

> **Rope를 사용할 수 있는가?**

## Sector 02

> **움직이는 상황 속에서 언제 진입할 것인가?**

## Sector 03

> **환경 상태와 적 위치가 동시에 바뀔 때 언제 어디에 붙어 Flow를 유지할 것인가?**

Formula:

```text
ENVIRONMENT STATE
+
ENEMY POSITION
+
CURRENT BUILD
↓
COMMIT WINDOW
↓
ATTACH
↓
SWING / RELEASE
↓
RE-ATTACH
↓
KEEP FLOW
```

---

# 5. SMART MAINTENANCE SAFETY SYSTEM

Runtime internal name:

`ACCESS SCAN FIELD`

World-facing name:

> **SMART MAINTENANCE SAFETY SYSTEM**

이 시스템은 시민 보안검색 장비가 아니다.

Central Exchange의:

- Media Wall
- Smart Signage
- Facade Lighting
- Cleaning Rail
- Service Frame
- Ceiling Rig
- Advertising Mount
- Electrical Distribution

등을 관리하는 Building Automation이다.

정비용 Mount가 현재 작업자를 받아도 되는지 주기적으로 상태를 변경한다.

```text
AVAILABLE
작업 가능

WARNING
상태 전환 예정

LOCKED
신규 Attach 금지

RESET
점검 / 재초기화
```

핵심 Runtime 의미:

```text
NEW ATTACHMENT
DENY WHEN LOCKED / RESET

CURRENT ROPE
KEEP ATTACHED
```

Scanner:

```text
Damage      0
Knockback   0
Rope Cut    0
Forced Drop 0
```

따라서 핵심 질문은:

> **“언제 붙을 것인가?”**

이지:

> “레이저를 피하라.”

가 아니다.

---

# 6. SCANNER + PATROL RELATION

Scanner와 Patrol은 서로 다른 시스템이다.

## Scanner

Building Automation.

## Patrol

Facility / Disaster / Security response unit.

따라서 Sector 03에서는:

```text
Mount AVAILABLE
but
Drone nearby

or

Drone far away
but
Mount about to LOCK
```

이 발생한다.

Player는 둘을 동시에 읽어야 한다.

---

# 7. CURRENT ENEMY AUTHORITY — REV3

최신 Slot authority:

```text
3-1   1
3-2   2   ← Access A
3-3   2
3-4   3
3-5   2   ← Access B
3-6   3
3-7   4   ← Access C
3-8   5

TOTAL = 22
```

## Access Carrier

```text
3-2
sector-03:access-module:a

3-5
sector-03:access-module:b

3-7
sector-03:access-module:c
```

Sector 03 3-of-3 Access progression은 별도 Runtime 계약에 맞춰 유지한다.

## Slot Count 의미

Slot 수 증가 ≠ 한 화면에 모든 적 동시 활성.

원칙:

> **Stage-local Slot은 늘어나지만 대표 Gameplay Frame의 읽을 수 있는 Pressure Source는 보통 1–2개로 제한한다.**

Activation band / phase separation을 사용한다.

---

# 8. GROWTH PROGRESSION

Sector 03 시작:

- 앞 Sector에서 획득한 generic Augment 유지
- 특정 Foundation / Specialization 명칭 사용 금지

3-5:

> **generic Augment Offer #3**

동일한 22-card Catalog.

금지:

- Hybrid Tier
- Second Specialization
- New Rarity
- Reroll
- 특정 Build 전용 필수 Route

Build는:

> **HOW를 바꾸되 CAN / CANNOT을 바꾸지 않는다.**

---

# 9. SECTOR RHYTHM

```text
SPACE
→
TIMING
→
SYNTHESIS
→
CHOICE
→
BREATH
→
FLOW
→
DECISION
→
MASTERY
```

| Stage | 핵심 역할 | Difficulty |
|---|---|---|
| 3-1 | 공간 대비 / 해방감 | ★★ |
| 3-2 | Scanner 첫 학습 | ★★☆ |
| 3-3 | Scanner + Enemy | ★★★ |
| 3-4 | Public / Service Cost Choice | ★★★ |
| 3-5 | Safe Node + Offer #3 | REST / LOW |
| 3-6 | Large Rope Flow | ★★★☆ |
| 3-7 | Transfer Cost Decision | ★★★☆ |
| 3-8 | Dynamic Free-Weave Mastery | ★★★★ |

Sector 03는:

> **Scanner Stage 7개**

처럼 느껴지면 실패다.

---

# 10. 3-1 — LOWER MARKET PROMENADE

## Stage Role

**SECTOR SCALE REVEAL / POWERED COMMERCIAL CONTRAST**

## Planning Footprint

**~3072×1088**

## Spatial Signature

**PANORAMIC MARKET TERRACES / BROKEN CANOPY RUN**

```text
ENTRY ━━━━━━━━━━━━━━━━━→
              VOID
                 ━━━━━━━━━━━━━━━→
                           SHALLOW RISE
                                  ━━━━━━━━━━━━━→ EXIT
```

Dominant Motion:

> **LONG RIGHT → LONG RIGHT → SHALLOW UP-RIGHT**

## Gameplay

- Scanner OFF
- Patrol 없음
- 새 Mechanic 없음
- Enemy Slot authority = 1
- 첫 약 70%는 enemy pressure 0
- 마지막 약 30%에 residual Guard 1 slot

## Core Experience

> **익숙한 Rope인데 공간의 크기와 도시의 분위기가 완전히 달라졌다.**

## Story

보여준다:

- powered storefront
- automatic kiosk
- signage loop
- emergency illumination
- 일부 active door
- products
- no people
- 일부 사고 흔적

System:

```text
COMMERCIAL DISTRICT
PROMENADE 06

WELCOME
PUBLIC SERVICE ONLINE
```

Player Bark:

> **`…여긴 아직 전력이 들어오네.`**

## Forbidden

- Scanner
- Priority identity
- Group mapping
- Upper Transit explanation

---

# 11. 3-2 — FACADE SERVICE GALLERY

## Stage Role

**FIRST SMART MAINTENANCE SAFETY TUTORIAL**

## Planning Footprint

**~3200×1472**

## Spatial Signature

**GIANT FACADE BACKSIDE / OFFSET SIGNAGE SHAFTS**

```text
ENTRY
   ↗
 GIANT SIGN BACK
       │
       ● C1
       │
   SERVICE VOID
          ● C2
             ↗
          MEDIA FRAME
               ● C3
                  → EXIT
```

## Movement

> **UP-RIGHT → DEEP VERTICAL GAP → UP-RIGHT**

## Gameplay

첫 Scanner Group.

Tutorial order:

```text
SEE
→
READ AVAILABLE / WARNING
→
ATTACH
→
STAY ATTACHED THROUGH LOCK
→
RELEASE
→
RE-ATTACH NEXT WINDOW
```

Enemy Slot authority = 2.

단:

1. first Scanner lesson = safe
2. lower Guard later
3. Access A Carrier = separate late service bay

## Access

`sector-03:access-module:a`

## Bark

> **`정비 마운트가 안전 주기를 돌고 있어.`**

## Core Experience

> **공간 자체에도 타이밍이 있다.**

---

# 12. 3-3 — CENTRAL RETAIL WALK

## Stage Role

**SCANNER + ENEMY FIRST SYNTHESIS**

## Planning Footprint

**~3712×1792**

## Spatial Signature

**HALF-ORBIT RETAIL BALCONY / CENTRAL VOID EDGE**

```text
           EXIT
            ↑
   ─────────────────
 /                    \
│      CENTRAL VOID     │
 \                    /
   ───── PLAYER ─────→
```

완전한 원형이 아니라 Atrium 외곽 한쪽 반주기.

## Movement

> **RIGHT CURVE → UP → LEFT-LEANING EXIT**

## Gameplay

```text
SCANNER STATE
+
ENEMY POSITION
↓
ONE COMMIT WINDOW
```

Enemy Slot authority = 2.

권장 Phase:

- Slot A = Scanner와 직접 결합
- Safe / recovery
- Slot B = Upper exit pressure

Crossfire 금지.

## Core Experience

> **열린 Mount와 움직이는 적 사이에서 한 번의 Commit Window를 찾는다.**

---

# 13. 3-4 — RETAIL SERVICE SPINE

## Stage Role

**FIRST REAL COST CHOICE**

## Planning Footprint

**~3584×1664**

## Spatial Signature

**DOUBLE-SKIN COMMERCIAL SECTION**

```text
             PUBLIC FRONT
          ╭────────────────╮
ENTRY ────                  ──── MERGE
          ╰── SERVICE BACK ─╯
```

Route는 2개만.

## PUBLIC

- 넓음
- Rope 입력 적음
- Scanner 많음
- Enemy exposure 큼
- 읽기 쉬움

## SERVICE

- 좁음
- Rope chaining 많음
- Permanent mount 많음
- Scanner 압력 낮음
- Enemy / Recovery 비용 별도

핵심 질문:

> **자동화의 리듬을 탈 것인가, Rope 입력량을 감수하고 Service 구조를 탈 것인가?**

Enemy Slot authority = 3.

Story:

```text
MAINTENANCE CLEARANCE
RECOGNIZED

LOCAL SERVICE ROUTE
AVAILABLE
```

하지만:

> **LOCAL SERVICE ACCESS ≠ UPPER TRANSIT AUTHORIZATION**

필요 시 Bark:

> **`서비스 쪽은 자동화가 덜 걸려 있어.`**

## Important

Service = 정답 아님.
Public = 함정 아님.

---

# 14. 3-5 — COMMERCIAL OPERATIONS HUB

## Stage Role

**BREATH / SAFE NODE / GENERIC OFFER #3**

## Planning Footprint

**~2688×1248**

Sector 03의 의도적 압축 Stage.

## Spatial Signature

**SIDE-LOADED PLANT FLOOR / SAFE CONTROL ISLAND**

```text
ENTRY
  ↓
GUARD A
  ↓
████████ SAFE SERVICES HUB ████████
       GENERIC AUGMENT OFFER #3
███████████████████████████████████
                         │
                 ACCESS B BRANCH
                         │
                     GUARD B
                         ↓
                       EXIT
```

## Runtime Authority

Enemy Slot authority = 2.

- `node-entry-guard`
- `node-exit-guard`
- Access B는 exit-side Guard가 소유

## Critical Rule

> **Node Chamber 자체는 완전 안전.**

Augment Offer는 enemy kill 없이 선택 가능.

선택 중:

- chooser Player input만 선택 UI로 전환
- world continues
- teammates continue
- enemies outside Node safe activation may continue
- invulnerability 없음

## Access

`sector-03:access-module:b`

## Growth

**Generic Offer #3**

새 Tier 아님.

## Story

후보:

```text
LOCAL SYSTEM STATUS

LIFE SAFETY
ONLINE

ATRIUM LIGHTING
ONLINE

SERVICE GRID
ONLINE

EXTERNAL LINK
DEGRADED
```

Bark:

> **`이 건물은 자체 계통으로 버틴 건가…`**

단정이 아닌 가설.

---

# 15. 3-6 — GRAND CENTRAL ATRIUM

## Stage Role

**SECTOR SPATIAL CLIMAX / LARGE ROPE FLOW**

## Planning Footprint

**~4352×2176**

## Spatial Signature

**MONUMENTAL OPEN VOID / CROSS-ATRIUM PENDULUM**

```text
              UPPER BALCONY
          ●────────────────●
         /                  \
        /                    \
       /       HUGE VOID      \
      /                        \
ENTRY ●                        ● EXIT
```

## Core Experience

작은 플랫폼을 순서대로 밟는 Stage가 아니다.

Player가:

> **거대한 Atrium Void를 실제 Rope Arc로 횡단**

해야 한다.

## Suggested Structure

```text
FIRST SCANNER ARC
→
HUGE FREE SWING
→
SAFE MID GALLERY
→
SCANNER + ENEMY COMMIT
→
UPPER FREE FLOW
```

Enemy Slot authority = 3.

Scanner = known system.

새 Mechanic 없음.

## Skill Expression

Beginner:

```text
Cycle 확인
→ Attach
→ Safe Landing
→ 다시 Cycle 확인
```

Skilled:

```text
WARNING 선행 Attach
→ LOCK 동안 기존 Rope 유지
→ Release
→ AVAILABLE 순간 다음 Mount
→ Flow 유지
```

## Dialogue

없음.

이 Stage는 공간과 Rope 자체가 Story다.

---

# 16. 3-7 — TRANSFER MEZZANINE

## Stage Role

**STATIC COST PROFILE DECISION + PRIORITY STORY**

## Planning Footprint

**~3840×1792**

## Spatial Signature

**LARGE TRANSFER CONCOURSE / THREE COST PROFILES**

3-4의 Public/Service 2-way Architecture Choice와 구분한다.

3-7은:

> **같은 Transfer 목적지에 어떤 비용으로 갈 것인가?**

## OUTER GALLERY

- 길다
- Scanner 있음
- Enemy exposure 낮음

## TRANSFER SPINE

- 가장 짧음
- Scanner + Enemy
- 빠르지만 Commit 압축

## SERVICE LATTICE

- Scanner 낮거나 없음
- Rope chaining 많음
- Enemy / recovery 비용 높음

Enemy Slot authority = 4.

## Access

한 Slot = `sector-03:access-module:c` Carrier.

## Story Reveal

처음으로 명확히 보여주는 것:

- Service Class Control exists
- Access Tier Control exists
- Priority Route active

예시:

```text
EMERGENCY TRANSFER STATUS

PRIORITY A
BOARDING READY

PRIORITY B
QUEUE ASSIGNED

SERVICE
STANDBY
```

아직 금지:

```text
GROUP A = PRIORITY
GROUP B = PREMIUM
GROUP C = STANDARD
```

Bark:

> **`…대피 순서가 따로 있었어.`**

---

# 17. 3-8 — UPPER EXCHANGE GATE

## Stage Role

**SECTOR GAMEPLAY FINALE / DYNAMIC FREE-WEAVE**

## Planning Footprint

**~4608×2176**

Sector 03 최대급.

## Spatial Signature

**MEGA EXCHANGE HALL / MULTI-LEVEL FREE-WEAVE FIELD**

## Core Difference from 3-7

3-7:

```text
처음 Cost Profile 선택
→
그 Profile을 따라감
```

3-8:

```text
현재 상태 확인
→
즉석 Route 선택
→
Safe Crossover
→
상태 재평가
→
다시 Route 조합
```

핵심 질문:

> **WHERE + WHEN**

## Free-Weave Core

```text
M0 SAFE HUB

Scanner AVAILABLE
→ CENTRAL FLOW

Scanner LOCKED
→ WAIT
or
SIDE POCKET

↓

MX SAFE CROSSOVER

↓

상태 재평가

↓

CENTRAL
or
WEST / EAST POCKET

↓

M1 SAFE MERGE
```

Lower choice는 Upper choice를 잠그지 않는다.

## Enemy Authority

Current Slot authority = **5**.

5 Slot을 동시에 켜지 않는다.

Master Phase Example:

```text
WEST LOWER PRESSURE
EAST LOWER PRESSURE
MID SUPPORT
WEST UPPER PRESSURE
EAST UPPER PRESSURE
```

Safe:

- M0
- MX
- M1
- Archive Deck

## Story Climax

Sector 02에서 이미 A/B/C 결과는 확인했다.

3-8은 동일 문구 반복이 목적이 아니다.

새 핵심 정보:

> **Evacuation Transfer Archive와 Upper Access / Transfer Archive가 같은 Exchange facility에 공존했다.**

즉 Player가 머릿속에서:

```text
GROUP C
WAIT / SUSPENDED

+

UPPER TRANSFER
PRIORITY / DIFFERENT PROCESSING
```

을 처음 연결한다.

하지만:

> **NO DIRECT CAUSALITY**

Bark:

> **`같은 사고였는데… 이동 조건은 같지 않았어.`**

## Boss

3-8 내부 Boss 없음.

3-8의 source objective와 Sector03 Access 3-of-3 뒤 Gate는 4-1 authored Entry로 직접 이동한다.

---

# 18. STORY DISCLOSURE CHAIN

## 2-8

```text
GROUP A
TRANSFER COMPLETE

GROUP B
TRANSFER COMPLETE

GROUP C
TRANSFER SUSPENDED

PRIORITY ACCESS
ACTIVE
```

## 3-1

```text
COMMERCIAL DISTRICT
POWER / AUTOMATION ACTIVE
```

## 3-2

Building Automation safety logic survives.

## 3-3

Automation + Security coexist independently.

## 3-4

Maintenance Clearance:
local service access only.

Not upper transit authorization.

## 3-5

Local Building systems appear to have survived through local power / fail-safe.

## 3-6

Space / Flow is primary Story.

## 3-7

Priority / Access Tier / Transfer Processing difference becomes explicit.

## 3-8

Evacuation Archive and Upper Exchange Access Archive coexist.

Sector conclusion:

> **차이가 있었다.**

Not:

> **왜 차이가 생겼다.**

---

# 19. CHARACTER BARK MASTER

Recommended:

```text
3-1
…여긴 아직 전력이 들어오네.

3-2
정비 마운트가 안전 주기를 돌고 있어.

3-3
NONE

3-4
서비스 쪽은 자동화가 덜 걸려 있어.

3-5
이 건물은 자체 계통으로 버틴 건가…

3-6
NONE

3-7
…대피 순서가 따로 있었어.

3-8
같은 사고였는데… 이동 조건은 같지 않았어.
```

Rules:

- Safe Landing only
- 2줄 이하
- 이동 중 장문 금지
- System / Environment가 사실을 먼저 보여준다
- Character는 해석만 한다
- Tutorial wording 금지
- Player Bark layer 미구현 시 System Toast로 대체 금지

---

# 20. COMMERCIAL POWER-STATE CANON

Sector 03은:

> **완벽히 정상인 Upper City**

가 아니다.

정확한 Contrast:

```text
WORKER DISTRICT
damaged
dim
reduced systems

CENTRAL EXCHANGE
damaged
but
more local power
more automation
more surviving services
```

Allowed:

```text
LOCAL POWER BUS
ACTIVE

COMMERCIAL SERVICE NETWORK
LIMITED / ONLINE
```

Forbidden:

```text
POWER STATUS
PERFECT

INCIDENT IMPACT
NONE
```

---

# 21. VISUAL IDENTITY

## Sector 02

```text
WORN
DENSE
LIVED-IN
RESIDENTIAL
WARM BUT DIM
```

## Sector 03

```text
BRIGHTER
POLISHED
POWERED
EMPTY
COMMERCIAL
LARGE VOID
BACK-OF-HOUSE FRAME
```

But not luxury mall fantasy.

Damage traces:

- cracked panel
- fallen sign
- frozen escalator
- abandoned bags
- partially dark storefront
- looped advertisement
- inactive doors
- emergency lighting

## Palette

Base:

- Deep Navy
- Graphite
- Polished Dark Gray
- Cool Concrete

Commercial:

- Warm White
- Muted Gold
- Amber
- Muted Magenta
- Desaturated Teal

Gameplay Priority:

```text
ROPE / GRAPPLE
CYAN

SCANNER WARNING / SECURITY
AMBER / RED-ORANGE

PLAYER SCARF
RED
```

Commercial graphics must not overuse Rope Cyan.

---

# 22. SMART MOUNT VISUAL LANGUAGE

## AVAILABLE

- Cyan structural indicator
- solid mount
- clearly attachable

## WARNING

- Amber pulse
- transition cue

## LOCKED

- dim / red-orange
- closed clamp / X
- Hook candidate absent

## RESET

- neutral diagnostic pulse
- not attachable

Forbidden visual language:

- Damage Laser
- Surveillance Eye
- Citizen Checkpoint
- Moving Red Wall

---

# 23. MAP / COLLISION CONTRACT

Sector 03는 시각 디테일이 많기 때문에 특히 중요하다.

```text
COLLISION GEOMETRY
≠
DECORATION
```

Gameplay Map HTML에는 다음만 표시:

- actual collision
- Grapple targets
- Scanner-controlled mounts
- enemies
- actual LOS / safe structures
- recovery
- routes
- objective
- exit

표시하지 않음:

- decorative shop signs
- decorative railing
- pipes / cable
- furniture
- background truss
- storefront trim
- lighting rig
- escalator art
- ad frame

단, 실제 gameplay function이 있다면 표시.

---

# 24. ROPE / PHYSICS MASTER CONTRACT

Current planning reach:

**400px**

Mandatory progression:

> **≤400px**

권장 일반 relation:

```text
250–330 comfort
330–360 pressure
360–385 skilled
385–400 rare commit
```

Scanner + Enemy + Route Choice와 동시에 390–400 exact reach를 반복 요구하지 않는다.

Large Sector ≠ every gap max reach.

큰 공간은:

- arc length
- sightline
- intermediate swing
- velocity expression
- route duration

으로 체감한다.

---

# 25. RECOVERY CONTRACT

Sector 03는 Timing Layer가 추가되므로 실패 비용을 짧게 유지한다.

대부분:

> **3–5 sec**

대공간 Commit:

> **4–8 sec**

Avoid:

- full-stage fall
- start reset
- unavoidable damage floor
- recovery while another encounter continues firing
- Scanner phase가 Recovery를 무한 대기시키는 구조

---

# 26. MULTIPLAYER CONTRACT

Scanner:

> 같은 simulation phase.

Client마다 다른 Scanner State 금지.

Enemies:

- activation bounds 내 Player만 target
- 다른 route / safe hub Player를 cross-zone target으로 잡지 않음

Safe Hub:

- 2인 착지 가능

Story UI:

- no global pause

Node:

- chooser Player input only
- world / teammates continue

---

# 27. SECTOR 04 RESERVATION

Sector 04 identity:

> **TRANSIT / INFRASTRUCTURE**

Sector 03에서 대표 Gameplay로 소비하지 않는다:

- moving train
- moving rail route
- conveyor identity
- moving platform primary mechanic
- transit signal puzzle
- giant moving infrastructure

3-8은 정적 Exchange infrastructure까지만.

Transition:

```text
UPPER EXCHANGE GATE
↓
Boss03 catalog-intercepted authored route
↓
SECTOR 04 UPPER RESIDENTIAL / AMENITY
```

---

# 28. FIVE SECTOR-LEVEL GATES

## MAP SCALE / WORLD FOOTPRINT

**PASS CONDITION**

- Sector 02보다 평균 공간이 확실히 큼
- 3-6 / 3-8은 최고 수준 대공간
- 3-5 압축이 의도적 Contrast로 작동
- 숫자만 늘린 빈 공간 금지

## MAP SIMILARITY

Each Stage must differ from previous stages in at least 3:

- silhouette
- movement axis
- Rope rhythm
- failure direction
- Scanner relation
- enemy pressure
- route decision
- Access approach
- Augment expression

0–1 overlap = PASS
2 = REVIEW
3+ = REDESIGN

## OBSTACLE FUNCTION

Every major route turn / branch / drop must come from actual architectural cause.

## LENGTH / PACING

Large does not mean slow.

Long sightline + Flow is preferred over filler.

## CURRENT GITHUB RUNTIME

Every Stage Draft/package must re-audit latest main before approval/package.

---

# 29. STAGE MASTER TABLE — REV3

| Stage | Name | Spatial Signature | Gameplay Role | Slots | Scanner | Access | Growth |
|---|---|---|---|---:|---|---|---|
| 3-1 | LOWER MARKET PROMENADE | Panoramic Market Terraces | Scale reveal | 1 | OFF | - | - |
| 3-2 | FACADE SERVICE GALLERY | Giant Facade Backside | Scanner tutorial | 2 | FIRST | A | - |
| 3-3 | CENTRAL RETAIL WALK | Half-Orbit Balcony | Scanner + Enemy | 2 | ACTIVE | - | - |
| 3-4 | RETAIL SERVICE SPINE | Double-Skin Section | Public vs Service | 3 | PUBLIC | - | - |
| 3-5 | COMMERCIAL OPERATIONS HUB | Safe Control Island | Breath + Offer #3 | 2 | OFF IN NODE | B | Offer #3 |
| 3-6 | GRAND CENTRAL ATRIUM | Monumental Open Void | Large Flow | 3 | ACTIVE | - | - |
| 3-7 | TRANSFER MEZZANINE | Three Cost Profiles | Decision + Story | 4 | ACTIVE | C | - |
| 3-8 | UPPER EXCHANGE GATE | Mega Free-Weave Hall | Mastery Finale | 5 | ACTIVE | - | - |

---

# 30. SECTOR STORY ARC — FINAL REV3 DRAFT

```text
2-8
왜 C만 멈췄지?
↓
3-1
여기는 아직 시스템이 많이 살아 있다.
↓
3-2
건물 자동화도 사고 뒤 계속 자기 안전 절차를 돌고 있다.
↓
3-3
자동화와 Security는 서로 독립적으로 움직인다.
↓
3-4
Maintenance Clearance와 Upper Transit Authorization은 다르다.
↓
3-5
건물 자체가 Local Grid로 꽤 오래 버틴 것으로 보인다.
↓
3-6
거대한 상업 대공간을 Rope Flow로 통과한다.
↓
3-7
사고 당시 이동 요청에 Priority / Access 처리 차이가 존재했다.
↓
3-8
Evacuation 기록과 Upper Exchange의 Access 기록이 같은 시설에 공존했다.
↓
SECTOR 03 CONCLUSION
같은 사고였는데… 이동 조건은 같지 않았어.
```

---

# 31. STORY DISCLOSURE — FORBIDDEN

Sector 03에서 절대 확정하지 않는다:

```text
GROUP A = PRIORITY
GROUP B = PREMIUM
GROUP C = STANDARD
```

금지:

- Priority 때문에 C가 중단됨
- Worker를 의도적으로 버림
- 사고를 회사가 의도적으로 일으킴
- Corporate final culprit
- A/B가 특정 상류계층이라는 확정
- Priority recipient identity

Sector 03는:

> **DIFFERENCE**

까지만.

`CAUSE / RESPONSIBILITY`

는 이후 Sector.

---

# 32. PLAYTEST QUESTIONS

## Scale

1. 3-1 진입 즉시 Sector 02보다 공간 단위가 커졌다고 느끼는가?
2. 3-5 압축 후 3-6이 진짜로 폭발적으로 열리는가?
3. 3-6과 3-8이 같은 종류의 큰 공간으로 느껴지지 않는가?
4. 넓어진 Bounds가 filler가 아니라 실제 Rope traversal distance로 쓰이는가?

## Gameplay

1. Scanner가 Damage Hazard가 아니라 Attach Timing Rule로 이해되는가?
2. 3-2의 첫 Scanner 학습이 Enemy 없이 먼저 읽히는가?
3. 3-3에서 Scanner + Enemy가 하나의 Commit 판단으로 느껴지는가?
4. 3-4 Public / Service가 실제 비용 차이를 만드는가?
5. 3-5 Node가 진짜 Breath로 느껴지는가?
6. 3-6의 긴 Rope Arc가 Build expression을 만들지만 Build lock은 없는가?
7. 3-7과 3-8의 decision pattern이 분명히 다른가?
8. 3-8이 Free-Weave로 기억되는가?

## Story

1. Central Exchange가 Worker District보다 더 잘 유지된 것은 이해되는가?
2. 하지만 Incident 영향이 있다는 점도 남는가?
3. 3-7 이전에 Priority 의미를 너무 많이 노출하지 않는가?
4. 3-8에서 Archive coexistence를 알아차리는가?
5. Group ↔ Tier mapping이 아직 미확정으로 남는가?

---

# 33. PASS CRITERIA

## Spatial

- 3-1→3-8이 하나의 Central Exchange를 실제로 올라가는 구조
- Sector 02보다 평균 world footprint가 큼
- 3-5 압축 / 3-6 확장이 강하게 대비
- 3-6 = spatial climax
- 3-8 = gameplay mastery finale
- Sector 04 Upper Residential identity를 침범하지 않음

## Gameplay

- Scanner = primary new environment system
- new input 없음
- new Rope mode 없음
- new Enemy behavior 없음
- Base Rope mandatory clear
- Scanner + Enemy는 독립 신호
- enemy count 증가가 combat soup로 이어지지 않음
- no Rope Cut
- 3-5 Offer #3가 generic Augment contract 유지
- specific card mandatory 없음

## Story

- Powered Commercial contrast 전달
- Local Automation survival 전달
- Maintenance access와 Upper Transit 권한 분리
- Priority / Access treatment difference 공개
- direct causality 미확정
- Group ↔ Tier mapping 미확정
- Corporate truth 미공개

---

# 34. FAIL CONDITIONS

## Scale

- Sector 03 Stage가 Sector 02와 비슷하거나 더 작은 공간감
- 큰 Bounds인데 실제 route는 중앙 1/3만 사용
- 3-6 / 3-8 모두 단순 vertical climb
- 넓은 맵을 작은 플랫폼 반복으로 채움

## Gameplay

- Scanner를 Damage Laser로 만듦
- LOCKED에서 current Rope 강제 detach
- Scanner Tutorial과 적 2기를 동시에 처음부터 투입
- Stage마다 Scanner cycle을 더 빠르게 해서 난이도만 올림
- 3-4와 3-7과 3-8이 모두 사실상 같은 3-route choice
- 3-5 Node 선택에 enemy kill 필요
- 3-8 5 Slot 동시 활성
- max-range exact fishing 반복
- moving train / moving platform을 Sector 03 핵심으로 사용

## Story

- A = Priority 확정
- B = Premium 확정
- C = Worker / Standard 확정
- Priority → C suspension 직접 인과
- intentional sacrifice
- Corporate final answer

---

# 35. CANONICAL REV3 FLOW

```text
3-1 LOWER MARKET PROMENADE
WIDE POWERED COMMERCIAL REVEAL
1 SLOT / SCANNER OFF

↓

3-2 FACADE SERVICE GALLERY
FIRST SMART MAINTENANCE SAFETY
2 SLOTS / ACCESS A

↓

3-3 CENTRAL RETAIL WALK
SCANNER + ENEMY SYNTHESIS
2 SLOTS

↓

3-4 RETAIL SERVICE SPINE
PUBLIC vs SERVICE COST CHOICE
3 SLOTS

↓

3-5 COMMERCIAL OPERATIONS HUB
PRESSURE → SAFE NODE → PRESSURE
OFFER #3
2 SLOTS / ACCESS B

↓

3-6 GRAND CENTRAL ATRIUM
MONUMENTAL LARGE-SCALE ROPE FLOW
3 SLOTS

↓

3-7 TRANSFER MEZZANINE
THREE COST PROFILES
PRIORITY / ACCESS STORY
4 SLOTS / ACCESS C

↓

3-8 UPPER EXCHANGE GATE
MAX-SCALE DYNAMIC FREE-WEAVE
5 SLOTS
ARCHIVE CONNECTION

↓

POST-SECTOR 03
Boss03 catalog-intercepted authored route
4-1
```

---

# 36. FINAL DESIGN SENTENCE

> **Sector 03는 하부 Worker District보다 훨씬 큰 스케일과 더 살아 있는 자동화 시스템을 가진 Central Exchange Complex를 Rope로 올라가며, Smart Maintenance Safety의 주기와 Enemy의 위치를 동시에 읽어 Flow를 유지하고, 사고 당시 모든 사람이 같은 이동 조건을 부여받지 않았다는 사실을 처음 체감하는 Sector다.**

---

# 37. CURRENT STATUS

```text
SECTOR 03 MASTER PLAN REV3
STATUS
DRAFT / APPROVAL PENDING

3-1 OLD REV8 DRAFT
SUPERSEDED BY MASTER SCALE REDESIGN

NEXT AFTER MASTER APPROVAL
3-1 LOWER MARKET PROMENADE
NEW LARGE-SCALE REV8 DRAFT
+
GAMEPLAY MAP HTML
+
STORY / ATMOSPHERE HTML
```
