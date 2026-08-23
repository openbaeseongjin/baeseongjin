# BOSS 06 — PLAYER DAMAGE LOOP PREFLIGHT

> 목적: **Player가 CONTINUITY WARDEN에게 실제로 피해를 넣을 수 있는지** 구현 전에 검증한다.
> 기준 GitHub main: `20e6c22deb6e95d9a5a7e351a95874d931a0a845`
> 판정: **ANALYTICAL PREFLIGHT PASS / 실제 GameSimulation 플레이테스트 필수**

# 1. 실제 피해 방법

Boss06의 기본 피해 수단은 **Rope Impact**다.

현재 Runtime 계약상 피해 발생 조건은 다음 세 가지다.

```text
1. Rope가 붙어 있음
2. Player 속도 >= 620
3. Player collider가 Warden ImpactTarget collider와 실제 겹침
```

따라서 Boss06의 핵심 공격 조작은:

```text
점프 / 위치 잡기
→ U1~U8 중 하나에 Rope 연결
→ Swing Drag
→ Rope를 유지한 채 Warden 방향으로 회전
→ Warden 몸에 고속 충돌
→ HP 감소
```

Rope를 놓고 일반 근접공격을 하는 구조가 아니다.

# 2. 현재 실제 수치

- Base Rope Reach: `400px`
- Swing Impulse: `780`
- Rope Impact 최소속도: `620`
- Player radius: `15px`
- Warden solid/hit envelope 기준: `96×150`
- Main top: `y=1900`
- Ground Warden center: `y=1825`

Swing Drag는 Rope의 접선 방향으로 780 impulse를 직접 준다.
FixedLengthRope는 그 뒤 방사 방향 속도만 constraint로 제거한다.

따라서 **접선 방향 공격 속도 620 확보 자체는 구조적으로 가능**하다.

# 3. Anchor를 공격용으로 다시 낮춘 이유

이전 Anchor는 회피에는 충분했지만 U3/U7이 너무 높아 Ground Warden까지 400px Rope 원이 닿는 범위가 좁았다.

최종 Anchor:

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

인접 최대거리: `363.46px`
비인접 `<=400px` shortcut: `0`

# 4. Warden이 Main 어디에 있어도 공격 Anchor 존재

Warden collider가 Main에서 합법적으로 설 수 있는 center x:

```text
1048 .. 4072
```

이 전체 범위를 연속 샘플링했을 때:

```text
Warden center → 가장 가까운 U1~U8 거리
최악값 = 380.43px
```

즉 Base Reach 400 대비:

```text
여유 = 19.57px
```

가 남는다.

따라서 **Warden이 Main 어느 위치에 있어도 공격용 Rope 원을 만들 수 있는 Anchor가 최소 하나 존재**한다.

# 5. LOW 회피와 공격 진입도 동시에 가능

Player가 Main에서 점프 정점에 도달했을 때 직접 부착 가능한 Anchor coverage:

```text
996.51 .. 4123.49
```

Player center가 Main에서 실제로 설 수 있는 범위:

```text
1015 .. 4105
```

판정: **PASS**

즉 LOW Beam 회피를 위해 올라간 행동이 그대로 **다음 Rope Impact 준비**로 이어질 수 있다.

# 6. 620+ 실제 충돌 가능성 사전 계산

실제 GameSimulation을 대체하지 않는 **보수적 사전 모델**을 따로 돌렸다.

사용한 조건:

- 현재 FixedLengthRope와 동일한 고정 길이 원운동
- gravity `1250`
- Swing Drag 접선 impulse `780`
- Rope length `<=400`
- Player는 점프 정점에서 시작
- 추가 이동 입력 속도는 0으로 가정
- Warden 96×150
- Player radius 15
- 시작점은 Warden에서 수평 최소 180px 떨어짐
- 최소 0.20초 이상 이동한 뒤 충돌만 인정
- 바닥 아래로 내려가면 실패 처리

Warden center를 Main 전 범위에서 `25px` 간격으로 검사:

```text
총 샘플 = 121
실패 = 0
```

