# BOSS 06 BLOCKOUT QA — DAMAGE PREFLIGHT CURRENT

> **V2 SUPERSEDED:** 아래 판정은 V2 좌표 전용이다. V3 검증 상태는 [`../BOSS-06-V3-CONTRACT.md`](../BOSS-06-V3-CONTRACT.md)와 [`VALIDATION.md`](./VALIDATION.md)를 따른다.

> 최신 권위: `DAMAGE-LOOP-PREFLIGHT.md`, `DAMAGE-CHECKS.json`
> GitHub main: `20e6c22deb6e95d9a5a7e351a95874d931a0a845`

## 판정

- 2D Arena topology: **PASS**
- Main collision deck: **PASS — flat rectangle 1개**
- Upper Rope route: **PASS**
- LOW escape direct coverage: **PASS**
- Rope Impact analytical preflight: **PASS**
- Guard/Counter 양방향 후면 공략: **PASS**
- Recovery Rope return: **PASS**
- Runtime Gameplay View: **아직 미검증**
- Merge Ready: **NO**

## 1. Main

```text
x=1000
y=1900
width=3120
height=115
grappleable=true
```

하나의 평평한 collision deck만 사용한다.

## 2. Upper Anchor

| Edge  | Distance |
| ----- | -------: |
| U1→U2 | 361.25px |
| U2→U3 | 360.56px |
| U3→U4 | 360.56px |
| U4→U5 | 361.25px |
| U5→U6 | 361.25px |
| U6→U7 | 360.56px |
| U7→U8 | 363.46px |

- 인접 최대: `363.46px`
- Base Rope Reach: `400px`
- 비인접 `<=400px` shortcut: `0`

최종 좌표:

| Anchor |    x |    y |
| ------ | ---: | ---: |
| U1     | 1300 | 1540 |
| U2     | 1660 | 1510 |
| U3     | 2020 | 1490 |
| U4     | 2380 | 1510 |
| U5     | 2740 | 1540 |
| U6     | 3100 | 1510 |
| U7     | 3460 | 1490 |
| U8     | 3820 | 1540 |

이 높이는 회피뿐 아니라 **Ground Warden에 대한 Rope Impact 가능성**을 확보하기 위해 조정했다.

Warden이 Main에서 합법적으로 설 수 있는 모든 center x에서 nearest Anchor 거리의 최악값:

`380.43px`

Rope Reach 대비 여유:

`19.57px`

## 3. LOW 탈출

점프 정점에서 U1~U8 direct attach coverage:

`996.51..4123.49px`

Player가 Main에서 설 수 있는 center:

`1015..4105px`

따라서 Main 전폭 직접 진입 **PASS**.

## 4. Player Damage

실제 피해 조건:

```text
rope attached
+ speed >=620
+ Player collider overlaps Warden body
→ HP damage
```

사전 pendulum model:

- Warden center x 25px 간격 121 samples
- 실패 0
- 최저 성공속도 656.98
- 실제 GameSimulation 검증은 별도 필수

Guard/Counter:

- 선택 가능 Warden center `1250..3870`
- 좌측 진입 실패 0
- 우측 진입 실패 0

## 5. Recovery

- R1 → RR1 sampled 최대 거리 ≈ `368.57px`
- R3 → RR3 sampled 최대 거리 ≈ `312.00px`
- 둘 다 `role:swing-attack`
- 더 아래 miss는 `recoverPlayer()` fallback

## 6. Grapple 집합

`role:swing-attack` 전용 grapple-target(공중 Rope 이동선)은 정확히:

```text
U1 U2 U3 U4 U5 U6 U7 U8 RR1 RR3
```

Main/Ledge/Gate/Boarding은 공용 지형 규칙에 따라 `grappleable:true`인 일반 solid surface다. Emitter(solid collision 없음)와 Warden은 grappleable 대상이 아니다.

## 7. Runtime에서 반드시 다시 검증

- actual RopeImpactAttack → ImpactTarget → Boss HP 감소
- Guard front block / rear damage
- Counter front Bash / rear damage
- Charge miss punish
- Warden Ledge Rope Impact
- 1P / 4P
- Gameplay View 카메라 가시성
