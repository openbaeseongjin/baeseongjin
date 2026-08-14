# SECTOR 01-1 — SERVICE SHAFT

*BLOCKOUT & PRODUCTION SPECIFICATION · REV 3.1*

> **PRODUCTION SOURCE**
> 구현·카메라·그래픽 검수 때는 먼저 [1-1 Production Alignment](./PRODUCTION-ALIGNMENT.md)를 확인한다. 이 문서의 설계 의도와 Runtime 좌표, 승인 Blockout, 기존 이미지의 사용 가능 범위를 한곳에서 연결한다.

NEXT — [SECTOR 01-2 / DOUBLE ANCHOR SHAFT](../1-2/README.md) ▶

Vertical Grid 사고 직후 하층에 갇힌 정비기사가 폐쇄된 Service Shaft를 Rope만으로 처음 올라가며, 하부 교통은 정지했고 Rooftop Pad 03의 Maintenance Shuttle만 살아 있음을 발견하는 오프닝 레벨.

`ROLE OPENING + BASIC ROPE` · `TARGET 1:30–2:00` · `DIFFICULTY ★` · `GRID 32px` · `BOUNDS 960×960` · `ANCHORS 3 (A–C)` · `ENEMIES NONE` · `INSTANT HAZARD NONE` · `AUGMENTS NONE` · `MID-AIR REATTACH NOT REQUIRED`

## Contents

