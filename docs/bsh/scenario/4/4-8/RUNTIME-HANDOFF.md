# SECTOR 04-8 — RUNTIME HANDOFF

## Preflight

1. pull latest main;
2. verify changes since `3c9f661bba58af6f7351e00754c12aef86575a12`;
3. inspect actual post-4-7 override persistence implementation;
4. confirm the obsolete Transit catalog remains deleted and inspect canonical `AREA-SPEC.v2.json`;
5. inspect current gate/objective/state-check infrastructure;
6. inspect Direction/Player Bark runtime;
7. inspect Timer/Boss transition contracts.

If main changed materially, reconcile before editing.

## Migration

Replace only the legacy `sector-04-08` authored design.

Keep:
- area id `sector-04-08`
- sector order `8`
- entry seam from approved 4-7

Do not preserve legacy 4-8 Cutter/Wake/Patrol/story because those are superseded.

## Quorum

At the Lower Security Landing, count actual persistent:
- Override A
- Override B
- Override C

Pass when count >= 2.

PASS:
- show verified state;
- release lower security interlock;
- allow success route.

FAIL:
- keep gate closed;
- keep a reversible/safe return route available;
- do not damage/kill player;
- do not grant a replacement credential;
- do not recommend a specific missing override as the “correct” one.

The final implementation must test all 8 A/B/C combinations.

## Geometry

`AREA-SPEC-REV1-DESIGN.json` is collision/object authority.
`MAP-PREVIEW.html` is approved topology.

Critical silhouette:
- east-side first ascent,
- hard reversal through center,
- west-side ascent,
- mid full-safe reset,
- east-side upper ascent,
- final hard reversal to west-side control.

Do not simplify back into one diagonal climb.

## Rope

Base Reach: 400 px.
Approved maximum authored neighbor relation: `386.26 px`.

Every mandatory relation must remain <=400px.

## Threat

None.

Do not add an enemy “for finale difficulty.”
Do not reintroduce Wind/Wake because old 4-8 had it.
Difficulty comes from route reading, state consequence, and multi-direction vertical Rope traversal.

## Mid Interlock

The Mid Interlock is a safe rhythm reset, not a second credential check.
Use existing gate/light/audio presentation if supported.
Do not require a new gameplay input.

## Story

No dialogue during active Rope traversal.

Final sequence only after stable final landing:
1. `PROTECTED ASCENT / POWER NORMAL`
2. `ASCENT CONTROL / READY`
3. Bark: `…여긴 아직도 정상이라고?`

If Rope is still attached/Player unstable, delay Bark.

## Completion / Timer / Boss

Final Control reach is Stage-local completion only.

Do not:
- set `nextAreaId` to Sector05 without separate authority,
- stop General Timer,
- stop collapse,
- start Boss Timer,
- create Boss Entry.

Preserve existing product contracts until the downstream transition is approved.
