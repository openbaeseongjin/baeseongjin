# Boss 03 콘텐츠 인계

상태: `AUTHORED FINAL CONTENT / RUNTIME IMPLEMENTED / BROWSER GAMEPLAY VIEW VERIFIED / FULL PLAYTEST PENDING`

Central Exchange Atrium의 Scanner·점검 Arm·좌/중앙/우 route를 `BossStageSpec`과 `CentralExchangeMaintenanceRuntime`으로 연결했다. 일반 Stage `3-8`의 content boundary는 유지하고 그 뒤 독립 `Boss03 → 4-1` 전환을 사용한다.

Runtime은 정적 HTML을 배경으로 사용하지 않는다. [`MAP-PREVIEW.html`](./final-content/MAP-PREVIEW.html)의 4800×2400 좌우·상하 관계, 5층 Gallery, 중앙 Media Route, Safe Landing, L/C/R Scanner surface와 LOW/HIGH Arm band를 authored collision·공용 `AccessScanField`·Polygon presentation으로 재현한다.

- source ZIP SHA-256: `75f6116c92d3a6ae3a36f14e4a96e79206711e4d04238b77a246f13aa4c55080`
- source revision: `ONE-ROPE-BOSS-03-FINAL-CONTENT-HANDOFF.zip`
- authored documents: [`BOSS-03-BRIEF.md`](./final-content/BOSS-03-BRIEF.md), [`BOSS-03-COMPONENTS.md`](./final-content/BOSS-03-COMPONENTS.md), [`MAP-PREVIEW.html`](./final-content/MAP-PREVIEW.html)
- Runtime source: `src/game/boss-authoring/specs/boss-03.json`, `src/game/boss/CentralExchangeMaintenanceRuntime.js`
