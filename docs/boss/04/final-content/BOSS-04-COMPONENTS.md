# BOSS 04 — 구성요소 명세

> 목적: **무엇을 만들어야 하는지**만 정리한다.
> 구현 방법·파일 수정 절차·의사코드는 포함하지 않는다.
> 상태: **AUTHORED FINAL CONTENT / RUNTIME NOT IMPLEMENTED**
> AUTHORING SNAPSHOT: `6a8911d354df6b218a64970b5d35d41359ef62f2`

## 1. 상태 구분

- **[현재 게임 기반]** 현재 Runtime capability를 기반으로 사용 가능
- **[Boss04 신규]** Boss04에 새로 필요한 구성요소
- **[시각 요소]** Gameplay authority를 바꾸지 않는 표현

## 2. Boss Encounter 구성

Boss04는 하나의 Encounter이며 다음 세 요소로 구성된다.

### Guard A
- 상부 추격 담당
- Burst pressure
- Rear Thruster weakpoint
- Dock A

### Guard B
- 경로 차단 추격 담당
- Short Dash pressure
- Side Controller weakpoint
- Dock B

### Central Security Hub
- Guard A/B protection link 소유
- Protected Ascent / Refuge Security control
- 최종 Core
- Shielded until both links are lost

## 3. Guard A

### 역할
**ELEVATED PURSUIT / LANDING PRESSURE**

### 이동
- Player보다 약간 높은 위치 유지
- Private Sky Garden Territory 안에서 추격
- Territory 밖 무한 추적 금지

### 공격
**짧은 Burst**

목적:
- Player 현재 좌표에 탄막 생성이 아니라
- 다음 착지점 후보 압박
- Rope 높이 변경 유도

### 약점
**Rear Thruster**

평상시:
- 공격 불가 또는 보호 상태

Return:
- 후방 추진기 노출
- Rope Impact 가능

## 4. Guard B

### 역할
**ROUTE BLOCK / LANDING INTERCEPT**

### 이동
- Upper / Lower Skybridge Territory 안에서 추격
- Player와 비슷한 높이

### 공격
**Short Landing-Point Dash**

목적:
- Player를 추적 직격하기보다
- 다음 착지점을 선점
- Upper ↔ Lower Route 전환 유도

### 약점
**Side Controller**

Return:
- 측면 제어기 노출
- Rope Impact 가능

## 5. Pursuit Territory

### [현재 게임 기반]
현재 Pursuit behavior는 activation 영역으로 movement/targeting 범위를 제한할 수 있는 기반이 있다.

### [Boss04 신규]
Boss04 Territory는 단순 activation box 이상으로 다음 의미가 필요하다.

```text
IN TERRITORY
→ Acquire / Pursuit 가능

TERRITORY EXIT
+
LINE OF SIGHT LOST
→ Return 전환

RETURN
→ 정해진 Dock/Patrol 위치로 복귀
→ 해당 Guard 약점 노출
```

시야 차단은 즉시 1-frame 판정이 아니라 Player가 명확히 “추격을 끊었다”고 읽을 수 있는 짧은 유지 구간이어야 한다.

## 6. P1 공간

**Private Sky Garden**

반드시:
- 잘 관리된 조경
- Pergola
- Residential Terrace
- 중앙 Landscaped Void
- 시야를 끊을 수 있는 건축/조경 요소
- Guard A Territory Exit
- Guard A Return line

공간은 폐허가 아니라:
**CLEAN / QUIET / LANDSCAPED / PROTECTED**

## 7. Refuge Landing

P1→P2 사이.

요구:
- Guard A 접근 불가
- Guard B 즉시 공격 금지
- 다음 Upper/Lower Skybridge가 보임
- Player가 Guard B 위치를 재확인 가능

## 8. P2 공간

반드시:
- Upper Skybridge
- Lower Skybridge
- 중간 Refuge Balcony
- 최종 Refuge Terrace
- 높이 변경 Rope link
- Guard B Territory Exit
- Guard B Return line

