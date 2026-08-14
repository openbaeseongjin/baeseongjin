# SECTOR 03 — COMMERCIAL DISTRICT MASTER PLAN

*MASTER PLAN CANDIDATE · REV 1.0*

`SECTOR 03 COMMERCIAL DISTRICT` · `POWERED UPPER CITY` · `ACTIVE SECURITY` · `VISIBILITY / ROUTE CONTROL`

| 항목 | 기준 |
|---|---|
| Status | HYPOTHESIS — MASTER PLAN CANDIDATE |
| Sector Role | Worker District 이후 첫 Powered Upper-City Contrast |
| Core Gameplay Shift | Moving Threat → Active Route Control |
| Core Story Shift | “왜 C만 멈췄지?” → “누가 위쪽 이동 우선권을 가지고 있었지?” |
| Carry Build | Foundation + Specialization KEEP |
| New Rope Mode | NONE |
| New Input | NONE |
| Planned New Augment | TBD — 이 문서에서 확정하지 않음 |
| Planned New Security Mechanic | Scanner / Security Shutter 후보 — HYPOTHESIS |
| Boss | Sector 공통 계약상 별도 존재, 위치·정체·전투 시나리오 TBD |
| General Stages | 8 authored progression regions |
| Sector 03 → 04 | Transit / Infrastructure 방향으로 연결, 정확한 Boss/전환 순서 TBD |

---

## 0. Source-of-Truth / Cross-Check

### VERIFIED — Project Structure

현재 상위 세계 구조에서 Sector는 다음 순서다.

```text
01 MAINTENANCE
02 WORKER DISTRICT
03 COMMERCIAL
04 TRANSIT / INFRASTRUCTURE
05 CORPORATE
06 ROOFTOP
```

Sector 03은 Worker District 바로 위에 있는 Commercial District다.

### VERIFIED — Sector 02 Ending Information

Sector 02 Master Plan의 Finale에서 Player는 다음 정보를 처음 확인한다.

```text
EVACUATION GROUP A — TRANSFER COMPLETE
EVACUATION GROUP B — TRANSFER COMPLETE
EVACUATION GROUP C — TRANSFER SUSPENDED

UPPER TRANSIT ROUTE
PRIORITY ACCESS: ACTIVE
```

그러나 아직:

```text
GROUP A = 누구
GROUP B = 누구
PRIORITY 대상 = 누구
왜 C가 중단됐는가
```

는 모른다.

### VERIFIED — Build State

Sector 02 종료 후:

```text
Foundation KEEP
Specialization KEEP
```

새 Augment는 2-8에서 지급하지 않는다.

### VERIFIED — Boss / Sector Flow

공통 Boss Flow에 따르면 각 Sector에는 Boss가 1개 존재하지만,
Stage 08 내부에 Boss를 임의로 넣지 않는다.

기획자가 지정한 Boss 진입에서:

```text
General Timer 종료
→ Remaining Time 폐기
→ Boss Timer 시작
```

보스 처치 뒤 다음 Sector에 진입하며 새 General Timer가 시작된다.

따라서 Sector 03의 정확한 시작 전환은
Sector 02 Boss 위치가 확정된 뒤 최종 고정한다.

---

## 1. Sector 03 한 줄 정의

**꺼지고 낡은 Worker District를 벗어나 전력과 광고, 상점 자동화, 보안 시스템이 여전히 살아 있는 밝고 깨끗한 Commercial District에 도달한 Player가, Rope로 거대한 Atrium과 쇼핑·서비스 구조를 가로지르며 “위쪽 공간은 왜 정상적으로 유지됐고 누가 이 경로의 Priority를 가졌는가?”를 추적하는 Sector.**

---

## 2. Sector 03의 핵심 차별화

Sector별 대표 질문:

```text
SECTOR 01
“Rope를 사용할 수 있는가?”

SECTOR 02
“움직이는 Threat 속에서 어떤 Route를 선택할 것인가?”

SECTOR 03
“공간 자체가 Route를 허용하거나 차단하면
언제, 어디로 Rope를 걸 것인가?”
```

