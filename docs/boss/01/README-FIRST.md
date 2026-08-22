# ONE ROPE — BOSS 01 REV2.1 역사적 개발자 전달 참조

> **상태:** `LEGACY REFERENCE ONLY`
> **원본 snapshot:** `e1c558ef9e09ecbc09254cb3fc45306186755570`
> **현재 기준:** [`README.md`](./README.md), [`../../scenario-development-integration.md`](../../scenario-development-integration.md), [`../../sector-timer-and-boss-flow.md`](../../sector-timer-and-boss-flow.md)
> **중요:** 이 REV2.1 패키지는 현재 Runtime·기획·구현의 권위가 아니다. Boss 01의 최신 authored content와 현재 Runtime 경계는 상위 기준 문서를 따른다.

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
