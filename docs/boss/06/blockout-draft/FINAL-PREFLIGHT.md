# BOSS 06 — FINAL PREFLIGHT

> 상태: **설계 구현 진입 가능 / Runtime 미구현 / Merge Ready 아님**
> 최신 GitHub main 기준: `20e6c22deb6e95d9a5a7e351a95874d931a0a845`

## 1. 최종 판정

Boss06 `CONTINUITY WARDEN`은 **구현 작업으로 넘겨도 되는 설계 상태**다.

단, 다음 두 상태는 구분한다.

- **설계 사전검증:** PASS
- **실제 Runtime / Gameplay View / 1~4인 플레이 검증:** 아직 미실행

따라서 지금부터는 맵 아이디어를 다시 만드는 단계가 아니라 **Runtime 구현 → 실제 Gameplay View → 자동 테스트 → 실플레이 보정** 단계다.

## 2. 기존 보스 문제 재발 방지 판정

| 문제 | Boss06 대응 | 판정 |
|---|---|---|
| 약점이 Boss 내부에 생겨 공격 불가 | 별도 weakpoint 0개, body ImpactTarget 1개 | PASS |
| 보이는 몸과 피격 판정 크기가 다름 | Warden visible body를 96×150 physics envelope 안으로 축소 | PASS |
| Anchor가 보이지만 실제로 안 잡힘 | U1~U8 + RR1/RR3 모두 `role:swing-attack` 요구 | PASS |
| 엉뚱한 발판/장치가 Rope target | Main/Ledge/Emitter/Gate/Warden grappleable false | PASS |
| 발판 단차에 Dash/Charge 걸림 | Main collision deck 단일 flat rectangle | PASS |
| 공간이 좁아 Boss/Player가 끼임 | Warden 96×150 상한 + Main 3120px + Ledge 280px | PASS |
| Boss 이동/공격이 구조물 관통 | 후보 위치/전체 hazard geometry 교차 검사 후 blocked면 취소 | 구현 필수 |
| Recovery가 그림뿐이고 실제 복귀 불가 | RR1/RR3 실제 Rope target + 더 아래는 recoverPlayer | PASS |
| 4인 입장 시 좌측 낙사 위험 | Entry x=1120, 4P body 범위 1045..1195 | PASS |
| LOW Beam에서 위치에 따라 Rope 탈출 불가 | Anchor 재배치, jump-apex direct coverage 전 Main 폭 연속 | PASS |

## 3. Rope / Anchor 최종 수치

Base Rope Reach = `400px`.

Player:
- radius = `15px`
- gravity = `1250`
- jumpSpeed = `440`
- 계산상 jump apex 상승량 ≈ `77.44px`
- Main 위 launch-hand y ≈ `1878.00`
- jump apex launch-hand y ≈ `1800.56`

Upper Anchor:

| Anchor | x | y |
|---|---:|---:|
| U1 | 1300 | 1540 |
| U2 | 1660 | 1510 |
| U3 | 2020 | 1490 |
| U4 | 2380 | 1510 |
| U5 | 2740 | 1540 |
| U6 | 3100 | 1510 |
| U7 | 3460 | 1490 |
| U8 | 3820 | 1540 |

인접 최대거리 = `363.46px`
비인접 `≤400px` shortcut = `0`

### LOW Beam 탈출 가능 범위

Jump apex에서 각 Anchor의 400px 직접 부착 가능 구간을 합치면:

```text
996.51px → 4123.49px
```

실제 Main에서 Player center가 설 수 있는 범위:

```text
1015px → 4105px
```

연속 Coverage 판정 = **PASS**

즉 Main 어느 위치에 있더라도 **점프 1회 이내에 최소 1개 Upper Anchor를 직접 잡을 수 있는 배치**다.

## 4. Anchor / 발판 충돌

24×24 materialized Grapple Target과 실제 solid surface 교차:

```text
0건
```

판정 = **PASS**

Upper Anchor와 Ledge는 충분한 수직 간격을 유지한다.

또한 실제 renderer에서는 Anchor marker를 Warden/Beam보다 나중에 그려 시각적으로 앞에 보이도록 해야 한다.

## 5. Warden 크기 / 이동 공간

실제 solid envelope 상한:

```text
width  <= 96px
height <= 150px
```

Main에서 Warden center 허용 x:

```text
1048 .. 4072
```

Ledge 아래 clear height = `234px`
Warden가 Main에 서 있을 때 머리 위 잔여 여유 = `84px`
280px Ledge 위 Warden 좌우 여유 = 약 `92px`씩

규칙:
- `canGroundActors:false`
- `ropeAttachment:false`
- Shield/Baton은 solid collider에 포함하지 않음
- Charge/Dash 공격 판정은 hazard geometry로 분리

## 6. 이동형 Boss 공간 교훈 반영

이동형 Boss는 실제 플레이테스트 뒤 Arena를 충분히 확보하고,
Boss body/회전 Polygon/hazard가 현재 구역 밖으로 나가지 않게 제한했으며,
재배치 후보가 구조물과 겹치면 관통 이동을 하지 않도록 수정됐다.