### Sector 02

```text
Enemy Position
changes Route Choice
```

### Sector 03 후보

```text
Security State
changes Route Availability / Exposure
```

즉:

```text
STATIC ARCHITECTURE
↓
POWERED / REACTIVE ARCHITECTURE
```

로 진화한다.

---

## 3. Reference Scan

### SANABI — VERIFIED / TRANSFER

SANABI의 공식 소개는 Chain Hook을
빠른 이동과 적 처치 모두에 사용하는 핵심 도구로 설명하며,
총알과 Trap 사이를 이동하는 전투·이동 결합을 강조한다.

### TRANSFER

Sector 03에서 새 보안 요소가 생기더라도:

```text
Rope Traversal
+
Threat Reading
```

이 하나의 판단이어야 한다.

Scanner를 끄고 나서 Platforming,
Platforming 후 Combat처럼 분리하지 않는다.

---

### Rusted Moss — VERIFIED / TRANSFER

개발진은 게임 전체를 하나의 Grapple Core 중심으로 만들고,
후속 능력 역시 Grapple Traversal과 시너지를 내도록 설계했다.
같은 Challenge가 여러 방식으로 해결되는 것을 적극 허용했다.

### TRANSFER

Commercial Security는:

```text
특정 Build Key
```

가 아니라:

```text
Safe Solution
Flow Solution
Build-Expressive Solution
```

을 만드는 압력이어야 한다.

---

### Celeste — VERIFIED / TRANSFER

Celeste는 Coyote Time, Input Buffer, Corner Correction 등
Player 의도를 유리하게 해석하는 보정을 사용한다.

### TRANSFER

Sector 03에서 움직이는 Shutter / Scanner처럼
Timing 요소가 추가되더라도
프레임 단위 정확도를 요구하지 않는다.

권장:

```text
clear warning
+
forgiving transition window
+
nearby recovery
```

---

### Metanet N — VERIFIED / TRANSFER

Metanet은 더 현실적인 물리 반응보다
단순한 모델이 실제 플레이에서는 더 재미있었다고 설명한다.

### TRANSFER

Commercial District의 자동문, 광고판, 에스컬레이터, 보안 장치가
시각적으로 복잡하더라도 실제 Gameplay State는 단순하게 유지한다.

예:

```text
OPEN
WARNING
CLOSED
```

정도의 명확한 상태.

---

## 4. Sector 03 Story Question

Sector 02 종료 질문:

> **“왜 C만 멈췄지?”**

Sector 03 시작 질문:

> **“그렇다면 A/B와 Priority Access는 누구를 위한 것이었지?”**

Sector 03 전체에서 답을 완전히 주지 않는다.

### Sector 03이 밝혀야 할 것

1. Commercial District는 Worker District보다 전력 유지 상태가 훨씬 좋다.
2. 이 구역의 대피 / Transit 시스템에는 Priority Tier 또는 Access Tier가 실제로 존재했다.
3. 일부 Commercial Transfer / Service가 Incident 후에도 더 오래 유지됐다.
4. 자동화 시스템은 사람이 사라진 뒤에도 정상 고객 / 권한 사용자처럼 행동한다.
5. 상부 Resource Allocation이 균등하지 않았다는 정황이 강해진다.

### 아직 밝히지 않을 것

- Executive 개인 명령
- Group A/B의 정확한 계급 정의
- 고의적 Worker 희생
- 사고 자체가 회사의 계획이었다는 주장
- Corporate Sector의 최종 진실
- Rooftop Escape 결말

---

## 5. Sector 03 Story Tone

Worker District:

```text
사람의 흔적
+
전력 부족
+
기다림
+
중단
```

Commercial District:

```text
상품은 남아 있음
+
전력은 살아 있음
+
광고는 계속 재생
+
사람은 없음
```

