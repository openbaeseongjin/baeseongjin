# 보스05 설계 확정 사항

이 문서는 인터뷰로 확정된 Boss05 규칙을 짧게 확인하는 용도다.

## 최근 추가 확정

### 전원 사망

**완료한 이전 Phase는 유지하고 현재 Phase만 초기화한다.**

- 단순 Coupling 노출 실패: 누적 피해 유지
- 전원 사망: 현재 Phase HP 최대치 복구

### 멀티플레이 카메라

**각 플레이어 로컬 카메라가 자기 Player + Core를 기준으로 독립 추적한다.**

카메라 위치 자체는 네트워크 동기화하지 않는다.

### Recovery 중 Boss 공격

**정상 피해를 허용한다.**

Recovery 보호 대상:

- Control Pulse 피해
- 움직이는 Wall 접촉 피해
- 기타 Boss05 위험 공격 피해

보호하지 않는 것:

- Wall/Platform collision
- Rope physics
- Void fall

Recovery 상태에서도 현재 유효 Coupling/Core에 정상 피해를 준다.
단, Wall 차폐·공격선·Target 활성 규칙은 그대로 적용한다.

## 기존 핵심 확정

- 실제 Boss는 `Suspended Continuity Control Core`.
- P1 A → P2 B → P3 Main → Final Core.
- P3는 P3-A / P3-B의 두 내부 단계.
- P3-A에서 A/B HP는 부활하지 않고 Wall만 비상 재가동.
- P3-A A/B Wall은 잠긴 채 P3-B까지 유지.
- Main 실패 시 A/B/Main Wall 모두 상승 후 P3-A 재시작.
- Main 누적 피해는 노출 실패에서는 유지.
- Pulse는 Rope Cut을 하지 않음.
- Rope Cut은 움직이는 Wall과 실제 Rope가 교차할 때만.
- Main Coupling은 좌우에서 공격해도 하나의 HP.
- Final에는 새로운 공격/적/퍼즐 없음.
- 생존 Player 한 명이 다음 준비 구역에 도착하면 다음 단계 시작.

## Wall 접촉 피해

**A/B/Main Wall과 실제로 충돌하면 피해를 받는다.**

```text
WARNING  → 피해 없음
DESCENT  → 피해
LOCKED   → 피해
RISE     → 피해
STORED   → 피해 없음
```

초기 기획값은 `20 damage`.

- Wall은 Player를 Void 방향으로 밀지 않는다.
- 움직이는 Wall 접촉 시 nearest legal cell 방향으로 수평 Push.
- 같은 Wall에 붙어 있는 동안 매 frame 피해를 주지 않고 기존 피격 무적시간/쿨다운을 사용.
- Rope Cut은 움직이는 Wall과 실제 Rope segment가 교차할 때만 별도 적용.
