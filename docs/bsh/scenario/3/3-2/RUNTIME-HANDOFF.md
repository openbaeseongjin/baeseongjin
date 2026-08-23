# 3-2 RUNTIME HANDOFF — REV8.0

Baseline: `d588aa041a350cab198cd187d8dccbe3b3a244dd`

Before implementation fetch latest main and re-read:
- Sector03AreaCatalog
- AccessScanField / effective grapple eligibility
- current scanner presentation
- AuthoredStoryPresentation
- Access Module progression
- current 3-1 and 3-3 seams

## Approved body
`3200×1472`

`UNDERFRAME L→R → RIGHT CRADLE → BACKSIDE R→L → CROWN RECALL → OPTIONAL ACCESS A → CROWN L→R → EXIT`

## Scanner
Preserve existing group ID:
`sector-03-02:scanner-A`

Cycle:
AVAILABLE 1.5 / WARNING .6 / LOCKED 1.1 / RESET .3.

Controlled REV8 targets:
C1/C2/C3/C4.

C4 is recall, not a second group.

LOCK/RESET deny new attach only.
Existing Rope must remain.

No damage, knockback, forced detach, Rope Cut.

## Enemy
Exactly two stable slots.

`scanner-lower-guard`
- Standard Pool
- after tutorial only
- kill optional

`scanner-upper-guard`
- Support Pool
- Access A Carrier
- optional cassette only
- no escort
- no mainline gate dependency

## Story
Preserve exact System copy:
- COMMERCIAL ACCESS CONTROL / EMPLOYEE VERIFIED
- ROUTE AUTHORIZATION / INVALID
- SERVICE MOUNT ACCESS / CYCLING
- RETAIL SECURITY / ACTIVE

Barks are planning-only until Bark layer exists.

## Exit
Preserve final-deck → exit-panel → authored Gate trigger. Trigger를 통과한 Player 한 명만 3-3 authored Entry로 텔레포트하며 별도 Stage 상태나 Runtime 연결 지형을 만들지 않는다.

## Mandatory validation
- scanner deterministic in multiplayer
- first tutorial pressure 0
- current Rope survives LOCK
- 2 slots only
- Access A optional
- all distance checks
- recovery no-bypass
- no scanner-laser visual regression
- no 3-3 synthesis stolen by 3-2