핵심 불안:

> **“사람은 사라졌는데 소비 시스템은 정상 작동한다.”**

악당 방송이나 직접적인 풍자 문구보다
정상적인 자동 시스템이 공허하게 작동하는 느낌을 우선한다.

---

## 6. Visual Direction

### Sector 02

```text
WARM BUT DIM
WORN
LIVED-IN
RESIDENTIAL
```

### Sector 03

```text
BRIGHTER
POLISHED
POWERED
EMPTY
COMMERCIAL
```

### Palette

Base:

```text
Deep Navy
Graphite
Polished Dark Gray
Cool Concrete
```

Commercial Light:

```text
Muted Magenta
Warm White
Gold / Amber
Desaturated Teal
```

Gameplay:

```text
Rope / Grapple = CYAN
Danger / Security = RED / ORANGE
Player Scarf = RED
```

### 중요

Commercial이라고 해서 화면 전체를 Neon으로 만들지 않는다.

```text
Gameplay Cyan
Security Red/Orange
```

의 가독성을 유지하기 위해
광고의 Cyan 사용은 강하게 제한한다.

---

## 7. Architecture Direction

Sector 03 대표 공간:

- vertical shopping atrium
- retail balcony
- service corridor
- automated storefront
- food court terrace
- advertisement bridge
- premium transit lobby
- customer service spine
- maintenance duct behind polished facade
- luxury / high-service commercial terrace

### 형태

```text
VERTICAL ATRIUM
+
OPEN VOID
+
POLISHED BALCONY
+
ACTIVE DISPLAY
+
BACK-OF-HOUSE SERVICE FRAME
```

### 금지

- 현대식 평평한 Mall Floor만 반복
- Sector 02와 동일한 주거 Balcony 반복
- Sector 04의 Transit Infrastructure를 미리 전부 소비
- Sector 05 Corporate Office처럼 보이는 보안 시설 중심 구성

---

## 8. Gameplay Core Candidate — ACTIVE SECURITY STATE

### HYPOTHESIS

Sector 03의 새 Gameplay 축 후보:

```text
SCANNER / SECURITY SHUTTER
```

### 핵심

Player에게 새 버튼을 요구하지 않는다.

Security State가:

```text
OPEN
→ WARNING
→ ACTIVE / CLOSED
→ RESET
```

처럼 변하며
Rope Route의 타이밍을 바꾼다.

### 왜 Commercial에 맞는가

이 구역은 전력이 살아 있고
고객·상품·접근등급을 관리하는 자동 보안이 계속 작동한다.

따라서:

```text
POWERED ARCHITECTURE
```

가 Gameplay로 느껴진다.

### 아직 LOCK하지 않는 것

- Scanner가 Damage를 주는지
- Scanner가 Alarm만 발생시키는지
- Shutter가 물리적으로 Route를 막는지
- Scanner와 Shutter를 둘 다 쓰는지
- 정확한 Timing
- 정확한 시각 효과

3-1~3-2 상세 설계 전에 하나로 축소해야 한다.

---

## 9. New Mechanic Budget

Sector 03에서 새로운 Gameplay 요소를 많이 넣지 않는다.

권장:

```text
ONE PRIMARY NEW SYSTEM
```

만 도입.

후보 우선순위:

### OPTION A — SCANNER SWEEP

```text
Scanner Beam이 공간을 Sweep
→ Player가 Timing / Route 변경
```

장점:

- Commercial Security Theme 명확
- Rope Movement와 결합 쉬움
- 기존 Drone과 조합 가능

위험:

- 단순 Laser Hazard처럼 보일 수 있음
- Damage Beam이면 Bullet/Trap 과밀 가능

### OPTION B — SECURITY SHUTTER

```text
OPEN
→ WARNING
→ CLOSED
→ OPEN
```

장점:

- Route Availability를 직접 바꿈
- 환경 자체가 움직이는 느낌

위험:

- Moving Platform / Transit Mechanic과 경계가 흐려질 수 있음
- Player 끼임 문제

### 초기 권장

```text
SCANNER STATE
+
STATIC GEOMETRY
```

부터 검증.

즉 처음에는 실제 Collision Shutter보다
**보이는 보안 상태가 Route Timing을 바꾸는 구조**가 안전하다.

---

## 10. Enemy Progression 원칙

### Sector 02에서 이미 가진 것

```text
Patrol Drone T1
```

Sector 03에서 곧바로:

```text
Drone T2
Armored Drone
Fast Drone
Laser Drone
```

를 추가하지 않는다.

### 권장

3-1~3-2:

```text
Patrol Drone T1 재사용 또는 Enemy NONE
```

3-3 이후 필요성이 확인되면
새 Security Enemy를 별도 기획.

### 새로운 적을 추가할 조건

새 적이 반드시 새로운 질문을 만들어야 한다.

나쁜 이유:

```text
Sector가 바뀌었으니 새 몹 필요
```

좋은 이유:

```text
Commercial Security State와 Rope Geometry를
기존 Drone으로는 만들 수 없는 새로운 판단이 필요
```

현재는 미확정.

---

## 11. Build Progression 원칙

Sector 03 시작 상태:

```text
FOUNDATION
+
SPECIALIZATION
```

### 중요한 질문

Sector 03에서 다음 성장 Node를 줄 것인가?

현재는 **OPEN**.

가능한 장기 로드맵:

```text
FOUNDATION
→ SPECIALIZATION
→ SECONDARY / DEEP SPECIALIZATION
→ HYBRID
→ CAPSTONE
```

### 권장

Sector 03 Master Plan 단계에서는
새 Augment Tier의 정확한 위치를 LOCK하지 않는다.

먼저:

1. Sector 02 Specialization이 충분히 표현되는가
2. Run이 성장 부족으로 느껴지는가
3. 3-1~3-3 Gameplay가 현재 Build만으로 충분히 다양한가

를 Playtest 후 결정.

---

## 12. Sector 03 Stage Progression — REV 1.0 후보

| Stage | Working Name | Role | Difficulty | Enemy | New Mechanic |
|---|---|---|---|---|---|
| 3-1 | POWERED PROMENADE | Sector Transition / Commercial Reveal | ★★ | NONE | NONE |
| 3-2 | SCANNER GALLERY | First Active Security State | ★★☆ | NONE | Scanner 후보 |
| 3-3 | RETAIL SECURITY WALK | Scanner + Patrol Drone | ★★★ | 1 Patrol Drone | NONE |
| 3-4 | SERVICE ARCADE | Multi-Route / Front-of-House vs Service Route | ★★★ | 1 Patrol Drone | NONE |
| 3-5 | COMMERCIAL SERVICE NODE | Rest / Growth Decision | REST | NONE | Growth Tier TBD |
| 3-6 | PREMIUM ATRIUM | Large Open Flow + Security Timing | ★★★☆ | 1 Patrol Drone | NONE |
| 3-7 | PRIORITY CONCOURSE | Story Pressure + Security Synthesis | ★★★☆ | 1–2 Patrol Drone | NONE |
| 3-8 | UPPER MARKET GATE | Sector General Finale / Story Climax | ★★★★ | 2 max, separated | NONE |

### 주의

이 표는 **HYPOTHESIS**다.

3-1 상세 작성 전:
- Scanner 필요성
- Growth Node 위치
- 3-8 Story Climax 정보량

을 다시 검토한다.

---

## 13. 3-1 — POWERED PROMENADE

### Role

Sector 02의 어둡고 worn한 Worker District와
Commercial District의 전력 상태를 비교.

### Gameplay

Enemy 없음.

새 Mechanic 없음.

기존 Rope로:

- polished balcony
- atrium bridge
- advertisement frame
- service beam

을 이동.

### 핵심 Story

Player가 처음 느끼는 것:

