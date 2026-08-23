# BOSS 03 — 구성요소 명세

> 상태: **RETIRED AS NEW DESIGN INPUT / TEMPORARY RUNTIME HISTORY**
> 이 문서는 현재 Scanner·Arm 임시 Runtime의 구현 이력이며 신규 이동형 Boss03의 컴포넌트 계약이 아니다.
> 목적: **개발자가 무엇을 만들어야 하는지**만 정리한다.
> 구현 방법·파일 수정 방법·의사코드는 포함하지 않는다.
> AUTHORING SNAPSHOT: GitHub `main` `6a8911d354df6b218a64970b5d35d41359ef62f2`. 현재 main과 Runtime 연결 상태는 `docs/scenario-development-integration.md`가 소유한다.

## 1. 상태 구분

- **[현재 게임 기반]**: 현재 게임에 이미 존재하는 규칙을 기반으로 사용
- **[Boss03 신규]**: Boss03을 위해 새로 필요한 구성요소
- **[시각 요소]**: Gameplay 규칙을 바꾸지 않는 표현

## 2. Boss 본체

### 형태
**천장 점검기 + 건물 자동화가 결합된 형태**

- 중앙 천장 Rail에 연결된 본체
- 좌/우 대형 점검 Arm 2개
- 좌측 점검 모듈
- 우측 점검 모듈
- 중앙 Core
- Cable bundle
- Maintenance light
- Service ID / warning marking

### 이동
**[Boss03 신규]**
- 본체는 중앙 천장 Rail을 따라 천천히 좌우 이동
- Player를 직접 추격하지 않음
- Phase에 따라 Arm의 시작 위치와 Sweep 위치가 달라짐

### Boss 외형 변화
**시작**
- LEFT / RIGHT MODULE 정상
- CENTRAL CORE 보호판 닫힘

**P1 종료**
- LEFT MODULE 파손
- 좌측 연결부 스파크

**P2 종료**
- RIGHT MODULE 파손
- 중앙 보호판 간헐적으로 흔들림

**P3**
- CENTRAL CORE 노출

## 3. Scanner

### 기본 규칙
**[현재 게임 기반]**

```text
AVAILABLE
WARNING
LOCKED
RESET
```

현재 기준:
- AVAILABLE: 신규 Attach 가능
- WARNING: 신규 Attach 가능
- LOCKED: 신규 Attach 불가
- RESET: 신규 Attach 불가
- 기존 Rope는 계속 유지

Damage 0
Knockback 0
Rope Cut 0
Forced Detach 0

### Scanner Group
**3개**

1. LEFT
2. CENTER
3. RIGHT

### 상태 관계
**[Boss03 신규 구성]**

각 Group은 동일한 Scanner Cycle을 사용한다.

상태 시작은 서로 어긋나며:

```text
LEFT
→ CENTER
→ RIGHT
```

순으로 열리는 흐름이 반복적으로 읽혀야 한다.

랜덤 Offset 금지.

## 4. Boss Arm

### 개수
**2개**

### 크기
각 Arm은 중앙 Void 폭의 약 **60~70%**까지 Sweep 가능.

### 높이
- LOW ARM
- HIGH ARM

### 공격 판정
**[Boss03 신규]**

#### LOW SWEEP
- P1부터 사용
- Atrium 하단/중단 횡단

#### HIGH SWEEP
- P2부터 사용
- LOW ARM과 다른 높이

#### CROSS SWEEP
- P2/P3
- HIGH / LOW가 서로 다른 방향 또는 시간차로 교차

Arm의 목적은 Player를 추격하는 것이 아니라:
> **현재 Rope Arc의 높이와 다음 Attach 위치를 바꾸게 하는 것**

## 5. Service End-Stop

### LEFT END-STOP
P1의 Arm 과신전 위치.

### RIGHT END-STOP
P2의 Arm 과신전 위치.

**[Boss03 신규]**
Arm Sweep을 끝까지 피하면 점검 Arm이 End-Stop까지 과신전하고 해당 모듈이 잠시 노출된다.

## 6. 약점

### P1
**LEFT INSPECTION MODULE**

- 위치: 좌측 Service End-Stop 인접
- 타격: Rope Impact
- 약점 배율: ×1.5

### P2
**RIGHT INSPECTION MODULE**

- 위치: 우측 Service End-Stop 인접
- 타격: Rope Impact
- 약점 배율: ×1.5

### P3
**CENTRAL CORE**

- 위치: Boss 본체 중앙 하부
- 좌/우 Module 파손 이후 보호장치 불안정
- P3 교차 Sweep 1회 완주 후 완전 노출
- 최종 Rope Impact 목표
- 약점 배율: ×1.5

일반 본체:
- ×1.0

## 7. 공간

### 전체
약 **4800×2400 planning space**

### 층수
**4~5개 층**

### 중앙
- 거대한 Void
- 천장 Rail
- Media Wall frame
- Advertising mount
- Service frame
- Ceiling maintenance frame
- Central Fast Route

### LEFT GALLERY
- 4~5개 층을 따라 이어짐
- Scanner LEFT Group
- 중장거리 Rope Arc
- P1 LEFT MODULE

