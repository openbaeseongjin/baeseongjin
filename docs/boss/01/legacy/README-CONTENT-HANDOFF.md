# Boss 01 콘텐츠 인계

상태: `AUTHORED FINAL CONTENT / GATE LOCKING CARRIAGE RUNTIME IMPLEMENTED IN #816`

현재 콘텐츠 기준은 사용자 제공 `ONE-ROPE-BOSS-01-FINAL-CONTENT-HANDOFF.zip`의 `GATE LOCKING CARRIAGE`다. 기존 `CONTAINMENT GANTRY C-01` Has-A runtime/top-level snapshot은 이 authored design을 구현하지 않으며, 별도 retire·교체 범위 전까지 legacy prototype으로만 보존한다.

- source ZIP SHA-256: `df9b60ef667ebc0d94d49e648216f827d86922ef980155994659c591d00681c5`
- authored documents: [`BOSS-01-BRIEF.md`](./final-content/BOSS-01-BRIEF.md), [`BOSS-01-COMPONENTS.md`](./final-content/BOSS-01-COMPONENTS.md), [`MAP-PREVIEW.html`](./final-content/MAP-PREVIEW.html)
- current transition and Timer authority: [`../../scenario-development-integration.md`](../../scenario-development-integration.md), [`../../sector-timer-and-boss-flow.md`](../../sector-timer-and-boss-flow.md)

`1-8` 내부에는 Boss를 넣지 않는다. Boss는 checkpoint 뒤 별도 Post-Sector slot에 들어가며, Gate는 이미 열린 채 Worker District 첫 Reveal 뒤 Locking Assembly가 분리된다. 초기 Boss Timer와 시간 만료 Arena collapse는 구현 입력이 아니다.

Issue #816은 이 authored content를 Boss 전용 Map Editor source·generated Definition·physical Arena·Carriage Phase/위협·일반/약점 피해·HP scaling·HUD·snapshot·전환에 연결하고 기존 C-01 definition을 generated Boss01 adapter로 교체한다. 실제 browser·single/multiplayer final candidate 검증이 완료돼야 release-ready로 본다.

Polygon mock은 최종 art 대체물이 아니라 기획 정합성 검증 화면이다. Carriage는 차체·bogie·wheel·lock plate로, P1 Full Beam은 양방향 전폭 Beam으로, P2 Broken Beam은 진행 방향 한쪽 Beam으로, P3 Rail Ram은 telegraph corridor와 돌진선으로 표시한다. Rear Drive·Side Gearbox·Central Lock Core는 각 Phase의 `vulnerability.visualPresetId`가 선택하며 secured/exposed 상태를 도형과 선으로 함께 구분한다.