> **“여긴 불이 들어와 있다.”**

광고 Display가 정상적으로 재생되지만
사람은 없다.

### 금지

- Priority Tier 상세 공개
- Scanner Tutorial
- 새 적
- 새 Augment

---

## 14. 3-2 — SCANNER GALLERY

### Role

Sector 03의 새 시스템 후보를 한 가지씩 소개.

### HYPOTHESIS

첫 Scanner는:

```text
SEE
→ WARNING
→ SWEEP
→ CLEAR
```

가 명확해야 한다.

Enemy 없음.

Scanner가 실제 Damage를 주기보다
초기에는:

```text
Detection / Route Timing Pressure
```

로 시작하는 방향을 우선 검토.

### 핵심 질문

> “빛의 움직임을 보고 Rope Commit Timing을 바꿀 수 있는가?”

---

## 15. 3-3 — RETAIL SECURITY WALK

### Role

Scanner 후보 + 기존 Patrol Drone T1 결합.

### Enemy

```text
Patrol Drone T1 × 1
```

### 원칙

Scanner와 Drone이 동시에 Player를 처벌하는
Bullet Chaos를 만들지 않는다.

Scanner State를 읽으면
어느 Route가 안전한지 바뀌는 구조.

---

## 16. 3-4 — SERVICE ARCADE

### Role

Commercial District의 핵심 공간 선택.

```text
FRONT-OF-HOUSE
vs
BACK-OF-HOUSE
```

### Route

#### PUBLIC ROUTE

- 밝음
- 넓음
- Security Exposure 높음
- 이동은 직관적

#### SERVICE ROUTE

- 좁지만 Gameplay Choke 금지
- Maintenance Frame
- Rope Geometry 풍부
- Security Exposure 낮거나 다름

### 중요한 Story 의미

주인공이 Technician이기 때문에
화려한 Commercial facade 뒤의
Service Infrastructure를 읽을 수 있다.

하지만:

```text
Maintenance Access = 모든 권한 해제
```

가 아니다.

---

## 17. 3-5 — COMMERCIAL SERVICE NODE

### Role

Rest / possible Growth.

### 현재 OPEN

다음 중 하나:

```text
A. Second Specialization
B. Secondary Augment
C. Hybrid Eligibility
D. No Augment — Rest / Story only
```

현재는 확정하지 않는다.

### 결정 기준

Growth가:

```text
새 버튼
```

이 아니라 기존 Rope Behavior를 깊게 만드는지 확인.

---

## 18. 3-6 — PREMIUM ATRIUM

### Role

Sector 03의 Movement Enjoyment + Visual Scale.

2-6처럼 완전 Relief은 아니지만,
넓은 Commercial Void에서:

```text
large arc
+
scanner timing
+
route choice
```

를 즐긴다.

### Story

Worker District보다:

- 전력
- 조명
- 청결
- 서비스 자동화

가 훨씬 잘 유지돼 있음을 강화.

직접적인 계급 설명 없음.

---

## 19. 3-7 — PRIORITY CONCOURSE

### Role

Sector 03 Story Build-up.

### Story 후보

처음으로:

```text
ACCESS TIER
PRIORITY ROUTE
SERVICE CLASS
```

같은 시스템 언어를 더 구체적으로 보여줄 수 있다.

그러나:

```text
GROUP A = 특정 계층
```

을 직접 확정하지 않는다.

### Gameplay

Scanner / Drone / Multi-Route 종합.

2-7과 동일한 두-Encounter 구조를 그대로 반복하지 않는다.

---

## 20. 3-8 — UPPER MARKET GATE

### Role

Sector 03 일반 진행 Finale.

### Gameplay

```text
Commercial Atrium
+
Active Security State
+
Patrol Drone
+
Multi-Route
+
Build Expression
```

종합.

Boss는 이 Stage 내부에 넣지 않는다.

### Story Climax 후보

Sector 03이 끝날 때 Player가 알아야 할 것은:

> **Priority Access가 일회성 경고문 하나가 아니라,
> 상부 Commercial 공간의 여러 접근 제어 기록과 반복해서 함께 나타난다.**

이 단계에서는 이것이 Group C의 중단 원인이라고 확정하지 않는다.

정도.

### 아직 공개하지 않음

- Corporate 책임자의 이름
- 구체적 희생 명령
- 사고 조작
- 최종 음모

---

## 21. Sector 03 Gameplay Progression

```text
3-1
POWERED SPACE
“여긴 살아 있다.”

↓

3-2
ACTIVE SECURITY
“공간에도 상태가 있다.”

↓

3-3
SECURITY + MOVING THREAT
“State와 Enemy를 같이 읽는다.”

↓

3-4
FRONT / SERVICE ROUTE
“화려한 길과 설비 길의 조건이 다르다.”

↓

3-5
REST / GROWTH
“현재 Build를 다시 정리한다.”

↓

3-6
LARGE ATRIUM EXPRESSION
“큰 공간을 Timing과 Rope로 가로지른다.”

↓

3-7
PRIORITY ROUTE PRESSURE
“보안 시스템의 Access Tier가 보인다.”

↓

3-8
SECTOR SYNTHESIS
“Commercial Security 전체를 내 Build로 돌파한다.”
```

---

## 22. Sector 03 Story Progression

```text
3-1
Worker District와 달리
Commercial District는 전력이 살아 있다.

↓

3-2
상업시설 Security도 정상 작동한다.

↓

3-3
사람은 없지만
고객 / 접근 권한을 전제로 시스템은 계속 작동.

↓

3-4
공공 공간 뒤에
Maintenance / Service Infrastructure가 존재.

↓

3-5
Rest / Growth 구간.
새 Story 정보는 최소화하고,
필요할 경우 기존 Access 표시가 상업공간 전반에 반복된다는 정도만 강화.

↓

3-6
상부 공간의 Resource 상태가
Worker District와 현저히 다름.

↓

3-7
Priority / Access Tier가
Commercial 이동 체계에 구조적으로 존재함을 확인.

↓

3-8
Group A/B/C의 서로 다른 Transfer 결과와
Access Tier 기록이 같은 상부 이동 환경에 병치되어 있었음을 확인.

둘 사이의 직접적인 인과관계는 아직 확정하지 않는다.
```

Sector 종료 질문 후보:

> **“Priority는 누구에게 주어졌고, 누가 그 규칙을 만들었지?”**

---

## 23. Graphics / Asset Direction

### Player / Gameplay

기존 규칙 유지.

```text
Player Human Scale 32×32–48×48
Patrol Drone 24×24–32×32
Gameplay Tile 32×32
Anchor Cue 24×24 권장
```

### Commercial Near Props

- display panel
- storefront frame
- escalator shell decoration
- vending / kiosk
- table / chair cluster
- premium sign
- service hatch
- advertisement lightbox
- access scanner housing

### Mid

```text
128×128–256×256
```

- retail modules
- atrium bridge
- food court block
- service spine
- large billboard structure

### Far

```text
512×288
or
960×540
```

- bright commercial vertical atrium
- repeating retail terraces
- distant upper-city glow

---

## 24. Background / Collision Rule

Commercial District는
Sector 02보다 훨씬 시각적으로 복잡할 가능성이 높다.

따라서:

```text
VISUAL COMPLEXITY
≠
COLLISION COMPLEXITY
```

를 더 엄격히 적용한다.

기본 Non-Collision:

- advertisement screen
- table
- chair
- storefront trim
- hanging sign
- decorative glass frame
- cable
- escalator shell
- mannequin / display prop
- light fixture

### 중요

광고 Frame과 Neon Strip이
Grapple Anchor처럼 보이면 실패.

Cyan Commercial Advertising는 제한.

---

## 25. Major Design Risks

### RISK 1 — Sector 02와 차별화 실패