### RIGHT GALLERY
- 4~5개 층
- Scanner RIGHT Group
- 중장거리 Rope Arc
- P2 RIGHT MODULE

### CENTER
- Scanner CENTER Group
- 가장 짧은 이동선
- 광고/Media/Service 구조물을 이용
- 가장 직접적인 Commit Timing 요구

## 8. Safe Landing

### SAFE 01
P1 → P2 사이.

요구:
- Arm Sweep이 닿지 않음
- Scanner Commit을 바로 강요하지 않음
- 다음 3 Route가 시각적으로 읽힘

### SAFE 02
P2 → P3 사이.

요구:
- 중앙 Core 상태가 보임
- L/C/R Scanner 상태를 관찰 가능
- 최종 Phase 진입 전 짧은 판단시간 제공

Safe Landing은 긴 휴식방이 아니라 **전투 리듬을 다시 읽는 짧은 플랫폼**이다.

## 9. P1 구성요소

- Main entry
- LOW ARM
- LEFT Scanner-controlled anchors
- LEFT Gallery
- 중앙 Media 구조 일부
- LEFT SERVICE END-STOP
- LEFT MODULE
- SAFE 01

### 플레이 흐름
```text
ENTRY
→ WARNING Attach
→ LOCKED Swing 유지
→ LOW SWEEP 회피
→ LEFT END-STOP 과신전
→ LEFT MODULE
→ Rope Impact
→ SAFE 01
```

## 10. P2 구성요소

- LEFT Route
- CENTER Route
- RIGHT Route
- LOW ARM
- HIGH ARM
- Cross Sweep
- LEFT / CENTER / RIGHT Scanner
- RIGHT SERVICE END-STOP
- RIGHT MODULE
- SAFE 02

### Route 원칙
특정 Route가 항상 정답이면 안 된다.

Route 선택은:
- 현재 Scanner 상태
- 다음 Scanner 상태
- LOW/HIGH Arm 위치
- Player 현재 Rope Arc

에 따라 바뀐다.

### 플레이 흐름
```text
SAFE 01
→ L/C/R Route 선택
→ HIGH + LOW 교차 Sweep
→ Flow 유지
→ RIGHT END-STOP 과신전
→ RIGHT MODULE
→ Rope Impact
→ SAFE 02
```

## 11. P3 구성요소

- LEFT Scanner Group
- CENTER Scanner Group
- RIGHT Scanner Group
- 서로 어긋난 상태 순환
- LOW ARM
- HIGH ARM
- Cross Sweep
- CENTRAL CORE
- Atrium 대횡단 최종 Route

### 플레이 흐름
```text
SAFE 02
→ 현재 L/C/R 상태 확인
→ 열린 Route 진입
→ 신규 Attach Timing 판단
→ HIGH/LOW Cross Sweep 통과
→ Sweep 1회 완주
→ CENTRAL CORE 완전 노출
→ 열린 Scanner Route 재진입
→ Atrium 대횡단
→ Final Rope Impact
```

## 12. Rope 거리

현재 Base Hook Reach:
**400px**

승인된 MAP Draft 정적 기준:
- Planning bounds: 약 4800×2400
- Mandatory backbone 최대 연결거리: **375.37px**
- 필수 Backbone은 Base Reach 400px 이내

Final authoring에서 선택형 L/C/R Route도 같은 400px Base-clear 원칙을 유지해야 한다.

## 13. 시각적 전투 가독성

우선순위:

1. Player
2. Rope
3. 현재 Attach 가능한 Anchor
4. Scanner 상태
5. HIGH / LOW Arm Telegraph
6. 다음 Route
7. Weakpoint
8. 상업시설 배경 Detail

Scanner 상태는 색만으로 구분하지 않는다.

AVAILABLE / WARNING / LOCKED / RESET은:
- 조명 형태
- 점멸
- 프레임 표시
- 상태 패턴

등을 함께 사용해야 한다.

## 14. 상업·환승 공간 소품

### 반드시
- Media Wall
- 광고 프레임
- 점검 Rail
- Service frame
- 상업 Gallery
- 층간 난간
- 폐쇄된 점포/서비스 패널
- 환승 표지
- Ceiling rig

### 보조
- 디지털 간판
- 유지보수 케이블
- 폐쇄 셔터
- 벤치
- 안내 디스플레이
- 비상조명

## 15. 현재 게임 기반 vs Boss03 신규

### 현재 게임 기반
- Base Rope Reach 400px
- Access Scan 4-state 규칙
- LOCKED/RESET 신규 Attach 차단
- 이미 붙은 Rope 유지
- Scanner의 time-derived deterministic 상태
- phaseOffsetSeconds 기반 Group 상태 조정
- Rope Impact 속도 기반 공격 문법
- Boss Phase / Exposure 계열 공용 상태 구조

### Boss03 신규
- 천장 Rail 위 Boss 본체 이동
- HIGH / LOW 점검 Arm
- Sweep 공격
- LEFT / RIGHT Service End-Stop 과신전
- LEFT / RIGHT Module 약점
- 좌/우 Module 파손과 중앙 보호장치 연계
- Cross Sweep 완주 → CENTRAL CORE 노출
- Boss03 전용 월드 전투 공간
