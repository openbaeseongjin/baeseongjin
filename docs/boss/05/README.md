# Boss05 최신 main 정합화 개발 인계 v13

기준 코드: `ea007998cef6168bfa4139d06f443eb444acfda5`

## 현재 상태

**설계 확정 · 런타임 부분 구현 · 최종 기획 정합화 필요 · 실제 플레이테스트 미검증**

## 문서 우선순위

1. `final-content/BOSS-05-LOCKED-DECISIONS.md`
   - 인터뷰로 확정된 규칙
2. `final-content/BOSS-05-MOVEMENT-ACCESSIBILITY-FIX-PLAN.md`
   - 실제 이동·Rope·Collision·Core 공격·Exit 접근 차단과 구체 수정 좌표
3. `final-content/BOSS-05-MAIN-AUDIT-IMPLEMENTATION-PLAN.md`
   - 최신 main 코드와 최종 기획의 차이 및 수정 순서
4. `final-content/BOSS-05-BRIEF.md`
   - Boss 정체성, 전투 흐름, 공간/스토리 기획
5. `final-content/BOSS-05-COMPONENTS.md`
   - 코드 구성요소별 구현 인계
6. `final-content/MAP-PREVIEW.html`
   - 설계 QA용 시각 프리뷰

## 주의

MAP-PREVIEW는 설계 기준 프리뷰다.
최신 Runtime의 음수 Y 좌표계와 최종 좌표 정합은
`BOSS-05-MAIN-AUDIT-IMPLEMENTATION-PLAN.md`의 좌표계 audit를 먼저 거쳐야 한다.

실제 브라우저/멀티플레이 검증 전에는 `PLAYTEST VERIFIED`로 표시하지 않는다.

0.61.0 Rope capability 정렬에서 Core shell과 이동 Wall은 기획 문서의 `grappleable=false`를 따르며 renderer도 Ropeable 표식을 표시하지 않는다. 이동용 Rope target은 authored grappleable surface와 Phase-gated Hardpoint가 소유한다.

## v15 추가 확정

- A/B/Main Wall 활성 접촉 시 피해 적용
- 초기값 20 damage
- WARNING/STORED는 무피해
- Wall HP 피해와 Rope Cut은 독립 판정
