# Boss 01 콘텐츠 인계

상태: `AUTHORED FINAL CONTENT / GATE LOCKING CARRIAGE RUNTIME NOT IMPLEMENTED`

현재 콘텐츠 기준은 사용자 제공 `ONE-ROPE-BOSS-01-FINAL-CONTENT-HANDOFF.zip`의 `GATE LOCKING CARRIAGE`다. 기존 `CONTAINMENT GANTRY C-01` Has-A runtime/top-level snapshot은 이 authored design을 구현하지 않으며, 별도 retire·교체 범위 전까지 legacy prototype으로만 보존한다.

- source ZIP SHA-256: `df9b60ef667ebc0d94d49e648216f827d86922ef980155994659c591d00681c5`
- authored documents: [`BOSS-01-BRIEF.md`](./final-content/BOSS-01-BRIEF.md), [`BOSS-01-COMPONENTS.md`](./final-content/BOSS-01-COMPONENTS.md), [`MAP-PREVIEW.html`](./final-content/MAP-PREVIEW.html)
- current transition and Timer authority: [`../../scenario-development-integration.md`](../../scenario-development-integration.md), [`../../sector-timer-and-boss-flow.md`](../../sector-timer-and-boss-flow.md)

`1-8` 내부에는 Boss를 넣지 않는다. Boss는 checkpoint 뒤 별도 Post-Sector slot에 들어가며, Gate는 이미 열린 채 Worker District 첫 Reveal 뒤 Locking Assembly가 분리된다. 초기 Boss Timer와 시간 만료 Arena collapse는 구현 입력이 아니다.

현재 Runtime과 후속 구현 범위는 최신 `src/game/boss/`와 연결된 제품 기준 문서가 소유한다. 새 authored content를 Runtime·collision·전환·멀티플레이에 연결하거나 기존 C-01 prototype을 retire하는 작업은 별도 범위다.
