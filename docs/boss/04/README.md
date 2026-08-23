# Boss 04 콘텐츠 인계

상태: `AUTHORED FINAL CONTENT / RUNTIME IMPLEMENTED / POLYGON MOCK / R1 AUDIT PENDING`

Guard A/B와 Central Security Hub의 콘텐츠 인계다. 최신 구현 감사 인계는 legacy Territory/LOS/Return 규칙을 현행 설계로 해석하지 않으며, Runtime 구현 상태는 `scenario-development-integration.md`에서 판단한다. 전환은 `4-8 완료 → Boss04 → Boss04 처치 → 5-1`이며 direct `4-8 → 5-1` 연결은 만들지 않는다.

- source ZIP SHA-256: `5d58d19d2bf6118f049be11289411a2808e40ce849db585e762f371d6098b55d`
- source revision: `BOSS04_FINAL_DESIGN_HANDOFF_20260823.zip`
- latest implementation handoff source: `BOSS-04-LATEST-HANDOFF-FINAL.md` / SHA-256 `3754439491c3d34b8287445251a6b218999678dfc24ccdc71d4fc1dc66eeaa7c` (`AUTHORING SNAPSHOT`)
- import normalization: only trailing whitespace was removed from the copied latest handoff; the source SHA-256 above remains the original artifact hash.
- authored documents: [`BOSS-04-BRIEF.md`](./final-content/BOSS-04-BRIEF.md), [`BOSS-04-COMPONENTS.md`](./final-content/BOSS-04-COMPONENTS.md), [`BOSS-04-IMPLEMENTATION-HANDOFF.md`](./final-content/BOSS-04-IMPLEMENTATION-HANDOFF.md), [`MAP-PREVIEW.html`](./final-content/MAP-PREVIEW.html)

`MAP-PREVIEW.html`은 Boss04의 설계 QA용 공간·발판·Rope surface·Guard/Hub·Gate 배치 기준이다. 정적 Preview와 인계 문서만으로 Runtime collision·combat·multiplayer 동작을 바꾸지 않으며, 최신 Runtime 사실은 통합 현황과 구현 코드가 소유한다.

초기 Runtime은 전투·충돌·checkpoint·snapshot·멀티플레이 상태를 실제로 구현하고, Polygon mock visual과 기존 stable audio cue만 사용한다. renderer의 preset/state와 audio cue ID는 gameplay Runtime·authoring Spec에서 분리하므로 최종 그래픽·animation metadata·음원을 교체할 때 전투 코드를 바꾸지 않는다.
