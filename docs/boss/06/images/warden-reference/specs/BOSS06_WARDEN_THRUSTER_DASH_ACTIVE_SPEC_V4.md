# ONE ROPE --- Boss06 `CONTINUITY WARDEN`

## `warden_thruster_dash_active` Art Specification v4

> Production Order: 7 --- `warden_thruster_dash`
>
> 대응 메인 이미지: `네온_사이버_메크_집행자의_돌진_자세.png`
>
> 기준 문서:
> `BOSS06 GRAPHICS PRODUCTION PLAN — Continuity Warden Art Production Spec v1`

------------------------------------------------------------------------

# 1. 핵심 우선순위

## P0 --- 반드시 맞아야 함

-   짧고 빠른 Ground Thruster Dash로 읽혀야 한다.
-   Charge와 혼동되지 않는 짧은 reposition attack이어야 한다.
-   승인된 CONTINUITY WARDEN 외형을 유지한다.
-   Shield와 Baton은 기존 장비를 유지한다.
-   Thruster는 이동 방향을 설명해야 한다.
-   한 장의 메인 이미지이며 설명/UI/시트 형태가 없어야 한다.

------------------------------------------------------------------------

# 2. 캐릭터 유지 규칙

유지:

-   human-scale final boss
-   security helmet / visor
-   industrial security harness
-   left-arm Shield
-   right-hand shock Baton
-   short-range Thruster
-   Graphite body
-   Cold Steel exoskeleton
-   제한적 Cyan accent

금지:

-   horn
-   cape
-   cloth
-   plume
-   giant armor expansion
-   fantasy weapon
-   신규 장비 추가

------------------------------------------------------------------------

# 3. Gameplay Meaning

목표 판독:

> Warden이 짧게 폭발적으로 앞으로 치고 들어온다.

Dash:

-   짧음
-   빠름
-   압축된 자세
-   순간 이동 압박

Charge와 다르게:

-   긴 trail 금지
-   긴 body extension 금지
-   장거리 돌진 느낌 금지

------------------------------------------------------------------------

# 4. 현재 이미지 검수

## PASS

-   Warden 계열 외형 유지
-   Helmet / visor 유지
-   Shield 유지
-   Shock Baton 유지
-   Thruster 방향성 존재
-   짧은 돌진 자세 표현

## 수정 필요

-   Shield가 여전히 전방에서 크게 읽힐 가능성이 있음
-   최종 runtime asset에서는 Shield를 몸 옆으로 더 밀착
-   Thruster trail은 별도 VFX asset으로 분리
-   발 접지감을 더 강화하여 공중 이동처럼 보이지 않게 조정

현재 판정:

**CONCEPT PASS / GAME ASSET POLISH REQUIRED**

------------------------------------------------------------------------

# 5. 제작 구조

Asset:

`warden_thruster_dash_active`

구조:

-   body: separate
-   helmet: baked
-   shield: separate
-   shield arm: separate
-   baton: separate
-   baton arm: separate
-   thruster flame/trail: VFX separate

------------------------------------------------------------------------

# 6. Size / Pivot / Collider

기준:

-   Canvas: 128×192 px
-   World output: 128×192 world px
-   Facing: right
-   Left: flipX
-   Pivot: bottom-center / feet center
-   Body collider: 96×150 world px

규칙:

-   sprite가 collider를 변경하지 않는다.
-   Shield 크기가 hitbox를 결정하지 않는다.
-   Thruster trail이 damage range를 결정하지 않는다.

------------------------------------------------------------------------

# 7. Layer Order

``` text
rear VFX
→ body
→ rear arm
→ shield/baton
→ front arm
→ front VFX
```

Dash:

``` text
rear thruster trail
→ body
→ shield arm
→ shield
→ baton arm
→ baton
→ dust cue
```

------------------------------------------------------------------------

# 8. 검수 체크리스트

## P0

-   [ ] Dash로 즉시 읽힘
-   [ ] Charge와 구분됨
-   [ ] 승인된 Warden 외형 유지
-   [ ] Shield Bash처럼 보이지 않음
-   [ ] Baton 공격처럼 보이지 않음
-   [ ] Thruster 방향 명확
-   [ ] 한 명 / 한 포즈 / 한 장 유지

## 기술

-   [ ] transparent RGBA PNG
-   [ ] 128×192 기준
-   [ ] bottom-center anchor
-   [ ] right-facing
-   [ ] flipX 가능
-   [ ] Runtime timing authority 유지
-   [ ] collider 변경 없음

------------------------------------------------------------------------

# 9. 다음 제작

Production Order 8:

`warden_charge`

필수 차이:

-   Dash보다 긴 body line
-   Dash보다 긴 trail
-   더 committed된 자세
