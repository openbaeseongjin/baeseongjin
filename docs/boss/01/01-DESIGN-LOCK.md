# BOSS 01 REV2.1 — 디자인 잠금

## 1. 정체성

내부 코드 이름:
`CONTAINMENT GANTRY C-01`

Player-facing 의미:
**C-01 비상 격리구동계**

보스는 인간형/생물형 1기가 아니다.

보스는 다음 설비들의 결합이다.

- 격리 Clamp
- 환기 Fan
- Gate Brake
- Security Sentry
- Pulse Wind
- 닫히는 HeadHouse

## 2. 1-8과 인과 연결

```text
1-8 Maintenance Override
→ OVERRIDE ACCEPTED
→ Gate opening begins
→ C-01 Emergency Lockdown
→ Boss 01
→ C-01 OFFLINE
→ Worker District Access Open
```

따라서 기존 1-8의 **실제 Worker District 통과 개방은 Boss 승리 뒤로 이동**해야 한다.

## 3. Phase 의미

| Phase | 내부 HP | 실제 설비 | 수동 조작 | 취약부 |
|---|---:|---|---|---|
| 1 | 120 | 격리 Clamp 구동축 | Clamp Pressure Release | Stress Seam |
| 2 | 120 | 환기 Fan 주베어링 | Backpressure Isolation | Exposed Bearing |
| 3 | 120 | Gate Lock Pin | Gate Brake Manual Release | Lock Pin Fracture |

## 4. Damage

일반 설비:
`Rope Impact Damage ×1.0`

정비 취약부:
`Rope Impact Damage ×1.5`

800px/s 예:
- 일반: 약 80
- 약점: 약 120

약점은 **숙련도 보상**이며 필수조건이 아니다.

## 5. Arena 좌표

REV2 초안의 비인접 우회 5개를 제거한 **REV2.1 구현 좌표**를 사용한다.

- Mandatory links: 14
- Route length: 3973.84px
- Max adjacent link: 366.19px
- Base Hook Reach authority: 400px
- Exhaustive non-adjacent pairs <=400px: **0**

## 6. 난이도 목표

- 첫 플레이: 2:40–3:40
- 숙련: 1:25–2:05
- Perfect weak-hit 3회: 약 1:20–1:35 허용
- 실패 처벌: 낮음
- 정상 recovery: 4–6초 목표