Patrol Drone + Multi-Route만 반복하면
Sector 02의 밝은 버전이 된다.

**대응:**

Active Security State를 검증하되
하나의 단순한 시스템만 도입.

### RISK 2 — Sector 04 영역 침범

Moving Platform / Train / Rail / Transit Timing을
Sector 03에서 너무 많이 쓰면
Sector 04 Transit / Infrastructure의 정체성을 소비한다.

**대응:**

Sector 03은:

```text
SECURITY STATE
```

중심.

Sector 04는:

```text
INFRASTRUCTURE MOTION / TRANSIT
```

로 남긴다.

### RISK 3 — Sector 05 Corporate Story 침범

Commercial에서 기업의 최종 책임과
명령 체계를 너무 많이 공개하면
Sector 05가 약해진다.

**대응:**

Sector 03은:

```text
ACCESS SYSTEM EXISTS
```

까지만.

```text
WHO ORDERED IT
```

는 나중.

### RISK 4 — Neon Readability

광고가 Rope / Danger Telegraph를 덮을 수 있다.

**대응:**

Gameplay Color Ownership 유지.

### RISK 5 — New Mechanic Overload

Scanner + Shutter + Drone T2 + New Augment를
한 Sector에 동시에 넣으면 핵심이 흐려진다.

**대응:**

3-2 전까지 Primary New System 하나만 확정.

---

## 26. Sector 03 PASS Criteria

### Gameplay

- Sector 02와 다른 공간 판단을 요구
- Rope가 여전히 모든 이동의 중심
- 새 버튼 없음
- 새 Rope Mode 없음
- Security State가 Route Choice를 바꿈
- 특정 Build Key 없음
- Safe / Flow / Build Expression 유지
- Recovery 빠름
- Mobile 화면에서도 Security State가 읽힘

### Story

- Powered Commercial Contrast 전달
- Priority / Access Tier 정황 강화
- A/B/C 계급 정체 직접 설명 없음
- Worker 희생 고의성 확정 없음
- Corporate 최종 진실 공개 없음
- Sector 04 / 05의 질문을 남김

### Visual

- Worker District와 즉시 구분
- 밝지만 Gameplay 가독성 유지
- Commercial = Neon Spam이 아님
- Architecture가 Vertical Megastructure로 유지

---

## OPEN QUESTIONS

### 1. Sector 03 Primary New Mechanic

현재 후보:

```text
Scanner Sweep
vs
Security Shutter
```

초기 권장:

```text
Scanner / Detection State 우선
```

3-2 상세 설계 전 레퍼런스와 Prototype 비용을 다시 검토한다.

### 2. Scanner Penalty

미확정.

후보:

```text
A. Direct Damage
B. Alarm / Drone Acquire
C. Temporary Route Lock
D. Pure Timing Hazard
```

처음부터 Damage Laser로 단순화하지 않는 것을 권장한다.

### 3. Sector 03 Growth Node

3-5를 Rest / Growth로 잡았지만
실제 Augment Tier는 미확정.

Sector 02 Specialization Playtest 결과가 필요하다.

### 4. New Enemy

현재 필요성 미확정.

Patrol Drone T1 + Active Security만으로
충분한 변화가 생기면 새 Enemy를 추가하지 않는다.

### 5. Sector 02 Boss → Sector 03 Entry

공통 Boss Flow에 따라
Sector 02 Boss의 위치·정체·전환 순서가 아직 미확정이다.

따라서 3-1의 정확한 Entry Narrative는
Boss 기획 확정 뒤 최종 연결한다.

### 6. Sector 03 Ending → Sector 04

Sector 04는 Transit / Infrastructure다.

3-8에서 Transit을 본격 Gameplay Mechanic으로 소비하지 않고
방향 / 구조 Preview 정도만 보여주는 것을 우선한다.

---

SECTOR 03 / COMMERCIAL DISTRICT MASTER PLAN — REV 1.0
