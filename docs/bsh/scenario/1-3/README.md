# SECTOR 01-3 — SECURITY CHECK

*FIRST SENTRY TURRET / AUTHORED SECURITY ROOM — INTERNAL / LEVEL DESIGN DOC · REV 2.0*

◀ PREV — [SECTOR 01-2 / DOUBLE ANCHOR SHAFT](../1-2/README.md)

정상 직원으로 확인된 플레이어가 허가된 경로를 벗어나면서 처음으로 보안 시스템의 공격 대상이 되는 레벨. 핵심 학습은 하나다.

> **Red Telegraph → 움직여야 한다 → Rope를 타면 자연스럽게 피할 수 있다.**

`TARGET PLAYTEST에서 확정` · `FLOW BOTTOM → TOP` · `ZONES 5 (A–E)` · `ANCHORS 4 (A–D)` · `ENEMIES 1 × SENTRY TURRET` · `NEW TELEGRAPH LANGUAGE` · `NO NEW MOVEMENT / ENVIRONMENT HAZARD / AUGMENT`

## Contents

00. [Level Overview](#00--level-overview)
01. [이 구간의 목적](#01--이-구간의-목적)
02. [ZONE A — Identification](#02--zone-a--identification)
03. [ZONE B — Normal Ascent](#03--zone-b--normal-ascent)
04. [ZONE C — Turret Reveal](#04--zone-c--turret-reveal)
05. [Sentry Telegraph 규칙](#05--sentry-telegraph-규칙)
06. [ZONE D — 첫 실제 선택 구간](#06--zone-d--첫-실제-선택-구간)
07. [Safe / Flow / Recovery Route](#07--safe--flow--recovery-route)
08. [ZONE E — Final Ascent](#08--zone-e--final-ascent)
09. [Anchor별 역할](#09--anchor별-역할)
10. [Blockout 거리 기준](#10--blockout-거리-기준)
11. [카메라와 정보 가독성](#11--카메라와-정보-가독성)
12. [Rope Cut 범위](#12--rope-cut-범위)
13. [난이도와 감정 곡선](#13--난이도와-감정-곡선)
14. [1-3에서 넣지 않는 시스템](#14--1-3에서-넣지-않는-시스템)
15. [현재 구현과의 차이 — VERIFIED](#15--현재-구현과의-차이--verified)
16. [Authored Stage 요구사항](#16--authored-stage-요구사항)
17. [성공 기준](#17--성공-기준)
18. [개발팀 전달용 핵심 요약](#18--개발팀-전달용-핵심-요약)

---

## 00 · LEVEL OVERVIEW

새 `SECURITY CHECK`용 이미지가 아직 전달되지 않았으므로 기존 `COOLING SHAFT` 이미지는 이 문서에서 참조하지 않는다. 새 이미지는 아래 동선을 기준으로 제작하고 `./images/`에 추가한다.

```text
                [ SECURITY GATE ]
                       ↑
                      ● D
                       ↑
                  SAFE ZONE
                ███████████
                       ↑

              ● C  ← FLOW ROUTE
             ╱
            ╱
         ● B                [TURRET]
           ╲                 ↙
            ╲           RED FIRE
         SAFE LEDGE
             │
       RECOVERY DECK
             ↑
            ● A
             ↑
          SCANNER
             ↑
           START
```

| ZONE | 역할 | 플레이 상태 |
|---|---|---|
| A — Identification | 플레이어를 정상 직원으로 확인 | 안전 |
| B — Normal Ascent | 1-2 이동 복습과 마지막 경고 | 안전 |
| C — Turret Reveal | 공격 언어를 순서대로 소개 | 안전한 위협 소개 |
| D — Route Choice | Safe / Flow / Recovery 선택 | 압박과 숙련 보상 |
| E — Final Ascent | 시야 차단과 Gate Override | 긴장 해소 |

## 01 · 이 구간의 목적

1-3에는 새로운 이동 기술이나 환경 Hazard를 추가하지 않는다. 1-2에서 익힌 기본 Rope와 공중 재Attach를 그대로 사용하면서, 처음 등장하는 Sentry Turret의 공격을 읽고 피하는 법만 가르친다.

> **CORE LOOP**
> Turret 전개 → 시선 확인 → Red Telegraph 확인 → Rope 이동 → 이전 위치로 날아가는 탄환 확인

첫 탄환을 피한 플레이어의 반응은 **“와, 피했다.”**여야 한다. **“뭐야, 왜 맞았어.”**가 되면 이 구간의 연출과 배치는 실패다.

적 수를 늘리지 않는다. 하나의 Turret이 공간과 경로에 따라 공격 언어 소개, Safe Route 체류 압박, Flow Route 선택 이유라는 세 역할을 하게 만든다.

## 02 · ZONE A — IDENTIFICATION

플레이어는 가장 아래의 좁은 작업자 검문구역에서 시작한다.

```text
               위쪽 통로
                  ↑

────────────────────
       SCANNER
       │ │ │
────────────────────

          P
        START
```

Scanner를 통과하면 다음 문구가 표시된다.

> `EMPLOYEE VERIFIED`
>
> `ASSIGNED SECTOR : LOWER MAINTENANCE`

이 구간에는 공격이 없다. 시스템이 플레이어를 정상 직원으로 인식했다는 사실부터 보여줘야 이후의 공격에 서사적 이유가 생긴다.

> **WORLD RULE**
> 보안 시스템은 처음부터 플레이어를 적으로 취급하지 않는다. 허가된 하층 정비 구역을 벗어난 행동이 적대 전환의 원인이다.

## 03 · ZONE B — NORMAL ASCENT

Scanner 이후 첫 번째 작은 수직 Chamber다. Anchor A는 Start보다 대각선 오른쪽 위에 둔다.

```text
             ● A

                    Landing A
                   ─────────

       P
──────────────
```

- 아무 위험 없이 1-2의 Swing을 한 번 복습한다.
- 첫 Swing은 편하게 성공할 수 있어야 한다.
- Landing A에 착지하면 자동 방송으로 `RETURN TO ASSIGNED SECTOR`가 나온다.
- 아직 적은 없으며 플레이어는 경고를 무시하고 자연스럽게 위로 진행한다.

> **DESIGN INTENT**
> 이 방송은 스토리상 마지막 경고 기회다. 다음 구간의 공격이 자의적인 함정이 아니라 플레이어 행동에 대한 시스템 반응으로 읽히게 한다.

## 04 · ZONE C — TURRET REVEAL

Landing A 위쪽에는 다음 Anchor B와 벽에 접혀 있는 Turret이 함께 보인다. Turret은 처음에는 비활성 상태다.

플레이어가 정해진 높이의 Trigger를 넘으면 다음 순서로 상태가 바뀐다.

> `ROUTE VIOLATION`
>
> `UNAUTHORIZED VERTICAL TRANSIT`
>
> Turret 전개

```text
                         [T]
                          ↓
                     RED SENSOR

          ● B


             P
────────────────────
```

보이지 않던 적이 갑자기 총을 쏘면 안 된다. 플레이어가 **Turret 등장 → 나를 바라봄 → 빨간 선 → 발사**를 순서대로 확인할 수 있어야 한다.

첫 번째 공격은 플레이어에게 맞히도록 최적화하지 않는다. Red Telegraph를 본 뒤 Anchor B를 잡고 Swing하기만 해도 탄환이 플레이어의 이전 위치를 통과하도록 배치한다.

## 05 · SENTRY TELEGRAPH 규칙

Sentry Turret은 다음 상태를 가져야 한다.

```text
idle → acquire → telegraph → fire → cooldown
```

| 상태 | 플레이어에게 보여야 하는 정보 |
|---|---|
| idle | 접힌 Turret 또는 비활성 Sensor |
| acquire | Turret 전개와 플레이어 방향 회전 |
| telegraph | 명확한 Red Aim Line과 발사 예고 |
| fire | Telegraph가 가리킨 방향으로 Projectile 발사 |
| cooldown | 다음 판단을 할 수 있는 짧은 여유 |

초기 플레이테스트 값은 다음과 같다.

> **HYPOTHESIS**
> `Acquire ≈ 0.3s` → `Aim Warning ≈ 0.8–1.0s` → `Fire` → `Cooldown`

정확한 시간은 플레이테스트 후 확정한다. 현재 공용 전투 설정의 적 탄환 속도 `260`, 피해 `20`, 발사 간격 `1.4초`는 첫 Blockout의 baseline으로만 사용한다.

> **RULE**
> Red Telegraph는 장식이 아니라 약속이다. 탄환은 예고한 방향과 타이밍을 배반하지 않아야 한다.

## 06 · ZONE D — 첫 실제 선택 구간

이 구간부터 레벨은 단순한 A → B → C 선형 구조가 아니다.

```text
                    ● C
                 ╱
      FLOW ROUTE
             ╱

      ● B

                         [T]
                       ↙ FIRE

             ┌────────────
             │ SAFE LEDGE
             │
─────────────┘


        ░░ RECOVERY ░░
```

같은 Turret 하나가 플레이어의 경로 선택에 따라 다르게 작용해야 한다.

- 첫 노출에서는 공격 언어를 학습시킨다.
- Safe Route에서는 너무 오래 머무르는 것을 압박한다.
- Flow Route에서는 Rope를 빠르게 이어갈 이유를 제공한다.

> **CORE PRINCIPLE**
> 적 수를 늘리는 대신 공간과 적의 관계를 늘린다.

## 07 · SAFE / FLOW / RECOVERY ROUTE

### Safe Route

Anchor B를 잡고 중간의 Safe Ledge에 착지한다. 짧은 철골 차폐판이 Turret과 플레이어 사이의 사선을 막아 즉시 피격되지 않는다.

초보자는 여기서 위치를 확인하고 Anchor C를 조준한 뒤 다시 이동할 수 있다. 다만 완전한 안전지대는 아니며 플랫폼 끝으로 나오면 다시 사선에 들어간다.

### Flow Route

1-2에서 연속 Grapple을 익힌 플레이어는 Anchor B에서 착지하지 않는다.

> `B Swing → Release → C Attach`

Turret은 한 번 정도 조준할 수 있지만 발사 전에 플레이어가 사선 밖으로 빠질 수 있어야 한다. 숙련된 이동 자체가 방어 수단이 된다.

### Recovery Route

Anchor C를 놓쳐도 최하단까지 떨어지지 않는다. 바로 아래의 넓은 Recovery Deck에 착지해 B 또는 C를 다시 잡을 수 있다.

계속 서 있으면 Turret 사선에 일부 노출된다.

> **DESIGN PRINCIPLE**
> 실패는 허용하지만 가만히 있는 것은 조금 불리하다. 초보자에게 재도전 경로를 주면서 숙련자의 빠른 Flow를 보상한다.

이 구조는 [Celeste와 TowerFall의 관대한 물리 설계](https://maddythorson.medium.com/celeste-and-towerfall-physics-d24bd2ae0fc5)에서 설명한 forgiveness와 Rusted Moss식 자유로운 해법을 현재 Rope 게임에 맞게 적용한다.

## 08 · ZONE E — FINAL ASCENT

Anchor C 직후에 출구를 두지 않는다. 짧은 수직 상승과 Anchor D를 추가한다.

```text
             SECURITY GATE
             ════════════

                 PANEL ◈

                ● D


     WALL ███
          ███  ← TURRET LOS 차단
          ███

       ● C
```

Anchor C까지 올라오면 큰 설비 벽이 Turret의 시야를 완전히 막는다. 여기서 처음 긴장이 풀린다. Anchor D는 전투가 끝났다는 감각을 주면서 Gate 앞까지 이동시키는 Relief Anchor다.

Gate 앞에 도착하면 다음 문구와 상호작용이 이어진다.

> `ACCESS DENIED`
>
> `RETURN TO ASSIGNED SECTOR`
>
> Service Panel Interact
>
> `MAINTENANCE OVERRIDE`
>
> Gate Open
>
> `VIOLATION LOGGED`

Gate가 열리면 1-3이 끝나고 다음 1-4의 Maintenance Node 구간으로 이어진다.

## 09 · ANCHOR별 역할

| ANCHOR | 역할 | 플레이 경험 |
|---|---|---|
| A — Review Anchor | 위험 없는 복습 | 기존 Swing 감각 회복 |
| B — Decision Anchor | Safe와 Flow Route 분기 | 경로 선택 |
| C — Skill Anchor | 공중 재Attach로 빠른 탈출 | 숙련 보상 |
| D — Relief Anchor | Turret 사선이 끝난 뒤 Gate 이동 | 긴장 해소 |

Anchor A/B/C/D는 단순한 네 개의 갈고리 점이 아니다. 각 Anchor가 레벨의 감정과 선택 리듬에서 하나의 역할을 가져야 한다.

## 10 · BLOCKOUT 거리 기준

정확한 좌표는 플레이테스트 전에 잠그지 않는다. 현재 최대 Attach 거리 `440px`과 lane 폭 `340px`을 기준으로 첫 Blockout의 실질 연결 거리를 다음 범위에서 시작한다.

| 연결 난이도 | 초기 거리 |
|---|---:|
| 안전 연결 | 220–280px |
| 일반 연결 | 280–340px |
| Skill 연결 | 340–390px |

> **HYPOTHESIS**
> 위 거리는 모두 초기 Blockout 범위다. 실제 좌표와 난이도는 플레이테스트 후 조정한다.

필수 Anchor를 최대 사거리 `440px` 가까이에 두지 않는다. Aim 오차와 진입 운동량에 따라 실패 폭이 지나치게 커질 수 있기 때문이다.

## 11 · 카메라와 정보 가독성

카메라는 플레이어보다 다음 판단 정보를 우선한다.

| 구간 | 한 화면에서 읽혀야 하는 정보 |
|---|---|
| Zone C | Player + Anchor B + 접힌 Turret + Trigger 이후 Red Telegraph |
| Zone D | Anchor B + Safe Ledge + Anchor C + Turret 사선 |
| Recovery | Player + 재시도 Anchor + 현재 Turret 사선 |
| Zone E | Anchor C + LOS 차단 Wall + Anchor D + Security Gate |

Turret의 Red Telegraph는 기존 색 규칙에 따라 위험 정보로 사용한다. Rope와 Anchor의 Cyan과 섞이지 않아야 하며, Cover는 사선 차단 여부가 실루엣만으로 읽혀야 한다.

## 12 · ROPE CUT 범위

현재 Projectile은 플레이어 몸뿐 아니라 Rope 선분과 충돌하면 Rope Cut을 일으킬 수 있고, 설정상 Rope 비활성 시간은 `0.6초`다. 그러나 1-3에서는 이를 적극적으로 가르치지 않는다.

첫 Enemy에서 학습할 규칙은 하나다.

> **Red Aim → Bullet → 움직여서 피한다.**

첫 Blockout은 Turret 탄환과 Rope의 교차 가능성을 최소화한다. Rope Cut을 핵심으로 사용하는 적은 이후 Cutter 또는 Jammer 소개 구간에서 별도로 가르친다.

## 13 · 난이도와 감정 곡선

첫 플레이 기준 목표는 다음과 같다.

| 구간 비중 | 목표 경험 |
|---:|---|
| 초반 30% | 거의 실패하지 않는 소개와 복습 |
| 중간 40% | Turret 때문에 긴장하지만 Recovery 가능 |
| 후반 20% | B → C 연속 Grapple 시 매우 빠른 돌파 |
| 마지막 10% | 안전구간과 Gate Override로 긴장 해소 |

전체 곡선은 계속 상승하지 않는다.

> **소개 → 시험 → 선택 → 숙련 보상 → 해소**

플레이 리듬은 `안전 → 위험 등장 → 압박 → 빠른 이동 → 안전`으로 구성한다.

## 14 · 1-3에서 넣지 않는 시스템

새로운 이동 기술 · 새로운 환경 Hazard · 복수 Turret · Drone · Cutter · Jammer · Augment 선택 · Maintenance Node · Moving Platform · Laser Grid · Rope Cut 중심 과제 · 강제 컷신

1-3은 **기본 Rope + Sentry Turret 하나**만으로 재미와 가독성을 검증한다.

## 15 · 현재 구현과의 차이 — VERIFIED

2026-08-13 `main` 기준으로 다음 차이를 확인했다.

### 현재 Enemy는 설계한 Sentry Turret이 아니다

`EnemyObject`의 `enemy-weapon` 능력은 사거리 안의 가장 가까운 플레이어를 찾고 Cooldown이 끝나면 즉시 현재 방향으로 탄환을 생성한다. `scan → aim → warning → fire` 상태와 Telegraph가 없다.

1-3을 구현하기 전에 최소한 Sentry 전용 `idle → acquire → telegraph → fire → cooldown` 상태가 필요하다. 이때부터 일반 Enemy와 Sentry Turret을 구분한다.

### 현재 절차 생성 월드는 authored room을 표현할 수 없다

`WorldGenerator`는 각 Level에 Route Platform 하나를 절차 생성하며, 기본 `enemySpawnInterval = 1`이므로 모든 Level에 Enemy Spawn이 생긴다.

Scanner, Safe Ledge, Recovery Deck, Cover, 역할이 다른 Anchor, Trigger, Gate를 단일 랜덤 플랫폼으로 표현할 수 없다.

## 16 · AUTHORED STAGE 요구사항

현재 절차 생성 Level과 기획된 Authored Stage/Room의 책임을 분리해야 한다. 기존 물리와 Rope 시스템은 그대로 사용하고 배치 데이터만 명시적으로 구성하는 것이 첫 구현 방향이다.

예시 구조:

```text
Sector 01-3
├── platforms[]
├── anchors[]
├── hazards[]
├── triggers[]
└── recoveryZones[]
```

> **IMPLEMENTATION REQUIREMENT**
> 1-3 Blockout은 Scanner Trigger, Safe Ledge, Recovery Deck, LOS Cover, Anchor A–D와 Security Gate를 재현할 수 있어야 한다.

정확한 데이터 Schema와 런타임 소유권은 구현 설계에서 확정한다. 위 배열 이름은 요구되는 배치 능력을 설명하는 예시이며 공개 계약으로 잠그지 않는다.

## 17 · 성공 기준

플레이어가 레벨을 마친 뒤 다음을 이해하면 성공이다.

1. Red Telegraph는 곧 탄환이 날아올 방향을 뜻한다.
2. 멈춰서 피하는 것보다 Rope를 타고 계속 움직이는 편이 자연스럽고 안전하다.
3. Safe Ledge에 착지해 경로를 다시 읽거나, B → C를 연속 연결해 빠르게 통과할 수 있다.
4. 실패해도 Recovery Deck에서 다시 시도할 수 있다.
5. Turret의 위협은 LOS 차단 Wall을 넘으면 끝난다.

첫 탄환의 회피율, Zone D 체류 시간, Safe/Flow Route 선택 비율, Recovery 횟수와 피격 원인을 플레이테스트에서 기록한다.

## 18 · 개발팀 전달용 핵심 요약

Sector 01-3 `SECURITY CHECK`는 1-2에서 익힌 Rope 이동을 처음으로 전투 회피에 연결하는 5구역 수직 레벨이다. Scanner가 플레이어를 정상 직원으로 확인한 뒤, 허가 높이를 넘으면 `ROUTE VIOLATION`과 함께 Sentry Turret 하나가 전개된다.

첫 공격은 `acquire → red telegraph → fire`를 안전하게 보여주고, 플레이어가 Anchor B를 잡아 Swing하기만 해도 이전 위치로 탄환이 지나가게 만든다. Zone D에서는 같은 Turret 하나가 Safe Ledge 체류를 압박하고, 숙련자의 B → C 연속 Grapple을 빠르고 안전한 해법으로 보상한다. 실패한 플레이어는 Recovery Deck에서 즉시 재도전할 수 있다.

Anchor C 위의 설비 벽은 Turret LOS를 완전히 차단하고, Anchor D는 Security Gate까지 이어지는 Relief 구간을 만든다. Gate에서는 `MAINTENANCE OVERRIDE → VIOLATION LOGGED`로 레벨을 마무리한다.

구현 전에는 Sentry 전용 Telegraph 상태와 Authored Stage/Room 배치 기반이 필요하다. Rope Cut은 이번 학습에서 제외하고, 새 이동 기술·환경 Hazard·복수 적·Augment도 추가하지 않는다.

---

## 폴더 구조

```text
.
├── README.md            # 이 문서
└── images/              # 새 SECURITY CHECK 이미지 추가 위치
```

기존 `COOLING SHAFT` 이미지는 새 이미지가 전달되기 전까지 보존하지만 이 문서에서는 참조하지 않는다.

SECTOR 01-3 / SECURITY CHECK — LEVEL DESIGN DOC · REV 2.0
