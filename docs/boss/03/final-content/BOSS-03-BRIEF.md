# BOSS 03 — 중앙 교환기 점검 시스템
## 핵심 브리프 + 스토리/연출

> 상태: **AUTHORED FINAL CONTENT / RUNTIME NOT IMPLEMENTED**
> AUTHORING SNAPSHOT: `6a8911d354df6b218a64970b5d35d41359ef62f2`
> Sector: **03 CENTRAL EXCHANGE COMPLEX**

## 1. 한 줄 정의

**거대한 중앙 상업·환승 Atrium의 천장 점검기와 건물 자동화 시스템이 동시에 Player를 압박한다. Player는 Scanner의 예측 가능한 상태를 읽으며 Rope Flow를 끊지 않고, 움직이는 두 점검 팔의 Sweep을 피하면서 좌·중앙·우 Route를 선택해 왼쪽 점검 모듈 → 오른쪽 점검 모듈 → 중앙 Core를 차례로 공략한다.**

## 2. TOP 3 우선순위

### 1순위 — Scanner를 이용해 Rope Flow를 끊지 않는 쾌감
핵심은 Scanner를 기다리는 것이 아니라 **WARNING에서 미리 Attach하고 LOCKED 이후에도 현재 Rope를 유지해 계속 이동하는 것**이다.

```text
AVAILABLE
→ WARNING에서 Attach
→ Swing 시작
→ LOCKED
→ 새 Attach는 불가
→ 현재 Rope는 유지
→ 약점까지 Flow 지속
```

### 2순위 — Flow 중 점검 팔 공격까지 동시에 읽는다
Scanner와 Boss Arm은 서로 다른 정보다.

Player는 동시에:
- 지금 어느 Scanner Group이 열려 있는가
- 다음 Arm Sweep은 어느 높이인가
- 어느 Route가 다음 Attach까지 이어지는가

를 판단한다.

### 3순위 — 중앙 Void 전체를 활용하는 대공간 전투
- 중앙 거대 Void
- 좌 Gallery
- 중앙 Fast Route
- 우 Gallery
- 4~5개 층
- P1→P2 Safe Landing
- P2→P3 Safe Landing
- 최종 Atrium 대횡단

Boss02처럼 Player를 직접 따라붙는 보스가 아니라 **공간 전체를 장악하는 보스**여야 한다.

## 3. 변하지 않는 규칙

- Scanner는 끝까지 예측 가능해야 한다.
- Scanner가 Player를 속이거나 임의로 상태를 바꾸지 않는다.
- AVAILABLE / WARNING: 새 Rope Attach 가능.
- LOCKED / RESET: 새 Rope Attach 불가.
- 이미 붙은 Rope는 LOCKED에서도 유지.
- Scanner Damage 없음.
- Scanner Knockback 없음.
- Scanner Rope Cut 없음.
- Forced Detach 없음.
- 새 Player Input 없음.
- 새 Rope Mode 없음.

## 4. 전체 공간

**약 4800×2400 planning space**

```text
                     천장 점검 Rail
        ←──────────── BOSS ────────────→

LEFT GALLERY           CENTRAL VOID           RIGHT GALLERY
██████████                                    ██████████
██████████       MEDIA / AD / SERVICE         ██████████
██████████          FAST ROUTE                ██████████
██████████                                    ██████████
██████████                                    ██████████
```

중앙 Fast Route:
- 광고 프레임
- Media Wall 구조
- Service Rail
- Ceiling maintenance frame

좌·우 Gallery:
- 상황에 따라 어느 쪽이 더 좋은지가 Scanner 상태와 Arm 위치 때문에 계속 달라짐.

## 5. Phase 요약

| Phase | 핵심 판단 | Boss Arm | 목표 |
|---|---|---|---|
| **P1** | WARNING Attach → LOCKED Swing 유지 | 수평 Sweep 1개 | LEFT MODULE |
| **P2** | 좌 / 중앙 / 우 Route 선택 | 서로 다른 높이의 두 Arm 교차 Sweep | RIGHT MODULE |
| **P3** | L/C/R Scanner 상태 + 두 Arm 동시 판단 | 두 Arm 교차 Sweep | CENTRAL CORE |

## 6. P1 — LEFT MODULE

첫 페이즈는 Boss03의 규칙을 가르친다.

Player는:
1. Scanner가 WARNING에 들어갈 때 미리 Attach
2. Arm 수평 Sweep이 들어오기 전에 Swing 시작
3. Scanner가 LOCKED로 바뀌어도 현재 Rope 유지
4. Sweep을 끝까지 피함
5. Arm이 LEFT SERVICE END-STOP까지 과신전
6. LEFT 점검 모듈 노출
7. Rope Impact

P1의 질문:

