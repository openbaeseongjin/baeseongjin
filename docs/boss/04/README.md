# Boss 04 콘텐츠 인계

상태: `AUTHORED FINAL CONTENT / RUNTIME IMPLEMENTED / POLYGON MOCK`

Guard A/B의 지속 추격과 Central Security Hub의 콘텐츠 인계다. 이전 Territory/LOS break/Return/handoff 설계와 정적 프리뷰는 이 최종 인계로 대체한다. 전환은 `4-8 완료 → Boss04 → Boss04 처치 → 5-1`이며 direct `4-8 → 5-1` 연결은 만들지 않는다.

- source ZIP SHA-256: `5d58d19d2bf6118f049be11289411a2808e40ce849db585e762f371d6098b55d`
- source revision: `BOSS04_FINAL_DESIGN_HANDOFF_20260823.zip`
- authored documents: [`BOSS-04-BRIEF.md`](./final-content/BOSS-04-BRIEF.md), [`BOSS-04-COMPONENTS.md`](./final-content/BOSS-04-COMPONENTS.md), [`BOSS-04-IMPLEMENTATION-HANDOFF.md`](./final-content/BOSS-04-IMPLEMENTATION-HANDOFF.md), [`MAP-PREVIEW.html`](./final-content/MAP-PREVIEW.html)

`MAP-PREVIEW.html`은 Boss04의 현재 공간·발판·Rope surface·Guard/Hub·Gate 배치 기준이다. 구 문서의 영문 `Territory Exit → LOS break → Return`은 `추적 구역 이탈 → 시야 끊기 → 원위치 복귀`로 구현하며, 같은 흐름을 Map Editor Gameplay View의 Runtime이 사용한다.

초기 Runtime은 전투·충돌·checkpoint·snapshot·멀티플레이 상태를 실제로 구현하고, Polygon mock visual과 기존 stable audio cue만 사용한다. renderer의 preset/state와 audio cue ID는 gameplay Runtime·authoring Spec에서 분리하므로 최종 그래픽·animation metadata·음원을 교체할 때 전투 코드를 바꾸지 않는다.