## 9. P3 공간

반드시:
- Left Refuge Terrace
- Right Refuge Terrace
- High Refuge Skybridge
- 중앙 Refuge Void
- Central Security Hub
- Guard A Docking Rail
- Guard B Docking Rail
- A/B Handoff Overlap Zone

## 10. P3 Handoff

**[Boss04 신규]**

핵심:
```text
A PURSUIT
→ A TERRITORY EXIT
→ A RETURN
+
B ACQUIRE
→ B PURSUIT
```

또는 반대 방향.

Overlap은 짧아야 한다.

두 Guard 모두 동시에 최대 압력을 주는 구간으로 만들지 않는다.

## 11. P3 Protection Link

### Guard A link
P3에서 Rear Thruster를 정확히 다시 타격하면 OFF.

### Guard B link
P3에서 Side Controller를 정확히 다시 타격하면 OFF.

두 link 모두 OFF:

```text
CENTRAL SECURITY HUB
SHIELD OFF
```

별도 세 번째 버튼 없음.

## 12. Final Core

위치:
**Central Security Hub 중앙**

역할:
- Guard A/B 보호 링크 종착점
- Protected Ascent / Refuge Security controller

공격 시작 위치:
- Left final attack anchor
또는
- Right final attack anchor

Player의 마지막 위치에 따라 둘 다 가능.

최종 타격:
**Large Rope Impact**

## 13. 승리 상태

Guard A:
- Dock A 복귀
- pursuit light OFF

Guard B:
- Dock B 복귀
- pursuit light OFF

Central Security Hub:
- shield OFF
- warning OFF
- Core disabled

Protected Gate:
- 천천히 열림
- Sector05 방향 sightline 형성

## 14. Rope QA

Final authored planning bounds:
**약 5400×2500**

Base Hook Reach:
**400px**

승인 최종 topology:
- Mandatory authored relations: **21**
- Max mandatory relation: **353.55px**
- Non-adjacent authored pairs ≤400px: **0**

즉:
- 모든 Mandatory relation은 Base 400px 안
- 비의도 400px shortcut **0**
- P3 좌/우 분기는 서로 독립적으로 읽힘

## 15. 현재 게임 기반 vs Boss04 신규

### 현재 게임 기반
- Pursuit seek/windup/dash/recover 계열 행동
- activation 영역 기반 제한
- Patrol/Projectile 기반 pressure
- Rope traversal
- Base Hook Reach 400px

### Boss04 신규
- explicit Pursuit Territory 의미
- LOS break condition
- Return state
- Return path
- Return 중 weakpoint exposure
- Guard A Burst landing pressure
- Guard B landing-point intercept Dash 구성
- Guard A/B Handoff
- Protection Link A/B
- Central Hub Shield 조건
- Dual final attack route
- Docking victory state

## 16. 전투 가독성

우선순위:
1. Player
2. Rope
3. Guard 현재 추격 방향
4. Territory Exit
5. Return 상태
6. 노출 약점
7. 다음 안전 Route
8. Central Security link 상태
9. 환경 Detail

Guard A/B는 색만으로 구분하지 않는다.

### Guard A
- 상부 체형
- rear thruster silhouette
- burst muzzle/readability

### Guard B
- 낮고 넓은 체형
- side controller silhouette
- dash telegraph

## 17. 시각적 환경 구성

### Private Sky Garden
- trimmed planting
- pergola
- water/landscape edge
- seating
- residential facade
- private access signage

### Skybridge / Refuge
- clean glass
- maintained lighting
- evacuation signage
- private residential access
- refuge bench
- protected railing
- emergency supply cabinet

### Final
- protected glass gate
- resident security hub
- docking rails
- Sector05 sightline

파손은 국소적으로만.
상층 전체가 폐허처럼 보이면 실패.