> **“잠기기 전에 붙고, 잠긴 뒤에도 Flow를 유지할 수 있는가?”**

## 7. P1 → P2

LEFT MODULE 타격 후:
- 왼쪽 점검 Arm 연결부 스파크
- Boss 본체가 천장 Rail을 따라 중앙 쪽으로 재배치
- 좌측 점검 모듈 비활성
- 첫 Safe Landing에서 잠깐 숨 고름

장시간 컷신 없음.

## 8. P2 — RIGHT MODULE

P2부터 세 Route가 모두 의미를 가진다.

### LEFT
- Scanner 상태에 따라 유리할 수 있음
- Gallery 기반 긴 이동

### CENTER
- 가장 짧음
- Media / Advertising / Service structure를 직접 횡단
- Scanner Commit이 가장 중요

### RIGHT
- Gallery 기반
- Arm 상태에 따라 가장 안전한 Route가 될 수 있음

두 점검 팔은 서로 다른 높이에서 교차 Sweep.

Player가 두 공격을 읽고 끝까지 살아남으면 RIGHT SERVICE END-STOP에서 점검 팔이 과신전된다.

RIGHT MODULE 노출 → Rope Impact.

P2의 질문:

> **“지금 열린 길 중 어떤 길이 다음 Sweep까지 Flow를 유지하기 좋은가?”**

## 9. P2 → P3

RIGHT MODULE 타격 후:
- 좌/우 점검 모듈 모두 손상
- 중앙 보호장치 불안정
- Boss 본체 이동이 끊기거나 흔들림
- 두 번째 Safe Landing
- 중앙 Core 보호판이 간헐적으로 열리는 시각 예고

## 10. P3 — CENTRAL CORE

최종 Phase에서는:
- LEFT Scanner Group
- CENTER Scanner Group
- RIGHT Scanner Group

이 서로 다른 시점에 상태가 바뀐다.

방향은:

> **LEFT → CENTER → RIGHT 순으로 상태가 어긋나며 순환**

각 Group은 같은 Scanner 규칙을 사용한다.
랜덤 변화는 없다.

두 Arm의 상·하 교차 Sweep도 동시에 발생.

Player가 교차 Sweep을 한 번 완전히 넘기면:
- 좌/우 모듈 손상으로 불안정하던 중앙 보호장치가 완전히 열림
- CENTRAL CORE 노출

그때 열린 Scanner Route를 따라 Atrium을 크게 횡단해 최종 Rope Impact.

마지막 공격은:
> **Sector03에서 배운 Scanner Timing + Route Choice + Rope Flow를 한 번에 보여주는 대횡단 공격**

이어야 한다.

## 11. Story / Direction

3-8 직후 Player는 이미 다음을 확인했다.

```text
GROUP C
TRANSFER SUSPENDED

PRIORITY ROUTE
ACTIVE
```

Player Bark:

**“…C는 멈췄는데, 우선 통로는 열려 있었네.”**

그 뒤 Upper Exchange를 통과하려는 순간 Central Exchange의 자동 점검 시스템이 긴급 점검 상태에 들어간다.

Boss03에서 새로운 음모 설명을 추가하지 않는다.

전투가 보여주는 사실:
- 상부 시설은 여전히 많은 자동화 시스템이 살아 있음
- 상업·환승 시설은 사고 이후에도 자체 안전 절차를 계속 수행함
- 사람의 이동이 멈춘 뒤에도 건물의 운영 논리는 계속 남아 있음

Boss03 승리 후 Player가 가져가는 질문은 그대로:

> **“같은 사고였는데… 이동 조건은 같지 않았어.”**

아직 밝히지 않는다:
- Priority 대상이 누구인가
- Group C 중단의 직접 원인
- 누가 결정을 내렸는가
- 의도적 희생 여부

## 12. 승리 연출

최종 Rope Impact:
- 중앙 Core 외장 파손
- 천장 Rail 구동 정지
- 두 Arm이 힘을 잃고 안전 위치에서 멈춤
- Scanner 자체가 폭발하지 않음
- Atrium 조명 일부가 점검 모드에서 일반 비상등으로 전환
- 거대 폭발 없음

System Text는 짧게:

```text
CENTRAL EXCHANGE
MAINTENANCE OVERRIDE / OFFLINE
```

이후 다음 Sector 방향 동선 개방.

## 13. 반드시 피할 것

- Scanner가 랜덤하게 바뀌는 전투
- LOCKED 순간 기존 Rope를 강제로 끊는 것
- Scanner를 Damage Laser처럼 사용하는 것
- Boss가 Player를 직접 쫓아다니는 Boss02 반복
- 점검 팔을 단순 탄막처럼 많이 추가
- 특정 Build만 통과 가능한 Route
- 중앙/좌/우 중 항상 정답인 고정 Route
- Phase 사이 긴 컷신