Boss06에도 같은 안전 원칙을 적용한다.

### Warden 이동

모든 Ground Dash / Charge:
- 시작/끝 Warden body가 Main collision 위에 있어야 함
- entire body bounds가 combat x 범위 안
- Gate/Emitter/Ledge collision과 교차 금지
- 막히면 target 위치로 순간이동하지 않고 행동 취소/Recovery

### 대각선 Dash

- Ledge landing candidate 전체 96×150 body가 Ledge 위에 완전히 들어가야 함
- landing path가 solid geometry를 관통하면 Dash 선택 금지

### 공격 Hazard

- Baton / Bash / Charge hazard는 현재 전투 Arena 밖으로 나가지 않음
- Security Beam은 정해진 x/y band만 사용
- Recovery Player는 Warden direct target 후보에서 제외

## 7. 4인 공간

현재 실제 Boss portal spacing은 Player radius 기준 `40px`.

Entry x=`1120`에서 4명 center:

```text
1060, 1100, 1140, 1180
```

실제 body 외곽:

```text
1045 .. 1195
```

Main x=`1000..4120` 내부이므로 **PASS**.

R3 fall/catch 폭도 180px에서 `240px`로 늘려 복수 Player 추락 시 여유를 확보했다.

## 8. Recovery

R1:
- x=`540..1000`
- RR1=`(770,2000)`
- sampled deck point 최대 직접 Rope 거리 ≈ `368.57px`

R3:
- x=`4120..4360`
- RR3=`(4240,2000)`
- sampled deck point 최대 직접 Rope 거리 ≈ `312.00px`

둘 다 400px 이내.

R1/R3 아래까지 놓치면 숨은 중앙 발판을 만들지 않고 `recoverPlayer()` fallback을 사용한다.

## 9. Beam

LOW:
- flat Main standing body band와 실제 overlap
- Main combat 폭 전체를 덮음
- 해법 = 점프 + Upper Anchor

HIGH:
- Upper Player movement band를 차단
- Main standing band는 안전
- 해법 = Rope release → Main

연속 Beam:
- 최대 3연속
- Telegraph 시작 시 전체 순서 표시
- Security active 중 Warden 직접 공격 OFF

## 10. 카메라

현재 최신 `GameApp` Boss camera focus는
`boss-carriage`, `boss-security-hub`, `boss-continuity-core`만 명시적으로 찾는다.

따라서 Boss06 구현 시 `continuity-warden`을 generic Boss focus 대상으로 추가해야 한다.

Gameplay View 최종 Gate:
- Guard = Warden + Shield 방향 + 뒤쪽 Anchor
- Charge = Telegraph + 전체 진행 방향 + Rope 회피 Anchor
- Security = Telegraph + Player + 다음 safe band

한 화면에서 동시에 판독되지 않으면 좌표 또는 camera shot을 다시 조정한다.

## 11. 피격

Boss06는 별도 약점이 없다.

필수 test:
- neutral front/rear → damage
- guard front → 0
- guard rear → damage
- counter front → 0 + Bash
- counter rear → damage
- Charge recovery → normal damage
- body ImpactTarget position == Warden collision body position
- Boss06 ImpactTarget count == 1

현재 공통 Boss impact adapter는 hit position을 Warden runtime에 전달하는 확장이 필요하다.

## 12. 종료

`6-8 content boundary → Boss06 → Gate/Bridge → Shuttle → Boarding → beginCompletion()`

Regular `6-9`는 만들지 않는다.

Terminal Boss transition은 현행 일반 Boss source/target landmark 경로와 다르므로 Boss06 구현 작업에서 별도로 추가한다.

## 13. 최종 HARD GATE

다음 중 하나라도 발생하면 Merge 금지.

- dummy weakpoint 추가
- Warden visual body와 hit body가 크게 불일치
- Warden collider >96×150 without re-QA
- Main collision deck 2개 이상
- actual grapple set가 U1~U8+RR1+RR3와 다름
- Anchor가 solid geometry 안에 생성
- Main 위치 중 LOW 회피 Anchor direct coverage가 끊김
- Dash/Charge/Reposition이 solid를 관통
- Emitter/Beam이 solid collision
- Warden이 grapple target 또는 ground surface
- 4P entry/recovery body overlap
- Gameplay View에서 공격 Telegraph와 대응 Anchor가 동시에 안 보임


# Damage-loop 재검증

기존 Final Preflight 이후 Player의 실제 피해 방식(Rope Impact)을 추가 검증했다.

- Base Rope Reach = 400
- Swing Impulse = 780
- Impact threshold = 620
- 최종 U1~U8 인접 최대 = `363.46px`
- Warden legal Main x 전체의 nearest Anchor 최악 거리 = `380.43px`
- 25px 샘플 simplified pendulum preflight = `121/121`
- 최소 성공속도 = `656.98`
- Guard/Counter 양방향 corridor = `1250..3870`
- corridor 좌/우 실패 = `0/0`

판정: **DAMAGE DESIGN PREFLIGHT PASS / RUNTIME PLAYTEST REQUIRED**