성공 충돌 속도:

```text
최저 = 656.98
최고 = 895.53
필요 = 620
```

판정:

> **ANALYTICAL PASS — 전 Main 범위에서 620+ Rope Impact 후보 경로 존재**

단, 실제 hand offset·angular body·collision solver·입력 타이밍을 포함한 Gameplay View 테스트 전에는 `RUNTIME VERIFIED`가 아니다.

# 7. GUARD / COUNTER는 아무 위치에서 쓰면 안 된다

Guard의 해법은 **후면 Rope Impact**다.

따라서 Warden이 극단적인 왼쪽/오른쪽 끝에서 Guard하면 뒤로 돌 공간이 사라진다.

최종 규칙:

```text
GUARD / COUNTER 선택 가능 Warden center:
x = 1250 .. 3870
```

이 구간을 25px 간격으로 검사해:

- 왼쪽에서 들어오는 620+ Impact 실패: `0`
- 오른쪽에서 들어오는 620+ Impact 실패: `0`
- 왼쪽 경로 최저 성공속도: `654.52`
- 오른쪽 경로 최저 성공속도: `654.52`

판정: **PASS**

그래서 Warden facing이 어느 쪽이든 Player가 반대쪽으로 Rope 궤도를 만들어 후면 타격할 수 있다.

Guard/Counter를 사용하려는데 Warden이 이 구간 밖이면:

```text
Guard 선택 금지
→ 다른 공격을 사용하거나
→ 먼저 안전 구간으로 이동
```

한다.

# 8. Charge의 딜 타이밍

Charge는 예외적으로 Arena 끝까지 갈 수 있다.

예:

```text
Warden 오른쪽 Charge
→ Player가 Rope로 위/뒤로 회피
→ Warden 오른쪽 끝 Recovery
→ Warden은 오른쪽을 보고 있음
→ 후면은 왼쪽
→ Player는 왼쪽/상부 Anchor에서 Rope Impact
```

반대 방향도 대칭이다.

따라서 Charge가 끝에서 멈춰도 **자연스럽게 남는 후면 방향이 Arena 안쪽**이라 공격 공간이 유지된다.

# 9. Baton / Dash / Security의 피해 창

Boss06는 “특정 약점이 열렸을 때만 공격”하는 보스가 아니다.

기본적으로 항상 body damage 가능하되:

- GUARD 정면 = 0
- COUNTER 정면 = 0 + Bash
- 그 외 = Rope Impact damage 가능

다만 실제 플레이 리듬을 위해 다음 행동 뒤에는 Warden의 공격이 멈추는 짧은 딜 창이 있다.

```text
Baton 3타 종료
Back Swing 종료
Charge Miss Recovery
Security Sequence 종료
Counter 실패
```

이때 Player는 가장 가까운 Anchor를 이용해 Rope Impact를 시도한다.

# 10. 구현 시 절대 조건

자동 테스트와 Gameplay View에서 반드시 확인:

1. `rope.isAttached === true`
2. `impactSpeed >= 620`
3. Warden body collider overlap
4. 실제 Boss HP 감소
5. Neutral에서 좌/우 Impact 가능
6. Guard 뒤쪽 Impact만 피해
7. Guard 정면 Impact 0
8. Counter 뒤쪽 Impact 피해
9. Counter 정면 Impact 0 + Bash
10. Charge Miss 뒤 실제 Rope Impact 가능
11. Main의 Warden 위치를 100~200px 단위로 옮겨도 최소 한 Anchor에서 피해 가능
12. Warden Ledge 상태도 인접 Anchor를 이용한 실제 Rope Impact 테스트

# 11. 최종 판정

현재 설계는 이제:

```text
회피 가능성만 검증
→ X

회피
+ Anchor 접근
+ Swing 가속
+ Warden collider 도달
+ 620+ 충돌
+ Guard 후면 공략
```

까지 연결된 상태다.

**설계/수학적 사전검증은 PASS.
다음 최우선 작업은 실제 Boss06 Runtime을 만들고 같은 시나리오를 GameSimulation에서 재현하는 것이다.**
