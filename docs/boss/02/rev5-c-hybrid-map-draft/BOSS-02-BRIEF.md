# BOSS 02 — 옥상 봉쇄
## 핵심 브리프 + 스토리/연출

> 상태: **DRAFT AUTHORING REFERENCE / RUNTIME NOT IMPLEMENTED**
> AUTHORING SNAPSHOT: `239377d90387029e362f23ef75bd037f82baa420`
> Sector: **02 WORKER DISTRICT**
> 구조: **C — 혼합형 추격**

## 1. 한 줄 정의

**오래된 저층 노동자 주거지역의 대형 경비기계가 플레이어를 골목·발코니·중정·옥상까지 끈질기게 추격한다. 플레이어는 보스의 강공격을 건축물에 유도해 보스와 건축물을 동시에 파손시키고, 그 순간 드러난 약점을 Rope로 역공한다.**

## 2. 우선순위

### 1순위 — 보스 공격을 건축물에 유도해 반격하는 쾌감
```text
추격
→ 강공격 예고
→ 건축물 쪽으로 유도
→ 마지막 순간 Rope 회피
→ 보스가 구조물과 충돌
→ 보스/건축물 동시 파손
→ 약점 노출
→ Rope Impact 반격
```

**단순히 공격 후 보스가 지쳐서 약점이 열리는 전투로 만들면 안 된다.**

### 2순위 — 보스가 계속 따라온다
- P1 초반: Player와 같은 메인골목에서 직접 추격
- P1 후반: Player가 발코니·샛길로 빠지면 바로 옆 넓은 축으로 병행
- P2: Player는 Balcony 외곽, Boss는 중정 중앙축
- P3: Player는 Roofline, Boss는 옥상 공중축

### 3순위 — 저층 주거지역이 전투의 주 공간
- 생활골목·발코니 약 50%
- 공동중정 약 25%
- 저층옥상 약 25%

## 3. 전체 진행

```text
2-8 대피 플랫폼
↓
생활 메인골목
↓
샛골목 + 2~3층 발코니
↓
다시 메인골목
↓
ㄷ자 공동중정
↓
중정 상부 발코니
↓
저층 옥상 3개
↓
CENTRAL EXCHANGE 방향
```

한 장소에서 3페이즈를 반복하지 않는다.
보스에게 쫓기면서 계속 전진하고, 새로운 공간에 도착할 때 Phase가 바뀐다.

## 4. 페이즈 한눈에 보기

| Phase | 공간 | 강공격 | 충돌 대상 | 약점 |
|---|---|---|---|---|
| **P1** | 메인골목 + 샛골목 + 발코니 | 직선 몸통박치기 | 콘크리트 벽/계단실 | 후방 추진기 |
| **P2** | ㄷ자 공동중정 | 근거리 회전 몸통박치기 | 중정 바닥 | 하부 안정화 장치 |
| **P3** | 저층 옥상 3개 | 공중 대각선 급강하 | 물탱크/계단실 | 중앙 센서 |

## 5. 등장

2-8 기존 기록 확인 후:

```text
EVACUATION GROUP A / TRANSFER COMPLETE
EVACUATION GROUP B / TRANSFER COMPLETE
EVACUATION GROUP C / TRANSFER SUSPENDED
PRIORITY ACCESS / ACTIVE
```

Central Exchange 방향으로 이동하려는 순간:

```text
RESIDENTIAL SECURITY
ROOFTOP PATROL / ACTIVE
```

대형 경비기계가 Player를 인식하고 즉시 추격 시작.

Player Bark:

**“…여기도 막는 거야?”**

P1/P2 중 추가 설명 Bark 없음.

## 6. P1 → P2

첫 약점 타격 후:
- 전면/측면 외장 일부 파손
- 한쪽 추진부 불안정
- Boss가 뒤로 밀린 뒤 다시 자세를 잡음
- Player는 멈추지 않고 다음 블록으로 이동
- Boss도 곧바로 다시 따라옴

장시간 컷신 금지.

## 7. P2 → P3

중정 충돌 후:
- 하부 장갑 파손
- 비행 자세 흔들림
- Player는 Balcony를 타고 옥상으로 상승
- Boss는 중앙에서 공중축으로 따라붙음

옥상 진입 시:

```text
CENTRAL EXCHANGE
SERVICE ACCESS / AHEAD
```

## 8. 최종전과 승리

P3 급강하가 물탱크/계단실에 충돌:
- 물탱크 찌그러짐
- 계단실 외벽 균열
- Boss 전면 장갑 크게 파손
- 중앙 센서 완전 노출

마지막 Rope Impact 후:
- 거대한 폭발 없음
- 옥상 가장자리/지붕 위에 거칠게 정지
- 경광등 불규칙 점멸 후 OFF
- 기계음 정지

```text
RESIDENTIAL SECURITY
PATROL OFFLINE
```

잠시 후:

```text
CENTRAL EXCHANGE
SERVICE ROUTE / OPEN
```

## 9. 아직 밝히지 않는 것

- Group C 중단 이유
- Priority Access 대상
- 정책 결정자
- 의도적 희생 여부

Boss02는 **사람이 사라진 뒤에도 주거구역 보안 시스템이 계속 작동한다**는 사실만 보여준다.

## 10. 반드시 피할 것

- 군용 최종병기 느낌
- 버튼 3개 보스
- 고정 Patrol을 기다리는 퍼즐형 보스
- 복잡한 탄막
- Rope Cut
- 건축물과 무관한 자동 약점 노출
- 파손 때문에 필수 동선 소멸
- 장시간 컷신