00. [Stage Overview](#00--stage-overview)
01. [절대 목표와 Sector 학습 순서](#01--절대-목표와-sector-학습-순서)
02. [Stage Grid와 전체 단면](#02--stage-grid와-전체-단면)
03. [ZONE A — Incident Bay](#03--zone-a--incident-bay)
04. [ZONE B — First Hook](#04--zone-b--first-hook)
05. [ZONE C — Release Corridor](#05--zone-c--release-corridor)
06. [ZONE D — Open Swing Void](#06--zone-d--open-swing-void)
07. [ZONE E — Service Control](#07--zone-e--service-control)
08. [전체 이동 Route](#08--전체-이동-route)
09. [Gameplay와 Background Layer](#09--gameplay와-background-layer)
10. [Sprite / Asset 제작 규격](#10--sprite--asset-제작-규격)
11. [색과 정보 위계](#11--색과-정보-위계)
12. [Camera Specification](#12--camera-specification)
13. [Rope 구현과 Blockout 제약](#13--rope-구현과-blockout-제약)
14. [Story Pacing과 Sound](#14--story-pacing과-sound)
15. [실패 형태와 플레이테스트 지표](#15--실패-형태와-플레이테스트-지표)
16. [Blockout Acceptance Criteria](#16--blockout-acceptance-criteria)
17. [Stage Data 초안](#17--stage-data-초안)
18. [1-1에서 넣지 않는 시스템](#18--1-1에서-넣지-않는-시스템)
19. [아트 담당자 전달문](#19--아트-담당자-전달문)
20. [개발팀 전달용 핵심 요약](#20--개발팀-전달용-핵심-요약)

---

## 00 · STAGE OVERVIEW

1-1은 게임 전체의 첫 Authored Stage다. 새로운 학습은 다음 하나의 문법으로 제한한다.

> **MOVE → AIM → ATTACH → SWING → RELEASE → LAND**

세 Grapple의 문제 형태는 서로 달라야 한다.

| ANCHOR | 역할 | 플레이어가 배우는 것 |
|---|---|---|
| A — First Hook | Attach | Rope를 거는 법 |
| B — Release Corridor | Release Timing | Rope를 놓는 법 |
| C — Open Swing | Swing Enjoyment | 운동량과 큰 진자운동을 즐기는 법 |

기존 `1-1` 이미지에는 Anchor 2개와 Turret이 포함되어 있어 REV 3.0과 충돌하므로 계속 `RETIRED`로 보존한다. 현재 Gameplay 화면의 분위기와 상대 크기는 C04 Open Swing을 사용한 [승인 Scenario Art Reference](./images/04_scenario_art_reference.png)를 따른다.

## 01 · 절대 목표와 SECTOR 학습 순서

1-1을 끝낸 플레이어의 머릿속에는 딱 세 가지가 남아야 한다.

1. Cyan 지점에 Rope를 걸 수 있다.
2. Swing하다 놓으면 운동량을 이용해 위로 갈 수 있다.
3. 아래는 막혔고 나는 위로 올라가야 한다.

전투, 빌드, 로그라이크와 기업의 진실은 아직 몰라도 된다. 가장 중요한 감정적 목표는 **“Rope 이동을 한 번 더 해보고 싶다.”**이다.

### Sector 01 학습 순서

| STAGE | 새 학습 |
|---|---|
| 1-1 | 기본 Rope |
| 1-2 | 공중 ReAttach / Rope 연결 |
| 1-3 | 첫 Security / Turret |
| 1-4 | 첫 Augment |
| 1-5 | Augment 활용 |
| 1-6 | Wind |
| 1-7 | 조합 |
| 1-8 | Sector Finale |

> **SCOPE RULE**
> 1-1에 Turret, Fan Wind, Laser, Moving Platform을 당겨오지 않는다. 이후 Stage의 첫 학습 순간을 보호한다.

### 참고 원리

- [SANABI](https://store.steampowered.com/app/1562700/_/?l=english): 이동 장치를 게임 정체성으로 전면에 둔다. 1-1은 첫 30초 안에 Rope를 사용한다.
- [Rusted Moss 개발자 인터뷰](https://blog.playstation.com/?p=393354): 하나의 Grapple 메커니즘에서 숙련과 창의성에 따른 표현이 나오게 한다. 1-1은 성공 조건은 같되 착지 위치와 Swing 품질에 여유를 둔다.
- [Celeste & Forgiveness](https://www.mattmakesgames.com/articles/celeste_and_forgiveness/index.html): 입력과 위치 판정을 플레이어 의도에 조금 유리하게 만든다. 1-1은 넓은 Landing과 가까운 Recovery로 실패 비용을 줄인다.
- [Metanet의 N 기술 자료](https://www.metanetsoftware.com/technique/tutorialsbak.html): 복잡한 현실성보다 반복했을 때 결과를 이해할 수 있는 단순한 충돌 구조를 우선한다.

각 게임의 레벨이나 Rope 물리를 복제하지 않고 위 원리만 현재 Fixed Rope 구조로 번역한다.

## 02 · STAGE GRID와 전체 단면

### Grid와 Bounds

```text
BASE GRID  32px
WIDTH      960px = 30 tiles
HEIGHT     960px = 30 tiles
X          -480 ~ +480
Y             0 ~ -960
```

물리 Grapple 위치까지 반드시 32px 배수일 필요는 없지만 플랫폼, 벽, 문과 배경 구조물은 가능한 한 Grid에 맞춘다.

현재 Rope 최대 Attach 거리는 `440px`이다. 첫 방의 필수 연결은 최대거리를 시험하지 않고 약 `210–300px`에서 시작한다.

### 전체 단면

```text
 Y -960
 ┌─────────────────────────────────────────────┐
 │                                SHAFT 02 →   │
 │                         █████ SECURITY DOOR │
 │                     [ T1 SERVICE TERMINAL ] │
 │                       P4 FINAL SAFE DECK    │
 │                 ────────────────────────    │
 │                                  ▲          │
 │                               ╱             │
 │                         ● C                 │
 │                        ╱                    │
 │            ███████████ STRUCTURAL FRAME    │
 │                                            │
 │           P3 / R3                          │
 │      ───────────────                       │
 │                                            │
 │                           █████████████     │
 │                           CABLE OVERHANG    │
 │                     P2                     │
 │              ──────────────                │
 │                          ╲                 │
 │                           ● B              │
 │                                            │
 │              R2 ─────────────              │
 │                                            │
 │        P1                                  │
 │             ─────────────────              │
 │          ╱                                 │
 │       ● A                                  │
 │                                            │
 │     R1 ─────────                           │
 │                                            │
 │ P0 START                                   │
 │ ────────────────                           │
 │ █ SEALED GROUND ACCESS                     │
 └─────────────────────────────────────────────┘
 Y 0
```

| ZONE | 높이 | 핵심 행동 | 공간 질문 |
|---|---:|---|---|
| A — Incident Bay | 0 ~ -160 | 기본 이동 | 아래는 왜 막혔는가 |
| B — First Hook | -160 ~ -352 | 첫 Grapple | Rope는 어떻게 붙이는가 |
| C — Release Corridor | -352 ~ -608 | Release Timing | 언제 놓는가 |
| D — Open Swing Void | -608 ~ -832 | 큰 Swing | 운동량을 어떻게 활용하는가 |
| E — Service Control | -832 ~ -960 | Story / Exit | 왜 위로 가는가 |

## 03 · ZONE A — INCIDENT BAY

### Blockout

| OBJECT | 권장 위치 / 크기 | 역할 |
|---|---|---|
| Player Spawn | `(-320, -32)` | 시작 위치 |
| P0 Start Platform | `x -416~-160 / y 0`, 192–256×32 | 이동과 점프 시험 |
| Ground Shutter | 96×128–128×160 collision | 아래쪽 탈출 불가 |
| Anchor A | `(-96, -192)` | 첫 Grapple |
| P1 | 오른쪽 위 일부 노출 | 진행 방향 예고 |

첫 Camera Frame에는 `Player + Sealed Ground Access + Anchor A + P1 일부`가 함께 보여야 한다. 플레이어가 시작 1–2초 안에 `왼쪽/아래 = 막힘`, `오른쪽/위 = 진행`을 읽게 한다.

### Story Prop

Start 뒤의 방폭 Shutter에는 다음을 표시한다.

> `GROUND SERVICE ACCESS`
>
> `LOCKDOWN`

근처 작은 작업용 Monitor에는 다음을 표시한다.

> `WORK ORDER`
>
> `VERTICAL GRID SIGNAL INSPECTION`

이 정보로 주인공이 사고 전에 수직 인프라 점검 업무 중이었다는 사실만 전달한다. 강제 Cutscene은 없으며 플레이어는 즉시 움직일 수 있다.

## 04 · ZONE B — FIRST HOOK

### Anchor A

```text
              P1
        ───────────────
                ↗

         PLAYER SWING

             ● A


R1 ───────────────

START ───────────────
```

- Anchor A Visual은 24×24px 권장, 최대 32×32px다.
- 플레이어보다 작게 유지하고 Cyan Grapple Target으로 읽히게 한다.
- Rope에 붙으면 중력으로 자연스럽게 떨어지고 오른쪽 Swing에서 Release해 P1에 착지한다.
- P1은 폭 160–192px, 두께 16–32px로 구성한다.
- 유효 Landing Window는 160px 이상, 즉 Player 폭의 약 3–4배로 둔다.

> **DESIGN GOAL**
> Frame-perfect Release가 아니라 Attach → Swing → Release의 관계를 처음 성공시키는 구간이다.

### Recovery R1

P1 아래에 128–160×16px Maintenance Beam을 둔다. R1은 A보다 조금 아래, Start보다 위에 있으며 A를 즉시 다시 잡을 수 있어야 한다.

첫 실패 비용은 약 2–4초다. 첫 Rope를 놓쳤다고 Start까지 떨어뜨리지 않는다.

## 05 · ZONE C — RELEASE CORRIDOR

Anchor B는 오른쪽 상단, Target Landing P2는 반대쪽 왼쪽 위에 둔다.

```text
               █████████████
               CABLE TRUNK


       P2 ───────────


                       ↖ DESIRED ARC

                           ● B
```

### Cable Overhang

- 크기: 192×32 또는 224×32
- 32px Tile Grid에 맞춘 Collision Geometry
- 접촉 Damage 없음

너무 늦게 Release하면 Cable underside에 부딪혀 운동량을 잃고 R2로 떨어진다. Spike처럼 “피해야 할 위험”이 아니라 **“조금 더 일찍 놓아야 한다”**는 Release Timing을 가르친다.

### Recovery R2

P2 아래에 128–192×16px Catwalk를 둔다.

- B를 다시 잡을 수 있다.
- C로 바로 가는 Shortcut은 만들지 않는다.
- `B 실패 → R2 → B 재시도 → P2` 순서를 유지한다.

P2에 올라서면 시작 지점의 Red Warning Light가 아래 멀리 보여야 한다. 텍스트 없이도 **“꽤 올라왔다”**는 수직 진행 감각을 준다.

## 06 · ZONE D — OPEN SWING VOID

Release Corridor의 촘촘한 구조물을 벗어나 갑자기 큰 빈 공간이 열린다.

```text
                FINAL P3
        ──────────────────



                            ↗
                         PLAYER

                ● C



       LARGE EMPTY VOID



     R3 ─────────────
```

Anchor C Visual은 A/B와 같은 24×24px이지만 주변 Negative Space를 크게 비워 중요도를 만든다. Asset 크기를 키우지 않는다.

P3는 앞선 Landing보다 조금 더 멀고 높지만 Attach 난이도는 올리지 않는다. 플레이어는 기본 속도로 바로 이동하거나 1–2회 Swing해 진폭을 키울 수 있다.

| 플레이 품질 | 허용 결과 |
|---|---|
| 작은 Swing | P3 가까운 부분 착지 |
| 보통 Swing | P3 중앙 착지 |
| 좋은 Swing | 운동량을 유지하며 P3 끝까지 이동 |

아직 한 가지 정답 궤적이나 기획된 공중 ReAttach Shortcut을 요구하지 않는다.

### Recovery R3

C 아래에 약 160×16px Recovery Beam을 둔다. R3에서는 C만 다시 시도하며 B까지 내려가지 않는다.

> **FAILURE RULE**
> 1-1의 추락은 죽음이나 방 전체 Reset이 아니라 한 동작 다시 시도하기에 가깝다.

## 07 · ZONE E — SERVICE CONTROL

P3에 도착하면 Rope Challenge가 끝난다. P4 Safe Deck은 폭 256–320px, 두께 32px로 두고 플레이어가 걸어서 Terminal까지 이동하게 한다.

### Service Terminal

- Visual: 32×64 또는 64×64px
- 작은 Desaturated Cyan / White 화면
- Anchor보다 약한 Cyan 정보 강도

긴 로그 대신 다음 정보를 짧게 순서대로 보여준다.

> `VERTICAL GRID`
>
> `CASCADE FAILURE`

> `SECTOR 01`
>
> `CONTAINMENT IN PROGRESS`

> `ROOFTOP PAD 03`
>
> `MAINTENANCE SHUTTLE`
>
> `STANDBY`

> `LOWER TRANSIT`
>
> `OFFLINE`

플레이어가 **하부 이동 불가 → 상부 Shuttle 가동 → 위로 올라간다**를 스스로 연결하게 한다. 주인공 대사는 없어도 되며 필요하면 `“…Pad 03.”` 한 줄 이하로 제한한다.

### Exit

Service Gate는 64×96–64×128px로 Grid에 맞춘다. `SERVICE SHAFT 02`를 표시하고 뒤쪽에 1-2의 Maintenance Lift Rail을 조금 보여준다. Gate를 통과하면 월드나 런을 다시 만들지 않고 카메라·연출상 짧은 전환만 거쳐 바로 1-2로 이어지며 Cutscene은 없다.

## 08 · 전체 이동 ROUTE

```text
START
 ↓
WALK / JUMP
 ↓
A ATTACH
 ↓
SWING → P1 LAND
 ↓
B ATTACH
 ↓
EARLY RELEASE → P2 LAND
 ↓
C ATTACH
 ↓
LARGE SWING → P3 LAND
 ↓
TERMINAL
 ↓
SERVICE GATE 02
```

첫 플레이 Route는 하나의 명확한 Spine이다. 갈라지는 Flow Route는 1-2에서 처음 본격적으로 소개한다.

| 예상 시간 | 상황 | 학습 |
|---:|---|---|
| 0–10초 | 사고 현장 / 아래 출구 폐쇄 | 위로 가야 함 |
| 10–25초 | Anchor A | Attach |
| 25–40초 | A → P1 | Swing / Release / Land |
| 40–65초 | Anchor B + Overhang | Release Timing |
| 65–90초 | Anchor C + Large Void | 큰 Swing Arc |
| 90–110초 | Terminal | Rooftop Shuttle 목표 |
| 110초 이후 | Gate | 1-2 진입 |

1-1만 따로 실패시키는 구간 Timer는 두지 않는다. Sector 01 공용 Timer는 `1-1` 진입부터 영역 사이에서 계속 감소하고 명시적 Gate 통과 때 시간을 보충하며, 0초부터 하층 붕괴가 상승한다. 정확한 시간·보충량·붕괴 속도는 mock으로 시작해 공동 플레이로 조정한다. 상세 기준은 [`../../../../sector-timer-and-boss-flow.md`](../../../../sector-timer-and-boss-flow.md)를 따른다.

## 09 · GAMEPLAY와 BACKGROUND LAYER

Gameplay Geometry는 쉽고 명확하게, 화면 세계는 거대하고 촘촘한 기업도시 하층 설비로 만든다.

### Gameplay Layer

`P0/P1/P2/P3/P4 + R1/R2/R3 + Cable Overhang + Anchors A/B/C`

Collision Surface는 단순한 직선 Silhouette로 유지한다.

### Far Background

- 권장 통이미지: 512×288 또는 960×540
- 거대한 도시 내부 Shaft Silhouette
- 먼 수직 구조체와 점처럼 작은 작업등
- 깊은 Void
- 가장 낮은 채도와 Contrast, 가장 느린 Parallax

### Mid Background

| COMPONENT | 권장 크기 |
|---|---:|
| Inactive Cooling Fan | 192×192–256×256 |
| Vertical Pipe Cluster | 128×256 |
| Structural Brace | 128×128 |
| Cable Trunk Group | 128×64 / 256×64 |

Cooling Fan은 1-1에서는 비충돌 배경이다. Wind와 Damage가 없으며 1-6에서 실제 Gameplay 요소로 재등장시킨다.

### Near Background

32×32–64×64 Tile로 Wall Panel, 작은 Pipe, Cable Socket, Warning Marking과 Service Hatch를 구성한다. Collision Terrain보다 훨씬 낮은 Contrast로 표현해 발판이나 막힌 길로 오해되지 않게 한다.

## 10 · SPRITE / ASSET 제작 규격

| ASSET | PIXEL 규격 | 상태 / 비고 |
|---|---:|---|
| Player | 48×48 output | Dark silhouette + Red Scarf |
| Anchor | 24×24 권장, 최대 32×32 | Cyan Grapple Target |
| Floor Tile | 32×32 | Collision |
| Thin Platform | 32×16 | 반복 조합 |
| Recovery Beam | 32×16 tile | 4–6칸 |
| Cable Overhang | 32×32 tile × 6–7 | Collision, non-damage |
| Ground Shutter | 64×128+ artwork | Story prop / collision 조합 |
| Terminal | 32×64 또는 64×64 | Interactable |
| Service Gate | 64×96–128 | Interactable |
| Small Monitor | 32×32 | Prop |
| Warning Lamp | 16×16 | Prop |
| Cooling Fan | 192–256 square | Mid background |
| Pipe Module | 64×128 / 128×256 | Background |
| Attach VFX | 32×32 | 절제된 표현 |
| Release VFX | 32×32 | 절제된 표현 |

### Player

현재 Runtime 기준인 `24×24 logical cell → 48×48 game output`을 유지한다. 48×48에서 다음 실루엣이 읽혀야 한다.

- 작은 어두운 몸체
- Red Scarf root
- Grapple arm / device
- 명확한 머리와 몸 방향

얼굴의 작은 디테일보다는 자세, 외곽선, 무게중심과 움직임 방향을 우선한다.

## 11 · 색과 정보 위계

화면에서 먼저 읽히는 순서를 고정한다.

1. Player — Dark body + Red Scarf
2. Rope / Anchor — Cyan
3. Landing Platform
4. Exit / Terminal — Desaturated Cyan / White
5. Background Machinery — Dark Navy / Near-black Blue

Story Warning은 작은 Red / Orange로 사용하되 Player Scarf보다 강하게 만들지 않는다. Cyan은 Rope 언어로 보호하고 배경 Pipe나 장식에 남발하지 않는다.

## 12 · CAMERA SPECIFICATION

| 위치 | 한 화면에서 보여줄 정보 |
|---|---|
| Start | Player + Shutter + A + P1 |
| A Swing | Player + A + P1 |
| P1 | B + P2 + Overhang |
| B Swing | Player + Landing + Overhang |
| P2 | C + P3 일부 |
| C Swing | Player + C + P3 + Large Void |
| P4 | Terminal + Gate |

카메라는 캐릭터 정중앙 추적보다 다음 행동에 필요한 정보를 미리 보여준다. C 구간은 약간 Zoom-out할 수 있지만 48×48 Player가 너무 작게 읽히지 않아야 한다.

## 13 · ROPE 구현과 BLOCKOUT 제약

### 현재 구현 — VERIFIED

2026-08-13 `main` 기준:

- `maxAttachDistance = 440`
- `attachBufferSeconds = 0.1`
- `swingImpulse = 780`
- `player radius = 15`
- Aim Point에서 Surface 최근접점까지 `90px` 이내이며 플레이어로부터 `440px` 이내인 Surface가 Attachment Candidate가 된다.

현재 Rope는 별도 Anchor Object만 잡는 방식이 아니다. 따라서 Cyan Anchor 주변에는 다른 Collision Pipe, 장식 Collision과 복잡한 돌출부를 두지 않는다. 시각과 Collision 모두 Clean Zone으로 만든다.

### No-Impulse Acceptance Test

> **REQUIRED TEST**
> `swingImpulse = 0`으로도 A/B/C를 모두 재미있고 안정적으로 통과할 수 있어야 한다.

현재 추가 Swing Impulse가 있어야만 진행된다면 Stage 배치 통과로 보지 않는다. 기본 Pendulum Feel과 Level Geometry를 먼저 다시 검토한다. 향후 IMPULSE COIL 같은 Augment가 기본 이동의 필수 조건이 되어서는 안 된다.

### 공중 ReAttach

숙련자가 우연히 다른 Surface를 잡는 것을 억지로 막지는 않지만 기획된 Shortcut이나 필수 공중 ReAttach는 넣지 않는다. **“착지하지 않고 다음 Rope를 잡을 수 있다”**는 첫 감동은 1-2에 남긴다.

## 14 · STORY PACING과 SOUND

### Story 전달 지점

| 지점 | 전달 정보 |
|---|---|
| Start | Ground Access Lockdown |
| Mid | 환경 경고음과 사고 설비 |
| End | Vertical Grid Failure + Rooftop Pad 03 |

첫 2분 동안 Story Text를 계속 띄우지 않는다. 실제 텍스트를 읽는 시간은 매우 짧아야 한다.

### Sound

| EVENT | SOUND 방향 |
|---|---|
| Start | 낮은 경보 + 구조물 진동 |
| Attach | 짧고 명확한 Metallic Lock |
| Rope Tension | 아주 약한 Chain / Cable Strain |
| Release | 가벼운 Snap / Whoosh |
| Landing | 금속 플랫폼 충돌음 |
| Terminal | 기계음 감소 + 작은 UI Beep |

1-1에서는 음악보다 Rope 소리가 더 중요한 Gameplay Feedback이어도 좋다.

## 15 · 실패 형태와 플레이테스트 지표

### 예상 실패 형태

| 구간 | 실패 원인 |
|---|---|
| A | Attach를 이해하지 못함 |
| B | Release가 너무 늦음 |
| C | Swing amplitude / trajectory 판단 실패 |

세 실패 원인이 서로 구분돼야 한다. A에서 모든 기술을 동시에 요구하지 않는다.

### 측정값

| METRIC | 목표 |
|---|---|
| A first-attempt attach | 높음 |
| A → P1 attempts | 대부분 1–3회 |
| B failures | A보다 조금 많아도 됨 |
| Recovery → retry time | 5초 미만 |
| C enjoyment | Swing 자체가 재미있다는 반응 |
| Wrong attach | 거의 없음 |
| Tutorial text dependency | 낮음 |
| Bottom reset | 사실상 없음 |
| Terminal comprehension | 왜 위로 가는지 설명 가능 |
| First clear | 약 90초–2분 |

## 16 · BLOCKOUT ACCEPTANCE CRITERIA

| PASS | 기준 |
|---|---|
| 1 — First Read | 회색 박스만으로 시작 2초 안에 A와 위쪽 진행 방향 인지 |
| 2 — No Impulse | `swingImpulse = 0`으로 전 구간 클리어 |
| 3 — First Rope | A를 대부분 첫 시도에 잡고 초보도 1–3회 내 P1 도달 |
| 4 — Release Test | B와 Overhang으로 Release Timing을 자연스럽게 체감 |
| 5 — Swing Enjoyment | C의 큰 진자운동 자체가 재미있음 |
| 6 — Failure Cost | 실패 후 같은 Grapple 재시도까지 5초 이내, 전체 Reset 없음 |
| 7 — Camera | 이동 전에 다음 Anchor와 Landing이 보임 |
| 8 — Story | Terminal 후 플레이어가 위로 갈 이유를 설명 가능 |
| 9 — Length | 첫 플레이 약 90초–2분 |
| 10 — Readability | 배경 추가 뒤에도 Gameplay Layer 판독성 유지 |

이 레벨은 그래픽이 완성됐다는 이유로 PASS하지 않는다.

## 17 · STAGE DATA 초안

아래 구조는 필요한 제작 능력을 설명하는 개념 초안이다. 정확한 JSON Schema와 Runtime 소유권은 구현 설계에서 현재 구조에 맞춰 확정한다.

```yaml
stageId: sector-01-01
name: SERVICE SHAFT

bounds:
  width: 960
  height: 960

spawn:
  x: -320
  y: -32

platforms:
  - P0 start
  - P1 first-landing
  - R1 recovery
  - P2 release-landing
  - R2 recovery
  - P3 final-landing
  - R3 recovery
  - P4 safe-terminal-deck

grappleTargets:
  - A first-hook
  - B release-timing
  - C open-swing

collisionObjects:
  - ground-shutter
  - cable-overhang

interactables:
  - service-terminal
  - exit-gate

storyTriggers:
  - lockdown
  - terminal-read
  - gate-open

cameraZones:
  - intro
  - first-hook
  - release-corridor
  - open-swing
  - terminal
```

1-1 Blockout은 현재 절차 생성 Route Platform만으로 표현할 수 없다. 1-3과 마찬가지로 기존 Rope·물리 시스템을 재사용하면서 Authored Stage/Room 배치 데이터를 수용할 경계가 필요하다.

## 18 · 1-1에서 넣지 않는 시스템

| 제외 요소 | 이유 |
|---|---|
| Turret | 1-3 첫 Security 학습 요소 |
| Drone | Sector 2 이후 |
| Wind | 1-6 |
| Moving Platform | 별도 학습 필요 |
| Augment / Maintenance Node | 1-4 |
| Rope Cutter | 첫 Enemy보다 뒤 |
| Laser | 별도 Hazard 소개 필요 |
| Instant Death Pit | 첫 Rope 경험 방해 |
| 필수 Mid-air ReAttach | 1-2의 정체성 침범 |
| 필수 Swing Impulse | 기본 Rope 검증과 Augment 방향 충돌 |

## 19 · 아트 담당자 전달문

> **32px 타일 기반의 거대한 하층 Service Shaft이며, 작은 48px Player와 24px Cyan Anchor가 풍부한 128–256px 산업 배경 구조물 사이에서 명확하게 읽혀야 한다. Collision Platform은 단순하고 밝게, 배경은 High-bit하게 풍부하지만 저채도·저명도로 처리하며, 화면 중앙의 큰 빈 공간은 Rope Swing 궤적을 위해 의도적으로 남긴다.**

Artwork는 `assets/artwork/`에서 제작하고 검증된 Export만 담당 개발자가 Runtime Package로 정규화한다.

## 20 · 개발팀 전달용 핵심 요약

Sector 01-1 `SERVICE SHAFT`는 게임 전체의 첫 Authored Stage이며 적, 환경 Hazard와 Augment 없이 기본 Rope의 `Attach → Swing → Release → Landing`을 학습시키는 약 90초–2분 길이의 수직 튜토리얼이다.

Stage는 32px Grid의 960×960 Blockout으로 시작한다. Ground Service Access가 봉쇄된 P0에서 출발해 A/B/C 세 Anchor를 각각 독립적으로 사용한다. A는 안전한 첫 Attach, B는 비살상 Cable Overhang을 통한 Release Timing, C는 큰 빈 공간에서 Momentum과 Swing Arc의 즐거움을 담당한다. 각 구간 아래에는 R1/R2/R3 Recovery를 두어 실패한 동작만 5초 안에 다시 시도하게 한다.

마지막 Service Terminal은 `VERTICAL GRID CASCADE FAILURE`, `LOWER TRANSIT OFFLINE`, `ROOFTOP PAD 03 — MAINTENANCE SHUTTLE STANDBY`를 짧게 보여줘 위로 올라갈 명확한 목적을 부여한다. 이후 `SERVICE SHAFT 02` Gate가 열리며 1-2로 바로 이어진다.

최우선 검증은 `swingImpulse = 0`에서도 A/B/C 전체가 재미있고 안정적으로 통과 가능한지다. Gameplay Geometry는 단순하고 명확하게 유지하되 Far/Mid/Near Background는 거대한 기업도시 하층 설비의 밀도를 만든다. 배경을 추가한 뒤에도 Player, Cyan Anchor/Rope와 Landing Platform의 판독성이 유지되어야 한다.

---

## 폴더 구조

```text
.
├── README.md                  # 시나리오와 레벨 설계 의도
├── PRODUCTION-ALIGNMENT.md    # 구현·카메라·아트 검수 계약
└── images/
    ├── README.md              # 이미지별 사용 가능 상태
    ├── 03_approved_blockout.svg
    └── 04_scenario_art_reference.png
```

기존 REV 1.0 PNG는 결정 이력을 위해 보존하지만 `RETIRED`이며 구현과 아트 제작에는 사용하지 않는다.

SECTOR 01-1 / SERVICE SHAFT — BLOCKOUT & PRODUCTION SPECIFICATION · REV 3.1
