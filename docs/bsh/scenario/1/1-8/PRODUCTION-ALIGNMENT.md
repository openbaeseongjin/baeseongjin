# 1-8 PRODUCTION ALIGNMENT — REV8.0

Baseline:
`ea9c4438c0f106474baa09621bfb42ae5876b86e`

## MAP-PREVIEW primary route sync — 2026-08-20

`MAP-PREVIEW.html`의 Lower Security→Mid Relief→Upper Security→Final Pulse→Override→Gate Passage→Sector Checkpoint endpoint 전체를 Runtime `routePoints`와 seamless `world.route`에 반영했다. Enemy·Wind·Access transit collision은 변경하지 않았다.

## Current Runtime vs REV8

| Item | Current | REV8 | Status |
|---|---|---|---|
| Bounds | 1664×1792 | 1664×1792 | VERIFIED |
| Silhouette | Lower A/B/C security lane -> Mid Relief (safe) -> Upper D/E/F/G/H security lane -> Final Pulse crossing (I) -> Override -> Gate -> Checkpoint | two counterflow Security lanes + final Pulse | VERIFIED |
| Enemy slots | 4 (Lower Grid Guard, Lower Turret, Upper Grid Guard, Upper Turret) | 4 | VERIFIED |
| Enemy pool | Sector 01 Late Pool | preserve | VERIFIED |
| Sequential activation / no crossfire | delivered via non-overlapping proximity activation boxes (verified: zero pairwise overlap across all 4 slots), matching every other Sentry in this codebase - no dedicated sequencing state machine exists anywhere in Runtime (`EnemyObject.js` only ever reads `cover-ends-los`/`no-projectile-attack`/`cutter-fire` off `rules`) | yes | VERIFIED (geometry-delivered, see note below) |
| Rope cut | no | no | VERIFIED |
| Final Vent | RIGHT pulsed 800, `bounds` [-672,480]x[-1504,-1216] | preserve | VERIFIED |
| Pulse cycle | 1.75/0.7/1.4/0.3 | preserve | VERIFIED |
| Override | maintenance-override | preserve | VERIFIED |
| Sector checkpoint | present, `checkpointId: checkpoint:sector-01-08:end` | preserve | VERIFIED |
| Entry Story | CONTAINMENT GATE / LOCKED | preserve | VERIFIED (trigger id only, no text authored this pass) |
| Lower warning Story | storyTrigger ids preserved | preserve | PARTIAL |
| Lockdown 87% | storyTrigger id preserved | preserve | PARTIAL |
| Override consequence | storyTrigger id preserved | preserve | PARTIAL |
| Worker District gate/checkpoint | storyTrigger ids preserved | preserve | PARTIAL |
| Player Bark layer | absent | 5 Barks designed | NOT IMPLEMENTED (barks test explicitly allows this) |
| nextAreaId | null, deliberately unchanged | do not blindly change | VERIFIED (audit below) |

## Seamless Access override — 2026-08-19

- 0.46.0 `seamless-sector-runtime-v9`의 Sector 01→02 transit device는 `ACCESS 3/3`과 기존 1-8 objective를 함께 요구한다. 같은 Sector 안의 Stage별 문은 되살리지 않으며, 1-3·1-6·1-7 Carrier 세 기를 모두 처치해야 T자형 force-field blocker가 해제되고 모든 Player에게 camera unlock scene이 재생된다. force-field의 가로 collision/visual segment는 compiled 1-8 source bounds 양끝에서 기본 Grapple budget 600px만큼 연장돼 중앙과 좌우 도달 경로를 함께 막는다. 미수집 Carrier는 거리순 최대 3개를 화면 밖 edge arrow 또는 화면 안 diamond로 안내한다.

## Sequential-activation note

There is no enemy-sequencing engine anywhere in this codebase to build on or extend - Sentry
activation has only ever been proximity-trigger-box based (`activationSpec`), identical in every one
of the 48 Stages. "sequential-activation"/`activationOrder` are satisfied the same way: the Lower pair's
activation boxes and the Upper pair's activation boxes never overlap (checked directly against the
compiled world - zero pairwise overlaps among all 4 slots), and the level's own vertical Lower->Upper
progression makes the natural playthrough order match `activationOrder` 1-4. This does not build a true
"wait for the previous enemy's defeat" gate; the acceptance test text ("no crossfire") and the absence
of a `NOT_IMPLEMENTED` marker on `enemy-sequence` (unlike every genuinely-new-mechanic field elsewhere
in this package) both read as expecting exactly this existing-pattern solution.

## Transition-owner audit (per AREA-SPEC.json's "transition" block)

Confirmed: the real Sector 01->02 handoff is NOT owned by this legacy Area's `gate.nextAreaId` at all.
`LegacyAreaSeamlessSectorRuntime.js` builds `sectorTransitions` from consecutive entries in
`LEGACY_AREA_SECTOR_PREVIEW_CATALOG.sectors` (Sector 01 -> Sector 02 catalog adjacency) independently of
any per-Area `nextAreaId`/`gate` field, and the actual Sector-boundary lock/unlock now runs entirely
through the `access-transit-lock` system (see entries #70-71 in `docs/scenario-development-integration.md`).
`nextAreaId: null` here is therefore already correct and was left unchanged - setting it to
`sector-02-01` would not create the separate `GATE LOCKING CARRIAGE` physical Boss slot, and risks
fighting the real transition owner. Existing `CONTAINMENT GANTRY C-01` Has-A runtime is a legacy prototype;
the current authored Boss has no physical Arena, automatic entry, combat damage, or Sector handoff yet.

## Boss 01 authored handoff boundary — 2026-08-22

[`../../../../boss/01/`](../../../../boss/01/) preserves the current `GATE LOCKING CARRIAGE` authored content
and the earlier REV2.1 material as historical reference. It is not an implementation of this legacy Area or
a change to the current `access-transit-lock` owner. The current authored order preserves the open Gate and
Worker District first Reveal before the separate Post-Sector Boss slot; any transition wiring must still be
implemented separately. In particular, its historical `210s` timer and `80px/s` collapse are not current Boss inputs;
the initial Boss contract has no timer or time-expiry Arena collapse.

## Story strength

1-8 is unusually well-supported by current Runtime Story.

REV8 should re-author trigger geometry while preserving exact copy and causal order.

## Dialogue addition

Approved Player Barks:
- `…이제 와서 돌아가라고?`
- `…멈출 생각이 없네.`
- `좋아… 열어.`
- `…하부 연결이 끊긴다고?`
- `사람들이 사는 곳까지 이어져 있었던 건가…`

No Bark on:
`WORKER DISTRICT / ACCESS OPEN`

Final reveal Bark belongs after:
`WORKER DISTRICT / BLOCK 12`.

## Player Bark runtime boundary

Current `src/game/presentation/` has no verified dedicated Bark layer.

Do not fake Player dialogue as System Story Toast.

## Geometry verdict

`IMPLEMENTED - npm run check / npm test (7 scenarios) all pass. Verified: exactly 4 enemy slots, zero
pairwise activation-box overlap, nextAreaId correctly left null after auditing the real transition
owner. Remaining gap: Story Presentation text beyond the entry line, and the 5 designed Player Barks -
both explicitly NOT IMPLEMENTED per their own acceptance tests' "if implemented" language.`
