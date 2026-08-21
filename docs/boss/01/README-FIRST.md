# ONE ROPE — BOSS 01 REV2.1 개발자 전달 패키지

> **목적:** 게임 개발자가 이 ZIP만 보고 BOSS 01을 현재 Runtime에 연결할 수 있게 한다.
> **기준 GitHub main:** `e1c558ef9e09ecbc09254cb3fc45306186755570`
> **디자인 상태:** REV2 사용자 방향 승인 후 개발 전달용으로 구체화
> **구현 상태:** 아직 미구현
> **중요:** 이 패키지는 저장소를 직접 수정한 결과물이 아니라 **구현 권위 문서 + 참조 코드**다.

## 보스 한 줄 정의

**1-8 Maintenance Override에 반응해 정비 HeadHouse 전체가 비상 격리 모드로 전환되고, Player가 세 정비 취약부를 Rope Impact로 파괴해 Worker District 통로를 다시 여는 보스전.**

## 개발자가 읽는 순서

1. `01-DESIGN-LOCK.md`
2. `02-IMPLEMENTATION-ORDER.md`
3. `spec/BOSS-01-ARENA-SPEC.json`
4. `03-RUNTIME-DELTA.md`
5. `04-GAME-SIMULATION-INTEGRATION.md`
6. `05-SECTOR01-1-8-INTEGRATION.md`
7. `reference-code/*`
8. `qa/TEST-PLAN.md`
9. `qa/ACCEPTANCE-CHECKLIST.md`

## 반드시 유지할 현재 Runtime 계약

- `BossEncounterRuntime`
- 3 Phase
- 총 HP 360
- Phase HP 120
- Core/Target 노출 8초
- Timer 210초
- collapseSpeed 80
- Breaker ID 3개
- 기존 Interact 입력
- 기존 Rope Impact 피해 공식
- 기존 Sentry
- 기존 Pulse Wind
- Snapshot / Restore

## 새로 필요한 최소 기능

1. Boss Arena 데이터
2. 현재 Phase에 해당하는 **설비 Damage Target**
3. 일반 설비 ×1.0 / 정비 취약부 ×1.5 판정
4. Player별 `outside → inside` 1회 충돌 판정
5. Phase별 Enemy/Wind 활성화 Controller
6. Boss 완료 → Worker District Route 개방 연결

## 금지

- 새 Player 입력 추가
- 새 Rope Mode 추가
- 새 Enemy AI 추가
- 중앙 HP Sponge 보스로 되돌리기
- Phase 3 양쪽 Sentry 동시 사격
- 약점 명중을 필수 조건으로 만들기
- 1회 Miss로 Boss 전체 초기화
